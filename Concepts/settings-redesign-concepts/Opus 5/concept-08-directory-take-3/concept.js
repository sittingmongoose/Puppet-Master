/* Opus 5 — Broadside (concept 08).
 *
 * Thesis: Settings is broad and approachable. Fewer, larger destinations; nothing
 * cramped. Home is a search field, one attention panel whose items each carry the
 * fix they need, and a grid of large area cards. Inside an area the same idea
 * repeats as wide rows: icon, title, purpose, and the one figure that says whether
 * the destination needs you.
 *
 * What this file owns: every pixel. What it does not own: any fact — domains,
 * pages, the 828 settings, manager specs, search results, routes, the copy
 * transaction and the state fixtures all come from shared2, which draws nothing.
 *
 * Portability note (Slint 1.17.1): the route is an explicit state machine, long
 * lists are windowed through PMVirtual, presentation state is a plain object
 * rather than something read back out of the DOM, and geometry is measured in one
 * place only — to bring an arrival on screen.
 */
(function () {
  "use strict";

  var CONCEPT_ID = "concept-08-directory-take-3";
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
  var railEl = null;
  var barEl = null;
  var fixtureEl = null;
  var stageEl = null;
  var stageInner = null;
  var scrimEl = null;

  /* Presentation state. Deliberately not persisted: none of it is a fact about the
   * Project, and restoring an open dropdown after a reload would be a lie. */
  var ui = {
    query: "",
    results: null,
    dropOpen: false,
    activeResult: -1,
    railOpen: false,
    openSections: {},        /* sectionId -> true, the exposure disclosure */
    openDetails: {},         /* settingId -> true */
    selected: {},            /* managerId -> objectId */
    subpage: {},             /* managerId -> sectionKey */
    facets: { domains: [], kinds: [], exposures: [], changedOnly: false },
    allText: "",
    catalogue: null,         /* the catalogue filter, per manager */
    errors: {},              /* settingId -> message */
    listEditor: null,        /* the row whose list is being edited in place */
    copy: { step: 1, source: null, domains: null, preview: null, run: null, receipt: null, phase: null },
    pending: null            /* the arrival to reveal after the next paint */
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

  function textNode(tag, cls, text) { var n = el(tag, cls); n.textContent = String(text == null ? "" : text); return n; }

  function cssEscape(v) {
    if (window.CSS && window.CSS.escape) return window.CSS.escape(v);
    return String(v).replace(/([^\w-])/g, "\\$1");
  }

  /* --------------------------------------------------------------- the shell */

  function boot() {
    shell = window.PMShell.mount({
      rootId: "pm-root",
      concept: "Broadside · fewer, larger destinations",
      conceptId: CONCEPT_ID,
      theme: document.documentElement.getAttribute("data-theme") || "friendly-dark",
      defaultTheme: "friendly-dark",
      onLayout: measureWidth,
      onWidthMode: function () { measureWidth(); render(); }
    });
    /* The shell's own Demo state select and Reset belong to the fixture list of
     * concepts 01-04. This concept ships its own, so the stale pair is removed
     * rather than left offering situations it does not implement. */
    PM2States.removeShellControl(shell);


    root = el("div", "b8");
    root.setAttribute("data-concept", CONCEPT_ID);

    railEl = el("nav", "b8-rail");
    railEl.setAttribute("aria-label", "Settings areas");

    var main = el("div", "b8-main");
    barEl = el("div", "b8-bar");
    fixtureEl = el("div", "b8-fixture");
    stageEl = el("div", "b8-stage b8-scroll");
    stageInner = el("div", "b8-inner");
    stageEl.appendChild(stageInner);

    main.appendChild(barEl);
    main.appendChild(fixtureEl);
    main.appendChild(stageEl);

    scrimEl = el("div", "b8-scrim");
    scrimEl.hidden = true;
    on(scrimEl, "click", function () { ui.railOpen = false; render(); });

    root.appendChild(railEl);
    root.appendChild(main);
    root.appendChild(scrimEl);
    shell.main.appendChild(root);

    document.addEventListener("keydown", onKeydown, true);

    RT.onChange(function () {
      if (quiet) return;
      ui.dropOpen = false;
      render();
    });
    window.addEventListener("pm-concept-state-applied", function () { measureWidth(); render(); });

    measureWidth();
    applyFixtureQuery();
    render();
  }

  /* Width is presentation, derived at explicit checkpoints. The number of card
   * columns is the only thing it changes: the cards themselves stay large. */
  function measureWidth() {
    var w = (shell && shell.main ? shell.main.clientWidth : 0) || window.innerWidth;
    var next = w < 900;
    if (next !== narrow) {
      narrow = next;
      if (!narrow) ui.railOpen = false;
    }
    root.setAttribute("data-narrow", narrow ? "true" : "false");
    root.setAttribute("data-rail", ui.railOpen ? "open" : "closed");
    root.setAttribute("data-cols", w >= 1500 ? "3" : (w < 700 ? "1" : "2"));
    if (scrimEl) scrimEl.hidden = !(narrow && ui.railOpen);
  }

  /* --------------------------------------------------------------- the router */

  function render() {
    if (window.PM2Spy) window.PM2Spy.release();
    var route = RT.current();
    var check = RT.resolve(route);

    measureWidth();

    var fixture = ST.active();
    if (fixture !== lastFixture) {
      lastFixture = fixture;
      MG.invalidate();
      objectNameCache = {};
      managerItemCount = null;
      applyFixtureQuery();
    }
    if (route.kind === "query" && route.query != null && route.query !== ui.query) {
      /* Arriving from history: the field shows the search that was performed. */
      ui.query = route.query;
      ui.results = ui.query ? IX.query(ui.query, { limit: 40 }) : null;
    }

    renderRail(route);
    renderBar(route, check);
    renderFixtureStrip();

    clear(stageInner);
    stageInner.removeAttribute("data-pm-manager");

    if (fixture !== "normal") stageInner.appendChild(fixtureLine());

    if (!check.ok) {
      stageInner.setAttribute("data-pm-surface", "notice");
      stageInner.appendChild(brokenLink(check));
      renderHome(stageInner, route);
      settleIn();
      return;
    }

    var kind = route.kind;
    if (kind === "home" || kind === "query") {
      stageInner.setAttribute("data-pm-surface", kind === "query" ? "search" : "home");
      renderHome(stageInner, route);
    } else if (kind === "domain") {
      if (route.pageId) {
        stageInner.setAttribute("data-pm-surface", "page");
        renderPage(stageInner, route);
      } else {
        stageInner.setAttribute("data-pm-surface", "domain");
        renderDomain(stageInner, route);
      }
    } else if (kind === "manager") {
      stageInner.setAttribute("data-pm-surface", "manager");
      stageInner.setAttribute("data-pm-manager", route.managerId);
      renderManagerSurface(stageInner, route);
    } else if (kind === "all") {
      stageInner.setAttribute("data-pm-surface", "all");
      renderAll(stageInner, route);
    } else if (kind === "copy") {
      stageInner.setAttribute("data-pm-surface", "copy");
      renderCopy(stageInner, route);
    }

    settleIn();
    revealPending();
  }

  /* Scale-and-settle. The class is removed on a timer as well as by the animation
   * so a tab that never paints a frame still ends up at the resting state. */
  function settleIn() {
    stageInner.classList.remove("is-arriving");
    void stageInner.offsetWidth;
    stageInner.classList.add("is-arriving");
    window.setTimeout(function () { stageInner.classList.remove("is-arriving"); }, 420);
  }

  function fixtureLine() {
    var f = ST.activeFixture();
    var box = el("div", "b8-fixtureline");
    box.innerHTML = icon("beaker", 14);
    var body = el("span");
    body.innerHTML = "<b>" + esc(f.label) + "</b> — " + esc(f.note);
    box.appendChild(body);
    return box;
  }

  function brokenLink(check) {
    var box = el("div", "b8-notice");
    box.setAttribute("data-tone", "attention");
    box.setAttribute("data-pm-notice", "broken-link");
    box.innerHTML = '<span class="b8-notice-icon">' + icon("alert", 20) + "</span>";
    var body = el("div", "b8-notice-body");
    body.appendChild(textNode("div", "b8-notice-head",
      check.code === "malformed" ? "That link is not a Settings location" : "That link names something this Project does not have"));
    body.appendChild(textNode("p", "b8-notice-detail", check.reason || ""));
    var quoted = el("p", "b8-notice-detail");
    quoted.innerHTML = "The link was <code>" + esc(check.quoted || window.location.hash) + "</code>. Settings Home is below.";
    body.appendChild(quoted);
    box.appendChild(body);
    return box;
  }

  /* -------------------------------------------------------------------- rail */

  function railItem(list, iconName, label, count, current, go) {
    var b = button("b8-rail-item", null, go);
    b.innerHTML = icon(iconName, 17);
    b.appendChild(textNode("span", null, label));
    if (count != null) b.appendChild(textNode("span", "b8-rail-n", count));
    if (current) b.setAttribute("aria-current", "true");
    list.appendChild(b);
    return b;
  }

  function renderRail(route) {
    clear(railEl);

    var head = el("div", "b8-rail-head");
    head.appendChild(textNode("div", "b8-rail-eyebrow", "Settings for"));
    var project = textNode("div", "b8-rail-project", M.project.name);
    project.setAttribute("data-pm-project", "");
    head.appendChild(project);
    head.appendChild(textNode("div", "b8-rail-path", M.project.kind + " · " + M.project.path));
    railEl.appendChild(head);

    var list = el("div", "b8-rail-list b8-scroll");

    railItem(list, "map", "Settings Home", null,
      route.kind === "home" || route.kind === "query",
      function () { closeRail(); RT.go({ kind: "home" }); });

    list.appendChild(textNode("div", "b8-rail-group", "Areas"));
    M.domains.forEach(function (d) {
      var current = route.domainId === d.id && route.kind !== "manager";
      if (route.kind === "manager" && managerDomain(route.managerId) === d.id) current = true;
      var b = railItem(list, d.icon, d.title, d.count, current, function () {
        closeRail();
        RT.go({ kind: "domain", domainId: d.id });
      });
      b.setAttribute("data-pm-domain", d.id);
    });

    list.appendChild(textNode("div", "b8-rail-group", "Also here"));
    railItem(list, "list", "All settings", M.counts.settings, route.kind === "all",
      function () { closeRail(); RT.go({ kind: "all" }); });
    railItem(list, "columns", "Copy from another Project", null, route.kind === "copy",
      function () { closeRail(); RT.go({ kind: "copy", step: "source" }); });

    railEl.appendChild(list);

    var foot = el("div", "b8-rail-foot");
    foot.appendChild(button("b8-btn is-quiet", icon("chevronLeft", 14) + "<span>Hide areas</span>", function () {
      ui.railOpen = false;
      render();
    }));
    railEl.appendChild(foot);
  }

  function closeRail() { ui.railOpen = false; }

  function managerDomain(managerId) {
    var f = M.familyOf(managerId);
    return f ? f.domainId : null;
  }

  /* --------------------------------------------------------------------- bar */

  function renderBar(route, check) {
    clear(barEl);

    if (narrow) {
      barEl.appendChild(button("b8-btn", icon("panelLeft", 15) + "<span>Areas</span>", function () {
        ui.railOpen = !ui.railOpen;
        render();
      }));
    }

    var back = backTarget(route);
    var backBtn = button("b8-btn", icon("chevronLeft", 15) + "<span>Back to " + esc(back.label) + "</span>", function () {
      RT.go(back.dest);
    });
    backBtn.setAttribute("data-pm-back", "");
    backBtn.hidden = route.kind === "home" || route.kind === "query";
    barEl.appendChild(backBtn);

    var crumbs = el("nav", "b8-crumbs");
    crumbs.setAttribute("data-pm-breadcrumb", "");
    crumbs.setAttribute("aria-label", "Breadcrumb");
    var steps = trail(route);
    steps.forEach(function (step, i) {
      if (i) crumbs.appendChild(textNode("span", "b8-crumb-sep", "/"));
      var b = button("b8-crumb", null, step.dest ? function () { RT.go(step.dest); } : null);
      b.textContent = step.label;
      if (i === steps.length - 1) b.setAttribute("aria-current", "page");
      crumbs.appendChild(b);
    });
    barEl.appendChild(crumbs);

    barEl.appendChild(el("div", "b8-bar-spacer"));

    /* Exactly one search field exists at a time: Home owns the large one, the bar
     * owns the compact one everywhere else. Two would make "the field" ambiguous. */
    if (route.kind !== "home" && route.kind !== "query") barEl.appendChild(searchField("bar"));

    var close = button("b8-btn", icon("ban", 15) + "<span>Close Settings</span>", function () {
      shell.announce("Close Settings returns to the surface that opened Settings.");
      window.PMSim.run({
        label: "Close Settings",
        detail: "Returns to the surface that opened Settings. In this prototype the shell stays where it is.",
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
      if (route.objectId) {
        return { label: (MG.record(route.managerId) || {}).title || "the list",
          dest: { kind: "manager", managerId: route.managerId } };
      }
      var d = managerDomain(route.managerId);
      var dom = d ? M.domain(d) : null;
      return dom ? { label: dom.title, dest: { kind: "domain", domainId: dom.id } }
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
      var domId = managerDomain(route.managerId);
      var domain = domId ? M.domain(domId) : null;
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

  /* Reading a name is the one thing that would justify hydrating a manager from the
   * breadcrumb, so it is only done for a manager that is already open. */
  function objectName(managerId, objectId) {
    var key = managerId + "/" + objectId;
    if (objectNameCache[key] !== undefined) return objectNameCache[key];
    var found = null;
    var route = RT.current();
    if (route.kind === "manager" && route.managerId === managerId) {
      var spec = managerSpec(managerId);
      var hit = findObject(spec, objectId);
      if (hit) found = hit.item.name;
    }
    if (!found) {
      var rec = IX.byDestination({ managerId: managerId, objectId: objectId, rowId: route.rowId || null });
      if (rec) found = rec.label;
    }
    objectNameCache[key] = found;
    return found;
  }

  /* --------------------------------------------------------- state fixtures */

  function renderFixtureStrip() {
    clear(fixtureEl);
    var active = ST.activeFixture();

    fixtureEl.appendChild(textNode("span", null, "Demo state"));

    var sel = el("select");
    sel.setAttribute("data-pm-state-control", "");
    sel.setAttribute("aria-label", "Deterministic demo state");
    ST.grouped().forEach(function (group) {
      var g = document.createElement("optgroup");
      g.label = group.group;
      group.items.forEach(function (f) {
        var o = document.createElement("option");
        o.value = f.id;
        o.textContent = f.label;
        o.title = f.note;
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
      lastFixture = ST.active();
      applyFixtureQuery();
      render();
      shell.announce("Demo state: " + sel.options[sel.selectedIndex].textContent);
    });
    fixtureEl.appendChild(sel);

    fixtureEl.appendChild(textNode("span", "b8-fixture-note", active.note));

    fixtureEl.appendChild(button("b8-btn is-quiet", icon("undo", 14) + "<span>Reset this concept</span>", function () {
      store.reset();
      MG.invalidate();
      objectNameCache = {};
      ui.openDetails = {}; ui.openSections = {}; ui.errors = {};
      ui.copy = { step: 1, source: null, domains: null, preview: null, run: null, receipt: null, phase: null };
      render();
      shell.announce("Every change made in this concept was cleared.");
    }));
  }

  /* A fixture about search puts its query in the field, so the situation it names
   * is the one on screen rather than one the reader has to reproduce. */
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
    var wrap = el("div", "b8-searchwrap is-" + where);
    var field = el("div", "b8-searchfield");
    field.innerHTML = icon("search", where === "hero" ? 20 : 15);

    var input = document.createElement("input");
    input.type = "text";
    input.spellcheck = false;
    input.autocomplete = "off";
    input.placeholder = where === "hero"
      ? "Search every setting, manager, provider and action"
      : "Search settings";
    input.setAttribute("data-pm-search-field", "");
    input.setAttribute("aria-label", "Search all settings");
    input.value = ui.query;
    field.appendChild(input);

    if (ui.query) {
      field.appendChild(button("b8-searchclear", icon("ban", 15), function () {
        ui.query = ""; ui.results = null; ui.dropOpen = false;
        withoutRender(function () { RT.replace({ kind: "home" }); });
        render();
      }));
    }
    wrap.appendChild(field);

    var drop = el("div", "b8-drop");
    drop.setAttribute("data-pm-search-dropdown", "");
    drop.hidden = !(ui.dropOpen && ui.results);
    wrap.appendChild(drop);
    if (!drop.hidden) fillDropdown(drop);

    on(input, "input", function () {
      ui.query = input.value;
      ui.activeResult = -1;
      if (!ui.query.replace(/^\s+|\s+$/g, "")) {
        ui.results = null;
        ui.dropOpen = false;
        drop.hidden = true;
        withoutRender(function () { RT.replace({ kind: "home" }); });
        return;
      }
      ui.results = IX.query(ui.query, { limit: 40 });
      ui.dropOpen = true;
      drop.hidden = false;
      fillDropdown(drop);
      /* The query lives in the route so Back from a chosen result restores both the
       * text and the result. This write is bookkeeping, so it must not re-render. */
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
      var empty = el("div", "b8-drop-empty");
      empty.innerHTML = "Nothing matches <b>" + esc(ui.query) + "</b>.";
      empty.appendChild(textNode("p", null,
        "Try a shorter word, or open an area on the left. Search covers all " + M.counts.settings +
        " settings in this Project, including the ones that are managed or unavailable on this host."));
      drop.appendChild(empty);
      return;
    }

    var scroll = el("div", "b8-drop-scroll b8-scroll");
    var index = 0;
    res.groups.forEach(function (group) {
      var g = el("div", "b8-drop-group");
      g.appendChild(textNode("div", "b8-drop-label", group.label));
      group.results.forEach(function (r) {
        var mine = index++;
        var b = button("b8-result" + (mine === ui.activeResult ? " is-active" : ""), null, function () { chooseResult(r.id); });
        b.setAttribute("data-pm-result", r.id);
        var top = el("div", "b8-result-top");
        top.appendChild(textNode("span", "b8-result-label", r.label));
        top.appendChild(textNode("span", "b8-result-type", r.typeLabel));
        b.appendChild(top);
        b.appendChild(textNode("div", "b8-result-path", r.path));
        if (r.availability) b.appendChild(textNode("div", "b8-result-why", r.availability));
        g.appendChild(b);
      });
      scroll.appendChild(g);
    });
    drop.appendChild(scroll);

    var foot = el("div", "b8-drop-foot");
    foot.appendChild(textNode("span", null, res.shown + " shown of " + res.total + " matches"));
    if (res.truncated) {
      foot.appendChild(button("b8-btn is-quiet", "See them all", function () {
        ui.dropOpen = false;
        ui.allText = ui.query;
        RT.go({ kind: "all", facet: ui.query });
      }));
    }
    drop.appendChild(foot);
  }

  /* Routing is only ever done from the immutable result id. The rendered list is a
   * view of the answer; its order is never an address. */
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
    return { kind: "domain", domainId: d.domainId, pageId: d.pageId, sectionId: d.sectionId, settingId: d.settingId };
  }

  /* ------------------------------------------------------------------- home */

  function renderHome(wrap, route) {
    var fx = ST.effects();

    var head = el("header", "b8-head");
    head.appendChild(textNode("h2", "b8-title", "Settings"));
    head.appendChild(textNode("p", "b8-purpose",
      "Everything here belongs to " + M.project.name + ". Changing something changes it for this Project only — " +
      "there is nothing to inherit from and nothing to keep in step."));
    wrap.appendChild(head);

    wrap.appendChild(searchField("hero"));

    var notice = ST.notice();
    if (notice && !store.isDismissed(notice.id)) wrap.appendChild(renderNotice(notice));

    wrap.appendChild(renderAttention(fx));

    var cardsHead = el("div", "b8-head");
    cardsHead.appendChild(textNode("div", "b8-section-title", "Areas of Settings"));
    wrap.appendChild(cardsHead);

    var grid = el("div", "b8-cards");
    M.domains.forEach(function (d) {
      grid.appendChild(domainCard(d));
    });
    wrap.appendChild(grid);

    wrap.appendChild(secondaryUtilities());
  }

  function domainCard(d) {
    var card = button("b8-card", null, function () { RT.go({ kind: "domain", domainId: d.id }); });
    card.setAttribute("data-pm-domain", d.id);

    var top = el("div", "b8-card-top");
    var block = el("span", "b8-iconblock is-sm");
    block.innerHTML = icon(d.icon, 22);
    top.appendChild(block);
    top.appendChild(textNode("span", "b8-card-title", d.title));
    card.appendChild(top);

    card.appendChild(textNode("p", "b8-card-purpose", d.purpose));

    var foot = el("div", "b8-card-foot");
    var managers = d.families.filter(function (f) { return !!f.managerId; });
    foot.appendChild(textNode("span", null,
      plural(d.pages.length, "page") + " · " + plural(d.count, "setting") +
      (managers.length ? " · " + plural(managers.length, "manager") : "")));
    var chev = el("span", "b8-dest-chevron");
    chev.innerHTML = icon("chevronRight", 16);
    foot.appendChild(chev);
    card.appendChild(foot);
    return card;
  }

  function renderNotice(notice) {
    var box = el("div", "b8-notice");
    box.setAttribute("data-tone", notice.tone === "info" ? "info" : "attention");
    box.setAttribute("data-pm-notice", notice.id);
    box.innerHTML = '<span class="b8-notice-icon">' + icon(notice.tone === "info" ? "info" : "alert", 20) + "</span>";
    var body = el("div", "b8-notice-body");
    body.appendChild(textNode("div", "b8-notice-head", notice.headline));
    body.appendChild(textNode("p", "b8-notice-detail", notice.detail));
    var acts = el("div", "b8-notice-acts");
    if (notice.action) {
      acts.appendChild(button("b8-btn is-primary", esc(notice.action.label), function () {
        RT.go(destinationRoute(notice.action.destination));
      }));
    }
    acts.appendChild(button("b8-btn is-quiet", "Dismiss", function () {
      store.dismiss(notice.id);
      render();
    }));
    body.appendChild(acts);
    box.appendChild(body);
    return box;
  }

  /* One attention panel, and every item carries the fix it needs on the row it
   * concerns. A reader never has to go looking for where the repair lives. */
  function renderAttention(fx) {
    var items = fx.noAttention ? [] : ST.attentionFlat();
    var panel = el("section", "b8-panel");

    var head = el("div", "b8-panel-head");
    head.innerHTML = icon("attention", 17);
    head.appendChild(textNode("h3", "b8-panel-title", "Notices"));
    head.appendChild(textNode("span", "b8-panel-count",
      items.length ? plural(items.length, "item") : "Nothing right now"));
    panel.appendChild(head);

    if (!items.length) {
      panel.appendChild(textNode("p", "b8-empty",
        fx.emptyRosters
          ? "This Project has not been configured yet, so nothing is failing. Open an area below to make the first choice."
          : "Nothing in this Project needs you. Anything that changes will appear here first."));
      return panel;
    }

    items.forEach(function (item) {
      /* `01_CORE_ARCHITECTURE` § Notices: three separated runs. What is broken, what
       * is half-finished and what is only advice are read differently, and one toned
       * list makes an unfinished setup look like a fault. */
      if (item.groupLabel) panel.appendChild(textNode("div", "b8-attn-group", item.groupLabel));
      var row = el("div", "b8-attn");
      row.setAttribute("data-tone", item.tone || "attention");
      var mark = el("span", "b8-attn-mark");
      mark.innerHTML = icon(item.tone === "info" ? "info" : (item.tone === "setup" ? "setup" : "attention"), 18);
      row.appendChild(mark);

      var body = el("div", "b8-attn-body");
      body.appendChild(textNode("div", "b8-attn-label", item.label));
      body.appendChild(textNode("div", "b8-attn-detail", item.detail));
      row.appendChild(body);

      var fix = button("b8-btn is-primary b8-attn-fix", esc(item.actionLabel || "Open"), function () {
        RT.go(destinationRoute(item.destination));
      });
      row.appendChild(fix);
      panel.appendChild(row);
    });
    return panel;
  }

  function secondaryUtilities() {
    var box = el("div", "b8-util");
    box.appendChild(textNode("span", "b8-util-note",
      "Everyday work happens in the areas above. These are the occasional jobs."));
    box.appendChild(button("b8-btn", icon("list", 15) + "<span>All settings</span>", function () {
      RT.go({ kind: "all" });
    }));
    box.appendChild(button("b8-btn", icon("columns", 15) + "<span>Copy from another Project</span>", function () {
      RT.go({ kind: "copy", step: "source" });
    }));
    box.appendChild(button("b8-btn", icon("history", 15) + "<span>What this Project changed</span>", function () {
      ui.facets = { domains: [], kinds: [], exposures: [], changedOnly: true };
      RT.go({ kind: "all" });
    }));
    return box;
  }

  /* ------------------------------------------------------------ area overview */

  /* One geometry for every destination inside an area: icon, title, purpose, and
   * the figure that says whether it needs you. A manager and a page of rows are
   * equally unmistakable, which is the whole point of this design. */
  function destRow(spec) {
    var row = button("b8-dest", null, spec.go);
    var block = el("span", "b8-iconblock is-sm");
    block.innerHTML = icon(spec.icon, 20);
    row.appendChild(block);

    var body = el("div", "b8-dest-body");
    body.appendChild(textNode("div", "b8-dest-title", spec.title));
    if (spec.purpose) body.appendChild(textNode("p", "b8-dest-purpose", spec.purpose));
    row.appendChild(body);

    if (spec.figureValue != null) {
      var fig = el("div", "b8-dest-figure");
      fig.appendChild(textNode("div", "b8-dest-figure-value", spec.figureValue));
      if (spec.figureLabel) fig.appendChild(textNode("div", "b8-dest-figure-label", spec.figureLabel));
      row.appendChild(fig);
    }
    var chev = el("span", "b8-dest-chevron");
    chev.innerHTML = icon("chevronRight", 18);
    row.appendChild(chev);
    return row;
  }

  /* How many things a manager holds, counted from the search index rather than by
   * building the manager. Search never hydrates, and neither may a link label. */
  var managerItemCount = null;

  function itemsInManager(managerId) {
    if (!managerItemCount) {
      managerItemCount = {};
      var recs = IX.records();
      for (var i = 0; i < recs.length; i++) {
        var mid = recs[i].destination.managerId;
        if (mid) managerItemCount[mid] = (managerItemCount[mid] || 0) + 1;
      }
    }
    return managerItemCount[managerId] || 0;
  }

  function archetypeWord(a) {
    switch (a) {
      case "resource roster and detail sheet": return "Roster and detail";
      case "inventory catalogue": return "Catalogue";
      case "setup or repair sequence": return "Guided sequence";
      case "read-only health projection": return "Read-only health";
      case "diagnostic drawer": return "Diagnostics";
      case "preview and confirmation transaction": return "Transaction";
      case "named owner insertion point": return "Separate owner";
      default: return "Preferences";
    }
  }

  function renderDomain(wrap, route) {
    var domain = M.domain(route.domainId);
    if (!domain) return;

    var head = el("header", "b8-head");
    var top = el("div", "b8-head-top");
    var block = el("span", "b8-iconblock");
    block.innerHTML = icon(domain.icon, 26);
    top.appendChild(block);
    var body = el("div", "b8-head-body");
    body.appendChild(textNode("h2", "b8-title", domain.title));
    body.appendChild(textNode("p", "b8-purpose", domain.purpose));
    top.appendChild(body);
    head.appendChild(top);
    head.appendChild(textNode("div", "b8-meta",
      plural(domain.count, "setting") + " across " + plural(domain.pages.length, "page") +
      ", plus " + plural(domain.families.filter(function (f) { return !!f.managerId; }).length, "manager") +
      " that own more than a list of values."));
    wrap.appendChild(head);

    var managers = domain.families.filter(function (f) { return !!f.managerId; });
    if (managers.length) {
      wrap.appendChild(textNode("div", "b8-section-title", "Managers in this area"));
      var mlist = el("div", "b8-rows");
      managers.forEach(function (f) {
        var rec = MG.record(f.managerId);
        var count = itemsInManager(f.managerId);
        var row = destRow({
          icon: (rec && rec.icon) || domain.icon,
          title: (rec && rec.title) || f.family,
          purpose: (rec && rec.purpose) || f.family,
          figureValue: f.deferred ? "Named owner" : (count ? String(count) : archetypeWord(f.archetype)),
          figureLabel: f.deferred ? f.owner : (count ? "things you can open" : ""),
          go: function () { RT.go({ kind: "manager", managerId: f.managerId }); }
        });
        row.setAttribute("data-pm-manager", f.managerId);
        mlist.appendChild(row);
      });
      wrap.appendChild(mlist);
    }

    wrap.appendChild(textNode("div", "b8-section-title", "Pages of settings"));
    var plist = el("div", "b8-rows");
    domain.pages.forEach(function (p) {
      var row = destRow({
        icon: domain.icon,
        title: p.title,
        purpose: p.summary,
        figureValue: String(p.count),
        figureLabel: "settings",
        go: function () { RT.go({ kind: "domain", domainId: domain.id, pageId: p.id }); }
      });
      row.setAttribute("data-pm-page", p.id);
      plist.appendChild(row);
    });
    wrap.appendChild(plist);
  }

  /* ------------------------------------------------------------------- page */

  function renderPage(wrap, route) {
    var domain = M.domain(route.domainId);
    var page = M.page(route.pageId);
    if (!page) return;
    var fx = ST.effects();

    var head = el("header", "b8-head");
    head.appendChild(textNode("h2", "b8-title-sm", page.title));
    head.appendChild(textNode("p", "b8-purpose", page.summary));
    var meta = el("div", "b8-meta");
    meta.textContent = plural(page.count, "setting") + " in " + plural(page.sections.length, "group") +
      " · " + (domain ? domain.title : "");
    head.appendChild(meta);
    if (fx.refreshing) {
      var chip = el("div", "b8-meta");
      chip.appendChild(tag("Refreshing — the values below are the last ones read", "setup"));
      head.appendChild(chip);
    }
    if (fx.restartPending) {
      var restart = el("div", "b8-meta");
      restart.appendChild(tag("Two changes on this page take effect after a restart", "setup"));
      head.appendChild(restart);
    }
    wrap.appendChild(head);

    validationBudget = fx.validationError ? 1 : 0;

    /* An index of this page's own groups that follows the scroll, not only the click.
     * `01_CORE_ARCHITECTURE` item 4 and the navigation video both ask for the highlight
     * to move as the reader scrolls; an index that only responds to clicks can say
     * where you asked to go but never where you are. */
    var __idx = el("nav", "b8-onpage");
    __idx.setAttribute("aria-label", "On this page");
    __idx.appendChild(el("span", "b8-onpage-label", "On this page"));
    var __built = [];
    page.sections.forEach(function (section) {
      var __b = document.createElement("button");
      __b.type = "button";
      __b.className = "b8-onpage-item";
      __b.textContent = section.title;
      __b.setAttribute("data-onpage", section.id);
      __b.addEventListener("click", function () {
        var el2 = document.querySelector('[data-pm-section="' + section.id.replace(/"/g, '\\"') + '"]');
        if (el2 && el2.scrollIntoView) el2.scrollIntoView({ block: "start" });
      });
      __idx.appendChild(__b);
    });
    if (page.sections.length > 1) wrap.appendChild(__idx);

    page.sections.forEach(function (section) {
      var __node = renderSection(section, route);
      wrap.appendChild(__node);
      __built.push({ id: section.id, title: section.title, pageId: page.id, el: __node });
    });

    /* Deferred one frame: at this point the surface is still being assembled and is not
     * yet in the document, so walking up from a section would find no scrolling ancestor
     * and silently fall back to the page body — which is why the highlight never moved. */
    if (window.PM2Spy && __built.length) window.requestAnimationFrame(function () {
      var __scroller = wrap;
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

  var validationBudget = 0;

  function tag(text, tone) {
    var t = textNode("span", "b8-tag", text);
    if (tone) t.setAttribute("data-tone", tone);
    return t;
  }

  function renderSection(section, route) {
    var box = el("section", "b8-group");
    box.setAttribute("data-pm-section", section.id);

    var rows = M.rowsInSection(section.id);
    var standard = rows.filter(function (r) { return r.exposure === "standard"; });
    var deeper = rows.filter(function (r) { return r.exposure !== "standard"; });

    /* A deep link may name a row that lives behind the disclosure. The disclosure
     * opens rather than the link failing silently. */
    var forced = false;
    if (route.settingId) {
      for (var i = 0; i < deeper.length; i++) if (deeper[i].id === route.settingId) forced = true;
    }
    var open = forced || ui.openSections[section.id] === true;

    var head = el("div", "b8-group-head");
    head.appendChild(textNode("h3", "b8-group-title", section.title));
    head.appendChild(textNode("span", "b8-group-count", plural(rows.length, "setting")));
    box.appendChild(head);

    var list = el("div", "b8-group-rows");
    standard.forEach(function (rec) { list.appendChild(renderRow(rec, route)); });

    if (open) deeper.forEach(function (rec) { list.appendChild(renderRow(rec, route)); });
    if (!standard.length && !open && !deeper.length) {
      list.appendChild(textNode("p", "b8-empty", "This group has no settings in this Project."));
    }
    box.appendChild(list);

    if (deeper.length) {
      var toggle = button("b8-disclose", null, function () {
        ui.openSections[section.id] = !open;
        render();
      });
      toggle.innerHTML = icon(open ? "chevronUp" : "chevronDown", 15);
      toggle.appendChild(textNode("span", null, open
        ? "Hide the " + plural(deeper.length, "deeper setting") + " in this group"
        : "Show " + plural(deeper.length, "deeper setting") + " — advanced, expert and diagnostic"));
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      box.appendChild(toggle);
    }
    return box;
  }

  function exposureWord(e) {
    for (var i = 0; i < M.EXPOSURE.length; i++) if (M.EXPOSURE[i].id === e) return M.EXPOSURE[i].label;
    return "Everyday";
  }

  function renderRow(rec, route) {
    var state = ST.rowState(rec);
    var editable = M.isEditable(state);
    var tone = M.stateTone(state);
    var label = M.stateLabel(state);
    var reason = M.stateReason(state);
    var fx = ST.effects();

    var row = el("div", "b8-row");
    row.setAttribute("data-pm-row", rec.id);
    row.setAttribute("tabindex", "-1");
    if (!editable) row.setAttribute("data-locked", "true");

    var body = el("div", "b8-row-body");
    var title = el("div", "b8-row-title");
    title.appendChild(textNode("span", "b8-row-name", rec.label));
    if (rec.exposure !== "standard") title.appendChild(tag(exposureWord(rec.exposure), null));
    if (tone === "changed") title.appendChild(tag("Changed", "changed"));
    if (tone === "managed") title.appendChild(tag("Managed", "managed"));
    if (tone === "unavailable") title.appendChild(tag("Unavailable here", "unavailable"));
    if (tone === "setup") title.appendChild(tag("Not set", "setup"));
    if (fx.changedElsewhere && rec.exposure === "standard") {
      title.appendChild(tag("Changed in another window", "setup"));
    }
    body.appendChild(title);
    body.appendChild(textNode("p", "b8-row-desc", rec.desc));

    if (ui.errors[rec.id]) {
      body.appendChild(textNode("p", "b8-row-error", ui.errors[rec.id]));
    } else if (fx.validationError && validationBudget > 0 && (rec.kind === "number" || rec.kind === "text")) {
      validationBudget -= 1;
      body.appendChild(textNode("p", "b8-row-error",
        "That value cannot be accepted: it is outside the range this host allows. What you typed is still here."));
    }

    var detailsOpen = ui.openDetails[rec.id] === true;
    var why = button("b8-why", null, function () {
      ui.openDetails[rec.id] = !detailsOpen;
      render();
    });
    why.innerHTML = icon(detailsOpen ? "chevronUp" : "chevronDown", 13);
    why.appendChild(textNode("span", null, detailsOpen ? "Hide details" : "Why this value?"));
    why.setAttribute("aria-expanded", detailsOpen ? "true" : "false");
    body.appendChild(why);
    if (detailsOpen) body.appendChild(rowDetails(rec, state, reason, label));
    if (ui.listEditor && ui.listEditor.id === rec.id) body.appendChild(listEditorBlock(rec));

    row.appendChild(body);

    var control = el("div", "b8-row-control");
    control.appendChild(renderControl(rec, state, editable));
    row.appendChild(control);
    return row;
  }

  /* Source, revision, restart and technical origin live here, never on the row. */
  function rowDetails(rec, state, reason, label) {
    var box = el("div", "b8-details");
    function line(k, v) {
      var d = el("div", "b8-detail");
      d.appendChild(textNode("span", "b8-detail-k", k));
      d.appendChild(textNode("span", "b8-detail-v", v));
      box.appendChild(d);
    }
    line("Where this value came from", label);
    if (reason) line("Why", reason);
    line("Product default", format(rec.state.defaultValue));
    if (rec.recommended != null) line("Recommended", format(rec.recommended));
    line("Depth", exposureWord(rec.exposure));
    line("Takes effect", rec.state.restart && rec.state.restart !== "none"
      ? "After a restart of " + rec.state.restart
      : "Immediately");
    if (state && state.managedBy) line("Controlled by", state.managedBy);
    line("Settings path", [
      (M.domain(rec.domainId) || {}).title,
      (M.page(rec.pageId) || {}).title,
      (M.section(rec.sectionId) || {}).title
    ].filter(Boolean).join(" › "));

    if (store.changed(rec.id)) {
      var acts = el("div", "b8-detail-acts");
      acts.appendChild(button("b8-btn is-quiet", "Put this back to the default", function () {
        store.clearValue(rec.id);
        delete ui.errors[rec.id];
        render();
      }));
      box.appendChild(acts);
    }
    return box;
  }

  function format(v) {
    if (v === true) return "On";
    if (v === false) return "Off";
    if (v == null || v === "") return "Not set";
    if (Object.prototype.toString.call(v) === "[object Array]") return v.length ? v.join(", ") : "Nothing selected";
    if (typeof v === "object") {
      var keys = Object.keys(v);
      return keys.length ? keys.map(function (k) { return k + " = " + v[k]; }).join(", ") : "Nothing set";
    }
    return String(v);
  }

  function commit(rec, value) {
    store.setValue(rec.id, value);
    delete ui.errors[rec.id];
    shell.announce(rec.label + " is now " + format(value));
  }


  /* The Puppet Master Model/Mode selector idiom: a trigger carrying the current value,
   * and a menu that hangs beneath it — or flips above when the row sits near the bottom
   * of the page, which is what the model picker in the bottom bar does. Placement,
   * layering and one-layer-at-a-time Escape come from PM2Menu; every pixel is this
   * concept's own. */
  function pmPicker(rec, options, value, onPick) {
    var wrap = el("div", "b8-picker");
    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "b8-picker-trigger";
    trigger.setAttribute("data-pm-control", rec.id);
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", rec.label);
    var valueEl = document.createElement("span");
    valueEl.className = "b8-picker-value";
    valueEl.textContent = String(value === "" || value == null ? "Not set" : value);
    trigger.appendChild(valueEl);
    var chev = document.createElement("span");
    chev.className = "b8-picker-chev";
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
      row.className = "b8-menu-item";
      row.setAttribute("role", "option");
      row.setAttribute("data-opt", String(i));
      row.setAttribute("aria-selected", o === value ? "true" : "false");
      var mark = document.createElement("span");
      mark.className = "b8-menu-check";
      mark.innerHTML = o === value ? window.PMIcons.icon("check", 12) : "";
      row.appendChild(mark);
      var lab = document.createElement("span");
      lab.className = "b8-menu-label";
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
      row.className = "b8-menu-item is-parent";
      row.setAttribute("role", "option");
      row.setAttribute("data-opt", String(i));
      row.setAttribute("aria-haspopup", "menu");
      row.setAttribute("aria-expanded", "false");
      var mark = document.createElement("span");
      mark.className = "b8-menu-check";
      mark.innerHTML = g.options.indexOf(value) >= 0 ? window.PMIcons.icon("check", 12) : "";
      row.appendChild(mark);
      var lab = document.createElement("span");
      lab.className = "b8-menu-label";
      lab.textContent = String(g.label);
      row.appendChild(lab);
      var more = document.createElement("span");
      more.className = "b8-menu-more";
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
        sub.className = "b8-menu b8-submenu";
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
      panel.className = "b8-menu";
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
    var value = store.valueOf(rec.id);
    if (value === undefined) value = state ? state.value : rec.state.value;

    if (!editable) {
      var locked = button("b8-readonly", null, function () {
        ui.openDetails[rec.id] = !ui.openDetails[rec.id];
        render();
      });
      locked.setAttribute("data-pm-control", rec.id);
      locked.setAttribute("aria-disabled", "true");
      locked.innerHTML = icon(state && state.source === "managed" ? "lock" : "ban", 14);
      locked.appendChild(textNode("span", null, format(value)));
      return locked;
    }

    if (rec.kind === "toggle") {
      var t = button("b8-switch", null, function () { commit(rec, !truthy(value)); });
      t.setAttribute("data-pm-control", rec.id);
      t.setAttribute("role", "switch");
      t.setAttribute("aria-checked", truthy(value) ? "true" : "false");
      t.setAttribute("aria-label", rec.label);
      t.appendChild(el("span", "b8-switch-track", '<span class="b8-switch-knob"></span>'));
      t.appendChild(textNode("span", "b8-switch-word", truthy(value) ? "On" : "Off"));
      return t;
    }

    if (rec.kind === "select" || rec.kind === "radio") {
      var opts = (rec.options || []).slice();
      if (!opts.length) opts = [String(value)];
      return pmPicker(rec, opts, value, function (v) { commit(rec, v); });
    }

    if (rec.kind === "number" || rec.kind === "slider") {
      var wrapN = el("div", "b8-numberwrap");
      var n = document.createElement("input");
      n.type = rec.kind === "slider" ? "range" : "number";
      n.className = rec.kind === "slider" ? "b8-range" : "b8-number";
      n.setAttribute("data-pm-control", rec.id);
      n.setAttribute("aria-label", rec.label);
      if (rec.kind === "slider") { n.min = "0"; n.max = "100"; }
      n.value = String(value == null ? "" : value);
      on(n, "change", function () {
        var num = Number(n.value);
        if (n.value === "" || isNaN(num)) {
          ui.errors[rec.id] = "That is not a number this Project can use. The previous value is still in force.";
          render();
          return;
        }
        commit(rec, num);
      });
      wrapN.appendChild(n);
      if (rec.kind === "slider") wrapN.appendChild(textNode("span", "b8-range-value", format(value)));
      return wrapN;
    }

    if (rec.kind === "text" || rec.kind === "path") {
      var i = document.createElement("input");
      i.type = "text";
      i.className = "b8-text";
      i.spellcheck = false;
      i.setAttribute("data-pm-control", rec.id);
      i.setAttribute("aria-label", rec.label);
      i.value = String(value == null ? "" : value);
      on(i, "change", function () { commit(rec, i.value); });
      return i;
    }

    if (rec.kind === "list" || rec.kind === "multiselect" || rec.kind === "keyvalue") {
      var editor = button("b8-listbtn", null, function () {
        ui.openDetails[rec.id] = true;
        openListEditor(rec, value);
      });
      editor.setAttribute("data-pm-control", rec.id);
      editor.innerHTML = icon("list", 14);
      editor.appendChild(textNode("span", null, format(value)));
      return editor;
    }

    /* kind: "action" — a row that runs something rather than holding a value. */
    var a = button("b8-btn is-primary", null, function () {
      MG.act({ managerId: null }, { id: rec.id, label: rec.label, detail: rec.desc, realCall: "settings.row.run" }, null);
      shell.announce(rec.label + " was started.");
    });
    a.setAttribute("data-pm-control", rec.id);
    a.textContent = rec.label;
    return a;
  }

  function truthy(v) { return v === true || v === "true" || v === "On" || v === 1; }

  /* A list, multiselect or key/value row edits in place rather than in a dialog:
   * a popup over a row the reader just found would hide the thing they searched
   * for. The values still round-trip through the same store. */
  function openListEditor(rec, value) {
    var current = value;
    var text;
    if (Object.prototype.toString.call(current) === "[object Array]") text = current.join("\n");
    else if (current && typeof current === "object") {
      text = Object.keys(current).map(function (k) { return k + " = " + current[k]; }).join("\n");
    } else text = String(current == null ? "" : current);

    ui.listEditor = { id: rec.id, text: text };
    render();
  }

  function listEditorBlock(rec) {
    var box = el("div", "b8-details");
    var area = document.createElement("textarea");
    area.className = "b8-textarea";
    area.rows = 4;
    area.value = ui.listEditor.text;
    area.setAttribute("aria-label", rec.label + " — one entry per line");
    box.appendChild(area);
    var acts = el("div", "b8-detail-acts");
    acts.appendChild(button("b8-btn is-primary", "Save", function () {
      var lines = area.value.split("\n").map(function (s) { return s.replace(/^\s+|\s+$/g, ""); })
        .filter(function (s) { return !!s; });
      if (rec.kind === "keyvalue") {
        var obj = {};
        lines.forEach(function (line) {
          var at = line.indexOf("=");
          if (at < 0) return;
          obj[line.slice(0, at).replace(/\s+$/, "")] = line.slice(at + 1).replace(/^\s+/, "");
        });
        commit(rec, obj);
      } else commit(rec, lines);
      ui.listEditor = null;
      render();
    }));
    acts.appendChild(button("b8-btn is-quiet", "Cancel", function () {
      ui.listEditor = null;
      render();
    }));
    box.appendChild(acts);
    return box;
  }

  /* ---------------------------------------------------------------- managers */

  /* Hydration happens here and nowhere else: a manager wakes up when it is opened,
   * never on load, never from a link label and never from search. Every spec is
   * passed through PM2States.decorate so an offline fixture cannot leave a manager
   * claiming a healthy server. */
  function managerSpec(managerId) {
    return ST.decorate(MG.spec(managerId, store.get()));
  }

  /* The roster and the index name the same object the same way now (see
   * SEVEN_NEW_CONCEPTS_FINDINGS.md §1c.1 — they did not, and it cost 633 unroutable
   * objects). The loose match stays so a link saved against the older prefixed ids
   * still lands rather than showing a reader a not-found page for a bookmark. */
  function sameObject(itemId, objectId) {
    if (!itemId || !objectId) return false;
    if (itemId === objectId) return true;
    return itemId.replace(/^(prov|acct|acc|end|inst|model|item)-/, "") === objectId;
  }

  function findObject(spec, objectId) {
    if (!spec || !objectId) return null;
    var sections = spec.sections || [];
    for (var i = 0; i < sections.length; i++) {
      var items = sections[i].items || [];
      for (var j = 0; j < items.length; j++) {
        if (sameObject(items[j].id, objectId)) return { section: sections[i], item: items[j] };
      }
    }
    return null;
  }

  function statusTone(status) {
    switch (status) {
      case "attention": case "risky": return "attention";
      case "setup": case "loading": case "degraded": return "setup";
      case "managed": return "managed";
      case "unavailable": return "unavailable";
      default: return "ok";
    }
  }

  function renderManagerSurface(wrap, route) {
    var managerId = route.managerId;
    if (!MG.has(managerId)) {
      wrap.appendChild(textNode("p", "b8-purpose", "This manager is not part of this Project."));
      return;
    }
    var spec = managerSpec(managerId);
    var family = M.familyOf(managerId) || {};
    var ctx = { managerId: managerId, route: route, spec: spec, family: family };

    wrap.appendChild(managerHeader(spec, family));

    if (spec.deferred || spec.owner) {
      wrap.appendChild(ownerBlock(spec, family));
    }

    if (managerId === "manager-providers") renderProviderManager(wrap, spec, ctx);
    else renderManager(spec, ctx, wrap);

    /* A link may name an item that lives on a subpage this view does not show. It
     * is answered in place rather than dropped, so the deep link still lands. */
    if (route.objectId && !wrap.querySelector('[data-pm-object="' + cssEscape(route.objectId) + '"]')) {
      wrap.appendChild(strandedObject(route, spec));
    }

    if (spec.notes && spec.notes.length) {
      var notes = el("div", "b8-notes");
      spec.notes.forEach(function (n) { notes.appendChild(textNode("p", "b8-note", n)); });
      wrap.appendChild(notes);
    }
  }

  function managerHeader(spec, family) {
    var head = el("header", "b8-head");
    var top = el("div", "b8-head-top");
    var block = el("span", "b8-iconblock");
    block.innerHTML = icon(spec.icon, 26);
    top.appendChild(block);
    var body = el("div", "b8-head-body");
    var title = el("div", "b8-row-title");
    title.appendChild(textNode("h2", "b8-title-sm", spec.title));
    if (spec.health && spec.health.statusWord) {
      title.appendChild(tag(spec.health.statusWord, statusTone(spec.health.status)));
    }
    body.appendChild(title);
    body.appendChild(textNode("p", "b8-purpose", spec.purpose));
    if (spec.health && spec.health.headline) {
      body.appendChild(textNode("p", "b8-meta", spec.health.headline));
    }
    top.appendChild(body);
    head.appendChild(top);
    if (spec.health && spec.health.detail) head.appendChild(textNode("p", "b8-meta", spec.health.detail));
    if (family && family.archetype) {
      head.appendChild(textNode("div", "b8-meta", "This destination is a " + archetypeWord(family.archetype).toLowerCase() + "."));
    }
    return head;
  }

  /* Large, readable figures rather than a dense table: the whole point of this
   * concept is that the numbers that matter are legible from a step back. */
  function statCards(cards) {
    var grid = el("div", "b8-stats");
    cards.forEach(function (c) {
      var box = el("div", "b8-stat");
      box.appendChild(textNode("div", "b8-stat-label", c.label));
      box.appendChild(textNode("div", "b8-stat-value", c.value == null || c.value === "" ? "Not reported" : c.value));
      if (c.note) box.appendChild(textNode("div", "b8-stat-note", c.note));
      grid.appendChild(box);
    });
    return grid;
  }

  function ownerBlock(spec, family) {
    var owner = spec.owner || {};
    var box = el("section", "b8-panel");
    var head = el("div", "b8-panel-head");
    head.innerHTML = icon("external", 17);
    head.appendChild(textNode("h3", "b8-panel-title", "Owned by " + (owner.name || family.owner || "another owner")));
    box.appendChild(head);

    var body = el("div", "b8-ownerbody");
    body.appendChild(textNode("p", "b8-purpose", owner.why || family.why || ""));
    var rows = el("div", "b8-details");
    function line(k, v) {
      if (!v) return;
      var d = el("div", "b8-detail");
      d.appendChild(textNode("span", "b8-detail-k", k));
      d.appendChild(textNode("span", "b8-detail-v", v));
      rows.appendChild(d);
    }
    line("Where Settings hands over", owner.insertionContract || family.insertion);
    line("How control comes back", owner.returnContract || family.returns);
    line("What Settings still owns", "How this Project uses what the owner reports. Nothing here edits the owner's own records.");
    body.appendChild(rows);

    var acts = el("div", "b8-detail-acts");
    acts.appendChild(button("b8-btn is-primary", "Open " + esc(owner.name || family.owner || "the owner"), function () {
      MG.act({ managerId: spec.managerId }, {
        id: "owner.open", label: "Open " + (owner.name || family.owner || "the owner"),
        detail: owner.insertionContract || family.insertion || "",
        realCall: "shell.open_owner"
      }, null);
      shell.announce("The owner would open here; control returns to this row.");
    }));
    body.appendChild(acts);
    box.appendChild(body);
    return box;
  }

  function strandedObject(route, spec) {
    var rec = IX.byDestination({ managerId: route.managerId, objectId: route.objectId, rowId: route.rowId || null });
    var box = el("div", "b8-notice");
    box.setAttribute("data-tone", "info");
    box.setAttribute("data-pm-object", route.objectId);
    box.innerHTML = '<span class="b8-notice-icon">' + icon("pin", 20) + "</span>";
    var body = el("div", "b8-notice-body");
    body.appendChild(textNode("div", "b8-notice-head", rec ? rec.label : route.objectId));
    body.appendChild(textNode("p", "b8-notice-detail", rec && rec.desc
      ? rec.desc
      : "This item lives on a subpage of this manager."));
    body.appendChild(textNode("p", "b8-notice-detail",
      "It sits under " + (route.sectionKey ? humanKey(route.sectionKey) : "this manager") +
      ". The link named it, so it is answered here rather than dropped."));
    box.appendChild(body);
    return box;
  }

  function humanKey(key) {
    return String(key).replace(/[-_.]+/g, " ").replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/^./, function (c) { return c.toUpperCase(); });
  }

  /* ------------------------------------------------------- one renderManager */

  /* Seven archetypes, seven shapes. Flattening them all into preference rows is
   * exactly the failure the packet names, so the branch is explicit. */
  function renderManager(spec, ctx, wrap) {
    var archetype = ctx.family.archetype || MG.archetype(ctx.managerId);

    if (spec.health && spec.health.counts && spec.health.counts.length) {
      wrap.appendChild(statCards(spec.health.counts.map(function (c) {
        return { label: c.label, value: String(c.value) };
      })));
    }

    if (archetype === "resource roster and detail sheet") return rosterManager(spec, ctx, wrap);
    if (archetype === "inventory catalogue") return catalogueManager(spec, ctx, wrap);
    if (archetype === "setup or repair sequence") return sequenceManager(spec, ctx, wrap);
    if (archetype === "read-only health projection") return projectionManager(spec, ctx, wrap);
    if (archetype === "diagnostic drawer") return drawerManager(spec, ctx, wrap);
    if (archetype === "preview and confirmation transaction") return transactionManager(spec, ctx, wrap);
    return documentManager(spec, ctx, wrap);
  }

  function listSections(spec) {
    return (spec.sections || []).filter(function (s) {
      return (s.kind === "list" || s.kind === "cards" || s.kind === "table") && (s.items || []).length;
    });
  }

  function quickActions(spec, ctx, extra) {
    var box = el("section", "b8-quick");
    box.appendChild(textNode("div", "b8-section-title", "Quick actions"));
    var strip = el("div", "b8-quick-strip");
    var added = 0;
    if (spec.primary && spec.primary.label) {
      strip.appendChild(actionButton(spec.primary, ctx, null, true));
      added += 1;
    }
    (extra || []).forEach(function (a) { strip.appendChild(a); added += 1; });
    (spec.diagnostics || []).forEach(function (d) {
      if (added >= 6) return;
      strip.appendChild(actionButton({ id: d.id, label: d.label, kind: "quiet" }, ctx, null, false));
      added += 1;
    });
    if (!added) return null;
    box.appendChild(strip);
    return box;
  }

  function actionButton(action, ctx, item, primary) {
    var b = button("b8-btn" + (primary || action.kind === "primary" || action.kind === "create" ? " is-primary" : ""), null, function () {
      MG.act({ managerId: ctx.managerId }, {
        id: action.id, label: action.label,
        detail: "Requested from " + ctx.spec.title + (item ? " · " + item.name : ""),
        realCall: action.id
      }, item ? { itemId: item.id } : null);
      shell.announce(action.label + " was requested.");
    });
    b.textContent = action.label;
    return b;
  }

  /* -------------------------------------------------- roster and detail sheet */

  function rosterManager(spec, ctx, wrap) {
    var sections = listSections(spec);
    var roster = sections[0];
    if (!roster) return documentManager(spec, ctx, wrap);

    var items = roster.items || [];
    var wanted = ctx.route.objectId || ui.selected[ctx.managerId];
    var selected = null;
    for (var i = 0; i < items.length; i++) {
      if (wanted && sameObject(items[i].id, wanted)) { selected = items[i]; break; }
    }
    if (!selected) selected = items[0] || null;
    if (selected) ui.selected[ctx.managerId] = selected.id;

    var split = el("div", "b8-split");

    var left = el("section", "b8-panel b8-rosterpane");
    var head = el("div", "b8-panel-head");
    head.innerHTML = icon("list", 17);
    head.appendChild(textNode("h3", "b8-panel-title", roster.label || "Items"));
    head.appendChild(textNode("span", "b8-panel-count", plural(items.length, "item")));
    left.appendChild(head);

    if (!items.length) {
      left.appendChild(emptyBlock(roster));
    } else {
      var list = el("div", "b8-rosterlist b8-scroll");
      items.forEach(function (item) {
        var row = button("b8-rosterrow", null, function () {
          ui.selected[ctx.managerId] = item.id;
          RT.go({ kind: "manager", managerId: ctx.managerId, objectId: item.id });
        });
        row.setAttribute("data-pm-object", item.id);
        if (selected && item.id === selected.id) {
          row.setAttribute("aria-selected", "true");
          row.classList.add("is-selected");
        }
        var body = el("div", "b8-dest-body");
        body.appendChild(textNode("div", "b8-dest-title", item.name));
        if (item.secondary) body.appendChild(textNode("p", "b8-dest-purpose", item.secondary));
        row.appendChild(body);
        if (item.statusWord) row.appendChild(tag(item.statusWord, statusTone(item.status)));
        list.appendChild(row);
      });
      left.appendChild(list);
    }
    split.appendChild(left);

    var right = el("div", "b8-sheet");
    if (selected) right.appendChild(itemSheet(selected, ctx, roster));
    else right.appendChild(textNode("p", "b8-empty", "Nothing is selected yet."));
    split.appendChild(right);

    wrap.appendChild(split);

    /* Everything that is not the roster still belongs to this manager, so it is
     * shown below the sheet rather than hidden behind a tab the reader must find. */
    (spec.sections || []).forEach(function (s) {
      if (s === roster) return;
      wrap.appendChild(specSection(s, ctx));
    });
    var q = quickActions(spec, ctx, null);
    if (q) wrap.appendChild(q);
  }

  function emptyBlock(section) {
    var box = el("div", "b8-empty");
    var e = section.empty;
    box.appendChild(textNode("div", "b8-attn-label", e ? e.headline : "Nothing here yet"));
    box.appendChild(textNode("p", "b8-attn-detail", e ? e.detail
      : "This Project has not configured anything in this list yet."));
    return box;
  }

  /* The detail sheet: the status figures first, then the fields, then what can
   * actually be edited, then the actions. */
  function itemSheet(item, ctx, section) {
    var box = el("section", "b8-panel");
    var head = el("div", "b8-panel-head");
    head.innerHTML = icon(ctx.spec.icon, 17);
    head.appendChild(textNode("h3", "b8-panel-title", item.name));
    if (item.statusWord) head.appendChild(tag(item.statusWord, statusTone(item.status)));
    box.appendChild(head);

    var body = el("div", "b8-sheetbody");
    if (item.secondary) body.appendChild(textNode("p", "b8-purpose", item.secondary));

    if (item.availability && item.availability.available === false) {
      body.appendChild(textNode("p", "b8-row-error", item.availability.reason ||
        "This item is not available on this host."));
    }

    var fieldKeys = Object.keys(item.fields || {});
    if (fieldKeys.length) {
      body.appendChild(statCards(fieldKeys.slice(0, 6).map(function (k) {
        return { label: humanKey(k), value: String(item.fields[k]) };
      })));
      if (fieldKeys.length > 6) {
        var rest = el("div", "b8-details");
        fieldKeys.slice(6).forEach(function (k) {
          var d = el("div", "b8-detail");
          d.appendChild(textNode("span", "b8-detail-k", humanKey(k)));
          d.appendChild(textNode("span", "b8-detail-v", String(item.fields[k])));
          rest.appendChild(d);
        });
        body.appendChild(rest);
      }
    }

    (item.badges || []).forEach(function (b) {
      if (!b.text) return;
      var line = el("p", "b8-meta");
      line.appendChild(tag(b.text, null));
      if (b.title) line.appendChild(textNode("span", "b8-note", " " + b.title));
      body.appendChild(line);
    });

    (item.editable || []).forEach(function (field) {
      body.appendChild(editableField(field, item, ctx));
    });

    (item.detail || []).forEach(function (group) {
      var d = el("div", "b8-details");
      d.appendChild(textNode("div", "b8-section-title", group.label));
      (group.rows || []).forEach(function (r) {
        var line = el("div", "b8-detail");
        line.appendChild(textNode("span", "b8-detail-k", r.label));
        var v = el("span", "b8-detail-v");
        v.textContent = String(r.value);
        if (r.hint) v.appendChild(textNode("div", "b8-note", r.hint));
        line.appendChild(v);
        d.appendChild(line);
      });
      body.appendChild(d);
    });

    if ((item.actions || []).length) {
      var acts = el("div", "b8-detail-acts");
      item.actions.forEach(function (a) { acts.appendChild(actionButton(a, ctx, item, false)); });
      body.appendChild(acts);
    }
    box.appendChild(body);
    return box;
  }

  /* Manager edits round-trip through the same store as settings rows, so a reload
   * shows what the reader actually changed. No secret is ever rendered. */
  function editableField(field, item, ctx) {
    var wrapF = el("div", "b8-field");
    var id = "b8f-" + ctx.managerId + "-" + item.id + "-" + field.key;
    var lab = el("label", "b8-field-label");
    lab.setAttribute("for", id);
    lab.textContent = field.label;
    wrapF.appendChild(lab);

    var current = store.edit(ctx.managerId, item.id, field.key, field.value);

    if (field.secretKind) {
      var secret = el("div", "b8-secret");
      secret.appendChild(textNode("span", null, "Held by " + (field.help || "the provider's own tool") + "."));
      secret.appendChild(textNode("p", "b8-note",
        "Puppet Master never reads, shows or exports the secret itself. Sign-in happens in the provider's own flow."));
      wrapF.appendChild(secret);
      return wrapF;
    }

    if (field.kind === "toggle") {
      var t = button("b8-switch", null, function () {
        store.setEdit(ctx.managerId, item.id, field.key, !truthy(current));
        MG.invalidate(ctx.managerId);
        render();
      });
      t.id = id;
      t.setAttribute("role", "switch");
      t.setAttribute("aria-checked", truthy(current) ? "true" : "false");
      t.appendChild(el("span", "b8-switch-track", '<span class="b8-switch-knob"></span>'));
      t.appendChild(textNode("span", "b8-switch-word", truthy(current) ? "On" : "Off"));
      wrapF.appendChild(t);
    } else if (field.kind === "select" && (field.options || []).length) {
      var s = document.createElement("select");
      s.className = "b8-select";
      s.id = id;
      field.options.forEach(function (o) {
        var opt = document.createElement("option");
        opt.value = String(o);
        opt.textContent = String(o);
        s.appendChild(opt);
      });
      s.value = String(current == null ? "" : current);
      on(s, "change", function () {
        store.setEdit(ctx.managerId, item.id, field.key, s.value);
        MG.invalidate(ctx.managerId);
        render();
      });
      wrapF.appendChild(s);
    } else {
      var i = document.createElement("input");
      i.type = field.kind === "number" ? "number" : "text";
      i.className = field.kind === "number" ? "b8-number" : "b8-text";
      i.id = id;
      i.value = String(current == null ? "" : current);
      on(i, "change", function () {
        store.setEdit(ctx.managerId, item.id, field.key, i.value);
        MG.invalidate(ctx.managerId);
        render();
      });
      wrapF.appendChild(i);
    }
    if (field.help) wrapF.appendChild(textNode("p", "b8-note", field.help));
    return wrapF;
  }

  /* ------------------------------------------------------ inventory catalogue */

  function catalogueManager(spec, ctx, wrap) {
    var sections = listSections(spec);
    if (!sections.length) return documentManager(spec, ctx, wrap);

    var filterText = (ui.catalogue && ui.catalogue.managerId === ctx.managerId ? ui.catalogue.text : "") || "";

    var filterBox = el("div", "b8-catfilter");
    var field = el("div", "b8-searchfield");
    field.innerHTML = icon("filter", 15);
    var input = document.createElement("input");
    input.type = "text";
    input.className = "b8-catinput";
    input.placeholder = (spec.search && spec.search.placeholder) || "Filter this catalogue";
    input.setAttribute("aria-label", "Filter " + spec.title);
    input.value = filterText;
    on(input, "input", function () {
      ui.catalogue = { managerId: ctx.managerId, text: input.value };
      var lists = wrap.querySelectorAll("[data-b8-catalogue]");
      for (var i = 0; i < lists.length; i++) paintCatalogue(lists[i]);
    });
    field.appendChild(input);
    filterBox.appendChild(field);
    wrap.appendChild(filterBox);

    sections.forEach(function (section) {
      var box = el("section", "b8-panel");
      var head = el("div", "b8-panel-head");
      head.innerHTML = icon("archive", 17);
      head.appendChild(textNode("h3", "b8-panel-title", section.label));
      head.appendChild(textNode("span", "b8-panel-count", plural((section.items || []).length, "entry", "entries")));
      box.appendChild(head);
      if (section.summary) box.appendChild(textNode("p", "b8-panel-summary", section.summary));

      if (!(section.items || []).length) {
        box.appendChild(emptyBlock(section));
      } else {
        var list = el("div", "b8-catlist b8-scroll");
        list.setAttribute("data-b8-catalogue", section.id);
        list.b8Items = section.items;
        list.b8Ctx = ctx;
        on(list, "scroll", function () { paintCatalogue(list); });
        box.appendChild(list);
        wrap.appendChild(box);
        paintCatalogue(list);
        return;
      }
      wrap.appendChild(box);
    });

    (spec.sections || []).forEach(function (s) {
      if (sections.indexOf(s) >= 0) return;
      wrap.appendChild(specSection(s, ctx));
    });
    var q = quickActions(spec, ctx, null);
    if (q) wrap.appendChild(q);
  }

  /* A catalogue can be two hundred entries long, so only the visible window
   * exists. The spacers keep the scrollbar truthful. */
  function paintCatalogue(list) {
    var ctx = list.b8Ctx;
    var text = (ui.catalogue && ui.catalogue.managerId === ctx.managerId ? ui.catalogue.text : "") || "";
    var needle = text.toLowerCase().replace(/^\s+|\s+$/g, "");
    var items = list.b8Items.filter(function (it) {
      if (!needle) return true;
      return (it.name + " " + (it.secondary || "") + " " + (it.statusWord || "")).toLowerCase().indexOf(needle) >= 0;
    });
    var rowHeight = 72;
    var viewport = list.clientHeight || 420;
    var win = window.PMVirtual.windowFor({
      total: items.length, rowHeight: rowHeight, viewport: viewport,
      scrollTop: list.scrollTop, overscan: 4, firstPage: 14
    });
    clear(list);
    var before = el("div", "b8-spacer");
    before.style.height = win.before + "px";
    list.appendChild(before);
    for (var i = win.start; i < win.end; i++) {
      var item = items[i];
      if (!item) continue;
      list.appendChild(catalogueRow(item, ctx));
    }
    var after = el("div", "b8-spacer");
    after.style.height = win.after + "px";
    list.appendChild(after);
    if (!items.length) {
      list.appendChild(textNode("p", "b8-empty", "Nothing in this catalogue matches “" + text + "”."));
    }
  }

  function catalogueRow(item, ctx) {
    var row = button("b8-rosterrow", null, function () {
      ui.selected[ctx.managerId] = item.id;
      RT.go({ kind: "manager", managerId: ctx.managerId, objectId: item.id });
    });
    row.setAttribute("data-pm-object", item.id);
    var body = el("div", "b8-dest-body");
    body.appendChild(textNode("div", "b8-dest-title", item.name));
    if (item.secondary) body.appendChild(textNode("p", "b8-dest-purpose", item.secondary));
    row.appendChild(body);
    if (item.statusWord) row.appendChild(tag(item.statusWord, statusTone(item.status)));
    return row;
  }

  /* ----------------------------------------------------- setup or repair steps */

  function sequenceManager(spec, ctx, wrap) {
    var sections = spec.sections || [];
    var stepped = false;
    sections.forEach(function (section) {
      var items = section.items || [];
      if (!items.length) { wrap.appendChild(specSection(section, ctx)); return; }
      stepped = true;
      var box = el("section", "b8-panel");
      var head = el("div", "b8-panel-head");
      head.innerHTML = icon("route", 17);
      head.appendChild(textNode("h3", "b8-panel-title", section.label));
      head.appendChild(textNode("span", "b8-panel-count", plural(items.length, "step")));
      box.appendChild(head);
      if (section.summary) box.appendChild(textNode("p", "b8-panel-summary", section.summary));

      items.forEach(function (item, n) {
        var step = el("div", "b8-step");
        step.setAttribute("data-pm-object", item.id);
        step.appendChild(textNode("span", "b8-step-n", String(n + 1)));
        var body = el("div", "b8-dest-body");
        var line = el("div", "b8-row-title");
        line.appendChild(textNode("span", "b8-dest-title", item.name));
        if (item.statusWord) line.appendChild(tag(item.statusWord, statusTone(item.status)));
        body.appendChild(line);
        if (item.secondary) body.appendChild(textNode("p", "b8-dest-purpose", item.secondary));
        Object.keys(item.fields || {}).forEach(function (k) {
          var d = el("div", "b8-detail");
          d.appendChild(textNode("span", "b8-detail-k", humanKey(k)));
          d.appendChild(textNode("span", "b8-detail-v", String(item.fields[k])));
          body.appendChild(d);
        });
        if ((item.actions || []).length) {
          var acts = el("div", "b8-detail-acts");
          item.actions.forEach(function (a) { acts.appendChild(actionButton(a, ctx, item, false)); });
          body.appendChild(acts);
        }
        step.appendChild(body);
        box.appendChild(step);
      });
      wrap.appendChild(box);
    });
    if (!stepped) documentManager(spec, ctx, wrap);
    var q = quickActions(spec, ctx, null);
    if (q) wrap.appendChild(q);
  }

  /* --------------------------------------------------- read-only health */

  function projectionManager(spec, ctx, wrap) {
    wrap.appendChild(textNode("p", "b8-meta",
      "Everything on this page is read. Nothing here changes a value: each finding names the owner that can repair it."));
    (spec.sections || []).forEach(function (section) {
      var items = section.items || [];
      var box = el("section", "b8-panel");
      var head = el("div", "b8-panel-head");
      head.innerHTML = icon("gauge", 17);
      head.appendChild(textNode("h3", "b8-panel-title", section.label));
      if (items.length) head.appendChild(textNode("span", "b8-panel-count", plural(items.length, "check")));
      box.appendChild(head);
      if (section.summary) box.appendChild(textNode("p", "b8-panel-summary", section.summary));
      if (!items.length) { box.appendChild(emptyBlock(section)); wrap.appendChild(box); return; }

      items.forEach(function (item) {
        var row = el("div", "b8-attn");
        row.setAttribute("data-tone", statusTone(item.status) === "ok" ? "info" : statusTone(item.status));
        row.setAttribute("data-pm-object", item.id);
        var mark = el("span", "b8-attn-mark");
        mark.innerHTML = icon(statusTone(item.status) === "ok" ? "checkCircle" : "alert", 18);
        row.appendChild(mark);
        var body = el("div", "b8-attn-body");
        body.appendChild(textNode("div", "b8-attn-label", item.name));
        if (item.secondary) body.appendChild(textNode("div", "b8-attn-detail", item.secondary));
        Object.keys(item.fields || {}).forEach(function (k) {
          var d = el("div", "b8-detail");
          d.appendChild(textNode("span", "b8-detail-k", humanKey(k)));
          d.appendChild(textNode("span", "b8-detail-v", String(item.fields[k])));
          body.appendChild(d);
        });
        if ((item.actions || []).length) {
          var acts = el("div", "b8-detail-acts");
          item.actions.forEach(function (a) { acts.appendChild(actionButton(a, ctx, item, false)); });
          body.appendChild(acts);
        }
        row.appendChild(body);
        if (item.statusWord) row.appendChild(tag(item.statusWord, statusTone(item.status)));
        box.appendChild(row);
      });
      wrap.appendChild(box);
    });
  }

  /* ---------------------------------------------------------- diagnostics */

  function drawerManager(spec, ctx, wrap) {
    wrap.appendChild(textNode("p", "b8-meta",
      "Diagnostics stay closed until you open one: they are evidence, not something to read every day."));
    (spec.sections || []).forEach(function (section) {
      var box = el("section", "b8-panel");
      var head = el("div", "b8-panel-head");
      head.innerHTML = icon("bug", 17);
      head.appendChild(textNode("h3", "b8-panel-title", section.label));
      box.appendChild(head);
      if (section.summary) box.appendChild(textNode("p", "b8-panel-summary", section.summary));
      var items = section.items || [];
      if (!items.length) { box.appendChild(emptyBlock(section)); wrap.appendChild(box); return; }
      items.forEach(function (item) {
        var key = ctx.managerId + ":" + item.id;
        var open = ui.openDetails[key] === true;
        var head2 = button("b8-drawer", null, function () {
          ui.openDetails[key] = !open;
          render();
        });
        head2.setAttribute("data-pm-object", item.id);
        head2.setAttribute("aria-expanded", open ? "true" : "false");
        head2.innerHTML = icon(open ? "chevronDown" : "chevronRight", 15);
        head2.appendChild(textNode("span", "b8-dest-title", item.name));
        if (item.statusWord) head2.appendChild(tag(item.statusWord, statusTone(item.status)));
        box.appendChild(head2);
        if (open) {
          var d = el("div", "b8-details");
          if (item.secondary) d.appendChild(textNode("p", "b8-note", item.secondary));
          Object.keys(item.fields || {}).forEach(function (k) {
            var line = el("div", "b8-detail");
            line.appendChild(textNode("span", "b8-detail-k", humanKey(k)));
            line.appendChild(textNode("span", "b8-detail-v", String(item.fields[k])));
            d.appendChild(line);
          });
          if ((item.actions || []).length) {
            var acts = el("div", "b8-detail-acts");
            item.actions.forEach(function (a) { acts.appendChild(actionButton(a, ctx, item, false)); });
            d.appendChild(acts);
          }
          box.appendChild(d);
        }
      });
      wrap.appendChild(box);
    });
    var q = quickActions(spec, ctx, null);
    if (q) wrap.appendChild(q);
  }

  /* --------------------------------------- preview and confirmation transaction */

  function transactionManager(spec, ctx, wrap) {
    wrap.appendChild(textNode("p", "b8-meta",
      "Nothing on this page happens until you confirm it, and everything it would do is listed first."));
    (spec.sections || []).forEach(function (section) {
      wrap.appendChild(specSection(section, ctx));
    });
    var extra = [];
    if (ctx.managerId === "manager-copy") {
      extra.push(button("b8-btn is-primary", "Start the copy transaction", function () {
        RT.go({ kind: "copy", step: "source" });
      }));
    }
    var q = quickActions(spec, ctx, extra);
    if (q) wrap.appendChild(q);
  }

  /* ------------------------------------------------------ preference document */

  function documentManager(spec, ctx, wrap) {
    (spec.sections || []).forEach(function (section) {
      wrap.appendChild(specSection(section, ctx));
    });
    var q = quickActions(spec, ctx, null);
    if (q) wrap.appendChild(q);
  }

  /* One block renderer for a spec section, so a prose section, a table and a set
   * of ordinary rows all keep the same rhythm. */
  function specSection(section, ctx) {
    var box = el("section", "b8-panel");
    var head = el("div", "b8-panel-head");
    head.innerHTML = icon("fileText", 17);
    head.appendChild(textNode("h3", "b8-panel-title", section.label));
    box.appendChild(head);
    if (section.summary) box.appendChild(textNode("p", "b8-panel-summary", section.summary));

    if (section.kind === "rows" && (section.settings || []).length) {
      var route = RT.current();
      var any = 0;
      section.settings.forEach(function (id) {
        var rec = M.setting(id);
        if (!rec) return;
        any += 1;
        box.appendChild(renderRow(rec, route));
      });
      if (!any) box.appendChild(textNode("p", "b8-empty", "None of these settings exist in this Project."));
      return box;
    }

    if (section.kind === "prose") {
      var prose = el("div", "b8-prose");
      (section.items || []).forEach(function (item) {
        prose.appendChild(textNode("p", "b8-prose-p", item.name));
      });
      if (!(section.items || []).length) prose.appendChild(textNode("p", "b8-empty", "Nothing to say here yet."));
      box.appendChild(prose);
      return box;
    }

    var items = section.items || [];
    if (!items.length) { box.appendChild(emptyBlock(section)); return box; }

    items.forEach(function (item) {
      var row = el("div", "b8-itemrow");
      row.setAttribute("data-pm-object", item.id);
      var body = el("div", "b8-dest-body");
      var line = el("div", "b8-row-title");
      line.appendChild(textNode("span", "b8-dest-title", item.name));
      if (item.statusWord) line.appendChild(tag(item.statusWord, statusTone(item.status)));
      body.appendChild(line);
      if (item.secondary) body.appendChild(textNode("p", "b8-dest-purpose", item.secondary));
      var keys = Object.keys(item.fields || {});
      if (keys.length) {
        var fields = el("div", "b8-details");
        keys.forEach(function (k) {
          var d = el("div", "b8-detail");
          d.appendChild(textNode("span", "b8-detail-k", humanKey(k)));
          d.appendChild(textNode("span", "b8-detail-v", String(item.fields[k])));
          fields.appendChild(d);
        });
        body.appendChild(fields);
      }
      (item.editable || []).forEach(function (f) { body.appendChild(editableField(f, item, ctx)); });
      if ((item.actions || []).length) {
        var acts = el("div", "b8-detail-acts");
        item.actions.forEach(function (a) { acts.appendChild(actionButton(a, ctx, item, false)); });
        body.appendChild(acts);
      }
      row.appendChild(body);
      box.appendChild(row);
    });
    if ((section.actions || []).length) {
      var sacts = el("div", "b8-detail-acts b8-section-acts");
      section.actions.forEach(function (a) { sacts.appendChild(actionButton(a, ctx, null, false)); });
      box.appendChild(sacts);
    }
    return box;
  }
  /* ------------------------------------------------ the provider manager */

  /* Built by hand rather than from the archetype, because this is the one surface
   * the seven designs are meant to disagree about. Broadside answers it with the
   * six figures a reader arrives wanting, one explicit row of quick actions, and
   * then the subpages — never one wall of everything.
   *
   * The roster and every readiness word come from the ManagerSpec. The accounts
   * and model catalogues are read from the same headless provider fixtures the
   * search index reads, because a subpage that could not list what search can find
   * would be a dead end. Nothing here reads, renders or exports a secret. */

  var PROVIDER_SUBPAGES = [
    { key: "accounts", title: "Accounts and sign-in", icon: "user",
      purpose: "Which identities this Project may use, what each one is entitled to, and who holds the login." },
    { key: "models", title: "Model catalogue", icon: "cpu",
      purpose: "Every model this family offers, where the list came from, and which are usable right now." },
    { key: "credentials", title: "Credentials", icon: "key",
      purpose: "Where the secret lives and who owns it. Nothing here shows key material." },
    { key: "installations", title: "Installations", icon: "download",
      purpose: "What was detected on this machine, which one this Project uses, and which are shadowed." },
    { key: "limits", title: "Limits and routing", icon: "route",
      purpose: "Order of preference, sticky threads and the reserve kept for verification." },
    { key: "logs", title: "Logs and diagnostics", icon: "bug",
      purpose: "The evidence behind every readiness word on this screen." },
    { key: "defaults", title: "Model defaults for this Project", icon: "sliders",
      purpose: "The ordinary rows that decide which route is asked for first." }
  ];

  var SUBPAGE_ALIAS = {
    accounts: "accounts", models: "models", catalogues: "models",
    credentials: "credentials", installations: "installations",
    cliInstallations: "installations", limits: "limits", routing: "limits",
    logs: "logs", diagnostics: "logs", settings: "defaults"
  };

  function rawProviders() {
    var D = window.PMData;
    return (D && Object.prototype.toString.call(D.providers) === "[object Array]") ? D.providers : [];
  }

  function rawProvider(id) {
    var list = rawProviders();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function preferredAccount(p) {
    var accounts = (p && p.accounts) || [];
    var best = null;
    for (var i = 0; i < accounts.length; i++) {
      var a = accounts[i];
      if (a.status !== "connected" && a.status !== "degraded") continue;
      if (!best || (a.priority || 99) < (best.priority || 99)) best = a;
    }
    return best || accounts[0] || null;
  }

  function defaultModelOf(p) {
    var models = (p && p.models) || [];
    var best = null;
    for (var i = 0; i < models.length; i++) {
      var m = models[i];
      if (m.available === false) continue;
      if (!best || (m.priority || 99) < (best.priority || 99)) best = m;
    }
    return best;
  }

  function providerFacts(item, raw, fx) {
    var account = preferredAccount(raw);
    var usage = (account && account.usage) || {};
    var health = (account && account.health) || {};
    var model = defaultModelOf(raw);
    var cached = fx.offline ? "Cannot check right now" : null;
    var noUsage = fx.usageUnavailable ? "Not reported by this provider" : null;

    return [
      { label: "Status",
        value: fx.reconnectRequired ? "Sign in again" : (item.statusWord || (raw && raw.statusWord) || "Ready"),
        note: fx.offline ? "Last answer received before the network went away" : "" },
      { label: "Default model",
        value: model ? (model.alias || model.name) : "Chosen per thread",
        note: model && model.summary ? model.summary : "No model is preferred until one is connected" },
      { label: "Last answer",
        value: cached || health.generation || "Not reported",
        note: health.catalogue ? "Catalogue read " + health.catalogue : "" },
      { label: "Included usage left",
        value: noUsage || cached || usage.includedRemaining || "Not reported",
        note: "Provider-reported. Measurement belongs to Usage." },
      { label: "Usage resets",
        value: noUsage || cached || usage.resetsIn || "Not reported",
        note: usage.note || "" },
      { label: "When it runs out",
        value: (account && account.nextAction && account.nextAction.chosen) || "Ask each time",
        note: "This is the only usage decision Settings owns." }
    ];
  }

  function renderProviderManager(wrap, spec, ctx) {
    var fx = ST.effects();
    var sections = spec.sections || [];
    var families = null;
    var installs = null;
    var subpageSpec = null;
    var acquisition = null;
    var rowsSection = null;
    var usageEnd = null;
    sections.forEach(function (s) {
      if (s.id === "families") families = s;
      else if (s.id === "installations") installs = s;
      else if (s.id === "subpages") subpageSpec = s;
      else if (s.id === "acquisition") acquisition = s;
      else if (s.id === "provider-rows") rowsSection = s;
      else if (s.id === "usage-end") usageEnd = s;
    });

    var items = (families && families.items) || [];
    var wanted = ctx.route.objectId || ui.selected["manager-providers"];
    var selected = null;
    for (var i = 0; i < items.length; i++) {
      if (wanted && sameObject(items[i].id, wanted)) { selected = items[i]; break; }
    }
    if (!selected) selected = items[0] || null;
    var selectedId = selected ? selected.id.replace(/^prov-/, "") : null;
    if (selectedId) ui.selected["manager-providers"] = selectedId;

    var subKey = SUBPAGE_ALIAS[ctx.route.sectionKey] || ui.subpage["manager-providers"] || null;
    if (ctx.route.sectionKey && SUBPAGE_ALIAS[ctx.route.sectionKey]) {
      ui.subpage["manager-providers"] = SUBPAGE_ALIAS[ctx.route.sectionKey];
    }

    var split = el("div", "b8-split");

    /* --- roster ------------------------------------------------------- */
    var left = el("section", "b8-panel b8-rosterpane");
    var head = el("div", "b8-panel-head");
    head.innerHTML = icon("cpu", 17);
    head.appendChild(textNode("h3", "b8-panel-title", "Providers"));
    head.appendChild(textNode("span", "b8-panel-count", plural(items.length, "family", "families")));
    left.appendChild(head);

    if (!items.length) {
      left.appendChild(emptyBlock(families || {}));
    } else {
      var list = el("div", "b8-rosterlist b8-scroll");
      items.forEach(function (item) {
        var pid = item.id.replace(/^prov-/, "");
        var row = button("b8-rosterrow", null, function () {
          ui.selected["manager-providers"] = pid;
          ui.subpage["manager-providers"] = null;
          RT.go({ kind: "manager", managerId: "manager-providers", objectId: pid });
        });
        row.setAttribute("data-pm-object", pid);
        if (selectedId === pid) { row.setAttribute("aria-selected", "true"); row.classList.add("is-selected"); }
        var body = el("div", "b8-dest-body");
        body.appendChild(textNode("div", "b8-dest-title", item.name));
        if (item.secondary) body.appendChild(textNode("p", "b8-dest-purpose", item.secondary));
        row.appendChild(body);
        if (item.statusWord) row.appendChild(tag(item.statusWord, statusTone(item.status)));
        list.appendChild(row);
      });
      left.appendChild(list);
    }
    var addWrap = el("div", "b8-rosterfoot");
    if (spec.primary) addWrap.appendChild(actionButton(spec.primary, ctx, null, true));
    left.appendChild(addWrap);
    split.appendChild(left);

    /* --- the answer sheet --------------------------------------------- */
    var right = el("div", "b8-sheet");
    if (!selected) {
      right.appendChild(textNode("p", "b8-empty",
        "No provider family is configured yet. Set one up and it appears here with its accounts, its models and what it does when included usage ends."));
      split.appendChild(right);
      wrap.appendChild(split);
      return;
    }

    var raw = rawProvider(selectedId);

    var sheetHead = el("div", "b8-sheet-head");
    var block = el("span", "b8-iconblock");
    block.innerHTML = icon((raw && raw.icon) || "cpu", 26);
    sheetHead.appendChild(block);
    var sheetBody = el("div", "b8-head-body");
    var titleLine = el("div", "b8-row-title");
    titleLine.appendChild(textNode("h3", "b8-title-sm", selected.name));
    if (selected.statusWord) titleLine.appendChild(tag(selected.statusWord, statusTone(selected.status)));
    sheetBody.appendChild(titleLine);
    sheetBody.appendChild(textNode("p", "b8-purpose", selected.secondary || (raw && raw.summary) || ""));
    sheetHead.appendChild(sheetBody);
    right.appendChild(sheetHead);

    if (fx.reconnectRequired) {
      right.appendChild(textNode("p", "b8-row-error",
        "This provider's session expired. Nothing was changed while it was expired; signing in again is a separate, explicit step."));
    }
    if (fx.offline) {
      right.appendChild(textNode("p", "b8-row-error",
        "There is no network connection. Every figure below is the last one this Project read, and anything that needs the network is disabled."));
    }

    right.appendChild(statCards(providerFacts(selected, raw, fx)));

    /* The quick actions row is explicit rather than scattered through the page:
     * six things a reader might do, in one place, none of them hidden. */
    var quick = el("section", "b8-quick");
    quick.appendChild(textNode("div", "b8-section-title", "Quick actions"));
    var strip = el("div", "b8-quick-strip");
    (selected.actions || []).forEach(function (a) {
      strip.appendChild(actionButton(a, ctx, selected, a.kind === "primary"));
    });
    strip.appendChild(subpageButton("credentials", "Manage credentials"));
    strip.appendChild(subpageButton("models", "View models"));
    strip.appendChild(subpageButton("installations", "Check installations"));
    var usageBtn = button("b8-btn", "Open Usage", function () {
      RT.go({ kind: "manager", managerId: "manager-usage" });
    });
    strip.appendChild(usageBtn);
    quick.appendChild(strip);
    right.appendChild(quick);

    function subpageButton(key, label) {
      return button("b8-btn", esc(label), function () {
        ui.subpage["manager-providers"] = key;
        RT.go({ kind: "manager", managerId: "manager-providers", objectId: selectedId, sectionKey: key });
      });
    }

    split.appendChild(right);
    wrap.appendChild(split);

    /* --- subpages, as destinations rather than a tab strip -------------- */
    wrap.appendChild(textNode("div", "b8-section-title", "Subpages of this manager"));
    var subs = el("div", "b8-rows");
    PROVIDER_SUBPAGES.forEach(function (sub) {
      var specItem = subpageFigure(sub.key, subpageSpec, raw, installs, rowsSection);
      var row = destRow({
        icon: sub.icon,
        title: sub.title,
        purpose: sub.purpose,
        figureValue: specItem.value,
        figureLabel: specItem.label,
        go: function () {
          ui.subpage["manager-providers"] = sub.key;
          RT.go({ kind: "manager", managerId: "manager-providers", objectId: selectedId, sectionKey: sub.key });
        }
      });
      if (subKey === sub.key) row.setAttribute("aria-current", "true");
      subs.appendChild(row);
    });
    wrap.appendChild(subs);

    if (subKey) {
      wrap.appendChild(providerSubpage(subKey, selected, raw, ctx, {
        installs: installs, rows: rowsSection, subpageSpec: subpageSpec, usageEnd: usageEnd, fx: fx
      }));
    }

    if (acquisition) wrap.appendChild(specSection(acquisition, ctx));
  }

  function subpageFigure(key, subpageSpec, raw, installs, rowsSection) {
    if (key === "accounts") return { value: String(((raw && raw.accounts) || []).length), label: "accounts" };
    if (key === "models") return { value: String(((raw && raw.models) || []).length), label: "models" };
    if (key === "installations") return { value: String(((installs && installs.items) || []).length), label: "found on this machine" };
    if (key === "defaults") return { value: String(((rowsSection && rowsSection.settings) || []).length), label: "settings" };
    var item = null;
    (subpageSpec && subpageSpec.items || []).forEach(function (it) {
      if (key === "credentials" && it.id === "sub-credentials") item = it;
      if (key === "limits" && it.id === "sub-limits") item = it;
      if (key === "logs" && it.id === "sub-logs") item = it;
    });
    return item ? { value: item.statusWord || "Open", label: "" } : { value: "Open", label: "" };
  }

  function providerSubpage(key, selected, raw, ctx, extras) {
    var box = el("section", "b8-panel");
    var head = el("div", "b8-panel-head");
    var meta = null;
    PROVIDER_SUBPAGES.forEach(function (s) { if (s.key === key) meta = s; });
    head.innerHTML = icon(meta ? meta.icon : "fileText", 17);
    head.appendChild(textNode("h3", "b8-panel-title", (meta ? meta.title : humanKey(key)) + " · " + selected.name));
    head.appendChild(button("b8-btn is-quiet", "Close this subpage", function () {
      ui.subpage["manager-providers"] = null;
      RT.go({ kind: "manager", managerId: "manager-providers", objectId: selected.id.replace(/^prov-/, "") });
    }));
    box.appendChild(head);
    if (meta) box.appendChild(textNode("p", "b8-panel-summary", meta.purpose));

    if (key === "accounts") return accountsSubpage(box, raw, ctx, extras);
    if (key === "models") return modelsSubpage(box, raw, extras);
    if (key === "credentials") return credentialsSubpage(box, raw, extras);
    if (key === "installations") return installationsSubpage(box, raw, ctx, extras);
    if (key === "defaults") return defaultsSubpage(box, extras);

    var item = null;
    (extras.subpageSpec && extras.subpageSpec.items || []).forEach(function (it) {
      if (key === "limits" && it.id === "sub-limits") item = it;
      if (key === "logs" && it.id === "sub-logs") item = it;
    });
    if (item) {
      var fields = el("div", "b8-details");
      Object.keys(item.fields || {}).forEach(function (k) {
        var d = el("div", "b8-detail");
        d.appendChild(textNode("span", "b8-detail-k", humanKey(k)));
        d.appendChild(textNode("span", "b8-detail-v", String(item.fields[k])));
        fields.appendChild(d);
      });
      box.appendChild(fields);
      if ((item.actions || []).length) {
        var acts = el("div", "b8-detail-acts");
        item.actions.forEach(function (a) { acts.appendChild(actionButton(a, ctx, item, false)); });
        box.appendChild(acts);
      }
    } else {
      box.appendChild(textNode("p", "b8-empty", "Nothing is recorded on this subpage yet."));
    }
    return box;
  }

  function accountsSubpage(box, raw, ctx, extras) {
    var accounts = (raw && raw.accounts) || [];
    if (!accounts.length) {
      box.appendChild(textNode("p", "b8-empty",
        "No account is connected to this family yet. Signing in is a separate step from installing the tool, and it happens in the provider's own flow."));
      return box;
    }
    accounts.forEach(function (a) {
      var row = el("div", "b8-itemrow");
      row.setAttribute("data-pm-object", a.id);
      var body = el("div", "b8-dest-body");
      var line = el("div", "b8-row-title");
      line.appendChild(textNode("span", "b8-dest-title", (a.nickname || a.identity) + " · " + (a.product || "")));
      if (a.statusWord) line.appendChild(tag(a.statusWord, statusTone(a.status === "connected" ? "ok" : a.status)));
      body.appendChild(line);
      body.appendChild(textNode("p", "b8-dest-purpose", a.identity + " — " + (a.connection || "")));
      var usage = a.usage || {};
      body.appendChild(statCards([
        { label: "Included usage left", value: extras.fx.usageUnavailable ? "Not reported" : (usage.includedRemaining || "Not reported"),
          note: "Provider-reported" },
        { label: "Resets in", value: extras.fx.usageUnavailable ? "Not reported" : (usage.resetsIn || "Not reported"), note: "" },
        { label: "When it runs out", value: (a.nextAction && a.nextAction.chosen) || "Ask each time",
          note: (a.nextAction && (a.nextAction.options || []).length) ? "Also offered: " + a.nextAction.options.join(" · ") : "" }
      ]));
      row.appendChild(body);
      box.appendChild(row);
    });
    return box;
  }

  function modelsSubpage(box, raw, extras) {
    var models = (raw && raw.models) || [];
    if (!models.length) {
      box.appendChild(textNode("p", "b8-empty",
        "No model catalogue has been read for this family. A catalogue is read after the family is connected, not before."));
      return box;
    }
    var list = el("div", "b8-catlist b8-scroll");
    list.b8Items = models.map(function (m) {
      return {
        id: m.id,
        name: m.alias || m.name,
        secondary: (m.summary || "") + (m.context ? " · context " + m.context : ""),
        status: m.available === false ? "unavailable" : "ok",
        statusWord: m.available === false ? "Not available on this account" : "Usable"
      };
    });
    list.b8Ctx = { managerId: "manager-providers" };
    list.setAttribute("data-b8-catalogue", "provider-models");
    on(list, "scroll", function () { paintCatalogue(list); });
    box.appendChild(list);
    paintCatalogue(list);
    return box;
  }

  function credentialsSubpage(box, raw, extras) {
    var accounts = (raw && raw.accounts) || [];
    box.appendChild(textNode("p", "b8-meta",
      "Puppet Master holds no provider secret. It selects the profile and launches the provider's own login; " +
      "no key, token or profile file is read, rendered or exported here."));
    if (!accounts.length) {
      box.appendChild(textNode("p", "b8-empty", "There is no sign-in to describe until an account is connected."));
      return box;
    }
    accounts.forEach(function (a) {
      var row = el("div", "b8-itemrow");
      row.setAttribute("data-pm-object", a.id);
      var body = el("div", "b8-dest-body");
      body.appendChild(textNode("div", "b8-dest-title", a.nickname || a.identity));
      var fields = el("div", "b8-details");
      function line(k, v) {
        var d = el("div", "b8-detail");
        d.appendChild(textNode("span", "b8-detail-k", k));
        d.appendChild(textNode("span", "b8-detail-v", v));
        fields.appendChild(d);
      }
      line("Held by", (raw && raw.credentialOwner) || (raw && raw.name) || "the provider's own tool");
      line("Isolation", (raw && raw.isolation) || "Each profile owns its own login directory");
      line("Where it lives", a.connection || "In the provider's own profile");
      line("Shown here", "Never. Secret material is not read by Settings.");
      body.appendChild(fields);
      var acts = el("div", "b8-detail-acts");
      acts.appendChild(button("b8-btn is-primary", "Sign in again", function () {
        MG.act({ managerId: "manager-providers" }, {
          id: "provider.auth.start_setup", label: "Sign in to " + (a.nickname || a.identity),
          detail: "Launches the provider's own login inside its own profile.",
          realCall: "provider.auth.start_setup"
        }, { itemId: a.id });
        shell.announce("The provider's own sign-in would open.");
      }));
      body.appendChild(acts);
      row.appendChild(body);
      box.appendChild(row);
    });
    return box;
  }

  function installationsSubpage(box, raw, ctx, extras) {
    var items = (extras.installs && extras.installs.items) || [];
    var fx = extras.fx;
    if (fx.multiInstall) {
      box.appendChild(textNode("p", "b8-row-error",
        "More than one candidate answers for this family on this computer. The one this Project uses is bound by identity, so a change in PATH order cannot move it; the other is shadowed and is named below."));
    }
    if (fx.unknownOwner) {
      box.appendChild(textNode("p", "b8-row-error",
        "One installation has an owner Puppet Master cannot establish. It stays manual only: nothing will adopt, update or repair it."));
    }
    if (fx.updateAvailable) {
      box.appendChild(textNode("p", "b8-meta",
        "A newer generation is staged for an installation that is already approved. It will not be installed until you say so."));
    }
    if (!items.length) {
      box.appendChild(textNode("p", "b8-empty",
        "No provider tool was found on this machine. Nothing is bundled with Puppet Master — start a set-up from a provider above to install one from its official source."));
      return box;
    }
    items.forEach(function (item) {
      var row = el("div", "b8-itemrow");
      row.setAttribute("data-pm-object", item.id);
      var body = el("div", "b8-dest-body");
      var line = el("div", "b8-row-title");
      line.appendChild(textNode("span", "b8-dest-title", item.name));
      if (item.statusWord) line.appendChild(tag(item.statusWord, statusTone(item.status)));
      body.appendChild(line);
      if (item.secondary) body.appendChild(textNode("p", "b8-dest-purpose", item.secondary));
      var fields = el("div", "b8-details");
      Object.keys(item.fields || {}).forEach(function (k) {
        var d = el("div", "b8-detail");
        d.appendChild(textNode("span", "b8-detail-k", humanKey(k)));
        d.appendChild(textNode("span", "b8-detail-v", String(item.fields[k])));
        fields.appendChild(d);
      });
      body.appendChild(fields);
      if ((item.actions || []).length) {
        var acts = el("div", "b8-detail-acts");
        item.actions.forEach(function (a) { acts.appendChild(actionButton(a, ctx, item, false)); });
        body.appendChild(acts);
      }
      row.appendChild(body);
      box.appendChild(row);
    });
    return box;
  }

  function defaultsSubpage(box, extras) {
    var ids = (extras.rows && extras.rows.settings) || [];
    var route = RT.current();
    var any = 0;
    ids.forEach(function (id) {
      var rec = M.setting(id);
      if (!rec) return;
      any += 1;
      box.appendChild(renderRow(rec, route));
    });
    if (!any) box.appendChild(textNode("p", "b8-empty", "No model defaults are exposed for this Project."));
    return box;
  }

  /* ------------------------------------------------------------ all settings */

  /* The long tail, faceted and windowed. It is a secondary utility here — the
   * areas are the way in — but it is complete: every indexed record, including the
   * ones that are managed, unavailable or diagnostic. */
  function renderAll(wrap, route) {
    var head = el("header", "b8-head");
    head.appendChild(textNode("h2", "b8-title-sm", "All settings"));
    head.appendChild(textNode("p", "b8-purpose",
      "Every record Settings can find in " + M.project.name + ", including the ones a policy controls and " +
      "the ones this host cannot provide. Narrow it with the facets, then open the exact row."));
    wrap.appendChild(head);

    if (route.facet && ui.allText !== route.facet) ui.allText = route.facet;

    var filter = {
      domainIds: ui.facets.domains,
      kinds: ui.facets.kinds,
      exposures: ui.facets.exposures,
      changedOnly: ui.facets.changedOnly,
      text: ui.allText || "",
      limit: 0
    };
    var result = IX.all(filter);

    var bar = el("div", "b8-catfilter");
    var field = el("div", "b8-searchfield");
    field.innerHTML = icon("filter", 15);
    var input = document.createElement("input");
    input.type = "text";
    input.className = "b8-catinput";
    input.placeholder = "Narrow these results";
    input.setAttribute("aria-label", "Narrow all settings");
    input.value = ui.allText || "";
    var debounce = 0;
    on(input, "input", function () {
      ui.allText = input.value;
      window.clearTimeout(debounce);
      debounce = window.setTimeout(function () { render(); }, 160);
    });
    field.appendChild(input);
    bar.appendChild(field);
    bar.appendChild(textNode("span", "b8-util-note",
      plural(result.total, "match", "matches") + " of " + IX.stats().records + " indexed records"));
    if (ui.facets.domains.length || ui.facets.kinds.length || ui.facets.exposures.length || ui.facets.changedOnly) {
      bar.appendChild(button("b8-btn", "Clear the facets", function () {
        ui.facets = { domains: [], kinds: [], exposures: [], changedOnly: false };
        render();
      }));
    }
    wrap.appendChild(bar);

    var split = el("div", "b8-allsplit");

    var facets = el("aside", "b8-facets b8-scroll");
    facets.appendChild(facetGroup("Area", result.facets.domains, ui.facets.domains, "domains"));
    facets.appendChild(facetGroup("Kind", result.facets.kinds, ui.facets.kinds, "kinds"));
    facets.appendChild(facetGroup("Depth", result.facets.exposures, ui.facets.exposures, "exposures"));
    facets.appendChild(facetGroup("State", result.facets.states, [], null));

    var changedBox = el("div", "b8-facet");
    changedBox.appendChild(textNode("div", "b8-facet-head", "Changed"));
    var chg = button("b8-facet-item", null, function () {
      ui.facets.changedOnly = !ui.facets.changedOnly;
      render();
    });
    chg.appendChild(textNode("span", null, "Changed for this Project"));
    chg.appendChild(textNode("span", "b8-facet-n", String(result.facets.changed)));
    chg.setAttribute("aria-pressed", ui.facets.changedOnly ? "true" : "false");
    changedBox.appendChild(chg);
    facets.appendChild(changedBox);
    split.appendChild(facets);

    var listBox = el("div", "b8-alllist b8-scroll");
    listBox.b8Rows = result.rows;
    on(listBox, "scroll", function () { paintAll(listBox); });
    split.appendChild(listBox);
    wrap.appendChild(split);
    paintAll(listBox);

    if (ST.is("no-results") && !result.total) {
      wrap.appendChild(textNode("p", "b8-empty",
        "Nothing matches that. The facets above still show what does exist, so a search that finds nothing " +
        "still tells you what this Project has."));
    }
  }

  /* Windowed: 828 records plus a 2,400-row stress fixture must never become 3,200
   * nodes, so only the visible slice exists and two spacers hold the scrollbar. */
  function paintAll(listBox) {
    var rows = listBox.b8Rows || [];
    var rowHeight = 62;
    var viewport = listBox.clientHeight || 480;
    var win = window.PMVirtual.windowFor({
      total: rows.length, rowHeight: rowHeight, viewport: viewport,
      scrollTop: listBox.scrollTop, overscan: 5, firstPage: 18
    });
    clear(listBox);
    var before = el("div", "b8-spacer");
    before.style.height = win.before + "px";
    listBox.appendChild(before);
    for (var i = win.start; i < win.end; i++) {
      var rec = rows[i];
      if (!rec) continue;
      listBox.appendChild(allRow(rec));
    }
    var after = el("div", "b8-spacer");
    after.style.height = win.after + "px";
    listBox.appendChild(after);
    if (!rows.length) {
      listBox.appendChild(textNode("p", "b8-empty", "Nothing matches the facets that are switched on."));
    }
  }

  function allRow(rec) {
    var b = button("b8-allrow", null, function () {
      var full = IX.byId(rec.id);
      if (!full) return;
      ui.pending = { result: full, query: ui.allText };
      RT.go(destinationRoute(full.destination));
    });
    b.setAttribute("data-pm-result", rec.id);
    var body = el("div", "b8-dest-body");
    body.appendChild(textNode("div", "b8-allrow-label", rec.label));
    body.appendChild(textNode("div", "b8-allrow-path", rec.path));
    b.appendChild(body);
    var t = tag(rec.typeLabel || IX.kindLabel(rec.kind), rec.changed ? "changed" : null);
    b.appendChild(t);
    return b;
  }

  function facetGroup(title, counts, selected, key) {
    var g = el("div", "b8-facet");
    g.appendChild(textNode("div", "b8-facet-head", title));
    (counts || []).slice(0, 12).forEach(function (entry) {
      var b = button("b8-facet-item", null, key ? function () {
        var list = ui.facets[key];
        var at = list.indexOf(entry.id);
        if (at >= 0) list.splice(at, 1); else list.push(entry.id);
        render();
      } : null);
      b.appendChild(textNode("span", null, entry.label));
      b.appendChild(textNode("span", "b8-facet-n", String(entry.count)));
      if (key) b.setAttribute("aria-pressed", selected.indexOf(entry.id) >= 0 ? "true" : "false");
      else b.setAttribute("aria-disabled", "true");
      g.appendChild(b);
    });
    return g;
  }

  /* ------------------------------------------------------------------- copy */

  var COPY_STEPS = [
    { id: "source", label: "Choose the Project" },
    { id: "categories", label: "Choose what to copy" },
    { id: "preview", label: "See what would change" },
    { id: "apply", label: "Apply and keep a receipt" }
  ];

  function copyStepIndex(id) {
    for (var i = 0; i < COPY_STEPS.length; i++) if (COPY_STEPS[i].id === id) return i;
    return 0;
  }

  function renderCopy(wrap, route) {
    var c = ui.copy;
    var step = route.step || c.stepId || "source";
    if (!copyStepAllowed(step, c)) step = "source";
    c.stepId = step;

    var head = el("header", "b8-head");
    head.appendChild(textNode("h2", "b8-title-sm", "Copy settings from another Project"));
    head.appendChild(textNode("p", "b8-purpose", CP.independence));
    wrap.appendChild(head);

    var strip = el("ol", "b8-steps");
    COPY_STEPS.forEach(function (s, i) {
      var li = el("li", "b8-steps-item");
      if (s.id === step) li.setAttribute("aria-current", "step");
      if (i < copyStepIndex(step)) li.setAttribute("data-done", "true");
      li.appendChild(textNode("span", "b8-step-n", String(i + 1)));
      li.appendChild(textNode("span", null, s.label));
      strip.appendChild(li);
    });
    wrap.appendChild(strip);

    if (step === "source") copySource(wrap);
    else if (step === "categories") copyCategories(wrap);
    else if (step === "preview") copyPreview(wrap);
    else copyApply(wrap);
  }

  function copyStepAllowed(step, c) {
    if (step === "categories") return !!c.source;
    if (step === "preview") return !!c.source;
    if (step === "apply") return !!c.preview || !!c.receipt || !!c.run;
    return true;
  }

  function goCopy(step) {
    ui.copy.stepId = step;
    RT.go({ kind: "copy", step: step });
  }

  function copySource(wrap) {
    var box = el("section", "b8-panel");
    var head = el("div", "b8-panel-head");
    head.innerHTML = icon("folder", 17);
    head.appendChild(textNode("h3", "b8-panel-title", "Which Project should the values come from?"));
    box.appendChild(head);
    box.appendChild(textNode("p", "b8-panel-summary",
      "Nothing is read from the source until you press Continue, and nothing is written until you confirm the preview."));

    CP.sources().forEach(function (src) {
      var row = button("b8-rosterrow", null, function () {
        ui.copy.source = src.id;
        ui.copy.preview = null;
        ui.copy.run = null;
        ui.copy.receipt = null;
        goCopy("categories");
      });
      if (ui.copy.source === src.id) { row.classList.add("is-selected"); row.setAttribute("aria-selected", "true"); }
      var body = el("div", "b8-dest-body");
      body.appendChild(textNode("div", "b8-dest-title", src.name));
      body.appendChild(textNode("p", "b8-dest-purpose", src.updated + " · " + src.note));
      row.appendChild(body);
      var fig = el("div", "b8-dest-figure");
      fig.appendChild(textNode("div", "b8-dest-figure-value", String(src.settings)));
      fig.appendChild(textNode("div", "b8-dest-figure-label", "settings"));
      row.appendChild(fig);
      box.appendChild(row);
    });
    wrap.appendChild(box);
  }

  function copyCategories(wrap) {
    var c = ui.copy;
    var cats = CP.categories();
    if (!c.domains) c.domains = cats.map(function (d) { return d.id; });

    var box = el("section", "b8-panel");
    var head = el("div", "b8-panel-head");
    head.innerHTML = icon("list", 17);
    head.appendChild(textNode("h3", "b8-panel-title", "Which areas should be copied?"));
    head.appendChild(button("b8-btn is-quiet",
      c.domains.length === cats.length ? "Clear all" : "Select all", function () {
        c.domains = c.domains.length === cats.length ? [] : cats.map(function (d) { return d.id; });
        c.preview = null;
        render();
      }));
    box.appendChild(head);

    cats.forEach(function (cat) {
      var chosen = c.domains.indexOf(cat.id) >= 0;
      var row = button("b8-rosterrow", null, function () {
        var at = c.domains.indexOf(cat.id);
        if (at >= 0) c.domains.splice(at, 1); else c.domains.push(cat.id);
        c.preview = null;
        render();
      });
      row.setAttribute("aria-pressed", chosen ? "true" : "false");
      var mark = el("span", "b8-check");
      mark.innerHTML = chosen ? icon("check", 15) : "";
      row.appendChild(mark);
      var body = el("div", "b8-dest-body");
      body.appendChild(textNode("div", "b8-dest-title", cat.title));
      body.appendChild(textNode("p", "b8-dest-purpose", cat.purpose));
      row.appendChild(body);
      var fig = el("div", "b8-dest-figure");
      fig.appendChild(textNode("div", "b8-dest-figure-value", String(cat.count)));
      fig.appendChild(textNode("div", "b8-dest-figure-label", "settings"));
      row.appendChild(fig);
      box.appendChild(row);
    });
    wrap.appendChild(box);

    var acts = el("div", "b8-quick-strip");
    acts.appendChild(button("b8-btn", "Back", function () { goCopy("source"); }));
    var next = button("b8-btn is-primary", "Preview what would change", function () {
      c.preview = CP.preview(c.source, c.domains);
      goCopy("preview");
    });
    if (!c.domains.length) next.setAttribute("disabled", "disabled");
    acts.appendChild(next);
    wrap.appendChild(acts);
  }

  function copyPreview(wrap) {
    var c = ui.copy;
    if (!c.preview) c.preview = CP.preview(c.source, c.domains || null);
    var p = c.preview;
    if (!p) { wrap.appendChild(textNode("p", "b8-empty", "That source Project is no longer available.")); return; }

    wrap.appendChild(statCards([
      { label: "Added", value: String(p.counts.additions), note: "Values this Project has never set" },
      { label: "Replaced", value: String(p.counts.replacements), note: "Values that differ from the source" },
      { label: "Unchanged", value: String(p.counts.unchanged), note: "Already the same" },
      { label: "Excluded — policy", value: String(p.counts.conflicts), note: "A policy controls these here" },
      { label: "Excluded — host", value: String(p.counts.unavailable), note: "This host cannot provide them" },
      { label: "References re-pointed", value: String(p.counts.references), note: "Account references, never secrets" }
    ]));

    var policy = el("div", "b8-notice");
    policy.setAttribute("data-tone", "info");
    policy.innerHTML = '<span class="b8-notice-icon">' + icon("lock", 20) + "</span>";
    var pbody = el("div", "b8-notice-body");
    pbody.appendChild(textNode("div", "b8-notice-head", "What happens to credentials"));
    pbody.appendChild(textNode("p", "b8-notice-detail", CP.secretPolicy()));
    policy.appendChild(pbody);
    wrap.appendChild(policy);

    if (ST.is("import-conflict")) {
      wrap.appendChild(textNode("p", "b8-row-error",
        "The source disagrees with values this Project already has. Every disagreement is itemised below and " +
        "nothing is written until you confirm."));
    }

    var box = el("section", "b8-panel");
    var head = el("div", "b8-panel-head");
    head.innerHTML = icon("columns", 17);
    head.appendChild(textNode("h3", "b8-panel-title", "Item by item"));
    head.appendChild(textNode("span", "b8-panel-count", plural(p.willChange, "change")));
    box.appendChild(head);

    var changing = p.items.filter(function (i) {
      return i.outcome === "addition" || i.outcome === "replacement" || i.outcome === "reference" ||
        i.outcome === "conflict" || i.outcome === "unavailable";
    });
    var list = el("div", "b8-catlist b8-scroll");
    list.b8Diff = changing;
    on(list, "scroll", function () { paintDiff(list); });
    box.appendChild(list);
    wrap.appendChild(box);
    paintDiff(list);

    var excluded = el("div", "b8-details");
    excluded.appendChild(textNode("div", "b8-section-title", "What is deliberately not copied"));
    p.excluded.forEach(function (ex) {
      var d = el("div", "b8-detail");
      d.appendChild(textNode("span", "b8-detail-k", ex.label));
      var v = el("span", "b8-detail-v");
      v.textContent = String(ex.count);
      if (ex.note) v.appendChild(textNode("div", "b8-note", ex.note));
      d.appendChild(v);
      excluded.appendChild(d);
    });
    wrap.appendChild(excluded);

    var acts = el("div", "b8-quick-strip");
    acts.appendChild(button("b8-btn", "Back", function () { goCopy("categories"); }));
    acts.appendChild(button("b8-btn is-primary",
      "Take a restore point and apply " + plural(p.willChange, "change"), function () {
        ui.copy.run = CP.apply(p);
        ui.copy.phase = "Ready";
        ui.copy.receipt = null;
        goCopy("apply");
      }));
    wrap.appendChild(acts);
  }

  function paintDiff(list) {
    var rows = list.b8Diff || [];
    var rowHeight = 62;
    var viewport = list.clientHeight || 420;
    var win = window.PMVirtual.windowFor({
      total: rows.length, rowHeight: rowHeight, viewport: viewport,
      scrollTop: list.scrollTop, overscan: 4, firstPage: 14
    });
    clear(list);
    var before = el("div", "b8-spacer");
    before.style.height = win.before + "px";
    list.appendChild(before);
    for (var i = win.start; i < win.end; i++) {
      var item = rows[i];
      if (!item) continue;
      var row = el("div", "b8-diffrow");
      var body = el("div", "b8-dest-body");
      var line = el("div", "b8-row-title");
      line.appendChild(textNode("span", "b8-dest-title", item.label));
      line.appendChild(tag(diffWord(item.outcome), diffTone(item.outcome)));
      body.appendChild(line);
      body.appendChild(textNode("p", "b8-allrow-path", item.path));
      if (item.reason) body.appendChild(textNode("p", "b8-note", item.reason));
      else body.appendChild(textNode("p", "b8-note", format(item.current) + "  →  " + format(item.incoming)));
      row.appendChild(body);
      list.appendChild(row);
    }
    var after = el("div", "b8-spacer");
    after.style.height = win.after + "px";
    list.appendChild(after);
    if (!rows.length) list.appendChild(textNode("p", "b8-empty", "Nothing would change. The two Projects already agree."));
  }

  function diffWord(outcome) {
    if (outcome === "addition") return "Added";
    if (outcome === "replacement") return "Replaced";
    if (outcome === "reference") return "Reference re-pointed";
    if (outcome === "conflict") return "Excluded — policy";
    if (outcome === "unavailable") return "Excluded — host";
    return "Unchanged";
  }

  function diffTone(outcome) {
    if (outcome === "conflict") return "managed";
    if (outcome === "unavailable") return "unavailable";
    if (outcome === "reference") return "setup";
    return "changed";
  }

  function copyApply(wrap) {
    var c = ui.copy;
    var receipt = c.receipt || (store.get().receipts || [])[0] || null;

    var box = el("section", "b8-panel");
    var head = el("div", "b8-panel-head");
    head.innerHTML = icon("play", 17);
    head.appendChild(textNode("h3", "b8-panel-title", "Applying the copy"));
    box.appendChild(head);

    var phases = el("div", "b8-details");
    var steps = (c.run && c.run.steps) || ["Taking a restore point", "Applying the values", "Verifying the destination"];
    steps.forEach(function (phase, i) {
      var d = el("div", "b8-detail");
      d.appendChild(textNode("span", "b8-detail-k", "Step " + (i + 1)));
      var v = el("span", "b8-detail-v");
      v.textContent = phase;
      d.appendChild(v);
      phases.appendChild(d);
    });
    box.appendChild(phases);

    if (c.phase) box.appendChild(textNode("p", "b8-meta", "Now: " + c.phase));

    var acts = el("div", "b8-detail-acts");
    if (c.run && !c.receipt) {
      acts.appendChild(button("b8-btn is-primary", "Run the next step", function () {
        var out = c.run.next();
        c.phase = out.phase || (out.done ? "Finished" : c.phase);
        if (out.done && out.receipt) c.receipt = out.receipt;
        render();
      }));
      acts.appendChild(button("b8-btn", "Run it all", function () {
        var out = c.run.run();
        c.phase = "Finished";
        if (out.receipt) c.receipt = out.receipt;
        render();
      }));
      acts.appendChild(button("b8-btn is-quiet", "Cancel", function () {
        c.run.cancel();
        c.run = null;
        c.phase = null;
        goCopy("preview");
      }));
    } else if (!c.run) {
      acts.appendChild(button("b8-btn", "Back to the preview", function () { goCopy("preview"); }));
    }
    box.appendChild(acts);
    wrap.appendChild(box);

    if (receipt) wrap.appendChild(receiptBlock(receipt));

    var history = (store.get().receipts || []).filter(function (r) { return !receipt || r.id !== receipt.id; });
    if (history.length) {
      var hist = el("section", "b8-panel");
      var hhead = el("div", "b8-panel-head");
      hhead.innerHTML = icon("history", 17);
      hhead.appendChild(textNode("h3", "b8-panel-title", "Earlier copies"));
      hist.appendChild(hhead);
      history.forEach(function (r) { hist.appendChild(receiptRow(r)); });
      wrap.appendChild(hist);
    }
  }

  function receiptBlock(receipt) {
    var box = el("section", "b8-panel");
    var head = el("div", "b8-panel-head");
    head.innerHTML = icon(receipt.outcome === "applied" ? "checkCircle" : "undo", 17);
    head.appendChild(textNode("h3", "b8-panel-title", "Receipt"));
    head.appendChild(tag(receipt.outcome === "applied" ? "Applied"
      : (receipt.outcome === "rolled_back" ? "Rolled back" : "Undone"),
      receipt.outcome === "applied" ? "ok" : "setup"));
    box.appendChild(head);
    box.appendChild(receiptRow(receipt));

    if (receipt.canRollback) {
      var acts = el("div", "b8-detail-acts b8-section-acts");
      acts.appendChild(button("b8-btn is-primary", "Roll this copy back", function () {
        var next = CP.rollback(receipt.id);
        ui.copy.receipt = next || ui.copy.receipt;
        ui.copy.phase = "Rolled back";
        render();
        shell.announce("The copy was rolled back. This Project is exactly as it was.");
      }));
      box.appendChild(acts);
    }
    return box;
  }

  function receiptRow(receipt) {
    var row = el("div", "b8-itemrow");
    var body = el("div", "b8-dest-body");
    body.appendChild(textNode("div", "b8-dest-title",
      "From " + receipt.source.name + " · " + receipt.at));
    var fields = el("div", "b8-details");
    function line(k, v) {
      if (!v && v !== 0) return;
      var d = el("div", "b8-detail");
      d.appendChild(textNode("span", "b8-detail-k", k));
      d.appendChild(textNode("span", "b8-detail-v", String(v)));
      fields.appendChild(d);
    }
    line("Outcome", receipt.outcome === "applied" ? "Applied" : "Rolled back");
    line("Values written", receipt.applied);
    line("Restore point", receipt.restorePoint ? receipt.restorePoint.label + " · " + receipt.restorePoint.takenAt : "");
    line("Note", receipt.note);
    line("What this changed", "Only this Project. The two Projects are unrelated from here on.");
    body.appendChild(fields);
    row.appendChild(body);
    return row;
  }


  /* --------------------------------------------------------------- arrivals */

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

    var previous = stageInner.querySelectorAll("[data-pm-locator]");
    for (var i = 0; i < previous.length; i++) previous[i].removeAttribute("data-pm-locator");
    node.setAttribute("data-pm-locator", "1");
    /* A jump asked for this group: hold the on-page index on it until the reader
     * scrolls, rather than letting the measurement name a neighbour. */
    if (window.PM2Spy && window.PM2Spy.pinNode) window.PM2Spy.pinNode(node);

    if (pending && pending.result) {
      var via = el("div", "b8-foundvia");
      via.innerHTML = icon("search", 13);
      via.appendChild(textNode("span", null,
        "Found from your search for “" + (pending.query || ui.query) + "”"));
      if (node.parentNode) node.parentNode.insertBefore(via, node);
    }

    /* Instant and container-scoped. A smooth scroll would animate from the top of
     * a page the reader never saw, and scrollIntoView would move the window out
     * from under the shell. */
    var box = node.getBoundingClientRect();
    var stageBox = stageEl.getBoundingClientRect();
    var offset = Math.max(20, Math.min(200, stageBox.height * 0.22));
    var delta = box.top - stageBox.top - offset;
    if (Math.abs(delta) > 4) stageEl.scrollTop += delta;

    var focusTarget = node.querySelector("[data-pm-control]") || node;
    if (focusTarget.focus) focusTarget.focus({ preventScroll: true });

    shell.announce("Opened " + (node.textContent || "").replace(/\s+/g, " ").replace(/^\s+/, "").slice(0, 90));
  }

  /* -------------------------------------------------------------- keyboard */

  /* Escape closes the innermost thing and stops at Settings Home. It never closes
   * Settings: a reader pressing Escape twice should not lose the whole page. */
  function onKeydown(e) {
    if (e.key !== "Escape") return;
    if (ui.dropOpen) { ui.dropOpen = false; render(); e.stopPropagation(); return; }
    if (narrow && ui.railOpen) { ui.railOpen = false; render(); e.stopPropagation(); return; }
    var open = Object.keys(ui.openDetails).filter(function (k) { return ui.openDetails[k]; });
    if (open.length) { ui.openDetails = {}; render(); e.stopPropagation(); return; }
    var route = RT.current();
    if (route.kind === "home") return;
    RT.go(backTarget(route).dest);
    e.stopPropagation();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
