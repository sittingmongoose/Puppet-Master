(function () {
  "use strict";
  var PX = "to";
  var LAYOUT = "tabbed-organizer";
  var ROOT_ID = "to-root";
  var esc = window.PMv2.esc;
  var appRef = null;
  var virt = null;
  var scrolls = {};
  var allFilter = "";
  var includeSynth = false;

  function searchById(app, q) {
    q = String(q == null ? "" : q).trim();
    if (!q) return [];
    var hit = app.getResult ? app.getResult(q) : (window.PMv2 && window.PMv2.getResult(q));
    if (!hit && q.indexOf(":") === -1) {
      var prefixes = ["setting:", "manager:", "domain:", "page:", "action:", "object:", "unavailable:", "workflow:"];
      var i;
      for (i = 0; i < prefixes.length && !hit; i++) {
        hit = app.getResult ? app.getResult(prefixes[i] + q) : (window.PMv2 && window.PMv2.getResult(prefixes[i] + q));
      }
    }
    if (!hit) return [];
    return [{
      id: hit.id,
      type: hit.type,
      label: hit.label,
      path: hit.path,
      dest: hit.dest,
      availability: hit.availability,
      score: 1000,
      synthetic: !!hit.synthetic
    }];
  }

  function applyQuery(app, q) {
    app.query = q;
    app.searchOpen = true;
    var exact = searchById(app, q);
    var fuzzy = (app.searchIndex || window.PMv2.search)(q) || [];
    if (exact.length) {
      var id = exact[0].id;
      app.results = exact.concat(fuzzy.filter(function (r) { return r.id !== id; }));
      app.selectedResultId = id;
    } else {
      app.results = fuzzy;
      if (fuzzy.length) app.selectedResultId = fuzzy[0].id;
    }
    app.paint();
  }

  var RECENT = [
    { title: "Theme", detail: "Last changed on this project", destId: "setting:general.visual.theme" },
    { title: "Default account", detail: "Anthropic · work@studio", destId: "action:retry-default-account" },
    { title: "FileSafe rules", detail: "Writes limited in src", destId: "manager:permissions" }
  ];

  var DEMO_STATES = [
    "loading-cached", "empty", "no-search-results", "typo-fuzzy", "validation-error",
    "offline", "managed", "unavailable", "restart-required", "reconnect-required",
    "changed-elsewhere", "import-conflict", "rollback-complete", "usage-unavailable",
    "multi-install", "unknown-owner", "provider-update", "verification-failure"
  ];

  function searchIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor"/><path d="m20 20-3.5-3.5" fill="none" stroke="currentColor"/></svg>';
  }

  function routeKey(r) {
    r = r || {};
    return [r.name, r.domain, r.page, r.manager, r.object, r.deferred].join("/");
  }

  function saveScroll(root) {
    var sheet = root.querySelector("." + PX + "-sheet");
    if (sheet && appRef) scrolls[routeKey(appRef.route)] = sheet.scrollTop;
  }

  function restoreScroll(root, app) {
    var sheet = root.querySelector("." + PX + "-sheet");
    if (!sheet) return;
    var y = scrolls[routeKey(app.route)];
    if (typeof y === "number") sheet.scrollTop = y;
  }

  function depthOf(app) {
    var n = (app.stack || []).length;
    if (n > 3) n = 3;
    return n;
  }

  function crumb(app) {
    var r = app.route || { name: "home" };
    var bits = ['<button type="button" data-act="home"' + (r.name === "home" ? ' aria-current="page"' : "") + ">Settings</button>"];
    if (r.domain && app.cat(r.domain)) {
      bits.push('<span aria-hidden="true">/</span>');
      bits.push('<button type="button" data-act="domain" data-id="' + esc(r.domain) + '"' + (!r.manager && r.name === "domain" && !r.page ? ' aria-current="page"' : "") + ">" + esc(app.cat(r.domain).title) + "</button>");
    }
    if (r.page && r.name === "domain") {
      var sub = ((app.cat(r.domain) || {}).subgroups || []).filter(function (s) { return s.id === r.page; })[0];
      bits.push('<span aria-hidden="true">/</span>');
      bits.push('<span>' + esc(sub ? sub.title : r.page) + "</span>");
    }
    if (r.manager && app.mgr(r.manager)) {
      bits.push('<span aria-hidden="true">/</span>');
      bits.push('<span>' + esc(app.mgr(r.manager).title) + "</span>");
    }
    if (r.object) {
      var objs = app.objectsFor(r.manager) || [];
      var obj = objs.filter(function (o) { return o.id === r.object; })[0];
      bits.push('<span aria-hidden="true">/</span>');
      bits.push("<span>" + esc(obj ? obj.label : r.object) + "</span>");
    }
    if (r.name === "all") {
      bits.push('<span aria-hidden="true">/</span><span>All Settings</span>');
    }
    if (r.name === "copy") {
      bits.push('<span aria-hidden="true">/</span><span>Copy from another project</span>');
    }
    if (r.name === "deferred") {
      bits.push('<span aria-hidden="true">/</span><span>Owner module</span>');
    }
    return bits.join("");
  }

  function backLabel(app) {
    if (!app.stack || !app.stack.length) return "Back to Settings Home";
    var prev = app.stack[app.stack.length - 1].route || { name: "home" };
    if (prev.name === "home") return "Back to Settings Home";
    if (prev.manager && app.mgr(prev.manager)) return "Back to " + app.mgr(prev.manager).title;
    if (prev.domain && app.cat(prev.domain)) return "Back to " + app.cat(prev.domain).title;
    if (prev.name === "all") return "Back to All Settings";
    if (prev.name === "copy") return "Back to Copy";
    return "Back";
  }

  function notice(app) {
    var f = app.flags || {};
    if (f.offline) return '<div class="' + PX + '-notice">Offline. Cached values stay visible; refresh waits for network.</div>';
    if (f.importConflict) return '<div class="' + PX + '-notice">Import conflict. Two rows are paused until you choose a side.</div>';
    if (f.reconnect) return '<div class="' + PX + '-notice">Reconnect required for Google AI. Other project settings are unchanged.</div>';
    if (f.restart) return '<div class="' + PX + '-notice">Restart required before this change applies to new runs.</div>';
    if (f.changedElsewhere) return '<div class="' + PX + '-notice" data-kind="warn">A value changed elsewhere. This project still shows the last saved copy.</div>';
    if (f.rollbackComplete) return '<div class="' + PX + '-notice" data-kind="warn">Rollback complete. Previous values for this project were restored.</div>';
    return "";
  }

  function chrome(app) {
    var q = esc(app.query || "");
    var drop = "";
    if (app.searchOpen) {
      var hits = (app.results || []).slice(0, 24);
      if (!hits.length && app.query) {
        drop = '<div class="' + PX + '-drop pmv2-scroll" role="listbox"><div class="' + PX + '-hit">No matching settings</div></div>';
      } else if (hits.length) {
        drop = '<div class="' + PX + '-drop pmv2-scroll" role="listbox">' + hits.map(function (h) {
          var sel = h.id === app.selectedResultId ? "true" : "false";
          var avail = h.availability && h.availability !== "ready" ? " · " + esc(h.availability.replace(/_/g, " ")) : "";
          return '<button type="button" class="' + PX + '-hit" role="option" aria-selected="' + sel + '" data-act="pick" data-id="' + esc(h.id) + '"><b>' + esc(h.label) + '</b><span class="path">' + esc(h.path) + '</span><span class="meta">' + esc((h.type || "").replace(/_/g, " ")) + avail + "</span></button>";
        }).join("") + "</div>";
      }
    }
    var states = "";
    if (app.statesOpen) {
      states = '<div class="' + PX + '-states-panel pmv2-scroll" role="dialog" aria-label="Demo states">' + DEMO_STATES.map(function (n) {
        return '<button type="button" data-act="state" data-id="' + n + '">' + esc(n.replace(/-/g, " ")) + "</button>";
      }).join("") + "</div>";
    }
    return '<div class="' + PX + '-chrome">' +
      '<div class="' + PX + '-searchwrap">' + searchIcon() +
      '<input data-search type="search" placeholder="Search settings, managers, and setups" value="' + q + '" aria-label="Universal settings search" aria-expanded="' + (app.searchOpen ? "true" : "false") + '" autocomplete="off" spellcheck="false">' +
      drop + "</div>" +
      '<span class="' + PX + '-proj">Project · ' + esc(app.project.name) + "</span>" +
      '<button type="button" class="' + PX + '-back" data-act="back">' + esc(backLabel(app)) + "</button>" +
      '<div class="' + PX + '-crumb">' + crumb(app) + "</div>" +
      '<button type="button" class="' + PX + '-states" data-act="states">Demo states</button>' +
      '<button type="button" class="' + PX + '-close" data-act="close">Close Settings</button>' +
      states + "</div>" + notice(app);
  }

  function categoryTabs(app, current) {
    return '<nav class="' + PX + '-tabs pmv2-scroll" role="tablist" aria-label="Settings categories">' +
      (app.categories || []).map(function (c) {
        var on = c.id === current;
        return '<button type="button" role="tab" aria-selected="' + (on ? "true" : "false") + '" data-act="domain" data-id="' + esc(c.id) + '">' + esc(c.title) + "</button>";
      }).join("") + "</nav>";
  }

  function locationStrip(app) {
    var r = app.route || { name: "home" };
    var chips = ['<button type="button" data-act="home">Home</button>'];
    if (r.name === "home") chips = ['<span class="now">Home</span>'];
    if (r.domain && app.cat(r.domain)) {
      chips.push('<button type="button" data-act="domain" data-id="' + esc(r.domain) + '">' + esc(app.cat(r.domain).title) + "</button>");
    }
    if (r.manager && app.mgr(r.manager)) {
      chips.push('<span class="now">' + esc(app.mgr(r.manager).title) + "</span>");
    } else if (r.name === "all") {
      chips.push('<span class="now">All Settings</span>');
    } else if (r.name === "copy") {
      chips.push('<span class="now">Copy</span>');
    } else if (r.name === "deferred") {
      var d = (app.deferred || []).filter(function (x) { return x.id === r.deferred; })[0];
      chips.push('<span class="now">' + esc(d ? d.title : "Owner module") + "</span>");
    } else if (r.name === "domain" && app.cat(r.domain)) {
      chips[chips.length - 1] = '<span class="now">' + esc(app.cat(r.domain).title) + "</span>";
    }
    return '<div class="' + PX + '-loc" aria-label="Location">' + chips.join("") + "</div>";
  }

  function workBox(app) {
    if (!app.work) return "";
    var w = app.work;
    var bar = "";
    if (w.progress_kind === "determinate") bar = "<div>" + esc(w.completed) + " / " + esc(w.total) + " · " + esc(w.progress_source) + "</div>";
    else if (w.progress_kind !== "none") bar = "<div>Progress unknown · " + esc(w.progress_source) + "</div>";
    return '<div class="' + PX + '-work" data-ow-state="' + esc(w.state) + '"><strong>' + esc(w.title) + "</strong> — " + esc(w.human_phase) +
      (w.wait_reason ? " (waiting: " + esc(w.wait_reason) + ")" : "") + bar +
      (w.message ? "<div>" + esc(w.message) + "</div>" : "") + "</div>";
  }

  function control(app, id) {
    var m = app.controlModel(id);
    if (!m) return "";
    var ctl = "";
    if (m.type === "toggle") {
      ctl = '<button type="button" data-act="toggle" data-id="' + esc(id) + '" aria-pressed="' + (m.value ? "true" : "false") + '"' + (m.disabled ? " disabled" : "") + ">" + (m.value ? "On" : "Off") + "</button>";
    } else if (m.type === "select" || m.type === "radio" || m.type === "multiselect") {
      ctl = '<select data-act="select" data-id="' + esc(id) + '"' + (m.disabled ? " disabled" : "") + ">" + (m.options || []).map(function (o) {
        return '<option value="' + esc(o) + '"' + (String(m.value) === String(o) ? " selected" : "") + ">" + esc(o) + "</option>";
      }).join("") + "</select>";
    } else if (m.type === "number" || m.type === "slider") {
      ctl = '<input data-act="number" data-id="' + esc(id) + '" type="number" value="' + esc(m.value == null ? "" : m.value) + '"' + (m.disabled ? " disabled" : "") + ">";
    } else if (m.type === "action") {
      ctl = '<button type="button" data-act="do" data-id="' + esc(id) + '"' + (m.disabled ? " disabled" : "") + ">Run</button>";
    } else {
      ctl = '<input data-act="text" data-id="' + esc(id) + '" type="text" value="' + esc(m.value == null ? "" : m.value) + '"' + (m.disabled ? " disabled" : "") + ">";
    }
    return '<div class="' + PX + '-row" data-row-id="' + esc(id) + '"><div><label>' + esc(m.label) + "</label><p>" + esc(m.desc) + "</p>" +
      (m.reason ? '<p class="' + PX + '-muted">' + esc(m.reason) + "</p>" : "") +
      '<button type="button" class="' + PX + '-why" data-act="why" data-id="' + esc(id) + '">Why this value?</button></div><div>' + ctl + "</div></div>";
  }

  function groupedControls(app, rows) {
    if (!rows.length) return '<p class="' + PX + '-muted">No settings on this page.</p>';
    var html = "";
    var i;
    for (i = 0; i < rows.length; i += 6) {
      html += "<h2>" + (i === 0 ? "On this page" : "More on this page") + "</h2>";
      html += rows.slice(i, i + 6).map(function (s) { return control(app, s.id); }).join("");
    }
    return html;
  }

  function attention(app) {
    if (app.flags.empty) return '<p class="' + PX + '-muted">Nothing needs attention.</p>';
    var items = app.attention || [];
    return '<div class="' + PX + '-att">' + items.map(function (a) {
      return '<button type="button" data-act="pick" data-id="' + esc(a.destId) + '"><strong>' + esc(a.title) + '</strong><div class="' + PX + '-muted">' + esc(a.detail) + "</div></button>";
    }).join("") + "</div>";
  }

  function recent(app) {
    if (app.flags.empty) return '<p class="' + PX + '-muted">No recent changes in this project.</p>';
    return '<div class="' + PX + '-recent">' + RECENT.map(function (a) {
      return '<button type="button" data-act="pick" data-id="' + esc(a.destId) + '"><strong>' + esc(a.title) + '</strong><div class="' + PX + '-muted">' + esc(a.detail) + "</div></button>";
    }).join("") + "</div>";
  }

  function utils() {
    return '<div class="' + PX + '-utils"><button type="button" data-act="all">All Settings</button><button type="button" data-act="copy">Copy Settings From Another Project</button></div>';
  }

  function homeSheet(app) {
    return '<div class="' + PX + '-inner pmv2-scroll">' +
      '<p class="' + PX + '-muted">Project ' + esc(app.project.name) + "</p>" +
      '<h1 class="' + PX + '-h1">Settings</h1>' +
      '<p class="' + PX + '-lede">Search first. The twelve category tabs are this project’s settings map. Copy from another project is a one-time action — not a live link.</p>' +
      '<div class="' + PX + '-map" aria-label="Category tabs">' + (app.categories || []).map(function (c) {
        return '<button type="button" data-act="domain" data-id="' + esc(c.id) + '"><strong>' + esc(c.title) + "</strong><span>" + esc(c.description || "") + "</span></button>";
      }).join("") + "</div>" +
      workBox(app) +
      "<h2>Needs attention</h2>" + attention(app) +
      "<h2>Recent in this project</h2>" + recent(app) +
      utils() +
      "</div>";
  }

  function pageTabs(app, cat, page) {
    return '<div class="' + PX + '-ptabs" role="tablist" aria-label="Pages">' +
      (cat.subgroups || []).map(function (sg) {
        return '<button type="button" role="tab" aria-selected="' + (sg.id === page ? "true" : "false") + '" data-act="page" data-domain="' + esc(cat.id) + '" data-id="' + esc(sg.id) + '">' + esc(sg.title) + "</button>";
      }).join("") + "</div>";
  }

  function relatedStrip(app, domainId, currentMgr) {
    var mgrs = app.domainManagers[domainId] || [];
    var deferred = domainId === "system" || domainId === "general"
      ? (app.deferred || []).filter(function (d) { return d.domain === domainId || (domainId === "system" && d.domain === "system"); })
      : [];
    if (!mgrs.length && !deferred.length) return "";
    var html = '<div class="' + PX + '-rel" aria-label="Related managers"><span class="k">Related</span>';
    html += mgrs.map(function (id) {
      var m = app.mgr(id);
      return '<button type="button" data-act="manager" data-id="' + esc(id) + '"' + (id === currentMgr ? ' aria-current="true"' : "") + ">" + esc(m ? m.title : id) + "</button>";
    }).join("");
    html += deferred.map(function (d) {
      return '<button type="button" data-act="deferred" data-id="' + esc(d.id) + '">' + esc(d.title) + "</button>";
    }).join("");
    return html + "</div>";
  }

  function domainSheet(app) {
    var c = app.cat(app.route.domain) || { title: "Settings", subgroups: [], description: "", id: app.route.domain };
    var page = app.route.page || ((c.subgroups || [])[0] || {}).id;
    var rows = app.settingsForPage(c.id, page);
    return '<div class="' + PX + '-inner">' +
      '<h1 class="' + PX + '-h1">' + esc(c.title) + "</h1>" +
      '<p class="' + PX + '-lede">' + esc(c.description || "") + "</p>" +
      workBox(app) +
      pageTabs(app, c, page) +
      relatedStrip(app, c.id, null) +
      groupedControls(app, rows) +
      "</div>";
  }

  function humanAvail(v) {
    return String(v || "ready").replace(/_/g, " ");
  }

  function providerConnected(obj) {
    if (window.PMv2 && typeof window.PMv2.providerConnected === "function") return window.PMv2.providerConnected(obj);
    var a = String((obj && obj.availability) || "ready");
    if (a === "ready") return "Connected for this project";
    if (a === "setup_required") return "Not connected — setup required";
    if (a === "reconnect_required") return "Installed, reconnect required";
    return a.replace(/_/g, " ");
  }

  function providerUsageEnd(obj) {
    if (window.PMv2 && typeof window.PMv2.providerUsageEnd === "function") return window.PMv2.providerUsageEnd(obj);
    var a = String((obj && obj.availability) || "ready");
    if (a === "setup_required") return "Nothing to decide until it is set up.";
    if (a === "reconnect_required") return "Reconnect first. Cached usage is stale.";
    var usage = String((obj && obj.usage) || "");
    if (/pay-as-you-go/i.test(usage)) return "Continue on pay-as-you-go. Settings owns this choice; Usage owns the metered balance.";
    if (/unavailable/i.test(usage)) return "Nothing to decide until usage is reported.";
    return "Ask each time. Settings owns what happens when included usage ends; Usage owns the remaining balance.";
  }

  function providerRouting(obj) {
    if (window.PMv2 && typeof window.PMv2.providerRouting === "function") return window.PMv2.providerRouting(obj);
    var a = String((obj && obj.availability) || "ready");
    if (a === "setup_required") return "No route until setup finishes. Fallback is not armed.";
    if (a === "reconnect_required") return "Requested route stays this account; fallback waits until reconnect.";
    return "Follows this project's order of preference. Exhausted included usage may fall back to the next ready route.";
  }

  function providerTabLabel(t) {
    if (t === "usage") return "When included usage ends";
    if (t === "accounts") return "Routing / fallback";
    return String(t || "").replace(/_/g, " ");
  }


  function fmtCopyVal(v) {
    if (v == null || v === "") return "—";
    if (typeof v === "boolean") return v ? "On" : "Off";
    if (Array.isArray(v)) return v.join(", ");
    return String(v);
  }

  function factRow(key, value, rowId) {
    return '<div class="' + PX + '-fact"' + (rowId ? ' data-row-id="' + esc(rowId) + '"' : "") + '><span class="k">' + esc(key) + "</span><span>" + esc(value || "—") + "</span></div>";
  }

  function copyPreviewLists(p) {
    if (!p) return "";
    var counts = p.counts || {};
    var trunc = p.truncated || {};
    function itemRow(item, showChange) {
      var change = showChange
        ? '<span class="' + PX + '-copy-from">' + esc(fmtCopyVal(item.from)) + '</span><span class="' + PX + '-copy-arrow" aria-hidden="true">→</span><span class="' + PX + '-copy-to">' + esc(fmtCopyVal(item.to)) + "</span>"
        : '<span class="' + PX + '-copy-same">' + esc(fmtCopyVal(item.to != null ? item.to : item.from)) + "</span>";
      return '<div class="' + PX + '-copy-row" data-kind="' + esc(item.kind || "") + '">' +
        "<div><strong>" + esc(item.label || item.id) + '</strong><span class="' + PX + '-muted">' + esc(item.path || "") + "</span></div>" +
        change +
        (item.reason ? '<span class="' + PX + '-muted">' + esc(item.reason) + "</span>" : "") +
        "</div>";
    }
    function noteRow(item, kind) {
      return '<div class="' + PX + '-copy-row" data-kind="' + esc(kind) + '"><div><strong>' + esc(item.label || item.id) + "</strong></div>" +
        '<span class="' + PX + '-muted">' + esc(item.reason || "") + "</span></div>";
    }
    function block(title, kind, items, moreCount, rowFn) {
      items = items || [];
      var count = counts[kind] != null ? counts[kind] : items.length;
      var body = items.length ? items.map(rowFn).join("") : '<p class="' + PX + '-muted">None</p>';
      var more = moreCount > 0 ? '<p class="' + PX + '-copy-more ' + PX + '-muted">' + moreCount + " more not shown</p>" : "";
      return '<section class="' + PX + '-copy-block" data-kind="' + esc(kind) + '">' +
        "<h3>" + esc(title) + ' <span class="' + PX + '-muted">(' + count + ")</span></h3>" +
        '<div class="' + PX + '-copy-rows">' + body + "</div>" + more + "</section>";
    }
    return block("Replacements", "replacements", p.replacementItems, trunc.replacements, function (item) { return itemRow(item, true); }) +
      block("Additions", "additions", p.additionItems, trunc.additions, function (item) { return itemRow(item, true); }) +
      block("Unchanged", "unchanged", p.unchangedItems, trunc.unchanged, function (item) { return itemRow(item, false); }) +
      block("Unavailable", "unavailable", p.unavailable, 0, function (item) { return noteRow(item, "unavailable"); }) +
      block("Conflicts", "conflicts", p.conflicts, 0, function (item) { return noteRow(item, "conflict"); });
  }

  function copyReceiptFacts(r) {
    if (!r) return "";
    var c = r.counts || {};
    return '<div class="' + PX + '-facts">' +
      factRow("Applied", r.at) +
      factRow("Source", r.source) +
      factRow("Restore point", r.restorePointAt) +
      factRow("Verified", r.verified ? "Yes" : "No") +
      factRow("Counts", "Additions " + (c.additions || 0) + " · Replacements " + (c.replacements || 0) + " · Unchanged " + (c.unchanged || 0) + " · Unavailable " + (c.unavailable || 0) + " · Conflicts " + (c.conflicts || 0)) +
      factRow("Backend", (r.simulated ? "Simulated · " : "") + (r.backend || "sessionStorage")) +
      "</div>";
  }

  function detailsDrawer(app) {
    if (!app.detailsId) return "";
    var d = app.settingDetails(app.detailsId);
    if (!d) return "";
    var origin = d.origin || {};
    return '<aside class="' + PX + '-details pmv2-scroll" data-details-drawer role="dialog" aria-label="Setting details">' +
      '<div class="' + PX + '-details-head">' +
      "<h2>Details</h2>" +
      '<button type="button" class="' + PX + '-details-close" data-act="details-close">Close</button>' +
      "</div>" +
      '<p class="' + PX + '-muted">' + esc(d.label) + "</p>" +
      (d.desc ? '<p class="' + PX + '-lede">' + esc(d.desc) + "</p>" : "") +
      '<div class="' + PX + '-facts">' +
      factRow("Requested", fmtCopyVal(d.requested)) +
      factRow("Effective", fmtCopyVal(d.effective)) +
      factRow("Origin", origin.label || "—") +
      factRow("Policy floor", d.policyFloor || "—") +
      factRow("Persistence", "Current project") +
      factRow("Scope", d.scopeNote) +
      factRow("Backend", (d.simulated ? "Simulated · " : "") + (d.backend || "sessionStorage")) +
      "</div></aside>";
  }

  function managerSheet(app) {
    var m = app.mgr(app.route.manager);
    if (!m) return '<div class="' + PX + '-inner"><p>Missing manager</p></div>';
    app.hydrateManager(m.id);
    var objs = app.objectsFor(m.id);
    var obj = objs.filter(function (o) { return o.id === app.route.object; })[0] || objs[0];
    var tab = app.route.page || (m.tabs && m.tabs[0]) || "overview";
    var tabs = '<div class="' + PX + '-ptabs" role="tablist" aria-label="Detail tabs">' +
      (m.tabs || []).map(function (t) {
        var label = m.id === "providers" ? providerTabLabel(t) : t.replace(/_/g, " ");
        return '<button type="button" role="tab" aria-selected="' + (t === tab ? "true" : "false") + '" data-act="mtab" data-id="' + esc(t) + '">' + esc(label) + "</button>";
      }).join("") + "</div>";
    var roster = objs.map(function (o) {
      return '<button type="button" data-act="object" data-id="' + esc(o.id) + '"' + (obj && o.id === obj.id ? ' aria-current="true"' : "") + ">" +
        esc(o.label) + "<small>" + esc(humanAvail(o.availability)) + "</small></button>";
    }).join("");
    var detail = "";
    if (m.id === "providers" && obj) {
      var usageVal = (app.flags && app.flags.usageUnavailable) ? "Usage unavailable" : (obj.usage || "—");
      detail = '<h1 class="' + PX + '-h1">' + esc(obj.label) + "</h1>" +
        '<p class="' + PX + '-lede">Connected state, selected account, models, usage-end behavior, routing/fallback, and setup for this project.</p>' +
        '<div class="' + PX + '-sum">' +
        [
          { k: "Connected", v: providerConnected(obj), row: "account-default" },
          { k: "Account", v: obj.account, row: "account-default" },
          { k: "Product", v: obj.product, row: "account-default" },
          { k: "Models", v: obj.models, row: "account-default" },
          { k: "When included usage ends", v: providerUsageEnd(obj), row: "usage-end" },
          { k: "Routing / fallback", v: providerRouting(obj), row: "routing-fallback" },
          { k: "Usage", v: usageVal, row: "usage-projection" },
          { k: "Setup", v: obj.setup, row: obj.id === "local-ollama" ? "install-official" : "account-default" }
        ].map(function (item) {
          return '<div class="' + PX + '-stat" data-row-id="' + esc(item.row) + '"><div class="' + PX + '-muted">' + esc(item.k) + "</div><strong>" + esc(item.v || "—") + "</strong></div>";
        }).join("") + "</div>";
      if (obj.id === "local-ollama") {
        detail += "<p>Ollama is not bundled. Install from the official Ollama source for This PC / Native Windows. Authentication is a separate step.</p>" +
          '<button type="button" data-act="install-official" data-id="local-ollama" data-row-id="install-official">Install from official source</button>';
      }
      if (tab === "installations") {
        detail += "<h2>Installations</h2>" + (app.installs || []).filter(function (i) {
          return i.provider === obj.id || obj.id === "anthropic";
        }).map(function (i) {
          return '<div data-row-id="' + esc(i.id) + '">' + esc(i.label) + " · " + esc(i.host) + " · " +
            (i.selected ? "Selected" : (i.shadowed ? "Shadowed" : "Available")) +
            (i.manualOnly ? " · Unknown owner — manual only" : "") + "</div>";
        }).join("");
      }
      if (tab === "usage") {
        detail += "<h2>When included usage ends</h2>" +
          '<p data-row-id="usage-end">' + esc(providerUsageEnd(obj)) + "</p>" +
          '<p class="' + PX + '-muted">Settings owns the continuation. Usage owns the projection and never writes this choice.</p>' +
          '<p data-row-id="usage-projection">Projection: ' + esc(usageVal) + "</p>";
      }
      if (tab === "accounts") {
        detail += "<h2>Routing / fallback</h2>" +
          '<p data-row-id="routing-fallback">' + esc(providerRouting(obj)) + "</p>" +
          '<p data-row-id="account-default">Selected account: ' + esc(obj.account || "—") + " · " + esc(obj.product || "—") + "</p>" +
          '<p class="' + PX + '-muted">Credentials stay on the account. Switching route does not copy secrets. Limits, logs, and catalogs stay on their own subpages.</p>';
      }
    } else {
      detail = '<h1 class="' + PX + '-h1">' + esc(m.title) + "</h1>" +
        '<p class="' + PX + '-lede">' + esc(m.purpose) + "</p>";
      if (obj) detail += '<div data-row-id="' + esc(obj.id) + '"><strong>' + esc(obj.label) + "</strong> · " + esc(obj.kind) + " · " + esc(humanAvail(obj.availability)) + "</div>";
    }
    var relatedSettings = app.settingsForPage(m.domain, null).slice(0, 8).map(function (s) { return control(app, s.id); }).join("");
    var extra = '<div class="' + PX + '-extra pmv2-scroll"><h2>On this project</h2>' + relatedSettings + "</div>";
    var showDetail = !!app.route.object;
    return '<div class="' + PX + '-inner is-wide">' +
      workBox(app) + relatedStrip(app, m.domain, m.id) + tabs +
      '<div class="' + PX + "-mgr" + (showDetail ? " is-detail" : "") + '">' +
      '<div class="' + PX + '-roster pmv2-scroll">' + roster + "</div>" +
      '<div class="' + PX + '-form pmv2-scroll">' + detail + "<h2>Project settings</h2>" + relatedSettings + "</div>" +
      extra + "</div></div>";
  }

  function allSheet(app) {
    var cur = allFilter;
    var facets = '<aside class="' + PX + '-facets pmv2-scroll"><h2>Filters</h2>' +
      '<button type="button" data-act="all-filter" data-id=""' + (!cur ? ' aria-current="true"' : "") + ">All categories</button>" +
      (app.categories || []).map(function (c) {
        return '<button type="button" data-act="all-filter" data-id="' + esc(c.id) + '"' + (cur === c.id ? ' aria-current="true"' : "") + ">" + esc(c.title) + "</button>";
      }).join("") +
      '<button type="button" data-act="synth">' + (includeSynth ? "Hide" : "Include") + " synthetic overlay</button></aside>";
    return '<div class="' + PX + "-all" + (app.route.row ? " is-detail" : "") + '">' + facets +
      '<div class="' + PX + '-list pmv2-scroll" data-all-list="1"></div></div>';
  }

  function copySheet(app) {
    var p = app.copyPreview();
    var srcs = (app.projects || []).filter(function (x) { return !x.current; }).map(function (x) {
      return '<button type="button" data-act="copy-src" data-id="' + esc(x.id) + '"' + (app.copy.sourceId === x.id ? ' aria-current="true"' : "") + ">" + esc(x.name) + "</button>";
    }).join("");
    var cats = (app.categories || []).map(function (c) {
      var on = (app.copy.categories || []).indexOf(c.id) !== -1;
      return '<label><input type="checkbox" data-act="copy-cat" data-id="' + esc(c.id) + '"' + (on ? " checked" : "") + "> " + esc(c.title) + "</label>";
    }).join("");
    var prev = "<p>Select a source project.</p>";
    if (p) {
      prev = "<p>Additions " + p.counts.additions + " · Replacements " + p.counts.replacements + " · Unchanged " + p.counts.unchanged + " · Unavailable " + p.counts.unavailable + " · Conflicts " + p.counts.conflicts + "</p>" +
        '<p class="' + PX + '-muted">Account and credential references copy. Secrets never copy. Projects stay independent. No ongoing sync.</p>' +
        '<p class="' + PX + '-muted">' + (p.simulated ? "Simulated · " : "") + esc(p.backend || "sessionStorage") + ". Copy, receipts, and rollback are not live ResourceGovernor.</p>" +
        copyPreviewLists(p);
    }
    var actions = "";
    if (app.copy.step === "receipt" && app.copy.receipt) {
      actions = copyReceiptFacts(app.copy.receipt) + "<button type='button' data-act='copy-rollback'>Roll back to restore point</button>";
    } else if (app.copy.step === "rolled_back") {
      actions = "<p>Rollback complete. This project’s previous values were restored.</p>";
    } else {
      actions = "<button type='button' data-act='copy-apply'>Create restore point and copy</button>";
    }
    var help = app.route.section === "help"
      ? "<p>Copy is previewed, restore-pointed, applied once, receipted, and rollback-capable. Source and destination stay independent.</p>"
      : "";
    return '<div class="' + PX + '-inner is-wide">' +
      '<h1 class="' + PX + '-h1">Copy Settings From Another Project</h1>' +
      "<p>One-time copy into <strong>" + esc(app.project.name) + "</strong>. No profiles, inheritance, or live link.</p>" +
      help + workBox(app) +
      '<div class="' + PX + '-panes">' +
      '<div class="' + PX + '-pane pmv2-scroll"><h2>Source project</h2><div class="' + PX + '-src">' + srcs + "</div></div>" +
      '<div class="' + PX + '-pane pmv2-scroll"><h2>Categories</h2><div class="' + PX + '-catsel">' + cats + "</div></div>" +
      '<div class="' + PX + '-pane pmv2-scroll"><h2>Preview</h2>' + prev + '<div class="' + PX + '-copy-actions">' + actions + "</div></div>" +
      "</div></div>";
  }

  function deferredSheet(app) {
    var d = (app.deferred || []).filter(function (x) { return x.id === app.route.deferred; })[0];
    if (!d) return '<div class="' + PX + '-inner"><p>Unknown owner module</p></div>';
    return '<div class="' + PX + '-inner">' +
      '<h1 class="' + PX + '-h1">' + esc(d.title) + "</h1>" +
      "<p>This destination is owned by <strong>" + esc(d.owner) + "</strong>. Settings does not invent a backend for it.</p>" +
      "<p>Return contract: Back restores the previous Settings location. Close Settings returns to the opening surface.</p>" +
      '<button type="button" data-act="back">Return to Settings</button></div>';
  }

  function wrapWorkspace(app, inner) {
    var r = app.route || { name: "home" };
    var current = r.name === "home" ? "" : r.domain;
    return categoryTabs(app, current) + locationStrip(app) +
      '<div class="' + PX + '-stack" data-depth="' + depthOf(app) + '">' +
      '<div class="' + PX + '-sheet ' + PX + '-scroll pmv2-scroll">' + inner + "</div></div>";
  }

  function body(app) {
    var r = app.route || { name: "home" };
    var inner = homeSheet(app);
    if (r.name === "domain") inner = domainSheet(app);
    else if (r.name === "manager") inner = managerSheet(app);
    else if (r.name === "all") inner = allSheet(app);
    else if (r.name === "copy") inner = copySheet(app);
    else if (r.name === "deferred") inner = deferredSheet(app);
    return wrapWorkspace(app, inner);
  }

  function pickSettingRow(app, el, id) {
    var rowId = (el && el.getAttribute("data-row-id")) || id || "";
    if (!rowId) return;
    if (String(rowId).indexOf("synthetic:") === 0) {
      app.pickResult(rowId);
      return;
    }
    if (app.routeSettingRow) app.routeSettingRow(rowId);
    else app.pickResult(app.rowResultId(rowId));
  }

  function fillAll(app, root) {
    var host = root.querySelector("[data-all-list]");
    if (!host) { virt = null; return; }
    var items = (window.PMv2.inventory.settings || []).filter(function (s) {
      if (allFilter && String(s.id).split(".")[0] !== allFilter) return false;
      return true;
    }).map(function (s) {
      return { id: s.id, label: s.label, path: s.id.split(".")[0] };
    });
    if (includeSynth) {
      var i;
      for (i = 0; i < 40; i++) {
        items.push({ id: "synthetic:stress-" + i, label: "Synthetic scale row " + i, path: "synthetic" });
      }
    }
    virt = window.PMv2.virtualList(host, items, 52, function (item) {
      var rid = app.rowResultId(item.id);
      return '<button type="button" class="' + PX + '-hit" data-act="row" data-id="' + esc(rid) + '" data-row-id="' + esc(item.id) + '"><b>' + esc(item.label) + "</b><span class='path'>" + esc(item.path) + "</span></button>";
    });
  }

  function goDomain(app, id) {
    var cat = app.cat(id) || {};
    var page = ((cat.subgroups || [])[0] || {}).id;
    app.navigate({ name: "domain", domain: id, page: page, section: page });
  }

  function bind(app, root) {
    var search = root.querySelector("[data-search]");
    if (search) {
      search.oninput = function () {
        applyQuery(app, search.value);
      };
      search.onkeydown = function (ev) {
        var list = app.results || [];
        if (!list.length) return;
        var ids = list.map(function (x) { return x.id; });
        var at = Math.max(0, ids.indexOf(app.selectedResultId));
        if (ev.key === "ArrowDown") {
          ev.preventDefault();
          app.selectedResultId = ids[Math.min(ids.length - 1, at + 1)];
          app.searchOpen = true;
          app.paint();
        } else if (ev.key === "ArrowUp") {
          ev.preventDefault();
          app.selectedResultId = ids[Math.max(0, at - 1)];
          app.searchOpen = true;
          app.paint();
        } else if (ev.key === "Enter") {
          ev.preventDefault();
          if (app.selectedResultId) app.pickResult(app.selectedResultId);
        }
      };
    }
    root.onclick = function (ev) {
      var el = ev.target.closest("[data-act]");
      if (!el) return;
      var act = el.getAttribute("data-act");
      var id = el.getAttribute("data-id");
      if (act === "back") app.back();
      else if (act === "home") {
        app.stack = [];
        app.route = { name: "home" };
        app.searchOpen = false;
        app.paint();
      } else if (act === "close") app.closeSettings();
      else if (act === "states") { app.statesOpen = !app.statesOpen; app.paint(); }
      else if (act === "state") app.triggerState(id);
      else if (act === "domain") goDomain(app, id);
      else if (act === "page") {
        app.navigate({ name: "domain", domain: el.getAttribute("data-domain"), page: id, section: id }, { replace: true });
      } else if (act === "manager") app.openManager(id);
      else if (act === "object") {
        app.navigate({
          name: "manager",
          domain: app.route.domain,
          manager: app.route.manager,
          object: id,
          page: app.route.page
        }, { replace: true });
      } else if (act === "mtab") {
        app.navigate({
          name: "manager",
          domain: app.route.domain,
          manager: app.route.manager,
          object: app.route.object,
          page: id
        }, { replace: true });
      } else if (act === "deferred") app.openDeferred(id);
      else if (act === "all") app.openAll();
      else if (act === "all-filter") { allFilter = id || ""; app.paint(); }
      else if (act === "copy") app.openCopy();
      else if (act === "pick") app.pickResult(id);
      else if (act === "row") pickSettingRow(app, el, id);
      else if (act === "toggle") {
        var cur = app.controlModel(id);
        app.setValue(id, !(cur && cur.value));
      } else if (act === "do") app.receipt("Ran " + id + " for this project (simulated).", "info");
      else if (act === "why") app.openDetails(id);
      else if (act === "details-close") app.closeDetails();
      else if (act === "install-official") {
        app.work = {
          title: "Install Ollama",
          human_phase: "Waiting for explicit Install",
          state: "waiting_user",
          wait_reason: "Official source confirmation",
          progress_kind: "none",
          progress_source: "provider setup",
          last_known_good: true,
          message: "Not bundled. Not silently installed."
        };
        app.receipt("Install starts only after you confirm the official source (simulated).", "info");
        app.paint();
      } else if (act === "copy-src") { app.copy.sourceId = id; app.copy.step = "preview"; app.paint(); }
      else if (act === "copy-apply") app.applyCopy();
      else if (act === "copy-rollback") app.rollbackCopy();
      else if (act === "synth") {
        includeSynth = !includeSynth;
        app.receipt("Synthetic overlay is labeled and excluded from product inventory search by default.", "info");
        app.paint();
      }
    };
    root.onchange = function (ev) {
      var el = ev.target.closest("[data-act]");
      if (!el) return;
      var act = el.getAttribute("data-act");
      var id = el.getAttribute("data-id");
      if (act === "select") app.setValue(id, el.value);
      else if (act === "number") app.setValue(id, Number(el.value));
      else if (act === "text") app.setValue(id, el.value);
      else if (act === "copy-cat") {
        var set = app.copy.categories ? app.copy.categories.slice() : [];
        if (el.checked && set.indexOf(id) === -1) set.push(id);
        if (!el.checked) set = set.filter(function (x) { return x !== id; });
        app.copy.categories = set;
        app.paint();
      }
    };
  }

  function render(app) {
    var root = document.getElementById(ROOT_ID);
    appRef = app;
    window.__pmv2App = app;
    if (virt && virt.dispose) virt.dispose();
    saveScroll(root);
    root.className = PX;
    root.setAttribute("data-layout", LAYOUT);
    root.setAttribute("data-route", (app.route && app.route.name) || "home");
    root.setAttribute("data-inventory-count", String(app.productSettingCount || 828));
    var keepSearch = document.activeElement && document.activeElement.getAttribute && document.activeElement.getAttribute("data-search") != null;
    var caret = keepSearch ? document.activeElement.selectionStart : null;
    root.innerHTML = chrome(app) + '<div class="' + PX + '-body">' + body(app) + detailsDrawer(app) + "</div>";
    bind(app, root);
    fillAll(app, root);
    restoreScroll(root, app);
    if (keepSearch) {
      var searchEl = root.querySelector("[data-search]");
      if (searchEl) {
        searchEl.focus();
        try { if (caret != null) searchEl.setSelectionRange(caret, caret); } catch (e) {}
      }
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (window.PMShell) window.PMShell.init();
    var app = window.PMv2.createApp({ namespace: "c11", root: document.getElementById(ROOT_ID), render: render });
    var baseEscape = app.handleEscape;
    app.handleEscape = function () {
      if (app.searchOpen) { app.searchOpen = false; app.paint(); return; }
      if (app.statesOpen) { app.statesOpen = false; app.paint(); return; }
      if (app.detailsId) { app.closeDetails(); return; }
      if (allFilter) { allFilter = ""; app.paint(); return; }
      baseEscape.call(app);
    };
    window.__pmv2App = app;
  });
})();
