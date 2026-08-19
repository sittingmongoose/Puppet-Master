/* Opus 5 — Codex (concept 09).
 *
 * Thesis: Settings is a bound volume with chapter tabs, expressed entirely in Puppet
 * Master's own materials. The reference drawing this answers is a steampunk book; the
 * only thing kept from it is geometry — persistent edge tabs, a broad reading canvas,
 * pages that stack, manager-local tabs inside the page, a stepwise copy flow. None of
 * its skin survives: there is no texture, no brass, no sepia, no ornament and no
 * imitation of paper anywhere in this concept. Depth is drawn with the surface ladder
 * and one bounded shadow, which is the same material the rest of the application uses.
 *
 * What this file owns: every pixel. The right-edge tab strip, the layered page stack
 * and its spines, Home, the domain and page canvases, the row grammar, all 54 manager
 * destinations, the bespoke provider surface, the faceted long tail, the copy
 * transaction, the arrival reveal, the compact push navigation, and the motion that
 * connects them.
 *
 * What it does not own: any fact. Domains, pages, sections, the 828 settings, manager
 * specs, search results, routes, the copy transaction and the state fixtures all come
 * from shared2, which draws nothing.
 *
 * Portability note (Slint 1.17.1): the route is an explicit state machine, the layer
 * stack is a depth integer rather than a pile of DOM, every list that can grow is
 * windowed through PMVirtual, and geometry is measured only to bring an arrival into
 * view — never to decide what something means.
 */
