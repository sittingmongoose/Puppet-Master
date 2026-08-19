/* Opus 5 — Command (concept 10).
 *
 * Thesis: Settings for someone who knows where they are going. A command index of
 * the twelve areas on the left, and every step deeper ADDS a pane on the right
 * rather than replacing the pane you were reading, so the trail you took is still
 * on screen while you work at the end of it.
 *
 * The reference for this concept is a fake terminal. Only its LAYOUT is borrowed —
 * the index, the left-to-right pane cascade, the compact tables, the editor that
 * opens beneath its own row, the visible path, the transactional copy panels. The
 * skin is thrown away entirely: everything here is drawn from --pm-* theme tokens,
 * every label is an ordinary human sentence, and monospace is used only where the
 * value really is literal (a file path, a manager id, a key fingerprint, a version).
 *
 * What this file owns: every pixel. What it does not own: any fact. Domains, pages,
 * sections, the 828 settings, manager specs, search results, routes, the copy
 * transaction and the state fixtures all come from shared2, which draws nothing.
 *
 * Portability note (Slint 1.17.1): the pane cascade is an explicit list of pane
 * descriptors derived from the route — never a stack mutated in place — so the same
 * model ports to a repeater over a model of pane records. Long lists go through
 * PMVirtual. Geometry is measured only to scroll an arrival into view.
 */
