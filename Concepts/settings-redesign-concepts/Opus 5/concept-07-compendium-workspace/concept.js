/* Opus 5 — Compendium (concept 07).
 *
 * Thesis: Settings is a reference work with a good index. Ordinary browsing reads at
 * a comfortable pace — a welcome page, a calm two-column list of areas, a domain
 * page that goes overview, then key settings, then the managers that live there. And
 * when the reader knows there are eight hundred entries and wants the one they mean,
 * All Settings is not a utility hidden at the bottom of a menu: it sits second in the
 * navigation, immediately under Home, and opens the compendium — chips across the
 * top, a facet column with live counts down the side, and a dense virtualized index
 * in the middle.
 *
 * What this file owns: every pixel. The two rhythms (a 16px reading rhythm on the
 * domain pages, a 32px tabular rhythm in the compendium), the facet cross-fade, the
 * detail that pushes in from the right, the contextual explanation panel that lands
 * beside a searched-for row, and the drawer the facets collapse into when the page
 * gets narrow.
 *
 * What this file does not own: any fact. Domains, pages, sections, the 828 settings,
 * manager specs, search results, routes, the copy transaction and the deterministic
 * state fixtures all come from shared2, which draws nothing.
 *
 * Portability note (Slint 1.17.1): the route is an explicit state machine, the
 * compendium is windowed through PMVirtual, every list has stable ids, and layout is
 * measured only to bring an arrival on screen — never to decide what something means.
 */
