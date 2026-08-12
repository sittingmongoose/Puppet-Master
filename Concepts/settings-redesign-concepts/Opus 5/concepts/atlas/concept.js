/* Opus 5 — Atlas
 *
 * Settings is a PLACE. The home is a directory of destinations; opening one
 * travels to a workspace with a persistent outline. Managers are rooms inside a
 * destination: the outline stays put, the document area is replaced, and a back
 * path returns you to where you were.
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
    exposure: "standard",
    demoState: "normal",
    dismissed: {},
    values: {},
    openProviders: { claude: true },
    accountPref: {},
    favourites: {},
    hidden: {},
    aliases: {},
    modelModes: {},
    catalogueRefreshing: false,
    providerFilter: "",
    drawerOpen: false,
    revealed: {}
  });

  var shell, spy, mainEl;
  var outlineEl = null, docEl = null;

  /* Which Opus 5 concept builds each manager in full. */
  var MANAGER_HOME = {
    "manager-providers": { concept: "every concept", href: null },
    "manager-context": { concept: "Opus 5 — Atlas", href: null },
    "manager-terminal": { concept: "Opus 5 — Atlas", href: null },
    "manager-personas": { concept: "Opus 5 — Console", href: "opus-5-console.html" },
    "manager-skills": { concept: "Opus 5 — Console", href: "opus-5-console.html" },
    "manager-memory": { concept: "Opus 5 — Stack", href: "opus-5-stack.html" },
    "manager-mcp": { concept: "Opus 5 — Stack", href: "opus-5-stack.html" },
    "manager-crew": { concept: "Opus 5 — Ledger", href: "opus-5-ledger.html" },
    "manager-media": { concept: "Opus 5 — Ledger", href: "opus-5-ledger.html" }
  };

  var BUILT_HERE = ["manager-providers", "manager-context", "manager-terminal"];

  /* Destination groups: humanised, not the internal category order. */
  var GROUPS = [
    { title: "Everyday", note: "What you change most often.", ids: ["general", "appearance"] },
    { title: "Who does the work", note: "Providers, models, and what each route is for.", ids: ["agents", "planning", "collab"] },
    { title: "What they may do", note: "Permissions, safety and reach.", ids: ["permissions", "extensions"] },
    { title: "What they know", note: "Context, memory and instructions.", ids: ["context"] },
    { title: "Craft and upkeep", note: "Code, media and the system itself.", ids: ["code", "media", "system"] }
  ];

  /* ------------------------------------------------------------- helpers */

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function settingState(setting) {
    var over = store.get().values[setting.id];
    return over ? Object.assign({}, setting.state, over) : setting.state;
  }

  function statusChip(status, word) {
    return '<span class="pm-status" data-status="' + status + '">' +
      I(window.PMIcons.statusIcon(status), 13) + "<span>" + E(word) + "</span></span>";
  }

  function chip(status, word) {
    return '<span class="pm-chip" data-status="' + status + '">' + E(word) + "</span>";
  }

  function announce(msg) { if (shell) shell.announce(msg); }

  /* A single popover implementation, so menus never become hover-only. */
  var popover = null;
  function closePopover() {
    if (popover && popover.parentNode) popover.parentNode.removeChild(popover);
    popover = null;
    document.removeEventListener("mousedown", onPopDown, true);
    document.removeEventListener("keydown", onPopKey, true);
  }
  function onPopDown(e) { if (popover && !popover.contains(e.target)) closePopover(); }
  function onPopKey(e) { if (e.key === "Escape") closePopover(); }

  function openPopover(anchor, build) {
    closePopover();
    var p = el("div", "pm-spell-menu");
    p.setAttribute("role", "menu");
    build(p, closePopover);
    document.body.appendChild(p);
    var r = anchor.getBoundingClientRect();
    var top = r.bottom + 6, left = r.right - p.offsetWidth;
    if (left < 8) left = 8;
    if (top + p.offsetHeight > window.innerHeight - 8) top = Math.max(8, r.top - p.offsetHeight - 6);
    p.style.top = Math.round(top) + "px";
    p.style.left = Math.round(left) + "px";
    popover = p;
    document.addEventListener("mousedown", onPopDown, true);
    document.addEventListener("keydown", onPopKey, true);
    var first = p.querySelector("button");
    if (first) first.focus();
  }

  function popItem(label, onClick, opts) {
    var b = el("button", "pm-spell-item" + (opts && opts.strong ? " is-suggestion" : ""), E(label));
    b.type = "button";
    b.setAttribute("role", "menuitem");
    if (opts && opts.disabled) { b.disabled = true; b.style.opacity = ".55"; b.style.cursor = "not-allowed"; }
    else b.addEventListener("click", onClick);
    return b;
  }

  function popHead(text) { return el("div", "pm-spell-menu-head", E(text)); }

  /* ================================================================ HOME */

  function renderHome() {
    var s = store.get();
    var surface = el("div", "at-surface at-fade");
    var scroll = el("div", "at-home-scroll");
    var home = el("div", "at-home");

    var head = el("div", "at-home-head");
    window.PMShell.entrance(head, "at-reveal", 520);
    head.appendChild(el("h2", "at-title", "Settings"));
    head.appendChild(el("p", "at-subtitle",
      "Find anything by name, or open a place below. Every destination opens a full workspace, not a panel."));
    home.appendChild(head);

    /* Locator */
    var locator = el("div", "at-locator");
    var field = el("div", "at-locator-field");
    field.innerHTML = I("search", 18);
    var input = el("input", "at-locator-input");
    input.type = "search";
    input.placeholder = "Search settings, managers and actions";
    input.setAttribute("aria-label", "Search settings, managers and actions");
    input.value = s.query;
    field.appendChild(input);
    var hint = el("span", "at-locator-hint", "Enter opens the first result");
    field.appendChild(hint);
    var clear = el("button", "at-locator-clear", I("plus", 14));
    clear.type = "button";
    clear.title = "Clear search";
    clear.setAttribute("aria-label", "Clear search");
    clear.style.transform = "rotate(45deg)";
    clear.style.display = s.query ? "grid" : "none";
    field.appendChild(clear);
    locator.appendChild(field);

    var results = el("div", "at-results");
    results.style.display = "none";
    locator.appendChild(results);
    home.appendChild(locator);

    function runSearch() {
      var q = input.value;
      store.set({ query: q });
      clear.style.display = q ? "grid" : "none";
      if (!q.trim()) { results.style.display = "none"; results.innerHTML = ""; return; }
      var found = window.PMSearch.search(index, q, { limit: 24 });
      results.innerHTML = "";
      if (!found.length) {
        results.appendChild(el("div", "at-results-empty",
          "Nothing matches &ldquo;" + E(q) + "&rdquo;. Try a plain-language word such as &ldquo;spelling&rdquo;, &ldquo;account&rdquo; or &ldquo;worktree&rdquo;."));
      } else {
        window.PMSearch.groupByCategory(found, D).forEach(function (group) {
          var g = el("div", "at-results-group");
          g.appendChild(el("div", "at-results-head", E(group.title)));
          group.items.forEach(function (rec) { g.appendChild(resultRow(rec)); });
          results.appendChild(g);
        });
      }
      results.style.display = "";
    }

    function resultRow(rec) {
      var b = el("button", "at-result");
      b.type = "button";
      var kindIcon = rec.kind === "manager" ? "layers" :
        rec.kind === "action" ? "zap" :
        rec.kind === "model" ? "cpu" :
        rec.kind === "provider" ? "plug" :
        rec.kind === "category" ? "map" : "sliders";
      var meta = "";
      if (rec.exposure === "expert") meta = chip("risky", "Expert");
      else if (rec.exposure === "unavailable") meta = chip("unavailable", "Unavailable");
      else if (rec.exposure === "advanced") meta = chip("", "Advanced");
      else if (rec.kind === "manager") meta = chip("", "Manager");
      b.innerHTML =
        I(kindIcon, 15) +
        '<span class="at-result-body">' +
          '<span class="at-result-title">' + E(rec.title) + "</span>" +
          '<span class="at-result-path">' + E(rec.path.join("  ›  ")) + "</span>" +
        "</span>" +
        '<span class="at-result-meta">' + meta + I("arrowRight", 14) + "</span>";
      b.addEventListener("click", function () { goTo(window.PMSearch.resolveTarget(rec)); });
      return b;
    }

    input.addEventListener("input", runSearch);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var first = results.querySelector(".at-result");
        if (first) { e.preventDefault(); first.click(); }
      }
      if (e.key === "Escape") { input.value = ""; runSearch(); }
    });
    clear.addEventListener("click", function () { input.value = ""; runSearch(); input.focus(); });

    /* Directory */
    var dir = el("div", "at-directory");
    window.PMShell.entrance(dir, "at-reveal", 520);
    GROUPS.forEach(function (group) {
      var g = el("section", "at-group");
      var gh = el("div", "at-group-head");
      gh.appendChild(el("h3", "at-group-title", E(group.title)));
      gh.appendChild(el("span", "at-group-note", E(group.note)));
      g.appendChild(gh);
      group.ids.forEach(function (id) {
        var cat = S.findCategory(D, id);
        if (cat) g.appendChild(destinationRow(cat));
      });
      dir.appendChild(g);
    });
    home.appendChild(dir);

    /* Notices */
    home.appendChild(noticesAside());

    scroll.appendChild(home);
    surface.appendChild(scroll);
    swap(surface);
    if (s.query) { input.value = s.query; runSearch(); }
  }

  function destinationRow(cat) {
    var counts = S.countSettings(cat);
    var noticeCount = S.noticesFor(D, store.get().demoState, store.get().dismissed).filter(function (n) {
      return n.target && n.target.categoryId === cat.id;
    });
    var worst = noticeCount.reduce(function (acc, n) {
      var r = S.severity(n.severity).rank;
      return r < acc.rank ? { rank: r, sev: n.severity } : acc;
    }, { rank: 9, sev: null });

    var b = el("button", "at-dest");
    b.type = "button";
    var statusHtml = worst.sev
      ? statusChip(S.severity(worst.sev).status, S.severity(worst.sev).word)
      : '<span class="at-dest-count">' + counts.changed + " changed from default</span>";

    b.innerHTML =
      '<span class="at-dest-icon">' + I(cat.icon, 16) + "</span>" +
      '<span class="at-dest-body">' +
        '<span class="at-dest-title">' + E(cat.title) + "</span>" +
        '<span class="at-dest-purpose">' + E(cat.purpose) + "</span>" +
      "</span>" +
      '<span class="at-dest-meta">' + statusHtml +
        '<span class="at-dest-count">' + counts.total + " settings · " + cat.subcategories.length + " sections</span>" +
      "</span>" +
      '<span class="at-dest-chev">' + I("chevronRight", 16) + "</span>";
    b.addEventListener("click", function () { goTo({ categoryId: cat.id }); });
    return b;
  }

  function noticesAside() {
    var aside = el("aside", "at-aside");
    window.PMShell.entrance(aside, "at-reveal", 520);
    aside.setAttribute("aria-label", "Things that may need you");
    var list = S.noticesFor(D, store.get().demoState, store.get().dismissed);
    if (!list.length) {
      var calm = el("div", "at-calm");
      calm.innerHTML = "<strong>Nothing needs attention</strong>Every provider is connected, no setup is unfinished, and there are no open recommendations.";
      aside.appendChild(calm);
      return aside;
    }
    var groups = S.groupNotices(list);
    ["attention", "setup", "recommended"].forEach(function (sev) {
      if (!groups[sev].length) return;
      var meta = S.severity(sev);
      var sec = el("section");
      sec.appendChild(el("h3", "at-notice-group-title", E(meta.word) + " · " + groups[sev].length));
      groups[sev].forEach(function (n) { sec.appendChild(noticeCard(n, meta)); });
      aside.appendChild(sec);
    });
    return aside;
  }

  function noticeCard(n, meta) {
    var card = el("article", "at-notice");
    card.setAttribute("data-severity", n.severity);
    var head = el("div", "at-notice-head");
    head.innerHTML = "<span></span>" + statusChip(meta.status, n.statusWord);
    card.appendChild(head);
    card.appendChild(el("h4", "at-notice-headline", E(n.headline)));
    card.appendChild(el("p", "at-notice-consequence", E(n.consequence)));

    var actions = el("div", "at-notice-actions");
    var primary = el("button", "at-btn is-primary", E(n.primary.label));
    primary.type = "button";
    primary.addEventListener("click", function () { runNoticeAction(n, n.primary); });
    actions.appendChild(primary);
    if (n.secondary) {
      var secondary = el("button", "at-btn is-quiet", E(n.secondary.label));
      secondary.type = "button";
      secondary.addEventListener("click", function () { runNoticeAction(n, n.secondary); });
      actions.appendChild(secondary);
    }
    card.appendChild(actions);
    return card;
  }

  /* Dismissal genuinely removes the notice for the rest of the session and says
   * how many are left. Changing the demo state brings the fixture back. */
  function dismissNotice(notice) {
    var d = store.get().dismissed;
    d[notice.id] = true;
    store.set({ dismissed: d });
    renderHome();
    var left = S.noticesFor(D, store.get().demoState, d).length;
    announce("Dismissed. " + (left ? left + " still open." : "Nothing needs attention now."));
  }

  function runNoticeAction(notice, action) {
    if (action.action === "dismiss") { dismissNotice(notice); return; }
    if (action.action === "prune-snapshots") {
      window.PMSim.run({
        id: "prune-snapshots", label: "Prune old restore points",
        realCall: "SnapshotService.prune(retentionDays: 30)",
        phases: [{ label: "Scanning" }, { label: "Removing" }],
        outcome: "ok", detail: "Would remove 14 restore points and free 6.2 GB."
      }).then(function (r) { toastReceipt(r); });
      return;
    }
    if (action.action === "refresh-catalogue") { refreshCatalogues(); return; }
    if (action.action === "reconnect-mcp") {
      window.PMSim.run({
        id: "reconnect-mcp", label: "Reconnect the postgres MCP server",
        realCall: "MCPService.reconnect(serverId: 'mcp-postgres')",
        phases: [{ label: "Starting transport" }, { label: "Negotiating protocol" }],
        outcome: "error",
        detail: "Still refused: the database container is not running. Start it, then reconnect."
      }).then(function (r) { toastReceipt(r); });
      return;
    }
    if (notice.target) goTo({
      categoryId: notice.target.categoryId,
      subcategoryId: notice.target.subcategoryId,
      targetId: notice.target.settingId
    });
  }

  function toastReceipt(receipt) {
    announce(window.PMSim.outcomeWord(receipt.outcome) + ": " + receipt.detail);
    var host = document.querySelector(".at-receipts");
    if (host) host.insertBefore(receiptRow(receipt), host.firstChild);
  }

  function receiptRow(r) {
    var row = el("div", "at-receipt");
    row.innerHTML =
      '<span class="at-receipt-time">' + E(r.at) + "</span>" +
      '<span class="at-receipt-detail"><strong>' + E(window.PMSim.outcomeWord(r.outcome)) + "</strong> — " +
        E(r.label) + ". " + E(r.detail) + "</span>" +
      '<span class="at-receipt-call">' + E(r.realCall) + "</span>";
    return row;
  }

  /* =========================================================== WORKSPACE */

  /* A search result for an Advanced or Expert setting must actually arrive at
   * that setting. If the current disclosure level would hide it, raise the
   * level far enough to render it — it still carries its level chip, and an
   * Expert control still sits behind its guard. */
  function ensureVisible(targetId) {
    if (!targetId) return;
    var found = S.findSetting(D, targetId);
    if (!found) return;
    var ex = found.setting.exposure || "standard";
    var current = store.get().exposure;
    if ((LEVEL_VISIBLE[current] || []).indexOf(ex) >= 0) return;
    var next = (LEVEL_VISIBLE.advanced.indexOf(ex) >= 0) ? "advanced" : "all";
    store.set({ exposure: next });
    announce("Showing " + next + " settings so the result is visible.");
  }

  function renderWorkspace(opts) {
    if (opts && opts.targetId) ensureVisible(opts.targetId);
    var s = store.get();
    var cat = S.findCategory(D, s.categoryId);
    if (!cat) { renderHome(); return; }

    var surface = el("div", "at-surface at-fade");
    var ws = el("div", "at-workspace");

    outlineEl = buildOutline(cat);
    ws.appendChild(outlineEl);

    var right = el("div", "at-doc-wrap");
    right.appendChild(buildDocHead(cat));
    docEl = el("div", "at-doc");
    docEl.setAttribute("tabindex", "-1");
    buildDocument(docEl, cat);
    right.appendChild(docEl);
    ws.appendChild(right);

    var scrim = el("div", "pm-scrim");
    scrim.addEventListener("click", function () { closeDrawer(); });

    surface.appendChild(ws);
    surface.appendChild(scrim);
    swap(surface);

    attachSpy(cat);

    if (opts && opts.subcategoryId) {
      // Layout settles first, then travel.
      window.PMSections.afterLayout(function () {
        var focusEl = opts.targetId ? docEl.querySelector('[data-setting="' + opts.targetId + '"]') : null;
        spy.jump(opts.subcategoryId, { focusEl: focusEl });
      });
    }
  }

  function buildOutline(cat) {
    var nav = el("nav", "at-outline");
    nav.setAttribute("aria-label", "Settings navigation");

    var search = el("div", "at-outline-search");
    var field = el("div", "at-outline-field");
    field.innerHTML = I("search", 14);
    var input = el("input");
    input.type = "search";
    input.placeholder = "Search all settings";
    input.setAttribute("aria-label", "Search all settings");
    field.appendChild(input);
    search.appendChild(field);
    nav.appendChild(search);

    var results = el("div", "at-results");
    results.style.display = "none";
    results.style.margin = "0 8px 8px";
    nav.appendChild(results);

    input.addEventListener("input", function () {
      var q = input.value.trim();
      if (!q) { results.style.display = "none"; results.innerHTML = ""; scrollWrap.style.display = ""; return; }
      var found = window.PMSearch.search(index, q, { limit: 14 });
      results.innerHTML = "";
      if (!found.length) {
        results.appendChild(el("div", "at-results-empty", "No match."));
      } else {
        found.forEach(function (rec) {
          var b = el("button", "at-result");
          b.type = "button";
          b.innerHTML = I(rec.kind === "manager" ? "layers" : "sliders", 14) +
            '<span class="at-result-body"><span class="at-result-title">' + E(rec.title) + "</span>" +
            '<span class="at-result-path">' + E(rec.path.join("  ›  ")) + "</span></span>" +
            '<span class="at-result-meta">' + I("arrowRight", 13) + "</span>";
          b.addEventListener("click", function () {
            input.value = "";
            results.style.display = "none";
            scrollWrap.style.display = "";
            goTo(window.PMSearch.resolveTarget(rec));
          });
          results.appendChild(b);
        });
      }
      results.style.display = "";
      scrollWrap.style.display = "none";
    });

    var scrollWrap = el("div", "at-outline-scroll");

    D.categories.forEach(function (c) {
      var counts = S.countSettings(c);
      var btn = el("button", "at-outline-cat");
      btn.type = "button";
      btn.setAttribute("aria-current", String(c.id === cat.id));
      btn.innerHTML = I(c.icon, 14) +
        '<span class="at-outline-cat-name">' + E(c.title) + "</span>" +
        '<span class="at-outline-cat-count">' + counts.total + "</span>";
      btn.addEventListener("click", function () {
        if (c.id === cat.id) { spy.jump(c.subcategories[0].id); closeDrawer(); return; }
        goTo({ categoryId: c.id });
      });
      scrollWrap.appendChild(btn);

      if (c.id === cat.id) {
        var subs = el("div", "at-outline-subs");
        c.subcategories.forEach(function (sub) {
          var sb = el("button", "at-outline-sub");
          sb.type = "button";
          sb.setAttribute("data-sub", sub.id);
          sb.innerHTML = '<span class="at-outline-sub-mark"></span>' +
            '<span class="at-outline-sub-name">' + E(sub.title) + "</span>";
          sb.addEventListener("click", function () {
            spy.jump(sub.id);
            closeDrawer();
            announce("Jumped to " + sub.title + ".");
          });
          subs.appendChild(sb);
        });
        scrollWrap.appendChild(subs);
      }
    });

    nav.appendChild(scrollWrap);
    return nav;
  }

  function buildDocHead(cat) {
    var head = el("div", "at-doc-head");

    var navOpen = el("button", "at-nav-open", I("list", 14) + "<span>Sections</span>");
    navOpen.type = "button";
    navOpen.addEventListener("click", openDrawer);
    head.appendChild(navOpen);

    var crumbs = el("div", "at-crumbs");
    var homeLink = el("button", "at-crumb-link", "Settings");
    homeLink.type = "button";
    homeLink.addEventListener("click", function () { goTo({}); });
    crumbs.appendChild(homeLink);
    crumbs.appendChild(el("span", null, I("chevronRight", 12)));
    crumbs.appendChild(el("span", "at-crumb-current", E(cat.title)));
    head.appendChild(crumbs);

    head.appendChild(el("div", "at-doc-head-spacer"));

    var level = el("div", "at-level");
    level.setAttribute("role", "group");
    level.setAttribute("aria-label", "How much to show");
    [
      { id: "standard", label: "Standard" },
      { id: "advanced", label: "Advanced" },
      { id: "all", label: "Everything" }
    ].forEach(function (opt) {
      var b = el("button", null, opt.label);
      b.type = "button";
      b.setAttribute("aria-pressed", String(store.get().exposure === opt.id));
      b.addEventListener("click", function () {
        store.set({ exposure: opt.id });
        var keep = spy ? spy.activeId() : null;
        buildDocument(docEl, cat);
        attachSpy(cat);
        if (keep) window.requestAnimationFrame(function () { spy.jump(keep); });
        Array.prototype.forEach.call(level.children, function (c) {
          c.setAttribute("aria-pressed", String(c.textContent === opt.label));
        });
        announce("Showing " + opt.label.toLowerCase() + " settings.");
      });
      level.appendChild(b);
    });
    head.appendChild(level);

    return head;
  }

  /* Exposure levels. Risky and diagnostic internals are reachable but never
   * sitting in the ordinary flow as if they were everyday controls. */
  var LEVEL_VISIBLE = {
    standard: ["standard", "managed", "unavailable"],
    advanced: ["standard", "managed", "unavailable", "advanced"],
    all: ["standard", "managed", "unavailable", "advanced", "expert", "diagnostic"]
  };

  function visibleSettings(sub) {
    var allowed = LEVEL_VISIBLE[store.get().exposure] || LEVEL_VISIBLE.standard;
    return sub.settings.filter(function (setting) {
      return allowed.indexOf(setting.exposure || "standard") >= 0;
    });
  }

  function buildDocument(host, cat) {
    host.innerHTML = "";
    var intro = el("div", "at-cat-intro");
    intro.appendChild(el("h2", "at-cat-title", E(cat.title)));
    intro.appendChild(el("p", "at-cat-purpose", E(cat.purpose)));
    host.appendChild(intro);

    cat.subcategories.forEach(function (sub) {
      var sec = el("section", "at-section");
      sec.setAttribute("data-section", sub.id);
      sec.setAttribute("aria-labelledby", "h-" + sub.id);

      var sh = el("div", "at-section-head");
      var h = el("h3", "at-section-title", E(sub.title));
      h.id = "h-" + sub.id;
      sh.appendChild(h);
      if (sub.summary) sh.appendChild(el("p", "at-section-summary", E(sub.summary)));
      sec.appendChild(sh);

      var shown = visibleSettings(sub);
      shown.forEach(function (setting) { sec.appendChild(settingRow(setting, cat, sub)); });

      var hiddenCount = sub.settings.length - shown.length;
      if (hiddenCount > 0) {
        var more = el("button", "at-btn is-quiet",
          I("chevronDown", 13) + "<span>Show " + hiddenCount + " more advanced " +
          (hiddenCount === 1 ? "setting" : "settings") + "</span>");
        more.type = "button";
        more.style.marginTop = "10px";
        more.addEventListener("click", function () {
          store.set({ exposure: "all" });
          var keep = sub.id;
          buildDocument(docEl, cat);
          attachSpy(cat);
          window.requestAnimationFrame(function () { spy.jump(keep); });
        });
        sec.appendChild(more);
      }
      host.appendChild(sec);
    });
  }

  /* ------------------------------------------------------- settings row */

  function settingRow(setting, cat, sub) {
    var state = settingState(setting);
    var row = el("div", "at-row");
    row.setAttribute("data-setting", setting.id);
    row.setAttribute("tabindex", "-1");
    if (setting.kind === "manager") row.setAttribute("data-kind", "manager");

    var guarded = S.needsGuard(setting) && !store.get().revealed[setting.id];
    if (guarded) row.setAttribute("data-guard", "true");

    var main = el("div", "at-row-main");
    var label = el("div", "at-row-label");
    label.innerHTML = E(setting.label);
    if (setting.exposure && setting.exposure !== "standard") {
      label.innerHTML += " " + chip(
        setting.exposure === "expert" ? "risky" :
        setting.exposure === "unavailable" ? "unavailable" :
        setting.exposure === "managed" ? "managed" : "",
        S.exposureLabel(setting.exposure));
    }
    main.appendChild(label);
    main.appendChild(el("p", "at-row-explain", E(setting.explanation)));

    var notes = el("div", "at-row-notes");
    if (state.effect) {
      notes.appendChild(note("effect", state.effect.kind === "safety" ? "shield" :
        state.effect.kind === "privacy" ? "eye" :
        state.effect.kind === "cost" ? "gauge" : "zap",
        S.effectWord(state.effect.kind) + ": " + state.effect.text));
    }
    if (S.hasDifference(state)) {
      notes.appendChild(note("difference", "alert", S.differenceText(state)));
    }
    if (state.reason) {
      notes.appendChild(note("reason", state.source === "managed" ? "lock" : "ban", state.reason));
    }
    if (state.scope && state.scope !== "global") {
      notes.appendChild(note("scope", "layers", "Applies to: " + S.scopeLabel(state.scope)));
    }
    if (S.restartLabel(state.restart)) {
      notes.appendChild(note("restart", "refresh", S.restartLabel(state.restart)));
    }
    if (notes.children.length) main.appendChild(notes);
    row.appendChild(main);

    var control = el("div", "at-row-control");
    if (guarded) {
      var guard = el("div", "at-guard");
      guard.innerHTML = "<span>" + (setting.exposure === "unavailable"
        ? "Not available here" : "Hidden by default") + "</span>";
      var reveal = el("button", "at-guard-reveal",
        setting.exposure === "unavailable" ? "Why?" : "Show the control");
      reveal.type = "button";
      reveal.addEventListener("click", function () {
        var r = store.get().revealed;
        r[setting.id] = true;
        store.set({ revealed: r });
        replaceRow(setting, cat, sub);
        announce(setting.label + " revealed.");
      });
      guard.appendChild(reveal);
      control.appendChild(guard);
    } else {
      control.appendChild(controlFor(setting, state, cat, sub));
      var stateLine = el("div", "at-row-state");
      stateLine.innerHTML = stateBadge(setting, state);
      control.appendChild(stateLine);
      if (state.isDefault === false && S.isEditable(setting)) {
        var reset = el("button", "at-row-reset", I("undo", 12) + "<span>Reset to default</span>");
        reset.type = "button";
        reset.addEventListener("click", function () {
          var values = store.get().values;
          delete values[setting.id];
          store.set({ values: values });
          replaceRow(setting, cat, sub);
          announce(setting.label + " reset to its default.");
        });
        control.appendChild(reset);
      }
    }
    row.appendChild(control);
    return row;
  }

  function note(kind, iconName, text) {
    var n = el("div", "at-note");
    n.setAttribute("data-kind", kind);
    n.innerHTML = I(iconName, 13) + "<span>" + E(text) + "</span>";
    return n;
  }

  function stateBadge(setting, state) {
    var label = S.stateLabel(state);
    var status = S.stateStatus(state);
    if (status !== "ok") return statusChip(status, label);
    if (state.source === "recommended") return statusChip("recommended", "Recommended value");
    if (state.isDefault === false) {
      var d = S.defaultDisplay(setting);
      return '<span>' + E(label) + (d ? " · default was " + E(d) : "") + "</span>";
    }
    return "<span>" + E(label) + "</span>";
  }

  function replaceRow(setting, cat, sub) {
    var old = docEl && docEl.querySelector('[data-setting="' + setting.id + '"]');
    if (!old) return;
    var next = settingRow(setting, cat, sub);
    old.parentNode.replaceChild(next, old);
    if (spy) spy.measure();
  }

  function controlFor(setting, state, cat, sub) {
    var editable = S.isEditable(setting);

    if (setting.kind === "manager") {
      var b = el("button", "at-open-manager", "<span>Open</span>" + I("arrowRight", 14));
      b.type = "button";
      b.addEventListener("click", function () { openManager(setting.managerId); });
      return b;
    }

    if (setting.kind === "action") {
      var ab = el("button", "at-btn", "<span>" + E(actionVerb(setting)) + "</span>");
      ab.type = "button";
      if (setting.exposure === "expert") ab.className = "at-btn is-danger";
      ab.addEventListener("click", function () { runSettingAction(setting); });
      return ab;
    }

    if (setting.kind === "toggle") {
      var t = el("button", "at-switch");
      t.type = "button";
      var on = state.value === true;
      t.setAttribute("aria-pressed", String(on));
      t.setAttribute("aria-label", setting.label);
      if (!editable) t.setAttribute("aria-disabled", "true");
      t.innerHTML = '<span class="at-switch-track"><span class="at-switch-thumb"></span></span>' +
        "<span>" + (on ? "On" : "Off") + "</span>";
      t.addEventListener("click", function () {
        if (!editable) { announce(setting.label + " is " + S.stateLabel(state).toLowerCase() + " and cannot be changed here."); return; }
        setValue(setting, !on, cat, sub);
      });
      return t;
    }

    if (setting.kind === "select") {
      var sel = el("select", "at-select");
      sel.setAttribute("aria-label", setting.label);
      (setting.options || []).forEach(function (opt) {
        var o = document.createElement("option");
        o.value = opt; o.textContent = opt;
        if (opt === state.value) o.selected = true;
        sel.appendChild(o);
      });
      sel.disabled = !editable;
      sel.addEventListener("change", function () { setValue(setting, sel.value, cat, sub); });
      return sel;
    }

    var txt = el("div", "at-text-value", E(S.valueDisplay(setting)));
    txt.title = S.valueDisplay(setting);
    return txt;
  }

  function actionVerb(setting) {
    if (/^Reset/.test(setting.label)) return "Reset";
    if (/^Restore/.test(setting.label)) return "Restore";
    if (/^Erase/.test(setting.label)) return "Erase";
    if (/^Sign out/.test(setting.label)) return "Sign out";
    if (/^Create/.test(setting.label)) return "Create";
    if (/^Clear/.test(setting.label)) return "Clear";
    if (/^Rebuild/.test(setting.label)) return "Rebuild";
    if (/^Back up/.test(setting.label)) return "Export";
    return "Run";
  }

  function setValue(setting, value, cat, sub) {
    var values = store.get().values;
    var isDefault = setting.state.defaultValue !== undefined &&
      String(setting.state.defaultValue) === String(value);
    values[setting.id] = {
      value: value,
      isDefault: isDefault,
      source: isDefault ? (setting.state.recommendedValue !== undefined ? "recommended" : "default") : "custom"
    };
    store.set({ values: values });
    replaceRow(setting, cat, sub);
    announce(setting.label + " set to " + (typeof value === "boolean" ? (value ? "on" : "off") : value) + ".");
  }

  function runSettingAction(setting) {
    var map = {
      "sys-cache-clear": { call: "CacheService.clear(scopes: ['retrieval','catalogue'])", detail: "Would free 3.4 GB. Threads, memory and settings are untouched.", outcome: "ok" },
      "sys-index-rebuild": { call: "RetrievalIndex.rebuild(projectId)", detail: "Would re-index 4,182 files. Takes about four minutes on this repository.", outcome: "ok" },
      "sys-backup-settings": { call: "SettingsService.export(includeCredentials: false)", detail: "Would write settings-2026-08-05.json. Credentials are never included.", outcome: "ok" },
      "sys-restore": { call: "SettingsService.restore(backupId)", detail: "Two backups found. Restoring requires re-authenticating every provider.", outcome: "handoff" },
      "sys-diag-bundle": { call: "Diagnostics.bundle()", detail: "Would collect logs, versions and configuration. Prompt content and credentials are excluded.", outcome: "ok" },
      "sys-reset-section": { call: "SettingsService.resetSection(sectionId)", detail: "Six sections differ from default. Choose one to reset.", outcome: "handoff" },
      "sys-reset-all": { call: "SettingsService.resetAll()", detail: "Refused in a concept: this would discard every customisation and cannot be undone.", outcome: "unavailable" },
      "sys-erase-memory": { call: "MemoryService.eraseAll()", detail: "Refused in a concept: 142 notes and their evidence would be removed permanently.", outcome: "unavailable" },
      "sys-sign-out-all": { call: "ProviderService.signOutAll()", detail: "Would clear five Puppet Master connections. CLI-owned logins stay with their own tool.", outcome: "handoff" }
    };
    var spec = map[setting.id] || { call: "SettingsService.run('" + setting.id + "')", detail: "Simulated in this concept.", outcome: "ok" };
    if (spec.outcome === "unavailable") {
      window.PMSim.unavailable({ id: setting.id, label: setting.label, realCall: spec.call, detail: spec.detail })
        .then(showReceiptDialog);
      return;
    }
    window.PMSim.run({
      id: setting.id, label: setting.label, realCall: spec.call,
      phases: [{ label: "Preparing" }, { label: "Working" }],
      outcome: spec.outcome, detail: spec.detail
    }).then(showReceiptDialog);
  }

  function showReceiptDialog(receipt) {
    announce(window.PMSim.outcomeWord(receipt.outcome) + ": " + receipt.detail);
    var host = document.querySelector(".at-doc") || document.querySelector(".at-room-body");
    if (!host) return;
    var banner = el("div", "at-refreshing");
    banner.innerHTML = I(receipt.outcome === "unavailable" ? "ban" : "checkCircle", 14) +
      "<span><strong>" + E(window.PMSim.outcomeWord(receipt.outcome)) + "</strong> · " +
      E(receipt.label) + " — " + E(receipt.detail) +
      ' <span style="opacity:.7">(' + E(receipt.realCall) + ")</span></span>";
    host.insertBefore(banner, host.firstChild);
    window.setTimeout(function () { if (banner.parentNode) banner.parentNode.removeChild(banner); }, 9000);
  }

  /* ---------------------------------------------------------- scrollspy */

  function attachSpy(cat) {
    if (spy) spy.destroy();
    spy = window.PMSections.create({
      scroller: docEl,
      anchorInset: 96,
      hysteresis: 0.12,
      onActive: function (id) { markActiveSub(id); }
    });
    var sections = [];
    cat.subcategories.forEach(function (sub) {
      var node = docEl.querySelector('[data-section="' + sub.id + '"]');
      if (node) sections.push({ id: sub.id, categoryId: cat.id, title: sub.title, el: node });
    });
    spy.setSections(sections);
  }

  function markActiveSub(id) {
    if (!outlineEl) return;
    var subs = outlineEl.querySelectorAll(".at-outline-sub");
    Array.prototype.forEach.call(subs, function (b) {
      b.setAttribute("aria-current", String(b.getAttribute("data-sub") === id));
    });
    var drawer = document.querySelector(".at-drawer-nav");
    if (drawer && drawer !== outlineEl) {
      Array.prototype.forEach.call(drawer.querySelectorAll(".at-outline-sub"), function (b) {
        b.setAttribute("aria-current", String(b.getAttribute("data-sub") === id));
      });
    }
  }

  function openDrawer() {
    var s = store.get();
    var cat = S.findCategory(D, s.categoryId);
    if (!cat) return;
    var existing = document.querySelector(".at-drawer-nav");
    if (existing) existing.parentNode.removeChild(existing);
    var drawer = buildOutline(cat);
    drawer.classList.add("at-drawer-nav");
    outlineEl = drawer;
    var surface = document.querySelector(".at-surface");
    surface.appendChild(drawer);
    var scrim = surface.querySelector(".pm-scrim");
    window.requestAnimationFrame(function () {
      drawer.classList.add("is-open");
      if (scrim) scrim.classList.add("is-open");
    });
    if (spy) markActiveSub(spy.activeId());
    store.set({ drawerOpen: true });
  }

  function closeDrawer() {
    var drawer = document.querySelector(".at-drawer-nav");
    var scrim = document.querySelector(".pm-scrim");
    if (drawer) drawer.classList.remove("is-open");
    if (scrim) scrim.classList.remove("is-open");
    store.set({ drawerOpen: false });
  }

  /* ============================================================== ROOMS */

  function openManager(managerId) {
    store.set({ managerId: managerId, view: "room" });
    renderRoom(managerId);
  }

  function renderRoom(managerId) {
    var mgr = D.managers[managerId];
    var surface = el("div", "at-surface at-fade");
    var ws = el("div", "at-workspace");

    var cat = S.findCategory(D, store.get().categoryId) || S.findCategory(D, "agents");
    outlineEl = buildOutline(cat);
    ws.appendChild(outlineEl);

    var room = el("div", "at-room");
    var head = el("div", "at-room-head");
    var back = el("button", "at-room-back", I("chevronLeft", 14) + "<span>Back to " + E(cat.title) + "</span>");
    back.type = "button";
    back.addEventListener("click", function () {
      store.set({ view: "workspace", managerId: null });
      renderWorkspace({});
    });
    head.appendChild(back);

    var titles = el("div", "at-room-titles");
    titles.appendChild(el("h2", "at-room-title", E(mgr ? mgr.title : "Manager")));
    titles.appendChild(el("p", "at-room-purpose", E(mgr ? mgr.purpose : "")));
    head.appendChild(titles);

    var tools = el("div", "at-room-tools");
    head.appendChild(tools);
    room.appendChild(head);

    var body = el("div", "at-room-body");
    room.appendChild(body);
    ws.appendChild(room);
    surface.appendChild(ws);
    surface.appendChild(el("div", "pm-scrim"));
    swap(surface);

    if (managerId === "manager-providers") buildProviderRoom(body, tools);
    else if (managerId === "manager-context") buildContextRoom(body, tools);
    else if (managerId === "manager-terminal") buildTerminalRoom(body, tools);
    else buildElsewhereRoom(body, managerId);

    var receipts = el("div", "at-receipts");
    receipts.setAttribute("aria-label", "Simulated results");
    body.appendChild(receipts);
    window.PMSim.receipts().slice(0, 4).forEach(function (r) { receipts.appendChild(receiptRow(r)); });
  }

  /* ------------------------------------------------- provider / model room */

  function buildProviderRoom(body, tools) {
    var refresh = el("button", "at-btn", I("refresh", 13) + "<span>Refresh catalogues</span>");
    refresh.type = "button";
    refresh.addEventListener("click", refreshCatalogues);
    tools.appendChild(refresh);

    var add = el("button", "at-btn is-primary", I("plus", 13) + "<span>Add a connection</span>");
    add.type = "button";
    add.addEventListener("click", function () {
      openPopover(add, function (p, close) {
        p.appendChild(popHead("Add a connection"));
        ["Installed tool or signed-in app", "Connected account", "API connection", "Server connection"].forEach(function (kind) {
          p.appendChild(popItem(kind, function () {
            close();
            window.PMSim.run({
              id: "add-connection-" + kind, label: "Add a connection · " + kind,
              realCall: "ProviderService.beginConnection(kind: '" + kind + "')",
              phases: [{ label: "Opening the connection flow" }],
              outcome: "handoff",
              detail: "A real build opens the connection wizard for this route. Nothing was created here."
            }).then(showReceiptDialog);
          }));
        });
      });
    });
    tools.appendChild(add);

    var filterWrap = el("div", "at-room-filter");
    filterWrap.innerHTML = I("search", 14);
    var filter = el("input");
    filter.type = "search";
    filter.placeholder = "Filter providers, accounts and models";
    filter.setAttribute("aria-label", "Filter providers, accounts and models");
    filter.value = store.get().providerFilter;
    filterWrap.appendChild(filter);
    body.appendChild(filterWrap);

    var listHost = el("div");
    body.appendChild(listHost);

    function paint() {
      listHost.innerHTML = "";
      if (store.get().catalogueRefreshing) {
        var banner = el("div", "at-refreshing");
        banner.innerHTML = '<span class="at-spin">' + I("refresh", 14) + "</span>" +
          "<span>Refreshing models.dev and Free Coding Models. The rows below are the last catalogue that activated cleanly, an hour ago.</span>";
        listHost.appendChild(banner);
      }
      var q = filter.value.trim().toLowerCase();
      var groups = {};
      var order = [];
      D.providers.forEach(function (p) {
        if (q) {
          var hay = (p.name + " " + p.summary + " " + (p.keywords || []).join(" ") + " " +
            p.models.map(function (m) { return m.name; }).join(" ") + " " +
            p.accounts.map(function (a) { return a.nickname + " " + a.identity; }).join(" ")).toLowerCase();
          if (hay.indexOf(q) < 0) return;
        }
        if (!groups[p.group]) { groups[p.group] = []; order.push(p.group); }
        groups[p.group].push(p);
      });
      if (!order.length) {
        listHost.appendChild(el("div", "at-results-empty", "No provider, account or model matches that filter."));
        return;
      }
      order.forEach(function (g) {
        var sec = el("section", "at-sub");
        sec.appendChild(el("h3", "at-sub-title", E(g)));
        groups[g].forEach(function (p) { sec.appendChild(providerCard(p, paint)); });
        listHost.appendChild(sec);
      });
    }

    filter.addEventListener("input", function () {
      store.set({ providerFilter: filter.value });
      paint();
    });
    paint();
    body._repaint = paint;
  }

  function providerCard(p, repaint) {
    var open = !!store.get().openProviders[p.id];
    var card = el("article", "at-prov");
    card.setAttribute("data-open", String(open));

    var head = el("button", "at-prov-head");
    head.type = "button";
    head.setAttribute("aria-expanded", String(open));
    head.innerHTML =
      '<span class="at-prov-icon">' + I(p.icon, 16) + "</span>" +
      '<span style="min-width:0">' +
        '<span class="at-prov-name">' + E(p.name) + "</span>" +
        '<span class="at-prov-summary">' + E(p.summary) + "</span>" +
      "</span>" +
      '<span class="at-prov-status">' + statusChip(p.status, p.statusWord) + "</span>" +
      '<span class="at-prov-chev">' + I("chevronRight", 15) + "</span>";
    head.addEventListener("click", function () {
      var o = store.get().openProviders;
      o[p.id] = !o[p.id];
      store.set({ openProviders: o });
      repaint();
    });
    card.appendChild(head);

    if (!open) return card;

    var bodyEl = el("div", "at-prov-body");

    /* The six questions the default view must answer immediately. */
    var active = activeAccount(p);
    var answers = el("div", "at-answers");
    answers.appendChild(answer("Connected and usable?", p.statusWord,
      p.status === "ok" ? "Model discovery and a generation check both passed." :
      p.status === "attention" ? "Authentication and readiness are not the same thing here." :
      "Setup is unfinished."));
    answers.appendChild(answer("Account in use now", active ? active.nickname : "None",
      active ? active.identity : "Nothing is signed in yet."));
    answers.appendChild(answer("Plan or billing route", active ? active.product : "Not applicable",
      p.credentialOwner ? "Credentials owned by " + p.credentialOwner : ""));
    answers.appendChild(answer("Allowance left", active ? active.usage.includedRemaining : "Unknown",
      active ? active.usage.note : ""));
    answers.appendChild(answer("Resets", active ? active.usage.resetsIn : "Unknown", ""));
    answers.appendChild(answer("Models available", String(p.models.length),
      p.models.filter(function (m) { return m.available === false; }).length + " cannot be used right now"));
    bodyEl.appendChild(answers);

    if (p.oauthNote) {
      var oauth = el("div", "at-note");
      oauth.setAttribute("data-kind", "effect");
      oauth.innerHTML = I("key", 13) + "<span>" + E(p.oauthNote) + "</span>";
      bodyEl.appendChild(oauth);
    }
    if (p.groupingNote) {
      var gn = el("div", "at-note");
      gn.setAttribute("data-kind", "effect");
      gn.innerHTML = I("info", 13) + "<span>" + E(p.groupingNote) + "</span>";
      bodyEl.appendChild(gn);
    }

    if (p.setupSteps) bodyEl.appendChild(setupBlock(p));
    if (p.catalogue) bodyEl.appendChild(catalogueBlock(p));
    if (p.accounts.length) bodyEl.appendChild(accountsBlock(p, repaint));
    if (p.models.length) bodyEl.appendChild(modelsBlock(p, repaint));

    card.appendChild(bodyEl);
    return card;
  }

  function answer(q, a, note) {
    var d = el("div", "at-answer");
    d.innerHTML = '<div class="at-answer-q">' + E(q) + "</div>" +
      '<div class="at-answer-a">' + E(a) + "</div>" +
      (note ? '<div class="at-answer-note">' + E(note) + "</div>" : "");
    return d;
  }

  function activeAccount(p) {
    var prefId = store.get().accountPref[p.id];
    var usable = p.accounts.filter(function (a) { return a.status === "connected"; });
    if (prefId) {
      var found = p.accounts.filter(function (a) { return a.id === prefId; })[0];
      if (found) return found;
    }
    return usable[0] || p.accounts[0] || null;
  }

  function setupBlock(p) {
    var sec = el("div", "at-sub");
    sec.appendChild(el("h4", "at-sub-title", "Setup"));
    var list = el("div", "at-list");
    p.setupSteps.forEach(function (step, i) {
      var row = el("div", "at-list-row");
      row.innerHTML = '<span><span class="at-list-title">' + (i + 1) + ". " + E(step.label) + "</span></span>" +
        '<span class="at-list-right">' + statusChip("setup", step.state === "pending" ? "Not done" : "Done") + "</span>";
      list.appendChild(row);
    });
    sec.appendChild(list);
    var go = el("button", "at-btn is-primary", "<span>Continue setup</span>" + I("arrowRight", 13));
    go.type = "button";
    go.style.marginTop = "10px";
    go.addEventListener("click", function () {
      window.PMSim.run({
        id: "install-" + p.id, label: "Install " + p.name + " CLI",
        realCall: "CLIBridge.install(provider: '" + p.id + "')",
        phases: [{ label: "Checking the platform" }, { label: "Downloading" }, { label: "Verifying" }],
        outcome: "handoff",
        detail: "A real build downloads the CLI, creates an isolated profile directory, then launches the CLI's own Google sign-in. Nothing was installed here."
      }).then(showReceiptDialog);
    });
    sec.appendChild(go);
    return sec;
  }

  function catalogueBlock(p) {
    var c = p.catalogue;
    var sec = el("div", "at-sub");
    sec.appendChild(el("h4", "at-sub-title", "Catalogue"));
    var kv = el("dl", "at-kv");
    kv.innerHTML =
      "<dt>Source</dt><dd>" + E(c.name) + "</dd>" +
      "<dt>Last checked</dt><dd>" + E(store.get().catalogueRefreshing ? "refreshing now" : c.lastChecked) + "</dd>" +
      "<dt>Last activated cleanly</dt><dd>" + E(c.lastActivated) + "</dd>" +
      "<dt>Source version</dt><dd>" + E(c.sourceVersion) + "</dd>" +
      "<dt>While refreshing</dt><dd>" + E(c.lastKnownGood) + "</dd>" +
      "<dt>Material changes</dt><dd>" + c.materialChanges.map(E).join("<br>") + "</dd>";
    sec.appendChild(kv);
    return sec;
  }

  function accountsBlock(p, repaint) {
    var sec = el("div", "at-sub");
    sec.appendChild(el("h4", "at-sub-title", "Accounts and connections"));
    var active = activeAccount(p);
    p.accounts.forEach(function (a) {
      var row = el("div", "at-acct");
      row.setAttribute("data-active", String(active && a.id === active.id));
      var health = S.healthMeta(a.health.check);

      var left = el("div");
      left.innerHTML =
        '<div class="at-acct-name">' + E(a.nickname) +
          statusChip(health.status, a.statusWord) +
          (active && a.id === active.id ? chip("", "Used next") : "") + "</div>" +
        '<div class="at-acct-line">' + E(a.identity) + " · " + E(a.connection) + "</div>" +
        '<div class="at-acct-line">' + E(a.product) + " · priority " + a.priority +
          (a.sticky ? " · threads stay on this account" : "") + "</div>" +
        '<div class="at-acct-line">Catalogue refreshed ' + E(a.health.catalogue) +
          " · last generation " + E(a.health.generation) + "</div>" +
        '<div class="at-acct-line">Allowance ' + E(a.usage.includedRemaining) +
          " · resets " + E(a.usage.resetsIn) + " · " + E(a.usage.note) + "</div>" +
        (a.diagnosis ? '<div class="at-acct-line" style="color:var(--pm-attention)">' + E(a.diagnosis) + "</div>" : "") +
        (a.setupInstructions ? '<div class="at-acct-line"><strong>To connect:</strong><br>' +
          a.setupInstructions.map(function (x, i) { return (i + 1) + ". " + E(x); }).join("<br>") + "</div>" : "");
      row.appendChild(left);

      var acts = el("div", "at-acct-actions");

      if (a.status === "connected") {
        var use = el("button", "at-btn", "<span>Use next</span>");
        use.type = "button";
        use.disabled = !!(active && a.id === active.id);
        use.addEventListener("click", function () {
          var pref = store.get().accountPref;
          pref[p.id] = a.id;
          store.set({ accountPref: pref });
          repaint();
          announce("Future requests will use " + a.nickname + ". A request already running stays where it started.");
          showReceiptDialog({
            at: window.PMSim.stamp(), label: "Prefer account " + a.nickname,
            realCall: "ProviderService.setPreferredAccount('" + p.id + "', '" + a.id + "')",
            outcome: "ok",
            detail: "Applies to the next request. The generation currently in flight stays on its original account and is not migrated."
          });
        });
        acts.appendChild(use);
      }

      if (a.health.check === "signedOut") {
        var signin = el("button", "at-btn is-primary", "<span>Sign in</span>");
        signin.type = "button";
        signin.addEventListener("click", function () {
          window.PMSim.run({
            id: "signin-" + a.id, label: "Sign in · " + p.name + " " + a.nickname,
            realCall: "CLIBridge.launchOwnLogin(provider: '" + p.id + "', profile: '" + a.id + "')",
            phases: [{ label: "Selecting the profile" }, { label: "Launching the CLI's own login" }],
            outcome: "handoff",
            detail: "The Claude CLI owns this login. A real build launches that flow inside the isolated profile and then verifies identity and readiness. Puppet Master never presents its own Claude sign-in."
          }).then(showReceiptDialog);
        });
        acts.appendChild(signin);
      }

      if (a.setupInstructions) {
        var setup = el("button", "at-btn is-primary", "<span>Open the Groq connection</span>");
        setup.type = "button";
        setup.addEventListener("click", function () {
          window.PMSim.run({
            id: "setup-" + a.id, label: "Set up " + a.nickname,
            realCall: "ProviderService.openConnection(underlying: 'groq')",
            phases: [{ label: "Opening the underlying provider" }],
            outcome: "handoff",
            detail: "Free Models delegates setup to the underlying provider. A real build opens the Groq connection, verifies the key, then returns you to the model row you started from."
          }).then(showReceiptDialog);
        });
        acts.appendChild(setup);
      }

      var more = el("button", "at-btn is-quiet", I("more", 14));
      more.type = "button";
      more.setAttribute("aria-label", "More actions for " + a.nickname);
      more.addEventListener("click", function () {
        openPopover(more, function (pop, close) {
          pop.appendChild(popHead(a.nickname));
          pop.appendChild(popItem("Refresh the model catalogue", function () {
            close();
            simple("refresh-" + a.id, "Refresh catalogue · " + a.nickname,
              "ProviderService.refreshCatalogue('" + p.id + "', '" + a.id + "')",
              "Catalogue re-read. Last-known-good rows stayed visible throughout.", "ok");
          }));
          pop.appendChild(popItem("Run a readiness check", function () {
            close();
            simple("probe-" + a.id, "Readiness check · " + a.nickname,
              "ProviderService.safeProbe('" + p.id + "', '" + a.id + "')",
              a.health.check === "ok"
                ? "A minimal generation succeeded. This account is ready, not merely authenticated."
                : "Authentication succeeded but a minimal generation did not. Authenticated is not ready.",
              a.health.check === "ok" ? "ok" : "degraded");
          }));
          pop.appendChild(popItem("Reconnect", function () {
            close();
            simple("reconnect-" + a.id, "Reconnect · " + a.nickname,
              "ProviderService.reconnect('" + p.id + "', '" + a.id + "')",
              "Connection re-established using the existing credential.", "ok");
          }));
          pop.appendChild(popItem("Open logs", function () {
            close();
            simple("logs-" + a.id, "Open logs · " + a.nickname,
              "LogService.open(scope: 'provider/" + p.id + "/" + a.id + "')",
              "A real build opens the provider log view. No log window exists in a standalone concept.", "unavailable");
          }));
          if (a.nextAction && a.nextAction.options.length) {
            pop.appendChild(el("div", "pm-spell-divider"));
            pop.appendChild(popHead("When included usage runs out"));
            a.nextAction.options.forEach(function (opt) {
              pop.appendChild(popItem(opt + (a.nextAction.chosen === opt ? "  ·  chosen" : ""), function () {
                close();
                a.nextAction.chosen = opt;
                repaint();
                announce("When " + a.nickname + " runs out: " + opt + ".");
              }, { strong: a.nextAction.chosen === opt }));
            });
          }
        });
      });
      acts.appendChild(more);
      row.appendChild(acts);
      sec.appendChild(row);
    });

    if (p.accounts.length > 1) {
      var note = el("div", "at-note");
      note.setAttribute("data-kind", "effect");
      note.style.marginTop = "8px";
      note.innerHTML = I("info", 13) + "<span>Isolation model: " + E(p.isolation) +
        ". Changing the preferred account affects future requests only.</span>";
      sec.appendChild(note);
    }
    return sec;
  }

  function modelsBlock(p, repaint) {
    var sec = el("div", "at-sub");
    sec.appendChild(el("h4", "at-sub-title", "Models"));
    var list = el("div", "at-list");
    var s = store.get();

    var models = p.models.slice().sort(function (a, b) {
      var fa = s.favourites[a.id] !== undefined ? s.favourites[a.id] : a.favourite;
      var fb = s.favourites[b.id] !== undefined ? s.favourites[b.id] : b.favourite;
      if (fa !== fb) return fa ? -1 : 1;
      return a.priority - b.priority;
    });

    models.forEach(function (m) {
      if (s.hidden[m.id] === undefined ? m.hidden : s.hidden[m.id]) return;
      var row = el("div", "at-model");
      row.setAttribute("data-available", String(m.available !== false));

      var fav = el("button", "at-model-fav", I("star", 14));
      fav.type = "button";
      var isFav = s.favourites[m.id] !== undefined ? s.favourites[m.id] : m.favourite;
      fav.setAttribute("aria-pressed", String(isFav));
      fav.setAttribute("aria-label", (isFav ? "Remove " : "Add ") + m.name + " favourite");
      fav.addEventListener("click", function () {
        var f = store.get().favourites;
        f[m.id] = !isFav;
        store.set({ favourites: f });
        repaint();
        announce(m.name + (f[m.id] ? " added to favourites." : " removed from favourites."));
      });
      row.appendChild(fav);

      var alias = s.aliases[m.id] !== undefined ? s.aliases[m.id] : m.alias;
      var name = el("div");
      name.style.minWidth = "0";
      name.innerHTML =
        '<div class="at-model-name">' + E(m.name) +
          (alias ? '<span class="at-model-alias">shown as “' + E(alias) + "”</span>" : "") +
          (m.available === false ? chip("unavailable", "Unavailable") : "") + "</div>" +
        '<div class="at-model-sub">' + E(m.summary) + " · " + E(m.context) + " context" +
          (m.routeNote ? " · " + E(m.routeNote) : "") +
          (m.unavailableReason ? " · " + E(m.unavailableReason) : "") +
          (m.freeTerms ? " · " + m.freeTerms.map(E).join(" · ") : "") + "</div>";
      row.appendChild(name);

      var caps = el("div", "at-model-caps");
      (m.capabilities || []).slice(0, 3).forEach(function (c) {
        var st = S.capabilityStatus(c.state);
        var b = el("button", "pm-chip");
        b.type = "button";
        b.setAttribute("data-status", st === "ok" ? "" : st);
        b.textContent = c.name + ": " + S.capabilityLabel(c.state);
        b.title = "Evidence: " + c.evidence + " · " + c.when;
        b.addEventListener("click", function () {
          openPopover(b, function (pop) {
            pop.appendChild(popHead(c.name));
            pop.appendChild(el("div", "pm-spell-item", E(S.capabilityLabel(c.state))));
            pop.appendChild(el("div", "pm-spell-item", "Evidence: " + E(c.evidence)));
            pop.appendChild(el("div", "pm-spell-item", "Recorded: " + E(c.when)));
          });
        });
        caps.appendChild(b);
      });
      row.appendChild(caps);

      var menu = el("button", "at-model-menu", I("more", 15));
      menu.type = "button";
      menu.setAttribute("aria-label", "Options for " + m.name);
      menu.addEventListener("click", function () {
        openPopover(menu, function (pop, close) {
          pop.appendChild(popHead(m.name));
          pop.appendChild(popItem(isFav ? "Remove from favourites" : "Add to favourites", function () {
            close(); fav.click();
          }));
          pop.appendChild(popItem(alias ? "Change the alias" : "Give it an alias", function () {
            close();
            var next = window.prompt("Show " + m.name + " as:", alias || m.name);
            if (next == null) return;
            var a2 = store.get().aliases;
            a2[m.id] = next.trim() || null;
            store.set({ aliases: a2 });
            repaint();
            announce(m.name + " is now shown as " + (a2[m.id] || m.name) + ".");
          }));
          pop.appendChild(popItem("Hide from pickers", function () {
            close();
            var h = store.get().hidden;
            h[m.id] = true;
            store.set({ hidden: h });
            repaint();
            announce(m.name + " hidden. It is still findable in search.");
          }));
          pop.appendChild(popItem("Move up the order", function () {
            close();
            m.priority = Math.max(0, m.priority - 1.5);
            repaint();
            announce(m.name + " moved up.");
          }));

          /* Fast and effort appear only where capability evidence supports them,
           * never inferred from the model name. */
          pop.appendChild(el("div", "pm-spell-divider"));
          if (m.modes.fast) {
            var modes = store.get().modelModes;
            var cur = modes[m.id] || "Normal";
            pop.appendChild(popHead("Speed"));
            ["Normal", "Fast"].forEach(function (mode) {
              pop.appendChild(popItem(mode + (cur === mode ? "  ·  current" : ""), function () {
                close();
                modes[m.id] = mode;
                store.set({ modelModes: modes });
                announce(m.name + " set to " + mode + ".");
              }, { strong: cur === mode }));
            });
          } else {
            pop.appendChild(popHead("Speed"));
            pop.appendChild(popItem("Fast not supported by this model", null, { disabled: true }));
          }

          if (m.modes.effort && m.modes.effort.length) {
            pop.appendChild(popHead("Reasoning effort"));
            m.modes.effort.forEach(function (level) {
              pop.appendChild(popItem(level, function () {
                close();
                announce(m.name + " effort set to " + level + ".");
              }));
            });
          } else {
            pop.appendChild(popHead("Reasoning effort"));
            pop.appendChild(popItem("Not offered by this model", null, { disabled: true }));
          }
        });
      });
      row.appendChild(menu);
      list.appendChild(row);
    });

    sec.appendChild(list);

    var hiddenIds = Object.keys(s.hidden).filter(function (k) { return s.hidden[k]; });
    var hiddenHere = p.models.filter(function (m) {
      return (s.hidden[m.id] !== undefined ? s.hidden[m.id] : m.hidden) === true;
    });
    if (hiddenHere.length) {
      var show = el("button", "at-btn is-quiet", "<span>Show " + hiddenHere.length + " hidden</span>");
      show.type = "button";
      show.style.marginTop = "8px";
      show.addEventListener("click", function () {
        var h = store.get().hidden;
        hiddenHere.forEach(function (m) { h[m.id] = false; });
        store.set({ hidden: h });
        repaint();
      });
      sec.appendChild(show);
    }

    /* Requested vs effective, where it applies to this provider. */
    if (p.id === "claude") {
      var diff = D.routeDifferences[0];
      var d = el("div", "at-note");
      d.setAttribute("data-kind", "difference");
      d.style.marginTop = "10px";
      d.innerHTML = I("alert", 13) + "<span><strong>Requested " + E(diff.requested) +
        ", in force " + E(diff.effective) + ".</strong> " + E(diff.reason) + " (" + E(diff.scope) + ")</span>";
      sec.appendChild(d);
    }

    /* Included usage exhausted: provider-specific continuation. */
    var active = activeAccount(p);
    if (active && active.usage.pressure === "exhausted") {
      var box = el("div", "at-answer");
      box.style.marginTop = "12px";
      box.innerHTML = '<div class="at-answer-q">Included usage is gone. What happens next?</div>';
      var opts = el("div");
      opts.style.display = "flex";
      opts.style.flexWrap = "wrap";
      opts.style.gap = "8px";
      opts.style.marginTop = "8px";
      (active.nextAction.options || []).forEach(function (opt) {
        var b = el("button", "at-btn" + (active.nextAction.chosen === opt ? " is-primary" : ""), "<span>" + E(opt) + "</span>");
        b.type = "button";
        b.addEventListener("click", function () {
          active.nextAction.chosen = opt;
          repaint();
          announce("When " + p.name + " runs out: " + opt + ".");
        });
        opts.appendChild(b);
      });
      box.appendChild(opts);
      box.appendChild(el("div", "at-answer-note",
        "These are the only continuations this product actually supports. There is no universal budget setting."));
      sec.appendChild(box);
    }

    return sec;
  }

  function simple(id, label, call, detail, outcome) {
    if (outcome === "unavailable") {
      window.PMSim.unavailable({ id: id, label: label, realCall: call, detail: detail }).then(showReceiptDialog);
      return;
    }
    window.PMSim.run({
      id: id, label: label, realCall: call,
      phases: [{ label: "Working" }],
      outcome: outcome || "ok", detail: detail
    }).then(showReceiptDialog);
  }

  function refreshCatalogues() {
    if (store.get().catalogueRefreshing) return;
    store.set({ catalogueRefreshing: true });
    var host = document.querySelector(".at-room-body");
    if (host && host._repaint) host._repaint();
    announce("Refreshing catalogues. Existing rows stay in place.");
    window.PMSim.run({
      id: "refresh-catalogues", label: "Refresh model catalogues",
      realCall: "CatalogueService.refresh(['models.dev', 'free-coding-models'])",
      phases: [{ label: "Fetching models.dev" }, { label: "Fetching Free Coding Models" }, { label: "Validating" }],
      duration: 1800,
      outcome: "degraded",
      detail: "models.dev returned 41 models and activated. Free Coding Models failed validation, so its previous catalogue is still in use and has been quarantined rather than applied."
    }).then(function (r) {
      store.set({ catalogueRefreshing: false });
      var h = document.querySelector(".at-room-body");
      if (h && h._repaint) h._repaint();
      showReceiptDialog(r);
    });
  }

  /* ------------------------------------------------------- context room */

  function buildContextRoom(body, tools) {
    var mgr = D.managers["manager-context"];

    var inspect = el("button", "at-btn", I("eye", 13) + "<span>Inspect the last turn</span>");
    inspect.type = "button";
    inspect.addEventListener("click", function () {
      document.querySelector(".at-lastturn").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    tools.appendChild(inspect);

    var cols = el("div", "at-columns");

    var admitted = el("section");
    admitted.appendChild(el("h3", "at-sub-title",
      "Admitted last turn · " + mgr.lastTurn.admitted.length + " sources"));
    var al = el("div", "at-list");
    al.className = "at-list at-lastturn";
    mgr.lastTurn.admitted.forEach(function (a) {
      var r = el("div", "at-list-row");
      r.innerHTML = '<span><span class="at-list-title">' + E(a.name) + "</span>" +
        '<span class="at-list-sub">' + E(a.why) + "</span></span>" +
        '<span class="at-list-right"><span class="at-list-sub">' + E(a.size) + "</span></span>";
      al.appendChild(r);
    });
    admitted.appendChild(al);
    cols.appendChild(admitted);

    var omitted = el("section");
    omitted.appendChild(el("h3", "at-sub-title", "Left out, and why"));
    var ol = el("div", "at-list");
    mgr.lastTurn.omitted.forEach(function (o) {
      var r = el("div", "at-list-row");
      r.innerHTML = '<span><span class="at-list-title">' + E(o.name) + "</span>" +
        '<span class="at-list-sub">' + E(o.why) + "</span></span>" +
        '<span class="at-list-right">' + statusChip("unavailable", "Omitted") + "</span>";
      ol.appendChild(r);
    });
    omitted.appendChild(ol);
    cols.appendChild(omitted);
    body.appendChild(cols);

    var prec = el("section", "at-sub");
    prec.appendChild(el("h3", "at-sub-title", "Instruction precedence · highest first"));
    var pl = el("div", "at-list");
    mgr.lastTurn.precedence.forEach(function (p, i) {
      var r = el("div", "at-list-row");
      r.innerHTML = '<span><span class="at-list-title">' + (i + 1) + ". " + E(p) + "</span></span>" +
        '<span class="at-list-right"><span class="at-list-sub">' + (i === 0 ? "wins" : "") + "</span></span>";
      pl.appendChild(r);
    });
    prec.appendChild(pl);
    body.appendChild(prec);

    var src = el("section", "at-sub");
    src.appendChild(el("h3", "at-sub-title", "Instruction sources"));
    var sl = el("div", "at-list");
    mgr.sources.forEach(function (s2) {
      var r = el("div", "at-list-row");
      var status = s2.state === "active" ? "ok" : s2.state === "ignored" ? "unavailable" : "setup";
      var word = s2.state === "active" ? "Active" : s2.state === "ignored" ? "Ignored" : "Not in scope";
      r.innerHTML = '<span><span class="at-list-title">' + E(s2.name) + " · " + E(s2.scope) + "</span>" +
        '<span class="at-list-sub">' + s2.words + " words" + (s2.note ? " · " + E(s2.note) : "") + "</span></span>" +
        '<span class="at-list-right">' + statusChip(status, word) + "</span>";
      sl.appendChild(r);
    });
    src.appendChild(sl);
    body.appendChild(src);

    var personal = el("section", "at-sub");
    personal.appendChild(el("h3", "at-sub-title", "Personal instructions · this device"));
    personal.appendChild(el("p", "at-row-explain",
      "Applies to your work in every project on this device. " + mgr.sources.filter(function (s2) { return s2.id === "src-personal"; })
        .map(function (s2) { return s2.words + " words · precedence " + s2.precedence + "."; })[0]));
    var editable = el("div", "at-editable");
    editable.setAttribute("contenteditable", "true");
    editable.setAttribute("role", "textbox");
    editable.setAttribute("aria-multiline", "true");
    editable.setAttribute("aria-label", "Personal instructions");
    editable.setAttribute("data-setting", "ctx-global-instructions");
    editable.textContent = "Keep answers short and lead with the decision before the reasoning. Ask before " +
      "running any git command that is not read-only. Flag anything that looks like a conection to a paid " +
      "tier before using it, and treat personnal data with extra care by masking it in any output by default.";
    personal.appendChild(editable);
    personal.appendChild(el("p", "at-list-sub",
      "Saved locally on this device. Spelling is checked locally too — right-click an underlined word, or press Ctrl + period."));
    if (window.PMSpellcheck) window.PMSpellcheck.attach(editable, {});
    body.appendChild(personal);

    var strat = el("section", "at-sub");
    strat.appendChild(el("h3", "at-sub-title", "Compaction and cache"));
    strat.appendChild(el("p", "at-list-sub", E(mgr.lastTurn.strategy)));
    var compact = el("button", "at-btn", "<span>Compact now</span>");
    compact.type = "button";
    compact.style.marginTop = "8px";
    compact.addEventListener("click", function () {
      simple("compact-now", "Compact the thread now",
        "ContextService.compact(threadId, strategy: 'summarise-older')",
        "Would summarise turns 1–12 into 620 tokens and keep the prefix cache warm. A warning is shown first because this materially changes what the model can see.",
        "ok");
    });
    strat.appendChild(compact);
    body.appendChild(strat);
  }

  /* ------------------------------------------------------ terminal room */

  function buildTerminalRoom(body, tools) {
    var mgr = D.managers["manager-terminal"];
    var selected = { id: mgr.profiles[0].id };

    var add = el("button", "at-btn is-primary", I("plus", 13) + "<span>New profile</span>");
    add.type = "button";
    add.addEventListener("click", function () {
      simple("new-terminal-profile", "Create a terminal profile",
        "TerminalService.createProfile()",
        "A real build creates a profile and opens it for editing. Nothing was created here.", "handoff");
    });
    tools.appendChild(add);

    var cols = el("div", "at-columns");

    var listSec = el("section");
    listSec.appendChild(el("h3", "at-sub-title", "Profiles"));
    var list = el("div", "at-list");
    mgr.profiles.forEach(function (prof) {
      var r = el("button", "at-list-row");
      r.type = "button";
      r.setAttribute("data-profile", prof.id);
      var status = prof.state === "ok" ? "ok" : prof.state === "managed" ? "managed" : "unavailable";
      var word = prof.state === "ok" ? "Ready" : prof.state === "managed" ? "Managed" : "Unavailable";
      r.innerHTML = '<span><span class="at-list-title">' + E(prof.name) +
        (prof.isDefault ? " " + chip("", "Default") : "") + "</span>" +
        '<span class="at-list-sub">' + E(prof.shellEffective) +
        (prof.unavailableReason ? " · " + E(prof.unavailableReason) : "") +
        (prof.managedReason ? " · " + E(prof.managedReason) : "") + "</span></span>" +
        '<span class="at-list-right">' + statusChip(status, word) + "</span>";
      r.addEventListener("click", function () {
        selected.id = prof.id;
        paintDetail();
        Array.prototype.forEach.call(list.children, function (c) {
          c.style.background = c.getAttribute("data-profile") === prof.id ? "var(--pm-accent-soft)" : "";
        });
      });
      list.appendChild(r);
    });
    list.firstChild.style.background = "var(--pm-accent-soft)";
    listSec.appendChild(list);
    cols.appendChild(listSec);

    var detailSec = el("section");
    detailSec.appendChild(el("h3", "at-sub-title", "Profile detail"));
    var detail = el("div");
    detailSec.appendChild(detail);
    cols.appendChild(detailSec);
    body.appendChild(cols);

    function paintDetail() {
      var prof = mgr.profiles.filter(function (p) { return p.id === selected.id; })[0];
      detail.innerHTML = "";
      var kv = el("dl", "at-kv");
      kv.innerHTML =
        "<dt>Shell</dt><dd>" + E(prof.shell) + (prof.shell !== prof.shellEffective ? " <span style='color:var(--pm-text-3)'>(" + E(prof.shellEffective) + ")</span>" : "") + "</dd>" +
        "<dt>Font</dt><dd>" + E(prof.font) + " " + prof.size + "px · fallback " + E(prof.fontFallback) + "</dd>" +
        "<dt>Line height</dt><dd>" + prof.lineHeight + "</dd>" +
        "<dt>Palette</dt><dd>" + E(prof.palette) + "</dd>" +
        "<dt>Cursor</dt><dd>" + E(prof.cursor) + "</dd>" +
        "<dt>Selection</dt><dd>" + E(prof.selection) + "</dd>" +
        "<dt>Opacity</dt><dd>" + prof.opacity + "%</dd>" +
        "<dt>Starting directory</dt><dd>" + E(prof.cwd) +
          (prof.cwd !== prof.cwdEffective ? " <span style='color:var(--pm-text-3)'>(" + E(prof.cwdEffective) + ")</span>" : "") + "</dd>" +
        "<dt>Environment</dt><dd>" + E(prof.env) + "</dd>" +
        "<dt>Transcript</dt><dd>" + E(prof.transcript) + "</dd>" +
        "<dt>Copy and paste</dt><dd>" + E(prof.copyPaste) + "</dd>" +
        "<dt>Links</dt><dd>" + E(prof.links) + "</dd>";
      detail.appendChild(kv);

      var n = el("div", "at-note");
      n.setAttribute("data-kind", "effect");
      n.style.marginTop = "10px";
      n.innerHTML = I("info", 13) +
        "<span>Inherited and auto-detected values are shown as those words with the resolved value beside them. No field is left blank to mean “inherit”.</span>";
      detail.appendChild(n);

      var pv = el("div", "at-preview");
      pv.innerHTML =
        '<div><span class="p">' + E(prof.cwdEffective) + '</span> <span class="c">on</span> <span class="k">main</span></div>' +
        '<div><span class="k">$</span> npm run test</div>' +
        '<div><span class="c">&gt; orchard-api@2.4.0 test</span></div>' +
        '<div><span class="k">PASS</span> services/api/users.test.ts</div>' +
        '<div><span class="e">FAIL</span> services/api/billing.test.ts</div>' +
        '<div><span class="c">Tests: 1 failed, 42 passed, 43 total</span></div>';
      detail.appendChild(pv);

      if (prof.state === "managed") {
        var m = el("div", "at-note");
        m.setAttribute("data-kind", "reason");
        m.style.marginTop = "10px";
        m.innerHTML = I("lock", 13) + "<span>" + E(prof.managedReason) + " Editing is disabled here.</span>";
        detail.appendChild(m);
      }
      if (prof.state === "unavailable") {
        var u = el("div", "at-note");
        u.setAttribute("data-kind", "reason");
        u.style.marginTop = "10px";
        u.innerHTML = I("ban", 13) + "<span>" + E(prof.unavailableReason) + "</span>";
        detail.appendChild(u);
      }
    }
    paintDetail();
  }

  /* --------------------------------------------------- elsewhere room */

  function buildElsewhereRoom(body, managerId) {
    var mgr = D.managers[managerId] || {};
    var home = MANAGER_HOME[managerId];
    var card = el("div", "at-answer");
    card.style.maxWidth = "620px";

    if (managerId === "manager-usage") {
      card.innerHTML =
        '<div class="at-answer-q">Owned by Usage</div>' +
        '<div class="at-answer-a">Settings does not calculate balances.</div>' +
        '<div class="at-answer-note">' + E(D.usage.note) + "</div>";
      body.appendChild(card);
      var snap = el("div", "at-list");
      snap.style.marginTop = "16px";
      D.usage.snapshots.forEach(function (s2) {
        var r = el("div", "at-list-row");
        r.innerHTML = '<span><span class="at-list-title">' + E(s2.providerId) + " · " + E(s2.account) + "</span>" +
          '<span class="at-list-sub">Remaining ' + E(s2.includedRemaining) + " · resets " + E(s2.resets) +
          " · " + E(s2.freshness) + " · " + E(s2.runOut) + "</span></span>" +
          '<span class="at-list-right">' + chip(s2.pressure === "exhausted" ? "attention" : s2.pressure === "high" ? "setup" : "", "Pressure: " + s2.pressure) + "</span>";
        snap.appendChild(r);
      });
      body.appendChild(snap);
      var link = el("button", "at-btn is-primary", "<span>Open Usage</span>" + I("external", 13));
      link.type = "button";
      link.style.marginTop = "12px";
      link.addEventListener("click", function () {
        simple("open-usage", "Open Usage", "Navigation.open('usage')",
          "A real build switches to the Usage surface, which owns measurement, history and forecasting.", "handoff");
      });
      body.appendChild(link);
      return;
    }

    card.innerHTML =
      '<div class="at-answer-q">Built in another Opus 5 concept</div>' +
      '<div class="at-answer-a">' + E(mgr.title || "This manager") + "</div>" +
      '<div class="at-answer-note">' + E(mgr.purpose || "") + "<br><br>" +
      "Each of the four Opus 5 concepts builds the provider manager plus two others in full, so the bakeoff covers eight dedicated managers rather than repeating the same two. " +
      (home && home.href
        ? "This one is built in <strong>" + E(home.concept) + "</strong>."
        : "This manager is not built out in the Opus 5 set.") + "</div>";
    body.appendChild(card);

    if (home && home.href) {
      var go = el("a", "at-btn is-primary");
      go.href = home.href;
      go.innerHTML = "<span>Open " + E(home.concept) + "</span>" + I("arrowUpRight", 13);
      go.style.marginTop = "12px";
      go.style.display = "inline-flex";
      go.style.textDecoration = "none";
      body.appendChild(go);
    }
  }

  /* ========================================================== NAVIGATION */

  function goTo(target) {
    closePopover();
    closeDrawer();
    if (target.managerId && (target.kind === "manager" || target.kind === "provider" || target.kind === "model")) {
      store.set({ categoryId: target.categoryId || "agents", view: "room", managerId: target.managerId });
      renderRoom(target.managerId);
      announce("Opened " + (D.managers[target.managerId] || {}).title + ".");
      return;
    }
    if (!target.categoryId) {
      store.set({ view: "home", categoryId: null, managerId: null });
      renderHome();
      return;
    }
    var changing = store.get().categoryId !== target.categoryId || store.get().view !== "workspace";
    store.set({ view: "workspace", categoryId: target.categoryId, managerId: null });
    renderWorkspace({ subcategoryId: target.subcategoryId, targetId: target.targetId });
    var cat = S.findCategory(D, target.categoryId);
    announce("Opened " + cat.title + (target.subcategoryId ? ", " + target.subcategoryId : "") + ".");
  }

  function swap(node) {
    mainEl.innerHTML = "";
    mainEl.appendChild(node);
  }

  /* =============================================================== MOUNT */

  var demoSelect = document.createElement("select");
  demoSelect.setAttribute("aria-label", "Demo state");
  D.demoStates.forEach(function (d) {
    var o = document.createElement("option");
    o.value = d.id; o.textContent = d.label;
    demoSelect.appendChild(o);
  });
  var demoWrap = document.createElement("span");
  demoWrap.style.display = "inline-flex";
  demoWrap.style.alignItems = "center";
  demoWrap.style.gap = "6px";
  var demoLabel = document.createElement("span");
  demoLabel.className = "pm-review-label";
  demoLabel.textContent = "Demo state";
  demoWrap.appendChild(demoLabel);
  demoWrap.appendChild(demoSelect);

  shell = window.PMShell.mount({
    rootId: "pm-root",
    concept: "Atlas · Settings as a place",
    conceptId: "atlas",
    theme: "friendly-dark",
    extraControls: demoWrap,
    onLayout: function () { if (spy) spy.measure(); },
    onWidthMode: function (mode) {
      if (mode !== "squeezed") closeDrawer();
      if (spy) spy.measure();
    }
  });
  mainEl = shell.main;

  demoSelect.addEventListener("change", function () {
    store.set({ demoState: demoSelect.value, catalogueRefreshing: demoSelect.value === "loading" });
    var s = store.get();
    if (s.view === "home") renderHome();
    else if (s.view === "room") renderRoom(s.managerId);
    else renderWorkspace({});
    announce("Demo state: " + demoSelect.options[demoSelect.selectedIndex].text);
  });

  window.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      var input = document.querySelector(".at-locator-input") || document.querySelector(".at-outline-field input");
      if (input) { input.focus(); input.select(); }
      else { goTo({}); window.setTimeout(function () {
        var i2 = document.querySelector(".at-locator-input"); if (i2) i2.focus();
      }, 60); }
    }
  });

  renderHome();
})();
