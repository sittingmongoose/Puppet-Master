(function () {
  "use strict";
  var PM2 = window.PM2, STORE = new PM2.Store("c06");
  var NS = "concept-06-directory-take-2";
  var el = function (id) { return document.getElementById(id); };
  var app = el("app"), sheet = el("sheet"), stage = el("stage");
  var NAV = new PM2.routes.Nav({ domain: null });
  var QP = new URLSearchParams(location.search);
  if (QP.get("theme")) document.documentElement.setAttribute("data-theme", QP.get("theme"));
  if (QP.get("reduced") === "1") document.documentElement.setAttribute("data-reduced-motion", "1");
  var ICONS = { general: "settings", ai: "pam", safety: "shield", code: "code", memory: "memory", planning: "compass", branching: "crew", media: "map", web: "search", personas: "users", extensions: "stack", system: "grid" };
  function esc(x) { return String(x == null ? "" : x).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* chrome */
  el("projChip").innerHTML = '<span class="sdot ok"></span><b>' + PM2.currentProject.name + "</b> · current project";
  el("closeBtn").innerHTML = PM2.svg("close", 13) + "Close";
  el("navToggle").innerHTML = PM2.svg("list", 13) + "Settings";
  el("miniIcon").innerHTML = PM2.svg("search", 13);
  el("themeBtn").innerHTML = PM2.svg("settings", 13) + "Friendly Dark";
  el("drawerClose").innerHTML = PM2.svg("close", 12) + "Close";
  el("activity").innerHTML = ["home", "settings", "terminal", "stack", "users", "search"].map(function (i) { return '<button class="pm-act" aria-label="' + i + '">' + PM2.svg(i, 18) + "</button>"; }).join("");
  el("footer").innerHTML = "<span><b>Settings</b> · " + NS + "</span><span class='pm-spacer'></span><span>828 settings · 12 categories</span>";

  var menu = null;
  function openMenu(anchor, items, onPick) {
    closeMenu();
    var m = document.createElement("div"); m.className = "v2menu";
    m.innerHTML = items.map(function (it, i) { return it.sep ? '<div class="v2menu-sep"></div>' : '<button class="v2menu-item" data-i="' + i + '"' + (it.dis ? ' aria-disabled="true"' : "") + ">" + (it.icon ? PM2.svg(it.icon, 14) : "") + '<span class="v2menu-label">' + it.label + "</span>" + (it.hint ? '<span class="v2menu-hint">' + it.hint + "</span>" : "") + "</button>"; }).join("");
    el("menuHost").appendChild(m);
    var r = anchor.getBoundingClientRect(), sr = stage.getBoundingClientRect();
    var top = r.bottom - sr.top + 6, left = Math.min(Math.max(0, r.left - sr.left), sr.width - 230);
    if (r.bottom + 280 > window.innerHeight) top = Math.max(4, r.top - sr.top - 280);
    m.style.top = top + "px"; m.style.left = left + "px";
    m.addEventListener("click", function (e) { var b = e.target.closest(".v2menu-item"); if (!b || b.getAttribute("aria-disabled")) return; closeMenu(); onPick(items[+b.dataset.i]); });
    menu = m;
  }
  function closeMenu() { if (menu) { menu.remove(); menu = null; return true; } return false; }
  document.addEventListener("click", function (e) { if (menu && !menu.contains(e.target)) closeMenu(); }, true);
  el("themeBtn").addEventListener("click", function () {
    var themes = PM2.mgrById["mgr.appearance"].themes;
    openMenu(el("themeBtn"), themes.map(function (t) { return { label: t }; }).concat([{ sep: 1 }, { label: "Reduced motion: " + (RM() ? "on" : "off") }]), function (it) {
      if (it.label.indexOf("Reduced") === 0) { document.documentElement.setAttribute("data-reduced-motion", RM() ? "0" : "1"); return; }
      document.documentElement.setAttribute("data-theme", it.label);
      document.documentElement.style.colorScheme = /-dark$/.test(it.label) ? "dark" : "light";
      el("themeBtn").innerHTML = PM2.svg("settings", 13) + it.label;
    });
  });
  function RM() { return document.documentElement.getAttribute("data-reduced-motion") === "1"; }
  el("closeBtn").addEventListener("click", goHome);
  el("navToggle").addEventListener("click", function () { var r = el("e6rail"); r.style.display = r.style.display === "none" || !r.style.display ? "flex" : "none"; });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (closeMenu()) return;
      var ds = stage.querySelector('.e6-dsheet[data-open="1"]');
      if (ds) { ds.dataset.open = "0"; return; }
      if (el("drawer").dataset.open === "1") { closeDrawer(); return; }
      if (COPY.open) { copyClose(); return; }
      if (NAV.canBack()) { NAV.back(); return; }
      if (state.view !== "home") goHome();
    }
  });

  var state = { view: "home", domain: null, section: null, manager: null, object: null, tab: 0, hydrated: {}, lastQuery: "", lastRid: null };
  var lastRendered = "", pendingRestore = null;
  NAV.on(function (route, depth, extra) {
    var s = PM2.routes.str(route);
    if (extra && extra.returnedFrom && extra.returnedFrom.query) pendingRestore = { query: extra.returnedFrom.query, resultId: extra.returnedFrom.resultId };
    if (s === lastRendered) return;
    lastRendered = s; location.hash = s; render(route);
  });
  window.addEventListener("hashchange", function () { var r = PM2.routes.parse(location.hash); if (PM2.routes.str(r) !== PM2.routes.str(NAV.top())) NAV.go(r); });
  function goHome() { state.view = "home"; state.domain = state.section = state.manager = null; NAV.reset({ domain: null }); render({ domain: null }); }

  /* search */
  var drop = null, dropSel = -1;
  function searchAttach(input) {
    var wrap = input.parentElement;
    input.addEventListener("input", function () {
      state.lastQuery = input.value;
      showDrop(wrap, PM2.search.query(input.value));
    });
    input.addEventListener("keydown", function (e) {
      if (!drop) { if (e.key === "Escape" && state.view !== "home") goHome(); return; }
      var rows = drop.querySelectorAll(".e6-res");
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); dropSel = e.key === "ArrowDown" ? Math.min(rows.length - 1, dropSel + 1) : Math.max(0, dropSel - 1); rows.forEach(function (r, i) { r.setAttribute("aria-selected", i === dropSel ? "true" : "false"); }); rows[dropSel] && rows[dropSel].scrollIntoView({ block: "nearest" }); }
      else if (e.key === "Enter") { e.preventDefault(); var rid = dropSel >= 0 && rows[dropSel] ? rows[dropSel].dataset.rid : (rows[0] && rows[0].dataset.rid); if (rid) pickResult(rid); }
      else if (e.key === "Escape") { hideDrop(); }
    });
  }
  function showDrop(wrap, res) {
    hideDrop();
    if (!res.query) return;
    drop = document.createElement("div"); drop.className = "e6-drop v2-surface";
    var html = "";
    if (!res.results.length) {
      html = '<div class="e6-drop-empty">No results' + (res.suggestion ? " — try <b>" + esc(res.suggestion) + "</b>" : "") + "</div>";
      if (res.suggestion) html += '<div class="e6-res" data-rid="suggest:' + esc(res.suggestion) + '"><span class="lbl">“' + esc(res.suggestion) + "”</span></div>";
    } else {
      res.results.forEach(function (r) {
        html += '<div class="e6-res" data-rid="' + esc(r.rid) + '"><span class="k">' + r.type.replace(/_/g, " ").slice(0, 9) + '</span><span class="lbl">' + esc(r.label) + '</span><span class="path">' + esc(r.path.join(" › ")) + "</span>" + (r.availability ? '<span class="why">' + esc(r.availability) + "</span>" : "") + "</div>";
      });
    }
    drop.innerHTML = html; wrap.appendChild(drop); dropSel = -1;
    drop.addEventListener("mousedown", function (e) {
      var row = e.target.closest(".e6-res"); if (!row) return; e.preventDefault();
      if (row.dataset.rid.indexOf("suggest:") === 0) { var q = row.dataset.rid.slice(8); var inp = wrap.querySelector("input"); inp.value = q; state.lastQuery = q; showDrop(wrap, PM2.search.query(q)); return; }
      pickResult(row.dataset.rid);
    });
  }
  function hideDrop() { if (drop) { drop.remove(); drop = null; } }
  document.addEventListener("click", function (e) { if (drop && !e.target.closest(".e6-searchwrap") && !e.target.closest(".e6-minis")) hideDrop(); });
  function pickResult(rid) {
    var entry = PM2.search.byRid(rid); if (!entry) return;
    state.lastRid = rid; hideDrop();
    if (entry.type === "intentional_help_result" && entry.dest.mode === "copy") { NAV.go({ mode: "copy" }); openCopy(); return; }
    var plan = PM2.routes.planFor(entry.dest);
    NAV.go(Object.assign({}, entry.dest, { query: state.lastQuery, resultId: rid }));
    land(plan, entry);
  }
  function land(plan, entry) {
    var tries = 0;
    (function go() {
      var target = null;
      if (plan.route.row) target = sheet.querySelector('[data-row="' + plan.route.row + '"]');
      if (!target && plan.route.object) target = stage.querySelector('[data-obj="' + plan.route.object + '"]');
      if (!target && plan.route.manager) target = stage.querySelector('[data-mgr="' + plan.route.manager + '"]');
      if (!target && tries++ < 16) { setTimeout(go, 110); return; }
      if (target) {
        target.scrollIntoView({ block: "center", behavior: RM() ? "auto" : "smooth" });
        target.classList.remove("v2-calm"); void target.offsetWidth; target.classList.add("v2-calm");
        var f = target.querySelector("input,select,button,.e6-switch") || target;
        try { f.focus({ preventScroll: true }); } catch (e) {}
      }
      if (entry && entry.type === "setting") {
        var s = PM2.inventory.byId[plan.route.row];
        if (s) openDrawer("Landed on a setting", "<b>" + esc(s.label) + "</b><br>" + esc(s.desc) + "<br><br>Location: " + esc(PM2.routes.crumb(NAV.top()).join(" › ")) + (state.lastQuery ? "<br>From search: “" + esc(state.lastQuery) + "”" : ""));
      }
    })();
  }

  /* render dispatcher */
  function render(route) {
    closeDrawer(); hideDrop();
    if (route.manager && PM2.mgrById[route.manager]) renderManager(route);
    else if (route.domain === "all") renderAll();
    else if (route.domain) renderDomain(route);
    else if (route.mode === "copy") { renderHome(); openCopy(); }
    else renderHome();
    renderRail(route); renderCrumb(route);
    el("miniWrap").hidden = state.view === "home";
  }
  function renderCrumb(route) {
    var html = "<b>Settings</b>";
    PM2.routes.crumb(route).forEach(function (p) { html += ' <span>›</span> ' + esc(p); });
    if (NAV.canBack()) html = '<button class="e6-tb" id="backBtn">' + PM2.svg("back", 12) + "Back</button>" + html;
    el("crumb").innerHTML = html;
    var b = el("backBtn"); if (b) b.addEventListener("click", function () { NAV.back(); });
  }
  function renderRail(route) {
    var html = '<div class="e6-rail-head">Settings</div><div class="e6-rail-body v2-surface">';
    html += '<div class="e6-rail-item" data-nav="home"' + (!route.domain ? ' aria-current="page"' : "") + ">" + PM2.svg("home", 14) + "Home</div>";
    PM2.inventory.categories.forEach(function (c) {
      html += '<div class="e6-rail-item" data-nav="' + c.id + '"' + (route.domain === c.id ? ' aria-current="page"' : "") + ">" + PM2.svg(ICONS[c.id] || "grid", 14) + '<span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(c.title) + '</span><span class="cnt">' + PM2.inventory.byCategory[c.id].length + "</span></div>";
    });
    html += '<div class="e6-rail-item" data-nav="all">' + PM2.svg("list", 14) + "All settings</div>";
    html += '<div class="e6-rail-item" data-nav="copy">' + PM2.svg("layers", 14) + "Copy from…</div></div>";
    var rail = el("e6rail"); rail.innerHTML = html;
    rail.querySelectorAll("[data-nav]").forEach(function (n) {
      n.addEventListener("click", function () {
        var v = n.dataset.nav;
        if (v === "home") goHome(); else if (v === "all") NAV.go({ domain: "all" }); else if (v === "copy") openCopy();
        else NAV.go({ domain: v });
        if (window.innerWidth < 1024) rail.style.display = "none";
      });
    });
  }

  /* HOME — editorial list */
  function renderHome() {
    state.view = "home"; state.domain = state.section = state.manager = null;
    var html = '<div class="e6-page">';
    html += '<div class="e6-eyebrow"><b>06</b> · A1 Directory · Take 2</div>';
    html += '<h1 class="e6-h1">Settings, <b>read like an index</b></h1>';
    html += '<div class="e6-sub">For <b>' + esc(PM2.currentProject.name) + "</b>. Search first, or read down the list — each destination says what it is for.</div>";
    html += '<div class="e6-searchwrap"><div class="e6-search">' + PM2.svg("search", 16) + '<input id="homeSearch" type="search" placeholder="Search settings, managers, actions…" aria-label="Universal search" autocomplete="off"><span class="v2kbd">/</span></div></div>';
    html += '<div class="e6-note"><span class="sdot warn" style="margin-top:4px"></span><div><div class="t">One provider needs setup</div><div class="d">Codex CLI — explicit install from the official source when you are ready.</div></div><span style="flex:1"></span><button class="e6-tb" data-dest=\'' + esc(JSON.stringify({ manager: "mgr.provider", object: "prov.codex-cli" })) + '">Open</button></div>';
    html += '<div class="e6-att"><div class="e6-att-title">Needs attention · 3</div>';
    [{ t: "ntfy destination offline", d: "queued since 2026-08-17", go: { manager: "mgr.notifications", object: "ntf.ntfy" } },
     { t: "DeepSeek usage endpoint unavailable", d: "provider ready · costs are last-known-good", go: { manager: "mgr.provider", object: "prov.deepseek-key" } },
     { t: "Vault migration waiting for restart", d: "storage changes finish after restart", go: { manager: "mgr.storage", object: "sto.migrate" } }].forEach(function (a) {
      html += '<div class="e6-att-row"><span class="sdot warn"></span><span>' + esc(a.t) + '</span><span class="d">' + esc(a.d) + '</span><button class="go" data-dest=\'' + esc(JSON.stringify(a.go)) + "'>Review →</button></div>";
    });
    html += "</div>";
    PM2.inventory.categories.forEach(function (c) {
      var mgrs = PM2.managers.filter(function (m) { return m.domain === c.id; });
      var changed = 0; PM2.inventory.byCategory[c.id].forEach(function (s) { if (STORE.get(s.id).status === "custom") changed++; });
      html += '<div class="e6-dest" data-domain="' + c.id + '" tabindex="0"><span class="e6-dest-ic">' + PM2.svg(ICONS[c.id] || "grid", 19) + '</span><div><div class="e6-dest-t">' + esc(c.title) + '</div><div class="e6-dest-d">' + esc(c.subgroups.map(function (s) { return s.title || s.id; }).join(" · ")) + "</div></div>" +
        '<div class="e6-dest-meta"><b>' + PM2.inventory.byCategory[c.id].length + "</b> settings<br>" + changed + " changed<br>" + mgrs.length + " managers</div></div>";
    });
    html += '<div class="e6-utils"><button class="e6-util" data-nav="all">All settings index →</button><button class="e6-util" data-nav="copy">Copy settings from another project →</button><button class="e6-util" data-nav="recent">Recent changes (' + STORE.changedCount() + ") →</button></div>";
    html += "</div>";
    sheet.innerHTML = html;
    searchAttach(el("homeSearch"));
    var rq = pendingRestore ? pendingRestore.query : NAV.top().query;
    if (rq) { el("homeSearch").value = rq; state.lastQuery = rq; if (pendingRestore && pendingRestore.resultId) state.lastRid = pendingRestore.resultId; pendingRestore = null; }
    sheet.querySelectorAll("[data-domain]").forEach(function (d) {
      d.addEventListener("click", function () { NAV.go({ domain: d.dataset.domain }); });
      d.addEventListener("keydown", function (e) { if (e.key === "Enter") NAV.go({ domain: d.dataset.domain }); });
    });
    sheet.querySelectorAll("[data-dest]").forEach(function (b) { b.addEventListener("click", function (e) { e.stopPropagation(); var dd = JSON.parse(b.dataset.dest); NAV.go(dd); land(PM2.routes.planFor(dd)); }); });
    sheet.querySelectorAll(".e6-util").forEach(function (b) {
      b.addEventListener("click", function () {
        var v = b.dataset.nav;
        if (v === "all") NAV.go({ domain: "all" }); else if (v === "copy") openCopy();
        else openDrawer("Recent changes", "Values changed in this project: <b>" + STORE.changedCount() + "</b>. Every change applies to <b>" + esc(PM2.currentProject.name) + "</b> only.");
      });
    });
  }

  /* DOMAIN sheet — nested subnav inside the sheet */
  function renderDomain(route) {
    state.view = "domain"; state.domain = route.domain; state.manager = null;
    var c = PM2.inventory.categories.filter(function (x) { return x.id === route.domain; })[0];
    var mgrs = PM2.managers.filter(function (m) { return m.domain === route.domain; });
    var html = '<div class="e6-page">';
    html += '<div class="e6-crumb2"><b>Settings</b> <span>›</span> ' + esc(c.title) + "</div>";
    html += '<h2 class="e6-h2">' + esc(c.title).replace(/^(\S+)/, "<b>$1</b>") + '</h2>';
    html += '<div class="e6-lede">' + PM2.inventory.byCategory[c.id].length + " settings across " + c.subgroups.length + " pages · every change applies to " + esc(PM2.currentProject.name) + " only.</div>";
    html += '<nav class="e6-subnav" id="subnav" aria-label="Pages">' + c.subgroups.map(function (sg, i) { return '<button data-sec="' + (sg.id || sg) + '"' + (i === 0 ? ' aria-selected="true"' : "") + ">" + esc(sg.title || sg) + "</button>"; }).join("") + (mgrs.length ? '<button data-sec="m-managers">Managers</button>' : "") + (route.domain === "system" ? '<button data-sec="m-owners">Future modules</button>' : "") + "</nav>";
    if (mgrs.length) {
      html += '<section class="e6-sec" id="m-managers"><div class="e6-sec-h">Managers</div><div class="e6-sec-d">Dedicated surfaces that live inside this sheet.</div>';
      mgrs.forEach(function (m) {
        html += '<div class="e6-mgrrow" data-mgr="' + m.id + '" tabindex="0"><span style="color:var(--ink-2)">' + PM2.svg(m.icon, 17) + '</span><div><div class="t">' + esc(m.title) + '</div><div class="d">' + esc(m.blurb) + "</div></div>" + '<span class="v2badge ' + (m.health.kind === "ok" ? "ok" : m.health.kind) + '">' + esc(m.health.text) + "</span></div>";
      });
      html += "</section>";
    }
    if (route.domain === "system") {
      html += '<section class="e6-sec" id="m-owners"><div class="e6-sec-h">Future modules</div><div class="e6-sec-d">Named owner insertion points — reachable, integrated, no fabricated backend.</div>';
      PM2.owners.forEach(function (o) {
        html += '<div class="e6-mgrrow" data-owner="' + o.id + '" tabindex="0"><span style="color:var(--ink-2)">' + PM2.svg("plug", 17) + '</span><div><div class="t">' + esc(o.title) + '</div><div class="d">' + esc(o.owner) + " · " + esc(o.contract) + "</div></div>" + '<span class="v2badge info">insertion point</span></div>';
      });
      html += "</section>";
    }
    c.subgroups.forEach(function (sg) {
      var sid = sg.id || sg, rows = PM2.inventory.subgroups[route.domain + "." + sid] || [];
      html += '<section class="e6-sec" id="sec-' + sid + '" data-section="' + sid + '"><div class="e6-sec-h">' + esc(sg.title || sid) + '</div><div class="e6-sec-d">' + rows.length + ' settings</div><div id="rows-' + sid + '"></div></section>';
    });
    html += "</div>";
    sheet.innerHTML = html;
    sheet.querySelectorAll("[data-mgr]").forEach(function (r) { r.addEventListener("click", function () { NAV.go({ domain: route.domain, manager: r.dataset.mgr }); }); });
    sheet.querySelectorAll("[data-owner]").forEach(function (r) {
      r.addEventListener("click", function () {
        var o = PM2.owners.filter(function (x) { return x.id === r.dataset.owner; })[0];
        openDrawer(o.title, "<b>Owner:</b> " + esc(o.owner) + "<br><b>Contract:</b> " + esc(o.contract) + "<br><b>Return:</b> " + esc(o.returnRoute));
      });
    });
    c.subgroups.forEach(function (sg) {
      var sid = sg.id || sg, host = sheet.querySelector("#rows-" + CSS.escape(sid));
      (PM2.inventory.subgroups[route.domain + "." + sid] || []).forEach(function (s) { host.appendChild(setRow(s)); });
    });
    var nav = el("subnav");
    nav.querySelectorAll("[data-sec]").forEach(function (b) {
      b.addEventListener("click", function () {
        nav.querySelectorAll("[data-sec]").forEach(function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); });
        var t = sheet.querySelector("#" + CSS.escape(b.dataset.sec));
        if (t) t.scrollIntoView({ behavior: RM() ? "auto" : "smooth", block: "start" });
      });
    });
    sheet.addEventListener("scroll", function () {
      var best = null, bd = 1e9;
      nav.querySelectorAll("[data-sec]").forEach(function (b) {
        var t = sheet.querySelector("#" + CSS.escape(b.dataset.sec));
        if (!t) return;
        var d = Math.abs(t.getBoundingClientRect().top - 140);
        if (d < bd) { bd = d; best = b; }
      });
      if (best) nav.querySelectorAll("[data-sec]").forEach(function (x) { x.setAttribute("aria-selected", x === best ? "true" : "false"); });
    });
  }

  /* editorial setting row */
  function setRow(s) {
    var st = STORE.get(s.id), meta = PM2.statusMeta[st.status], val = st.value;
    var d = document.createElement("div");
    d.className = "e6-setrow"; d.dataset.row = s.id; d.dataset.status = st.status;
    var ctl = "";
    switch (s.type) {
      case "toggle": ctl = '<div class="ctl"><button class="e6-switch" role="switch" aria-checked="' + (val === true) + '" aria-label="' + esc(s.label) + '"></button></div>'; break;
      case "select": case "radio": ctl = '<div class="ctl"><select class="e6-sel" aria-label="' + esc(s.label) + '">' + (s.options || []).map(function (o) { return "<option" + (o === val ? " selected" : "") + ">" + esc(o) + "</option>"; }).join("") + "</select></div>"; break;
      case "slider": ctl = '<div class="ctl" style="width:180px"><input class="e6-range" type="range" min="0" max="100" step="10" value="' + (typeof val === "number" ? val : 50) + '" aria-label="' + esc(s.label) + '"><span class="v2kbd">' + (typeof val === "number" ? val : 50) + "</span></div>"; break;
      case "number": ctl = '<div class="ctl"><input class="field" type="number" style="width:110px" value="' + esc(String(val)) + '" aria-label="' + esc(s.label) + '"></div>'; break;
      case "text": case "path": ctl = '<div class="ctl" style="width:200px"><input class="field" type="text" value="' + esc(String(val)) + '" aria-label="' + esc(s.label) + '"></div>'; break;
      case "action": ctl = '<div class="ctl"><button class="e6-btn primary" data-run="' + esc(s.id) + '">' + PM2.svg("bolt", 12) + "Run</button></div>"; break;
      default: ctl = '<div class="ctl"><span class="v2badge">' + esc(JSON.stringify(val)) + "</span></div>";
    }
    var badge = s.type === "action" ? "" : '<span class="v2badge ' + (meta.tone === "neutral" ? "" : meta.tone) + '">' + esc(meta.label) + "</span>";
    d.innerHTML = '<div><div class="lbl">' + esc(s.label) + badge + '</div><div class="desc">' + esc(s.desc) + '</div><div class="e6-why-l"><button data-why="' + esc(s.id) + '">Why this value?</button></div><div class="e6-details" hidden></div></div>' + ctl + '<div class="e6-err" hidden></div>';
    d.querySelector("[data-why]").addEventListener("click", function () {
      var dd = d.querySelector(".e6-details");
      dd.hidden = !dd.hidden;
      dd.innerHTML = "<b>Status</b> " + esc(meta.label) + " · <b>Default</b> " + esc(JSON.stringify(s.default)) + " · <b>Applies to</b> " + esc(PM2.currentProject.name) + " only" +
        (st.status === "managed" ? " · <b>Origin</b> organization policy (read-only)" : "") +
        (st.status === "restart" ? " · <b>Timing</b> finishes after restart" : "") +
        (st.status === "changed-elsewhere" ? " · <b>Changed</b> " + esc(st.changedAt || "recently") + " from another surface" : "") +
        (st.status === "import-conflict" ? " · <b>Conflict</b> imported value differs — resolve below" : "") +
        " · <b>Registry scope (diagnostic)</b> " + esc((s.scope || []).join(", ")) + " · <b>ID</b> " + esc(s.id);
    });
    var sw = d.querySelector(".e6-switch");
    if (sw) sw.addEventListener("click", function () { if (st.status === "managed") return; var nv = !(sw.getAttribute("aria-checked") === "true"); sw.setAttribute("aria-checked", nv); STORE.set(s.id, nv, "custom"); });
    var se = d.querySelector("select.e6-sel");
    if (se) se.addEventListener("change", function () { STORE.set(s.id, se.value, "custom"); });
    var nu = d.querySelector('input[type="number"]');
    if (nu) nu.addEventListener("change", function () {
      var err = d.querySelector(".e6-err"); var v = parseFloat(nu.value);
      if (isNaN(v) || v < 0 || v > 100000) { err.hidden = false; err.textContent = "Enter a number between 0 and 100,000."; return; }
      err.hidden = true; STORE.set(s.id, v, "custom");
    });
    var tx = d.querySelector('input[type="text"]');
    if (tx) tx.addEventListener("change", function () { STORE.set(s.id, tx.value, "custom"); });
    var rg = d.querySelector('input[type="range"]');
    if (rg) rg.addEventListener("change", function () { STORE.set(s.id, parseInt(rg.value, 10), "custom"); var k = d.querySelector(".v2kbd"); if (k) k.textContent = rg.value; });
    var rn = d.querySelector("[data-run]");
    if (rn) rn.addEventListener("click", function () { openDrawer("Action", "<b>" + esc(s.label) + "</b> runs through its canonical owner with a receipt and truthful operation state. This demo records the intent."); });
    return d;
  }

  /* ALL SETTINGS (virtualized) */
  function renderAll() {
    state.view = "all"; state.manager = null;
    var html = '<div class="e6-page"><div class="e6-crumb2"><b>Settings</b> <span>›</span> All settings</div>';
    html += '<h2 class="e6-h2"><b>All</b> settings index</h2>';
    html += '<div class="e6-lede">The complete long-tail index — 828 rows, virtualized, faceted.</div>';
    html += '<input class="field" id="allFilter" type="search" placeholder="Filter by name or ID…" aria-label="Filter" style="max-width:340px;margin-bottom:10px">';
    html += '<div class="e6-subnav" id="facets" style="position:static;border-bottom:none"></div><div id="info" style="font-size:11.5px;color:var(--ink-3);margin-bottom:6px"></div><div class="v2-virt v2-surface" id="virt" style="height:min(600px, calc(100vh - 360px));position:relative;overflow:auto"></div></div>';
    sheet.innerHTML = html;
    var facet = "all";
    var facets = [["all", "All"], ["changed", "Changed"], ["managed", "Managed"], ["unavailable", "Unavailable"], ["restart", "Restart required"], ["advanced", "Advanced"], ["simple", "Simple"]];
    var fw = el("facets");
    function drawF() {
      fw.innerHTML = facets.map(function (f) { return '<button data-f="' + f[0] + '"' + (facet === f[0] ? ' aria-selected="true"' : "") + ">" + f[1] + "</button>"; }).join("");
      fw.querySelectorAll("[data-f]").forEach(function (b) { b.addEventListener("click", function () { facet = b.dataset.f; drawF(); draw(); }); });
    }
    var all = [], ROWH = 64, virt = el("virt");
    var pad = document.createElement("div"); pad.className = "v2-virt-pad";
    var win = document.createElement("div"); win.className = "v2-virt-win"; win.style.position = "relative";
    virt.append(pad, win);
    function drawW() {
      var w = PM2.window({ scrollTop: virt.scrollTop, viewportHeight: virt.clientHeight, rowHeight: ROWH, total: all.length });
      pad.style.height = w.padTop + "px"; win.style.transform = "translateY(" + w.padTop + "px)";
      win.innerHTML = "";
      for (var i = w.first; i < w.first + w.count; i++) {
        var s = all[i]; if (!s) break;
        var holder = document.createElement("div"); holder.style.height = ROWH + "px";
        var r = setRow(s); r.style.border = "none"; r.classList.add("e6-setrow");
        holder.appendChild(r); win.appendChild(holder);
      }
      PM2.telemetry.domRows = [win.children.length];
    }
    function draw() {
      var q = (el("allFilter").value || "").toLowerCase();
      all = PM2.inventory.categories.flatMap(function (c) { return PM2.inventory.byCategory[c.id]; }).filter(function (s) {
        var st = STORE.get(s.id);
        if (facet === "changed" && st.status !== "custom") return false;
        if (facet === "managed" && st.status !== "managed") return false;
        if (facet === "unavailable" && st.status !== "unavailable") return false;
        if (facet === "restart" && st.status !== "restart") return false;
        if (facet === "advanced" && s.tier !== "advanced") return false;
        if (facet === "simple" && s.tier !== "simple") return false;
        if (q && (s.label + s.id).toLowerCase().indexOf(q) < 0) return false;
        return true;
      });
      el("info").textContent = all.length + " of 828 rows shown";
      drawW();
    }
    virt.addEventListener("scroll", drawW);
    el("allFilter").addEventListener("input", draw);
    drawF(); draw();
  }

  /* MANAGER — roster + sliding detail sheet */
  function renderManager(route) {
    var m = PM2.mgrById[route.manager];
    state.view = "manager"; state.manager = m.id; state.tab = route.tab ? Math.max(0, route.tab | 0) : 0;
    var html = '<div class="e6-mgr"><div class="e6-mgr-head"><button class="e6-tb" id="mgrBack">' + PM2.svg("back", 12) + "Back</button><h2>" + esc(m.title).replace(/^(\S+)/, "<b>$1</b>") + '</h2><span class="sum">' + esc(m.blurb) + "</span><span class='sp'></span>" + '<span class="v2badge ' + (m.health.kind === "ok" ? "ok" : m.health.kind) + '">' + esc(m.health.text) + "</span></div>";
    html += '<div class="e6-tabs" role="tablist">' + (m.tabs || ["Overview"]).map(function (t, i) { return '<button class="e6-tab" role="tab" aria-selected="' + (i === state.tab) + '" data-tab="' + i + '">' + esc(t) + "</button>"; }).join("") + "</div>";
    html += '<div class="e6-mgr-body" id="mgrBody"><div class="e6-roster v2-surface" id="roster"><div class="e6-skel" style="height:15px;margin:8px 0"></div><div class="e6-skel" style="height:15px;margin:8px 0;width:70%"></div><div class="e6-skel" style="height:15px;margin:8px 0;width:85%"></div><div style="font-size:11px;color:var(--ink-3);padding:8px 2px">Hydrating ' + esc(m.title.toLowerCase()) + "…</div></div>";
    html += '<div class="e6-dsheet" id="dsheet" data-open="0"><div class="e6-ds-head"><button class="e6-tb" id="dsBack">' + PM2.svg("back", 12) + "Back to list</button><h3 id="dsTitle"></h3><button class="e6-tb" id="dsClose">Close</button></div><div class="e6-ds-body v2-surface" id="dsBody"></div></div></div></div>";
    sheet.innerHTML = html;
    el("mgrBack").addEventListener("click", function () { NAV.back(); });
    sheet.querySelectorAll(".e6-tab").forEach(function (t) {
      t.addEventListener("click", function () {
        state.tab = +t.dataset.tab;
        sheet.querySelectorAll(".e6-tab").forEach(function (x) { x.setAttribute("aria-selected", x === t ? "true" : "false"); });
        hydrate(m, route);
      });
    });
    el("dsClose").addEventListener("click", function () { el("dsheet").dataset.open = "0"; });
    el("dsBack").addEventListener("click", function () { el("dsheet").dataset.open = "0"; });
    if (!state.hydrated[m.id]) setTimeout(function () { state.hydrated[m.id] = true; PM2.telemetry.managersHydrated.push(m.id); hydrate(m, route); }, 260);
    else hydrate(m, route);
  }
  function hydrate(m, route) {
    var roster = el("roster"); if (!roster) return;
    var tab = (m.tabs || ["Overview"])[state.tab] || "Overview";
    var html = "";
    (m.groups || []).forEach(function (g) {
      html += '<div class="e6-att-title" style="padding:10px 2px 4px">' + esc(g.label) + "</div>";
      m.records.filter(function (r) { return r.group === g.id; }).forEach(function (r) { html += rrow(r); });
    });
    if (!m.groups) m.records.forEach(function (r) { html += rrow(r); });
    roster.innerHTML = html;
    roster.querySelectorAll("[data-obj]").forEach(function (r) {
      r.addEventListener("click", function () {
        roster.querySelectorAll("[data-obj]").forEach(function (x) { x.setAttribute("aria-selected", x === r ? "true" : "false"); });
        var rec = m.records.filter(function (x) { return x.id === r.dataset.obj; })[0];
        el("dsTitle").textContent = rec ? rec.label : m.title;
        el("dsBody").innerHTML = m.id === "mgr.provider" ? provDetail(m, r.dataset.obj, tab) : genDetail(m, rec, tab);
        el("dsheet").dataset.open = "1";
        NAV.go({ domain: m.domain, manager: m.id, object: r.dataset.obj, tab: state.tab }, { replace: true });
        wireDetail(m);
      });
    });
    if (route.object) {
      var r0 = roster.querySelector('[data-obj="' + route.object + '"]');
      if (r0) r0.click();
    }
  }
  function rrow(r) {
    var tone = r.status === "ok" ? "ok" : r.status === "bad" ? "bad" : "warn";
    return '<div class="e6-rrow" data-obj="' + r.id + '" aria-selected="false" tabindex="0"><span class="sdot ' + tone + '"></span><div style="min-width:0"><div class="e6-r-t">' + esc(r.label) + '</div><div class="e6-r-s">' + esc(r.statusLabel || r.desc || "") + "</div></div>" + PM2.svg("chevron", 14) + "</div>";
  }
  function chips(r) { return (r.chips || []).map(function (c) { return '<span class="v2badge">' + esc(c[0]) + ": " + esc(String(c[1])) + "</span>"; }).join(""); }
  function acts(m, r) {
    return '<div class="e6-actions">' + (r.actions || []).map(function (a) { return '<button class="e6-btn' + (a.kind === "primary" ? " primary" : "") + '" data-action="' + esc(a.id) + '" data-owner="' + esc(r.id) + '">' + esc(a.label) + "</button>"; }).join("") + (m.ops || []).map(function (a) { return '<button class="e6-btn" data-op="' + esc(a.id) + '">' + esc(a.label) + "</button>"; }).join("") + "</div>";
  }
  function wireDetail(m) {
    var root = el("dsBody"); if (!root) return;
    root.querySelectorAll("[data-action]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.dataset.action === "a.install") {
          var s = PM2.mgrById["mgr.provider"].records.filter(function (x) { return x.id === "prov.codex-cli"; })[0];
          openDrawer("Install Codex CLI — explicit", "<b>Source:</b> " + esc(s.setup.source) + "<br><b>Host:</b> " + esc(s.setup.host) + "<br>Never bundled or silently installed. Authentication is separate." +
            '<div class="e6-actions" style="margin-top:8px"><button class="e6-btn primary" id="doInst">Install from official source</button></div><div id="iw"></div>');
          el("doInst").addEventListener("click", function () {
            var w = STORE.work({ kind: "install", label: "Install Codex CLI", phases: ["download", "verify", "install", "verify launch", "done"], steps: 12, fast: true, receipt: { summary: "Codex CLI installed — authenticate separately" } });
            var box = document.createElement("div"); box.className = "e6-work"; el("iw").appendChild(box);
            var un = STORE.subscribe("work", function () {
              box.innerHTML = "<b>" + esc(w.label) + "</b> — " + esc(w.note) + '<div class="bar"><div style="width:' + Math.round((w.phaseI + 1) / w.phases.length * 100) + '%"></div></div>';
              if (w.state === "done") { box.innerHTML += '<div class="e6-receipt" style="margin-top:6px">Installed. Next: authenticate separately.</div>'; un(); }
            });
          });
          return;
        }
        var rec = m.records.filter(function (x) { return x.id === b.dataset.owner; })[0] || { label: m.title };
        openDrawer(rec.label, "Action <b>" + esc(b.textContent.trim()) + "</b> routes to its canonical owner: typed payload, availability, revision + idempotency, permission, receipt, ObservableWork link, cancel/rollback, route/focus effect.");
      });
    });
    root.querySelectorAll("[data-op]").forEach(function (b) {
      b.addEventListener("click", function () {
        var w = STORE.work({ kind: "lifecycle", label: b.textContent.trim(), denominator: 12408, fast: true, receipt: { summary: b.textContent.trim() + " — completed with receipt" } });
        var box = document.createElement("div"); box.className = "e6-work"; b.parentElement.appendChild(box);
        function dd() {
          box.innerHTML = "<b>" + esc(w.label) + "</b> — " + esc(w.note) + (w.progress !== null ? ' <span class="v2kbd">' + w.done + "/" + w.denominator + "</span>" : "") + '<div class="bar"><div style="width:' + (w.progress || 0) + '%"></div></div>';
          if (w.state === "done" || w.state === "recovered") setTimeout(function () { box.remove(); }, 1400);
        }
        dd();
        var un = STORE.subscribe("work", function () { dd(); if (w.state === "done" || w.state === "recovered") un(); });
      });
    });
  }
  function provDetail(m, rid, tab) {
    var r = m.records.filter(function (x) { return x.id === rid; })[0] || m.records[0];
    var h = '<div class="dsub">' + esc(r.desc) + "</div>" + '<div class="e6-chips">' + chips(r) + "</div>";
    if (tab === "Installations" || r.setup) {
      h += '<table class="e6-table"><tr><th>Installation</th><th>Version</th><th>Owner · confidence</th><th>State</th></tr>';
      m.installations.forEach(function (i) { h += "<tr><td>" + esc(i.label) + "</td><td>" + esc(i.version || "—") + "</td><td class='mut'>" + esc((i.owner || "—") + " · " + (i.confidence || "")) + "</td><td><span class=\"v2badge " + (i.state === "selected" ? "ok" : i.state === "shadowed" ? "info" : "warn") + '">' + esc(i.state) + "</span></td></tr>"; });
      h += "</table>";
      h += '<div class="e6-offline" style="margin-top:8px"><span class="sdot warn"></span>One installation is <b>selected</b>; the other is shadowed. Unknown owner stays manual-only.</div>';
      if (r.setup) { h += '<div class="e6-setup"><h4>Setup — explicit, official source</h4><ol>' + r.setup.steps.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ol></div>"; }
    } else if (tab === "Models" && r.models) {
      h += '<table class="e6-table"><tr><th>Model</th><th>Capabilities</th><th>Context</th></tr>' + r.models.map(function (mm) { return "<tr><td><b>" + esc(mm.label) + "</b>" + (mm.selected ? ' <span class="v2badge ok">selected</span>' : "") + "</td><td class='mut'>" + esc(mm.caps.join(" · ")) + "</td><td class='mut'>" + esc(mm.ctx) + "</td></tr>"; }).join("") + "</table>";
    } else if (tab === "Routing & fallback") {
      h += '<table class="e6-table"><tr><th>Route</th><th>Requested</th><th>Effective</th><th>Why</th></tr>' + m.routing.rows.map(function (x) { return "<tr><td><b>" + esc(x.label) + "</b></td><td>" + esc(x.requested) + "</td><td>" + esc(x.effective) + "</td><td class='mut'>" + esc(x.why || "—") + "</td></tr>"; }).join("") + "</table>";
    } else if (tab === "Usage") {
      if (rid === "prov.deepseek-key") h += '<div class="e6-offline"><span class="sdot warn"></span>Provider ready — Usage unavailable (503). Last-known-good from 2026-08-16.</div>';
      h += '<table class="e6-table"><tr><th>Connection</th><th>Usage</th></tr>' + m.usage.rows.map(function (u) { return "<tr><td><b>" + esc(u[0]) + "</b></td><td class='mut'>" + esc(u[1]) + "</td></tr>"; }).join("") + "</table>";
    } else {
      (r.detail || []).forEach(function (x) { h += '<div class="e6-kv"><span class="k">' + esc(x[0]) + "</span><span class='v'>" + esc(x[1]) + "</span></div>"; });
    }
    h += acts(m, r);
    return h;
  }
  function genDetail(m, r, tab) {
    if (!r) return '<div class="e6-drop-empty">No records</div>';
    var h = '<div class="dsub">' + esc(r.desc || m.blurb) + "</div>" + '<div class="e6-chips">' + chips(r) + "</div>";
    (r.detail || []).forEach(function (x) { h += '<div class="e6-kv"><span class="k">' + esc(x[0]) + "</span><span class='v'>" + esc(x[1]) + "</span></div>"; });
    if (r.palette) h += '<div style="display:flex;gap:5px;margin:6px 0">' + r.palette.map(function (c) { return '<span style="width:22px;height:22px;border-radius:5px;border:1px solid var(--line);background:' + c + '"></span>'; }).join("") + "</div>";
    if (m.filesafe && m.id === "mgr.permissions") h += '<div class="e6-kv"><span class="k">FileSafe</span><span class="v">Boundary <b>' + esc(m.filesafe.boundary) + "</b> · protected " + esc(m.filesafe.protected.join(", ")) + "</span></div>";
    if (m.note) h += '<div class="e6-offline" style="border-color:var(--line)"><span class="sdot info"></span>' + esc(m.note) + "</div>";
    h += acts(m, r);
    if (r.work) h += '<button class="e6-btn primary" data-op="a.rebuild" style="margin-top:6px">' + PM2.svg("refresh", 12) + " " + esc(r.work.denominator) + " — run with progress</button>";
    return h;
  }

  /* drawer */
  function openDrawer(title, html) { el("drawerTitle").textContent = title; el("drawerBody").innerHTML = html; el("drawer").dataset.open = "1"; }
  function closeDrawer() { el("drawer").dataset.open = "0"; }
  el("drawerClose").addEventListener("click", closeDrawer);

  /* COPY — quiet dialog */
  var COPY = { open: false, step: 0, src: null, cats: [], preview: null, result: null };
  function openCopy() {
    COPY.open = true; COPY.step = 0; COPY.src = null; COPY.cats = PM2.copyCategories.map(function (c) { return c.id; }); COPY.preview = null; COPY.result = null;
    var veil = document.createElement("div"); veil.className = "e6-veil"; veil.id = "copyVeil";
    veil.innerHTML = '<div class="e6-copy" role="dialog" aria-modal="true" aria-label="Copy settings from another project"><div class="e6-copy-head"><h3>Copy settings from another project</h3><span style="flex:1"></span><button class="e6-tb" id="copyX">' + PM2.svg("close", 12) + "Close</button></div><div class=\"e6-copy-body v2-surface\" id=\"copyBody\"></div><div class=\"e6-copy-foot\" id=\"copyFoot\"></div></div>";
    sheet.parentElement.appendChild(veil);
    el("copyX").addEventListener("click", copyClose);
    drawCopy();
  }
  function copyClose() { COPY.open = false; var v = el("copyVeil"); if (v) v.remove(); }
  function drawCopy() {
    var b = el("copyBody"), f = el("copyFoot"); if (!b) return;
    if (COPY.step === 0) {
      b.innerHTML = '<div class="e6-step">1 of 4 · Source project</div><div class="e6-lede" style="margin-bottom:10px">A one-time copy. Projects stay independent — no link, no sync, no profiles.</div>' +
        PM2.projects.filter(function (p) { return !p.current; }).map(function (p) {
          return '<div class="e6-src" data-src="' + p.id + '" aria-selected="' + (COPY.src === p.id) + '"><div><b>' + esc(p.name) + '</b><div style="font-size:11.5px;color:var(--ink-3)">' + esc(p.path) + " · " + p.changedCount + " changed</div></div><span class=\"v2badge\">" + p.attention + " attention</span></div>";
        }).join("");
      f.innerHTML = '<span style="font-size:11.5px;color:var(--ink-3)">Into <b>' + esc(PM2.currentProject.name) + "</b></span><span class='sp'></span><button class=\"e6-tb\" id=\"copyNext\"" + (COPY.src ? "" : " disabled style='opacity:.5'") + ">Choose categories</button>";
      b.querySelectorAll("[data-src]").forEach(function (s) { s.addEventListener("click", function () { COPY.src = s.dataset.src; drawCopy(); }); });
      var n = el("copyNext"); if (n) n.addEventListener("click", function () { COPY.step = 1; drawCopy(); });
    } else if (COPY.step === 1) {
      b.innerHTML = '<div class="e6-step">2 of 4 · Categories</div><div class="e6-cats">' + PM2.copyCategories.map(function (c) {
        return '<div class="e6-cat" data-cat="' + c.id + '" aria-selected="' + (COPY.cats.indexOf(c.id) >= 0) + '"><span class="v2kbd" style="border-radius:5px">' + (COPY.cats.indexOf(c.id) >= 0 ? "✓" : "") + '</span><div><b style="font-size:13px">' + esc(c.title) + '</b><div style="font-size:11.5px;color:var(--ink-2)">' + esc(c.includes) + "</div></div></div>";
      }).join("") + "</div>";
      f.innerHTML = '<button class="e6-tb" id="copyBack">Back</button><span class="sp"></span><button class="e6-tb" id="copyNext">Preview</button>';
      b.querySelectorAll("[data-cat]").forEach(function (c) {
        c.addEventListener("click", function () {
          var id = c.dataset.cat, i = COPY.cats.indexOf(id);
          if (i >= 0) COPY.cats.splice(i, 1); else COPY.cats.push(id);
          c.setAttribute("aria-selected", COPY.cats.indexOf(id) >= 0);
          c.querySelector(".v2kbd").textContent = COPY.cats.indexOf(id) >= 0 ? "✓" : "";
        });
      });
      el("copyBack").addEventListener("click", function () { COPY.step = 0; drawCopy(); });
      el("copyNext").addEventListener("click", function () { COPY.preview = PM2.copyPreview(COPY.src, COPY.cats); COPY.step = 2; drawCopy(); });
    } else if (COPY.step === 2) {
      var t = COPY.preview.totals;
      b.innerHTML = '<div class="e6-step">3 of 4 · Preview</div>' +
        '<div class="e6-counts"><span class="e6-count"><b>' + t.additions + "</b> additions</span><span class=\"e6-count\"><b>" + t.replacements + "</b> replacements</span><span class=\"e6-count\"><b>" + t.unchanged + "</b> unchanged</span><span class=\"e6-count\"><b>" + t.unavailable + "</b> not copyable</span><span class=\"e6-count\"><b>" + t.conflicts + "</b> conflicts skipped</span></div>" +
        '<div class="e6-offline" style="border-color:var(--line)"><span class="sdot info"></span>' + esc(COPY.preview.credentialNote) + "</div>" +
        '<div class="e6-cplist v2-surface" id="cpList"></div>';
      var list = el("cpList"), rows = COPY.preview.rows, RH = 30, pad2 = document.createElement("div"), win2 = document.createElement("div");
      pad2.className = "v2-virt-pad"; win2.style.position = "relative"; list.append(pad2, win2);
      function draw2() {
        var w = PM2.window({ scrollTop: list.scrollTop, viewportHeight: 200, rowHeight: RH, total: rows.length });
        pad2.style.height = w.padTop + "px"; win2.style.transform = "translateY(" + w.padTop + "px)";
        var h = "";
        for (var i = w.first; i < w.first + w.count; i++) {
          var rr = rows[i]; if (!rr) break;
          var s = PM2.inventory.byId[rr.settingId];
          h += '<div style="height:' + RH + 'px;display:flex;align-items:center;gap:8px;font-size:11.5px;border-bottom:1px solid var(--line)"><span class="v2badge ' + (rr.kind === "additions" ? "ok" : rr.kind === "replacements" ? "info" : rr.kind === "conflicts" ? "warn" : rr.kind === "unavailable" ? "bad" : "") + '">' + rr.kind.replace(/s$/, "") + '</span><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(s ? s.label : rr.settingId) + "</span></div>";
        }
        win2.innerHTML = h;
      }
      draw2(); list.addEventListener("scroll", draw2);
      f.innerHTML = '<button class="e6-tb" id="copyBack">Back</button><span class="sp"></span><button class="e6-tb" id="copyGo" style="background:var(--accent);border-color:var(--accent);color:var(--accent-ink)">Restore point & apply</button>';
      el("copyBack").addEventListener("click", function () { COPY.step = 1; drawCopy(); });
      el("copyGo").addEventListener("click", function () {
        COPY.step = 3;
        b.innerHTML = '<div class="e6-step">4 of 4 · Applying…</div><div class="e6-work" id="cw"></div>'; f.innerHTML = "";
        var box = el("cw");
        var w = STORE.work({ kind: "copy", label: "Copy settings", phases: ["restore point", "apply", "verify"], steps: 10, fast: true });
        var un = STORE.subscribe("work", function () {
          box.innerHTML = "<b>" + esc(w.label) + "</b> — " + esc(w.note) + '<div class="bar"><div style="width:' + ((w.phaseI + 1) / 3 * 100) + '%"></div></div>';
          if (w.state === "done") {
            un();
            COPY.result = STORE.applyCopy(COPY.preview, COPY.cats);
            b.innerHTML = '<div class="e6-step">Done</div><div class="e6-receipt"><b>' + COPY.result.counts.applied + " values copied</b> · " + COPY.result.counts.skipped + " skipped.<br>Verified: " + COPY.result.verify.checked + " checked, " + COPY.result.verify.mismatches + " mismatches. Receipt <b>" + esc(COPY.result.receipt.id) + "</b> · restore point <b>" + esc(COPY.result.restorePoint.label) + "</b>.<br>" + COPY.result.verify.note + "</div>" +
              '<div class="e6-offline" style="border-color:var(--line);margin-top:8px"><span class="sdot ok"></span><b>' + esc(PM2.currentProject.name) + "</b> and <b>" + esc(COPY.preview.source.name) + "</b> are independent. Nothing propagates later.</div>";
            f.innerHTML = '<button class="e6-tb" id="copyRoll">Rollback</button><span class="sp"></span><button class="e6-tb" id="copyDone" style="background:var(--accent);border-color:var(--accent);color:var(--accent-ink)">Done</button>';
            el("copyRoll").addEventListener("click", function () { STORE.rollback(COPY.result.restorePoint.id); openDrawer("Rollback complete", "Values restored to the pre-copy restore point. Receipt recorded."); copyClose(); });
            el("copyDone").addEventListener("click", copyClose);
          }
        });
      });
    }
  }

  /* boot */
  var initial = PM2.routes.parse(location.hash);
  if (initial.domain || initial.manager || initial.mode) NAV.stack = [Object.assign({ domain: null }, initial)];
  render(NAV.top());
  if (initial.row || initial.object || initial.query) land(PM2.routes.planFor(initial), PM2.search.byRid(initial.resultId || "") || null);
  searchAttach(el("miniSearch"));
  window.__C6 = { PM2: PM2, STORE: STORE, NAV: NAV, state: state, pickResult: pickResult };
})();