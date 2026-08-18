/* Opus 5 — Editorial (Directory · Take 2)
 *
 * Settings reads like a well-set page.
 *
 * Four decisions produce everything below, and every other choice follows from
 * them rather than being decided again locally:
 *
 * 1. ONE COLUMN OF ROWS. Destinations are read down, not compared across. There is
 *    no card grid anywhere, at any width, on any surface — that is the neighbouring
 *    concept's answer, and mixing the two would leave both illegible.
 *
 * 2. THE RAIL IS STABLE. It is built once at boot and never rebuilt: the only thing
 *    that changes as the reader goes eight levels deep is which item is current.
 *    A navigation surface that reshuffles under you is why people lose their place.
 *
 * 3. DEPTH NESTS INSIDE THE SHEET. Going deeper adds a second-level list *inside*
 *    the content sheet (page sections, manager tabs, All Settings facets, copy
 *    steps), never a second rail and never a new window. One sheet, all the way in.
 *
 * 4. THE INDEX IS THE ROUTING AUTHORITY. Every roster row a manager draws is keyed
 *    by the object id PM2Index publishes, so a search result can never name a place
 *    this concept cannot show. Manager specs enrich those rows; they never define
 *    where a link lands.
 *
 * Laziness is structural: PM2Managers.spec() is called from exactly one function,
 * openManager's renderer, so loading the page and typing in the search field cannot
 * instantiate a manager even by accident.
 */
