/* ============================================================================
   concept-08.js — Directory / Take 3 (kimi-k3 concept 08)
   ----------------------------------------------------------------------------
   Bright, spacious directory Home. Fewer, larger domain cards; domain pages of
   unmistakable manager-destination rows; providers as summary status cards
   with explicit quick actions and official-source install; full-width stepped
   Copy flow. Motion: cards lift-and-open, deeper slides up, Back settles.
   Vanilla ES5-style IIFE. All data via the shared v2 headless modules.
   ========================================================================== */
(function () {
  "use strict";

  var I = window.PM_V2_INVENTORY;
  var R = window.PM_V2_REGISTRY;
  var D = window.PM_CORE_DATA;
  var OB = window.PM_V2_OBJECTS;
  var SE = window.PM_V2_SEARCH;
  var CP = window.PM_V2_COPY;
  var MENU = window.PMV2Menu;

  var root = document.getElementById("dt3-root");
  if (!root || !I || !R || !SE) return;

  var store = window.PM_V2_STORE.for("concept-08");
  var objects = OB.objects();
  var index = SE.buildIndex({
    inventory: I,
    registry: R,
    coreData: D,
    objects: OB.searchObjects(),
    workflows: OB.workflows(),
    diagnostics: OB.diagnostics(),
    help: OB.help()
  });
  var session = SE.createSession(index, { limit: 30 });

  /* ==========================================================================
     Small DOM helpers
     ========================================================================== */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    var k;
    if (attrs) {
      for (k in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
        if (k === "class") n.className = attrs[k];
        else if (k === "text") n.textContent = attrs[k];
        else if (k === "on") {
          var ev;
          for (ev in attrs[k]) {
            if (Object.prototype.hasOwnProperty.call(attrs[k], ev)) n.addEventListener(ev, attrs[k][ev]);
          }
        } else if (k === "style") n.setAttribute("style", attrs[k]);
        else if (attrs[k] === true) n.setAttribute(k, "");
        else if (attrs[k] !== false && attrs[k] != null) n.setAttribute(k, String(attrs[k]));
      }
    }
    if (kids != null) appendKids(n, kids);
    return n;
  }
  function appendKids(n, kids) {
    if (Array.isArray(kids)) {
      for (var i = 0; i < kids.length; i++) appendKids(n, kids[i]);
    } else if (kids != null && kids.nodeType) n.appendChild(kids);
    else if (kids !== "" && kids != null) n.appendChild(document.createTextNode(String(kids)));
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }

  /* ---------- SVG icons (stroke, currentColor; no emoji anywhere) ---------- */
  var ICON_PATHS = {
    "home": "M4 11 12 4l8 7v9h-5v-6h-6v6H4z",
    "palette": "M12 3a9 9 0 1 0 0 18c1.4 0 2-.9 2-1.8 0-1.5-1.3-1.7-1.3-2.9 0-1 .8-1.8 2-1.8H17a4.5 4.5 0 0 0 4.5-4.5C21.5 5.6 17.2 3 12 3zM7 10.5h.01M10 7h.01M14.5 7h.01",
    "brain": "M8 4a3 3 0 0 0-3 3 3 3 0 0 0-2 3 3 3 0 0 0 2 3 3 3 0 0 0 3 3c0 1.7 1.3 3 3 3V6c-1 0-2-.8-3-2zm8 0a3 3 0 0 1 3 3 3 3 0 0 1 2 3 3 3 0 0 1-2 3 3 3 0 0 1-3 3c0 1.7-1.3 3-3 3V6c1 0 2-.8 3-2z",
    "shield": "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z",
    "code": "m8 7-5 5 5 5m8-10 5 5-5 5",
    "database": "M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
    "checklist": "M9 6h11M9 12h11M9 18h11M4 5.5 5 6.5 6.5 4.5M4 11.5 5 12.5 6.5 10.5M4 17.5 5 18.5 6.5 16.5",
    "branch": "M6 3v4m0 10v4M6 7a3 3 0 0 0 3 3h6a3 3 0 0 1 3 3v1M18 14a2.5 2.5 0 1 0 .01 0zM6 14a2.5 2.5 0 1 0 .01 0zM6 3a2.5 2.5 0 1 0 .01 0z",
    "image": "M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15.5 9h.01",
    "globe": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.8 2.5 4 5.6 4 9s-1.2 6.5-4 9c-2.8-2.5-4-5.6-4-9s1.2-6.5 4-9z",
    "person": "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 21c0-3.9 3.1-7 7-7s7 3.1 7 7",
    "people": "M9 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 10.5a3 3 0 1 0-1.5-5.6M21 20c0-2.8-1.9-5.1-4.5-5.8",
    "puzzle": "M10 4a2 2 0 1 1 4 0v2h4v4a2 2 0 1 1 0 4v4h-4a2 2 0 1 0-4 0H6v-4a2 2 0 1 1 0-4V6h4z",
    "gauge": "M12 20a9 9 0 1 1 9-9M12 12l5-3M21 11h-1",
    "bell": "M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0",
    "speaker": "M4 9v6h4l5 4V5L8 9H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11",
    "monitor": "M3 4h18v12H3zM9 20h6m-3-4v4",
    "folder": "M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z",
    "terminal": "M4 5h16v14H4zM7 9l3 3-3 3m5 0h5",
    "language": "M4 6h9M8.5 4v2c0 4-2.5 7-4.5 8.5M6 9c1 2.5 3 5 5.5 6.5M13 20l4-9 4 9m-6.7-3h5.4",
    "format": "M5 5h14M8 5v14m4-14v14M5 12h3m8 0h3",
    "wrench": "M14.5 6.5a4 4 0 0 0-5.6 4.7L4 16.1V20h3.9l4.9-4.9a4 4 0 0 0 4.7-5.6L14 13l-3-3z",
    "beaker": "M9 3h6M10 3v5l-5 9.5A2.4 2.4 0 0 0 7.2 21h9.6a2.4 2.4 0 0 0 2.2-3.5L14 8V3M7.5 14h9",
    "box": "M4 7.5 12 3l8 4.5v9L12 21l-8-4.5zM4 7.5l8 4.5 8-4.5M12 12v9",
    "command": "M9 9h6v6H9zM9 9H7a2 2 0 1 1 2-2zM15 9h2a2 2 0 1 0-2-2zM9 15H7a2 2 0 1 0 2 2zM15 15h2a2 2 0 1 1-2 2z",
    "sparkle": "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z",
    "plug": "M9 3v5m6-5v5M6 8h12v3a6 6 0 0 1-6 6 6 6 0 0 1-6-6zM12 17v4",
    "mortarboard": "M2.5 9 12 4l9.5 5L12 14zM6.5 11.5V16c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3v-4.5M21 9v5",
    "stethoscope": "M6 3v6a5 5 0 0 0 10 0V3M11 14v3a5 5 0 0 0 10 0v-1M18 14a2 2 0 1 0 .01 0zM4 3h4m8 0h4",
    "hard-drive": "M4 13l2.5-7h11L20 13M4 13h16v5H4zM15 15.5h.01M17.5 15.5h.01",
    "safe": "M4 5h16v14H4zM12 9a3.5 3.5 0 1 0 0 6 3.5 3.5 0 0 0 0-6zM12 12h.01M8 19v2m8-2v2",
    "recycle": "M8 5l2-2.5L12 5m0 0-2 2.5M12 5h6l2.5 4.5M18 14l2.5-4.5L18 5m2.5 9.5L18 19h-6m-4 0-2.5-4.5L8 10M3 14.5 5.5 19H12",
    "clock": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2",
    "archive": "M4 4h16v4H4zM6 8v11h12V8M10 12h4",
    "broom": "M14 3l7 7M13 4l-6.5 9.5M17 8l-9.5 6.5M4.5 11.5c3.5.5 7.5 4.5 8 8-3-.5-9-3-8-8z",
    "layers": "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5",
    "play-circle": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM10 8.5l6 3.5-6 3.5z",
    "search": "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.5-3.5",
    "steering": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 15v6M3.5 10.5 12 12l8.5-1.5",
    "check-spelling": "M4 15l5-10 5 10M5.8 11h6.4M15 15l3 3 5-6",
    "chev-r": "m9 6 6 6-6 6",
    "chev-l": "m15 6-6 6 6 6",
    "back": "M10 6l-6 6 6 6M4 12h16",
    "warn": "M12 3 2.5 20h19zM12 9.5V14m0 3h.01",
    "info": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5m0-9h.01",
    "check": "m5 13 4 4 10-11",
    "star": "m12 3 2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 17l-5.4 2.8 1.1-6.1L3.2 9.4l6.1-.8z",
    "x": "M6 6l12 12M18 6 6 18",
    "dots": "M5 12h.01M12 12h.01M19 12h.01",
    "copy": "M9 9h11v11H9zM5 15H4V4h11v1",
    "list": "M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01",
    "download": "M12 3v11m0 0 4-4m-4 4-4-4M4 17v3h16v-3",
    "refresh": "M20 12a8 8 0 1 1-2.3-5.6M20 3v4h-4",
    "key": "M14 10a4.5 4.5 0 1 0-4.2 2.9L12 15h2v2h2v2h3v-3.2L14.8 12A4.5 4.5 0 0 0 14 10zM14.5 9.5h.01",
    "activity": "M4 12h4l2-6 4 12 2-6h4"
  };
  function icon(name, size) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.7");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    if (size) { svg.style.inlineSize = size + "px"; svg.style.blockSize = size + "px"; }
    var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", ICON_PATHS[name] || ICON_PATHS["box"]);
    svg.appendChild(p);
    return svg;
  }

  function humanize(s) {
    if (s == null) return "";
    return String(s).replace(/[-_]+/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }
  function slug(s) {
    return String(s || "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : (many || one + "s")); }

  /* ==========================================================================
     Toasts
     ========================================================================== */
  var toastStack = el("div", { "class": "dt3-toast-stack", "aria-live": "polite" });
  document.body.appendChild(toastStack);
  function toast(msg, kind) {
    var t = el("div", { "class": "pm-toast", "data-kind": kind || "info", role: "status" }, [
      el("span", { "class": "pm-toast-icon" }, [icon(kind === "ok" ? "check" : kind === "warn" ? "warn" : kind === "danger" ? "warn" : "info")]),
      el("span", {}, [msg])
    ]);
    toastStack.appendChild(t);
    setTimeout(function () {
      t.classList.add("is-leaving");
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 240);
    }, 3200);
  }

  /* ==========================================================================
     Shell skeleton: rail + pane(head[crumb, search, close], body>canvas)
     ========================================================================== */
  root.classList.add("dt3");
  root.setAttribute("data-view", "home");
  root.innerHTML = [
    '<nav class="dt3-rail" aria-label="Settings sections">',
    '  <div class="dt3-rail-scroll pmv2-scroll" id="dt3-rail-scroll"></div>',
    '</nav>',
    '<div class="dt3-pane">',
    '  <div class="dt3-head">',
    '    <div class="dt3-crumb" id="dt3-crumb" aria-label="Breadcrumb"></div>',
    '    <div class="dt3-search">',
    '      <div class="dt3-search-box">',
    '        <span id="dt3-search-ic"></span>',
    '        <input id="pmv2-search" type="text" autocomplete="off" spellcheck="false"',
    '          placeholder="Search all 828 settings, providers, actions…" aria-label="Search settings"',
    '          aria-expanded="false" aria-controls="pmv2-results" role="combobox">',
    '        <span class="dt3-search-kbd">Esc</span>',
    '      </div>',
    '      <div class="dt3-results pmv2-scroll" id="pmv2-results" role="listbox" hidden></div>',
    '    </div>',
    '    <button type="button" class="dt3-close" id="dt3-close">Close Settings</button>',
    '  </div>',
    '  <div class="dt3-body pmv2-scroll" id="dt3-body">',
    '    <div class="dt3-canvas" id="dt3-canvas"></div>',
    '  </div>',
    '</div>'
  ].join("\n");
  document.getElementById("dt3-search-ic").appendChild(icon("search"));

  var railScroll = document.getElementById("dt3-rail-scroll");
  var crumbEl = document.getElementById("dt3-crumb");
  var bodyEl = document.getElementById("dt3-body");
  var canvas = document.getElementById("dt3-canvas");
  var searchInput = document.getElementById("pmv2-search");
  var resultsEl = document.getElementById("pmv2-results");

  /* ---------- rail (built once; aria-current maintained on navigate) ------- */
  var railLinks = [];
  function railLink(id, label, iconName, fn) {
    var b = el("button", {
      "type": "button", "class": "dt3-rail-link", "data-rail": id,
      "on": { "click": fn }
    }, [icon(iconName), el("span", {}, [label])]);
    railLinks.push(b);
    return b;
  }
  (function buildRail() {
    railScroll.appendChild(el("div", { "class": "dt3-rail-h" }, ["Settings"]));
    railScroll.appendChild(railLink("home", "Home", "home", function () { go({ view: "home" }); }));
    R.DOMAINS.forEach(function (d) {
      var cat = categoryOf(d.id);
      railScroll.appendChild(railLink("domain:" + d.id, d.title, (cat && cat.icon) || "folder",
        (function (did) { return function () { go({ view: "domain", domain: did }); }; })(d.id)));
    });
    var util = el("div", { "class": "dt3-rail-util" });
    util.appendChild(el("div", { "class": "dt3-rail-h" }, ["Utilities"]));
    util.appendChild(railLink("all", "All Settings", "list", function () { go({ view: "all" }); }));
    util.appendChild(railLink("copy", "Copy Settings", "copy", function () { go({ view: "copy" }); }));
    railScroll.appendChild(util);
  })();
  function syncRail(route) {
    var cur = route.view === "domain" ? "domain:" + route.domain
      : route.view === "manager" || route.view === "section" ? "domain:" + route.domain
      : route.view === "owner" ? "domain:system"
      : route.view;
    railLinks.forEach(function (b) {
      if (b.getAttribute("data-rail") === cur) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
  }

  /* ==========================================================================
     Data lookups
     ========================================================================== */
  function categoryOf(domainId) {
    for (var i = 0; i < I.categories.length; i++) if (I.categories[i].id === domainId) return I.categories[i];
    return null;
  }
  function subgroupOf(domainId, subId) {
    var c = categoryOf(domainId);
    if (!c) return null;
    for (var i = 0; i < c.subgroups.length; i++) if (c.subgroups[i].id === subId) return c.subgroups[i];
    return null;
  }
  function settingOf(id) { return I.settings[id] || null; }
  function domainTitle(id) { var d = R.domainById(id); return d ? d.title : humanize(id); }
  function domainSettings(domainId) {
    var out = [];
    var c = categoryOf(domainId);
    if (!c) return out;
    c.subgroups.forEach(function (sg) {
      sg.settings.forEach(function (sid) { var s = settingOf(sid); if (s) out.push(s); });
    });
    return out;
  }
  function rosterFor(mgr) {
    if (!mgr.objectSource) return [];
    return objects[mgr.objectSource] || [];
  }

  /* ==========================================================================
     Router — push navigation; deeper rises, Back settles
     ========================================================================== */
  var stack = [];           // [{route, name}]
  var route = { view: "home" };
  var searchRestore = null; // {fromRouteKey, query, resultId}

  function routeName(r) {
    if (r.view === "home") return "Home";
    if (r.view === "domain") return domainTitle(r.domain);
    if (r.view === "section") {
      var sg = subgroupOf(r.domain, r.section);
      return domainTitle(r.domain) + " — " + (sg ? sg.title : humanize(r.section));
    }
    if (r.view === "manager") {
      var m = R.managerById(r.manager);
      var n = m ? m.title : humanize(r.manager);
      if (r.object) {
        var ros = rosterFor(m);
        for (var i = 0; i < ros.length; i++) if (ros[i].id === r.object) { n += " — " + ros[i].label; break; }
      }
      return n;
    }
    if (r.view === "all") return "All Settings";
    if (r.view === "copy") return "Copy Settings";
    if (r.view === "owner") {
      for (var j = 0; j < R.DEFERRED_OWNERS.length; j++) if (R.DEFERRED_OWNERS[j].id === r.owner) return R.DEFERRED_OWNERS[j].family;
      return "Owned area";
    }
    return "Settings";
  }
  function routeKey(r) {
    return [r.view, r.domain || "", r.manager || "", r.object || "", r.section || "", r.row || "", r.owner || ""].join("|");
  }
  function go(r, opts) {
    stack.push({ route: route, name: routeName(route) });
    route = r;
    render(opts && opts.settle ? "settle" : "rise");
  }
  function back() {
    var prev = stack.pop();
    if (!prev) { goHomeSettle(); return; }
    var landed = prev.route;
    route = landed;
    render("settle");
    // Universal-search contract: Back from a search destination restores the query.
    if (searchRestore && routeKey(landed) === searchRestore.fromRouteKey) {
      var q = searchRestore.query;
      var rid = searchRestore.resultId;
      searchRestore = null;
      searchInput.value = q;
      runSearch(q, rid);
    }
  }
  function goHomeSettle() {
    if (route.view !== "home") { route = { view: "home" }; render("settle"); }
  }

  function render(dir) {
    root.setAttribute("data-view", route.view);
    syncRail(route);
    renderCrumb();
    clear(canvas);
    canvas.removeAttribute("data-wide");
    canvas.classList.remove("dt3-anim-rise", "dt3-anim-settle");
    if (dir) canvas.classList.add(dir === "settle" ? "dt3-anim-settle" : "dt3-anim-rise");
    bodyEl.scrollTop = 0;
    var fn = {
      "home": renderHome, "domain": renderDomain, "section": renderSection,
      "manager": renderManager, "all": renderAll, "copy": renderCopy, "owner": renderOwner
    }[route.view] || renderHome;
    fn();
    canvas.setAttribute("tabindex", "-1");
  }

  function renderCrumb() {
    clear(crumbEl);
    var parts = [];
    parts.push({ label: "Settings", r: { view: "home" } });
    if (route.domain) parts.push({ label: domainTitle(route.domain), r: { view: "domain", domain: route.domain } });
    if (route.view === "section") {
      var sg = subgroupOf(route.domain, route.section);
      parts.push({ label: sg ? sg.title : humanize(route.section), r: null });
    } else if (route.view === "manager") {
      var m = R.managerById(route.manager);
      parts.push({ label: m ? m.title : humanize(route.manager), r: route.object ? { view: "manager", domain: route.domain, manager: route.manager } : null });
      if (route.object) {
        var ros = rosterFor(m);
        var lbl = route.object;
        for (var i = 0; i < ros.length; i++) if (ros[i].id === route.object) { lbl = ros[i].label; break; }
        parts.push({ label: lbl, r: null });
      }
    } else if (route.view === "all") parts.push({ label: "All Settings", r: null });
    else if (route.view === "copy") parts.push({ label: "Copy Settings", r: null });
    else if (route.view === "owner") parts.push({ label: routeName(route), r: null });

    parts.forEach(function (p, idx) {
      if (idx > 0) crumbEl.appendChild(el("span", { "class": "dt3-crumb-sep" }, ["/"]));
      if (p.r && idx < parts.length - 1) {
        crumbEl.appendChild(el("button", {
          "type": "button",
          "on": { "click": function () { go(p.r, { settle: true }); } }
        }, [p.label]));
      } else {
        crumbEl.appendChild(el("span", { "class": "dt3-crumb-here" }, [p.label]));
      }
    });
  }

  function backButton(targetName) {
    return el("button", {
      "type": "button", "class": "dt3-back",
      "on": { "click": back }
    }, [icon("back"), "Back to " + targetName]);
  }

  function scenarioBanner(surfaceId) {
    if (!store.activeScenario()) return null;
    var proj = store.projection(surfaceId);
    if (!proj || !proj.message) return null;
    return el("div", { "class": "dt3-scenario-banner", "data-scenario": store.activeScenario() }, [
      icon("info"),
      el("span", {}, [el("strong", {}, ["Demo scenario: " + humanize(store.activeScenario()) + ". "]), proj.message,
        proj.cached ? " (Showing cached data.)" : ""]),
      el("button", {
        "type": "button", "class": "pm-btn", "data-variant": "quiet",
        "on": { "click": function () { store.setScenario(null); render(null); } }
      }, ["Clear scenario"])
    ]);
  }

  /* ==========================================================================
     Universal search
     ========================================================================== */
  var searchOpen = false;
  var searchResults = [];
  var searchMeta = null;
  var searchSel = -1;
  var searchSeq = 0;

  var TYPE_LABELS = {
    "setting": "Setting", "manager": "Destination", "managed_object": "Object",
    "action": "Action", "setup_or_repair_workflow": "Setup",
    "diagnostic_or_read_only_status": "Status", "unavailable_capability": "Unavailable",
    "intentional_help_result": "Help"
  };
  var TYPE_ORDER = ["setting", "manager", "managed_object", "action", "setup_or_repair_workflow",
    "diagnostic_or_read_only_status", "unavailable_capability", "intentional_help_result"];

  function markLabel(label, query) {
    var frag = document.createDocumentFragment();
    if (!query) { frag.appendChild(document.createTextNode(label)); return frag; }
    var lower = label.toLowerCase();
    var q = query.toLowerCase().trim();
    var at = q ? lower.indexOf(q) : -1;
    if (at < 0) { frag.appendChild(document.createTextNode(label)); return frag; }
    frag.appendChild(document.createTextNode(label.slice(0, at)));
    frag.appendChild(el("mark", {}, [label.slice(at, at + q.length)]));
    frag.appendChild(document.createTextNode(label.slice(at + q.length)));
    return frag;
  }

  function openResults() {
    searchOpen = true;
    resultsEl.hidden = false;
    searchInput.setAttribute("aria-expanded", "true");
  }
  function closeResults() {
    searchOpen = false;
    resultsEl.hidden = true;
    searchInput.setAttribute("aria-expanded", "false");
    searchSel = -1;
  }

  function runSearch(text, reselectId) {
    var seq = ++searchSeq;
    session.query(text, function (results, meta) {
      if (seq !== searchSeq) return; // latest-request-wins, mirrored headless-side
      searchResults = results || [];
      searchMeta = meta || null;
      paintResults(text, reselectId);
    });
  }

  function paintResults(text, reselectId) {
    clear(resultsEl);
    searchSel = -1;
    if (!searchResults.length) {
      resultsEl.appendChild(el("div", { "class": "dt3-hit-empty" }, [
        "No results for “" + text + "”. Try a different word — the full index stays available in All Settings."
      ]));
      openResults();
      return;
    }
    var byType = {};
    searchResults.forEach(function (r) {
      (byType[r.type] = byType[r.type] || []).push(r);
    });
    var flat = 0;
    TYPE_ORDER.forEach(function (t) {
      var rows = byType[t];
      if (!rows || !rows.length) return;
      resultsEl.appendChild(el("div", { "class": "dt3-results-group" }, [TYPE_LABELS[t] || humanize(t)]));
      rows.forEach(function (r) {
        var idx2 = flat++;
        var kids = [
          el("span", { "class": "dt3-hit-label" }, [markLabel(r.label, text)]),
          el("span", { "class": "dt3-hit-type" }, [TYPE_LABELS[r.type] || humanize(r.type)]),
          el("span", { "class": "dt3-hit-path" }, [r.path || "Settings"])
        ];
        if (r.availability) kids.push(el("span", { "class": "dt3-hit-avail" }, [r.availability]));
        var b = el("button", {
          "type": "button", "class": "dt3-hit", role: "option",
          "data-result-id": r.immutableResultId,
          "aria-selected": "false",
          "on": {
            "click": function () { chooseResult(r, text); },
            "mousemove": function () { setSel(idx2); }
          }
        }, kids);
        b.setAttribute("data-hit-index", String(idx2));
        resultsEl.appendChild(b);
        if (reselectId && r.immutableResultId === reselectId) {
          b.setAttribute("aria-selected", "true");
          searchSel = idx2;
        }
      });
    });
    if (searchMeta && searchMeta.bounded && searchMeta.total > searchResults.length) {
      resultsEl.appendChild(el("button", {
        "type": "button", "class": "dt3-hit-more",
        "on": { "click": function () { closeResults(); go({ view: "all", query: text }); } }
      }, ["View all " + searchMeta.total + " results in All Settings"]));
    }
    openResults();
  }

  function setSel(idx2) {
    var hits = resultsEl.querySelectorAll(".dt3-hit");
    for (var i = 0; i < hits.length; i++) hits[i].setAttribute("aria-selected", i === idx2 ? "true" : "false");
    searchSel = idx2;
  }

  function chooseResult(r, text) {
    var entry = SE.resolve(index, r.immutableResultId);
    if (!entry) { toast("That result is no longer in the index.", "warn"); return; }
    closeResults();
    store.saveSearchState(text, entry.immutableResultId);
    searchRestore = { fromRouteKey: routeKey(route), query: text, resultId: entry.immutableResultId };
    navigateTo(entry);
  }

  function navigateTo(entry) {
    var d = entry.destination || {};
    if (entry.type === "action" && !d.domain && !d.manager) { runAction(entry); return; }
    if (d.manager === "lifecycle" && (d.page === "copy" || d.section === "copy")) {
      go({ view: "copy", fromSearch: true });
      return;
    }
    if (d.manager) {
      go({ view: "manager", domain: d.domain, manager: d.manager, object: d.object || null, section: d.page || d.section || null, row: d.row || null, fromSearch: true });
      return;
    }
    if (d.domain && (d.section || d.row)) {
      go({ view: "section", domain: d.domain, section: d.section || d.page, row: d.row || null });
      return;
    }
    if (d.domain) { go({ view: "domain", domain: d.domain }); return; }
    runAction(entry);
  }

  function runAction(entry) {
    var label = (entry.label || "").toLowerCase();
    if (label.indexOf("home") >= 0) { go({ view: "home" }); return; }
    if (label.indexOf("reset demo") >= 0) {
      store.setScenario(null);
      toast("Demo data reset to the default fixtures.", "ok");
      render(null);
      return;
    }
    if (label.indexOf("catalog") >= 0) { go({ view: "manager", domain: "ai", manager: "providers" }); toast("Catalog refresh started (demo).", "info"); return; }
    toast("Done — " + entry.label + " (demo action).", "ok");
  }

  searchInput.addEventListener("input", function () {
    var v = searchInput.value;
    if (!v.trim()) { closeResults(); clear(resultsEl); store.saveSearchState("", null); return; }
    runSearch(v);
  });
  searchInput.addEventListener("focus", function () {
    if (searchInput.value.trim() && !searchOpen) runSearch(searchInput.value);
  });
  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!searchOpen) { if (searchInput.value.trim()) runSearch(searchInput.value); e.preventDefault(); return; }
      var n = searchResults.length;
      if (!n) return;
      var next = e.key === "ArrowDown"
        ? (searchSel < 0 ? 0 : (searchSel + 1) % n)
        : (searchSel < 0 ? n - 1 : (searchSel + n - 1) % n);
      setSel(next);
      var hit = resultsEl.querySelector('[data-hit-index="' + next + '"]');
      if (hit) hit.scrollIntoView({ block: "nearest" });
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (searchOpen && searchSel >= 0 && searchResults[searchSel]) {
        chooseResult(searchResults[searchSel], searchInput.value);
        e.preventDefault();
      }
    } else if (e.key === "Escape") {
      if (searchOpen) { closeResults(); e.stopPropagation(); }
    }
  });
  document.addEventListener("pointerdown", function (e) {
    if (searchOpen && !resultsEl.contains(e.target) && e.target !== searchInput && !searchInput.parentNode.contains(e.target)) closeResults();
  });

  /* Exact-result highlight: animated .pmv2-locate, then a calm persistent outline */
  function locate(node) {
    if (!node) return;
    node.setAttribute("tabindex", "-1");
    try { node.scrollIntoView({ block: "center", behavior: "auto" }); } catch (e) { node.scrollIntoView(); }
    node.classList.add("pmv2-locate");
    try { node.focus({ preventScroll: true }); } catch (e2) { node.focus(); }
    setTimeout(function () {
      node.classList.remove("pmv2-locate");
      node.classList.add("dt3-located");
    }, 2400);
  }
  function clearLocated() {
    var old = canvas.querySelectorAll(".dt3-located, .pmv2-locate");
    for (var i = 0; i < old.length; i++) old[i].classList.remove("dt3-located", "pmv2-locate");
  }

  /* ==========================================================================
     Ordinary setting grammar — one row renderer for the whole concept
     ========================================================================== */
  function stateBadge(s) {
    var st = s.state || "default";
    return el("span", { "class": "pm-badge", "data-kind": "state", "data-state": st, "data-icon": true }, [humanize(st)]);
  }

  function settingControl(s) {
    var val = store.value(s.id, s.value != null ? s.value : s["default"]);
    var disabled = s.state === "managed" || s.state === "unavailable";
    function commit(v) {
      store.setValue(s.id, v);
      toast("“" + s.label + "” set to " + displayValue(s, v) + " for this project.", "ok");
    }
    if (s.type === "toggle") {
      var sw = el("button", {
        "type": "button", "class": "pm-switch", role: "switch",
        "aria-checked": val ? "true" : "false", "aria-label": s.label, "disabled": disabled
      });
      sw.addEventListener("click", function () {
        var now = sw.getAttribute("aria-checked") !== "true";
        sw.setAttribute("aria-checked", now ? "true" : "false");
        commit(now);
      });
      return sw;
    }
    if (s.type === "select") {
      var sel = el("select", { "aria-label": s.label, "disabled": disabled });
      (s.options || []).forEach(function (opt) {
        var o = el("option", { "value": opt }, [opt]);
        if (opt === val) o.setAttribute("selected", "");
        sel.appendChild(o);
      });
      sel.addEventListener("change", function () { commit(sel.value); });
      return el("span", { "class": "pm-select" }, [sel]);
    }
    if (s.type === "segmented") {
      var seg = el("span", { "class": "pm-seg", role: "radiogroup", "aria-label": s.label });
      (s.options || []).forEach(function (opt) {
        var b = el("button", {
          "type": "button", role: "radio",
          "aria-checked": opt === val ? "true" : "false", "disabled": disabled
        }, [opt]);
        b.addEventListener("click", function () {
          var all = seg.querySelectorAll('[role="radio"]');
          for (var i = 0; i < all.length; i++) all[i].setAttribute("aria-checked", "false");
          b.setAttribute("aria-checked", "true");
          commit(opt);
        });
        seg.appendChild(b);
      });
      return seg;
    }
    if (s.type === "slider") {
      var bubble = el("span", { "class": "pm-slider-val" }, [String(val) + (s.unit || "")]);
      var range = el("input", {
        "type": "range", "class": "pm-slider", "aria-label": s.label,
        "min": s.min != null ? s.min : 0, "max": s.max != null ? s.max : 100,
        "value": val, "disabled": disabled
      });
      range.addEventListener("input", function () { bubble.textContent = range.value + (s.unit || ""); });
      range.addEventListener("change", function () { commit(Number(range.value)); });
      return el("span", { "class": "pm-sliderwrap" }, [range, bubble]);
    }
    if (s.type === "number") {
      var inp = el("input", {
        "type": "number", "aria-label": s.label, "value": val,
        "min": s.min != null ? s.min : 0, "max": s.max != null ? s.max : 999, "disabled": disabled
      });
      function step(delta) {
        var v = Math.max(Number(inp.min || 0), Math.min(Number(inp.max || 999), Number(inp.value || 0) + delta));
        inp.value = v; commit(v);
      }
      return el("span", { "class": "pm-stepper" }, [
        el("button", { "type": "button", "aria-label": "Decrease", "disabled": disabled, "on": { "click": function () { step(-1); } } }, ["−"]),
        inp,
        el("button", { "type": "button", "aria-label": "Increase", "disabled": disabled, "on": { "click": function () { step(1); } } }, ["+"])
      ]);
    }
    if (s.type === "action") {
      return el("button", {
        "type": "button", "class": "pm-btn", "disabled": disabled,
        "on": { "click": function () { toast("“" + s.label + "” opens a guided review before anything changes (demo).", "info"); } }
      }, [s.actionLabel || "Open…"]);
    }
    // text and fallbacks
    var ti = el("input", {
      "type": "text", "aria-label": s.label, "value": val === "not-configured" ? "" : String(val == null ? "" : val),
      "placeholder": s.placeholder || "Not configured", "disabled": disabled
    });
    ti.addEventListener("change", function () { commit(ti.value || "not-configured"); });
    return el("span", { "class": "pm-text", "data-empty-hint": "not-configured" }, [ti]);
  }

  function displayValue(s, v) {
    if (v === true) return "On";
    if (v === false) return "Off";
    if (v === "not-configured" || v == null || v === "") return "Not configured";
    return "“" + v + "”";
  }

  function rowMenu(anchor, s) {
    var items = [];
    if (store.overrideInfo(s.id)) {
      items.push({
        label: "Reset to default", action: function () {
          store.resetValue(s.id);
          toast("“" + s.label + "” returned to its default.", "ok");
          render(null);
        }
      });
    } else {
      items.push({ label: "Reset to default", disabled: true, hint: "Already default" });
    }
    items.push({ sep: true });
    items.push({
      label: "Copy setting name", action: function () {
        try { navigator.clipboard.writeText(s.label); } catch (e) { /* clipboard optional in demo */ }
        toast("Setting name copied.", "ok");
      }
    });
    MENU.open(anchor, items, { align: "end" });
  }

  function settingRow(s) {
    var row = el("div", {
      "class": "pm-row", "data-setting-id": s.id,
      "data-state": s.state || "default", "data-exposure": s.exposure || "standard"
    });
    if (s.exposure === "expert" && s.risky) row.setAttribute("data-risky", "");
    var labelWrap = el("span", { "class": "pm-row-label" }, [s.label, stateBadge(s)]);
    if (s.exposure && s.exposure !== "standard") {
      labelWrap.appendChild(el("span", { "class": "pm-badge", "data-kind": "exposure", "data-exposure": s.exposure, "data-icon": true }, [humanize(s.exposure)]));
    }
    var main = el("div", { "class": "pm-row-main" }, [labelWrap, el("span", { "class": "pm-row-desc" }, [s.desc || ""])]);
    var ctl = el("div", { "class": "pm-row-control" }, [settingControl(s)]);
    var menuBtn = el("button", {
      "type": "button", "class": "dt3-row-menu", "aria-label": "More actions for " + s.label,
      "aria-haspopup": "menu",
      "on": { "click": function () { rowMenu(menuBtn, s); } }
    }, [icon("dots")]);
    ctl.appendChild(menuBtn);
    row.appendChild(main);
    row.appendChild(ctl);
    if (s.state === "managed" || s.state === "unavailable") {
      row.appendChild(el("span", { "class": "pm-row-reason" }, [
        (s.state === "managed" ? "Managed: " : "Unavailable: ") + (s.source || "by policy")
      ]));
    }
    var why = el("details", { "class": "pm-accordion" }, [
      el("summary", {}, ["Why this value?"]),
      el("div", { "class": "pm-accordion-body" }, [
        "Source: " + (s.source || "Default") + ". Default: " + (s["default"] != null ? String(s["default"]) : "—") +
        (s.recommended != null ? ". Recommended: " + String(s.recommended) : "") +
        ". Applies to the current project (" + store.currentProject().name + ")."
      ])
    ]);
    row.appendChild(el("div", { "class": "dt3-why" }, [why]));
    return row;
  }

  /* Chunked group renderer (never an eager multi-hundred-row dump) */
  var CHUNK = 24;
  function settingGroups(container, groups, opts) {
    opts = opts || {};
    groups.forEach(function (g) {
      if (!g.settings.length) return;
      var wrap = el("div", { "class": "dt3-group", "data-section-id": g.id });
      wrap.appendChild(el("h3", { "class": "dt3-group-h" }, [g.title]));
      if (g.desc) wrap.appendChild(el("p", { "class": "dt3-group-sub" }, [g.desc]));
      var rows = el("div", { "class": "dt3-rows" });
      wrap.appendChild(rows);
      var shown = 0;
      function paintChunk() {
        var end = Math.min(g.settings.length, shown + CHUNK);
        for (var i = shown; i < end; i++) {
          var s = settingOf(g.settings[i]);
          if (s) rows.appendChild(settingRow(s));
        }
        shown = end;
        if (moreBtn) {
          if (shown >= g.settings.length) { moreBtn.parentNode.removeChild(moreBtn); moreBtn = null; }
          else moreBtn.textContent = "Show " + Math.min(CHUNK, g.settings.length - shown) + " more of " + g.settings.length;
        }
        if (opts.onRow) opts.onRow();
      }
      var moreBtn = null;
      if (g.settings.length > CHUNK) {
        moreBtn = el("button", { "type": "button", "class": "dt3-hit-more", "on": { "click": paintChunk } }, [""]);
        wrap.appendChild(moreBtn);
      }
      paintChunk();
      container.appendChild(wrap);
    });
  }

  /* ==========================================================================
     Virtualized fixed-height list (compendium + catalogs)
     ========================================================================== */
  var VROW_H = 44;
  function virtualList(rows, paintRow) {
    var viewport = el("div", { "class": "dt3-vlist pmv2-scroll", "tabindex": "0" });
    var inner = el("div", {});
    viewport.appendChild(inner);
    var total = rows.length;
    function paint() {
      var scrollTop = viewport.scrollTop;
      var viewH = viewport.clientHeight || 480;
      var start = Math.max(0, Math.floor(scrollTop / VROW_H) - 6);
      var end = Math.min(total, Math.ceil((scrollTop + viewH) / VROW_H) + 6);
      clear(inner);
      inner.style.paddingTop = (start * VROW_H) + "px";
      inner.style.paddingBottom = ((total - end) * VROW_H) + "px";
      for (var i = start; i < end; i++) inner.appendChild(paintRow(rows[i], i));
    }
    viewport.addEventListener("scroll", paint);
    // paint after mount so clientHeight is real
    setTimeout(paint, 0);
    paint();
    return viewport;
  }

  /* ==========================================================================
     HOME — search + attention at top; fewer, larger domain cards dominant
     ========================================================================== */
  var NOTICE_DOMAIN = {
    "permissions": "safety", "providers": "ai", "terminal": "code", "devtools": "code",
    "source-control": "branching", "context": "memory", "goal": "planning", "general": "general",
    "appearance": "general", "notifications": "general", "personas": "personas", "system": "system"
  };
  function noticeTarget(n) {
    if (!n.target) return null;
    if (n.target.manager) return { view: "manager", domain: "ai", manager: n.target.manager };
    var dom = NOTICE_DOMAIN[n.target.category] || "system";
    return { view: "domain", domain: dom };
  }

  function renderHome() {
    var proj = store.currentProject();
    var banner = scenarioBanner("home");
    if (banner) canvas.appendChild(banner);

    canvas.appendChild(el("div", { "class": "dt3-hello" }, [
      el("h1", {}, ["Settings"]),
      el("p", {}, [
        "Everything here applies to the current project, ",
        el("span", { "class": "dt3-project" }, [proj.name]),
        " (" + proj.path + "). Search above, or open a destination below."
      ])
    ]));

    var notices = (D.notices || []).slice();
    var critical = null;
    for (var i = 0; i < notices.length; i++) {
      if (notices[i].kind === "attention") { critical = notices[i]; break; }
    }
    if (critical) {
      canvas.appendChild(el("div", { "class": "dt3-attn-banner" }, [
        el("div", { "class": "pm-notice", "data-kind": "attention", role: "alert" }, [
          el("span", { "class": "pm-notice-chip" }, ["Needs attention"]),
          el("span", { "class": "pm-notice-head" }, [critical.headline]),
          el("span", { "class": "pm-notice-body" }, [critical.consequence]),
          el("span", { "class": "pm-notice-actions" }, [
            el("button", {
              "type": "button", "class": "pm-btn", "data-variant": "primary",
              "on": { "click": function () { var r = noticeTarget(critical); if (r) go(r); } }
            }, [critical.actionLabel || "Review"]),
            el("button", {
              "type": "button", "class": "pm-btn", "data-variant": "quiet",
              "on": { "click": function () { toast("Dismissed for this demo session.", "info"); } }
            }, [critical.secondaryLabel || "Dismiss"])
          ])
        ])
      ]));
    }

    var attn = notices.filter(function (n) { return !critical || n.id !== critical.id; }).slice(0, 3);
    if (attn.length) {
      var list = el("div", { "class": "dt3-attn-list" });
      attn.forEach(function (n) {
        list.appendChild(el("div", { "class": "dt3-attn-row", "data-kind": n.kind }, [
          icon(n.kind === "setup" ? "info" : n.kind === "recommended" ? "star" : "warn"),
          el("div", { "class": "dt3-attn-main" }, [
            el("div", { "class": "dt3-attn-head" }, [n.headline]),
            el("div", { "class": "dt3-attn-sub" }, [n.consequence])
          ]),
          el("div", { "class": "dt3-attn-act" }, [
            el("button", {
              "type": "button", "class": "pm-btn", "data-variant": "quiet",
              "on": { "click": function () { var r = noticeTarget(n); if (r) go(r); } }
            }, [n.actionLabel || "Open"])
          ])
        ]));
      });
      canvas.appendChild(list);
    }

    canvas.appendChild(el("div", { "class": "dt3-section-h" }, [
      el("h2", {}, ["Destinations"]),
      el("span", { "class": "dt3-section-sub" }, ["Twelve areas. Every manager and setting lives inside one."])
    ]));
    var grid = el("div", { "class": "dt3-domains" });
    R.DOMAINS.forEach(function (d, di) {
      var cat = categoryOf(d.id);
      var mgrs = R.managersByDomain(d.id);
      var settingCount = 0;
      if (cat) cat.subgroups.forEach(function (sg) { settingCount += sg.settings.length; });
      var chips = [
        el("span", { "class": "dt3-domain-chip" }, [plural(mgrs.length, "manager")]),
        el("span", { "class": "dt3-domain-chip" }, [plural(settingCount, "setting")])
      ];
      if (d.id === "system") chips.push(el("span", { "class": "dt3-domain-chip" }, [plural(R.DEFERRED_OWNERS.length, "owned area")]));
      var card = el("button", {
        "type": "button", "class": "dt3-domain-card", "data-domain-id": d.id,
        "style": "--dt3-i:" + di,
        "on": { "click": function () { go({ view: "domain", domain: d.id }); } }
      }, [
        el("span", { "class": "dt3-domain-icon" }, [icon((cat && cat.icon) || "folder")]),
        el("span", { "class": "dt3-domain-title" }, [d.title]),
        el("span", { "class": "dt3-domain-blurb" }, [d.blurb]),
        el("span", { "class": "dt3-domain-meta" }, chips),
        el("span", { "class": "dt3-domain-chev" }, [icon("chev-r")])
      ]);
      grid.appendChild(card);
    });
    canvas.appendChild(grid);

    var utils = el("div", { "class": "dt3-utils" }, [
      el("button", {
        "type": "button", "class": "dt3-util-link",
        "on": { "click": function () { go({ view: "all" }); } }
      }, [icon("list"), "All Settings — the complete " + I.meta.settingsCount + "-row index"]),
      el("button", {
        "type": "button", "class": "dt3-util-link",
        "on": { "click": function () { go({ view: "copy" }); } }
      }, [icon("copy"), "Copy Settings from another project"])
    ]);
    canvas.appendChild(utils);

    if (D.recents && D.recents.length) {
      var rec = el("div", { "class": "dt3-recents" }, [el("span", { "class": "dt3-recents-h" }, ["Recently changed:"])]);
      D.recents.slice(0, 5).forEach(function (r) {
        rec.appendChild(el("button", {
          "type": "button", "class": "dt3-recent-chip",
          "on": {
            "click": function () {
              if (r.target && r.target.manager) go({ view: "manager", domain: "ai", manager: r.target.manager, section: r.target.tab || null });
              else if (r.target && r.target.category) go({ view: "domain", domain: NOTICE_DOMAIN[r.target.category] || "system" });
            }
          }
        }, [icon("clock"), r.label]));
      });
      canvas.appendChild(rec);
    }
  }

  /* ==========================================================================
     DOMAIN overview — manager destination rows with counts + subgroup rows
     ========================================================================== */
  function managerCount(m) {
    if (m.objectSource) {
      var n = rosterFor(m).length;
      if (n) return plural(n, "item");
    }
    var s = domainSettings(m.domain).length;
    return plural((m.subpages || []).length, "page") + " · about " + plural(Math.min(s, 40), "setting");
  }

  function renderDomain() {
    var d = R.domainById(route.domain);
    if (!d) { renderHome(); return; }
    var cat = categoryOf(d.id);
    var banner = scenarioBanner("domain:" + d.id);
    if (banner) canvas.appendChild(banner);

    canvas.appendChild(el("div", { "class": "dt3-domain-hero", "data-domain-id": d.id }, [
      el("h1", {}, [d.title]),
      el("p", {}, [d.blurb + " Applies to " + store.currentProject().name + "."])
    ]));

    var mgrs = R.managersByDomain(d.id);
    if (mgrs.length) {
      canvas.appendChild(el("div", { "class": "dt3-section-h" }, [
        el("h2", {}, ["Managers"]),
        el("span", { "class": "dt3-section-sub" }, ["Dedicated tools for the big jobs in this area."])
      ]));
      var list = el("div", { "class": "dt3-mgr-list" });
      mgrs.forEach(function (m) {
        list.appendChild(el("button", {
          "type": "button", "class": "dt3-mgr-row", "data-manager-id": m.id,
          "on": { "click": function () { go({ view: "manager", domain: d.id, manager: m.id }); } }
        }, [
          el("span", { "class": "dt3-mgr-icon" }, [icon(m.icon || "wrench")]),
          el("span", { "class": "dt3-mgr-main" }, [
            el("span", { "class": "dt3-mgr-title" }, [m.title]),
            el("span", { "class": "dt3-mgr-sum" }, [m.summary])
          ]),
          el("span", { "class": "dt3-mgr-count" }, [managerCount(m)]),
          el("span", { "class": "dt3-mgr-chev" }, [icon("chev-r")])
        ]));
      });
      canvas.appendChild(list);
    }

    if (d.id === "system") {
      canvas.appendChild(el("div", { "class": "dt3-section-h" }, [
        el("h2", {}, ["Owned elsewhere"]),
        el("span", { "class": "dt3-section-sub" }, ["Insertion points into areas owned by other product modules."])
      ]));
      var dlist = el("div", { "class": "dt3-mgr-list" });
      R.DEFERRED_OWNERS.forEach(function (o) {
        dlist.appendChild(el("button", {
          "type": "button", "class": "dt3-mgr-row", "data-deferred": "true", "data-manager-id": "deferred-" + o.id,
          "on": { "click": function () { go({ view: "owner", domain: "system", owner: o.id }); } }
        }, [
          el("span", { "class": "dt3-mgr-icon" }, [icon("plug")]),
          el("span", { "class": "dt3-mgr-main" }, [
            el("span", { "class": "dt3-mgr-title" }, [o.family]),
            el("span", { "class": "dt3-mgr-sum" }, ["Owned by " + o.owner + " — opens the insertion point."])
          ]),
          el("span", { "class": "dt3-mgr-count" }, ["External owner"]),
          el("span", { "class": "dt3-mgr-chev" }, [icon("chev-r")])
        ]));
      });
      canvas.appendChild(dlist);
    }

    if (cat) {
      canvas.appendChild(el("div", { "class": "dt3-section-h" }, [
        el("h2", {}, ["Setting groups"]),
        el("span", { "class": "dt3-section-sub" }, ["Every individual setting in " + d.title + ", grouped."])
      ]));
      var subs = el("div", { "class": "dt3-sub-list" });
      cat.subgroups.forEach(function (sg) {
        subs.appendChild(el("button", {
          "type": "button", "class": "dt3-sub-row", "data-section-id": sg.id,
          "on": { "click": function () { go({ view: "section", domain: d.id, section: sg.id }); } }
        }, [
          el("span", { "class": "dt3-sub-main" }, [
            el("span", { "class": "dt3-sub-title" }, [sg.title]),
            el("span", { "class": "dt3-sub-desc" }, [sg.description || ""])
          ]),
          el("span", { "class": "dt3-sub-count" }, [plural(sg.settings.length, "setting")]),
          icon("chev-r")
        ]));
      });
      canvas.appendChild(subs);
    }
  }

  /* ==========================================================================
     SECTION page — one inventory subgroup, full row grammar
     ========================================================================== */
  function renderSection() {
    var sg = subgroupOf(route.domain, route.section);
    canvas.appendChild(backButton(domainTitle(route.domain)));
    if (!sg) { go({ view: "domain", domain: route.domain }, { settle: true }); return; }
    canvas.appendChild(el("div", { "class": "dt3-domain-hero" }, [
      el("h1", {}, [sg.title]),
      el("p", {}, [(sg.description || "") + " " + plural(sg.settings.length, "setting") + " for " + store.currentProject().name + "."])
    ]));
    settingGroups(canvas, [{ id: sg.id, title: sg.title, desc: null, settings: sg.settings }], {
      onRow: route.row ? onceLocate('[data-setting-id="' + route.row + '"]') : null
    });
    if (route.row) {
      var target = route.row;
      route.row = null;
      // rows may be chunked — keep expanding until found
      var tries = 0;
      (function tryLocate() {
        var node = canvas.querySelector('[data-setting-id="' + target + '"]');
        if (node) { locate(node); return; }
        var more = canvas.querySelector(".dt3-hit-more");
        if (more && tries++ < 40) { more.click(); setTimeout(tryLocate, 0); }
      })();
    }
  }
  function onceLocate() { return null; }

  /* ==========================================================================
     MANAGER shell — archetype dispatch, lazy per-manager render
     ========================================================================== */
  var managerCache = {};
  function renderManager() {
    var m = R.managerById(route.manager);
    canvas.appendChild(backButton(domainTitle(route.domain)));
    if (!m) { go({ view: "domain", domain: route.domain }, { settle: true }); return; }
    var banner = scenarioBanner("manager:" + m.id);
    if (banner) canvas.appendChild(banner);

    var headSide = el("span", { "class": "dt3-mgr-head-side" });
    var overflowBtn = el("button", {
      "type": "button", "class": "pm-btn", "data-variant": "quiet", "aria-haspopup": "menu",
      "aria-label": "More actions for " + m.title,
      "on": {
        "click": function () {
          MENU.open(overflowBtn, [
            { label: "Open in All Settings", action: function () { go({ view: "all", domain: m.domain }); } },
            { label: "Back to " + domainTitle(m.domain), action: back },
            { sep: true },
            { label: "Manager family: " + m.family, disabled: true }
          ], { align: "end" });
        }
      }
    }, [icon("dots"), "More"]);
    headSide.appendChild(overflowBtn);

    canvas.appendChild(el("div", { "class": "dt3-mgr-head", "data-manager-id": m.id }, [
      el("span", { "class": "dt3-mgr-icon" }, [icon(m.icon || "wrench")]),
      el("div", {}, [
        el("h1", {}, [m.title]),
        el("p", {}, [m.summary + " Current project: " + store.currentProject().name + "."])
      ]),
      headSide
    ]));

    var subpages = m.subpages || [];
    var fromSearch = !!route.fromSearch;
    route.fromSearch = null;
    var active = route.section || slug(subpages[0] || "Overview");
    if (subpages.length && subpages.map(slug).indexOf(active) < 0) active = slug(subpages[0]);
    route.section = null;

    var content = el("div", {});
    canvas.appendChild(content);

    function paint() {
      clear(content);
      var located = false;
      function maybeLocate(sel) {
        if (located || !route.row) return;
        var node = content.querySelector(sel);
        if (node) { located = true; setTimeout(function () { locate(node); }, 0); }
      }
      if (m.id === "providers") paintProviders(content, m, active, route.object, maybeLocate);
      else if (m.archetype === "preference-document") paintPreferenceDoc(content, m, active, maybeLocate);
      else if (m.archetype === "resource-roster") paintRoster(content, m, active, route.object, maybeLocate);
      else if (m.archetype === "inventory-catalog") paintCatalog(content, m, active, maybeLocate);
      else if (m.archetype === "health-projection") paintHealth(content, m, active);
      else if (m.archetype === "transaction") paintTransaction(content, m, active);
      else paintPreferenceDoc(content, m, active, maybeLocate);
      route.row = null;
      if (!located && fromSearch && !route.object) {
        var host = content.firstElementChild || content;
        located = true;
        setTimeout(function () { locate(host); }, 0);
      }
    }

    if (subpages.length > 1) {
      var tabs = el("div", { "class": "dt3-subtabs", role: "tablist" });
      subpages.forEach(function (sp) {
        var s = slug(sp);
        var b = el("button", {
          "type": "button", "class": "dt3-subtab", role: "tab",
          "data-section-id": s, "aria-selected": s === active ? "true" : "false",
          "on": {
            "click": function () {
              active = s;
              var all = tabs.querySelectorAll(".dt3-subtab");
              for (var i = 0; i < all.length; i++) all[i].setAttribute("aria-selected", all[i] === b ? "true" : "false");
              paint();
            }
          }
        }, [sp]);
        tabs.appendChild(b);
      });
      canvas.insertBefore(tabs, content);
    }
    managerCache[m.id] = true;
    paint();
  }

  /* ---------- preference-document ---------------------------------------- */
  function prefGroups(m, active) {
    var cat = categoryOf(m.domain);
    if (!cat || !cat.subgroups.length) return [];
    var subs = cat.subgroups;
    var pages = (m.subpages || []).map(slug);
    var idx = pages.indexOf(active);
    if (idx < 0) idx = 0;
    var groups = [];
    subs.forEach(function (sg, i) {
      if (i % pages.length === idx % pages.length) {
        groups.push({ id: sg.id, title: sg.title, desc: sg.description, settings: sg.settings });
      }
    });
    if (!groups.length) groups.push({ id: subs[0].id, title: subs[0].title, desc: subs[0].description, settings: subs[0].settings });
    return groups;
  }
  function paintPreferenceDoc(container, m, active, maybeLocate) {
    var groups = prefGroups(m, active);
    // 4–8 rows per visible group inside managers; deep groups link to the section page
    var capped = groups.map(function (g) {
      return { id: g.id, title: g.title, desc: g.desc, settings: g.settings.slice(0, 7), total: g.settings.length, domain: m.domain };
    });
    capped.forEach(function (g) {
      var wrap = el("div", { "class": "dt3-group", "data-section-id": g.id });
      wrap.appendChild(el("h3", { "class": "dt3-group-h" }, [g.title]));
      if (g.desc) wrap.appendChild(el("p", { "class": "dt3-group-sub" }, [g.desc]));
      var rows = el("div", { "class": "dt3-rows" });
      g.settings.forEach(function (sid) {
        var s = settingOf(sid);
        if (s) rows.appendChild(settingRow(s));
      });
      wrap.appendChild(rows);
      if (g.total > g.settings.length) {
        wrap.appendChild(el("button", {
          "type": "button", "class": "dt3-hit-more",
          "on": { "click": function () { go({ view: "section", domain: g.domain, section: g.id }); } }
        }, ["Browse all " + g.total + " “" + g.title + "” settings"]));
      }
      container.appendChild(wrap);
    });
    if (maybeLocate) maybeLocate('[data-setting-id="' + (route.row || "") + '"]');
  }

  /* ---------- resource-roster --------------------------------------------- */
  function healthOf(o) {
    var h = (o.health || "").toLowerCase();
    if (h.indexOf("ready") >= 0 || h.indexOf("ok") >= 0 || h === "healthy") return ["ok", "Ready"];
    if (h.indexOf("fail") >= 0 || h.indexOf("error") >= 0) return ["danger", humanize(h)];
    if (h.indexOf("not-configured") >= 0 || h.indexOf("setup") >= 0) return ["unknown", "Needs setup"];
    if (h) return ["warn", humanize(h)];
    return ["unknown", "Unknown"];
  }
  function paintRoster(container, m, active, objectId, maybeLocate) {
    var ros = rosterFor(m);
    if (!ros.length) {
      container.appendChild(el("div", { "class": "pm-empty" }, [
        el("span", { "class": "pm-empty-icon" }, [icon(m.icon || "box")]),
        el("span", { "class": "pm-empty-title" }, ["Nothing here yet"]),
        el("span", { "class": "pm-empty-guidance" }, ["Items appear here once they exist for this project."])
      ]));
      return;
    }
    var selected = objectId || (ros[0] && ros[0].id);
    var listEl = el("div", { "class": "dt3-roster-list pmv2-scroll" });
    var detail = el("div", { "class": "dt3-detail" });
    function paintDetail() {
      clear(detail);
      var o = null;
      for (var i = 0; i < ros.length; i++) if (ros[i].id === selected) o = ros[i];
      if (!o) return;
      var h = healthOf(o);
      detail.appendChild(el("h3", { "style": "margin:0 0 4px;font-size:16px" }, [o.label]));
      detail.appendChild(el("p", { "class": "pm-muted", "style": "margin:0 0 12px;font-size:12.5px" }, [o.typeLabel + " · managed by " + o.managerTitle]));
      detail.appendChild(el("p", {}, [el("span", { "class": "pm-healthdot", "data-state": h[0] }, [el("span", { "class": "pm-healthdot-dot" }), h[1]])]));
      if (o.availability) detail.appendChild(el("p", { "class": "pm-faint", "style": "font-size:12.5px" }, [o.availability]));
      var kv = el("dl", { "class": "pm-kv" }, [
        el("dt", {}, ["Belongs to"]), el("dd", {}, [domainTitle(o.domain) + " / " + o.managerTitle]),
        el("dt", {}, ["Identifier"]), el("dd", { "class": "pm-mono" }, [o.id])
      ]);
      detail.appendChild(el("div", { "style": "margin-block-start:14px" }, [kv]));
      detail.appendChild(el("div", { "class": "dt3-quick", "style": "margin-block-start:16px" }, [
        el("button", {
          "type": "button", "class": "pm-btn",
          "on": { "click": function () { toast(o.label + " opened in its owning manager " + "— " + o.managerTitle + " (demo).", "info"); } }
        }, [icon("chev-r"), "Open full editor"]),
        el("button", {
          "type": "button", "class": "pm-btn", "data-variant": "quiet",
          "on": { "click": function () { toast("Health re-checked for " + o.label + " (demo).", "ok"); } }
        }, [icon("refresh"), "Re-check health"])
      ]));
      if (objectId) {
        detail.setAttribute("data-object-focus", objectId);
        setTimeout(function () { locate(detail); }, 0);
        objectId = null;
      }
    }
    ros.forEach(function (o) {
      var h = healthOf(o);
      var item = el("button", {
        "type": "button", "class": "dt3-roster-item", "data-object-id": o.id,
        "aria-selected": o.id === selected ? "true" : "false",
        "on": {
          "click": function () {
            selected = o.id;
            var all = listEl.querySelectorAll(".dt3-roster-item");
            for (var i = 0; i < all.length; i++) all[i].setAttribute("aria-selected", all[i] === item ? "true" : "false");
            paintDetail();
          }
        }
      }, [
        el("span", { "class": "dt3-roster-item-main" }, [
          el("span", { "class": "dt3-roster-item-label" }, [o.label]),
          el("span", { "class": "dt3-roster-item-sub" }, [o.typeLabel])
        ]),
        el("span", { "class": "pm-healthdot", "data-state": h[0] }, [el("span", { "class": "pm-healthdot-dot" }), h[1]])
      ]);
      listEl.appendChild(item);
    });
    container.appendChild(el("div", { "class": "dt3-roster" }, [listEl, detail]));
    paintDetail();
    if (maybeLocate) maybeLocate('[data-object-id="' + (objectId || "") + '"]');
  }

  /* ---------- inventory-catalog ------------------------------------------- */
  function paintCatalog(container, m, active, maybeLocate) {
    var ros = rosterFor(m);
    var facets = { all: true };
    var kinds = {};
    ros.forEach(function (o) {
      var k = o.availability ? "limited" : "available";
      kinds[k] = (kinds[k] || 0) + 1;
    });
    var bar = el("div", { "class": "dt3-facets" }, [el("span", { "class": "dt3-facet-h" }, ["Filter:"])]);
    var listWrap = el("div", {});
    function current() {
      if (facets.all) return ros;
      return ros.filter(function (o) { return (o.availability ? "limited" : "available") === facets.only; });
    }
    function paintList() {
      clear(listWrap);
      var rows = current();
      if (!rows.length) {
        listWrap.appendChild(el("div", { "class": "pm-empty" }, [
          el("span", { "class": "pm-empty-icon" }, [icon("search")]),
          el("span", { "class": "pm-empty-title" }, ["No items match this filter"]),
          el("span", { "class": "pm-empty-guidance" }, ["Clear the filter to see everything."])
        ]));
        return;
      }
      listWrap.appendChild(virtualList(rows, function (o) {
        return el("div", { "class": "dt3-vrow", "data-object-id": o.id, "style": "block-size:" + VROW_H + "px;box-sizing:border-box" }, [
          el("div", { "class": "dt3-vrow-main" }, [
            el("div", { "class": "dt3-vrow-label" }, [o.label]),
            el("div", { "class": "dt3-vrow-sub" }, [o.typeLabel + (o.availability ? " · " + o.availability : "")])
          ]),
          el("span", { "class": "pm-badge", "data-kind": "state", "data-state": o.availability ? "unavailable" : "default", "data-icon": true }, [o.availability ? "Limited" : "Available"])
        ]);
      }));
    }
    [["all", "All (" + ros.length + ")"], ["available", "Available (" + (kinds.available || 0) + ")"], ["limited", "Limited (" + (kinds.limited || 0) + ")"]].forEach(function (f) {
      var b = el("button", {
        "type": "button", "class": "dt3-facet", "aria-pressed": f[0] === "all" ? "true" : "false",
        "on": {
          "click": function () {
            facets = f[0] === "all" ? { all: true } : { all: false, only: f[0] };
            var all = bar.querySelectorAll(".dt3-facet");
            for (var i = 0; i < all.length; i++) all[i].setAttribute("aria-pressed", all[i] === b ? "true" : "false");
            paintList();
          }
        }
      }, [f[1]]);
      bar.appendChild(b);
    });
    container.appendChild(bar);
    container.appendChild(listWrap);
    container.appendChild(el("p", { "class": "pm-faint", "style": "font-size:12px;margin-block-start:10px" }, [
      plural(ros.length, "item") + " in this catalog. The list is windowed — only visible rows are rendered."
    ]));
    if (maybeLocate) maybeLocate('[data-object-id]');
  }

  /* ---------- health-projection ------------------------------------------- */
  function paintHealth(container, m) {
    var proj = store.projection("manager:" + m.id);
    var panels = [];
    if (m.id === "doctor") {
      panels = [
        ["Environment", "ok", "Node, Python, and Git are present and on PATH. Last full check 2026-08-17 22:04."],
        ["Provider connectivity", "warn", "OpenAI invocations are failing (capability probe timed out). 8 of 9 routes healthy."],
        ["Storage pressure", "ok", "Caches at 41% of the shared ceiling. The governor has not shed anything today."],
        ["Repairs available", "info", "2 guided repairs ready: re-verify the Mistral CLI adapter, reconnect the forge."]
      ];
    } else if (m.id === "search-index") {
      panels = [
        ["Index status", "ok", "Project index is current. 4,812 files, 38 excluded by policy."],
        ["Last refresh", "info", "Incremental refresh finished 2026-08-18 09:12 in 1.8 s."],
        ["Inclusion rules", "ok", "Respects .gitignore plus 3 project exclusion rules."],
        ["Freshness policy", "info", "Watches the filesystem; full rebuild weekly or on demand."]
      ];
    } else {
      panels = [
        ["Owned components", "ok", "Every rendered surface in this concept has exactly one owner."],
        ["Shared headless modules", "info", "Inventory, search, store, and copy engines are shared headless data — no second owner created by this concept."],
        ["Concept presentation", "ok", "Directory Take 3 presentation is native to this concept."],
        ["State", "info", "Reuse state is exposed read-only here; ownership changes happen in Plans, not in Settings."]
      ];
    }
    var grid = el("div", { "class": "dt3-health-grid" });
    panels.forEach(function (p) {
      grid.appendChild(el("div", { "class": "dt3-health" }, [
        el("h3", {}, [el("span", { "class": "pm-healthdot", "data-state": p[1] }, [el("span", { "class": "pm-healthdot-dot" }), p[0]])]),
        el("p", {}, [p[2]])
      ]));
    });
    if (proj && proj.message) container.appendChild(el("div", { "class": "dt3-copy-note" }, [proj.message]));
    container.appendChild(grid);
    container.appendChild(el("p", { "class": "pm-faint", "style": "font-size:12px;margin-block-start:12px" }, [
      "Read-only projection. Repairs and changes start from the actions inside each panel's owning manager."
    ]));
  }

  /* ---------- transaction (Backup / Lifecycle / Cleanup) ------------------- */
  function paintTransaction(container, m, active) {
    if (m.id === "backup") paintBackup(container);
    else if (m.id === "lifecycle") paintLifecycle(container, active);
    else paintCleanup(container);
  }
  function opPhases(op) {
    var wrap = el("div", { "class": "dt3-op-phases" });
    (op.phases || []).forEach(function (ph, i) {
      var st = ph.status === "done" ? "done" : (i === op.phaseIndex && op.state === "running") ? "active" : "pending";
      wrap.appendChild(el("div", { "class": "dt3-op-phase", "data-state": st }, [
        icon(st === "done" ? "check" : st === "active" ? "activity" : "clock"),
        ph.name + (st === "done" ? " — done" : st === "active" ? " — running" : "")
      ]));
    });
    return wrap;
  }
  function runOp(spec, panel, doneMsg) {
    var op = store.begin(spec);
    clear(panel);
    panel.appendChild(opPhases(op));
    var timer = setInterval(function () {
      var cur = store.operation(op.id);
      if (!cur) { clearInterval(timer); return; }
      if (cur.state !== "running") {
        clearInterval(timer);
        clear(panel);
        panel.appendChild(opPhases(cur));
        toast(cur.state === "done" ? doneMsg : spec.title + " ended: " + cur.state + (cur.reason ? " — " + cur.reason : ""), cur.state === "done" ? "ok" : "warn");
        return;
      }
      store.completePhase(op.id);
      store.advance(op.id, 1);
      clear(panel);
      panel.appendChild(opPhases(store.operation(op.id)));
    }, 350);
  }
  function paintBackup(container) {
    var panel = el("div", { "class": "dt3-copy-panel" });
    container.appendChild(el("div", { "class": "dt3-steps" }, [
      stepNode(1, "Preview", "done"), stepLink(), stepNode(2, "Snapshot", "active"), stepLink(), stepNode(3, "Verify", "pending")
    ]));
    panel.appendChild(el("h3", { "style": "margin:0 0 6px;font-size:15px" }, ["Restore points for this project"]));
    var pts = store.restorePoints();
    if (!pts.length) panel.appendChild(el("p", { "class": "pm-muted" }, ["No restore points yet. The first snapshot is created before any destructive action runs."]));
    else {
      var rows = el("div", { "class": "dt3-rows", "style": "margin-block:10px" });
      pts.slice(-4).forEach(function (p) {
        rows.appendChild(el("div", { "class": "pm-row" }, [
          el("div", { "class": "pm-row-main" }, [
            el("span", { "class": "pm-row-label" }, [p.label]),
            el("span", { "class": "pm-row-desc" }, ["Created " + p.at])
          ])
        ]));
      });
      panel.appendChild(rows);
    }
    var opPanel = el("div", {});
    panel.appendChild(opPanel);
    panel.appendChild(el("div", { "class": "dt3-copy-actions" }, [
      el("button", {
        "type": "button", "class": "pm-btn", "data-variant": "primary",
        "on": {
          "click": function () {
            store.createRestorePoint("Manual snapshot", { settings: Object.keys(store.overrides()).length });
            runOp({ kind: "backup", title: "Project backup", determinate: true, total: 3, phases: [{ name: "Snapshot settings" }, { name: "Write archive" }, { name: "Verify archive" }] }, opPanel, "Backup verified and stored.");
          }
        }
      }, [icon("safe"), "Create restore point"])
    ]));
    container.appendChild(panel);
  }
  function paintLifecycle(container, active) {
    var panel = el("div", { "class": "dt3-copy-panel" });
    container.appendChild(el("div", { "class": "dt3-steps" }, [
      stepNode(1, "Preview", "done"), stepLink(), stepNode(2, "Confirm", "active"), stepLink(), stepNode(3, "Receipt", "pending")
    ]));
    panel.appendChild(el("h3", { "style": "margin:0 0 6px;font-size:15px" }, ["Settings lifecycle — " + humanize(active)]));
    panel.appendChild(el("p", { "class": "pm-muted" }, [
      "Every lifecycle action previews exactly what changes, snapshots first, applies atomically, and leaves a receipt. Nothing syncs anywhere."
    ]));
    var opPanel = el("div", {});
    panel.appendChild(opPanel);
    panel.appendChild(el("div", { "class": "dt3-copy-actions" }, [
      el("button", {
        "type": "button", "class": "pm-btn",
        "on": {
          "click": function () {
            runOp({ kind: "export", title: "Export settings", determinate: true, total: 2, phases: [{ name: "Collect project settings" }, { name: "Write export file" }] }, opPanel, "Export written to the project folder (demo).");
          }
        }
      }, [icon("download"), "Export…"]),
      el("button", {
        "type": "button", "class": "pm-btn", "data-variant": "danger",
        "on": {
          "click": function () {
            store.createRestorePoint("Pre-reset snapshot", { settings: Object.keys(store.overrides()).length });
            runOp({ kind: "reset", title: "Reset settings", determinate: true, total: 4, phases: [{ name: "Preview changes" }, { name: "Snapshot" }, { name: "Apply defaults" }, { name: "Verify" }] }, opPanel, "Settings reset to defaults. The pre-reset snapshot can roll this back.");
          }
        }
      }, [icon("warn"), "Review reset…"])
    ]));
    var receipts = store.receipts();
    if (receipts.length) {
      panel.appendChild(el("h4", { "style": "margin:16px 0 6px" }, ["Recent receipts"]));
      receipts.slice(-3).forEach(function (r) {
        panel.appendChild(el("div", { "class": "dt3-copy-note" }, [(r.title || r.kind || "Operation") + " — " + (r.at || "") + (r.summary ? ". " + r.summary : "")]));
      });
    }
    container.appendChild(panel);
  }
  function paintCleanup(container) {
    var panel = el("div", { "class": "dt3-copy-panel" });
    panel.appendChild(el("h3", { "style": "margin:0 0 6px;font-size:15px" }, ["Workspace cleanup"]));
    panel.appendChild(el("p", { "class": "pm-muted" }, ["A dry run lists exactly what would be removed before anything is deleted."]));
    var opPanel = el("div", {});
    panel.appendChild(opPanel);
    panel.appendChild(el("div", { "class": "dt3-copy-actions" }, [
      el("button", {
        "type": "button", "class": "pm-btn", "data-variant": "primary",
        "on": {
          "click": function () {
            runOp({ kind: "cleanup", title: "Cleanup dry run", determinate: true, total: 3, phases: [{ name: "Scan caches" }, { name: "Scan orphaned outputs" }, { name: "Build removal plan" }] }, opPanel, "Dry run complete — 214 MB reclaimable across 3 caches (demo). Nothing was deleted.");
          }
        }
      }, [icon("broom"), "Run dry run"])
    ]));
    container.appendChild(panel);
  }
  function stepNode(n, label, state) {
    return el("span", { "class": "dt3-step", "data-state": state }, [el("span", { "class": "dt3-step-num" }, [String(n)]), label]);
  }
  function stepLink() { return el("span", { "class": "dt3-step-link" }); }

  /* ==========================================================================
     PROVIDERS manager — summary status cards, quick actions, install, logs
     ========================================================================== */
  function providerFixture(id) {
    for (var i = 0; i < D.providers.length; i++) if (D.providers[i].id === id) return D.providers[i];
    return null;
  }
  function providerStatus(p) {
    if (p.installState === "not-installed") return ["unknown", "Not installed"];
    if (p.installState === "installed-signed-out") return ["warn", "Signed out"];
    var active = null;
    for (var i = 0; i < p.accounts.length; i++) if (p.accounts[i].active) active = p.accounts[i];
    var a = active || p.accounts[0];
    if (a && a.health === "ready") return ["ok", "Ready"];
    if (a && a.health === "not-configured") return ["unknown", "Needs setup"];
    if (a && a.health) return ["warn", humanize(a.health)];
    return p.accounts.length ? ["info", "Configured"] : ["unknown", "Needs setup"];
  }
  function defaultModelOf(p) {
    var best = null;
    (p.models || []).forEach(function (md) {
      if (md.hidden) return;
      if (!best || (md.favorite && !best.favorite) || (md.priority || 99) < (best.priority || 99)) best = md;
    });
    return best ? best.name : "—";
  }
  function lastUsedOf(p) {
    if (p.usageSnapshot && p.usageSnapshot.lastSuccessfulUse) return p.usageSnapshot.lastSuccessfulUse;
    var latest = null;
    (p.accounts || []).forEach(function (a) {
      if (a.lastSuccessfulGeneration && a.lastSuccessfulGeneration !== "Never") {
        if (!latest || a.lastSuccessfulGeneration > latest) latest = a.lastSuccessfulGeneration;
      }
    });
    return latest || "Never";
  }
  function statCard(h, v, sub) {
    return el("div", { "class": "dt3-stat" }, [
      el("div", { "class": "dt3-stat-h" }, [h]),
      el("div", { "class": "dt3-stat-v" }, [v]),
      sub ? el("div", { "class": "dt3-stat-sub" }, [sub]) : null
    ]);
  }

  function paintProviders(container, m, active, objectId, maybeLocate) {
    var ros = rosterFor(m);
    var selected = objectId || (ros[0] && ros[0].id);
    var listEl = el("div", { "class": "dt3-roster-list pmv2-scroll" });
    var detail = el("div", { "class": "dt3-detail", "data-section-id": active });

    function paintProviderDetail() {
      clear(detail);
      var p = providerFixture(selected);
      if (!p) return;
      detail.setAttribute("data-object-id", p.id);
      var st = providerStatus(p);
      detail.appendChild(el("div", { "class": "dt3-prov-head" }, [
        el("h3", {}, [p.name]),
        el("span", { "class": "dt3-status-chip", "data-state": st[0] }, [
          el("span", { "class": "pm-healthdot", "data-state": st[0] }, [el("span", { "class": "pm-healthdot-dot" }), st[1]])
        ])
      ]));
      detail.appendChild(el("p", { "class": "pm-muted", "style": "margin:0 0 14px;font-size:12.5px" }, [p.tagline || humanize(p.connectionGroup)]));

      if (active === "models") { paintProviderModels(detail, p); return; }
      if (active === "credentials") { paintProviderCredentials(detail, p); return; }
      if (active === "usage" || active === "rate-limits") { paintProviderUsage(detail, p); return; }
      if (active === "installation") { paintProviderInstall(detail, p); return; }
      if (active === "logs") { paintProviderLogs(detail, p); return; }
      if (active === "help") {
        detail.appendChild(el("div", { "class": "dt3-copy-note" }, [
          "Credentials are owned by each provider's own sign-in. Puppet Master stores only what the provider's auth model requires, inside the PM credential vault or the provider's own isolated CLI profile — raw secrets never appear in Settings."
        ]));
        return;
      }

      /* Overview: big DEFAULT-MODEL identity, then a quiet stat grid */
      detail.appendChild(el("div", { "class": "dt3-model-hero" }, [
        el("div", { "class": "dt3-model-hero-h" }, ["Default model"]),
        el("div", { "class": "dt3-model-hero-v" }, [defaultModelOf(p)]),
        el("div", { "class": "dt3-model-hero-sub" }, [
          plural((p.models || []).length, "model") + " in catalog" + (p.catalog ? " · catalog " + p.catalog.version + ", checked " + p.catalog.lastChecked : "")
        ])
      ]));
      var grid = el("div", { "class": "dt3-stat-grid" });
      grid.appendChild(statCard("Install", p.installState === "not-applicable" ? "Not needed" : humanize(p.installState), p.installState === "not-applicable" ? "Connects directly, no local install" : null));
      grid.appendChild(statCard("Last used", lastUsedOf(p), null));
      if (p.usageSnapshot) {
        grid.appendChild(statCard("Allowance remaining", p.usageSnapshot.includedRemaining, "Resets " + p.usageSnapshot.resetsAt));
        grid.appendChild(statCard("Extra balance", p.usageSnapshot.extraBalance, "Pressure: " + humanize(p.usageSnapshot.pressure)));
        grid.appendChild(statCard("Projection", "On file", p.usageSnapshot.projection));
      } else {
        grid.appendChild(statCard("Usage", "Not reported", p.usageNote || "This route does not report balances."));
      }
      detail.appendChild(grid);

      /* explicit QUICK ACTIONS — one primary, the rest quiet */
      detail.appendChild(el("div", { "class": "dt3-quick" }, [
        quickAction("View Models", "list", function () { switchTab("models"); }, "primary"),
        quickAction("Manage Credentials", "key", function () { switchTab("credentials"); }, "quiet"),
        quickAction("View Usage", "activity", function () { switchTab("usage"); }, "quiet")
      ]));

      if (p.updateState && p.updateState.state === "update-available") {
        detail.appendChild(el("div", { "class": "dt3-copy-note" }, [
          "Update available: version " + p.updateState.availableVersion + ". " + (p.updateState.note || "") + " Install it from the Installation tab."
        ]));
      }
      detail.appendChild(el("div", { "class": "dt3-copy-note" }, [p.authNote || ""]));
      if (p.accountSwitchNote) detail.appendChild(el("p", { "class": "pm-faint", "style": "font-size:12px" }, [p.accountSwitchNote]));
    }

    function switchTab(slugName) {
      var tabs = canvas.querySelectorAll(".dt3-subtab");
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].getAttribute("data-section-id") === slugName) { tabs[i].click(); return; }
      }
    }
    function quickAction(label, ic, fn, variant) {
      return el("button", { "type": "button", "class": "pm-btn", "data-variant": variant || false, "on": { "click": fn } }, [icon(ic), label]);
    }

    ros.forEach(function (o) {
      var p = providerFixture(o.id);
      var st = p ? providerStatus(p) : ["unknown", "Unknown"];
      var item = el("button", {
        "type": "button", "class": "dt3-roster-item", "data-object-id": o.id,
        "aria-selected": o.id === selected ? "true" : "false",
        "on": {
          "click": function () {
            selected = o.id;
            var all = listEl.querySelectorAll(".dt3-roster-item");
            for (var i = 0; i < all.length; i++) all[i].setAttribute("aria-selected", all[i] === item ? "true" : "false");
            paintProviderDetail();
          }
        }
      }, [
        el("span", { "class": "dt3-roster-item-main" }, [
          el("span", { "class": "dt3-roster-item-label" }, [o.label]),
          el("span", { "class": "dt3-roster-item-sub" }, [p ? humanize(p.connectionGroup) : o.typeLabel])
        ]),
        el("span", { "class": "pm-healthdot", "data-state": st[0] }, [el("span", { "class": "pm-healthdot-dot" }), st[1]])
      ]);
      listEl.appendChild(item);
    });

    container.appendChild(el("div", { "class": "dt3-roster" }, [listEl, detail]));
    paintProviderDetail();
    if (objectId) {
      var sel = '[data-object-id="' + objectId + '"]';
      var node = container.querySelector(".dt3-roster-item" + sel);
      route.object = null;
      if (node) setTimeout(function () { locate(node); }, 0);
    }
    if (maybeLocate && active === "credentials") {
      setTimeout(function () {
        var cred = detail.querySelector(".dt3-cred");
        if (cred) locate(cred);
      }, 0);
    }
  }

  function paintProviderModels(detail, p) {
    if (!p.models || !p.models.length) {
      detail.appendChild(el("p", { "class": "pm-muted" }, ["No models are visible yet. " + (p.usageNote || "Finish setup to load the catalog.")]));
      return;
    }
    var table = el("table", { "class": "pm-table" }, [
      el("thead", {}, [el("tr", {}, [el("th", {}, ["Model"]), el("th", {}, ["Context"]), el("th", {}, ["Tools"]), el("th", {}, ["Vision"]), el("th", {}, ["Effort"])])]),
      (function () {
        var tb = el("tbody", {});
        p.models.forEach(function (md) {
          tb.appendChild(el("tr", {}, [
            el("td", {}, [md.name + (md.favorite ? " (default)" : "") + (md.hidden ? " — hidden" : "")]),
            el("td", {}, [md.contextLimit ? Math.round(md.contextLimit / 1000) + "k" : "—"]),
            el("td", {}, [md.capabilities && md.capabilities.tools ? humanize(md.capabilities.tools.state) : "—"]),
            el("td", {}, [md.capabilities && md.capabilities.vision ? humanize(md.capabilities.vision.state) : "—"]),
            el("td", {}, [md.effortSelected ? humanize(md.effortSelected) : "—"])
          ]));
        });
        return tb;
      })()
    ]);
    detail.appendChild(table);
    detail.appendChild(el("p", { "class": "pm-faint", "style": "font-size:12px;margin-block-start:10px" }, [
      "Catalog source: " + (p.catalog ? p.catalog.source : "—") + " · version " + (p.catalog ? p.catalog.version : "—") +
      (p.catalog && p.catalog.lastKnownGood ? " · last-known-good kept on refresh failure." : ".")
    ]));
  }

  function paintProviderCredentials(detail, p) {
    if (!p.accounts || !p.accounts.length) {
      detail.appendChild(el("div", { "class": "dt3-cred", "data-section-id": "credentials" }, [
        el("div", { "class": "dt3-cred-head" }, [el("h4", {}, ["No credentials yet"])]),
        el("p", { "class": "dt3-cred-note" }, [p.authNote || "Set up sign-in from the Installation tab."])
      ]));
      return;
    }
    p.accounts.forEach(function (a, i) {
      var card = el("div", { "class": "dt3-cred", "data-section-id": "credentials", "data-object-id": p.id + ":" + a.id });
      card.appendChild(el("div", { "class": "dt3-cred-head" }, [
        el("h4", {}, [a.label]),
        el("span", { "class": "pm-badge", "data-kind": "state", "data-state": a.health === "ready" ? "default" : a.health === "not-configured" ? "not-configured" : "effective-differs", "data-icon": true }, [a.health === "ready" ? "Ready" : humanize(a.health || "Unknown")]),
        a.active ? el("span", { "class": "pm-badge", "data-kind": "state", "data-state": "custom" }, ["Active"]) : null
      ]));
      card.appendChild(el("p", { "class": "dt3-cred-note" }, [a.authSource + " · " + a.isolationLabel]));
      card.appendChild(el("div", { "class": "dt3-cred-field", "data-credential": p.id + ":" + a.id }, [
        icon("key"), a.identity
      ]));
      if (a.requiresSetup && a.setupNote) card.appendChild(el("p", { "class": "dt3-cred-note", "style": "margin-block-start:10px" }, [a.setupNote]));
      card.appendChild(el("div", { "class": "dt3-quick", "style": "margin-block-start:12px;margin-block-end:0" }, [
        el("button", {
          "type": "button", "class": "pm-btn", "data-variant": "quiet",
          "on": { "click": function () { toast("Sign-in flow for " + a.label + " launches the provider's own auth (demo).", "info"); } }
        }, [a.health === "ready" ? "Re-verify sign-in" : "Set up sign-in"]),
        el("button", {
          "type": "button", "class": "pm-btn", "data-variant": "quiet",
          "on": { "click": function () { toast(a.label + (a.enabled ? " disabled for future requests." : " enabled.") + " (demo)", "ok"); } }
        }, [a.enabled ? "Disable" : "Enable"])
      ]));
      detail.appendChild(card);
    });
    detail.appendChild(el("p", { "class": "pm-faint", "style": "font-size:12px" }, [
      "Identities are masked. Puppet Master never displays raw secrets; each credential lives where its auth model keeps it."
    ]));
  }

  function paintProviderUsage(detail, p) {
    if (!p.usageSnapshot) {
      detail.appendChild(el("div", { "class": "dt3-copy-note" }, [p.usageNote || "Usage is not reported by this route."]));
      return;
    }
    var u = p.usageSnapshot;
    detail.appendChild(el("dl", { "class": "pm-kv" }, [
      el("dt", {}, ["Included remaining"]), el("dd", {}, [u.includedRemaining + " · resets " + u.resetsAt]),
      el("dt", {}, ["Extra balance"]), el("dd", {}, [u.extraBalance]),
      el("dt", {}, ["Pressure"]), el("dd", {}, [humanize(u.pressure)]),
      el("dt", {}, ["Last successful use"]), el("dd", {}, [u.lastSuccessfulUse]),
      el("dt", {}, ["Projection"]), el("dd", {}, [u.projection]),
      el("dt", {}, ["Freshness"]), el("dd", {}, [u.sourceFreshness])
    ]));
    if (u.whatNext) {
      detail.appendChild(el("h4", { "style": "margin:14px 0 6px" }, ["When the allowance runs out"]));
      var seg = el("span", { "class": "pm-seg", role: "radiogroup", "aria-label": "Usage-end behavior" });
      u.whatNext.options.forEach(function (opt) {
        var b = el("button", { "type": "button", role: "radio", "aria-checked": opt === u.whatNext.selected ? "true" : "false" }, [humanize(opt)]);
        b.addEventListener("click", function () {
          var all = seg.querySelectorAll('[role="radio"]');
          for (var i = 0; i < all.length; i++) all[i].setAttribute("aria-checked", "false");
          b.setAttribute("aria-checked", "true");
          u.whatNext.selected = opt;
          toast("Usage-end behavior for " + p.name + ": " + humanize(opt) + " (demo).", "ok");
        });
        seg.appendChild(b);
      });
      detail.appendChild(seg);
    }
  }

  function paintProviderInstall(detail, p) {
    var insts = p.installations || [];
    if (!insts.length) {
      detail.appendChild(el("p", { "class": "pm-muted" }, [p.installState === "not-applicable"
        ? "This provider needs no local installation — it connects directly."
        : "No installation detected on This PC."]));
    } else {
      var rows = el("div", { "class": "dt3-rows", "style": "margin-block-end:14px" });
      insts.forEach(function (inst) {
        rows.appendChild(el("div", { "class": "pm-row", "data-installation": inst.id }, [
          el("div", { "class": "pm-row-main" }, [
            el("span", { "class": "pm-row-label" }, [inst.label + " ", el("span", { "class": "pm-badge", "data-kind": "state", "data-state": inst.selected ? "custom" : inst.shadowed ? "unavailable" : "default", "data-icon": true }, [inst.selected ? "Selected" : inst.shadowed ? "Shadowed" : humanize(inst.confidence || "found")])]),
            el("span", { "class": "pm-row-desc" }, [inst.methodLabel + " · " + inst.host + " · " + inst.environment + " · version " + inst.version]),
            el("span", { "class": "pm-row-src" }, [inst.command])
          ])
        ]));
      });
      detail.appendChild(rows);
    }

    if (p.updateState && p.updateState.state === "update-available") {
      detail.appendChild(el("div", { "class": "dt3-copy-note" }, [
        "Update available: " + p.updateState.availableVersion + " — " + (p.updateState.note || "") + " Policy: " + (p.updatePolicy ? p.updatePolicy.install : "Ask first") + "."
      ]));
    }

    /* Explicit, official-source install / set up — never bundled or pre-seeded */
    var official = p.installState === "not-installed" ? "Install from the official source"
      : p.installState === "installed-signed-out" ? "Set up sign-in"
      : null;
    var opPanel = el("div", {});
    detail.appendChild(opPanel);
    var actions = el("div", { "class": "dt3-quick" });
    if (official) {
      actions.appendChild(el("button", {
        "type": "button", "class": "pm-btn", "data-variant": "primary",
        "on": {
          "click": function () {
            runOp({
              kind: "provider-install", title: official + " — " + p.name, determinate: true, total: 3,
              phases: [{ name: "Open the official source" }, { name: "Verify what was installed" }, { name: "Connect to Puppet Master" }]
            }, opPanel, official + " finished for " + p.name + " (demo).");
          }
        }
      }, [icon("download"), official + "…"]));
    }
    if (p.updateState && p.updateState.state === "update-available") {
      actions.appendChild(el("button", {
        "type": "button", "class": "pm-btn",
        "on": {
          "click": function () {
            runOp({
              kind: "provider-update", title: "Update " + p.name, determinate: true, total: 2,
              phases: [{ name: "Download from the official source" }, { name: "Verify and switch" }]
            }, opPanel, p.name + " updated to " + p.updateState.availableVersion + " (demo).");
          }
        }
      }, [icon("refresh"), "Update to " + p.updateState.availableVersion]));
    }
    actions.appendChild(el("button", {
      "type": "button", "class": "pm-btn", "data-variant": "quiet",
      "on": {
        "click": function () {
          runOp({
            kind: "provider-repair", title: "Repair " + p.name + " installation", determinate: true, total: 2,
            phases: [{ name: "Re-verify executable" }, { name: "Re-register with Puppet Master" }]
          }, opPanel, "Repair finished for " + p.name + " (demo).");
        }
      }
    }, [icon("wrench"), "Repair installation"]));
    detail.appendChild(actions);
    var srcLine = "Installs and sign-ins always come from the provider's official source — the " + (p.installState === "not-applicable" ? "provider's own site" : "vendor's published package or releases page") + ". Puppet Master never bundles or pre-seeds provider tools.";
    var diagSrc = null;
    (p.diagnostics || []).forEach(function (line) { if (!diagSrc && line.toLowerCase().indexOf("official source") >= 0) diagSrc = line; });
    detail.appendChild(el("p", { "class": "pm-faint", "style": "font-size:12px;margin-block-start:10px" }, [diagSrc ? diagSrc + ". " + srcLine : srcLine]));
  }

  function paintProviderLogs(detail, p) {
    var lines = p.diagnostics || [];
    if (!lines.length) { detail.appendChild(el("p", { "class": "pm-muted" }, ["No diagnostics recorded yet."])); return; }
    var rows = el("div", { "class": "dt3-rows" });
    lines.forEach(function (line) {
      rows.appendChild(el("div", { "class": "pm-row" }, [
        el("div", { "class": "pm-row-main" }, [el("span", { "class": "pm-row-desc pm-mono", "style": "font-size:12px" }, [line])])
      ]));
    });
    detail.appendChild(rows);
    detail.appendChild(el("p", { "class": "pm-faint", "style": "font-size:12px;margin-block-start:10px" }, ["Diagnostic log for " + p.name + " — newest last."]));
  }

  /* ==========================================================================
     ALL SETTINGS — faceted, virtualized compendium of all 828 rows
     ========================================================================== */
  var allFacets = { domain: null, exposure: null, state: null, type: null, text: "" };
  function renderAll() {
    canvas.setAttribute("data-wide", "true");
    canvas.appendChild(backButton("Home"));
    canvas.appendChild(el("div", { "class": "dt3-domain-hero" }, [
      el("h1", {}, ["All Settings"]),
      el("p", {}, ["The complete compendium — " + plural(I.meta.settingsCount, "setting") + " for " + store.currentProject().name + ". Facet, filter, or open any row in place."])
    ]));
    if (route.query) { allFacets.text = route.query; route.query = null; }
    if (route.domain) { allFacets.domain = route.domain; route.domain = null; }

    var facetWrap = el("div", {});
    canvas.appendChild(facetWrap);
    var listWrap = el("div", {});
    canvas.appendChild(listWrap);

    function allRows() {
      var out = [];
      var ids = Object.keys(I.settings);
      for (var i = 0; i < ids.length; i++) {
        var s = I.settings[ids[i]];
        if (allFacets.domain && s.domain !== allFacets.domain) continue;
        if (allFacets.exposure && s.exposure !== allFacets.exposure) continue;
        if (allFacets.state && s.state !== allFacets.state) continue;
        if (allFacets.type && s.type !== allFacets.type) continue;
        if (allFacets.text) {
          var t = allFacets.text.toLowerCase();
          var hay = (s.label + " " + (s.desc || "") + " " + (s.search || []).join(" ")).toLowerCase();
          if (hay.indexOf(t) < 0) continue;
        }
        out.push(s);
      }
      return out;
    }

    function facetRow(label, values, key) {
      var row = el("div", { "class": "dt3-facets" }, [el("span", { "class": "dt3-facet-h" }, [label + ":"])]);
      values.forEach(function (v) {
        var on = allFacets[key] === v;
        var b = el("button", {
          "type": "button", "class": "dt3-facet", "aria-pressed": on ? "true" : "false",
          "on": {
            "click": function () {
              allFacets[key] = on ? null : v;
              paintAll();
            }
          }
        }, [v === null ? "All" : humanize(v)]);
        row.appendChild(b);
      });
      return row;
    }

    function paintAll() {
      clear(facetWrap);
      clear(listWrap);
      var filter = el("div", { "class": "dt3-search-box", "style": "max-inline-size:420px;margin-block-end:12px" }, [
        icon("search"),
        (function () {
          var inp = el("input", { "type": "text", "placeholder": "Filter within the compendium…", "aria-label": "Filter all settings", "value": allFacets.text });
          inp.addEventListener("input", function () { allFacets.text = inp.value; paintListOnly(); });
          return inp;
        })()
      ]);
      facetWrap.appendChild(filter);
      facetWrap.appendChild(facetRow("Area", R.DOMAINS.map(function (d) { return d.id; }), "domain"));
      facetWrap.appendChild(facetRow("Exposure", ["standard", "advanced", "expert", "managed", "diagnostic", "unavailable"], "exposure"));
      facetWrap.appendChild(facetRow("State", ["default", "custom", "recommended", "managed", "unavailable"], "state"));
      facetWrap.appendChild(facetRow("Control", ["toggle", "select", "segmented", "slider", "number", "text", "action"], "type"));
      paintListOnly();
    }

    function paintListOnly() {
      clear(listWrap);
      var rows = allRows();
      listWrap.appendChild(el("p", { "class": "pm-faint", "style": "font-size:12px;margin-block:4px 8px" }, [
        plural(rows.length, "setting") + " shown" + (rows.length !== I.meta.settingsCount ? " of " + I.meta.settingsCount : "") + ". Windowed rendering — only visible rows exist in the page."
      ]));
      if (!rows.length) {
        listWrap.appendChild(el("div", { "class": "pm-empty" }, [
          el("span", { "class": "pm-empty-icon" }, [icon("search")]),
          el("span", { "class": "pm-empty-title" }, ["No settings match these facets"]),
          el("span", { "class": "pm-empty-guidance" }, ["Loosen a facet or clear the filter text."])
        ]));
        return;
      }
      listWrap.appendChild(virtualList(rows, function (s) {
        var row = el("button", {
          "type": "button", "class": "dt3-vrow", "data-setting-id": s.id,
          "style": "inline-size:100%;border-inline:0;background:transparent;font:inherit;color:inherit;text-align:start;cursor:pointer;block-size:" + VROW_H + "px;box-sizing:border-box",
          "on": { "click": function () { go({ view: "section", domain: s.domain, section: s.subgroup, row: s.id }); } }
        }, [
          el("div", { "class": "dt3-vrow-main" }, [
            el("div", { "class": "dt3-vrow-label" }, [s.label]),
            el("div", { "class": "dt3-vrow-sub" }, [domainTitle(s.domain) + " / " + (subgroupOf(s.domain, s.subgroup) || { title: s.subgroup }).title + " · " + humanize(s.type)])
          ]),
          el("span", { "class": "pm-badge", "data-kind": "state", "data-state": s.state || "default", "data-icon": true }, [humanize(s.state || "default")]),
          icon("chev-r")
        ]);
        return row;
      }));
    }

    paintAll();
    if (route.row) {
      var target = route.row;
      route.row = null;
      setTimeout(function () {
        var node = listWrap.querySelector('[data-setting-id="' + target + '"]');
        if (node) locate(node);
      }, 30);
    }
  }

  /* ==========================================================================
     COPY SETTINGS — full-width stepped flow:
     Select Source → Choose Categories → Review & Confirm → receipt
     ========================================================================== */
  var copyEngine = null;
  var copyStep = 1;
  var copyPicked = [];
  var copyOp = null;
  function renderCopy() {
    canvas.setAttribute("data-wide", "true");
    canvas.appendChild(backButton("Home"));
    canvas.appendChild(el("div", { "class": "dt3-domain-hero" }, [
      el("h1", {}, ["Copy Settings from Another Project"]),
      el("p", {}, ["A one-time transaction: preview, restore point, atomic apply, verify, receipt — with rollback. Credentials are re-pointed, never copied raw. Nothing keeps syncing afterward."])
    ]));
    if (!copyEngine) { copyEngine = new CP.CopyEngine(store, I, R); copyStep = 1; copyPicked = []; copyOp = null; }

    canvas.appendChild(el("div", { "class": "dt3-steps" }, [
      stepNode(1, "Select Source", copyStep > 1 ? "done" : "active"), stepLink(),
      stepNode(2, "Choose Categories", copyStep > 2 ? "done" : copyStep === 2 ? "active" : "pending"), stepLink(),
      stepNode(3, "Review & Confirm", copyStep > 3 ? "done" : copyStep === 3 ? "active" : "pending")
    ]));
    var panel = el("div", { "class": "dt3-copy-panel" });
    canvas.appendChild(panel);

    if (copyStep === 1) paintCopySource(panel);
    else if (copyStep === 2) paintCopyCategories(panel);
    else if (copyStep === 3) paintCopyReview(panel);
    else paintCopyReceipt(panel);
  }

  function paintCopySource(panel) {
    panel.appendChild(el("h3", { "style": "margin:0 0 4px;font-size:15px" }, ["Select the source project"]));
    panel.appendChild(el("p", { "class": "pm-muted" }, ["Settings are read from the source and applied to " + store.currentProject().name + ". The source is never modified."]));
    var sources = copyEngine.sources();
    var list = el("div", { "class": "dt3-src-list" });
    sources.forEach(function (src) {
      list.appendChild(el("button", {
        "type": "button", "class": "dt3-src", "data-source-id": src.id,
        "on": {
          "click": function () {
            copyEngine.selectSource(src.id);
            copyStep = 2;
            clear(canvas); renderCopy();
          }
        }
      }, [
        el("span", { "class": "dt3-mgr-icon" }, [icon("folder")]),
        el("span", { "class": "dt3-src-main" }, [
          el("span", { "class": "dt3-src-name" }, [src.name]),
          el("span", { "class": "dt3-src-sub" }, [src.path + (src.settings ? " · " + plural(src.settings, "customized setting") : "")])
        ]),
        el("span", { "class": "dt3-mgr-chev" }, [icon("chev-r")])
      ]));
    });
    panel.appendChild(list);
  }

  function paintCopyCategories(panel) {
    panel.appendChild(el("h3", { "style": "margin:0 0 4px;font-size:15px" }, ["Choose what to copy"]));
    panel.appendChild(el("p", { "class": "pm-muted" }, ["Whole categories, nothing partial behind your back. Uncheck anything you want to keep as-is."]));
    if (!copyPicked.length) copyPicked = R.COPY_CATEGORIES.map(function (c) { return c.id; });
    var list = el("div", { "class": "dt3-cat-list" });
    var reviewBtn = null;
    R.COPY_CATEGORIES.forEach(function (c) {
      var on = copyPicked.indexOf(c.id) >= 0;
      var b = el("button", {
        "type": "button", "class": "dt3-cat", "aria-pressed": on ? "true" : "false", "data-category-id": c.id,
        "on": {
          "click": function () {
            var at = copyPicked.indexOf(c.id);
            if (at >= 0) copyPicked.splice(at, 1); else copyPicked.push(c.id);
            b.setAttribute("aria-pressed", at >= 0 ? "false" : "true");
            if (reviewBtn) {
              reviewBtn.textContent = "Review " + plural(copyPicked.length, "category", "categories");
              if (copyPicked.length === 0) reviewBtn.setAttribute("disabled", ""); else reviewBtn.removeAttribute("disabled");
            }
          }
        }
      }, [
        el("span", { "class": "dt3-cat-check" }, [icon("check")]),
        el("span", { "class": "dt3-cat-title" }, [c.title]),
        el("span", { "class": "dt3-cat-note" }, [c.note]),
        el("span", { "class": "dt3-cat-count" }, [plural(c.domains.length, "domain")])
      ]);
      list.appendChild(b);
    });
    panel.appendChild(list);
    panel.appendChild(el("div", { "class": "dt3-copy-actions" }, [
      el("button", { "type": "button", "class": "pm-btn", "data-variant": "quiet", "on": { "click": function () { copyStep = 1; renderCopy(); } } }, ["Back"]),
      el("button", {
        "type": "button", "class": "pm-btn", "data-variant": "primary", "disabled": copyPicked.length === 0,
        "on": {
          "click": function () {
            copyEngine.setCategories(copyPicked.slice());
            copyStep = 3;
            clear(canvas); renderCopy();
          }
        }
      }, ["Review " + plural(copyPicked.length, "category", "categories")])
    ]));
    reviewBtn = panel.querySelector(".dt3-copy-actions [data-variant=\"primary\"]");
  }

  function paintCopyReview(panel) {
    var preview = copyEngine.buildPreview();
    if (!preview) {
      panel.appendChild(el("p", { "class": "pm-muted" }, ["Pick a source and at least one category first."]));
      copyStep = 1;
      return;
    }
    panel.appendChild(el("h3", { "style": "margin:0 0 4px;font-size:15px" }, ["Review & confirm"]));
    var totals = el("div", { "class": "dt3-totals" });
    [["add", "Will be added"], ["replace", "Will be replaced"], ["unchanged", "Already match"], ["unavailable", "Unavailable"], ["conflict", "Conflicts"]].forEach(function (t) {
      totals.appendChild(el("div", { "class": "dt3-total" }, [
        el("div", { "class": "dt3-total-v" }, [String(preview.totals[t[0]] || 0)]),
        el("div", { "class": "dt3-total-h" }, [t[1]])
      ]));
    });
    panel.appendChild(totals);
    panel.appendChild(el("div", { "class": "dt3-copy-note" }, [preview.credentialPolicy || "Credential and account references are re-pointed to this project's own credentials — raw secrets are never copied."]));
    panel.appendChild(el("div", { "class": "dt3-copy-note" }, [preview.independence || "This is a one-time copy. After it applies, the two projects stay fully independent."]));
    if (preview.capped) panel.appendChild(el("div", { "class": "dt3-copy-note" }, ["Large groups are summarized; every item still appears in the receipt after applying."]));

    var groups = el("div", { "class": "dt3-preview-groups" });
    var kinds = Object.keys(preview.groups || {});
    kinds.forEach(function (kind) {
      var items = preview.groups[kind] || [];
      if (!items.length) return;
      var det = el("details", {}, [
        el("summary", {}, [humanize(kind) + " (" + items.length + (preview.capped ? "+" : "") + ")"]),
        el("div", { "class": "pm-accordion-body" }, [items.slice(0, 12).map(function (it) { return typeof it === "string" ? it : (it.label || it.id || String(it)); }).join(" · ") + (items.length > 12 ? " · …" : "")])
      ]);
      groups.appendChild(det);
    });
    panel.appendChild(groups);

    var opPanel = el("div", {});
    panel.appendChild(opPanel);
    panel.appendChild(el("div", { "class": "dt3-copy-actions" }, [
      el("button", { "type": "button", "class": "pm-btn", "data-variant": "quiet", "on": { "click": function () { copyStep = 2; renderCopy(); } } }, ["Back"]),
      el("button", {
        "type": "button", "class": "pm-btn", "data-variant": "primary",
        "on": {
          "click": function () {
            copyEngine.confirm();
            copyOp = copyEngine.apply();
            copyStep = 4;
            clear(canvas); renderCopy();
          }
        }
      }, ["Apply " + plural(preview.totals.add + preview.totals.replace, "change") + " to " + store.currentProject().name])
    ]));
  }

  function paintCopyReceipt(panel) {
    panel.appendChild(el("h3", { "style": "margin:0 0 4px;font-size:15px" }, ["Applying to " + store.currentProject().name]));
    var opPanel = el("div", {});
    panel.appendChild(opPanel);
    function paintOp() {
      clear(opPanel);
      var op = copyOp && store.operation(copyOp.id);
      if (!op) { opPanel.appendChild(el("p", { "class": "pm-muted" }, ["Preparing…"])); return; }
      opPanel.appendChild(opPhases(op));
      if (op.state === "running") return;
      var receipts = store.receipts();
      var last = receipts[receipts.length - 1];
      opPanel.appendChild(el("div", { "class": "dt3-copy-note" }, [
        op.state === "done"
          ? "Applied and verified. A restore point was taken first, and the receipt below records exactly what changed."
          : "The copy ended as “" + op.state + "”" + (op.reason ? ": " + op.reason : "") + ". Nothing partial was left applied."
      ]));
      if (last) {
        opPanel.appendChild(el("h4", { "style": "margin:12px 0 4px" }, ["Receipt"]));
        opPanel.appendChild(el("dl", { "class": "pm-kv" }, [
          el("dt", {}, ["What"]), el("dd", {}, [last.title || "Copy settings"]),
          el("dt", {}, ["When"]), el("dd", {}, [last.at || "—"]),
          el("dt", {}, ["Summary"]), el("dd", {}, [last.summary || "See the restore points list for rollback."])
        ]));
      }
      var btns = el("div", { "class": "dt3-copy-actions" }, [
        el("button", {
          "type": "button", "class": "pm-btn", "data-variant": "quiet",
          "on": { "click": function () { copyEngine = null; copyStep = 1; go({ view: "home" }, { settle: true }); } }
        }, ["Done"]),
        el("button", {
          "type": "button", "class": "pm-btn", "data-variant": "danger",
          "on": {
            "click": function () {
              copyEngine.rollback();
              toast("Rolled back to the pre-copy restore point.", "ok");
              copyEngine = null;
              copyStep = 1;
              clear(canvas); renderCopy();
            }
          }
        }, ["Roll back this copy"])
      ]);
      opPanel.appendChild(btns);
    }
    paintOp();
    var timer = setInterval(function () {
      if (route.view !== "copy" || copyStep !== 4) { clearInterval(timer); return; }
      paintOp();
      var op = copyOp && store.operation(copyOp.id);
      if (op && op.state !== "running") clearInterval(timer);
    }, 400);
  }

  /* ==========================================================================
     DEFERRED-OWNER shell — truthful insertion point, no fabricated state
     ========================================================================== */
  function renderOwner() {
    var o = null;
    for (var i = 0; i < R.DEFERRED_OWNERS.length; i++) if (R.DEFERRED_OWNERS[i].id === route.owner) o = R.DEFERRED_OWNERS[i];
    canvas.appendChild(backButton("System & Advanced"));
    if (!o) { go({ view: "domain", domain: "system" }, { settle: true }); return; }
    canvas.appendChild(el("div", { "class": "dt3-owner", "data-manager-id": "deferred-" + o.id }, [
      el("h1", {}, [o.family]),
      el("dl", { "class": "pm-kv" }, [
        el("dt", {}, ["Owned by"]), el("dd", {}, [o.owner]),
        el("dt", {}, ["Insertion point"]), el("dd", {}, [o.insertion]),
        el("dt", {}, ["Returns to"]), el("dd", {}, [o.returnContract])
      ]),
      el("div", { "class": "dt3-copy-note", "style": "margin-block-start:16px" }, [
        "This area is owned by " + o.owner + "; the demo shows the insertion point only. When the owning module is present, its own experience opens here and " + o.returnContract.toLowerCase() + " when it finishes."
      ]),
      el("div", { "class": "dt3-copy-actions" }, [
        el("button", { "type": "button", "class": "pm-btn", "data-variant": "primary", "on": { "click": back } }, [o.returnContract])
      ])
    ]));
  }

  /* ==========================================================================
     Demo-scenario drawer + global keys
     ========================================================================== */
  var scrim = document.getElementById("dt3-scrim");
  var drawer = document.getElementById("dt3-demo");
  var demoList = document.getElementById("dt3-demo-list");
  function drawerOpen() { return !drawer.hidden; }
  function openDrawer() {
    clear(demoList);
    var activeNow = store.activeScenario();
    demoList.appendChild(el("button", {
      "type": "button", "class": "dt3-demo-btn", "aria-pressed": activeNow ? "false" : "true",
      "on": { "click": function () { store.setScenario(null); closeDrawer(); render(null); } }
    }, ["Default fixtures (no scenario)"]));
    store.scenarios().forEach(function (name) {
      demoList.appendChild(el("button", {
        "type": "button", "class": "dt3-demo-btn", "aria-pressed": name === activeNow ? "true" : "false",
        "data-scenario": name,
        "on": { "click": function () { store.setScenario(name); closeDrawer(); render(null); toast("Scenario: " + humanize(name), "info"); } }
      }, [humanize(name)]));
    });
    scrim.hidden = false;
    drawer.hidden = false;
  }
  function closeDrawer() { scrim.hidden = true; drawer.hidden = true; }
  var demoBtn = document.querySelector("[data-demo-open]");
  if (demoBtn) demoBtn.addEventListener("click", function () { drawerOpen() ? closeDrawer() : openDrawer(); });
  scrim.addEventListener("click", closeDrawer);

  document.getElementById("dt3-close").addEventListener("click", function () {
    goHomeSettle();
    stack = [];
    toast("Settings closed — reopen from the title bar (demo).", "info");
  });

  /* Escape order: dropdown → drawer → one level out → stop at Home */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (searchOpen) { closeResults(); return; }
    if (drawerOpen()) { closeDrawer(); return; }
    if (route.view !== "home") { back(); }
  });

  /* Store subscription: scenario switches repaint; setting edits refresh badges */
  store.subscribe(function (evt) {
    if (!evt) return;
    if (evt.type === "scenario") { render(null); }
    else if (evt.type === "setting" && evt.id) {
      var row = canvas.querySelector('[data-setting-id="' + evt.id + '"]');
      if (row) {
        var badge = row.querySelector('.pm-badge[data-kind="state"]');
        if (badge) { badge.setAttribute("data-state", "custom"); badge.textContent = "Custom"; }
      }
    }
  });

  /* No boot-time search prefill: the restore-on-Back contract applies to
     in-session Back navigation only (see back()), not to fresh loads. The
     saved query is still written on pick (store.saveSearchState) so the
     in-session restore keeps working. */

  if (window.PMShell && window.PMShell.init) window.PMShell.init();
  render(null);
})();
