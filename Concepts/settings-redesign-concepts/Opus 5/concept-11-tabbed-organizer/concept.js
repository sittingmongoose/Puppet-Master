/* Opus 5 — Folio (concept 11).
 *
 * Thesis: Settings is well-organised into tabs and sheets that never lose your place.
 *
 * The reference this concept was given is a photograph of a paper office organiser,
 * and only its LAYOUT is used: two ranked rows of tabs, a sheet under them, a roster
 * with a third row of tabs beside it, compact home categories over a recent-changes
 * list. Everything the photograph was MADE of — paper, manila, folder shapes, binder
 * rings, torn edges, stacked shadows — is gone. Rank between the three tab rows is
 * carried by size and weight, so the hierarchy still reads in the flattest theme.
 *
 * The invariant the whole design is built to keep: the tab rows never move. Every
 * navigation replaces the SHEET underneath them with a 190ms cross-slide, so the
 * indicator that tells the reader where they are is the one thing on screen that is
 * always still. Arriving from search is the same motion — the correct category tab
 * and sub-tab select themselves and the row is ringed inside the sheet that was
 * already there. Search never opens a page of its own.
 *
 * What this file owns: every pixel. What it does not own: any fact. Domains, pages,
 * sections, the 828 settings, manager specs, search results, routes, the copy
 * transaction and the state fixtures all come from shared2, which draws nothing.
 *
 * Portability note (Slint 1.17.1): the route is an explicit state machine, tab
 * selection is derived from the route rather than stored twice, every list that can
 * grow is windowed through PMVirtual, and geometry is measured only to bring an
 * arrival into view — never to decide what something means.
 */
