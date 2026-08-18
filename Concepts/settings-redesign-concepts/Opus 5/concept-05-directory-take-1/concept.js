/* Opus 5 — Directory · Take 1
 *
 * Settings is a directory you can hold in your head.
 *
 * The whole design follows from one claim: a reader who has opened Settings
 * three times should be able to picture it. So there is exactly one way in (a
 * two-column grid of destinations under a full-width search field), exactly one
 * persistent index (a text rail of the twelve areas), and exactly one shape for
 * everything deeper (a roster on the left, the selected thing's form on the
 * right, its subpages as a quiet strip above the form). Nothing is presented
 * twice in two different grammars, because two grammars are what makes a
 * settings app unmemorable.
 *
 * Four decisions are worth stating because they are not obvious from the code:
 *
 * 1. Routing is by identity, never by position. A search result is opened
 *    through `PM2Index.byId(id).destination` and nothing else, and the arrival
 *    (scroll, focus, locator) is driven by the ROUTE rather than by the click.
 *    That way a deep link pasted into the address bar and a result chosen from
 *    the dropdown produce the identical screen, and there is no second code
 *    path that can drift.
 *
 * 2. Managers hydrate on entry and never before. Home, the rail, the domain
 *    pages and the search dropdown are built from the model and the index only
 *    -- `PM2Managers.spec()` is called from one function, `openManager`, so
 *    "typing did not instantiate forty managers" is a property of the file's
 *    shape rather than a promise.
 *
 * 3. The screen is rebuilt per route, but a control is never rebuilt under the
 *    reader's fingers. Editing patches the one row it belongs to, so focus,
 *    selection and caret survive; only navigation replaces a surface.
 *
 * 4. Semantic state lives in the store and the route, never in the DOM. Nothing
 *    here reads state back out of an attribute, which is what makes the design
 *    portable to a property-graph toolkit like Slint.
 */
