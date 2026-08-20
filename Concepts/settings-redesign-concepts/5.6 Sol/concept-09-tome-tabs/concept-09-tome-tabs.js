(function () {
  "use strict";
  var PX = "tm";
  var LAYOUT = "tome-tabs";
  var ROOT_ID = "tm-root";
  var esc = window.PMv2.esc;
  var appRef = null;
  var virt = null;
  var allFilter = "";
  var includeSynth = false;

  var EDGE_LABEL = {
    general: "Appearance",
    ai: "Providers",
    safety: "Safety",
    code: "Code",
    memory: "Memory",
    planning: "Planning",
    branching: "Branching",
    media: "Media",
    web: "Web",
    personas: "Personas",
    extensions: "Extensions",
    system: "System"
  };

  var TYPE_LABEL = {
    setting: "Setting",
    manager: "Manager",
    managed_object: "Managed object",
    action: "Action",
    setup_or_repair_workflow: "Setup",
    diagnostic_or_read_only_status: "Status",
    unavailable_capability: "Unavailable",
    intentional_help_result: "Help"
  };

  var DEMO_STATES = [
    "loading-cached", "empty", "no-search-results", "typo-fuzzy", "validation-error",
    "offline", "managed", "unavailable", "restart-required", "reconnect-required",
    "changed-elsewhere", "import-conflict", "rollback-complete", "usage-unavailable",
    "multi-install", "unknown-owner", "provider-update", "verification-failure"
  ];

  function pretty(id) {
    return String(id || "").replace(/[_-]+/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); });
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
    return pretty(t);
  }

  function searchIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor"/><path d="m20 20-3.5-3.5" fill="none" stroke="currentColor"/></svg>';
  }

  function crumb(app) {
    var r = app.route || { name: "home" };
    var parts = ["Settings"];
    if (r.domain && app.cat(r.domain)) parts.push(app.cat(r.domain).title);
    if (r.page && r.name === "domain") {
      var sub = ((app.cat(r.domain) || {}).subgroups || []).filter(function (s) { return s.id === r.page; })[0];
      parts.push(sub ? sub.title : pretty(r.page));
    }
    if (r.manager && app.mgr(r.manager)) parts.push(app.mgr(r.manager).title);
    if (r.object) {
      var objs = app.objectsFor(r.manager) || [];
      var obj = objs.filter(function (o) { return o.id === r.object; })[0];
      parts.push(obj ? obj.label : r.object);
    }
    if (r.name === "all") parts.push("All Settings");
    if (r.name === "copy") parts.push("Copy from another project");
    if (r.name === "deferred") {
      var d = (app.deferred || []).filter(function (x) { return x.id === r.deferred; })[0];
      parts.push(d ? d.title : "Owner module");
    }
    return parts.map(esc).join(" / ");
  }

  function backLabel(app) {
    if (!app.stack || !app.stack.length) return "Back to Settings Home";
    var prev = app.stack[app.stack.length - 1].route || { name: "home" };
    if (prev.name === "home") return "Back to Settings Home";
    if (prev.manager && app.mgr(prev.manager)) return "Back to " + app.mgr(prev.manager).title;
    if (prev.domain && app.cat(prev.domain)) return "Back to " + app.cat(prev.domain).title;
    if (prev.name === "all") return "Back to All Settings";
    if (prev.name === "copy") return "Back to Copy Settings";
    return "Back";
  }

  function groupHits(hits) {
    var order = [];
    var buckets = {};
    hits.forEach(function (h) {
      var k = h.type || "setting";
      if (!buckets[k]) { buckets[k] = []; order.push(k); }
      buckets[k].push(h);
    });
    return order.map(function (k) { return { type: k, items: buckets[k] }; });
  }

  function searchDrop(app) {
    if (!app.searchOpen) return "";
    var hits = (app.results || []).slice(0, 24);
    if (!hits.length && app.query) {
      return '<div class="' + PX + '-drop pmv2-scroll" role="listbox"><div class="' + PX + '-hit">No matching settings</div></div>';
    }
    if (!hits.length) return "";
    var html = '<div class="' + PX + '-drop pmv2-scroll" role="listbox">';
    groupHits(hits).forEach(function (g) {
      html += '<div class="' + PX + '-ghead">' + esc(TYPE_LABEL[g.type] || pretty(g.type)) + "</div>";
      g.items.forEach(function (h) {
        var sel = h.id === app.selectedResultId ? "true" : "false";
        var avail = h.availability && h.availability !== "ready" ? " · " + esc(pretty(h.availability)) : "";
        html += '<button type="button" class="' + PX + '-hit" role="option" aria-selected="' + sel + '" data-act="pick" data-id="' + esc(h.id) + '"><b>' + esc(h.label) + '</b><span class="path">' + esc(h.path) + '</span><span class="meta">' + esc(TYPE_LABEL[h.type] || pretty(h.type)) + avail + "</span></button>";
      });
    });
    return html + "</div>";
  }

  function chrome(app) {
    var q = esc(app.query || "");
    return '<div class="' + PX + '-chrome">' +
      '<div class="' + PX + '-searchwrap">' + searchIcon() +
      '<input data-search type="search" placeholder="Search settings, managers, and setups" value="' + q + '" aria-label="Universal settings search" autocomplete="off" spellcheck="false">' +
      searchDrop(app) + "</div>" +
      '<div class="' + PX + '-loc">' +
      '<button type="button" class="' + PX + '-back" data-act="back">' + esc(backLabel(app)) + "</button>" +
      '<div class="' + PX + '-crumb">' + crumb(app) + "</div>" +
      '<span class="' + PX + '-proj">Project · ' + esc(app.project.name) + "</span>" +
      '<button type="button" class="' + PX + '-ghost" data-act="states">Demo states</button>' +
      '<button type="button" class="' + PX + '-close" data-act="close">Close Settings</button>' +
      "</div></div>";
  }

  function banner(app) {
    if (app.flags.offline) return '<div class="' + PX + '-banner">Offline. Cached values stay visible; refresh waits for network.</div>';
    if (app.flags.restart) return '<div class="' + PX + '-banner">Restart required before this change applies to new runs.</div>';
    if (app.flags.reconnect) return '<div class="' + PX + '-banner">Reconnect required for Google AI. Other project settings are unchanged.</div>';
    if (app.flags.importConflict) return '<div class="' + PX + '-banner">A settings import is paused on conflicting rows.</div>';
    return "";
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
    return '<div class="' + PX + '-row" data-row-id="' + esc(id) + '" tabindex="-1"><div><label>' + esc(m.label) + "</label><p>" + esc(m.desc) + "</p>" +
      (m.reason ? '<p class="' + PX + '-muted">' + esc(m.reason) + "</p>" : "") +
      '<button type="button" class="' + PX + '-why" data-act="why" data-id="' + esc(id) + '">Why this value?</button></div><div>' + ctl + "</div></div>";
  }

  function attention(app) {
    if (app.flags.empty) return '<p class="' + PX + '-muted">Nothing needs attention.</p>';
    var items = app.attention || [];
    return '<div class="' + PX + '-att">' + items.map(function (a) {
      return '<button type="button" data-act="pick" data-id="' + esc(a.destId) + '"><strong>' + esc(a.title) + "</strong><div class='" + PX + "-muted'>" + esc(a.detail) + "</div></button>";
    }).join("") + "</div>";
  }

  function utils() {
    return '<div class="' + PX + '-utils"><button type="button" data-act="all">All Settings</button><button type="button" data-act="copy">Copy Settings From Another Project</button></div>';
  }

  function currentChapter(app) {
    var r = app.route || { name: "home" };
    if (r.name === "home") return "home";
    if (r.name === "all") return "all";
    if (r.name === "copy") return "copy";
    if (r.domain) return r.domain;
    return "home";
  }

  function edge(app) {
    var cur = currentChapter(app);
    var html = '<nav class="' + PX + '-edge pmv2-scroll" aria-label="Settings chapters">';
    html += '<button type="button" data-act="home"' + (cur === "home" ? ' aria-current="true"' : "") + ">Home</button>";
    (app.categories || []).forEach(function (c) {
      html += '<button type="button" data-act="domain" data-id="' + esc(c.id) + '"' + (cur === c.id ? ' aria-current="true"' : "") + ">" + esc(EDGE_LABEL[c.id] || c.title) + "</button>";
    });
    html += '<button type="button" class="' + PX + '-util" data-act="all"' + (cur === "all" ? ' aria-current="true"' : "") + ">All Settings</button>";
    html += '<button type="button" class="' + PX + '-util" data-act="copy"' + (cur === "copy" ? ' aria-current="true"' : "") + ">Copy</button>";
    return html + "</nav>";
  }

  function localTabs(app) {
    var r = app.route || { name: "home" };
    var buttons = "";
    if (r.name === "domain") {
      var c = app.cat(r.domain) || { subgroups: [] };
      var page = r.page || ((c.subgroups || [])[0] || {}).id;
      buttons = (c.subgroups || []).map(function (sg) {
        return '<button type="button" data-act="page" data-domain="' + esc(c.id) + '" data-id="' + esc(sg.id) + '"' + (sg.id === page ? ' aria-current="true"' : "") + ">" + esc(sg.title) + "</button>";
      }).join("");
    } else if (r.name === "manager") {
      var m = app.mgr(r.manager);
      if (!m) return "";
      var tab = r.page || (m.tabs || [])[0];
      buttons = (m.tabs || []).map(function (t) {
        var label = m.id === "providers" ? providerTabLabel(t) : pretty(t);
        return '<button type="button" data-act="mtab" data-id="' + esc(t) + '"' + (t === tab ? ' aria-current="true"' : "") + ">" + esc(label) + "</button>";
      }).join("");
    }
    if (!buttons) return "";
    return '<div class="' + PX + '-local" role="tablist">' + buttons + "</div>";
  }

  function home(app) {
    var cats = app.categories || [];
    var dest = '<div class="' + PX + '-dest">' + cats.map(function (c) {
      return '<button type="button" data-act="domain" data-id="' + esc(c.id) + '"><strong>' + esc(c.title) + "</strong><span class='" + PX + "-muted'>" + esc(c.description) + "</span></button>";
    }).join("") + "</div>";
    return '<div class="' + PX + '-read"><p class="' + PX + '-muted">Project ' + esc(app.project.name) + " · " + esc(String(app.productSettingCount || 828)) + " settings in this project</p>" +
      '<h1 class="' + PX + '-h1">Settings</h1>' +
      '<p class="' + PX + '-lede">Search first. Edge tabs keep every domain in the same place. Copy from another project is a one-time action — not a live link.</p>' +
      workBox(app) +
      "<h2>Needs attention</h2>" + attention(app) +
      "<h2>Destinations</h2>" + dest + utils() + "</div>";
  }

  function domain(app) {
    var c = app.cat(app.route.domain) || { title: "Settings", subgroups: [], description: "", id: app.route.domain };
    var page = app.route.page || ((c.subgroups || [])[0] || {}).id;
    var rows = app.settingsForPage(c.id, page);
    var mgrs = app.domainManagers[c.id] || [];
    var mgrNav = mgrs.map(function (id) {
      var m = app.mgr(id);
      return '<button type="button" data-act="manager" data-id="' + esc(id) + '"><strong>' + esc(m ? m.title : id) + '</strong><div class="' + PX + '-muted">' + esc(m ? m.purpose : "") + "</div></button>";
    }).join("");
    var defNav = "";
    if (c.id === "system" || c.id === "general") {
      defNav = (app.deferred || []).filter(function (d) { return d.domain === c.id || c.id === "system"; }).map(function (d) {
        return '<button type="button" data-act="deferred" data-id="' + esc(d.id) + '"><strong>' + esc(d.title) + '</strong><div class="' + PX + '-muted">Owned by ' + esc(d.owner) + "</div></button>";
      }).join("");
    }
    return '<div class="' + PX + '-read"><h1 class="' + PX + '-h1">' + esc(c.title) + "</h1>" +
      '<p class="' + PX + '-lede">' + esc(c.description) + "</p>" + workBox(app) +
      (mgrNav ? "<h2>Managers</h2><div class='" + PX + "-mgrs'>" + mgrNav + "</div>" : "") +
      (defNav ? "<h2>Owner modules</h2><div class='" + PX + "-mgrs'>" + defNav + "</div>" : "") +
      "<h2>Settings</h2>" + (rows.length ? rows.map(function (s) { return control(app, s.id); }).join("") : '<p class="' + PX + '-muted">No rows in this page.</p>') +
      "</div>";
  }

  function providerDetail(app, obj) {
    var tab = app.route.page || "overview";
    var usageVal = (app.flags && app.flags.usageUnavailable) ? "Usage unavailable" : (obj.usage || "—");
    var html = '<h1 class="' + PX + '-h1">' + esc(obj.label) + "</h1>" +
      '<p class="' + PX + '-lede">Connected state, selected account, models, usage-end behavior, routing/fallback, and setup — for this project only.</p>' +
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
        return '<div class="' + PX + '-stat" data-row-id="' + esc(item.row) + '" tabindex="-1"><div class="' + PX + '-muted">' + esc(item.k) + "</div><strong>" + esc(item.v || "—") + "</strong></div>";
      }).join("") + "</div>";
    if (obj.id === "local-ollama") {
      html += "<p>Ollama is not bundled. Install from the official Ollama source for This PC / Native Windows. Authentication is a separate step.</p>" +
        '<button type="button" class="' + PX + '-primary" data-act="install-official" data-id="local-ollama" data-row-id="install-official">Install from official source</button>';
    }
    if (tab === "installations") {
      html += "<h2>Installations</h2>" + app.installs.filter(function (i) { return i.provider === obj.id || obj.id === "anthropic"; }).map(function (i) {
        return '<div data-row-id="' + esc(i.id) + '" tabindex="-1">' + esc(i.label) + " · " + esc(i.host) + " · " + (i.selected ? "Selected" : (i.shadowed ? "Shadowed" : "Available")) + (i.manualOnly ? " · Unknown owner — manual only" : "") + "</div>";
      }).join("");
    }
    if (tab === "setup" && obj.id !== "local-ollama") {
      html += "<h2>Setup</h2><p class='" + PX + "-muted'>This provider is already installed for this project.</p>";
    }
    if (tab === "usage") {
      html += "<h2>When included usage ends</h2>" +
        '<p data-row-id="usage-end">' + esc(providerUsageEnd(obj)) + "</p>" +
        '<p class="' + PX + '-muted">Settings owns the continuation. Usage owns the projection and never writes this choice.</p>' +
        '<p data-row-id="usage-projection">Projection: ' + esc(usageVal) + "</p>";
    }
    if (tab === "accounts") {
      html += "<h2>Routing / fallback</h2>" +
        '<p data-row-id="routing-fallback">' + esc(providerRouting(obj)) + "</p>" +
        '<p data-row-id="account-default">Selected account: ' + esc(obj.account || "—") + " · " + esc(obj.product || "—") + "</p>" +
        '<p class="' + PX + '-muted">Credentials stay on the account. Switching route does not copy secrets. Limits, logs, and catalogs stay on their own subpages.</p>';
    }
    return html;
  }

  function managerView(app) {
    var m = app.mgr(app.route.manager);
    if (!m) return "<div>Missing manager</div>";
    var objs = app.objectsFor(m.id);
    var obj = objs.filter(function (o) { return o.id === app.route.object; })[0] || objs[0];
    var roster = '<div class="' + PX + '-roster pmv2-scroll">' + objs.map(function (o) {
      return '<button type="button" data-act="object" data-id="' + esc(o.id) + '" data-row-id="' + esc(o.id) + '"' + (obj && o.id === obj.id ? ' aria-current="true"' : "") + ">" + esc(o.label) + '<div class="' + PX + '-muted">' + esc(pretty(o.availability || "ready")) + "</div></button>";
    }).join("") + "</div>";
    var detail = "";
    if (m.id === "providers" && obj) {
      detail = providerDetail(app, obj);
    } else if (m.archetype === "health-projection") {
      detail = '<h1 class="' + PX + '-h1">' + esc(m.title) + "</h1><p class='" + PX + "-lede'>" + esc(m.purpose) + "</p>" +
        '<div class="' + PX + '-health"><div><strong>Projection</strong><div class="' + PX + '-muted">Read-only health for this project. Settings does not invent a second owner.</div></div>' +
        (obj ? '<div data-row-id="' + esc(obj.id) + '" tabindex="-1"><strong>' + esc(obj.label) + "</strong> · " + esc(obj.kind) + "</div>" : "") +
        "</div>";
    } else if (m.archetype === "setup-sequence") {
      detail = '<h1 class="' + PX + '-h1">' + esc(m.title) + "</h1><p class='" + PX + "-lede'>" + esc(m.purpose) + "</p>" +
        '<div class="' + PX + '-seq"><div>1 Confirm this project</div><div>2 Review what will change</div><div>3 Apply once — no ongoing sync</div></div>';
    } else if (m.archetype === "preview-transaction") {
      detail = '<h1 class="' + PX + '-h1">' + esc(m.title) + "</h1><p class='" + PX + "-lede'>" + esc(m.purpose) + "</p>" +
        "<p>Import, export, reset, and rollback stay on <strong>" + esc(app.project.name) + "</strong>.</p>" +
        '<button type="button" class="' + PX + '-ghost" data-act="copy">Open Copy Settings From Another Project</button>';
    } else {
      detail = '<h1 class="' + PX + '-h1">' + esc(m.title) + "</h1><p class='" + PX + "-lede'>" + esc(m.purpose) + "</p>";
      if (obj) detail += '<div data-row-id="' + esc(obj.id) + '" tabindex="-1"><strong>' + esc(obj.label) + "</strong> · " + esc(obj.kind) + "</div>";
    }
    var related = app.settingsForPage(m.domain, null).slice(0, 10).map(function (s) { return control(app, s.id); }).join("");
    var form = '<div class="' + PX + '-form pmv2-scroll">' + detail + workBox(app) + "<h2>Project settings</h2>" + related + "</div>";
    var useSplit = m.archetype === "roster-detail" || m.archetype === "inventory-catalog" || m.id === "providers";
    if (useSplit) return '<div class="' + PX + '-split">' + roster + form + "</div>";
    return '<div class="' + PX + '-read">' + form + "</div>";
  }

  function allSettings(app) {
    var count = app.productSettingCount || 828;
    var cur = allFilter;
    return '<div class="' + PX + '-read"><h1 class="' + PX + '-h1">All Settings</h1>' +
      '<p class="' + PX + '-lede">Long-tail index of ' + esc(String(count)) + " product rows. Synthetic overlay is labeled and excluded from search by default. This list is virtualized.</p></div>" +
      '<div class="' + PX + '-comp' + (app.route.row ? " is-detail" : "") + '">' +
      '<aside class="' + PX + '-facets pmv2-scroll"><h2>Filters</h2>' +
      '<button type="button" data-act="all-filter" data-id=""' + (!cur ? ' aria-current="true"' : "") + ">All categories</button>" +
      (app.categories || []).map(function (c) {
        return '<button type="button" data-act="all-filter" data-id="' + esc(c.id) + '"' + (cur === c.id ? ' aria-current="true"' : "") + ">" + esc(c.title) + "</button>";
      }).join("") +
      '<button type="button" data-act="synth"' + (includeSynth ? ' aria-current="true"' : "") + ">" + (includeSynth ? "Hide" : "Include") + " synthetic overlay</button></aside>" +
      '<div class="' + PX + '-list pmv2-scroll" data-all-list="1"></div>' +
      '<div class="' + PX + '-detail pmv2-scroll">' +
      (app.route.row && app.controlModel(app.route.row) ? control(app, app.route.row) : '<p class="' + PX + '-muted">Select a row to read it in context.</p>') +
      "</div></div>";
  }

  function copyStep(app) {
    var s = app.copy && app.copy.step;
    if (s === "receipt" || s === "rolled_back") return 3;
    if (s === "applying") return 2;
    return 1;
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
      '<p class="' + PX + '-kicker">' + esc(d.label) + "</p>" +
      (d.desc ? '<p class="' + PX + '-lede">' + esc(d.desc) + "</p>" : "") +
      '<div class="' + PX + '-facts">' +
      factRow("Requested", fmtCopyVal(d.requested)) +
      factRow("Effective", fmtCopyVal(d.effective)) +
      factRow("Origin", origin.label || "—") +
      factRow("Policy floor", d.policyFloor || "—") +
      factRow("Persistence", d.persistence || "current-project") +
      factRow("Destination", d.scopeNote) +
      factRow("Backend", (d.simulated ? "Simulated · " : "") + (d.backend || "sessionStorage")) +
      "</div></aside>";
  }

  function copyView(app) {
    var step = copyStep(app);
    var p = app.copyPreview();
    var srcs = (app.projects || []).filter(function (x) { return !x.current; }).map(function (x) {
      return '<button type="button" data-act="copy-src" data-id="' + esc(x.id) + '"' + (app.copy.sourceId === x.id ? ' aria-current="true"' : "") + ">" + esc(x.name) + "</button>";
    }).join("");
    var cats = '<div class="' + PX + '-cats">' + (app.categories || []).map(function (c) {
      var on = (app.copy.categories || []).indexOf(c.id) !== -1;
      return '<label><input type="checkbox" data-act="copy-cat" data-id="' + esc(c.id) + '"' + (on ? " checked" : "") + "> " + esc(c.title) + "</label>";
    }).join("") + "</div>";
    var prev = "<p>Select a source project.</p>";
    if (p) {
      prev = "<p>Additions " + p.counts.additions + " · Replacements " + p.counts.replacements + " · Unchanged " + p.counts.unchanged + " · Unavailable " + p.counts.unavailable + " · Conflicts " + p.counts.conflicts + "</p>" +
        '<p class="' + PX + '-muted">Account and credential references copy. Secrets never copy. Projects stay independent. No ongoing link or shared settings profile.</p>' +
        '<p class="' + PX + '-muted">' + (p.simulated ? "Simulated · " : "") + esc(p.backend || "sessionStorage") + ". Copy, receipts, and rollback are not live ResourceGovernor.</p>" +
        '<div class="' + PX + '-chapter-list">' + copyPreviewLists(p) + "</div>";
    }
    var actions = "";
    if (app.copy.step === "receipt" && app.copy.receipt) {
      actions = copyReceiptFacts(app.copy.receipt) + "<button type='button' class='" + PX + "-primary' data-act='copy-rollback'>Roll back to restore point</button>";
    } else if (app.copy.step === "rolled_back") {
      actions = "<p>Rollback complete. This project’s previous values were restored.</p>";
    } else if (app.copy.step === "applying") {
      actions = "<p>Creating a restore point, then copying into this project.</p>";
    } else {
      actions = "<button type='button' class='" + PX + "-primary' data-act='copy-apply'>Create restore point and copy</button>";
    }
    return '<div class="' + PX + '-read"><h1 class="' + PX + '-h1">Copy Settings From Another Project</h1>' +
      "<p>One-time copy into <strong>" + esc(app.project.name) + "</strong>.</p>" +
      '<ol class="' + PX + '-steps">' +
      "<li" + (step === 1 ? ' aria-current="step"' : "") + ">1 Preview</li>" +
      "<li" + (step === 2 ? ' aria-current="step"' : "") + ">2 Apply</li>" +
      "<li" + (step === 3 ? ' aria-current="step"' : "") + ">3 Receipt</li>" +
      "</ol>" + workBox(app) +
      "<h2>Source project</h2><div class='" + PX + "-src'>" + srcs + "</div>" +
      "<h2>Categories</h2>" + cats +
      "<h2>Preview</h2>" + prev + actions + "</div>";
  }

  function deferredView(app) {
    var d = (app.deferred || []).filter(function (x) { return x.id === app.route.deferred; })[0];
    if (!d) return "<div>Unknown owner module</div>";
    return '<div class="' + PX + '-read"><h1 class="' + PX + '-h1">' + esc(d.title) + "</h1>" +
      "<p>This destination is owned by <strong>" + esc(d.owner) + "</strong>. Settings does not invent a backend for it.</p>" +
      "<p>Return contract: Back restores the previous Settings location. Close Settings returns to the opening surface.</p>" +
      '<button type="button" class="' + PX + '-ghost" data-act="back">Return to Settings</button></div>';
  }

  function canvas(app) {
    var r = app.route || { name: "home" };
    if (r.name === "home") return home(app);
    if (r.name === "domain") return domain(app);
    if (r.name === "manager") return managerView(app);
    if (r.name === "all") return allSettings(app);
    if (r.name === "copy") return copyView(app);
    if (r.name === "deferred") return deferredView(app);
    return home(app);
  }

  function stage(app) {
    return '<div class="' + PX + '-stage">' + edge(app) +
      '<div class="' + PX + '-depth">' +
      '<div class="' + PX + '-leaf" data-n="2" aria-hidden="true"></div>' +
      '<div class="' + PX + '-leaf" data-n="1" aria-hidden="true"></div>' +
      '<div class="' + PX + '-page ' + PX + '-layer">' + localTabs(app) +
      '<div class="' + PX + '-canvas pmv2-scroll">' + canvas(app) + "</div>" +
      detailsDrawer(app) +
      "</div></div></div>";
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
      return '<button type="button" class="' + PX + '-hit" data-act="row" data-id="' + esc(item.id) + '" data-row-id="' + esc(item.id) + '"><b>' + esc(item.label) + "</b><span class='path'>" + esc(item.path) + "</span></button>";
    });
  }

  function onAct(app, act, id, el) {
    if (act === "back") app.back();
    else if (act === "close") app.closeSettings();
    else if (act === "home") { if (app.route.name !== "home") app.navigate({ name: "home" }); }
    else if (act === "states") {
      app.openPopup(el, DEMO_STATES.map(function (n) { return { id: n, label: pretty(n) }; }), function (sid) { app.triggerState(sid); });
    } else if (act === "domain") app.openDomain(id);
    else if (act === "page") app.openPage(el.getAttribute("data-domain"), id);
    else if (act === "manager") app.openManager(id);
    else if (act === "object") app.openManager(app.route.manager, { object: id, page: app.route.page });
    else if (act === "mtab") app.openManager(app.route.manager, { object: app.route.object, page: id });
    else if (act === "deferred") app.openDeferred(id);
    else if (act === "all") app.openAll();
    else if (act === "all-filter") { allFilter = id || ""; app.paint(); }
    else if (act === "copy") app.openCopy();
    else if (act === "pick") app.pickResult(id);
    else if (act === "row") {
      if (app.routeSettingRow) app.routeSettingRow(id);
      else app.pickResult("setting:" + id);
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
      app.paint();
    } else if (act === "copy-src") { app.copy.sourceId = id; app.copy.step = "preview"; app.paint(); }
    else if (act === "copy-cat") {
      var set = app.copy.categories ? app.copy.categories.slice() : [];
      if (el.checked && set.indexOf(id) === -1) set.push(id);
      if (!el.checked) set = set.filter(function (x) { return x !== id; });
      app.copy.categories = set;
      app.paint();
    } else if (act === "copy-apply") app.applyCopy();
    else if (act === "copy-rollback") app.rollbackCopy();
    else if (act === "synth") {
      includeSynth = !includeSynth;
      app.receipt("Synthetic overlay is labeled and excluded from product inventory search by default.", "info");
      app.paint();
    }
  }

  function bind(app, root) {
    var search = root.querySelector("[data-search]");
    if (search) {
      search.oninput = function () {
        app.setQuery(search.value);
        if (app.results && app.results.length) app.selectedResultId = app.results[0].id;
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
      if (el.tagName === "SELECT" || el.tagName === "INPUT") return;
      onAct(app, el.getAttribute("data-act"), el.getAttribute("data-id"), el);
    };
    root.onchange = function (ev) {
      var el = ev.target.closest("[data-act]");
      if (!el) return;
      var act = el.getAttribute("data-act");
      if (act === "select" || act === "number" || act === "text" || act === "copy-cat") {
        onAct(app, act, el.getAttribute("data-id"), el);
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
    root.setAttribute("data-inventory-count", String(app.productSettingCount || 828));
    var keepSearch = document.activeElement && document.activeElement.getAttribute && document.activeElement.getAttribute("data-search") != null;
    var caret = keepSearch ? document.activeElement.selectionStart : null;
    root.innerHTML = chrome(app) + banner(app) + stage(app);
    bind(app, root);
    fillAll(app, root);
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
    var app = window.PMv2.createApp({ namespace: "c09", root: document.getElementById(ROOT_ID), render: render });
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
      if (includeSynth) { includeSynth = false; app.paint(); return; }
      if (allFilter) { allFilter = ""; app.paint(); return; }
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
    window.__pmv2App = app;
  });
})();