(function () {
  "use strict";

  var CONCEPT_ID = "concept-09-tome-tabs";
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
  var toplineEl = null;
  var situationEl = null;
  var frameEl = null;
  var edgesEl = null;
  var layerEl = null;
  var stripEl = null;
  var pushrowEl = null;
  var navpageEl = null;
  var footEl = null;
  var bodyEl = null;      /* the scroll container of the top layer */

  /* Presentation state. Deliberately not persisted: none of it is a fact about the
   * Project, and restoring an open dropdown after a reload would be a lie. */
  var ui = {
    query: "",
    results: null,
    dropOpen: false,
    activeResult: -1,
    navOpen: false,
    tab: {},                 /* managerId -> manager-local tab id */
    selected: {},            /* managerId -> objectId */
    openDetails: {},         /* settingId -> true */
    openAdvanced: {},        /* sectionId -> true */
    facets: { domains: [], kinds: [], exposures: [], changedOnly: false },
    copy: { step: 1, source: null, domains: null, preview: null, run: null, receipt: null },
    errors: {},              /* settingId -> message */
    pending: null            /* the arrival to reveal after this render */
  };

  var widthMode = "wide";
  var lastFixture = null;
  var lastLocation = null;
  var lastDepth = 0;

  /* True while the concept writes the route for its own bookkeeping rather than to
   * navigate. Re-rendering on such a write while the reader is typing would rebuild
   * the search field under the cursor and throw the caret away. */
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

  /* Every navigation keeps the active state fixture, so a deep link taken from any
   * screen reproduces the screen it was taken from. */
  function goTo(dest, opts) {
    RT.go(RT.withState(dest, RT.current().state), opts);
  }

  function managerDomain(managerId) {
    var f = M.familyOf(managerId);
    return f ? f.domainId : null;
  }

  function exposureWord(e) {
    for (var i = 0; i < M.EXPOSURE.length; i++) if (M.EXPOSURE[i].id === e) return M.EXPOSURE[i].label;
    return "Advanced";
  }

  function archetypeWord(a) {
    if (a === "resource roster and detail sheet") return "List and detail";
    if (a === "inventory catalogue") return "Catalogue";
    if (a === "read-only health projection") return "Read-only";
    if (a === "preview and confirmation transaction") return "Transaction";
    if (a === "setup or repair sequence") return "Set up or repair";
    if (a === "diagnostic drawer") return "Diagnostics";
    if (a === "named owner insertion point") return "Separate owner";
    return "Settings";
  }

  /* ---------------------------------------------------------------- the shell */

  function boot() {
    shell = window.PMShell.mount({
      rootId: "pm-root",
      concept: "Codex · chapter tabs on the edge",
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


    root = el("div", "cx");
    root.setAttribute("data-concept", CONCEPT_ID);

    toplineEl = el("header", "cx-topline");

    var viewport = el("div", "cx-viewport");
    pushrowEl = el("div", "cx-pushrow");
    frameEl = el("div", "cx-frame");
    edgesEl = el("div", "cx-edges");
    layerEl = el("main", "cx-layer");
    stripEl = el("nav", "cx-strip");
    stripEl.setAttribute("aria-label", "Settings areas");

    frameEl.appendChild(edgesEl);
    frameEl.appendChild(layerEl);
    frameEl.appendChild(stripEl);
    pushrowEl.appendChild(frameEl);
    viewport.appendChild(pushrowEl);

    footEl = el("div", "cx-footbar");

    root.appendChild(toplineEl);
    root.appendChild(viewport);
    root.appendChild(footEl);
    shell.main.appendChild(root);

    document.addEventListener("keydown", onKeydown, true);

    RT.onChange(function () {
      if (quiet) return;
      adoptRouteQuery();
      render();
    });
    window.addEventListener("pm-concept-state-applied", function () { measure(); render(); });

    measure();
    adoptRouteQuery();
    applyFixtureQuery();
    render();
  }

  /* Width mode is presentation, derived at explicit checkpoints — never per frame,
   * and never the source of anything semantic. Only the narrowest mode changes the
   * navigation model; the middle mode simply drops the tab labels. */
  function measure() {
    var w = (shell && shell.main ? shell.main.clientWidth : window.innerWidth) || window.innerWidth;
    var next = w < 780 ? "compact" : (w < 1000 ? "mid" : "wide");
    if (next !== widthMode) {
      widthMode = next;
      if (widthMode !== "compact") ui.navOpen = false;
    }
    if (!root) return;
    root.setAttribute("data-w", widthMode);
    root.setAttribute("data-nav", ui.navOpen && widthMode === "compact" ? "open" : "closed");
  }

  /* A route that carries a query is the search the reader performed. Adopting it here
   * is what makes Back restore both the text and the result that was chosen. */
  function adoptRouteQuery() {
    var r = RT.current();
    if (r.kind === "query" && r.query != null) {
      ui.query = r.query;
      ui.results = r.query.trim() ? IX.query(r.query, { limit: 40 }) : null;
      ui.dropOpen = !!ui.results;
      ui.activeResult = -1;
    } else {
      ui.dropOpen = false;
    }
  }

  /* ---------------------------------------------------------------- the stack */

  /* Where the reader is, as a list of layers. The last entry is the page on top; the
   * ones before it keep a visible spine so the location is never lost. */
  function layerTrail(route) {
    var out = [{ label: "Settings Home", dest: { kind: "home" } }];
    if (route.kind === "home" || route.kind === "query") return [];
    if (route.kind === "all") { out.push({ label: "All settings", dest: null }); return out; }
    if (route.kind === "copy") { out.push({ label: "Copy settings", dest: null }); return out; }
    if (route.kind === "domain") {
      var d = M.domain(route.domainId);
      if (!d) return out;
      out.push({ label: d.title, dest: route.pageId ? { kind: "domain", domainId: d.id } : null });
      if (route.pageId) {
        var p = M.page(route.pageId);
        out.push({ label: p ? p.title : route.pageId, dest: null });
      }
      return out;
    }
    if (route.kind === "manager") {
      var domId = managerDomain(route.managerId);
      var dom = domId ? M.domain(domId) : null;
      if (dom) out.push({ label: dom.title, dest: { kind: "manager-domain", domainId: dom.id } });
      var rec = MG.record(route.managerId);
      out.push({ label: (rec && rec.title) || route.managerId, dest: null });
      return out;
    }
    return out;
  }

  function breadcrumbTrail(route) {
    var out = [{ label: "Settings", dest: { kind: "home" } }];
    if (route.kind === "query") out.push({ label: "Search", dest: null });
    if (route.kind === "all") out.push({ label: "All settings", dest: null });
    if (route.kind === "copy") out.push({ label: "Copy settings from another Project", dest: null });
    if (route.kind === "domain") {
      var d = M.domain(route.domainId);
      if (d) out.push({ label: d.title, dest: route.pageId ? { kind: "domain", domainId: d.id } : null });
      if (route.pageId) {
        var p = M.page(route.pageId);
        if (p) out.push({ label: p.title, dest: null });
      }
    }
    if (route.kind === "manager") {
      var domId = managerDomain(route.managerId);
      var dom = domId ? M.domain(domId) : null;
      if (dom) out.push({ label: dom.title, dest: { kind: "domain", domainId: dom.id } });
      var rec = MG.record(route.managerId);
      out.push({ label: (rec && rec.title) || route.managerId, dest: route.objectId ? { kind: "manager", managerId: route.managerId } : null });
      if (route.objectId) {
        var name = selectedObjectName(route.managerId, route.objectId);
        if (name) out.push({ label: name, dest: null });
      }
    }
    return out;
  }

  /* Only ever called from inside a manager, where the spec is already hydrated. */
  var objectNameCache = {};
  function selectedObjectName(managerId, objectId) {
    var key = managerId + "/" + objectId;
    if (objectNameCache[key] !== undefined) return objectNameCache[key];
    var found = null;
    if (RT.current().kind === "manager" && RT.current().managerId === managerId) {
      var spec = MG.spec(managerId, store.get());
      (spec.sections || []).forEach(function (s) {
        (s.items || []).forEach(function (it) { if (it.id === objectId) found = it.name; });
      });
    }
    objectNameCache[key] = found;
    return found;
  }

  function backTarget(route) {
    /* `03_HOME_SEARCH_AND_NAVIGATION.md` § Location and exit: "`Back` returns one
     * Settings level". The trail carries no crumb for a row, so walking it from the end
     * lands on the domain and skips the page the reader was reading. */
    if (route.kind === "domain" && route.pageId && (route.settingId || route.sectionId)) {
      var pg = M.page(route.pageId);
      return { label: (pg && pg.title) || "this page",
        dest: { kind: "domain", domainId: route.domainId, pageId: route.pageId } };
    }
    var trail = breadcrumbTrail(route);
    for (var i = trail.length - 2; i >= 0; i--) {
      if (trail[i].dest) return { label: trail[i].label, dest: trail[i].dest };
    }
    if (route.kind === "manager") {
      var domId = managerDomain(route.managerId);
      if (domId) return { label: (M.domain(domId) || {}).title || "Settings Home", dest: { kind: "domain", domainId: domId } };
    }
    return { label: "Settings Home", dest: { kind: "home" } };
  }

  function locationKey(route) {
    return [route.kind, route.domainId, route.pageId, route.managerId, route.step, route.facet].join("|");
  }

  /* --------------------------------------------------------------- the router */

  function render() {
    if (window.PM2Spy) window.PM2Spy.release();
    var route = RT.current();
    var check = RT.resolve(route);

    measure();

    var fixture = ST.active();
    if (fixture !== lastFixture) {
      lastFixture = fixture;
      MG.invalidate();
      objectNameCache = {};
    }

    renderTopline(route, check);
    renderStrip(route);
    renderStack(route, check);
    renderNavpage(route);
    renderFoot();

    revealPending();
  }

  function renderStack(route, check) {
    var trail = check.ok ? layerTrail(route) : [];
    var edges = trail.length ? trail.slice(0, trail.length - 1) : [];
    if (edges.length > 2) edges = edges.slice(edges.length - 2);
    var depth = edges.length;

    clear(edgesEl);
    edges.forEach(function (step, i) {
      var b = button("cx-edge", "", step.dest ? function () { goTo(step.dest); } : null);
      b.setAttribute("aria-label", "Back to " + step.label);
      b.title = "Back to " + step.label;
      if (!step.dest) b.disabled = true;
      edgesEl.appendChild(b);
      if (i === edges.length - 1) b.setAttribute("data-edge", "near");
    });

    root.setAttribute("data-depth", String(depth));

    /* Forward adds a layer, Back removes one, and the layer animation says which
     * happened. A re-render caused by editing a value is neither, so it does not
     * move: motion here explains location, nothing else. */
    var key = locationKey(route);
    var moved = key !== lastLocation;
    layerEl.removeAttribute("data-move");
    layerEl.removeAttribute("data-arrive");
    if (moved) {
      layerEl.setAttribute("data-move", depth >= lastDepth ? "in" : "out");
    }
    lastLocation = key;
    lastDepth = depth;

    clear(layerEl);
    situationEl = situationBar();
    if (situationEl) layerEl.appendChild(situationEl);
    var head = el("div", "cx-layer-head");
    var headInner = el("div", "cx-head-inner");
    headInner.appendChild(crumbNav(route, check));
    head.appendChild(headInner);
    bodyEl = el("div", "cx-layer-body cx-scroll");
    var bodyInner = el("div", "cx-body-inner");
    bodyEl.appendChild(bodyInner);
    layerEl.appendChild(head);
    layerEl.appendChild(bodyEl);
    layerEl.removeAttribute("data-pm-manager");

    if (!check.ok) {
      layerEl.setAttribute("data-pm-surface", "notice");
      brokenLink(headInner, bodyInner, check);
      return;
    }

    var kind = route.kind;
    if (kind === "home" || kind === "query") {
      layerEl.setAttribute("data-pm-surface", kind === "query" ? "search" : "home");
      renderHome(headInner, bodyInner);
    } else if (kind === "domain" && route.pageId) {
      layerEl.setAttribute("data-pm-surface", "page");
      renderPage(headInner, bodyInner, route);
    } else if (kind === "domain") {
      layerEl.setAttribute("data-pm-surface", "domain");
      renderDomain(headInner, bodyInner, route);
    } else if (kind === "manager") {
      layerEl.setAttribute("data-pm-surface", "manager");
      layerEl.setAttribute("data-pm-manager", route.managerId);
      renderManagerSurface(headInner, bodyInner, route);
    } else if (kind === "all") {
      layerEl.setAttribute("data-pm-surface", "all");
      renderAll(headInner, bodyInner, route);
    } else if (kind === "copy") {
      layerEl.setAttribute("data-pm-surface", "copy");
      renderCopy(headInner, bodyInner, route);
    } else {
      layerEl.setAttribute("data-pm-surface", "home");
      renderHome(headInner, bodyInner);
    }
  }

  function brokenLink(head, body, check) {
    head.appendChild(el("h2", "cx-title", check.reason === "malformed"
      ? "That link is not a Settings location"
      : "That link points somewhere this Project does not have"));
    head.appendChild(el("p", "cx-lede", esc(check.detail || "")));

    var notice = el("div", "cx-linknotice");
    notice.appendChild(el("div", "cx-notice-head", "The link was kept exactly as it arrived"));
    notice.appendChild(el("p", null, "<code>" + esc(check.quoted || location.hash) + "</code>"));
    notice.appendChild(el("p", null, "Nothing was changed. Settings Home is below, and the tabs on the right still work."));
    body.appendChild(notice);
    renderHomeBody(body);
  }

  /* -------------------------------------------------------------- the topline */

  function renderTopline(route, check) {
    clear(toplineEl);

    if (widthMode === "compact") {
      var navBtn = button("cx-btn cx-btn--quiet", icon("list", 15) + "<span class='cx-btn-label'>Areas</span>", function () {
        ui.navOpen = !ui.navOpen;
        measure();
        render();
      });
      navBtn.setAttribute("aria-expanded", ui.navOpen ? "true" : "false");
      toplineEl.appendChild(navBtn);
    }

    var back = backTarget(route);
    var backBtn = button("cx-btn cx-btn--quiet", icon("chevronLeft", 14) +
      "<span class='cx-btn-label'>Back to " + esc(back.label) + "</span>", function () { goTo(back.dest); });
    backBtn.setAttribute("data-pm-back", "");
    backBtn.hidden = route.kind === "home" || route.kind === "query";
    toplineEl.appendChild(backBtn);

    toplineEl.appendChild(el("div", "cx-topline-spacer"));

    /* Exactly one search field exists at a time. On Home the canvas owns it, because
     * that is where the reader looks first; everywhere else the topline does. */
    if (route.kind !== "home" && route.kind !== "query" && widthMode !== "compact") {
      toplineEl.appendChild(searchField("bar"));
    }

    var project = el("span", "cx-project", icon("folder", 12) + "<b>" + esc(M.project.name) + "</b>");
    project.setAttribute("data-pm-project", "");
    project.title = M.project.kind + " · " + M.project.path;
    toplineEl.appendChild(project);

    var close = button("cx-btn cx-btn--quiet", icon("ban", 14) + "<span class='cx-btn-label'>Close</span>", function () {
      shell.announce("Close Settings returns to the surface that opened Settings.");
      window.PMSim.run({
        label: "Close Settings",
        detail: "Returns to the surface that opened Settings — in this prototype the shell stays put.",
        realCall: "cmd.settings.close"
      });
    });
    close.setAttribute("data-pm-close", "");
    close.title = "Close Settings";
    toplineEl.appendChild(close);
  }

  /* The breadcrumb lives at the top of the canvas rather than in the topline: it is
   * a fact about the page, it is the widest place on screen, and putting it here means
   * it never has to be truncated to make room for the search field. */
  function crumbNav(route, check) {
    var crumbs = el("nav", "cx-crumbs");
    crumbs.setAttribute("data-pm-breadcrumb", "");
    crumbs.setAttribute("aria-label", "Breadcrumb");
    var trail = check.ok ? breadcrumbTrail(route)
      : [{ label: "Settings", dest: { kind: "home" } }, { label: "Unknown link", dest: null }];
    trail.forEach(function (step, i, arr) {
      if (i) crumbs.appendChild(el("span", "cx-crumb-sep", icon("chevronRight", 10)));
      var b = button("cx-crumb", esc(step.label), step.dest ? function () { goTo(step.dest); } : null);
      if (i === arr.length - 1) b.setAttribute("aria-current", "page");
      crumbs.appendChild(b);
    });
    return crumbs;
  }

  /* Which deterministic situation is on screen, stated inside the page itself so a
   * screenshot explains itself — and pointed at the surface where the situation is
   * actually visible, because naming a situation without showing it is a caption. */
  var SITUATION_PROOF = {
    "loading-cached": null,
    "empty": null,
    "offline": null,
    "no-results": null,
    "typo-search": null,
    "validation-error": { label: "Open a page with values to type into", dest: { kind: "domain", domainId: "general", pageId: null } },
    "changed-elsewhere": { label: "Open a page that was changed", dest: { kind: "domain", domainId: "general", pageId: null } },
    "restart-required": { label: "Open a page with pending changes", dest: { kind: "domain", domainId: "general", pageId: null } },
    "managed": { label: "Open a page with managed values", dest: { kind: "domain", domainId: "safety", pageId: null } },
    "unavailable": { label: "Open a page with unavailable values", dest: { kind: "domain", domainId: "code", pageId: null } },
    "reconnect-required": { label: "Open the provider that expired", dest: { kind: "manager", managerId: "manager-providers" } },
    "usage-unavailable": { label: "Open the provider roster", dest: { kind: "manager", managerId: "manager-providers" } },
    "multi-install-shadowed": { label: "Open the installations", dest: { kind: "manager", managerId: "manager-providers" } },
    "unknown-install-owner": { label: "Open the installations", dest: { kind: "manager", managerId: "manager-providers" } },
    "update-available": { label: "Open the staged update", dest: { kind: "manager", managerId: "manager-providers" } },
    "import-conflict": { label: "Open the copy transaction", dest: { kind: "copy", step: "source" } },
    "rollback-complete": { label: "Open the receipt", dest: { kind: "copy", step: "source" } },
    "verify-failed-rollback": { label: "Open the receipt", dest: { kind: "copy", step: "source" } }
  };

  function situationBar() {
    var f = ST.activeFixture();
    if (!f || f.id === "normal") return null;
    var bar = el("div", "cx-situation");
    bar.innerHTML = icon("beaker", 13);
    var text = el("span", "cx-situation-text");
    text.innerHTML = "<b>" + esc(f.label) + "</b> — " + esc(f.note);
    bar.appendChild(text);
    var proof = SITUATION_PROOF[f.id];
    if (proof) {
      bar.appendChild(button("cx-btn cx-btn--quiet", esc(proof.label), function () { goTo(proof.dest); }));
    }
    return bar;
  }

  /* ------------------------------------------------------------- the edge tabs */

  /* The concept's signature: twelve area tabs standing on the right edge for the
   * whole session, with Home above them and the two utilities below. The hairline
   * between strip and canvas is drawn by the tabs themselves, so the current tab can
   * simply omit its share of it and read as joined to the page. */
  function renderStrip(route) {
    clear(stripEl);
    stripEl.appendChild(el("div", "cx-strip-gap"));

    var atHome = route.kind === "home" || route.kind === "query";
    stripEl.appendChild(tabButton("map", "Settings Home", atHome, function () { goTo({ kind: "home" }); }, null));

    stripEl.appendChild(el("div", "cx-strip-rule"));

    var currentDomain = route.domainId || (route.managerId ? managerDomain(route.managerId) : null);
    M.domains.forEach(function (d) {
      var tab = tabButton(d.icon, d.title, currentDomain === d.id,
        function () { goTo({ kind: "domain", domainId: d.id }); }, d.id);
      stripEl.appendChild(tab);
    });

    stripEl.appendChild(el("div", "cx-strip-rule"));
    stripEl.appendChild(tabButton("list", "All settings", route.kind === "all",
      function () { goTo({ kind: "all" }); }, null));
    stripEl.appendChild(tabButton("download", "Copy from a Project", route.kind === "copy",
      function () { goTo({ kind: "copy", step: "source" }); }, null));

    stripEl.appendChild(el("div", "cx-strip-cap"));
  }

  function tabButton(iconName, label, current, fn, domainId) {
    var b = button("cx-tab", icon(iconName, 15) + "<span class='cx-tab-label'>" + esc(label) + "</span>", fn);
    b.title = label;
    b.setAttribute("aria-label", label);
    if (current) b.setAttribute("aria-current", "true");
    if (domainId) b.setAttribute("data-pm-domain", domainId);
    return b;
  }

  /* At the narrowest width the tabs become a page that pushes the canvas aside. */
  function renderNavpage(route) {
    if (widthMode !== "compact") {
      if (navpageEl && navpageEl.parentNode) navpageEl.parentNode.removeChild(navpageEl);
      navpageEl = null;
      return;
    }
    if (!navpageEl) {
      navpageEl = el("nav", "cx-navpage");
      navpageEl.setAttribute("aria-label", "Settings areas");
      pushrowEl.appendChild(navpageEl);
    }
    clear(navpageEl);

    var head = el("div", "cx-navpage-head");
    head.appendChild(el("strong", null, "Settings areas"));
    head.appendChild(button("cx-btn cx-btn--quiet", icon("chevronRight", 14) + "<span class='cx-btn-label'>Close</span>", function () {
      ui.navOpen = false; measure(); render();
    }));
    navpageEl.appendChild(head);

    var list = el("div", "cx-navpage-list cx-scroll");
    var currentDomain = route.domainId || (route.managerId ? managerDomain(route.managerId) : null);

    list.appendChild(navItem("map", "Settings Home", M.counts.settings + " settings in this Project",
      route.kind === "home" || route.kind === "query", function () { goTo({ kind: "home" }); }, null));

    M.domains.forEach(function (d) {
      list.appendChild(navItem(d.icon, d.title, plural(d.count, "setting") + " · " + plural(d.pages.length, "page"),
        currentDomain === d.id, function () { goTo({ kind: "domain", domainId: d.id }); }, d.id));
    });

    list.appendChild(navItem("list", "All settings", "The complete faceted index",
      route.kind === "all", function () { goTo({ kind: "all" }); }, null));
    list.appendChild(navItem("download", "Copy from another Project", "A one-time transaction",
      route.kind === "copy", function () { goTo({ kind: "copy", step: "source" }); }, null));

    navpageEl.appendChild(list);
  }

  function navItem(iconName, title, sub, current, fn, domainId) {
    var b = button("cx-navitem", null, function () {
      ui.navOpen = false;
      measure();
      fn();
    });
    b.innerHTML = icon(iconName, 16);
    var body = el("div", "cx-navitem-body");
    body.appendChild(el("div", "cx-navitem-title", esc(title)));
    body.appendChild(el("div", "cx-navitem-sub", esc(sub)));
    b.appendChild(body);
    b.appendChild(el("span", null, icon("chevronRight", 13)));
    if (current) b.setAttribute("aria-current", "true");
    if (domainId) b.setAttribute("data-pm-domain", domainId);
    return b;
  }

  /* --------------------------------------------------------- state fixtures */

  function renderFoot() {
    clear(footEl);
    var active = ST.activeFixture();

    footEl.appendChild(el("span", null, "Situation"));
    var sel = el("select");
    sel.setAttribute("data-pm-state-control", "");
    sel.setAttribute("aria-label", "Deterministic demo situation");
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
      objectNameCache = {};
      withoutRender(function () { RT.replace(dest); });
      applyFixtureQuery();
      render();
      shell.announce("Situation: " + sel.options[sel.selectedIndex].textContent);
    });
    footEl.appendChild(sel);

    footEl.appendChild(el("span", "cx-footbar-note", esc(active.note)));

    footEl.appendChild(button("cx-btn cx-btn--quiet", icon("undo", 13) + "<span class='cx-btn-label'>Reset this concept</span>", function () {
      store.reset();
      MG.invalidate();
      objectNameCache = {};
      ui.openDetails = {}; ui.openAdvanced = {}; ui.errors = {};
      ui.copy = { step: 1, source: null, domains: null, preview: null, run: null, receipt: null };
      render();
      shell.announce("Every change made in this concept was cleared.");
    }));
  }

  /* A fixture about search puts its query in the field, so the situation it names is
   * the one on screen rather than one the reader has to reproduce. */
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
    var wrap = el("div", "cx-searchwrap cx-searchwrap--" + where);
    var field = el("div", "cx-searchfield");
    field.innerHTML = icon("search", where === "canvas" ? 17 : 15);

    var input = document.createElement("input");
    input.type = "text";
    input.spellcheck = false;
    input.autocomplete = "off";
    input.placeholder = where === "canvas"
      ? "Search every setting, manager, provider and action"
      : "Search settings";
    input.setAttribute("data-pm-search-field", "");
    input.setAttribute("aria-label", "Search all settings");
    input.value = ui.query;
    field.appendChild(input);

    if (ui.query) {
      field.appendChild(button("cx-searchclear", icon("ban", 14), function () {
        ui.query = ""; ui.results = null; ui.dropOpen = false;
        withoutRender(function () { RT.replace(RT.withState({ kind: "home" }, RT.current().state)); });
        render();
      }));
    }
    wrap.appendChild(field);

    var drop = el("div", "cx-drop");
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
        withoutRender(function () { RT.replace(RT.withState({ kind: "home" }, RT.current().state)); });
        return;
      }
      ui.results = IX.query(ui.query, { limit: 40 });
      ui.dropOpen = true;
      drop.hidden = false;
      fillDropdown(drop);
      /* The query lives in the route so Back from a chosen result returns to the
       * query AND the result that was chosen, not to a blank Home. This write is
       * bookkeeping: it must not re-render, or the caret dies. */
      withoutRender(function () { RT.replace(RT.withState({ kind: "query", query: ui.query }, RT.current().state)); });
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
      var empty = el("div", "cx-drop-empty");
      empty.innerHTML = "Nothing matches <b>" + esc(ui.query) + "</b>.";
      empty.appendChild(el("p", "cx-result-path",
        "Try a shorter word, or open an area from the tabs on the right. Search covers all " +
        M.counts.settings + " settings in this Project, including the ones that are unavailable on this host."));
      drop.appendChild(empty);
      return;
    }

    var scroll = el("div", "cx-drop-scroll cx-scroll");
    var index = 0;
    res.groups.forEach(function (group) {
      var g = el("div", "cx-drop-group");
      g.appendChild(el("div", "cx-drop-label", esc(group.label)));
      group.results.forEach(function (r) {
        var my = index++;
        var b = button("cx-result" + (my === ui.activeResult ? " is-active" : ""), null, function () { chooseResult(r.id); });
        b.setAttribute("data-pm-result", r.id);
        var top = el("div", "cx-result-top");
        top.appendChild(el("span", "cx-result-label", esc(r.label)));
        top.appendChild(el("span", "cx-result-type", esc(r.typeLabel)));
        b.appendChild(top);
        b.appendChild(el("div", "cx-result-path", esc(r.path)));
        if (r.availability) b.appendChild(el("div", "cx-result-avail", esc(r.availability)));
        g.appendChild(b);
      });
      scroll.appendChild(g);
    });
    drop.appendChild(scroll);

    var foot = el("div", "cx-drop-foot");
    foot.appendChild(el("span", null, esc(res.shown + " of " + res.total + " matches")));
    if (res.truncated) {
      foot.appendChild(button("cx-drop-more", "See them all in All settings", function () {
        ui.dropOpen = false;
        goTo({ kind: "all", facet: ui.query });
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
    withoutRender(function () {
      RT.replace(RT.withState({ kind: "query", query: ui.query, resultId: resultId }, RT.current().state));
    });
    ui.pending = { result: result, query: ui.query };
    goTo(destinationRoute(result.destination));
  }

  function destinationRoute(d) {
    if (d.managerId) {
      return { kind: "manager", managerId: d.managerId, objectId: d.objectId || null,
        sectionKey: d.sectionKey || null, rowId: d.rowId || null };
    }
    return { kind: "domain", domainId: d.domainId, pageId: d.pageId, sectionId: d.sectionId, settingId: d.settingId };
  }

  /* -------------------------------------------------------------------- home */

  function renderHome(head, body) {
    var fx = ST.effects();

    /* The Project is context, and it is the first thing on the page: never a
     * selector, never a thing to switch between. */
    head.appendChild(el("h2", "cx-title", esc(M.project.name)));
    head.appendChild(el("p", "cx-lede",
      "Project settings. Everything here applies to this Project only, and the tabs down the right edge stay with you: " +
      "one per area, always in reach." + (fx.refreshing ? " These values are the cached ones; they are being refreshed now." : "")));
    head.appendChild(searchField("canvas"));

    renderHomeBody(body);
  }

  function renderHomeBody(body) {
    var fx = ST.effects();

    var notice = ST.notice();
    if (notice && !store.isDismissed(notice.id)) body.appendChild(renderNotice(notice));

    body.appendChild(renderAttention(fx));

    var areas = el("section", "cx-block");
    var ah = el("div", "cx-blockhead");
    ah.appendChild(el("h3", null, "Areas"));
    ah.appendChild(el("span", "cx-blockhead-n", plural(M.counts.settings, "setting") + " in " + plural(M.counts.pages, "page")));
    areas.appendChild(ah);

    var list = el("div", "cx-readlist");
    M.domains.forEach(function (d) {
      var b = button("cx-read", null, function () { goTo({ kind: "domain", domainId: d.id }); });
      b.setAttribute("data-pm-domain", d.id);
      b.innerHTML = icon(d.icon, 16);
      var inner = el("div", "cx-read-body");
      inner.appendChild(el("div", "cx-read-title", esc(d.title)));
      inner.appendChild(el("div", "cx-read-sub", esc(d.purpose)));
      inner.appendChild(el("div", "cx-read-meta",
        plural(d.count, "setting") + " · " + plural(d.pages.length, "page") +
        (d.families.length ? " · " + plural(d.families.length, "manager") : "") +
        (fx.refreshing ? " · refreshing" : "")));
      b.appendChild(inner);
      b.appendChild(el("span", "cx-read-chev", icon("chevronRight", 14)));
      list.appendChild(b);
    });
    areas.appendChild(list);
    body.appendChild(areas);

    var utils = el("section", "cx-block");
    var uh = el("div", "cx-blockhead");
    uh.appendChild(el("h3", null, "Also here"));
    utils.appendChild(uh);
    var row = el("div", "cx-utils");
    row.appendChild(button("cx-btn", icon("list", 14) + "<span class='cx-btn-label'>All settings</span>",
      function () { goTo({ kind: "all" }); }));
    row.appendChild(button("cx-btn", icon("download", 14) + "<span class='cx-btn-label'>Copy settings from another Project</span>",
      function () { goTo({ kind: "copy", step: "source" }); }));
    row.appendChild(button("cx-btn", icon("history", 14) + "<span class='cx-btn-label'>What has changed here</span>", function () {
      ui.facets = { domains: [], kinds: [], exposures: [], changedOnly: true };
      goTo({ kind: "all" });
    }));
    row.appendChild(button("cx-btn", icon("beaker", 14) + "<span class='cx-btn-label'>Doctor</span>",
      function () { goTo({ kind: "manager", managerId: "manager-doctor" }); }));
    utils.appendChild(row);
    body.appendChild(utils);
  }

  function renderNotice(notice) {
    var box = el("div", "cx-notice");
    box.setAttribute("data-tone", notice.tone === "info" ? "info" : "attention");
    box.innerHTML = icon(notice.tone === "info" ? "info" : "alert", 16);
    var body = el("div", "cx-notice-body");
    body.appendChild(el("div", "cx-notice-head", esc(notice.headline)));
    body.appendChild(el("p", "cx-notice-detail", esc(notice.detail)));
    box.appendChild(body);
    var acts = el("div", "cx-notice-acts");
    if (notice.action) {
      acts.appendChild(button("cx-btn cx-btn--primary", esc(notice.action.label), function () {
        goTo(destinationRoute(notice.action.destination));
      }));
    }
    var dismiss = button("cx-btn cx-btn--quiet", icon("ban", 13), function () {
      store.dismiss(notice.id); render();
    });
    dismiss.title = "Dismiss this notice";
    dismiss.setAttribute("aria-label", "Dismiss this notice");
    acts.appendChild(dismiss);
    box.appendChild(acts);
    return box;
  }

  function renderAttention(fx) {
    var items = ST.attentionFlat().filter(function (a) { return !store.isDismissed(a.id); });
    var box = el("section", "cx-block");
    var head = el("div", "cx-blockhead");
    head.appendChild(el("h3", null, "Notices"));
    head.appendChild(el("span", "cx-blockhead-n", items.length ? String(items.length) : "nothing"));
    box.appendChild(head);

    if (!items.length) {
      box.appendChild(el("p", "cx-attn-empty", fx.noAttention
        ? "Nothing is configured yet, so there is nothing to fix. AI Brains & Providers is the usual place to start."
        : "Nothing in this Project needs attention right now."));
      return box;
    }
    items.forEach(function (a) {
      /* `01_CORE_ARCHITECTURE` § Notices: three separated runs. What is broken, what
       * is half-finished and what is only advice are read differently, and one toned
       * list makes an unfinished setup look like a fault. */
      if (a.groupLabel) box.appendChild(el("div", "cx-attn-group", esc(a.groupLabel)));
      var b = button("cx-attn", null, function () { goTo(destinationRoute(a.destination)); });
      var dot = el("span", "cx-attn-dot");
      dot.setAttribute("data-tone", a.tone);
      b.appendChild(dot);
      var body = el("div", "cx-attn-body");
      body.appendChild(el("div", "cx-attn-label", esc(a.label)));
      body.appendChild(el("div", "cx-attn-detail", esc(a.detail)));
      b.appendChild(body);
      b.appendChild(el("span", "cx-attn-act", esc(a.actionLabel)));
      box.appendChild(b);
    });
    return box;
  }

  /* ------------------------------------------------------------------ domain */

  function renderDomain(head, body, route) {
    var d = M.domain(route.domainId);
    if (!d) return;

    head.appendChild(el("h2", "cx-title", esc(d.title)));
    head.appendChild(el("p", "cx-lede", esc(d.purpose)));
    head.appendChild(el("div", "cx-meta",
      plural(d.count, "setting") + " across " + plural(d.pages.length, "page") +
      (d.families.length ? ", plus " + plural(d.families.length, "manager") : "")));

    var pages = el("section", "cx-block");
    var ph = el("div", "cx-blockhead");
    ph.appendChild(el("h3", null, "Pages"));
    ph.appendChild(el("span", "cx-blockhead-n", String(d.pages.length)));
    pages.appendChild(ph);
    var plist = el("div", "cx-readlist");
    d.pages.forEach(function (p) {
      var b = button("cx-read", null, function () { goTo({ kind: "domain", domainId: d.id, pageId: p.id }); });
      b.setAttribute("data-pm-page", p.id);
      b.innerHTML = icon("fileText", 15);
      var inner = el("div", "cx-read-body");
      inner.appendChild(el("div", "cx-read-title", esc(p.title)));
      inner.appendChild(el("div", "cx-read-sub", esc(p.summary)));
      inner.appendChild(el("div", "cx-read-meta", plural(p.count, "setting") + " in " + plural(p.sections.length, "group")));
      b.appendChild(inner);
      b.appendChild(el("span", "cx-read-chev", icon("chevronRight", 14)));
      plist.appendChild(b);
    });
    pages.appendChild(plist);
    body.appendChild(pages);

    if (d.families.length) {
      var mgrs = el("section", "cx-block");
      var mh = el("div", "cx-blockhead");
      mh.appendChild(el("h3", null, "Managers in this area"));
      mh.appendChild(el("span", "cx-blockhead-n", String(d.families.length)));
      mgrs.appendChild(mh);
      var mlist = el("div", "cx-readlist");
      d.families.forEach(function (f) {
        /* The title, purpose and icon come from the registry, never from a built
         * spec: building one here would hydrate every manager in the area just to
         * draw a list of links. */
        var rec = MG.record(f.managerId) || {};
        var b = button("cx-read", null, function () { goTo({ kind: "manager", managerId: f.managerId }); });
        b.setAttribute("data-pm-manager", f.managerId);
        b.innerHTML = icon(rec.icon || "sliders", 15);
        var inner = el("div", "cx-read-body");
        inner.appendChild(el("div", "cx-read-title", esc(rec.title || f.family)));
        inner.appendChild(el("div", "cx-read-sub", esc(rec.purpose || f.family)));
        inner.appendChild(el("div", "cx-read-meta", f.deferred ? "Owned by " + esc(f.owner) : archetypeWord(f.archetype)));
        b.appendChild(inner);
        b.appendChild(el("span", "cx-read-chev", icon("chevronRight", 14)));
        mlist.appendChild(b);
      });
      mgrs.appendChild(mlist);
      body.appendChild(mgrs);
    }
  }

  /* -------------------------------------------------------------------- page */

  function renderPage(head, body, route) {
    var d = M.domain(route.domainId);
    var p = M.page(route.pageId);
    if (!d || !p) return;

    head.appendChild(el("h2", "cx-title", esc(p.title)));
    head.appendChild(el("p", "cx-lede", esc(p.summary)));
    head.appendChild(el("div", "cx-meta", plural(p.count, "setting") + " in " + plural(p.sections.length, "group")));

    /* A deep link to an advanced row must open the disclosure that holds it —
     * landing on a collapsed group would be a link that lies. */
    if (route.settingId) {
      var target = M.setting(route.settingId);
      if (target) ui.openAdvanced[target.sectionId] = true;
    }

    var fx = ST.effects();
    if (fx.restartPending) {
      body.appendChild(quietLine("clock", "Some changes on this page only take effect after a restart. They are saved either way."));
    }
    if (fx.changedElsewhere) {
      body.appendChild(quietLine("refresh", "Another window changed values in this Project while this page was open. Rows that differ are marked."));
    }

    /* An index of this page's own groups that follows the scroll, not only the click.
     * `01_CORE_ARCHITECTURE` item 4 and the navigation video both ask for the highlight
     * to move as the reader scrolls; an index that only responds to clicks can say
     * where you asked to go but never where you are. */
    var __idx = el("nav", "cx-onpage");
    __idx.setAttribute("aria-label", "On this page");
    __idx.appendChild(el("span", "cx-onpage-label", "On this page"));
    var __built = [];
    p.sections.forEach(function (section) {
      var __b = document.createElement("button");
      __b.type = "button";
      __b.className = "cx-onpage-item";
      __b.textContent = section.title;
      __b.setAttribute("data-onpage", section.id);
      __b.addEventListener("click", function () {
        var el2 = document.querySelector('[data-pm-section="' + section.id.replace(/"/g, '\\"') + '"]');
        if (el2 && el2.scrollIntoView) el2.scrollIntoView({ block: "start" });
      });
      __idx.appendChild(__b);
    });
    if (p.sections.length > 1) body.appendChild(__idx);

    p.sections.forEach(function (section) {
      var __node = renderSection(section);
      body.appendChild(__node);
      __built.push({ id: section.id, title: section.title, pageId: p.id, el: __node });
    });

    /* Deferred one frame: at this point the surface is still being assembled and is not
     * yet in the document, so walking up from a section would find no scrolling ancestor
     * and silently fall back to the page body — which is why the highlight never moved. */
    if (window.PM2Spy && __built.length) window.requestAnimationFrame(function () {
      var __scroller = body;
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

  function quietLine(iconName, text) {
    var box = el("div", "cx-foundvia");
    box.innerHTML = icon(iconName, 13) + "<span>" + esc(text) + "</span>";
    return box;
  }

  function renderSection(section) {
    var box = el("section", "cx-section");
    box.setAttribute("data-pm-section", section.id);

    var head = el("div", "cx-section-head");
    head.appendChild(el("h3", "cx-section-title", esc(section.title)));
    head.appendChild(el("span", "cx-section-n", plural(section.count, "setting")));
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
      box.appendChild(button("cx-why", (open ? "Hide" : "Show") + " " + plural(deeper.length, "deeper setting"), function () {
        ui.openAdvanced[section.id] = !open;
        render();
      }));
    }
    return box;
  }

  function renderRow(rec) {
    var state = ST.rowState(rec);
    var row = el("div", "cx-row");
    row.setAttribute("data-pm-row", rec.id);
    row.tabIndex = -1;
    var editable = M.isEditable(state);
    if (!editable) row.setAttribute("data-locked", "true");

    var main = el("div", "cx-row-main");
    var label = el("div", "cx-row-label");
    label.appendChild(el("span", "cx-row-title", esc(rec.label)));

    var tone = M.stateTone(state);
    if (tone !== "quiet") {
      var tag = el("span", "cx-tag", esc(M.stateLabel(state)));
      tag.setAttribute("data-tone", tone);
      label.appendChild(tag);
    } else if (store.changed(rec.id)) {
      var ch = el("span", "cx-tag", "Changed");
      ch.setAttribute("data-tone", "changed");
      label.appendChild(ch);
    }
    if (state.restart === "required") {
      var rs = el("span", "cx-tag", "Needs a restart");
      rs.setAttribute("data-tone", "setup");
      label.appendChild(rs);
    }
    if (ST.effects().changedElsewhere && state.source === "custom" && !state.isDefault) {
      var ce = el("span", "cx-tag", "Changed in another window");
      ce.setAttribute("data-tone", "setup");
      label.appendChild(ce);
    }
    main.appendChild(label);
    main.appendChild(el("p", "cx-row-desc", esc(rec.desc)));

    var reason = M.stateReason(state);
    if (reason || rec.badges.length || rec.legacyScope.length) {
      var openDet = !!ui.openDetails[rec.id];
      main.appendChild(button("cx-why", openDet ? "Hide details" : "Why this value?", function () {
        ui.openDetails[rec.id] = !openDet;
        render();
      }));
      if (openDet) main.appendChild(rowDetails(rec, state, reason));
    }
    if (ui.errors[rec.id]) main.appendChild(el("div", "cx-err", esc(ui.errors[rec.id])));

    row.appendChild(main);
    row.appendChild(renderControl(rec, state, editable));
    return row;
  }

  function rowDetails(rec, state, reason) {
    var box = el("div", "cx-details");
    if (reason) box.appendChild(el("p", null, esc(reason)));
    var dl = el("dl");
    function pair(k, v) {
      dl.appendChild(el("dt", null, esc(k)));
      dl.appendChild(el("dd", null, esc(v)));
    }
    pair("Applies to", M.project.name + " (this Project)");
    pair("Default", String(state.defaultValue === "" ? "not set" : state.defaultValue));
    if (rec.recommended != null && rec.recommended !== "") pair("Recommended", String(rec.recommended));
    pair("Depth", exposureWord(rec.exposure));
    if (state.restart === "required") pair("Takes effect", "after the next restart");
    if (state.managedBy) pair("Set by", state.managedBy);
    pair("Technical name", rec.id);
    box.appendChild(dl);
    return box;
  }

  /* Controls do real work: every change lands in the store, which is what makes the
   * Changed tag and the copy preview truthful rather than decorative. */

  /* The Puppet Master Model/Mode selector idiom: a trigger carrying the current value,
   * and a menu that hangs beneath it — or flips above when the row sits near the bottom
   * of the page, which is what the model picker in the bottom bar does. Placement,
   * layering and one-layer-at-a-time Escape come from PM2Menu; every pixel is this
   * concept's own. */
  function pmPicker(rec, options, value, onPick) {
    var wrap = el("div", "cx-picker");
    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "cx-picker-trigger";
    trigger.setAttribute("data-pm-control", rec.id);
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", rec.label);
    var valueEl = document.createElement("span");
    valueEl.className = "cx-picker-value";
    valueEl.textContent = String(value === "" || value == null ? "Not set" : value);
    trigger.appendChild(valueEl);
    var chev = document.createElement("span");
    chev.className = "cx-picker-chev";
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
      row.className = "cx-menu-item";
      row.setAttribute("role", "option");
      row.setAttribute("data-opt", String(i));
      row.setAttribute("aria-selected", o === value ? "true" : "false");
      var mark = document.createElement("span");
      mark.className = "cx-menu-check";
      mark.innerHTML = o === value ? window.PMIcons.icon("check", 12) : "";
      row.appendChild(mark);
      var lab = document.createElement("span");
      lab.className = "cx-menu-label";
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
      row.className = "cx-menu-item is-parent";
      row.setAttribute("role", "option");
      row.setAttribute("data-opt", String(i));
      row.setAttribute("aria-haspopup", "menu");
      row.setAttribute("aria-expanded", "false");
      var mark = document.createElement("span");
      mark.className = "cx-menu-check";
      mark.innerHTML = g.options.indexOf(value) >= 0 ? window.PMIcons.icon("check", 12) : "";
      row.appendChild(mark);
      var lab = document.createElement("span");
      lab.className = "cx-menu-label";
      lab.textContent = String(g.label);
      row.appendChild(lab);
      var more = document.createElement("span");
      more.className = "cx-menu-more";
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
        sub.className = "cx-menu cx-submenu";
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
      panel.className = "cx-menu";
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
    var box = el("div", "cx-row-control");
    var value = store.valueOf(rec.id);
    if (value === undefined) value = state.value;

    function commit(next) {
      store.setValue(rec.id, next);
      delete ui.errors[rec.id];
      MG.invalidate();
      render();
    }

    if (!editable) {
      box.appendChild(el("span", "cx-valuetext cx-valuetext--empty",
        state.source === "unavailable" ? "Not available on this host" : esc(String(value === "" ? "not set" : value))));
      return box;
    }

    if (rec.kind === "toggle") {
      var t = button("cx-toggle", "", function () { commit(!value); });
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
      var n = el("input", "cx-input");
      n.type = "number";
      n.value = value === "" ? "" : String(value);
      n.setAttribute("data-pm-control", rec.id);
      n.setAttribute("aria-label", rec.label);
      on(n, "change", function () {
        var num = Number(n.value);
        if (n.value === "" || isNaN(num)) {
          ui.errors[rec.id] = "That needs to be a number. The previous value is still in use, and what you typed was kept.";
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
      var r = el("input", "cx-range");
      r.type = "range";
      r.min = "0";
      r.max = String(Math.max(100, Number(state.defaultValue) * 2 || 100));
      r.value = String(Number(value) || 0);
      r.setAttribute("data-pm-control", rec.id);
      r.setAttribute("aria-label", rec.label);
      var out = el("span", "cx-rangeval", esc(String(value)));
      on(r, "input", function () { out.textContent = r.value; });
      on(r, "change", function () { commit(Number(r.value)); });
      box.appendChild(r);
      box.appendChild(out);
      return box;
    }

    if (rec.kind === "text" || rec.kind === "path") {
      var i = el("input", "cx-input");
      i.type = "text";
      i.value = value == null ? "" : String(value);
      i.placeholder = state.source === "notConfigured" ? "Not set" : "";
      i.setAttribute("data-pm-control", rec.id);
      i.setAttribute("aria-label", rec.label);
      if (window.PMSpellcheck && window.PMSpellcheck.attach && rec.kind === "text") window.PMSpellcheck.attach(i);
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
      var a = button("cx-btn", esc(state.setupLabel || "Run"), function () {
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
    box.appendChild(el("span", "cx-valuetext" + (list.length ? "" : " cx-valuetext--empty"),
      list.length ? esc(list.slice(0, 2).join(", ") + (list.length > 2 ? " and " + (list.length - 2) + " more" : "")) : "Nothing set"));
    var edit = button("cx-btn", "Edit", function () {
      var next = window.prompt("One entry per line — " + rec.label, list.join("\n"));
      if (next == null) return;
      commit(next.split("\n").map(function (x) { return x.trim(); }).filter(function (x) { return !!x; }));
    });
    edit.setAttribute("data-pm-control", rec.id);
    box.appendChild(edit);
    return box;
  }

  /* ---------------------------------------------------------------- managers */

  function renderManagerSurface(head, body, route) {
    /* Hydration happens here and nowhere else: a manager is built when it is opened,
     * never on load, never by search, never to label a link. */
    var spec = ST.decorate(MG.spec(route.managerId, store.get()));
    var family = M.familyOf(route.managerId) || {};
    var domain = family.domainId ? M.domain(family.domainId) : null;

    head.appendChild(el("h2", "cx-title", esc(spec.title)));
    head.appendChild(el("p", "cx-lede", esc(spec.purpose)));
    head.appendChild(el("div", "cx-meta", esc(archetypeWord(spec.archetype)) +
      (domain ? " · a manager in " + esc(domain.title) : "")));

    renderManager(spec, { route: route, family: family, body: body });
  }

  /* One entry point, branching on the archetype the packet assigned, so a roster is
   * never flattened into preference rows and a read-only projection never grows
   * editing affordances it has no right to. */
  function renderManager(spec, ctx) {
    var body = ctx.body;
    var route = ctx.route;

    if (spec.managerId === "manager-providers") { renderProviderManager(spec, ctx); return; }

    if (ctx.family.deferred || spec.archetype === "named owner insertion point") {
      renderOwnerManager(spec, ctx);
      return;
    }

    if (spec.health && (spec.health.headline || spec.health.detail || (spec.health.counts || []).length)) {
      body.appendChild(healthBlock(spec.health));
    }

    var archetype = spec.archetype;

    if (archetype === "read-only health projection") { renderProjectionManager(spec, ctx); return; }
    if (archetype === "setup or repair sequence") { renderSequenceManager(spec, ctx); return; }
    if (archetype === "preview and confirmation transaction") { renderTransactionManager(spec, ctx); return; }
    if (archetype === "diagnostic drawer") { renderDrawerManager(spec, ctx); return; }

    var roster = pickRoster(spec);
    if (roster) renderRosterManager(spec, roster, ctx);
    else renderDocumentManager(spec, ctx);

    if (spec.diagnostics && spec.diagnostics.length && archetype !== "diagnostic drawer") {
      body.appendChild(diagnosticsBlock(spec, route.managerId));
    }
  }

  /* A roster is only a roster when the archetype says the manager is about objects.
   * A preference document with one incidental list must not be forced into a
   * two-pane layout it never asked for. */
  function pickRoster(spec) {
    var wants = spec.archetype === "resource roster and detail sheet" || spec.archetype === "inventory catalogue";
    if (!wants) return null;
    var best = null;
    (spec.sections || []).forEach(function (s) {
      if (s.kind !== "list" && s.kind !== "cards" && s.kind !== "table") return;
      if (!best || (s.items || []).length > (best.items || []).length) best = s;
    });
    return best && (best.items || []).length > 1 ? best : null;
  }

  function renderRosterManager(spec, roster, ctx) {
    var route = ctx.route;
    var body = ctx.body;
    var managerId = route.managerId;

    /* A routed object may live on a subpage rather than in the roster. When it does,
     * the roster keeps its own selection and the subpage holding the object is the
     * one opened, so the link lands on the row it named. */
    var elsewhere = route.objectId && !hasItem(roster, route.objectId) ? sectionHolding(spec, route.objectId) : null;
    var selectedId = (elsewhere ? null : route.objectId) || ui.selected[managerId] || roster.items[0].id;
    if (!hasItem(roster, selectedId)) selectedId = roster.items[0].id;
    ui.selected[managerId] = selectedId;

    var mgr = el("div", "cx-mgr");
    mgr.setAttribute("data-pane", widthMode === "compact" && route.objectId ? "detail" : "roster");
    if (widthMode !== "compact") mgr.setAttribute("data-pane", "both");

    mgr.appendChild(rosterPane(roster, selectedId, managerId));

    var detail = el("div", "cx-mgr-detail");
    var item = itemById(roster, selectedId);
    if (item) {
      detail.appendChild(el("h3", "cx-title cx-title--small", esc(item.name)));
      if (item.secondary) detail.appendChild(el("p", "cx-lede", esc(item.secondary)));

      var tabs = (spec.sections || []).filter(function (s) { return s !== roster; });
      var current = (elsewhere && elsewhere.id) || route.sectionKey || ui.tab[managerId] || "overview";
      if (current !== "overview" && !tabs.some(function (t) { return t.id === current; })) current = "overview";
      ui.tab[managerId] = current;

      detail.appendChild(localTabs(tabs, current, function (id) {
        goTo({ kind: "manager", managerId: managerId, objectId: selectedId, sectionKey: id });
      }));

      if (current === "overview") detail.appendChild(objectSheet(item, managerId));
      else {
        var section = tabs.filter(function (t) { return t.id === current; })[0];
        if (section) detail.appendChild(renderSpecSection(section, managerId));
      }
    }
    mgr.appendChild(detail);
    body.appendChild(mgr);

    if (widthMode === "compact" && route.objectId) {
      body.insertBefore(button("cx-btn", icon("chevronLeft", 13) + "<span class='cx-btn-label'>Back to " + esc(roster.label) + "</span>",
        function () { goTo({ kind: "manager", managerId: managerId }); }), mgr);
    }
  }

  function rosterPane(roster, selectedId, managerId) {
    var side = el("div", "cx-mgr-roster");
    var rh = el("div", "cx-mgr-roster-head");
    rh.appendChild(el("span", null, esc(roster.label)));
    rh.appendChild(el("span", null, String(roster.items.length)));
    side.appendChild(rh);

    var list = el("div", "cx-mgr-roster-list cx-scroll");
    var items = roster.items;
    if (!items.length) {
      var e = roster.empty || {};
      var empty = el("div", "cx-empty");
      empty.appendChild(el("div", "cx-empty-head", esc(e.headline || "Nothing here yet")));
      if (e.detail) empty.appendChild(el("p", null, esc(e.detail)));
      side.appendChild(empty);
      return side;
    }

    /* Bounded even if a fixture grows: a roster past the window renders the slice
     * around the selection and says how much it is not showing. */
    var slice = items;
    var note = null;
    if (items.length > 200) {
      var at = 0;
      items.forEach(function (it, i) { if (it.id === selectedId) at = i; });
      var start = Math.max(0, Math.min(items.length - 200, at - 100));
      slice = items.slice(start, start + 200);
      note = "Showing " + slice.length + " of " + items.length + ". Use search to reach the rest.";
    }

    slice.forEach(function (item) {
      var b = button("cx-obj", null, function () {
        ui.selected[managerId] = item.id;
        goTo({ kind: "manager", managerId: managerId, objectId: item.id });
      });
      b.setAttribute("data-pm-object", item.id);
      b.setAttribute("aria-selected", item.id === selectedId ? "true" : "false");
      var body = el("div", "cx-obj-body");
      body.appendChild(el("div", "cx-obj-name", esc(item.name)));
      if (item.secondary) body.appendChild(el("div", "cx-obj-sub", esc(item.secondary)));
      b.appendChild(body);
      if (item.statusWord) {
        var st = el("span", "cx-tag", esc(item.statusWord));
        st.setAttribute("data-tone", toneOf(item.status));
        b.appendChild(st);
      }
      list.appendChild(b);
    });
    side.appendChild(list);
    if (note) side.appendChild(el("div", "cx-facet-head", esc(note)));
    return side;
  }

  function toneOf(status) {
    if (status === "attention" || status === "risky") return "attention";
    if (status === "managed") return "managed";
    if (status === "unavailable") return "unavailable";
    if (status === "setup" || status === "degraded") return "setup";
    if (status === "ok" || status === "connected") return "ok";
    return "quiet";
  }

  function hasItem(section, id) {
    return (section.items || []).some(function (i) { return i.id === id; });
  }

  function itemById(section, id) {
    return (section.items || []).filter(function (i) { return i.id === id; })[0] || null;
  }

  function sectionHolding(spec, objectId) {
    var found = null;
    (spec.sections || []).forEach(function (s) {
      if (found) return;
      (s.items || []).forEach(function (it) { if (it.id === objectId) found = s; });
    });
    return found;
  }

  /* Manager-local tabs. They are horizontal pills inside the page, deliberately a
   * different shape from the vertical edge tabs, so the reader never confuses
   * "which part of this manager" with "which area of Settings". */
  function localTabs(sections, current, choose) {
    var strip = el("div", "cx-tabs");
    strip.setAttribute("role", "tablist");
    strip.appendChild(localTab("Overview", current === "overview", function () { choose("overview"); }));
    sections.forEach(function (s) {
      strip.appendChild(localTab(s.label || s.id, current === s.id, function () { choose(s.id); }));
    });
    return strip;
  }

  function localTab(label, selected, fn) {
    var b = button("cx-ltab", esc(label), fn);
    b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", selected ? "true" : "false");
    return b;
  }

  function objectSheet(item, managerId) {
    var box = el("div");
    if (item.fields && Object.keys(item.fields).length) {
      var dl = el("dl", "cx-fields");
      Object.keys(item.fields).forEach(function (k) {
        dl.appendChild(el("dt", null, esc(k)));
        dl.appendChild(el("dd", null, esc(String(item.fields[k]))));
      });
      box.appendChild(dl);
    }
    if (item.badges && item.badges.length) {
      var tags = el("div", "cx-actions");
      item.badges.forEach(function (b) {
        var t = el("span", "cx-tag", esc(b.text));
        if (b.tone) t.setAttribute("data-tone", toneOf(b.tone));
        if (b.title) t.title = b.title;
        tags.appendChild(t);
      });
      box.appendChild(tags);
    }
    if (item.availability && item.availability.available === false) {
      box.appendChild(quietLine("info", item.availability.reason + (item.availability.owner ? " Owned by " + item.availability.owner + "." : "")));
    }
    if (item.editable && item.editable.length) box.appendChild(editableFields(item, managerId));
    if (item.detail && item.detail.length) {
      item.detail.forEach(function (d) {
        if (!d) return;
        var line = el("div", "cx-prose");
        line.appendChild(el("p", null, esc((d.label ? d.label + ": " : "") + (d.value == null ? "" : d.value))));
        box.appendChild(line);
      });
    }
    if (item.actions && item.actions.length) box.appendChild(actionRow(item.actions, managerId, item));
    if (!box.childNodes.length) {
      box.appendChild(el("p", "cx-prose", esc(item.name + " has nothing further to configure here.")));
    }
    return box;
  }

  function actionRow(actions, managerId, item) {
    var acts = el("div", "cx-actions");
    var offline = ST.effects().degradeNetworkActions;
    actions.forEach(function (a) {
      var b = button("cx-btn" + (a.primary ? " cx-btn--primary" : ""), esc(a.label), function () {
        runAction(managerId, a, item);
      });
      if (offline && /install|sign in|refresh|check|update|connect|authenticate|fetch/i.test(a.label)) {
        b.disabled = true;
        b.title = "There is no network connection, so this cannot run yet.";
      }
      acts.appendChild(b);
    });
    return acts;
  }

  function editableFields(item, managerId) {
    var box = el("div");
    item.editable.forEach(function (f) {
      var row = el("div", "cx-row");
      var main = el("div", "cx-row-main");
      main.appendChild(el("div", "cx-row-title", esc(f.label)));
      if (f.help) main.appendChild(el("p", "cx-row-desc", esc(f.help)));
      row.appendChild(main);

      var ctl = el("div", "cx-row-control");
      var current = store.edit(managerId, item.id, f.key, f.value);
      if (f.secretKind) {
        /* Secret material is never rendered. The reference is named, and the only
         * offer is one that replaces it. */
        ctl.appendChild(el("span", "cx-valuetext", "Stored — never shown"));
        ctl.appendChild(button("cx-btn", "Replace", function () {
          window.PMSim.run({
            label: "Replace " + f.label,
            detail: "Opens the credential entry flow. No existing secret is read or displayed.",
            realCall: "cmd.provider.connection.authenticate"
          });
        }));
      } else if (f.kind === "toggle") {
        var t = button("cx-toggle", "", function () {
          store.setEdit(managerId, item.id, f.key, !current);
          MG.invalidate(managerId);
          render();
        });
        t.setAttribute("role", "switch");
        t.setAttribute("aria-checked", current ? "true" : "false");
        t.setAttribute("aria-label", f.label);
        ctl.appendChild(t);
      } else if (f.kind === "select" && f.options && f.options.length) {
        var s = el("select", "cx-select");
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
        var i = el("input", "cx-input");
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

  function renderDocumentManager(spec, ctx) {
    (spec.sections || []).forEach(function (section) {
      ctx.body.appendChild(renderSpecSection(section, ctx.route.managerId));
    });
    if (spec.notes && spec.notes.length) ctx.body.appendChild(notesBlock(spec.notes));
  }

  /* A read-only projection states what it knows and offers no editing. Its numbers
   * are facts reported by somebody else, so the page says who. */
  function renderProjectionManager(spec, ctx) {
    var body = ctx.body;
    body.appendChild(quietLine("eye", "Everything on this page is reported, not set. Where it can be changed, the page says where."));
    (spec.sections || []).forEach(function (section) {
      body.appendChild(renderSpecSection(section, ctx.route.managerId, { readOnly: true }));
    });
    if (spec.diagnostics && spec.diagnostics.length) body.appendChild(diagnosticsBlock(spec, ctx.route.managerId));
    if (spec.notes && spec.notes.length) body.appendChild(notesBlock(spec.notes));
  }

  /* A sequence is numbered, one step at a time, with the reason each step exists.
   * Nothing runs on its own: acquisition is always something the reader asks for. */
  function renderSequenceManager(spec, ctx) {
    var body = ctx.body;
    var sections = spec.sections || [];
    var steps = el("div", "cx-steps");
    sections.forEach(function (s, i) {
      if (i) steps.appendChild(el("span", "cx-step-arrow", icon("chevronRight", 12)));
      var step = el("div", "cx-step");
      step.setAttribute("data-state", i === 0 ? "current" : "todo");
      step.appendChild(el("span", "cx-step-n", String(i + 1)));
      step.appendChild(el("span", null, esc(s.label || ("Step " + (i + 1)))));
      steps.appendChild(step);
    });
    if (sections.length) body.appendChild(steps);
    body.appendChild(quietLine("info", "Nothing here installs or signs in on its own. Each step waits for you, and each one says what it will do first."));
    sections.forEach(function (section) {
      body.appendChild(renderSpecSection(section, ctx.route.managerId));
    });
    if (spec.notes && spec.notes.length) body.appendChild(notesBlock(spec.notes));
  }

  /* A transaction shows what it will do before it does it, and keeps the receipt. */
  function renderTransactionManager(spec, ctx) {
    var body = ctx.body;
    var fx = ST.effects();
    if (fx.verifyFailed) {
      body.appendChild(quietLine("alert", "The last run verified badly and undid itself. This Project is exactly as it was."));
    } else if (fx.rollbackComplete) {
      body.appendChild(quietLine("undo", "The last run was rolled back. The restore point and the receipt are both still here."));
    } else if (fx.importConflict) {
      body.appendChild(quietLine("alert", "The staged import disagrees with values this Project already has. Every conflict is itemised before anything is applied."));
    }
    body.appendChild(quietLine("shield", "A restore point is taken before anything is written, and the run is applied in one piece or not at all."));
    (spec.sections || []).forEach(function (section) {
      body.appendChild(renderSpecSection(section, ctx.route.managerId));
    });
    if (spec.managerId === "manager-copy") {
      var acts = el("div", "cx-actions");
      acts.appendChild(button("cx-btn cx-btn--primary", "Open the copy transaction", function () {
        goTo({ kind: "copy", step: "source" });
      }));
      body.appendChild(acts);
    }
    if (spec.notes && spec.notes.length) body.appendChild(notesBlock(spec.notes));
  }

  /* A diagnostic drawer is closed until it is asked for: it is evidence, not a page
   * of settings, and it should not be the first thing anybody reads. */
  function renderDrawerManager(spec, ctx) {
    var body = ctx.body;
    var managerId = ctx.route.managerId;
    var open = !!ui.openDetails["drawer:" + managerId];

    body.appendChild(quietLine("beaker", "This page collects evidence about how work runs. It is safe to read and safe to ignore."));
    (spec.sections || []).slice(0, 1).forEach(function (section) {
      body.appendChild(renderSpecSection(section, managerId));
    });

    var rest = (spec.sections || []).slice(1);
    if (rest.length) {
      body.appendChild(button("cx-why", (open ? "Hide" : "Show") + " " + plural(rest.length, "further group") + " of evidence", function () {
        ui.openDetails["drawer:" + managerId] = !open;
        render();
      }));
      if (open) rest.forEach(function (section) { body.appendChild(renderSpecSection(section, managerId)); });
    }
    if (spec.diagnostics && spec.diagnostics.length) body.appendChild(diagnosticsBlock(spec, managerId));
    if (spec.notes && spec.notes.length) body.appendChild(notesBlock(spec.notes));
  }

  /* A named owner is not faked. The page states who owns it, why it is separate, how
   * this Project enters it, and how control comes back. */
  function renderOwnerManager(spec, ctx) {
    var body = ctx.body;
    var owner = spec.owner || (ctx.family.owner ? {
      name: ctx.family.owner, why: ctx.family.why,
      insertionContract: ctx.family.insertion, returnContract: ctx.family.returns
    } : null);

    if (owner) {
      var box = el("div", "cx-owner");
      box.appendChild(el("div", "cx-owner-k", "Owned by"));
      box.appendChild(el("div", "cx-row-title", esc(owner.name)));
      box.appendChild(el("div", "cx-owner-k", "Why it is separate"));
      box.appendChild(el("p", null, esc(owner.why || "")));
      box.appendChild(el("div", "cx-owner-k", "How this Project enters it"));
      box.appendChild(el("p", null, esc(owner.insertionContract || "")));
      box.appendChild(el("div", "cx-owner-k", "How control comes back"));
      box.appendChild(el("p", null, esc(owner.returnContract || ctx.family.returns || "")));
      var acts = el("div", "cx-actions");
      acts.appendChild(button("cx-btn cx-btn--primary", "Open " + esc(owner.name), function () {
        window.PMSim.run({
          label: "Open " + owner.name,
          detail: owner.returnContract || ctx.family.returns || "",
          realCall: "cmd.settings.owner.open",
          payload: { owner: owner.name, from: ctx.route.managerId, project: M.project.id }
        });
      }));
      box.appendChild(acts);
      body.appendChild(box);
    }

    if (spec.health && (spec.health.headline || spec.health.detail)) body.appendChild(healthBlock(spec.health));
    (spec.sections || []).forEach(function (section) {
      body.appendChild(renderSpecSection(section, ctx.route.managerId, { readOnly: true }));
    });
    if (spec.notes && spec.notes.length) body.appendChild(notesBlock(spec.notes));
  }

  /* The one surface the seven designs are meant to disagree about. Here it is a
   * roster of providers and a tabbed sheet: the default tab answers the six questions
   * a reader actually arrives with — connected, which account, which models, what
   * happens when usage runs out, how requests are routed, and what to do if it is
   * broken. Credentials, installations, catalogues, limits and logs are separate tabs,
   * never one wall, and no secret is ever rendered. */
  function renderProviderManager(spec, ctx) {
    var route = ctx.route;
    var body = ctx.body;
    var fx = ST.effects();

    if (spec.health) body.appendChild(healthBlock(spec.health));
    if (fx.reconnectRequired) {
      body.appendChild(quietLine("plug", "One session expired. Signing in again is an explicit step, and nothing changed while it was expired."));
    }

    var roster = pickRoster(spec) || (spec.sections || [])[0];
    if (!roster || !(roster.items || []).length) {
      renderDocumentManager(spec, ctx);
      return;
    }

    var elsewhere = route.objectId && !hasItem(roster, route.objectId) ? sectionHolding(spec, route.objectId) : null;
    var selectedId = (elsewhere ? null : route.objectId) || ui.selected["manager-providers"] || roster.items[0].id;
    if (!hasItem(roster, selectedId)) selectedId = roster.items[0].id;
    ui.selected["manager-providers"] = selectedId;

    var mgr = el("div", "cx-mgr");
    mgr.setAttribute("data-pane", widthMode === "compact" ? (route.objectId ? "detail" : "roster") : "both");
    mgr.appendChild(rosterPane(roster, selectedId, "manager-providers"));

    var detail = el("div", "cx-mgr-detail");
    var item = itemById(roster, selectedId);
    if (item) {
      detail.appendChild(el("h3", "cx-title cx-title--small", esc(item.name)));
      if (item.secondary) detail.appendChild(el("p", "cx-lede", esc(item.secondary)));

      var tabs = (spec.sections || []).filter(function (s) { return s !== roster; });
      var current = (elsewhere && elsewhere.id) || route.sectionKey || ui.tab["manager-providers"] || "overview";
      if (current !== "overview" && !tabs.some(function (t) { return t.id === current; })) current = "overview";
      ui.tab["manager-providers"] = current;

      detail.appendChild(localTabs(tabs, current, function (id) {
        goTo({ kind: "manager", managerId: "manager-providers", objectId: selectedId, sectionKey: id });
      }));

      if (current === "overview") detail.appendChild(providerOverview(item, spec, fx));
      else {
        var section = tabs.filter(function (t) { return t.id === current; })[0];
        if (section) detail.appendChild(renderSpecSection(section, "manager-providers"));
      }
    }
    mgr.appendChild(detail);
    body.appendChild(mgr);

    if (spec.notes && spec.notes.length) body.appendChild(notesBlock(spec.notes));
  }

  function providerOverview(item, spec, fx) {
    var box = el("div");
    var f = item.fields || {};

    var answers = [
      { k: "Connected", v: item.statusWord || (item.availability && item.availability.available === false ? "Not available" : "Ready"),
        why: item.availability && item.availability.available === false ? item.availability.reason : null },
      { k: "Account in use", v: f["Account"] || f["Selected account"] || f["Organisation"] || "Not selected yet" },
      { k: "Models available", v: f["Models"] || f["Model"] || "Read from the provider on connect" },
      { k: "When usage runs out", v: fx.usageUnavailable
        ? "Cannot be measured right now — the provider is ready but reports no balance"
        : (f["When usage runs out"] || f["Usage"] || "Requests fall back to the next provider in the routing order") },
      { k: "Routing", v: f["Routing"] || f["Route"] || "This Project's routing order decides which provider answers first" },
      { k: "Installation", v: f["Installation"] || f["Command"] || "No provider tool is bundled; first setup is an explicit step" }
    ];

    var dl = el("dl", "cx-fields");
    answers.forEach(function (a) {
      dl.appendChild(el("dt", null, esc(a.k)));
      var dd = el("dd", null, esc(String(a.v)));
      if (a.why) dd.appendChild(el("div", "cx-row-desc", esc(a.why)));
      dl.appendChild(dd);
    });
    box.appendChild(dl);

    Object.keys(f).forEach(function (k) {
      /* Anything the spec knows that the six answers did not cover still belongs on
       * screen — just below them, not competing with them. */
      if (["Account", "Selected account", "Organisation", "Models", "Model", "Usage",
        "When usage runs out", "Routing", "Route", "Installation", "Command"].indexOf(k) >= 0) return;
      if (!box.__extra) {
        box.__extra = el("dl", "cx-fields");
        box.appendChild(el("div", "cx-owner-k", "Also reported"));
        box.appendChild(box.__extra);
      }
      box.__extra.appendChild(el("dt", null, esc(k)));
      box.__extra.appendChild(el("dd", null, esc(String(f[k]))));
    });

    if (fx.usageUnavailable) {
      box.appendChild(quietLine("info", "Readiness and measurement are separate facts. This provider answers requests; it simply is not reporting a balance."));
    }
    if (fx.multiInstall) {
      box.appendChild(quietLine("layers", "More than one installation was found for this provider. The selected one and the shadowed one are both named under Installations."));
    }
    if (fx.unknownOwner) {
      box.appendChild(quietLine("alert", "One installation's owner could not be established. Puppet Master will not manage it: it is manual-only until somebody says otherwise."));
    }
    if (fx.updateAvailable) {
      box.appendChild(quietLine("download", "A newer generation is staged for an installation you already approved. It will not be installed until you say so."));
    }

    if (item.editable && item.editable.length) box.appendChild(editableFields(item, "manager-providers"));
    if (item.actions && item.actions.length) box.appendChild(actionRow(item.actions, "manager-providers", item));
    if (spec.diagnostics && spec.diagnostics.length) box.appendChild(diagnosticsBlock(spec, "manager-providers"));
    return box;
  }

  function renderSpecSection(section, managerId, opts) {
    var readOnly = !!(opts && opts.readOnly);
    var box = el("section", "cx-section");
    var head = el("div", "cx-section-head");
    head.appendChild(el("h3", "cx-section-title", esc(section.label || "Details")));
    if ((section.items || []).length) head.appendChild(el("span", "cx-section-n", String(section.items.length)));
    box.appendChild(head);
    if (section.summary) box.appendChild(el("p", "cx-row-desc", esc(section.summary)));

    var items = section.items || [];
    if (!items.length) {
      var e = section.empty || {};
      var empty = el("div", "cx-empty");
      empty.appendChild(el("div", "cx-empty-head", esc(e.headline || "Nothing here yet")));
      empty.appendChild(el("p", null, esc(e.detail || "When this Project has something to show here, it will appear in this group.")));
      if (e.action && !readOnly) {
        var acts = el("div", "cx-actions");
        acts.appendChild(button("cx-btn", esc(e.action.label), function () { runAction(managerId, e.action, null); }));
        empty.appendChild(acts);
      }
      box.appendChild(empty);
      return box;
    }

    if (section.kind === "prose") {
      var prose = el("div", "cx-prose");
      items.forEach(function (i) { prose.appendChild(el("p", null, esc(i.name))); });
      box.appendChild(prose);
      return box;
    }

    if (section.kind === "matrix" || section.kind === "table") {
      box.appendChild(matrixTable(items));
      return box;
    }

    items.forEach(function (item) {
      /* Every item a manager holds is addressable, not just the ones in a roster: a
       * search result may point at an installation that lives on a subpage, and it
       * has to be able to land on exactly that row. */
      var row = el("div", "cx-row");
      row.setAttribute("data-pm-object", item.id);
      var main = el("div", "cx-row-main");
      var label = el("div", "cx-row-label");
      label.appendChild(el("span", "cx-row-title", esc(item.name)));
      if (item.statusWord) {
        var t = el("span", "cx-tag", esc(item.statusWord));
        t.setAttribute("data-tone", toneOf(item.status));
        label.appendChild(t);
      }
      (item.badges || []).forEach(function (b) {
        var tag = el("span", "cx-tag", esc(b.text));
        if (b.tone) tag.setAttribute("data-tone", toneOf(b.tone));
        label.appendChild(tag);
      });
      main.appendChild(label);
      if (item.secondary) main.appendChild(el("p", "cx-row-desc", esc(item.secondary)));
      if (item.availability && item.availability.available === false) {
        main.appendChild(el("p", "cx-row-desc", esc(item.availability.reason +
          (item.availability.owner ? " Owned by " + item.availability.owner + "." : ""))));
      }
      if (item.fields && Object.keys(item.fields).length) {
        var dl = el("dl", "cx-fields");
        Object.keys(item.fields).forEach(function (k) {
          dl.appendChild(el("dt", null, esc(k)));
          dl.appendChild(el("dd", null, esc(String(item.fields[k]))));
        });
        main.appendChild(dl);
      }
      if (item.editable && item.editable.length && !readOnly) main.appendChild(editableFields(item, managerId));
      row.appendChild(main);

      var ctl = el("div", "cx-row-control");
      if (item.actions && item.actions.length && !readOnly) {
        ctl.appendChild(actionRow(item.actions, managerId, item));
      } else if (item.value != null && item.value !== "") {
        ctl.appendChild(el("span", "cx-valuetext", esc(String(item.value))));
      }
      row.appendChild(ctl);
      box.appendChild(row);
    });

    if (section.actions && section.actions.length && !readOnly) {
      box.appendChild(actionRow(section.actions, managerId, null));
    }
    return box;
  }

  function matrixTable(items) {
    var keys = [];
    items.forEach(function (i) {
      Object.keys(i.fields || {}).forEach(function (k) { if (keys.indexOf(k) < 0) keys.push(k); });
    });
    var wrap = el("div", "cx-tablewrap");
    var table = el("table", "cx-table");
    var thead = el("thead");
    var tr = el("tr");
    tr.appendChild(el("th", null, "Item"));
    keys.forEach(function (k) { tr.appendChild(el("th", null, esc(k))); });
    thead.appendChild(tr);
    table.appendChild(thead);
    var tbody = el("tbody");
    items.forEach(function (i) {
      var r = el("tr");
      r.setAttribute("data-pm-object", i.id);
      r.appendChild(el("td", null, esc(i.name)));
      keys.forEach(function (k) {
        r.appendChild(el("td", null, esc(String((i.fields || {})[k] == null ? "not reported" : i.fields[k]))));
      });
      tbody.appendChild(r);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    return wrap;
  }

  function healthBlock(health) {
    var box = el("div", "cx-health");
    box.innerHTML = icon(health.status === "ok" ? "checkCircle" : "info", 16);
    var body = el("div");
    var word = el("div", "cx-health-word", esc(health.statusWord || health.status || ""));
    body.appendChild(word);
    if (health.headline) body.appendChild(el("div", null, esc(health.headline)));
    if (health.detail) body.appendChild(el("p", "cx-health-detail", esc(health.detail)));
    if (health.counts && health.counts.length) {
      var counts = el("div", "cx-health-counts");
      health.counts.forEach(function (c) {
        var cell = el("div");
        cell.appendChild(el("span", "cx-count-k", esc(c.label)));
        cell.appendChild(el("span", "cx-count-v", esc(String(c.value))));
        counts.appendChild(cell);
      });
      body.appendChild(counts);
    }
    box.appendChild(body);
    return box;
  }

  function diagnosticsBlock(spec, managerId) {
    var box = el("section", "cx-section");
    var head = el("div", "cx-section-head");
    head.appendChild(el("h3", "cx-section-title", "Diagnostics"));
    head.appendChild(el("span", "cx-section-n", String(spec.diagnostics.length)));
    box.appendChild(head);
    box.appendChild(el("p", "cx-row-desc", "Each of these produces a dated receipt in the notification inbox. None of them changes a value."));
    box.appendChild(actionRow(spec.diagnostics, managerId, null));
    return box;
  }

  function notesBlock(notes) {
    var box = el("div", "cx-note");
    notes.forEach(function (n) { box.appendChild(el("p", null, esc(n))); });
    return box;
  }

  function runAction(managerId, action, item) {
    var result = MG.act({ managerId: managerId, project: M.project.id }, action, item ? { objectId: item.id } : null);
    if (!result) {
      window.PMSim.run({
        label: action.label,
        detail: "Simulated in this prototype; the receipt names the call a production build would make.",
        realCall: action.realCall || "cmd.settings.manager.action"
      });
    }
    shell.announce(action.label + " — a receipt is in the notification inbox.");
  }

  /* ------------------------------------------------------------ all settings */

  function renderAll(head, body, route) {
    head.appendChild(el("h2", "cx-title", "All settings"));
    head.appendChild(el("p", "cx-lede",
      "Every record in " + esc(M.project.name) + ", including the ones that are managed by policy or unavailable on this host. " +
      "Nothing is hidden from this list."));

    var filter = {
      domainIds: ui.facets.domains,
      kinds: ui.facets.kinds,
      exposures: ui.facets.exposures,
      changedOnly: ui.facets.changedOnly,
      text: route.facet || "",
      limit: 0
    };
    var result = IX.all(filter);

    var box = el("div", "cx-all");
    var facetCol = el("div", "cx-facets");
    var main = el("div");

    var allHead = el("div", "cx-allhead");
    allHead.appendChild(el("span", "cx-allcount",
      plural(result.total, "match", "matches") + " of " + IX.stats().records + " indexed records" +
      (route.facet ? " for “" + esc(route.facet) + "”" : "")));
    if (ui.facets.domains.length || ui.facets.kinds.length || ui.facets.exposures.length || ui.facets.changedOnly) {
      allHead.appendChild(button("cx-btn cx-btn--quiet", "Clear the filters", function () {
        ui.facets = { domains: [], kinds: [], exposures: [], changedOnly: false };
        render();
      }));
    }
    main.appendChild(allHead);

    facetCol.appendChild(facetGroup("Area", result.facets.domains, ui.facets.domains, "domains"));
    facetCol.appendChild(facetGroup("Kind of record", result.facets.kinds, ui.facets.kinds, "kinds"));
    facetCol.appendChild(facetGroup("Depth", result.facets.exposures, ui.facets.exposures, "exposures"));
    facetCol.appendChild(facetGroup("Where the value comes from", result.facets.states, [], null));

    var stateGroup = el("div", "cx-facet");
    stateGroup.appendChild(el("div", "cx-facet-head", "Changed here"));
    var chg = button("cx-facet-item",
      "<span>Changed for this Project</span><span class='cx-facet-n'>" + result.facets.changed + "</span>",
      function () { ui.facets.changedOnly = !ui.facets.changedOnly; render(); });
    chg.setAttribute("aria-pressed", ui.facets.changedOnly ? "true" : "false");
    stateGroup.appendChild(chg);
    facetCol.appendChild(stateGroup);

    /* Virtualized. 828 records plus a 2,400-row stress fixture must never become
     * 3,200 DOM nodes, so only the visible window exists. */
    var rowHeight = 44;
    /* Scales with the window rather than stopping at 620px, which left a clear void
     * under the list on a tall display while the facet column ran on past it. */
    var viewport = Math.max(300, Math.round(window.innerHeight - 380));
    var listBox = el("div", "cx-alllist cx-scroll");
    listBox.style.height = viewport + "px";

    function paint() {
      var win = window.PMVirtual.windowFor({
        total: result.total, rowHeight: rowHeight, viewport: viewport,
        scrollTop: listBox.scrollTop, overscan: 4, firstPage: 18
      });
      clear(listBox);
      var before = el("div", "cx-vspacer");
      before.style.height = win.before + "px";
      listBox.appendChild(before);
      for (var i = win.start; i < win.end; i++) {
        var rec = result.rows[i];
        if (!rec) continue;
        listBox.appendChild(allRow(rec));
      }
      var after = el("div", "cx-vspacer");
      after.style.height = win.after + "px";
      listBox.appendChild(after);
    }
    on(listBox, "scroll", paint);
    main.appendChild(listBox);

    if (!result.total) {
      main.appendChild(el("p", "cx-attn-empty",
        "Nothing matches those filters. Clearing one of them will bring records back — nothing has been removed from this Project."));
    }

    box.appendChild(facetCol);
    box.appendChild(main);
    body.appendChild(box);
    paint();
  }

  function allRow(rec) {
    var b = button("cx-allrow", null, function () {
      var r = IX.byId(rec.id);
      if (!r) return;
      ui.pending = { result: r, query: "" };
      goTo(destinationRoute(r.destination));
    });
    b.setAttribute("data-pm-result", rec.id);
    var body = el("div", "cx-allrow-body");
    body.appendChild(el("div", "cx-allrow-label", esc(rec.label)));
    body.appendChild(el("div", "cx-allrow-path", esc(rec.path)));
    b.appendChild(body);
    var tag = el("span", "cx-tag", esc(rec.typeLabel || IX.kindLabel(rec.kind)));
    if (rec.changed) tag.setAttribute("data-tone", "changed");
    b.appendChild(tag);
    return b;
  }

  function facetGroup(title, entries, selected, key) {
    var g = el("div", "cx-facet");
    g.appendChild(el("div", "cx-facet-head", esc(title)));
    (entries || []).slice(0, 12).forEach(function (entry) {
      var b = button("cx-facet-item",
        "<span>" + esc(entry.label) + "</span><span class='cx-facet-n'>" + entry.count + "</span>",
        key ? function () {
          var list = ui.facets[key];
          var at = list.indexOf(entry.id);
          if (at >= 0) list.splice(at, 1); else list.push(entry.id);
          render();
        } : null);
      if (key) b.setAttribute("aria-pressed", selected.indexOf(entry.id) >= 0 ? "true" : "false");
      else b.disabled = true;
      g.appendChild(b);
    });
    return g;
  }

  /* -------------------------------------------------------------------- copy */

  function renderCopy(head, body, route) {
    var c = ui.copy;
    head.appendChild(el("h2", "cx-title", "Copy settings from another Project"));
    head.appendChild(el("p", "cx-lede", esc(CP.independence)));
    head.appendChild(el("div", "cx-meta", "A one-time transaction. Nothing is written until the preview has been reviewed."));

    var steps = el("div", "cx-steps");
    ["Choose a source", "Choose what to copy", "Review", "Apply"].forEach(function (label, i) {
      if (i) steps.appendChild(el("span", "cx-step-arrow", icon("chevronRight", 12)));
      var s = el("div", "cx-step");
      s.setAttribute("data-state", (i + 1) === c.step ? "current" : ((i + 1) < c.step ? "done" : "todo"));
      s.appendChild(el("span", "cx-step-n", String(i + 1)));
      s.appendChild(el("span", null, esc(label)));
      steps.appendChild(s);
    });
    body.appendChild(steps);

    if (c.step === 1) copyStepSource(body);
    else if (c.step === 2) copyStepCategories(body);
    else if (c.step === 3) copyStepReview(body);
    else copyStepApply(body);

    var receipts = CP.receipts();
    if (receipts.length) {
      var hist = el("section", "cx-section");
      var hh = el("div", "cx-section-head");
      hh.appendChild(el("h3", "cx-section-title", "Receipts"));
      hh.appendChild(el("span", "cx-section-n", String(receipts.length)));
      hist.appendChild(hh);
      receipts.forEach(function (r) {
        var row = el("div", "cx-row");
        var main = el("div", "cx-row-main");
        main.appendChild(el("div", "cx-row-title", esc("Copied from " + r.source.name + " · " + r.at)));
        main.appendChild(el("p", "cx-row-desc", esc(
          r.outcome === "applied"
            ? plural(r.applied, "value") + " applied. The restore point taken first is " + r.restorePoint.label + "."
            : (r.note || "Rolled back."))));
        row.appendChild(main);
        var ctl = el("div", "cx-row-control");
        if (r.canRollback) {
          ctl.appendChild(button("cx-btn", "Roll back", function () {
            CP.rollback(r.id);
            MG.invalidate();
            render();
            shell.announce("The copy was rolled back. This Project is exactly as it was.");
          }));
        } else {
          ctl.appendChild(el("span", "cx-tag", esc(r.outcome === "applied" ? "Applied" : "Rolled back")));
        }
        row.appendChild(ctl);
        hist.appendChild(row);
      });
      body.appendChild(hist);
    }
  }

  function copyStepSource(box) {
    var head = el("div", "cx-blockhead");
    head.appendChild(el("h3", null, "Which Project should this one copy from?"));
    box.appendChild(head);
    CP.sources().forEach(function (s) {
      var b = button("cx-src", null, function () {
        ui.copy.source = s.id;
        ui.copy.domains = M.domains.map(function (d) { return d.id; });
        ui.copy.step = 2;
        render();
      });
      b.setAttribute("aria-pressed", ui.copy.source === s.id ? "true" : "false");
      var body = el("div", "cx-src-body");
      body.appendChild(el("div", "cx-src-name", esc(s.name)));
      body.appendChild(el("div", "cx-src-sub", esc(s.updated + " · " + s.note)));
      b.appendChild(body);
      b.appendChild(el("span", "cx-src-meta", plural(s.settings, "setting")));
      box.appendChild(b);
    });
    var note = el("div", "cx-note");
    note.appendChild(el("p", null, esc(CP.secretPolicy())));
    box.appendChild(note);
  }

  function copyStepCategories(box) {
    var chosen = ui.copy.domains || [];
    var head = el("div", "cx-blockhead");
    head.appendChild(el("h3", null, "Which areas should come across?"));
    head.appendChild(el("span", "cx-blockhead-n", chosen.length + " of " + M.domains.length + " chosen"));
    box.appendChild(head);

    var grid = el("div", "cx-cats");
    CP.categories().forEach(function (cat) {
      var picked = chosen.indexOf(cat.id) >= 0;
      var b = button("cx-cat", null, function () {
        var at = chosen.indexOf(cat.id);
        if (at >= 0) chosen.splice(at, 1); else chosen.push(cat.id);
        ui.copy.domains = chosen;
        render();
      });
      b.setAttribute("aria-pressed", picked ? "true" : "false");
      b.appendChild(el("span", "cx-cat-box", picked ? icon("check", 11) : ""));
      var body = el("div", "cx-cat-body");
      body.appendChild(el("div", null, esc(cat.title)));
      body.appendChild(el("div", "cx-src-sub", esc(cat.purpose)));
      b.appendChild(body);
      b.appendChild(el("span", "cx-src-meta", String(cat.count)));
      grid.appendChild(b);
    });
    box.appendChild(grid);

    var acts = el("div", "cx-actions");
    acts.appendChild(button("cx-btn", "Back", function () { ui.copy.step = 1; render(); }));
    var next = button("cx-btn cx-btn--primary", "Preview the changes", function () {
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

    var tiles = el("div", "cx-tiles");
    [["Will be added", p.counts.additions], ["Will be replaced", p.counts.replacements],
     ["Already the same", p.counts.unchanged], ["Account references re-pointed", p.counts.references],
     ["Cannot be copied", p.counts.unavailable + p.counts.conflicts]].forEach(function (pair) {
      var t = el("div", "cx-tile");
      t.appendChild(el("div", "cx-tile-v", String(pair[1])));
      t.appendChild(el("div", "cx-tile-k", esc(pair[0])));
      tiles.appendChild(t);
    });
    box.appendChild(tiles);

    if (ST.effects().importConflict) {
      box.appendChild(quietLine("alert", "This source disagrees with values this Project already has. Every conflict is listed below, and nothing is written until you say so."));
    }

    var head = el("div", "cx-blockhead");
    head.appendChild(el("h3", null, "What will change"));
    box.appendChild(head);

    var changes = p.items.filter(function (i) {
      return i.outcome === "addition" || i.outcome === "replacement" || i.outcome === "reference";
    });
    var rowHeight = 52;
    var viewport = 320;
    var listBox = el("div", "cx-difflist cx-scroll");
    listBox.style.height = viewport + "px";

    function paint() {
      var win = window.PMVirtual.windowFor({
        total: changes.length, rowHeight: rowHeight, viewport: viewport,
        scrollTop: listBox.scrollTop, overscan: 4, firstPage: 12
      });
      clear(listBox);
      var before = el("div", "cx-vspacer");
      before.style.height = win.before + "px";
      listBox.appendChild(before);
      for (var i = win.start; i < win.end; i++) {
        var item = changes[i];
        if (!item) continue;
        var row = el("div", "cx-diffrow");
        var lab = el("div", "cx-diff-label");
        lab.appendChild(el("div", "cx-diff-name", esc(item.label)));
        lab.appendChild(el("div", "cx-diff-path", esc(item.path)));
        row.appendChild(lab);
        row.appendChild(el("div", "cx-diff-from", esc(String(item.current === "" ? "not set" : item.current))));
        row.appendChild(el("div", "cx-diff-to", esc(String(item.incoming))));
        listBox.appendChild(row);
      }
      var after = el("div", "cx-vspacer");
      after.style.height = win.after + "px";
      listBox.appendChild(after);
    }
    on(listBox, "scroll", paint);
    box.appendChild(listBox);
    paint();

    var excluded = el("div", "cx-note");
    excluded.appendChild(el("div", "cx-row-title", "What is not copied"));
    (p.excluded || []).forEach(function (x) {
      excluded.appendChild(el("p", null, esc(x.label + ": " + x.count + (x.note ? " — " + x.note : ""))));
    });
    excluded.appendChild(el("p", null, esc(CP.secretPolicy())));
    box.appendChild(excluded);

    var acts = el("div", "cx-actions");
    acts.appendChild(button("cx-btn", "Back", function () { ui.copy.step = 2; render(); }));
    acts.appendChild(button("cx-btn cx-btn--primary", "Take a restore point and copy", function () {
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

    var head = el("div", "cx-blockhead");
    head.appendChild(el("h3", null, "Applying"));
    box.appendChild(head);

    run.steps.forEach(function (phase, i) {
      var row = el("div", "cx-phase");
      row.appendChild(el("span", null, esc(phase)));
      var word = op.phase === phase
        ? window.PMWork.stateWord(op.state)
        : (i < run.steps.indexOf(op.phase) || op.terminal ? "done" : "waiting");
      row.appendChild(el("span", "cx-phase-state", esc(word)));
      box.appendChild(row);
    });

    /* Determinate progress only where there is a real denominator; otherwise an
     * honest indeterminate state with a named reason for the wait. */
    if (op.progress_kind === "fraction" && op.total) {
      var bar = el("div", "cx-progress");
      var fill = el("i");
      fill.style.width = Math.round((op.completed / op.total) * 100) + "%";
      bar.appendChild(fill);
      box.appendChild(bar);
      box.appendChild(el("p", "cx-row-desc", op.completed + " of " + op.total + " values"));
    } else {
      box.appendChild(el("p", "cx-row-desc",
        esc(window.PMWork.stateWord(op.state) + (op.wait_reason ? " — " + op.wait_reason : ""))));
    }

    var acts = el("div", "cx-actions");
    if (!ui.copy.receipt) {
      acts.appendChild(button("cx-btn cx-btn--primary", "Continue", function () {
        var out = run.next();
        if (out.done) { ui.copy.receipt = out.receipt; MG.invalidate(); }
        render();
      }));
      acts.appendChild(button("cx-btn", "Run the rest", function () {
        var out = run.run();
        ui.copy.receipt = out.receipt;
        MG.invalidate();
        render();
      }));
      acts.appendChild(button("cx-btn", "Cancel", function () {
        run.cancel();
        ui.copy = { step: 1, source: null, domains: null, preview: null, run: null, receipt: null };
        render();
      }));
    } else {
      var r = ui.copy.receipt;
      var note = el("div", "cx-note");
      note.appendChild(el("div", "cx-row-title", r.outcome === "applied" ? "Copied" : "Rolled back"));
      note.appendChild(el("p", null, esc(
        r.outcome === "applied"
          ? plural(r.applied, "value") + " were applied to " + M.project.name + ". The restore point taken first is " + r.restorePoint.label + "."
          : r.note)));
      note.appendChild(el("p", null, esc(
        "The two Projects are independent from here. Nothing in " + r.source.name + " will reach this Project again.")));
      box.appendChild(note);
      acts.appendChild(button("cx-btn", "Done", function () {
        ui.copy = { step: 1, source: null, domains: null, preview: null, run: null, receipt: null };
        goTo({ kind: "home" });
      }));
      if (r.canRollback) {
        acts.appendChild(button("cx-btn", "Roll back", function () {
          CP.rollback(r.id);
          MG.invalidate();
          ui.copy = { step: 1, source: null, domains: null, preview: null, run: null, receipt: null };
          render();
        }));
      }
    }
    box.appendChild(acts);
  }

  /* ---------------------------------------------------------------- arrivals */

  /* Three beats, in the order a reader can follow: the edge tab that owns the
   * destination activates, the layer that holds it settles, then the row itself takes
   * a ring. The attributes are all set synchronously here; the staging is expressed by
   * animation delays in the stylesheet, so the destination is on screen and focused
   * immediately even though the explanation takes a moment to play out. */
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

    var sel = cssEscape(targetId);
    var node = layerEl.querySelector('[data-pm-row="' + sel + '"]') ||
      layerEl.querySelector('[data-pm-object="' + sel + '"]') ||
      layerEl.querySelector('[data-pm-section="' + sel + '"]');
    if (!node && layerEl.getAttribute("data-pm-manager") === targetId) {
      node = layerEl.querySelector(".cx-head-inner");
    }
    if (!node) return;

    Array.prototype.forEach.call(root.querySelectorAll("[data-pm-locator]"), function (n) {
      n.removeAttribute("data-pm-locator");
    });
    node.setAttribute("data-pm-locator", "1");
    /* A jump asked for this group: hold the on-page index on it until the reader
     * scrolls, rather than letting the measurement name a neighbour. */
    if (window.PM2Spy && window.PM2Spy.pinNode) window.PM2Spy.pinNode(node);

    /* Beat one: the tab that owns the destination. */
    var domainId = route.domainId || (route.managerId ? managerDomain(route.managerId) : null);
    if (domainId) {
      var tab = stripEl.querySelector('[data-pm-domain="' + cssEscape(domainId) + '"]');
      if (tab) tab.setAttribute("data-arrive", "1");
    }
    /* Beat two: the layer. */
    layerEl.setAttribute("data-arrive", "1");

    /* The scroll is instant and scoped to the layer's own scroller. Every arrival
     * follows a full re-render, so a smooth scroll would animate from the top of a
     * page the reader never saw and leave the row off screen while it ran. */
    if (bodyEl) {
      var box = node.getBoundingClientRect();
      var stage = bodyEl.getBoundingClientRect();
      var delta = box.top - stage.top - Math.max(20, (stage.height - box.height) / 3);
      if (Math.abs(delta) > 4) bodyEl.scrollTop += delta;
    }

    var focusTarget = node.querySelector("[data-pm-control]") || node;
    if (focusTarget.focus) focusTarget.focus({ preventScroll: true });

    if (pending && pending.result && pending.query) {
      var via = el("div", "cx-foundvia");
      via.innerHTML = icon("search", 12) + "<span>Found from your search for &ldquo;" + esc(pending.query) + "&rdquo;</span>";
      if (node.parentNode) node.parentNode.insertBefore(via, node);
    }
    shell.announce("Opened " + (node.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80));
  }

  /* --------------------------------------------------------------- keyboard */

  /* Escape closes the innermost thing and stops at Settings Home. It never closes
   * Settings, because a reader pressing Escape twice should not lose the whole page. */
  function onKeydown(e) {
    if (e.key !== "Escape") return;
    if (ui.dropOpen) { ui.dropOpen = false; render(); e.stopPropagation(); return; }
    if (ui.navOpen) { ui.navOpen = false; measure(); render(); e.stopPropagation(); return; }
    var openDetail = Object.keys(ui.openDetails).filter(function (k) { return ui.openDetails[k]; });
    if (openDetail.length) { ui.openDetails = {}; render(); e.stopPropagation(); return; }
    var route = RT.current();
    if (route.kind === "home") return;
    if (route.kind === "manager" && route.objectId) {
      goTo({ kind: "manager", managerId: route.managerId });
      e.stopPropagation();
      return;
    }
    goTo(backTarget(route).dest);
    e.stopPropagation();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