(function () {
  "use strict";

  var CONCEPT_ID = "concept-07-compendium-workspace";
  var M = window.PM2Model;
  var IX = window.PM2Index;
  var RT = window.PM2Route;
  var MG = window.PM2Managers;
  var ST = window.PM2States;
  var CP = window.PM2Copy;

  var store = window.PM2Store.create(CONCEPT_ID);
  CP.attach(store);

  var shell = null;
  var root = null;
  var navEl = null;
  var topEl = null;
  var stripEl = null;
  var stageEl = null;
  var pageEl = null;
  var scrimEl = null;

  /* Presentation state. Deliberately not persisted: an open dropdown or a half-open
   * drawer restored after a reload would be a claim about the reader's attention
   * that the reader never made. */
  var ui = {
    query: "",
    results: null,
    dropOpen: false,
    activeResult: -1,
    navOpen: false,          /* the navigation drawer at narrow widths */
    facetsOpen: false,       /* the facet drawer at narrow widths */
    chips: { changed: false, advanced: false, managers: false, diagnostics: false },
    facets: { domains: [], kinds: [], exposures: [], states: [] },
    sort: "path",
    compScroll: 0,
    openDetails: {},         /* settingId -> true */
    openDeeper: {},          /* sectionId -> true */
    tab: {},                 /* managerId -> subpage key */
    selected: {},            /* managerId -> objectId */
    errors: {},              /* settingId -> message */
    copy: { step: 1, source: null, domains: null, preview: null, run: null, receipt: null },
    pending: null            /* the arrival to explain after the next paint */
  };

  var narrow = false;
  var lastFixture = null;
  /* True while the concept writes the route for its own bookkeeping rather than to
   * navigate. Re-rendering there would rebuild the search field under the caret. */
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

  function num(n) { return "<span class='c7-num'>" + esc(String(n)) + "</span>"; }

  function cssEscape(v) {
    if (window.CSS && window.CSS.escape) return window.CSS.escape(v);
    return String(v).replace(/([^\w-])/g, "\\$1");
  }

  function valueWord(v) {
    if (v === true) return "On";
    if (v === false) return "Off";
    if (v == null || v === "") return "Not set";
    if (Object.prototype.toString.call(v) === "[object Array]") {
      return v.length ? v.length + " entries" : "Nothing set";
    }
    return String(v);
  }

  function exposureWord(e) {
    for (var i = 0; i < M.EXPOSURE.length; i++) if (M.EXPOSURE[i].id === e) return M.EXPOSURE[i].label;
    return "Advanced";
  }

  function kindWord(kind) {
    switch (kind) {
      case "toggle": return "On or off";
      case "select": return "One of a list";
      case "radio": return "One of a list";
      case "number": return "Number";
      case "slider": return "Number on a scale";
      case "text": return "Text";
      case "path": return "Location on this computer";
      case "list": return "List of entries";
      case "multiselect": return "Several from a list";
      case "keyvalue": return "Named values";
      case "action": return "Something you run";
      default: return "Setting";
    }
  }

  function sourceWord(state) {
    if (!state) return "the product default";
    switch (state.source) {
      case "custom": return state.isDefault ? "the product default" : "a change made in this Project";
      case "recommended": return "the recommended value for this Project";
      case "auto": return "what this computer reports";
      case "managed": return "a policy that controls it here";
      case "unavailable": return "nothing — this host cannot provide it";
      case "notConfigured": return "nowhere yet: no value has been set";
      default: return "the product default";
    }
  }

  /* Every navigation this concept makes keeps the demonstration fixture in the
   * route. Without this a deep link into a named situation would quietly drop back
   * to the normal Project the moment the reader pressed anything, and the screen
   * would stop matching the link that produced it. */
  function withFixture(dest) {
    var fixture = ST.active();
    return RT.withState(dest, fixture === "normal" ? null : fixture);
  }

  function go(dest, opts) { return RT.go(withFixture(dest), opts); }
  function replaceRoute(dest) { return RT.replace(withFixture(dest)); }

  /* The state a manager spec is built against. The fixture travels with it, so an
   * offline provider roster is genuinely offline inside the spec rather than being
   * repainted offline afterwards by the concept. */
  function specState() {
    var s = store.get();
    var out = {};
    for (var k in s) if (Object.prototype.hasOwnProperty.call(s, k)) out[k] = s[k];
    var fixture = ST.active();
    out.demoState = fixture;
    out.stateId = fixture;
    out.fixtureId = fixture;
    return out;
  }

  function managerDomain(managerId) {
    var f = M.familyOf(managerId);
    return f ? f.domainId : null;
  }

  function archetypeWord(a) {
    if (a === "resource roster and detail sheet") return "List and detail";
    if (a === "inventory catalogue") return "Catalogue";
    if (a === "read-only health projection") return "Read only";
    if (a === "preview and confirmation transaction") return "Preview and confirm";
    if (a === "setup or repair sequence") return "Set up and repair";
    if (a === "diagnostic drawer") return "Diagnostics";
    if (a === "named owner insertion point") return "Separate owner";
    return "Preferences";
  }

  /* ---------------------------------------------------------------- the shell */

  function boot() {
    shell = window.PMShell.mount({
      rootId: "pm-root",
      concept: "Compendium · a reference work with a good index",
      conceptId: CONCEPT_ID,
      theme: document.documentElement.getAttribute("data-theme") || "friendly-dark",
      defaultTheme: "friendly-dark",
      onLayout: measure,
      onWidthMode: function () { measure(); render(); }
    });
    /* The shell's own Demo state select and Reset belong to the fixture list of
     * concepts 01-04. This concept ships its own, so the stale pair is removed
     * rather than left offering situations it does not implement. */
    PM2States.removeShellControl(shell);


    root = el("div", "c7");
    root.setAttribute("data-concept", CONCEPT_ID);

    navEl = el("aside", "c7-nav");
    navEl.setAttribute("aria-label", "Settings navigation");

    var doc = el("div", "c7-doc");
    topEl = el("header", "c7-top");
    stripEl = el("div", "c7-strip");
    stageEl = el("div", "c7-stage c7-scroll");
    pageEl = el("div", "c7-page");
    stageEl.appendChild(pageEl);

    doc.appendChild(topEl);
    doc.appendChild(stripEl);
    doc.appendChild(stageEl);

    scrimEl = el("div", "c7-scrim");
    scrimEl.hidden = true;
    on(scrimEl, "click", function () { ui.navOpen = false; ui.facetsOpen = false; render(); });

    root.appendChild(navEl);
    root.appendChild(doc);
    root.appendChild(scrimEl);
    shell.main.appendChild(root);

    document.addEventListener("keydown", onKeydown, true);
    on(stageEl, "scroll", function () {
      if (RT.current().kind === "all") ui.compScroll = stageEl.scrollTop;
    });

    RT.onChange(function () {
      if (quiet) return;
      ui.dropOpen = false;
      render();
    });
    window.addEventListener("pm-concept-state-applied", function () { measure(); render(); });

    measure();
    applyFixtureQuery();
    render();
  }

  /* Width mode is presentation, derived at explicit checkpoints. Below 900px of
   * usable width the navigation and the facet column both become drawers, and the
   * manager detail becomes a page that pushes over the list. */
  function measure() {
    var w = (shell && shell.main ? shell.main.clientWidth : window.innerWidth) || window.innerWidth;
    var next = w < 900;
    if (next !== narrow) {
      narrow = next;
      if (!narrow) { ui.navOpen = false; ui.facetsOpen = false; }
    }
    if (!root) return;
    root.setAttribute("data-narrow", narrow ? "true" : "false");
    root.setAttribute("data-nav", ui.navOpen ? "open" : "closed");
    root.setAttribute("data-facets", ui.facetsOpen ? "open" : "closed");
    if (scrimEl) scrimEl.hidden = !(narrow && (ui.navOpen || ui.facetsOpen));
  }

  /* --------------------------------------------------------------- the router */

  function render() {
    if (window.PM2Spy) window.PM2Spy.release();
    var route = RT.current();
    var check = RT.resolve(route);

    /* A fixture reached by deep link rather than by the control still has to take
     * effect, so the forced query is applied here and not only on change. */
    var fixture = ST.active();
    if (fixture !== lastFixture) {
      lastFixture = fixture;
      MG.invalidate();
      applyFixtureQuery();
    }
    if (route.kind === "query" && route.query != null) ui.query = route.query;

    measure();
    renderNav(route);
    renderTop(route);
    renderStrip();

    clear(pageEl);
    pageEl.removeAttribute("data-pm-manager");
    /* The page itself can carry the arrival marker when a link named a whole
     * manager. Clearing the children is not enough: a marker left on the page
     * would shadow the next row the reader lands on. */
    pageEl.removeAttribute("data-pm-locator");

    if (ST.active() !== "normal") pageEl.appendChild(fixtureLine());

    if (!check.ok) {
      pageEl.setAttribute("data-pm-surface", "notice");
      pageEl.setAttribute("data-rhythm", "calm");
      pageEl.appendChild(brokenLink(check));
      renderHome(route);
      revealPending();
      return;
    }

    var kind = route.kind;
    if (kind === "home" || kind === "query") {
      pageEl.setAttribute("data-pm-surface", kind === "query" ? "search" : "home");
      pageEl.setAttribute("data-rhythm", "calm");
      renderHome(route);
    } else if (kind === "domain") {
      pageEl.setAttribute("data-rhythm", "calm");
      if (route.pageId) {
        pageEl.setAttribute("data-pm-surface", "page");
        renderPage(route);
      } else {
        pageEl.setAttribute("data-pm-surface", "domain");
        renderDomain(route);
      }
    } else if (kind === "manager") {
      pageEl.setAttribute("data-pm-surface", "manager");
      pageEl.setAttribute("data-pm-manager", route.managerId);
      pageEl.setAttribute("data-rhythm", "calm");
      renderManagerSurface(route);
    } else if (kind === "all") {
      pageEl.setAttribute("data-pm-surface", "all");
      pageEl.setAttribute("data-rhythm", "dense");
      renderCompendium(route);
    } else if (kind === "copy") {
      pageEl.setAttribute("data-pm-surface", "copy");
      pageEl.setAttribute("data-rhythm", "calm");
      renderCopy(route);
    }

    revealPending();
  }

  /* Which deterministic situation is on screen, stated inside the Settings surface
   * so a screenshot is self-describing and nobody has to guess why a roster is
   * empty or a value is locked. */
  function fixtureLine() {
    var f = ST.activeFixture();
    var box = el("div", "c7-fixture");
    box.innerHTML = icon("beaker", 13) +
      "<span><b>" + esc(f.label) + "</b> — " + esc(f.note) + "</span>";
    return box;
  }

  function brokenLink(check) {
    var box = el("div", "c7-linknotice");
    box.appendChild(el("div", "c7-notice-head", esc(check.code === "malformed"
      ? "That link is not a Settings location"
      : "That link names something this Project does not have")));
    box.appendChild(el("p", "c7-notice-detail", esc(check.reason || "")));
    var quoted = el("p", "c7-notice-detail");
    quoted.innerHTML = "The link was <code>" + esc(check.quoted || window.location.hash) + "</code>. Settings Home is below.";
    box.appendChild(quoted);
    return box;
  }

  /* ---------------------------------------------------------------- the index */

  /* The left navigation is the compendium's table of contents: Home, then All
   * Settings as a first-class destination immediately under it, then the twelve
   * areas, then the one transaction that is not an area. */
  function renderNav(route) {
    clear(navEl);

    var head = el("div", "c7-nav-head");
    head.appendChild(el("div", "c7-nav-eyebrow", "Puppet Master Settings"));
    var project = el("div", "c7-nav-project", esc(M.project.name));
    project.setAttribute("data-pm-project", "");
    head.appendChild(project);
    head.appendChild(el("div", "c7-nav-path", esc(M.project.kind + " · " + M.project.path)));
    navEl.appendChild(head);

    var list = el("nav", "c7-nav-list c7-scroll");

    var home = navItem("map", "Home", null, function () { go({ kind: "home" }); });
    if (route.kind === "home" || route.kind === "query") home.setAttribute("aria-current", "true");
    list.appendChild(home);

    /* Second, and deliberately not at the bottom with the utilities: the index IS
     * the way through a reference work of this size. */
    var all = navItem("book", "All Settings", String(M.counts.settings), function () { go({ kind: "all" }); });
    all.classList.add("c7-nav-item--strong");
    if (route.kind === "all") all.setAttribute("aria-current", "true");
    list.appendChild(all);

    list.appendChild(el("div", "c7-nav-label", "Areas"));
    M.domains.forEach(function (d) {
      var b = navItem(d.icon, d.title, String(d.count), function () {
        go({ kind: "domain", domainId: d.id });
        ui.navOpen = false;
      });
      b.setAttribute("data-pm-domain", d.id);
      if (route.domainId === d.id && route.kind !== "all") b.setAttribute("aria-current", "true");
      list.appendChild(b);
    });

    list.appendChild(el("div", "c7-nav-label", "Transactions"));
    var copy = navItem("download", "Copy from another Project", null, function () {
      go({ kind: "copy", step: "source" });
      ui.navOpen = false;
    });
    if (route.kind === "copy") copy.setAttribute("aria-current", "true");
    list.appendChild(copy);

    navEl.appendChild(list);

    var foot = el("div", "c7-nav-foot");
    foot.appendChild(el("span", null, M.counts.settings + " entries · " + M.counts.pages + " pages · " + M.counts.sections + " groups"));
    navEl.appendChild(foot);
  }

  function navItem(iconName, label, count, fn) {
    var b = button("c7-nav-item",
      icon(iconName, 15) + "<span class='c7-nav-item-label'>" + esc(label) + "</span>" +
      (count ? "<span class='c7-nav-item-count'>" + esc(count) + "</span>" : ""), fn);
    return b;
  }

  /* ------------------------------------------------------------------ the top */

  function renderTop(route) {
    clear(topEl);

    if (narrow) {
      var toggle = button("c7-ghost c7-navtoggle", icon("panelLeft", 14) + "<span>Contents</span>", function () {
        ui.navOpen = !ui.navOpen;
        render();
      });
      toggle.setAttribute("aria-expanded", ui.navOpen ? "true" : "false");
      topEl.appendChild(toggle);
    }

    var back = backTarget(route);
    var backBtn = button("c7-ghost", icon("chevronLeft", 14) + "<span>Back to " + esc(back.label) + "</span>", function () {
      go(back.dest);
    });
    backBtn.setAttribute("data-pm-back", "");
    backBtn.hidden = route.kind === "home" || route.kind === "query";
    topEl.appendChild(backBtn);

    var crumbs = el("nav", "c7-crumbs");
    crumbs.setAttribute("data-pm-breadcrumb", "");
    crumbs.setAttribute("aria-label", "Breadcrumb");
    trail(route).forEach(function (step, i, arr) {
      if (i) crumbs.appendChild(el("span", "c7-crumb-sep", "›"));
      var b = button("c7-crumb", esc(step.label), step.dest ? function () { go(step.dest); } : null);
      if (i === arr.length - 1) b.setAttribute("aria-current", "page");
      crumbs.appendChild(b);
    });
    topEl.appendChild(crumbs);

    topEl.appendChild(el("div", "c7-top-spacer"));

    /* Exactly one search field exists at a time: the welcome page owns it, and the
     * top bar owns it everywhere else. Two would make "the search field" ambiguous. */
    if (route.kind !== "home" && route.kind !== "query") topEl.appendChild(searchField("bar"));

    var close = button("c7-ghost c7-close", icon("ban", 14) + "<span>Close Settings</span>", function () {
      shell.announce("Close Settings would return to the surface that opened Settings.");
      window.PMSim.run({
        label: "Close Settings",
        detail: "Returns to the surface that opened Settings — in this prototype the shell stays put.",
        realCall: "cmd.settings.close"
      });
    });
    close.setAttribute("data-pm-close", "");
    topEl.appendChild(close);
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
    if (route.kind === "manager") {
      if (narrow && route.objectId) {
        return { label: (MG.record(route.managerId) || {}).title || "the list",
          dest: { kind: "manager", managerId: route.managerId } };
      }
      var d = managerDomain(route.managerId);
      var dom = d ? M.domain(d) : null;
      if (dom) return { label: dom.title, dest: { kind: "domain", domainId: dom.id } };
    }
    return { label: "Settings Home", dest: { kind: "home" } };
  }

  function trail(route) {
    var out = [{ label: "Settings", dest: { kind: "home" } }];
    if (route.kind === "all") out.push({ label: "All Settings", dest: null });
    if (route.kind === "copy") out.push({ label: "Copy from another Project", dest: null });
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
      if (route.objectId) out.push({ label: objectLabel(route.managerId, route.objectId), dest: null });
    }
    return out;
  }

  /* The name of a selected object, read from the spec of a manager that is already
   * open. Never called while searching: search must not hydrate a manager. */
  var objectNames = {};
  function objectLabel(managerId, objectId) {
    var key = managerId + "/" + objectId;
    if (objectNames[key]) return objectNames[key];
    var found = null;
    if (MG.has(managerId)) {
      var spec = MG.spec(managerId, store.get());
      var hit = findObject(spec, objectId);
      if (hit) found = hit.item.name;
    }
    objectNames[key] = found || objectId;
    return objectNames[key];
  }

  /* --------------------------------------------------------- state fixtures */

  function renderStrip() {
    clear(stripEl);
    var active = ST.activeFixture();

    var lab = el("label", "c7-strip-label", "Demonstration state");
    lab.setAttribute("for", "c7-state-select");
    stripEl.appendChild(lab);

    var sel = el("select", "c7-select c7-strip-select");
    sel.id = "c7-state-select";
    sel.setAttribute("data-pm-state-control", "");
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
      objectNames = {};
      withoutRender(function () { RT.replace(dest); });
      applyFixtureQuery();
      render();
      shell.announce("Demonstration state: " + sel.options[sel.selectedIndex].textContent);
    });
    stripEl.appendChild(sel);

    var c7note = el("span", "c7-strip-note", esc(active.note));
    c7note.title = active.note;
    stripEl.appendChild(c7note);

    var reset = button("c7-ghost c7-strip-reset", icon("undo", 13) + "<span>Reset this concept</span>", function () {
      store.reset();
      MG.invalidate();
      objectNames = {};
      ui.openDetails = {}; ui.openDeeper = {}; ui.errors = {};
      ui.copy = { step: 1, source: null, domains: null, preview: null, run: null, receipt: null };
      render();
      shell.announce("Every change made in this concept was cleared.");
    });
    stripEl.appendChild(reset);
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
    var wrap = el("div", "c7-searchwrap c7-searchwrap--" + where);
    var field = el("div", "c7-searchfield");
    field.innerHTML = icon("search", where === "hero" ? 17 : 14);

    var input = document.createElement("input");
    input.type = "text";
    input.spellcheck = false;
    input.autocomplete = "off";
    input.placeholder = where === "hero"
      ? "Search every setting, manager, resource and action"
      : "Search settings";
    input.setAttribute("data-pm-search-field", "");
    input.setAttribute("aria-label", "Search all settings");
    input.value = ui.query;
    field.appendChild(input);

    if (ui.query) {
      field.appendChild(button("c7-searchclear", icon("ban", 13), function () {
        ui.query = ""; ui.results = null; ui.dropOpen = false;
        withoutRender(function () { replaceRoute({ kind: "home" }); });
        render();
      }));
    }
    wrap.appendChild(field);

    var drop = el("div", "c7-drop");
    drop.setAttribute("data-pm-search-dropdown", "");
    drop.hidden = !(ui.dropOpen && ui.results);
    wrap.appendChild(drop);
    if (!drop.hidden) fillDropdown(drop);

    on(input, "input", function () {
      ui.query = input.value;
      ui.activeResult = -1;
      if (!ui.query.replace(/^\s+|\s+$/g, "")) {
        ui.results = null; ui.dropOpen = false;
        drop.hidden = true;
        withoutRender(function () { replaceRoute({ kind: "home" }); });
        return;
      }
      ui.results = IX.query(ui.query, { limit: 40 });
      ui.dropOpen = true;
      drop.hidden = false;
      fillDropdown(drop);
      /* The query lives in the route, so Back from a chosen result returns to the
       * search the reader actually performed rather than to a blank page. */
      withoutRender(function () { replaceRoute({ kind: "query", query: ui.query }); });
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
      var empty = el("div", "c7-drop-empty");
      empty.innerHTML = "Nothing in the compendium matches <b>" + esc(ui.query) + "</b>.";
      empty.appendChild(el("p", "c7-drop-hint",
        "Try a shorter word. The index covers all " + M.counts.settings +
        " entries in this Project, including the ones that are managed or unavailable here."));
      drop.appendChild(empty);
      return;
    }

    var scroll = el("div", "c7-drop-scroll c7-scroll");
    var index = 0;
    res.groups.forEach(function (group) {
      var g = el("div", "c7-drop-group");
      g.appendChild(el("div", "c7-drop-label", esc(group.label)));
      group.results.forEach(function (r) {
        var my = index++;
        var b = button("c7-result" + (my === ui.activeResult ? " is-active" : ""), null,
          function () { chooseResult(r.id); });
        b.setAttribute("data-pm-result", r.id);
        var top = el("div", "c7-result-top");
        top.appendChild(el("span", "c7-result-label", esc(r.label)));
        top.appendChild(el("span", "c7-result-type", esc(r.typeLabel)));
        b.appendChild(top);
        b.appendChild(el("div", "c7-result-path", esc(r.path)));
        if (r.availability) b.appendChild(el("div", "c7-result-avail", esc(r.availability)));
        g.appendChild(b);
      });
      scroll.appendChild(g);
    });
    drop.appendChild(scroll);

    var foot = el("div", "c7-drop-foot");
    foot.appendChild(el("span", null, esc(res.shown + " of " + res.total + " entries")));
    if (res.truncated) {
      foot.appendChild(button("c7-drop-more", "Open the compendium for “" + esc(ui.query) + "”", function () {
        ui.dropOpen = false;
        go({ kind: "all", facet: ui.query });
      }));
    }
    drop.appendChild(foot);
  }

  /* Routing is only ever done from the immutable result id. The rendered list is a
   * view of the index; its order is never an address. */
  function chooseResult(resultId) {
    var result = IX.byId(resultId);
    if (!result) return;
    ui.dropOpen = false;
    withoutRender(function () { replaceRoute({ kind: "query", query: ui.query, resultId: resultId }); });
    ui.pending = { result: result, query: ui.query };
    go(destinationRoute(result.destination));
  }

  function destinationRoute(d) {
    if (!d) return { kind: "home" };
    if (d.managerId) {
      return { kind: "manager", managerId: d.managerId, objectId: d.objectId || null,
        sectionKey: d.sectionKey || null, rowId: d.rowId || null };
    }
    return { kind: "domain", domainId: d.domainId, pageId: d.pageId,
      sectionId: d.sectionId, settingId: d.settingId };
  }

  /* ------------------------------------------------------------------- home */

  function renderHome(route) {
    var fx = ST.effects();

    var hero = el("section", "c7-welcome");
    hero.appendChild(el("h2", "c7-welcome-title", "Welcome to Project Settings"));
    hero.appendChild(el("p", "c7-welcome-sub",
      "Search the compendium or browse by area. Everything here applies to " +
      esc(M.project.name) + " and to nothing else."));
    hero.appendChild(searchField("hero"));
    pageEl.appendChild(hero);

    var notice = ST.notice();
    if (notice && !store.isDismissed(notice.id)) pageEl.appendChild(renderNotice(notice));

    var attention = ST.attentionFlat().filter(function (a) { return !store.isDismissed(a.id); });
    if (attention.length || fx.noAttention) pageEl.appendChild(renderAttention(attention, fx));

    var browse = el("section", "c7-block");
    var bh = el("div", "c7-block-head");
    bh.appendChild(el("h3", "c7-block-title", "Browse by area"));
    bh.appendChild(el("span", "c7-block-meta",
      M.counts.domains + " areas · " + M.counts.settings + " entries"));
    browse.appendChild(bh);

    var grid = el("div", "c7-areagrid");
    M.domains.forEach(function (d) {
      var b = button("c7-area", null, function () { go({ kind: "domain", domainId: d.id }); });
      b.setAttribute("data-pm-domain", d.id);
      b.appendChild(el("span", "c7-area-ico", icon(d.icon, 16)));
      var body = el("div", "c7-area-body");
      body.appendChild(el("div", "c7-area-title", esc(d.title)));
      body.appendChild(el("div", "c7-area-purpose", esc(d.purpose)));
      b.appendChild(body);
      var meta = el("span", "c7-area-count");
      meta.innerHTML = num(d.count);
      b.appendChild(meta);
      b.appendChild(el("span", "c7-area-chev", icon("chevronRight", 13)));
      grid.appendChild(b);
    });
    browse.appendChild(grid);
    pageEl.appendChild(browse);

    pageEl.appendChild(renderRecent(fx));
  }

  function renderNotice(notice) {
    var box = el("div", "c7-notice");
    box.setAttribute("data-tone", notice.tone || "info");
    box.appendChild(el("span", "c7-notice-ico", icon(notice.tone === "attention" ? "alert" : "info", 15)));
    var body = el("div", "c7-notice-body");
    body.appendChild(el("div", "c7-notice-head", esc(notice.headline)));
    body.appendChild(el("p", "c7-notice-detail", esc(notice.detail)));
    box.appendChild(body);
    var acts = el("div", "c7-notice-act");
    if (notice.action) {
      acts.appendChild(button("c7-btn c7-btn--primary", esc(notice.action.label), function () {
        go(destinationRoute(notice.action.destination));
      }));
    }
    var dismiss = button("c7-ghost c7-iconOnly", icon("ban", 13), function () {
      store.dismiss(notice.id); render();
    });
    dismiss.setAttribute("aria-label", "Dismiss this notice");
    acts.appendChild(dismiss);
    box.appendChild(acts);
    return box;
  }

  function renderAttention(items, fx) {
    var box = el("section", "c7-attention");
    var head = el("div", "c7-attention-head");
    head.appendChild(el("span", "c7-attention-title", "Notices"));
    if (items.length) head.appendChild(el("span", "c7-attention-count", String(items.length)));
    box.appendChild(head);

    if (!items.length) {
      box.appendChild(el("p", "c7-attention-empty", fx.noAttention
        ? "Nothing is configured yet, so nothing is broken. AI Brains & Providers is the usual first stop."
        : "Nothing needs attention in this Project right now."));
      return box;
    }
    items.forEach(function (a) {
      /* `01_CORE_ARCHITECTURE` § Notices: three separated runs. What is broken, what
       * is half-finished and what is only advice are read differently, and one toned
       * list makes an unfinished setup look like a fault. */
      if (a.groupLabel) box.appendChild(el("div", "c7-attn-group", esc(a.groupLabel)));
      var b = button("c7-attn", null, function () { go(destinationRoute(a.destination)); });
      var dot = el("span", "c7-attn-dot");
      dot.setAttribute("data-tone", a.tone);
      b.appendChild(dot);
      var body = el("div", "c7-attn-body");
      body.appendChild(el("div", "c7-attn-label", esc(a.label)));
      body.appendChild(el("div", "c7-attn-detail", esc(a.detail)));
      b.appendChild(body);
      b.appendChild(el("span", "c7-attn-act", esc(a.actionLabel)));
      box.appendChild(b);
    });
    return box;
  }

  /* The small block at the foot of the welcome page: what this Project has actually
   * changed, newest first, bounded. It reads the inventory and the reader's own
   * edits — it never opens a manager to find out. */
  function recentChanges(limit) {
    var out = [];
    var seen = {};
    var values = store.get().values || {};
    Object.keys(values).forEach(function (id) {
      if (out.length >= limit) return;
      var rec = M.setting(id);
      if (!rec || seen[id]) return;
      seen[id] = true;
      out.push({ rec: rec, when: "Just now, in this session" });
    });
    var settings = M.settings;
    for (var i = 0; i < settings.length && out.length < limit; i++) {
      var s = settings[i];
      if (seen[s.id]) continue;
      if (s.state && s.state.source === "custom" && s.state.isDefault === false) {
        seen[s.id] = true;
        out.push({ rec: s, when: s.state.changedAt || "Earlier in this Project" });
      }
    }
    return out;
  }

  function renderRecent(fx) {
    var box = el("section", "c7-block c7-recent");
    var head = el("div", "c7-block-head");
    head.appendChild(el("h3", "c7-block-title", "Recently changed"));
    head.appendChild(button("c7-link", "See every change", function () {
      ui.chips = { changed: true, advanced: false, managers: false, diagnostics: false };
      ui.facets = { domains: [], kinds: [], exposures: [], states: [] };
      go({ kind: "all" });
    }));
    box.appendChild(head);

    var items = fx.emptyRosters ? [] : recentChanges(4);
    if (!items.length) {
      box.appendChild(el("p", "c7-recent-empty",
        "Nothing in this Project has been changed from its default yet."));
      return box;
    }
    items.forEach(function (entry) {
      var rec = entry.rec;
      var b = button("c7-recentrow", null, function () {
        go({ kind: "domain", domainId: rec.domainId, pageId: rec.pageId,
          sectionId: rec.sectionId, settingId: rec.id });
      });
      b.appendChild(el("span", "c7-recentrow-ico", icon("history", 13)));
      var body = el("div", "c7-recentrow-body");
      body.appendChild(el("div", "c7-recentrow-label", esc(rec.label)));
      body.appendChild(el("div", "c7-recentrow-path",
        esc((M.domain(rec.domainId) || {}).title + " › " + (M.page(rec.pageId) || {}).title)));
      b.appendChild(body);
      b.appendChild(el("span", "c7-recentrow-when", esc(entry.when)));
      box.appendChild(b);
    });
    return box;
  }

  /* --------------------------------------------------------------- arrivals */

  /* The compendium's answer to "how do I know this is the row I asked for": the row
   * takes a quiet locator outline, and an explanation panel lands beside it saying
   * what the setting controls, where its value came from, and that it was reached
   * from a search rather than by browsing. */
  function revealPending() {
    var pending = ui.pending;
    var route = RT.current();
    ui.pending = null;

    var targetId = null;
    if (pending && pending.result && pending.result.destination) {
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

    var sel = cssEscape(targetId);
    var node = pageEl.querySelector('[data-pm-row="' + sel + '"]') ||
      pageEl.querySelector('[data-pm-object="' + sel + '"]') ||
      pageEl.querySelector('[data-pm-section="' + sel + '"]') ||
      (pageEl.getAttribute("data-pm-manager") === targetId ? pageEl : null);
    if (!node) return;

    pageEl.removeAttribute("data-pm-locator");
    var previous = pageEl.querySelectorAll("[data-pm-locator]");
    for (var i = 0; i < previous.length; i++) previous[i].removeAttribute("data-pm-locator");
    node.setAttribute("data-pm-locator", "1");
    /* A jump asked for this group: hold the on-page index on it until the reader
     * scrolls, rather than letting the measurement name a neighbour. */
    if (window.PM2Spy && window.PM2Spy.pinNode) window.PM2Spy.pinNode(node);

    var record = route.settingId ? M.setting(route.settingId) : null;
    if (node.getAttribute("data-pm-row")) {
      attachExplanation(node, record || M.setting(node.getAttribute("data-pm-row")), pending);
    } else {
      var panel = explanationPanel(null, pending, node);
      /* A whole manager, or an item in a roster too narrow to read beside: the
       * panel goes at the head of the pane the reader is actually looking at. */
      var detail = pageEl.querySelector(".c7-detail");
      if (node === pageEl) node.insertBefore(panel, node.firstChild);
      else if (detail) detail.insertBefore(panel, detail.firstChild);
      else if (node.parentNode) node.parentNode.insertBefore(panel, node);
    }

    /* Instant, never smoothed. Every arrival follows a full re-render, so a smooth
     * scroll would animate away from a page the reader never saw and leave the row
     * off screen while it ran. */
    var box = node.getBoundingClientRect();
    var stageBox = stageEl.getBoundingClientRect();
    var delta = box.top - stageBox.top - Math.max(24, (stageBox.height - box.height) / 3);
    if (Math.abs(delta) > 4) stageEl.scrollTop += delta;

    var focusTarget = node.querySelector("[data-pm-control]") || node;
    if (focusTarget.focus) focusTarget.focus({ preventScroll: true });
    shell.announce("Opened " + (node.textContent || "").replace(/\s+/g, " ").replace(/^\s+/, "").slice(0, 80));
  }

  /* The panel sits beside the row at a comfortable width and under it when the page
   * is narrow. The row keeps its own identity: it is moved, not rebuilt. */
  function attachExplanation(row, record, pending) {
    var parent = row.parentNode;
    if (!parent) return;
    var wrap = el("div", "c7-arrivalwrap");
    parent.insertBefore(wrap, row);
    wrap.appendChild(row);
    var panel = explanationPanel(record, pending, row);
    if (panel) wrap.appendChild(panel);
  }

  function explanationPanel(record, pending, node) {
    var panel = el("aside", "c7-arrival");
    panel.appendChild(el("div", "c7-arrival-eyebrow", "What you landed on"));
    if (record) {
      panel.appendChild(el("div", "c7-arrival-title", esc(record.label)));
      panel.appendChild(el("p", "c7-arrival-desc", esc(record.desc)));
      var state = ST.rowState(record);
      var dl = el("dl", "c7-meta");
      metaPair(dl, "Controls", kindWord(record.kind));
      metaPair(dl, "Default", valueWord(state && state.defaultValue));
      metaPair(dl, "Value came from", sourceWord(state));
      panel.appendChild(dl);
    } else if (pending && pending.result) {
      panel.appendChild(el("div", "c7-arrival-title", esc(pending.result.label)));
      if (pending.result.desc) panel.appendChild(el("p", "c7-arrival-desc", esc(pending.result.desc)));
      panel.appendChild(el("p", "c7-arrival-desc", esc(pending.result.path)));
    } else {
      panel.appendChild(el("div", "c7-arrival-title", "The link you followed"));
      panel.appendChild(el("p", "c7-arrival-desc",
        "This is the exact entry the link named. Its neighbours are the rest of the group it belongs to."));
    }

    var via = el("div", "c7-arrival-via");
    if (pending && pending.result) {
      via.innerHTML = icon("search", 12) + "<span>Reached from your search for “" +
        esc(pending.query || ui.query) + "”, not by browsing.</span>";
    } else {
      via.innerHTML = icon("link", 12) + "<span>Reached from a direct link to this entry.</span>";
    }
    panel.appendChild(via);
    return panel;
  }

  function metaPair(dl, k, v) {
    dl.appendChild(el("dt", null, esc(k)));
    dl.appendChild(el("dd", null, esc(v)));
  }

  /* -------------------------------------------------------------- keyboard */

  /* Escape closes the innermost thing and stops at Settings Home. It never closes
   * Settings: pressing Escape twice should not lose the whole page. */
  function onKeydown(e) {
    if (e.key !== "Escape") return;
    if (ui.dropOpen) { ui.dropOpen = false; render(); e.stopPropagation(); return; }
    if (narrow && (ui.navOpen || ui.facetsOpen)) {
      ui.navOpen = false; ui.facetsOpen = false; render(); e.stopPropagation(); return;
    }
    var open = Object.keys(ui.openDetails).filter(function (k) { return ui.openDetails[k]; });
    if (open.length) { ui.openDetails = {}; render(); e.stopPropagation(); return; }
    var route = RT.current();
    if (route.kind === "home") return;
    go(backTarget(route).dest);
    e.stopPropagation();
  }

  /* ----------------------------------------------------------------- domain */

  /* A domain page reads in the order a reference work uses: what this area is and
   * what it currently amounts to, then the entries most people came for, then the
   * pages that hold the rest, then the managers that live here. */
  function renderDomain(route) {
    var d = M.domain(route.domainId);
    if (!d) return;

    var head = el("header", "c7-head");
    head.appendChild(el("h2", "c7-head-title", esc(d.title)));
    head.appendChild(el("p", "c7-head-purpose", esc(d.purpose)));
    var acts = el("div", "c7-head-acts");
    acts.appendChild(button("c7-ghost", icon("book", 13) + "<span>Open this area in the compendium</span>", function () {
      ui.chips = { changed: false, advanced: false, managers: false, diagnostics: false };
      ui.facets = { domains: [d.id], kinds: [], exposures: [], states: [] };
      go({ kind: "all" });
    }));
    head.appendChild(acts);
    pageEl.appendChild(head);

    /* Overview: the handful of values that answer "how is this area set up right
     * now", read straight off the inventory rather than summarised by hand. */
    var overview = M.rowsInPage(d.pages[0] ? d.pages[0].id : "").filter(function (r) {
      return M.exposureRank(r.exposure) === 0 && r.kind !== "action";
    }).slice(0, 4);
    if (overview.length) {
      var ov = block("Overview", plural(d.count, "entry", "entries") + " in this area");
      var tiles = el("div", "c7-tiles");
      overview.forEach(function (rec) {
        var state = ST.rowState(rec);
        var value = store.valueOf(rec.id);
        if (value === undefined) value = state ? state.value : "";
        var tile = button("c7-tile", null, function () { goToRow(rec); });
        tile.appendChild(el("div", "c7-tile-k", esc(rec.label)));
        tile.appendChild(el("div", "c7-tile-v", esc(valueWord(value))));
        var word = el("div", "c7-tile-s", esc(M.stateLabel(state)));
        word.setAttribute("data-tone", M.stateTone(state));
        tile.appendChild(word);
        tiles.appendChild(tile);
      });
      ov.appendChild(tiles);
      pageEl.appendChild(ov);
    }

    var curated = [];
    d.pages.forEach(function (p) {
      M.rowsInPage(p.id).forEach(function (r) {
        if (curated.length < 6 && M.exposureRank(r.exposure) === 0 && (r.curated || r.recommended != null)) curated.push(r);
      });
    });
    if (curated.length < 4) {
      d.pages.forEach(function (p) {
        M.rowsInPage(p.id).forEach(function (r) {
          if (curated.length < 6 && M.exposureRank(r.exposure) === 0 && curated.indexOf(r) < 0) curated.push(r);
        });
      });
    }
    if (curated.length) {
      var key = block("Key settings", null);
      var list = el("div", "c7-keylist");
      curated.forEach(function (rec) {
        var state = ST.rowState(rec);
        var value = store.valueOf(rec.id);
        if (value === undefined) value = state ? state.value : "";
        var b = button("c7-keyrow", null, function () { goToRow(rec); });
        var body = el("div", "c7-keyrow-body");
        body.appendChild(el("div", "c7-keyrow-label", esc(rec.label)));
        body.appendChild(el("div", "c7-keyrow-desc", esc(rec.desc)));
        b.appendChild(body);
        b.appendChild(el("span", "c7-keyrow-value", esc(valueWord(value))));
        b.appendChild(el("span", "c7-keyrow-chev", icon("chevronRight", 13)));
        list.appendChild(b);
      });
      key.appendChild(list);
      var more = button("c7-link c7-keymore", "Show all " + plural(d.count, "setting") + " in the compendium", function () {
        ui.chips = { changed: false, advanced: false, managers: false, diagnostics: false };
        ui.facets = { domains: [d.id], kinds: [], exposures: [], states: [] };
        go({ kind: "all" });
      });
      key.appendChild(more);
      pageEl.appendChild(key);
    }

    var pages = block("Pages in this area", plural(d.pages.length, "page"));
    d.pages.forEach(function (p) {
      var b = button("c7-dest", null, function () {
        go({ kind: "domain", domainId: d.id, pageId: p.id });
      });
      b.setAttribute("data-pm-page", p.id);
      b.appendChild(el("span", "c7-dest-ico", icon("fileText", 14)));
      var body = el("div", "c7-dest-body");
      body.appendChild(el("div", "c7-dest-title", esc(p.title)));
      body.appendChild(el("div", "c7-dest-sub", esc(p.summary)));
      b.appendChild(body);
      var meta = el("span", "c7-dest-meta");
      meta.innerHTML = num(p.count) + " entries";
      b.appendChild(meta);
      b.appendChild(el("span", "c7-dest-chev", icon("chevronRight", 13)));
      pages.appendChild(b);
    });
    pageEl.appendChild(pages);

    if (d.families.length) {
      var mgrs = block("Related managers", plural(d.families.length, "manager"));
      d.families.forEach(function (f) {
        mgrs.appendChild(managerLink(f));
      });
      pageEl.appendChild(mgrs);
    }
  }

  function block(title, meta) {
    var box = el("section", "c7-block");
    var head = el("div", "c7-block-head");
    head.appendChild(el("h3", "c7-block-title", esc(title)));
    if (meta) head.appendChild(el("span", "c7-block-meta", esc(meta)));
    box.appendChild(head);
    return box;
  }

  function managerLink(family) {
    var rec = MG.record(family.managerId) || {};
    var b = button("c7-dest", null, function () {
      go({ kind: "manager", managerId: family.managerId });
    });
    b.setAttribute("data-pm-manager", family.managerId);
    b.appendChild(el("span", "c7-dest-ico", icon(rec.icon || "sliders", 14)));
    var body = el("div", "c7-dest-body");
    body.appendChild(el("div", "c7-dest-title", esc(rec.title || family.family)));
    body.appendChild(el("div", "c7-dest-sub", esc(rec.purpose || family.family)));
    b.appendChild(body);
    b.appendChild(el("span", "c7-dest-meta",
      esc(family.deferred ? "Owned by " + family.owner : archetypeWord(family.archetype))));
    b.appendChild(el("span", "c7-dest-chev", icon("chevronRight", 13)));
    return b;
  }

  function goToRow(rec) {
    go({ kind: "domain", domainId: rec.domainId, pageId: rec.pageId,
      sectionId: rec.sectionId, settingId: rec.id });
  }

  /* ------------------------------------------------------------------- page */

  function renderPage(route) {
    var d = M.domain(route.domainId);
    var p = M.page(route.pageId);
    if (!d || !p) return;

    var head = el("header", "c7-head");
    head.appendChild(el("h2", "c7-head-title", esc(p.title)));
    head.appendChild(el("p", "c7-head-purpose", esc(p.summary)));
    head.appendChild(el("div", "c7-head-counts",
      plural(p.count, "entry", "entries") + " in " + plural(p.sections.length, "group")));
    pageEl.appendChild(head);

    /* A deep link to an advanced row has to open the disclosure that holds it.
     * Landing on a collapsed group would be a link that lies. */
    if (route.settingId) {
      var target = M.setting(route.settingId);
      if (target) ui.openDeeper[target.sectionId] = true;
    }

    /* An index of this page's own groups that follows the scroll, not only the click.
     * `01_CORE_ARCHITECTURE` item 4 and the navigation video both ask for the highlight
     * to move as the reader scrolls; an index that only responds to clicks can say
     * where you asked to go but never where you are. */
    var __idx = el("nav", "c7-onpage");
    __idx.setAttribute("aria-label", "On this page");
    __idx.appendChild(el("span", "c7-onpage-label", "On this page"));
    var __built = [];
    p.sections.forEach(function (section) {
      var __b = document.createElement("button");
      __b.type = "button";
      __b.className = "c7-onpage-item";
      __b.textContent = section.title;
      __b.setAttribute("data-onpage", section.id);
      __b.addEventListener("click", function () {
        var el2 = document.querySelector('[data-pm-section="' + section.id.replace(/"/g, '\\"') + '"]');
        if (el2 && el2.scrollIntoView) el2.scrollIntoView({ block: "start" });
      });
      __idx.appendChild(__b);
    });
    if (p.sections.length > 1) pageEl.appendChild(__idx);

    p.sections.forEach(function (section) {
      var __node = renderSection(section);
      pageEl.appendChild(__node);
      __built.push({ id: section.id, title: section.title, pageId: p.id, el: __node });
    });

    /* Deferred one frame: at this point the surface is still being assembled and is not
     * yet in the document, so walking up from a section would find no scrolling ancestor
     * and silently fall back to the page body — which is why the highlight never moved. */
    if (window.PM2Spy && __built.length) window.requestAnimationFrame(function () {
      var __scroller = pageEl;
      while (__scroller && __scroller !== document.body) {
        var __cs = getComputedStyle(__scroller);
        if (/auto|scroll/.test(__cs.overflowY)) break;
        __scroller = __scroller.parentElement;
      }
      window.PM2Spy.bind({
        from: __built[0].el,
        scroller: null,
        sections: __built,
        inset: 96,
        onActive: function (id) {
          var items = __idx.querySelectorAll("[data-onpage]");
          for (var i = 0; i < items.length; i++) {
            items[i].setAttribute("aria-current", items[i].getAttribute("data-onpage") === id ? "true" : "false");
          }
        }
      });
    });
  }

  function renderSection(section) {
    var box = el("section", "c7-section");
    box.setAttribute("data-pm-section", section.id);

    var head = el("div", "c7-section-head");
    head.appendChild(el("h3", "c7-section-title", esc(section.title)));
    var count = el("span", "c7-section-count");
    count.innerHTML = num(section.count) + " entries";
    head.appendChild(count);
    box.appendChild(head);

    var rows = M.rowsInSection(section.id);
    var standard = [];
    var deeper = [];
    rows.forEach(function (r) {
      if (M.exposureRank(r.exposure) === 0) standard.push(r); else deeper.push(r);
    });

    standard.forEach(function (r) { box.appendChild(renderRow(r)); });

    if (deeper.length) {
      var open = !!ui.openDeeper[section.id];
      if (open) deeper.forEach(function (r) { box.appendChild(renderRow(r)); });
      var toggle = button("c7-disclose",
        icon(open ? "chevronUp" : "chevronDown", 12) + "<span>" +
        (open ? "Hide" : "Show") + " " + plural(deeper.length, "further entry", "further entries") + "</span>",
        function () { ui.openDeeper[section.id] = !open; render(); });
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      box.appendChild(toggle);
    }
    return box;
  }

  function renderRow(rec) {
    var state = ST.rowState(rec);
    var row = el("div", "c7-row");
    row.setAttribute("data-pm-row", rec.id);
    row.tabIndex = -1;
    var editable = M.isEditable(state);
    if (!editable) row.setAttribute("data-locked", "true");

    var main = el("div", "c7-row-main");
    var label = el("div", "c7-row-label");
    label.appendChild(el("span", "c7-row-title", esc(rec.label)));

    var tone = M.stateTone(state);
    if (tone !== "quiet") {
      label.appendChild(tag(M.stateLabel(state), tone));
    } else if (store.changed(rec.id)) {
      label.appendChild(tag("Changed", "changed"));
    }
    if (state && state.restart === "required") label.appendChild(tag("Restart", "setup"));
    if (M.exposureRank(rec.exposure) > 0) label.appendChild(tag(exposureWord(rec.exposure), "quiet"));
    main.appendChild(label);
    main.appendChild(el("p", "c7-row-desc", esc(rec.desc)));

    var reason = M.stateReason(state);
    var openDet = !!ui.openDetails[rec.id];
    main.appendChild(button("c7-why", openDet ? "Hide details" : "Why this value?", function () {
      ui.openDetails[rec.id] = !openDet;
      render();
    }));
    if (openDet) main.appendChild(rowDetails(rec, state, reason));
    if (ui.errors[rec.id]) main.appendChild(el("div", "c7-err", esc(ui.errors[rec.id])));

    row.appendChild(main);
    row.appendChild(renderControl(rec, state, editable));
    return row;
  }

  function tag(text, tone) {
    var t = el("span", "c7-tag", esc(text));
    t.setAttribute("data-tone", tone || "quiet");
    return t;
  }

  /* The metadata block the compendium promises: what it does, its default, its
   * type, and where the value actually came from. It lives behind a disclosure so
   * an ordinary row stays one line of explanation. */
  function rowDetails(rec, state, reason) {
    var box = el("div", "c7-details");
    if (reason) box.appendChild(el("p", "c7-details-reason", esc(reason)));
    var dl = el("dl", "c7-meta c7-meta--wide");
    metaPair(dl, "About this setting", rec.desc);
    metaPair(dl, "Type", kindWord(rec.kind));
    metaPair(dl, "Default", valueWord(state && state.defaultValue));
    if (rec.recommended != null && rec.recommended !== "") metaPair(dl, "Recommended", valueWord(rec.recommended));
    metaPair(dl, "Value came from", sourceWord(state));
    metaPair(dl, "Applies to", M.project.name + " — this Project only");
    metaPair(dl, "Shown at", exposureWord(rec.exposure));
    if (state && state.restart === "required") metaPair(dl, "Takes effect", "after the next restart");
    if (state && state.managedBy) metaPair(dl, "Controlled by", state.managedBy);
    if (rec.badges && rec.badges.length) metaPair(dl, "Also known as", rec.badges.join(", "));
    metaPair(dl, "Entry", rec.id);
    box.appendChild(dl);
    return box;
  }

  /* Controls do real work: every change lands in the store, which is what makes the
   * Changed chip, the recently-changed block and the copy preview truthful rather
   * than decorative. */

  /* The Puppet Master Model/Mode selector idiom: a trigger carrying the current value,
   * and a menu that hangs beneath it — or flips above when the row sits near the bottom
   * of the page, which is what the model picker in the bottom bar does. Placement,
   * layering and one-layer-at-a-time Escape come from PM2Menu; every pixel is this
   * concept's own. */
  function pmPicker(rec, options, value, onPick) {
    var wrap = el("div", "c7-picker");
    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "c7-picker-trigger";
    trigger.setAttribute("data-pm-control", rec.id);
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", rec.label);
    var valueEl = document.createElement("span");
    valueEl.className = "c7-picker-value";
    valueEl.textContent = String(value === "" || value == null ? "Not set" : value);
    trigger.appendChild(valueEl);
    var chev = document.createElement("span");
    chev.className = "c7-picker-chev";
    chev.innerHTML = window.PMIcons.icon("chevronDown", 13);
    trigger.appendChild(chev);
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
        if (i === active && rows[i].focus) rows[i].focus({ preventScroll: false });
      }
    }

    function choose(v) {
      window.PM2Menu.closeAll();
      onPick(v === "Not set" ? "" : v);
    }

    /* One option row. The check mark is the only thing saying "this is the current
     * value" — a menu that decorates every row stops telling you anything. */
    function optionRow(o, i) {
      var row = document.createElement("button");
      row.type = "button";
      row.className = "c7-menu-item";
      row.setAttribute("role", "option");
      row.setAttribute("data-opt", String(i));
      row.setAttribute("aria-selected", o === value ? "true" : "false");
      var mark = document.createElement("span");
      mark.className = "c7-menu-check";
      mark.innerHTML = o === value ? window.PMIcons.icon("check", 12) : "";
      row.appendChild(mark);
      var lab = document.createElement("span");
      lab.className = "c7-menu-label";
      lab.textContent = String(o);
      row.appendChild(lab);
      row.addEventListener("click", function () { choose(o); });
      return row;
    }

    /* A submenu parent. `07_THEME_MOTION_RESPONSIVE_AND_SLINT` asks for the Model/Mode
     * selector family including submenus: the second level opens BESIDE the panel on its
     * own layer, so the first level stays visible and Escape closes the second only. */
    function groupRow(g, i) {
      var row = document.createElement("button");
      row.type = "button";
      row.className = "c7-menu-item is-parent";
      row.setAttribute("role", "option");
      row.setAttribute("data-opt", String(i));
      row.setAttribute("aria-haspopup", "menu");
      row.setAttribute("aria-expanded", "false");
      var mark = document.createElement("span");
      mark.className = "c7-menu-check";
      mark.innerHTML = g.options.indexOf(value) >= 0 ? window.PMIcons.icon("check", 12) : "";
      row.appendChild(mark);
      var lab = document.createElement("span");
      lab.className = "c7-menu-label";
      lab.textContent = String(g.label);
      row.appendChild(lab);
      var more = document.createElement("span");
      more.className = "c7-menu-more";
      more.innerHTML = window.PMIcons.icon("chevronRight", 12);
      row.appendChild(more);

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
          if (z === subActive && rows[z].focus) rows[z].focus({ preventScroll: false });
        }
      }

      function openSub() {
        if (sub) return;
        sub = document.createElement("div");
        sub.className = "c7-menu c7-submenu";
        sub.setAttribute("role", "listbox");
        g.options.forEach(function (o, k) { sub.appendChild(optionRow(o, k)); });

        sub.addEventListener("keydown", function (e) {
          if (e.key === "ArrowLeft") {
            /* Left goes back one level rather than out of the menu entirely. */
            e.preventDefault(); e.stopPropagation();
            window.PM2Menu.closeTop();
            if (row.focus) row.focus({ preventScroll: true });
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

      row.addEventListener("click", function (e) {
        e.stopPropagation();
        if (sub) window.PM2Menu.closeTop(); else openSub();
      });
      row.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
          e.preventDefault(); e.stopPropagation();
          openSub();
        }
      });
      return row;
    }

    trigger.addEventListener("click", function () {
      if (panel) { window.PM2Menu.closeAll(); return; }
      panel = document.createElement("div");
      panel.className = "c7-menu";
      panel.setAttribute("role", "listbox");

      var groups = window.PM2Menu.groupsFor(rec.id, options);
      top = groups || options;
      if (groups) groups.forEach(function (g, i) { panel.appendChild(groupRow(g, i)); });
      else options.forEach(function (o, i) { panel.appendChild(optionRow(o, i)); });

      panel.addEventListener("keydown", function (e) {
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
      var pb = panel.getBoundingClientRect();
      var spot = window.PM2Menu.place(
        { left: a.left, right: a.right, top: a.top, bottom: a.bottom, width: a.width },
        { width: Math.max(pb.width, a.width), height: pb.height },
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
    });

    return wrap;
  }

  function renderControl(rec, state, editable) {
    var box = el("div", "c7-row-control");
    var value = store.valueOf(rec.id);
    if (value === undefined) value = state ? state.value : "";

    function commit(next) {
      store.setValue(rec.id, next);
      delete ui.errors[rec.id];
      MG.invalidate();
      render();
    }

    if (!editable) {
      var locked = el("span", "c7-locked");
      locked.innerHTML = icon(state.source === "unavailable" ? "ban" : "lock", 12) +
        "<span>" + esc(state.source === "unavailable" ? "Not available here" : valueWord(value)) + "</span>";
      box.appendChild(locked);
      return box;
    }

    if (rec.kind === "toggle") {
      var t = button("c7-toggle", "", function () { commit(!value); });
      t.setAttribute("role", "switch");
      t.setAttribute("aria-checked", value ? "true" : "false");
      t.setAttribute("aria-label", rec.label);
      t.setAttribute("data-pm-control", rec.id);
      box.appendChild(t);
      return box;
    }

    if (rec.kind === "select" || rec.kind === "radio" || rec.kind === "multiselect") {
      var opts = (rec.options || []).slice();
      if (!opts.length) opts = [String(value)];
      if (state && state.source === "notConfigured") opts = ["Not set"].concat(opts);
      box.appendChild(pmPicker(rec, opts, value, commit));
      return box;
    }

    if (rec.kind === "number") {
      var n = el("input", "c7-input c7-input--num");
      n.type = "number";
      n.value = value === "" || value == null ? "" : String(value);
      n.setAttribute("data-pm-control", rec.id);
      n.setAttribute("aria-label", rec.label);
      on(n, "change", function () {
        var v = Number(n.value);
        if (n.value === "" || isNaN(v)) {
          ui.errors[rec.id] = "That needs to be a number. The previous value is still in use.";
          render();
          return;
        }
        if (ST.effects().validationError && v < 0) {
          ui.errors[rec.id] = "This cannot be negative. Nothing was saved, and what you typed was kept.";
          render();
          return;
        }
        commit(v);
      });
      box.appendChild(n);
      return box;
    }

    if (rec.kind === "slider") {
      var r = el("input", "c7-range");
      r.type = "range";
      r.min = "0";
      r.max = String(Math.max(100, Number(state && state.defaultValue) * 2 || 100));
      r.value = String(Number(value) || 0);
      r.setAttribute("data-pm-control", rec.id);
      r.setAttribute("aria-label", rec.label);
      var out = el("span", "c7-rangeval", esc(String(value)));
      on(r, "input", function () { out.textContent = r.value; });
      on(r, "change", function () { commit(Number(r.value)); });
      box.appendChild(r);
      box.appendChild(out);
      return box;
    }

    if (rec.kind === "text" || rec.kind === "path") {
      var i = el("input", "c7-input");
      i.type = "text";
      i.value = value == null ? "" : String(value);
      i.placeholder = state && state.source === "notConfigured" ? "Not set" : "";
      i.setAttribute("data-pm-control", rec.id);
      i.setAttribute("aria-label", rec.label);
      if (rec.kind === "text" && window.PMSpellcheck && window.PMSpellcheck.attach) {
        window.PMSpellcheck.attach(i);
      }
      on(i, "change", function () {
        if (ST.effects().validationError && rec.kind === "path" && i.value && i.value.charAt(0) !== "/" && i.value.charAt(0) !== "~") {
          ui.errors[rec.id] = "That is not a location this computer can reach. What you typed was kept.";
          render();
          return;
        }
        commit(i.value);
      });
      box.appendChild(i);
      return box;
    }

    if (rec.kind === "action") {
      var a = button("c7-btn", esc((state && state.setupLabel) || "Run"), function () {
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

    /* list / keyvalue: a summary plus an editor, so a page of these never becomes a
     * wall of text areas. */
    var entries = Object.prototype.toString.call(value) === "[object Array]"
      ? value : (value ? [String(value)] : []);
    box.appendChild(el("span", "c7-listval" + (entries.length ? "" : " is-empty"),
      entries.length
        ? esc(entries.slice(0, 2).join(", ") + (entries.length > 2 ? " +" + (entries.length - 2) + " more" : ""))
        : "Nothing set"));
    var edit = button("c7-btn", "Edit", function () {
      var next = window.prompt("One entry per line — " + rec.label, entries.join("\n"));
      if (next == null) return;
      commit(next.split("\n").map(function (x) { return x.replace(/^\s+|\s+$/g, ""); })
        .filter(function (x) { return !!x; }));
    });
    edit.setAttribute("data-pm-control", rec.id);
    box.appendChild(edit);
    return box;
  }

  function runAction(managerId, action, item) {
    var result = MG.act({ managerId: managerId, project: M.project.id }, action,
      item ? { objectId: item.id } : null);
    if (!result) {
      window.PMSim.run({
        label: action.label,
        detail: "Simulated in this prototype.",
        realCall: "cmd.settings.manager.action"
      });
    }
    shell.announce(action.label + " — a receipt is in the notification inbox.");
  }

  /* ------------------------------------------------------------- compendium */

  /* The index. Chips across the top for the four questions people actually arrive
   * with, a facet column with live counts down the side, and a dense virtualized
   * list between them. Never an 828-row DOM dump: only the visible window exists,
   * and at the 3,200-record scale fixture that is still only the visible window. */

  function chipKinds() {
    var out = ui.facets.kinds.slice();
    function add(k) { if (out.indexOf(k) < 0) out.push(k); }
    if (ui.chips.managers) { add("manager"); add("object"); }
    if (ui.chips.diagnostics) add("diagnostic");
    return out;
  }

  function chipExposures() {
    var out = ui.facets.exposures.slice();
    if (ui.chips.advanced) {
      if (out.indexOf("advanced") < 0) out.push("advanced");
      if (out.indexOf("expert") < 0) out.push("expert");
    }
    return out;
  }

  function anyFilter() {
    return ui.chips.changed || ui.chips.advanced || ui.chips.managers || ui.chips.diagnostics ||
      ui.facets.domains.length || ui.facets.kinds.length ||
      ui.facets.exposures.length || ui.facets.states.length;
  }

  function clearFilters() {
    ui.chips = { changed: false, advanced: false, managers: false, diagnostics: false };
    ui.facets = { domains: [], kinds: [], exposures: [], states: [] };
  }

  function compFilter(text, omit, limit) {
    var f = { text: text || "", limit: limit == null ? 1 : limit, sort: ui.sort };
    f.domainIds = omit === "domains" ? [] : ui.facets.domains;
    f.kinds = omit === "kinds" ? [] : chipKinds();
    f.exposures = omit === "exposures" ? [] : chipExposures();
    f.states = omit === "states" ? [] : ui.facets.states;
    f.changedOnly = omit === "changed" ? false : ui.chips.changed;
    return f;
  }

  function renderCompendium(route) {
    var text = route.facet || "";

    var head = el("header", "c7-head c7-comphead");
    var titleRow = el("div", "c7-comphead-row");
    titleRow.appendChild(el("h2", "c7-head-title", "All Settings"));
    titleRow.appendChild(el("div", "c7-comphead-spacer"));

    var sortWrap = el("label", "c7-sort");
    sortWrap.appendChild(el("span", null, "Sort"));
    var sort = el("select", "c7-select c7-sort-select");
    [["path", "By area"], ["label", "By name"], ["kind", "By record type"], ["changed", "Changed first"]]
      .forEach(function (pair) {
        var o = document.createElement("option");
        o.value = pair[0]; o.textContent = pair[1];
        sort.appendChild(o);
      });
    sort.value = ui.sort;
    on(sort, "change", function () { ui.sort = sort.value; render(); });
    sortWrap.appendChild(sort);
    titleRow.appendChild(sortWrap);
    head.appendChild(titleRow);
    head.appendChild(el("p", "c7-head-purpose",
      "A complete, searchable compendium of every entry in " + esc(M.project.name) +
      ", including the ones a policy controls and the ones this host cannot provide."));
    pageEl.appendChild(head);

    /* The list result. limit 0 asks the index for every match; the DOM still only
     * ever holds the window that is on screen. */
    var result = IX.all(compFilter(text, null, 0));
    var base = IX.all({ text: text, limit: 1 });

    var chipRow = el("div", "c7-chips");
    chipRow.appendChild(chip("Changed from default", countIn(base.facets.changed), ui.chips.changed, function () {
      ui.chips.changed = !ui.chips.changed; render();
    }));
    chipRow.appendChild(chip("Advanced", facetCount(base.facets.exposures, ["advanced", "expert"]), ui.chips.advanced, function () {
      ui.chips.advanced = !ui.chips.advanced; render();
    }));
    chipRow.appendChild(chip("Managers", facetCount(base.facets.kinds, ["manager", "object"]), ui.chips.managers, function () {
      ui.chips.managers = !ui.chips.managers; render();
    }));
    chipRow.appendChild(chip("Diagnostics", facetCount(base.facets.kinds, ["diagnostic"]), ui.chips.diagnostics, function () {
      ui.chips.diagnostics = !ui.chips.diagnostics; render();
    }));

    if (text) {
      var textChip = chip("Matching “" + text + "”", null, true, function () {
        go({ kind: "all" });
      });
      textChip.classList.add("c7-chip--text");
      chipRow.appendChild(textChip);
    }
    chipRow.appendChild(el("div", "c7-chips-spacer"));
    if (narrow) {
      var drawerBtn = button("c7-ghost", icon("filter", 13) + "<span>Facets</span>", function () {
        ui.facetsOpen = !ui.facetsOpen; render();
      });
      drawerBtn.setAttribute("aria-expanded", ui.facetsOpen ? "true" : "false");
      chipRow.appendChild(drawerBtn);
    }
    if (anyFilter()) {
      chipRow.appendChild(button("c7-ghost", "Clear facets", function () { clearFilters(); render(); }));
    }
    pageEl.appendChild(chipRow);

    var body = el("div", "c7-comp");
    body.setAttribute("data-facets", ui.facetsOpen ? "open" : "closed");

    /* Facet counts stay live: each column is counted with every OTHER selection
     * applied, so the numbers say what would happen if this one were added rather
     * than what would happen in an empty compendium. */
    var domainFacets = ui.facets.domains.length
      ? IX.all(compFilter(text, "domains")).facets.domains : result.facets.domains;
    var kindFacets = (ui.facets.kinds.length || ui.chips.managers || ui.chips.diagnostics)
      ? IX.all(compFilter(text, "kinds")).facets.kinds : result.facets.kinds;
    var stateFacets = ui.facets.states.length
      ? IX.all(compFilter(text, "states")).facets.states : result.facets.states;

    var col = el("aside", "c7-facets");
    col.setAttribute("aria-label", "Facets");
    col.appendChild(el("div", "c7-facets-head", "Filter by"));
    col.appendChild(facetGroup("Category", domainFacets, ui.facets.domains, "domains"));
    col.appendChild(facetGroup("Setting type", kindFacets, ui.facets.kinds, "kinds"));
    col.appendChild(facetGroup("Status", stateFacets, ui.facets.states, "states"));
    body.appendChild(col);

    if (narrow && ui.facetsOpen) {
      var fscrim = el("div", "c7-facetscrim");
      on(fscrim, "click", function () { ui.facetsOpen = false; render(); });
      body.appendChild(fscrim);
    }

    var main = el("div", "c7-compmain");
    var bar = el("div", "c7-compbar");
    var count = el("span", "c7-compcount");
    count.innerHTML = num(result.total) + " of " + num(base.total) + " entries";
    bar.appendChild(count);
    bar.appendChild(el("span", "c7-compbar-note",
      result.total === base.total ? "No facet applied" : "Narrowed by the facets on the left"));
    main.appendChild(bar);

    var listBox = el("div", "c7-complist c7-scroll");
    var rowHeight = 32;
    var stageH = stageEl.clientHeight || 640;
    var viewport = Math.max(280, Math.min(760, stageH - 250));
    listBox.style.height = viewport + "px";

    if (!result.total) {
      var empty = el("div", "c7-compempty");
      empty.appendChild(el("div", "c7-compempty-head", "Nothing in the compendium matches these facets"));
      empty.appendChild(el("p", "c7-compempty-detail",
        "Every entry is still here — the facets on the left have narrowed the index to none. Clear one and the list comes back."));
      if (anyFilter()) {
        empty.appendChild(button("c7-btn", "Clear the facets", function () { clearFilters(); render(); }));
      }
      listBox.appendChild(empty);
    } else {
      paintList(listBox, result, rowHeight, viewport);
      on(listBox, "scroll", function () {
        ui.compScroll = listBox.scrollTop;
        paintList(listBox, result, rowHeight, viewport);
      });
      listBox.scrollTop = ui.compScroll;
      if (listBox.scrollTop !== ui.compScroll) ui.compScroll = listBox.scrollTop;
      paintList(listBox, result, rowHeight, viewport);
    }
    main.appendChild(listBox);

    var foot = el("div", "c7-compfoot");
    foot.appendChild(el("span", null,
      "Rows are drawn only while they are on screen. The index itself holds " +
      IX.stats().records + " records."));
    main.appendChild(foot);

    body.appendChild(main);
    pageEl.appendChild(body);
  }

  function countIn(v) { return typeof v === "number" ? v : 0; }

  function facetCount(list, ids) {
    var total = 0;
    (list || []).forEach(function (f) { if (ids.indexOf(f.id) >= 0) total += f.count; });
    return total;
  }

  function chip(label, count, active, fn) {
    var b = button("c7-chip",
      "<span>" + esc(label) + "</span>" + (count == null ? "" : "<span class='c7-chip-n'>" + esc(String(count)) + "</span>"),
      fn);
    b.setAttribute("aria-pressed", active ? "true" : "false");
    return b;
  }

  function facetGroup(title, entries, selected, key) {
    var g = el("div", "c7-facet");
    g.appendChild(el("div", "c7-facet-head", esc(title)));
    var listed = (entries || []).slice(0, 14);
    if (!listed.length) {
      g.appendChild(el("div", "c7-facet-none", "Nothing left to narrow by here"));
      return g;
    }
    listed.forEach(function (f) {
      var b = button("c7-facet-item",
        "<span class='c7-facet-label'>" + esc(f.label) + "</span>" +
        "<span class='c7-facet-n'>" + esc(String(f.count)) + "</span>",
        function () {
          var list = ui.facets[key];
          var at = list.indexOf(f.id);
          if (at >= 0) list.splice(at, 1); else list.push(f.id);
          ui.compScroll = 0;
          render();
        });
      b.setAttribute("aria-pressed", selected.indexOf(f.id) >= 0 ? "true" : "false");
      g.appendChild(b);
    });
    return g;
  }

  function paintList(listBox, result, rowHeight, viewport) {
    var win = window.PMVirtual.windowFor({
      total: result.total, rowHeight: rowHeight, viewport: viewport,
      scrollTop: listBox.scrollTop, overscan: 6, firstPage: 24
    });
    clear(listBox);
    var before = el("div", "c7-vspace");
    before.style.height = win.before + "px";
    listBox.appendChild(before);
    for (var i = win.start; i < win.end; i++) {
      var rec = result.rows[i];
      if (!rec) continue;
      listBox.appendChild(compRow(rec));
    }
    var after = el("div", "c7-vspace");
    after.style.height = win.after + "px";
    listBox.appendChild(after);
  }

  function compRow(rec) {
    var b = button("c7-crow", null, function () {
      var r = IX.byId(rec.id);
      if (!r) return;
      ui.pending = { result: r, query: null };
      go(destinationRoute(r.destination));
    });
    b.setAttribute("data-pm-result", rec.id);
    var label = el("span", "c7-crow-label", esc(rec.label));
    label.title = rec.label;
    b.appendChild(label);
    /* The last two steps of the path, not the first. Cut from the left, every row in a
     * 1,265-row compendium reads "AI Brains…" — identical, and the column stops telling
     * one entry from another, which is the whole job of a compendium. */
    var parts = String(rec.path || "").split(" \u203a ");
    var pathEl = el("span", "c7-crow-path", esc(parts.length > 2 ? parts.slice(-2).join(" \u203a ") : rec.path));
    pathEl.title = rec.path;
    b.appendChild(pathEl);
    b.appendChild(el("span", "c7-crow-type", esc(rec.typeLabel || IX.kindLabel(rec.kind))));
    var state = el("span", "c7-crow-state", esc(rec.changed ? "Changed" : (rec.stateLabel || "Default")));
    state.setAttribute("data-tone", rec.changed ? "changed" : "quiet");
    b.appendChild(state);
    return b;
  }

  /* ---------------------------------------------------------------- managers */

  /* Which item of a spec a routed object id names. The index addresses some objects
   * by the underlying resource id while a spec numbers its own rows, so an exact
   * match is tried first and a conservative near match second. Nothing is guessed
   * from a short id. */
  function findObject(spec, objectId) {
    if (!objectId) return null;
    var sections = (spec && spec.sections) || [];
    var exact = null;
    var near = null;
    for (var s = 0; s < sections.length; s++) {
      var items = sections[s].items || [];
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (it.id === objectId) return { section: sections[s], item: it };
        if (!near && String(objectId).length >= 4) {
          if (it.id === "prov-" + objectId || it.id === objectId + "-1" ||
              (it.id.length >= 4 && String(objectId).indexOf(it.id) === 0)) {
            near = { section: sections[s], item: it };
          }
        }
      }
    }
    return exact || near;
  }

  /* The object id the DOM must publish for the row the reader was sent to. A link
   * that named "openai" has to land on an element the same link can find again. */
  var arrival = { routeId: null, itemId: null };
  function objAttr(item) {
    return (arrival.routeId && arrival.itemId === item.id) ? arrival.routeId : item.id;
  }

  function renderManagerSurface(route) {
    if (!MG.has(route.managerId)) {
      pageEl.appendChild(el("div", "c7-linknotice",
        "<div class='c7-notice-head'>That manager is not part of this Project</div>"));
      return;
    }
    var spec = ST.decorate(MG.spec(route.managerId, store.get()));
    var family = M.familyOf(route.managerId) || {};
    var hit = findObject(spec, route.objectId);
    arrival = { routeId: route.objectId || null, itemId: hit ? hit.item.id : null };

    var head = el("header", "c7-head c7-mgrhead");
    head.appendChild(el("div", "c7-mgrhead-eyebrow", esc(archetypeWord(spec.archetype))));
    head.appendChild(el("h2", "c7-head-title", esc(spec.title)));
    head.appendChild(el("p", "c7-head-purpose", esc(spec.purpose)));
    if (spec.primary && spec.primary.label) {
      var acts = el("div", "c7-head-acts");
      acts.appendChild(button("c7-btn c7-btn--primary", esc(spec.primary.label), function () {
        runAction(route.managerId, spec.primary, null);
      }));
      head.appendChild(acts);
    }
    pageEl.appendChild(head);

    if (spec.health && (spec.health.headline || spec.health.detail || (spec.health.counts || []).length)) {
      pageEl.appendChild(healthBlock(spec.health));
    }

    renderManager(spec, { route: route, family: family, hit: hit });

    if (spec.diagnostics && spec.diagnostics.length) {
      var diag = block("Diagnostics", "Read-only evidence");
      var row = el("div", "c7-actions");
      spec.diagnostics.forEach(function (d) {
        row.appendChild(button("c7-btn", esc(d.label), function () { runAction(route.managerId, d, null); }));
      });
      diag.appendChild(row);
      pageEl.appendChild(diag);
    }
    if (spec.notes && spec.notes.length) {
      var notes = el("div", "c7-notes");
      spec.notes.forEach(function (n) { notes.appendChild(el("p", null, esc(n))); });
      pageEl.appendChild(notes);
    }
  }

  /* One entry point, branching on the archetype the packet assigns, so a roster is
   * never flattened into preference rows and a health projection never grows an
   * editing control it has no right to. */
  function renderManager(spec, ctx) {
    if (ctx.family.deferred) return ownerManager(spec, ctx);
    if (spec.managerId === "manager-providers") return providerManager(spec, ctx);
    switch (spec.archetype) {
      case "resource roster and detail sheet":
      case "inventory catalogue":
        return rosterManager(spec, ctx);
      case "read-only health projection":
        return projectionManager(spec, ctx);
      case "setup or repair sequence":
        return sequenceManager(spec, ctx);
      case "diagnostic drawer":
        return drawerManager(spec, ctx);
      case "preview and confirmation transaction":
        return transactionManager(spec, ctx);
      default:
        return documentManager(spec, ctx);
    }
  }

  function itemSections(spec) {
    return (spec.sections || []).filter(function (s) { return (s.items || []).length || (s.settings || []).length; });
  }

  function pickRoster(spec) {
    var best = null;
    (spec.sections || []).forEach(function (s) {
      if (s.kind !== "list" && s.kind !== "cards") return;
      if (!(s.items || []).length) return;
      if (!best || s.items.length > best.items.length) best = s;
    });
    return best && best.items.length > 1 ? best : null;
  }

  /* ---------------------------------------------- integrated list and detail */

  function rosterManager(spec, ctx) {
    var roster = pickRoster(spec);
    if (!roster) return documentManager(spec, ctx);
    var route = ctx.route;
    var hit = ctx.hit;

    var tabs = (spec.sections || []).filter(function (s) { return s !== roster; });
    var current = "overview";
    if (hit && hit.section !== roster) current = hit.section.id;
    else if (route.sectionKey) current = route.sectionKey;
    else if (ui.tab[spec.managerId]) current = ui.tab[spec.managerId];
    if (current !== "overview" && !tabs.some(function (t) { return t.id === current; })) current = "overview";
    ui.tab[spec.managerId] = current;

    var selected = (hit && hit.section === roster) ? hit.item : null;
    if (!selected) {
      var remembered = ui.selected[spec.managerId];
      roster.items.forEach(function (it) { if (!selected && it.id === remembered) selected = it; });
    }
    if (!selected) selected = roster.items[0];
    ui.selected[spec.managerId] = selected.id;

    root.setAttribute("data-pane", narrow ? (route.objectId ? "detail" : "roster") : "both");

    var wrap = el("div", "c7-split");
    wrap.appendChild(rosterPane(roster, spec, selected));

    var detail = el("div", "c7-detail");
    detail.appendChild(detailHead(selected, roster));

    var strip = el("div", "c7-tabs");
    strip.setAttribute("role", "tablist");
    strip.appendChild(tabButton("Overview", current === "overview", function () {
      go({ kind: "manager", managerId: spec.managerId, objectId: objAttr(selected), sectionKey: "overview" });
    }));
    tabs.forEach(function (t) {
      strip.appendChild(tabButton(t.label, current === t.id, function () {
        go({ kind: "manager", managerId: spec.managerId, objectId: objAttr(selected), sectionKey: t.id });
      }));
    });
    detail.appendChild(strip);

    if (current === "overview") {
      detail.appendChild(aboutBlock(selected, roster, spec));
      if (selected.editable && selected.editable.length) detail.appendChild(editableFields(selected, spec.managerId));
      detail.appendChild(itemDetailRows(selected));
      detail.appendChild(itemActions(selected, spec.managerId));
    } else {
      var section = tabs.filter(function (t) { return t.id === current; })[0];
      if (section) detail.appendChild(renderSpecSection(section, spec));
    }
    wrap.appendChild(detail);
    pageEl.appendChild(wrap);
  }

  function rosterPane(roster, spec, selected) {
    var side = el("div", "c7-roster");
    var head = el("div", "c7-roster-head");
    head.appendChild(el("span", "c7-roster-title", esc(roster.label)));
    var n = el("span", "c7-roster-count");
    n.innerHTML = num(roster.items.length);
    head.appendChild(n);
    side.appendChild(head);
    if (roster.summary) side.appendChild(el("p", "c7-roster-sub", esc(roster.summary)));

    var list = el("div", "c7-roster-list c7-scroll");
    roster.items.forEach(function (item) {
      var id = objAttr(item);
      var b = button("c7-obj", null, function () {
        ui.selected[spec.managerId] = item.id;
        go({ kind: "manager", managerId: spec.managerId, objectId: id });
      });
      b.setAttribute("data-pm-object", id);
      b.setAttribute("aria-selected", item === selected ? "true" : "false");
      var body = el("div", "c7-obj-body");
      body.appendChild(el("div", "c7-obj-name", esc(item.name)));
      if (item.secondary) body.appendChild(el("div", "c7-obj-sub", esc(item.secondary)));
      b.appendChild(body);
      if (item.statusWord) {
        var st = el("span", "c7-obj-status", esc(item.statusWord));
        st.setAttribute("data-tone", item.status || "ok");
        b.appendChild(st);
      }
      list.appendChild(b);
    });
    side.appendChild(list);
    return side;
  }

  function detailHead(item, roster) {
    var head = el("div", "c7-detail-head");
    head.appendChild(el("div", "c7-detail-eyebrow", esc(singular(roster.label))));
    head.appendChild(el("h3", "c7-detail-title", esc(item.name)));
    if (item.secondary) head.appendChild(el("p", "c7-detail-sub", esc(item.secondary)));
    if (item.badges && item.badges.length) {
      var tags = el("div", "c7-taglist");
      item.badges.forEach(function (b) {
        var t = tag(b.text, "quiet");
        if (b.title) t.title = b.title;
        tags.appendChild(t);
      });
      head.appendChild(tags);
    }
    return head;
  }

  function singular(label) {
    var s = String(label || "Item");
    if (/ies$/.test(s)) return s.replace(/ies$/, "y");
    if (/s$/.test(s) && !/ss$/.test(s)) return s.slice(0, -1);
    return s;
  }

  /* The readable metadata block this concept is built around: what the thing is,
   * what its value is, what the value would be if nobody had touched it, and where
   * the value on screen actually came from. */
  function aboutBlock(item, roster, spec) {
    var box = el("section", "c7-about");
    box.appendChild(el("div", "c7-about-eyebrow", "About this " + esc(singular(roster.label).toLowerCase())));
    box.appendChild(el("p", "c7-about-lead",
      esc(item.secondary || spec.purpose ||
        (item.name + " is one of the " + roster.items.length + " entries this manager holds."))));

    var dl = el("dl", "c7-meta c7-meta--wide");
    if (item.statusWord) metaPair(dl, "Status", item.statusWord);
    var fields = item.fields || {};
    Object.keys(fields).forEach(function (k) { metaPair(dl, k, String(fields[k])); });
    if (item.value != null && item.value !== "") metaPair(dl, "Value", valueWord(item.value));
    if (item.requested != null && item.requested !== "") metaPair(dl, "Asked for", valueWord(item.requested));
    if (item.effective != null && item.effective !== "") metaPair(dl, "In effect", valueWord(item.effective));
    if (item.effectiveWhy) metaPair(dl, "Because", item.effectiveWhy);
    metaPair(dl, "Type", singular(roster.label));
    metaPair(dl, "Value came from", item.valueSource ||
      (item.availability && item.availability.available === false
        ? "nothing — this host cannot provide it"
        : "this manager, for " + M.project.name));
    if (item.availability && item.availability.available === false) {
      metaPair(dl, "Not available", item.availability.reason);
      if (item.availability.owner) metaPair(dl, "Owned by", item.availability.owner);
    }
    box.appendChild(dl);
    return box;
  }

  function itemDetailRows(item) {
    var box = el("div", "c7-detailrows");
    (item.detail || []).forEach(function (d) {
      var sub = el("section", "c7-about");
      sub.appendChild(el("div", "c7-about-eyebrow", esc(d.label)));
      var dl = el("dl", "c7-meta c7-meta--wide");
      (d.rows || []).forEach(function (r) {
        metaPair(dl, r.label, String(r.value === "" ? "not set" : r.value) + (r.hint ? " — " + r.hint : ""));
      });
      sub.appendChild(dl);
      box.appendChild(sub);
    });
    return box;
  }

  function itemActions(item, managerId) {
    var box = el("div", "c7-actions");
    (item.actions || []).forEach(function (a) {
      box.appendChild(button("c7-btn" + (a.kind === "primary" ? " c7-btn--primary" : ""),
        esc(a.label), function () { runAction(managerId, a, item); }));
    });
    return box;
  }

  function tabButton(label, selected, fn) {
    var b = button("c7-tab", esc(label), fn);
    b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", selected ? "true" : "false");
    return b;
  }

  /* ------------------------------------------------------ the other shapes */

  function documentManager(spec, ctx) {
    root.setAttribute("data-pane", "both");
    (spec.sections || []).forEach(function (section) {
      pageEl.appendChild(renderSpecSection(section, spec));
    });
    if (!(spec.sections || []).length) {
      pageEl.appendChild(el("p", "c7-notes", esc(spec.purpose)));
    }
  }

  function projectionManager(spec, ctx) {
    root.setAttribute("data-pane", "both");
    var note = el("div", "c7-readonly");
    note.innerHTML = icon("eye", 14) +
      "<span>This surface reports. Nothing on it is edited here — each line names the manager that owns the change.</span>";
    pageEl.appendChild(note);
    documentManager(spec, ctx);
  }

  function sequenceManager(spec, ctx) {
    root.setAttribute("data-pane", "both");
    var sections = spec.sections || [];
    var steps = el("ol", "c7-steps");
    sections.forEach(function (section, i) {
      var li = el("li", "c7-step");
      li.appendChild(el("span", "c7-step-n", String(i + 1)));
      var body = el("div", "c7-step-body");
      body.appendChild(el("div", "c7-step-title", esc(section.label)));
      if (section.summary) body.appendChild(el("p", "c7-step-sub", esc(section.summary)));
      body.appendChild(renderSpecSection(section, spec, true));
      li.appendChild(body);
      steps.appendChild(li);
    });
    pageEl.appendChild(steps);
  }

  function drawerManager(spec, ctx) {
    root.setAttribute("data-pane", "both");
    (spec.sections || []).forEach(function (section, i) {
      var key = spec.managerId + ":" + section.id;
      var open = ui.openDetails[key] || i === 0;
      var box = el("section", "c7-section");
      var head = button("c7-drawer-head",
        icon(open ? "chevronUp" : "chevronDown", 12) +
        "<span>" + esc(section.label) + "</span>" +
        "<span class='c7-section-count'>" + esc(String((section.items || []).length)) + "</span>",
        function () { ui.openDetails[key] = !open; render(); });
      head.setAttribute("aria-expanded", open ? "true" : "false");
      box.appendChild(head);
      if (open) box.appendChild(renderSpecSection(section, spec, true));
      pageEl.appendChild(box);
    });
  }

  function transactionManager(spec, ctx) {
    root.setAttribute("data-pane", "both");
    var note = el("div", "c7-readonly");
    note.innerHTML = icon("shield", 14) +
      "<span>Nothing here is applied until it has been previewed and confirmed, and every apply leaves a receipt that can be rolled back.</span>";
    pageEl.appendChild(note);
    documentManager(spec, ctx);
    if (spec.managerId === "manager-copy") {
      var go = el("div", "c7-actions");
      go.appendChild(button("c7-btn c7-btn--primary", "Open the copy transaction", function () {
        go({ kind: "copy", step: "source" });
      }));
      pageEl.appendChild(go);
    }
  }

  /* A deferred owner is a named destination with a return contract, not a gap. */
  function ownerManager(spec, ctx) {
    root.setAttribute("data-pane", "both");
    var owner = spec.owner || {};
    var box = el("section", "c7-owner");
    box.appendChild(el("div", "c7-about-eyebrow", "A separate owner"));
    var dl = el("dl", "c7-meta c7-meta--wide");
    metaPair(dl, "Owned by", owner.name || ctx.family.owner || "Another owner");
    metaPair(dl, "Why it is separate", owner.why || ctx.family.why || "");
    metaPair(dl, "How it is entered", owner.insertionContract || ctx.family.insertion || "");
    metaPair(dl, "How control returns", owner.returnContract || ctx.family.returns || "");
    box.appendChild(dl);
    var acts = el("div", "c7-actions");
    acts.appendChild(button("c7-btn c7-btn--primary", "Open " + esc(owner.name || "the owner"), function () {
      window.PMSim.run({
        label: "Open " + (owner.name || "the owner"),
        detail: owner.returnContract || "Control returns to this Settings destination.",
        realCall: "cmd.settings.owner.open",
        payload: { owner: owner.name, from: spec.managerId, project: M.project.id }
      });
    }));
    box.appendChild(acts);
    pageEl.appendChild(box);
    documentManager(spec, ctx);
  }

  /* ------------------------------------------------------- generic sections */

  function renderSpecSection(section, spec, bare) {
    var box = el("section", bare ? "c7-subsection" : "c7-section");
    if (!bare) {
      var head = el("div", "c7-section-head");
      head.appendChild(el("h3", "c7-section-title", esc(section.label)));
      if ((section.items || []).length) {
        var c = el("span", "c7-section-count");
        c.innerHTML = num(section.items.length);
        head.appendChild(c);
      }
      box.appendChild(head);
      if (section.summary) box.appendChild(el("p", "c7-section-sub", esc(section.summary)));
    }

    if ((section.settings || []).length) {
      section.settings.forEach(function (id) {
        var rec = M.setting(id);
        if (rec) box.appendChild(renderRow(rec));
      });
      return box;
    }

    var items = section.items || [];
    if (!items.length) {
      var e = section.empty || {};
      var empty = el("div", "c7-empty");
      empty.appendChild(el("div", "c7-empty-head", esc(e.headline || "Nothing here yet")));
      if (e.detail) empty.appendChild(el("p", "c7-empty-detail", esc(e.detail)));
      if (e.action) {
        empty.appendChild(button("c7-btn", esc(e.action.label), function () {
          runAction(spec.managerId, e.action, null);
        }));
      }
      box.appendChild(empty);
      return box;
    }

    if (section.kind === "prose") {
      var prose = el("div", "c7-prose");
      items.forEach(function (i) { prose.appendChild(el("p", null, esc(i.name))); });
      box.appendChild(prose);
      return box;
    }

    if (section.kind === "table" || section.kind === "matrix") {
      box.appendChild(specTable(section));
      return box;
    }

    items.forEach(function (item) {
      box.appendChild(specItemRow(item, section, spec));
    });
    if (section.actions && section.actions.length) {
      var acts = el("div", "c7-actions");
      section.actions.forEach(function (a) {
        acts.appendChild(button("c7-btn", esc(a.label), function () { runAction(spec.managerId, a, null); }));
      });
      box.appendChild(acts);
    }
    return box;
  }

  function specTable(section) {
    var cols = (section.columns || []).slice();
    if (!cols.length) {
      var keys = [];
      (section.items || []).forEach(function (i) {
        Object.keys(i.fields || {}).forEach(function (k) { if (keys.indexOf(k) < 0) keys.push(k); });
      });
      cols = keys.map(function (k) { return { key: k, label: k }; });
    }
    var wrap = el("div", "c7-tablewrap c7-scroll");
    var table = el("table", "c7-table");
    var thead = el("thead");
    var tr = el("tr");
    tr.appendChild(el("th", null, "Entry"));
    cols.forEach(function (c) { tr.appendChild(el("th", null, esc(c.label || c.key))); });
    thead.appendChild(tr);
    table.appendChild(thead);
    var tbody = el("tbody");
    (section.items || []).forEach(function (item) {
      var r = el("tr");
      r.setAttribute("data-pm-object", objAttr(item));
      var first = el("td");
      first.appendChild(el("div", "c7-td-name", esc(item.name)));
      if (item.secondary) first.appendChild(el("div", "c7-td-sub", esc(item.secondary)));
      r.appendChild(first);
      cols.forEach(function (c) {
        var v = (item.fields || {})[c.key];
        r.appendChild(el("td", null, esc(v == null ? "—" : String(v))));
      });
      tbody.appendChild(r);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    return wrap;
  }

  function specItemRow(item, section, spec) {
    var row = el("div", "c7-objrow");
    row.setAttribute("data-pm-object", objAttr(item));
    row.tabIndex = -1;
    var main = el("div", "c7-objrow-main");
    var label = el("div", "c7-row-label");
    label.appendChild(el("span", "c7-row-title", esc(item.name)));
    if (item.statusWord) label.appendChild(tag(item.statusWord, item.status === "attention" ? "attention" : (item.status || "quiet")));
    (item.badges || []).forEach(function (b) {
      var t = tag(b.text, "quiet");
      if (b.title) t.title = b.title;
      label.appendChild(t);
    });
    main.appendChild(label);
    if (item.secondary) main.appendChild(el("p", "c7-row-desc", esc(item.secondary)));

    var fields = item.fields || {};
    var keys = Object.keys(fields);
    if (keys.length) {
      var dl = el("dl", "c7-meta c7-meta--wide");
      keys.forEach(function (k) { metaPair(dl, k, String(fields[k])); });
      main.appendChild(dl);
    }
    if (item.availability && item.availability.available === false) {
      main.appendChild(el("p", "c7-row-desc", esc("Not available here — " + item.availability.reason)));
    }
    if (item.editable && item.editable.length) main.appendChild(editableFields(item, spec.managerId));
    row.appendChild(main);

    if (item.actions && item.actions.length) {
      row.appendChild(itemActions(item, spec.managerId));
    }
    return row;
  }

  function editableFields(item, managerId) {
    var box = el("div", "c7-editable");
    item.editable.forEach(function (f) {
      var row = el("div", "c7-editrow");
      var main = el("div", "c7-editrow-main");
      main.appendChild(el("div", "c7-row-title", esc(f.label)));
      if (f.help) main.appendChild(el("p", "c7-row-desc", esc(f.help)));
      row.appendChild(main);

      var ctl = el("div", "c7-row-control");
      var current = store.edit(managerId, item.id, f.key, f.value);
      if (f.secretKind) {
        /* Secret material is never rendered. Only the reference is shown, and the
         * only offer is one that replaces it. */
        ctl.appendChild(el("span", "c7-listval", "Stored by the provider — never shown here"));
        ctl.appendChild(button("c7-btn", "Replace", function () {
          window.PMSim.run({
            label: "Replace " + f.label,
            detail: "Opens the credential flow the provider owns. No existing secret is read or displayed.",
            realCall: "cmd.provider.connection.authenticate"
          });
        }));
      } else if (f.kind === "toggle") {
        var t = button("c7-toggle", "", function () {
          store.setEdit(managerId, item.id, f.key, !current);
          MG.invalidate(managerId);
          render();
        });
        t.setAttribute("role", "switch");
        t.setAttribute("aria-checked", current ? "true" : "false");
        t.setAttribute("aria-label", f.label);
        ctl.appendChild(t);
      } else if (f.kind === "select" && (f.options || []).length) {
        var s = el("select", "c7-select");
        s.setAttribute("aria-label", f.label);
        f.options.forEach(function (o) {
          var op = document.createElement("option");
          op.value = o; op.textContent = o;
          s.appendChild(op);
        });
        s.value = String(current == null ? f.options[0] : current);
        on(s, "change", function () {
          store.setEdit(managerId, item.id, f.key, s.value);
          MG.invalidate(managerId);
          render();
        });
        ctl.appendChild(s);
      } else {
        var i = el("input", "c7-input");
        i.type = "text";
        i.value = current == null ? "" : String(current);
        i.setAttribute("aria-label", f.label);
        on(i, "change", function () {
          store.setEdit(managerId, item.id, f.key, i.value);
          MG.invalidate(managerId);
          render();
        });
        ctl.appendChild(i);
      }
      row.appendChild(ctl);
      box.appendChild(row);
    });
    return box;
  }

  function healthBlock(health) {
    var box = el("div", "c7-health");
    box.setAttribute("data-tone", health.status || "ok");
    var top = el("div", "c7-health-top");
    top.appendChild(el("span", "c7-health-ico", icon(health.status === "ok" ? "checkCircle" : "info", 15)));
    var word = el("span", "c7-health-word", esc(health.statusWord || ""));
    top.appendChild(word);
    box.appendChild(top);
    if (health.headline) box.appendChild(el("p", "c7-health-line", esc(health.headline)));
    if (health.detail) box.appendChild(el("p", "c7-health-detail", esc(health.detail)));
    if (health.counts && health.counts.length) {
      var counts = el("div", "c7-health-counts");
      health.counts.forEach(function (c) {
        var cell = el("div", "c7-count");
        var v = el("div", "c7-count-v");
        v.innerHTML = num(c.value);
        cell.appendChild(v);
        cell.appendChild(el("div", "c7-count-k", esc(c.label)));
        counts.appendChild(cell);
      });
      box.appendChild(counts);
    }
    return box;
  }

  /* ------------------------------------------------------- provider, bespoke */

  /* The one surface the seven designs are meant to disagree about. The default view
   * answers the six questions a reader arrives with — connected state, selected
   * account, models, what happens when included usage runs out, routing, and
   * setup or repair — and everything else is a coordinated subpage rather than one
   * wall of controls. */
  var PROVIDER_TAB = {
    accounts: "overview",
    models: "overview",
    credentials: "sub-credentials",
    installations: "sub-installations",
    cliInstallations: "sub-installations",
    catalogues: "sub-catalogues",
    limits: "sub-limits",
    logs: "sub-logs",
    diagnostics: "sub-logs"
  };

  function providerManager(spec, ctx) {
    var route = ctx.route;
    var sections = {};
    (spec.sections || []).forEach(function (s) { sections[s.id] = s; });
    var families = sections.families;
    if (!families || !(families.items || []).length) return documentManager(spec, ctx);

    var subpages = (sections.subpages && sections.subpages.items) || [];
    var famHit = ctx.hit && ctx.hit.section === families ? ctx.hit : null;
    var elsewhere = ctx.hit && ctx.hit.section !== families ? ctx.hit : null;

    var tabs = [{ id: "overview", label: "Overview" }];
    if (sections["usage-end"]) tabs.push({ id: "usage-end", label: "When usage ends" });
    subpages.forEach(function (p) { tabs.push({ id: p.id, label: p.name, item: p }); });
    if (sections.acquisition) tabs.push({ id: "acquisition", label: "How a tool is acquired" });
    if (sections["provider-rows"]) tabs.push({ id: "provider-rows", label: "Model defaults" });

    var current = "overview";
    if (elsewhere) current = PROVIDER_TAB[elsewhere.section.id] || elsewhere.section.id;
    else if (route.sectionKey) current = PROVIDER_TAB[route.sectionKey] || route.sectionKey;
    else if (ui.tab[spec.managerId]) current = ui.tab[spec.managerId];
    if (!tabs.some(function (t) { return t.id === current; })) current = "overview";
    ui.tab[spec.managerId] = current;

    var selected = famHit ? famHit.item : null;
    if (!selected) {
      var remembered = ui.selected[spec.managerId];
      families.items.forEach(function (it) { if (!selected && it.id === remembered) selected = it; });
    }
    if (!selected) selected = families.items[0];
    ui.selected[spec.managerId] = selected.id;

    root.setAttribute("data-pane", narrow ? (route.objectId && !famHit ? "detail" : (route.objectId ? "detail" : "roster")) : "both");

    var wrap = el("div", "c7-split");
    wrap.appendChild(rosterPane(families, spec, selected));

    var detail = el("div", "c7-detail");
    detail.appendChild(detailHead(selected, families));

    var strip = el("div", "c7-tabs");
    strip.setAttribute("role", "tablist");
    tabs.forEach(function (t) {
      strip.appendChild(tabButton(t.label, current === t.id, function () {
        go({ kind: "manager", managerId: spec.managerId, objectId: objAttr(selected), sectionKey: t.id });
      }));
    });
    detail.appendChild(strip);

    if (current === "overview") {
      detail.appendChild(aboutBlock(selected, families, spec));
      detail.appendChild(itemDetailRows(selected));
      detail.appendChild(itemActions(selected, spec.managerId));
      var setup = el("p", "c7-notes",
        "No provider tool is bundled or installed quietly. The first acquisition is an install you start, " +
        "from the provider's own source, for the host you chose; signing in is a separate step afterwards.");
      detail.appendChild(setup);
    } else if (current === "usage-end") {
      detail.appendChild(renderSpecSection(sections["usage-end"], spec, true));
    } else if (current === "acquisition") {
      detail.appendChild(renderSpecSection(sections.acquisition, spec, true));
    } else if (current === "provider-rows") {
      detail.appendChild(renderSpecSection(sections["provider-rows"], spec, true));
    } else {
      var page = null;
      subpages.forEach(function (p) { if (p.id === current) page = p; });
      if (page) {
        detail.appendChild(subpageBlock(page, spec));
        if (page.id === "sub-installations" && sections.installations) {
          detail.appendChild(renderSpecSection(sections.installations, spec, true));
        }
      }
    }
    wrap.appendChild(detail);
    pageEl.appendChild(wrap);
  }

  function subpageBlock(page, spec) {
    var box = el("section", "c7-about");
    box.appendChild(el("div", "c7-about-eyebrow", esc(page.name)));
    if (page.secondary) box.appendChild(el("p", "c7-about-lead", esc(page.secondary)));
    var dl = el("dl", "c7-meta c7-meta--wide");
    if (page.statusWord) metaPair(dl, "Right now", page.statusWord);
    Object.keys(page.fields || {}).forEach(function (k) { metaPair(dl, k, String(page.fields[k])); });
    box.appendChild(dl);
    if (page.actions && page.actions.length) box.appendChild(itemActions(page, spec.managerId));
    return box;
  }

  /* ------------------------------------------------------------------- copy */

  /* One transaction, four steps, nothing written until the last one. The step is in
   * the route so a half-finished review can be linked to, and the receipt survives
   * a reload because it is a fact about this Project. */
  var COPY_STEPS = [
    { id: "source", label: "Choose a source" },
    { id: "categories", label: "Choose what to copy" },
    { id: "preview", label: "Preview" },
    { id: "apply", label: "Apply and receipt" }
  ];

  function copyStep(route) {
    var want = route.step || "source";
    var at = 0;
    COPY_STEPS.forEach(function (s, i) { if (s.id === want) at = i; });
    if (at >= 1 && !ui.copy.source) at = 0;
    if (at >= 2 && !ui.copy.preview) at = 1;
    if (at >= 3 && !ui.copy.run) at = 2;
    return at;
  }

  function goStep(id) { go({ kind: "copy", step: id }); }

  function renderCopy(route) {
    var at = copyStep(route);
    var fx = ST.effects();

    var head = el("header", "c7-head");
    head.appendChild(el("h2", "c7-head-title", "Copy settings from another Project"));
    head.appendChild(el("p", "c7-head-purpose", esc(CP.independence)));
    pageEl.appendChild(head);

    var steps = el("ol", "c7-stepper");
    COPY_STEPS.forEach(function (s, i) {
      var li = el("li", "c7-stepper-item");
      li.setAttribute("data-state", i === at ? "current" : (i < at ? "done" : "todo"));
      var n = el("span", "c7-stepper-n");
      n.innerHTML = i < at ? icon("check", 11) : String(i + 1);
      li.appendChild(n);
      li.appendChild(el("span", "c7-stepper-label", esc(s.label)));
      steps.appendChild(li);
    });
    pageEl.appendChild(steps);

    if (fx.importConflict) {
      var conflictNote = el("div", "c7-readonly");
      conflictNote.innerHTML = icon("alert", 14) +
        "<span>The source disagrees with values this Project already has. Every disagreement is itemised in the preview below, and nothing is applied until it has been read.</span>";
      pageEl.appendChild(conflictNote);
    }

    if (at === 0) copySource();
    else if (at === 1) copyCategories();
    else if (at === 2) copyPreview();
    else copyApply();

    var receipts = CP.receipts();
    if (receipts.length) {
      var hist = block("Receipts", plural(receipts.length, "receipt"));
      receipts.forEach(function (r) {
        var row = el("div", "c7-objrow");
        var main = el("div", "c7-objrow-main");
        main.appendChild(el("div", "c7-row-title", esc("Copied from " + r.source.name + " · " + r.at)));
        main.appendChild(el("p", "c7-row-desc", esc(
          r.outcome === "applied"
            ? plural(r.applied, "value") + " applied. The restore point taken first is " + r.restorePoint.label + "."
            : (r.note || "Rolled back. This Project is exactly as it was."))));
        row.appendChild(main);
        var ctl = el("div", "c7-actions");
        if (r.canRollback) {
          ctl.appendChild(button("c7-btn", "Roll back", function () {
            CP.rollback(r.id);
            MG.invalidate();
            render();
            shell.announce("The copy was rolled back. This Project is exactly as it was.");
          }));
        } else {
          ctl.appendChild(tag(r.outcome === "applied" ? "Applied" : "Rolled back", "quiet"));
        }
        row.appendChild(ctl);
        hist.appendChild(row);
      });
      pageEl.appendChild(hist);
    }
  }

  function copySource() {
    var box = block("Which Project should this one copy from?", null);
    CP.sources().forEach(function (s) {
      var b = button("c7-src", null, function () {
        ui.copy.source = s.id;
        ui.copy.domains = M.domains.map(function (d) { return d.id; });
        ui.copy.preview = null;
        ui.copy.run = null;
        ui.copy.receipt = null;
        goStep("categories");
      });
      b.setAttribute("aria-pressed", ui.copy.source === s.id ? "true" : "false");
      var body = el("div", "c7-src-body");
      body.appendChild(el("div", "c7-src-name", esc(s.name)));
      body.appendChild(el("div", "c7-src-sub", esc(s.updated + " · " + s.note)));
      b.appendChild(body);
      var meta = el("span", "c7-src-meta");
      meta.innerHTML = num(s.settings) + " entries";
      b.appendChild(meta);
      b.appendChild(el("span", "c7-dest-chev", icon("chevronRight", 13)));
      box.appendChild(b);
    });
    box.appendChild(el("p", "c7-notes", esc(CP.secretPolicy())));
    pageEl.appendChild(box);
  }

  function copyCategories() {
    var chosen = ui.copy.domains || [];
    var box = block("Which areas should come across?", plural(chosen.length, "area") + " selected");
    var grid = el("div", "c7-cats");
    CP.categories().forEach(function (cat) {
      var picked = chosen.indexOf(cat.id) >= 0;
      var b = button("c7-cat", null, function () {
        var at = chosen.indexOf(cat.id);
        if (at >= 0) chosen.splice(at, 1); else chosen.push(cat.id);
        ui.copy.domains = chosen;
        ui.copy.preview = null;
        render();
      });
      b.setAttribute("aria-pressed", picked ? "true" : "false");
      b.appendChild(el("span", "c7-cat-box", picked ? icon("check", 11) : ""));
      var body = el("div", "c7-cat-body");
      body.appendChild(el("div", "c7-cat-title", esc(cat.title)));
      body.appendChild(el("div", "c7-cat-sub", esc(cat.purpose)));
      b.appendChild(body);
      var n = el("span", "c7-cat-n");
      n.innerHTML = num(cat.count);
      b.appendChild(n);
      grid.appendChild(b);
    });
    box.appendChild(grid);

    var acts = el("div", "c7-actions");
    acts.appendChild(button("c7-btn", "Back", function () { goStep("source"); }));
    var next = button("c7-btn c7-btn--primary", "Preview the changes", function () {
      ui.copy.preview = CP.preview(ui.copy.source, chosen);
      goStep("preview");
    });
    next.disabled = !chosen.length;
    acts.appendChild(next);
    box.appendChild(acts);
    pageEl.appendChild(box);
  }

  function copyPreview() {
    var p = ui.copy.preview;
    var box = block("What this would do to " + M.project.name, "Nothing has been written yet");

    var tiles = el("div", "c7-tiles");
    [["Will be added", p.counts.additions], ["Will be replaced", p.counts.replacements],
     ["Already the same", p.counts.unchanged], ["Account references re-pointed", p.counts.references],
     ["Cannot be copied", p.counts.unavailable + p.counts.conflicts]].forEach(function (pair) {
      var t = el("div", "c7-tile c7-tile--static");
      var v = el("div", "c7-tile-v");
      v.innerHTML = num(pair[1]);
      t.appendChild(v);
      t.appendChild(el("div", "c7-tile-k", esc(pair[0])));
      tiles.appendChild(t);
    });
    box.appendChild(tiles);

    var changes = p.items.filter(function (i) {
      return i.outcome === "addition" || i.outcome === "replacement" || i.outcome === "reference";
    });
    var listBox = el("div", "c7-difflist c7-scroll");
    changes.slice(0, 300).forEach(function (item) {
      var row = el("div", "c7-diffrow");
      var lab = el("div", "c7-diff-label");
      lab.appendChild(el("div", "c7-diff-name", esc(item.label)));
      lab.appendChild(el("div", "c7-diff-path", esc(item.path)));
      row.appendChild(lab);
      row.appendChild(el("div", "c7-diff-from", esc(valueWord(item.current))));
      row.appendChild(el("span", "c7-diff-arrow", icon("arrowRight", 12)));
      row.appendChild(el("div", "c7-diff-to", esc(valueWord(item.incoming))));
      listBox.appendChild(row);
    });
    box.appendChild(listBox);
    if (changes.length > 300) {
      box.appendChild(el("p", "c7-notes",
        "The first 300 of " + changes.length + " changes are listed. Every one of them is included in the apply."));
    }

    var excluded = el("section", "c7-about");
    excluded.appendChild(el("div", "c7-about-eyebrow", "What is not copied"));
    var dl = el("dl", "c7-meta c7-meta--wide");
    p.excluded.forEach(function (x) {
      metaPair(dl, x.label, String(x.count) + (x.note ? " — " + x.note : ""));
    });
    excluded.appendChild(dl);
    excluded.appendChild(el("p", "c7-about-lead", esc(p.secretPolicy)));
    box.appendChild(excluded);

    var acts = el("div", "c7-actions");
    acts.appendChild(button("c7-btn", "Back", function () { goStep("categories"); }));
    acts.appendChild(button("c7-btn c7-btn--primary", "Take a restore point and copy", function () {
      ui.copy.run = CP.apply(p);
      ui.copy.receipt = null;
      goStep("apply");
    }));
    box.appendChild(acts);
    pageEl.appendChild(box);
  }

  function copyApply() {
    var run = ui.copy.run;
    var op = run.get();
    var box = block("Applying", "Driven one phase at a time so each one is visible");

    var phases = el("ol", "c7-phases");
    var currentAt = run.steps.indexOf(op.phase);
    run.steps.forEach(function (phase, i) {
      var li = el("li", "c7-phase");
      li.appendChild(el("span", null, esc(phase)));
      var word = op.phase === phase
        ? window.PMWork.stateWord(op.state)
        : ((currentAt >= 0 && i < currentAt) || ui.copy.receipt ? "done" : "waiting");
      li.appendChild(el("span", "c7-phase-state", esc(word)));
      phases.appendChild(li);
    });
    box.appendChild(phases);

    /* A determinate bar only exists when a real denominator does. */
    if (op.progress_kind === "fraction" && op.total) {
      var bar = el("div", "c7-progress");
      var fill = el("i");
      fill.style.width = Math.round((op.completed / op.total) * 100) + "%";
      bar.appendChild(fill);
      box.appendChild(bar);
      box.appendChild(el("p", "c7-notes", op.completed + " of " + op.total + " values · " + op.progress_source));
    } else {
      box.appendChild(el("p", "c7-notes", esc(window.PMWork.stateWord(op.state) +
        (op.wait_reason ? " — waiting: " + op.wait_reason : " — no trustworthy total, so no bar is drawn"))));
    }

    var acts = el("div", "c7-actions");
    if (!ui.copy.receipt) {
      acts.appendChild(button("c7-btn c7-btn--primary", "Continue", function () {
        var out = run.next();
        if (out.done) { ui.copy.receipt = out.receipt; MG.invalidate(); }
        render();
      }));
      acts.appendChild(button("c7-btn", "Run the rest", function () {
        var out = run.run();
        ui.copy.receipt = out.receipt;
        MG.invalidate();
        render();
      }));
      acts.appendChild(button("c7-btn", "Cancel", function () {
        run.cancel();
        ui.copy = { step: 1, source: null, domains: null, preview: null, run: null, receipt: null };
        goStep("source");
      }));
    } else {
      var r = ui.copy.receipt;
      var note = el("section", "c7-about");
      note.appendChild(el("div", "c7-about-eyebrow", r.outcome === "applied" ? "Copied" : "Rolled back"));
      note.appendChild(el("p", "c7-about-lead", esc(
        r.outcome === "applied"
          ? plural(r.applied, "value") + " were applied to " + M.project.name +
            ". The restore point taken first is " + r.restorePoint.label + "."
          : r.note)));
      note.appendChild(el("p", "c7-about-lead", esc(
        "The two Projects are independent from here. Nothing in " + r.source.name + " will reach this Project again.")));
      box.appendChild(note);
      acts.appendChild(button("c7-btn c7-btn--primary", "Done", function () {
        ui.copy = { step: 1, source: null, domains: null, preview: null, run: null, receipt: null };
        go({ kind: "home" });
      }));
      if (r.canRollback) {
        acts.appendChild(button("c7-btn", "Roll back", function () {
          CP.rollback(r.id);
          MG.invalidate();
          ui.copy = { step: 1, source: null, domains: null, preview: null, run: null, receipt: null };
          goStep("source");
        }));
      }
    }
    box.appendChild(acts);
    pageEl.appendChild(box);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