(function () {
  "use strict";

  var M = window.PM2Model;
  var IX = window.PM2Index;
  var RT = window.PM2Route;
  var STATES = window.PM2States;
  var MGR = window.PM2Managers;
  var COPY = window.PM2Copy;
  var VIRT = window.PMVirtual;
  var WORK = window.PMWork;
  var ICON = window.PMIcons.icon;
  var ESC = window.PMShell.escapeHtml;

  var CONCEPT_ID = "concept-05-directory-take-1";
  var ROW_RHYTHM = 34;          /* the virtualized row height, in px */
  var GROUP_INLINE_MAX = 12;    /* object groups longer than this get a table */

  var store = window.PM2Store.create(CONCEPT_ID);
  COPY.attach(store);

  /* Session state. None of this is persisted: a half-open disclosure or a
   * half-finished transaction restored from storage would be a claim about what
   * happened while the page was closed. */
  var ui = {
    query: "",
    results: null,
    dropOpen: false,
    activeResult: -1,
    selectedResult: null,
    openSections: {},
    openWhy: {},
    drawer: false,
    pane: "roster",
    entry: {},          /* managerId -> selected roster entry key */
    tab: {},            /* managerId + entry -> selected subpage */
    transfer: null,     /* the rect of the thing that was pressed */
    back: false,
    suppress: false,
    drafts: {},         /* settingId -> text the reader typed but that is not valid */
    copy: null,
    allScroll: 0
  };

  var shell, root, railEl, drawerEl, colEl, topEl, canvasEl, searchInput, dropEl,
      titleEl, crumbEl, backEl, closeEl, projectEl, browseBtn;
  var release = VIRT.releasePool();
  var searchGen = VIRT.generations("search");

  /* ------------------------------------------------------------------ DOM */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = String(text);
    return n;
  }

  function html(tag, cls, markup) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (markup != null) n.innerHTML = markup;
    return n;
  }

  function on(node, type, fn) {
    node.addEventListener(type, fn);
    return node;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
    return node;
  }

  function add(parent) {
    for (var i = 1; i < arguments.length; i++) {
      if (arguments[i]) parent.appendChild(arguments[i]);
    }
    return parent;
  }

  function iconNode(name, size) {
    return html("span", "pm-icon-wrap", ICON(name, size || 14));
  }

  /* --------------------------------------------------------------- words */

  /* Internal names are never printed as prose. Roster keys, enum values and
   * option ids all pass through here before a reader sees them. */
  function human(value) {
    var s = String(value == null ? "" : value);
    if (!s) return "";
    if (/^[a-z0-9]+([-_.][a-z0-9]+)+$/i.test(s) || /^[a-z]+[A-Z]/.test(s)) {
      s = s.replace(/[-_.]+/g, " ").replace(/([a-z0-9])([A-Z])/g, "$1 $2");
      return s.charAt(0).toUpperCase() + s.slice(1);
    }
    return s;
  }

  function plural(word, n) {
    var w = String(word || "item").toLowerCase();
    if (n === 1) return w;
    if (/s$/.test(w)) return w;
    if (/y$/.test(w)) return w.slice(0, -1) + "ies";
    return w + "s";
  }

  function count(n, word) {
    return n + " " + plural(word, n);
  }

  function displayValue(value) {
    if (value == null || value === "") return "Not set";
    if (value === true) return "On";
    if (value === false) return "Off";
    if (Object.prototype.toString.call(value) === "[object Array]") {
      return value.length ? value.map(human).join(", ") : "Empty";
    }
    if (typeof value === "object") {
      var keys = Object.keys(value);
      return keys.length ? count(keys.length, "pair") : "Empty";
    }
    return human(value);
  }

  /* ------------------------------------------------------------- routing */

  /* Every link carries the fixture in force, so a deep link a reviewer copies
   * reproduces the exact screen they were looking at rather than the happy one. */
  function dest(d) {
    var out = RT.normalise(d);
    out.state = RT.state();
    out.demo = out.state;
    return out;
  }

  function href(d) { return RT.href(dest(d)); }

  function go(d, opts) { return RT.go(dest(d), opts); }

  function link(d, cls, opts) {
    var a = el("a", cls);
    a.href = href(d);
    if (opts && opts.transfer) {
      on(a, "click", function () { rememberTransfer(a); });
    }
    return a;
  }

  function button(cls, label) {
    var b = el("button", cls, label);
    b.type = "button";
    return b;
  }

  /* Expand-and-transfer needs to know where the pressed thing was. The rect is
   * captured at press time and consumed by the next render; if the reader
   * arrives some other way it is simply absent and the surface fades in. */
  function rememberTransfer(node) {
    if (!node || !canvasEl) return;
    var a = node.getBoundingClientRect();
    var b = canvasEl.getBoundingClientRect();
    ui.transfer = { x: Math.round(a.left - b.left), y: Math.round(a.top - b.top) };
  }

  /* --------------------------------------------------------- fixtures */

  function effects() { return STATES.effects() || {}; }

  function rowState(rec) { return STATES.rowState(rec); }

  /* ------------------------------------------------------------- objects */

  /* Everything inside a manager, read from the search index rather than from a
   * manager spec. This is what lets a roster be drawn -- and a deep link to an
   * installation or a theme be honoured -- without waking a single manager up. */
  var objectCache = null;
  var objectScale = null;

  function objectModel() {
    var sig = window.PM2Scale && window.PM2Scale.active() ? "scale" : "base";
    if (objectCache && objectScale === sig) return objectCache;
    var byManager = {};
    var records = IX.records();
    for (var i = 0; i < records.length; i++) {
      var rec = records[i];
      var d = rec.destination;
      if (!d.managerId || !d.objectId) continue;
      var m = byManager[d.managerId] ||
        (byManager[d.managerId] = { order: [], groups: {}, objects: {} });
      var key = d.sectionKey || "items";
      var group = m.groups[key];
      if (!group) {
        group = m.groups[key] = { key: key, label: "", objects: [] };
        m.order.push(key);
      }
      var obj = m.objects[d.objectId];
      if (!obj) {
        obj = m.objects[d.objectId] = {
          id: d.objectId, label: d.objectId, desc: "", typeLabel: "Item",
          availability: null, group: null, rows: {}, rowOrder: [], record: null
        };
      }
      if (d.rowId) {
        /* A row inside an object: the object's own name is the row's
         * disambiguator, which is exactly the parent label the index recorded. */
        var bucket = obj.rows[key] || (obj.rows[key] = (obj.rowOrder.push(key), []));
        bucket.push(rec);
        if (obj.label === obj.id && rec.disambiguator) obj.label = rec.disambiguator;
      } else {
        obj.label = rec.label;
        obj.desc = rec.desc;
        obj.typeLabel = rec.typeLabel;
        obj.availability = rec.availability;
        obj.record = rec;
        if (!obj.group) obj.group = key;
        group.objects.push(d.objectId);
        if (!group.label) group.label = plural(rec.typeLabel, 2);
      }
    }
    /* A group that only ever held rows still needs a name for its tab. */
    Object.keys(byManager).forEach(function (id) {
      var m = byManager[id];
      m.order.forEach(function (k) {
        if (!m.groups[k].label) m.groups[k].label = human(k);
      });
    });
    objectCache = byManager;
    objectScale = sig;
    return objectCache;
  }

  function objectsOf(managerId) {
    return objectModel()[managerId] || { order: [], groups: {}, objects: {} };
  }

  /* The one-line figure a destination row carries. Honest and cheap: it counts
   * what the index already knows, and it never opens the manager to find out. */
  function managerFigure(managerId) {
    var model = objectsOf(managerId);
    var best = null;
    for (var i = 0; i < model.order.length; i++) {
      var g = model.groups[model.order[i]];
      if (!g.objects.length) continue;
      if (!best || g.objects.length > best.objects.length) best = g;
    }
    if (!best) return null;
    return best.objects.length + " " + plural(best.label, best.objects.length);
  }

  /* -------------------------------------------------------------- shell */

  function stateControl() {
    var wrap = el("div", "dr-state-control");
    var id = "dr-state-fixture";
    var label = el("label", null, "Situation");
    label.setAttribute("for", id);
    var select = el("select");
    select.id = id;
    select.setAttribute("data-pm-state-control", "1");
    STATES.grouped().forEach(function (group) {
      var og = document.createElement("optgroup");
      og.label = group.group;
      group.items.forEach(function (f) {
        var o = document.createElement("option");
        o.value = f.id;
        o.textContent = f.label;
        o.title = f.note;
        og.appendChild(o);
      });
      select.appendChild(og);
    });
    select.value = STATES.active();
    on(select, "change", function () {
      var next = RT.normalise(RT.current());
      next.state = select.value === "normal" ? null : select.value;
      next.demo = next.state;
      store.set({ stateFixture: next.state });
      RT.go(next);
    });
    var reset = button("pm-toggle", "Reset this concept");
    reset.title = "Clear the values, edits and receipts this concept saved";
    on(reset, "click", function () {
      store.reset();
      MGR.invalidate();
      ui.drafts = {};
      ui.copy = null;
      render();
      shell.announce("Saved values, manager edits and receipts were cleared.");
    });
    add(wrap, label, select, reset);
    return wrap;
  }

  shell = window.PMShell.mount({
    rootId: "pm-root",
    concept: "Directory · Take 1 — Settings as a directory you can hold in your head",
    conceptId: CONCEPT_ID,
    theme: "friendly-dark",
    widthChoice: 1280,
    railOpen: true,
    panelOpen: false,
    extraControls: stateControl(),
    onWidthMode: function () { applyMode(); },
    onLayout: function () { applyMode(); }
  });

  /* ---------------------------------------------------------- chrome */

  function buildChrome() {
    root = el("div", "dr");
    root.setAttribute("data-mode", "wide");
    root.setAttribute("data-drawer", "closed");

    railEl = buildRail("dr-rail");
    colEl = el("div", "dr-col");

    topEl = el("div", "dr-top");
    var line = el("div", "dr-top-line");

    browseBtn = button("dr-btn is-quiet", null);
    add(browseBtn, iconNode("list"), el("span", null, "Areas"));
    browseBtn.hidden = true;
    on(browseBtn, "click", function () { setDrawer(!ui.drawer); });

    backEl = button("dr-btn", null);
    backEl.setAttribute("data-pm-back", "1");
    on(backEl, "click", function () { goBack(); });

    crumbEl = el("nav", "dr-crumbs");
    crumbEl.setAttribute("data-pm-breadcrumb", "1");
    crumbEl.setAttribute("aria-label", "Settings location");

    projectEl = html("span", "dr-project", ICON("folder", 13) +
      "<span>Project</span> <strong>" + ESC(M.project.name) + "</strong>");
    projectEl.setAttribute("data-pm-project", "1");
    projectEl.title = M.project.path;

    closeEl = button("dr-btn", null);
    closeEl.setAttribute("data-pm-close", "1");
    add(closeEl, iconNode("ban"), el("span", null, "Close Settings"));
    on(closeEl, "click", closeSettings);

    add(line, browseBtn, backEl, crumbEl, projectEl, closeEl);

    titleEl = el("h1", "dr-title", "Settings");

    var searchWrap = el("div", "dr-search-wrap");
    var field = el("div", "dr-search-field");
    searchInput = el("input");
    searchInput.type = "search";
    searchInput.setAttribute("data-pm-search-field", "1");
    searchInput.setAttribute("aria-label", "Search all of Settings");
    searchInput.setAttribute("autocomplete", "off");
    searchInput.placeholder = "Search settings, providers, models and tools";
    on(searchInput, "input", function () { ui.query = searchInput.value; runSearch(); });
    on(searchInput, "focus", function () { if (ui.query) runSearch(); });
    on(searchInput, "keydown", onSearchKey);
    add(field, iconNode("search"), searchInput, el("span", "dr-search-hint", "828 settings"));
    dropEl = el("div", "dr-drop dr-scroll");
    dropEl.setAttribute("data-pm-search-dropdown", "1");
    dropEl.hidden = true;
    add(searchWrap, field, dropEl);

    add(topEl, line, titleEl, searchWrap);

    canvasEl = el("div", "dr-canvas dr-scroll");
    add(colEl, topEl, canvasEl);

    drawerEl = buildRail("dr-drawer");
    var scrim = el("div", "dr-scrim");
    on(scrim, "click", function () { setDrawer(false); });

    add(root, railEl, colEl);
    add(colEl, scrim, drawerEl);
    add(shell.main, root);
  }

  function buildRail(cls) {
    var rail = el("div", cls);
    var head = el("div", "dr-rail-head", "Settings");
    var list = el("div", "dr-rail-list dr-scroll");
    var foot = el("div", "dr-rail-foot");

    var home = link({ kind: "home" }, "dr-rail-item");
    home.textContent = "Home";
    home.setAttribute("data-rail", "home");
    add(list, home);

    add(list, el("div", "dr-rail-group", "Areas"));
    M.domains.forEach(function (d) {
      var a = link({ kind: "domain", domainId: d.id }, "dr-rail-item");
      a.textContent = d.title;
      a.title = d.purpose;
      a.setAttribute("data-rail", d.id);
      a.setAttribute("data-pm-domain", d.id);
      add(list, a);
    });

    var all = link({ kind: "all" }, "dr-rail-item");
    all.textContent = "All settings";
    all.setAttribute("data-rail", "all");
    var copy = link({ kind: "copy" }, "dr-rail-item");
    copy.textContent = "Copy from another Project";
    copy.setAttribute("data-rail", "copy");
    add(foot, all, copy);

    add(rail, head, list, foot);
    if (cls === "dr-drawer") {
      on(rail, "click", function (e) {
        if (e.target && e.target.closest && e.target.closest("a")) setDrawer(false);
      });
    }
    return rail;
  }

  function setDrawer(open) {
    ui.drawer = !!open;
    root.setAttribute("data-drawer", ui.drawer ? "open" : "closed");
    if (ui.drawer) {
      var first = drawerEl.querySelector(".dr-rail-item");
      if (first) first.focus();
    } else if (browseBtn && !browseBtn.hidden) {
      browseBtn.focus();
    }
  }

  function applyMode() {
    if (!root) return;
    var narrow = shell.widthMode() !== "normal";
    root.setAttribute("data-mode", narrow ? "narrow" : "wide");
    browseBtn.hidden = !narrow;
    if (!narrow && ui.drawer) setDrawer(false);
  }

  function markRail(key) {
    [railEl, drawerEl].forEach(function (rail) {
      var items = rail.querySelectorAll(".dr-rail-item");
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (it.getAttribute("data-rail") === key) it.setAttribute("aria-current", "true");
        else it.removeAttribute("aria-current");
      }
    });
  }

  /* ----------------------------------------------------------- search */

  function runSearch() {
    var text = String(ui.query || "").trim();
    if (!text) { closeDrop(); return; }
    var token = searchGen.next();
    var res = IX.query(text, { limit: 40, perGroup: 8 });
    if (!searchGen.isCurrent(token)) return;
    ui.results = res;
    ui.activeResult = -1;
    renderDrop(res);
  }

  function renderDrop(res) {
    clear(dropEl);
    dropEl.hidden = false;
    ui.dropOpen = true;

    if (!res.total) {
      var empty = el("div", "dr-drop-empty");
      add(empty,
        el("strong", null, "Nothing in Settings matches “" + res.query + "”"),
        el("div", null, "Try a shorter word, or browse the areas in the rail. Every setting is also listed in All settings."));
      var allLink = link({ kind: "all" }, "dr-btn is-quiet");
      allLink.textContent = "Open All settings";
      add(empty, allLink);
      add(dropEl, empty);
      return;
    }

    res.groups.forEach(function (group) {
      add(dropEl, el("div", "dr-drop-group", group.label));
      group.results.forEach(function (rec) {
        add(dropEl, resultButton(rec));
      });
      if (group.truncated) {
        add(dropEl, el("div", "dr-drop-foot",
          group.total - group.shown + " more in " + group.label.toLowerCase() +
          " — press Enter for the full list."));
      }
    });

    add(dropEl, el("div", "dr-drop-foot",
      res.shown + " of " + res.total + " results. Press Enter to see every one of them."));
  }

  function resultButton(rec) {
    var b = button("dr-result", null);
    b.setAttribute("data-pm-result", rec.id);
    if (ui.selectedResult === rec.id) b.setAttribute("aria-selected", "true");
    var main = el("div", "dr-result-main");
    add(main, el("div", "dr-result-label", rec.label));
    add(main, el("div", "dr-result-path", rec.path || "Settings"));
    if (rec.availability) {
      add(main, el("div", "dr-result-path", rec.availability));
    }
    add(b, main, el("span", "dr-result-type", rec.typeLabel));
    on(b, "click", function () { openResult(rec.id); });
    return b;
  }

  /* The only route out of a search result. `byId` is the whole contract: a
   * result's position in the list, its label and its group are all irrelevant. */
  function openResult(resultId) {
    var rec = IX.byId(resultId);
    if (!rec) return;
    ui.selectedResult = resultId;
    closeDrop();
    store.remember({ id: rec.id, label: rec.label, path: rec.path });

    /* Two pushes: the query first, so Back lands on the search that found it
     * with both the text and the chosen result restored, then the destination. */
    ui.suppress = true;
    RT.go(dest({ kind: "query", query: ui.query, resultId: resultId }));
    ui.suppress = false;
    go(rec.destination);
    shell.announce("Opened " + rec.label + " in " + (rec.path || "Settings") + ".");
  }

  function closeDrop() {
    ui.dropOpen = false;
    dropEl.hidden = true;
    clear(dropEl);
  }

  function onSearchKey(e) {
    if (e.key === "Escape") {
      if (ui.dropOpen) { closeDrop(); e.stopPropagation(); }
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (ui.activeResult >= 0) {
        var nodes = dropEl.querySelectorAll("[data-pm-result]");
        if (nodes[ui.activeResult]) { nodes[ui.activeResult].click(); return; }
      }
      if (String(ui.query || "").trim()) go({ kind: "query", query: ui.query });
      return;
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    var list = dropEl.querySelectorAll("[data-pm-result]");
    if (!list.length) return;
    e.preventDefault();
    ui.activeResult += (e.key === "ArrowDown" ? 1 : -1);
    if (ui.activeResult < 0) ui.activeResult = list.length - 1;
    if (ui.activeResult >= list.length) ui.activeResult = 0;
    for (var i = 0; i < list.length; i++) list[i].classList.remove("is-active");
    list[ui.activeResult].classList.add("is-active");
    list[ui.activeResult].scrollIntoView({ block: "nearest" });
  }

  /* ------------------------------------------------------------ chrome up */

  function setCrumbs(parts) {
    clear(crumbEl);
    parts.forEach(function (part, i) {
      if (i) add(crumbEl, html("span", "dr-crumb-sep", ICON("chevronRight", 11)));
      var node;
      if (part.dest && i < parts.length - 1) {
        node = link(part.dest, "dr-crumb");
        node.textContent = part.label;
      } else {
        node = el("span", "dr-crumb" + (i === parts.length - 1 ? " is-last" : ""), part.label);
      }
      add(crumbEl, node);
    });
  }

  function setBack(target) {
    clear(backEl);
    if (!target) {
      backEl.hidden = true;
      backEl.removeAttribute("data-back-dest");
      return;
    }
    backEl.hidden = false;
    add(backEl, iconNode("chevronLeft"), el("span", null, "Back to " + target.label));
    backEl.__dest = target.dest;
  }

  function goBack() {
    ui.back = true;
    if (backEl.__dest) go(backEl.__dest);
    else go({ kind: "home" });
  }

  function closeSettings() {
    store.set({ closed: true });
    shell.announce("Close Settings returns to the surface that opened it.");
    shell.notify({
      id: "dr-close-" + Date.now(),
      title: "Close Settings",
      reason: "In the application this returns to Threads, the surface that opened Settings. Nothing was changed.",
      at: "just now"
    });
    ui.back = true;
    go({ kind: "home" });
  }

  /* ================================================================ HOME */

  function renderHome() {
    var s = el("div", "dr-surface dr-home");
    s.setAttribute("data-pm-surface", "home");

    var e = effects();
    var notice = STATES.notice();
    if (notice && !store.isDismissed(notice.id)) add(s, noticeBlock(notice));

    /* At most one critical notice, then the compact attention list. Anything
     * longer than four lines is a wall, and a wall is not a list. */
    var items = (STATES.attention() || []).slice();
    situations(e).forEach(function (x) { items.push(x); });

    var att = el("div", "dr-block");
    var head = el("div", "dr-block-head");
    add(head, el("div", "dr-block-title", "Needs attention"));
    if (items.length) add(head, el("div", "dr-block-note", count(items.length, "item")));
    add(att, head);
    var list = el("div", "dr-att");
    if (!items.length) {
      add(list, el("div", "dr-att-empty",
        e.noAttention
          ? "Nothing has been set up in this Project yet, so nothing is failing."
          : "Nothing needs attention in this Project."));
    } else {
      items.slice(0, 4).forEach(function (item) { add(list, attentionRow(item)); });
    }
    add(att, list);
    add(s, att);

    if (e.forceQuery) add(s, forcedSearchBlock(e));

    /* The directory itself: the twelve areas, each with its one-line purpose. */
    var browse = el("div", "dr-block");
    var bh = el("div", "dr-block-head");
    add(bh, el("div", "dr-block-title", "Browse settings"));
    add(bh, el("div", "dr-block-note",
      M.counts.settings + " settings in " + M.counts.domains + " areas, " +
      M.counts.pages + " pages and " + (M.FAMILIES.length + M.EXTRA_MANAGERS.length) + " managers"));
    add(browse, bh);

    var grid = el("div", "dr-grid");
    M.domains.forEach(function (d) { add(grid, domainCard(d)); });
    add(browse, grid);
    add(s, browse);

    add(s, utilities());
    return s;
  }

  function domainCard(d) {
    var a = link({ kind: "domain", domainId: d.id }, "dr-card", { transfer: true });
    a.setAttribute("data-pm-domain", d.id);
    add(a, html("span", "dr-card-icon", ICON(d.icon, 15)));
    var main = el("div", "dr-card-main");
    add(main, el("div", "dr-card-title", d.title));
    add(main, el("div", "dr-card-purpose", d.purpose));
    add(a, main);
    add(a, el("span", "dr-card-meta", d.count + " settings"));
    add(a, html("span", "dr-card-chev", ICON("chevronRight", 14)));
    return a;
  }

  function noticeBlock(notice) {
    var n = el("div", "dr-notice");
    n.setAttribute("data-tone", notice.tone === "info" ? "info" : "attention");
    n.setAttribute("data-pm-notice", notice.id);
    add(n, html("span", "dr-notice-icon", ICON(notice.tone === "info" ? "info" : "alert", 15)));
    var body = el("div", "dr-notice-body");
    add(body, el("div", "dr-notice-head", notice.headline));
    add(body, el("div", "dr-notice-detail", notice.detail));
    add(n, body);
    var acts = el("div", "dr-notice-acts");
    if (notice.action) {
      var a = link(notice.action.destination, "dr-btn is-primary");
      a.textContent = notice.action.label;
      add(acts, a);
    }
    var dismiss = button("dr-btn is-quiet", "Dismiss");
    on(dismiss, "click", function () { store.dismiss(notice.id); render(); });
    add(acts, dismiss);
    add(n, acts);
    return n;
  }

  function attentionRow(item) {
    var row = el("div", "dr-att-item");
    add(row, html("span", "dr-notice-icon",
      ICON(item.tone === "attention" ? "alert" : (item.tone === "setup" ? "wrench" : "info"), 14)));
    var main = el("div", "dr-att-main");
    add(main, el("div", "dr-att-label", item.label));
    add(main, el("div", "dr-att-detail", item.detail));
    add(row, main);
    if (item.destination) {
      var a = link(item.destination, "dr-btn");
      a.textContent = item.actionLabel || "Open";
      add(row, a);
    }
    return row;
  }

  /* What the fixture in force actually means for this Project, as items a
   * reader can act on rather than a badge that says which demo is running. */
  function situations(e) {
    var out = [];
    function push(tone, label, detail, actionLabel, destination) {
      out.push({ tone: tone, label: label, detail: detail, actionLabel: actionLabel, destination: destination });
    }
    if (e.refreshing) {
      push("info", "Settings are being read again from this host",
        "Everything below is the last value that was read. It stays on screen until the refresh finishes.",
        "Open Doctor", { managerId: "manager-doctor" });
    }
    if (e.emptyRosters) {
      push("setup", "Nothing is configured in this Project yet",
        "There is no provider, no persona and no tool set up, so most rosters are empty.",
        "Set up a provider", { managerId: "manager-providers" });
    }
    if (e.validationError) {
      push("attention", "A text size you entered was not accepted",
        "The value you typed is still in the field, with the reason beside it.",
        "Fix it", { settingId: "general.visual.font-size" });
    }
    if (e.changedElsewhere) {
      push("info", "Two values changed in another window",
        "This Project was edited somewhere else while this page was open. The rows say which values moved.",
        "Review", { settingId: "general.visual.theme" });
    }
    if (e.usageUnavailable) {
      push("info", "One provider is ready but reports no balance",
        "Being able to answer and being able to measure are separate facts, and only the second is missing.",
        "Open providers", { managerId: "manager-providers" });
    }
    if (e.managedOverride) {
      push("info", "Some values here are set by Workspace policy",
        "They are readable and explained, and they cannot be changed in this Project.",
        "See them", { kind: "all", facet: encodeFacet({ states: ["managed"] }) });
    }
    if (e.unavailableOverride) {
      push("info", "Some capabilities are not provided by this host",
        "Those settings stay findable and say why, rather than disappearing from the directory.",
        "See them", { kind: "all", facet: encodeFacet({ states: ["unavailable"] }) });
    }
    if (e.multiInstall) {
      push("setup", "Two installations answer for one provider family",
        "The one this Project uses is bound by identity; the other is shadowed and named.",
        "Open installations", providerInstallationDest());
    }
    if (e.unknownOwner) {
      push("setup", "One installation has an owner that cannot be named",
        "Puppet Master will not adopt, update or repair something it cannot identify, so it stays manual only.",
        "Open installations", providerInstallationDest());
    }
    if (e.importConflict) {
      push("attention", "An import disagrees with values this Project already has",
        "Every disagreement is itemised before anything is applied.",
        "Review the preview", { kind: "copy", step: "preview" });
    }
    if (e.rollbackComplete) {
      push("info", "The last transaction was rolled back",
        "The restore point and the receipt are both still available.",
        "Open the receipt", { managerId: "manager-copy" });
    }
    return out;
  }

  /* The installations subpage is addressed through the first installation the
   * index knows about, because the route grammar names an object, not a tab. */
  function providerInstallationDest() {
    var model = objectsOf("manager-providers");
    var group = model.groups.installations;
    if (group && group.objects.length) {
      return { managerId: "manager-providers", objectId: group.objects[0], sectionKey: "installations" };
    }
    return { managerId: "manager-providers" };
  }

  function forcedSearchBlock(e) {
    var res = IX.query(e.forceQuery, { limit: 6, perGroup: 3 });
    var block = el("div", "dr-block");
    var head = el("div", "dr-block-head");
    add(head, el("div", "dr-block-title", "Search"));
    add(head, el("div", "dr-block-note", "“" + e.forceQuery + "”"));
    add(block, head);
    var box = el("div", "dr-att");
    if (!res.total) {
      var empty = el("div", "dr-att-empty");
      empty.textContent = "Nothing in Settings matches “" + e.forceQuery +
        "”. Every setting is still listed in All settings, and shorter words match more.";
      add(box, empty);
    } else {
      add(box, el("div", "dr-att-empty",
        "The closest matches for “" + e.forceQuery + "”, including ones spelled differently:"));
      res.groups.forEach(function (group) {
        group.results.forEach(function (rec) {
          var row = el("div", "dr-att-item");
          var main = el("div", "dr-att-main");
          add(main, el("div", "dr-att-label", rec.label));
          add(main, el("div", "dr-att-detail", rec.path || rec.typeLabel));
          add(row, main);
          var b = button("dr-btn", "Open");
          b.setAttribute("data-pm-result", rec.id);
          on(b, "click", function () { ui.query = e.forceQuery; searchInput.value = e.forceQuery; openResult(rec.id); });
          add(row, b);
          add(box, row);
        });
      });
    }
    add(block, box);
    return block;
  }

  function utilities() {
    var block = el("div", "dr-block");
    add(block, el("div", "dr-block-head", null));
    var head = block.firstChild;
    add(head, el("div", "dr-block-title", "Also here"));
    var util = el("div", "dr-util");

    var all = link({ kind: "all" }, "dr-util-link");
    add(all, iconNode("list"), el("span", null, "All settings"),
      el("span", "dr-util-count", M.counts.settings + " records"));
    var copy = link({ kind: "copy" }, "dr-util-link");
    add(copy, iconNode("columns"), el("span", null, "Copy settings from another Project"));
    var changed = link({ kind: "all", facet: encodeFacet({ changed: true }) }, "dr-util-link");
    add(changed, iconNode("history"), el("span", null, "Changed in this Project"),
      el("span", "dr-util-count", String(store.changedCount())));
    var receipts = link({ managerId: "manager-settings-lifecycle" }, "dr-util-link");
    add(receipts, iconNode("archive"), el("span", null, "Export, import and reset"));
    add(util, all, copy, changed, receipts);
    add(block, util);

    var recent = (store.get().recent || []).slice(0, 4);
    if (recent.length) {
      var rec = el("div", "dr-recent");
      add(rec, el("div", "dr-block-title", "Recently opened"));
      recent.forEach(function (entry) {
        var record = IX.byId(entry.id);
        if (!record) return;
        var a = link(record.destination, "dr-recent-item");
        add(a, el("span", null, record.label), el("span", "dr-recent-path", record.path || ""));
        add(rec, a);
      });
      add(block, rec);
    }
    return block;
  }

  /* ============================================================== DOMAIN */

  function renderDomain(domainId) {
    var d = M.domain(domainId);
    var s = el("div", "dr-surface");
    s.setAttribute("data-pm-surface", "domain");
    s.setAttribute("data-pm-domain", d.id);

    var head = el("div", "dr-head");
    if (ui.transfer) head.classList.add("dr-transfer");
    var h1 = el("h1", null, d.title);
    add(head, h1);
    add(head, el("div", "dr-head-purpose", d.purpose));
    add(head, el("div", "dr-head-meta",
      d.count + " settings across " + count(d.pages.length, "page") +
      " and " + count(d.families.length, "manager") + " in this area."));
    add(s, head);

    var pages = el("div", "dr-block");
    add(pages, el("div", "dr-block-head", null));
    add(pages.firstChild, el("div", "dr-block-title", "Pages"));
    var list = el("div", "dr-list");
    d.pages.forEach(function (p) {
      var a = link({ kind: "domain", domainId: d.id, pageId: p.id }, "dr-dest", { transfer: true });
      a.setAttribute("data-pm-page", p.id);
      var main = el("div", "dr-dest-main");
      add(main, el("div", "dr-dest-title", p.title));
      add(main, el("div", "dr-dest-purpose", p.summary || ""));
      add(a, main);
      add(a, el("span", "dr-dest-meta", p.count + " settings"));
      add(a, html("span", "dr-card-chev", ICON("chevronRight", 14)));
      add(list, a);
    });
    add(pages, list);
    add(s, pages);

    if (d.families.length) {
      var mans = el("div", "dr-block");
      add(mans, el("div", "dr-block-head", null));
      add(mans.firstChild, el("div", "dr-block-title", "Managers in this area"));
      add(mans.firstChild, el("div", "dr-block-note",
        "Places with their own roster, rather than pages of rows."));
      var mlist = el("div", "dr-list");
      d.families.forEach(function (f) { add(mlist, managerDestination(f)); });
      add(mans, mlist);
      add(s, mans);
    }
    return s;
  }

  /* A destination link, built from the registry record only. Opening it is what
   * hydrates the manager; naming it must not. */
  function managerDestination(family) {
    var rec = MGR.record(family.managerId);
    var a = link({ managerId: family.managerId }, "dr-dest", { transfer: true });
    a.setAttribute("data-pm-manager", family.managerId);
    var main = el("div", "dr-dest-main");
    add(main, el("div", "dr-dest-title", rec.title || family.family));
    add(main, el("div", "dr-dest-purpose",
      family.deferred ? ("Owned by " + family.owner + ". " + (rec.purpose || "")) : (rec.purpose || "")));
    add(a, main);
    var figure = family.deferred ? "Separate owner" : managerFigure(family.managerId);
    if (figure) add(a, el("span", "dr-dest-meta", figure));
    add(a, html("span", "dr-card-chev", ICON("chevronRight", 14)));
    return a;
  }

  /* ================================================================ PAGE */

  function renderPage(route) {
    var page = M.page(route.pageId);
    var domain = M.domain(page.domainId);
    var s = el("div", "dr-surface");
    s.setAttribute("data-pm-surface", "page");
    s.setAttribute("data-pm-page", page.id);
    s.setAttribute("data-pm-domain", domain.id);

    var rows = M.rowsInPage(page.id);
    var advanced = rows.filter(function (r) { return r.exposure !== "standard"; }).length;

    var head = el("div", "dr-head");
    if (ui.transfer) head.classList.add("dr-transfer");
    add(head, el("h1", null, page.title));
    if (page.summary) add(head, el("div", "dr-head-purpose", page.summary));
    add(head, el("div", "dr-head-meta",
      count(rows.length, "setting") + " in " + count(page.sections.length, "group") +
      (advanced ? ". " + advanced + " of them are advanced and each group opens its own." : ".")));
    add(s, head);

    if (effects().restartPending) {
      add(s, inlineNote("info", "Two changes on this page take effect after a restart. They are saved already."));
    }

    /* A section is the unit of density: four to eight rows, everyday ones
     * visible, the rest one press away inside the same group. */
    page.sections.forEach(function (section) {
      add(s, renderSection(section, route));
    });
    return s;
  }

  function renderSection(section, route) {
    var block = el("div", "dr-section");
    block.setAttribute("data-pm-section", section.id);

    var rows = M.rowsInSection(section.id);
    var everyday = rows.filter(function (r) { return r.exposure === "standard"; });
    var deeper = rows.filter(function (r) { return r.exposure !== "standard"; });
    var open = !!ui.openSections[section.id];

    var head = el("div", "dr-section-head");
    add(head, el("h2", "dr-section-title", section.title));
    add(head, el("span", "dr-section-count", count(rows.length, "setting")));
    add(block, head);

    var visible = open ? rows : everyday;
    visible.forEach(function (rec) { add(block, renderRow(rec)); });

    if (!visible.length) {
      add(block, el("div", "dr-att-empty",
        "Every setting in this group is advanced. Open it to see " + count(deeper.length, "setting") + "."));
    }

    if (deeper.length) {
      var toggle = button("dr-disclose", null);
      add(toggle, html("span", null, ICON(open ? "chevronUp" : "chevronDown", 12)));
      add(toggle, el("span", null, open
        ? "Show only the everyday settings in this group"
        : "Show " + count(deeper.length, "advanced setting") + " in this group"));
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      /* The group is replaced in place rather than through a re-render: opening
       * a disclosure must not move the page under the reader. */
      on(toggle, "click", function () {
        ui.openSections[section.id] = !open;
        store.set({ exposure: open ? "standard" : "all" });
        var current = canvasEl.querySelector('[data-pm-section="' + section.id + '"]');
        if (!current) return;
        var fresh = renderSection(section, route);
        current.parentNode.replaceChild(fresh, current);
        var again = fresh.querySelector(".dr-disclose");
        if (again) again.focus();
      });
      add(block, toggle);
    }
    return block;
  }

  /* ================================================================= ROWS */

  function renderRow(rec) {
    var state = rowState(rec);
    var editable = M.isEditable(state);
    var row = el("div", "dr-row");
    row.setAttribute("data-pm-row", rec.id);
    row.setAttribute("tabindex", "-1");

    var main = el("div", "dr-row-main");
    var label = el("div", "dr-row-label");
    add(label, el("span", null, rec.label));
    var tone = M.stateTone(state);
    if (tone !== "quiet") {
      add(label, chip(M.stateLabel(state), tone));
    }
    if (rec.exposure !== "standard") add(label, chip(exposureWord(rec.exposure), "quiet"));
    if (state && state.restart === "required") add(label, chip("Restart to take effect", "setup"));
    if (effects().changedElsewhere && rec.id === "general.visual.theme") {
      add(label, chip("Changed in another window", "attention"));
    }
    add(main, label);
    add(main, el("div", "dr-row-desc", rec.desc));

    var foot = el("div", "dr-row-foot");
    var reason = M.stateReason(state);
    var why = button("dr-why", "Why this value?");
    why.setAttribute("aria-expanded", ui.openWhy[rec.id] ? "true" : "false");
    on(why, "click", function () {
      ui.openWhy[rec.id] = !ui.openWhy[rec.id];
      patchRow(rec.id);
    });
    add(foot, why);
    if (store.changed(rec.id) && editable) {
      var reset = button("dr-btn is-quiet", "Reset to default");
      on(reset, "click", function () {
        store.clearValue(rec.id);
        delete ui.drafts[rec.id];
        patchRow(rec.id);
        shell.announce(rec.label + " is back to its default.");
      });
      add(foot, reset);
    }
    add(main, foot);

    if (ui.openWhy[rec.id]) add(main, whyBody(rec, state, reason));

    var side = el("div", "dr-row-side");
    var built = controlFor(rec, state, editable);
    add(side, built.node);
    if (built.note) add(side, el("div", "dr-field-help", built.note));
    var draft = ui.drafts[rec.id];
    if (draft && draft.message) {
      add(side, add(el("div", "dr-err"), html("span", null, ICON("alert", 12)), el("span", null, draft.message)));
    }

    add(row, main, side);
    return row;
  }

  function whyBody(rec, state, reason) {
    var body = el("div", "dr-why-body");
    add(body, el("div", null, reason ||
      "This is the product default for a new Project. Nothing has changed it."));
    var dl = el("dl");
    function fact(term, value) {
      if (value == null || value === "") return;
      add(dl, el("dt", null, term), el("dd", null, value));
    }
    fact("Now", displayValue(store.valueOf(rec.id)));
    fact("Default", displayValue(rec.state.defaultValue));
    if (rec.recommended != null && rec.recommended !== "") fact("Recommended", displayValue(rec.recommended));
    fact("Where it lives", pathOf(rec));
    fact("Level", exposureWord(rec.exposure));
    fact("Restart", state && state.restart === "required" ? "Needed before it applies" : "Not needed");
    if (state && state.managedBy) fact("Set by", state.managedBy);
    fact("Kind", human(rec.kind));
    add(body, dl);
    return body;
  }

  function pathOf(rec) {
    var d = M.domain(rec.domainId), p = M.page(rec.pageId), s = M.section(rec.sectionId);
    return [d && d.title, p && p.title, s && s.title].filter(Boolean).join(" › ");
  }

  function exposureWord(id) {
    for (var i = 0; i < M.EXPOSURE.length; i++) if (M.EXPOSURE[i].id === id) return M.EXPOSURE[i].label;
    return human(id);
  }

  function chip(text, tone) {
    var c = el("span", "dr-chip", text);
    if (tone) c.setAttribute("data-tone", tone);
    return c;
  }

  function inlineNote(tone, text) {
    var n = el("div", "dr-notice");
    n.setAttribute("data-tone", tone);
    add(n, html("span", "dr-notice-icon", ICON(tone === "attention" ? "alert" : "info", 15)));
    add(n, add(el("div", "dr-notice-body"), el("div", "dr-notice-detail", text)));
    return n;
  }

  /* Repaint exactly one row. Editing must never rebuild the page under the
   * reader's hands: the caret, the selection and the scroll position are all
   * part of what they are doing. */
  function patchRow(settingId) {
    var existing = canvasEl.querySelector('[data-pm-row="' + settingId + '"]');
    if (!existing) return;
    var rec = M.setting(settingId);
    if (!rec) return;
    var locator = existing.hasAttribute("data-pm-locator");
    var next = renderRow(rec);
    if (locator) next.setAttribute("data-pm-locator", "1");
    existing.parentNode.replaceChild(next, existing);
  }

  /* --------------------------------------------------------- controls */

  /* Every control writes through store.setValue and reads back through
   * store.valueOf, so a value shown anywhere in the concept is the same value.
   * Each returns the node plus the element that should take focus when a deep
   * link lands on this row. */
  function controlFor(rec, state, editable) {
    var value = store.valueOf(rec.id);
    var kind = rec.kind;
    var out;

    if (kind === "toggle") out = toggleControl(rec, value, editable);
    else if (kind === "select") out = selectControl(rec, value, editable);
    else if (kind === "radio") out = radioControl(rec, value, editable);
    else if (kind === "multiselect") out = multiControl(rec, value, editable);
    else if (kind === "slider") out = sliderControl(rec, value, editable);
    else if (kind === "number") out = numberControl(rec, value, editable);
    else if (kind === "list") out = listControl(rec, value, editable);
    else if (kind === "keyvalue") out = keyValueControl(rec, value, editable);
    else if (kind === "action") out = actionControl(rec, editable);
    else out = textControl(rec, value, editable, kind === "path");

    out.node.setAttribute("data-pm-control-host", rec.id);
    (out.focus || out.node).setAttribute("data-pm-control", rec.id);
    if (!editable) {
      out.note = state && state.source === "managed"
        ? "Set by " + (state.managedBy || "policy") + ". Readable here, changed there."
        : (state && state.reason) || "Not available on this host.";
    }
    return out;
  }

  function commit(rec, value, opts) {
    store.setValue(rec.id, value);
    if (!opts || opts.repaint !== false) patchRow(rec.id);
    shell.announce(rec.label + " is now " + displayValue(value) + ".");
  }

  function toggleControl(rec, value, editable) {
    var b = button("dr-switch", null);
    b.setAttribute("role", "switch");
    b.setAttribute("aria-checked", value ? "true" : "false");
    b.disabled = !editable;
    add(b, el("span", "dr-switch-track"), el("span", null, value ? "On" : "Off"));
    on(b, "click", function () { commit(rec, !store.valueOf(rec.id)); });
    return { node: b, focus: b };
  }

  function selectControl(rec, value, editable) {
    var sel = el("select", "dr-ctl");
    sel.disabled = !editable;
    var options = rec.options && rec.options.length ? rec.options : [rec.state.defaultValue];
    var seen = false;
    options.forEach(function (opt) {
      var o = document.createElement("option");
      o.value = String(opt);
      o.textContent = human(opt);
      if (String(opt) === String(value)) { o.selected = true; seen = true; }
      sel.appendChild(o);
    });
    if (!seen && value != null && value !== "") {
      var extra = document.createElement("option");
      extra.value = String(value);
      extra.textContent = human(value);
      extra.selected = true;
      sel.appendChild(extra);
    }
    on(sel, "change", function () { commit(rec, sel.value, { repaint: false }); refreshStatus(rec); });
    return { node: sel, focus: sel };
  }

  function radioControl(rec, value, editable) {
    var group = el("div", "dr-seg");
    group.setAttribute("role", "radiogroup");
    group.setAttribute("aria-label", rec.label);
    var focus = null;
    (rec.options || []).forEach(function (opt) {
      var b = button("dr-seg-btn", human(opt));
      b.setAttribute("role", "radio");
      var checked = String(opt) === String(value);
      b.setAttribute("aria-checked", checked ? "true" : "false");
      b.disabled = !editable;
      if (checked || !focus) focus = b;
      on(b, "click", function () { commit(rec, opt); });
      add(group, b);
    });
    return { node: group, focus: focus || group };
  }

  function multiControl(rec, value, editable) {
    var current = Object.prototype.toString.call(value) === "[object Array]" ? value.slice() : [];
    var group = el("div", "dr-seg");
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", rec.label);
    var focus = null;
    (rec.options || []).forEach(function (opt) {
      var b = button("dr-seg-btn", human(opt));
      var chosen = current.indexOf(opt) >= 0;
      b.setAttribute("aria-pressed", chosen ? "true" : "false");
      b.disabled = !editable;
      if (!focus) focus = b;
      on(b, "click", function () {
        var next = (store.valueOf(rec.id) || []).slice();
        var at = next.indexOf(opt);
        if (at >= 0) next.splice(at, 1); else next.push(opt);
        commit(rec, next);
      });
      add(group, b);
    });
    return { node: group, focus: focus || group };
  }

  function sliderControl(rec, value, editable) {
    var wrap = el("div", "dr-slider-row");
    var base = typeof rec.state.defaultValue === "number" ? rec.state.defaultValue : 1;
    var now = typeof value === "number" ? value : base;
    var top = Math.max(base * 2, now, 1);
    var step = top <= 2 ? 0.05 : 1;
    var input = el("input", "dr-ctl");
    input.type = "range";
    input.min = "0";
    input.max = String(Math.round(top * 100) / 100);
    input.step = String(step);
    input.value = String(now);
    input.disabled = !editable;
    var out = el("span", "dr-slider-val", String(now));
    on(input, "input", function () {
      out.textContent = input.value;
      store.setValue(rec.id, parseFloat(input.value));
      refreshStatus(rec);
    });
    add(wrap, input, out);
    return { node: wrap, focus: input };
  }

  function numberControl(rec, value, editable) {
    var input = el("input", "dr-ctl");
    input.type = "number";
    input.value = value == null ? "" : String(value);
    input.disabled = !editable;
    var invalid = effects().validationError && rec.id === "general.visual.font-size";
    if (invalid) {
      input.value = "28pt";
      input.type = "text";
      input.setAttribute("aria-invalid", "true");
      ui.drafts[rec.id] = { message: "Text size is a whole number of points between 9 and 24. What you typed is kept until you change it." };
    }
    on(input, "input", function () {
      var raw = input.value;
      if (raw === "") { store.clearValue(rec.id); refreshStatus(rec); return; }
      var n = Number(raw);
      if (isNaN(n)) {
        ui.drafts[rec.id] = { message: "That is not a number. What you typed is kept until you change it." };
        input.setAttribute("aria-invalid", "true");
      } else {
        delete ui.drafts[rec.id];
        input.removeAttribute("aria-invalid");
        store.setValue(rec.id, n);
      }
      refreshStatus(rec);
    });
    return { node: input, focus: input };
  }

  function textControl(rec, value, editable, isPath) {
    var wrap = el("div", "dr-kv-row");
    var input = el("input", "dr-ctl");
    input.type = "text";
    input.value = value == null ? "" : String(value);
    input.disabled = !editable;
    input.spellcheck = !isPath;
    input.placeholder = isPath ? "No path set" : "Not set";
    on(input, "input", function () {
      store.setValue(rec.id, input.value);
      refreshStatus(rec);
    });
    add(wrap, input);
    if (isPath) {
      var pick = button("dr-btn", "Choose");
      pick.disabled = !editable;
      on(pick, "click", function () {
        MGR.act({ managerId: "rows" }, { id: "settings.path.choose", label: "Choose a location for " + rec.label },
          { id: rec.id });
      });
      add(wrap, pick);
    }
    return { node: wrap, focus: input };
  }

  function listControl(rec, value, editable) {
    var items = Object.prototype.toString.call(value) === "[object Array]" ? value.slice() : [];
    var wrap = el("div", "dr-kv");
    var chips = el("div", "dr-chips");
    items.forEach(function (item, i) {
      var c = el("span", "dr-chip-val", String(item));
      if (editable) {
        var x = button("dr-chip-x", null);
        x.setAttribute("aria-label", "Remove " + item);
        add(x, html("span", null, ICON("minus", 11)));
        on(x, "click", function () {
          var next = (store.valueOf(rec.id) || []).slice();
          next.splice(i, 1);
          commit(rec, next);
        });
        add(c, x);
      }
      add(chips, c);
    });
    if (!items.length) add(chips, el("span", "dr-field-help", "Nothing in this list yet."));
    add(wrap, chips);
    var row = el("div", "dr-kv-row");
    var input = el("input", "dr-ctl");
    input.type = "text";
    input.placeholder = "Add an entry";
    input.disabled = !editable;
    var addBtn = button("dr-btn", "Add");
    addBtn.disabled = !editable;
    function commitEntry() {
      if (!input.value) return;
      var next = (store.valueOf(rec.id) || []).slice();
      next.push(input.value);
      commit(rec, next);
    }
    on(addBtn, "click", commitEntry);
    on(input, "keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); commitEntry(); } });
    add(row, input, addBtn);
    add(wrap, row);
    return { node: wrap, focus: input };
  }

  function keyValueControl(rec, value, editable) {
    var pairs = value && typeof value === "object" && !(value instanceof Array) ? value : {};
    var keys = Object.keys(pairs);
    var wrap = el("div", "dr-kv");
    var focus = null;
    keys.forEach(function (k) {
      var row = el("div", "dr-kv-row");
      var keyIn = el("input", "dr-ctl");
      keyIn.type = "text";
      keyIn.value = k;
      keyIn.disabled = true;
      var valIn = el("input", "dr-ctl");
      valIn.type = "text";
      valIn.value = String(pairs[k]);
      valIn.disabled = !editable;
      if (!focus) focus = valIn;
      on(valIn, "input", function () {
        var next = {};
        var live = store.valueOf(rec.id) || {};
        Object.keys(live).forEach(function (x) { next[x] = live[x]; });
        next[k] = valIn.value;
        store.setValue(rec.id, next);
        refreshStatus(rec);
      });
      var drop = button("dr-btn", null);
      drop.setAttribute("aria-label", "Remove " + k);
      drop.disabled = !editable;
      add(drop, html("span", null, ICON("minus", 11)));
      on(drop, "click", function () {
        var next = {};
        var live = store.valueOf(rec.id) || {};
        Object.keys(live).forEach(function (x) { if (x !== k) next[x] = live[x]; });
        commit(rec, next);
      });
      add(row, keyIn, valIn, drop);
      add(wrap, row);
    });
    if (!keys.length) add(wrap, el("span", "dr-field-help", "No pairs are routed yet."));
    var addRow = el("div", "dr-kv-row");
    var nk = el("input", "dr-ctl");
    nk.type = "text";
    nk.placeholder = "Name";
    nk.disabled = !editable;
    var nv = el("input", "dr-ctl");
    nv.type = "text";
    nv.placeholder = "Value";
    nv.disabled = !editable;
    var addBtn = button("dr-btn", "Add");
    addBtn.disabled = !editable;
    on(addBtn, "click", function () {
      if (!nk.value) return;
      var next = {};
      var live = store.valueOf(rec.id) || {};
      Object.keys(live).forEach(function (x) { next[x] = live[x]; });
      next[nk.value] = nv.value;
      commit(rec, next);
    });
    add(addRow, nk, nv, addBtn);
    add(wrap, addRow);
    return { node: wrap, focus: focus || nk };
  }

  function actionControl(rec, editable) {
    var b = button("dr-btn", rec.label);
    b.disabled = !editable;
    on(b, "click", function () {
      b.disabled = true;
      MGR.act({ managerId: "rows" }, { id: "settings.row.action", label: rec.label, detail: rec.desc },
        { id: rec.id }).then(function () {
        b.disabled = !editable;
        shell.announce(rec.label + " finished. The receipt is in the notification inbox.");
      });
    });
    return { node: b, focus: b };
  }

  /* A value changed: only the status chips and the footer need to move, and
   * rebuilding them costs one row rather than one page. */
  function refreshStatus(rec) {
    var row = canvasEl.querySelector('[data-pm-row="' + rec.id + '"]');
    if (!row) return;
    var active = document.activeElement;
    if (active && row.contains(active) && active.tagName === "INPUT") {
      var label = row.querySelector(".dr-row-label");
      if (!label) return;
      var state = rowState(rec);
      var tone = store.changed(rec.id) ? "changed" : M.stateTone(state);
      var word = store.changed(rec.id) ? "Changed" : M.stateLabel(state);
      var chipEl = label.querySelector(".dr-chip");
      if (tone === "quiet") { if (chipEl) chipEl.remove(); return; }
      if (!chipEl) { chipEl = chip(word, tone); label.appendChild(chipEl); }
      chipEl.textContent = word;
      chipEl.setAttribute("data-tone", tone);
      return;
    }
    patchRow(rec.id);
  }

  /* ======================================================== ALL SETTINGS */

  function encodeFacet(f) {
    var parts = [];
    if (f.domains && f.domains.length) parts.push("d=" + f.domains.join("+"));
    if (f.kinds && f.kinds.length) parts.push("k=" + f.kinds.join("+"));
    if (f.exposures && f.exposures.length) parts.push("e=" + f.exposures.join("+"));
    if (f.states && f.states.length) parts.push("s=" + f.states.join("+"));
    if (f.changed) parts.push("c=1");
    if (f.text) parts.push("t=" + f.text);
    return parts.join(";");
  }

  function decodeFacet(raw) {
    var f = { domains: [], kinds: [], exposures: [], states: [], changed: false, text: "" };
    String(raw || "").split(";").forEach(function (part) {
      var at = part.indexOf("=");
      if (at < 0) return;
      var key = part.slice(0, at), value = part.slice(at + 1);
      if (key === "d") f.domains = value.split("+").filter(Boolean);
      else if (key === "k") f.kinds = value.split("+").filter(Boolean);
      else if (key === "e") f.exposures = value.split("+").filter(Boolean);
      else if (key === "s") f.states = value.split("+").filter(Boolean);
      else if (key === "c") f.changed = value === "1";
      else if (key === "t") f.text = value;
    });
    return f;
  }

  function toggleFacet(f, field, value) {
    var next = {
      domains: f.domains.slice(), kinds: f.kinds.slice(), exposures: f.exposures.slice(),
      states: f.states.slice(), changed: f.changed, text: f.text
    };
    if (field === "changed") next.changed = !next.changed;
    else {
      var list = next[field];
      var at = list.indexOf(value);
      if (at >= 0) list.splice(at, 1); else list.push(value);
    }
    go({ kind: "all", facet: encodeFacet(next) }, { replace: true });
  }

  function renderAll(route) {
    var f = decodeFacet(route.facet);
    var s = el("div", "dr-surface dr-all");
    s.setAttribute("data-pm-surface", "all");

    var query = {
      domainIds: f.domains, kinds: f.kinds, exposures: f.exposures, states: f.states,
      changedOnly: f.changed, text: f.text, limit: "all", sort: "path"
    };
    var result = IX.all(query);

    /* Facets first, because the count beside each one is how a reader decides
     * what to press. They are live: every count comes from this same answer. */
    var facets = el("div", "dr-facets");
    var fhead = el("div", "dr-roster-head");
    add(fhead, el("div", "dr-roster-title", "Filter"));
    add(fhead, el("div", "dr-roster-sub", result.total + " of " + IX.stats().records + " records"));
    add(facets, fhead);
    var flist = el("div", "dr-facets-list dr-scroll");

    facetGroup(flist, "Area", result.facets.domains, f.domains, function (id) { toggleFacet(f, "domains", id); });
    facetGroup(flist, "Kind of record", result.facets.kinds, f.kinds, function (id) { toggleFacet(f, "kinds", id); });
    facetGroup(flist, "Level", result.facets.exposures, f.exposures, function (id) { toggleFacet(f, "exposures", id); });
    facetGroup(flist, "State", result.facets.states, f.states, function (id) { toggleFacet(f, "states", id); });
    add(flist, el("div", "dr-facet-group", "Changed"));
    var changedBtn = button("dr-facet", null);
    changedBtn.setAttribute("aria-pressed", f.changed ? "true" : "false");
    add(changedBtn, el("span", "dr-facet-name", "Changed in this Project"),
      el("span", "dr-facet-count", String(result.facets.changed)));
    on(changedBtn, "click", function () { toggleFacet(f, "changed"); });
    add(flist, changedBtn);
    add(facets, flist);

    var main = el("div", "dr-allmain");
    var bar = el("div", "dr-allbar");
    add(bar, el("span", "dr-allcount", result.total + " records"));
    var textIn = el("input", "dr-ctl");
    textIn.type = "search";
    textIn.placeholder = "Narrow this list";
    textIn.value = f.text || "";
    textIn.style.maxWidth = "260px";
    var typing = 0;
    on(textIn, "input", function () {
      window.clearTimeout(typing);
      typing = window.setTimeout(function () {
        var next = decodeFacet(encodeFacet(f));
        next.text = textIn.value.replace(/[;=+]/g, " ");
        go({ kind: "all", facet: encodeFacet(next) }, { replace: true });
      }, 180);
    });
    add(bar, textIn);
    if (f.domains.length || f.kinds.length || f.exposures.length || f.states.length || f.changed || f.text) {
      var clearBtn = button("dr-btn is-quiet", "Clear filters");
      on(clearBtn, "click", function () { go({ kind: "all" }, { replace: true }); });
      add(bar, clearBtn);
    }
    add(bar, el("span", "dr-block-note",
      "Everything Settings knows about, including managers, the things inside them and capabilities this host cannot provide."));
    add(main, bar);

    /* Virtualized: the list is the same shape at 828 records and at 3,228, and
     * the DOM never holds more than one screen of rows plus its overscan. */
    var scroller = el("div", "dr-allscroll dr-scroll");
    var viewport = el("div", "dr-vport");
    add(scroller, viewport);
    add(main, scroller);
    add(s, facets, main);

    var rows = result.rows;
    function paint() {
      var win = VIRT.windowFor({
        total: rows.length,
        rowHeight: ROW_RHYTHM,
        viewport: scroller.clientHeight,
        scrollTop: scroller.scrollTop,
        overscan: 8,
        firstPage: 30
      });
      clear(viewport);
      var before = el("div");
      before.style.height = win.before + "px";
      add(viewport, before);
      for (var i = win.start; i < win.end; i++) add(viewport, allRow(rows[i]));
      var after = el("div");
      after.style.height = win.after + "px";
      add(viewport, after);
    }
    var pending = false;
    release.add(function () { pending = true; });
    on(scroller, "scroll", function () {
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(function () { pending = false; paint(); });
    });
    paint();
    window.requestAnimationFrame(function () {
      if (scroller.isConnected) { scroller.scrollTop = ui.allScroll || 0; paint(); }
    });
    if (!rows.length) {
      add(main, el("div", "dr-empty",
        "No record matches these filters. Clearing one of them will bring some back."));
    }
    return s;
  }

  function facetGroup(parent, label, facets, active, onPick) {
    if (!facets || !facets.length) return;
    add(parent, el("div", "dr-facet-group", label));
    facets.forEach(function (facet) {
      var b = button("dr-facet", null);
      b.setAttribute("aria-pressed", active.indexOf(facet.id) >= 0 ? "true" : "false");
      add(b, el("span", "dr-facet-name", facet.label), el("span", "dr-facet-count", String(facet.count)));
      on(b, "click", function () { onPick(facet.id); });
      add(parent, b);
    });
  }

  function allRow(rec) {
    var a = link(rec.destination, "dr-arow");
    if (rec.destination.settingId) a.setAttribute("data-pm-row", rec.destination.settingId);
    else if (rec.destination.objectId) a.setAttribute("data-pm-object", rec.destination.objectId);
    else if (rec.destination.managerId) a.setAttribute("data-pm-manager", rec.destination.managerId);
    add(a, el("span", "dr-arow-label", rec.label));
    add(a, el("span", "dr-arow-path", rec.path || ""));
    add(a, el("span", "dr-arow-type", rec.stateLabel && rec.changed ? "Changed" : rec.typeLabel));
    on(a, "click", function () { ui.allScroll = 0; });
    return a;
  }

  /* ============================================================= SEARCH */

  function renderSearchSurface(route) {
    var s = el("div", "dr-surface");
    s.setAttribute("data-pm-surface", "search");
    var text = route.query || "";
    var res = IX.query(text, { limit: 120, perGroup: 40 });

    var head = el("div", "dr-head");
    add(head, el("h1", null, "Results for “" + text + "”"));
    add(head, el("div", "dr-head-meta", res.total
      ? res.total + " records match, grouped by what they are."
      : "Nothing in Settings matches that. Every record is still listed in All settings."));
    add(s, head);

    if (!res.total) {
      var empty = el("div", "dr-empty");
      add(empty, el("strong", null, "No match"));
      add(empty, el("div", null,
        "Shorter words match more. Spelling is forgiven: a query one or two letters out still finds its destination."));
      var all = link({ kind: "all" }, "dr-btn");
      all.textContent = "Open All settings";
      add(empty, all);
      add(s, empty);
      return s;
    }

    res.groups.forEach(function (group) {
      var block = el("div", "dr-block");
      var bh = el("div", "dr-block-head");
      add(bh, el("div", "dr-block-title", group.label));
      add(bh, el("div", "dr-block-note", count(group.total, "match")));
      add(block, bh);
      var list = el("div", "dr-list");
      group.results.forEach(function (rec) {
        var a = link(rec.destination, "dr-dest");
        a.setAttribute("data-pm-result", rec.id);
        if (route.resultId === rec.id) a.setAttribute("aria-selected", "true");
        var main = el("div", "dr-dest-main");
        add(main, el("div", "dr-dest-title", rec.label));
        add(main, el("div", "dr-dest-purpose", rec.path || rec.desc || ""));
        add(a, main);
        add(a, el("span", "dr-dest-meta", rec.availability || rec.typeLabel));
        on(a, "click", function () { ui.selectedResult = rec.id; });
        add(list, a);
      });
      add(block, list);
      add(s, block);
    });
    return s;
  }

  /* ============================================================ MANAGERS */

  /* The one place a manager is ever built. Everything else names managers
   * through the registry, which is what keeps `data-pm-hydrated` honest. */
  function openManager(route) {
    var managerId = route.managerId;
    var family = M.familyOf(managerId);
    var spec;
    try {
      spec = MGR.spec(managerId, {
        demoState: STATES.active(),
        values: store.get().values,
        managerEdits: store.get().managerEdits
      });
    } catch (err) {
      return absentSurface("This manager is not part of this Project.", RT.href(dest(route)));
    }
    spec = STATES.decorate(spec) || spec;

    var ctx = {
      managerId: managerId,
      archetype: spec.archetype || (family && family.archetype) || "preference document",
      family: family,
      objectId: route.objectId,
      sectionKey: route.sectionKey,
      rowId: route.rowId,
      objects: objectsOf(managerId)
    };
    return renderManager(spec, ctx);
  }

  /* One renderer, seven shapes. A roster is never flattened into preference
   * rows and a read-only projection never grows an editing affordance, because
   * the archetype decides what the left column contains and what the form is
   * allowed to do. */
  function renderManager(spec, ctx) {
    if (ctx.managerId === "manager-providers") return providerManager(spec, ctx);

    var entries = [];
    entries.push({ key: "overview", label: "Overview", meta: spec.health.statusWord, kind: "overview" });

    var objectGroups = ctx.objects.order.filter(function (k) { return ctx.objects.groups[k].objects.length; });

    if (ctx.archetype === "resource roster and detail sheet" || ctx.archetype === "inventory catalogue") {
      objectGroups.forEach(function (key) { pushObjectEntries(entries, ctx, key); });
    }

    spec.sections.forEach(function (section) {
      entries.push({
        key: "section:" + section.id,
        label: section.label,
        meta: sectionMeta(section),
        kind: "section",
        section: section,
        group: sectionGroupLabel(ctx.archetype)
      });
    });

    if (ctx.archetype !== "resource roster and detail sheet" && ctx.archetype !== "inventory catalogue") {
      objectGroups.forEach(function (key) { pushObjectEntries(entries, ctx, key); });
    }

    if (spec.diagnostics && spec.diagnostics.length) {
      entries.push({ key: "diagnostics", label: "Evidence and logs", kind: "diagnostics",
        meta: count(spec.diagnostics.length, "report"), group: "Evidence" });
    }

    return workbench(spec, ctx, entries);
  }

  function sectionGroupLabel(archetype) {
    if (archetype === "setup or repair sequence") return "Steps";
    if (archetype === "read-only health projection") return "Checks";
    if (archetype === "diagnostic drawer") return "Drawers";
    if (archetype === "preview and confirmation transaction") return "The transaction";
    if (archetype === "named owner insertion point") return "The contract";
    return "In this manager";
  }

  function sectionMeta(section) {
    if (section.items && section.items.length) return count(section.items.length, "item");
    if (section.settings && section.settings.length) return count(section.settings.length, "setting");
    return "";
  }

  function pushObjectEntries(entries, ctx, key) {
    var group = ctx.objects.groups[key];
    var label = group.label || human(key);
    if (group.objects.length > GROUP_INLINE_MAX) {
      entries.push({
        key: "group:" + key, label: label, kind: "group", groupKey: key,
        meta: count(group.objects.length, singularOf(label)), group: label
      });
      return;
    }
    group.objects.forEach(function (objectId) {
      var obj = ctx.objects.objects[objectId];
      entries.push({
        key: "object:" + objectId, label: obj.label, kind: "object", objectId: objectId,
        meta: obj.availability || obj.typeLabel, group: label, object: obj
      });
    });
  }

  function singularOf(label) {
    var w = String(label || "item").toLowerCase();
    return /ies$/.test(w) ? w.slice(0, -3) + "y" : (/s$/.test(w) ? w.slice(0, -1) : w);
  }

  /* ------------------------------------------------------- the workbench */

  /* Roster left at a fixed 280px, the selected thing's form filling the rest,
   * subpages as a quiet strip above the form. Every manager in the concept has
   * this shape, which is the point: one geometry to learn, fifty places to use
   * it. */
  function workbench(spec, ctx, entries) {
    var selected = pickEntry(entries, ctx);
    ui.entry[ctx.managerId] = selected.key;

    var surface = el("div", "dr-surface dr-mgr");
    surface.setAttribute("data-pm-surface", "manager");
    surface.setAttribute("data-pm-manager", ctx.managerId);
    surface.setAttribute("data-pane", ui.pane);

    var roster = el("div", "dr-roster");
    var rhead = el("div", "dr-roster-head");
    add(rhead, el("div", "dr-roster-title", spec.title));
    add(rhead, el("div", "dr-roster-sub", ctx.family ? ctx.family.family : human(ctx.archetype)));
    add(roster, rhead);
    var rlist = el("div", "dr-roster-list dr-scroll");
    var lastGroup = null;
    entries.forEach(function (entry) {
      if (entry.group && entry.group !== lastGroup) {
        add(rlist, el("div", "dr-roster-group", entry.group));
        lastGroup = entry.group;
      }
      add(rlist, rosterItem(entry, ctx, entry.key === selected.key));
    });
    add(roster, rlist);

    var detail = el("div", "dr-detail");
    var dhead = el("div", "dr-detail-head");
    if (ui.pane === "detail") {
      var back = button("dr-btn is-quiet", null);
      add(back, iconNode("chevronLeft"), el("span", null, "Back to " + spec.title));
      on(back, "click", function () { ui.pane = "roster"; render(); });
      back.style.marginBottom = "8px";
      add(dhead, back);
    }
    add(dhead, el("div", "dr-detail-title", selected.label));
    var sub = detailSubtitle(spec, ctx, selected);
    if (sub) add(dhead, el("div", "dr-detail-sub", sub));
    add(detail, dhead);

    var tabs = tabsFor(spec, ctx, selected);
    var activeTab = pickTab(ctx, selected, tabs);
    if (tabs.length > 1) {
      var strip = el("div", "dr-tabs");
      strip.setAttribute("role", "tablist");
      tabs.forEach(function (tab) {
        var b = button("dr-tab", tab.label);
        b.setAttribute("role", "tab");
        b.setAttribute("aria-selected", tab.key === activeTab.key ? "true" : "false");
        on(b, "click", function () {
          ui.tab[ctx.managerId + "|" + selected.key] = tab.key;
          render();
        });
        add(strip, b);
      });
      add(detail, strip);
    }

    var form = el("div", "dr-form dr-scroll");
    var inner = el("div", "dr-form-inner");
    add(form, inner);
    renderEntryDetail(inner, spec, ctx, selected, activeTab);
    add(detail, form);

    add(surface, roster, detail);
    return surface;
  }

  function pickEntry(entries, ctx) {
    var i;
    if (ctx.objectId) {
      for (i = 0; i < entries.length; i++) {
        if (entries[i].kind === "object" && entries[i].objectId === ctx.objectId) return entries[i];
      }
      for (i = 0; i < entries.length; i++) {
        if (entries[i].kind === "group" &&
            ctx.objects.groups[entries[i].groupKey].objects.indexOf(ctx.objectId) >= 0) return entries[i];
      }
    }
    var remembered = ui.entry[ctx.managerId];
    if (remembered) {
      for (i = 0; i < entries.length; i++) if (entries[i].key === remembered) return entries[i];
    }
    return entries[0];
  }

  function pickTab(ctx, entry, tabs) {
    var i;
    if (ctx.sectionKey) {
      for (i = 0; i < tabs.length; i++) if (tabs[i].key === ctx.sectionKey) return tabs[i];
    }
    var remembered = ui.tab[ctx.managerId + "|" + entry.key];
    if (remembered) {
      for (i = 0; i < tabs.length; i++) if (tabs[i].key === remembered) return tabs[i];
    }
    return tabs[0];
  }

  function rosterItem(entry, ctx, selected) {
    var node;
    if (entry.kind === "object" || entry.kind === "group") {
      node = link(entryDest(entry, ctx), "dr-roster-item");
    } else {
      node = button("dr-roster-item", null);
      on(node, "click", function () {
        ui.entry[ctx.managerId] = entry.key;
        ui.pane = "detail";
        render();
      });
    }
    if (entry.objectId) node.setAttribute("data-pm-object", entry.objectId);
    node.setAttribute("aria-selected", selected ? "true" : "false");
    var main = el("div", "dr-roster-main");
    add(main, el("div", "dr-roster-name", entry.label));
    if (entry.meta) add(main, el("div", "dr-roster-meta", entry.meta));
    add(node, main);
    if (entry.kind === "object" || entry.kind === "group") {
      add(node, html("span", "dr-card-chev", ICON("chevronRight", 12)));
    }
    on(node, "click", function () { ui.pane = "detail"; });
    return node;
  }

  function entryDest(entry, ctx) {
    if (entry.kind === "object") {
      return { managerId: ctx.managerId, objectId: entry.objectId,
        sectionKey: ctx.objects.objects[entry.objectId].group === "items"
          ? null : ctx.objects.objects[entry.objectId].group };
    }
    if (entry.kind === "group") {
      var group = ctx.objects.groups[entry.groupKey];
      return { managerId: ctx.managerId, objectId: group.objects[0], sectionKey: entry.groupKey };
    }
    return { managerId: ctx.managerId };
  }

  function detailSubtitle(spec, ctx, entry) {
    if (entry.kind === "overview") return spec.purpose;
    if (entry.kind === "section") return entry.section.summary;
    if (entry.kind === "object") return entry.object.desc || entry.object.availability || "";
    if (entry.kind === "group") return "Everything in this manager's " + entry.label.toLowerCase() + ", newest resolution first.";
    if (entry.kind === "diagnostics") return "Read-only evidence behind the words on this screen.";
    return "";
  }

  function tabsFor(spec, ctx, entry) {
    var tabs = [];
    if (entry.kind === "object") {
      tabs.push({ key: "overview", label: "Overview" });
      var obj = entry.object;
      obj.rowOrder.forEach(function (key) {
        tabs.push({ key: key, label: human(key), rows: obj.rows[key] });
      });
      if (specItemFor(spec, entry.objectId)) tabs.push({ key: "settings", label: "Settings" });
      return tabs;
    }
    if (entry.kind === "section" && entry.section.settings && entry.section.settings.length &&
        entry.section.items && entry.section.items.length) {
      return [{ key: "items", label: "Items" }, { key: "settings", label: "Settings" }];
    }
    return [{ key: "overview", label: "Details" }];
  }

  function specItemFor(spec, objectId) {
    var found = null;
    spec.sections.forEach(function (section) {
      (section.items || []).forEach(function (item) {
        if (found) return;
        if (item.id === objectId || item.id === "prov-" + objectId) found = item;
      });
    });
    return found;
  }

  function renderEntryDetail(host, spec, ctx, entry, tab) {
    if (entry.kind === "overview") return renderOverview(host, spec, ctx);
    if (entry.kind === "section") return renderSpecSection(host, spec, ctx, entry.section, tab);
    if (entry.kind === "group") return renderObjectGroup(host, spec, ctx, entry);
    if (entry.kind === "diagnostics") return renderDiagnostics(host, spec, ctx);
    return renderObject(host, spec, ctx, entry, tab);
  }

  function renderOverview(host, spec, ctx) {
    var health = spec.health;
    var block = el("div");
    var status = el("div", "dr-row-label");
    add(status, chip(health.statusWord, healthTone(health.status)));
    if (ctx.family && ctx.family.deferred) add(status, chip("Separate owner", "managed"));
    if (ctx.archetype === "read-only health projection") add(status, chip("Read-only", "quiet"));
    add(block, status);
    if (health.headline) add(block, el("div", "dr-head-purpose", health.headline));
    if (health.detail) add(block, el("div", "dr-row-desc", health.detail));

    if (health.counts && health.counts.length) {
      var counts = el("div", "dr-counts");
      health.counts.forEach(function (c) {
        var box = el("div", "dr-count");
        add(box, el("div", "dr-count-value", String(c.value)));
        add(box, el("div", "dr-count-label", c.label));
        add(counts, box);
      });
      add(block, counts);
    }

    if (spec.owner) {
      var owner = el("div", "dr-panel");
      add(owner, el("h2", null, "Owned by " + spec.owner.name));
      add(owner, el("div", "dr-row-desc", spec.owner.why));
      var dl = el("dl", "dr-facts");
      add(dl, el("dt", null, "Where it opens"), el("dd", null, ctx.family.insertion || ""));
      add(dl, el("dt", null, "How control returns"), el("dd", null, ctx.family.returns || ""));
      add(dl, el("dt", null, "Built here"), el("dd", null,
        "Nothing. This screen is the destination and the contract; the owner runs its own flow."));
      add(owner, dl);
      add(block, owner);
    }

    if (spec.primary) {
      var acts = el("div", "dr-item-acts");
      add(acts, actionButton(spec.primary, ctx, null, true));
      add(block, acts);
    }

    if (spec.notes && spec.notes.length) {
      var notes = el("ul", "dr-prose");
      notes.style.marginTop = "12px";
      spec.notes.forEach(function (note) { add(notes, el("li", null, note)); });
      add(block, notes);
    }

    add(host, block);
    if (effects().offline) {
      add(host, inlineNote("attention",
        "There is no network connection, so nothing on this screen was checked just now. Every figure is the last one read."));
    }
  }

  function healthTone(status) {
    if (status === "attention" || status === "risky") return "attention";
    if (status === "managed") return "managed";
    if (status === "unavailable") return "unavailable";
    if (status === "setup") return "setup";
    return "ok";
  }

  function renderSpecSection(host, spec, ctx, section, tab) {
    if (tab && tab.key === "settings" && section.settings && section.settings.length) {
      return renderSettingRows(host, section.settings);
    }
    if (section.kind === "rows" && section.settings && section.settings.length) {
      return renderSettingRows(host, section.settings);
    }
    if (section.kind === "prose") {
      var list = el("ul", "dr-prose");
      (section.items || []).forEach(function (item) { add(list, el("li", null, item.name)); });
      add(host, list);
      return;
    }
    if (!section.items || !section.items.length) {
      var empty = el("div", "dr-empty");
      add(empty, el("strong", null, (section.empty && section.empty.headline) || "Nothing here yet"));
      add(empty, el("div", null, (section.empty && section.empty.detail) ||
        "When something is added it appears here with its status and the actions it supports."));
      if (section.empty && section.empty.action) {
        add(empty, actionButton(section.empty.action, ctx, null, true));
      }
      add(host, empty);
      return;
    }
    if (section.kind === "table" && section.columns && section.columns.length) {
      return renderTableSection(host, ctx, section);
    }
    var box = el("div", "dr-list");
    section.items.forEach(function (item) { add(box, renderSpecItem(item, ctx)); });
    add(host, box);
    if (section.actions && section.actions.length) {
      var acts = el("div", "dr-item-acts");
      section.actions.forEach(function (a) { add(acts, actionButton(a, ctx, null)); });
      add(host, acts);
    }
  }

  function renderTableSection(host, ctx, section) {
    var table = el("div", "dr-list");
    var head = el("div", "dr-table-head");
    add(head, el("div", "dr-cell is-name", "Name"));
    section.columns.forEach(function (col) { add(head, el("div", "dr-cell", col.label)); });
    add(table, head);
    section.items.forEach(function (item) {
      var row = el("div", "dr-table-row");
      var name = el("div", "dr-cell is-name");
      add(name, el("div", null, item.name));
      if (item.secondary) add(name, el("div", "dr-roster-meta", item.secondary));
      add(row, name);
      section.columns.forEach(function (col) {
        add(row, el("div", "dr-cell", String(item.fields[col.key] == null ? "" : item.fields[col.key])));
      });
      add(table, row);
    });
    add(host, table);
  }

  function renderSpecItem(item, ctx) {
    var node = el("div", "dr-item");
    if (item.id) node.setAttribute("data-item", item.id);
    var head = el("div", "dr-item-head");
    add(head, el("div", "dr-item-name", item.name));
    if (item.statusWord) add(head, chip(item.statusWord, healthTone(item.status)));
    (item.badges || []).forEach(function (badge) {
      if (!badge.text) return;
      var b = chip(badge.text, "quiet");
      if (badge.title) b.title = badge.title;
      add(head, b);
    });
    add(node, head);
    if (item.secondary) add(node, el("div", "dr-item-sub", item.secondary));
    if (item.availability && item.availability.available === false) {
      add(node, el("div", "dr-item-sub", item.availability.reason +
        (item.availability.owner ? " Owned by " + item.availability.owner + "." : "")));
    }
    var fieldKeys = item.fields ? Object.keys(item.fields) : [];
    if (fieldKeys.length) {
      var dl = el("dl", "dr-facts");
      dl.className = "dr-facts dr-item-fields";
      fieldKeys.forEach(function (key) {
        add(dl, el("dt", null, human(key)), el("dd", null, String(item.fields[key])));
      });
      add(node, dl);
    }
    (item.editable || []).forEach(function (field) {
      add(node, editableField(field, item, ctx));
    });
    (item.detail || []).forEach(function (detail) {
      var box = el("details");
      var sum = el("summary", "dr-why", detail.label);
      add(box, sum);
      var dl2 = el("dl", "dr-facts");
      (detail.rows || []).forEach(function (r) {
        add(dl2, el("dt", null, r.label), el("dd", null, String(r.value) + (r.hint ? " — " + r.hint : "")));
      });
      add(box, dl2);
      add(node, box);
    });
    if (item.actions && item.actions.length) {
      var acts = el("div", "dr-item-acts");
      item.actions.forEach(function (a) { add(acts, actionButton(a, ctx, item)); });
      add(node, acts);
    }
    return node;
  }

  /* Manager fields round-trip through the store under a key the manager owns,
   * so an edit survives leaving the manager and coming back to it. */
  function editableField(field, item, ctx) {
    var wrap = el("div", "dr-field");
    add(wrap, el("div", "dr-field-label", field.label));
    var value = store.edit(ctx.managerId, item.id, field.key, field.value);
    var input;
    if (field.kind === "select" && field.options && field.options.length) {
      input = el("select", "dr-ctl");
      field.options.forEach(function (opt) {
        var o = document.createElement("option");
        o.value = String(opt);
        o.textContent = human(opt);
        if (String(opt) === String(value)) o.selected = true;
        input.appendChild(o);
      });
      on(input, "change", function () { store.setEdit(ctx.managerId, item.id, field.key, input.value); });
    } else if (field.kind === "toggle") {
      input = button("dr-switch", null);
      input.setAttribute("role", "switch");
      input.setAttribute("aria-checked", value ? "true" : "false");
      add(input, el("span", "dr-switch-track"), el("span", null, value ? "On" : "Off"));
      on(input, "click", function () {
        var next = !(store.edit(ctx.managerId, item.id, field.key, field.value));
        store.setEdit(ctx.managerId, item.id, field.key, next);
        input.setAttribute("aria-checked", next ? "true" : "false");
        input.lastChild.textContent = next ? "On" : "Off";
      });
    } else if (field.secretKind) {
      /* No secret material is ever rendered. The row says who holds it and
       * offers the owner's own flow; it does not show, mask or export a key. */
      input = el("div", "dr-field-help",
        "Held by the provider's own tool inside its profile. Puppet Master neither reads nor displays it.");
    } else {
      input = el("input", "dr-ctl");
      input.type = "text";
      input.value = value == null ? "" : String(value);
      on(input, "input", function () { store.setEdit(ctx.managerId, item.id, field.key, input.value); });
    }
    add(wrap, input);
    if (field.help) add(wrap, el("div", "dr-field-help", field.help));
    return wrap;
  }

  function actionButton(action, ctx, item, primary) {
    var b = button("dr-btn" + (primary || action.kind === "primary" || action.kind === "create" ? " is-primary" : ""), action.label);
    on(b, "click", function () {
      b.disabled = true;
      var payload = item ? { id: item.id } : { id: ctx.managerId };
      var result = MGR.act({ managerId: ctx.managerId }, action, payload);
      shell.announce(action.label + " started.");
      if (result && result.then) {
        result.then(function () {
          b.disabled = false;
          MGR.invalidate(ctx.managerId);
          shell.announce(action.label + " finished. The receipt is in the notification inbox.");
          render();
        });
      } else {
        b.disabled = false;
      }
    });
    return b;
  }

  function renderSettingRows(host, ids) {
    var box = el("div", "dr-section");
    ids.forEach(function (id) {
      var rec = M.setting(id);
      if (rec) add(box, renderRow(rec));
    });
    if (!box.firstChild) {
      add(box, el("div", "dr-att-empty", "These rows are not part of this Project."));
    }
    add(host, box);
  }

  function renderObject(host, spec, ctx, entry, tab) {
    var obj = entry.object;
    var item = specItemFor(spec, entry.objectId);

    if (tab && tab.rows) return renderObjectRows(host, ctx, entry, tab);
    if (tab && tab.key === "settings" && item) {
      var box = el("div", "dr-list");
      add(box, renderSpecItem(item, ctx));
      add(host, box);
      return;
    }

    var head = el("div", "dr-row-label");
    if (obj.availability) add(head, chip(obj.availability, obj.record && obj.record.kind === "unavailable" ? "unavailable" : "ok"));
    add(head, chip(obj.typeLabel, "quiet"));
    add(host, head);
    if (obj.desc) add(host, el("div", "dr-head-purpose", obj.desc));

    if (item) {
      var list = el("div", "dr-list");
      add(list, renderSpecItem(item, ctx));
      add(host, list);
    } else {
      /* The manager spec does not describe this object, so the honest answer is
       * what Settings actually knows about it plus where it lives. */
      var dl = el("dl", "dr-facts");
      add(dl, el("dt", null, "Kind"), el("dd", null, obj.typeLabel));
      add(dl, el("dt", null, "Where it lives"), el("dd", null, obj.record ? obj.record.path : spec.title));
      if (obj.availability) add(dl, el("dt", null, "Reported"), el("dd", null, obj.availability));
      add(dl, el("dt", null, "Changed here"), el("dd", null,
        "How this Project uses it. What it is and where it comes from belong to the host."));
      add(host, dl);
    }
  }

  function renderObjectRows(host, ctx, entry, tab) {
    var box = el("div", "dr-list");
    tab.rows.forEach(function (rec) {
      var row = el("div", "dr-item");
      row.setAttribute("data-row-id", rec.destination.rowId || rec.id);
      var head = el("div", "dr-item-head");
      add(head, el("div", "dr-item-name", rec.label));
      if (rec.availability) add(head, chip(rec.availability, rec.kind === "unavailable" ? "unavailable" : "ok"));
      add(row, head);
      if (rec.desc) add(row, el("div", "dr-item-sub", rec.desc));
      add(box, row);
    });
    add(host, box);
  }

  /* A group too long to sit in the roster becomes a bounded table. Above the
   * windowing threshold it is virtualized, so a hundred installations and two
   * hundred cost the same DOM. */
  function renderObjectGroup(host, spec, ctx, entry) {
    var group = ctx.objects.groups[entry.groupKey];
    var ids = group.objects;
    var scroller = el("div", "dr-diff-scroll dr-scroll");
    scroller.style.maxHeight = "none";
    var viewport = el("div");
    add(scroller, viewport);

    function paint() {
      var win = VIRT.windowFor({
        total: ids.length, rowHeight: 30, viewport: scroller.clientHeight,
        scrollTop: scroller.scrollTop, overscan: 6, firstPage: 30
      });
      clear(viewport);
      var before = el("div");
      before.style.height = win.before + "px";
      add(viewport, before);
      for (var i = win.start; i < win.end; i++) {
        var obj = ctx.objects.objects[ids[i]];
        var row = link({ managerId: ctx.managerId, objectId: obj.id, sectionKey: entry.groupKey }, "dr-diff-row");
        row.setAttribute("data-pm-object", obj.id);
        add(row, el("span", "dr-diff-label", obj.label));
        add(row, el("span", "dr-diff-path", obj.desc || (obj.record ? obj.record.path : "")));
        add(row, el("span", "dr-diff-out", obj.availability || obj.typeLabel));
        add(viewport, row);
      }
      var after = el("div");
      after.style.height = win.after + "px";
      add(viewport, after);
    }
    var pending = false;
    on(scroller, "scroll", function () {
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(function () { pending = false; paint(); });
    });
    paint();
    window.requestAnimationFrame(function () { if (scroller.isConnected) paint(); });

    add(host, el("div", "dr-row-desc",
      count(ids.length, singularOf(group.label)) +
      " found. This Project uses the one bound by identity, so a change in search order cannot move it."));
    add(host, add(el("div", "dr-diff"), scroller));
  }

  function renderDiagnostics(host, spec, ctx) {
    var box = el("div", "dr-list");
    spec.diagnostics.forEach(function (d) {
      var row = el("div", "dr-item");
      add(row, add(el("div", "dr-item-head"), el("div", "dr-item-name", d.label), chip(human(d.kind), "quiet")));
      add(row, el("div", "dr-item-sub",
        "Read-only evidence. Opening it records who looked and when, and changes nothing."));
      var acts = el("div", "dr-item-acts");
      add(acts, actionButton({ id: d.id, label: "Open", kind: "quiet" }, ctx, { id: d.id }));
      add(row, acts);
      add(box, row);
    });
    add(host, box);
  }

  /* ------------------------------------------------------ the provider */

  /* The flagship, built by hand rather than through the generic workbench. The
   * default view answers the six questions people actually arrive with --
   * connected, which account, which models, what happens when usage ends, how
   * it routes, and what to do if it is broken -- and everything else is a
   * subpage rather than another column. */
  function providerManager(spec, ctx) {
    var sections = {};
    spec.sections.forEach(function (s) { sections[s.id] = s; });
    var families = sections.families || { items: [] };

    var entries = [{ key: "overview", label: "All providers", kind: "overview",
      meta: spec.health.statusWord, group: "This manager" }];

    families.items.forEach(function (item) {
      var objectId = item.id.replace(/^prov-/, "");
      var obj = ctx.objects.objects[objectId];
      entries.push({
        key: "object:" + objectId, kind: "object", objectId: objectId,
        label: item.name, meta: item.statusWord || (obj && obj.availability) || "",
        group: "Providers", object: obj || { id: objectId, label: item.name, rows: {}, rowOrder: [], typeLabel: "Provider" },
        item: item
      });
    });

    ctx.objects.order.forEach(function (key) {
      if (key === "items" || key === "accounts" || key === "models") return;
      var group = ctx.objects.groups[key];
      if (!group.objects.length) return;
      entries.push({
        key: "group:" + key, kind: "group", groupKey: key, label: group.label,
        meta: count(group.objects.length, singularOf(group.label)), group: "On this machine"
      });
    });

    entries.push({ key: "section:usage-end", kind: "section", label: "When included usage ends",
      section: sections["usage-end"], meta: "Project policy", group: "Across all providers" });
    entries.push({ key: "section:acquisition", kind: "section", label: "How a provider tool arrives",
      section: sections.acquisition, meta: "The rule", group: "Across all providers" });
    entries.push({ key: "section:provider-rows", kind: "section", label: "Model defaults",
      section: sections["provider-rows"], meta: sectionMeta(sections["provider-rows"] || {}), group: "Across all providers" });

    var selected = pickEntry(entries, ctx);
    ui.entry[ctx.managerId] = selected.key;

    var surface = el("div", "dr-surface dr-mgr");
    surface.setAttribute("data-pm-surface", "manager");
    surface.setAttribute("data-pm-manager", ctx.managerId);
    surface.setAttribute("data-pane", ui.pane);

    var roster = el("div", "dr-roster");
    var rhead = el("div", "dr-roster-head");
    add(rhead, el("div", "dr-roster-title", spec.title));
    add(rhead, el("div", "dr-roster-sub", spec.health.statusWord));
    add(roster, rhead);
    var rlist = el("div", "dr-roster-list dr-scroll");
    var lastGroup = null;
    entries.forEach(function (entry) {
      if (entry.group !== lastGroup) {
        add(rlist, el("div", "dr-roster-group", entry.group));
        lastGroup = entry.group;
      }
      add(rlist, rosterItem(entry, ctx, entry.key === selected.key));
    });
    add(roster, rlist);
    if (spec.primary) {
      var foot = el("div", "dr-roster-head");
      add(foot, actionButton(spec.primary, ctx, null, true));
      add(roster, foot);
    }

    var detail = el("div", "dr-detail");
    var dhead = el("div", "dr-detail-head");
    if (ui.pane === "detail") {
      var back = button("dr-btn is-quiet", null);
      add(back, iconNode("chevronLeft"), el("span", null, "Back to providers"));
      on(back, "click", function () { ui.pane = "roster"; render(); });
      back.style.marginBottom = "8px";
      add(dhead, back);
    }
    add(dhead, el("div", "dr-detail-title", selected.label));
    add(detail, dhead);

    var tabs = providerTabs(selected, ctx);
    var activeTab = pickTab(ctx, selected, tabs);
    if (tabs.length > 1) {
      var strip = el("div", "dr-tabs");
      strip.setAttribute("role", "tablist");
      tabs.forEach(function (tab) {
        var b = button("dr-tab", tab.label);
        b.setAttribute("role", "tab");
        b.setAttribute("aria-selected", tab.key === activeTab.key ? "true" : "false");
        on(b, "click", function () { ui.tab[ctx.managerId + "|" + selected.key] = tab.key; render(); });
        add(strip, b);
      });
      add(detail, strip);
    }

    var form = el("div", "dr-form dr-scroll");
    var inner = el("div", "dr-form-inner");
    add(form, inner);
    providerDetail(inner, spec, ctx, selected, activeTab, sections);
    add(detail, form);

    add(surface, roster, detail);
    return surface;
  }

  function providerTabs(entry, ctx) {
    if (entry.kind !== "object") return [{ key: "overview", label: "Details" }];
    var tabs = [{ key: "overview", label: "Overview" }];
    var obj = entry.object;
    if (obj.rows.accounts) tabs.push({ key: "accounts", label: "Accounts", rows: obj.rows.accounts });
    if (obj.rows.models) tabs.push({ key: "models", label: "Models", rows: obj.rows.models });
    tabs.push({ key: "credentials", label: "Credentials" });
    tabs.push({ key: "installations", label: "Installations" });
    tabs.push({ key: "limits", label: "Limits and routing" });
    tabs.push({ key: "logs", label: "Logs and diagnostics" });
    return tabs;
  }

  function providerDetail(host, spec, ctx, entry, tab, sections) {
    if (entry.kind === "overview") {
      renderOverview(host, spec, ctx);
      add(host, el("div", "dr-block-title", "One card per family"));
      var box = el("div", "dr-list");
      (sections.families.items || []).forEach(function (item) {
        var objectId = item.id.replace(/^prov-/, "");
        var node = renderSpecItem(item, ctx);
        var openIt = link({ managerId: ctx.managerId, objectId: objectId }, "dr-btn");
        openIt.textContent = "Open " + item.name;
        add(node, add(el("div", "dr-item-acts"), openIt));
        add(box, node);
      });
      add(host, box);
      return;
    }
    if (entry.kind === "group") return renderObjectGroup(host, spec, ctx, entry);
    if (entry.kind === "section") {
      if (!entry.section) { add(host, el("div", "dr-att-empty", "Nothing to show here.")); return; }
      return renderSpecSection(host, spec, ctx, entry.section, tab);
    }

    var item = entry.item || specItemFor(spec, entry.objectId);
    var sub = sections.subpages || { items: [] };
    function subItem(id) {
      var found = null;
      (sub.items || []).forEach(function (x) { if (x.id === id) found = x; });
      return found;
    }

    if (tab.key === "overview") {
      if (item) {
        var list = el("div", "dr-list");
        add(list, renderSpecItem(item, ctx));
        add(host, list);
      }
      var usage = sections["usage-end"];
      if (usage && usage.items && usage.items.length) {
        add(host, el("div", "dr-block-title", "When included usage ends"));
        add(host, el("div", "dr-row-desc", usage.summary));
        renderTableSection(host, ctx, {
          columns: usage.columns,
          items: usage.items.filter(function (x) {
            return !item || String(x.name).indexOf(item.name) === 0;
          })
        });
      }
      return;
    }
    if (tab.rows) return renderObjectRows(host, ctx, entry, tab);

    var map = { credentials: "sub-credentials", installations: "sub-installations",
      limits: "sub-limits", logs: "sub-logs" };
    var record = subItem(map[tab.key]);
    if (record) {
      var box2 = el("div", "dr-list");
      add(box2, renderSpecItem(record, ctx));
      add(host, box2);
    }
    if (tab.key === "credentials") {
      add(host, inlineNote("info",
        "No key, token or profile file is read, rendered or exported here. Signing in runs the provider's own login inside its own profile, and it is a separate step from installing anything."));
    }
    if (tab.key === "installations") {
      var group = ctx.objects.groups.installations;
      if (group && group.objects.length) {
        var openAll = link({ managerId: ctx.managerId, objectId: group.objects[0], sectionKey: "installations" }, "dr-btn");
        openAll.textContent = "Open all " + group.objects.length + " installations";
        add(host, add(el("div", "dr-item-acts"), openAll));
      }
      var acq = sections.acquisition;
      if (acq) {
        add(host, el("div", "dr-block-title", "How a provider tool gets onto this machine"));
        renderSpecSection(host, spec, ctx, acq, null);
      }
    }
    if (tab.key === "logs") {
      renderDiagnostics(host, spec, ctx);
    }
  }

  /* ================================================================ COPY */

  var COPY_STEPS = [
    { key: "source", label: "Choose a source" },
    { key: "categories", label: "Choose what to copy" },
    { key: "preview", label: "Review the change" },
    { key: "apply", label: "Apply and receipt" }
  ];

  function copyState() {
    if (!ui.copy) {
      ui.copy = { sourceId: null, domains: {}, preview: null, run: null, phases: [], receipt: null, running: false };
      M.domains.forEach(function (d) { ui.copy.domains[d.id] = true; });
    }
    return ui.copy;
  }

  function renderCopy(route) {
    var c = copyState();
    var step = route.step || "source";
    if (step === "categories" && !c.sourceId) step = "source";
    if ((step === "preview" || step === "apply") && !c.preview) step = c.sourceId ? "categories" : "source";

    var s = el("div", "dr-surface");
    s.setAttribute("data-pm-surface", "copy");

    var head = el("div", "dr-head");
    add(head, el("h1", null, "Copy settings from another Project"));
    add(head, el("div", "dr-head-purpose", COPY.independence));
    add(s, head);

    var steps = el("div", "dr-steps");
    var current = 0;
    COPY_STEPS.forEach(function (st, i) { if (st.key === step) current = i; });
    COPY_STEPS.forEach(function (st, i) {
      var node = el("div", "dr-step" + (i < current ? " is-done" : ""));
      if (i === current) node.setAttribute("aria-current", "step");
      add(node, el("span", "dr-step-num", String(i + 1)), el("span", null, st.label));
      add(steps, node);
    });
    add(s, steps);

    if (step === "source") add(s, copySource(c));
    else if (step === "categories") add(s, copyCategories(c));
    else if (step === "preview") add(s, copyPreview(c));
    else add(s, copyApply(c));
    return s;
  }

  function copySource(c) {
    var panel = el("div", "dr-panel");
    add(panel, el("h2", null, "Which Project should this one copy from?"));
    add(panel, el("div", "dr-row-desc",
      "The source is only read. Nothing is written back to it, and after this finishes the two Projects are unrelated."));
    COPY.sources().forEach(function (source) {
      var b = button("dr-pick", null);
      b.setAttribute("aria-checked", c.sourceId === source.id ? "true" : "false");
      b.setAttribute("role", "radio");
      var main = el("div", "dr-pick-main");
      add(main, el("div", "dr-pick-name", source.name));
      add(main, el("div", "dr-pick-note", source.updated + " · " + source.note));
      add(b, main);
      add(b, el("span", "dr-pick-meta", source.settings + " settings in " + count(source.categories, "area")));
      on(b, "click", function () {
        c.sourceId = source.id;
        c.preview = null;
        go({ kind: "copy", step: "categories" });
      });
      add(panel, b);
    });
    var acts = el("div", "dr-acts");
    var cancel = link({ kind: "home" }, "dr-btn is-quiet");
    cancel.textContent = "Cancel";
    add(acts, cancel);
    add(panel, acts);
    return panel;
  }

  function copyCategories(c) {
    var panel = el("div", "dr-panel");
    var source = COPY.sources().filter(function (s) { return s.id === c.sourceId; })[0];
    add(panel, el("h2", null, "What should come across from " + source.name + "?"));
    add(panel, el("div", "dr-row-desc",
      "Whole areas, not individual rows: a half-copied area is how two Projects end up disagreeing with themselves."));
    COPY.categories().forEach(function (cat) {
      var b = button("dr-pick", null);
      b.setAttribute("aria-pressed", c.domains[cat.id] ? "true" : "false");
      var main = el("div", "dr-pick-main");
      add(main, el("div", "dr-pick-name", cat.title));
      add(main, el("div", "dr-pick-note", cat.purpose));
      add(b, main);
      add(b, el("span", "dr-pick-meta", cat.count + " settings"));
      on(b, "click", function () {
        c.domains[cat.id] = !c.domains[cat.id];
        c.preview = null;
        render();
      });
      add(panel, b);
    });
    var acts = el("div", "dr-acts");
    var back = link({ kind: "copy", step: "source" }, "dr-btn is-quiet");
    back.textContent = "Back to sources";
    var next = button("dr-btn is-primary", "Preview the change");
    var chosen = Object.keys(c.domains).filter(function (k) { return c.domains[k]; });
    next.disabled = !chosen.length;
    on(next, "click", function () {
      c.preview = COPY.preview(c.sourceId, chosen);
      go({ kind: "copy", step: "preview" });
    });
    add(acts, back, next, el("span", "dr-panel-note", count(chosen.length, "area") + " selected"));
    add(panel, acts);
    return panel;
  }

  function copyPreview(c) {
    var p = c.preview;
    var panel = el("div", "dr-panel");
    add(panel, el("h2", null, "What copying from " + p.source.name + " would do"));
    add(panel, el("div", "dr-row-desc", "Nothing has been changed yet. This is the whole plan."));

    var tally = el("div", "dr-tally");
    [["Added", p.counts.additions], ["Replaced", p.counts.replacements],
     ["Left alone", p.counts.unchanged], ["Re-pointed references", p.counts.references],
     ["Not available here", p.counts.unavailable], ["Policy conflicts", p.counts.conflicts]
    ].forEach(function (pair) {
      var box = el("div", "dr-tally-item");
      add(box, el("div", "dr-tally-value", String(pair[1])));
      add(box, el("div", "dr-tally-label", pair[0]));
      add(tally, box);
    });
    add(panel, tally);

    add(panel, el("div", "dr-panel-note", COPY.secretPolicy()));
    if (effects().importConflict) {
      add(panel, inlineNote("attention",
        "Some of these values disagree with what this Project already has. Every disagreement is listed below before anything is applied."));
    }

    var changing = p.items.filter(function (i) {
      return i.outcome === "addition" || i.outcome === "replacement" ||
        i.outcome === "reference" || i.outcome === "conflict" || i.outcome === "unavailable";
    });
    add(panel, el("div", "dr-block-title", "Itemised — " + count(changing.length, "row")));

    var box2 = el("div", "dr-diff");
    var scroller = el("div", "dr-diff-scroll dr-scroll");
    var viewport = el("div");
    add(scroller, viewport);
    add(box2, scroller);

    function paint() {
      var win = VIRT.windowFor({
        total: changing.length, rowHeight: 30, viewport: scroller.clientHeight,
        scrollTop: scroller.scrollTop, overscan: 6, firstPage: 24
      });
      clear(viewport);
      var before = el("div");
      before.style.height = win.before + "px";
      add(viewport, before);
      for (var i = win.start; i < win.end; i++) {
        var it = changing[i];
        var row = el("div", "dr-diff-row");
        add(row, el("span", "dr-diff-label", it.label));
        add(row, el("span", "dr-diff-path", it.path));
        add(row, el("span", "dr-diff-out", copyOutcomeWord(it)));
        add(viewport, row);
      }
      var after = el("div");
      after.style.height = win.after + "px";
      add(viewport, after);
    }
    var pending = false;
    on(scroller, "scroll", function () {
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(function () { pending = false; paint(); });
    });
    paint();
    add(panel, box2);

    var excluded = el("dl", "dr-facts");
    p.excluded.forEach(function (x) {
      add(excluded, el("dt", null, x.label), el("dd", null, x.count + (x.note ? " — " + x.note : "")));
    });
    add(panel, el("div", "dr-block-title", "Deliberately left out"));
    add(panel, excluded);

    var acts = el("div", "dr-acts");
    var back = link({ kind: "copy", step: "categories" }, "dr-btn is-quiet");
    back.textContent = "Back to categories";
    var apply = button("dr-btn is-primary", "Take a restore point and copy " + p.willChange + " values");
    on(apply, "click", function () { startCopy(c); });
    add(acts, back, apply);
    add(panel, acts);
    return panel;
  }

  function copyOutcomeWord(item) {
    if (item.outcome === "addition") return "Added: " + displayValue(item.incoming);
    if (item.outcome === "replacement") return displayValue(item.current) + " → " + displayValue(item.incoming);
    if (item.outcome === "reference") return "Reference re-pointed";
    if (item.outcome === "conflict") return "Excluded — policy owns it here";
    if (item.outcome === "unavailable") return "Excluded — not available here";
    return "Unchanged";
  }

  function startCopy(c) {
    c.run = COPY.apply(c.preview);
    c.phases = [];
    c.receipt = null;
    c.running = true;
    go({ kind: "copy", step: "apply" });
    step();

    /* Driven one phase at a time so the restore point, the apply and the
     * verification are each visible facts rather than a bar against a clock. */
    function step() {
      var out = c.run.next();
      if (out.phase) c.phases.push(out.phase);
      if (out.done) {
        c.receipt = out.receipt;
        c.running = false;
        render();
        return;
      }
      render();
      window.setTimeout(step, 520);
    }
  }

  function copyApply(c) {
    var panel = el("div", "dr-panel");
    add(panel, el("h2", null, c.receipt
      ? (c.receipt.outcome === "applied" ? "Copied" : "Rolled back")
      : "Copying"));

    var op = c.run && c.run.get ? c.run.get() : null;
    if (op) {
      add(panel, el("div", "dr-row-desc", op.title + " — " + WORK.stateWord(op.state) +
        (op.progress_kind === "fraction" && op.total
          ? " (" + (op.completed || 0) + " of " + op.total + ")"
          : (op.wait_reason ? " — " + op.wait_reason : ""))));
    }

    var list = el("div");
    var expected = c.run ? c.run.steps : [];
    expected.forEach(function (phase, i) {
      var done = c.phases.indexOf(phase) >= 0;
      var now = c.phases.length - 1 === i && c.running;
      var row = el("div", "dr-phase" + (done && !now ? " is-done" : (now ? " is-now" : "")));
      add(row, el("span", "dr-phase-dot"), el("span", null, phase));
      add(list, row);
    });
    if (c.receipt) {
      var last = el("div", "dr-phase is-done");
      add(last, el("span", "dr-phase-dot"), el("span", null,
        c.receipt.outcome === "applied"
          ? "Verified and receipted"
          : "Verification failed, so the whole transaction was undone"));
      add(list, last);
    }
    add(panel, list);

    if (c.receipt) {
      var dl = el("dl", "dr-facts");
      add(dl, el("dt", null, "Receipt"), el("dd", null, c.receipt.id));
      add(dl, el("dt", null, "When"), el("dd", null, c.receipt.at));
      add(dl, el("dt", null, "From"), el("dd", null, c.receipt.source.name));
      add(dl, el("dt", null, "Into"), el("dd", null, c.receipt.destination.name));
      add(dl, el("dt", null, "Values applied"), el("dd", null, String(c.receipt.applied)));
      add(dl, el("dt", null, "Restore point"), el("dd", null,
        c.receipt.restorePoint.label + " · " + c.receipt.restorePoint.takenAt));
      add(dl, el("dt", null, "Would call"), el("dd", null, c.receipt.realCall));
      if (c.receipt.note) add(dl, el("dt", null, "Outcome"), el("dd", null, c.receipt.note));
      add(panel, dl);
      add(panel, el("div", "dr-panel-note", COPY.independence));

      var acts = el("div", "dr-acts");
      if (c.receipt.canRollback) {
        var undo = button("dr-btn", "Undo this copy");
        on(undo, "click", function () {
          COPY.rollback(c.receipt.id);
          c.receipt = COPY.receipts().filter(function (r) { return r.id === c.receipt.id; })[0] || c.receipt;
          render();
          shell.announce("The copy was undone. This Project is exactly as it was.");
        });
        add(acts, undo);
      }
      var done = link({ kind: "home" }, "dr-btn is-primary");
      done.textContent = "Done";
      var again = link({ kind: "copy", step: "source" }, "dr-btn is-quiet");
      again.textContent = "Copy from another Project";
      on(again, "click", function () { ui.copy = null; });
      add(acts, done, again);
      add(panel, acts);
    }

    var receipts = COPY.receipts();
    if (receipts.length) {
      add(panel, el("div", "dr-block-title", "Earlier transactions"));
      var box = el("div", "dr-list");
      receipts.forEach(function (r) {
        var row = el("div", "dr-item");
        add(row, add(el("div", "dr-item-head"),
          el("div", "dr-item-name", r.source.name + " → " + r.destination.name),
          chip(r.outcome === "applied" ? "Applied" : "Rolled back", r.outcome === "applied" ? "ok" : "attention")));
        add(row, el("div", "dr-item-sub", r.at + " · " + count(r.applied, "value") + " · " + r.restorePoint.label));
        add(box, row);
      });
      add(panel, box);
    }
    return panel;
  }

  /* ============================================================== NOTICE */

  function absentSurface(reason, quoted) {
    var s = el("div", "dr-surface");
    s.setAttribute("data-pm-surface", "notice");
    var panel = el("div", "dr-panel");
    add(panel, el("h2", null, "That link does not lead anywhere in this Project"));
    add(panel, el("div", "dr-row-desc", reason));
    var dl = el("dl", "dr-facts");
    add(dl, el("dt", null, "The link"), el("dd", null, quoted));
    add(dl, el("dt", null, "This Project"), el("dd", null, M.project.name + " · " + M.project.path));
    add(panel, dl);
    var acts = el("div", "dr-acts");
    var home = link({ kind: "home" }, "dr-btn is-primary");
    home.textContent = "Go to Settings Home";
    var all = link({ kind: "all" }, "dr-btn");
    all.textContent = "Search all settings";
    add(acts, home, all);
    add(panel, acts);
    add(s, panel);
    return s;
  }

  /* =============================================================== RENDER */

  function render() {
    if (ui.suppress) return;
    var route = RT.current();
    release.releaseAll();

    var resolved = RT.resolve(route);
    var surface, fill = false;

    if (route.malformed) {
      RT.replace({ kind: "home", state: route.state });
      return;
    }

    if (!resolved.ok) {
      surface = absentSurface(resolved.reason, resolved.quoted);
      setCrumbs([{ label: "Settings", dest: { kind: "home" } }, { label: "Broken link" }]);
      setBack({ label: "Settings Home", dest: { kind: "home" } });
      markRail(null);
      titleEl.hidden = true;
    } else if (route.kind === "home") {
      surface = renderHome();
      setCrumbs([{ label: "Settings" }]);
      setBack(null);
      markRail("home");
      titleEl.hidden = false;
    } else if (route.kind === "domain" && route.pageId) {
      var page = M.page(route.pageId);
      var domain = M.domain(page.domainId);
      surface = renderPage(route);
      setCrumbs([
        { label: "Settings", dest: { kind: "home" } },
        { label: domain.title, dest: { kind: "domain", domainId: domain.id } },
        { label: page.title }
      ]);
      setBack({ label: domain.title, dest: { kind: "domain", domainId: domain.id } });
      markRail(domain.id);
      titleEl.hidden = true;
    } else if (route.kind === "domain") {
      surface = renderDomain(route.domainId);
      setCrumbs([{ label: "Settings", dest: { kind: "home" } }, { label: M.domain(route.domainId).title }]);
      setBack({ label: "Settings Home", dest: { kind: "home" } });
      markRail(route.domainId);
      titleEl.hidden = true;
    } else if (route.kind === "manager") {
      surface = openManager(route);
      var family = M.familyOf(route.managerId);
      var mdomain = family && family.domainId ? M.domain(family.domainId) : null;
      var record = MGR.record(route.managerId);
      var crumbs = [{ label: "Settings", dest: { kind: "home" } }];
      if (mdomain) crumbs.push({ label: mdomain.title, dest: { kind: "domain", domainId: mdomain.id } });
      crumbs.push({ label: record.title || family.family });
      if (route.objectId) {
        var obj = objectsOf(route.managerId).objects[route.objectId];
        if (obj) crumbs.push({ label: obj.label });
      }
      setCrumbs(crumbs);
      setBack(mdomain
        ? { label: mdomain.title, dest: { kind: "domain", domainId: mdomain.id } }
        : { label: "Settings Home", dest: { kind: "home" } });
      markRail(mdomain ? mdomain.id : null);
      titleEl.hidden = true;
      fill = true;
    } else if (route.kind === "all") {
      surface = renderAll(route);
      setCrumbs([{ label: "Settings", dest: { kind: "home" } }, { label: "All settings" }]);
      setBack({ label: "Settings Home", dest: { kind: "home" } });
      markRail("all");
      titleEl.hidden = true;
      fill = true;
    } else if (route.kind === "copy") {
      surface = renderCopy(route);
      setCrumbs([{ label: "Settings", dest: { kind: "home" } }, { label: "Copy from another Project" }]);
      setBack({ label: "Settings Home", dest: { kind: "home" } });
      markRail("copy");
      titleEl.hidden = true;
    } else if (route.kind === "query") {
      surface = renderSearchSurface(route);
      setCrumbs([{ label: "Settings", dest: { kind: "home" } }, { label: "Search" }]);
      setBack({ label: "Settings Home", dest: { kind: "home" } });
      markRail(null);
      titleEl.hidden = true;
      searchInput.value = route.query || "";
      ui.query = route.query || "";
      ui.selectedResult = route.resultId || ui.selectedResult;
      runSearch();
    } else {
      surface = renderHome();
      setCrumbs([{ label: "Settings" }]);
      setBack(null);
      markRail("home");
      titleEl.hidden = false;
    }

    if (route.kind !== "query" && ui.dropOpen) closeDrop();

    canvasEl.setAttribute("data-fill", fill ? "1" : "0");
    surface.classList.add(ui.back ? "dr-enter-back" : "dr-enter");
    if (ui.transfer && surface.querySelector(".dr-transfer")) {
      var head = surface.querySelector(".dr-transfer");
      head.style.setProperty("--dr-from-x", ui.transfer.x + "px");
      head.style.setProperty("--dr-from-y", ui.transfer.y + "px");
    }
    clear(canvasEl);
    add(canvasEl, surface);
    ui.transfer = null;
    ui.back = false;
    root.setAttribute("data-surface", route.kind === "home" ? "home" : route.kind);

    applyArrival(route);
    store.set({ route: RT.href(route), stateFixture: RT.state() });
  }

  /* One arrival path for a deep link and for a chosen search result: load, open,
   * select, scroll, focus, then one calm ring that fades. */
  function applyArrival(route) {
    clearLocator();
    if (route.kind === "domain" && route.settingId) {
      var section = M.setting(route.settingId);
      if (section && !ui.openSections[section.sectionId]) {
        /* A row that is only reachable behind a disclosure is still reachable:
         * the group that holds it opens itself when a link names it. */
        ui.openSections[section.sectionId] = true;
        var block = canvasEl.querySelector('[data-pm-section="' + section.sectionId + '"]');
        if (block) {
          var fresh = renderSection(M.section(section.sectionId), route);
          block.parentNode.replaceChild(fresh, block);
        }
      }
      var row = canvasEl.querySelector('[data-pm-row="' + route.settingId + '"]');
      if (row) {
        setLocator(row);
        var control = row.querySelector("[data-pm-control]:not([disabled])");
        try { (control || row).focus({ preventScroll: true }); } catch (e) { (control || row).focus(); }
        scrollIntoCanvas(row);
        shell.announce(M.setting(route.settingId).label + ", found in " + pathOf(M.setting(route.settingId)) + ".");
        return;
      }
    }
    if (route.kind === "manager" && route.objectId) {
      var node = canvasEl.querySelector('[data-pm-object="' + route.objectId + '"]');
      if (node) {
        setLocator(node);
        scrollIntoScroller(node);
        if (route.rowId) {
          var deep = canvasEl.querySelector('[data-row-id="' + route.rowId + '"]');
          if (deep) { deep.classList.add("dr-arrive"); scrollIntoScroller(deep); }
        }
        return;
      }
    }
    if (route.kind === "manager") {
      var title = canvasEl.querySelector(".dr-detail-title");
      if (title) setLocator(title);
      return;
    }
    canvasEl.scrollTop = 0;
  }

  function clearLocator() {
    var old = document.querySelectorAll("[data-pm-locator]");
    for (var i = 0; i < old.length; i++) {
      old[i].removeAttribute("data-pm-locator");
      old[i].classList.remove("dr-arrive");
    }
  }

  function setLocator(node) {
    node.setAttribute("data-pm-locator", "1");
    node.classList.remove("dr-arrive");
    /* Reading offsetWidth restarts the animation; without it a second arrival
     * on the same row would show nothing at all. */
    void node.offsetWidth;
    node.classList.add("dr-arrive");
  }

  function scrollIntoCanvas(node) {
    var box = node.getBoundingClientRect();
    var frame = canvasEl.getBoundingClientRect();
    var target = canvasEl.scrollTop + (box.top - frame.top) - Math.max(0, (frame.height - box.height) / 2);
    canvasEl.scrollTop = Math.max(0, target);
  }

  function scrollIntoScroller(node) {
    var scroller = node.parentNode;
    while (scroller && scroller !== canvasEl) {
      var style = window.getComputedStyle(scroller);
      if (style.overflowY === "auto" || style.overflowY === "scroll") break;
      scroller = scroller.parentNode;
    }
    if (!scroller || scroller === canvasEl) { scrollIntoCanvas(node); return; }
    var box = node.getBoundingClientRect();
    var frame = scroller.getBoundingClientRect();
    var target = scroller.scrollTop + (box.top - frame.top) - Math.max(0, (frame.height - box.height) / 2);
    scroller.scrollTop = Math.max(0, target);
  }

  /* ============================================================== ESCAPE */

  /* Popup, then drawer or pushed pane, then one level out, and it stops at
   * Settings Home. Escape never closes Settings. */
  function onEscape() {
    if (ui.dropOpen) { closeDrop(); searchInput.focus(); return; }
    if (ui.drawer) { setDrawer(false); return; }
    var route = RT.current();
    if (root.getAttribute("data-mode") === "narrow" && route.kind === "manager" && ui.pane === "detail") {
      ui.pane = "roster";
      render();
      return;
    }
    ui.back = true;
    if (route.kind === "domain" && route.pageId) {
      go({ kind: "domain", domainId: route.domainId });
    } else if (route.kind === "manager") {
      var family = M.familyOf(route.managerId);
      if (route.objectId) go({ managerId: route.managerId });
      else if (family && family.domainId) go({ kind: "domain", domainId: family.domainId });
      else go({ kind: "home" });
    } else if (route.kind !== "home") {
      go({ kind: "home" });
    } else {
      ui.back = false;
    }
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { onEscape(); return; }
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  });

  document.addEventListener("mousedown", function (e) {
    if (!ui.dropOpen) return;
    if (topEl.contains(e.target)) return;
    closeDrop();
  });

  /* ================================================================ START */

  buildChrome();
  applyMode();

  RT.onChange(function () { render(); });

  if (RT.current().malformed) RT.replace({ kind: "home" });
  render();

  /* The index is built once, deliberately, after the first screen exists: the
   * rail and the directory need no index, and paying for it here keeps the
   * first search instant without hydrating a single manager. */
  window.setTimeout(function () { IX.ensure(); }, 0);
})();
