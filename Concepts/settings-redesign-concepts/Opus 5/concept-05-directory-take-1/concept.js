/* Opus 5 — Directory (concept 05).
 *
 * Thesis: Settings is a directory you can hold in your head. One quiet grid of
 * destinations over a compact rail of the twelve areas, and every card expands in
 * place into the area it names rather than throwing the reader somewhere new.
 *
 * What this file owns: every pixel. Home composition, the rail, the card grid, the
 * domain and page workspaces, the roster-and-form manager, the search dropdown, the
 * arrival highlight, the narrow-width push, and the motion that ties them together.
 * What it does not own: any fact. Domains, pages, sections, the 828 settings, manager
 * specs, search results, routes, the copy transaction and the state fixtures all come
 * from shared2, which draws nothing.
 *
 * Portability note (Slint 1.17.1): the route is an explicit state machine, every list
 * that can grow is windowed through PMVirtual, and nothing here reads layout to decide
 * what a thing MEANS — geometry is measured only to scroll an arrival into view.
 */
(function () {
  "use strict";

  var CONCEPT_ID = "concept-05-directory-take-1";
  var M = window.PM2Model;
  var IX = window.PM2Index;
  var RT = window.PM2Route;
  var MG = window.PM2Managers;
  var ST = window.PM2States;
  var CP = window.PM2Copy;

  var store = window.PM2Store.create(CONCEPT_ID);
  CP.attach(store);

  var shell = null;
  var root = null;      /* .d5 */
  var railEl = null;
  var barEl = null;
  var stageEl = null;
  var stageInner = null;

  /* Presentation state. Deliberately NOT in the store: none of it is a fact about
   * the Project, and restoring an open dropdown after a reload would be a lie. */
  var ui = {
    query: "",
    results: null,
    dropOpen: false,
    activeResult: -1,
    railOpen: false,
    pane: "roster",          /* narrow-width manager pane */
    tab: {},                 /* managerId -> section id */
    selected: {},            /* managerId -> objectId */
    openDetails: {},         /* settingId -> true */
    openAdvanced: {},        /* sectionId -> true */
    facets: { domains: [], kinds: [], exposures: [], changedOnly: false },
    allScroll: 0,
    copy: { step: 1, source: null, domains: null, preview: null, run: null, receipt: null },
    errors: {},              /* settingId -> message */
    pending: null            /* the arrival to reveal after the next paint */
  };

  var narrow = false;
  var lastFixture = null;
  /* True while the concept is writing the route for its own bookkeeping rather
   * than navigating. See the RT.onChange subscription in boot(). */
  var quiet = false;

  function withoutRender(fn) {
    quiet = true;
    try { fn(); } finally { quiet = false; }
  }

  /* ------------------------------------------------------------------ helpers */

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function icon(name, size) {
    return window.PMIcons.has(name) ? window.PMIcons.icon(name, size) : window.PMIcons.icon("dot", size);
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  function on(node, type, fn) { node.addEventListener(type, fn); return node; }

  function button(cls, html, fn) {
    var b = el("button", cls, html);
    b.type = "button";
    if (fn) on(b, "click", fn);
    return b;
  }

  function plural(n, one, many) { return n + " " + (n === 1 ? one : (many || one + "s")); }

  /* ---------------------------------------------------------------- the shell */

  function boot() {
    shell = window.PMShell.mount({
      rootId: "pm-root",
      concept: "Directory · a place for everything",
      conceptId: CONCEPT_ID,
      theme: document.documentElement.getAttribute("data-theme") || "friendly-dark",
      defaultTheme: "friendly-dark",
      onLayout: measureNarrow,
      onWidthMode: function () { measureNarrow(); render(); }
    });
    /* The shell's own Demo state select and Reset belong to the fixture list of
     * concepts 01-04. This concept ships its own, so the stale pair is removed
     * rather than left offering situations it does not implement. */
    PM2States.removeShellControl(shell);


    root = el("div", "d5");
    root.setAttribute("data-concept", CONCEPT_ID);

    railEl = el("aside", "d5-rail");
    railEl.setAttribute("aria-label", "Settings areas");

    var main = el("div", "d5-main");
    barEl = el("div", "d5-bar");
    var stateBar = el("div", "d5-statebar");
    stateBar.id = "d5-statebar";
    stageEl = el("div", "d5-stage d5-scroll");
    stageInner = el("div", "d5-stage-inner");
    stageEl.appendChild(stageInner);

    main.appendChild(barEl);
    main.appendChild(stateBar);
    main.appendChild(stageEl);

    var scrim = el("div", "d5-scrim");
    scrim.hidden = true;
    on(scrim, "click", function () { ui.railOpen = false; render(); });

    root.appendChild(railEl);
    root.appendChild(main);
    root.appendChild(scrim);
    shell.main.appendChild(root);

    document.addEventListener("keydown", onKeydown, true);
    on(stageEl, "scroll", function () {
      if (RT.current().kind === "all") ui.allScroll = stageEl.scrollTop;
    });
    RT.onChange(function () {
      /* A route write made while the reader is typing is bookkeeping, not
       * navigation: re-rendering there would rebuild the field under the cursor
       * and throw the caret away. */
      if (quiet) return;
      ui.dropOpen = false;
      render();
    });
    window.addEventListener("pm-concept-state-applied", function () { measureNarrow(); render(); });

    measureNarrow();
    applyFixtureQuery();
    render();
  }

  /* Width mode is presentation, derived at explicit checkpoints — never per frame,
   * and never the source of anything semantic. */
  function measureNarrow() {
    var w = (shell && shell.main ? shell.main.clientWidth : window.innerWidth) || window.innerWidth;
    var next = w < 900;
    if (next !== narrow) {
      narrow = next;
      if (!narrow) ui.railOpen = false;
    }
    root.setAttribute("data-narrow", narrow ? "true" : "false");
    root.setAttribute("data-rail", ui.railOpen ? "open" : "closed");
  }

  /* --------------------------------------------------------------- the router */

  function render() {
    var route = RT.current();
    var check = RT.resolve(route);

    measureNarrow();
    /* A fixture reached by deep link rather than by the control still has to take
     * effect, so the forced query is applied here rather than only on change. */
    var fixture = ST.active();
    if (fixture !== lastFixture) {
      lastFixture = fixture;
      MG.invalidate();
      applyFixtureQuery();
    }

    renderRail(route);
    renderBar(route, check);
    renderStateBar();

    if (window.PM2Spy) window.PM2Spy.release();
    clear(stageInner);
    var wrap = el("div", "d5-wrap");
    stageInner.appendChild(wrap);
    if (fixture !== "normal") wrap.appendChild(fixtureLine());

    if (!check.ok) {
      stageInner.setAttribute("data-pm-surface", "notice");
      wrap.appendChild(brokenLink(check));
      renderHome(wrap, route);
      return;
    }

    var kind = route.kind;
    if (kind === "home" || kind === "query") {
      stageInner.setAttribute("data-pm-surface", kind === "query" ? "search" : "home");
      renderHome(wrap, route);
    } else if (kind === "domain") {
      if (route.pageId) {
        stageInner.setAttribute("data-pm-surface", "page");
        renderPage(wrap, route);
      } else {
        stageInner.setAttribute("data-pm-surface", "domain");
        renderDomain(wrap, route);
      }
    } else if (kind === "manager") {
      stageInner.setAttribute("data-pm-surface", "manager");
      stageInner.setAttribute("data-pm-manager", route.managerId);
      renderManagerSurface(wrap, route);
    } else if (kind === "all") {
      stageInner.setAttribute("data-pm-surface", "all");
      renderAll(wrap, route);
    } else if (kind === "copy") {
      stageInner.setAttribute("data-pm-surface", "copy");
      renderCopy(wrap, route);
    }
    if (kind !== "manager") stageInner.removeAttribute("data-pm-manager");

    revealPending();
  }

  /* Which deterministic situation is on screen, stated inside the Settings surface
   * so a screenshot is self-describing and a reader is never guessing why a roster
   * is empty or a value is locked. */
  function fixtureLine() {
    var f = ST.activeFixture();
    var box = el("div", "d5-foundvia");
    box.innerHTML = icon("beaker", 12) +
      "<span><b>" + esc(f.label) + "</b> — " + esc(f.note) + "</span>";
    return box;
  }

  function brokenLink(check) {
    var box = el("div", "d5-linknotice");
    box.appendChild(el("div", "d5-notice-head", esc(
      check.reason === "malformed" ? "That link is not a Settings location" : "That link points somewhere this Project does not have")));
    box.appendChild(el("p", "d5-notice-detail", esc(check.detail || "")));
    box.appendChild(el("p", "d5-notice-detail", "The link was <code>" + esc(check.quoted || location.hash) + "</code>. Settings Home is shown below."));
    return box;
  }

  /* -------------------------------------------------------------------- rail */

  function renderRail(route) {
    clear(railEl);

    var head = el("div", "d5-rail-head");
    head.appendChild(el("div", "d5-rail-eyebrow", "Settings for"));
    var project = el("span", "d5-rail-project", esc(M.project.name));
    project.setAttribute("data-pm-project", "");
    head.appendChild(project);
    head.appendChild(el("span", "d5-rail-project-kind", esc(M.project.kind + " · " + M.project.path)));
    railEl.appendChild(head);

    var list = el("nav", "d5-rail-list d5-scroll");

    var home = button("d5-rail-item", icon("map") + "<span>Settings Home</span>", function () { RT.go({ kind: "home" }); });
    if (route.kind === "home" || route.kind === "query") home.setAttribute("aria-current", "true");
    list.appendChild(home);
    list.appendChild(el("div", "d5-rail-sep"));

    M.domains.forEach(function (d) {
      var b = button("d5-rail-item",
        icon(d.icon) + "<span>" + esc(d.title) + "</span><span class='d5-rail-item-count'>" + d.count + "</span>",
        function () { RT.go({ kind: "domain", domainId: d.id }); ui.railOpen = false; });
      b.setAttribute("data-pm-domain", d.id);
      if (route.domainId === d.id || (route.managerId && managerDomain(route.managerId) === d.id)) {
        b.setAttribute("aria-current", "true");
      }
      list.appendChild(b);
    });

    list.appendChild(el("div", "d5-rail-sep"));
    var all = button("d5-rail-item", icon("list") + "<span>All settings</span><span class='d5-rail-item-count'>" + M.counts.settings + "</span>",
      function () { RT.go({ kind: "all" }); ui.railOpen = false; });
    if (route.kind === "all") all.setAttribute("aria-current", "true");
    list.appendChild(all);

    var copy = button("d5-rail-item", icon("download") + "<span>Copy from another Project</span>",
      function () { RT.go({ kind: "copy", step: "source" }); ui.railOpen = false; });
    if (route.kind === "copy") copy.setAttribute("aria-current", "true");
    list.appendChild(copy);

    railEl.appendChild(list);

    var close = button("d5-iconbtn d5-rail-close", icon("chevronLeft") + "<span>Hide areas</span>", function () {
      ui.railOpen = false; render();
    });
    railEl.appendChild(close);
  }

  function managerDomain(managerId) {
    var f = M.familyOf(managerId);
    return f ? f.domainId : null;
  }

  /* --------------------------------------------------------------------- bar */

  function renderBar(route, check) {
    clear(barEl);

    if (narrow) {
      barEl.appendChild(button("d5-iconbtn", icon("panelLeft") + "<span>Areas</span>", function () {
        ui.railOpen = !ui.railOpen; render();
      }));
    }

    var back = backTarget(route);
    var backBtn = button("d5-iconbtn", icon("chevronLeft") + "<span>Back to " + esc(back.label) + "</span>", function () {
      RT.go(back.dest);
    });
    backBtn.setAttribute("data-pm-back", "");
    backBtn.hidden = route.kind === "home" || route.kind === "query";
    barEl.appendChild(backBtn);

    var crumbs = el("nav", "d5-crumbs");
    crumbs.setAttribute("data-pm-breadcrumb", "");
    crumbs.setAttribute("aria-label", "Breadcrumb");
    trail(route).forEach(function (step, i, arr) {
      if (i) crumbs.appendChild(el("span", "d5-crumb-sep", "/"));
      var b = button("d5-crumb", esc(step.label), step.dest ? function () { RT.go(step.dest); } : null);
      if (i === arr.length - 1) b.setAttribute("aria-current", "page");
      crumbs.appendChild(b);
    });
    barEl.appendChild(crumbs);

    barEl.appendChild(el("div", "d5-bar-spacer"));

    /* Exactly one search field exists at a time: the hero owns it on Home, the bar
     * owns it everywhere else. Two would make "the search field" ambiguous. */
    if (route.kind !== "home" && route.kind !== "query") {
      barEl.appendChild(searchField("bar"));
    }

    var close = button("d5-iconbtn", icon("ban") + "<span>Close Settings</span>", function () {
      shell.announce("Close Settings would return to the surface that opened Settings.");
      window.PMSim.run({
        label: "Close Settings",
        detail: "Returns to the surface that opened Settings — in this prototype, the shell stays put.",
        realCall: "cmd.settings.close"
      });
    });
    close.setAttribute("data-pm-close", "");
    barEl.appendChild(close);
  }

  function backTarget(route) {
    if (route.kind === "domain" && route.pageId) {
      /* `03_HOME_SEARCH_AND_NAVIGATION.md` § Location and exit: "`Back` returns one
       * Settings level", and the Escape order moves "one Settings level outward". A
       * link into a row is one level deeper than the page that holds it, so leaving a
       * row lands on its page — dropping straight to the domain skips the level the
       * reader was actually reading. */
      if (route.settingId || route.sectionId) {
        var pg = M.page(route.pageId);
        return { label: (pg && pg.title) || "this page",
          dest: { kind: "domain", domainId: route.domainId, pageId: route.pageId } };
      }
      return { label: (M.domain(route.domainId) || {}).title || "Settings", dest: { kind: "domain", domainId: route.domainId } };
    }
    if (route.kind === "domain") return { label: "Settings Home", dest: { kind: "home" } };
    if (route.kind === "manager") {
      var d = managerDomain(route.managerId);
      var dom = d ? M.domain(d) : null;
      if (route.objectId && narrow && ui.pane === "detail") {
        return { label: (MG.record(route.managerId) || {}).title || "the list", dest: { kind: "manager", managerId: route.managerId } };
      }
      return dom ? { label: dom.title, dest: { kind: "domain", domainId: dom.id } } : { label: "Settings Home", dest: { kind: "home" } };
    }
    return { label: "Settings Home", dest: { kind: "home" } };
  }

  function trail(route) {
    var out = [{ label: "Settings", dest: { kind: "home" } }];
    if (route.kind === "all") out.push({ label: "All settings", dest: null });
    if (route.kind === "copy") out.push({ label: "Copy settings from another Project", dest: null });
    if (route.kind === "query") out.push({ label: "Search", dest: null });
    if (route.kind === "domain") {
      var d = M.domain(route.domainId);
      if (d) out.push({ label: d.title, dest: route.pageId ? { kind: "domain", domainId: d.id } : null });
      if (route.pageId) {
        var p = M.page(route.pageId);
        if (p) out.push({ label: p.title, dest: null });
      }
    }
    if (route.kind === "manager") {
      var dom = managerDomain(route.managerId);
      var domain = dom ? M.domain(dom) : null;
      if (domain) out.push({ label: domain.title, dest: { kind: "domain", domainId: domain.id } });
      var rec = MG.record(route.managerId);
      out.push({ label: (rec && rec.title) || route.managerId, dest: route.objectId ? { kind: "manager", managerId: route.managerId } : null });
      if (route.objectId) {
        var sel = objectName(route.managerId, route.objectId);
        if (sel) out.push({ label: sel, dest: null });
      }
    }
    return out;
  }

  var objectNameCache = {};
  function objectName(managerId, objectId) {
    var key = managerId + "/" + objectId;
    if (objectNameCache[key]) return objectNameCache[key];
    var spec = MG.spec(managerId, store.get());
    var found = null;
    (spec.sections || []).forEach(function (s) {
      (s.items || []).forEach(function (it) { if (it.id === objectId) found = it.name; });
    });
    objectNameCache[key] = found;
    return found;
  }

  /* --------------------------------------------------------- state fixtures */

  function renderStateBar() {
    var bar = document.getElementById("d5-statebar");
    clear(bar);
    var active = ST.activeFixture();

    bar.appendChild(el("span", null, "Demo state"));
    var sel = el("select");
    sel.setAttribute("data-pm-state-control", "");
    sel.setAttribute("aria-label", "Deterministic demo state");
    ST.grouped().forEach(function (group) {
      var g = document.createElement("optgroup");
      g.label = group.group;
      group.items.forEach(function (f) {
        var o = document.createElement("option");
        o.value = f.id; o.textContent = f.label; o.title = f.note;
        g.appendChild(o);
      });
      sel.appendChild(g);
    });
    sel.value = active.id;
    on(sel, "change", function () {
      var dest = RT.withState(RT.current(), sel.value === "normal" ? null : sel.value);
      ui.query = ""; ui.results = null; ui.dropOpen = false;
      MG.invalidate();
      withoutRender(function () { RT.replace(dest); });
      applyFixtureQuery();
      render();
      shell.announce("Demo state: " + sel.options[sel.selectedIndex].textContent);
    });
    bar.appendChild(sel);
    var note = el("span", "d5-statebar-note", esc(active.note));
    note.title = active.note;
    bar.appendChild(note);

    var reset = button("d5-iconbtn d5-statebar-reset", icon("undo") + "<span>Reset this concept</span>", function () {
      store.reset();
      MG.invalidate();
      ui.openDetails = {}; ui.openAdvanced = {}; ui.errors = {};
      ui.copy = { step: 1, source: null, domains: null, preview: null, run: null, receipt: null };
      render();
      shell.announce("Every change made in this concept was cleared.");
    });
    bar.appendChild(reset);
  }

  /* A fixture that is about search puts its query in the field, so the situation it
   * names is the one on screen rather than one the reader has to reproduce. */
  function applyFixtureQuery() {
    var forced = ST.effects().forceQuery;
    if (forced) {
      ui.query = forced;
      ui.results = IX.query(forced, { limit: 40 });
      ui.dropOpen = true;
    }
  }

  /* ------------------------------------------------------------------ search */

  function searchField(where) {
    var wrap = el("div", "d5-searchwrap d5-searchwrap--" + where);
    var field = el("div", "d5-searchfield");
    field.innerHTML = icon("search", 16);

    var input = document.createElement("input");
    input.type = "text";
    input.spellcheck = false;
    input.autocomplete = "off";
    input.placeholder = "Search settings, managers, providers and actions";
    input.setAttribute("data-pm-search-field", "");
    input.setAttribute("aria-label", "Search all settings");
    input.value = ui.query;
    field.appendChild(input);

    if (ui.query) {
      field.appendChild(button("d5-searchclear", icon("ban", 14), function () {
        ui.query = ""; ui.results = null; ui.dropOpen = false;
        withoutRender(function () { RT.replace({ kind: "home" }); });
        render();
      }));
    }
    wrap.appendChild(field);

    var drop = el("div", "d5-drop");
    drop.setAttribute("data-pm-search-dropdown", "");
    drop.hidden = !(ui.dropOpen && ui.results);
    wrap.appendChild(drop);
    if (!drop.hidden) fillDropdown(drop);

    on(input, "input", function () {
      ui.query = input.value;
      ui.activeResult = -1;
      if (!ui.query.trim()) {
        ui.results = null; ui.dropOpen = false;
        drop.hidden = true;
        withoutRender(function () { RT.replace({ kind: "home" }); });
        return;
      }
      ui.results = IX.query(ui.query, { limit: 40 });
      ui.dropOpen = true;
      drop.hidden = false;
      fillDropdown(drop);
      /* The query lives in the route, so Back from a chosen result returns to the
       * query AND the result that was chosen rather than to a blank Home. */
      withoutRender(function () { RT.replace({ kind: "query", query: ui.query }); });
    });

    on(input, "keydown", function (e) {
      if (e.key === "Escape" && ui.dropOpen) { e.stopPropagation(); ui.dropOpen = false; drop.hidden = true; return; }
      if (!ui.results) return;
      var flat = flatResults(ui.results);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        ui.activeResult += (e.key === "ArrowDown" ? 1 : -1);
        if (ui.activeResult < 0) ui.activeResult = flat.length - 1;
        if (ui.activeResult >= flat.length) ui.activeResult = 0;
        fillDropdown(drop);
      } else if (e.key === "Enter" && ui.activeResult >= 0 && flat[ui.activeResult]) {
        e.preventDefault();
        chooseResult(flat[ui.activeResult].id);
      }
    });

    return wrap;
  }

  function flatResults(res) {
    var out = [];
    (res.groups || []).forEach(function (g) { g.results.forEach(function (r) { out.push(r); }); });
    return out;
  }

  function fillDropdown(drop) {
    clear(drop);
    var res = ui.results;
    if (!res) return;

    if (!res.total) {
      var empty = el("div", "d5-drop-empty");
      empty.innerHTML = "Nothing matches <b>" + esc(ui.query) + "</b>.";
      empty.appendChild(el("p", "d5-result-path", "Try a shorter word, or browse the areas on the left. Search covers every one of the " + M.counts.settings + " settings in this Project, including the ones that are unavailable here."));
      drop.appendChild(empty);
      return;
    }

    var scroll = el("div", "d5-drop-scroll d5-scroll");
    var index = 0;
    res.groups.forEach(function (group) {
      var g = el("div", "d5-drop-group");
      g.appendChild(el("div", "d5-drop-label", esc(group.label)));
      group.results.forEach(function (r) {
        var my = index++;
        var b = button("d5-result" + (my === ui.activeResult ? " is-active" : ""), null, function () { chooseResult(r.id); });
        b.setAttribute("data-pm-result", r.id);
        var top = el("div", "d5-result-top");
        top.appendChild(el("span", "d5-result-label", esc(r.label)));
        top.appendChild(el("span", "d5-result-type", esc(r.typeLabel)));
        b.appendChild(top);
        b.appendChild(el("div", "d5-result-path", esc(r.path)));
        if (r.availability) b.appendChild(el("div", "d5-result-why", esc(r.availability)));
        g.appendChild(b);
      });
      scroll.appendChild(g);
    });
    drop.appendChild(scroll);

    var foot = el("div", "d5-drop-foot");
    foot.appendChild(el("span", null, esc(res.shown + " of " + res.total + " matches")));
    if (res.truncated) {
      foot.appendChild(button("d5-drop-more", "See all in All settings", function () {
        ui.dropOpen = false;
        RT.go({ kind: "all", facet: ui.query });
      }));
    }
    drop.appendChild(foot);
  }

  /* Routing is only ever done from the immutable result id. The rendered list is a
   * view; its order is never an address. */
  function chooseResult(resultId) {
    var result = IX.byId(resultId);
    if (!result) return;
    ui.dropOpen = false;
    /* Record the query AND the chosen result before leaving, so the browser Back
     * button lands on the search the reader actually performed. */
    withoutRender(function () { RT.replace({ kind: "query", query: ui.query, resultId: resultId }); });
    ui.pending = { result: result };
    RT.go(destinationRoute(result.destination));
  }

  function destinationRoute(d) {
    if (d.managerId) {
      return { kind: "manager", managerId: d.managerId, objectId: d.objectId || null,
        sectionKey: d.sectionKey || null, rowId: d.rowId || null };
    }
    return { kind: "domain", domainId: d.domainId, pageId: d.pageId, sectionId: d.sectionId, settingId: d.settingId };
  }

  /* ------------------------------------------------------------------- home */

  function renderHome(wrap, route) {
    var fx = ST.effects();

    wrap.appendChild(el("h2", "d5-hero-title", "Settings"));
    wrap.appendChild(el("p", "d5-hero-sub",
      "Everything below applies to " + esc(M.project.name) + ". Changing something here changes it for this Project only."));

    wrap.appendChild(searchField("hero"));

    var notice = ST.notice();
    if (notice && !store.isDismissed(notice.id)) wrap.appendChild(renderNotice(notice));

    wrap.appendChild(renderAttention(fx));

    wrap.appendChild(el("div", "d5-secttitle", "Areas"));
    var grid = el("div", "d5-grid");
    M.domains.forEach(function (d) {
      var card = button("d5-card", null, function () { RT.go({ kind: "domain", domainId: d.id }); });
      card.setAttribute("data-pm-domain", d.id);
      card.appendChild(el("span", "d5-card-ico", icon(d.icon, 17)));
      var body = el("div", "d5-card-body");
      body.appendChild(el("div", "d5-card-title", esc(d.title)));
      body.appendChild(el("div", "d5-card-purpose", esc(d.purpose)));
      var managers = d.families.length;
      body.appendChild(el("div", "d5-card-meta",
        plural(d.count, "setting") + " · " + plural(d.pages.length, "page") +
        (managers ? " · " + plural(managers, "manager") : "") +
        (fx.refreshing ? " · refreshing" : "")));
      card.appendChild(body);
      card.appendChild(el("span", "d5-card-chev", icon("chevronRight", 14)));
      grid.appendChild(card);
    });
    wrap.appendChild(grid);

    var utils = el("div", "d5-utils");
    utils.appendChild(button("d5-util", icon("list") + "<span>All settings</span>", function () { RT.go({ kind: "all" }); }));
    utils.appendChild(button("d5-util", icon("download") + "<span>Copy settings from another Project</span>", function () { RT.go({ kind: "copy", step: "source" }); }));
    utils.appendChild(button("d5-util", icon("history") + "<span>Recently changed</span>", function () {
      ui.facets = { domains: [], kinds: [], exposures: [], changedOnly: true };
      RT.go({ kind: "all" });
    }));
    utils.appendChild(button("d5-util", icon("beaker") + "<span>Doctor</span>", function () { RT.go({ kind: "manager", managerId: "manager-doctor" }); }));
    wrap.appendChild(utils);
  }

  function renderNotice(notice) {
    var box = el("div", "d5-notice");
    box.innerHTML = icon("alert", 16);
    var body = el("div");
    body.appendChild(el("div", "d5-notice-head", esc(notice.headline)));
    body.appendChild(el("p", "d5-notice-detail", esc(notice.detail)));
    box.appendChild(body);
    var acts = el("div", "d5-notice-act");
    if (notice.action) {
      acts.appendChild(button("d5-btn", esc(notice.action.label), function () {
        RT.go(destinationRoute(notice.action.destination));
      }));
    }
    acts.appendChild(button("d5-iconbtn", icon("ban", 14), function () {
      store.dismiss(notice.id); render();
    }));
    box.appendChild(acts);
    return box;
  }

  function renderAttention(fx) {
    var items = ST.attentionFlat().filter(function (a) { return !store.isDismissed(a.id); });
    var box = el("section", "d5-attention");
    var head = el("div", "d5-attention-head");
    head.appendChild(el("span", null, "Notices"));
    head.appendChild(el("span", "d5-attention-count", items.length ? String(items.length) : ""));
    box.appendChild(head);

    if (!items.length) {
      box.appendChild(el("p", "d5-attention-empty", fx.noAttention
        ? "Nothing is configured yet, so there is nothing to fix. Start with AI Brains & Providers."
        : "Nothing needs attention in this Project right now."));
      return box;
    }
    items.forEach(function (a) {
      /* `01_CORE_ARCHITECTURE` § Notices: three separated runs. What is broken, what
       * is half-finished and what is only advice are read differently, and one toned
       * list makes an unfinished setup look like a fault. */
      if (a.groupLabel) box.appendChild(el("div", "d5-attn-group", esc(a.groupLabel)));
      var b = button("d5-attn", null, function () { RT.go(destinationRoute(a.destination)); });
      var dot = el("span", "d5-attn-dot");
      dot.setAttribute("data-tone", a.tone);
      b.appendChild(dot);
      var body = el("div", "d5-attn-body");
      body.appendChild(el("div", "d5-attn-label", esc(a.label)));
      body.appendChild(el("div", "d5-attn-detail", esc(a.detail)));
      b.appendChild(body);
      b.appendChild(el("span", "d5-attn-act", esc(a.actionLabel)));
      box.appendChild(b);
    });
    return box;
  }

  /* ----------------------------------------------------------------- domain */

  function renderDomain(wrap, route) {
    var d = M.domain(route.domainId);
    if (!d) return;

    var head = el("header", "d5-pagehead");
    head.appendChild(el("h2", "d5-pagehead-title", esc(d.title)));
    head.appendChild(el("p", "d5-pagehead-purpose", esc(d.purpose)));
    head.appendChild(el("div", "d5-pagehead-counts",
      plural(d.count, "setting") + " across " + plural(d.pages.length, "page") +
      (d.families.length ? ", plus " + plural(d.families.length, "manager") : "")));
    wrap.appendChild(head);

    var pages = el("section", "d5-group");
    pages.appendChild(el("div", "d5-secttitle", "Pages"));
    d.pages.forEach(function (p) {
      var b = button("d5-dest", null, function () { RT.go({ kind: "domain", domainId: d.id, pageId: p.id }); });
      b.setAttribute("data-pm-page", p.id);
      b.appendChild(el("span", "d5-dest-ico", icon("fileText", 15)));
      var body = el("div", "d5-dest-body");
      body.appendChild(el("div", "d5-dest-title", esc(p.title)));
      body.appendChild(el("div", "d5-dest-sub", esc(p.summary)));
      b.appendChild(body);
      b.appendChild(el("span", "d5-dest-meta", plural(p.count, "setting")));
      b.appendChild(el("span", "d5-dest-chev", icon("chevronRight", 14)));
      pages.appendChild(b);
    });
    wrap.appendChild(pages);

    if (d.families.length) {
      var mgrs = el("section", "d5-group");
      mgrs.appendChild(el("div", "d5-secttitle", "Managers in this area"));
      d.families.forEach(function (f) {
        var rec = MG.record(f.managerId) || {};
        var b = button("d5-dest", null, function () { RT.go({ kind: "manager", managerId: f.managerId }); });
        b.setAttribute("data-pm-manager", f.managerId);
        b.appendChild(el("span", "d5-dest-ico", icon(rec.icon || "sliders", 15)));
        var body = el("div", "d5-dest-body");
        body.appendChild(el("div", "d5-dest-title", esc(rec.title || f.family)));
        body.appendChild(el("div", "d5-dest-sub", esc(rec.purpose || f.family)));
        b.appendChild(body);
        b.appendChild(el("span", "d5-dest-meta", f.deferred ? "Owned by " + esc(f.owner) : archetypeWord(f.archetype)));
        b.appendChild(el("span", "d5-dest-chev", icon("chevronRight", 14)));
        mgrs.appendChild(b);
      });
      wrap.appendChild(mgrs);
    }
  }

  function archetypeWord(a) {
    if (a === "resource roster and detail sheet") return "List and detail";
    if (a === "inventory catalogue") return "Catalogue";
    if (a === "read-only health projection") return "Read-only";
    if (a === "preview and confirmation transaction") return "Transaction";
    if (a === "setup or repair sequence") return "Setup";
    if (a === "diagnostic drawer") return "Diagnostics";
    if (a === "named owner insertion point") return "Separate owner";
    return "Settings";
  }

  /* ------------------------------------------------------------------- page */

  function renderPage(wrap, route) {
    var d = M.domain(route.domainId);
    var p = M.page(route.pageId);
    if (!d || !p) return;

    var head = el("header", "d5-pagehead");
    head.appendChild(el("h2", "d5-pagehead-title", esc(p.title)));
    head.appendChild(el("p", "d5-pagehead-purpose", esc(p.summary)));
    head.appendChild(el("div", "d5-pagehead-counts", plural(p.count, "setting") + " in " + plural(p.sections.length, "group")));
    wrap.appendChild(head);

    /* A deep link to an advanced row must open the disclosure that holds it —
     * landing on a collapsed section would be a link that lies. */
    if (route.settingId) {
      var target = M.setting(route.settingId);
      if (target) ui.openAdvanced[target.sectionId] = true;
    }

    /* An index of the page's own groups, which highlights as the reader scrolls — not
     * only when they click it. `01_CORE_ARCHITECTURE` asks for exactly this and it is
     * the half of the contract a jump-only index quietly omits: it can say where you
     * asked to go but never where you are. */
    var index = el("nav", "d5-onpage");
    index.setAttribute("aria-label", "On this page");
    index.appendChild(el("span", "d5-onpage-label", "On this page"));
    var built = [];
    p.sections.forEach(function (section) {
      var link = button("d5-onpage-item", esc(section.title), function () {
        var target = stageInner.querySelector('[data-pm-section="' + cssEscape(section.id) + '"]');
        if (target) {
          var box = target.getBoundingClientRect();
          var stageBox = stageEl.getBoundingClientRect();
          stageEl.scrollTop += box.top - stageBox.top - 24;
        }
      });
      link.setAttribute("data-onpage", section.id);
      index.appendChild(link);
    });
    if (p.sections.length > 1) wrap.appendChild(index);

    p.sections.forEach(function (section) {
      var node = renderSection(section, route);
      wrap.appendChild(node);
      built.push({ id: section.id, title: section.title, pageId: p.id, el: node });
    });

    bindSpy(built, index);
  }

  /* Binds the headless scrollspy and paints this concept's own highlight. */
  function bindSpy(sections, index) {
    if (!window.PM2Spy || !sections.length) return;
    window.PM2Spy.bind({
      scroller: stageEl,
      sections: sections,
      inset: 96,
      onActive: function (id) {
        var items = index.querySelectorAll("[data-onpage]");
        for (var i = 0; i < items.length; i++) {
          items[i].setAttribute("aria-current", items[i].getAttribute("data-onpage") === id ? "true" : "false");
        }
      }
    });
  }

  function renderSection(section, route) {
    var box = el("section", "d5-section");
    box.setAttribute("data-pm-section", section.id);

    var head = el("div", "d5-section-head");
    head.appendChild(el("h3", "d5-section-title", esc(section.title)));
    head.appendChild(el("span", "d5-section-count", plural(section.count, "setting")));
    box.appendChild(head);

    var rows = M.rowsInSection(section.id);
    var standard = [];
    var deeper = [];
    rows.forEach(function (r) {
      if (M.exposureRank(r.exposure) === 0) standard.push(r); else deeper.push(r);
    });

    standard.forEach(function (r) { box.appendChild(renderRow(r, route)); });

    if (deeper.length) {
      var open = !!ui.openAdvanced[section.id];
      if (open) {
        deeper.forEach(function (r) { box.appendChild(renderRow(r, route)); });
      }
      var toggle = button("d5-why", (open ? "Hide" : "Show") + " " + plural(deeper.length, "advanced setting"), function () {
        ui.openAdvanced[section.id] = !open;
        render();
      });
      toggle.style.marginTop = "8px";
      box.appendChild(toggle);
    }
    return box;
  }

  function renderRow(rec, route) {
    var state = ST.rowState(rec);
    var row = el("div", "d5-row");
    row.setAttribute("data-pm-row", rec.id);
    row.tabIndex = -1;
    var editable = M.isEditable(state);
    if (!editable) row.setAttribute("data-locked", "true");

    var main = el("div", "d5-row-main");
    var label = el("div", "d5-row-label");
    label.appendChild(el("span", "d5-row-title", esc(rec.label)));

    var tone = M.stateTone(state);
    if (tone !== "quiet") {
      var tag = el("span", "d5-tag", esc(M.stateLabel(state)));
      tag.setAttribute("data-tone", tone);
      label.appendChild(tag);
    } else if (store.changed(rec.id)) {
      var ch = el("span", "d5-tag", "Changed");
      ch.setAttribute("data-tone", "changed");
      label.appendChild(ch);
    }
    if (state.restart === "required") {
      var rs = el("span", "d5-tag", "Restart");
      rs.setAttribute("data-tone", "setup");
      label.appendChild(rs);
    }
    main.appendChild(label);
    main.appendChild(el("p", "d5-row-desc", esc(rec.desc)));

    var reason = M.stateReason(state);
    if (reason || rec.badges.length || rec.legacyScope.length) {
      var openDet = !!ui.openDetails[rec.id];
      main.appendChild(button("d5-why", openDet ? "Hide details" : "Why this value?", function () {
        ui.openDetails[rec.id] = !openDet; render();
      }));
      if (openDet) main.appendChild(rowDetails(rec, state, reason));
    }
    if (ui.errors[rec.id]) main.appendChild(el("div", "d5-err", esc(ui.errors[rec.id])));

    row.appendChild(main);
    row.appendChild(renderControl(rec, state, editable));
    return row;
  }

  function rowDetails(rec, state, reason) {
    var box = el("div", "d5-details");
    if (reason) box.appendChild(el("p", null, esc(reason)));
    var dl = el("dl");
    function pair(k, v) {
      dl.appendChild(el("dt", null, esc(k)));
      dl.appendChild(el("dd", null, esc(v)));
    }
    pair("Applies to", M.project.name + " (this Project)");
    pair("Default", String(state.defaultValue === "" ? "not set" : state.defaultValue));
    if (rec.recommended != null && rec.recommended !== "") pair("Recommended", String(rec.recommended));
    pair("Exposure", exposureWord(rec.exposure));
    if (state.restart === "required") pair("Takes effect", "after the next restart");
    if (state.managedBy) pair("Set by", state.managedBy);
    pair("Setting id", rec.id);
    box.appendChild(dl);
    return box;
  }

  function exposureWord(e) {
    for (var i = 0; i < M.EXPOSURE.length; i++) if (M.EXPOSURE[i].id === e) return M.EXPOSURE[i].label;
    return "Advanced";
  }

  /* Controls do real work: every change lands in the store, which is what makes the
   * "Changed" tag and the copy preview truthful rather than decorative. */
  function renderControl(rec, state, editable) {
    var box = el("div", "d5-row-control");
    var value = store.valueOf(rec.id);
    if (value === undefined) value = state.value;

    function commit(next) {
      store.setValue(rec.id, next);
      delete ui.errors[rec.id];
      MG.invalidate();
      render();
    }

    if (!editable) {
      box.appendChild(el("span", "d5-listval d5-listval-empty",
        state.source === "unavailable" ? "Not available here" : esc(String(value === "" ? "not set" : value))));
      return box;
    }

    if (rec.kind === "toggle") {
      var t = button("d5-toggle", "", function () { commit(!value); });
      t.setAttribute("role", "switch");
      t.setAttribute("aria-checked", value ? "true" : "false");
      t.setAttribute("aria-label", rec.label);
      t.setAttribute("data-pm-control", rec.id);
      box.appendChild(t);
      return box;
    }

    if (rec.kind === "select" || rec.kind === "radio") {
      var opts = rec.options.slice();
      if (!opts.length) opts = [String(value)];
      if (state.source === "notConfigured") opts = ["Not set"].concat(opts);
      box.appendChild(picker(rec, opts, value, commit));
      return box;
    }

    if (rec.kind === "number") {
      var n = el("input", "d5-input");
      n.type = "number";
      n.value = value === "" ? "" : String(value);
      n.setAttribute("data-pm-control", rec.id);
      n.setAttribute("aria-label", rec.label);
      on(n, "change", function () {
        var num = Number(n.value);
        if (n.value === "" || isNaN(num)) {
          ui.errors[rec.id] = "That needs to be a number. The previous value is still in use.";
          render();
          return;
        }
        if (ST.effects().validationError && num < 0) {
          ui.errors[rec.id] = "This cannot be negative. Nothing was saved.";
          render();
          return;
        }
        commit(num);
      });
      box.appendChild(n);
      return box;
    }

    if (rec.kind === "slider") {
      var r = el("input", "d5-range");
      r.type = "range";
      r.min = "0"; r.max = String(Math.max(100, Number(state.defaultValue) * 2 || 100));
      r.value = String(Number(value) || 0);
      r.setAttribute("data-pm-control", rec.id);
      r.setAttribute("aria-label", rec.label);
      var out = el("span", "d5-rangeval", esc(String(value)));
      on(r, "input", function () { out.textContent = r.value; });
      on(r, "change", function () { commit(Number(r.value)); });
      box.appendChild(r);
      box.appendChild(out);
      return box;
    }

    if (rec.kind === "text" || rec.kind === "path") {
      var i = el("input", "d5-input");
      i.type = "text";
      i.value = value == null ? "" : String(value);
      i.placeholder = state.source === "notConfigured" ? "Not set" : "";
      i.setAttribute("data-pm-control", rec.id);
      i.setAttribute("aria-label", rec.label);
      if (window.PMSpellcheck && rec.kind === "text") window.PMSpellcheck.attach && window.PMSpellcheck.attach(i);
      on(i, "change", function () {
        if (ST.effects().validationError && rec.kind === "path" && i.value && i.value.indexOf("/") !== 0) {
          ui.errors[rec.id] = "That is not a path this host can reach. What you typed was kept.";
          render();
          return;
        }
        commit(i.value);
      });
      box.appendChild(i);
      return box;
    }

    if (rec.kind === "action") {
      var a = button("d5-btn", esc(state.setupLabel || "Run"), function () {
        window.PMSim.run({
          label: rec.label,
          detail: rec.desc,
          realCall: "cmd.settings.action.run",
          payload: { settingId: rec.id, project: M.project.id }
        });
      });
      a.setAttribute("data-pm-control", rec.id);
      box.appendChild(a);
      return box;
    }

    /* list / multiselect / keyvalue: a summary plus an editor, so a page of these
     * does not become a wall of text areas. */
    var list = Array.isArray(value) ? value : (value ? [String(value)] : []);
    var summary = el("span", "d5-listval" + (list.length ? "" : " d5-listval-empty"),
      list.length ? esc(list.slice(0, 2).join(", ") + (list.length > 2 ? " +" + (list.length - 2) + " more" : "")) : "Nothing set");
    box.appendChild(summary);
    var edit = button("d5-btn", "Edit", function () {
      var next = window.prompt("One entry per line — " + rec.label, list.join("\n"));
      if (next == null) return;
      commit(next.split("\n").map(function (x) { return x.trim(); }).filter(function (x) { return !!x; }));
    });
    edit.setAttribute("data-pm-control", rec.id);
    box.appendChild(edit);
    return box;
  }

  /* A value picker in the Puppet Master Model/Mode idiom: a trigger showing the current
   * value, and a menu that hangs beneath it — or flips above it when the row is near the
   * bottom of the page, which is the behaviour the model picker in the bottom bar shows.
   * Placement and layering come from PM2Menu; every pixel here is this concept's own. */
  function picker(rec, options, value, commit) {
    var wrap = el("div", "d5-picker");
    var trigger = button("d5-picker-trigger", null, function () { toggle(); });
    trigger.setAttribute("data-pm-control", rec.id);
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", rec.label);
    trigger.appendChild(el("span", "d5-picker-value", esc(String(value === "" || value == null ? "Not set" : value))));
    trigger.innerHTML += icon("chevronDown", 13);
    wrap.appendChild(trigger);

    var panel = null;
    var entry = null;
    /* What the FIRST level shows: the options themselves, or one row per group when the
     * list genuinely has two levels. Keyboard movement walks whichever of the two it is. */
    var top = options;
    var active = Math.max(0, options.indexOf(value));

    function shut() {
      if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
      panel = null; entry = null;
      trigger.setAttribute("aria-expanded", "false");
    }

    function paint() {
      if (!panel) return;
      var rows = panel.querySelectorAll("[data-opt]");
      for (var i = 0; i < rows.length; i++) {
        rows[i].setAttribute("aria-selected", i === active ? "true" : "false");
        if (i === active) rows[i].focus({ preventScroll: false });
      }
    }

    function choose(v) {
      window.PM2Menu.closeAll();
      commit(v === "Not set" ? "" : v);
    }

    /* One option row. The check mark is the only thing saying "this is the current
     * value" — a menu that decorates every row stops telling you anything. */
    function optionRow(o, i) {
      var row = button("d5-menu-item", null, function () { choose(o); });
      row.setAttribute("role", "option");
      row.setAttribute("data-opt", String(i));
      row.setAttribute("aria-selected", o === value ? "true" : "false");
      row.appendChild(el("span", "d5-menu-check", o === value ? icon("check", 12) : ""));
      row.appendChild(el("span", "d5-menu-label", esc(o)));
      return row;
    }

    /* A submenu parent. `07_THEME_MOTION_RESPONSIVE_AND_SLINT` asks for the Model/Mode
     * selector family including submenus: the second level opens BESIDE the panel on its
     * own layer, so the first level stays visible and Escape closes the second only. */
    function groupRow(g, i) {
      var row = button("d5-menu-item is-parent", null, null);
      row.setAttribute("role", "option");
      row.setAttribute("data-opt", String(i));
      row.setAttribute("aria-haspopup", "menu");
      row.setAttribute("aria-expanded", "false");
      row.appendChild(el("span", "d5-menu-check", g.options.indexOf(value) >= 0 ? icon("check", 12) : ""));
      row.appendChild(el("span", "d5-menu-label", esc(g.label)));
      row.appendChild(el("span", "d5-menu-more", icon("chevronRight", 12)));

      var sub = null;
      var subActive = 0;

      function shutSub() {
        if (sub && sub.parentNode) sub.parentNode.removeChild(sub);
        sub = null;
        row.setAttribute("aria-expanded", "false");
      }

      function paintSub() {
        if (!sub) return;
        var rows = sub.querySelectorAll("[data-opt]");
        for (var z = 0; z < rows.length; z++) {
          rows[z].setAttribute("aria-selected", z === subActive ? "true" : "false");
          if (z === subActive) rows[z].focus({ preventScroll: false });
        }
      }

      function openSub() {
        if (sub) return;
        sub = el("div", "d5-menu d5-submenu");
        sub.setAttribute("role", "listbox");
        g.options.forEach(function (o, k) { sub.appendChild(optionRow(o, k)); });

        on(sub, "keydown", function (e) {
          if (e.key === "ArrowLeft") {
            /* Left goes back one level rather than out of the menu entirely. */
            e.preventDefault(); e.stopPropagation();
            window.PM2Menu.closeTop();
            row.focus({ preventScroll: true });
          } else if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Home" || e.key === "End") {
            e.preventDefault(); e.stopPropagation();
            subActive = window.PM2Menu.move(g.options, subActive, e.key);
            paintSub();
          } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault(); e.stopPropagation();
            choose(g.options[subActive]);
          }
        });

        document.body.appendChild(sub);
        var spot = window.PM2Menu.placeSide(
          panel.getBoundingClientRect(), row.getBoundingClientRect(),
          { width: sub.offsetWidth, height: sub.offsetHeight },
          { width: window.innerWidth, height: window.innerHeight });
        sub.style.left = spot.left + "px";
        sub.style.top = spot.top + "px";
        sub.style.maxHeight = spot.maxHeight + "px";
        sub.setAttribute("data-side", spot.side);
        row.setAttribute("aria-expanded", "true");
        window.PM2Menu.open({ close: shutSub, element: sub, parent: entry });
        subActive = Math.max(0, g.options.indexOf(value));
        paintSub();
      }

      on(row, "click", function (e) {
        e.stopPropagation();
        if (sub) window.PM2Menu.closeTop(); else openSub();
      });
      on(row, "keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
          e.preventDefault(); e.stopPropagation();
          openSub();
        }
      });
      return row;
    }

    function toggle() {
      if (panel) { window.PM2Menu.closeAll(); return; }

      panel = el("div", "d5-menu");
      panel.setAttribute("role", "listbox");

      var groups = window.PM2Menu.groupsFor(rec.id, options);
      top = groups || options;
      if (groups) groups.forEach(function (g, i) { panel.appendChild(groupRow(g, i)); });
      else options.forEach(function (o, i) { panel.appendChild(optionRow(o, i)); });

      on(panel, "keydown", function (e) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Home" || e.key === "End") {
          e.preventDefault();
          active = window.PM2Menu.move(top, active, e.key);
          paint();
        } else if ((e.key === "Enter" || e.key === " ") && !groups) {
          e.preventDefault();
          choose(options[active]);
        }
      });

      document.body.appendChild(panel);
      var a = trigger.getBoundingClientRect();
      var box2 = panel.getBoundingClientRect();
      var spot = window.PM2Menu.place(
        { left: a.left, right: a.right, top: a.top, bottom: a.bottom, width: a.width },
        { width: Math.max(box2.width, a.width), height: box2.height },
        { width: window.innerWidth, height: window.innerHeight },
        { align: "start" });
      panel.style.left = spot.left + "px";
      panel.style.top = spot.top + "px";
      panel.style.minWidth = Math.round(a.width) + "px";
      panel.style.maxHeight = spot.maxHeight + "px";
      panel.setAttribute("data-side", spot.side);

      trigger.setAttribute("aria-expanded", "true");
      entry = window.PM2Menu.open({ close: shut, element: panel });
      active = 0;
      if (groups) groups.forEach(function (g, i) { if (g.options.indexOf(value) >= 0) active = i; });
      else active = Math.max(0, options.indexOf(value));
      paint();
    }

    return wrap;
  }

  /* ---------------------------------------------------------------- manager */

  function renderManagerSurface(wrap, route) {
    var spec = ST.decorate(MG.spec(route.managerId, store.get()));
    var family = M.familyOf(route.managerId) || {};

    var head = el("header", "d5-mgr-head");
    head.appendChild(el("h2", "d5-mgr-title", esc(spec.title)));
    head.appendChild(el("p", "d5-mgr-purpose", esc(spec.purpose)));
    wrap.appendChild(head);

    if (family.deferred && spec.owner) {
      wrap.appendChild(ownerBlock(spec.owner, route.managerId));
    }
    if (spec.health) wrap.appendChild(healthBlock(spec.health));

    var listSections = (spec.sections || []).filter(function (s) {
      return (s.kind === "list" || s.kind === "cards") && (s.items || []).length;
    });
    var roster = pickRoster(spec, listSections);

    if (roster) renderRosterManager(wrap, spec, roster, route);
    else renderDocumentManager(wrap, spec, route);

    if (spec.diagnostics && spec.diagnostics.length) {
      var diag = el("section", "d5-group");
      diag.appendChild(el("div", "d5-secttitle", "Diagnostics"));
      var acts = el("div", "d5-actions");
      spec.diagnostics.forEach(function (d) {
        acts.appendChild(button("d5-btn", esc(d.label), function () { runAction(route.managerId, d); }));
      });
      diag.appendChild(acts);
      wrap.appendChild(diag);
    }
  }

  /* A roster is only a roster when the archetype says the manager is about objects.
   * A preference document with one incidental list must not be forced into a
   * two-pane layout it does not want. */
  function pickRoster(spec, listSections) {
    var wantsRoster = spec.archetype === "resource roster and detail sheet" ||
      spec.archetype === "inventory catalogue";
    if (!wantsRoster) return null;
    /* The FIRST such section, not the biggest. A manager's sections are written in
     * importance order, so the subject of the manager leads — for providers that is the
     * provider family. Picking the longest list instead put the installations roster in
     * front and titled the detail sheet with a raw executable path, which is precisely
     * what the provider adjudication says must never be the normal identity. */
    var first = listSections.length ? listSections[0] : null;
    return first && (first.items || []).length > 1 ? first : null;
  }

  function renderRosterManager(wrap, spec, roster, route) {
    var mgr = el("div", "d5-mgr");

    /* A routed object may live on a subpage rather than in the roster. When it does,
     * the roster keeps its own selection and the subpage that holds the object is
     * the one opened, so the link lands on the row it named. */
    var elsewhere = route.objectId && !roster.items.some(function (i) { return i.id === route.objectId; })
      ? sectionHolding(spec, route.objectId) : null;
    var selectedId = (elsewhere ? null : route.objectId) || ui.selected[route.managerId] || roster.items[0].id;
    if (!roster.items.some(function (i) { return i.id === selectedId; })) selectedId = roster.items[0].id;
    ui.selected[route.managerId] = selectedId;
    root.setAttribute("data-pane", narrow ? (route.objectId ? "detail" : "roster") : "both");

    var side = el("div", "d5-mgr-roster");
    var rh = el("div", "d5-mgr-roster-head");
    rh.appendChild(el("span", null, esc(roster.label)));
    rh.appendChild(el("span", "d5-mgr-roster-count", String(roster.items.length)));
    side.appendChild(rh);

    var list = el("div", "d5-mgr-roster-list d5-scroll");
    roster.items.forEach(function (item) {
      var b = button("d5-obj", null, function () {
        ui.selected[route.managerId] = item.id;
        RT.go({ kind: "manager", managerId: route.managerId, objectId: item.id });
      });
      b.setAttribute("data-pm-object", item.id);
      b.setAttribute("aria-selected", item.id === selectedId ? "true" : "false");
      var body = el("div", "d5-obj-body");
      body.appendChild(el("div", "d5-obj-name", esc(item.name)));
      if (item.secondary) body.appendChild(el("div", "d5-obj-sub", esc(item.secondary)));
      b.appendChild(body);
      if (item.statusWord) {
        var st = el("span", "d5-obj-status", esc(item.statusWord));
        st.setAttribute("data-tone", item.status || "ok");
        b.appendChild(st);
      }
      list.appendChild(b);
    });
    side.appendChild(list);
    mgr.appendChild(side);

    var detail = el("div", "d5-mgr-detail");
    var item = roster.items.filter(function (i) { return i.id === selectedId; })[0];
    if (item) {
      detail.appendChild(el("h3", "d5-mgr-title", esc(item.name)));
      if (item.secondary) detail.appendChild(el("p", "d5-mgr-purpose", esc(item.secondary)));

      /* Subpages, not a wall: the object's own facts first, then everything the
       * manager holds about it as quiet tabs. */
      var tabs = (spec.sections || []).filter(function (s) { return s !== roster; });
      var current = (elsewhere && elsewhere.id) || route.sectionKey || ui.tab[route.managerId] || "overview";
      if (current !== "overview" && !tabs.some(function (t) { return t.id === current; })) current = "overview";
      ui.tab[route.managerId] = current;

      var strip = el("div", "d5-tabs");
      strip.setAttribute("role", "tablist");
      strip.appendChild(tabButton("Overview", current === "overview", function () {
        RT.go({ kind: "manager", managerId: route.managerId, objectId: selectedId, sectionKey: "overview" });
      }));
      tabs.forEach(function (t) {
        strip.appendChild(tabButton(t.label, current === t.id, function () {
          RT.go({ kind: "manager", managerId: route.managerId, objectId: selectedId, sectionKey: t.id });
        }));
      });
      detail.appendChild(strip);

      if (current === "overview") detail.appendChild(objectOverview(item, route.managerId));
      else {
        var section = tabs.filter(function (t) { return t.id === current; })[0];
        if (section) detail.appendChild(renderSpecSection(section, route.managerId));
      }
    }
    mgr.appendChild(detail);
    wrap.appendChild(mgr);
  }

  /* Which section of a manager spec holds a given item id, or null. */
  function sectionHolding(spec, objectId) {
    var found = null;
    (spec.sections || []).forEach(function (s) {
      if (found) return;
      (s.items || []).forEach(function (it) { if (it.id === objectId) found = s; });
    });
    return found;
  }

  function tabButton(label, selected, fn) {
    var b = button("d5-tab", esc(label), fn);
    b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", selected ? "true" : "false");
    return b;
  }

  function objectOverview(item, managerId) {
    var box = el("div");
    if (item.fields && Object.keys(item.fields).length) {
      var dl = el("dl", "d5-fields");
      Object.keys(item.fields).forEach(function (k) {
        dl.appendChild(el("dt", null, esc(k)));
        dl.appendChild(el("dd", null, esc(String(item.fields[k]))));
      });
      box.appendChild(dl);
    }
    if (item.badges && item.badges.length) {
      var tags = el("div", "d5-actions");
      item.badges.forEach(function (b) {
        var t = el("span", "d5-tag", esc(b.text));
        if (b.title) t.title = b.title;
        tags.appendChild(t);
      });
      box.appendChild(tags);
    }
    if (item.editable && item.editable.length) box.appendChild(editableFields(item, managerId));
    if (item.actions && item.actions.length) {
      var acts = el("div", "d5-actions");
      item.actions.forEach(function (a) {
        acts.appendChild(button("d5-btn" + (a.primary ? " d5-btn--primary" : ""), esc(a.label), function () {
          runAction(managerId, a, item);
        }));
      });
      box.appendChild(acts);
    }
    if (!box.childNodes.length) box.appendChild(el("p", "d5-prose", esc(item.name + " has nothing further to configure here.")));
    return box;
  }

  function editableFields(item, managerId) {
    var box = el("div");
    item.editable.forEach(function (f) {
      var row = el("div", "d5-row");
      var main = el("div", "d5-row-main");
      main.appendChild(el("div", "d5-row-title", esc(f.label)));
      if (f.help) main.appendChild(el("p", "d5-row-desc", esc(f.help)));
      row.appendChild(main);

      var ctl = el("div", "d5-row-control");
      var current = store.edit(managerId, item.id, f.key, f.value);
      if (f.secretKind) {
        /* Secret material is never rendered. The reference is shown, and the only
         * action offered is one that replaces it. */
        ctl.appendChild(el("span", "d5-listval", "Stored — never shown"));
        ctl.appendChild(button("d5-btn", "Replace", function () {
          window.PMSim.run({ label: "Replace " + f.label, detail: "Opens the credential entry flow. No existing secret is read or displayed.", realCall: "cmd.provider.connection.authenticate" });
        }));
      } else if (f.kind === "toggle") {
        var t = button("d5-toggle", "", function () {
          store.setEdit(managerId, item.id, f.key, !current);
          MG.invalidate(managerId); render();
        });
        t.setAttribute("role", "switch");
        t.setAttribute("aria-checked", current ? "true" : "false");
        t.setAttribute("aria-label", f.label);
        ctl.appendChild(t);
      } else if (f.kind === "select" && f.options.length) {
        var s = el("select", "d5-select");
        s.setAttribute("aria-label", f.label);
        f.options.forEach(function (o) {
          var op = document.createElement("option");
          op.value = o; op.textContent = o;
          s.appendChild(op);
        });
        s.value = String(current == null ? f.options[0] : current);
        on(s, "change", function () { store.setEdit(managerId, item.id, f.key, s.value); MG.invalidate(managerId); render(); });
        ctl.appendChild(s);
      } else {
        var i = el("input", "d5-input");
        i.type = "text";
        i.value = current == null ? "" : String(current);
        i.setAttribute("aria-label", f.label);
        on(i, "change", function () { store.setEdit(managerId, item.id, f.key, i.value); MG.invalidate(managerId); render(); });
        ctl.appendChild(i);
      }
      row.appendChild(ctl);
      box.appendChild(row);
    });
    return box;
  }

  function renderDocumentManager(wrap, spec, route) {
    root.setAttribute("data-pane", "both");
    (spec.sections || []).forEach(function (section) {
      wrap.appendChild(renderSpecSection(section, route.managerId));
    });
  }

  function renderSpecSection(section, managerId) {
    var box = el("section", "d5-section");
    var head = el("div", "d5-section-head");
    head.appendChild(el("h3", "d5-section-title", esc(section.label)));
    if ((section.items || []).length) head.appendChild(el("span", "d5-section-count", String(section.items.length)));
    box.appendChild(head);
    if (section.summary) box.appendChild(el("p", "d5-row-desc", esc(section.summary)));

    var items = section.items || [];
    if (!items.length) {
      var e = section.empty || {};
      var empty = el("div", "d5-empty");
      empty.appendChild(el("div", "d5-empty-head", esc(e.headline || "Nothing here yet")));
      if (e.detail) empty.appendChild(el("p", null, esc(e.detail)));
      box.appendChild(empty);
      return box;
    }

    if (section.kind === "prose") {
      var prose = el("div", "d5-prose");
      items.forEach(function (i) { prose.appendChild(el("p", null, esc(i.name))); });
      box.appendChild(prose);
      return box;
    }

    if (section.kind === "matrix") {
      var keys = [];
      items.forEach(function (i) {
        Object.keys(i.fields || {}).forEach(function (k) { if (keys.indexOf(k) < 0) keys.push(k); });
      });
      var wrapT = el("div", "d5-tablewrap");
      var table = el("table", "d5-table");
      var thead = el("thead");
      var tr = el("tr");
      tr.appendChild(el("th", null, "Item"));
      keys.forEach(function (k) { tr.appendChild(el("th", null, esc(k))); });
      thead.appendChild(tr);
      table.appendChild(thead);
      var tbody = el("tbody");
      items.forEach(function (i) {
        var r = el("tr");
        r.appendChild(el("td", null, esc(i.name)));
        keys.forEach(function (k) { r.appendChild(el("td", null, esc(String((i.fields || {})[k] == null ? "—" : i.fields[k])))); });
        tbody.appendChild(r);
      });
      table.appendChild(tbody);
      wrapT.appendChild(table);
      box.appendChild(wrapT);
      return box;
    }

    items.forEach(function (item) {
      var row = el("div", "d5-row");
      /* Every item a manager holds is addressable, not just the ones that happen to
       * be in the roster — a search result may point at an installation that lives
       * on a subpage, and it must be able to land on exactly that row. */
      row.setAttribute("data-pm-object", item.id);
      var main = el("div", "d5-row-main");
      var label = el("div", "d5-row-label");
      label.appendChild(el("span", "d5-row-title", esc(item.name)));
      if (item.statusWord) {
        var t = el("span", "d5-tag", esc(item.statusWord));
        t.setAttribute("data-tone", item.status === "attention" ? "changed" : (item.status || "quiet"));
        label.appendChild(t);
      }
      main.appendChild(label);
      if (item.secondary) main.appendChild(el("p", "d5-row-desc", esc(item.secondary)));
      if (item.fields && Object.keys(item.fields).length) {
        var dl = el("dl", "d5-fields");
        Object.keys(item.fields).forEach(function (k) {
          dl.appendChild(el("dt", null, esc(k)));
          dl.appendChild(el("dd", null, esc(String(item.fields[k]))));
        });
        main.appendChild(dl);
      }
      row.appendChild(main);

      var ctl = el("div", "d5-row-control");
      if (item.editable && item.editable.length) {
        row.appendChild(el("div"));
        main.appendChild(editableFields(item, managerId));
      }
      (item.actions || []).forEach(function (a) {
        ctl.appendChild(button("d5-btn" + (a.primary ? " d5-btn--primary" : ""), esc(a.label), function () {
          runAction(managerId, a, item);
        }));
      });
      row.appendChild(ctl);
      box.appendChild(row);
    });
    return box;
  }

  function healthBlock(health) {
    var box = el("div", "d5-health");
    box.innerHTML = icon(health.status === "ok" ? "checkCircle" : "info", 16);
    var body = el("div");
    var word = el("div", "d5-health-word", esc(health.statusWord || health.status || ""));
    word.setAttribute("data-tone", health.status || "ok");
    body.appendChild(word);
    if (health.headline) body.appendChild(el("div", null, esc(health.headline)));
    if (health.detail) body.appendChild(el("p", "d5-health-detail", esc(health.detail)));
    if (health.counts && health.counts.length) {
      var counts = el("div", "d5-health-counts");
      health.counts.forEach(function (c) {
        var cell = el("div");
        cell.appendChild(el("span", "d5-count-k", esc(c.label)));
        cell.appendChild(el("span", "d5-count-v", esc(String(c.value))));
        counts.appendChild(cell);
      });
      body.appendChild(counts);
    }
    box.appendChild(body);
    return box;
  }

  function ownerBlock(owner, managerId) {
    var box = el("div", "d5-owner");
    box.appendChild(el("div", "d5-owner-k", "Owned by"));
    box.appendChild(el("div", null, esc(owner.name)));
    box.appendChild(el("div", "d5-owner-k", "Why it is separate"));
    box.appendChild(el("p", null, esc(owner.why)));
    box.appendChild(el("div", "d5-owner-k", "How it is entered"));
    box.appendChild(el("p", null, esc(owner.insertionContract)));
    box.appendChild(el("div", "d5-owner-k", "How it hands back"));
    box.appendChild(el("p", null, esc(owner.returnContract)));
    var acts = el("div", "d5-actions");
    acts.appendChild(button("d5-btn d5-btn--primary", "Open " + esc(owner.name), function () {
      window.PMSim.run({
        label: "Open " + owner.name,
        detail: owner.returnContract,
        realCall: "cmd.settings.owner.open",
        payload: { owner: owner.name, from: managerId, project: M.project.id }
      });
    }));
    box.appendChild(acts);
    return box;
  }

  function runAction(managerId, action, item) {
    var result = MG.act({ managerId: managerId, project: M.project.id }, action, item ? { objectId: item.id } : null);
    if (!result) {
      window.PMSim.run({ label: action.label, detail: "Simulated in this prototype.", realCall: "cmd.settings.manager.action" });
    }
    shell.announce(action.label + " — a receipt is in the notification inbox.");
  }

  /* ----------------------------------------------------------- all settings */

  function renderAll(wrap, route) {
    var head = el("header", "d5-pagehead");
    head.appendChild(el("h2", "d5-pagehead-title", "All settings"));
    head.appendChild(el("p", "d5-pagehead-purpose",
      "Every setting in " + esc(M.project.name) + ", including the ones that are managed or unavailable on this host."));
    wrap.appendChild(head);

    var box = el("div", "d5-all");
    var facetCol = el("div", "d5-facets");
    var main = el("div", "d5-allmain");

    var filter = {
      domainIds: ui.facets.domains,
      kinds: ui.facets.kinds,
      exposures: ui.facets.exposures,
      changedOnly: ui.facets.changedOnly,
      text: route.facet || "",
      limit: 0
    };
    var result = IX.all(filter);

    var allHead = el("div", "d5-allhead");
    allHead.appendChild(el("span", "d5-allcount", plural(result.total, "match", "matches") + " of " + IX.stats().records + " indexed records"));
    if (ui.facets.domains.length || ui.facets.kinds.length || ui.facets.exposures.length || ui.facets.changedOnly) {
      allHead.appendChild(button("d5-iconbtn", "Clear filters", function () {
        ui.facets = { domains: [], kinds: [], exposures: [], changedOnly: false };
        render();
      }));
    }
    main.appendChild(allHead);

    facetCol.appendChild(facetGroup("Area", result.facets.domains, ui.facets.domains, "domains"));
    facetCol.appendChild(facetGroup("Kind", result.facets.kinds, ui.facets.kinds, "kinds"));
    facetCol.appendChild(facetGroup("Exposure", result.facets.exposures, ui.facets.exposures, "exposures"));

    var changedGroup = el("div", "d5-facet");
    changedGroup.appendChild(el("div", "d5-facet-head", "State"));
    var chg = button("d5-facet-item", "<span>Changed for this Project</span><span class='d5-facet-n'>" + result.facets.changed + "</span>", function () {
      ui.facets.changedOnly = !ui.facets.changedOnly; render();
    });
    chg.setAttribute("aria-pressed", ui.facets.changedOnly ? "true" : "false");
    changedGroup.appendChild(chg);
    facetCol.appendChild(changedGroup);

    /* Virtualized: 828 records plus a 2,400-row stress fixture must not become
     * 3,200 DOM nodes, so only the visible window exists. */
    var listBox = el("div", "d5-alllist d5-scroll");
    var rowHeight = 44;
    /* Scales with the window instead of stopping at 660px. On a tall display the fixed
     * ceiling left most of the page empty under a list of 1,265 records. */
    var viewport = Math.max(320, Math.round(window.innerHeight - 340));

    function paint() {
      var win = window.PMVirtual.windowFor({
        total: result.total, rowHeight: rowHeight,
        viewport: viewport, scrollTop: listBox.scrollTop, overscan: 6, firstPage: 20
      });
      clear(listBox);
      var before = el("div", "d5-vspacer");
      before.style.height = win.before + "px";
      listBox.appendChild(before);
      for (var i = win.start; i < win.end; i++) {
        var rec = result.rows[i];
        if (!rec) continue;
        listBox.appendChild(allRow(rec));
      }
      var after = el("div", "d5-vspacer");
      after.style.height = win.after + "px";
      listBox.appendChild(after);
    }
    listBox.style.height = viewport + "px";
    on(listBox, "scroll", paint);
    main.appendChild(listBox);
    box.appendChild(facetCol);
    box.appendChild(main);
    wrap.appendChild(box);
    paint();
  }

  function allRow(rec) {
    var b = button("d5-allrow", null, function () {
      var r = IX.byId(rec.id);
      if (!r) return;
      ui.pending = { result: r };
      RT.go(destinationRoute(r.destination));
    });
    b.setAttribute("data-pm-result", rec.id);
    var body = el("div", "d5-allrow-body");
    body.appendChild(el("div", "d5-allrow-label", esc(rec.label)));
    body.appendChild(el("div", "d5-allrow-path", esc(rec.path)));
    b.appendChild(body);
    var tag = el("span", "d5-tag d5-allrow-tag", esc(rec.typeLabel || IX.kindLabel(rec.kind)));
    if (rec.changed) tag.setAttribute("data-tone", "changed");
    b.appendChild(tag);
    return b;
  }

  /* The index hands back facets as an ordered array of { id, label, count } — it has
   * already decided the order and the human label, so the concept renders them rather
   * than re-deriving either. */
  function facetGroup(title, facets, selected, key) {
    var g = el("div", "d5-facet");
    g.appendChild(el("div", "d5-facet-head", esc(title)));
    (facets || []).slice(0, 12).forEach(function (f) {
      var b = button("d5-facet-item",
        "<span>" + esc(f.label) + "</span><span class='d5-facet-n'>" + f.count + "</span>",
        function () {
          var list = ui.facets[key];
          var at = list.indexOf(f.id);
          if (at >= 0) list.splice(at, 1); else list.push(f.id);
          render();
        });
      b.setAttribute("aria-pressed", selected.indexOf(f.id) >= 0 ? "true" : "false");
      g.appendChild(b);
    });
    return g;
  }

  /* ------------------------------------------------------------------- copy */

  function renderCopy(wrap, route) {
    var c = ui.copy;
    var head = el("header", "d5-pagehead");
    head.appendChild(el("h2", "d5-pagehead-title", "Copy settings from another Project"));
    head.appendChild(el("p", "d5-pagehead-purpose", CP.independence));
    wrap.appendChild(head);

    var box = el("div", "d5-copy");
    var steps = el("div", "d5-steps");
    ["Choose a source", "Choose what to copy", "Review", "Apply"].forEach(function (label, i) {
      if (i) steps.appendChild(el("span", "d5-step-arrow", icon("chevronRight", 12)));
      var s = el("div", "d5-step");
      s.setAttribute("data-state", (i + 1) === c.step ? "current" : ((i + 1) < c.step ? "done" : "todo"));
      s.appendChild(el("span", "d5-step-n", String(i + 1)));
      s.appendChild(el("span", null, esc(label)));
      steps.appendChild(s);
    });
    box.appendChild(steps);

    if (c.step === 1) copyStepSource(box);
    else if (c.step === 2) copyStepCategories(box);
    else if (c.step === 3) copyStepReview(box);
    else copyStepApply(box);

    var receipts = CP.receipts();
    if (receipts.length) {
      var hist = el("section", "d5-group");
      hist.appendChild(el("div", "d5-secttitle", "Receipts"));
      receipts.forEach(function (r) {
        var row = el("div", "d5-row");
        var main = el("div", "d5-row-main");
        main.appendChild(el("div", "d5-row-title", esc("Copied from " + r.source.name + " · " + r.at)));
        main.appendChild(el("p", "d5-row-desc", esc(
          r.outcome === "applied" ? plural(r.applied, "value") + " applied. Restore point: " + r.restorePoint.label
            : (r.note || "Rolled back."))));
        row.appendChild(main);
        var ctl = el("div", "d5-row-control");
        if (r.canRollback) {
          ctl.appendChild(button("d5-btn", "Roll back", function () {
            CP.rollback(r.id);
            MG.invalidate();
            render();
            shell.announce("The copy was rolled back. This Project is exactly as it was.");
          }));
        } else {
          ctl.appendChild(el("span", "d5-tag", esc(r.outcome === "applied" ? "Applied" : "Rolled back")));
        }
        row.appendChild(ctl);
        hist.appendChild(row);
      });
      box.appendChild(hist);
    }

    wrap.appendChild(box);
  }

  function copyStepSource(box) {
    box.appendChild(el("div", "d5-secttitle", "Which Project should this one copy from?"));
    CP.sources().forEach(function (s) {
      var b = button("d5-src", null, function () {
        ui.copy.source = s.id;
        ui.copy.domains = M.domains.map(function (d) { return d.id; });
        ui.copy.step = 2;
        render();
      });
      b.setAttribute("aria-pressed", ui.copy.source === s.id ? "true" : "false");
      var body = el("div");
      body.appendChild(el("div", "d5-src-name", esc(s.name)));
      body.appendChild(el("div", "d5-src-sub", esc(s.updated + " · " + s.note)));
      b.appendChild(body);
      b.appendChild(el("span", "d5-src-meta", plural(s.settings, "setting")));
      box.appendChild(b);
    });
    box.appendChild(el("p", "d5-note", CP.secretPolicy()));
  }

  function copyStepCategories(box) {
    var chosen = ui.copy.domains || [];
    box.appendChild(el("div", "d5-secttitle", "Which areas should come across?"));
    var grid = el("div", "d5-cats");
    CP.categories().forEach(function (cat) {
      var picked = chosen.indexOf(cat.id) >= 0;
      var b = button("d5-cat", null, function () {
        var at = chosen.indexOf(cat.id);
        if (at >= 0) chosen.splice(at, 1); else chosen.push(cat.id);
        ui.copy.domains = chosen;
        render();
      });
      b.setAttribute("aria-pressed", picked ? "true" : "false");
      b.appendChild(el("span", "d5-cat-box", picked ? icon("check", 11) : ""));
      var body = el("div");
      body.appendChild(el("div", null, esc(cat.title)));
      body.appendChild(el("div", "d5-src-sub", esc(cat.purpose)));
      b.appendChild(body);
      b.appendChild(el("span", "d5-cat-n", String(cat.count)));
      grid.appendChild(b);
    });
    box.appendChild(grid);

    var acts = el("div", "d5-actions");
    acts.appendChild(button("d5-btn", "Back", function () { ui.copy.step = 1; render(); }));
    var next = button("d5-btn d5-btn--primary", "Preview the changes", function () {
      ui.copy.preview = CP.preview(ui.copy.source, chosen);
      ui.copy.step = 3;
      render();
    });
    next.disabled = !chosen.length;
    acts.appendChild(next);
    box.appendChild(acts);
  }

  function copyStepReview(box) {
    var p = ui.copy.preview;
    if (!p) { ui.copy.step = 1; return; }

    var tiles = el("div", "d5-tiles");
    [["Will be added", p.counts.additions], ["Will be replaced", p.counts.replacements],
     ["Already the same", p.counts.unchanged], ["Account references re-pointed", p.counts.references],
     ["Cannot be copied", p.counts.unavailable + p.counts.conflicts]].forEach(function (pair) {
      var t = el("div", "d5-tile");
      t.appendChild(el("div", "d5-tile-v", String(pair[1])));
      t.appendChild(el("div", "d5-tile-k", esc(pair[0])));
      tiles.appendChild(t);
    });
    box.appendChild(tiles);

    box.appendChild(el("div", "d5-secttitle", "What will change"));
    var changes = p.items.filter(function (i) {
      return i.outcome === "addition" || i.outcome === "replacement" || i.outcome === "reference";
    });
    var listBox = el("div", "d5-alllist d5-scroll");
    listBox.style.height = "320px";
    changes.slice(0, 400).forEach(function (item) {
      var row = el("div", "d5-diffrow");
      var lab = el("div", "d5-diff-label");
      lab.appendChild(el("div", null, esc(item.label)));
      lab.appendChild(el("div", "d5-diff-path", esc(item.path)));
      row.appendChild(lab);
      row.appendChild(el("div", "d5-diff-from", esc(String(item.current === "" ? "not set" : item.current))));
      row.appendChild(el("div", "d5-diff-to", esc(String(item.incoming))));
      listBox.appendChild(row);
    });
    box.appendChild(listBox);

    var excluded = el("div", "d5-note");
    excluded.appendChild(el("div", "d5-row-title", "What is not copied"));
    p.excluded.forEach(function (x) {
      excluded.appendChild(el("p", "d5-row-desc", esc(x.label + ": " + x.count + (x.note ? " — " + x.note : ""))));
    });
    box.appendChild(excluded);

    var acts = el("div", "d5-actions");
    acts.appendChild(button("d5-btn", "Back", function () { ui.copy.step = 2; render(); }));
    acts.appendChild(button("d5-btn d5-btn--primary", "Take a restore point and copy", function () {
      ui.copy.run = CP.apply(p);
      ui.copy.step = 4;
      render();
    }));
    box.appendChild(acts);
  }

  function copyStepApply(box) {
    var run = ui.copy.run;
    if (!run) { ui.copy.step = 1; return; }
    var op = run.get();

    box.appendChild(el("div", "d5-secttitle", "Applying"));
    run.steps.forEach(function (phase, i) {
      var row = el("div", "d5-phase");
      row.appendChild(el("span", null, esc(phase)));
      row.appendChild(el("span", "d5-phase-state", esc(op.phase === phase ? window.PMWork.stateWord(op.state) : (i < run.steps.indexOf(op.phase) || op.terminal ? "done" : "waiting"))));
      box.appendChild(row);
    });

    if (op.progress_kind === "fraction" && op.total) {
      var bar = el("div", "d5-progress");
      var fill = el("i");
      fill.style.width = Math.round((op.completed / op.total) * 100) + "%";
      bar.appendChild(fill);
      box.appendChild(bar);
      box.appendChild(el("p", "d5-row-desc", op.completed + " of " + op.total + " values"));
    } else {
      box.appendChild(el("p", "d5-row-desc", esc(window.PMWork.stateWord(op.state) + (op.wait_reason ? " — " + op.wait_reason : ""))));
    }

    var acts = el("div", "d5-actions");
    if (!ui.copy.receipt) {
      acts.appendChild(button("d5-btn d5-btn--primary", "Continue", function () {
        var out = run.next();
        if (out.done) { ui.copy.receipt = out.receipt; MG.invalidate(); }
        render();
      }));
      acts.appendChild(button("d5-btn", "Run the rest", function () {
        var out = run.run();
        ui.copy.receipt = out.receipt;
        MG.invalidate();
        render();
      }));
      acts.appendChild(button("d5-btn", "Cancel", function () {
        run.cancel(); ui.copy = { step: 1, source: null, domains: null, preview: null, run: null, receipt: null }; render();
      }));
    } else {
      var r = ui.copy.receipt;
      var note = el("div", "d5-note");
      note.appendChild(el("div", "d5-row-title", r.outcome === "applied" ? "Copied" : "Rolled back"));
      note.appendChild(el("p", "d5-row-desc", esc(
        r.outcome === "applied"
          ? plural(r.applied, "value") + " were applied to " + M.project.name + ". The restore point taken first is " + r.restorePoint.label + "."
          : r.note)));
      note.appendChild(el("p", "d5-row-desc", esc("The two Projects are independent from here. Nothing in " + r.source.name + " will reach this Project again.")));
      box.appendChild(note);
      acts.appendChild(button("d5-btn", "Done", function () {
        ui.copy = { step: 1, source: null, domains: null, preview: null, run: null, receipt: null };
        RT.go({ kind: "home" });
      }));
      if (r.canRollback) {
        acts.appendChild(button("d5-btn", "Roll back", function () {
          CP.rollback(r.id); MG.invalidate();
          ui.copy = { step: 1, source: null, domains: null, preview: null, run: null, receipt: null };
          render();
        }));
      }
    }
    box.appendChild(acts);
  }

  /* --------------------------------------------------------------- arrivals */

  /* The highlight starts at the row that was landed on, is applied once, and never
   * blinks. Focus moves with it so a keyboard reader is in the same place as the eye. */
  function revealPending() {
    var pending = ui.pending;
    var route = RT.current();
    ui.pending = null;

    var targetId = null;
    if (pending && pending.result) {
      var d = pending.result.destination;
      targetId = d.settingId || d.objectId || d.sectionId || d.managerId;
    } else if (route.settingId) targetId = route.settingId;
    else if (route.objectId) targetId = route.objectId;
    /* `01_CORE_ARCHITECTURE` § Settings Workspace item 3: "The requested
     * subcategory/setting/manager scrolls into view." A section-level link names no
     * row, so without this branch it landed at the top of the page and the group the
     * reader asked for sat a screen and a half below the fold. */
    else if (route.sectionId) targetId = route.sectionId;
    if (!targetId) return;

    var node = stageInner.querySelector('[data-pm-row="' + cssEscape(targetId) + '"]') ||
      stageInner.querySelector('[data-pm-object="' + cssEscape(targetId) + '"]') ||
      stageInner.querySelector('[data-pm-section="' + cssEscape(targetId) + '"]') ||
      stageInner.querySelector('[data-pm-manager="' + cssEscape(targetId) + '"]');
    if (!node) return;

    Array.prototype.forEach.call(stageInner.querySelectorAll("[data-pm-locator]"), function (n) {
      n.removeAttribute("data-pm-locator");
    });
    node.setAttribute("data-pm-locator", "1");
    /* A jump asked for this group: hold the on-page index on it until the reader
     * scrolls, rather than letting the measurement name a neighbour. */
    if (window.PM2Spy && window.PM2Spy.pinNode) window.PM2Spy.pinNode(node);

    /* The scroll is instant, not smoothed. Every arrival follows a full re-render,
     * so a smooth scroll would animate from the top of a page the reader never saw
     * — motion that explains nothing and leaves the row off-screen while it runs.
     * The locator highlight is what carries the explanation here. */
    var box = node.getBoundingClientRect();
    var stageBox = stageEl.getBoundingClientRect();
    var delta = box.top - stageBox.top - Math.max(24, (stageBox.height - box.height) / 3);
    if (Math.abs(delta) > 4) stageEl.scrollTop += delta;

    var focusTarget = node.querySelector("[data-pm-control]") || node;
    if (focusTarget.focus) focusTarget.focus({ preventScroll: true });

    if (pending && pending.result) {
      var via = el("div", "d5-foundvia");
      via.innerHTML = icon("search", 12) + "<span>Found from your search for &ldquo;" + esc(pending.result.query || ui.query) + "&rdquo;</span>";
      if (node.parentNode) node.parentNode.insertBefore(via, node);
    }
    shell.announce("Opened " + (node.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80));
  }

  function cssEscape(v) {
    if (window.CSS && window.CSS.escape) return window.CSS.escape(v);
    return String(v).replace(/([^\w-])/g, "\\$1");
  }

  /* -------------------------------------------------------------- keyboard */

  /* Escape closes the innermost thing and stops at Settings Home. It never closes
   * Settings, because a reader pressing Escape twice should not lose the whole page. */
  function onKeydown(e) {
    if (e.key !== "Escape") return;
    if (ui.dropOpen) { ui.dropOpen = false; render(); e.stopPropagation(); return; }
    if (narrow && ui.railOpen) { ui.railOpen = false; render(); e.stopPropagation(); return; }
    var openDetail = Object.keys(ui.openDetails).filter(function (k) { return ui.openDetails[k]; });
    if (openDetail.length) { ui.openDetails = {}; render(); e.stopPropagation(); return; }
    var route = RT.current();
    if (route.kind === "home") return;
    var back = backTarget(route);
    RT.go(back.dest);
    e.stopPropagation();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
