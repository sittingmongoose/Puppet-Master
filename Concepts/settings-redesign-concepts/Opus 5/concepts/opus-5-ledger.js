/* Opus 5 — Ledger
 *
 * Settings is a RECORD. The home is the system's state of record: three ledger
 * blocks for what needs a person, then a table of domains with real columns.
 * The workspace shows every setting as a record — value, source, scope, effect —
 * with a contents list on the left and a subcategory mini-map on the right edge.
 *
 * The omnibar takes plain text and optional plain-language filter tokens. The
 * tokens narrow RESULTS; they are never applied to destinations.
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
    view: "home",
    categoryId: null,
    managerId: null,
    query: "",
    tokens: [],
    sort: { key: "order", dir: 1 },
    exposure: "standard",
    demoState: "normal",
    dismissed: {},
    values: {},
    revealed: {},
    favourites: {}, hidden: {}, aliases: {}, accountPref: {},
    openProviders: { claude: true },
    catalogueRefreshing: false,
    crewId: "crew-squad",
    mediaId: "media-nano",
    drawerOpen: false
  });

  var shell, spy, mainEl, docEl, mapEl, lozengeEl, tocEl;

  var ELSEWHERE = {
    "manager-context": ["Opus 5 — Atlas", "opus-5-atlas.html"],
    "manager-terminal": ["Opus 5 — Atlas", "opus-5-atlas.html"],
    "manager-personas": ["Opus 5 — Console", "opus-5-console.html"],
    "manager-skills": ["Opus 5 — Console", "opus-5-console.html"],
    "manager-memory": ["Opus 5 — Stack", "opus-5-stack.html"],
    "manager-mcp": ["Opus 5 — Stack", "opus-5-stack.html"]
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
    var n = el("div", "lg-receipt");
    n.innerHTML = '<span class="lg-receipt-t">' + E(r.at) + "</span>" +
      '<span class="lg-receipt-b"><strong>' + E(window.PMSim.outcomeWord(r.outcome)) + "</strong> — " +
      E(r.label) + ". " + E(r.detail) + '<span class="lg-receipt-call">' + E(r.realCall) + "</span></span>";
    return n;
  }
  function showReceipt(r) {
    announce(window.PMSim.outcomeWord(r.outcome) + ": " + r.detail);
    var host = document.querySelector(".lg-receipts");
    if (host) { host.insertBefore(receiptRow(r), host.firstChild); return; }
    var body = document.querySelector(".lg-mgr-body") || document.querySelector(".lg-doc") || document.querySelector(".lg-home");
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

  /* Counter roll — a value changing, not a layout moving. */
  function rollTo(node, target) {
    var reduced = document.documentElement.getAttribute("data-reduced-motion") === "1";
    if (reduced || !window.requestAnimationFrame) { node.textContent = String(target); return; }
    var from = parseInt(node.textContent, 10) || 0;
    if (from === target) { node.textContent = String(target); return; }
    var t0 = 0, dur = 380;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      node.textContent = String(Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) window.requestAnimationFrame(step);
      else node.textContent = String(target);
    }
    window.requestAnimationFrame(step);
    window.setTimeout(function () { node.textContent = String(target); }, dur + 80);
  }

  /* ============================================================== RENDER */

  function render() {
    closePop();
    var s = store.get();
    var surface = el("div", "lg-surface");
    surface.appendChild(buildBar());

    if (s.query.trim() || s.tokens.length) {
      surface.appendChild(buildResults());
      swap(surface);
      return;
    }
    if (s.view === "manager") { surface.appendChild(buildManager(s.managerId)); swap(surface); return; }
    if (s.view === "workspace") {
      var ws = buildWorkspace();
      surface.appendChild(ws);
      swap(surface);
      attachSpy();
      return;
    }
    surface.appendChild(buildHome());
    swap(surface);
  }

  /* --------------------------------------------------------------- bar */

  function buildBar() {
    var s = store.get();
    var bar = el("div", "lg-bar");

    var home = el("button", "lg-bar-home", I("table", 13) + "<span>State of record</span>");
    home.type = "button";
    home.addEventListener("click", function () {
      store.set({ view: "home", categoryId: null, managerId: null, query: "", tokens: [] });
      render();
    });
    bar.appendChild(home);

    if (s.view === "workspace" || s.view === "manager") {
      var navOpen = el("button", "lg-btn is-quiet lg-nav-open", I("list", 13) + "<span>Sections</span>");
      navOpen.type = "button";
      navOpen.addEventListener("click", openDrawer);
      bar.appendChild(navOpen);
      var cat = S.findCategory(D, s.categoryId);
      if (cat) {
        var crumb = el("span", "lg-dim");
        crumb.style.fontSize = "12px";
        crumb.style.whiteSpace = "nowrap";
        crumb.textContent = cat.title + (s.view === "manager" ? " · " + ((D.managers[s.managerId] || {}).title || "") : "");
        bar.appendChild(crumb);
      }
    }

    var omni = el("div", "lg-omni");
    omni.innerHTML = I("search", 14);
    s.tokens.forEach(function (tk) {
      var t = el("span", "lg-token", "<span>" + E(tk.label) + "</span>");
      var x = el("button", null, I("plus", 11));
      x.type = "button";
      x.style.transform = "rotate(45deg)";
      x.setAttribute("aria-label", "Remove filter " + tk.label);
      x.addEventListener("click", function () {
        store.set({ tokens: store.get().tokens.filter(function (o) { return o.token !== tk.token; }) });
        render();
      });
      t.appendChild(x);
      omni.appendChild(t);
    });
    var input = el("input");
    input.type = "search";
    input.placeholder = s.tokens.length ? "Narrow further…" : "Search settings, or filter by source, scope and level";
    input.setAttribute("aria-label", "Search and filter settings");
    input.value = s.query;
    omni.appendChild(input);
    bar.appendChild(omni);

    var timer = 0;
    input.addEventListener("input", function () {
      window.clearTimeout(timer);
      var v = input.value;
      timer = window.setTimeout(function () {
        store.set({ query: v });
        render();
        var again = document.querySelector(".lg-omni input");
        if (again) { again.focus(); again.setSelectionRange(v.length, v.length); }
      }, 160);
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { store.set({ query: "", tokens: [] }); render(); }
      if (e.key === "Enter") { var f = document.querySelector(".lg-result"); if (f) f.click(); }
      if (e.key === "Backspace" && !input.value && store.get().tokens.length) {
        store.set({ tokens: store.get().tokens.slice(0, -1) });
        render();
      }
    });

    var level = el("button", "lg-btn is-quiet", "<span>" + E(levelWord()) + "</span>" + I("chevronDown", 11));
    level.type = "button";
    level.addEventListener("click", function () {
      openPop(level, function (p, close) {
        p.appendChild(popHead("How much to show"));
        [["standard", "Standard"], ["advanced", "Advanced"], ["all", "Everything"]].forEach(function (o) {
          p.appendChild(popItem(o[1], function () {
            close();
            var keep = spy ? spy.activeId() : null;
            store.set({ exposure: o[0] });
            render();
            if (keep) window.setTimeout(function () { if (spy) spy.jump(keep); }, 80);
          }, { strong: store.get().exposure === o[0] }));
        });
      });
    });
    bar.appendChild(level);

    return bar;
  }

  function levelWord() {
    var e2 = store.get().exposure;
    return e2 === "all" ? "Everything" : e2 === "advanced" ? "Advanced" : "Standard";
  }

  function suggestRow() {
    var wrap = el("div", "lg-suggest");
    var active = store.get().tokens.map(function (t) { return t.token; });
    window.PMSearch.FILTER_TOKENS.forEach(function (tk) {
      if (active.indexOf(tk.token) >= 0) return;
      var b = el("button", "lg-suggest-btn", E(tk.label));
      b.type = "button";
      b.addEventListener("click", function () {
        store.set({ tokens: store.get().tokens.concat([tk]) });
        render();
      });
      wrap.appendChild(b);
    });
    return wrap;
  }

  /* ============================================================== HOME */

  function buildHome() {
    var home = el("div", "lg-home lg-wipe");
    var head = el("div", "lg-head");
    head.innerHTML = '<h2 class="lg-title">Settings — state of record</h2>' +
      '<p class="lg-subtitle">Every setting is a record with a value, where that value came from, how far it reaches, and what it costs you. ' +
      "This page is what the system currently holds, and what still wants a person.</p>";
    home.appendChild(head);
    home.appendChild(suggestRow());

    var list = S.noticesFor(D, store.get().demoState, store.get().dismissed);
    if (!list.length) {
      var calm = el("div", "lg-calm");
      calm.innerHTML = "<strong>Nothing needs attention</strong>Every provider is connected, no setup is unfinished, and there are no open recommendations. The ledger below is still the whole story.";
      home.appendChild(calm);
    } else {
      var groups = S.groupNotices(list);
      ["attention", "setup", "recommended"].forEach(function (sev) {
        if (!groups[sev].length) return;
        var meta = S.severity(sev);
        var block = el("section", "lg-block");
        block.setAttribute("data-severity", sev);
        var bh = el("div", "lg-block-head");
        bh.innerHTML = '<span class="lg-block-title">' + E(meta.word) + "</span>" +
          '<span class="lg-block-count">' + groups[sev].length + "</span>" +
          '<span class="lg-block-note">' + E(meta.note) + "</span>";
        block.appendChild(bh);
        groups[sev].forEach(function (n) { block.appendChild(entryRow(n)); });
        home.appendChild(block);
      });
    }

    home.appendChild(domainTable());
    return home;
  }

  function entryRow(n) {
    var row = el("div", "lg-entry");
    var left = el("div");
    left.style.minWidth = "0";
    left.innerHTML = '<div class="lg-entry-headline">' + E(n.headline) + "</div>" +
      '<div class="lg-entry-consequence">' + E(n.consequence) + "</div>";
    row.appendChild(left);
    var acts = el("div", "lg-entry-actions");
    var p = el("button", "lg-btn is-primary", "<span>" + E(n.primary.label) + "</span>");
    p.type = "button";
    p.addEventListener("click", function () { noticeAction(n, n.primary); });
    acts.appendChild(p);
    if (n.secondary) {
      var s2 = el("button", "lg-btn is-quiet", "<span>" + E(n.secondary.label) + "</span>");
      s2.type = "button";
      s2.addEventListener("click", function () { noticeAction(n, n.secondary); });
      acts.appendChild(s2);
    }
    row.appendChild(acts);
    return row;
  }

  /* Dismissal genuinely removes the notice for the rest of the session and says
   * how many are left. Changing the demo state brings the fixture back. */
  function dismissNotice(notice) {
    var d = store.get().dismissed;
    d[notice.id] = true;
    store.set({ dismissed: d });
    render();
    var left = S.noticesFor(D, store.get().demoState, d).length;
    announce("Dismissed. " + (left ? left + " still open." : "Nothing needs attention now."));
  }

  function noticeAction(n, a) {
    if (a.action === "dismiss") { dismissNotice(n); return; }
    if (a.action === "reconnect-mcp") {
      sim("reconnect-mcp", "Reconnect the postgres MCP server", "MCPService.reconnect('mcp-postgres')",
        "Still refused: the database container is not running.", "error"); return;
    }
    if (a.action === "prune-snapshots") {
      sim("prune", "Prune old restore points", "SnapshotService.prune(retentionDays: 30)",
        "Would remove 14 restore points and free 6.2 GB.", "ok"); return;
    }
    if (a.action === "refresh-catalogue") { goTo({ managerId: "manager-providers", kind: "manager", categoryId: "agents" }); return; }
    if (n.target) goTo({ categoryId: n.target.categoryId, subcategoryId: n.target.subcategoryId, targetId: n.target.settingId });
  }

  var COLUMNS = [
    { key: "order", label: "Domain", num: false },
    { key: "total", label: "Settings", num: true },
    { key: "changed", label: "Changed", num: true },
    { key: "managed", label: "Managed", num: true, optional: true },
    { key: "attention", label: "Unavailable", num: true, optional: true },
    { key: "notice", label: "Needs a person", num: false }
  ];

  function domainStats(cat) {
    var total = 0, changed = 0, managed = 0, attention = 0;
    cat.subcategories.forEach(function (sub) {
      sub.settings.forEach(function (x) {
        total++;
        var st = sState(x);
        if (st.isDefault === false) changed++;
        if (st.source === "managed") managed++;
        if (st.source === "unavailable") attention++;
      });
    });
    var notices = S.noticesFor(D, store.get().demoState, store.get().dismissed).filter(function (n) {
      return n.target && n.target.categoryId === cat.id;
    });
    var worst = notices.reduce(function (a, n) {
      var r = S.severity(n.severity).rank;
      return r < a.rank ? { rank: r, sev: n.severity } : a;
    }, { rank: 9, sev: null });
    return { total: total, changed: changed, managed: managed, attention: attention, notices: notices.length, worst: worst.sev, order: D.categories.indexOf(cat) };
  }

  function domainTable() {
    var wrap = el("section", "lg-block");
    var table = el("table", "lg-table");
    var cap = el("caption", null, "Domains");
    table.appendChild(cap);

    var thead = el("thead");
    var tr = el("tr");
    COLUMNS.forEach(function (c) {
      var th = el("th", (c.num ? "is-num " : "") + (c.optional ? "lg-col-optional" : ""));
      var b = el("button", null, E(c.label) + (store.get().sort.key === c.key ? I(store.get().sort.dir > 0 ? "chevronDown" : "chevronUp", 11) : ""));
      b.type = "button";
      b.addEventListener("click", function () {
        var s = store.get().sort;
        store.set({ sort: { key: c.key, dir: s.key === c.key ? -s.dir : 1 } });
        render();
      });
      th.appendChild(b);
      tr.appendChild(th);
    });
    tr.appendChild(el("th"));
    thead.appendChild(tr);
    table.appendChild(thead);

    var tbody = el("tbody");
    var sort = store.get().sort;
    D.categories.slice().map(function (cat) {
      return { cat: cat, st: domainStats(cat) };
    }).sort(function (a, b) {
      var k = sort.key;
      if (k === "notice") {
        var av = a.st.worst ? S.severity(a.st.worst).rank : 9;
        var bv = b.st.worst ? S.severity(b.st.worst).rank : 9;
        return (av - bv) * sort.dir;
      }
      return (a.st[k] - b.st[k]) * sort.dir;
    }).forEach(function (item) {
      var cat = item.cat, st = item.st;
      var row = el("tr");
      row.setAttribute("tabindex", "0");
      row.setAttribute("role", "link");
      row.innerHTML =
        "<td><div class='lg-row-name'>" + I(cat.icon, 14) + "<span>" + E(cat.title) + "</span></div>" +
          "<div class='lg-row-purpose'>" + E(cat.purpose) + "</div></td>" +
        "<td class='is-num lg-num'>" + st.total + "</td>" +
        "<td class='is-num lg-num'>" + (st.changed || '<span class="lg-dim">—</span>') + "</td>" +
        "<td class='is-num lg-num lg-col-optional'>" + (st.managed || '<span class="lg-dim">—</span>') + "</td>" +
        "<td class='is-num lg-num lg-col-optional'>" + (st.attention || '<span class="lg-dim">—</span>') + "</td>" +
        "<td>" + (st.worst ? statusChip(S.severity(st.worst).status, S.severity(st.worst).word + " · " + st.notices)
                           : '<span class="lg-dim">Nothing</span>') + "</td>" +
        "<td class='lg-open'>" + I("chevronRight", 14) + "</td>";
      row.addEventListener("click", function () { goTo({ categoryId: cat.id }); });
      row.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goTo({ categoryId: cat.id }); }
      });
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    return wrap;
  }

  /* ============================================================ RESULTS */

  function buildResults() {
    var s = store.get();
    var wrap = el("div", "lg-results lg-wipe");
    var filters = {};
    s.tokens.forEach(function (t) { Object.assign(filters, t.filters); });

    var found = window.PMSearch.search(index, s.query, { limit: 120, filters: s.tokens.length ? filters : null });

    var host = el("div");
    host.appendChild(suggestRow());

    var head = el("div", "lg-result-head");
    head.innerHTML = "<span>Setting</span><span class='lg-col-value'>Value</span><span>Source</span><span class='lg-col-scope'>Scope</span><span></span>";
    host.appendChild(head);

    if (!found.length) {
      host.appendChild(el("div", "lg-empty",
        "Nothing matches. Filters narrow results only — they never hide a place you could go."));
      wrap.appendChild(host);
      return wrap;
    }

    found.forEach(function (rec) {
      var b = el("button", "lg-result");
      b.type = "button";
      var f = rec.kind === "setting" || rec.kind === "manager" ? S.findSetting(D, rec.id) : null;
      var st = f ? sState(f.setting) : null;
      b.innerHTML =
        "<span style='min-width:0'><span class='lg-result-title'>" + E(rec.title) + "</span>" +
          "<span class='lg-result-path'>" + E(rec.path.join("  ›  ")) + "</span></span>" +
        "<span class='lg-cell lg-col-value'>" + (f ? E(S.valueDisplay(f.setting)) : '<span class="lg-dim">' + E(kindWord(rec.kind)) + "</span>") + "</span>" +
        "<span class='lg-cell'>" + (st ? E(S.stateLabelShort(st)) : '<span class="lg-dim">—</span>') + "</span>" +
        "<span class='lg-cell lg-col-scope'>" + (st ? E(S.scopeLabel(st.scope)) : '<span class="lg-dim">—</span>') + "</span>" +
        "<span class='lg-open'>" + I("arrowRight", 13) + "</span>";
      b.addEventListener("click", function () { goTo(window.PMSearch.resolveTarget(rec)); });
      host.appendChild(b);
    });
    wrap.appendChild(host);
    return wrap;
  }

  function kindWord(k) {
    return k === "manager" ? "Manager" : k === "action" ? "Action" : k === "model" ? "Model" :
      k === "provider" ? "Provider" : k === "category" ? "Place" : "Section";
  }

  /* ========================================================== WORKSPACE */

  function visible(sub) {
    var allowed = LEVEL_VISIBLE[store.get().exposure] || LEVEL_VISIBLE.standard;
    return sub.settings.filter(function (s) { return allowed.indexOf(s.exposure || "standard") >= 0; });
  }

  function buildWorkspace() {
    var cat = S.findCategory(D, store.get().categoryId);
    var ws = el("div", "lg-ws");

    tocEl = buildToc(cat);
    ws.appendChild(tocEl);

    docEl = el("div", "lg-doc lg-wipe");
    docEl.setAttribute("tabindex", "-1");

    var st = domainStats(cat);
    var head = el("div", "lg-doc-head");
    head.innerHTML = '<h2 class="lg-doc-title">' + E(cat.title) + "</h2>" +
      '<p class="lg-doc-purpose">' + E(cat.purpose) + "</p>";
    var stats = el("div", "lg-doc-stats");
    [[st.total, "records"], [st.changed, "changed"], [st.managed, "managed"], [st.attention, "unavailable"]].forEach(function (x) {
      var d = el("div");
      d.innerHTML = '<div class="lg-stat-n">0</div><div class="lg-stat-l">' + E(x[1]) + "</div>";
      stats.appendChild(d);
      rollTo(d.querySelector(".lg-stat-n"), x[0]);
    });
    head.appendChild(stats);
    docEl.appendChild(head);

    cat.subcategories.forEach(function (sub) {
      var sec = el("section", "lg-section");
      sec.setAttribute("data-section", sub.id);
      var sh = el("div", "lg-section-head");
      sh.innerHTML = '<h3 class="lg-section-title">' + E(sub.title) + "</h3>" +
        (sub.summary ? '<span class="lg-section-summary">' + E(sub.summary) + "</span>" : "");
      sec.appendChild(sh);
      var shown = visible(sub);
      shown.forEach(function (x) { sec.appendChild(record(x, cat, sub)); });
      var hidden = sub.settings.length - shown.length;
      if (hidden > 0) {
        var more = el("button", "lg-btn is-quiet", "<span>Show " + hidden + " more</span>" + I("chevronDown", 11));
        more.type = "button";
        more.style.margin = "9px 0 0 8px";
        more.addEventListener("click", function () {
          var keep = sub.id;
          store.set({ exposure: "all" });
          render();
          window.setTimeout(function () { if (spy) spy.jump(keep); }, 80);
        });
        sec.appendChild(more);
      }
      docEl.appendChild(sec);
    });
    ws.appendChild(docEl);

    ws.appendChild(buildMap(cat));

    var scrim = el("div", "pm-scrim");
    scrim.addEventListener("click", closeDrawer);
    ws.appendChild(scrim);

    return ws;
  }

  function buildToc(cat) {
    var nav = el("nav", "lg-toc");
    nav.setAttribute("aria-label", "Contents");
    nav.appendChild(el("div", "lg-toc-head", "Contents · settings / changed"));

    D.categories.forEach(function (c) {
      var st = domainStats(c);
      var b = el("button", "lg-toc-cat");
      b.type = "button";
      b.setAttribute("aria-current", String(c.id === cat.id));
      b.innerHTML = I(c.icon, 13) + '<span class="lg-toc-name">' + E(c.title) + "</span>" +
        '<span class="lg-toc-n">' + st.total + "</span>";
      b.addEventListener("click", function () {
        if (c.id === cat.id) { if (spy) spy.jump(c.subcategories[0].id); closeDrawer(); return; }
        goTo({ categoryId: c.id });
      });
      nav.appendChild(b);

      if (c.id === cat.id) {
        var subs = el("div", "lg-toc-subs");
        c.subcategories.forEach(function (sub) {
          var changed = sub.settings.filter(function (x) { return sState(x).isDefault === false; }).length;
          var sb = el("button", "lg-toc-sub");
          sb.type = "button";
          sb.setAttribute("data-sub", sub.id);
          sb.innerHTML = '<span class="lg-toc-sub-name">' + E(sub.title) + "</span>" +
            '<span class="lg-toc-sub-n">' + visible(sub).length + "</span>" +
            '<span class="lg-toc-sub-changed">' + (changed ? "+" + changed : "") + "</span>";
          sb.addEventListener("click", function () {
            if (spy) { spy.jump(sub.id); announce("Jumped to " + sub.title + "."); }
            closeDrawer();
          });
          subs.appendChild(sb);
        });
        nav.appendChild(subs);
      }
    });
    return nav;
  }

  function record(setting, cat, sub) {
    var state = sState(setting);
    var r = el("div", "lg-record");
    r.setAttribute("data-setting", setting.id);
    r.setAttribute("tabindex", "-1");
    var guarded = S.needsGuard(setting) && !store.get().revealed[setting.id];
    if (guarded) r.setAttribute("data-guard", "true");

    var main = el("div");
    main.style.minWidth = "0";
    var label = el("div", "lg-rec-label");
    label.innerHTML = E(setting.label) +
      ((setting.exposure || "standard") !== "standard"
        ? chip(setting.exposure === "expert" ? "risky" : setting.exposure === "unavailable" ? "unavailable" :
               setting.exposure === "managed" ? "managed" : "", S.exposureLabel(setting.exposure)) : "");
    main.appendChild(label);
    main.appendChild(el("p", "lg-rec-explain", E(setting.explanation)));

    var notes = el("div", "lg-rec-notes");
    if (state.effect) notes.innerHTML += "<span>" + I("info", 11) + "<span>" + E(S.effectWord(state.effect.kind)) + ": " + E(state.effect.text) + "</span></span>";
    if (S.hasDifference(state)) notes.innerHTML += '<span class="lg-warn">' + I("alert", 11) + "<span>" + E(S.differenceText(state)) + "</span></span>";
    if (state.reason) notes.innerHTML += '<span class="lg-stop">' + I(state.source === "managed" ? "lock" : "ban", 11) + "<span>" + E(state.reason) + "</span></span>";
    if (S.restartLabel(state.restart)) notes.innerHTML += "<span>" + I("refresh", 11) + "<span>" + E(S.restartLabel(state.restart)) + "</span></span>";
    if (notes.innerHTML) main.appendChild(notes);
    r.appendChild(main);

    /* Value */
    var vcol = el("div", "lg-rec-col");
    vcol.appendChild(el("div", "lg-rec-col-l", "Value"));
    if (guarded) {
      var g = el("div", "lg-guard");
      g.innerHTML = "<span>" + (setting.exposure === "unavailable" ? "Not available" : "Hidden") + "</span>";
      var rv = el("button", null, setting.exposure === "unavailable" ? "Why?" : "Show");
      rv.type = "button";
      rv.addEventListener("click", function () {
        var x = store.get().revealed; x[setting.id] = true; store.set({ revealed: x });
        replace(setting, cat, sub, true);
      });
      g.appendChild(rv);
      vcol.appendChild(g);
    } else {
      vcol.appendChild(controlFor(setting, state, function () { replace(setting, cat, sub, true); }));
      if (state.isDefault === false && S.isEditable(setting)) {
        var reset = el("button", "lg-reset", I("undo", 10) + "<span>Reset</span>");
        reset.type = "button";
        reset.addEventListener("click", function () {
          var v = store.get().values; delete v[setting.id]; store.set({ values: v });
          replace(setting, cat, sub, true);
          announce(setting.label + " reset to default.");
        });
        vcol.appendChild(reset);
      }
    }
    r.appendChild(vcol);

    /* Source */
    var scol = el("div", "lg-rec-col");
    scol.appendChild(el("div", "lg-rec-col-l", "Source"));
    var sourceLine = el("div", "lg-rec-source");
    var status = S.stateStatus(state);
    sourceLine.innerHTML = status !== "ok" ? statusChip(status, S.stateLabelShort(state)) : E(S.stateLabel(state));
    scol.appendChild(sourceLine);
    var d = S.defaultDisplay(setting);
    if (state.isDefault === false && d) scol.appendChild(el("div", "lg-rec-was", "was " + E(d)));
    r.appendChild(scol);

    /* Scope */
    var pcol = el("div", "lg-rec-col lg-rec-scope-col");
    pcol.appendChild(el("div", "lg-rec-col-l", "Scope"));
    pcol.appendChild(el("div", "lg-rec-scope", E(S.scopeLabel(state.scope))));
    r.appendChild(pcol);

    return r;
  }

  function replace(setting, cat, sub, sweep) {
    var old = docEl && docEl.querySelector('[data-setting="' + setting.id + '"]');
    if (!old) return;
    var next = record(setting, cat, sub);
    old.parentNode.replaceChild(next, old);
    if (sweep) {
      next.classList.add("lg-changed");
      window.setTimeout(function () { next.classList.remove("lg-changed"); }, 700);
    }
    if (spy) spy.measure();
    refreshCounts();
  }

  /* Counters and the mini-map re-read the model after any value change. */
  function refreshCounts() {
    var cat = S.findCategory(D, store.get().categoryId);
    if (!cat || !docEl) return;
    var st = domainStats(cat);
    var nodes = docEl.querySelectorAll(".lg-stat-n");
    [st.total, st.changed, st.managed, st.attention].forEach(function (v, i) {
      if (nodes[i]) rollTo(nodes[i], v);
    });
    if (tocEl) {
      cat.subcategories.forEach(function (sub) {
        var changed = sub.settings.filter(function (x) { return sState(x).isDefault === false; }).length;
        var node = tocEl.querySelector('.lg-toc-sub[data-sub="' + sub.id + '"] .lg-toc-sub-changed');
        if (node) node.textContent = changed ? "+" + changed : "";
      });
    }
  }

  function controlFor(setting, state, onChange) {
    var editable = S.isEditable(setting);
    if (setting.kind === "manager") {
      var b = el("button", "lg-btn", "<span>Open</span>" + I("arrowRight", 11));
      b.type = "button";
      b.addEventListener("click", function () { goTo({ managerId: setting.managerId, kind: "manager", categoryId: store.get().categoryId }); });
      return b;
    }
    if (setting.kind === "action") {
      var ab = el("button", "lg-btn", "<span>Run</span>");
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
      var t = el("button", "lg-switch", on ? "ON" : "OFF");
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
      var sel = el("select", "lg-select");
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
    return el("div", "lg-static", E(S.valueDisplay(setting)));
  }

  function setValue(setting, value) {
    var v = store.get().values;
    var isDefault = setting.state.defaultValue !== undefined && String(setting.state.defaultValue) === String(value);
    v[setting.id] = { value: value, isDefault: isDefault, source: isDefault ? "default" : "custom" };
    store.set({ values: v });
    announce(setting.label + " set to " + (typeof value === "boolean" ? (value ? "on" : "off") : value) + ".");
  }

  /* ------------------------------------------------------------ mini-map */

  function buildMap(cat) {
    var map = el("div", "lg-map");
    map.setAttribute("aria-hidden", "true");   // the ToC is the accessible nav
    map.appendChild(el("div", "lg-map-title", "Map"));
    var track = el("div", "lg-map-track");
    lozengeEl = el("div", "lg-map-lozenge");
    track.appendChild(lozengeEl);
    map.appendChild(track);
    map.appendChild(el("div", "lg-map-legend", "bands = sections"));
    mapEl = track;
    return map;
  }

  /* Bands are proportional to the section model, not measured per frame. */
  function paintMap(info) {
    if (!mapEl) return;
    var total = 0;
    info.sections.forEach(function (s) { total = Math.max(total, s.offset + s.height); });
    if (!total) return;
    var h = mapEl.clientHeight;
    if (h < 20) return;

    if (mapEl.querySelectorAll(".lg-map-band").length !== info.sections.length) {
      Array.prototype.forEach.call(mapEl.querySelectorAll(".lg-map-band"), function (b) { b.remove(); });
      info.sections.forEach(function (s) {
        var band = el("div", "lg-map-band");
        band.setAttribute("data-sub", s.id);
        band.title = s.title;
        var cat = S.findCategory(D, store.get().categoryId);
        var sub = cat.subcategories.filter(function (x) { return x.id === s.id; })[0];
        var changed = sub ? sub.settings.filter(function (x) { return sState(x).isDefault === false; }).length : 0;
        var pct = sub && sub.settings.length ? Math.round((changed / sub.settings.length) * 100) : 0;
        if (pct) {
          var fill = el("div", "lg-map-band-changed");
          fill.style.width = pct + "%";
          band.appendChild(fill);
        }
        band.addEventListener("click", function () { if (spy) spy.jump(s.id); });
        mapEl.insertBefore(band, lozengeEl);
      });
    }

    info.sections.forEach(function (s) {
      var band = mapEl.querySelector('.lg-map-band[data-sub="' + s.id + '"]');
      if (!band) return;
      band.style.top = Math.round((s.offset / total) * h) + "px";
      band.style.height = Math.max(6, Math.round((s.height / total) * h) - 2) + "px";
    });

    var view = spy ? spy.viewport() : { top: 0, height: 0 };
    lozengeEl.style.height = Math.max(10, Math.round((view.height / total) * h)) + "px";
    lozengeEl.style.transform = "translateY(" + Math.round((info.scrollTop / total) * h) + "px)";
  }

  function attachSpy() {
    if (spy) spy.destroy();
    if (!docEl) return;
    var cat = S.findCategory(D, store.get().categoryId);
    spy = window.PMSections.create({
      scroller: docEl,
      anchorInset: 64,
      hysteresis: 0.12,
      onActive: function (id) { markActive(id); },
      onScroll: function (info) { paintMap(info); }
    });
    var sections = [];
    cat.subcategories.forEach(function (sub) {
      var node = docEl.querySelector('[data-section="' + sub.id + '"]');
      if (node) sections.push({ id: sub.id, categoryId: cat.id, title: sub.title, el: node });
    });
    spy.setSections(sections);
  }

  function markActive(id) {
    document.querySelectorAll(".lg-toc-sub").forEach(function (b) {
      b.setAttribute("aria-current", String(b.getAttribute("data-sub") === id));
    });
    if (mapEl) {
      mapEl.querySelectorAll(".lg-map-band").forEach(function (b) {
        b.setAttribute("aria-current", String(b.getAttribute("data-sub") === id));
      });
    }
  }

  function openDrawer() {
    var nav = document.querySelector(".lg-toc");
    var scrim = document.querySelector(".pm-scrim");
    if (!nav) return;
    nav.classList.add("is-drawer");
    window.setTimeout(function () { nav.classList.add("is-open"); }, 10);
    if (scrim) scrim.classList.add("is-open");
    store.set({ drawerOpen: true });
  }
  function closeDrawer() {
    var nav = document.querySelector(".lg-toc");
    var scrim = document.querySelector(".pm-scrim");
    if (nav) { nav.classList.remove("is-open"); window.setTimeout(function () { nav.classList.remove("is-drawer"); }, 220); }
    if (scrim) scrim.classList.remove("is-open");
    store.set({ drawerOpen: false });
  }

  /* =========================================================== MANAGERS */

  function buildManager(managerId) {
    var mgr = D.managers[managerId] || {};
    var wrap = el("div", "lg-mgr lg-wipe");
    var head = el("div", "lg-mgr-head");
    var titles = el("div", "lg-mgr-titles");
    titles.innerHTML = '<h2 class="lg-mgr-title">' + E(mgr.title || "Manager") + "</h2>" +
      '<p class="lg-mgr-purpose">' + E(mgr.purpose || "") + "</p>";
    head.appendChild(titles);
    var tools = el("div", "lg-mgr-tools");
    var back = el("button", "lg-btn is-quiet", I("chevronLeft", 12) + "<span>Back</span>");
    back.type = "button";
    back.addEventListener("click", function () {
      store.set({ view: store.get().categoryId ? "workspace" : "home", managerId: null });
      render();
    });
    tools.appendChild(back);
    head.appendChild(tools);
    wrap.appendChild(head);

    var body = el("div", "lg-mgr-body");
    wrap.appendChild(body);

    if (managerId === "manager-providers") providerManager(body, tools);
    else if (managerId === "manager-crew") crewManager(body, tools);
    else if (managerId === "manager-media") mediaManager(body, tools);
    else elsewhereManager(body, managerId);

    var receipts = el("div", "lg-receipts");
    receipts.setAttribute("aria-label", "Simulated results");
    receipts.style.marginTop = "16px";
    body.appendChild(receipts);
    window.PMSim.receipts().slice(0, 3).forEach(function (r) { receipts.appendChild(receiptRow(r)); });

    return wrap;
  }

  /* --------------------------------------------------------- providers */

  function providerManager(body, tools) {
    var refresh = el("button", "lg-btn", I("refresh", 12) + "<span>Refresh catalogues</span>");
    refresh.type = "button";
    refresh.addEventListener("click", doRefresh);
    tools.insertBefore(refresh, tools.firstChild);

    var f = el("div", "lg-filter");
    f.innerHTML = I("search", 13);
    var fi = el("input");
    fi.type = "search"; fi.placeholder = "Filter providers, accounts and models";
    fi.setAttribute("aria-label", "Filter providers");
    f.appendChild(fi);
    body.appendChild(f);

    var host = el("div");
    body.appendChild(host);

    function paint() {
      host.innerHTML = "";
      if (store.get().catalogueRefreshing) {
        var b = el("div", "lg-banner");
        b.innerHTML = '<span class="lg-spin">' + I("refresh", 13) + "</span><span>Refreshing. The rows below are the last catalogue that activated cleanly.</span>";
        host.appendChild(b);
      }
      var q = fi.value.trim().toLowerCase();
      var groups = {}, order = [];
      D.providers.forEach(function (p) {
        if (q && (p.name + " " + p.summary + " " + p.models.map(function (m) { return m.name; }).join(" ")).toLowerCase().indexOf(q) < 0) return;
        if (!groups[p.group]) { groups[p.group] = []; order.push(p.group); }
        groups[p.group].push(p);
      });
      if (!order.length) { host.appendChild(el("div", "lg-empty", "No match.")); return; }
      order.forEach(function (g) {
        var sec = el("section", "lg-sec");
        sec.appendChild(el("div", "lg-sec-title", E(g)));
        groups[g].forEach(function (p) { sec.appendChild(providerCard(p, paint)); });
        host.appendChild(sec);
      });
    }
    fi.addEventListener("input", paint);
    paint();
    body._repaint = paint;
  }

  function activeAccount(p) {
    var pref = store.get().accountPref[p.id];
    if (pref) { var f = p.accounts.filter(function (a) { return a.id === pref; })[0]; if (f) return f; }
    return p.accounts.filter(function (a) { return a.status === "connected"; })[0] || p.accounts[0] || null;
  }

  function providerCard(p, repaint) {
    var open = !!store.get().openProviders[p.id];
    var card = el("div", "lg-card");
    var top = el("div", "lg-card-top");
    var t = el("button", null,
      '<div class="lg-card-title">' + E(p.name) + statusChip(p.status, p.statusWord) + "</div>" +
      '<div class="lg-card-line">' + E(p.summary) + "</div>");
    t.type = "button"; t.style.textAlign = "left"; t.style.minWidth = "0";
    t.setAttribute("aria-expanded", String(open));
    t.addEventListener("click", function () {
      var o = store.get().openProviders; o[p.id] = !o[p.id]; store.set({ openProviders: o }); repaint();
    });
    top.appendChild(t);
    top.appendChild(el("span", null, I(open ? "chevronDown" : "chevronRight", 14)));
    card.appendChild(top);
    if (!open) return card;

    var active = activeAccount(p);
    var answers = el("div", "lg-answers");
    [["Usable now?", p.statusWord], ["Account", active ? active.nickname : "None"],
     ["Route", active ? active.product : "—"], ["Allowance", active ? active.usage.includedRemaining : "?"],
     ["Resets", active ? active.usage.resetsIn : "?"], ["Models", String(p.models.length)]].forEach(function (a) {
      var d = el("div");
      d.innerHTML = '<div class="lg-a-q">' + E(a[0]) + '</div><div class="lg-a-a">' + E(a[1]) + "</div>";
      answers.appendChild(d);
    });
    card.appendChild(answers);

    var usageLink = el("button", "lg-btn", "<span>Open Usage</span>" + I("external", 13));
    usageLink.type = "button";
    usageLink.style.marginTop = "8px";
    usageLink.addEventListener("click", function () {
      sim("open-usage-" + p.id, "Open Usage", "Navigation.open('usage')",
        "Settings does not calculate balances. A real build switches to the Usage surface, which owns measurement, history and forecasting.",
        "handoff");
    });
    card.appendChild(usageLink);

    if (p.oauthNote) card.appendChild(el("div", "lg-card-line", I("key", 11) + " " + E(p.oauthNote)));
    if (p.groupingNote) card.appendChild(el("div", "lg-card-line", I("info", 11) + " " + E(p.groupingNote)));

    if (p.setupSteps) {
      card.appendChild(el("div", "lg-sec-title", "Setup"));
      p.setupSteps.forEach(function (s2, i) { card.appendChild(el("div", "lg-card-line", (i + 1) + ". " + E(s2.label) + " — not done")); });
      var go = el("button", "lg-btn is-primary", "<span>Continue setup</span>");
      go.type = "button"; go.style.marginTop = "8px";
      go.addEventListener("click", function () {
        sim("install-" + p.id, "Install " + p.name + " CLI", "CLIBridge.install('" + p.id + "')",
          "A real build installs the CLI, creates an isolated profile directory, then launches the CLI's own Google sign-in.", "handoff");
      });
      card.appendChild(go);
    }

    if (p.catalogue) {
      card.appendChild(el("div", "lg-sec-title", "Catalogue"));
      var kv = el("dl", "lg-kv");
      kv.innerHTML = "<dt>Source</dt><dd>" + E(p.catalogue.name) + "</dd>" +
        "<dt>Last checked</dt><dd>" + E(store.get().catalogueRefreshing ? "refreshing now" : p.catalogue.lastChecked) + "</dd>" +
        "<dt>Last activated</dt><dd>" + E(p.catalogue.lastActivated) + "</dd>" +
        "<dt>Version</dt><dd>" + E(p.catalogue.sourceVersion) + "</dd>" +
        "<dt>While refreshing</dt><dd>" + E(p.catalogue.lastKnownGood) + "</dd>" +
        "<dt>Recent changes</dt><dd>" + p.catalogue.materialChanges.map(E).join("<br>") + "</dd>";
      card.appendChild(kv);
    }

    p.accounts.forEach(function (a) {
      var sub = el("div", "lg-card");
      sub.style.background = "var(--pm-surface-2)";
      var health = S.healthMeta(a.health.check);
      sub.innerHTML = '<div class="lg-card-title">' + E(a.nickname) + statusChip(health.status, a.statusWord) +
        (active && a.id === active.id ? chip("", "Used next") : "") + "</div>" +
        '<div class="lg-card-line">' + E(a.identity) + " · " + E(a.connection) + " · " + E(a.product) + "</div>" +
        '<div class="lg-card-line">Catalogue ' + E(a.health.catalogue) + " · generation " + E(a.health.generation) + "</div>" +
        (a.diagnosis ? '<div class="lg-card-line" style="color:var(--pm-attention)">' + E(a.diagnosis) + "</div>" : "") +
        (a.setupInstructions ? '<div class="lg-card-line"><strong>To connect:</strong> ' + a.setupInstructions.map(E).join(" ") + "</div>" : "");
      var acts = el("div", "lg-card-actions");
      if (a.status === "connected") {
        var use = el("button", "lg-btn", "<span>Use next</span>");
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
        var si = el("button", "lg-btn is-primary", "<span>Sign in</span>");
        si.type = "button";
        si.addEventListener("click", function () {
          sim("signin-" + a.id, "Sign in · " + a.nickname, "CLIBridge.launchOwnLogin('" + p.id + "','" + a.id + "')",
            "The Claude CLI owns this login; a real build launches it inside the isolated profile and verifies readiness.", "handoff");
        });
        acts.appendChild(si);
      }
      if (a.setupInstructions) {
        var su = el("button", "lg-btn is-primary", "<span>Open the Groq connection</span>");
        su.type = "button";
        su.addEventListener("click", function () {
          sim("setup-" + a.id, "Set up " + a.nickname, "ProviderService.openConnection('groq')",
            "Free Models delegates setup to the underlying provider, then returns you here.", "handoff");
        });
        acts.appendChild(su);
      }
      var probe = el("button", "lg-btn is-quiet", "<span>Readiness check</span>");
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

    if (p.models.length) {
      card.appendChild(el("div", "lg-sec-title", "Models"));
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
      var vs = el("div", "lg-vs");
      vs.innerHTML = '<div><div class="lg-vs-l">Requested</div><div class="lg-vs-v">' + E(diff.requested) + "</div></div>" +
        '<div class="lg-vs-arrow">' + I("arrowRight", 14) + "</div>" +
        '<div><div class="lg-vs-l">In force</div><div class="lg-vs-v">' + E(diff.effective) + "</div></div>" +
        '<div class="lg-vs-note">' + E(diff.reason) + " (" + E(diff.scope) + ")</div>";
      card.appendChild(vs);
    }

    if (active && active.usage.pressure === "exhausted") {
      card.appendChild(el("div", "lg-sec-title", "Included usage is gone — what happens next?"));
      var opts = el("div", "lg-card-actions");
      (active.nextAction.options || []).forEach(function (o) {
        var b2 = el("button", "lg-btn" + (active.nextAction.chosen === o ? " is-primary" : ""), "<span>" + E(o) + "</span>");
        b2.type = "button";
        b2.addEventListener("click", function () { active.nextAction.chosen = o; repaint(); announce("Chosen: " + o); });
        opts.appendChild(b2);
      });
      card.appendChild(opts);
      card.appendChild(el("div", "lg-card-line", "Only the continuations this product supports are offered. There is no universal budget setting."));
    }

    return card;
  }

  function modelRow(p, m, repaint) {
    var s2 = store.get();
    var isFav = s2.favourites[m.id] !== undefined ? s2.favourites[m.id] : m.favourite;
    var alias = s2.aliases[m.id] !== undefined ? s2.aliases[m.id] : m.alias;
    var r = el("div", "lg-model");

    var fav = el("button", "lg-model-fav", I("star", 13));
    fav.type = "button";
    fav.setAttribute("aria-pressed", String(isFav));
    fav.setAttribute("aria-label", (isFav ? "Remove " : "Add ") + m.name + " favourite");
    fav.addEventListener("click", function () {
      var f = store.get().favourites; f[m.id] = !isFav; store.set({ favourites: f }); repaint();
    });
    r.appendChild(fav);

    var nm = el("div");
    nm.style.minWidth = "0";
    nm.innerHTML = '<div class="lg-model-name">' + E(m.name) +
      (alias ? '<span class="lg-model-sub">as “' + E(alias) + "”</span>" : "") +
      (m.available === false ? chip("unavailable", "Unavailable") : "") + "</div>" +
      '<div class="lg-model-sub">' + E(m.summary) + " · " + E(m.context) +
      (m.unavailableReason ? " · " + E(m.unavailableReason) : "") +
      (m.freeTerms ? " · " + m.freeTerms.map(E).join(" · ") : "") + "</div>";
    r.appendChild(nm);

    var caps = el("div");
    caps.style.cssText = "display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end";
    (m.capabilities || []).slice(0, 2).forEach(function (c) {
      var st = S.capabilityStatus(c.state);
      var b = el("span", "pm-chip");
      b.setAttribute("data-status", st === "ok" ? "" : st);
      b.textContent = c.name + ": " + S.capabilityLabel(c.state);
      b.title = "Evidence: " + c.evidence + " · " + c.when;
      caps.appendChild(b);
    });
    r.appendChild(caps);

    var menu = el("button", "lg-model-menu", I("more", 14));
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

  function doRefresh() {
    if (store.get().catalogueRefreshing) return;
    store.set({ catalogueRefreshing: true });
    var b = document.querySelector(".lg-mgr-body");
    if (b && b._repaint) b._repaint();
    window.PMSim.run({
      id: "refresh-catalogues", label: "Refresh model catalogues",
      realCall: "CatalogueService.refresh(['models.dev','free-coding-models'])",
      phases: [{ label: "models.dev" }, { label: "Free Coding Models" }, { label: "Validating" }],
      duration: 1800, outcome: "degraded",
      detail: "models.dev activated with 41 models. Free Coding Models failed validation and was quarantined; its previous catalogue is still in use."
    }).then(function (r) {
      store.set({ catalogueRefreshing: false });
      var h = document.querySelector(".lg-mgr-body");
      if (h && h._repaint) h._repaint();
      showReceipt(r);
    });
  }

  /* --------------------------------------------------------------- crew */

  function crewManager(body, tools) {
    var mgr = D.managers["manager-crew"];
    body.appendChild(el("div", "lg-card-line", I("info", 11) + " " + E(mgr.capacityNote)));

    var host = el("div");
    body.appendChild(host);

    function paint() {
      host.innerHTML = "";
      mgr.templates.forEach(function (t) {
        var card = el("div", "lg-card");
        var status = t.state === "ok" ? ["ok", "Ready"] :
          t.state === "overCapacity" ? ["setup", "Over capacity"] : ["attention", "Blocked"];
        card.innerHTML = '<div class="lg-card-title">' + E(t.name) + statusChip(status[0], status[1]) + "</div>" +
          '<div class="lg-card-line">' + E(t.purpose) + "</div>" +
          (t.blockedReason ? '<div class="lg-card-line" style="color:var(--pm-attention)">' + E(t.blockedReason) + "</div>" : "");

        /* Requested versus effective is the headline reading, not a footnote. */
        var vs = el("div", "lg-vs");
        vs.innerHTML = '<div><div class="lg-vs-l">Requested</div><div class="lg-vs-v">' + t.requested + " members</div></div>" +
          '<div class="lg-vs-arrow">' + I("arrowRight", 14) + "</div>" +
          '<div><div class="lg-vs-l">Effective now</div><div class="lg-vs-v">' + t.effective +
            (t.waves > 1 ? " + " + (t.requested - t.effective) + " queued" : "") + "</div></div>" +
          '<div class="lg-vs-note">' + (t.capacityNote ? E(t.capacityNote) : t.state === "blocked"
            ? "Nothing can start until the blocker is cleared."
            : "Requested and effective agree at the moment.") +
            " Waves: " + t.waves + " · min " + t.min + " / max " + t.max + "</div>";
        card.appendChild(vs);

        var members = el("div", "lg-members");
        t.members.forEach(function (m, i) {
          var queued = i >= t.effective;
          var row = el("div", "lg-member");
          row.setAttribute("data-queued", String(queued));
          row.innerHTML = '<span class="lg-member-n">' + (i + 1) + "</span>" +
            '<span><span class="lg-member-role">' + E(m.role) + "</span>" +
              '<span class="lg-member-sub">Persona: ' + E(m.persona) + "</span></span>" +
            '<span class="lg-member-sub">' + m.routes.map(E).join(" · ") + "</span>" +
            "<span>" + chip(m.policy === "strict" ? "managed" : "", m.policy === "strict" ? "Strict route" : "Adaptive") +
              (queued ? " " + chip("setup", "Queued") : "") + "</span>";
          members.appendChild(row);
        });
        card.appendChild(members);

        var kv = el("dl", "lg-kv");
        kv.innerHTML =
          "<dt>Guards</dt><dd>" + E(t.guards.time) + " · " + E(t.guards.spend) + " · " + E(t.guards.reserve) + "</dd>" +
          "<dt>Isolation</dt><dd>" + E(t.isolation) + " · ports: " + E(t.ports) + "</dd>" +
          "<dt>Board</dt><dd>" + E(t.board) + "</dd>" +
          "<dt>Consensus</dt><dd>" + E(t.consensus) + "</dd>" +
          "<dt>Child spawning</dt><dd>depth " + t.childDepth + "</dd>" +
          "<dt>On failure</dt><dd>" + E(t.onFailure) + "</dd>" +
          "<dt>Scope</dt><dd>This thread or Goal only — choosing a Crew here never changes another thread.</dd>";
        card.appendChild(kv);

        var acts = el("div", "lg-card-actions");
        var use = el("button", "lg-btn is-primary", "<span>Use for this Goal</span>");
        use.type = "button";
        use.disabled = t.state === "blocked";
        use.addEventListener("click", function () {
          sim("crew-" + t.id, "Use Crew " + t.name, "CrewService.select('" + t.id + "', scope: 'goal')",
            "Selected for this Goal only. Orchestrator would start " + t.effective + " now and queue " +
            Math.max(0, t.requested - t.effective) + " for a later wave.", "ok");
        });
        acts.appendChild(use);
        var edit = el("button", "lg-btn", "<span>Edit composition</span>");
        edit.type = "button";
        edit.addEventListener("click", function () {
          sim("crew-edit-" + t.id, "Edit " + t.name, "CrewService.openEditor('" + t.id + "')",
            "A real build opens the composition editor. Nothing was changed here.", "handoff");
        });
        acts.appendChild(edit);
        card.appendChild(acts);
        host.appendChild(card);
      });
    }
    paint();
  }

  /* -------------------------------------------------------------- media */

  function mediaManager(body, tools) {
    var mgr = D.managers["manager-media"];
    mgr.providers.forEach(function (p) {
      var card = el("div", "lg-card");
      var status = p.state === "connected" ? ["ok", p.statusWord] : ["setup", p.statusWord];
      card.innerHTML = '<div class="lg-card-title">' + E(p.name) + statusChip(status[0], status[1]) + "</div>" +
        '<div class="lg-card-line">' + E(p.connection) + " · " + E(p.identity) + "</div>" +
        (p.note ? '<div class="lg-card-line">' + I("info", 11) + " " + E(p.note) + "</div>" : "") +
        (p.setupNote ? '<div class="lg-card-line" style="color:var(--pm-setup)">' + E(p.setupNote) + "</div>" : "");

      var grid = el("div", "lg-modal-grid");
      [["Image", p.modalities.image], ["Audio", p.modalities.audio], ["Video", p.modalities.video]].forEach(function (m) {
        var word = m[1] === "native" ? "Native" : m[1] === "transformed" ? "Through transformation" : "Not supported";
        var d = el("div", "lg-modal");
        d.innerHTML = '<div class="lg-modal-l">' + E(m[0]) + '</div><div class="lg-modal-v">' + E(word) + "</div>";
        grid.appendChild(d);
      });
      card.appendChild(grid);

      var kv = el("dl", "lg-kv");
      kv.innerHTML =
        "<dt>Purpose</dt><dd>" + p.purposes.map(E).join(", ") + "</dd>" +
        "<dt>Output</dt><dd>" + E(p.output) + "</dd>" +
        "<dt>Safety</dt><dd>" + E(p.safety) + "</dd>" +
        "<dt>Cost route</dt><dd>" + E(p.cost) + "</dd>" +
        "<dt>Fallback</dt><dd>" + E(p.fallback) + "</dd>" +
        "<dt>History</dt><dd>" + p.history + " generations · last " + E(p.lastUse) + "</dd>";
      card.appendChild(kv);

      var acts = el("div", "lg-card-actions");
      if (p.state === "setup") {
        var connect = el("button", "lg-btn is-primary", "<span>Add a key</span>");
        connect.type = "button";
        connect.addEventListener("click", function () {
          sim("media-connect-" + p.id, "Connect " + p.name, "MediaService.beginConnection('" + p.id + "')",
            "A real build opens the credential flow. Puppet Master never shows the raw key afterwards.", "handoff");
        });
        acts.appendChild(connect);
      } else {
        var test = el("button", "lg-btn", "<span>Test a generation</span>");
        test.type = "button";
        test.addEventListener("click", function () {
          sim("media-test-" + p.id, "Test generation · " + p.name, "MediaService.probe('" + p.id + "')",
            "A real build renders a small test asset, writes it to " + p.output + " and records it in history.", "handoff",
            [{ label: "Submitting" }, { label: "Rendering" }]);
        });
        acts.appendChild(test);
        var hist = el("button", "lg-btn is-quiet", "<span>Generation history</span>");
        hist.type = "button";
        hist.addEventListener("click", function () {
          sim("media-hist-" + p.id, "Open history · " + p.name, "MediaService.history('" + p.id + "')",
            p.history + " generations recorded with prompt, route, cost and result.", "handoff");
        });
        acts.appendChild(hist);
      }
      var route = el("button", "lg-btn is-quiet", "<span>Assign purpose</span>");
      route.type = "button";
      route.addEventListener("click", function () {
        openPop(route, function (pp, close) {
          pp.appendChild(popHead("Route this provider to"));
          ["Image generation", "Image editing", "Image analysis", "Speech output", "Fallback only", "Not used"].forEach(function (o) {
            pp.appendChild(popItem(o, function () {
              close();
              sim("media-route-" + p.id, "Assign " + p.name + " to " + o,
                "MediaService.setPurpose('" + p.id + "','" + o + "')",
                "Future media work of this kind would use " + p.name + ". Work already running is unaffected.", "ok");
            }, { strong: p.purposes.indexOf(o) >= 0 }));
          });
        });
      });
      acts.appendChild(route);
      card.appendChild(acts);
      body.appendChild(card);
    });
  }

  function elsewhereManager(body, managerId) {
    var mgr = D.managers[managerId] || {};
    var where = ELSEWHERE[managerId];
    var c = el("div", "lg-card");
    c.innerHTML = '<div class="lg-card-title">' + E(mgr.title || "Manager") + "</div>" +
      '<div class="lg-card-line">' + E(mgr.purpose || "") + "</div>" +
      '<div class="lg-card-line">Each Opus 5 concept builds the provider manager plus two others in full, so the four together cover eight dedicated managers rather than repeating the same two.</div>';
    body.appendChild(c);
    if (managerId === "manager-usage") {
      c.innerHTML += '<div class="lg-card-line">' + E(D.usage.note) + "</div>";
      D.usage.snapshots.forEach(function (s2) {
        body.appendChild(el("div", "lg-card",
          '<div class="lg-card-title">' + E(s2.providerId) + " · " + E(s2.account) + "</div>" +
          '<div class="lg-card-line">Remaining ' + E(s2.includedRemaining) + " · resets " + E(s2.resets) +
          " · " + E(s2.freshness) + " · " + E(s2.runOut) + "</div>"));
      });
      return;
    }
    if (where) {
      var a = el("a", "lg-btn is-primary");
      a.href = where[1];
      a.style.cssText = "margin-top:12px;display:inline-flex;text-decoration:none";
      a.innerHTML = "<span>Open " + E(where[0]) + "</span>" + I("arrowUpRight", 12);
      body.appendChild(a);
    }
  }

  /* ========================================================== NAVIGATION */

  function goTo(t) {
    closePop();
    closeDrawer();
    if (t.managerId && (t.kind === "manager" || t.kind === "provider" || t.kind === "model")) {
      store.set({ query: "", tokens: [], view: "manager", managerId: t.managerId, categoryId: t.categoryId || "agents" });
      render();
      announce("Opened " + ((D.managers[t.managerId] || {}).title || "manager") + ".");
      return;
    }
    if (!t.categoryId) { store.set({ query: "", tokens: [], view: "home", categoryId: null, managerId: null }); render(); return; }
    if (t.targetId) {
      var f = S.findSetting(D, t.targetId);
      if (f) {
        var ex = f.setting.exposure || "standard";
        if ((LEVEL_VISIBLE[store.get().exposure] || []).indexOf(ex) < 0) {
          store.set({ exposure: LEVEL_VISIBLE.advanced.indexOf(ex) >= 0 ? "advanced" : "all" });
        }
      }
    }
    store.set({ query: "", tokens: [], view: "workspace", categoryId: t.categoryId, managerId: null });
    render();
    if (t.subcategoryId) {
      window.PMSections.afterLayout(function () {
        var focusEl = t.targetId ? docEl.querySelector('[data-setting="' + t.targetId + '"]') : null;
        if (spy) spy.jump(t.subcategoryId, { focusEl: focusEl });
      });
    }
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
    concept: "Ledger · Settings as a record",
    conceptId: "ledger",
    theme: "retro-dark",
    extraControls: wrap,
    onLayout: function () { if (spy) spy.measure(); },
    onWidthMode: function (mode) { if (mode !== "squeezed") closeDrawer(); if (spy) spy.measure(); }
  });
  mainEl = shell.main;

  demo.addEventListener("change", function () {
    store.set({ demoState: demo.value, catalogueRefreshing: demo.value === "loading" });
    render();
    announce("Demo state: " + demo.options[demo.selectedIndex].text);
  });

  window.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      var i = document.querySelector(".lg-omni input");
      if (i) { i.focus(); i.select(); }
    }
  });

  render();
})();