(function () {
  "use strict";

  var M = window.PM2Model;
  var IX = window.PM2Index;
  var RT = window.PM2Route;
  var FX = window.PM2States;
  var MGR = window.PM2Managers;
  var COPY = window.PM2Copy;
  var VIRT = window.PMVirtual;
  var ICON = window.PMIcons.icon;
  var STATUS_ICON = window.PMIcons.statusIcon;
  var E = window.PMShell.escapeHtml;

  var CONCEPT_ID = "concept-06-directory-take-2";

  var store = window.PM2Store.create(CONCEPT_ID);
  COPY.attach(store);

  /* ------------------------------------------------------------- tiny tools */

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function btn(cls, html) {
    var b = el("button", cls, html);
    b.type = "button";
    return b;
  }

  function text(tag, cls, str) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    n.textContent = str == null ? "" : String(str);
    return n;
  }

  function on(node, evt, fn) { node.addEventListener(evt, fn); return node; }

  /* Attribute selectors take any character between quotes; only the quote and the
   * backslash have to be escaped, and inventory ids contain neither. Escaping them
   * anyway keeps a future id from silently breaking every deep link. */
  function attrSel(name, value) {
    return "[" + name + '="' + String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"]';
  }

  function humanise(id) {
    return String(id || "")
      .replace(/[-_.]+/g, " ")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/\s+/g, " ")
      .replace(/^\s+|\s+$/g, "")
      .replace(/^./, function (c) { return c.toUpperCase(); });
  }

  function plural(n, one, many) { return n === 1 ? one : (many || one + "s"); }

  function clamp(s, n) {
    var str = String(s == null ? "" : s);
    return str.length > n ? str.slice(0, n - 1) + "…" : str;
  }

  function valueWords(v) {
    if (v == null || v === "") return "Not set";
    if (v === true) return "On";
    if (v === false) return "Off";
    if (Array.isArray(v)) return v.length ? v.map(humanise).join(", ") : "Nothing selected";
    if (typeof v === "object") {
      var keys = Object.keys(v);
      return keys.length ? keys.length + " " + plural(keys.length, "entry", "entries") : "Nothing set";
    }
    if (typeof v === "string" && /^[a-z0-9]+([-_][a-z0-9]+)+$/.test(v)) return humanise(v);
    return String(v);
  }

  function chip(tone, words, iconName) {
    var c = el("span", "ed-chip");
    c.setAttribute("data-tone", tone || "quiet");
    c.innerHTML = ICON(iconName || STATUS_ICON(tone) || "dot", 12);
    c.appendChild(text("span", null, words));
    return c;
  }

  function announce(msg) { if (shell) shell.announce(msg); }

  /* ----------------------------------------------------------- session state */

  /* Semantic state, never read back out of the DOM — that is what makes this
   * portable to a property-graph toolkit with no DOM to interrogate. */
  var ui = {
    width: "normal",
    dir: "forward",
    route: RT.empty(),
    notice: null,
    query: "",
    results: null,
    dropOpen: false,
    active: -1,
    exposure: store.get().exposure || "standard",
    raised: false,
    mgrObject: {},
    mgrTab: {},
    mgrPane: {},
    mgrFilter: {},
    all: { domains: [], kinds: [], exposures: [], states: [], changed: false, attention: false, text: "" },
    allScroll: 0,
    copy: { sourceId: null, domainIds: null, preview: null, runner: null, log: [], receipt: null },
    drafts: {},
    invalid: {},
    detailOpen: {}
  };

  var shell = null;
  var root = null;
  var railEl = null;
  var crumbEl = null;
  var backEl = null;
  var scrollEl = null;
  var searchInput = null;
  var dropEl = null;
  var fixtureSel = null;

  /* =========================================================== the PM shell */

  shell = window.PMShell.mount({
    rootId: "pm-root",
    concept: "Editorial · Settings reads like a well-set page",
    conceptId: CONCEPT_ID,
    theme: "friendly-dark",
    defaultTheme: "friendly-dark",
    widthChoice: 1280,
    railOpen: true,
    panelOpen: false,
    reducedMotion: false,
    onLayout: function () { measure(); },
    onWidthMode: function () { measure(); }
  });

  /* ============================================================ the chrome */

  /* Built once. Rebuilding navigation on every route is how a reader's sense of
   * place gets thrown away; here only the current marker and the crumb move. */
  function buildChrome() {
    root = el("div", "ed");
    root.setAttribute("data-pm-surface", "home");
    root.setAttribute("data-ed-width", "normal");
    root.setAttribute("data-ed-dir", "forward");

    var body = el("div", "ed-body");

    /* ---------------------------------------------------------------- rail */
    railEl = el("nav", "ed-rail");
    railEl.setAttribute("aria-label", "Settings sections");

    var head = el("div", "ed-rail-head", ICON("sliders", 18));
    head.appendChild(text("span", "ed-rail-head-text", "Settings"));
    railEl.appendChild(head);

    railEl.appendChild(navItem({ id: "home", icon: "list", label: "Home", route: { kind: "home" } }));

    railEl.appendChild(text("div", "ed-rail-label", "Areas"));
    M.domains.forEach(function (d) {
      railEl.appendChild(navItem({
        id: "d:" + d.id, icon: d.icon, label: d.title, count: d.count,
        route: { kind: "domain", domainId: d.id }, domainId: d.id
      }));
    });

    railEl.appendChild(el("div", "ed-rail-rule"));
    railEl.appendChild(navItem({ id: "all", icon: "table", label: "All settings", count: M.counts.settings, route: { kind: "all" } }));
    railEl.appendChild(navItem({ id: "copy", icon: "columns", label: "Copy from a Project", route: { kind: "copy" } }));

    railEl.appendChild(el("div", "ed-rail-spacer"));
    railEl.appendChild(text("div", "ed-rail-note",
      M.counts.pages + " pages · " + M.counts.sections + " groups · " + M.counts.settings + " settings in this Project."));

    /* -------------------------------------------------------------- column */
    var col = el("div", "ed-col");

    var top = el("div", "ed-top");
    var line = el("div", "ed-top-line");

    var project = el("div", "ed-project");
    project.setAttribute("data-pm-project", "1");
    project.appendChild(text("span", "ed-project-name", M.project.name));
    project.appendChild(text("span", "ed-project-kind", M.project.kind));
    line.appendChild(project);
    line.appendChild(el("div", "ed-top-spacer"));

    /* The reviewer's own control. The shell ships one wired to the older
     * concepts' fixtures, so this concept builds its own over PM2States and keeps
     * the choice in the route, where a deep link can reproduce the exact screen. */
    var demo = el("div", "ed-demo");
    var demoId = "ed-fixture-select";
    var lab = text("label", "ed-demo-label", "Situation");
    lab.setAttribute("for", demoId);
    demo.appendChild(lab);
    fixtureSel = el("select", "ed-select ed-btn-small");
    fixtureSel.id = demoId;
    fixtureSel.setAttribute("data-pm-state-control", "1");
    FX.grouped().forEach(function (group) {
      var g = document.createElement("optgroup");
      g.label = group.group;
      group.items.forEach(function (f) {
        var o = document.createElement("option");
        o.value = f.id;
        o.textContent = f.label;
        o.title = f.note;
        g.appendChild(o);
      });
      fixtureSel.appendChild(g);
    });
    on(fixtureSel, "change", function () {
      var id = fixtureSel.value;
      store.set({ stateFixture: id });
      ui.dir = "forward";
      RT.go(RT.withState(RT.current(), id === "normal" ? null : id));
      announce("Situation: " + (FX.get(id) || {}).label + ".");
    });
    demo.appendChild(fixtureSel);

    var resetBtn = btn("ed-btn ed-btn-small", ICON("undo", 12));
    resetBtn.appendChild(text("span", null, "Reset"));
    resetBtn.title = "Clear everything this concept has saved for this Project";
    on(resetBtn, "click", function () {
      store.reset();
      ui.drafts = {};
      ui.invalid = {};
      ui.copy = { sourceId: null, domainIds: null, preview: null, runner: null, log: [], receipt: null };
      ui.exposure = "standard";
      render();
      announce("Saved changes for this concept were cleared.");
    });
    demo.appendChild(resetBtn);
    line.appendChild(demo);

    var closeBtn = btn("ed-btn ed-btn-small", ICON("arrowUpRight", 12));
    closeBtn.setAttribute("data-pm-close", "1");
    closeBtn.appendChild(text("span", null, "Close Settings"));
    on(closeBtn, "click", function () {
      /* Nothing on a standalone page can really return to the surface that opened
       * Settings, so the receipt names the call that would, rather than pretending. */
      if (window.PMSim) {
        window.PMSim.run({
          id: "settings.close",
          label: "Close Settings",
          realCall: "SettingsHost.close(returnTo)",
          detail: "Would close Settings and return to the surface that opened it, keeping this Project open."
        });
      }
      go({ kind: "home" });
      announce("Settings would close and return to the surface that opened it.");
    });
    line.appendChild(closeBtn);
    top.appendChild(line);

    /* ------------------------------------------------- the universal search */
    var search = el("div", "ed-search");
    var box = el("div", "ed-search-box", ICON("search", 18));
    searchInput = el("input", "ed-search-input");
    searchInput.type = "text";
    searchInput.setAttribute("data-pm-search-field", "1");
    searchInput.setAttribute("placeholder", "Search settings, managers, accounts, models and actions");
    searchInput.setAttribute("aria-label", "Search all Settings");
    searchInput.setAttribute("autocomplete", "off");
    searchInput.setAttribute("spellcheck", "false");
    on(searchInput, "input", function () { runQuery(searchInput.value); });
    on(searchInput, "keydown", onSearchKey);
    on(searchInput, "focus", function () { if (ui.query && ui.results) openDrop(); });
    box.appendChild(searchInput);
    var clear = btn("ed-search-clear", ICON("minus", 14));
    clear.title = "Clear the search";
    clear.setAttribute("aria-label", "Clear the search");
    on(clear, "click", function () {
      searchInput.value = "";
      runQuery("");
      searchInput.focus();
    });
    box.appendChild(clear);
    search.appendChild(box);
    top.appendChild(search);
    col.appendChild(top);

    /* --------------------------------------------------------- crumb strip */
    crumbEl = el("div", "ed-crumbs");
    backEl = btn("ed-back", ICON("chevronLeft", 14));
    backEl.setAttribute("data-pm-back", "1");
    backEl.appendChild(text("span", "ed-back-text", "Back"));
    on(backEl, "click", function () { goUp(); });
    crumbEl.appendChild(backEl);
    var crumbList = el("div", "ed-crumb-list");
    crumbList.setAttribute("data-pm-breadcrumb", "1");
    crumbEl.appendChild(crumbList);
    col.appendChild(crumbEl);

    scrollEl = el("div", "ed-scroll");
    col.appendChild(scrollEl);

    body.appendChild(railEl);
    body.appendChild(col);
    root.appendChild(body);

    /* The dropdown is a child of the field's own wrapper, so it is anchored to the
     * field by layout rather than by a measured offset that drifts on resize. */
    dropEl = el("div", "ed-drop");
    dropEl.setAttribute("data-pm-search-dropdown", "1");
    dropEl.setAttribute("role", "listbox");
    dropEl.setAttribute("aria-label", "Search results");
    dropEl.hidden = true;
    search.appendChild(dropEl);

    shell.main.appendChild(root);
  }

  function navItem(spec) {
    var b = btn("ed-nav-item", ICON(spec.icon, 15));
    b.appendChild(text("span", "ed-nav-text", spec.label));
    if (spec.count != null) b.appendChild(text("span", "ed-nav-count", String(spec.count)));
    b.setAttribute("data-ed-nav", spec.id);
    if (spec.domainId) b.setAttribute("data-pm-domain", spec.domainId);
    b.title = spec.label;
    on(b, "click", function () { go(spec.route); });
    return b;
  }

  /* ================================================================ routing */

  function currentState() { return RT.state(); }

  function go(dest, backwards) {
    ui.dir = backwards ? "back" : "forward";
    RT.go(RT.withState(dest, currentState()));
  }

  function replace(dest) {
    RT.replace(RT.withState(dest, currentState()));
  }

  /* One level out, named. Not history.back(): the reader may have arrived from a
   * deep link, and "one level out" has to mean the same thing either way. */
  function parentOf(r) {
    if (!r) return { kind: "home" };
    if (r.kind === "domain") {
      if (r.settingId || r.sectionId) return { kind: "domain", domainId: r.domainId, pageId: r.pageId };
      if (r.pageId) return { kind: "domain", domainId: r.domainId };
      return { kind: "home" };
    }
    if (r.kind === "manager") {
      if (r.objectId) return { kind: "manager", managerId: r.managerId };
      var fam = M.familyOf(r.managerId);
      if (fam && fam.domainId) return { kind: "domain", domainId: fam.domainId };
      return { kind: "home" };
    }
    return { kind: "home" };
  }

  function parentLabel(r) {
    var p = parentOf(r);
    if (p.kind === "home") return "Settings home";
    if (p.kind === "domain" && p.pageId) {
      var page = M.page(p.pageId);
      return page ? page.title : "this page";
    }
    if (p.kind === "domain") {
      var d = M.domain(p.domainId);
      return d ? d.title : "this area";
    }
    if (p.kind === "manager") {
      var rec = M.managerRecord(p.managerId);
      return rec ? rec.title : "this manager";
    }
    return "Settings home";
  }

  function goUp() {
    var r = ui.route;
    if (ui.notice) { go({ kind: "home" }, true); return; }
    if (r.kind === "home") return;
    /* Narrow pushes the roster and the detail apart into two pages, so the first
     * step out of a detail is back to the roster, not out of the manager. */
    if (ui.width === "narrow" && r.kind === "manager" && ui.mgrPane[r.managerId] === "detail") {
      ui.mgrPane[r.managerId] = "roster";
      render();
      return;
    }
    go(parentOf(r), true);
  }

  function surfaceKindOf(r) {
    if (ui.notice) return "notice";
    if (!r) return "home";
    if (r.kind === "query") return "search";
    if (r.kind === "domain") return r.pageId ? "page" : "domain";
    if (r.kind === "manager") return "manager";
    if (r.kind === "all") return "all";
    if (r.kind === "copy") return "copy";
    return "home";
  }

  function applyRoute(route) {
    var res = RT.resolve(route);
    ui.notice = res.ok ? null : res;
    ui.route = route;
    store.set({ route: RT.href(route), stateFixture: FX.active() });
    if (fixtureSel) fixtureSel.value = FX.active();
    syncSearchToRoute(route);
    render();
  }

  /* ================================================================= search */

  function runQuery(value) {
    ui.query = value == null ? "" : String(value);
    if (!ui.query.replace(/^\s+|\s+$/g, "")) {
      ui.results = null;
      ui.active = -1;
      closeDrop();
      return;
    }
    /* Bounded on purpose: a dropdown is a shortlist, and the honest answer to
     * "there are more" is a sentence, not four hundred rows. */
    ui.results = IX.query(ui.query, { limit: 40, perGroup: 8 });
    ui.active = -1;
    renderDrop();
    openDrop();
  }

  function flatResults() {
    var out = [];
    if (!ui.results) return out;
    ui.results.groups.forEach(function (g) {
      g.results.forEach(function (r) { out.push(r); });
    });
    return out;
  }

  function renderDrop() {
    dropEl.innerHTML = "";
    var res = ui.results;
    if (!res) return;

    if (!res.total) {
      var empty = el("div", "ed-drop-empty");
      empty.appendChild(text("div", "ed-strong", "Nothing in Settings matches that."));
      empty.appendChild(text("div", null,
        "Every setting stays findable, including the ones a policy controls and the ones this host cannot offer, so a blank answer means the words are wrong rather than the setting being hidden."));
      var alt = el("div", "ed-notice-acts");
      var allBtn = btn("ed-btn ed-btn-small", "");
      allBtn.appendChild(text("span", null, "Browse all " + M.counts.settings + " settings"));
      on(allBtn, "click", function () { closeDrop(); go({ kind: "all" }); });
      alt.appendChild(allBtn);
      empty.appendChild(alt);
      dropEl.appendChild(empty);
      return;
    }

    var idx = 0;
    res.groups.forEach(function (group) {
      dropEl.appendChild(text("div", "ed-drop-group-head", group.label + " · " + group.total));
      group.results.forEach(function (rec) {
        var my = idx++;
        var b = btn("ed-result", "");
        b.setAttribute("data-pm-result", rec.id);
        b.setAttribute("role", "option");
        b.setAttribute("aria-selected", "false");
        var line = el("div", "ed-result-line");
        line.appendChild(text("span", "ed-result-label", rec.label));
        line.appendChild(text("span", "ed-result-type", rec.typeLabel));
        b.appendChild(line);
        b.appendChild(text("div", "ed-result-path", rec.path || "Settings"));
        if (rec.availability) b.appendChild(text("div", "ed-result-avail", clamp(rec.availability, 120)));
        on(b, "click", function () { chooseResult(rec.id); });
        on(b, "mouseenter", function () { setActive(my); });
        dropEl.appendChild(b);
      });
    });

    if (res.truncated || res.total > res.shown) {
      dropEl.appendChild(text("div", "ed-drop-foot",
        "Showing " + res.shown + " of " + res.total + ". Open All settings to work through the rest with filters."));
    }
  }

  function openDrop() {
    if (!ui.results) return;
    dropEl.hidden = false;
    ui.dropOpen = true;
  }

  function closeDrop() {
    dropEl.hidden = true;
    ui.dropOpen = false;
    ui.active = -1;
  }

  function setActive(i) {
    var nodes = dropEl.querySelectorAll("[data-pm-result]");
    ui.active = i;
    for (var n = 0; n < nodes.length; n++) {
      var isOn = n === i;
      nodes[n].classList.toggle("is-active", isOn);
      nodes[n].setAttribute("aria-selected", isOn ? "true" : "false");
      if (isOn && nodes[n].scrollIntoView) nodes[n].scrollIntoView({ block: "nearest" });
    }
  }

  function onSearchKey(e) {
    var list = flatResults();
    if (e.key === "ArrowDown" && list.length) {
      e.preventDefault();
      openDrop();
      setActive(Math.min(list.length - 1, ui.active + 1));
    } else if (e.key === "ArrowUp" && list.length) {
      e.preventDefault();
      setActive(Math.max(0, ui.active - 1));
    } else if (e.key === "Enter") {
      var pick = ui.active >= 0 ? list[ui.active] : list[0];
      if (pick) { e.preventDefault(); chooseResult(pick.id); }
    } else if (e.key === "Escape") {
      if (ui.dropOpen) { e.stopPropagation(); closeDrop(); }
    }
  }

  /* The only way a result becomes a destination. Position in the list, the label
   * and the group are all ignored; the immutable id is asked what it means. */
  function chooseResult(resultId) {
    var rec = IX.byId(resultId);
    if (!rec) return;
    store.set({ search: { query: ui.query, resultId: resultId, open: false } });
    /* Two history steps on purpose: the query route replaces where the reader was
     * standing, then the destination is pushed on top of it. Back therefore lands
     * on the query with the same result still selected. */
    replace({ kind: "query", query: ui.query, resultId: resultId });
    go(rec.destination);
    announce("Opened " + rec.label + " in " + (rec.path || "Settings") + ".");
  }

  function syncSearchToRoute(route) {
    if (route && route.kind === "query" && route.query) {
      if (searchInput.value !== route.query) searchInput.value = route.query;
      ui.query = route.query;
      ui.results = IX.query(route.query, { limit: 40, perGroup: 8 });
      renderDrop();
      openDrop();
      if (route.resultId) {
        var list = flatResults();
        for (var i = 0; i < list.length; i++) {
          if (list[i].id === route.resultId) { setActive(i); break; }
        }
      }
      return;
    }
    /* A fixture can put a query on screen without anyone typing: that is the whole
     * point of the no-results and typo situations being reproducible. */
    var forced = FX.effects().forceQuery;
    if (forced && route && route.kind === "home") {
      searchInput.value = forced;
      ui.query = forced;
      ui.results = IX.query(forced, { limit: 40, perGroup: 8 });
      renderDrop();
      openDrop();
      return;
    }
    searchInput.value = "";
    ui.query = "";
    ui.results = null;
    closeDrop();
  }

  /* ================================================================ measure */

  /* Width is a presentation mode read at explicit checkpoints, exactly like the
   * shell's own. Nothing about what a setting MEANS depends on it. */
  function measure() {
    if (!root) return;
    var w = root.clientWidth;
    if (w < 200) return;
    var mode = w < 820 ? "narrow" : (w < 1060 ? "mid" : (w >= 1500 ? "wide" : "normal"));
    if (mode === ui.width) return;
    ui.width = mode;
    root.setAttribute("data-ed-width", mode);
  }

  /* ================================================================= render */

  function render() {
    var r = ui.route;
    var kind = surfaceKindOf(r);
    root.setAttribute("data-pm-surface", kind);
    root.setAttribute("data-ed-dir", ui.dir);
    if (kind === "manager" && r.managerId) root.setAttribute("data-pm-manager", r.managerId);
    else root.removeAttribute("data-pm-manager");

    updateRail(r, kind);
    updateCrumbs(r, kind);

    var sheet = el("div", "ed-sheet");
    if (kind === "notice") renderAbsent(sheet);
    else if (kind === "manager") renderManagerSurface(sheet, r);
    else if (kind === "page") renderPage(sheet, r);
    else if (kind === "domain") renderDomain(sheet, r);
    else if (kind === "all") renderAll(sheet, r);
    else if (kind === "copy") renderCopy(sheet, r);
    else renderHome(sheet, r);

    scrollEl.innerHTML = "";
    scrollEl.appendChild(sheet);
    scrollEl.scrollTop = 0;
    measure();
    reveal(r);
  }

  function updateRail(r, kind) {
    var current = "home";
    if (kind === "all") current = "all";
    else if (kind === "copy") current = "copy";
    else if (r.domainId) current = "d:" + r.domainId;
    else if (r.kind === "manager") {
      var fam = M.familyOf(r.managerId);
      if (fam && fam.domainId) current = "d:" + fam.domainId;
    }
    var items = railEl.querySelectorAll("[data-ed-nav]");
    for (var i = 0; i < items.length; i++) {
      if (items[i].getAttribute("data-ed-nav") === current) items[i].setAttribute("aria-current", "page");
      else items[i].removeAttribute("aria-current");
    }
  }

  function updateCrumbs(r, kind) {
    var list = crumbEl.querySelector("[data-pm-breadcrumb]");
    list.innerHTML = "";

    var trail = [{ label: "Settings", route: { kind: "home" } }];
    if (kind === "all") trail.push({ label: "All settings", route: null });
    else if (kind === "copy") trail.push({ label: "Copy settings from another Project", route: null });
    else if (kind === "search") trail.push({ label: "Search results", route: null });
    else if (kind === "notice") trail.push({ label: "Link cannot be opened", route: null });
    else if (kind === "manager") {
      var fam = M.familyOf(r.managerId);
      var dom = fam && fam.domainId ? M.domain(fam.domainId) : null;
      if (dom) trail.push({ label: dom.title, route: { kind: "domain", domainId: dom.id } });
      var rec = M.managerRecord(r.managerId);
      trail.push({ label: rec ? rec.title : humanise(r.managerId), route: { kind: "manager", managerId: r.managerId } });
      if (r.objectId) {
        var objRec = objectRecord(r.managerId, r.objectId);
        trail.push({ label: objRec ? objRec.label : humanise(r.objectId), route: null });
      }
    } else if (r.domainId) {
      var d = M.domain(r.domainId);
      if (d) trail.push({ label: d.title, route: { kind: "domain", domainId: d.id } });
      if (r.pageId) {
        var p = M.page(r.pageId);
        if (p) trail.push({ label: p.title, route: { kind: "domain", domainId: r.domainId, pageId: p.id } });
      }
      if (r.sectionId) {
        var s = M.section(r.sectionId);
        if (s) trail.push({ label: s.title, route: null });
      }
    }

    trail.forEach(function (step, i) {
      if (i) {
        var sep = el("span", "ed-crumb-sep", ICON("chevronRight", 11));
        list.appendChild(sep);
      }
      if (step.route && i < trail.length - 1) {
        var b = btn("ed-crumb", "");
        b.appendChild(text("span", null, step.label));
        on(b, "click", function () { go(step.route, true); });
        list.appendChild(b);
      } else {
        list.appendChild(text("span", "ed-crumb is-current", step.label));
      }
    });

    if (kind === "home") {
      backEl.hidden = true;
    } else {
      backEl.hidden = false;
      backEl.querySelector(".ed-back-text").textContent = "Back to " + parentLabel(r);
      backEl.title = "Back to " + parentLabel(r);
    }
  }

  /* ================================================================ reveal */

  /* One calm arrival marker: a marker in the row's left gutter and one slow sweep
   * under its title. It never blinks and it never repeats. */
  function reveal(r) {
    var prev = root.querySelector("[data-pm-locator]");
    if (prev) prev.removeAttribute("data-pm-locator");

    var target = null;
    var focusEl = null;
    var secondary = null;

    if (r.kind === "domain" && r.settingId) {
      target = scrollEl.querySelector(attrSel("data-pm-row", r.settingId));
      if (target) focusEl = target.querySelector("[data-pm-control]") || target;
    } else if (r.kind === "manager" && r.objectId) {
      target = root.querySelector(attrSel("data-pm-object", r.objectId));
      if (r.rowId) secondary = root.querySelector(attrSel("data-ed-rowid", r.rowId));
    }

    if (!target) return;
    target.setAttribute("data-pm-locator", "1");
    if (focusEl && focusEl.focus) focusEl.focus({ preventScroll: true });
    scrollNear(target);
    if (secondary) {
      secondary.classList.add("is-found-row");
      scrollNear(secondary);
      if (secondary.focus) secondary.focus({ preventScroll: true });
    }
  }

  function scrollNear(node) {
    if (!node || !node.scrollIntoView) return;
    node.scrollIntoView({ block: "center", inline: "nearest" });
  }

  /* ========================================================== shared pieces */

  function sheetHead(sheet, opts) {
    var head = el("div", "ed-sheet-head");
    if (opts.eyebrow) head.appendChild(text("div", "ed-eyebrow", opts.eyebrow));
    var h = text("h1", "ed-title", opts.title);
    head.appendChild(h);
    if (opts.lede) head.appendChild(text("p", "ed-lede", opts.lede));
    if (opts.meta && opts.meta.length) {
      var meta = el("div", "ed-meta");
      opts.meta.forEach(function (m) { meta.appendChild(text("span", null, m)); });
      head.appendChild(meta);
    }
    sheet.appendChild(head);
    return head;
  }

  function block(sheet, title, note) {
    var b = el("div", "ed-block");
    var head = el("div", "ed-block-head");
    head.appendChild(text("div", "ed-block-title", title));
    if (note) head.appendChild(text("div", "ed-block-note", note));
    b.appendChild(head);
    sheet.appendChild(b);
    return b;
  }

  /* Every destination on every surface is this one row. That single grammar is
   * what makes the whole product feel like one document. */
  function destRow(parent, opts) {
    var b = btn("ed-dest" + (opts.quiet ? " ed-dest-quiet" : ""), "");
    var icon = el("div", "ed-dest-icon", ICON(opts.icon || "chevronRight", opts.quiet ? 14 : 16));
    b.appendChild(icon);
    var body = el("div", "ed-dest-body");
    body.appendChild(text("div", "ed-dest-title", opts.title));
    if (opts.desc) body.appendChild(text("div", "ed-dest-desc", opts.desc));
    if (opts.flag) {
      var flag = el("div", "ed-dest-flag", ICON(STATUS_ICON(opts.flag.tone) || "dot", 12));
      flag.setAttribute("data-tone", opts.flag.tone);
      flag.appendChild(text("span", null, opts.flag.label));
      body.appendChild(flag);
    }
    b.appendChild(body);
    var tail = el("div", "ed-dest-tail");
    if (opts.count != null) tail.appendChild(text("span", "ed-dest-count", String(opts.count)));
    if (opts.tailChip) tail.appendChild(opts.tailChip);
    tail.innerHTML += ICON("chevronRight", 16);
    b.appendChild(tail);
    if (opts.domainId) b.setAttribute("data-pm-domain", opts.domainId);
    if (opts.pageId) b.setAttribute("data-pm-page", opts.pageId);
    if (opts.managerId) b.setAttribute("data-pm-manager", opts.managerId);
    on(b, "click", opts.onClick);
    parent.appendChild(b);
    return b;
  }

  /* ============================================================ situation note */

  /* What each fixture actually changes in THIS concept. A reviewer handed a link
   * should be able to read what they are looking at without a second document. */
  var SITUATION = {
    "normal": "",
    "loading-cached": "Cached values stay on screen and are marked as refreshing. Nothing is blanked out and no surface is replaced by a spinner.",
    "empty": "Nothing is configured yet. Rosters say what to add first and every value below is still the product default.",
    "no-results": "The search field carries a query that matches nothing, so the dropdown shows the honest empty answer rather than a near miss.",
    "typo-search": "The search field carries a misspelled query. The dropdown still finds the destination and shows the path that proves it is the right one.",
    "validation-error": "A value that cannot be accepted is explained under the row that holds it, and the text the reader typed is kept.",
    "changed-elsewhere": "Values another window changed are marked on the row, with what this Project last read.",
    "restart-required": "Changes that need a restart are stated once at the top rather than on every row.",
    "offline": "There is no network. Cached values stay readable and anything that needs the network says so before it is pressed.",
    "reconnect-required": "One provider session expired. The route to sign in again is one press from here, and nothing changed while it was expired.",
    "usage-unavailable": "A provider is ready but reports no balance. Readiness and measurement are shown as the two separate facts they are.",
    "managed": "Values a policy controls are readable and explained, and their controls are not editable here.",
    "unavailable": "Capabilities this host cannot provide stay findable and say why, instead of disappearing from the list.",
    "multi-install-shadowed": "More than one installation was found for a provider. Installations names the selected one and the shadowed one.",
    "unknown-install-owner": "An installation whose owner cannot be established is manual only: Puppet Master will not adopt, update or repair it.",
    "update-available": "A newer generation is staged for an installation that was already approved. It asks before anything is installed.",
    "import-conflict": "The copy preview itemises every value that disagrees with this Project before anything is applied.",
    "rollback-complete": "A transaction that was rolled back keeps its restore point and its receipt, and the Project is exactly as it was.",
    "verify-failed-rollback": "Verification failed after an apply, so the whole transaction was undone. The receipt says which values did not match."
  };

  function situationNote(sheet) {
    var id = FX.active();
    if (id === "normal") return;
    var f = FX.get(id);
    if (!f) return;
    var box = el("div", "ed-situation");
    box.appendChild(el("div", "ed-situation-icon", ICON("beaker", 15)));
    var body = el("div", null);
    var line = el("div", "ed-situation-note");
    line.appendChild(text("span", "ed-situation-name", f.label + ". "));
    line.appendChild(text("span", null, f.note));
    body.appendChild(line);
    if (SITUATION[id]) body.appendChild(text("div", "ed-situation-effect", SITUATION[id]));
    box.appendChild(body);
    sheet.appendChild(box);
  }

  function criticalNotice(sheet) {
    var n = FX.notice();
    if (!n || store.get().dismissed[n.id]) return;
    var box = el("div", "ed-notice");
    box.setAttribute("data-tone", n.tone === "attention" ? "attention" : "info");
    box.setAttribute("data-pm-notice", n.id);
    box.appendChild(el("div", "ed-notice-icon", ICON(n.tone === "attention" ? "alert" : "info", 16)));
    var body = el("div", null);
    body.appendChild(text("div", "ed-notice-head", n.headline));
    body.appendChild(text("div", "ed-notice-detail", n.detail));
    box.appendChild(body);
    var acts = el("div", "ed-notice-acts");
    if (n.action) {
      var b = btn("ed-btn ed-btn-primary ed-btn-small", "");
      b.appendChild(text("span", null, n.action.label));
      on(b, "click", function () { go(n.action.destination); });
      acts.appendChild(b);
    }
    var dis = btn("ed-btn ed-btn-quiet ed-btn-small", "");
    dis.appendChild(text("span", null, "Dismiss"));
    on(dis, "click", function () { store.dismiss(n.id); render(); });
    acts.appendChild(dis);
    box.appendChild(acts);
    sheet.appendChild(box);
  }

  /* =================================================================== HOME */

  function renderHome(sheet, r) {
    var eff = FX.effects();
    sheetHead(sheet, {
      eyebrow: M.project.name,
      title: "Settings",
      lede: "Everything Puppet Master does for this Project, in one list. Choose an area to read down through its pages, or search for a setting by name.",
      meta: [
        "Revision " + M.project.settingsRevision,
        M.project.opened,
        store.changedCount() + " " + plural(store.changedCount(), "value") + " changed from default"
      ].concat(eff.refreshing ? ["Refreshing in the background — the values shown are the last ones read"] : [])
    });

    situationNote(sheet);
    criticalNotice(sheet);

    /* Needs attention: a short list, never a wall, and each item names the place
     * that can fix it rather than describing it twice. */
    var attention = FX.attention() || [];
    var att = el("div", "ed-att");
    var attHead = el("div", "ed-block-head");
    attHead.appendChild(text("div", "ed-block-title", "Needs attention"));
    attHead.appendChild(text("div", "ed-block-note",
      attention.length ? attention.length + " " + plural(attention.length, "item") : "Nothing right now"));
    att.appendChild(attHead);
    if (!attention.length) {
      att.appendChild(text("div", "ed-empty-line",
        eff.noAttention
          ? "Nothing is configured yet, so nothing is failing. The areas below are where to start."
          : "Nothing in this Project is waiting on you."));
    } else {
      attention.forEach(function (item) {
        var b = btn("ed-att-item", "");
        var ic = el("div", "ed-att-icon", ICON(STATUS_ICON(item.tone) || "dot", 14));
        ic.setAttribute("data-tone", item.tone);
        b.appendChild(ic);
        var body = el("div", null);
        body.appendChild(text("div", "ed-att-label", item.label));
        body.appendChild(text("div", "ed-att-detail", item.detail));
        b.appendChild(body);
        var tail = el("div", "ed-dest-tail");
        tail.appendChild(text("span", "ed-dest-count", item.actionLabel || "Open"));
        tail.innerHTML += ICON("chevronRight", 14);
        b.appendChild(tail);
        on(b, "click", function () { go(item.destination); });
        att.appendChild(b);
      });
    }
    sheet.appendChild(att);

    /* The dominant content: the twelve areas, read down. */
    var areas = block(sheet, "Areas", M.counts.domains + " areas · " + M.counts.settings + " settings");
    var flags = attentionByDomain(attention);
    M.domains.forEach(function (d) {
      destRow(areas, {
        icon: d.icon,
        title: d.title,
        desc: d.purpose,
        count: d.count,
        domainId: d.id,
        flag: flags[d.id] || null,
        onClick: function () { go({ kind: "domain", domainId: d.id }); }
      });
    });

    var more = block(sheet, "Also here", "Secondary ways in");
    destRow(more, {
      quiet: true, icon: "table", title: "All settings",
      desc: "Every record in one filtered index: " + M.counts.settings + " settings plus every manager, resource and action.",
      onClick: function () { go({ kind: "all" }); }
    });
    destRow(more, {
      quiet: true, icon: "columns", title: "Copy settings from another Project",
      desc: "A one-time transaction with a preview, a restore point and a receipt. The two Projects stay independent afterwards.",
      onClick: function () { go({ kind: "copy" }); }
    });
    destRow(more, {
      quiet: true, icon: "history", title: "What this Project has changed",
      desc: "Everything moved away from its default, when it moved, and how to put it back.",
      managerId: "manager-settings-lifecycle",
      onClick: function () { go({ kind: "manager", managerId: "manager-settings-lifecycle" }); }
    });
    destRow(more, {
      quiet: true, icon: "wrench", title: "Doctor",
      desc: "One read-only health picture, and the owner that can repair each part of it.",
      managerId: "manager-doctor",
      onClick: function () { go({ kind: "manager", managerId: "manager-doctor" }); }
    });

    var recent = store.get().recent || [];
    if (recent.length) {
      var rb = block(sheet, "Recently opened", recent.length + " " + plural(recent.length, "place"));
      recent.slice(0, 5).forEach(function (entry) {
        destRow(rb, {
          quiet: true, icon: "clock", title: entry.label, desc: entry.path,
          onClick: function () { go(entry.dest); }
        });
      });
    }
  }

  function attentionByDomain(items) {
    var out = {};
    (items || []).forEach(function (item) {
      var d = item.destination || {};
      var domainId = d.domainId;
      if (!domainId && d.managerId) {
        var fam = M.familyOf(d.managerId);
        domainId = fam ? fam.domainId : null;
      }
      if (domainId && !out[domainId]) out[domainId] = { tone: item.tone, label: item.label };
    });
    return out;
  }

  /* ================================================================= DOMAIN */

  function renderDomain(sheet, r) {
    var d = M.domain(r.domainId);
    if (!d) { renderAbsent(sheet); return; }
    store.remember({ id: "d:" + d.id, label: d.title, path: "Settings", dest: { kind: "domain", domainId: d.id } });

    sheetHead(sheet, {
      eyebrow: "Settings",
      title: d.title,
      lede: d.purpose,
      meta: [d.pages.length + " " + plural(d.pages.length, "page"), d.count + " settings",
        d.families.length + " " + plural(d.families.length, "manager")]
    });
    situationNote(sheet);

    var pages = block(sheet, "Pages", "Read down, or jump straight to a group");
    d.pages.forEach(function (p) {
      destRow(pages, {
        icon: "fileText",
        title: p.title,
        desc: p.summary,
        count: p.count,
        pageId: p.id,
        onClick: function () { go({ kind: "domain", domainId: d.id, pageId: p.id }); }
      });
    });

    if (d.families.length) {
      var mans = block(sheet, "Managers in this area", "Places with their own resources, not just rows");
      d.families.forEach(function (fam) {
        var rec = M.managerRecord(fam.managerId);
        destRow(mans, {
          icon: (rec && rec.icon) || "sliders",
          title: (rec && rec.title) || fam.family,
          desc: fam.deferred
            ? "Owned by " + fam.owner + ". " + fam.why
            : ((rec && rec.purpose) || fam.family),
          managerId: fam.managerId,
          tailChip: fam.deferred ? chip("managed", "Separate owner", "lock") : null,
          onClick: function () { go({ kind: "manager", managerId: fam.managerId }); }
        });
      });
    }
  }

  /* =================================================================== PAGE */

  var EXPOSURE_STEPS = [
    { id: "standard", label: "Everyday", rank: 0 },
    { id: "advanced", label: "Advanced", rank: 1 },
    { id: "all", label: "Everything", rank: 3 }
  ];

  function exposureRankOf(level) {
    for (var i = 0; i < EXPOSURE_STEPS.length; i++) if (EXPOSURE_STEPS[i].id === level) return EXPOSURE_STEPS[i].rank;
    return 0;
  }

  /* A deep link to an advanced row raises the level for this visit and says so,
   * rather than landing the reader on a page where the row they asked for is not
   * on screen. */
  function effectiveExposure(r) {
    var level = ui.exposure;
    ui.raised = false;
    if (r && r.settingId) {
      var rec = M.setting(r.settingId);
      if (rec && M.exposureRank(rec.exposure) > exposureRankOf(level)) {
        ui.raised = true;
        return M.exposureRank(rec.exposure) > 1 ? "all" : "advanced";
      }
    }
    return level;
  }

  function renderPage(sheet, r) {
    var page = M.page(r.pageId);
    if (!page) { renderAbsent(sheet); return; }
    var d = M.domain(page.domainId);
    store.remember({ id: "p:" + page.id, label: page.title, path: d ? d.title : "Settings",
      dest: { kind: "domain", domainId: page.domainId, pageId: page.id } });

    var level = effectiveExposure(r);
    var limit = exposureRankOf(level);

    sheetHead(sheet, {
      eyebrow: d ? d.title : "Settings",
      title: page.title,
      lede: page.summary,
      meta: [page.sections.length + " " + plural(page.sections.length, "group"), page.count + " settings"]
    });
    situationNote(sheet);
    if (FX.effects().restartPending) {
      sheet.appendChild(text("div", "ed-prose",
        "Two changes on this Project are saved and take effect the next time Puppet Master starts. That is stated once, here, rather than on every row it touches."));
    }

    /* The exposure disclosure: one control for the page, not a chevron per row. */
    var levelBar = el("div", "ed-row-control");
    levelBar.appendChild(text("span", "ed-quiet", "Show"));
    EXPOSURE_STEPS.forEach(function (step) {
      var b = btn("ed-tag", "");
      b.appendChild(text("span", null, step.label));
      b.setAttribute("aria-pressed", String(step.id === level));
      on(b, "click", function () {
        ui.exposure = step.id;
        store.set({ exposure: step.id });
        render();
      });
      levelBar.appendChild(b);
    });
    if (ui.raised) {
      levelBar.appendChild(text("span", "ed-quiet", "Raised for this visit because the link names a setting behind it."));
    }
    sheet.appendChild(levelBar);

    /* Sub-navigation nests INSIDE the sheet: a second-level list of the page's own
     * groups, beside the reading column rather than in a second rail. */
    var nested = el("div", "ed-nested");
    var idx = el("div", "ed-idx");
    idx.appendChild(text("div", "ed-idx-head", "On this page"));
    var idxScroll = el("div", "ed-idx-scroll");
    idx.appendChild(idxScroll);
    var body = el("div", null);
    nested.appendChild(idx);
    nested.appendChild(body);
    sheet.appendChild(nested);

    var shownTotal = 0;
    page.sections.forEach(function (sec) {
      var all = M.rowsInSection(sec.id);
      var visible = all.filter(function (rec) { return M.exposureRank(rec.exposure) <= limit; });
      shownTotal += visible.length;

      var item = btn("ed-idx-item", "");
      item.appendChild(text("span", "ed-idx-text", sec.title));
      item.appendChild(text("span", "ed-idx-count", String(visible.length)));
      if (r.sectionId === sec.id) item.classList.add("is-current");
      on(item, "click", function () {
        var node = body.querySelector(attrSel("data-pm-section", sec.id));
        if (node) scrollNear(node);
        replace({ kind: "domain", domainId: page.domainId, pageId: page.id, sectionId: sec.id });
      });
      idxScroll.appendChild(item);

      var secEl = el("div", "ed-section");
      secEl.setAttribute("data-pm-section", sec.id);
      var head = el("div", "ed-section-head");
      head.appendChild(text("h2", "ed-section-title", sec.title));
      head.appendChild(text("span", "ed-section-count", visible.length + " of " + all.length));
      if (visible.length < all.length) {
        head.appendChild(text("span", "ed-section-hidden",
          (all.length - visible.length) + " behind " + (limit < 1 ? "Advanced" : "Everything")));
      }
      secEl.appendChild(head);

      if (!visible.length) {
        secEl.appendChild(text("div", "ed-empty-line",
          "Every setting in this group is an advanced one. Raise the level above to read them."));
      } else {
        visible.forEach(function (rec) { secEl.appendChild(settingRow(rec)); });
      }
      body.appendChild(secEl);
    });

    if (shownTotal > VIRT.THRESHOLD) {
      /* Bounded by construction: the generator cuts every page into groups of four
       * to eight rows, so the deepest page in the product is 75 rows even with the
       * whole exposure ladder open. Nothing here needs a windowed viewport; the
       * long tail lives in All settings, which does. */
      body.appendChild(text("div", "ed-quiet",
        "This page is long: " + shownTotal + " settings in " + page.sections.length + " groups. The list on the left moves between them."));
    }
  }

  /* ================================================================== ROWS */

  function rowState(rec) {
    var s = FX.rowState(rec) || rec.state;
    if (store.get().values.hasOwnProperty(rec.id) && s && s.source !== "managed" && s.source !== "unavailable") {
      var v = store.valueOf(rec.id);
      var same = JSON.stringify(v) === JSON.stringify(s.defaultValue);
      return { source: "custom", value: v, defaultValue: s.defaultValue, isDefault: same,
        restart: s.restart, changedAt: "just now" };
    }
    return s;
  }

  function settingRow(rec) {
    var st = rowState(rec);
    var editable = M.isEditable(st);
    var row = el("div", "ed-row");
    row.setAttribute("data-pm-row", rec.id);
    row.setAttribute("tabindex", "-1");

    var gutter = el("div", "ed-row-gutter", ICON("arrowRight", 13));
    gutter.setAttribute("aria-hidden", "true");
    row.appendChild(gutter);

    var main = el("div", "ed-row-main");
    var line = el("div", "ed-row-line");
    line.appendChild(text("h3", "ed-row-title", rec.label));

    var tone = M.stateTone(st);
    if (tone !== "quiet") line.appendChild(chip(tone, M.stateLabel(st)));
    if (rec.exposure !== "standard") line.appendChild(chip("quiet", exposureWord(rec.exposure), "eye"));
    if (st && st.restart && st.restart !== "none") line.appendChild(chip("setup", "Needs a restart", "refresh"));
    if (FX.effects().changedElsewhere && rec.state.source === "custom") {
      line.appendChild(chip("attention", "Changed in another window", "alert"));
    }
    main.appendChild(line);

    if (rec.desc) main.appendChild(text("p", "ed-row-desc", rec.desc));

    var control = el("div", "ed-row-control");
    control.appendChild(buildControl(rec, st, editable, row));
    if (rec.recommended != null && rec.recommended !== "" && editable) {
      var recBtn = btn("ed-btn ed-btn-small ed-btn-quiet", "");
      recBtn.appendChild(text("span", null, "Use recommended"));
      recBtn.title = "Recommended: " + valueWords(rec.recommended);
      on(recBtn, "click", function () {
        store.setValue(rec.id, rec.recommended);
        replaceRow(row, rec);
        announce(rec.label + " set to the recommended value.");
      });
      control.appendChild(recBtn);
    }
    if (editable && store.get().values.hasOwnProperty(rec.id)) {
      var undo = btn("ed-btn ed-btn-small ed-btn-quiet", "");
      undo.appendChild(text("span", null, "Put back to default"));
      on(undo, "click", function () {
        store.clearValue(rec.id);
        delete ui.drafts[rec.id];
        delete ui.invalid[rec.id];
        replaceRow(row, rec);
        announce(rec.label + " put back to its default.");
      });
      control.appendChild(undo);
    }
    main.appendChild(control);

    if (ui.invalid[rec.id]) {
      var bad = text("div", "ed-row-note", ui.invalid[rec.id]);
      bad.setAttribute("data-tone", "attention");
      main.appendChild(bad);
    }

    var why = btn("ed-btn ed-btn-small ed-btn-quiet", "");
    why.appendChild(text("span", null, ui.detailOpen[rec.id] ? "Hide details" : "Why this value?"));
    on(why, "click", function () {
      ui.detailOpen[rec.id] = !ui.detailOpen[rec.id];
      replaceRow(row, rec);
    });
    var acts = el("div", "ed-row-actions");
    acts.appendChild(why);
    main.appendChild(acts);

    if (ui.detailOpen[rec.id]) main.appendChild(rowDetails(rec, st));

    row.appendChild(main);
    return row;
  }

  function replaceRow(row, rec) {
    var next = settingRow(rec);
    if (row.hasAttribute("data-pm-locator")) next.setAttribute("data-pm-locator", "1");
    if (row.parentNode) row.parentNode.replaceChild(next, row);
    return next;
  }

  function exposureWord(id) {
    var list = M.EXPOSURE;
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i].label;
    return humanise(id);
  }

  /* Reason, restart note and technical origin live here — never on the row, which
   * would put a paragraph of provenance beside every control in the product. */
  function rowDetails(rec, st) {
    var box = el("div", "ed-details");
    var dl = document.createElement("dl");
    function pair(k, v) {
      dl.appendChild(text("dt", null, k));
      dl.appendChild(text("dd", null, v));
    }
    var reason = M.stateReason(st);
    if (reason) pair("Why this value", reason);
    pair("Where it comes from", M.stateLabel(st));
    pair("Product default", valueWords(rec.state.defaultValue));
    if (rec.recommended != null && rec.recommended !== "") pair("Recommended", valueWords(rec.recommended));
    pair("Control", humanise(rec.kind));
    pair("Level", exposureWord(rec.exposure));
    if (st && st.restart && st.restart !== "none") pair("Restart", "Takes effect after Puppet Master restarts.");
    if (st && st.managedBy) pair("Policy owner", st.managedBy);
    pair("Identifier", rec.id);
    box.appendChild(dl);
    if (rec.related && rec.related.length) {
      box.appendChild(text("div", "ed-quiet", "Related: " + rec.related.map(humanise).join(", ")));
    }
    return box;
  }

  /* -------------------------------------------------------------- controls */

  function markControl(node, rec) {
    node.setAttribute("data-pm-control", rec.id);
    return node;
  }

  function buildControl(rec, st, editable, row) {
    if (!editable) {
      var ro = el("div", "ed-readonly");
      ro.setAttribute("tabindex", "0");
      ro.setAttribute("role", "group");
      ro.setAttribute("aria-label", rec.label + ", not editable here");
      ro.appendChild(text("span", null, valueWords(st ? st.value : rec.state.value)));
      ro.appendChild(text("span", " ed-quiet", "  " + (st && st.source === "managed"
        ? "A policy controls this value. It is readable here and changed by whoever owns the policy."
        : "This host does not provide the capability, so there is nothing to set.")));
      return markControl(ro, rec);
    }

    var value = store.valueOf(rec.id);
    if (value === undefined) value = st ? st.value : rec.state.value;

    if (rec.kind === "toggle") {
      var t = btn("ed-toggle", "");
      t.setAttribute("role", "switch");
      t.setAttribute("aria-checked", String(!!value));
      t.setAttribute("aria-label", rec.label);
      t.appendChild(el("span", "ed-toggle-track", '<span class="ed-toggle-knob"></span>'));
      t.appendChild(text("span", null, value ? "On" : "Off"));
      on(t, "click", function () {
        store.setValue(rec.id, !value);
        replaceRow(row, rec);
        announce(rec.label + " turned " + (!value ? "on" : "off") + ".");
      });
      return markControl(t, rec);
    }

    if (rec.kind === "select" || rec.kind === "radio") {
      var sel = el("select", "ed-select");
      sel.setAttribute("aria-label", rec.label);
      var opts = rec.options && rec.options.length ? rec.options : [rec.state.defaultValue];
      opts.forEach(function (o) {
        var opt = document.createElement("option");
        opt.value = String(o);
        opt.textContent = valueWords(o);
        sel.appendChild(opt);
      });
      sel.value = String(value);
      on(sel, "change", function () {
        store.setValue(rec.id, sel.value);
        replaceRow(row, rec);
        announce(rec.label + " set to " + valueWords(sel.value) + ".");
      });
      return markControl(sel, rec);
    }

    if (rec.kind === "number" || rec.kind === "slider") {
      var wrap = el("div", "ed-row-control");
      var input;
      if (rec.kind === "slider") {
        input = el("input", "ed-range");
        input.type = "range";
        input.min = "0";
        input.max = String(Math.max(1, Number(rec.state.defaultValue) * 4 || 100));
        input.step = "0.05";
      } else {
        input = el("input", "ed-input");
        input.type = "number";
      }
      var draft = ui.drafts.hasOwnProperty(rec.id) ? ui.drafts[rec.id] : String(value == null ? "" : value);
      input.value = draft;
      input.setAttribute("aria-label", rec.label);
      var readout = text("span", "ed-range-value", valueWords(value));
      function commit() {
        var raw = input.value;
        ui.drafts[rec.id] = raw;
        var n = Number(raw);
        if (raw === "" || !isFinite(n)) {
          ui.invalid[rec.id] = "That is not a number this setting can take. What you typed is kept so you can correct it.";
          input.classList.add("is-invalid");
          replaceRow(row, rec);
          return;
        }
        if (n < 0) {
          ui.invalid[rec.id] = "This setting cannot be negative. What you typed is kept so you can correct it.";
          input.classList.add("is-invalid");
          replaceRow(row, rec);
          return;
        }
        delete ui.invalid[rec.id];
        delete ui.drafts[rec.id];
        store.setValue(rec.id, n);
        replaceRow(row, rec);
      }
      on(input, "change", commit);
      on(input, "input", function () { readout.textContent = valueWords(input.value); });
      wrap.appendChild(markControl(input, rec));
      if (rec.kind === "slider") wrap.appendChild(readout);
      return wrap;
    }

    if (rec.kind === "text" || rec.kind === "path") {
      var ti = el("input", "ed-input");
      ti.type = "text";
      ti.value = ui.drafts.hasOwnProperty(rec.id) ? ui.drafts[rec.id] : String(value == null ? "" : value);
      ti.setAttribute("aria-label", rec.label);
      ti.setAttribute("placeholder", rec.kind === "path" ? "No path set" : "Not set");
      on(ti, "change", function () {
        store.setValue(rec.id, ti.value);
        delete ui.drafts[rec.id];
        replaceRow(row, rec);
      });
      on(ti, "input", function () { ui.drafts[rec.id] = ti.value; });
      return markControl(ti, rec);
    }

    if (rec.kind === "multiselect") {
      var group = el("div", "ed-taglist");
      group.setAttribute("role", "group");
      group.setAttribute("aria-label", rec.label);
      var chosen = Array.isArray(value) ? value.slice() : [];
      (rec.options || []).forEach(function (o, i) {
        var tag = btn("ed-tag", "");
        tag.appendChild(text("span", null, valueWords(o)));
        var isOn = chosen.indexOf(o) >= 0;
        tag.setAttribute("aria-pressed", String(isOn));
        if (i === 0) markControl(tag, rec);
        on(tag, "click", function () {
          var next = chosen.slice();
          var at = next.indexOf(o);
          if (at >= 0) next.splice(at, 1); else next.push(o);
          store.setValue(rec.id, next);
          replaceRow(row, rec);
        });
        group.appendChild(tag);
      });
      if (!(rec.options || []).length) markControl(group, rec).setAttribute("tabindex", "0");
      return group;
    }

    if (rec.kind === "list" || rec.kind === "keyvalue") {
      var listWrap = el("div", "ed-row-control");
      listWrap.appendChild(text("span", "ed-readonly", valueWords(value)));
      var edit = btn("ed-btn ed-btn-small", ICON("type", 12));
      edit.appendChild(text("span", null, ui.detailOpen["edit:" + rec.id] ? "Close editor" : "Edit entries"));
      on(edit, "click", function () {
        ui.detailOpen["edit:" + rec.id] = !ui.detailOpen["edit:" + rec.id];
        replaceRow(row, rec);
      });
      listWrap.appendChild(markControl(edit, rec));
      if (ui.detailOpen["edit:" + rec.id]) {
        var editor = el("div", "ed-details");
        var area = el("textarea", "ed-input");
        area.rows = 4;
        area.value = rec.kind === "list"
          ? (Array.isArray(value) ? value.join("\n") : "")
          : JSON.stringify(value == null ? {} : value, null, 1);
        area.setAttribute("aria-label", rec.label + " entries");
        var save = btn("ed-btn ed-btn-small ed-btn-primary", "");
        save.appendChild(text("span", null, "Save entries"));
        on(save, "click", function () {
          if (rec.kind === "list") {
            store.setValue(rec.id, area.value.split(/\n+/).filter(function (x) { return !!x.replace(/^\s+|\s+$/g, ""); }));
            delete ui.invalid[rec.id];
          } else {
            try {
              store.setValue(rec.id, JSON.parse(area.value));
              delete ui.invalid[rec.id];
            } catch (err) {
              ui.invalid[rec.id] = "Those pairs could not be read. What you typed is kept so you can correct it.";
            }
          }
          ui.detailOpen["edit:" + rec.id] = false;
          replaceRow(row, rec);
        });
        editor.appendChild(area);
        editor.appendChild(save);
        listWrap.appendChild(editor);
      }
      return listWrap;
    }

    /* kind: action — a control that does something rather than holds a value. */
    var act = btn("ed-btn", ICON("play", 12));
    act.appendChild(text("span", null, "Run this"));
    on(act, "click", function () {
      if (window.PMSim) {
        window.PMSim.run({
          id: rec.id,
          label: rec.label,
          realCall: "settings.action.run(\"" + rec.id + "\")",
          detail: rec.desc || "Would run this action for this Project."
        });
      }
      announce(rec.label + " requested. The receipt is in the notification inbox.");
    });
    return markControl(act, rec);
  }

  /* ============================================================ ALL SETTINGS */

  function facetToRoute() {
    var f = ui.all;
    var parts = [];
    if (f.domains.length) parts.push("d=" + f.domains.join(","));
    if (f.kinds.length) parts.push("k=" + f.kinds.join(","));
    if (f.exposures.length) parts.push("e=" + f.exposures.join(","));
    if (f.states.length) parts.push("s=" + f.states.join(","));
    if (f.changed) parts.push("c=1");
    if (f.attention) parts.push("a=1");
    if (f.text) parts.push("t=" + f.text);
    return parts.join(";");
  }

  function routeToFacet(q) {
    var f = { domains: [], kinds: [], exposures: [], states: [], changed: false, attention: false, text: "" };
    String(q || "").split(";").forEach(function (part) {
      var at = part.indexOf("=");
      if (at < 0) return;
      var key = part.slice(0, at);
      var val = part.slice(at + 1);
      if (key === "d") f.domains = val.split(",");
      else if (key === "k") f.kinds = val.split(",");
      else if (key === "e") f.exposures = val.split(",");
      else if (key === "s") f.states = val.split(",");
      else if (key === "c") f.changed = val === "1";
      else if (key === "a") f.attention = val === "1";
      else if (key === "t") f.text = val;
    });
    return f;
  }

  function needsAttention(rec) {
    if (rec.kind === "unavailable" || rec.kind === "setup") return true;
    return rec.stateSource === "notConfigured" || rec.stateSource === "unavailable";
  }

  function renderAll(sheet, r) {
    if (r.facet != null) ui.all = routeToFacet(r.facet);
    var f = ui.all;

    var res = IX.all({
      domainIds: f.domains, kinds: f.kinds, exposures: f.exposures, states: f.states,
      changedOnly: f.changed, text: f.text, limit: 0, sort: "path"
    });

    var rows = res.rows;
    var attentionCount = 0;
    for (var i = 0; i < rows.length; i++) if (needsAttention(rows[i])) attentionCount += 1;
    if (f.attention) rows = rows.filter(needsAttention);

    sheetHead(sheet, {
      eyebrow: "Settings",
      title: "All settings",
      lede: "Every record this Project has, in one index: settings, managers, the resources inside them, actions, set-up work, read-only readings and the capabilities this host cannot offer.",
      meta: [rows.length + " of " + IX.stats().records + " records shown"]
    });
    situationNote(sheet);
    sheet.classList.add("is-wide");

    var nested = el("div", "ed-nested");
    var facets = el("div", "ed-idx");
    facets.appendChild(text("div", "ed-idx-head", "Narrow it down"));
    var facetScroll = el("div", "ed-idx-scroll");
    facets.appendChild(facetScroll);
    var body = el("div", null);
    nested.appendChild(facets);
    nested.appendChild(body);
    sheet.appendChild(nested);

    function facetGroup(title, list, selected, onToggle) {
      var g = el("div", "ed-facet-group");
      g.appendChild(text("div", "ed-facet-head", title));
      list.forEach(function (entry) {
        var b = btn("ed-facet", "");
        b.appendChild(text("span", "ed-facet-text", entry.label));
        b.appendChild(text("span", "ed-facet-count", String(entry.count)));
        b.setAttribute("aria-pressed", String(selected.indexOf(entry.id) >= 0));
        on(b, "click", function () { onToggle(entry.id); });
        g.appendChild(b);
      });
      facetScroll.appendChild(g);
    }

    function toggleInto(arrName, id) {
      var arr = ui.all[arrName];
      var at = arr.indexOf(id);
      if (at >= 0) arr.splice(at, 1); else arr.push(id);
      replace({ kind: "all", facet: facetToRoute() });
    }

    facetGroup("Area", res.facets.domains, f.domains, function (id) { toggleInto("domains", id); });
    facetGroup("Kind of record", res.facets.kinds, f.kinds, function (id) { toggleInto("kinds", id); });
    facetGroup("Level", res.facets.exposures, f.exposures, function (id) { toggleInto("exposures", id); });
    facetGroup("Status", res.facets.states, f.states, function (id) { toggleInto("states", id); });
    facetGroup("Only", [
      { id: "changed", label: "Changed from default", count: res.facets.changed },
      { id: "attention", label: "Needs attention", count: attentionCount }
    ], [f.changed ? "changed" : "", f.attention ? "attention" : ""], function (id) {
      if (id === "changed") ui.all.changed = !ui.all.changed;
      else ui.all.attention = !ui.all.attention;
      replace({ kind: "all", facet: facetToRoute() });
    });

    var clearBtn = btn("ed-btn ed-btn-small ed-btn-quiet", "");
    clearBtn.appendChild(text("span", null, "Clear every filter"));
    on(clearBtn, "click", function () {
      ui.all = { domains: [], kinds: [], exposures: [], states: [], changed: false, attention: false, text: "" };
      replace({ kind: "all", facet: "" });
    });
    facetScroll.appendChild(clearBtn);

    var filter = el("input", "ed-input");
    filter.type = "text";
    filter.value = f.text;
    filter.setAttribute("placeholder", "Filter this index");
    filter.setAttribute("aria-label", "Filter the index");
    on(filter, "change", function () {
      ui.all.text = filter.value;
      replace({ kind: "all", facet: facetToRoute() });
    });
    body.appendChild(filter);

    var viewport = el("div", "ed-all-viewport");
    var inner = el("div", null);
    viewport.appendChild(inner);
    body.appendChild(viewport);

    /* Windowed, because this list is 828 records today and several thousand under
     * the volume fixture. The scrollbar stays truthful because the two spacers
     * carry the height of everything outside the window. */
    var ROW_H = 56;
    function paint() {
      var win = VIRT.windowFor({
        total: rows.length, rowHeight: ROW_H,
        viewport: viewport.clientHeight, scrollTop: viewport.scrollTop,
        overscan: 6, firstPage: 24
      });
      inner.innerHTML = "";
      var before = el("div", null);
      before.style.height = win.before + "px";
      inner.appendChild(before);
      for (var i = win.start; i < win.end; i++) inner.appendChild(allRow(rows[i]));
      var after = el("div", null);
      after.style.height = win.after + "px";
      inner.appendChild(after);
    }
    on(viewport, "scroll", function () {
      ui.allScroll = viewport.scrollTop;
      paint();
    });
    paint();
    window.setTimeout(paint, 0);

    if (!rows.length) {
      body.appendChild(text("div", "ed-empty-line",
        "No record matches those filters. Clearing one of them brings the list back."));
    }
  }

  function allRow(rec) {
    var b = btn("ed-all-row", "");
    if (rec.destination && rec.destination.settingId) b.setAttribute("data-pm-row", rec.destination.settingId);
    var main = el("div", null);
    main.appendChild(text("div", "ed-all-label", rec.label));
    main.appendChild(text("div", "ed-all-path", rec.path || rec.typeLabel));
    b.appendChild(main);
    var tail = el("div", "ed-all-tail");
    if (rec.changed) tail.appendChild(chip("changed", "Changed"));
    if (rec.stateSource === "managed") tail.appendChild(chip("managed", "Managed"));
    if (rec.stateSource === "unavailable" || rec.kind === "unavailable") tail.appendChild(chip("unavailable", "Unavailable"));
    tail.appendChild(text("span", "ed-quiet ed-nowrap", rec.typeLabel));
    b.appendChild(tail);
    on(b, "click", function () { go(rec.destination); });
    return b;
  }

  /* ================================================================== COPY */

  var COPY_STEPS = [
    { id: "source", title: "Choose a source Project" },
    { id: "categories", title: "Choose what to bring over" },
    { id: "preview", title: "Read what would change" },
    { id: "apply", title: "Apply, verify and keep the receipt" }
  ];

  function copyStepIndex(step) {
    for (var i = 0; i < COPY_STEPS.length; i++) if (COPY_STEPS[i].id === step) return i;
    return 0;
  }

  function renderCopy(sheet, r) {
    var stepId = r.step && copyStepIndex(r.step) >= 0 ? r.step : "source";
    var at = copyStepIndex(stepId);
    var c = ui.copy;

    sheetHead(sheet, {
      eyebrow: "Settings",
      title: "Copy settings from another Project",
      lede: COPY.independence,
      meta: ["Step " + (at + 1) + " of 4"]
    });
    situationNote(sheet);

    var nested = el("div", "ed-nested");
    var idx = el("div", "ed-idx");
    idx.appendChild(text("div", "ed-idx-head", "The transaction"));
    var idxScroll = el("div", "ed-idx-scroll");
    idx.appendChild(idxScroll);
    var body = el("div", null);
    nested.appendChild(idx);
    nested.appendChild(body);
    sheet.appendChild(nested);

    COPY_STEPS.forEach(function (step, i) {
      var b = btn("ed-idx-item", "");
      b.appendChild(text("span", "ed-idx-text", (i + 1) + ". " + step.title));
      if (i === at) b.classList.add("is-current");
      on(b, "click", function () { go({ kind: "copy", step: step.id }); });
      idxScroll.appendChild(b);
    });

    if (stepId === "source") copyStepSource(body);
    else if (stepId === "categories") copyStepCategories(body);
    else if (stepId === "preview") copyStepPreview(body);
    else copyStepApply(body);

    var receipts = store.get().receipts || [];
    var rb = block(body, "Receipts", receipts.length ? receipts.length + " kept" : "None yet");
    if (!receipts.length) {
      rb.appendChild(text("div", "ed-empty-line", FX.is("rollback-complete")
        ? "A rolled-back transaction keeps its restore point and its receipt here. Run the four steps above to produce one."
        : "A receipt is written every time a copy is applied, with the restore point it kept."));
    } else {
      receipts.forEach(function (rec) { rb.appendChild(receiptRow(rec)); });
    }
  }

  function copyStepSource(body) {
    body.appendChild(text("p", "ed-prose",
      "Pick the Project to read from. Nothing is read until you choose one, and the source is never written to."));
    var list = el("div", null);
    COPY.sources().forEach(function (src) {
      var b = destRow(list, {
        icon: "folder",
        title: src.name,
        desc: src.note + " " + src.updated + " · " + src.settings + " settings in " + src.categories + " areas.",
        tailChip: ui.copy.sourceId === src.id ? chip("changed", "Chosen") : null,
        onClick: function () {
          ui.copy.sourceId = src.id;
          ui.copy.preview = null;
          go({ kind: "copy", step: "categories" });
        }
      });
      b.setAttribute("aria-pressed", String(ui.copy.sourceId === src.id));
    });
    body.appendChild(list);
  }

  function copyStepCategories(body) {
    if (!ui.copy.sourceId) {
      body.appendChild(text("div", "ed-empty-line", "Choose a source Project first."));
      return;
    }
    if (!ui.copy.domainIds) ui.copy.domainIds = M.domains.map(function (d) { return d.id; });
    body.appendChild(text("p", "ed-prose",
      "Only the areas you tick are read from " + sourceName() + ". Everything else in this Project is left exactly as it is."));

    var list = el("div", null);
    COPY.categories().forEach(function (cat) {
      var chosen = ui.copy.domainIds.indexOf(cat.id) >= 0;
      var b = destRow(list, {
        icon: cat.icon,
        title: cat.title,
        desc: cat.purpose,
        count: cat.count,
        tailChip: chosen ? chip("changed", "Included") : chip("quiet", "Excluded"),
        onClick: function () {
          var at = ui.copy.domainIds.indexOf(cat.id);
          if (at >= 0) ui.copy.domainIds.splice(at, 1); else ui.copy.domainIds.push(cat.id);
          ui.copy.preview = null;
          render();
        }
      });
      b.setAttribute("aria-pressed", String(chosen));
    });
    body.appendChild(list);

    var acts = el("div", "ed-notice-acts");
    var next = btn("ed-btn ed-btn-primary", "");
    next.appendChild(text("span", null, "Preview what would change"));
    next.disabled = !ui.copy.domainIds.length;
    on(next, "click", function () { go({ kind: "copy", step: "preview" }); });
    acts.appendChild(next);
    body.appendChild(acts);
  }

  function sourceName() {
    var src = COPY.sources().filter(function (s) { return s.id === ui.copy.sourceId; })[0];
    return src ? src.name : "the source Project";
  }

  function copyStepPreview(body) {
    if (!ui.copy.sourceId) {
      body.appendChild(text("div", "ed-empty-line", "Choose a source Project first."));
      return;
    }
    if (!ui.copy.preview) ui.copy.preview = COPY.preview(ui.copy.sourceId, ui.copy.domainIds || null);
    var p = ui.copy.preview;
    if (!p) { body.appendChild(text("div", "ed-empty-line", "That source is no longer available.")); return; }

    var counts = el("div", "ed-counts");
    [["Added", p.counts.additions], ["Replaced", p.counts.replacements], ["Unchanged", p.counts.unchanged],
      ["References re-pointed", p.counts.references], ["Not available here", p.counts.unavailable],
      ["Conflicts", p.counts.conflicts]].forEach(function (pair) {
      var g = el("div", null);
      g.appendChild(text("div", "ed-count-label", pair[0]));
      g.appendChild(text("div", "ed-count-value", String(pair[1])));
      counts.appendChild(g);
    });
    body.appendChild(counts);

    body.appendChild(text("p", "ed-prose", COPY.secretPolicy()));
    if (FX.is("import-conflict")) {
      body.appendChild(text("p", "ed-prose",
        "Every conflict below is a value a policy controls in this Project. The copy does not get to win, so those rows are excluded before anything is applied."));
    }

    var ex = block(body, "What is excluded and why", "Stated before anything runs");
    p.excluded.forEach(function (entry) {
      var line = el("div", "ed-att-item");
      line.appendChild(el("div", "ed-att-icon", ICON("ban", 14)));
      var t = el("div", null);
      t.appendChild(text("div", "ed-att-label", entry.label));
      if (entry.note) t.appendChild(text("div", "ed-att-detail", entry.note));
      line.appendChild(t);
      line.appendChild(text("span", "ed-dest-count", String(entry.count)));
      ex.appendChild(line);
    });

    var diff = block(body, "Itemised", p.willChange + " of " + p.total + " would change");
    var shown = 0;
    p.groups.forEach(function (group) {
      var interesting = group.items.filter(function (it) {
        return it.outcome !== "unchanged";
      });
      if (!interesting.length) return;
      diff.appendChild(text("h3", "ed-section-title", group.title + " · " + interesting.length));
      var table = el("table", "ed-table");
      var thead = el("thead", null, "<tr><th>Setting</th><th>Now</th><th>Would become</th><th>Outcome</th></tr>");
      table.appendChild(thead);
      var tb = document.createElement("tbody");
      interesting.slice(0, 12).forEach(function (item) {
        var tr = document.createElement("tr");
        tr.appendChild(text("td", "ed-table-name", item.label));
        tr.appendChild(text("td", null, valueWords(item.current)));
        tr.appendChild(text("td", null, item.outcome === "conflict" || item.outcome === "unavailable"
          ? "Not applied" : valueWords(item.incoming)));
        var td = el("td", null);
        td.appendChild(chip(outcomeTone(item.outcome), humanise(item.outcome)));
        if (item.reason) td.appendChild(text("div", "ed-quiet", item.reason));
        tr.appendChild(td);
        tb.appendChild(tr);
        shown += 1;
      });
      table.appendChild(tb);
      diff.appendChild(table);
      if (interesting.length > 12) {
        diff.appendChild(text("div", "ed-quiet", "and " + (interesting.length - 12) + " more in this area."));
      }
    });
    if (!shown) diff.appendChild(text("div", "ed-empty-line", "Nothing in the chosen areas would change."));

    var acts = el("div", "ed-notice-acts");
    var apply = btn("ed-btn ed-btn-primary", "");
    apply.appendChild(text("span", null, "Take a restore point and apply"));
    on(apply, "click", function () {
      ui.copy.runner = COPY.apply(p);
      ui.copy.log = [];
      ui.copy.receipt = null;
      go({ kind: "copy", step: "apply" });
    });
    acts.appendChild(apply);
    var back = btn("ed-btn", "");
    back.appendChild(text("span", null, "Change what is included"));
    on(back, "click", function () { go({ kind: "copy", step: "categories" }, true); });
    acts.appendChild(back);
    body.appendChild(acts);
  }

  function outcomeTone(outcome) {
    if (outcome === "conflict") return "attention";
    if (outcome === "unavailable") return "unavailable";
    if (outcome === "reference") return "managed";
    if (outcome === "addition" || outcome === "replacement") return "changed";
    return "quiet";
  }

  function copyStepApply(body) {
    var c = ui.copy;
    if (!c.runner) {
      body.appendChild(text("div", "ed-empty-line",
        "Nothing is being applied. Read the preview first; the transaction only starts when you ask for it."));
      return;
    }
    body.appendChild(text("p", "ed-prose",
      "Each phase is a real step, driven one at a time so it can be read rather than watched: a restore point, an atomic apply, then a verification pass over every value it wrote."));

    var steps = el("div", "ed-steps");
    c.runner.steps.forEach(function (phase, i) {
      var s = el("div", "ed-step");
      if (i < c.log.length) s.classList.add("is-done");
      else if (i === c.log.length) s.classList.add("is-current");
      s.appendChild(text("div", "ed-step-n", String(i + 1)));
      var b = el("div", null);
      b.appendChild(text("div", "ed-step-title", phase));
      if (i < c.log.length) b.appendChild(text("div", "ed-step-body", c.log[i]));
      s.appendChild(b);
      steps.appendChild(s);
    });
    body.appendChild(steps);

    if (!c.receipt) {
      var acts = el("div", "ed-notice-acts");
      var next = btn("ed-btn ed-btn-primary", "");
      next.appendChild(text("span", null, c.log.length ? "Run the next phase" : "Start"));
      on(next, "click", function () {
        var out = c.runner.next();
        c.log.push(out.phase || (out.receipt ? out.receipt.note || "Finished." : "Done."));
        if (out.done) c.receipt = out.receipt;
        render();
      });
      acts.appendChild(next);
      var all = btn("ed-btn", "");
      all.appendChild(text("span", null, "Run the rest"));
      on(all, "click", function () {
        var out = c.runner.next();
        while (!out.done) { c.log.push(out.phase); out = c.runner.next(); }
        c.receipt = out.receipt;
        c.log.push(out.receipt.note || "Finished.");
        render();
      });
      acts.appendChild(all);
      body.appendChild(acts);
    } else {
      body.appendChild(receiptRow(c.receipt));
    }
  }

  function receiptRow(rec) {
    var box = el("div", "ed-owner");
    var head = el("div", "ed-detail-head");
    head.appendChild(text("div", "ed-owner-name", rec.outcome === "applied"
      ? "Copied from " + rec.source.name
      : "Undone — copy from " + rec.source.name));
    head.appendChild(chip(rec.outcome === "applied" ? "ok" : "attention", humanise(rec.outcome)));
    box.appendChild(head);
    box.appendChild(text("div", "ed-owner-text", (rec.note || "") + " " + rec.applied + " values applied · " + rec.at));
    var r1 = el("div", "ed-owner-row");
    r1.appendChild(text("div", "ed-owner-label", "Restore point"));
    r1.appendChild(text("div", "ed-owner-text", rec.restorePoint.label + " · taken " + rec.restorePoint.takenAt));
    box.appendChild(r1);
    var r2 = el("div", "ed-owner-row");
    r2.appendChild(text("div", "ed-owner-label", "Afterwards"));
    r2.appendChild(text("div", "ed-owner-text", COPY.independence));
    box.appendChild(r2);
    if (rec.canRollback) {
      var acts = el("div", "ed-notice-acts");
      var rb = btn("ed-btn", ICON("undo", 12));
      rb.appendChild(text("span", null, "Roll this back"));
      on(rb, "click", function () {
        COPY.rollback(rec.id);
        ui.copy.receipt = null;
        ui.copy.runner = null;
        ui.copy.log = [];
        render();
        announce("The copy was rolled back. This Project is exactly as it was.");
      });
      acts.appendChild(rb);
      box.appendChild(acts);
    }
    return box;
  }

  /* ============================================================== MANAGERS */

  /* Index objects are the routing authority: a roster row exists for every object
   * a search result can name, whether or not the manager's spec happens to list
   * it. Specs enrich these rows; they never decide where a link lands. */
  var objectCache = { key: null, byManager: null };

  function objectIndex() {
    var key = IX.stats().records;
    if (objectCache.key === key) return objectCache.byManager;
    var byManager = {};
    IX.records().forEach(function (rec) {
      var d = rec.destination;
      if (!d || !d.managerId || !d.objectId) return;
      var bag = byManager[d.managerId] || (byManager[d.managerId] = { order: [], byId: {} });
      var id = d.objectId;
      if (!bag.byId[id]) {
        bag.byId[id] = {
          objectId: id,
          sectionKey: d.sectionKey || null,
          label: rec.label,
          typeLabel: rec.typeLabel,
          desc: rec.desc,
          availability: rec.availability,
          kind: rec.kind,
          groupLabel: rec.pathParts && rec.pathParts.length > 2
            ? rec.pathParts[rec.pathParts.length - 1]
            : humanise(d.sectionKey || "items"),
          rows: []
        };
        bag.order.push(id);
      }
      if (d.rowId) {
        bag.byId[id].rows.push({
          rowId: d.rowId, label: rec.label, typeLabel: rec.typeLabel,
          desc: rec.desc, availability: rec.availability, sectionKey: d.sectionKey || null
        });
      }
    });
    objectCache = { key: key, byManager: byManager };
    return byManager;
  }

  function objectsOf(managerId) {
    var bag = objectIndex()[managerId];
    if (!bag) return [];
    return bag.order.map(function (id) { return bag.byId[id]; });
  }

  function objectRecord(managerId, objectId) {
    var bag = objectIndex()[managerId];
    return bag ? bag.byId[objectId] || null : null;
  }

  function specState() {
    var s = store.get();
    return {
      values: s.values, managerEdits: s.managerEdits,
      demoState: FX.active(), stateId: FX.active()
    };
  }

  function renderManagerSurface(sheet, r) {
    if (!MGR.has(r.managerId)) { renderAbsent(sheet); return; }
    /* The one call site. Opening a manager is the only thing that builds one. */
    var spec = FX.decorate(MGR.spec(r.managerId, specState()));
    var fam = M.familyOf(r.managerId) || {};
    var archetype = MGR.archetype(r.managerId);

    store.remember({
      id: "m:" + r.managerId, label: spec.title,
      path: fam.domainId ? (M.domain(fam.domainId) || {}).title : "Settings",
      dest: { kind: "manager", managerId: r.managerId }
    });

    sheetHead(sheet, {
      eyebrow: fam.domainId ? (M.domain(fam.domainId) || {}).title : "Settings",
      title: spec.title,
      lede: spec.purpose,
      meta: [humanise(archetype)]
    });
    situationNote(sheet);

    if (spec.deferred || archetype === "named owner insertion point") {
      renderOwner(sheet, spec, fam);
    }

    renderHealth(sheet, spec);

    if (r.managerId === "manager-providers") renderProviders(sheet, r, spec);
    else renderManager(sheet, spec, { route: r, archetype: archetype, family: fam });
  }

  function renderHealth(sheet, spec) {
    var h = spec.health;
    if (!h) return;
    var box = el("div", "ed-health");
    var line = el("div", "ed-health-line");
    line.appendChild(chip(window.PMManagerKit.statusTone(h.status), h.statusWord));
    if (h.refreshing) line.appendChild(chip("loading", "Refreshing", "refresh"));
    box.appendChild(line);
    if (h.headline) box.appendChild(text("div", "ed-health-head", h.headline));
    if (h.detail) box.appendChild(text("div", "ed-health-detail", h.detail));
    if (h.counts && h.counts.length) {
      var counts = el("div", "ed-counts");
      h.counts.forEach(function (c) {
        var g = el("div", null);
        g.appendChild(text("div", "ed-count-label", c.label));
        g.appendChild(text("div", "ed-count-value", String(c.value)));
        counts.appendChild(g);
      });
      box.appendChild(counts);
    }
    sheet.appendChild(box);
  }

  /* A deferred owner is a destination with a contract, not a missing feature. */
  function renderOwner(sheet, spec, fam) {
    var owner = spec.owner || {};
    var box = el("div", "ed-owner");
    box.appendChild(text("div", "ed-owner-name", "Owned by " + (owner.name || fam.owner || spec.title)));
    [["Why it is separate", owner.why || fam.why],
      ["Where Settings opens it", fam.insertion],
      ["How control comes back", fam.returns]].forEach(function (pair) {
      if (!pair[1]) return;
      var row = el("div", "ed-owner-row");
      row.appendChild(text("div", "ed-owner-label", pair[0]));
      row.appendChild(text("div", "ed-owner-text", pair[1]));
      box.appendChild(row);
    });
    var acts = el("div", "ed-notice-acts");
    var open = btn("ed-btn ed-btn-primary ed-btn-small", ICON("arrowUpRight", 12));
    open.appendChild(text("span", null, "Open " + (owner.name || spec.title)));
    on(open, "click", function () {
      MGR.act({ managerId: spec.id }, { id: "owner.open", label: "Open " + (owner.name || spec.title) }, null);
      announce((owner.name || spec.title) + " would open at its own entry point and return here afterwards.");
    });
    acts.appendChild(open);
    box.appendChild(acts);
    sheet.appendChild(box);
  }

  /* ---------------------------------------------------- one generic renderer */

  /* Branches on archetype so a roster is never flattened into preference rows and
   * a read-only projection never grows an editable control. */
  function renderManager(sheet, spec, ctx) {
    var r = ctx.route;
    var archetype = ctx.archetype;
    var tabs = buildTabs(spec, ctx);
    var currentId = pickTab(spec, ctx, tabs);

    if (tabs.length > 1) {
      var strip = el("div", "ed-tabs");
      strip.setAttribute("role", "tablist");
      tabs.forEach(function (tab) {
        var b = btn("ed-tab", "");
        b.appendChild(text("span", null, tab.label));
        b.setAttribute("role", "tab");
        b.setAttribute("aria-selected", String(tab.id === currentId));
        on(b, "click", function () {
          ui.mgrTab[spec.id] = tab.id;
          ui.mgrPane[spec.id] = "roster";
          render();
        });
        strip.appendChild(b);
      });
      sheet.appendChild(strip);
    }

    var body = el("div", "ed-mgr-body");
    sheet.appendChild(body);

    var tab = tabs.filter(function (t) { return t.id === currentId; })[0] || tabs[0];
    if (!tab) { body.appendChild(text("div", "ed-empty-line", "This manager reports nothing to show yet.")); return; }

    if (tab.kind === "overview") renderOverview(body, spec, ctx, tabs);
    else if (tab.kind === "roster") renderRoster(body, spec, ctx, tab);
    else if (tab.kind === "rows") renderSpecRows(body, spec, tab.section, ctx);
    else if (tab.kind === "prose") renderProse(body, tab.section);
    else if (tab.kind === "table") renderSpecTable(body, tab.section);

    if (archetype === "read-only health projection") {
      body.appendChild(text("div", "ed-quiet",
        "Everything on this surface is a reading. Repairs are made by the owner of the thing being reported, which each finding names."));
    }
  }

  function buildTabs(spec, ctx) {
    var tabs = [{ id: "overview", label: "Overview", kind: "overview" }];
    var objects = objectsOf(spec.id);
    var claimed = {};

    (spec.sections || []).forEach(function (sec) {
      var kind = sec.kind;
      var entry = { id: sec.id, label: sec.label || humanise(sec.id), section: sec };
      if ((kind === "list" || kind === "cards") && (sec.items || []).length) entry.kind = "roster";
      else if (kind === "rows") entry.kind = "rows";
      else if (kind === "prose") entry.kind = "prose";
      else entry.kind = "table";
      /* A roster tab owns every index object whose spec item it carries, so no
       * object is reachable from two tabs and none is reachable from none. */
      if (entry.kind === "roster") {
        entry.objects = [];
        (sec.items || []).forEach(function (item) {
          var match = matchObject(objects, item);
          if (match) { claimed[match.objectId] = true; entry.objects.push(match.objectId); }
        });
      }
      tabs.push(entry);
    });

    var leftovers = {};
    objects.forEach(function (obj) {
      if (claimed[obj.objectId]) return;
      var key = obj.sectionKey || "items";
      (leftovers[key] || (leftovers[key] = { label: obj.groupLabel, ids: [] })).ids.push(obj.objectId);
    });
    Object.keys(leftovers).forEach(function (key) {
      tabs.push({
        id: "objects:" + key,
        label: leftovers[key].label,
        kind: "roster",
        section: null,
        objects: leftovers[key].ids
      });
    });

    return tabs;
  }

  function matchObject(objects, item) {
    for (var i = 0; i < objects.length; i++) if (objects[i].objectId === item.id) return objects[i];
    for (var j = 0; j < objects.length; j++) {
      var id = objects[j].objectId;
      if (item.id.length > id.length &&
        (item.id.slice(-(id.length + 1)) === "-" + id || item.id.slice(-(id.length + 1)) === "_" + id)) return objects[j];
    }
    for (var k = 0; k < objects.length; k++) {
      if (item.name && objects[k].label && item.name.toLowerCase() === objects[k].label.toLowerCase()) return objects[k];
    }
    return null;
  }

  function pickTab(spec, ctx, tabs) {
    var r = ctx.route;
    if (r.objectId) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].objects && tabs[i].objects.indexOf(r.objectId) >= 0) return tabs[i].id;
      }
    }
    if (r.sectionKey) {
      for (var j = 0; j < tabs.length; j++) {
        if (tabs[j].id === r.sectionKey || tabs[j].id === "objects:" + r.sectionKey) return tabs[j].id;
      }
    }
    var saved = ui.mgrTab[spec.id];
    if (saved) {
      for (var k = 0; k < tabs.length; k++) if (tabs[k].id === saved) return saved;
    }
    return tabs[0].id;
  }

  function renderOverview(body, spec, ctx, tabs) {
    if (spec.notes && spec.notes.length) {
      spec.notes.forEach(function (note) { body.appendChild(text("p", "ed-prose", note)); });
    }
    if (spec.primary && spec.primary.label) {
      var acts = el("div", "ed-notice-acts");
      var b = btn("ed-btn ed-btn-primary", "");
      b.appendChild(text("span", null, spec.primary.label));
      on(b, "click", function () {
        MGR.act({ managerId: spec.id }, spec.primary, null);
        announce(spec.primary.label + " requested. The receipt is in the notification inbox.");
      });
      acts.appendChild(b);
      body.appendChild(acts);
    }

    var inside = block(body, "What is in here", tabs.length - 1 + " " + plural(tabs.length - 1, "part"));
    tabs.slice(1).forEach(function (tab) {
      var count = tab.kind === "roster"
        ? (tab.section ? (tab.section.items || []).length : (tab.objects || []).length)
        : null;
      destRow(inside, {
        quiet: true,
        icon: tab.kind === "roster" ? "list" : (tab.kind === "rows" ? "sliders" : (tab.kind === "prose" ? "fileText" : "table")),
        title: tab.label,
        desc: (tab.section && tab.section.summary) || "",
        count: count,
        onClick: function () { ui.mgrTab[spec.id] = tab.id; render(); }
      });
    });

    if (spec.diagnostics && spec.diagnostics.length) {
      var diag = block(body, "Diagnostics", "Read-only evidence");
      spec.diagnostics.forEach(function (d) {
        destRow(diag, {
          quiet: true, icon: "fileText", title: d.label, desc: "Opens the " + humanise(d.kind) + " behind the readings above.",
          onClick: function () {
            MGR.act({ managerId: spec.id }, { id: d.id, label: d.label }, null);
            announce(d.label + " requested. The receipt is in the notification inbox.");
          }
        });
      });
    }
  }

  /* A compact roster of 44px rows beside a detail sheet measured for reading. */
  function renderRoster(body, spec, ctx, tab) {
    var r = ctx.route;
    var objects = objectsOf(spec.id);
    var byId = {};
    objects.forEach(function (o) { byId[o.objectId] = o; });

    var entries = [];
    var seen = {};
    if (tab.section) {
      (tab.section.items || []).forEach(function (item) {
        var match = matchObject(objects, item);
        var id = match ? match.objectId : item.id;
        if (seen[id]) return;
        seen[id] = true;
        entries.push({ objectId: id, item: item, rec: match });
      });
    }
    (tab.objects || []).forEach(function (id) {
      if (seen[id]) return;
      seen[id] = true;
      entries.push({ objectId: id, item: null, rec: byId[id] });
    });

    if (!entries.length) {
      var empty = window.PMManagerKit.emptyFor(tab.section);
      var box = el("div", "ed-owner");
      box.appendChild(text("div", "ed-owner-name", empty.headline));
      box.appendChild(text("div", "ed-owner-text", empty.detail));
      body.appendChild(box);
      return;
    }

    var selected = null;
    if (r.objectId && seen[r.objectId]) selected = r.objectId;
    else if (ui.mgrObject[spec.id] && seen[ui.mgrObject[spec.id]]) selected = ui.mgrObject[spec.id];
    else selected = entries[0].objectId;

    var split = el("div", "ed-split");
    split.setAttribute("data-pane", ui.mgrPane[spec.id] === "detail" ? "detail" : "roster");

    var roster = el("div", "ed-roster");
    if (tab.section && tab.section.summary) roster.appendChild(text("div", "ed-quiet", tab.section.summary));

    var filterText = (ui.mgrFilter[spec.id] || "").toLowerCase();
    if (entries.length > 12) {
      var filter = el("input", "ed-input ed-roster-filter");
      filter.type = "text";
      filter.value = ui.mgrFilter[spec.id] || "";
      filter.setAttribute("placeholder", "Filter this list");
      filter.setAttribute("aria-label", "Filter " + tab.label);
      on(filter, "input", function () { ui.mgrFilter[spec.id] = filter.value; render(); });
      roster.appendChild(filter);
    }

    var shown = entries.filter(function (e) {
      if (!filterText) return true;
      var name = (e.item && e.item.name) || (e.rec && e.rec.label) || e.objectId;
      return String(name).toLowerCase().indexOf(filterText) >= 0;
    });

    var scroll = el("div", "ed-roster-scroll");
    /* Windowed once the roster passes the shared threshold; the volume fixture
     * puts several hundred installations and models through this same list. */
    var cap = VIRT.shouldVirtualize(shown.length) ? 40 : shown.length;
    shown.slice(0, cap).forEach(function (entry) {
      scroll.appendChild(rosterRow(spec, entry, selected));
    });
    if (shown.length > cap) {
      scroll.appendChild(text("div", "ed-roster-more",
        "Showing " + cap + " of " + shown.length + ". Filter above to reach the rest."));
    }
    roster.appendChild(scroll);
    split.appendChild(roster);

    var detail = el("div", "ed-detail");
    var inner = el("div", "ed-detail-inner");
    var chosen = entries.filter(function (e) { return e.objectId === selected; })[0];
    if (chosen) renderObjectDetail(inner, spec, chosen, ctx);
    detail.appendChild(inner);
    split.appendChild(detail);
    body.appendChild(split);
  }

  function rosterRow(spec, entry, selected) {
    var name = (entry.item && entry.item.name) || (entry.rec && entry.rec.label) || humanise(entry.objectId);
    var word = (entry.item && entry.item.statusWord) || (entry.rec && entry.rec.availability) || "";
    var b = btn("ed-roster-item", "");
    b.setAttribute("data-pm-object", entry.objectId);
    b.setAttribute("aria-selected", String(entry.objectId === selected));
    b.appendChild(el("span", "ed-roster-mark", ICON("arrowRight", 12)));
    b.appendChild(text("span", "ed-roster-name", name));
    b.appendChild(text("span", "ed-roster-state", clamp(word, 22)));
    on(b, "click", function () {
      ui.mgrObject[spec.id] = entry.objectId;
      ui.mgrPane[spec.id] = "detail";
      replace({ kind: "manager", managerId: spec.id, objectId: entry.objectId });
    });
    return b;
  }

  function renderObjectDetail(inner, spec, entry, ctx) {
    var item = entry.item;
    var rec = entry.rec;
    var name = (item && item.name) || (rec && rec.label) || humanise(entry.objectId);

    if (ui.width === "narrow") {
      var back = btn("ed-btn ed-btn-small ed-btn-quiet", ICON("chevronLeft", 12));
      back.appendChild(text("span", null, "Back to the list"));
      on(back, "click", function () { ui.mgrPane[spec.id] = "roster"; render(); });
      inner.appendChild(back);
    }

    var head = el("div", "ed-detail-head");
    head.appendChild(text("h2", "ed-detail-title", name));
    if (item && item.statusWord) head.appendChild(chip(window.PMManagerKit.statusTone(item.status), item.statusWord));
    if (rec && rec.typeLabel) head.appendChild(text("span", "ed-quiet", rec.typeLabel));
    inner.appendChild(head);

    var sub = (item && item.secondary) || (rec && rec.desc) || "";
    if (sub) inner.appendChild(text("p", "ed-detail-sub", sub));

    var reason = item ? window.PMManagerKit.reasonLine(item) : "";
    if (!reason && rec && rec.availability) reason = rec.availability;
    if (reason) {
      var note = el("div", "ed-readonly");
      note.appendChild(text("span", null, reason));
      inner.appendChild(note);
    }

    var route = item ? window.PMManagerKit.routeLine(item) : "";
    if (route) inner.appendChild(text("div", "ed-quiet", route));

    if (item && item.badges && item.badges.length) {
      var badges = el("div", "ed-taglist");
      item.badges.forEach(function (b) {
        var tag = text("span", "ed-tag", b.text);
        if (b.title) tag.title = b.title;
        badges.appendChild(tag);
      });
      inner.appendChild(badges);
    }

    if (item && item.fields && Object.keys(item.fields).length) {
      var fields = el("div", "ed-fields");
      Object.keys(item.fields).forEach(function (key) {
        fields.appendChild(text("div", "ed-field-label", key));
        fields.appendChild(text("div", "ed-field-value", String(item.fields[key])));
      });
      inner.appendChild(fields);
    }

    if (item && item.editable && item.editable.length) {
      var edit = block(inner, "Editable here", "Changes are kept for this Project");
      item.editable.forEach(function (f) { edit.appendChild(editableRow(spec, entry, f)); });
    }

    if (item && item.detail && item.detail.length) {
      item.detail.forEach(function (group) {
        var g = block(inner, group.label, "");
        var fields2 = el("div", "ed-fields");
        group.rows.forEach(function (row) {
          fields2.appendChild(text("div", "ed-field-label", row.label));
          var v = el("div", "ed-field-value");
          v.appendChild(text("span", null, String(row.value)));
          if (row.hint) v.appendChild(text("div", "ed-quiet", row.hint));
          fields2.appendChild(v);
        });
        g.appendChild(fields2);
      });
    }

    if (rec && rec.rows && rec.rows.length) {
      var sub2 = block(inner, "Inside this item", rec.rows.length + " " + plural(rec.rows.length, "entry", "entries"));
      rec.rows.forEach(function (r2) {
        var line = el("div", "ed-att-item");
        line.setAttribute("data-ed-rowid", r2.rowId);
        line.setAttribute("tabindex", "-1");
        line.appendChild(el("div", "ed-att-icon", ICON("dot", 12)));
        var t = el("div", null);
        t.appendChild(text("div", "ed-att-label", r2.label));
        if (r2.desc) t.appendChild(text("div", "ed-att-detail", r2.desc));
        line.appendChild(t);
        line.appendChild(text("span", "ed-quiet", r2.typeLabel));
        sub2.appendChild(line);
      });
    }

    if (item && item.actions && item.actions.length) {
      var acts = el("div", "ed-notice-acts");
      item.actions.forEach(function (a) {
        var b2 = btn("ed-btn" + (a.kind === "primary" ? " ed-btn-primary" : ""), "");
        b2.appendChild(text("span", null, a.label));
        on(b2, "click", function () {
          MGR.act({ managerId: spec.id }, a, { id: entry.objectId });
          announce(a.label + " requested. The receipt is in the notification inbox.");
        });
        acts.appendChild(b2);
      });
      inner.appendChild(acts);
    }

    if (!item && rec) {
      inner.appendChild(text("div", "ed-quiet",
        "Reported by " + spec.title + ". Everything Settings knows about it is above; the manager that owns it holds the rest."));
    }
  }

  function editableRow(spec, entry, field) {
    var wrap = el("div", "ed-row-control");
    wrap.appendChild(text("span", "ed-field-label", field.label));
    var current = store.edit(spec.id, entry.objectId, field.key, field.value);
    if (field.secretKind) {
      /* No secret material, ever: the row says who holds it and what it is for. */
      var held = el("div", "ed-readonly");
      held.appendChild(text("span", null, "Held by the provider's own tool. Puppet Master never reads, shows or exports it."));
      wrap.appendChild(held);
      return wrap;
    }
    var input;
    if (field.kind === "select" && field.options.length) {
      input = el("select", "ed-select");
      field.options.forEach(function (o) {
        var opt = document.createElement("option");
        opt.value = String(o);
        opt.textContent = valueWords(o);
        input.appendChild(opt);
      });
      input.value = String(current);
      on(input, "change", function () {
        store.setEdit(spec.id, entry.objectId, field.key, input.value);
        MGR.invalidate(spec.id);
        render();
      });
    } else if (field.kind === "toggle") {
      input = btn("ed-toggle", "");
      input.setAttribute("role", "switch");
      input.setAttribute("aria-checked", String(!!current));
      input.appendChild(el("span", "ed-toggle-track", '<span class="ed-toggle-knob"></span>'));
      input.appendChild(text("span", null, current ? "On" : "Off"));
      on(input, "click", function () {
        store.setEdit(spec.id, entry.objectId, field.key, !current);
        MGR.invalidate(spec.id);
        render();
      });
    } else {
      input = el("input", "ed-input");
      input.type = "text";
      input.value = current == null ? "" : String(current);
      on(input, "change", function () {
        store.setEdit(spec.id, entry.objectId, field.key, input.value);
        MGR.invalidate(spec.id);
        render();
      });
    }
    input.setAttribute("aria-label", field.label);
    wrap.appendChild(input);
    if (field.help) wrap.appendChild(text("div", "ed-quiet", field.help));
    return wrap;
  }

  function renderSpecRows(body, spec, section, ctx) {
    if (section.summary) body.appendChild(text("p", "ed-prose", section.summary));
    var ids = section.settings || [];
    var found = [];
    ids.forEach(function (id) {
      var rec = M.setting(id);
      if (rec) found.push(rec);
    });
    if (!found.length) {
      body.appendChild(text("p", "ed-prose",
        "These are ordinary settings and they are read and changed on their own Settings page, in the same row grammar as everywhere else."));
      var fam = M.familyOf(spec.id);
      if (fam && fam.domainId) {
        var d = M.domain(fam.domainId);
        if (d) {
          destRow(body, {
            icon: d.icon, title: d.title, desc: d.purpose, count: d.count, domainId: d.id,
            onClick: function () { go({ kind: "domain", domainId: d.id }); }
          });
        }
      }
      return;
    }
    var secEl = el("div", "ed-section");
    found.forEach(function (rec) { secEl.appendChild(settingRow(rec)); });
    body.appendChild(secEl);
  }

  function renderProse(body, section) {
    if (section.summary) body.appendChild(text("p", "ed-prose", section.summary));
    (section.items || []).forEach(function (item) {
      if (item.name) body.appendChild(text("p", "ed-prose", item.name));
    });
  }

  function renderSpecTable(body, section) {
    if (section.summary) body.appendChild(text("p", "ed-prose", section.summary));
    var items = section.items || [];
    if (!items.length) {
      var empty = window.PMManagerKit.emptyFor(section);
      body.appendChild(text("div", "ed-empty-line", empty.headline + " " + empty.detail));
      return;
    }
    var columns = (section.columns || []).slice();
    if (!columns.length) {
      var keys = {};
      items.forEach(function (it) { Object.keys(it.fields || {}).forEach(function (k) { keys[k] = true; }); });
      columns = Object.keys(keys).slice(0, 4).map(function (k) { return { key: k, label: humanise(k) }; });
    }
    var table = el("table", "ed-table");
    var head = document.createElement("thead");
    var hr = document.createElement("tr");
    hr.appendChild(text("th", null, "Name"));
    columns.forEach(function (c) { hr.appendChild(text("th", null, c.label)); });
    hr.appendChild(text("th", null, "State"));
    head.appendChild(hr);
    table.appendChild(head);
    var tb = document.createElement("tbody");
    items.slice(0, 50).forEach(function (item) {
      var tr = document.createElement("tr");
      var nameCell = el("td", "ed-table-name");
      nameCell.appendChild(text("div", null, item.name));
      if (item.secondary) nameCell.appendChild(text("div", "ed-quiet", item.secondary));
      tr.appendChild(nameCell);
      columns.forEach(function (c) {
        tr.appendChild(text("td", null, item.fields && item.fields[c.key] != null ? String(item.fields[c.key]) : "—"));
      });
      var stateCell = el("td", null);
      if (item.statusWord) stateCell.appendChild(chip(window.PMManagerKit.statusTone(item.status), item.statusWord));
      tr.appendChild(stateCell);
      tb.appendChild(tr);
    });
    table.appendChild(tb);
    body.appendChild(table);
    if (items.length > 50) {
      body.appendChild(text("div", "ed-quiet", "Showing 50 of " + items.length + " entries."));
    }
  }

  /* ================================================= the provider manager */

  /* Built bespoke, because it is the surface the seven designs are meant to
   * disagree about. The default view answers the six questions people arrive
   * with; credentials, installations, catalogues, limits and logs are coordinated
   * subpages inside the same sheet, never one wall. */

  var PROVIDER_TABS = [
    { id: "overview", label: "Overview" },
    { id: "accounts", label: "Accounts" },
    { id: "models", label: "Models" },
    { id: "credentials", label: "Credentials" },
    { id: "installations", label: "Installations" },
    { id: "limits", label: "Limits and routing" },
    { id: "logs", label: "Logs and diagnostics" }
  ];

  var SECTION_TO_TAB = {
    accounts: "accounts", models: "models", installations: "installations",
    cliInstallations: "installations", credentials: "credentials",
    limits: "limits", logs: "logs", catalogues: "models"
  };

  function providerData() {
    var D = window.PMData || {};
    return {
      providers: D.providers || [],
      installs: (D.installations || []).concat(D.providerCliInstallations || [])
    };
  }

  function installOwner(installId) {
    var data = providerData();
    for (var i = 0; i < data.installs.length; i++) {
      var inst = data.installs[i];
      if ((inst.installationId || inst.id) === installId) return inst.providerFamilyId || null;
    }
    return null;
  }

  function renderProviders(sheet, r, spec) {
    var data = providerData();
    var objects = objectsOf("manager-providers");

    var selected = null;
    var tabId = ui.mgrTab["manager-providers"] || "overview";

    if (r.objectId) {
      var isProvider = data.providers.some(function (p) { return p.id === r.objectId; });
      if (isProvider) selected = r.objectId;
      else {
        var owner = installOwner(r.objectId);
        if (owner) { selected = owner; tabId = "installations"; }
      }
    }
    if (r.sectionKey && SECTION_TO_TAB[r.sectionKey]) tabId = SECTION_TO_TAB[r.sectionKey];
    else if (r.objectId && !r.sectionKey && installOwner(r.objectId)) tabId = "installations";
    if (!selected) selected = ui.mgrObject["manager-providers"] || (data.providers[0] || {}).id;
    ui.mgrObject["manager-providers"] = selected;
    ui.mgrTab["manager-providers"] = tabId;

    var strip = el("div", "ed-tabs");
    strip.setAttribute("role", "tablist");
    PROVIDER_TABS.forEach(function (tab) {
      var b = btn("ed-tab", "");
      b.appendChild(text("span", null, tab.label));
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", String(tab.id === tabId));
      on(b, "click", function () {
        ui.mgrTab["manager-providers"] = tab.id;
        ui.mgrPane["manager-providers"] = "detail";
        render();
      });
      strip.appendChild(b);
    });
    sheet.appendChild(strip);

    var split = el("div", "ed-split");
    split.setAttribute("data-pane", ui.mgrPane["manager-providers"] === "detail" ? "detail" : "roster");

    var roster = el("div", "ed-roster");
    roster.appendChild(text("div", "ed-quiet", "One row per provider family. Everything deeper is a subpage of the sheet, not another column here."));
    var scroll = el("div", "ed-roster-scroll");
    data.providers.forEach(function (p) {
      var b = btn("ed-roster-item", "");
      b.setAttribute("data-pm-object", p.id);
      b.setAttribute("aria-selected", String(p.id === selected));
      b.appendChild(el("span", "ed-roster-mark", ICON("arrowRight", 12)));
      b.appendChild(text("span", "ed-roster-name", p.name));
      b.appendChild(text("span", "ed-roster-state", clamp(p.statusWord || (p.installed ? "Ready" : "Not set up"), 20)));
      on(b, "click", function () {
        ui.mgrObject["manager-providers"] = p.id;
        ui.mgrPane["manager-providers"] = "detail";
        replace({ kind: "manager", managerId: "manager-providers", objectId: p.id });
      });
      scroll.appendChild(b);
    });
    roster.appendChild(scroll);
    split.appendChild(roster);

    var detail = el("div", "ed-detail");
    var inner = el("div", "ed-detail-inner");
    var provider = data.providers.filter(function (p) { return p.id === selected; })[0] || data.providers[0];
    if (!provider) {
      inner.appendChild(text("div", "ed-empty-line",
        "No provider family is configured yet. Setting one up is an explicit step you start, from the provider's official source."));
    } else if (tabId === "accounts") providerAccounts(inner, provider, r);
    else if (tabId === "models") providerModels(inner, provider, spec, r);
    else if (tabId === "credentials") providerCredentials(inner, provider);
    else if (tabId === "installations") providerInstallations(inner, provider, spec, r);
    else if (tabId === "limits") providerLimits(inner, provider, spec);
    else if (tabId === "logs") providerLogs(inner, provider, spec);
    else providerOverview(inner, provider, spec, objects);
    detail.appendChild(inner);
    split.appendChild(detail);
    sheet.appendChild(split);
  }

  function providerHead(inner, provider, subtitle) {
    if (ui.width === "narrow") {
      var back = btn("ed-btn ed-btn-small ed-btn-quiet", ICON("chevronLeft", 12));
      back.appendChild(text("span", null, "Back to the providers"));
      on(back, "click", function () { ui.mgrPane["manager-providers"] = "roster"; render(); });
      inner.appendChild(back);
    }
    var head = el("div", "ed-detail-head");
    head.appendChild(text("h2", "ed-detail-title", provider.name));
    head.appendChild(chip(window.PMManagerKit.statusTone(provider.status), provider.statusWord || (provider.installed ? "Ready" : "Not set up")));
    inner.appendChild(head);
    inner.appendChild(text("p", "ed-detail-sub", subtitle || provider.summary));
  }

  function specItemFor(spec, providerId) {
    var out = null;
    (spec.sections || []).forEach(function (sec) {
      (sec.items || []).forEach(function (item) {
        if (item.id === "prov-" + providerId) out = item;
      });
    });
    return out;
  }

  function providerOverview(inner, provider, spec, objects) {
    providerHead(inner, provider);
    var item = specItemFor(spec, provider.id);
    var eff = FX.effects();

    /* The six questions people actually arrive with, in this order, every time. */
    var fields = el("div", "ed-fields");
    var answers = item && item.fields ? item.fields : {};
    Object.keys(answers).forEach(function (key) {
      fields.appendChild(text("div", "ed-field-label", key));
      fields.appendChild(text("div", "ed-field-value", String(answers[key])));
    });
    if (!Object.keys(answers).length) {
      fields.appendChild(text("div", "ed-field-label", "Connected"));
      fields.appendChild(text("div", "ed-field-value", provider.installed ? "Installed on this computer" : "Not installed on this computer"));
    }
    inner.appendChild(fields);

    if (eff.usageUnavailable) {
      inner.appendChild(text("p", "ed-prose",
        "This provider answers requests but reports no balance right now. Being ready and being measurable are two different facts, and Settings will not invent the second one."));
    }
    if (eff.offline) {
      inner.appendChild(text("p", "ed-prose",
        "There is no network. Every line above is the last answer this Project read, with the time it was read; nothing here has been re-checked."));
    }

    var acts = el("div", "ed-notice-acts");
    if (!provider.installed) {
      var setup = btn("ed-btn ed-btn-primary", ICON("download", 12));
      setup.appendChild(text("span", null, "Set up " + provider.name));
      on(setup, "click", function () {
        MGR.act({ managerId: "manager-providers" }, { id: "provider.install.start_setup", label: "Set up " + provider.name }, { id: provider.id });
        announce("Setting up " + provider.name + " would install it from the provider's official source for the host you choose. Signing in is a separate step.");
      });
      acts.appendChild(setup);
    } else if (provider.status !== "ok") {
      var fix = btn("ed-btn ed-btn-primary", ICON("wrench", 12));
      fix.appendChild(text("span", null, "Check what is wrong"));
      on(fix, "click", function () {
        MGR.act({ managerId: "manager-providers" }, { id: "provider.auth.revalidate", label: "Check " + provider.name }, { id: provider.id });
      });
      acts.appendChild(fix);
    }
    PROVIDER_TABS.slice(1).forEach(function (tab) {
      var b = btn("ed-btn ed-btn-small", "");
      b.appendChild(text("span", null, tab.label));
      on(b, "click", function () { ui.mgrTab["manager-providers"] = tab.id; render(); });
      acts.appendChild(b);
    });
    inner.appendChild(acts);

    inner.appendChild(text("p", "ed-prose",
      "Nothing is bundled. No provider tool ships inside Puppet Master or arrives pre-seeded; the first acquisition is an install you start, from the provider's official source, for the exact host you selected. Signing in is a separate step afterwards, run by the provider's own login."));
  }

  function providerAccounts(inner, provider, r) {
    providerHead(inner, provider, "Which account this Project uses, what each one is allowed to run, and what happens when its included usage ends.");
    var accounts = provider.accounts || [];
    if (!accounts.length) {
      inner.appendChild(text("div", "ed-empty-line",
        "No account is connected to " + provider.name + " yet. Signing in is a separate step from installing, run by the provider's own login inside its own profile."));
      return;
    }
    accounts.forEach(function (acc) {
      var box = el("div", "ed-owner");
      box.setAttribute("data-ed-rowid", acc.id);
      box.setAttribute("tabindex", "-1");
      var head = el("div", "ed-detail-head");
      head.appendChild(text("div", "ed-owner-name", acc.nickname || acc.identity));
      head.appendChild(chip(window.PMManagerKit.statusTone(acc.status === "connected" ? "ok" : "attention"), acc.statusWord || humanise(acc.status)));
      box.appendChild(head);
      var fields = el("div", "ed-fields");
      [["Identity", acc.identity], ["Product", acc.product], ["Connection", acc.connection],
        ["Preference order", acc.priority == null ? "Not ranked" : String(acc.priority)],
        ["Sticky threads", acc.sticky ? "A thread stays on this account once it starts" : "Threads may move between accounts"],
        ["Included usage reported", (acc.usage && acc.usage.includedRemaining) || "Unknown"],
        ["When it ends", (acc.nextAction && acc.nextAction.chosen) || "Not decided yet"]].forEach(function (pair) {
        fields.appendChild(text("div", "ed-field-label", pair[0]));
        fields.appendChild(text("div", "ed-field-value", String(pair[1])));
      });
      box.appendChild(fields);
      if (acc.usage && acc.usage.note) box.appendChild(text("div", "ed-quiet", acc.usage.note));
      if (FX.is("reconnect-required")) {
        var acts = el("div", "ed-notice-acts");
        var b = btn("ed-btn ed-btn-primary ed-btn-small", ICON("key", 12));
        b.appendChild(text("span", null, "Sign in again"));
        on(b, "click", function () {
          MGR.act({ managerId: "manager-providers" }, { id: "provider.auth.signin", label: "Sign in to " + (acc.nickname || acc.identity) }, { id: acc.id });
        });
        acts.appendChild(b);
        box.appendChild(acts);
      }
      inner.appendChild(box);
    });
  }

  function providerModels(inner, provider, spec, r) {
    providerHead(inner, provider, "What this family can answer right now, and where the list came from.");
    var models = provider.models || [];
    if (!models.length) {
      inner.appendChild(text("div", "ed-empty-line",
        "No model is listed until " + provider.name + " is connected. A catalogue is read from the provider, never guessed."));
      return;
    }
    var table = el("table", "ed-table");
    table.appendChild(el("thead", null, "<tr><th>Model</th><th>Context</th><th>Summary</th><th>State</th></tr>"));
    var tb = document.createElement("tbody");
    models.forEach(function (m) {
      var tr = document.createElement("tr");
      tr.setAttribute("data-ed-rowid", m.id);
      tr.setAttribute("tabindex", "-1");
      tr.appendChild(text("td", "ed-table-name", m.alias || m.name));
      tr.appendChild(text("td", null, m.context || "—"));
      tr.appendChild(text("td", null, m.summary || ""));
      var td = el("td", null);
      td.appendChild(chip(m.available === false ? "unavailable" : "ok", m.available === false ? "Not on this account" : "Ready"));
      tr.appendChild(td);
      tb.appendChild(tr);
    });
    table.appendChild(tb);
    inner.appendChild(table);
    var refresh = btn("ed-btn ed-btn-small", ICON("refresh", 12));
    refresh.appendChild(text("span", null, "Refresh the catalogue"));
    on(refresh, "click", function () {
      MGR.act({ managerId: "manager-providers" }, { id: "provider.models.refresh", label: "Refresh " + provider.name + " catalogue" }, { id: provider.id });
    });
    inner.appendChild(refresh);
  }

  function providerCredentials(inner, provider) {
    providerHead(inner, provider, "Who holds the secret, and where the sign-in actually happens.");
    var fields = el("div", "ed-fields");
    [["Held by", provider.credentialOwner || provider.name],
      ["Isolation", provider.isolation || "Each profile owns its own login directory"],
      ["Shown here", "Never. No key, token or profile file is read, rendered or exported by Settings."],
      ["Sign-in", provider.oauthNote || "Puppet Master selects the profile and launches the provider's own login."]].forEach(function (pair) {
      fields.appendChild(text("div", "ed-field-label", pair[0]));
      fields.appendChild(text("div", "ed-field-value", String(pair[1])));
    });
    inner.appendChild(fields);
    (provider.accounts || []).forEach(function (acc) {
      var row = el("div", "ed-att-item");
      row.setAttribute("data-ed-rowid", acc.id);
      row.setAttribute("tabindex", "-1");
      row.appendChild(el("div", "ed-att-icon", ICON("key", 14)));
      var t = el("div", null);
      t.appendChild(text("div", "ed-att-label", acc.nickname || acc.identity));
      t.appendChild(text("div", "ed-att-detail", "Signed in through " + (provider.credentialOwner || provider.name) + " in " + (acc.connection || "its own profile") + "."));
      row.appendChild(t);
      row.appendChild(chip(acc.status === "connected" ? "ok" : "attention", acc.statusWord || humanise(acc.status)));
      inner.appendChild(row);
    });
  }

  function providerInstallations(inner, provider, spec, r) {
    providerHead(inner, provider, "What is on this machine, which installation this Project uses, and how it was identified.");
    var eff = FX.effects();
    var data = providerData();
    var mine = data.installs.filter(function (i) { return i.providerFamilyId === provider.id; });
    var others = data.installs.filter(function (i) { return i.providerFamilyId !== provider.id; });

    if (!mine.length) {
      inner.appendChild(text("div", "ed-empty-line",
        "Nothing is installed for " + provider.name + " on this machine. Installing is an explicit step you start, for one exact host, from the provider's official source."));
    }

    function installBox(inst) {
      var id = inst.installationId || inst.id;
      var box = el("div", "ed-owner");
      box.setAttribute("data-pm-object", id);
      box.setAttribute("tabindex", "-1");
      var head = el("div", "ed-detail-head");
      head.appendChild(text("div", "ed-owner-name", inst.configuredCommand || inst.product || humanise(id)));
      var unknown = inst.confidence === "unknown" || inst.installationOwnerKind === "unknown" || eff.unknownOwner;
      head.appendChild(chip(unknown ? "attention" : "ok", unknown ? "Owner cannot be named" : humanise(inst.confidence || "proven")));
      if (eff.updateAvailable) head.appendChild(chip("setup", "Update staged", "download"));
      box.appendChild(head);
      var fields = el("div", "ed-fields");
      [["Host", inst.hostLabel || inst.hostName || "This computer"],
        ["Resolved path", inst.resolvedPath || "Not resolved"],
        ["Owner", inst.ownerIdentity || "Not established"],
        ["Generation", inst.currentVersion || inst.version || "Unknown"],
        ["Update policy", inst.updatePolicy ? (inst.updatePolicy.check + " check · " + inst.updatePolicy.install + " to install") : "Manual only"],
        ["Bound by", "Identity, so a change in PATH order cannot move it"]].forEach(function (pair) {
        fields.appendChild(text("div", "ed-field-label", pair[0]));
        fields.appendChild(text("div", "ed-field-value", String(pair[1])));
      });
      box.appendChild(fields);
      if (unknown) {
        box.appendChild(text("div", "ed-quiet",
          "Manual only. Puppet Master will not adopt, update or repair an installation whose owner it cannot establish."));
      }
      if (eff.updateAvailable) {
        var acts = el("div", "ed-notice-acts");
        var b = btn("ed-btn ed-btn-primary ed-btn-small", "");
        b.appendChild(text("span", null, "Review the staged generation"));
        on(b, "click", function () {
          MGR.act({ managerId: "manager-providers" }, { id: "provider.install.update", label: "Review the staged generation" }, { id: id });
        });
        acts.appendChild(b);
        box.appendChild(acts);
        box.appendChild(text("div", "ed-quiet",
          "Automatic update policy applies to an installation that was already acquired and bound. It never acquires the first copy."));
      }
      return box;
    }

    mine.forEach(function (inst) { inner.appendChild(installBox(inst)); });

    if (mine.length > 1 || eff.multiInstall) {
      inner.appendChild(text("p", "ed-prose",
        "More than one candidate was found for this family. The one this Project uses is bound by identity and named first; the others are shadowed and stay listed so the choice can be checked rather than guessed."));
    }

    /* Every installation the index can name has to be reachable, whichever family
     * it belongs to, or a search result would land on an empty screen. */
    if (others.length) {
      var more = block(inner, "Found for other families", others.length + " on this machine");
      others.forEach(function (inst) { more.appendChild(installBox(inst)); });
    }
  }

  function providerLimits(inner, provider, spec) {
    providerHead(inner, provider, "What this Project decides about routing, and what belongs to Usage.");
    var fields = el("div", "ed-fields");
    [["Routing", (provider.routing && provider.routing.note) || "Follows this Project's order of preference"],
      ["Owned here", "Which account is preferred, whether a thread sticks to one account, and the reserve kept for verification"],
      ["Owned by Usage", "Measurement, history, projection and the definition of a billing period"]].forEach(function (pair) {
      fields.appendChild(text("div", "ed-field-label", pair[0]));
      fields.appendChild(text("div", "ed-field-value", String(pair[1])));
    });
    inner.appendChild(fields);

    var usageSec = null;
    (spec.sections || []).forEach(function (sec) { if (sec.id === "usage-end") usageSec = sec; });
    if (usageSec) {
      var b = block(inner, usageSec.label, usageSec.summary);
      renderSpecTable(b, usageSec);
    }

    var rowsSec = null;
    (spec.sections || []).forEach(function (sec) { if (sec.kind === "rows") rowsSec = sec; });
    if (rowsSec) {
      var rb = block(inner, rowsSec.label, rowsSec.summary);
      renderSpecRows(rb, spec, rowsSec, {});
    }

    var usageOwner = btn("ed-btn ed-btn-small", ICON("gauge", 12));
    usageOwner.appendChild(text("span", null, "Open Usage"));
    on(usageOwner, "click", function () { go({ kind: "manager", managerId: "manager-usage" }); });
    inner.appendChild(usageOwner);
  }

  function providerLogs(inner, provider, spec) {
    providerHead(inner, provider, "The evidence behind every readiness word on this screen.");
    (spec.diagnostics || []).forEach(function (d) {
      destRow(inner, {
        quiet: true, icon: "fileText", title: d.label,
        desc: "Read-only. Retention is bounded by size, oldest first.",
        onClick: function () { MGR.act({ managerId: "manager-providers" }, { id: d.id, label: d.label }, null); }
      });
    });
    (spec.notes || []).forEach(function (note) { inner.appendChild(text("p", "ed-prose", note)); });
    destRow(inner, {
      quiet: true, icon: "wrench", title: "Doctor",
      desc: "The whole-Project health projection, with the owner that can repair each finding.",
      managerId: "manager-doctor",
      onClick: function () { go({ kind: "manager", managerId: "manager-doctor" }); }
    });
  }

  /* ================================================================ absent */

  function renderAbsent(sheet) {
    var res = ui.notice || { reason: "That link does not name a place in Settings.", quoted: RT.href(ui.route) };
    sheetHead(sheet, {
      eyebrow: "Settings",
      title: "That link cannot be opened",
      lede: res.reason
    });
    var box = el("div", "ed-owner");
    box.appendChild(text("div", "ed-owner-label", "The link"));
    box.appendChild(text("div", "ed-code", res.quoted || ""));
    sheet.appendChild(box);
    var acts = el("div", "ed-notice-acts");
    var home = btn("ed-btn ed-btn-primary", "");
    home.appendChild(text("span", null, "Go to Settings home"));
    on(home, "click", function () { go({ kind: "home" }, true); });
    acts.appendChild(home);
    var all = btn("ed-btn", "");
    all.appendChild(text("span", null, "Search all settings"));
    on(all, "click", function () { go({ kind: "all" }); });
    acts.appendChild(all);
    sheet.appendChild(acts);
  }

  /* ================================================================ keyboard */

  /* Escape closes the top layer only, then walks one Settings level out, and
   * stops at Home rather than closing Settings from under the reader. */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (ui.dropOpen) { closeDrop(); return; }
    if (ui.width === "narrow" && ui.route.kind === "manager" && ui.mgrPane[ui.route.managerId] === "detail") {
      ui.mgrPane[ui.route.managerId] = "roster";
      render();
      return;
    }
    if (ui.route.kind === "home" && !ui.notice) return;
    goUp();
  });

  document.addEventListener("mousedown", function (e) {
    if (!ui.dropOpen) return;
    if (dropEl.contains(e.target) || searchInput === e.target) return;
    closeDrop();
  }, true);

  window.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  });

  window.addEventListener("resize", function () { measure(); });

  /* =================================================================== boot */

  buildChrome();
  RT.onChange(function (route) { applyRoute(route); });
  applyRoute(RT.current());
  measure();
  window.setTimeout(measure, 60);
  window.setTimeout(measure, 240);
})();