(function () {
  "use strict";

  var CONCEPT_ID = "concept-10-command-suite";
  var M = window.PM2Model;
  var IX = window.PM2Index;
  var RT = window.PM2Route;
  var MG = window.PM2Managers;
  var ST = window.PM2States;
  var CP = window.PM2Copy;

  var store = window.PM2Store.create(CONCEPT_ID);
  CP.attach(store);

  var shell = null;
  var root = null;        /* .cs */
  var headEl = null;      /* .cs-head */
  var deckEl = null;      /* .cs-deck   — carries data-pm-surface */
  var situationEl = null; /* .cs-situation */
  var panesEl = null;     /* .cs-panes  — the flex row of panes */

  /* Presentation state. Deliberately NOT persisted: none of it is a fact about the
   * Project, and restoring an open dropdown after a reload would be a lie. */
  var ui = {
    query: "",
    results: null,
    dropOpen: false,
    activeResult: -1,
    openAdvanced: {},        /* sectionId -> true   (exposure disclosure) */
    openDetails: {},         /* settingId -> true   ("Why this value?") */
    managerRow: {},          /* managerId -> selected row id */
    facets: { domains: [], kinds: [], exposures: [], changedOnly: false },
    copy: { step: 1, source: null, domains: null, preview: null, run: null, receipt: null },
    errors: {},              /* settingId -> message */
    pending: null,           /* the arrival to reveal after the next paint */
    paneScroll: {},          /* paneKey -> scrollTop, so a pane keeps its place */
    focusPane: 0,            /* which pane the keyboard is in */
    cursor: {}               /* paneKey -> index of the focused item in that pane */
  };

  var capacity = 3;
  var narrow = false;
  var lastFixture = null;
  var lastKeys = [];         /* the pane keys of the previous render, for motion */

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

  function cssEscape(v) {
    if (window.CSS && window.CSS.escape) return window.CSS.escape(v);
    return String(v).replace(/([^\w-])/g, "\\$1");
  }

  /* Monospace is reserved for values that really are literal. This wraps one. */
  function literal(text) {
    var s = el("span", "cs-literal", esc(text));
    return s;
  }

  function shortValue(v) {
    if (v == null || v === "") return "not set";
    if (Array.isArray(v)) return v.length ? (v.length === 1 ? String(v[0]) : v.length + " entries") : "nothing set";
    if (v === true) return "On";
    if (v === false) return "Off";
    return String(v);
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

  /* The human breadcrumb is the primary name of a place, everywhere. The literal
   * route is technical detail and is only ever shown as a secondary line. */
  function humanPath(route) {
    return trail(route).map(function (s) { return s.label; }).join(" › ");
  }

  /* Every navigation keeps the active situation in the route, so a deep link a
   * reviewer copies reproduces the exact screen rather than the happy path. */
  function go(dest) { return RT.go(keepState(dest)); }

  /* ---------------------------------------------------------------- the shell */

  function boot() {
    shell = window.PMShell.mount({
      rootId: "pm-root",
      concept: "Command · keyboard first, panes left to right",
      conceptId: CONCEPT_ID,
      theme: document.documentElement.getAttribute("data-theme") || "friendly-dark",
      defaultTheme: "friendly-dark",
      onLayout: measure,
      onWidthMode: function () { if (measure()) render(); }
    });
    /* The shell's own Demo state select and Reset belong to concepts 01-04: they
     * read a different fixture list and clear a storage namespace this concept does
     * not own. Two controls that look identical and do different things is worse
     * than one, so the stale pair goes and this concept ships its own. */
    ST.removeShellControl(shell);

    root = el("div", "cs");
    root.setAttribute("data-concept", CONCEPT_ID);

    headEl = el("header", "cs-head");
    deckEl = el("div", "cs-deck");
    situationEl = el("div", "cs-situation");
    panesEl = el("div", "cs-panes");
    deckEl.appendChild(situationEl);
    deckEl.appendChild(panesEl);

    root.appendChild(headEl);
    root.appendChild(deckEl);
    shell.main.appendChild(root);

    document.addEventListener("keydown", onKeydown, true);

    RT.onChange(function () {
      /* A route write made while the reader is typing is bookkeeping, not
       * navigation: re-rendering there would rebuild the field under the caret. */
      if (quiet) return;
      ui.dropOpen = false;
      render();
    });
    window.addEventListener("resize", function () { if (measure()) render(); });
    window.addEventListener("pm-concept-state-applied", function () { measure(); render(); });

    measure();
    applyFixtureQuery();
    render();
  }

  /* How many panes fit. Derived at explicit checkpoints from the width of the app's
   * main column — never per frame, and never the source of anything semantic.
   * Returns true when the answer changed, which is the only reason to re-render. */
  function measure() {
    var w = (shell && shell.main ? shell.main.clientWidth : 0) || window.innerWidth;
    var next = w < 620 ? 1 : (w < 1000 ? 2 : (w < 1700 ? 3 : 4));
    var changed = next !== capacity;
    capacity = next;
    narrow = capacity === 1;
    if (root) {
      root.setAttribute("data-capacity", String(capacity));
      root.setAttribute("data-narrow", narrow ? "true" : "false");
    }
    return changed;
  }

  /* --------------------------------------------------------------- the router */

  /* One render pass: rebuild the header, work out the pane cascade for the current
   * route, show the ones that fit, and let the chips stand in for the rest. */
  function render() {
    var route = RT.current();
    var check = RT.resolve(route);

    measure();

    var fixture = ST.active();
    if (fixture !== lastFixture) {
      lastFixture = fixture;
      MG.invalidate();
      applyFixtureQuery();
    }

    if (check.ok) rememberVisit(route);
    var panes = check.ok ? cascade(route) : brokenCascade(check, route);
    var visible = visibleSlice(panes);

    deckEl.setAttribute("data-pm-surface", check.ok ? surfaceWord(route) : "notice");
    if (check.ok && route.kind === "manager") deckEl.setAttribute("data-pm-manager", route.managerId);
    else deckEl.removeAttribute("data-pm-manager");

    renderHead(route, check, panes, visible);
    renderSituation();

    /* Direction of travel, decided before the DOM is touched: a deeper cascade adds
     * a pane on the right, Back removes one and the reveal runs the other way. */
    var keys = panes.map(function (p) { return p.key; });
    var direction = keys.length > lastKeys.length ? "deeper" : (keys.length < lastKeys.length ? "back" : "same");
    lastKeys = keys;

    clear(panesEl);
    visible.forEach(function (pane, i) {
      panesEl.appendChild(buildPane(pane, i, visible.length, direction));
    });

    revealPending();
  }

  function surfaceWord(route) {
    if (route.kind === "home") return "home";
    if (route.kind === "query") return "search";
    if (route.kind === "manager") return "manager";
    if (route.kind === "all") return "all";
    if (route.kind === "copy") return "copy";
    if (route.kind === "domain") return route.pageId ? "page" : "domain";
    return "home";
  }

  /* Which panes are on screen. The command index is the concept: at every width
   * that can hold two panes it keeps its place on the left and the cascade windows
   * from the right, so the leftmost pane never moves. At one pane the deepest one
   * wins and the chips carry everything behind it. */
  function visibleSlice(panes) {
    if (panes.length <= capacity) return panes;
    if (capacity === 1) return [panes[panes.length - 1]];
    return [panes[0]].concat(panes.slice(panes.length - (capacity - 1)));
  }

  function buildPane(pane, position, count, direction) {
    var box = el("section", "cs-pane");
    box.setAttribute("data-kind", pane.kind);
    box.setAttribute("data-pane-key", pane.key);
    if (pane.wide) box.setAttribute("data-wide", "1");
    if (pane.fixed) box.setAttribute("data-fixed", "1");
    box.setAttribute("aria-label", pane.title);

    /* Motion explains location. Deeper: the new rightmost pane arrives from the
     * right edge. Back: the panes that are revealed run the other way. The leftmost
     * pane is never animated, which is what makes the cascade legible. */
    if (direction === "deeper" && position === count - 1 && count > 1) box.setAttribute("data-enter", "right");
    else if (direction === "back" && position > 0) box.setAttribute("data-enter", "left");

    var head = el("header", "cs-pane-head");
    var title = el("span", "cs-pane-title", esc(pane.title));
    head.appendChild(title);
    if (pane.meta) head.appendChild(el("span", "cs-pane-meta", esc(pane.meta)));
    if (pane.headExtra) head.appendChild(pane.headExtra());
    box.appendChild(head);

    var body = el("div", "cs-pane-body cs-scroll");
    body.setAttribute("data-pane-body", pane.key);
    pane.render(body, pane);
    box.appendChild(body);

    /* A pane keeps its scroll position across renders and across a collapse, so
     * coming back from a narrow width lands where the reader left off. */
    var saved = ui.paneScroll[pane.key];
    if (saved) body.scrollTop = saved;
    on(body, "scroll", function () { ui.paneScroll[pane.key] = body.scrollTop; });

    return box;
  }

  /* ------------------------------------------------------------- the cascade */

  /* The whole navigation model, in one function: a route becomes an ordered list of
   * panes. Nothing else in the file decides what is on screen. */
  function cascade(route) {
    var panes = [];

    if (route.kind === "home" || route.kind === "query") {
      if (narrow) {
        /* At one pane Home does not hide its destinations behind a chip: the
         * overview facts sit above the twelve areas in a single column. */
        panes.push({ key: "home", kind: "home", title: "Settings", meta: plural(M.counts.settings, "setting"),
          render: renderHomeSingle });
        return panes;
      }
      panes.push(indexPane());
      panes.push({ key: "overview", kind: "overview", title: "This Project", meta: M.project.kind,
        render: renderOverview });
      return panes;
    }

    panes.push(indexPane());

    if (route.kind === "all") {
      panes.push({ key: "all", kind: "all", title: "All settings", wide: true,
        meta: plural(M.counts.settings, "setting"), render: renderAll });
      return panes;
    }

    if (route.kind === "copy") {
      panes.push({ key: "copy", kind: "copy", title: "Copy settings from another Project", wide: true,
        meta: "Step " + ui.copy.step + " of 4", render: renderCopy });
      return panes;
    }

    if (route.kind === "manager") {
      var mdom = managerDomain(route.managerId);
      var mdomain = mdom ? M.domain(mdom) : null;
      if (mdomain) panes.push(domainPane(mdomain));
      panes.push(managerPane(route));
      var sub = subpagePane(route);
      if (sub) panes.push(sub);
      return panes;
    }

    if (route.kind === "domain") {
      var domain = M.domain(route.domainId);
      if (!domain) return panes;
      panes.push(domainPane(domain));
      if (!route.pageId) return panes;
      var page = M.page(route.pageId);
      if (!page) return panes;
      panes.push(pagePane(domain, page, route));
      var section = currentSection(page, route);
      if (section) panes.push(sectionPane(page, section, route));
    }
    return panes;
  }

  /* A well-formed link naming something this Project does not have still shows the
   * index and the reason, quoting the link it was given. */
  function brokenCascade(check, route) {
    return [indexPane(), {
      key: "notice", kind: "notice", title: "That link did not resolve", wide: true,
      meta: check.code === "malformed" ? "Not a Settings location" : "Nothing here to open",
      render: function (body) { renderBrokenLink(body, check); }
    }];
  }

  function currentSection(page, route) {
    var sections = page.sections || [];
    if (!sections.length) return null;
    var wanted = route.sectionId;
    if (route.settingId) {
      var rec = M.setting(route.settingId);
      if (rec) wanted = rec.sectionId;
    }
    for (var i = 0; i < sections.length; i++) if (sections[i].id === wanted) return sections[i];
    return sections[0];
  }

  /* ------------------------------------------------------------ the head bar */

  function renderHead(route, check, panes, visible) {
    clear(headEl);

    var row = el("div", "cs-head-row");

    var back = backTarget(route);
    var backBtn = button("cs-btn cs-btn--ghost", icon("chevronLeft", 13) + "<span>Back to " + esc(back.label) + "</span>",
      function () { go(back.dest); });
    backBtn.setAttribute("data-pm-back", "");
    backBtn.hidden = route.kind === "home" || route.kind === "query";
    row.appendChild(backBtn);

    /* The chips are the breadcrumb AND the stand-in for every pane that does not
     * fit. A chip whose pane is off screen is marked, and pressing it brings that
     * step back by routing to it. */
    var visibleKeys = {};
    visible.forEach(function (p) { visibleKeys[p.key] = true; });
    var chips = el("nav", "cs-chips");
    chips.setAttribute("data-pm-breadcrumb", "");
    chips.setAttribute("aria-label", "Breadcrumb");
    var steps = trail(route);
    steps.forEach(function (step, i) {
      if (i) chips.appendChild(el("span", "cs-chip-sep", "›"));
      var chip = button("cs-chip", esc(step.label), step.dest ? function () { go(step.dest); } : null);
      if (step.paneKey && !visibleKeys[step.paneKey]) chip.setAttribute("data-off", "1");
      if (i === steps.length - 1) chip.setAttribute("aria-current", "page");
      chips.appendChild(chip);
    });
    row.appendChild(chips);

    row.appendChild(el("span", "cs-head-spacer"));

    var project = el("span", "cs-project");
    project.setAttribute("data-pm-project", "");
    project.innerHTML = icon("folder", 13) + "<span>" + esc(M.project.name) + "</span>";
    project.title = M.project.kind + " — " + M.project.path;
    row.appendChild(project);

    var close = button("cs-btn cs-btn--ghost", icon("ban", 13) + "<span>Close Settings</span>", function () {
      shell.announce("Close Settings would return to the surface that opened Settings.");
      window.PMSim.run({
        label: "Close Settings",
        detail: "Returns to the surface that opened Settings — in this prototype, the shell stays put.",
        realCall: "cmd.settings.close"
      });
    });
    close.setAttribute("data-pm-close", "");
    row.appendChild(close);

    headEl.appendChild(row);

    var row2 = el("div", "cs-head-row cs-head-row--find");
    row2.appendChild(searchField(route.kind === "home" || route.kind === "query"));
    row2.appendChild(stateControl());
    headEl.appendChild(row2);
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
      var d = M.domain(route.domainId);
      return { label: (d && d.title) || "Settings", dest: { kind: "domain", domainId: route.domainId } };
    }
    if (route.kind === "domain") return { label: "Settings Home", dest: { kind: "home" } };
    if (route.kind === "manager") {
      if (route.sectionKey) {
        var rec = MG.record(route.managerId);
        return { label: (rec && rec.title) || "the manager", dest: { kind: "manager", managerId: route.managerId, objectId: route.objectId || null } };
      }
      var md = managerDomain(route.managerId);
      var dom = md ? M.domain(md) : null;
      return dom ? { label: dom.title, dest: { kind: "domain", domainId: dom.id } }
        : { label: "Settings Home", dest: { kind: "home" } };
    }
    return { label: "Settings Home", dest: { kind: "home" } };
  }

  /* The breadcrumb is the primary name of every step. Each entry carries the key of
   * the pane it stands for so the chip can say whether that pane is on screen. */
  function trail(route) {
    var out = [{ label: "Settings", dest: { kind: "home" }, paneKey: "index" }];
    if (route.kind === "all") out.push({ label: "All settings", dest: null, paneKey: "all" });
    if (route.kind === "copy") out.push({ label: "Copy settings from another Project", dest: null, paneKey: "copy" });
    if (route.kind === "query") out.push({ label: "Search", dest: null, paneKey: "overview" });
    if (route.kind === "domain") {
      var d = M.domain(route.domainId);
      if (d) {
        out.push({ label: d.title, dest: route.pageId ? { kind: "domain", domainId: d.id } : null, paneKey: "domain:" + d.id });
        if (route.pageId) {
          var p = M.page(route.pageId);
          if (p) {
            out.push({ label: p.title, dest: { kind: "domain", domainId: d.id, pageId: p.id }, paneKey: "page:" + p.id });
            var section = currentSection(p, route);
            if (section) out.push({ label: section.title, dest: null, paneKey: "section:" + section.id });
          }
        }
      }
    }
    if (route.kind === "manager") {
      var md = managerDomain(route.managerId);
      var domain = md ? M.domain(md) : null;
      if (domain) out.push({ label: domain.title, dest: { kind: "domain", domainId: domain.id }, paneKey: "domain:" + domain.id });
      var mrec = MG.record(route.managerId);
      out.push({
        label: (mrec && mrec.title) || route.managerId,
        dest: route.sectionKey ? { kind: "manager", managerId: route.managerId, objectId: route.objectId || null } : null,
        paneKey: "manager:" + route.managerId
      });
      if (route.sectionKey) out.push({ label: subpageLabel(route), dest: null, paneKey: "sub:" + route.managerId + ":" + route.sectionKey });
    }
    return out;
  }

  /* ------------------------------------------------------- the situation strip */

  /* Which deterministic situation is on screen, stated inside the Settings surface
   * so a screenshot is self-describing and nobody has to guess why a roster is
   * empty or a value is locked. */
  function renderSituation() {
    clear(situationEl);
    var f = ST.activeFixture();
    if (!f || f.id === "normal") { situationEl.hidden = true; return; }
    situationEl.hidden = false;
    var box = el("div", "cs-sit");
    box.innerHTML = icon("beaker", 13);
    var body = el("div", "cs-sit-body");
    body.appendChild(el("span", "cs-sit-label", esc(f.label)));
    body.appendChild(el("span", "cs-sit-note", esc(f.note)));
    box.appendChild(body);
    box.appendChild(button("cs-btn cs-btn--ghost", "Back to normal", function () {
      goFixture("normal");
    }));
    situationEl.appendChild(box);
  }

  function stateControl() {
    var wrap = el("div", "cs-statectl");
    var id = "cs-state-select";
    var label = el("label", "cs-statectl-label", "Situation");
    label.setAttribute("for", id);
    wrap.appendChild(label);

    var sel = el("select", "cs-select");
    sel.id = id;
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
    sel.value = ST.active();
    on(sel, "change", function () { goFixture(sel.value); });
    wrap.appendChild(sel);

    wrap.appendChild(button("cs-btn cs-btn--ghost", icon("undo", 13) + "<span>Reset</span>", function () {
      store.reset();
      MG.invalidate();
      ui.openDetails = {}; ui.openAdvanced = {}; ui.errors = {}; ui.managerRow = {};
      ui.copy = { step: 1, source: null, domains: null, preview: null, run: null, receipt: null };
      render();
      shell.announce("Every change made in this concept was cleared.");
    }));
    return wrap;
  }

  function goFixture(id) {
    var dest = RT.withState(RT.current(), id === "normal" ? null : id);
    ui.query = ""; ui.results = null; ui.dropOpen = false;
    MG.invalidate();
    withoutRender(function () { RT.replace(dest); });
    lastFixture = ST.active();
    applyFixtureQuery();
    render();
    var f = ST.activeFixture();
    shell.announce("Situation: " + (f ? f.label : id));
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

  function renderBrokenLink(body, check) {
    var box = el("div", "cs-block");
    box.appendChild(el("h3", "cs-block-title", esc(
      check.code === "malformed"
        ? "That link is not a Settings location"
        : "That link points at something this Project does not have")));
    box.appendChild(el("p", "cs-prose", esc(check.reason || "")));
    var quoted = el("p", "cs-prose", "The link was ");
    quoted.appendChild(literal(check.quoted || location.hash));
    quoted.appendChild(document.createTextNode(". The command index is still on the left; nothing was changed."));
    box.appendChild(quoted);
    var acts = el("div", "cs-actions");
    acts.appendChild(button("cs-btn cs-btn--primary", "Go to Settings Home", function () { go({ kind: "home" }); }));
    box.appendChild(acts);
    body.appendChild(box);
  }

  /* --------------------------------------------------------- the command index */

  /* Twelve areas, twelve jump keys, in the order the model publishes them. The keys
   * are the number row, which is what a reader who already knows where they are
   * going will reach for; every one of them is really bound in onKeydown, so the
   * hint is never decoration. */
  var AREA_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="];
  var UTIL_KEYS = { home: "H", all: "A", copy: "C", doctor: "D" };

  function indexPane() {
    return {
      key: "index", kind: "index", fixed: true,
      title: "Command index",
      meta: plural(M.domains.length, "area"),
      render: renderIndex
    };
  }

  function keyChip(k) {
    var c = el("kbd", "cs-key", esc(k));
    return c;
  }

  function renderIndex(body) {
    var route = RT.current();
    var group = el("div", "cs-idx-group");
    group.appendChild(el("div", "cs-idx-label", "Areas"));

    M.domains.forEach(function (d, i) {
      var b = button("cs-idx", null, function () { go({ kind: "domain", domainId: d.id }); });
      b.setAttribute("data-pm-domain", d.id);
      b.setAttribute("data-cs-item", "1");
      b.appendChild(keyChip(AREA_KEYS[i] || "·"));
      b.appendChild(el("span", "cs-idx-ico", icon(d.icon, 14)));
      b.appendChild(el("span", "cs-idx-name", esc(d.title)));
      b.appendChild(el("span", "cs-idx-n", String(d.count)));
      if (route.domainId === d.id || (route.managerId && managerDomain(route.managerId) === d.id)) {
        b.setAttribute("aria-current", "true");
      }
      group.appendChild(b);
    });
    body.appendChild(group);

    var utils = el("div", "cs-idx-group");
    utils.appendChild(el("div", "cs-idx-label", "Everything else"));

    function util(keyWord, iconName, label, meta, dest, active) {
      var b = button("cs-idx", null, function () { go(dest); });
      b.setAttribute("data-cs-item", "1");
      b.appendChild(keyChip(keyWord));
      b.appendChild(el("span", "cs-idx-ico", icon(iconName, 14)));
      b.appendChild(el("span", "cs-idx-name", esc(label)));
      if (meta) b.appendChild(el("span", "cs-idx-n", esc(meta)));
      if (active) b.setAttribute("aria-current", "true");
      utils.appendChild(b);
    }

    util(UTIL_KEYS.home, "map", "Settings Home", "", { kind: "home" },
      route.kind === "home" || route.kind === "query");
    util(UTIL_KEYS.all, "list", "All settings", String(M.counts.settings), { kind: "all" }, route.kind === "all");
    util(UTIL_KEYS.copy, "download", "Copy from another Project", "", { kind: "copy", step: "source" }, route.kind === "copy");
    util(UTIL_KEYS.doctor, "beaker", "Check this Project", "", { kind: "manager", managerId: "manager-doctor" },
      route.managerId === "manager-doctor");
    body.appendChild(utils);

    var hint = el("div", "cs-idx-hint");
    hint.appendChild(el("span", null, "Up and down move in a pane, left and right move between panes, Enter opens, Escape steps back one pane."));
    body.appendChild(hint);
  }

  /* ------------------------------------------------------------------- home */

  function projectBlock() {
    var box = el("div", "cs-ctx");
    box.appendChild(el("div", "cs-ctx-eyebrow", "Everything here applies to"));
    box.appendChild(el("div", "cs-ctx-name", esc(M.project.name)));
    var meta = el("div", "cs-ctx-meta");
    meta.appendChild(el("span", null, esc(M.project.kind)));
    meta.appendChild(el("span", "cs-dotsep", "·"));
    meta.appendChild(literal(M.project.path));
    box.appendChild(meta);
    box.appendChild(el("p", "cs-ctx-note",
      "Changing something in Settings changes it for this Project only. Nothing here is shared with another Project and nothing is copied out on its own."));
    return box;
  }

  function glanceBlock() {
    var fx = ST.effects();
    var attention = ((ST.attentionGroups().filter(function (g) { return g.id === "attention"; })[0]
      || { items: [] }).items).filter(function (a) { return !store.isDismissed(a.id); });
    var managers = M.FAMILIES.length + M.EXTRA_MANAGERS.length + M.DEFERRED.length;

    var box = el("section", "cs-block");
    box.appendChild(el("h3", "cs-block-title", "At a glance"));
    var grid = el("div", "cs-glance");
    [
      { k: "Settings in this Project", v: M.counts.settings, note: plural(M.counts.pages, "page") + " in " + plural(M.counts.domains, "area") },
      { k: "Changed from the default", v: store.changedCount(), note: "Values this Project set itself" },
      { k: "Needs attention", v: attention.length, note: attention.length ? "Listed below" : "Nothing waiting" },
      { k: "Managers and tools", v: managers, note: "Rosters, catalogues and setup" }
    ].forEach(function (cell) {
      var c = el("div", "cs-glance-cell");
      c.appendChild(el("div", "cs-glance-v", String(cell.v)));
      c.appendChild(el("div", "cs-glance-k", esc(cell.k)));
      c.appendChild(el("div", "cs-glance-note", esc(fx.refreshing ? "Refreshing — last read a moment ago" : cell.note)));
      grid.appendChild(c);
    });
    box.appendChild(grid);
    return box;
  }

  function recentBlock() {
    var recent = (store.get().recent || []).slice(0, 6);
    var box = el("section", "cs-block");
    box.appendChild(el("h3", "cs-block-title", "Recently accessed"));
    if (!recent.length) {
      box.appendChild(el("p", "cs-prose",
        "Nothing yet in this session. Open an area from the index and the last places you worked in will be listed here."));
      return box;
    }
    var list = el("div", "cs-recent");
    recent.forEach(function (r) {
      var b = button("cs-recent-row", null, function () { go(r.dest); });
      b.setAttribute("data-cs-item", "1");
      b.appendChild(el("span", "cs-recent-name", esc(r.label)));
      b.appendChild(el("span", "cs-recent-path", esc(r.path || "")));
      b.appendChild(el("span", "cs-recent-when", esc(r.when || "")));
      list.appendChild(b);
    });
    box.appendChild(list);
    return box;
  }

  function renderOverview(body) {
    body.appendChild(projectBlock());

    var notice = ST.notice();
    if (notice && !store.isDismissed(notice.id)) body.appendChild(renderNotice(notice));

    body.appendChild(renderAttention());
    body.appendChild(glanceBlock());
    body.appendChild(recentBlock());
    body.appendChild(secondaryBlock());
  }

  /* One pane wide: the same material in the order the reader needs it, with the
   * twelve areas kept as the dominant block rather than pushed behind a chip. */
  function renderHomeSingle(body) {
    body.appendChild(projectBlock());

    var notice = ST.notice();
    if (notice && !store.isDismissed(notice.id)) body.appendChild(renderNotice(notice));
    body.appendChild(renderAttention());

    var areas = el("section", "cs-block");
    areas.appendChild(el("h3", "cs-block-title", "Areas"));
    var list = el("div", "cs-idx-group");
    M.domains.forEach(function (d, i) {
      var b = button("cs-idx cs-idx--roomy", null, function () { go({ kind: "domain", domainId: d.id }); });
      b.setAttribute("data-pm-domain", d.id);
      b.setAttribute("data-cs-item", "1");
      b.appendChild(keyChip(AREA_KEYS[i] || "·"));
      var text = el("span", "cs-idx-text");
      text.appendChild(el("span", "cs-idx-name", esc(d.title)));
      text.appendChild(el("span", "cs-idx-purpose", esc(d.purpose)));
      b.appendChild(text);
      b.appendChild(el("span", "cs-idx-n", String(d.count)));
      list.appendChild(b);
    });
    areas.appendChild(list);
    body.appendChild(areas);

    body.appendChild(glanceBlock());
    body.appendChild(recentBlock());
    body.appendChild(secondaryBlock());
  }

  /* Secondary on purpose: quiet text rows under everything that matters more. */
  function secondaryBlock() {
    var box = el("section", "cs-block cs-block--quiet");
    box.appendChild(el("h3", "cs-block-title", "Also here"));
    var list = el("div", "cs-links");
    function link(iconName, label, note, dest) {
      var b = button("cs-link", null, function () { go(dest); });
      b.setAttribute("data-cs-item", "1");
      b.appendChild(el("span", "cs-link-ico", icon(iconName, 13)));
      b.appendChild(el("span", "cs-link-name", esc(label)));
      b.appendChild(el("span", "cs-link-note", esc(note)));
      list.appendChild(b);
    }
    link("list", "All settings", "Every record in one filtered index", { kind: "all" });
    link("download", "Copy settings from another Project", "A one-time transaction with a preview and a rollback", { kind: "copy", step: "source" });
    link("history", "Changed from the default", "The values this Project set itself", { kind: "all", facet: "" });
    link("beaker", "Check this Project", "Run every readiness check and read the evidence", { kind: "manager", managerId: "manager-doctor" });
    box.appendChild(list);
    return box;
  }

  function renderNotice(notice) {
    var box = el("div", "cs-notice");
    box.setAttribute("data-pm-notice", "");
    box.setAttribute("data-tone", notice.tone || "attention");
    box.appendChild(el("span", "cs-notice-ico", icon("alert", 15)));
    var bodyEl = el("div", "cs-notice-body");
    bodyEl.appendChild(el("div", "cs-notice-head", esc(notice.headline)));
    bodyEl.appendChild(el("p", "cs-notice-detail", esc(notice.detail)));
    box.appendChild(bodyEl);
    var acts = el("div", "cs-notice-act");
    if (notice.action) {
      acts.appendChild(button("cs-btn cs-btn--primary", esc(notice.action.label), function () {
        go(destinationRoute(notice.action.destination));
      }));
    }
    acts.appendChild(button("cs-btn cs-btn--ghost", icon("ban", 13) + "<span>Dismiss</span>", function () {
      store.dismiss(notice.id); render();
    }));
    box.appendChild(acts);
    return box;
  }

  function renderAttention() {
    var fx = ST.effects();
    var items = ST.attentionFlat().filter(function (a) { return !store.isDismissed(a.id); });
    var box = el("section", "cs-block");
    var head = el("h3", "cs-block-title", "Notices");
    box.appendChild(head);
    if (!items.length) {
      box.appendChild(el("p", "cs-prose", fx.noAttention
        ? "Nothing is configured yet, so there is nothing to fix. Start with AI Brains & Providers in the index."
        : "Nothing needs attention in this Project right now."));
      return box;
    }
    var list = el("div", "cs-attn-list");
    items.forEach(function (a) {
      /* `01_CORE_ARCHITECTURE` § Notices: three separated runs. What is broken, what
       * is half-finished and what is only advice are read differently, and one toned
       * list makes an unfinished setup look like a fault. */
      if (a.groupLabel) list.appendChild(el("div", "cs-attn-group", esc(a.groupLabel)));
      var b = button("cs-attn", null, function () { go(destinationRoute(a.destination)); });
      b.setAttribute("data-cs-item", "1");
      var dot = el("span", "cs-dot");
      dot.setAttribute("data-tone", a.tone);
      b.appendChild(dot);
      var text = el("span", "cs-attn-text");
      text.appendChild(el("span", "cs-attn-label", esc(a.label)));
      text.appendChild(el("span", "cs-attn-detail", esc(a.detail)));
      b.appendChild(text);
      b.appendChild(el("span", "cs-attn-act", esc(a.actionLabel)));
      list.appendChild(b);
    });
    box.appendChild(list);
    return box;
  }

  /* ------------------------------------------------------------ area pane */

  /* An area is a short list of the pages it holds and the managers that live in it.
   * Both are destinations that add the next pane rather than replacing this one. */
  function domainPane(domain) {
    return {
      key: "domain:" + domain.id, kind: "domain",
      title: domain.title,
      meta: plural(domain.count, "setting"),
      render: function (body) { renderDomain(body, domain); }
    };
  }

  function renderDomain(body, domain) {
    var route = RT.current();
    body.appendChild(el("p", "cs-prose", esc(domain.purpose)));

    var pages = el("section", "cs-block");
    pages.appendChild(el("h3", "cs-block-title", "Pages"));
    var list = el("div", "cs-rows");
    domain.pages.forEach(function (p) {
      var b = button("cs-navrow", null, function () {
        go({ kind: "domain", domainId: domain.id, pageId: p.id });
      });
      b.setAttribute("data-pm-page", p.id);
      b.setAttribute("data-cs-item", "1");
      if (route.pageId === p.id) b.setAttribute("aria-current", "true");
      var text = el("span", "cs-navrow-text");
      text.appendChild(el("span", "cs-navrow-name", esc(p.title)));
      text.appendChild(el("span", "cs-navrow-sub", esc(p.summary)));
      b.appendChild(text);
      b.appendChild(el("span", "cs-navrow-n", String(p.count)));
      b.appendChild(el("span", "cs-navrow-chev", icon("chevronRight", 13)));
      list.appendChild(b);
    });
    pages.appendChild(list);
    body.appendChild(pages);

    if (domain.families && domain.families.length) {
      var mgrs = el("section", "cs-block");
      mgrs.appendChild(el("h3", "cs-block-title", "Managers in this area"));
      var mlist = el("div", "cs-rows");
      domain.families.forEach(function (f) {
        var rec = MG.record(f.managerId) || {};
        var b = button("cs-navrow", null, function () {
          go({ kind: "manager", managerId: f.managerId });
        });
        b.setAttribute("data-pm-manager", f.managerId);
        b.setAttribute("data-cs-item", "1");
        if (route.managerId === f.managerId) b.setAttribute("aria-current", "true");
        var text = el("span", "cs-navrow-text");
        text.appendChild(el("span", "cs-navrow-name", esc(rec.title || f.family)));
        text.appendChild(el("span", "cs-navrow-sub", esc(rec.purpose || f.family)));
        b.appendChild(text);
        var tag = el("span", "cs-tag", esc(f.deferred ? "Owned by " + f.owner : archetypeWord(f.archetype)));
        if (f.deferred) tag.setAttribute("data-tone", "managed");
        b.appendChild(tag);
        b.appendChild(el("span", "cs-navrow-chev", icon("chevronRight", 13)));
        mlist.appendChild(b);
      });
      mgrs.appendChild(mlist);
      body.appendChild(mgrs);
    }
  }

  /* ------------------------------------------------------------ page pane */

  /* A page is its groups. Each group is 4-8 rows already cut that way by the model,
   * so the group list is short and the rows themselves get a pane of their own. */
  function pagePane(domain, page, route) {
    return {
      key: "page:" + page.id, kind: "page",
      title: page.title,
      meta: plural(page.sections.length, "group"),
      render: function (body) { renderPage(body, domain, page, route); }
    };
  }

  function renderPage(body, domain, page, route) {
    body.appendChild(el("p", "cs-prose", esc(page.summary)));
    var current = currentSection(page, route);
    var list = el("div", "cs-rows");
    page.sections.forEach(function (s) {
      var b = button("cs-navrow", null, function () {
        go({ kind: "domain", domainId: domain.id, pageId: page.id, sectionId: s.id });
      });
      b.setAttribute("data-pm-section", s.id);
      b.setAttribute("data-cs-item", "1");
      if (current && current.id === s.id) b.setAttribute("aria-current", "true");
      var text = el("span", "cs-navrow-text");
      text.appendChild(el("span", "cs-navrow-name", esc(s.title)));
      if (s.summary) text.appendChild(el("span", "cs-navrow-sub", esc(s.summary)));
      b.appendChild(text);
      b.appendChild(el("span", "cs-navrow-n", String(s.count)));
      b.appendChild(el("span", "cs-navrow-chev", icon("chevronRight", 13)));
      list.appendChild(b);
    });
    body.appendChild(list);
  }

  /* --------------------------------------------------------- section pane */

  /* The compact table this concept is built around: real column headers, 32px rows,
   * tabular numerals, and the selected row's editor opening directly beneath it in
   * context rather than in a drawer somewhere else. */
  /* `01_CORE_ARCHITECTURE` § Settings Workspace: "The right side is a continuous
   * document of that category's subcategories", and "scrolling updates the active
   * left-nav subcategory". So this pane holds the WHOLE page, not the one group that
   * was clicked — the click is a controlled jump into it. The group list in the pane
   * to its left is the left-nav the scroll updates, which is what makes the cascade
   * and the authority the same design rather than two competing ones. */
  function sectionPane(page, section, route) {
    return {
      key: "page-doc:" + page.id, kind: "section",
      title: "Settings",
      meta: plural(page.count, "setting") + " in " + plural(page.sections.length, "group"),
      /* The widest pane in the cascade, because it is the one being read. Three equal
       * panes leave the table roughly 370px, and with fixed value and status columns
       * that squeezes the setting's NAME down to three characters. */
      wide: true,
      render: function (body) { renderPageDocument(body, page, section, route); }
    };
  }

  function renderPageDocument(body, page, arrived, route) {
    page.sections.forEach(function (s) { renderSection(body, page, s, route); });
    /* Bind after the pane is in the tree; binding a detached scroller measures nothing
     * and silently falls back to the document. */
    requestAnimationFrame(function () {
      if (!body.isConnected) return;
      var heads = Array.prototype.slice.call(body.querySelectorAll(".cs-sect-head"));
      window.PM2Spy.bind({
        scroller: body,
        inset: 72,
        sections: heads.map(function (h) { return { id: h.getAttribute("data-pm-section"), el: h }; }),
        onActive: function (id) { markNavSection(id); }
      });
      /* Only jump and pin when the reader actually named a group. `currentSection`
       * falls back to the first one so the pane always has a subject, and treating that
       * fallback as a request would scroll and pin a document nobody asked to move. */
      /* Only jump when the reader actually named a group or a row. `currentSection`
       * falls back to the first one so the pane always has a subject, and treating that
       * fallback as a request would scroll and pin a document nobody asked to move.
       * When a ROW was named, the concept's own reveal owns the scroll and the arrival
       * marker; all this does then is hold the nav on the group that contains it. */
      var asked = route && (route.sectionId || route.settingId);
      if (arrived && asked) jumpToSection(body, arrived.id, !route.settingId);
    });
  }

  /* The highlight lives in the group pane, not this one. */
  function markNavSection(sectionId) {
    if (!panesEl) return;
    Array.prototype.forEach.call(panesEl.querySelectorAll('.cs-navrow[data-pm-section]'), function (n) {
      if (n.getAttribute("data-pm-section") === sectionId) n.setAttribute("aria-current", "true");
      else n.removeAttribute("aria-current");
    });
  }

  /* Instant and scoped to this pane: every arrival follows a full re-render, so a
   * smooth scroll would animate from the top of a document the reader never saw. */
  function jumpToSection(body, sectionId, takeOver) {
    var head = body.querySelector('.cs-sect-head[data-pm-section="' + cssEscape(sectionId) + '"]');
    if (!head) return;
    if (takeOver) {
      var box = head.getBoundingClientRect();
      var stage = body.getBoundingClientRect();
      body.scrollTop += (box.top - stage.top) - 8;
      Array.prototype.forEach.call(body.querySelectorAll("[data-pm-locator]"), function (n) {
        n.removeAttribute("data-pm-locator");
      });
      head.setAttribute("data-pm-locator", "1");
    }
    /* Near the foot of a short page the scroll clamps, so the measurement would name
     * the last group rather than the one asked for. The pin holds it until the reader
     * scrolls. */
    if (window.PM2Spy && window.PM2Spy.pin) window.PM2Spy.pin(sectionId);
    markNavSection(sectionId);
  }

  function renderSection(body, page, section, route) {
    var rows = M.rowsInSection(section.id);
    var standard = [];
    var deeper = [];
    rows.forEach(function (r) {
      if (M.exposureRank(r.exposure) === 0) standard.push(r); else deeper.push(r);
    });

    /* A deep link to an advanced row must open the disclosure that holds it —
     * landing on a collapsed group would be a link that lies. */
    if (route.settingId) {
      for (var i = 0; i < deeper.length; i++) {
        if (deeper[i].id === route.settingId) ui.openAdvanced[section.id] = true;
      }
    }
    var open = !!ui.openAdvanced[section.id];

    var head = el("div", "cs-sect-head");
    head.setAttribute("data-pm-section", section.id);
    head.appendChild(el("h3", "cs-sect-title", esc(section.title)));
    if (section.summary) head.appendChild(el("p", "cs-sect-sub", esc(section.summary)));
    body.appendChild(head);

    var wrap = el("div", "cs-tablewrap");
    var table = el("table", "cs-table");
    var thead = el("thead");
    var hr = el("tr");
    hr.appendChild(el("th", "cs-col-name", "Setting"));
    hr.appendChild(el("th", "cs-col-value", "Value"));
    hr.appendChild(el("th", "cs-col-status", "Status"));
    thead.appendChild(hr);
    table.appendChild(thead);

    var tbody = el("tbody");
    var shown = standard.concat(open ? deeper : []);
    shown.forEach(function (rec) {
      tbody.appendChild(settingRow(rec, route, page, section));
      if (route.settingId === rec.id) tbody.appendChild(editorRow(rec, route, page, section));
    });

    if (deeper.length) {
      var tr = el("tr", "cs-disclose-row");
      var td = el("td");
      td.setAttribute("colspan", "3");
      var b = button("cs-btn cs-btn--ghost",
        (open ? "Hide" : "Show") + " " + plural(deeper.length, "deeper setting") +
        " — " + esc(deeper.map(function (d) { return exposureWord(d.exposure); }).filter(unique).join(", ")),
        function () { ui.openAdvanced[section.id] = !open; render(); });
      b.setAttribute("data-cs-item", "1");
      td.appendChild(b);
      tr.appendChild(td);
      tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    wrap.appendChild(table);
    body.appendChild(wrap);
  }

  function unique(v, i, arr) { return arr.indexOf(v) === i; }

  function settingRow(rec, route, page, section) {
    var state = ST.rowState(rec);
    var editable = M.isEditable(state);
    var selected = route.settingId === rec.id;

    var tr = el("tr", "cs-row");
    tr.setAttribute("data-pm-row", rec.id);
    tr.setAttribute("data-cs-item", "1");
    tr.tabIndex = -1;
    if (selected) tr.setAttribute("aria-selected", "true");
    if (!editable) tr.setAttribute("data-locked", "true");

    var nameCell = el("td", "cs-col-name");
    var name = el("div", "cs-cell-name");
    name.appendChild(el("span", "cs-row-title", esc(rec.label)));
    /* One explanation, on the same 32px line, so the table stays a table. The full
     * sentence, the reason and the technical origin are in the editor beneath. */
    name.appendChild(el("span", "cs-row-desc", esc(rec.desc)));
    nameCell.appendChild(name);
    tr.appendChild(nameCell);

    var valueCell = el("td", "cs-col-value");
    valueCell.appendChild(renderControl(rec, state, editable));
    tr.appendChild(valueCell);

    var statusCell = el("td", "cs-col-status");
    statusCell.appendChild(statusCluster(rec, state));
    tr.appendChild(statusCell);

    on(tr, "click", function (e) {
      /* Pressing the control edits; pressing anywhere else in the row opens it. */
      if (e.target && e.target.closest && e.target.closest(".cs-col-value")) return;
      go({ kind: "domain", domainId: page.domainId, pageId: page.id, sectionId: section.id, settingId: selected ? null : rec.id });
    });
    return tr;
  }

  function statusCluster(rec, state) {
    var box = el("div", "cs-cell-status");
    var tone = M.stateTone(state);
    if (tone !== "quiet") {
      var tag = el("span", "cs-tag", esc(M.stateLabel(state)));
      tag.setAttribute("data-tone", tone);
      box.appendChild(tag);
    } else if (store.changed(rec.id)) {
      var ch = el("span", "cs-tag", "Changed");
      ch.setAttribute("data-tone", "changed");
      box.appendChild(ch);
    }
    if (state.restart === "required" || (ST.effects().restartPending && rec.state.restart === "required")) {
      var rs = el("span", "cs-tag", "Restart");
      rs.setAttribute("data-tone", "setup");
      box.appendChild(rs);
    }
    if (ST.effects().changedElsewhere && M.exposureRank(rec.exposure) === 0) {
      var ce = el("span", "cs-tag", "Changed in another window");
      ce.setAttribute("data-tone", "attention");
      box.appendChild(ce);
    }
    if (!box.childNodes.length) box.appendChild(el("span", "cs-quiet", "Default"));
    return box;
  }

  /* --------------------------------------------------------- the editor row */

  /* This is the arrival reveal: the row is selected in the table and its editor
   * opens directly beneath it, in place, with the complete path stated once at the
   * top. Nothing dims, nothing blinks, and the table around it does not move. */
  function editorRow(rec, route, page, section) {
    var state = ST.rowState(rec);
    var editable = M.isEditable(state);

    var tr = el("tr", "cs-editrow");
    var td = el("td");
    td.setAttribute("colspan", "3");

    var box = el("div", "cs-editor");

    var pathLine = el("div", "cs-editor-path");
    pathLine.appendChild(el("span", "cs-editor-path-human", esc(humanPath(RT.normalise({
      kind: "domain", domainId: page.domainId, pageId: page.id, sectionId: section.id, settingId: rec.id
    })) + " › " + rec.label)));
    /* The literal id is technical detail beside the human path, never instead of it. */
    pathLine.appendChild(literal(rec.id));
    box.appendChild(pathLine);

    box.appendChild(el("h4", "cs-editor-title", esc(rec.label)));
    box.appendChild(el("p", "cs-editor-desc", esc(rec.desc)));

    var field = el("div", "cs-editor-field");
    field.appendChild(el("span", "cs-editor-k", "Value for this Project"));
    field.appendChild(renderControl(rec, state, editable, true));
    box.appendChild(field);

    if (ui.errors[rec.id]) {
      var err = el("div", "cs-err");
      err.innerHTML = icon("alert", 13);
      err.appendChild(el("span", null, esc(ui.errors[rec.id])));
      box.appendChild(err);
    }

    var facts = el("dl", "cs-facts");
    function pair(k, v) {
      facts.appendChild(el("dt", null, esc(k)));
      facts.appendChild(el("dd", null, esc(v)));
    }
    pair("Default", shortValue(state.defaultValue));
    if (rec.recommended != null && rec.recommended !== "") pair("Recommended", String(rec.recommended));
    pair("Where it applies", M.project.name + " — this Project only");
    pair("Depth", exposureWord(rec.exposure));
    if (state.restart === "required") pair("Takes effect", "after the next restart");
    box.appendChild(facts);

    var reason = M.stateReason(state);
    var openDet = !!ui.openDetails[rec.id];
    var acts = el("div", "cs-actions");
    if (reason || (rec.badges && rec.badges.length)) {
      acts.appendChild(button("cs-btn cs-btn--ghost", openDet ? "Hide the details" : "Why this value?", function () {
        ui.openDetails[rec.id] = !openDet; render();
      }));
    }
    if (editable && store.changed(rec.id)) {
      acts.appendChild(button("cs-btn cs-btn--ghost", icon("undo", 13) + "<span>Reset to the default</span>", function () {
        store.clearValue(rec.id);
        delete ui.errors[rec.id];
        MG.invalidate();
        render();
        shell.announce(rec.label + " is back to its default.");
      }));
    }
    acts.appendChild(button("cs-btn cs-btn--ghost", icon("ban", 13) + "<span>Close</span>", function () {
      go({ kind: "domain", domainId: page.domainId, pageId: page.id, sectionId: section.id });
    }));
    box.appendChild(acts);

    if (openDet) {
      var det = el("div", "cs-details");
      if (reason) det.appendChild(el("p", "cs-prose", esc(reason)));
      if (state.managedBy) det.appendChild(el("p", "cs-prose", esc("Set by " + state.managedBy + ".")));
      if (rec.badges && rec.badges.length) {
        var tags = el("div", "cs-actions");
        rec.badges.forEach(function (b) {
          var t = el("span", "cs-tag", esc(typeof b === "string" ? b : (b.text || "")));
          tags.appendChild(t);
        });
        det.appendChild(tags);
      }
      var origin = el("p", "cs-prose");
      origin.appendChild(document.createTextNode("Recorded in this Project's settings file as "));
      origin.appendChild(literal(rec.id));
      origin.appendChild(document.createTextNode("."));
      det.appendChild(origin);
      box.appendChild(det);
    }

    if (rec.related && rec.related.length) {
      var rel = el("div", "cs-related");
      rel.appendChild(el("span", "cs-editor-k", "Related"));
      rec.related.slice(0, 4).forEach(function (id) {
        var other = M.setting(id);
        if (!other) return;
        rel.appendChild(button("cs-btn cs-btn--ghost", esc(other.label), function () {
          go({ kind: "domain", domainId: other.domainId, pageId: other.pageId, sectionId: other.sectionId, settingId: other.id });
        }));
      });
      box.appendChild(rel);
    }

    td.appendChild(box);
    tr.appendChild(td);
    return tr;
  }

  /* ---------------------------------------------------------------- controls */

  /* Controls do real work: every change lands in the store, which is what makes the
   * "Changed" tag, the At a glance count and the copy preview truthful. */

  /* The Puppet Master Model/Mode selector idiom: a trigger carrying the current value,
   * and a menu that hangs beneath it — or flips above when the row sits near the bottom
   * of the page, which is what the model picker in the bottom bar does. Placement,
   * layering and one-layer-at-a-time Escape come from PM2Menu; every pixel is this
   * concept's own. */
  function pmPicker(rec, options, value, onPick) {
    var wrap = el("div", "cs-picker");
    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "cs-picker-trigger";
    trigger.setAttribute("data-pm-control", rec.id);
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", rec.label);
    var valueEl = document.createElement("span");
    valueEl.className = "cs-picker-value";
    valueEl.textContent = String(value === "" || value == null ? "Not set" : value);
    trigger.appendChild(valueEl);
    var chev = document.createElement("span");
    chev.className = "cs-picker-chev";
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
      row.className = "cs-menu-item";
      row.setAttribute("role", "option");
      row.setAttribute("data-opt", String(i));
      row.setAttribute("aria-selected", o === value ? "true" : "false");
      var mark = document.createElement("span");
      mark.className = "cs-menu-check";
      mark.innerHTML = o === value ? window.PMIcons.icon("check", 12) : "";
      row.appendChild(mark);
      var lab = document.createElement("span");
      lab.className = "cs-menu-label";
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
      row.className = "cs-menu-item is-parent";
      row.setAttribute("role", "option");
      row.setAttribute("data-opt", String(i));
      row.setAttribute("aria-haspopup", "menu");
      row.setAttribute("aria-expanded", "false");
      var mark = document.createElement("span");
      mark.className = "cs-menu-check";
      mark.innerHTML = g.options.indexOf(value) >= 0 ? window.PMIcons.icon("check", 12) : "";
      row.appendChild(mark);
      var lab = document.createElement("span");
      lab.className = "cs-menu-label";
      lab.textContent = String(g.label);
      row.appendChild(lab);
      var more = document.createElement("span");
      more.className = "cs-menu-more";
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
        sub.className = "cs-menu cs-submenu";
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
      panel.className = "cs-menu";
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

  function renderControl(rec, state, editable, roomy) {
    var box = el("div", "cs-ctl" + (roomy ? " cs-ctl--roomy" : ""));
    var value = store.valueOf(rec.id);
    if (value === undefined) value = state.value;

    function commit(next) {
      store.setValue(rec.id, next);
      delete ui.errors[rec.id];
      MG.invalidate();
      render();
    }

    if (!editable) {
      var locked = el("span", "cs-lockedval",
        state.source === "unavailable" ? "Not available on this host" : shortValue(value));
      box.appendChild(locked);
      return box;
    }

    if (rec.kind === "toggle") {
      var t = button("cs-toggle", "", function () { commit(!value); });
      t.setAttribute("role", "switch");
      t.setAttribute("aria-checked", value ? "true" : "false");
      t.setAttribute("aria-label", rec.label);
      if (!roomy) t.setAttribute("data-pm-control", rec.id);
      box.appendChild(t);
      if (roomy) box.appendChild(el("span", "cs-quiet", value ? "On" : "Off"));
      return box;
    }

    if (rec.kind === "select" || rec.kind === "radio") {
      var opts = rec.options.slice();
      if (!opts.length) opts = [String(value)];
      if (state.source === "notConfigured") opts = ["Not set"].concat(opts);
      var pick = pmPicker(rec, opts, value, commit);
      /* The compact table variant hands the control id to the editor beneath the row,
       * so the trigger must not also claim it. */
      if (roomy) { var tg = pick.querySelector("[data-pm-control]"); if (tg) tg.removeAttribute("data-pm-control"); }
      box.appendChild(pick);
      return box;
    }

    if (rec.kind === "number") {
      var n = el("input", "cs-input cs-input--num");
      n.type = "number";
      n.value = value === "" ? "" : String(value);
      if (!roomy) n.setAttribute("data-pm-control", rec.id);
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
      var r = el("input", "cs-range");
      r.type = "range";
      r.min = "0";
      r.max = String(Math.max(100, Number(state.defaultValue) * 2 || 100));
      r.value = String(Number(value) || 0);
      if (!roomy) r.setAttribute("data-pm-control", rec.id);
      r.setAttribute("aria-label", rec.label);
      var out = el("span", "cs-rangeval", esc(String(value)));
      on(r, "input", function () { out.textContent = r.value; });
      on(r, "change", function () { commit(Number(r.value)); });
      box.appendChild(r);
      box.appendChild(out);
      return box;
    }

    if (rec.kind === "text" || rec.kind === "path") {
      var i = el("input", "cs-input" + (roomy ? " cs-input--wide" : ""));
      i.type = "text";
      i.value = value == null ? "" : String(value);
      i.placeholder = state.source === "notConfigured" ? "Not set" : "";
      if (!roomy) i.setAttribute("data-pm-control", rec.id);
      i.setAttribute("aria-label", rec.label);
      if (rec.kind === "path") i.className += " cs-input--literal";
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
      var a = button("cs-btn", esc(state.setupLabel || "Run"), function () {
        window.PMSim.run({
          label: rec.label,
          detail: rec.desc,
          realCall: "cmd.settings.action.run",
          payload: { settingId: rec.id, project: M.project.id }
        });
        shell.announce(rec.label + " — a receipt is in the notification inbox.");
      });
      if (!roomy) a.setAttribute("data-pm-control", rec.id);
      box.appendChild(a);
      return box;
    }

    /* list / multiselect / keyvalue: a summary and an editor, so a page of these
     * does not become a wall of text areas. */
    var list = Array.isArray(value) ? value : (value ? [String(value)] : []);
    if (roomy) {
      var area = el("textarea", "cs-input cs-input--wide cs-area");
      area.rows = 4;
      area.value = list.join("\n");
      area.setAttribute("aria-label", rec.label);
      on(area, "change", function () {
        commit(area.value.split("\n").map(function (x) { return x.trim(); }).filter(function (x) { return !!x; }));
      });
      box.appendChild(area);
      box.appendChild(el("span", "cs-quiet", "One entry per line."));
      return box;
    }
    var summary = el("span", "cs-quiet", list.length
      ? esc(list.slice(0, 2).join(", ") + (list.length > 2 ? " and " + (list.length - 2) + " more" : ""))
      : "Nothing set");
    box.appendChild(summary);
    var edit = button("cs-btn cs-btn--ghost", plural(list.length, "entry", "entries"), function () {
      var page = M.page(rec.pageId);
      if (page) go({ kind: "domain", domainId: rec.domainId, pageId: rec.pageId, sectionId: rec.sectionId, settingId: rec.id });
    });
    edit.setAttribute("data-pm-control", rec.id);
    box.appendChild(edit);
    return box;
  }

  /* ------------------------------------------------------------- managers */

  /* One renderer for all fifty-four destinations, branching on the archetype so a
   * roster does not get flattened into preference rows and a setup sequence does not
   * pretend to be a catalogue. The shape changes; the pane idiom does not — a compact
   * table with real column headers, and the selected row's detail directly beneath it
   * in the same pane, which is this concept's whole grammar.
   *
   * Specs are built HERE, when a manager is opened — never on load, never by search.
   * PM2Managers.spec() is what records hydration on <html data-pm-hydrated>. */

  function managerPane(route) {
    var rec = MG.record(route.managerId) || {};
    return {
      key: "manager:" + route.managerId,
      kind: "manager",
      wide: true,
      title: rec.title || route.managerId,
      meta: archetypeWord(MG.archetype(route.managerId)),
      render: function (body) { renderManagerPane(body, route); }
    };
  }

  function specOf(managerId) {
    /* PM2Managers caches per fixture and per edit count, so asking twice in one
     * render is free and hydration is still recorded exactly once. */
    return ST.decorate(MG.spec(managerId, store.get()));
  }

  function renderManagerPane(body, route) {
    var spec = specOf(route.managerId);
    var ctx = { route: route, managerId: route.managerId, spec: spec };
    renderManager(spec, ctx, body);
  }

  function renderManager(spec, ctx, body) {
    var arch = spec.archetype || "preference document";
    var shape = {
      roster: arch === "resource roster and detail sheet" || arch === "inventory catalogue",
      steps: arch === "setup or repair sequence",
      readOnly: arch === "read-only health projection",
      transaction: arch === "preview and confirmation transaction",
      ownerPoint: arch === "named owner insertion point" || spec.deferred
    };
    ctx.shape = shape;

    var head = el("div", "cs-mgr-head");
    head.appendChild(el("p", "cs-prose", esc(spec.purpose)));
    var tags = el("div", "cs-mgr-tags");
    var t = el("span", "cs-tag", esc(archetypeWord(arch)));
    tags.appendChild(t);
    if (spec.deferred) {
      var d = el("span", "cs-tag", "Separate owner");
      d.setAttribute("data-tone", "managed");
      tags.appendChild(d);
    }
    head.appendChild(tags);
    body.appendChild(head);

    if (shape.ownerPoint && spec.owner) body.appendChild(ownerBlock(spec, ctx));
    if (spec.health && (spec.health.headline || spec.health.detail || (spec.health.counts || []).length)) {
      body.appendChild(healthBlock(spec.health, shape));
    }

    if (spec.managerId === "manager-providers") renderProviderManager(spec, ctx, body);
    else if (shape.transaction) renderTransactionManager(spec, ctx, body);
    else if (shape.steps) renderSequenceManager(spec, ctx, body);
    else renderGeneralManager(spec, ctx, body);

    if (spec.primary && spec.primary.label) {
      var acts = el("div", "cs-actions");
      acts.appendChild(button("cs-btn cs-btn--primary", esc(spec.primary.label), function () {
        runAction(ctx.managerId, spec.primary, null);
      }));
      body.appendChild(acts);
    }

    if ((spec.diagnostics || []).length) {
      var diag = el("section", "cs-block");
      diag.appendChild(el("h3", "cs-block-title", "Evidence and diagnostics"));
      var dacts = el("div", "cs-actions");
      spec.diagnostics.forEach(function (d) {
        dacts.appendChild(button("cs-btn cs-btn--ghost", esc(d.label), function () { runAction(ctx.managerId, d, null); }));
      });
      diag.appendChild(dacts);
      body.appendChild(diag);
    }

    if ((spec.notes || []).length) {
      var notes = el("section", "cs-block cs-block--quiet");
      spec.notes.forEach(function (n) { notes.appendChild(el("p", "cs-prose", esc(n))); });
      body.appendChild(notes);
    }
  }

  /* A roster manager keeps one table primary and pushes everything else out to its
   * own pane on the right; a preference document stacks its sections in place,
   * because splitting six short lists across panes would be theatre. */
  function renderGeneralManager(spec, ctx, body) {
    var sections = (spec.sections || []).slice();
    var primary = pickPrimary(spec);
    var primaryItems = primary ? (primary.items || []).length : 0;

    if (ctx.shape.roster && primary && primaryItems >= 2) {
      body.appendChild(sectionTable(primary, ctx, true));
      var holding = ctx.route.objectId ? sectionHolding(spec, ctx.route.objectId) : null;
      if (holding && holding !== primary) body.appendChild(sectionTable(holding, ctx, true));
      var rest = sections.filter(function (s) { return s !== primary && s !== holding; });
      if (rest.length) body.appendChild(subpageList(rest, ctx));
      return;
    }

    sections.forEach(function (s) { body.appendChild(sectionTable(s, ctx, true)); });
  }

  /* A setup or repair sequence is an ordered list of steps with a state each, not a
   * roster: the reader wants to know which step they are on. */
  function renderSequenceManager(spec, ctx, body) {
    (spec.sections || []).forEach(function (section) {
      var items = section.items || [];
      if (section.kind === "prose" || !items.length) { body.appendChild(sectionTable(section, ctx, true)); return; }

      var box = el("section", "cs-block");
      box.appendChild(el("h3", "cs-block-title", esc(section.label)));
      if (section.summary) box.appendChild(el("p", "cs-prose", esc(section.summary)));
      var steps = el("ol", "cs-steps");
      items.forEach(function (item, i) {
        var li = el("li", "cs-step");
        li.setAttribute("data-pm-object", item.id);
        li.setAttribute("data-cs-item", "1");
        li.tabIndex = -1;
        if (ctx.route.objectId === item.id) li.setAttribute("aria-selected", "true");
        var n = el("span", "cs-step-n", String(i + 1));
        li.appendChild(n);
        var txt = el("div", "cs-step-body");
        var line = el("div", "cs-step-line");
        line.appendChild(el("span", "cs-step-name", esc(item.name)));
        if (item.statusWord) {
          var tag = el("span", "cs-tag", esc(item.statusWord));
          tag.setAttribute("data-tone", toneOf(item.status));
          line.appendChild(tag);
        }
        txt.appendChild(line);
        if (item.secondary) txt.appendChild(el("div", "cs-step-sub", esc(item.secondary)));
        txt.appendChild(itemDetail(item, ctx));
        li.appendChild(txt);
        steps.appendChild(li);
      });
      box.appendChild(steps);
      body.appendChild(box);
    });
  }

  /* The copy transaction has a home of its own; this manager states the contract and
   * hands over to it rather than building a second, competing copy of the flow. */
  function renderTransactionManager(spec, ctx, body) {
    if (ctx.managerId === "manager-copy") {
      var lead = el("div", "cs-block");
      lead.appendChild(el("h3", "cs-block-title", "The transaction"));
      lead.appendChild(el("p", "cs-prose", CP.independence));
      var acts = el("div", "cs-actions");
      acts.appendChild(button("cs-btn cs-btn--primary", "Open the copy transaction", function () {
        go({ kind: "copy", step: "source" });
      }));
      lead.appendChild(acts);
      body.appendChild(lead);
    }
    (spec.sections || []).forEach(function (s) { body.appendChild(sectionTable(s, ctx, true)); });
  }

  /* ------------------------------------------------- the provider manager */

  /* Built bespoke, because it is the one surface the seven designs are meant to
   * disagree about. The default view answers the six questions people actually
   * arrive with, in one table, in the same order for every family. Credentials,
   * installations, catalogues, limits and logs are coordinated subpages on the right
   * — never another eight columns here. */
  function renderProviderManager(spec, ctx, body) {
    var families = findSection(spec, "families");
    var usageEnd = findSection(spec, "usage-end");
    var subpages = findSection(spec, "subpages");
    var installations = findSection(spec, "installations");
    var acquisition = findSection(spec, "acquisition");

    if (families) {
      body.appendChild(providerTable(families, ctx));
    }
    if (usageEnd) body.appendChild(sectionTable(usageEnd, ctx, true));

    /* A routed object may live on a subpage rather than in the roster: an
     * installation result must land on the installation row it named. */
    var holding = ctx.route.objectId ? sectionHolding(spec, ctx.route.objectId) : null;
    if (holding && holding !== families && holding !== usageEnd) body.appendChild(sectionTable(holding, ctx, true));

    if (subpages) body.appendChild(subpageList([subpages], ctx, true));
    if (installations && installations !== holding) body.appendChild(subpageList([installations], ctx));
    if (acquisition) body.appendChild(sectionTable(acquisition, ctx, false));
  }

  function providerTable(section, ctx) {
    var box = el("section", "cs-block");
    box.appendChild(el("h3", "cs-block-title", esc(section.label)));
    if (section.summary) box.appendChild(el("p", "cs-prose", esc(section.summary)));

    var items = section.items || [];
    if (!items.length) { box.appendChild(emptyBlock(section, ctx)); return box; }

    var cols = ["Connected", "Selected account", "Models ready"];
    var wrap = el("div", "cs-tablewrap");
    var table = el("table", "cs-table cs-table--mgr");
    var thead = el("thead");
    var hr = el("tr");
    hr.appendChild(el("th", null, "Provider family"));
    cols.forEach(function (c) { hr.appendChild(el("th", null, esc(c))); });
    hr.appendChild(el("th", "cs-col-status", "Readiness"));
    thead.appendChild(hr);
    table.appendChild(thead);

    var tbody = el("tbody");
    items.forEach(function (item) {
      var tr = objectRow(item, ctx, function (row) {
        cols.forEach(function (c) {
          row.appendChild(el("td", null, esc(String((item.fields || {})[c] == null ? "—" : item.fields[c]))));
        });
      });
      tbody.appendChild(tr);
      if (ctx.route.objectId === item.id) tbody.appendChild(detailRow(item, ctx, 5));
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    box.appendChild(wrap);
    return box;
  }

  /* ----------------------------------------------------- generic sections */

  function pickPrimary(spec) {
    var best = null;
    (spec.sections || []).forEach(function (s) {
      if (s.kind === "prose") return;
      if (!best || (s.items || []).length > (best.items || []).length) best = s;
    });
    return best;
  }

  function findSection(spec, id) {
    var found = null;
    (spec.sections || []).forEach(function (s) { if (s.id === id) found = s; });
    return found;
  }

  function sectionHolding(spec, objectId) {
    var found = null;
    (spec.sections || []).forEach(function (s) {
      if (found) return;
      (s.items || []).forEach(function (it) { if (it.id === objectId) found = s; });
    });
    return found;
  }

  function findItem(spec, itemId) {
    var found = null;
    (spec.sections || []).forEach(function (s) {
      (s.items || []).forEach(function (it) { if (it.id === itemId) found = it; });
    });
    return found;
  }

  function toneOf(status) {
    if (status === "attention") return "attention";
    if (status === "setup" || status === "loading") return "setup";
    if (status === "managed") return "managed";
    if (status === "unavailable") return "unavailable";
    if (status === "risky") return "risky";
    if (status === "ok" || status === "connected") return "ok";
    return "quiet";
  }

  function emptyBlock(section, ctx) {
    var e = section.empty || {};
    var box = el("div", "cs-empty");
    box.appendChild(el("div", "cs-empty-head", esc(e.headline || "Nothing here yet")));
    if (e.detail) box.appendChild(el("p", "cs-prose", esc(e.detail)));
    if (e.action) {
      var acts = el("div", "cs-actions");
      acts.appendChild(button("cs-btn", esc(e.action.label), function () { runAction(ctx.managerId, e.action, null); }));
      box.appendChild(acts);
    }
    return box;
  }

  /* The workhorse: one section as a compact table with real column headers and the
   * selected row's detail directly beneath it. */
  function sectionTable(section, ctx, allowDetail) {
    var box = el("section", "cs-block");
    var title = el("h3", "cs-block-title", esc(section.label));
    box.appendChild(title);
    if (section.summary) box.appendChild(el("p", "cs-prose", esc(section.summary)));

    var items = section.items || [];
    if (!items.length) { box.appendChild(emptyBlock(section, ctx)); return box; }

    if (section.kind === "prose") {
      var prose = el("div", "cs-proseblock");
      items.forEach(function (i) {
        var p = el("p", "cs-prose", esc(i.name));
        p.setAttribute("data-pm-object", i.id);
        prose.appendChild(p);
      });
      box.appendChild(prose);
      return box;
    }

    /* Column headers: the section's own when it declares them, otherwise the union
     * of the field names its items actually carry, which is what makes these read as
     * data rather than as a list of headings. */
    var cols = (section.columns || []).slice();
    if (!cols.length) {
      var keys = [];
      items.forEach(function (i) {
        Object.keys(i.fields || {}).forEach(function (k) { if (keys.indexOf(k) < 0) keys.push(k); });
      });
      cols = keys.slice(0, 3).map(function (k) { return { key: k, label: k }; });
    }

    var wrap = el("div", "cs-tablewrap");
    var table = el("table", "cs-table cs-table--mgr");
    var thead = el("thead");
    var hr = el("tr");
    hr.appendChild(el("th", null, "Name"));
    cols.forEach(function (c) { hr.appendChild(el("th", null, esc(c.label || c.key))); });
    hr.appendChild(el("th", "cs-col-status", "Status"));
    thead.appendChild(hr);
    table.appendChild(thead);

    var tbody = el("tbody");
    items.forEach(function (item) {
      var tr = objectRow(item, ctx, function (row) {
        cols.forEach(function (c) {
          var v = (item.fields || {})[c.key];
          row.appendChild(el("td", null, esc(v == null || v === "" ? "—" : String(v))));
        });
      });
      tbody.appendChild(tr);
      if (allowDetail && ctx.route.objectId === item.id) tbody.appendChild(detailRow(item, ctx, cols.length + 2));
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    box.appendChild(wrap);

    if ((section.actions || []).length) {
      var acts = el("div", "cs-actions");
      section.actions.forEach(function (a) {
        acts.appendChild(button("cs-btn cs-btn--ghost", esc(a.label), function () { runAction(ctx.managerId, a, null); }));
      });
      box.appendChild(acts);
    }
    return box;
  }

  function objectRow(item, ctx, fillCells) {
    var tr = el("tr", "cs-row");
    tr.setAttribute("data-pm-object", item.id);
    tr.setAttribute("data-cs-item", "1");
    tr.tabIndex = -1;
    var selected = ctx.route.objectId === item.id;
    if (selected) tr.setAttribute("aria-selected", "true");

    var nameCell = el("td", "cs-col-name");
    var name = el("div", "cs-cell-name");
    name.appendChild(el("span", "cs-row-title", esc(item.name)));
    if (item.secondary) name.appendChild(el("span", "cs-row-desc", esc(item.secondary)));
    nameCell.appendChild(name);
    tr.appendChild(nameCell);

    fillCells(tr);

    var statusCell = el("td", "cs-col-status");
    var cluster = el("div", "cs-cell-status");
    if (item.statusWord) {
      var tag = el("span", "cs-tag", esc(item.statusWord));
      tag.setAttribute("data-tone", toneOf(item.status));
      cluster.appendChild(tag);
    } else {
      cluster.appendChild(el("span", "cs-quiet", "—"));
    }
    statusCell.appendChild(cluster);
    tr.appendChild(statusCell);

    on(tr, "click", function (e) {
      if (e.target && e.target.closest && e.target.closest("button, input, select, textarea")) return;
      go({
        kind: "manager", managerId: ctx.managerId,
        objectId: selected ? null : item.id,
        sectionKey: selected ? null : ctx.route.sectionKey
      });
    });
    return tr;
  }

  function detailRow(item, ctx, span) {
    var tr = el("tr", "cs-editrow");
    var td = el("td");
    td.setAttribute("colspan", String(span));
    td.appendChild(itemDetail(item, ctx, true));
    tr.appendChild(td);
    return tr;
  }

  /* The detail sheet for one object: what it is, what it holds, what can be changed
   * about it here, and what can be done to it. Never any secret material. */
  function itemDetail(item, ctx, withPath) {
    var box = el("div", "cs-editor");

    if (withPath) {
      var pathLine = el("div", "cs-editor-path");
      pathLine.appendChild(el("span", "cs-editor-path-human",
        esc(humanPath(RT.normalise({ kind: "manager", managerId: ctx.managerId })) + " › " + item.name)));
      pathLine.appendChild(literal(item.id));
      box.appendChild(pathLine);
      box.appendChild(el("h4", "cs-editor-title", esc(item.name)));
      if (item.secondary) box.appendChild(el("p", "cs-editor-desc", esc(item.secondary)));
    }

    if (item.availability && item.availability.available === false) {
      var un = el("div", "cs-err");
      un.innerHTML = icon("info", 13);
      un.appendChild(el("span", null, esc(item.availability.reason +
        (item.availability.owner ? " Owned by " + item.availability.owner + "." : ""))));
      box.appendChild(un);
    }

    var fieldKeys = Object.keys(item.fields || {});
    if (fieldKeys.length) {
      var dl = el("dl", "cs-facts");
      fieldKeys.forEach(function (k) {
        dl.appendChild(el("dt", null, esc(k)));
        dl.appendChild(el("dd", null, esc(String(item.fields[k]))));
      });
      box.appendChild(dl);
    }

    (item.detail || []).forEach(function (d) {
      var sub = el("div", "cs-subdetail");
      sub.appendChild(el("div", "cs-editor-k", esc(d.label)));
      var dl2 = el("dl", "cs-facts");
      (d.rows || []).forEach(function (r) {
        dl2.appendChild(el("dt", null, esc(r.label)));
        var dd = el("dd", null, esc(String(r.value)));
        if (r.hint) dd.appendChild(el("span", "cs-quiet", " " + esc(r.hint)));
        dl2.appendChild(dd);
      });
      sub.appendChild(dl2);
      box.appendChild(sub);
    });

    if ((item.badges || []).length) {
      var tags = el("div", "cs-actions");
      item.badges.forEach(function (b) {
        var t = el("span", "cs-tag", esc(b.text));
        if (b.title) t.title = b.title;
        tags.appendChild(t);
      });
      box.appendChild(tags);
    }

    if ((item.editable || []).length) box.appendChild(editableFields(item, ctx));

    if ((item.actions || []).length) {
      var acts = el("div", "cs-actions");
      item.actions.forEach(function (a) {
        acts.appendChild(button("cs-btn" + (a.kind === "primary" ? " cs-btn--primary" : " cs-btn--ghost"), esc(a.label), function () {
          runAction(ctx.managerId, a, item);
        }));
      });
      box.appendChild(acts);
    }
    return box;
  }

  function editableFields(item, ctx) {
    var box = el("div", "cs-editfields");
    item.editable.forEach(function (f) {
      var row = el("div", "cs-editfield");
      var label = el("div", "cs-editfield-label");
      label.appendChild(el("span", null, esc(f.label)));
      if (f.help) label.appendChild(el("span", "cs-quiet", esc(f.help)));
      row.appendChild(label);

      var ctl = el("div", "cs-ctl");
      var current = store.edit(ctx.managerId, item.id, f.key, f.value);

      if (f.secretKind) {
        /* Secret material is never rendered. The reference is named, and the only
         * action offered is one that replaces it. */
        ctl.appendChild(el("span", "cs-quiet", "Stored by the provider — never shown here"));
        ctl.appendChild(button("cs-btn cs-btn--ghost", "Replace", function () {
          window.PMSim.run({
            label: "Replace " + f.label,
            detail: "Opens the credential entry flow. No existing secret is read, displayed or exported.",
            realCall: "cmd.provider.connection.authenticate"
          });
        }));
      } else if (f.kind === "toggle") {
        var t = button("cs-toggle", "", function () {
          store.setEdit(ctx.managerId, item.id, f.key, !current);
          MG.invalidate(ctx.managerId);
          render();
        });
        t.setAttribute("role", "switch");
        t.setAttribute("aria-checked", current ? "true" : "false");
        t.setAttribute("aria-label", f.label);
        ctl.appendChild(t);
      } else if (f.kind === "select" && (f.options || []).length) {
        var s = el("select", "cs-select");
        s.setAttribute("aria-label", f.label);
        f.options.forEach(function (o) {
          var op = document.createElement("option");
          op.value = o; op.textContent = o;
          s.appendChild(op);
        });
        s.value = String(current == null ? f.options[0] : current);
        on(s, "change", function () {
          store.setEdit(ctx.managerId, item.id, f.key, s.value);
          MG.invalidate(ctx.managerId);
          render();
        });
        ctl.appendChild(s);
      } else {
        var i = el("input", "cs-input cs-input--wide");
        i.type = "text";
        i.value = current == null ? "" : String(current);
        i.setAttribute("aria-label", f.label);
        on(i, "change", function () {
          store.setEdit(ctx.managerId, item.id, f.key, i.value);
          MG.invalidate(ctx.managerId);
          render();
        });
        ctl.appendChild(i);
      }
      row.appendChild(ctl);
      box.appendChild(row);
    });
    return box;
  }

  function healthBlock(health, shape) {
    var box = el("div", "cs-health");
    if (shape && shape.readOnly) box.setAttribute("data-lead", "1");
    var top = el("div", "cs-health-top");
    var word = el("span", "cs-tag", esc(health.statusWord || "Ready"));
    word.setAttribute("data-tone", toneOf(health.status));
    top.appendChild(word);
    if (health.headline) top.appendChild(el("span", "cs-health-head", esc(health.headline)));
    box.appendChild(top);
    if (health.detail) box.appendChild(el("p", "cs-prose", esc(health.detail)));
    if ((health.counts || []).length) {
      var grid = el("div", "cs-health-counts");
      health.counts.forEach(function (c) {
        var cell = el("div", "cs-health-cell");
        cell.appendChild(el("span", "cs-health-v", esc(String(c.value))));
        cell.appendChild(el("span", "cs-health-k", esc(c.label)));
        grid.appendChild(cell);
      });
      box.appendChild(grid);
    }
    return box;
  }

  /* A deferred family names its owner, says why it is separate, and states both
   * halves of the contract: how it is entered and how control comes back. */
  function ownerBlock(spec, ctx) {
    var owner = spec.owner;
    var box = el("section", "cs-owner");
    box.appendChild(el("h3", "cs-block-title", "This part is owned elsewhere"));
    var dl = el("dl", "cs-facts");
    function pair(k, v) {
      dl.appendChild(el("dt", null, esc(k)));
      dl.appendChild(el("dd", null, esc(v || "")));
    }
    pair("Owner", owner.name);
    pair("Why it is separate", owner.why);
    pair("How it is entered", owner.insertionContract);
    pair("How control returns", owner.returnContract);
    box.appendChild(dl);
    var acts = el("div", "cs-actions");
    acts.appendChild(button("cs-btn cs-btn--primary", "Open " + esc(owner.name), function () {
      window.PMSim.run({
        label: "Open " + owner.name,
        detail: owner.returnContract,
        realCall: "cmd.settings.owner.open",
        payload: { owner: owner.name, from: ctx.managerId, project: M.project.id }
      });
      shell.announce("Opening " + owner.name + ". " + owner.returnContract);
    }));
    box.appendChild(acts);
    return box;
  }

  /* ------------------------------------------------------------- subpages */

  /* Coordinated subpages, not one wall: each one opens as the next pane on the right
   * and keeps the manager, the breadcrumb and the Back destination exactly where
   * they were. */
  function subpageList(sections, ctx, flattenListItems) {
    var box = el("section", "cs-block");
    box.appendChild(el("h3", "cs-block-title", "The rest of this manager"));
    var list = el("div", "cs-rows");

    function addRow(id, name, secondary, statusWord, status, count) {
      var b = button("cs-navrow", null, function () {
        go({ kind: "manager", managerId: ctx.managerId, objectId: ctx.route.objectId || null, sectionKey: id });
      });
      b.setAttribute("data-cs-item", "1");
      if (ctx.route.sectionKey === id) b.setAttribute("aria-current", "true");
      var text = el("span", "cs-navrow-text");
      text.appendChild(el("span", "cs-navrow-name", esc(name)));
      if (secondary) text.appendChild(el("span", "cs-navrow-sub", esc(secondary)));
      b.appendChild(text);
      if (statusWord) {
        var tag = el("span", "cs-tag", esc(statusWord));
        tag.setAttribute("data-tone", toneOf(status));
        b.appendChild(tag);
      } else if (count != null) {
        b.appendChild(el("span", "cs-navrow-n", String(count)));
      }
      b.appendChild(el("span", "cs-navrow-chev", icon("chevronRight", 13)));
      list.appendChild(b);
    }

    sections.forEach(function (section) {
      if (flattenListItems && (section.items || []).length) {
        /* The provider manager's own subpage index: each entry is already a
         * subpage, so the row IS the destination rather than a folder holding it. */
        section.items.forEach(function (item) {
          addRow(item.id, item.name, item.secondary, item.statusWord, item.status, null);
        });
        return;
      }
      addRow(section.id, section.label, section.summary, null, null, (section.items || []).length);
    });

    box.appendChild(list);
    return box;
  }

  function subpagePane(route) {
    if (!route.sectionKey) return null;
    var spec = specOf(route.managerId);
    var target = subpageTarget(spec, route.sectionKey);
    if (!target) return null;
    return {
      key: "sub:" + route.managerId + ":" + route.sectionKey,
      kind: "sub",
      wide: true,
      title: target.label,
      meta: target.meta || "",
      render: function (body) { target.render(body, { route: route, managerId: route.managerId, spec: spec, shape: {} }); }
    };
  }

  function subpageLabel(route) {
    var spec = specOf(route.managerId);
    var target = subpageTarget(spec, route.sectionKey);
    return target ? target.label : humanKey(route.sectionKey);
  }

  function humanKey(key) {
    var s = String(key || "").replace(/^sub-/, "").replace(/[-_]+/g, " ");
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : "Subpage";
  }

  /* A subpage key can name a section of the spec, or an entry in the manager's own
   * subpage index, or neither — a search result may name a coordinated subpage the
   * spec expresses as an item. All three land somewhere honest. */
  function subpageTarget(spec, key) {
    var section = findSection(spec, key) || findSection(spec, "sub-" + key);
    if (!section) {
      var alt = null;
      (spec.sections || []).forEach(function (s) {
        if (alt) return;
        if (s.id && key && (s.id.indexOf(key) >= 0 || key.indexOf(s.id) >= 0)) alt = s;
      });
      section = alt;
    }
    if (section) {
      return {
        label: section.label,
        meta: plural((section.items || []).length, "entry", "entries"),
        render: function (body, ctx) { body.appendChild(sectionTable(section, ctx, true)); }
      };
    }

    var item = findItem(spec, key) || findItem(spec, "sub-" + key);
    if (item) {
      return {
        label: item.name,
        meta: item.statusWord || "",
        render: function (body, ctx) {
          body.appendChild(itemDetail(item, ctx, true));
          var related = relatedSectionFor(spec, key);
          if (related) body.appendChild(sectionTable(related, ctx, true));
        }
      };
    }

    return {
      label: humanKey(key),
      meta: "Nothing separate",
      render: function (body, ctx) {
        var box = el("div", "cs-block");
        box.appendChild(el("h3", "cs-block-title", humanKey(key)));
        box.appendChild(el("p", "cs-prose",
          "This manager keeps that material on its main page rather than on a subpage of its own. Everything it holds is in the pane to the left."));
        body.appendChild(box);
      }
    };
  }

  function relatedSectionFor(spec, key) {
    var word = String(key || "").replace(/^sub-/, "");
    var found = null;
    (spec.sections || []).forEach(function (s) {
      if (found || !s.id) return;
      if (s.id !== "subpages" && s.id.indexOf(word) >= 0) found = s;
    });
    return found;
  }

  function runAction(managerId, action, item) {
    var result = MG.act({ managerId: managerId, project: M.project.id }, action, item ? { objectId: item.id } : null);
    if (!result) {
      window.PMSim.run({
        label: action.label,
        detail: "Simulated in this prototype; a production build makes the real call.",
        realCall: "cmd.settings.manager.action"
      });
    }
    shell.announce(action.label + " — a receipt is in the notification inbox.");
  }

  /* ------------------------------------------------------------------ search */

  /* One field, in the same place on every surface — which is the point of a
   * keyboard-first design: the reader never has to look for it. On Home it is
   * larger, because Home is where a query is most likely to start. */
  function searchField(hero) {
    var wrap = el("div", "cs-searchwrap");
    if (hero) wrap.setAttribute("data-hero", "1");

    var field = el("div", "cs-searchfield");
    field.innerHTML = icon("search", 15);

    var input = document.createElement("input");
    input.type = "text";
    input.spellcheck = false;
    input.autocomplete = "off";
    input.className = "cs-searchinput";
    input.placeholder = "Search settings, managers, providers and actions";
    input.setAttribute("data-pm-search-field", "");
    input.setAttribute("aria-label", "Search all settings");
    input.value = ui.query;
    field.appendChild(input);

    if (ui.query) {
      field.appendChild(button("cs-searchclear", icon("ban", 13), function () {
        ui.query = ""; ui.results = null; ui.dropOpen = false;
        withoutRender(function () { RT.replace(RT.withState({ kind: "home" }, ST.active() === "normal" ? null : ST.active())); });
        render();
      }));
    }
    wrap.appendChild(field);

    var drop = el("div", "cs-drop");
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
        withoutRender(function () { RT.replace(keepState({ kind: "home" })); });
        return;
      }
      ui.results = IX.query(ui.query, { limit: 40 });
      ui.dropOpen = true;
      drop.hidden = false;
      fillDropdown(drop);
      /* The query lives in the route, so Back from a chosen result returns to the
       * query AND the result that was chosen rather than to a blank Home. */
      withoutRender(function () { RT.replace(keepState({ kind: "query", query: ui.query })); });
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
        var active = drop.querySelector(".cs-result.is-active");
        if (active) scrollWithin(drop.querySelector(".cs-drop-scroll"), active);
      } else if (e.key === "Enter" && ui.activeResult >= 0 && flat[ui.activeResult]) {
        e.preventDefault();
        chooseResult(flat[ui.activeResult].id);
      }
    });

    return wrap;
  }

  function keepState(dest) {
    var s = ST.active();
    return RT.withState(dest, s === "normal" ? null : s);
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
      var empty = el("div", "cs-drop-empty");
      var head = el("div", "cs-drop-empty-head");
      head.innerHTML = "Nothing matches <b>" + esc(ui.query) + "</b>";
      empty.appendChild(head);
      empty.appendChild(el("p", "cs-drop-empty-note",
        "Search covers every one of the " + M.counts.settings + " settings in this Project, including the ones that are managed or unavailable on this host. Try a shorter word, or press Escape and use a number key to jump to an area."));
      drop.appendChild(empty);
      return;
    }

    var scroll = el("div", "cs-drop-scroll cs-scroll");
    var index = 0;
    res.groups.forEach(function (group) {
      var g = el("div", "cs-drop-group");
      g.appendChild(el("div", "cs-drop-label", esc(group.label)));
      group.results.forEach(function (r) {
        var my = index++;
        var b = button("cs-result" + (my === ui.activeResult ? " is-active" : ""), null, function () { chooseResult(r.id); });
        b.setAttribute("data-pm-result", r.id);
        var top = el("div", "cs-result-top");
        top.appendChild(el("span", "cs-result-label", esc(r.label)));
        top.appendChild(el("span", "cs-result-type", esc(r.typeLabel)));
        b.appendChild(top);
        /* The complete human path is the name of the place. Never a slug. */
        b.appendChild(el("div", "cs-result-path", esc(r.path)));
        if (r.availability) b.appendChild(el("div", "cs-result-avail", esc(r.availability)));
        g.appendChild(b);
      });
      scroll.appendChild(g);
    });
    drop.appendChild(scroll);

    var foot = el("div", "cs-drop-foot");
    foot.appendChild(el("span", "cs-drop-count", esc(res.shown + " of " + res.total + " matches")));
    if (res.truncated) {
      foot.appendChild(button("cs-btn cs-btn--ghost", "See them all in All settings", function () {
        ui.dropOpen = false;
        go(keepState({ kind: "all", facet: ui.query }));
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
    withoutRender(function () { RT.replace(keepState({ kind: "query", query: ui.query, resultId: resultId })); });
    ui.pending = { result: result, query: ui.query };
    go(keepState(destinationRoute(result.destination)));
  }

  function destinationRoute(d) {
    if (!d) return { kind: "home" };
    if (d.managerId) {
      return {
        kind: "manager", managerId: d.managerId, objectId: d.objectId || null,
        sectionKey: d.sectionKey || null, rowId: d.rowId || null
      };
    }
    return {
      kind: "domain", domainId: d.domainId, pageId: d.pageId,
      sectionId: d.sectionId, settingId: d.settingId
    };
  }

  /* --------------------------------------------------------------- arrivals */

  /* The reveal this concept uses: the row is SELECTED in its table and its editor
   * opens directly beneath it, in context, with the full path stated once above the
   * editor. Nothing blinks and nothing dims — the answer to "where am I" is that the
   * thing you asked for is open under your cursor, at the end of a visible trail. */
  function revealPending() {
    var pending = ui.pending;
    var route = RT.current();
    ui.pending = null;

    var targetId = null;
    if (pending && pending.result) {
      var d = pending.result.destination;
      targetId = d.settingId || d.objectId || d.managerId;
    } else if (route.settingId) targetId = route.settingId;
    else if (route.objectId) targetId = route.objectId;
    /* A section-level link is handled by `jumpToSection` inside the page document,
     * which owns both the scroll and the marker for that case. */
    if (!targetId) return;

    var key = cssEscape(targetId);
    var node = panesEl.querySelector('[data-pm-row="' + key + '"]') ||
      panesEl.querySelector('[data-pm-object="' + key + '"]') ||
      panesEl.querySelector('[data-pm-manager="' + key + '"]');
    if (!node) return;

    var old = panesEl.querySelectorAll("[data-pm-locator]");
    for (var i = 0; i < old.length; i++) old[i].removeAttribute("data-pm-locator");
    node.setAttribute("data-pm-locator", "1");

    var scroller = node.closest ? node.closest(".cs-pane-body") : null;
    if (scroller) scrollWithin(scroller, node);

    var focusTarget = node.querySelector("[data-pm-control]") || node;
    if (focusTarget.focus) focusTarget.focus({ preventScroll: true });

    if (pending && pending.result) {
      shell.announce("Opened " + pending.result.label + " — " + pending.result.path);
    }
  }

  /* Instant and container-scoped. Every arrival follows a full re-render, so a
   * smooth scroll would animate from the top of a pane the reader never saw and
   * leave the row off screen while it ran. The editor opening beneath the row is
   * what carries the explanation here, not the travel. */
  function scrollWithin(scroller, node) {
    if (!scroller || !node) return;
    var box = node.getBoundingClientRect();
    var view = scroller.getBoundingClientRect();
    var delta = box.top - view.top - Math.max(16, (view.height - box.height) / 3);
    if (Math.abs(delta) > 4) scroller.scrollTop += delta;
    ui.paneScroll[scroller.getAttribute("data-pane-body")] = scroller.scrollTop;
  }

  /* ---- placeholders replaced in the next step (All settings, Copy) ---- */

  /* ------------------------------------------------------------ all settings */

  /* The compendium in this concept's own idiom: a filter strip of facet chips above a
   * windowed table. Facets come from the index already ordered and already labelled,
   * so nothing here re-derives either. */
  function renderAll(body) {
    var filter = {
      domainIds: ui.facets.domains,
      kinds: ui.facets.kinds,
      exposures: ui.facets.exposures,
      changedOnly: ui.facets.changedOnly,
      limit: 0
    };
    var result = IX.all(filter);

    var head = el("div", "cs-sect-head");
    head.appendChild(el("h3", "cs-sect-title", "All settings"));
    /* "1265 of 1265 indexed" is a tautology when nothing is filtered, and it hides the
     * number a reader actually wants: how many of these are settings. */
    var filtered = result.total !== IX.stats().records;
    head.appendChild(el("p", "cs-sect-sub",
      (filtered ? plural(result.total, "record") + " of " + IX.stats().records
                : plural(result.total, "record")) +
      " — " + M.counts.settings + " settings in this Project, plus the managers, resources and " +
      "actions that reach them. Includes what a policy controls and what this host cannot provide."));
    body.appendChild(head);

    var chips = el("div", "cs-chips");
    chips.appendChild(facetChip("Changed here", result.facets.changed, ui.facets.changedOnly, function () {
      ui.facets.changedOnly = !ui.facets.changedOnly; render();
    }));
    [["domains", result.facets.domains], ["kinds", result.facets.kinds], ["exposures", result.facets.exposures]]
      .forEach(function (pair) {
        pair[1].slice(0, 6).forEach(function (f) {
          var on = ui.facets[pair[0]].indexOf(f.id) >= 0;
          chips.appendChild(facetChip(f.label, f.count, on, function () {
            var list = ui.facets[pair[0]];
            var at = list.indexOf(f.id);
            if (at >= 0) list.splice(at, 1); else list.push(f.id);
            render();
          }));
        });
      });
    if (ui.facets.domains.length || ui.facets.kinds.length || ui.facets.exposures.length || ui.facets.changedOnly) {
      chips.appendChild(button("cs-btn cs-btn--ghost", "Clear filters", function () {
        ui.facets = { domains: [], kinds: [], exposures: [], changedOnly: false };
        render();
      }));
    }
    body.appendChild(chips);

    /* Windowed: 828 records plus the 2,400-row stress fixture must never become
     * 3,200 rows in the document. */
    var wrap = el("div", "cs-tablewrap cs-scroll");
    wrap.style.maxHeight = "56vh";
    var table = el("table", "cs-table");
    var thead = el("thead");
    var hr = el("tr");
    hr.appendChild(el("th", "cs-col-name", "Record"));
    hr.appendChild(el("th", "cs-col-value", "Where it lives"));
    hr.appendChild(el("th", "cs-col-status", "Kind"));
    thead.appendChild(hr);
    table.appendChild(thead);
    var tbody = el("tbody");
    table.appendChild(tbody);
    wrap.appendChild(table);

    var rowHeight = 32;
    function paint() {
      var win = window.PMVirtual.windowFor({
        total: result.total, rowHeight: rowHeight,
        viewport: wrap.clientHeight || 420, scrollTop: wrap.scrollTop, overscan: 6, firstPage: 24
      });
      clear(tbody);
      if (win.before > 0) tbody.appendChild(spacerRow(win.before));
      for (var i = win.start; i < win.end; i++) {
        var rec = result.rows[i];
        if (rec) tbody.appendChild(allRow(rec));
      }
      if (win.after > 0) tbody.appendChild(spacerRow(win.after));
    }
    on(wrap, "scroll", paint);
    body.appendChild(wrap);
    paint();

    if (!result.total) {
      body.appendChild(el("p", "cs-empty", "Nothing matches those filters. Clear one to widen the list."));
    }
  }

  function spacerRow(height) {
    var tr = el("tr");
    var td = el("td");
    td.setAttribute("colspan", "3");
    td.style.height = height + "px";
    td.style.padding = "0";
    tr.appendChild(td);
    return tr;
  }

  function facetChip(label, count, active, fn) {
    var b = button("cs-chip", esc(label) + (count == null ? "" : " " + count), fn);
    b.setAttribute("aria-pressed", active ? "true" : "false");
    b.setAttribute("data-cs-item", "1");
    return b;
  }

  function allRow(rec) {
    var tr = el("tr", "cs-row");
    tr.setAttribute("data-pm-result", rec.id);
    tr.setAttribute("data-cs-item", "1");
    tr.tabIndex = -1;

    var nameCell = el("td", "cs-col-name");
    var name = el("div", "cs-cell-name");
    name.appendChild(el("span", "cs-row-title", esc(rec.label)));
    tr.appendChild(nameCell);
    nameCell.appendChild(name);

    var pathCell = el("td", "cs-col-value");
    /* The last two steps, not the first. Cutting a path from the left makes every row
     * in this table read "AI Brains & Providers › Accou…" — identical, and useless for
     * telling one record from another. The end of the path is the part that differs. */
    var parts = String(rec.path || "").split(" \u203a ");
    var tail = parts.length > 2 ? parts.slice(-2).join(" \u203a ") : rec.path;
    var pathText = el("span", "cs-row-desc", esc(tail));
    pathText.title = rec.path;
    pathCell.appendChild(pathText);
    tr.appendChild(pathCell);

    var kindCell = el("td", "cs-col-status");
    var tag = el("span", "cs-tag", esc(rec.typeLabel || IX.kindLabel(rec.kind)));
    if (rec.changed) tag.setAttribute("data-tone", "changed");
    kindCell.appendChild(tag);
    tr.appendChild(kindCell);

    on(tr, "click", function () {
      var r = IX.byId(rec.id);
      if (!r) return;
      ui.pending = { result: r };
      go(destinationRoute(r.destination));
    });
    return tr;
  }

  /* ------------------------------------------------------------------- copy */

  /* Four transactional panels, in the order the transaction actually happens. Nothing
   * is applied until the preview has been seen, and the receipt keeps its rollback. */
  function renderCopy(body) {
    var c = ui.copy;

    var head = el("div", "cs-sect-head");
    head.appendChild(el("h3", "cs-sect-title", "Copy settings from another Project"));
    head.appendChild(el("p", "cs-sect-sub", CP.independence));
    body.appendChild(head);

    var steps = el("ol", "cs-steps");
    ["Select source", "Choose categories", "Preview changes", "Confirm"].forEach(function (label, i) {
      var li = el("li", "cs-step");
      li.setAttribute("data-state", (i + 1) === c.step ? "current" : ((i + 1) < c.step ? "done" : "todo"));
      li.appendChild(el("span", "cs-step-n", String(i + 1)));
      li.appendChild(el("span", "cs-step-name", esc(label)));
      steps.appendChild(li);
    });
    body.appendChild(steps);

    if (c.step === 1) copySource(body);
    else if (c.step === 2) copyCategories(body);
    else if (c.step === 3) copyPreview(body);
    else copyApply(body);

    var receipts = CP.receipts();
    if (receipts.length) {
      var rh = el("div", "cs-sect-head");
      rh.appendChild(el("h3", "cs-sect-title", "Receipts"));
      body.appendChild(rh);
      receipts.forEach(function (r) {
        var block = el("div", "cs-block cs-block--quiet");
        block.appendChild(el("div", "cs-block-title",
          esc("From " + r.source.name + " · " + r.at + " · " + (r.outcome === "applied" ? plural(r.applied, "value") + " applied" : "rolled back"))));
        block.appendChild(el("p", "cs-row-desc", esc(r.note || ("Restore point: " + r.restorePoint.label))));
        if (r.canRollback) {
          var b = button("cs-btn", "Roll back", function () {
            CP.rollback(r.id); MG.invalidate(); render();
          });
          b.setAttribute("data-cs-item", "1");
          block.appendChild(b);
        }
        body.appendChild(block);
      });
    }
  }

  function copySource(body) {
    /* The sources need their own heading and their own affordance. Rendered as bare
     * rows straight after the step list they read as four more steps rather than as
     * four things to choose between. */
    var head = el("div", "cs-sect-head");
    head.appendChild(el("h3", "cs-sect-title", "Which Project should this one copy from?"));
    head.appendChild(el("p", "cs-sect-sub", "One source, once. Choosing one moves to the categories."));
    body.appendChild(head);

    CP.sources().forEach(function (s) {
      var b = button("cs-navrow", null, function () {
        ui.copy.source = s.id;
        ui.copy.domains = M.domains.map(function (d) { return d.id; });
        ui.copy.step = 2;
        render();
      });
      b.setAttribute("data-cs-item", "1");
      b.setAttribute("aria-pressed", ui.copy.source === s.id ? "true" : "false");
      var text = el("span", "cs-navrow-text");
      text.appendChild(el("span", "cs-navrow-name", esc(s.name)));
      text.appendChild(el("span", "cs-navrow-sub", esc(s.updated + " · " + s.note)));
      b.appendChild(text);
      b.appendChild(el("span", "cs-navrow-meta", plural(s.settings, "record")));
      body.appendChild(b);
    });

    var policy = el("p", "cs-copy-policy", esc(CP.secretPolicy()));
    body.appendChild(policy);
  }

  function copyCategories(body) {
    var chosen = ui.copy.domains || [];
    var cats = CP.categories();

    var head = el("div", "cs-sect-head");
    head.appendChild(el("h3", "cs-sect-title", "Which areas should come across?"));
    head.appendChild(el("p", "cs-sect-sub",
      chosen.length + " of " + cats.length + " areas selected · " +
      cats.filter(function (c) { return chosen.indexOf(c.id) >= 0; })
          .reduce(function (n, c) { return n + c.count; }, 0) + " records in range"));
    body.appendChild(head);

    var bulk = el("div", "cs-actions");
    bulk.appendChild(button("cs-btn cs-btn--ghost", "Select all", function () {
      ui.copy.domains = cats.map(function (c) { return c.id; }); render();
    }));
    bulk.appendChild(button("cs-btn cs-btn--ghost", "Clear all", function () {
      ui.copy.domains = []; render();
    }));
    body.appendChild(bulk);

    /* Real checkboxes in a two-column grid. The previous pass reused the breadcrumb
     * chip class, so twelve selectable areas rendered as centred plain text with no
     * affordance and no visible selected state — every one of them was already
     * selected and nothing on screen said so. */
    var grid = el("div", "cs-catgrid");
    cats.forEach(function (cat) {
      var picked = chosen.indexOf(cat.id) >= 0;
      var b = button("cs-cat", null, function () {
        var at = chosen.indexOf(cat.id);
        if (at >= 0) chosen.splice(at, 1); else chosen.push(cat.id);
        ui.copy.domains = chosen;
        render();
      });
      b.setAttribute("data-cs-item", "1");
      b.setAttribute("role", "checkbox");
      b.setAttribute("aria-checked", picked ? "true" : "false");
      b.appendChild(el("span", "cs-cat-box", picked ? icon("check", 12) : ""));
      var text = el("span", "cs-cat-text");
      text.appendChild(el("span", "cs-cat-name", esc(cat.title)));
      text.appendChild(el("span", "cs-cat-purpose", esc(cat.purpose)));
      b.appendChild(text);
      b.appendChild(el("span", "cs-cat-n", String(cat.count)));
      grid.appendChild(b);
    });
    body.appendChild(grid);

    var acts = el("div", "cs-actions");
    acts.appendChild(button("cs-btn", "Back", function () { ui.copy.step = 1; render(); }));
    var next = button("cs-btn cs-btn--primary", "Preview changes", function () {
      ui.copy.preview = CP.preview(ui.copy.source, chosen);
      ui.copy.step = 3;
      render();
    });
    next.disabled = !chosen.length;
    next.setAttribute("data-cs-item", "1");
    acts.appendChild(next);
    body.appendChild(acts);
  }

  function copyPreview(body) {
    var p = ui.copy.preview;
    if (!p) { ui.copy.step = 1; return; }

    var head = el("div", "cs-sect-head");
    head.appendChild(el("h3", "cs-sect-title", "What this copy would do"));
    head.appendChild(el("p", "cs-sect-sub",
      "From " + esc(p.source.name) + " into " + esc(p.destination.name) + ". Nothing is written until you confirm."));
    body.appendChild(head);

    /* A compact counted row rather than five big tiles. Five cells never divide
     * evenly into a four-across grid, and the previous pass left "Cannot be copied"
     * orphaned on a row of its own beside three empty cells. */
    var tally = el("dl", "cs-tally");
    [["Added", p.counts.additions], ["Replaced", p.counts.replacements],
     ["Already the same", p.counts.unchanged], ["Account references re-pointed", p.counts.references],
     ["Cannot be copied", p.counts.unavailable + p.counts.conflicts]].forEach(function (pair) {
      var cell = el("div", "cs-tally-cell");
      cell.appendChild(el("dt", "cs-tally-k", esc(pair[0])));
      cell.appendChild(el("dd", "cs-tally-v", String(pair[1])));
      tally.appendChild(cell);
    });
    body.appendChild(tally);

    var changes = p.items.filter(function (i) {
      return i.outcome === "addition" || i.outcome === "replacement" || i.outcome === "reference";
    });

    var wrap = el("div", "cs-diffwrap cs-scroll");
    var table = el("table", "cs-table cs-difftable");
    var thead = el("thead");
    var hr = el("tr");
    hr.appendChild(el("th", "cs-diff-col-name", "Setting"));
    hr.appendChild(el("th", "cs-diff-col-val", "Now"));
    hr.appendChild(el("th", "cs-diff-col-val", "After"));
    thead.appendChild(hr);
    table.appendChild(thead);
    var tbody = el("tbody");
    changes.slice(0, 300).forEach(function (item) {
      var tr = el("tr", "cs-row");
      var n = el("td", "cs-diff-col-name");
      var nm = el("div", "cs-cell-name");
      /* The setting's own name is what identifies the change; the previous pass cut it
       * to "Reduce A…" while giving two thirds of the row to the values. */
      nm.appendChild(el("span", "cs-diff-name", esc(item.label)));
      var parts = String(item.path || "").split(" \u203a ");
      var tail = el("span", "cs-diff-path", esc(parts.length > 2 ? parts.slice(-2).join(" \u203a ") : item.path));
      tail.title = item.path;
      nm.appendChild(tail);
      n.appendChild(nm);
      tr.appendChild(n);
      tr.appendChild(el("td", "cs-diff-col-val cs-diff-from", esc(String(item.current === "" ? "not set" : item.current))));
      tr.appendChild(el("td", "cs-diff-col-val cs-diff-to", esc(String(item.incoming))));
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    body.appendChild(wrap);
    if (changes.length > 300) {
      body.appendChild(el("p", "cs-row-desc", "Showing the first 300 of " + changes.length + " changes."));
    }

    var excl = el("div", "cs-copy-policy");
    excl.appendChild(el("div", "cs-block-title", "What is not copied"));
    p.excluded.forEach(function (x) {
      excl.appendChild(el("p", "cs-row-desc", esc(x.label + ": " + x.count + (x.note ? " — " + x.note : ""))));
    });
    body.appendChild(excl);

    var acts = el("div", "cs-actions");
    acts.appendChild(button("cs-btn", "Back", function () { ui.copy.step = 2; render(); }));
    var go2 = button("cs-btn cs-btn--primary", "Take a restore point and copy", function () {
      ui.copy.run = CP.apply(p);
      ui.copy.step = 4;
      render();
    });
    go2.setAttribute("data-cs-item", "1");
    acts.appendChild(go2);
    body.appendChild(acts);
  }

  function copyApply(body) {
    var run = ui.copy.run;
    if (!run) { ui.copy.step = 1; return; }
    var op = run.get();

    run.steps.forEach(function (phase) {
      var line = el("div", "cs-step-line");
      line.appendChild(el("span", "cs-step-name", esc(phase)));
      line.appendChild(el("span", "cs-step-sub", esc(op.phase === phase ? window.PMWork.stateWord(op.state) : "")));
      body.appendChild(line);
    });

    if (op.progress_kind === "fraction" && op.total) {
      body.appendChild(el("p", "cs-row-desc", op.completed + " of " + op.total + " values"));
    } else {
      body.appendChild(el("p", "cs-row-desc",
        esc(window.PMWork.stateWord(op.state) + (op.wait_reason ? " — " + op.wait_reason : ""))));
    }

    var acts = el("div", "cs-actions");
    if (!ui.copy.receipt) {
      var step = button("cs-btn cs-btn--primary", "Continue", function () {
        var out = run.next();
        if (out.done) { ui.copy.receipt = out.receipt; MG.invalidate(); }
        render();
      });
      step.setAttribute("data-cs-item", "1");
      acts.appendChild(step);
      acts.appendChild(button("cs-btn", "Run the rest", function () {
        var out = run.run();
        ui.copy.receipt = out.receipt;
        MG.invalidate();
        render();
      }));
      acts.appendChild(button("cs-btn cs-btn--ghost", "Cancel", function () {
        run.cancel();
        ui.copy = { step: 1, source: null, domains: null, preview: null, run: null, receipt: null };
        render();
      }));
    } else {
      var r = ui.copy.receipt;
      var note = el("div", "cs-block");
      note.appendChild(el("div", "cs-block-title", r.outcome === "applied" ? "Copied" : "Rolled back"));
      note.appendChild(el("p", "cs-row-desc", esc(
        r.outcome === "applied"
          ? plural(r.applied, "value") + " applied to " + M.project.name + ". Restore point: " + r.restorePoint.label + "."
          : r.note)));
      note.appendChild(el("p", "cs-row-desc",
        esc("The two Projects are independent from here. Nothing in " + r.source.name + " reaches this Project again.")));
      body.appendChild(note);
      var done = button("cs-btn cs-btn--primary", "Done", function () {
        ui.copy = { step: 1, source: null, domains: null, preview: null, run: null, receipt: null };
        go({ kind: "home" });
      });
      done.setAttribute("data-cs-item", "1");
      acts.appendChild(done);
    }
    body.appendChild(acts);
  }

  /* -------------------------------------------------------------- keyboard */

  /* Keyboard is first class here, so the rules are short and always the same:
   * up and down move inside a pane, left and right move between panes, Enter
   * opens, Escape steps back one pane, and the focus ring is always visible.
   * The number row jumps straight to an area from anywhere that is not a field. */

  function isTyping(target) {
    if (!target || !target.tagName) return false;
    var tag = target.tagName.toLowerCase();
    return tag === "input" || tag === "textarea" || tag === "select" || target.isContentEditable === true;
  }

  function paneEls() {
    return Array.prototype.slice.call(panesEl.querySelectorAll(".cs-pane"));
  }

  function itemsIn(paneEl) {
    return Array.prototype.slice.call(paneEl.querySelectorAll("[data-cs-item]"));
  }

  function currentPaneIndex() {
    var panes = paneEls();
    var active = document.activeElement;
    for (var i = 0; i < panes.length; i++) {
      if (active && panes[i].contains(active)) return i;
    }
    return -1;
  }

  function focusItem(paneEl, index) {
    var items = itemsIn(paneEl);
    if (!items.length) return false;
    var at = Math.max(0, Math.min(items.length - 1, index));
    items[at].focus({ preventScroll: true });
    var body = paneEl.querySelector(".cs-pane-body");
    scrollWithin(body, items[at]);
    ui.cursor[paneEl.getAttribute("data-pane-key")] = at;
    return true;
  }

  function moveWithinPane(delta) {
    var panes = paneEls();
    if (!panes.length) return false;
    var pi = currentPaneIndex();
    if (pi < 0) pi = panes.length - 1;
    var items = itemsIn(panes[pi]);
    if (!items.length) return false;
    var at = items.indexOf(document.activeElement);
    if (at < 0) at = delta > 0 ? -1 : items.length;
    return focusItem(panes[pi], at + delta);
  }

  function moveBetweenPanes(delta) {
    var panes = paneEls();
    if (panes.length < 2) return false;
    var pi = currentPaneIndex();
    if (pi < 0) pi = delta > 0 ? -1 : panes.length;
    var next = pi + delta;
    if (next < 0 || next >= panes.length) return false;
    var key = panes[next].getAttribute("data-pane-key");
    /* A pane remembers where the cursor was, so moving out and back does not
     * dump the reader at the top of a list they had already worked down. */
    var remembered = ui.cursor[key];
    var selected = panes[next].querySelector('[aria-current="true"], [aria-selected="true"]');
    var items = itemsIn(panes[next]);
    var at = remembered != null ? remembered : (selected ? Math.max(0, items.indexOf(selected)) : 0);
    return focusItem(panes[next], at);
  }

  function jumpToKey(key) {
    var at = AREA_KEYS.indexOf(key);
    if (at >= 0 && M.domains[at]) { go({ kind: "domain", domainId: M.domains[at].id }); return true; }
    var upper = String(key).toUpperCase();
    if (upper === UTIL_KEYS.home) { go({ kind: "home" }); return true; }
    if (upper === UTIL_KEYS.all) { go({ kind: "all" }); return true; }
    if (upper === UTIL_KEYS.copy) { go({ kind: "copy", step: "source" }); return true; }
    if (upper === UTIL_KEYS.doctor) { go({ kind: "manager", managerId: "manager-doctor" }); return true; }
    return false;
  }

  /* Escape closes the innermost thing and stops at Settings Home. It never closes
   * Settings, because a reader pressing Escape twice should not lose the page. */
  function onKeydown(e) {
    if (e.key === "Escape") {
      if (ui.dropOpen) { ui.dropOpen = false; render(); e.stopPropagation(); return; }
      var openDetail = Object.keys(ui.openDetails).filter(function (k) { return ui.openDetails[k]; });
      if (openDetail.length) { ui.openDetails = {}; render(); e.stopPropagation(); return; }
      var route = RT.current();
      if (route.kind === "home") return;
      var back = backTarget(route);
      go(back.dest);
      e.stopPropagation();
      return;
    }

    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (isTyping(e.target)) return;

    if (e.key === "Enter") {
      /* A table row is not a button, so Enter has to open it explicitly. */
      var active = document.activeElement;
      if (active && active.getAttribute && active.getAttribute("data-cs-item") &&
          active.tagName.toLowerCase() !== "button") {
        active.click();
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") { if (moveWithinPane(1)) e.preventDefault(); return; }
    if (e.key === "ArrowUp") { if (moveWithinPane(-1)) e.preventDefault(); return; }
    if (e.key === "ArrowRight") { if (moveBetweenPanes(1)) e.preventDefault(); return; }
    if (e.key === "ArrowLeft") { if (moveBetweenPanes(-1)) e.preventDefault(); return; }
    if (e.key === "/") {
      var field = document.querySelector("[data-pm-search-field]");
      if (field) { field.focus(); field.select(); e.preventDefault(); }
      return;
    }
    if (e.key && e.key.length === 1 && jumpToKey(e.key)) e.preventDefault();
  }

  /* --------------------------------------------------------------- history */

  /* What "Recently accessed" on Home is built from. Recorded on arrival at a real
   * destination, never for Home itself, and bounded by the store. */
  function rememberVisit(route) {
    if (!route) return;
    var dest = null;
    var label = null;
    if (route.kind === "manager" && route.managerId) {
      var rec = MG.record(route.managerId);
      label = (rec && rec.title) || route.managerId;
      dest = { kind: "manager", managerId: route.managerId };
    } else if (route.kind === "domain" && route.pageId) {
      var page = M.page(route.pageId);
      if (!page) return;
      label = page.title;
      dest = { kind: "domain", domainId: route.domainId, pageId: route.pageId };
    } else if (route.kind === "domain" && route.domainId) {
      var domain = M.domain(route.domainId);
      if (!domain) return;
      label = domain.title;
      dest = { kind: "domain", domainId: route.domainId };
    }
    if (!dest) return;
    store.remember({
      id: RT.href(dest),
      label: label,
      path: humanPath(RT.normalise(dest)),
      when: "this session",
      dest: dest
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
