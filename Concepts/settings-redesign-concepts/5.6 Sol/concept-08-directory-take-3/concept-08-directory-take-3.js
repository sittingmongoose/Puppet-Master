(function () {
  "use strict";
  var PX = "d3";
  var LAYOUT = "directory-take-3";
  var ROOT_ID = "d3-root";
  var esc = window.PMv2.esc;
  var appRef = null;
  var virt = null;
  var restoreFocus = null;
  var allFacet = "";

  function searchIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor"/><path d="m20 20-3.5-3.5" fill="none" stroke="currentColor"/></svg>';
  }

  function captureFocus(root) {
    var ae = document.activeElement;
    if (!ae || !root || !root.contains(ae)) return null;
    if (ae.getAttribute && ae.getAttribute("data-search") != null) {
      return { kind: "search", start: ae.selectionStart, end: ae.selectionEnd };
    }
    if (ae.getAttribute && ae.getAttribute("data-id") != null && ae.getAttribute("data-act")) {
      return { kind: "ctl", act: ae.getAttribute("data-act"), id: ae.getAttribute("data-id"), start: ae.selectionStart, end: ae.selectionEnd };
    }
    return null;
  }

  function restoreCaptured(root, snap) {
    if (!snap) return;
    var el = null;
    if (snap.kind === "search") el = root.querySelector("[data-search]");
    else if (snap.kind === "ctl") el = root.querySelector('[data-act="' + snap.act + '"][data-id="' + (typeof CSS !== "undefined" && CSS.escape ? CSS.escape(snap.id) : String(snap.id)) + '"]');
    if (!el) return;
    el.focus();
    try {
      if (snap.start != null && typeof el.setSelectionRange === "function") {
        el.setSelectionRange(snap.start, snap.end != null ? snap.end : snap.start);
      }
    } catch (e) {}
  }

  function fmtCopyVal(v) {
    if (v == null || v === "") return "—";
    if (typeof v === "boolean") return v ? "On" : "Off";
    if (Array.isArray(v)) return v.join(", ");
    return String(v);
  }

  function factRow(key, value, rowId) {
    var shown = value == null || value === "" ? "—" : value;
    return '<div class="' + PX + '-fact"' + (rowId ? ' data-row-id="' + esc(rowId) + '"' : "") + "><span class=\"k\">" + esc(key) + "</span><span>" + esc(shown) + "</span></div>";
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
    return t;
  }

  function pinSearchById(app, q) {
    q = String(q == null ? "" : q).trim();
    if (!q || !window.PMv2) return;
    var hits = window.PMv2.search(q, { limit: 24 }) || [];
    var seen = {};
    var out = [];
    function add(e) {
      if (!e || !e.id || seen[e.id] || e.synthetic) return;
      seen[e.id] = 1;
      out.push({
        id: e.id,
        type: e.type,
        label: e.label,
        path: e.path,
        dest: e.dest,
        availability: e.availability
      });
    }
    add(window.PMv2.getResult(q));
    if (q.indexOf(":") === -1) {
      ["setting", "domain", "page", "manager", "action", "workflow", "unavailable"].forEach(function (prefix) {
        add(window.PMv2.getResult(prefix + ":" + q));
      });
    }
    hits.forEach(add);
    var qlc = q.toLowerCase();
    out.sort(function (a, b) {
      var ae = String(a.id).toLowerCase() === qlc ? 2 : (String(a.label).toLowerCase() === qlc ? 1 : 0);
      var be = String(b.id).toLowerCase() === qlc ? 2 : (String(b.label).toLowerCase() === qlc ? 1 : 0);
      return be - ae;
    });
    app.results = out.slice(0, 24);
    if (app.results.length && !app.results.some(function (h) { return h.id === app.selectedResultId; })) {
      app.selectedResultId = app.results[0].id;
    }
  }

  function crumb(app) {
    var r = app.route || { name: "home" };
    var parts = ["Settings"];
    if (r.domain && app.cat(r.domain)) parts.push(app.cat(r.domain).title);
    if (r.page) {
      var sub = ((app.cat(r.domain) || {}).subgroups || []).filter(function (s) { return s.id === r.page; })[0];
      parts.push(sub ? sub.title : r.page);
    }
    if (r.manager && app.mgr(r.manager)) parts.push(app.mgr(r.manager).title);
    if (r.object) parts.push(r.object);
    if (r.name === "all") parts.push("All Settings");
    if (r.name === "copy") parts.push("Copy from another project");
    if (r.name === "deferred") parts.push("Owner module");
    return parts.map(esc).join(" / ");
  }

  function backLabel(app) {
    if (!app.stack || !app.stack.length) return "Back to Settings Home";
    var prev = app.stack[app.stack.length - 1].route || { name: "home" };
    if (prev.name === "home") return "Back to Settings Home";
    if (prev.manager && app.mgr(prev.manager)) return "Back to " + app.mgr(prev.manager).title;
    if (prev.domain && app.cat(prev.domain)) return "Back to " + app.cat(prev.domain).title;
    if (prev.name === "all") return "Back to All Settings";
    return "Back";
  }

  function banner(app) {
    if (app.flags.offline) return '<div class="' + PX + '-banner" role="status">Offline. Cached values stay visible; refresh waits for network.</div>';
    if (app.flags.restart) return '<div class="' + PX + '-banner" role="status">Restart required before this change applies to new runs.</div>';
    if (app.flags.reconnect) return '<div class="' + PX + '-banner" role="status">Reconnect required for Google AI. Other project settings are unchanged.</div>';
    if (app.flags.importConflict) return '<div class="' + PX + '-banner" role="status">A settings import is paused on conflicting rows. Resolve it from Settings Lifecycle.</div>';
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
        var selected = app.selectedResultId;
        if (!hits.some(function (h) { return h.id === selected; })) selected = hits[0].id;
        drop = '<div class="' + PX + '-drop pmv2-scroll" role="listbox">' + hits.map(function (h) {
          var sel = h.id === selected ? "true" : "false";
          return '<button type="button" class="' + PX + '-hit" role="option" aria-selected="' + sel + '" data-act="pick" data-id="' + esc(h.id) + '"><b>' + esc(h.label) + '</b><span class="path">' + esc(h.path) + '</span><span class="meta">' + esc(h.type.replace(/_/g, " ")) + " · " + esc(h.id) + (h.availability && h.availability !== "ready" ? " · " + esc(h.availability.replace(/_/g, " ")) : "") + "</span></button>";
        }).join("") + "</div>";
      }
    }
    var states = "";
    if (app.statesOpen) {
      var names = ["loading-cached", "empty", "no-search-results", "typo-fuzzy", "validation-error", "offline", "managed", "unavailable", "restart-required", "reconnect-required", "changed-elsewhere", "import-conflict", "rollback-complete", "usage-unavailable", "multi-install", "unknown-owner", "provider-update", "verification-failure"];
      states = '<div class="' + PX + '-states pmv2-scroll" role="dialog" aria-label="Demo states">' + names.map(function (n) {
        return '<button type="button" data-act="state" data-id="' + n + '">' + esc(n.replace(/-/g, " ")) + "</button>";
      }).join("") + "</div>";
    }
    var bar = banner(app);
    return '<div class="' + PX + '-chrome">' +
      '<div class="' + PX + '-searchwrap">' + searchIcon() +
      '<input data-search type="search" placeholder="Search settings, managers, and setups" value="' + q + '" aria-label="Universal settings search" autocomplete="off" spellcheck="false">' +
      drop + "</div>" +
      '<button type="button" class="' + PX + '-back" data-act="back">' + esc(backLabel(app)) + "</button>" +
      '<div class="' + PX + '-crumb">' + crumb(app) + "</div>" +
      '<span class="' + PX + '-proj">Project · ' + esc(app.project.name) + "</span>" +
      '<button type="button" class="' + PX + '-ghost" data-act="states">Demo states</button>' +
      '<button type="button" class="' + PX + '-close" data-act="close">Close Settings</button>' +
      states + "</div>" + (bar ? '<div class="' + PX + '-bannerwrap">' + bar + "</div>" : "");
  }

  function workBox(app) {
    if (!app.work) return "";
    var w = app.work;
    var bar = "";
    if (w.progress_kind === "determinate") bar = "<div>" + esc(w.completed) + " / " + esc(w.total) + " · " + esc(w.progress_source) + "</div>";
    else if (w.progress_kind !== "none") bar = "<div>Progress unknown · " + esc(w.progress_source) + "</div>";
    return '<div class="' + PX + '-work" data-ow-state="' + esc(w.state) + '"><strong>' + esc(w.title) + "</strong> — " + esc(w.human_phase) + (w.wait_reason ? " (waiting: " + esc(w.wait_reason) + ")" : "") + bar + (w.message ? "<div>" + esc(w.message) + "</div>" : "") + "</div>";
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
      var numberText = m.value == null ? "" : String(m.value);
      var isPlainNumber = numberText === "" || /^-?(?:\d+|\d*\.\d+)$/.test(numberText);
      ctl = '<input data-act="' + (isPlainNumber ? "number" : "text") + '" data-id="' + esc(id) + '" type="' + (isPlainNumber ? "number" : "text") + '" inputmode="' + (isPlainNumber ? "decimal" : "text") + '" value="' + esc(numberText) + '"' + (m.disabled ? " disabled" : "") + ">";
    } else if (m.type === "action") {
      ctl = '<button type="button" data-act="do" data-id="' + esc(id) + '"' + (m.disabled ? " disabled" : "") + ">Run</button>";
    } else {
      var rawText = Array.isArray(m.value) ? m.value.join("\n") : (m.value == null ? "" : String(m.value));
      var rows = rawText.length > 120 ? 4 : (rawText.length > 68 ? 3 : 2);
      var useMultiline = rawText.length > 32 || /[\n,;]|[\\/]|\.md\b/i.test(rawText);
      ctl = useMultiline
        ? '<textarea class="' + PX + '-longtext" data-act="text" data-id="' + esc(id) + '" rows="' + rows + '" title="' + esc(rawText) + '"' + (m.disabled ? " disabled" : "") + '>' + esc(rawText) + '</textarea>'
        : '<input data-act="text" data-id="' + esc(id) + '" type="text" value="' + esc(rawText) + '" title="' + esc(rawText) + '"' + (m.disabled ? " disabled" : "") + '>';
    }
    return '<div class="' + PX + '-row" data-row-id="' + esc(id) + '"><div><label>' + esc(m.label) + "</label><p>" + esc(m.desc) + "</p>" +
      (m.reason ? '<p class="' + PX + '-muted">' + esc(m.reason) + "</p>" : "") +
      '<button type="button" class="' + PX + '-link" data-act="why" data-id="' + esc(id) + '">Why this value?</button></div><div class="' + PX + '-ctl">' + ctl + "</div></div>";
  }

  function attention(app) {
    if (app.flags.empty) return '<p class="' + PX + '-muted">Nothing needs attention in this project.</p>';
    var items = app.attention || [];
    return '<div class="' + PX + '-att">' + items.map(function (a) {
      return '<button type="button" data-act="pick" data-id="' + esc(a.destId) + '"><strong>' + esc(a.title) + "</strong><span class='" + PX + "-muted'>" + esc(a.detail) + "</span></button>";
    }).join("") + "</div>";
  }

  function utils() {
    return '<div class="' + PX + '-utils"><button type="button" data-act="all">All Settings</button><button type="button" data-act="copy">Copy Settings From Another Project</button></div>';
  }

  function providerQuickActions(obj) {
    if (obj.id === "local-ollama") {
      return '<button type="button" data-act="install-official" data-id="local-ollama" data-row-id="install-official">Install from official source</button>' +
        '<button type="button" class="' + PX + '-ghost" data-act="open-object" data-manager="providers" data-id="local-ollama" data-page="setup">Open setup</button>';
    }
    if (obj.id === "google") {
      return '<button type="button" data-act="reconnect" data-id="google" data-row-id="usage-projection">Reconnect</button>' +
        '<button type="button" class="' + PX + '-ghost" data-act="refresh-usage" data-id="google">Refresh usage</button>';
    }
    return '<button type="button" data-act="open-object" data-manager="providers" data-id="' + esc(obj.id) + '" data-page="accounts" data-row-id="account-default">Open accounts</button>' +
      '<button type="button" class="' + PX + '-ghost" data-act="switch-route" data-id="' + esc(obj.id) + '">Switch route</button>';
  }

  function providerCards(app, compact) {
    var objs = app.objectsFor("providers") || [];
    return '<div class="' + PX + "-sum" + (compact ? " is-compact" : "") + '">' + objs.map(function (o) {
      var row = o.id === "local-ollama" ? "install-official" : o.id === "google" ? "usage-projection" : "account-default";
      return '<article class="' + PX + '-pcard" data-avail="' + esc(o.availability || "ready") + '" data-row-id="' + row + '">' +
        "<header><strong>" + esc(o.label) + "</strong><span>" + esc((o.availability || "ready").replace(/_/g, " ")) + "</span></header>" +
        "<p>" + esc(o.product) + " · " + esc(o.account) + "</p>" +
        '<dl><div><dt>Models</dt><dd>' + esc(o.models) + "</dd></div><div><dt>Usage</dt><dd>" + esc(o.usage) + "</dd></div><div><dt>Setup</dt><dd>" + esc(o.setup) + "</dd></div></dl>" +
        '<div class="' + PX + '-qact">' + providerQuickActions(o) + "</div></article>";
    }).join("") + "</div>";
  }

  function domainCard(app, c) {
    var pages = (c.subgroups || []).map(function (s) { return s.title; }).join(" · ");
    var mgrs = (app.domainManagers[c.id] || []).map(function (id) {
      var m = app.mgr(id);
      return m ? m.title : id;
    }).join(" · ");
    return '<button type="button" class="' + PX + '-big" data-act="domain" data-id="' + esc(c.id) + '">' +
      "<strong>" + esc(c.title) + "</strong>" +
      "<span>" + esc(c.description) + "</span>" +
      (pages ? '<em>' + esc(pages) + "</em>" : "") +
      (mgrs ? '<small>' + esc(mgrs) + "</small>" : "") +
      "</button>";
  }

  function home(app) {
    var cats = app.categories || [];
    return '<div class="' + PX + "-home " + PX + '-scroll pmv2-scroll ' + PX + '-morph">' +
      '<p class="' + PX + '-kicker">Project ' + esc(app.project.name) + " · current values only</p>" +
      '<h1 class="' + PX + '-h1">Settings</h1>' +
      '<p class="' + PX + '-lede">Search first. The twelve large cards are the product catalog for this project. Provider summaries below are status plus a single next step — not a second catalog, live link, or profile.</p>' +
      workBox(app) +
      "<h2>Needs attention</h2>" + attention(app) +
      "<h2>Browse this project</h2>" +
      '<div class="' + PX + '-hero">' + cats.map(function (c) { return domainCard(app, c); }).join("") + "</div>" +
      "<h2>Providers in this project</h2>" +
      '<p class="' + PX + '-muted">Account and credential references stay on this project. Secrets never copy. Install is official-source only.</p>' +
      providerCards(app, false) +
      utils() +
      "</div>";
  }

  function domain(app) {
    var c = app.cat(app.route.domain) || { id: app.route.domain, title: "Settings", subgroups: [], description: "" };
    var page = app.route.page || ((c.subgroups || [])[0] || {}).id;
    var rows = app.settingsForPage(c.id, page);
    var mgrs = app.domainManagers[c.id] || [];
    var pages = (c.subgroups || []).map(function (sg) {
      return '<button type="button" class="' + PX + '-leaf" data-act="page" data-domain="' + esc(c.id) + '" data-id="' + esc(sg.id) + '"' + (sg.id === page ? ' aria-current="true"' : "") + ">" +
        "<strong>" + esc(sg.title) + "</strong><span>" + esc(sg.description || "Page in " + c.title) + "</span></button>";
    }).join("");
    var mgrNav = mgrs.map(function (id) {
      var m = app.mgr(id);
      return '<button type="button" class="' + PX + '-leaf" data-act="manager" data-id="' + esc(id) + '"><strong>' + esc(m ? m.title : id) + "</strong><span>" + esc(m ? m.purpose : "") + "</span></button>";
    }).join("");
    var defNav = "";
    if (c.id === "system" || c.id === "general") {
      defNav = (app.deferred || []).filter(function (d) { return d.domain === c.id || (c.id === "system" && d.domain === "system"); }).map(function (d) {
        return '<button type="button" class="' + PX + '-leaf" data-act="deferred" data-id="' + esc(d.id) + '"><strong>' + esc(d.title) + "</strong><span>Owned by " + esc(d.owner) + "</span></button>";
      }).join("");
    }
    return '<div class="' + PX + "-domain " + PX + '-morph">' +
      '<div class="' + PX + "-main " + PX + '-scroll pmv2-scroll">' +
      '<p class="' + PX + '-kicker">Project ' + esc(app.project.name) + "</p>" +
      '<h1 class="' + PX + '-h1">' + esc(c.title) + "</h1>" +
      '<p class="' + PX + '-lede">' + esc(c.description) + "</p>" +
      workBox(app) +
      (c.id === "ai" ? "<h2>Provider summary</h2>" + providerCards(app, true) : "") +
      "<h2>Pages</h2><div class=\"" + PX + '-leaves">' + pages + "</div>" +
      (mgrNav ? "<h2>Managers</h2><div class=\"" + PX + '-leaves">' + mgrNav + "</div>" : "") +
      (defNav ? "<h2>Owner modules</h2><div class=\"" + PX + '-leaves">' + defNav + "</div>" : "") +
      "<h2>Settings</h2>" + (rows.length ? rows.map(function (s) { return control(app, s.id); }).join("") : '<p class="' + PX + '-muted">No rows on this page.</p>') +
      "</div></div>";
  }

  function providerDetail(app, obj, page) {
    var html = '<h1 class="' + PX + '-h1">' + esc(obj.label) + "</h1>" +
      '<p class="' + PX + '-lede">Connected state, selected account, models, usage-end behavior, routing/fallback, and setup — for this project only.</p>' +
      '<div class="' + PX + '-facts">' +
      factRow("Connected", providerConnected(obj)) +
      factRow("Account", obj.account, "account-default") +
      factRow("Product", obj.product) +
      factRow("Models", obj.models) +
      factRow("When included usage ends", providerUsageEnd(obj), "usage-end") +
      factRow("Routing / fallback", providerRouting(obj), "routing-fallback") +
      factRow("Usage", obj.usage, "usage-projection") +
      factRow("Setup", obj.setup, obj.id === "local-ollama" ? "install-official" : null) +
      "</div>";
    if (obj.id === "local-ollama") {
      html += '<div class="' + PX + '-callout" data-row-id="install-official"><p>Ollama is not bundled. Install from the official Ollama source for This PC / Native Windows. Settings will not silently install it. Authentication is a separate step.</p>' +
        '<button type="button" data-act="install-official" data-id="local-ollama" data-row-id="install-official">Install from official source</button></div>';
    }
    if (obj.id === "google") {
      html += '<div class="' + PX + '-callout" data-row-id="usage-projection"><p>Usage projection is stale until you reconnect. Cached catalog remains visible.</p>' +
        '<button type="button" data-act="reconnect" data-id="google" data-row-id="usage-projection">Reconnect Google AI</button>' +
        '<button type="button" class="' + PX + '-ghost" data-act="refresh-usage" data-id="google">Refresh usage</button></div>';
    }
    if (obj.id === "anthropic") {
      html += '<div class="' + PX + '-callout" data-row-id="account-default"><p>Default account for this project is ' + esc(obj.account) + ". Switching route does not copy secrets.</p>" +
        '<button type="button" data-act="switch-route" data-id="anthropic">Switch route</button></div>';
    }
    if (page === "installations") {
      html += "<h2>Installations</h2>" + (app.installs || []).filter(function (i) {
        return i.provider === obj.id || obj.id === "anthropic";
      }).map(function (i) {
        return '<div class="' + PX + '-install" data-row-id="' + esc(i.id) + '"><strong>' + esc(i.label) + "</strong> · " + esc(i.host) + " · " +
          (i.selected ? "Selected" : (i.shadowed ? "Shadowed" : "Available")) +
          (i.manualOnly ? " · Unknown owner — manual only" : "") +
          (i.official ? " · Official source" : "") + "</div>";
      }).join("");
    }
    if (page === "usage") {
      html += "<h2>When included usage ends</h2>" +
        '<p data-row-id="usage-end">' + esc(providerUsageEnd(obj)) + "</p>" +
        '<p class="' + PX + '-muted">Settings owns the continuation. Usage owns the projection and never writes this choice.</p>' +
        '<div data-row-id="usage-projection"><h2>Usage</h2><p>' + esc(obj.usage) + "</p>" +
        '<button type="button" data-act="refresh-usage" data-id="' + esc(obj.id) + '">Refresh usage</button></div>';
    }
    if (page === "accounts") {
      html += "<h2>Routing / fallback</h2>" +
        '<p data-row-id="routing-fallback">' + esc(providerRouting(obj)) + "</p>" +
        '<div data-row-id="account-default"><h2>Accounts</h2><p>' + esc(obj.account) + " · " + esc(obj.product || "") + "</p>" +
        '<p class="' + PX + '-muted">Credentials stay on the account. Switching route does not copy secrets.</p></div>';
    }
    if (page === "setup") {
      html += '<div data-row-id="install-official"><h2>Setup</h2><p>' + esc(obj.setup) + "</p></div>";
    }
    return html;
  }

  function managerView(app) {
    var m = app.mgr(app.route.manager);
    if (!m) return '<div class="' + PX + '-sheet">Missing manager</div>';
    var objs = app.objectsFor(m.id);
    var obj = objs.filter(function (o) { return o.id === app.route.object; })[0] || objs[0];
    var page = app.route.page || (m.tabs && m.tabs[0]) || "overview";
    var tabs = (m.tabs || []).map(function (t) {
      var label = m.id === "providers" ? providerTabLabel(t) : t;
      return '<button type="button" data-act="mtab" data-id="' + esc(t) + '"' + (t === page ? ' aria-current="true"' : "") + ">" + esc(label) + "</button>";
    }).join("");
    var roster = objs.map(function (o) {
      return '<button type="button" data-act="object" data-id="' + esc(o.id) + '"' + (obj && o.id === obj.id ? ' aria-current="true"' : "") + ">" + esc(o.label) + " · " + esc((o.availability || "ready").replace(/_/g, " ")) + "</button>";
    }).join("");
    var detail;
    if (m.id === "providers" && obj) detail = providerDetail(app, obj, page);
    else {
      detail = '<h1 class="' + PX + '-h1">' + esc(m.title) + "</h1><p class=\"" + PX + '-lede">' + esc(m.purpose) + "</p>";
      if (obj) detail += '<div data-row-id="' + esc(obj.id) + '"><strong>' + esc(obj.label) + "</strong> · " + esc(obj.kind || "resource") + " · " + esc((obj.availability || "ready").replace(/_/g, " ")) + "</div>";
    }
    var relatedSettings = app.settingsForPage(m.domain, null).slice(0, 10).map(function (s) { return control(app, s.id); }).join("");
    return '<div class="' + PX + "-workspace " + PX + '-morph">' +
      '<div class="' + PX + '-mtabs pmv2-scroll">' + tabs + "</div>" +
      workBox(app) +
      '<div class="' + PX + '-mgr">' +
      '<aside class="' + PX + '-roster pmv2-scroll"><h2>In this manager</h2>' + roster + "</aside>" +
      '<div class="' + PX + "-form " + PX + '-scroll pmv2-scroll">' + detail + "<h2>Project settings</h2>" + relatedSettings + "</div>" +
      "</div></div>";
  }

  function allSettings(app) {
    return '<div class="' + PX + "-comp" + (app.route.row ? " is-detail" : "") + '">' +
      '<aside class="' + PX + '-facets pmv2-scroll"><h2>Filters</h2>' +
      '<button type="button" data-act="facet" data-id=""' + (!allFacet ? ' aria-current="true"' : "") + ">All domains</button>" +
      (app.categories || []).map(function (c) {
        return '<button type="button" data-act="facet" data-id="' + esc(c.id) + '"' + (allFacet === c.id ? ' aria-current="true"' : "") + ">" + esc(c.title) + "</button>";
      }).join("") +
      '<button type="button" data-act="synth">Include synthetic overlay</button></aside>' +
      '<div class="' + PX + '-list pmv2-scroll" data-all-list="1"></div>' +
      '<div class="' + PX + '-detail pmv2-scroll">' + (app.route.row ? control(app, app.route.row) : '<p class="' + PX + '-muted">Select a row to read it in context. This index is virtualized. Synthetic overlay rows are labeled and excluded from product search.</p>') + "</div></div>";
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
      '<p class="' + PX + '-kicker">' + esc(d.label) + "</p>" +
      (d.desc ? '<p class="' + PX + '-lede">' + esc(d.desc) + "</p>" : "") +
      '<div class="' + PX + '-facts">' +
      factRow("Requested", fmtCopyVal(d.requested)) +
      factRow("Effective", fmtCopyVal(d.effective)) +
      factRow("Origin", origin.label || "—") +
      factRow("Origin owner", origin.owner || "—") +
      factRow("Policy floor", d.policyFloor || "—") +
      factRow("Persistence", d.persistence || "current-project") +
      factRow("Destination", d.scopeNote) +
      factRow("Backend", (d.simulated ? "Simulated · " : "") + (d.backend || "sessionStorage")) +
      "</div></aside>";
  }

  function copyView(app) {
    if (!app.copy.sourceId) {
      var firstSrc = (app.projects || []).filter(function (x) { return !x.current; })[0];
      app.copy.sourceId = firstSrc ? firstSrc.id : "northwind-docs";
      if (!app.copy.categories || !app.copy.categories.length) {
        app.copy.categories = (app.categories || []).map(function (c) { return c.id; });
      }
      app.copy.step = app.copy.step || "preview";
    }
    var p = app.copyPreview();
    var srcs = (app.projects || []).filter(function (x) { return !x.current; }).map(function (x) {
      return '<button type="button" data-act="copy-src" data-id="' + esc(x.id) + '"' + (app.copy.sourceId === x.id ? ' aria-current="true"' : "") + ">" + esc(x.name) + "</button>";
    }).join("");
    var cats = (app.categories || []).map(function (c) {
      var on = (app.copy.categories || []).indexOf(c.id) !== -1;
      return '<label class="' + PX + '-check"><input type="checkbox" data-act="copy-cat" data-id="' + esc(c.id) + '"' + (on ? " checked" : "") + "> " + esc(c.title) + "</label>";
    }).join("");
    var prev = "<p>Select a source project.</p>";
    if (p) {
      prev = "<p>Additions " + p.counts.additions + " · Replacements " + p.counts.replacements + " · Unchanged " + p.counts.unchanged + " · Unavailable " + p.counts.unavailable + " · Conflicts " + p.counts.conflicts + "</p>" +
        '<p class="' + PX + '-muted">Account and credential references copy. Secrets never copy. Projects stay independent. This is a one-time copy, with no ongoing link or shared profile.</p>' +
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
    return '<div class="' + PX + "-sheet " + PX + '-scroll pmv2-scroll ' + PX + '-morph"><h1 class="' + PX + '-h1">Copy Settings From Another Project</h1><p>One-time copy into <strong>' + esc(app.project.name) + "</strong>. No ongoing link or shared settings profile.</p><h2>Source project</h2><div class=\"" + PX + '-leaves">' + srcs + "</div><h2>Categories</h2><div class=\"" + PX + '-checks">' + cats + "</div><h2>Preview</h2>" + prev + actions + workBox(app) + "</div>";
  }

  function deferredView(app) {
    var d = (app.deferred || []).filter(function (x) { return x.id === app.route.deferred; })[0];
    if (!d) return "<div>Unknown owner module</div>";
    return '<div class="' + PX + "-sheet " + PX + '-scroll pmv2-scroll ' + PX + '-morph"><h1 class="' + PX + '-h1">' + esc(d.title) + "</h1><p>This destination is owned by <strong>" + esc(d.owner) + "</strong>. Settings does not invent a backend for it.</p><p>Return contract: Back restores the previous Settings location. Close Settings returns to the opening surface.</p><button type='button' data-act='back'>Return to Settings</button></div>";
  }

  function body(app) {
    var r = app.route || { name: "home" };
    if (r.name === "home") return home(app);
    if (r.name === "domain") return domain(app);
    if (r.name === "manager") return managerView(app);
    if (r.name === "all") return allSettings(app);
    if (r.name === "copy") return copyView(app);
    if (r.name === "deferred") return deferredView(app);
    return home(app);
  }

  function fillAll(app, root) {
    var host = root.querySelector("[data-all-list]");
    if (!host) { virt = null; return; }
    var items = (window.PMv2.inventory.settings || []).filter(function (s) {
      if (!allFacet) return true;
      var sid = String(s.id);
      return sid === allFacet || sid.indexOf(allFacet + ".") === 0 || String(s.category || s.domain || "") === allFacet;
    }).map(function (s) {
      var domain = s.category || s.domain || "";
      if (!domain) {
        var cats = app.categories || [];
        var i, c, sid = String(s.id);
        for (i = 0; i < cats.length; i++) {
          c = cats[i];
          if (sid === c.id || sid.indexOf(c.id + ".") === 0) { domain = c.id; break; }
        }
      }
      return { id: s.id, label: s.label, path: domain };
    });
    virt = window.PMv2.virtualList(host, items, 56, function (item) {
      var cat = app.cat(item.path);
      return '<button type="button" class="' + PX + '-hit" data-act="row" data-id="' + esc(item.id) + '" data-row-id="' + esc(item.id) + '"><b>' + esc(item.label) + "</b><span class='path'>" + esc(cat ? cat.title : item.path) + "</span></button>";
    });
  }

  function applyAct(app, el, act, id) {
    if (act === "back") app.back();
    else if (act === "close") app.closeSettings();
    else if (act === "states") { app.statesOpen = !app.statesOpen; app.paint(); }
    else if (act === "state") app.triggerState(id);
    else if (act === "domain") app.openDomain(id);
    else if (act === "page") app.openPage(el.getAttribute("data-domain"), id);
    else if (act === "manager") app.openManager(id);
    else if (act === "object") app.openManager(app.route.manager, { object: id, page: app.route.page });
    else if (act === "open-object") app.openManager(el.getAttribute("data-manager") || "providers", { object: id, page: el.getAttribute("data-page") || "overview", row: el.getAttribute("data-row-id") || undefined });
    else if (act === "mtab") app.openManager(app.route.manager, { object: app.route.object, page: id });
    else if (act === "deferred") app.openDeferred(id);
    else if (act === "all") app.openAll();
    else if (act === "copy") app.openCopy();
    else if (act === "pick") {
      if (app.pickResult) app.pickResult(id);
      else {
        var hit = window.PMv2.getResult(id) || window.PMv2.getResult("setting:" + id);
        if (hit && hit.dest) app.navigate(hit.dest);
      }
    }
    else if (act === "row") {
      if (app.routeSettingRow) app.routeSettingRow(id);
      else if (app.pickResult) app.pickResult("setting:" + id);
      else window.PMv2.routeSettingRow(app, id);
    }
    else if (act === "toggle") {
      var cur = app.controlModel(id);
      app.setValue(id, !(cur && cur.value));
    } else if (act === "select") app.setValue(id, el.value);
    else if (act === "number") app.setValue(id, Number(el.value));
    else if (act === "text") app.setValue(id, el.value);
    else if (act === "do") app.receipt("Ran " + id + " for this project (simulated).", "info");
    else if (act === "why") app.openDetails(id);
    else if (act === "details-close") app.closeDetails();
    else if (act === "install-official") {
      app.work = { title: "Install Ollama", human_phase: "Waiting for explicit Install", state: "waiting_user", wait_reason: "Official source confirmation", progress_kind: "none", progress_source: "provider setup", last_known_good: true, message: "Not bundled. Not silently installed." };
      app.receipt("Install starts only after you confirm the official source (simulated).", "info");
      app.openManager("providers", { object: "local-ollama", page: "setup", row: "install-official" });
    } else if (act === "reconnect") {
      app.work = { title: "Reconnect Google AI", human_phase: "Waiting for sign-in", state: "waiting_user", wait_reason: "Reconnect required", progress_kind: "none", progress_source: "provider account", last_known_good: true, message: "Other project settings stay unchanged." };
      app.receipt("Reconnect is a project-local account repair (simulated).", "info");
      app.openManager("providers", { object: "google", page: "usage", row: "usage-projection" });
    } else if (act === "refresh-usage") {
      app.work = { title: "Refresh usage", human_phase: "Refreshing", state: "running", progress_kind: "indeterminate", progress_source: "usage projection", last_known_good: true, message: "Cached usage remains visible." };
      app.receipt("Usage refresh requested for this project (simulated).", "info");
      app.paint();
    } else if (act === "switch-route") {
      app.receipt("Provider route switch stays on this project (simulated).", "ok");
      app.openManager("providers", { object: id, page: "accounts", row: "account-default" });
    } else if (act === "copy-src") { app.copy.sourceId = id; app.copy.step = "preview"; app.paint(); }
    else if (act === "copy-cat") {
      var set = app.copy.categories ? app.copy.categories.slice() : [];
      if (el.checked && set.indexOf(id) === -1) set.push(id);
      if (!el.checked) set = set.filter(function (x) { return x !== id; });
      app.copy.categories = set;
      app.paint();
    } else if (act === "copy-apply") app.applyCopy();
    else if (act === "copy-rollback") app.rollbackCopy();
    else if (act === "facet") { allFacet = id || ""; app.paint(); }
    else if (act === "synth") app.receipt("Synthetic overlay is labeled and excluded from product inventory search by default.", "info");
  }

  function bind(app, root) {
    var search = root.querySelector("[data-search]");
    if (search) {
      search.oninput = function () {
        restoreFocus = { kind: "search", start: search.selectionStart, end: search.selectionEnd };
        app.setQuery(search.value);
        pinSearchById(app, search.value);
        app.paint();
      };
      search.onkeydown = function (ev) {
        var list = app.results || [];
        if (ev.key === "Enter" && !list.length && search.value) {
          ev.preventDefault();
          var exact = window.PMv2.getResult(search.value) || window.PMv2.getResult("setting:" + search.value);
          if (exact) { app.pickResult(exact.id); return; }
          app.receipt("Search submitted. No matching settings.", "info");
          return;
        }
        if (!list.length) return;
        var ids = list.map(function (x) { return x.id; });
        var at = Math.max(0, ids.indexOf(app.selectedResultId));
        if (ev.key === "ArrowDown") {
          ev.preventDefault();
          app.selectedResultId = ids[Math.min(ids.length - 1, at + 1)];
          app.searchOpen = true;
          restoreFocus = { kind: "search", start: search.selectionStart, end: search.selectionEnd };
          app.paint();
        } else if (ev.key === "ArrowUp") {
          ev.preventDefault();
          app.selectedResultId = ids[Math.max(0, at - 1)];
          app.searchOpen = true;
          restoreFocus = { kind: "search", start: search.selectionStart, end: search.selectionEnd };
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
      if (el.tagName === "SELECT" || el.tagName === "INPUT") return;
      applyAct(app, el, el.getAttribute("data-act"), el.getAttribute("data-id"));
    };
    root.onchange = function (ev) {
      var el = ev.target.closest("[data-act]");
      if (!el) return;
      var act = el.getAttribute("data-act");
      if (act === "select" || act === "number" || act === "text" || act === "copy-cat") {
        applyAct(app, el, act, el.getAttribute("data-id"));
      }
    };
    root.onkeydown = function (ev) {
      if (ev.key !== "Escape") return;
      ev.preventDefault();
      if (app.handleEscape) app.handleEscape();
      else app.back();
    };
  }

  function render(app) {
    var root = document.getElementById(ROOT_ID);
    appRef = app;
    window.__pmv2App = app;
    if (virt && virt.dispose) virt.dispose();
    root.className = PX;
    root.setAttribute("data-layout", LAYOUT);
    root.setAttribute("data-route", (app.route && app.route.name) || "home");
    var snap = restoreFocus || captureFocus(root);
    restoreFocus = null;
    root.innerHTML = chrome(app) + '<div class="' + PX + '-body">' + body(app) + detailsDrawer(app) + "</div>";
    bind(app, root);
    fillAll(app, root);
    restoreCaptured(root, snap);
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (window.PMShell) window.PMShell.init();
    var created = window.PMv2.createApp({ namespace: "c08", root: document.getElementById(ROOT_ID), render: render });
    var app = created || window.__pmv2App || appRef;
    if (app) {
      var baseEscape = app.handleEscape;
      app.handleEscape = function () {
        if (window.PMv2 && window.PMv2.popupOpen && window.PMv2.popupOpen._el) {
          if (typeof app.closePopup === "function") app.closePopup();
          else if (window.PMv2.popupClose) window.PMv2.popupClose();
          return;
        }
        if (app.detailsId) { app.closeDetails(); return; }
        if (app.statesOpen) { app.statesOpen = false; app.paint(); return; }
        if (app.searchOpen) { app.searchOpen = false; app.paint(); return; }
        if (allFacet) { allFacet = ""; app.paint(); return; }
        if (app.route && app.route.row) {
          var was = app.route.row;
          delete app.route.row;
          if (app.route.highlight === was) delete app.route.highlight;
          app.paint();
          return;
        }
        if (typeof baseEscape === "function") baseEscape.call(app);
        else app.back();
      };
    }
    window.__pmv2App = app;
  });
})();