(function () {
  "use strict";

  var CONCEPT_ID = "concept-11-tabbed-organizer";
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
  var topbarEl = null;
  var stateBarEl = null;
  var tabs1El = null;
  var tabs2El = null;
  var portEl = null;
  var sheetEl = null;

  /* Presentation state. Deliberately NOT in the store: none of it is a fact about the
   * Project, and restoring an open dropdown after a reload would be a lie. Anything a
   * deep link must reproduce lives in the route instead. */
  var ui = {
    query: "",
    results: null,
    dropOpen: false,
    activeResult: -1,
    homeTab: "categories",     /* categories | attention | recent */
    allTab: "all",             /* all | changed | restricted | attention */
    mgrObject: {},             /* managerId -> objectId */
    openDetails: {},           /* settingId -> true */
    openAdvanced: {},          /* sectionId -> true */
    facets: { domains: [], kinds: [], exposures: [], states: [], changedOnly: false },
    copy: { step: 1, source: null, domains: null, preview: null, run: null, receipt: null },
    errors: {},                /* settingId -> message */
    pending: null              /* the arrival to reveal after the next paint */
  };

  var narrow = false;
  var lastFixture = null;
  var lastDepth = 0;
  var lastRouteKey = null;
  var ghostTimer = 0;

  /* True while the concept is writing the route for its own bookkeeping rather than
   * navigating. A route write made while the reader is typing must not re-render, or
   * the search field is rebuilt under the cursor and the caret is thrown away. */
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

  function cssEscape(v) {
    if (window.CSS && window.CSS.escape) return window.CSS.escape(v);
    return String(v).replace(/([^\w-])/g, "\\$1");
  }

  /* A stable small integer from a string. Used only for demo scheduling — never for
   * identity, ordering that matters, or anything a reader could mistake for a fact
   * the product measured. */
  function seed(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  /* Category tabs must stay short enough to scan; the full title is still the title. */
  function shortTitle(t) {
    var cut = String(t).split(/\s*[&,]\s*/)[0].replace(/\s+$/, "");
    if (cut.length > 13) cut = cut.split(/\s+/)[0];
    return cut;
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

  function exposureWord(e) {
    for (var i = 0; i < M.EXPOSURE.length; i++) if (M.EXPOSURE[i].id === e) return M.EXPOSURE[i].label;
    return "Advanced";
  }

  function managerDomain(managerId) {
    var f = M.familyOf(managerId);
    return f ? f.domainId : null;
  }

  /* ---------------------------------------------------------------- the shell */

  function boot() {
    shell = window.PMShell.mount({
      rootId: "pm-root",
      concept: "Folio · tabs and sheets that keep your place",
      conceptId: CONCEPT_ID,
      theme: document.documentElement.getAttribute("data-theme") || "friendly-dark",
      defaultTheme: "friendly-dark",
      onLayout: measureNarrow,
      onWidthMode: function () { measureNarrow(); render(); }
    });
    /* The shell's own Demo state select and Reset are wired to the fixture list of
     * concepts 01-04. This concept ships its own over PM2States, so the stale pair is
     * removed rather than left offering situations it does not implement. */
    ST.removeShellControl(shell);

    root = el("div", "f11");
    root.setAttribute("data-concept", CONCEPT_ID);

    topbarEl = el("div", "f11-topbar");
    stateBarEl = el("div", "f11-statebar");

    tabs1El = el("nav", "f11-tabs f11-tabs--1");
    tabs1El.setAttribute("role", "tablist");
    tabs1El.setAttribute("aria-label", "Settings categories");

    tabs2El = el("nav", "f11-tabs f11-tabs--2");
    tabs2El.setAttribute("role", "tablist");
    tabs2El.setAttribute("aria-label", "Sections of the selected category");

    portEl = el("div", "f11-port");

    root.appendChild(topbarEl);
    root.appendChild(stateBarEl);
    root.appendChild(tabs1El);
    root.appendChild(tabs2El);
    root.appendChild(portEl);
    shell.main.appendChild(root);

    document.addEventListener("keydown", onKeydown, true);
    RT.onChange(function () {
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
    narrow = w < 900;
    if (root) root.setAttribute("data-narrow", narrow ? "true" : "false");
  }

  /* --------------------------------------------------------------- the router */

  /* How deep in the tab stack a route is. Only used to choose which way the sheet
   * cross-slides, so Back visibly reverses the motion that got the reader here. */
  function depthOf(route) {
    if (route.kind === "home" || route.kind === "query") return 0;
    if (route.kind === "domain") return route.pageId ? 2 : 1;
    if (route.kind === "manager") return route.objectId ? 3 : 2;
    return 1;
  }

  function routeKey(route) {
    return [route.kind, route.domainId, route.pageId, route.managerId, route.objectId,
      route.sectionKey, route.settingId].join("|");
  }

  function render() {
    if (window.PM2Spy) window.PM2Spy.release();
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
    /* A deep link that carries a query restores the field and the dropdown, which is
     * also what makes browser Back out of a chosen result land on the search. */
    if (route.kind === "query" && route.query != null && route.query !== ui.query) {
      ui.query = route.query;
      ui.results = IX.query(ui.query, { limit: 40 });
      ui.dropOpen = true;
    }

    renderTopbar(route, check);
    renderStateBar();
    renderTabs1(route);
    renderTabs2(route, check);
    swapSheet(route, check);
    revealPending();
  }

  /* -------------------------------------------------------------------- sheet */

  function swapSheet(route, check) {
    var next = el("section", "f11-sheet f11-scroll");
    var inner = el("div", "f11-sheet-inner");
    next.appendChild(inner);

    var kind = route.kind;
    var surface = "home";
    if (!check.ok) surface = "notice";
    else if (kind === "query") surface = "search";
    else if (kind === "domain") surface = route.pageId ? "page" : "domain";
    else if (kind === "manager") surface = "manager";
    else if (kind === "all") surface = "all";
    else if (kind === "copy") surface = "copy";
    next.setAttribute("data-pm-surface", surface);
    if (surface === "manager") next.setAttribute("data-pm-manager", route.managerId);

    var fx = ST.activeFixture();
    if (fx && fx.id !== "normal") inner.appendChild(fixtureLine(fx));

    if (!check.ok) {
      inner.appendChild(brokenLink(check));
      renderHome(inner, route);
    } else if (kind === "home" || kind === "query") {
      renderHome(inner, route);
    } else if (kind === "domain") {
      if (route.pageId) renderPage(inner, route); else renderDomain(inner, route);
    } else if (kind === "manager") {
      renderManagerSurface(inner, route);
    } else if (kind === "all") {
      renderAll(inner, route);
    } else if (kind === "copy") {
      renderCopy(inner, route);
    }

    /* The cross-slide only runs for a real navigation. A theme change, a resize or a
     * value edit re-renders the same location, and animating that would be motion
     * that explains nothing. */
    var key = routeKey(route);
    var depth = depthOf(route);
    var navigated = lastRouteKey !== null && key !== lastRouteKey;
    var reduced = document.documentElement.getAttribute("data-reduced-motion") === "1";
    var dir = depth < lastDepth ? "back" : "forward";

    dropGhost();
    if (navigated && !reduced && sheetEl) {
      var ghost = sheetEl;
      sterilise(ghost);
      ghost.className = "f11-sheet f11-ghost";
      ghost.setAttribute("aria-hidden", "true");
      ghost.setAttribute("data-leave", dir);
      on(ghost, "animationend", dropGhost);
      ghostTimer = window.setTimeout(dropGhost, 240);
      next.setAttribute("data-enter", dir);
    } else if (sheetEl && sheetEl.parentNode) {
      sheetEl.parentNode.removeChild(sheetEl);
    }

    portEl.appendChild(next);
    sheetEl = next;
    lastRouteKey = key;
    lastDepth = depth;
  }

  /* The outgoing sheet is a picture for 190ms, not a second copy of Settings. While
   * it is on screen there would otherwise be two elements claiming to be "the search
   * field" and two claiming to be a given row — which is exactly the sort of thing
   * that makes a reader (or a test) act on the wrong one. Its identity is stripped
   * the instant it stops being the live sheet. */
  var GHOST_ATTRS = ["data-pm-surface", "data-pm-manager", "data-pm-domain", "data-pm-page",
    "data-pm-section", "data-pm-row", "data-pm-control", "data-pm-object", "data-pm-result",
    "data-pm-locator", "data-pm-search-field", "data-pm-search-dropdown", "data-pm-project",
    "data-pm-breadcrumb", "data-pm-back", "data-pm-close", "data-pm-state-control"];
  var GHOST_SELECTOR = "[" + GHOST_ATTRS.join("],[") + "]";

  function sterilise(node) {
    stripAttrs(node);
    var marked = node.querySelectorAll(GHOST_SELECTOR);
    for (var i = 0; i < marked.length; i++) stripAttrs(marked[i]);
  }

  function stripAttrs(node) {
    for (var i = 0; i < GHOST_ATTRS.length; i++) {
      if (node.hasAttribute(GHOST_ATTRS[i])) node.removeAttribute(GHOST_ATTRS[i]);
    }
  }

  function dropGhost() {
    if (ghostTimer) { window.clearTimeout(ghostTimer); ghostTimer = 0; }
    var ghosts = portEl.querySelectorAll(".f11-ghost");
    for (var i = 0; i < ghosts.length; i++) {
      if (ghosts[i].parentNode) ghosts[i].parentNode.removeChild(ghosts[i]);
    }
  }

  /* Which deterministic situation is on screen, stated inside the Settings surface so
   * a screenshot is self-describing and a reader is never guessing why a roster is
   * empty or a value is locked. */
  function fixtureLine(fx) {
    var box = el("div", "f11-fixture");
    box.innerHTML = icon("beaker", 13) +
      "<span><b>" + esc(fx.label) + "</b> — " + esc(fx.note) + "</span>";
    return box;
  }

  function brokenLink(check) {
    var box = el("div", "f11-notice");
    box.innerHTML = icon("alert", 16);
    var body = el("div", "f11-notice-body");
    body.appendChild(el("div", "f11-notice-head", esc(check.reason === "malformed"
      ? "That link is not a Settings location"
      : "That link points somewhere this Project does not have")));
    body.appendChild(el("p", "f11-notice-detail", esc(check.detail || "")));
    body.appendChild(el("p", "f11-notice-detail",
      "The link was " + esc(check.quoted || location.hash) + ". Settings Home is below, with every tab still where it was."));
    box.appendChild(body);
    return box;
  }

  /* ------------------------------------------------------------------ top bar */

  function renderTopbar(route, check) {
    clear(topbarEl);

    var back = backTarget(route);
    var backBtn = button("f11-iconbtn", icon("chevronLeft", 14) + "<span>Back to " + esc(back.label) + "</span>",
      function () { RT.go(back.dest); });
    backBtn.setAttribute("data-pm-back", "");
    backBtn.hidden = route.kind === "home" || route.kind === "query";
    topbarEl.appendChild(backBtn);

    var crumbs = el("nav", "f11-crumbs");
    crumbs.setAttribute("data-pm-breadcrumb", "");
    crumbs.setAttribute("aria-label", "Breadcrumb");
    trail(route).forEach(function (step, i, arr) {
      if (i) crumbs.appendChild(el("span", "f11-crumb-sep", "/"));
      var b = button("f11-crumb", esc(step.label), step.dest ? function () { RT.go(step.dest); } : null);
      if (i === arr.length - 1) b.setAttribute("aria-current", "page");
      crumbs.appendChild(b);
    });
    topbarEl.appendChild(crumbs);

    topbarEl.appendChild(el("div", "f11-bar-spacer"));

    /* Exactly one search field exists at a time: the Home sheet owns it on Home, the
     * top bar owns it everywhere else. Two would make "the search field" ambiguous. */
    if (route.kind !== "home" && route.kind !== "query") topbarEl.appendChild(searchField("bar"));

    var projectBox = el("div", "f11-projectbox");
    projectBox.appendChild(el("span", "f11-projectbox-k", "Project"));
    var project = el("span", "f11-project", esc(M.project.name));
    project.setAttribute("data-pm-project", "");
    projectBox.appendChild(project);
    topbarEl.appendChild(projectBox);

    var close = button("f11-iconbtn", icon("ban", 14) + "<span>Close Settings</span>", function () {
      shell.announce("Close Settings would return to the surface that opened Settings.");
      window.PMSim.run({
        label: "Close Settings",
        detail: "Returns to the surface that opened Settings — in this prototype the shell stays put.",
        realCall: "cmd.settings.close"
      });
    });
    close.setAttribute("data-pm-close", "");
    topbarEl.appendChild(close);
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
      return { label: (M.domain(route.domainId) || {}).title || "Settings",
        dest: { kind: "domain", domainId: route.domainId } };
    }
    if (route.kind === "domain") return { label: "Settings Home", dest: { kind: "home" } };
    if (route.kind === "manager") {
      var dom = managerDomain(route.managerId);
      var domain = dom ? M.domain(dom) : null;
      if (route.objectId && narrow) {
        return { label: (MG.record(route.managerId) || {}).title || "the list",
          dest: { kind: "manager", managerId: route.managerId } };
      }
      return domain ? { label: domain.title, dest: { kind: "domain", domainId: domain.id } }
        : { label: "Settings Home", dest: { kind: "home" } };
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
      out.push({ label: (rec && rec.title) || route.managerId,
        dest: route.objectId ? { kind: "manager", managerId: route.managerId } : null });
      if (route.objectId) {
        var name = objectName(route.managerId, route.objectId);
        if (name) out.push({ label: name, dest: null });
      }
    }
    return out;
  }

  var objectNameCache = {};
  function objectName(managerId, objectId) {
    var key = managerId + "/" + objectId;
    if (objectNameCache[key] !== undefined) return objectNameCache[key];
    /* Safe to hydrate here: this only runs on a manager route, which is exactly when
     * the manager is being opened anyway. */
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
    clear(stateBarEl);
    var active = ST.activeFixture();

    stateBarEl.appendChild(el("span", null, "Demo state"));
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
    stateBarEl.appendChild(sel);
    stateBarEl.appendChild(el("span", "f11-statebar-note", esc(active.note)));

    stateBarEl.appendChild(button("f11-iconbtn", icon("undo", 12) + "<span>Reset this concept</span>", function () {
      store.reset();
      MG.invalidate();
      objectNameCache = {};
      ui.openDetails = {}; ui.openAdvanced = {}; ui.errors = {};
      ui.copy = { step: 1, source: null, domains: null, preview: null, run: null, receipt: null };
      ui.facets = { domains: [], kinds: [], exposures: [], states: [], changedOnly: false };
      render();
      shell.announce("Every change made in this concept was cleared.");
    }));
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

  /* ---------------------------------------------------------- level 1 tabs */

  function tabButton(cls, label, selected, fn) {
    var b = button("f11-tab" + (cls ? " " + cls : ""), label, fn);
    b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", selected ? "true" : "false");
    return b;
  }

  /* The selected chip is scrolled into view inside its own rail — never through
   * scrollIntoView, which would move the page as well as the rail. */
  function pinTab(rail) {
    var sel = rail.querySelector('[aria-selected="true"]');
    if (!sel) return;
    var left = sel.offsetLeft;
    var right = left + sel.offsetWidth;
    if (left < rail.scrollLeft + 8) rail.scrollLeft = Math.max(0, left - 24);
    else if (right > rail.scrollLeft + rail.clientWidth - 8) rail.scrollLeft = right - rail.clientWidth + 24;
  }

  function renderTabs1(route) {
    clear(tabs1El);
    var activeDomain = route.domainId || (route.managerId ? managerDomain(route.managerId) : null);

    var home = tabButton(null, icon("map", 15) + "<span>Home</span>",
      route.kind === "home" || route.kind === "query",
      function () { RT.go({ kind: "home" }); });
    tabs1El.appendChild(home);

    M.domains.forEach(function (d) {
      var label = narrow ? shortTitle(d.title) : d.title;
      var b = tabButton(null, icon(d.icon, 15) + "<span>" + esc(label) + "</span>",
        activeDomain === d.id, function () { RT.go({ kind: "domain", domainId: d.id }); });
      b.setAttribute("data-pm-domain", d.id);
      b.title = d.title + " — " + d.purpose;
      tabs1El.appendChild(b);
    });

    tabs1El.appendChild(el("span", "f11-tabs-div"));

    var all = tabButton("f11-tab--util", icon("list", 14) + "<span>All settings</span>",
      route.kind === "all", function () { RT.go({ kind: "all" }); });
    tabs1El.appendChild(all);

    var copy = tabButton("f11-tab--util", icon("download", 14) + "<span>" + (narrow ? "Copy" : "Copy from another Project") + "</span>",
      route.kind === "copy", function () { RT.go({ kind: "copy", step: "source" }); });
    tabs1El.appendChild(copy);

    pinTab(tabs1El);
  }

  /* ---------------------------------------------------------- level 2 tabs */

  function renderTabs2(route, check) {
    clear(tabs2El);

    if (!check.ok || route.kind === "home" || route.kind === "query") {
      [["categories", "Categories"], ["attention", "Notices"], ["recent", "Recent changes"]]
        .forEach(function (pair) {
          tabs2El.appendChild(tabButton(null, esc(pair[1]), ui.homeTab === pair[0], function () {
            ui.homeTab = pair[0];
            render();
          }));
        });
      pinTab(tabs2El);
      return;
    }

    if (route.kind === "all") {
      [["all", "Everything"], ["changed", "Changed here"], ["restricted", "Managed or unavailable"],
       ["attention", "Notices"]].forEach(function (pair) {
        tabs2El.appendChild(tabButton(null, esc(pair[1]), ui.allTab === pair[0], function () {
          ui.allTab = pair[0];
          applyAllTab();
          render();
        }));
      });
      pinTab(tabs2El);
      return;
    }

    if (route.kind === "copy") {
      ["Source Project", "Categories", "Preview", "Apply and receipt"].forEach(function (label, i) {
        var step = i + 1;
        var b = tabButton(null, "<span class='f11-tab-n'>" + step + "</span><span>" + esc(label) + "</span>",
          ui.copy.step === step, function () { ui.copy.step = step; render(); });
        if (step > reachableCopyStep()) b.disabled = true;
        tabs2El.appendChild(b);
      });
      pinTab(tabs2El);
      return;
    }

    var domainId = route.domainId || (route.managerId ? managerDomain(route.managerId) : null);
    var d = domainId ? M.domain(domainId) : null;
    if (!d) { pinTab(tabs2El); return; }

    var overview = tabButton(null, "Overview",
      route.kind === "domain" && !route.pageId, function () { RT.go({ kind: "domain", domainId: d.id }); });
    tabs2El.appendChild(overview);

    d.pages.forEach(function (p) {
      var b = tabButton(null, esc(p.title) + "<span class='f11-tab-n'>" + p.count + "</span>",
        route.pageId === p.id, function () { RT.go({ kind: "domain", domainId: d.id, pageId: p.id }); });
      b.setAttribute("data-pm-page", p.id);
      b.title = p.summary;
      tabs2El.appendChild(b);
    });

    /* An open manager joins the row at the end rather than replacing anything, so the
     * page tabs the reader was using stay exactly where they were. */
    if (route.kind === "manager") {
      tabs2El.appendChild(el("span", "f11-tabs-div"));
      var rec = MG.record(route.managerId) || {};
      var mb = tabButton(null, icon(rec.icon || "sliders", 13) + "<span>" + esc(rec.title || route.managerId) + "</span>",
        true, function () { RT.go({ kind: "manager", managerId: route.managerId }); });
      mb.setAttribute("data-pm-manager", route.managerId);
      tabs2El.appendChild(mb);
    }

    pinTab(tabs2El);
  }

  function reachableCopyStep() {
    var c = ui.copy;
    if (c.receipt || c.run) return 4;
    if (c.preview) return 3;
    if (c.source) return 2;
    return 1;
  }

  /* The four sub-tabs are the four cuts people actually ask for, expressed as facet
   * presets rather than as a second filtering system beside the facets. */
  function applyAllTab() {
    ui.facets.changedOnly = ui.allTab === "changed";
    if (ui.allTab === "restricted") ui.facets.states = ["managed", "unavailable"];
    else if (ui.allTab === "attention") ui.facets.states = ["notConfigured", "unavailable"];
    else ui.facets.states = [];
  }

  /* ------------------------------------------------------------------ search */

  function searchField(where) {
    var wrap = el("div", "f11-searchwrap f11-searchwrap--" + where);
    var field = el("div", "f11-searchfield");
    field.innerHTML = icon("search", 15);

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
      field.appendChild(button("f11-searchclear", icon("ban", 13), function () {
        ui.query = ""; ui.results = null; ui.dropOpen = false;
        withoutRender(function () { RT.replace({ kind: "home" }); });
        render();
      }));
    }
    wrap.appendChild(field);

    var drop = el("div", "f11-drop f11-scroll");
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
      /* The query lives in the route so Back from a chosen result returns to the query
       * AND the result that was chosen, rather than to a blank Home. Written quietly:
       * re-rendering here would rebuild the field under the caret. */
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
      var empty = el("div", "f11-drop-empty");
      empty.innerHTML = "Nothing matches <b>" + esc(ui.query) + "</b>.";
      empty.appendChild(el("p", "f11-result-path",
        "Try a shorter word, or open a category tab above. Search covers every one of the " +
        M.counts.settings + " settings in this Project, including the ones this host cannot provide."));
      drop.appendChild(empty);
      return;
    }

    var scroll = el("div", "f11-drop-scroll f11-scroll");
    var index = 0;
    res.groups.forEach(function (group) {
      var g = el("div", "f11-drop-group");
      g.appendChild(el("div", "f11-drop-label", esc(group.label)));
      group.results.forEach(function (r) {
        var my = index++;
        var b = button("f11-result" + (my === ui.activeResult ? " is-active" : ""), null,
          function () { chooseResult(r.id); });
        b.setAttribute("data-pm-result", r.id);
        var top = el("div", "f11-result-top");
        top.appendChild(el("span", "f11-result-label", esc(r.label)));
        top.appendChild(el("span", "f11-result-type", esc(r.typeLabel)));
        b.appendChild(top);
        b.appendChild(el("div", "f11-result-path", esc(r.path)));
        if (r.availability) b.appendChild(el("div", "f11-result-why", esc(r.availability)));
        g.appendChild(b);
      });
      scroll.appendChild(g);
    });
    drop.appendChild(scroll);

    var foot = el("div", "f11-drop-foot");
    foot.appendChild(el("span", null, esc(res.shown + " of " + res.total + " matches")));
    if (res.truncated) {
      foot.appendChild(button("f11-drop-more", "See them all in All settings", function () {
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
    withoutRender(function () { RT.replace({ kind: "query", query: ui.query, resultId: resultId }); });
    ui.pending = { result: result, query: ui.query };
    RT.go(destinationRoute(result.destination));
  }

  function destinationRoute(d) {
    if (d.managerId) {
      return { kind: "manager", managerId: d.managerId, objectId: d.objectId || null,
        sectionKey: d.sectionKey || null, rowId: d.rowId || null };
    }
    return { kind: "domain", domainId: d.domainId, pageId: d.pageId,
      sectionId: d.sectionId, settingId: d.settingId };
  }

  /* -------------------------------------------------------------------- home */

  function renderHome(inner, route) {
    var fx = ST.effects();

    var hero = el("div", "f11-hero");
    hero.appendChild(el("h2", "f11-hero-title", "Settings"));
    hero.appendChild(el("p", "f11-hero-sub",
      "Everything in these tabs applies to " + esc(M.project.name) +
      ". Changing something here changes it for this Project only."));
    hero.appendChild(searchField("hero"));
    inner.appendChild(hero);

    var notice = ST.notice();
    if (notice && !store.isDismissed(notice.id)) inner.appendChild(renderNotice(notice));

    if (ui.homeTab === "attention") {
      inner.appendChild(sectionPanel("Notices", attentionList(fx)));
      return;
    }
    if (ui.homeTab === "recent") {
      inner.appendChild(sectionPanel("Recent changes in this Project", recentList(120)));
      return;
    }

    var att = attentionList(fx);
    inner.appendChild(sectionPanel("Notices", att));

    var grid = el("div", "f11-tiles");
    M.domains.forEach(function (d) {
      var tile = button("f11-tile", null, function () { RT.go({ kind: "domain", domainId: d.id }); });
      tile.setAttribute("data-pm-domain", d.id);
      tile.appendChild(el("span", "f11-tile-ico", icon(d.icon, 17)));
      var body = el("div", "f11-tile-body");
      body.appendChild(el("div", "f11-tile-title", esc(d.title)));
      body.appendChild(el("div", "f11-tile-meta",
        plural(d.pages.length, "page") + (d.families.length ? " · " + plural(d.families.length, "manager") : "") +
        (fx.refreshing ? " · refreshing" : "")));
      tile.appendChild(body);
      tile.appendChild(el("span", "f11-tile-count", String(d.count)));
      grid.appendChild(tile);
    });
    inner.appendChild(sectionBlock("The 12 categories", grid,
      M.counts.settings + " settings across " + M.counts.pages + " pages. Every category is also a tab above."));

    inner.appendChild(sectionPanel("Recent changes", recentList(6)));
  }

  function sectionBlock(title, node, note) {
    var box = el("div", "f11-head");
    var wrap = el("section");
    wrap.style.display = "flex";
    wrap.style.flexDirection = "column";
    wrap.style.gap = "var(--pm-space-2)";
    wrap.appendChild(el("div", "f11-secttitle", esc(title)));
    if (note) wrap.appendChild(el("p", "f11-tile-meta", esc(note)));
    wrap.appendChild(node);
    box.appendChild(wrap);
    return box;
  }

  function sectionPanel(title, node) {
    var panel = el("section", "f11-panel");
    panel.appendChild(el("div", "f11-secttitle", esc(title)));
    panel.appendChild(node);
    return panel;
  }

  function renderNotice(notice) {
    var box = el("div", "f11-notice");
    box.innerHTML = icon("alert", 16);
    var body = el("div", "f11-notice-body");
    body.appendChild(el("div", "f11-notice-head", esc(notice.headline)));
    body.appendChild(el("p", "f11-notice-detail", esc(notice.detail)));
    box.appendChild(body);
    var acts = el("div", "f11-notice-act");
    if (notice.action) {
      acts.appendChild(button("f11-btn", esc(notice.action.label), function () {
        RT.go(destinationRoute(notice.action.destination));
      }));
    }
    acts.appendChild(button("f11-iconbtn", icon("ban", 13), function () {
      store.dismiss(notice.id); render();
    }));
    box.appendChild(acts);
    return box;
  }

  function attentionList(fx) {
    var items = ST.attentionFlat().filter(function (a) { return !store.isDismissed(a.id); });
    var box = el("div", "f11-attn-list");
    if (!items.length) {
      box.appendChild(el("p", "f11-attn-empty", fx.noAttention
        ? "Nothing is configured yet, so there is nothing to fix. Start with the AI Brains & Providers tab."
        : "Nothing needs attention in this Project right now."));
      return box;
    }
    items.forEach(function (a) {
      /* `01_CORE_ARCHITECTURE` § Notices: three separated runs. What is broken, what
       * is half-finished and what is only advice are read differently, and one toned
       * list makes an unfinished setup look like a fault. */
      if (a.groupLabel) box.appendChild(el("div", "f11-attn-group", esc(a.groupLabel)));
      var b = button("f11-attn", null, function () { RT.go(destinationRoute(a.destination)); });
      var dot = el("span", "f11-attn-dot");
      dot.setAttribute("data-tone", a.tone);
      b.appendChild(dot);
      var body = el("div", "f11-attn-body");
      body.appendChild(el("div", "f11-attn-label", esc(a.label)));
      body.appendChild(el("div", "f11-attn-detail", esc(a.detail)));
      b.appendChild(body);
      b.appendChild(el("span", "f11-attn-act", esc(a.actionLabel)));
      box.appendChild(b);
    });
    return box;
  }

  /* ------------------------------------------------------- recent changes */

  var AUTHORS = ["You", "Jordan", "Alex", "Priya", "Sam"];

  /* Two sources, in this order: what the reader changed in this session (real, from
   * the store, always "You"), then the Project's own change log. Both carry the same
   * four columns the reference asked for — what, where, when, who — because a change
   * you cannot attribute is not much of a record. */
  function recentEntries(limit) {
    var out = [];
    var remembered = store.get().recent || [];
    remembered.forEach(function (r) {
      var rec = M.setting(r.id);
      if (!rec) return;
      out.push({
        id: r.id, label: rec.label, path: pathOf(rec), who: "You",
        minutes: Math.max(0, Math.round((Date.now() - (r.at || Date.now())) / 60000)),
        from: r.from, to: r.to, mine: true
      });
    });

    var fx = ST.effects();
    var settings = M.settings;
    var log = [];
    for (var i = 0; i < settings.length && log.length < 80; i++) {
      var rec2 = settings[i];
      if (rec2.state.source !== "custom") continue;
      var s = seed(rec2.id);
      log.push({
        id: rec2.id, label: rec2.label, path: pathOf(rec2),
        who: AUTHORS[s % AUTHORS.length],
        minutes: 8 + (s % 2600),
        from: String(rec2.state.defaultValue), to: String(rec2.state.value), mine: false
      });
    }
    log.sort(function (a, b) { return a.minutes - b.minutes; });
    if (fx.changedElsewhere && log.length) {
      log[0] = Object.assign({}, log[0], { who: "another window", minutes: 1, elsewhere: true });
    }
    out = out.concat(log);
    return out.slice(0, limit);
  }

  function pathOf(rec) {
    var d = M.domain(rec.domainId);
    var p = M.page(rec.pageId);
    return (d ? d.title : rec.domainId) + " › " + (p ? p.title : rec.pageId);
  }

  function ago(minutes) {
    if (minutes < 1) return "just now";
    if (minutes < 60) return minutes + "m ago";
    if (minutes < 60 * 24) return Math.round(minutes / 60) + "h ago";
    return Math.round(minutes / (60 * 24)) + "d ago";
  }

  function recentList(limit) {
    var box = el("div", "f11-recent");
    var rows = recentEntries(limit);
    if (!rows.length) {
      box.appendChild(el("p", "f11-attn-empty", "Nothing in this Project has been changed from its default yet."));
      return box;
    }
    rows.forEach(function (r) {
      var b = button("f11-recent-row", null, function () {
        var rec = M.setting(r.id);
        if (!rec) return;
        ui.pending = { settingId: r.id, reason: "Opened from Recent changes" };
        RT.go({ kind: "domain", domainId: rec.domainId, pageId: rec.pageId,
          sectionId: rec.sectionId, settingId: rec.id });
      });
      var what = el("div", "f11-recent-what");
      what.appendChild(el("span", null, esc(r.label)));
      if (r.from !== undefined && r.to !== undefined && String(r.from) !== String(r.to)) {
        what.appendChild(el("span", "f11-recent-delta",
          "  " + esc(shortVal(r.from)) + " → " + esc(shortVal(r.to))));
      }
      b.appendChild(what);
      b.appendChild(el("div", "f11-recent-where", esc(r.path)));
      b.appendChild(el("div", "f11-recent-when", esc(ago(r.minutes))));
      b.appendChild(el("div", "f11-recent-who", esc(r.elsewhere ? "in another window" : "by " + r.who)));
      box.appendChild(b);
    });
    return box;
  }

  function shortVal(v) {
    var s = String(v === "" || v == null ? "not set" : v);
    return s.length > 18 ? s.slice(0, 17) + "…" : s;
  }

  /* --------------------------------------------------------------- arrivals */

  /* The reveal happens inside the tab stack that is already on screen: the category
   * tab and the sub-tab select themselves from the route, the sheet cross-slides in,
   * and the destination row takes one calm ring. Nothing blinks and nothing opens a
   * page of its own. */
  function revealPending() {
    var pending = ui.pending;
    var route = RT.current();
    ui.pending = null;

    var targetId = null;
    var note = null;
    if (pending && pending.result) {
      var d = pending.result.destination;
      targetId = d.settingId || d.objectId || d.sectionId || d.managerId;
      note = "Found from your search for “" + (pending.query || ui.query) + "”";
    } else if (pending && pending.settingId) {
      targetId = pending.settingId;
      note = pending.reason || null;
    } else if (route.settingId) targetId = route.settingId;
    else if (route.objectId) targetId = route.objectId;
    /* `01_CORE_ARCHITECTURE` § Settings Workspace item 3: "The requested
     * subcategory/setting/manager scrolls into view." A section-level link names no
     * row, so without this branch it landed at the top of the page and the group the
     * reader asked for sat a screen and a half below the fold. */
    else if (route.sectionId) targetId = route.sectionId;
    if (!targetId || !sheetEl) return;

    var node = sheetEl.querySelector('[data-pm-row="' + cssEscape(targetId) + '"]') ||
      sheetEl.querySelector('[data-pm-object="' + cssEscape(targetId) + '"]') ||
      sheetEl.querySelector('[data-pm-section="' + cssEscape(targetId) + '"]') ||
      sheetEl.querySelector('[data-pm-manager="' + cssEscape(targetId) + '"]');
    if (!node) return;

    var previous = sheetEl.querySelectorAll("[data-pm-locator]");
    for (var i = 0; i < previous.length; i++) previous[i].removeAttribute("data-pm-locator");
    node.setAttribute("data-pm-locator", "1");
    /* A jump asked for this group: hold the on-page index on it until the reader
     * scrolls, rather than letting the measurement name a neighbour. */
    if (window.PM2Spy && window.PM2Spy.pinNode) window.PM2Spy.pinNode(node);

    if (note && node.parentNode) {
      var via = el("div", "f11-arrival");
      via.innerHTML = icon("search", 12) + "<span>" + esc(note) + "</span>";
      node.parentNode.insertBefore(via, node);
    }

    /* Instant and container-scoped. Every arrival follows a full re-render, so a
     * smooth scroll would animate from the top of a sheet the reader never saw, and
     * scrollIntoView would move the app frame as well as the sheet. */
    var box = node.getBoundingClientRect();
    var portBox = sheetEl.getBoundingClientRect();
    var delta = box.top - portBox.top - Math.max(20, (portBox.height - box.height) / 3);
    if (Math.abs(delta) > 4) sheetEl.scrollTop += delta;

    var focusTarget = node.querySelector("[data-pm-control]") || node;
    if (focusTarget.focus) focusTarget.focus({ preventScroll: true });

    shell.announce("Opened " + (node.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80));
  }

  /* -------------------------------------------------------------- keyboard */

  /* Escape closes the innermost thing and stops at Settings Home. It never closes
   * Settings: a reader pressing Escape twice should not lose the whole page. */
  function onKeydown(e) {
    if (e.key !== "Escape") return;
    if (ui.dropOpen) { ui.dropOpen = false; render(); e.stopPropagation(); return; }
    var openDetail = Object.keys(ui.openDetails).filter(function (k) { return ui.openDetails[k]; });
    if (openDetail.length) { ui.openDetails = {}; render(); e.stopPropagation(); return; }
    var route = RT.current();
    if (route.kind === "home") return;
    var back = backTarget(route);
    RT.go(back.dest);
    e.stopPropagation();
  }

  /* ----------------------------------------------------------------- domain */

  /* The domain sheet is the "Overview" sub-tab: what the category is for, the pages
   * it holds, and the strip of managers that live in it. The pages are also the
   * sub-tabs above, so this sheet is a description of the row above it rather than a
   * second navigation system competing with it. */
  function renderDomain(inner, route) {
    var d = M.domain(route.domainId);
    if (!d) return;

    var head = el("header", "f11-head");
    head.appendChild(el("h2", "f11-head-title", esc(d.title)));
    head.appendChild(el("p", "f11-head-purpose", esc(d.purpose)));
    head.appendChild(el("div", "f11-head-counts",
      plural(d.count, "setting") + " across " + plural(d.pages.length, "page") +
      (d.families.length ? ", plus " + plural(d.families.length, "manager") : "")));
    inner.appendChild(head);

    var pages = el("div");
    d.pages.forEach(function (p) {
      var b = button("f11-dest", null, function () {
        RT.go({ kind: "domain", domainId: d.id, pageId: p.id });
      });
      b.setAttribute("data-pm-page", p.id);
      b.appendChild(el("span", "f11-dest-ico", icon("fileText", 15)));
      var body = el("div", "f11-dest-body");
      body.appendChild(el("div", "f11-dest-title", esc(p.title)));
      body.appendChild(el("div", "f11-dest-sub", esc(p.summary)));
      b.appendChild(body);
      b.appendChild(el("span", "f11-dest-meta", plural(p.count, "setting")));
      b.appendChild(el("span", "f11-dest-chev", icon("chevronRight", 14)));
      pages.appendChild(b);
    });
    inner.appendChild(sectionPanel("Pages in this category — each one is a tab above", pages));

    if (d.families.length) {
      var strip = el("div", "f11-strip");
      d.families.forEach(function (f) {
        var rec = MG.record(f.managerId) || {};
        var b = button("f11-stripitem", null, function () {
          RT.go({ kind: "manager", managerId: f.managerId });
        });
        b.setAttribute("data-pm-manager", f.managerId);
        b.appendChild(el("span", "f11-dest-ico", icon(rec.icon || "sliders", 15)));
        var body = el("div", "f11-stripitem-body");
        body.appendChild(el("div", "f11-stripitem-title", esc(rec.title || f.family)));
        body.appendChild(el("div", "f11-stripitem-sub", esc(rec.purpose || f.family)));
        body.appendChild(el("div", "f11-stripitem-sub",
          esc(f.deferred ? "Owned by " + f.owner : archetypeWord(f.archetype))));
        b.appendChild(body);
        strip.appendChild(b);
      });
      inner.appendChild(sectionBlock("Related managers",
        strip, "Opening one keeps both tab rows above exactly where they are; it joins the second row as its own tab."));
    }
  }

  /* ------------------------------------------------------------------- page */

  function renderPage(inner, route) {
    var d = M.domain(route.domainId);
    var p = M.page(route.pageId);
    if (!d || !p) return;

    var head = el("header", "f11-head");
    head.appendChild(el("h2", "f11-head-title", esc(p.title)));
    head.appendChild(el("p", "f11-head-purpose", esc(p.summary)));
    head.appendChild(el("div", "f11-head-counts",
      plural(p.count, "setting") + " in " + plural(p.sections.length, "group") + " · " + esc(d.title)));
    inner.appendChild(head);

    var fx = ST.effects();
    if (fx.restartPending) {
      inner.appendChild(quietNote("Two changes on this Project are waiting for a restart",
        "They are saved. Puppet Master will apply them the next time it starts, and the rows they belong to say so."));
    }

    /* A deep link to an advanced row must open the disclosure that holds it —
     * landing on a collapsed group would be a link that lies. */
    if (route.settingId) {
      var target = M.setting(route.settingId);
      if (target) ui.openAdvanced[target.sectionId] = true;
    }

    /* An index of this page's own groups that follows the scroll, not only the click.
     * `01_CORE_ARCHITECTURE` item 4 and the navigation video both ask for the highlight
     * to move as the reader scrolls; an index that only responds to clicks can say
     * where you asked to go but never where you are. */
    var __idx = el("nav", "f11-onpage");
    __idx.setAttribute("aria-label", "On this page");
    __idx.appendChild(el("span", "f11-onpage-label", "On this page"));
    var __built = [];
    p.sections.forEach(function (section) {
      var __b = document.createElement("button");
      __b.type = "button";
      __b.className = "f11-onpage-item";
      __b.textContent = section.title;
      __b.setAttribute("data-onpage", section.id);
      __b.addEventListener("click", function () {
        var el2 = document.querySelector('[data-pm-section="' + section.id.replace(/"/g, '\\"') + '"]');
        if (el2 && el2.scrollIntoView) el2.scrollIntoView({ block: "start" });
      });
      __idx.appendChild(__b);
    });
    if (p.sections.length > 1) inner.appendChild(__idx);

    p.sections.forEach(function (section) {
      var __node = renderSection(section, route);
      inner.appendChild(__node);
      __built.push({ id: section.id, title: section.title, pageId: p.id, el: __node });
    });

    /* Deferred one frame: at this point the surface is still being assembled and is not
     * yet in the document, so walking up from a section would find no scrolling ancestor
     * and silently fall back to the page body — which is why the highlight never moved. */
    if (window.PM2Spy && __built.length) window.requestAnimationFrame(function () {
      var __scroller = inner;
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

  function quietNote(head, body) {
    var box = el("div", "f11-note");
    box.appendChild(el("div", "f11-row-title", esc(head)));
    box.appendChild(el("p", "f11-row-desc", esc(body)));
    return box;
  }

  function renderSection(section, route) {
    var box = el("section", "f11-section");
    box.setAttribute("data-pm-section", section.id);

    var head = el("div", "f11-section-head");
    head.appendChild(el("h3", "f11-section-title", esc(section.title)));
    head.appendChild(el("span", "f11-section-count", plural(section.count, "setting")));
    box.appendChild(head);

    var rows = M.rowsInSection(section.id);
    var standard = [];
    var deeper = [];
    rows.forEach(function (r) {
      if (M.exposureRank(r.exposure) === 0) standard.push(r); else deeper.push(r);
    });

    standard.forEach(function (r) { box.appendChild(renderRow(r)); });

    if (deeper.length) {
      var open = !!ui.openAdvanced[section.id];
      if (open) deeper.forEach(function (r) { box.appendChild(renderRow(r)); });
      var foot = el("div", "f11-row");
      var toggle = button("f11-why", (open ? "Hide" : "Show") + " " +
        plural(deeper.length, "deeper setting") + " in this group", function () {
        ui.openAdvanced[section.id] = !open;
        render();
      });
      foot.appendChild(toggle);
      box.appendChild(foot);
    }
    return box;
  }

  function renderRow(rec) {
    var state = ST.rowState(rec);
    var row = el("div", "f11-row");
    row.setAttribute("data-pm-row", rec.id);
    row.tabIndex = -1;
    var editable = M.isEditable(state);
    if (!editable) row.setAttribute("data-locked", "true");

    var main = el("div", "f11-row-main");
    var label = el("div", "f11-row-label");
    label.appendChild(el("span", "f11-row-title", esc(rec.label)));

    var tone = M.stateTone(state);
    if (tone !== "quiet") {
      var tag = el("span", "f11-tag", esc(M.stateLabel(state)));
      tag.setAttribute("data-tone", tone);
      label.appendChild(tag);
    } else if (store.changed(rec.id)) {
      var ch = el("span", "f11-tag", "Changed here");
      ch.setAttribute("data-tone", "changed");
      label.appendChild(ch);
    }
    if (state.restart === "required") {
      var rs = el("span", "f11-tag", "Restart");
      rs.setAttribute("data-tone", "setup");
      label.appendChild(rs);
    }
    main.appendChild(label);
    main.appendChild(el("p", "f11-row-desc", esc(rec.desc)));

    var reason = M.stateReason(state);
    if (reason || rec.badges.length || rec.legacyScope.length) {
      var openDet = !!ui.openDetails[rec.id];
      main.appendChild(button("f11-why", openDet ? "Hide details" : "Why this value?", function () {
        ui.openDetails[rec.id] = !openDet;
        render();
      }));
      if (openDet) main.appendChild(rowDetails(rec, state, reason));
    }
    if (ui.errors[rec.id]) main.appendChild(el("div", "f11-err", esc(ui.errors[rec.id])));

    row.appendChild(main);
    row.appendChild(renderControl(rec, state, editable));
    return row;
  }

  function rowDetails(rec, state, reason) {
    var box = el("div", "f11-details");
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

  /* Controls do real work: every change lands in the store, which is what makes the
   * "Changed here" tag, the Recent changes list and the copy preview truthful rather
   * than decorative. */

  /* The Puppet Master Model/Mode selector idiom: a trigger carrying the current value,
   * and a menu that hangs beneath it — or flips above when the row sits near the bottom
   * of the page, which is what the model picker in the bottom bar does. Placement,
   * layering and one-layer-at-a-time Escape come from PM2Menu; every pixel is this
   * concept's own. */
  function pmPicker(rec, options, value, onPick) {
    var wrap = el("div", "f11-picker");
    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "f11-picker-trigger";
    trigger.setAttribute("data-pm-control", rec.id);
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", rec.label);
    var valueEl = document.createElement("span");
    valueEl.className = "f11-picker-value";
    valueEl.textContent = String(value === "" || value == null ? "Not set" : value);
    trigger.appendChild(valueEl);
    var chev = document.createElement("span");
    chev.className = "f11-picker-chev";
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
      row.className = "f11-menu-item";
      row.setAttribute("role", "option");
      row.setAttribute("data-opt", String(i));
      row.setAttribute("aria-selected", o === value ? "true" : "false");
      var mark = document.createElement("span");
      mark.className = "f11-menu-check";
      mark.innerHTML = o === value ? window.PMIcons.icon("check", 12) : "";
      row.appendChild(mark);
      var lab = document.createElement("span");
      lab.className = "f11-menu-label";
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
      row.className = "f11-menu-item is-parent";
      row.setAttribute("role", "option");
      row.setAttribute("data-opt", String(i));
      row.setAttribute("aria-haspopup", "menu");
      row.setAttribute("aria-expanded", "false");
      var mark = document.createElement("span");
      mark.className = "f11-menu-check";
      mark.innerHTML = g.options.indexOf(value) >= 0 ? window.PMIcons.icon("check", 12) : "";
      row.appendChild(mark);
      var lab = document.createElement("span");
      lab.className = "f11-menu-label";
      lab.textContent = String(g.label);
      row.appendChild(lab);
      var more = document.createElement("span");
      more.className = "f11-menu-more";
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
        sub.className = "f11-menu f11-submenu";
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
      panel.className = "f11-menu";
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
    var box = el("div", "f11-row-control");
    var value = store.valueOf(rec.id);
    if (value === undefined) value = state.value;

    function commit(next) {
      var before = value;
      store.setValue(rec.id, next);
      store.remember({ id: rec.id, at: Date.now(), from: before, to: next });
      delete ui.errors[rec.id];
      MG.invalidate();
      render();
    }

    if (!editable) {
      box.appendChild(el("span", "f11-listval f11-listval-empty",
        state.source === "unavailable" ? "Not available on this host"
          : esc(String(value === "" ? "not set" : value))));
      return box;
    }

    if (rec.kind === "toggle") {
      var t = button("f11-toggle", "", function () { commit(!value); });
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
      box.appendChild(pmPicker(rec, opts, value, commit));
      return box;
    }

    if (rec.kind === "number") {
      var n = el("input", "f11-input");
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
          ui.errors[rec.id] = "This cannot be negative. Nothing was saved and what you typed was kept.";
          render();
          return;
        }
        commit(num);
      });
      box.appendChild(n);
      return box;
    }

    if (rec.kind === "slider") {
      var r = el("input", "f11-range");
      r.type = "range";
      r.min = "0";
      r.max = String(Math.max(100, Number(state.defaultValue) * 2 || 100));
      r.value = String(Number(value) || 0);
      r.setAttribute("data-pm-control", rec.id);
      r.setAttribute("aria-label", rec.label);
      var out = el("span", "f11-rangeval", esc(String(value)));
      on(r, "input", function () { out.textContent = r.value; });
      on(r, "change", function () { commit(Number(r.value)); });
      box.appendChild(r);
      box.appendChild(out);
      return box;
    }

    if (rec.kind === "text" || rec.kind === "path") {
      var i = el("input", "f11-input");
      i.type = "text";
      i.value = value == null ? "" : String(value);
      i.placeholder = state.source === "notConfigured" ? "Not set" : "";
      i.setAttribute("data-pm-control", rec.id);
      i.setAttribute("aria-label", rec.label);
      if (window.PMSpellcheck && window.PMSpellcheck.attach && rec.kind === "text") {
        window.PMSpellcheck.attach(i);
      }
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
      var a = button("f11-btn", esc(state.setupLabel || "Run"), function () {
        window.PMSim.run({
          label: rec.label,
          detail: rec.desc,
          realCall: "cmd.settings.action.run",
          payload: { settingId: rec.id, project: M.project.id }
        });
        shell.announce(rec.label + " — a receipt is in the notification inbox.");
      });
      a.setAttribute("data-pm-control", rec.id);
      box.appendChild(a);
      return box;
    }

    /* list / multiselect / keyvalue: a summary plus an editor, so a page of these does
     * not become a wall of text areas. */
    var list = Array.isArray(value) ? value : (value ? [String(value)] : []);
    box.appendChild(el("span", "f11-listval" + (list.length ? "" : " f11-listval-empty"),
      list.length ? esc(list.slice(0, 2).join(", ") + (list.length > 2 ? " +" + (list.length - 2) + " more" : ""))
        : "Nothing set"));
    var edit = button("f11-btn", "Edit", function () {
      var next = window.prompt("One entry per line — " + rec.label, list.join("\n"));
      if (next == null) return;
      commit(next.split("\n").map(function (x) { return x.replace(/^\s+|\s+$/g, ""); })
        .filter(function (x) { return !!x; }));
    });
    edit.setAttribute("data-pm-control", rec.id);
    box.appendChild(edit);
    return box;
  }

  /* --------------------------------------------------------------- managers */

  /* One entry point for all fifty destinations. It branches on the archetype rather
   * than on the manager id, so a roster is never flattened into preference rows and a
   * read-only projection never grows editable controls — and the provider manager,
   * the one surface the seven designs are meant to disagree about, is written
   * bespoke rather than falling out of a generic template. */
  function renderManagerSurface(inner, route) {
    /* Hydration happens here and only here: opening a manager is the moment its spec
     * is built. Search, Home and the tab labels use MG.record(), which builds nothing. */
    var spec = ST.decorate(MG.spec(route.managerId, store.get()));
    var family = M.familyOf(route.managerId) || {};
    var ctx = { managerId: route.managerId, route: route, family: family, spec: spec };

    var head = el("header", "f11-head");
    head.appendChild(el("h2", "f11-head-title", esc(spec.title)));
    head.appendChild(el("p", "f11-head-purpose", esc(spec.purpose)));
    var domain = family.domainId ? M.domain(family.domainId) : null;
    head.appendChild(el("div", "f11-head-counts",
      archetypeWord(spec.archetype) + (domain ? " · " + domain.title : "") +
      (family.deferred ? " · owned by " + family.owner : "")));
    inner.appendChild(head);

    root.setAttribute("data-pane", narrow && route.objectId ? "detail" : "roster");

    if (spec.deferred && spec.owner) inner.appendChild(ownerBlock(spec.owner, route.managerId));
    if (spec.health && (spec.health.headline || spec.health.statusWord)) {
      inner.appendChild(healthBlock(spec.health));
    }

    renderManager(spec, ctx, inner);

    if (spec.notes && spec.notes.length) {
      var notes = el("div", "f11-note");
      spec.notes.forEach(function (n) { notes.appendChild(el("p", "f11-row-desc", esc(n))); });
      inner.appendChild(notes);
    }

    if (spec.diagnostics && spec.diagnostics.length) {
      var acts = el("div", "f11-actions");
      spec.diagnostics.forEach(function (d) {
        acts.appendChild(button("f11-btn", esc(d.label), function () { runAction(route.managerId, d); }));
      });
      inner.appendChild(sectionPanel("Diagnostics", acts));
    }
  }

  function renderManager(spec, ctx, inner) {
    var a = spec.archetype;
    if (ctx.managerId === "manager-providers") return renderProviderManager(spec, ctx, inner);
    if (spec.deferred || a === "named owner insertion point") return renderOwnerManager(spec, ctx, inner);
    if (a === "resource roster and detail sheet" || a === "inventory catalogue") {
      var roster = pickRoster(spec);
      if (roster) return renderRosterManager(spec, ctx, inner, roster);
    }
    if (a === "setup or repair sequence") return renderSequenceManager(spec, ctx, inner);
    if (a === "read-only health projection") return renderProjectionManager(spec, ctx, inner);
    if (a === "diagnostic drawer") return renderDrawerManager(spec, ctx, inner);
    if (a === "preview and confirmation transaction") return renderTransactionManager(spec, ctx, inner);
    return renderDocumentManager(spec, ctx, inner);
  }

  /* A roster is only a roster when the archetype says the manager is about objects. A
   * preference document with one incidental list must not be forced into a two-pane
   * layout it does not want. */
  function pickRoster(spec) {
    var best = null;
    (spec.sections || []).forEach(function (s) {
      if (s.kind !== "list" && s.kind !== "cards") return;
      if (!best || (s.items || []).length > (best.items || []).length) best = s;
    });
    return best && (best.items || []).length > 1 ? best : null;
  }

  /* --------------------------------------------------------- object identity */

  /* The index and a manager spec do not always agree on an object's id: the spec may
   * prefix it for its own uniqueness. A search result addresses the index's id, so
   * that is the id the DOM must carry, or a perfectly good link lands nowhere. The
   * spec's id is preferred whenever the index knows it. */
  var objectAliasCache = {};

  function objectAliases(managerId) {
    if (objectAliasCache[managerId]) return objectAliasCache[managerId];
    var map = {};
    /* Reads the already-built search index; it never builds a manager. */
    IX.records().forEach(function (r) {
      if (r.kind !== "object" || !r.destination || r.destination.managerId !== managerId) return;
      if (r.destination.rowId) return;
      var key = String(r.label || "").toLowerCase();
      if (!map[key]) map[key] = r.destination.objectId;
    });
    objectAliasCache[managerId] = map;
    return map;
  }

  function objectIdFor(managerId, item) {
    if (!item || !item.id) return null;
    if (IX.objectExists && IX.objectExists(managerId, item.id)) return item.id;
    var alias = objectAliases(managerId)[String(item.name || "").toLowerCase()];
    return alias || item.id;
  }

  /* ------------------------------------------------ roster and detail sheet */

  function renderRosterManager(spec, ctx, inner, roster) {
    var route = ctx.route;
    var items = roster.items || [];
    var ids = items.map(function (it) { return objectIdFor(ctx.managerId, it); });

    /* A routed object may live on a subpage rather than in the roster. When it does
     * the roster keeps its own selection and the subpage holding the object is the
     * tab that opens, so the link lands on the row it named. */
    var routedIndex = route.objectId ? ids.indexOf(route.objectId) : -1;
    var elsewhere = route.objectId && routedIndex < 0 ? sectionHolding(spec, ctx.managerId, route.objectId) : null;

    var selectedId = routedIndex >= 0 ? route.objectId
      : (ui.mgrObject[ctx.managerId] && ids.indexOf(ui.mgrObject[ctx.managerId]) >= 0
        ? ui.mgrObject[ctx.managerId] : ids[0]);
    ui.mgrObject[ctx.managerId] = selectedId;

    var mgr = el("div", "f11-mgr");
    mgr.appendChild(rosterPane(roster, items, ids, selectedId, ctx));

    var detail = el("div", "f11-mgr-detail");
    var item = items[ids.indexOf(selectedId)];
    var others = (spec.sections || []).filter(function (s) { return s !== roster; });
    var current = (elsewhere && elsewhere.id) || route.sectionKey || "overview";
    if (current !== "overview" && !others.some(function (s) { return s.id === current; })) current = "overview";

    var dhead = el("div", "f11-mgr-detail-head");
    var dbody = el("div", "f11-stripitem-body");
    dbody.appendChild(el("h3", "f11-mgr-detail-title", esc(item ? item.name : roster.label)));
    if (item && item.secondary) dbody.appendChild(el("div", "f11-mgr-detail-sub", esc(item.secondary)));
    dhead.appendChild(dbody);
    if (item && item.statusWord) {
      var st = el("span", "f11-tag", esc(item.statusWord));
      st.setAttribute("data-tone", toneOf(item.status));
      dhead.appendChild(st);
    }
    detail.appendChild(dhead);

    /* Level three: the smallest and lightest of the three tab rows, and the only one
     * that lives inside a sheet rather than above it. */
    var strip = el("div", "f11-tabs--3 f11-scroll");
    strip.setAttribute("role", "tablist");
    strip.setAttribute("aria-label", "Pages of this " + (item ? "item" : "manager"));
    strip.appendChild(tabButton(null, "Overview", current === "overview", function () {
      RT.go({ kind: "manager", managerId: ctx.managerId, objectId: selectedId, sectionKey: "overview" });
    }));
    others.forEach(function (s) {
      strip.appendChild(tabButton(null, esc(s.label), current === s.id, function () {
        RT.go({ kind: "manager", managerId: ctx.managerId, objectId: selectedId, sectionKey: s.id });
      }));
    });
    detail.appendChild(strip);

    var body = el("div", "f11-mgr-body");
    if (current === "overview") {
      body.appendChild(objectOverview(item, ctx));
    } else {
      var section = others.filter(function (s) { return s.id === current; })[0];
      if (section) body.appendChild(renderSpecSection(section, ctx));
    }
    detail.appendChild(body);
    mgr.appendChild(detail);
    inner.appendChild(mgr);
  }

  function rosterPane(roster, items, ids, selectedId, ctx) {
    var side = el("div", "f11-mgr-roster");
    var rh = el("div", "f11-mgr-roster-head");
    rh.appendChild(el("span", null, esc(roster.label)));
    rh.appendChild(el("span", "f11-mgr-roster-count", String(items.length)));
    side.appendChild(rh);

    var list = el("div", "f11-mgr-roster-list f11-scroll");
    if (!items.length) {
      var e = roster.empty || {};
      var empty = el("div", "f11-empty");
      empty.appendChild(el("div", "f11-empty-head", esc(e.headline || "Nothing here yet")));
      if (e.detail) empty.appendChild(el("p", null, esc(e.detail)));
      list.appendChild(empty);
    }
    items.forEach(function (it, i) {
      var oid = ids[i];
      var b = button("f11-obj", null, function () {
        ui.mgrObject[ctx.managerId] = oid;
        RT.go({ kind: "manager", managerId: ctx.managerId, objectId: oid });
      });
      b.setAttribute("data-pm-object", oid);
      b.setAttribute("aria-selected", oid === selectedId ? "true" : "false");
      var body = el("div", "f11-obj-body");
      body.appendChild(el("div", "f11-obj-name", esc(it.name)));
      if (it.secondary) body.appendChild(el("div", "f11-obj-sub", esc(it.secondary)));
      b.appendChild(body);
      if (it.statusWord) {
        var st = el("span", "f11-obj-status", esc(it.statusWord));
        st.setAttribute("data-tone", toneOf(it.status));
        b.appendChild(st);
      }
      list.appendChild(b);
    });
    side.appendChild(list);
    return side;
  }

  function toneOf(status) {
    if (status === "attention" || status === "risky") return "attention";
    if (status === "setup") return "setup";
    if (status === "managed") return "managed";
    if (status === "unavailable") return "unavailable";
    if (status === "ok" || status === "connected") return "ok";
    return "quiet";
  }

  function sectionHolding(spec, managerId, objectId) {
    var found = null;
    (spec.sections || []).forEach(function (s) {
      if (found) return;
      (s.items || []).forEach(function (it) {
        if (it.id === objectId || objectIdFor(managerId, it) === objectId) found = s;
      });
    });
    return found;
  }

  function objectOverview(item, ctx) {
    var box = el("div");
    box.style.display = "flex";
    box.style.flexDirection = "column";
    box.style.gap = "var(--pm-space-3)";
    if (!item) {
      box.appendChild(el("p", "f11-prose", "Nothing is selected in this list yet."));
      return box;
    }
    if (item.availability && item.availability.available === false) {
      box.appendChild(quietNote("Not available here", item.availability.reason +
        (item.availability.owner ? " Owned by " + item.availability.owner + "." : "")));
    }
    if (item.fields && Object.keys(item.fields).length) box.appendChild(fieldList(item.fields));
    if (item.badges && item.badges.length) {
      var tags = el("div", "f11-actions");
      item.badges.forEach(function (b) {
        var t = el("span", "f11-tag", esc(b.text));
        if (b.title) t.title = b.title;
        tags.appendChild(t);
      });
      box.appendChild(tags);
    }
    (item.detail || []).forEach(function (d) {
      var panel = el("div", "f11-note");
      panel.appendChild(el("div", "f11-row-title", esc(d.label)));
      var dl = el("dl", "f11-fields");
      (d.rows || []).forEach(function (r) {
        dl.appendChild(el("dt", null, esc(r.label)));
        var dd = el("dd", null, esc(String(r.value)));
        if (r.hint) dd.appendChild(el("div", "f11-row-desc", esc(r.hint)));
        dl.appendChild(dd);
      });
      panel.appendChild(dl);
      box.appendChild(panel);
    });
    if (item.editable && item.editable.length) box.appendChild(editableFields(item, ctx.managerId));
    if (item.actions && item.actions.length) box.appendChild(actionRow(item.actions, ctx.managerId, item));
    if (!box.childNodes.length) {
      box.appendChild(el("p", "f11-prose", esc(item.name + " has nothing further to configure here.")));
    }
    return box;
  }

  function fieldList(fields) {
    var dl = el("dl", "f11-fields");
    Object.keys(fields).forEach(function (k) {
      dl.appendChild(el("dt", null, esc(k)));
      dl.appendChild(el("dd", null, esc(String(fields[k]))));
    });
    return dl;
  }

  function actionRow(actions, managerId, item) {
    var acts = el("div", "f11-actions");
    actions.forEach(function (a) {
      acts.appendChild(button("f11-btn" + (a.kind === "primary" ? " f11-btn--primary" : ""),
        esc(a.label), function () { runAction(managerId, a, item); }));
    });
    return acts;
  }

  function editableFields(item, managerId) {
    var box = el("div", "f11-section");
    item.editable.forEach(function (f) {
      var row = el("div", "f11-row");
      var main = el("div", "f11-row-main");
      main.appendChild(el("div", "f11-row-title", esc(f.label)));
      if (f.help) main.appendChild(el("p", "f11-row-desc", esc(f.help)));
      row.appendChild(main);

      var ctl = el("div", "f11-row-control");
      var current = store.edit(managerId, item.id, f.key, f.value);
      if (f.secretKind) {
        /* Secret material is never rendered. The reference is shown, and the only
         * action offered is one that replaces it. */
        ctl.appendChild(el("span", "f11-listval", "Stored — never shown"));
        ctl.appendChild(button("f11-btn", "Replace", function () {
          window.PMSim.run({
            label: "Replace " + f.label,
            detail: "Opens the provider's own credential flow. No existing secret is read or displayed.",
            realCall: "cmd.provider.connection.authenticate"
          });
        }));
      } else if (f.kind === "toggle") {
        var t = button("f11-toggle", "", function () {
          store.setEdit(managerId, item.id, f.key, !current);
          MG.invalidate(managerId);
          render();
        });
        t.setAttribute("role", "switch");
        t.setAttribute("aria-checked", current ? "true" : "false");
        t.setAttribute("aria-label", f.label);
        ctl.appendChild(t);
      } else if (f.kind === "select" && f.options && f.options.length) {
        var s = el("select", "f11-select");
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
        var i = el("input", "f11-input");
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

  /* -------------------------------------------------------- generic sections */

  function renderSpecSection(section, ctx) {
    var box = el("section", "f11-section");
    var head = el("div", "f11-section-head");
    head.appendChild(el("h3", "f11-section-title", esc(section.label)));
    if ((section.items || []).length) {
      head.appendChild(el("span", "f11-section-count", String(section.items.length)));
    }
    box.appendChild(head);
    if (section.summary) {
      var s = el("div", "f11-row");
      s.appendChild(el("p", "f11-row-desc", esc(section.summary)));
      box.appendChild(s);
    }

    /* A section of ordinary settings is ordinary settings — the same rows, the same
     * controls, the same disclosure as anywhere else in Settings. */
    if (section.kind === "rows" && (section.settings || []).length) {
      section.settings.forEach(function (id) {
        var rec = M.setting(id);
        if (rec) box.appendChild(renderRow(rec));
      });
      return box;
    }

    var items = section.items || [];
    if (!items.length) {
      var e = section.empty || {};
      var empty = el("div", "f11-empty");
      empty.appendChild(el("div", "f11-empty-head", esc(e.headline || "Nothing here yet")));
      if (e.detail) empty.appendChild(el("p", null, esc(e.detail)));
      if (e.action) empty.appendChild(actionRow([e.action], ctx.managerId, null));
      box.appendChild(empty);
      return box;
    }

    if (section.kind === "prose") {
      var prose = el("div", "f11-row");
      var col = el("div", "f11-prose");
      items.forEach(function (i) { col.appendChild(el("p", null, esc(i.name))); });
      prose.appendChild(col);
      box.appendChild(prose);
      return box;
    }

    if (section.kind === "matrix" || section.kind === "table") {
      box.appendChild(specTable(section));
      return box;
    }

    items.forEach(function (item) { box.appendChild(specItemRow(item, ctx)); });
    if ((section.actions || []).length) {
      var footer = el("div", "f11-row");
      footer.appendChild(actionRow(section.actions, ctx.managerId, null));
      box.appendChild(footer);
    }
    return box;
  }

  function specTable(section) {
    var keys = [];
    (section.columns || []).forEach(function (c) { if (c.key) keys.push(c.key); });
    if (!keys.length) {
      section.items.forEach(function (i) {
        Object.keys(i.fields || {}).forEach(function (k) { if (keys.indexOf(k) < 0) keys.push(k); });
      });
    }
    var labels = {};
    (section.columns || []).forEach(function (c) { labels[c.key] = c.label; });

    var wrap = el("div", "f11-tablewrap f11-scroll");
    var table = el("table", "f11-table");
    var thead = el("thead");
    var tr = el("tr");
    tr.appendChild(el("th", null, "Item"));
    keys.forEach(function (k) { tr.appendChild(el("th", null, esc(labels[k] || k))); });
    thead.appendChild(tr);
    table.appendChild(thead);
    var tbody = el("tbody");
    section.items.forEach(function (i) {
      var r = el("tr");
      var first = el("td", null, esc(i.name));
      r.appendChild(first);
      keys.forEach(function (k) {
        r.appendChild(el("td", null, esc(String((i.fields || {})[k] == null ? "—" : i.fields[k]))));
      });
      tbody.appendChild(r);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    return wrap;
  }

  /* Every item a manager holds is addressable, not only the ones in a roster: a
   * search result may point at an installation that lives on a subpage, and it has to
   * be able to land on exactly that row. */
  function specItemRow(item, ctx) {
    var row = el("div", "f11-row");
    row.setAttribute("data-pm-object", objectIdFor(ctx.managerId, item));
    var main = el("div", "f11-row-main");
    var label = el("div", "f11-row-label");
    label.appendChild(el("span", "f11-row-title", esc(item.name)));
    if (item.statusWord) {
      var t = el("span", "f11-tag", esc(item.statusWord));
      t.setAttribute("data-tone", toneOf(item.status));
      label.appendChild(t);
    }
    main.appendChild(label);
    if (item.secondary) main.appendChild(el("p", "f11-row-desc", esc(item.secondary)));
    if (item.availability && item.availability.available === false) {
      main.appendChild(el("p", "f11-row-desc", esc(item.availability.reason)));
    }
    if (item.fields && Object.keys(item.fields).length) main.appendChild(fieldList(item.fields));
    (item.badges || []).forEach(function (b) {
      var tag = el("span", "f11-tag", esc(b.text));
      if (b.title) tag.title = b.title;
      label.appendChild(tag);
    });
    if (item.editable && item.editable.length) main.appendChild(editableFields(item, ctx.managerId));
    row.appendChild(main);

    var ctl = el("div", "f11-row-control");
    if ((item.actions || []).length) ctl.appendChild(actionRow(item.actions, ctx.managerId, item));
    row.appendChild(ctl);
    return row;
  }

  /* ------------------------------------------------- the provider manager */

  /* Written bespoke, because this is the one surface the seven concepts are meant to
   * disagree about. Folio's answer: a roster of families on the left and, on the
   * right, the third tab row — Overview, Credentials, Models, Limits, Usage,
   * Advanced. The default view answers the six questions people arrive with, in a
   * fixed order, and nothing else: connected state, selected account, models,
   * what happens when included usage ends, routing, and setup or repair. Credentials,
   * catalogues, limits, usage and installations are coordinated subpages behind that
   * third row, never one wall. No secret is ever rendered. */
  var PROVIDER_TABS = [
    { id: "overview", label: "Overview" },
    { id: "credentials", label: "Credentials" },
    { id: "models", label: "Models" },
    { id: "limits", label: "Limits" },
    { id: "usage", label: "Usage" },
    { id: "advanced", label: "Advanced" }
  ];

  var PROVIDER_TAB_OF = {
    overview: "overview", families: "overview", subpages: "overview",
    accounts: "credentials", credentials: "credentials", "sub-credentials": "credentials",
    models: "models", catalogues: "models", "sub-catalogues": "models",
    limits: "limits", routing: "limits", "sub-limits": "limits", "provider-rows": "limits",
    usage: "usage", "usage-end": "usage",
    installations: "advanced", logs: "advanced", diagnostics: "advanced",
    acquisition: "advanced", "sub-installations": "advanced", "sub-logs": "advanced"
  };

  function renderProviderManager(spec, ctx, inner) {
    function sec(id) {
      var found = null;
      (spec.sections || []).forEach(function (s) { if (s.id === id) found = s; });
      return found;
    }
    var families = sec("families");
    if (!families || !(families.items || []).length) {
      /* An empty Project still has to say what to do first, and the generic shapes
       * already do that honestly. */
      return renderDocumentManager(spec, ctx, inner);
    }

    var route = ctx.route;
    var items = families.items;
    var ids = items.map(function (it) { return objectIdFor(ctx.managerId, it); });
    var routedIndex = route.objectId ? ids.indexOf(route.objectId) : -1;
    var elsewhere = route.objectId && routedIndex < 0
      ? sectionHolding(spec, ctx.managerId, route.objectId) : null;

    var selectedId = routedIndex >= 0 ? route.objectId
      : (ui.mgrObject[ctx.managerId] && ids.indexOf(ui.mgrObject[ctx.managerId]) >= 0
        ? ui.mgrObject[ctx.managerId] : ids[0]);
    ui.mgrObject[ctx.managerId] = selectedId;
    var item = items[ids.indexOf(selectedId)];

    var current = "overview";
    if (elsewhere) current = PROVIDER_TAB_OF[elsewhere.id] || "advanced";
    else if (route.sectionKey) current = PROVIDER_TAB_OF[route.sectionKey] || "overview";

    var mgr = el("div", "f11-mgr");
    mgr.appendChild(rosterPane(families, items, ids, selectedId, ctx));

    var detail = el("div", "f11-mgr-detail");
    var dhead = el("div", "f11-mgr-detail-head");
    var dbody = el("div", "f11-stripitem-body");
    dbody.appendChild(el("h3", "f11-mgr-detail-title", esc(item.name)));
    if (item.secondary) dbody.appendChild(el("div", "f11-mgr-detail-sub", esc(item.secondary)));
    dhead.appendChild(dbody);
    if (item.statusWord) {
      var st = el("span", "f11-tag", esc(item.statusWord));
      st.setAttribute("data-tone", toneOf(item.status));
      dhead.appendChild(st);
    }
    detail.appendChild(dhead);

    var strip = el("div", "f11-tabs--3 f11-scroll");
    strip.setAttribute("role", "tablist");
    strip.setAttribute("aria-label", "Pages of this provider family");
    PROVIDER_TABS.forEach(function (t) {
      strip.appendChild(tabButton(null, esc(t.label), current === t.id, function () {
        RT.go({ kind: "manager", managerId: ctx.managerId, objectId: selectedId, sectionKey: t.id });
      }));
    });
    detail.appendChild(strip);

    var body = el("div", "f11-mgr-body");
    if (current === "overview") providerOverview(body, spec, ctx, item);
    else if (current === "credentials") providerCredentials(body, spec, ctx, item, sec);
    else if (current === "models") providerModels(body, spec, ctx, item, sec);
    else if (current === "limits") providerLimits(body, spec, ctx, item, sec);
    else if (current === "usage") providerUsage(body, spec, ctx, item, sec);
    else providerAdvanced(body, spec, ctx, item, sec);
    detail.appendChild(body);

    mgr.appendChild(detail);
    inner.appendChild(mgr);
  }

  function subpageItem(sec, id) {
    var s = sec("subpages");
    var found = null;
    if (s) (s.items || []).forEach(function (i) { if (i.id === id) found = i; });
    return found;
  }

  function providerOverview(body, spec, ctx, item) {
    body.appendChild(el("p", "f11-row-desc",
      "The six questions people open this manager with, in the order they ask them. " +
      "Everything deeper is one of the tabs above, not another column here."));
    if (item.fields && Object.keys(item.fields).length) body.appendChild(fieldList(item.fields));
    if (item.badges && item.badges.length) {
      var tags = el("div", "f11-actions");
      item.badges.forEach(function (b) {
        var t = el("span", "f11-tag", esc(b.text));
        if (b.title) t.title = b.title;
        tags.appendChild(t);
      });
      body.appendChild(tags);
    }
    (item.detail || []).forEach(function (d) {
      var panel = el("div", "f11-note");
      panel.appendChild(el("div", "f11-row-title", esc(d.label)));
      var dl = el("dl", "f11-fields");
      (d.rows || []).forEach(function (r) {
        dl.appendChild(el("dt", null, esc(r.label)));
        var dd = el("dd", null, esc(String(r.value)));
        if (r.hint) dd.appendChild(el("div", "f11-row-desc", esc(r.hint)));
        dl.appendChild(dd);
      });
      panel.appendChild(dl);
      body.appendChild(panel);
    });
    if (item.editable && item.editable.length) body.appendChild(editableFields(item, ctx.managerId));
    if ((item.actions || []).length) body.appendChild(actionRow(item.actions, ctx.managerId, item));
  }

  function providerCredentials(body, spec, ctx, item, sec) {
    var info = subpageItem(sec, "sub-credentials");
    body.appendChild(quietNote("No secret is shown on this page, ever",
      "Puppet Master stores no provider secret and reads none. Signing in runs inside the provider's " +
      "own login, in its own isolated profile, and it is a separate step from installing anything."));
    if (info) {
      if (info.secondary) body.appendChild(el("p", "f11-row-desc", esc(info.secondary)));
      if (info.fields) body.appendChild(fieldList(info.fields));
    }
    var fx = ST.effects();
    if (fx.reconnectRequired) {
      body.appendChild(quietNote("This session expired and needs an explicit sign-in",
        "Nothing was changed while it was expired, and no work was retried behind your back."));
    }
    if (item.editable && item.editable.length) body.appendChild(editableFields(item, ctx.managerId));
    var acts = [{ id: "provider.auth.start_setup", label: "Sign in to " + item.name, kind: "primary" },
      { id: "provider.auth.revalidate", label: "Check this connection", kind: "quiet" }];
    body.appendChild(actionRow(acts, ctx.managerId, item));
    if (info && (info.actions || []).length) body.appendChild(actionRow(info.actions, ctx.managerId, info));
  }

  function providerModels(body, spec, ctx, item, sec) {
    var info = subpageItem(sec, "sub-catalogues");
    body.appendChild(el("p", "f11-row-desc",
      "Which models this family can answer with, and where that list came from. A catalogue that " +
      "fails validation is quarantined and the last known good copy keeps serving."));
    var fields = {};
    if (item.fields && item.fields["Models ready"]) fields["Models ready"] = item.fields["Models ready"];
    if (info && info.fields) {
      Object.keys(info.fields).forEach(function (k) { fields[k] = info.fields[k]; });
    }
    if (info && info.statusWord) fields["Catalogue sources"] = info.statusWord;
    if (Object.keys(fields).length) body.appendChild(fieldList(fields));
    if (info && info.secondary) body.appendChild(el("p", "f11-row-desc", esc(info.secondary)));
    if (info && (info.actions || []).length) body.appendChild(actionRow(info.actions, ctx.managerId, info));
  }

  function providerLimits(body, spec, ctx, item, sec) {
    var info = subpageItem(sec, "sub-limits");
    body.appendChild(el("p", "f11-row-desc",
      "Order of preference, whether a thread sticks to one account, and the reserve kept back for " +
      "verification. Measurement and billing periods belong to Usage, not here."));
    if (info) {
      if (info.secondary) body.appendChild(el("p", "f11-row-desc", esc(info.secondary)));
      if (info.fields) body.appendChild(fieldList(info.fields));
      if ((info.actions || []).length) body.appendChild(actionRow(info.actions, ctx.managerId, info));
    }
    var rows = null;
    (spec.sections || []).forEach(function (s) { if (s.kind === "rows") rows = s; });
    if (rows) body.appendChild(renderSpecSection(rows, ctx));
  }

  function providerUsage(body, spec, ctx, item, sec) {
    var table = null;
    (spec.sections || []).forEach(function (s) { if (s.id === "usage-end") table = s; });
    body.appendChild(el("p", "f11-row-desc",
      "What this Project does when included usage ends. That decision is a Settings decision; the " +
      "balance that triggers it is reported by the provider and is not something Settings can invent."));
    if (ST.effects().usageUnavailable) {
      body.appendChild(quietNote("This provider is ready, and reports no balance",
        "Readiness and measurement are separate facts. Nothing here is broken — there is simply " +
        "nothing to measure, so no figure is shown rather than a zero that would read as empty."));
    }
    if (table && (table.items || []).length) body.appendChild(renderSpecSection(table, ctx));
    else if (table) {
      var e = table.empty || {};
      var empty = el("div", "f11-empty");
      empty.appendChild(el("div", "f11-empty-head", esc(e.headline || "No connection is reporting a balance")));
      if (e.detail) empty.appendChild(el("p", null, esc(e.detail)));
      body.appendChild(empty);
    }
  }

  function providerAdvanced(body, spec, ctx, item, sec) {
    var installs = sec("installations");
    var acquisition = sec("acquisition");
    var logs = subpageItem(sec, "sub-logs");
    var fx = ST.effects();

    if (fx.multiInstall) {
      body.appendChild(quietNote("More than one installation answers for one family",
        "The one this Project uses is bound by identity, so a change in PATH order cannot move it. " +
        "The other is named below and marked shadowed."));
    }
    if (fx.unknownOwner) {
      body.appendChild(quietNote("One installation has an owner that cannot be named",
        "It stays manual only. Puppet Master will not adopt, update or repair something it cannot identify."));
    }
    if (fx.updateAvailable) {
      body.appendChild(quietNote("A newer generation is staged for an installation you already approved",
        "It will not be installed until you say so, and updating never acquires a first copy."));
    }
    if (installs) body.appendChild(renderSpecSection(installs, ctx));
    if (acquisition) body.appendChild(renderSpecSection(acquisition, ctx));
    if (logs) {
      var panel = el("section", "f11-panel");
      panel.appendChild(el("div", "f11-secttitle", esc(logs.name)));
      if (logs.secondary) panel.appendChild(el("p", "f11-row-desc", esc(logs.secondary)));
      if (logs.fields) panel.appendChild(fieldList(logs.fields));
      if ((logs.actions || []).length) panel.appendChild(actionRow(logs.actions, ctx.managerId, logs));
      body.appendChild(panel);
    }
  }

  /* ------------------------------------------------------ the other shapes */

  function renderDocumentManager(spec, ctx, inner) {
    (spec.sections || []).forEach(function (section) {
      inner.appendChild(renderSpecSection(section, ctx));
    });
  }

  /* A setup or repair sequence is an ordered thing. Numbering it is the difference
   * between "here are six panels" and "here is what happens, in order". */
  function renderSequenceManager(spec, ctx, inner) {
    (spec.sections || []).forEach(function (section) {
      var items = section.items || [];
      if (!items.length || section.kind === "rows" || section.kind === "matrix" || section.kind === "table") {
        inner.appendChild(renderSpecSection(section, ctx));
        return;
      }
      var panel = el("section", "f11-panel");
      panel.appendChild(el("div", "f11-secttitle", esc(section.label)));
      if (section.summary) panel.appendChild(el("p", "f11-row-desc", esc(section.summary)));
      var list = el("div", "f11-steps-list");
      items.forEach(function (item, i) {
        var card = el("div", "f11-stepcard");
        card.setAttribute("data-pm-object", objectIdFor(ctx.managerId, item));
        card.appendChild(el("span", "f11-stepcard-n", String(i + 1)));
        var body = el("div", "f11-stepcard-body");
        var lab = el("div", "f11-row-label");
        lab.appendChild(el("span", "f11-row-title", esc(item.name)));
        if (item.statusWord) {
          var t = el("span", "f11-tag", esc(item.statusWord));
          t.setAttribute("data-tone", toneOf(item.status));
          lab.appendChild(t);
        }
        body.appendChild(lab);
        if (item.secondary) body.appendChild(el("p", "f11-row-desc", esc(item.secondary)));
        if (item.fields && Object.keys(item.fields).length) body.appendChild(fieldList(item.fields));
        if (item.editable && item.editable.length) body.appendChild(editableFields(item, ctx.managerId));
        if ((item.actions || []).length) body.appendChild(actionRow(item.actions, ctx.managerId, item));
        card.appendChild(body);
        list.appendChild(card);
      });
      panel.appendChild(list);
      inner.appendChild(panel);
    });
  }

  /* Read-only means read-only: values are stated, nothing offers to change them, and
   * the one thing you can do is ask the owner of the area to act. */
  function renderProjectionManager(spec, ctx, inner) {
    (spec.sections || []).forEach(function (section) {
      var items = section.items || [];
      if (!items.length || section.kind === "rows" || section.kind === "prose" ||
          section.kind === "matrix" || section.kind === "table") {
        inner.appendChild(renderSpecSection(section, ctx));
        return;
      }
      var panel = el("section", "f11-panel");
      panel.appendChild(el("div", "f11-secttitle", esc(section.label)));
      if (section.summary) panel.appendChild(el("p", "f11-row-desc", esc(section.summary)));
      items.forEach(function (item) {
        var card = el("div", "f11-note");
        card.setAttribute("data-pm-object", objectIdFor(ctx.managerId, item));
        var lab = el("div", "f11-row-label");
        lab.appendChild(el("span", "f11-row-title", esc(item.name)));
        if (item.statusWord) {
          var t = el("span", "f11-tag", esc(item.statusWord));
          t.setAttribute("data-tone", toneOf(item.status));
          lab.appendChild(t);
        }
        card.appendChild(lab);
        if (item.secondary) card.appendChild(el("p", "f11-row-desc", esc(item.secondary)));
        if (item.fields && Object.keys(item.fields).length) card.appendChild(fieldList(item.fields));
        (item.detail || []).forEach(function (d) {
          var dl = el("dl", "f11-fields");
          (d.rows || []).forEach(function (r) {
            dl.appendChild(el("dt", null, esc(r.label)));
            var dd = el("dd", null, esc(String(r.value)));
            if (r.hint) dd.appendChild(el("div", "f11-row-desc", esc(r.hint)));
            dl.appendChild(dd);
          });
          card.appendChild(dl);
        });
        if ((item.actions || []).length) card.appendChild(actionRow(item.actions, ctx.managerId, item));
        panel.appendChild(card);
      });
      inner.appendChild(panel);
    });
  }

  /* A diagnostic drawer stays shut until it is asked for. The names of what is inside
   * are visible; the evidence is one press away. */
  function renderDrawerManager(spec, ctx, inner) {
    (spec.sections || []).forEach(function (section) {
      var items = section.items || [];
      if (!items.length || section.kind === "rows" || section.kind === "prose" ||
          section.kind === "matrix" || section.kind === "table") {
        inner.appendChild(renderSpecSection(section, ctx));
        return;
      }
      var panel = el("section", "f11-section");
      var head = el("div", "f11-section-head");
      head.appendChild(el("h3", "f11-section-title", esc(section.label)));
      head.appendChild(el("span", "f11-section-count", String(items.length)));
      panel.appendChild(head);
      items.forEach(function (item) {
        var key = ctx.managerId + ":" + item.id;
        var open = !!ui.openDetails[key];
        var row = el("div", "f11-row");
        row.setAttribute("data-pm-object", objectIdFor(ctx.managerId, item));
        var main = el("div", "f11-row-main");
        var lab = el("div", "f11-row-label");
        lab.appendChild(el("span", "f11-row-title", esc(item.name)));
        if (item.statusWord) {
          var t = el("span", "f11-tag", esc(item.statusWord));
          t.setAttribute("data-tone", toneOf(item.status));
          lab.appendChild(t);
        }
        main.appendChild(lab);
        if (item.secondary) main.appendChild(el("p", "f11-row-desc", esc(item.secondary)));
        main.appendChild(button("f11-why", open ? "Hide the evidence" : "Show the evidence", function () {
          ui.openDetails[key] = !open;
          render();
        }));
        if (open) {
          var det = el("div", "f11-details");
          if (item.fields && Object.keys(item.fields).length) det.appendChild(fieldList(item.fields));
          (item.detail || []).forEach(function (d) {
            det.appendChild(el("div", "f11-row-title", esc(d.label)));
            (d.rows || []).forEach(function (r) {
              det.appendChild(el("p", null, esc(r.label + ": " + r.value + (r.hint ? " — " + r.hint : ""))));
            });
          });
          main.appendChild(det);
        }
        row.appendChild(main);
        var ctl = el("div", "f11-row-control");
        if ((item.actions || []).length) ctl.appendChild(actionRow(item.actions, ctx.managerId, item));
        row.appendChild(ctl);
        panel.appendChild(row);
      });
      inner.appendChild(panel);
    });
  }

  /* A transaction is not a settings page: it is a thing that will happen once, in
   * steps, with a receipt. This surface states what it will do and hands over to the
   * four-step tab where it actually happens. */
  function renderTransactionManager(spec, ctx, inner) {
    var lead = el("div", "f11-note");
    lead.appendChild(el("div", "f11-row-title", "This is a one-time transaction"));
    lead.appendChild(el("p", "f11-row-desc", CP.independence));
    lead.appendChild(el("p", "f11-row-desc", CP.secretPolicy()));
    var acts = el("div", "f11-actions");
    acts.appendChild(button("f11-btn f11-btn--primary", "Open the four steps", function () {
      RT.go({ kind: "copy", step: "source" });
    }));
    lead.appendChild(acts);
    inner.appendChild(lead);
    (spec.sections || []).forEach(function (section) {
      inner.appendChild(renderSpecSection(section, ctx));
    });
  }

  /* A named owner is a boundary, not a stub. Four facts, always in the same order:
   * who owns it, why it is separate, how it is entered, and how control comes back. */
  function renderOwnerManager(spec, ctx, inner) {
    (spec.sections || []).forEach(function (section) {
      inner.appendChild(renderSpecSection(section, ctx));
    });
  }

  function ownerBlock(owner, managerId) {
    var box = el("div", "f11-owner");
    box.appendChild(el("div", "f11-owner-k", "Owned by"));
    box.appendChild(el("div", "f11-row-title", esc(owner.name)));
    box.appendChild(el("div", "f11-owner-k", "Why it is separate"));
    box.appendChild(el("p", null, esc(owner.why)));
    box.appendChild(el("div", "f11-owner-k", "How it is entered"));
    box.appendChild(el("p", null, esc(owner.insertionContract)));
    box.appendChild(el("div", "f11-owner-k", "How control comes back"));
    box.appendChild(el("p", null, esc(owner.returnContract)));
    var acts = el("div", "f11-actions");
    acts.appendChild(button("f11-btn f11-btn--primary", "Open " + esc(owner.name), function () {
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

  function healthBlock(health) {
    var box = el("div", "f11-health");
    box.innerHTML = icon(health.status === "ok" ? "checkCircle" : "info", 16);
    var body = el("div", "f11-health-body");
    var word = el("div", "f11-health-word", esc(health.statusWord || health.status || ""));
    word.setAttribute("data-tone", health.status || "ok");
    body.appendChild(word);
    if (health.headline) body.appendChild(el("div", null, esc(health.headline)));
    if (health.detail) body.appendChild(el("p", "f11-health-detail", esc(health.detail)));
    if (health.counts && health.counts.length) {
      var counts = el("div", "f11-health-counts");
      health.counts.forEach(function (c) {
        var cell = el("div");
        cell.appendChild(el("span", "f11-count-k", esc(c.label)));
        cell.appendChild(el("span", "f11-count-v", esc(String(c.value))));
        counts.appendChild(cell);
      });
      body.appendChild(counts);
    }
    box.appendChild(body);
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
  /* ------------------------------------------------------------ all settings */

  /* The long tail. Secondary in this concept — it is a utility tab at the quiet end of
   * the first row — but complete, faceted and windowed: 828 records plus a 2,400-row
   * scale fixture must never become 3,200 DOM nodes. */
  function renderAll(inner, route) {
    var head = el("header", "f11-head");
    head.appendChild(el("h2", "f11-head-title", "All settings"));
    head.appendChild(el("p", "f11-head-purpose",
      "Every record in " + esc(M.project.name) + ", including the ones a policy controls and the ones " +
      "this host cannot provide. The sub-tabs above are the four cuts people ask for; the facets are the rest."));
    inner.appendChild(head);

    var filter = {
      domainIds: ui.facets.domains,
      kinds: ui.facets.kinds,
      exposures: ui.facets.exposures,
      states: ui.facets.states,
      changedOnly: ui.facets.changedOnly,
      text: route.facet || "",
      limit: 0
    };
    var result = IX.all(filter);

    var box = el("div", "f11-all");
    var facetCol = el("div", "f11-facets");
    var main = el("div", "f11-facets");

    var allHead = el("div", "f11-allhead");
    allHead.appendChild(el("span", "f11-allcount",
      plural(result.total, "match", "matches") + " of " + IX.stats().records + " indexed records" +
      (route.facet ? " for “" + route.facet + "”" : "")));
    if (ui.facets.domains.length || ui.facets.kinds.length || ui.facets.exposures.length ||
        ui.facets.states.length || ui.facets.changedOnly) {
      allHead.appendChild(button("f11-btn", "Clear the facets", function () {
        ui.facets = { domains: [], kinds: [], exposures: [], states: [], changedOnly: false };
        ui.allTab = "all";
        render();
      }));
    }
    main.appendChild(allHead);

    facetCol.appendChild(facetGroup("Category", result.facets.domains, ui.facets.domains, "domains"));
    facetCol.appendChild(facetGroup("Record kind", result.facets.kinds, ui.facets.kinds, "kinds"));
    facetCol.appendChild(facetGroup("Exposure", result.facets.exposures, ui.facets.exposures, "exposures"));
    facetCol.appendChild(facetGroup("Where the value comes from", result.facets.states, ui.facets.states, "states"));

    var changedGroup = el("div", "f11-facet");
    changedGroup.appendChild(el("div", "f11-facet-head", "Changed"));
    var chg = button("f11-facet-item",
      "<span>Changed from its default</span><span class='f11-facet-n'>" + result.facets.changed + "</span>",
      function () {
        ui.facets.changedOnly = !ui.facets.changedOnly;
        ui.allTab = ui.facets.changedOnly ? "changed" : "all";
        render();
      });
    chg.setAttribute("aria-pressed", ui.facets.changedOnly ? "true" : "false");
    changedGroup.appendChild(chg);
    facetCol.appendChild(changedGroup);

    var listBox = el("div", "f11-alllist f11-scroll");
    var rowHeight = 44;
    var viewport = Math.min(640, Math.max(280, Math.round(window.innerHeight * 0.56)));
    listBox.style.height = viewport + "px";

    function paint() {
      var win = window.PMVirtual.windowFor({
        total: result.total, rowHeight: rowHeight, viewport: viewport,
        scrollTop: listBox.scrollTop, overscan: 6, firstPage: 20
      });
      clear(listBox);
      var before = el("div", "f11-vspacer");
      before.style.height = win.before + "px";
      listBox.appendChild(before);
      for (var i = win.start; i < win.end; i++) {
        var rec = result.rows[i];
        if (rec) listBox.appendChild(allRow(rec));
      }
      var after = el("div", "f11-vspacer");
      after.style.height = win.after + "px";
      listBox.appendChild(after);
    }
    on(listBox, "scroll", paint);
    main.appendChild(listBox);

    if (!result.total) {
      main.appendChild(el("p", "f11-attn-empty",
        "No record matches those facets. Clearing one of them will bring the list back."));
    }

    box.appendChild(facetCol);
    box.appendChild(main);
    inner.appendChild(box);
    paint();
  }

  function allRow(rec) {
    var b = button("f11-allrow", null, function () {
      var r = IX.byId(rec.id);
      if (!r) return;
      ui.pending = { result: r, query: ui.query };
      RT.go(destinationRoute(r.destination));
    });
    b.setAttribute("data-pm-result", rec.id);
    var body = el("div", "f11-allrow-body");
    body.appendChild(el("div", "f11-allrow-label", esc(rec.label)));
    body.appendChild(el("div", "f11-allrow-path", esc(rec.path)));
    b.appendChild(body);
    var tag = el("span", "f11-tag f11-allrow-tag", esc(rec.typeLabel || IX.kindLabel(rec.kind)));
    if (rec.changed) tag.setAttribute("data-tone", "changed");
    b.appendChild(tag);
    return b;
  }

  function facetGroup(title, facets, selected, key) {
    var g = el("div", "f11-facet");
    g.appendChild(el("div", "f11-facet-head", esc(title)));
    (facets || []).slice(0, 12).forEach(function (f) {
      var b = button("f11-facet-item",
        "<span>" + esc(f.label) + "</span><span class='f11-facet-n'>" + f.count + "</span>",
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

  /* ---------------------------------------------------------------------- copy */

  /* Four steps, and the steps are the second tab row rather than a wizard's own
   * chrome — which is what lets a reader jump back to the categories they picked
   * without losing the preview. Source and categories sit in adjacent panes, the way
   * a reader compares them. */
  function renderCopy(inner, route) {
    var c = ui.copy;
    var head = el("header", "f11-head");
    head.appendChild(el("h2", "f11-head-title", "Copy settings from another Project"));
    head.appendChild(el("p", "f11-head-purpose", CP.independence));
    inner.appendChild(head);

    var fx = ST.effects();
    if (fx.importConflict) {
      inner.appendChild(quietNote("This source disagrees with values this Project already has",
        "Every disagreement is itemised in the preview before anything is applied. Nothing is written until you say so."));
    }
    if (fx.rollbackComplete) {
      inner.appendChild(quietNote("The last copy was rolled back",
        "The restore point taken before it is still listed with its receipt, and this Project is exactly as it was."));
    }
    if (fx.verifyFailed) {
      inner.appendChild(quietNote("The last apply verified badly and undid itself",
        "Four values did not match the source, so the whole transaction was rolled back rather than left half-done."));
    }

    if (c.step === 1) copyStepSource(inner);
    else if (c.step === 2) copyStepCategories(inner);
    else if (c.step === 3) copyStepReview(inner);
    else copyStepApply(inner);

    var receipts = CP.receipts();
    if (receipts.length) {
      var list = el("div");
      receipts.forEach(function (r) {
        var row = el("div", "f11-row");
        var main = el("div", "f11-row-main");
        main.appendChild(el("div", "f11-row-title", esc("Copied from " + r.source.name + " · " + r.at)));
        main.appendChild(el("p", "f11-row-desc", esc(
          r.outcome === "applied"
            ? plural(r.applied, "value") + " applied. Restore point: " + r.restorePoint.label
            : (r.note || "Rolled back."))));
        row.appendChild(main);
        var ctl = el("div", "f11-row-control");
        if (r.canRollback) {
          ctl.appendChild(button("f11-btn", "Roll back", function () {
            CP.rollback(r.id);
            MG.invalidate();
            render();
            shell.announce("The copy was rolled back. This Project is exactly as it was.");
          }));
        } else {
          ctl.appendChild(el("span", "f11-tag", esc(r.outcome === "applied" ? "Applied" : "Rolled back")));
        }
        row.appendChild(ctl);
        list.appendChild(row);
      });
      inner.appendChild(sectionPanel("Receipts", list));
    }
  }

  function copyStepSource(inner) {
    var panes = el("div", "f11-copy");

    var left = el("section", "f11-panel");
    left.appendChild(el("div", "f11-secttitle", "Source Project"));
    left.appendChild(el("p", "f11-row-desc", "Which Project should this one copy from? Only one, and only once."));
    var list = el("div");
    CP.sources().forEach(function (s) {
      var b = button("f11-src", null, function () {
        ui.copy.source = s.id;
        if (!ui.copy.domains) ui.copy.domains = M.domains.map(function (d) { return d.id; });
        render();
      });
      b.setAttribute("aria-pressed", ui.copy.source === s.id ? "true" : "false");
      var body = el("div", "f11-src-body");
      body.appendChild(el("div", "f11-src-name", esc(s.name)));
      body.appendChild(el("div", "f11-src-sub", esc(s.updated + " · " + s.note)));
      b.appendChild(body);
      b.appendChild(el("span", "f11-src-meta", plural(s.settings, "setting")));
      list.appendChild(b);
    });
    left.appendChild(list);
    left.appendChild(el("p", "f11-row-desc", CP.secretPolicy()));
    panes.appendChild(left);

    var right = el("section", "f11-panel");
    right.appendChild(el("div", "f11-secttitle", "Categories to copy"));
    if (!ui.copy.source) {
      right.appendChild(el("p", "f11-attn-empty",
        "Choose a source Project on the left and the twelve categories become selectable here."));
    } else {
      right.appendChild(categoryGrid());
      var acts = el("div", "f11-actions");
      var next = button("f11-btn f11-btn--primary", "Continue to the categories", function () {
        ui.copy.step = 2;
        render();
      });
      acts.appendChild(next);
      right.appendChild(acts);
    }
    panes.appendChild(right);
    inner.appendChild(panes);
  }

  function categoryGrid() {
    var chosen = ui.copy.domains || (ui.copy.domains = []);
    var grid = el("div", "f11-cats");
    CP.categories().forEach(function (cat) {
      var picked = chosen.indexOf(cat.id) >= 0;
      var b = button("f11-cat", null, function () {
        var at = chosen.indexOf(cat.id);
        if (at >= 0) chosen.splice(at, 1); else chosen.push(cat.id);
        ui.copy.domains = chosen;
        ui.copy.preview = null;
        render();
      });
      b.setAttribute("aria-pressed", picked ? "true" : "false");
      b.appendChild(el("span", "f11-cat-box", picked ? icon("check", 11) : ""));
      var body = el("div", "f11-cat-body");
      body.appendChild(el("div", "f11-cat-title", esc(cat.title)));
      body.appendChild(el("div", "f11-src-sub", esc(cat.purpose)));
      b.appendChild(body);
      b.appendChild(el("span", "f11-cat-n", plural(cat.count, "setting")));
      grid.appendChild(b);
    });
    return grid;
  }

  function copyStepCategories(inner) {
    var panes = el("div", "f11-copy");
    var source = CP.sources().filter(function (s) { return s.id === ui.copy.source; })[0];

    var left = el("section", "f11-panel");
    left.appendChild(el("div", "f11-secttitle", "Source Project"));
    if (source) {
      var card = el("div", "f11-note");
      card.appendChild(el("div", "f11-row-title", esc(source.name)));
      card.appendChild(el("p", "f11-row-desc", esc(source.updated + " · " + source.note)));
      card.appendChild(el("p", "f11-row-desc", plural(source.settings, "setting") + " available to copy."));
      left.appendChild(card);
    }
    left.appendChild(button("f11-btn", "Choose a different source", function () {
      ui.copy.step = 1;
      render();
    }));
    left.appendChild(el("p", "f11-row-desc", CP.secretPolicy()));
    panes.appendChild(left);

    var right = el("section", "f11-panel");
    right.appendChild(el("div", "f11-secttitle", "Categories to copy"));
    right.appendChild(categoryGrid());
    var chosen = ui.copy.domains || [];
    var acts = el("div", "f11-actions");
    acts.appendChild(el("span", "f11-row-desc",
      chosen.length + " of " + M.domains.length + " categories selected"));
    var next = button("f11-btn f11-btn--primary", "Preview the changes", function () {
      ui.copy.preview = CP.preview(ui.copy.source, ui.copy.domains);
      ui.copy.step = 3;
      render();
    });
    next.disabled = !chosen.length;
    acts.appendChild(next);
    right.appendChild(acts);
    panes.appendChild(right);
    inner.appendChild(panes);
  }

  function copyStepReview(inner) {
    var p = ui.copy.preview;
    if (!p) { ui.copy.step = ui.copy.source ? 2 : 1; return; }

    var tiles = el("div", "f11-numtiles");
    [["Will be added", p.counts.additions], ["Will be replaced", p.counts.replacements],
     ["Already the same", p.counts.unchanged], ["Account references re-pointed", p.counts.references],
     ["Cannot be copied", p.counts.unavailable + p.counts.conflicts]].forEach(function (pair) {
      var t = el("div", "f11-numtile");
      t.appendChild(el("div", "f11-numtile-v", String(pair[1])));
      t.appendChild(el("div", "f11-numtile-k", esc(pair[0])));
      tiles.appendChild(t);
    });
    inner.appendChild(tiles);

    var changes = p.items.filter(function (i) {
      return i.outcome === "addition" || i.outcome === "replacement" || i.outcome === "reference";
    });
    var listBox = el("div", "f11-alllist f11-scroll");
    listBox.style.maxHeight = "340px";
    changes.slice(0, 400).forEach(function (item) {
      var row = el("div", "f11-diffrow");
      var lab = el("div", "f11-diff-label");
      lab.appendChild(el("div", null, esc(item.label)));
      lab.appendChild(el("div", "f11-diff-path", esc(item.path)));
      row.appendChild(lab);
      row.appendChild(el("div", "f11-diff-from", esc(String(item.current === "" ? "not set" : item.current))));
      row.appendChild(el("div", "f11-diff-arrow", "→"));
      row.appendChild(el("div", "f11-diff-to", esc(String(item.incoming))));
      listBox.appendChild(row);
    });
    if (!changes.length) {
      listBox.appendChild(el("p", "f11-attn-empty",
        "Nothing would change: every value in the categories you picked already matches the source."));
    }
    inner.appendChild(sectionPanel("What would change — " + plural(changes.length, "value"), listBox));

    var excluded = el("div");
    p.excluded.forEach(function (x) {
      excluded.appendChild(el("p", "f11-row-desc",
        esc(x.label + ": " + x.count + (x.note ? " — " + x.note : ""))));
    });
    excluded.appendChild(el("p", "f11-row-desc", CP.secretPolicy()));
    inner.appendChild(sectionPanel("What is not copied", excluded));

    var acts = el("div", "f11-actions");
    acts.appendChild(button("f11-btn", "Back to the categories", function () { ui.copy.step = 2; render(); }));
    acts.appendChild(button("f11-btn f11-btn--primary", "Take a restore point and copy", function () {
      ui.copy.run = CP.apply(p);
      ui.copy.step = 4;
      render();
    }));
    inner.appendChild(acts);
  }

  function copyStepApply(inner) {
    var run = ui.copy.run;
    if (!run) { ui.copy.step = ui.copy.preview ? 3 : 1; return; }
    var op = run.get();

    var phases = el("div");
    run.steps.forEach(function (phase, i) {
      var row = el("div", "f11-phase");
      row.appendChild(el("span", null, esc(phase)));
      row.appendChild(el("span", "f11-phase-state", esc(op.phase === phase
        ? window.PMWork.stateWord(op.state)
        : (i < run.steps.indexOf(op.phase) || op.terminal ? "done" : "waiting"))));
      phases.appendChild(row);
    });

    /* Determinate progress only where there is a real denominator; otherwise the wait
     * is named rather than dressed up as a bar that means nothing. */
    if (op.progress_kind === "fraction" && op.total) {
      var bar = el("div", "f11-progress");
      var fill = el("i");
      fill.style.width = Math.round((op.completed / op.total) * 100) + "%";
      bar.appendChild(fill);
      phases.appendChild(bar);
      phases.appendChild(el("p", "f11-row-desc", op.completed + " of " + op.total + " values"));
    } else {
      phases.appendChild(el("p", "f11-row-desc",
        esc(window.PMWork.stateWord(op.state) + (op.wait_reason ? " — " + op.wait_reason : ""))));
    }
    inner.appendChild(sectionPanel("Applying", phases));

    var acts = el("div", "f11-actions");
    if (!ui.copy.receipt) {
      acts.appendChild(button("f11-btn f11-btn--primary", "Continue", function () {
        var out = run.next();
        if (out.done) { ui.copy.receipt = out.receipt; MG.invalidate(); }
        render();
      }));
      acts.appendChild(button("f11-btn", "Run the rest", function () {
        var out = run.run();
        ui.copy.receipt = out.receipt;
        MG.invalidate();
        render();
      }));
      acts.appendChild(button("f11-btn", "Cancel", function () {
        run.cancel();
        ui.copy = { step: 1, source: null, domains: null, preview: null, run: null, receipt: null };
        render();
      }));
    } else {
      var r = ui.copy.receipt;
      var note = el("div", "f11-note");
      note.appendChild(el("div", "f11-row-title", r.outcome === "applied" ? "Copied" : "Rolled back"));
      note.appendChild(el("p", "f11-row-desc", esc(
        r.outcome === "applied"
          ? plural(r.applied, "value") + " were applied to " + M.project.name +
            ". The restore point taken first is " + r.restorePoint.label + "."
          : r.note)));
      note.appendChild(el("p", "f11-row-desc", esc(
        "The two Projects are independent from here. Nothing in " + r.source.name +
        " will reach this Project again.")));
      inner.appendChild(note);
      acts.appendChild(button("f11-btn", "Done", function () {
        ui.copy = { step: 1, source: null, domains: null, preview: null, run: null, receipt: null };
        RT.go({ kind: "home" });
      }));
      if (r.canRollback) {
        acts.appendChild(button("f11-btn", "Roll back", function () {
          CP.rollback(r.id);
          MG.invalidate();
          ui.copy = { step: 1, source: null, domains: null, preview: null, run: null, receipt: null };
          render();
        }));
      }
    }
    inner.appendChild(acts);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
