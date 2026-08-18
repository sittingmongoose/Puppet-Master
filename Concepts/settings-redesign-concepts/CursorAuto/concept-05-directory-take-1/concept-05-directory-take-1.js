(function () {
  "use strict";
  var PX = "d1";
  var LAYOUT = "directory-take-1";
  var ROOT_ID = "d1-root";
  var PAGE_CHUNK = 8;
  var esc = window.PMv2.esc;
  var virt = null;
  var showMore = {};
  var allFacet = null;
  var includeSynth = false;
  var restoreFocus = null;

  function ico() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="currentColor"/><path d="M8 12h8" fill="none" stroke="currentColor"/></svg>';
  }
  function searchIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor"/><path d="m20 20-3.5-3.5" fill="none" stroke="currentColor"/></svg>';
  }
  function humanType(t) {
    return String(t || "setting").replace(/_/g, " ");
  }
  function groupHits(hits) {
    var order = [];
    var buckets = {};
    (hits || []).forEach(function (h) {
      var k = h.type || "setting";
      if (!buckets[k]) { buckets[k] = []; order.push(k); }
      buckets[k].push(h);
    });
    return order.map(function (k) { return { type: k, items: buckets[k] }; });
  }
  function runOfficialCli(app, providerId) {
    var id = providerId || "local-ollama";
    if (app && typeof app.confirmOfficialCli === "function") { app.confirmOfficialCli(id); return true; }
    if (window.PMv2 && typeof window.PMv2.confirmOfficialCli === "function") {
      window.PMv2.confirmOfficialCli(app, id);
      if (app.paint) app.paint();
      return true;
    }
    if (app && typeof app.installOfficialCli === "function") { app.installOfficialCli(id); return true; }
    if (window.PMv2 && typeof window.PMv2.installOfficialCli === "function") {
      window.PMv2.installOfficialCli(app, id);
      if (app.paint) app.paint();
      return true;
    }
    return false;
  }
  function humanAvail(a) {
    if (!a || a === "ready") return "";
    return String(a).replace(/_/g, " ");
  }
  function fmtCopyVal(v) {
    if (v == null || v === "") return "—";
    if (typeof v === "boolean") return v ? "On" : "Off";
    if (Array.isArray(v)) return v.join(", ");
    return String(v);
  }

  function crumb(app) {
    var r = app.route || { name: "home" };
    var parts = ["Settings"];
    if (r.domain && app.cat(r.domain)) parts.push(app.cat(r.domain).title);
    if (r.page && r.name === "domain") {
      var sub = ((app.cat(r.domain) || {}).subgroups || []).filter(function (s) { return s.id === r.page; })[0];
      parts.push(sub ? sub.title : r.page);
    }
    if (r.manager && app.mgr(r.manager)) parts.push(app.mgr(r.manager).title);
    if (r.object) {
      var objs = app.objectsFor(r.manager) || [];
      var ob = objs.filter(function (o) { return o.id === r.object; })[0];
      parts.push(ob ? ob.label : r.object);
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
    if (prev.name === "copy") return "Back to Copy from another project";
    return "Back";
  }

  function chrome(app) {
    var q = esc(app.query || "");
    var drop = "";
    if (app.searchOpen) {
      var hits = (app.results || []).slice(0, 24);
      if (!hits.length && app.query) {
        drop = '<div class="' + PX + '-drop pmv2-scroll" role="listbox" id="d1-drop"><div class="' + PX + '-hit">No matching settings</div></div>';
      } else if (hits.length) {
        var selected = app.selectedResultId;
        if (!hits.some(function (h) { return h.id === selected; })) selected = hits[0].id;
        drop = '<div class="' + PX + '-drop pmv2-scroll" role="listbox" id="d1-drop">' + groupHits(hits).map(function (g) {
          return '<div class="' + PX + '-muted">' + esc(humanType(g.type)) + "</div>" + g.items.map(function (h) {
            var sel = h.id === selected ? "true" : "false";
            var extra = humanAvail(h.availability);
            return '<button type="button" class="' + PX + '-hit" role="option" aria-selected="' + sel + '" data-act="pick" data-id="' + esc(h.id) + '"><b>' + esc(h.label) + '</b><span class="path">' + esc(h.path) + '</span><span class="meta">' + esc(humanType(h.type)) + (extra ? " · " + esc(extra) : "") + "</span></button>";
          }).join("");
        }).join("") + "</div>";
      }
    }
    var banner = "";
    if (app.flags.offline) banner = '<div class="' + PX + '-banner">Offline. Cached values stay visible; refresh waits for network.</div>';
    else if (app.flags.restart) banner = '<div class="' + PX + '-banner">Restart required before this change applies to new runs.</div>';
    else if (app.flags.reconnect) banner = '<div class="' + PX + '-banner">Reconnect required for Google AI. Other project settings are unchanged.</div>';
    var states = "";
    if (app.statesOpen) {
      var names = ["loading-cached", "empty", "no-search-results", "typo-fuzzy", "validation-error", "offline", "managed", "unavailable", "restart-required", "reconnect-required", "changed-elsewhere", "import-conflict", "rollback-complete", "usage-unavailable", "multi-install", "unknown-owner", "provider-update", "verification-failure"];
      states = '<div class="' + PX + '-states pmv2-scroll" role="dialog" aria-label="Demo states">' + names.map(function (n) {
        return '<button type="button" data-act="state" data-id="' + n + '">' + esc(n.replace(/-/g, " ")) + "</button>";
      }).join("") + "</div>";
    }
    return '<div class="' + PX + '-chrome">' +
      '<div class="' + PX + '-searchwrap">' + searchIcon() +
      '<input data-search type="search" placeholder="Search settings, managers, and setups" value="' + q + '" aria-label="Universal settings search" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="' + (app.searchOpen ? "true" : "false") + '" aria-controls="d1-drop">' +
      drop + "</div>" +
      '<span class="' + PX + '-proj">Project · ' + esc(app.project.name) + "</span>" +
      '<div class="' + PX + '-crumb">' + crumb(app) + "</div>" +
      '<button type="button" class="' + PX + '-back" data-act="back">' + esc(backLabel(app)) + "</button>" +
      '<button type="button" class="' + PX + '-statesbtn" data-act="states">Demo states</button>' +
      '<button type="button" class="' + PX + '-close" data-act="close">Close Settings</button>' +
      states + "</div>" + (banner ? '<div style="padding:8px 16px">' + banner + "</div>" : "");
  }

  function workBox(app) {
    if (!app.work) return "";
    var w = app.work;
    var bar = "";
    if (w.progress_kind === "determinate") bar = "<div>" + esc(w.completed) + " / " + esc(w.total) + " · " + esc(w.progress_source) + "</div>";
    else if (w.progress_kind && w.progress_kind !== "none") bar = "<div>Progress unknown · " + esc(w.progress_source) + "</div>";
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
      ctl = '<input data-act="number" data-id="' + esc(id) + '" type="number" value="' + esc(m.value == null ? "" : m.value) + '"' + (m.disabled ? " disabled" : "") + ">";
    } else if (m.type === "action") {
      ctl = '<button type="button" data-act="do" data-id="' + esc(id) + '"' + (m.disabled ? " disabled" : "") + ">Run</button>";
    } else {
      ctl = '<input data-act="text" data-id="' + esc(id) + '" type="text" value="' + esc(m.value == null ? "" : m.value) + '"' + (m.disabled ? " disabled" : "") + ">";
    }
    return '<div class="' + PX + '-row" data-row-id="' + esc(id) + '"><div><label>' + esc(m.label) + "</label><p>" + esc(m.desc) + "</p>" +
      (m.reason ? '<p class="' + PX + '-muted">' + esc(m.reason) + "</p>" : "") +
      '<button type="button" class="' + PX + '-whybtn" data-act="why" data-id="' + esc(id) + '">Why this value?</button>' +
      "</div><div>" + ctl + "</div></div>";
  }

  function settingBlock(app, rows, key) {
    if (!rows.length) return '<p class="' + PX + '-muted">No settings on this page.</p>';
    var open = !!showMore[key];
    var shown = open ? rows : rows.slice(0, PAGE_CHUNK);
    var more = "";
    if (rows.length > PAGE_CHUNK) {
      more = '<p class="' + PX + '-muted"><button type="button" data-act="more" data-id="' + esc(key) + '">' +
        (open ? "Show fewer on this page" : "Show remaining " + (rows.length - PAGE_CHUNK) + " on this page") +
        "</button></p>";
    }
    return shown.map(function (s) { return control(app, s.id); }).join("") + more;
  }

  function attention(app) {
    if (app.flags.empty) return '<p class="' + PX + '-muted">Nothing needs attention.</p>';
    var items = (app.attention || []).slice(0, 4);
    if (!items.length) return "";
    return '<h2>Needs attention</h2><div class="' + PX + '-att">' + items.map(function (a) {
      return '<button type="button" data-act="pick" data-id="' + esc(a.destId) + '"><strong>' + esc(a.title) + '</strong><div class="' + PX + '-muted">' + esc(a.detail) + "</div></button>";
    }).join("") + "</div>";
  }

  function utils() {
    return '<p class="' + PX + '-utils"><button type="button" data-act="all">All Settings</button> · <button type="button" data-act="copy">Copy Settings From Another Project</button></p>';
  }

  function home(app) {
    var cats = app.categories || [];
    var dest = '<div class="' + PX + '-cards">' + cats.map(function (c) {
      return '<button type="button" class="' + PX + '-card" data-act="domain" data-id="' + esc(c.id) + '">' + ico() + "<strong>" + esc(c.title) + "</strong><span>" + esc(c.description) + "</span></button>";
    }).join("") + "</div>";
    return '<div class="' + PX + "-home " + PX + '-scroll pmv2-scroll ' + PX + '-expand">' +
      '<p class="' + PX + '-kicker">Directory</p>' +
      '<h1 class="' + PX + '-h1">Settings</h1>' +
      '<p class="' + PX + '-lede">Twelve destinations for this project. Search first; copy from another project is a one-time action, not a live link.</p>' +
      attention(app) +
      "<h2>Destinations</h2>" + dest +
      utils() + workBox(app) +
      "</div>";
  }

  function destBtn(act, id, current, title, hint, extra) {
    var cur = current ? ' aria-current="true"' : "";
    var more = extra || "";
    return '<button type="button" class="' + PX + '-dest" data-act="' + act + '" data-id="' + esc(id) + '"' + more + cur + "><strong>" + esc(title) + "</strong>" +
      (hint ? "<span>" + esc(hint) + "</span>" : "") + "</button>";
  }

  function domain(app) {
    var c = app.cat(app.route.domain) || { title: "Settings", subgroups: [], description: "", id: "general" };
    var page = app.route.page || ((c.subgroups || [])[0] || {}).id;
    var rows = app.settingsForPage(c.id, page);
    var mgrs = app.domainManagers[c.id] || [];
    var deferred = (app.deferred || []).filter(function (d) { return d.domain === c.id; });
    var subnav = (c.subgroups || []).map(function (sg) {
      return destBtn("page", sg.id, sg.id === page, sg.title, sg.description || "Page in this domain", ' data-domain="' + esc(c.id) + '"');
    }).join("");
    var mgrNav = mgrs.map(function (id) {
      var m = app.mgr(id);
      return destBtn("manager", id, false, m ? m.title : id, m ? m.purpose : "");
    }).join("");
    var defNav = deferred.map(function (d) {
      return destBtn("deferred", d.id, false, d.title, "Owned by " + d.owner);
    }).join("");
    var pageTitle = ((c.subgroups || []).filter(function (s) { return s.id === page; })[0] || {}).title || "Settings";
    var side = '<aside class="' + PX + '-destcol pmv2-scroll">' +
      "<h2>Pages</h2>" + subnav +
      (mgrNav ? "<h2>Managers</h2>" + mgrNav : "") +
      (defNav ? "<h2>Owner modules</h2>" + defNav : "") +
      "</aside>";
    var main = '<div class="' + PX + "-workspace " + PX + '-scroll pmv2-scroll">' +
      '<p class="' + PX + '-kicker">' + esc(c.title) + "</p>" +
      '<h1 class="' + PX + '-h1">' + esc(pageTitle) + "</h1>" +
      '<p class="' + PX + '-lede">' + esc(c.description) + "</p>" +
      workBox(app) +
      "<h2>Settings for this project</h2>" +
      settingBlock(app, rows, c.id + "." + page) +
      "</div>";
    return '<div class="' + PX + "-dir " + PX + '-expand">' + side + main + "</div>";
  }

  function factRow(key, value, rowId) {
    return '<div class="' + PX + '-fact"' + (rowId ? ' data-row-id="' + esc(rowId) + '"' : "") + '><span class="k">' + esc(key) + "</span><span>" + esc(value || "—") + "</span></div>";
  }

  function providerConnected(obj) {
    var a = String((obj && obj.availability) || "ready");
    if (a === "ready") return "Connected for this project";
    if (a === "setup_required") return "Not connected — setup required";
    if (a === "reconnect_required") return "Installed, reconnect required";
    return a.replace(/_/g, " ");
  }

  function providerUsageEnd(obj) {
    var a = String((obj && obj.availability) || "ready");
    if (a === "setup_required") return "Nothing to decide until it is set up.";
    if (a === "reconnect_required") return "Reconnect first. Cached usage is stale.";
    var usage = String((obj && obj.usage) || "");
    if (/pay-as-you-go/i.test(usage)) return "Continue on pay-as-you-go. Settings owns this choice; Usage owns the metered balance.";
    if (/unavailable/i.test(usage)) return "Nothing to decide until usage is reported.";
    return "Ask each time. Settings owns what happens when included usage ends; Usage owns the remaining balance.";
  }

  function providerRouting(obj) {
    var a = String((obj && obj.availability) || "ready");
    if (a === "setup_required") return "No route until setup finishes. Fallback is not armed.";
    if (a === "reconnect_required") return "Requested route stays this account; fallback waits until reconnect.";
    return "Follows this project's order of preference. Exhausted included usage may fall back to the next ready route.";
  }

  function providerTabLabel(t) {
    if (t === "usage") return "When included usage ends";
    if (t === "accounts") return "Routing / fallback";
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  function providerDetail(app, obj) {
    if (!obj) return "";
    var page = app.route.page || "overview";
    var facts = '<div class="' + PX + '-facts">' +
      factRow("Connected", providerConnected(obj)) +
      factRow("Account", obj.account, "account-default") +
      factRow("Product", obj.product) +
      factRow("Models", obj.models) +
      factRow("When included usage ends", providerUsageEnd(obj), "usage-end") +
      factRow("Routing / fallback", providerRouting(obj), "routing-fallback") +
      factRow("Usage", obj.usage, "usage-projection") +
      factRow("Setup", obj.setup, obj.id === "local-ollama" ? "install-official" : null) +
      "</div>";
    var extra = "";
    if (obj.id === "local-ollama") {
      extra += "<p>Ollama is not bundled. Install from the official Ollama source for This PC / Native Windows. Authentication is a separate step.</p>" +
        '<p><button type="button" data-act="install-official" data-id="local-ollama" data-row-id="install-official">Install from official source</button></p>';
    }
    if (obj.id === "google") {
      extra += '<p class="' + PX + '-muted">Usage projection is stale until reconnect. Cached catalog remains visible.</p>';
    }
    if (page === "installations") {
      extra += "<h2>Installations</h2>" + app.installs.filter(function (i) {
        return i.provider === obj.id || obj.id === "anthropic";
      }).map(function (i) {
        return '<div class="' + PX + '-step" data-row-id="' + esc(i.id) + '">' + esc(i.label) + " · " + esc(i.host) + " · " +
          (i.selected ? "Selected" : (i.shadowed ? "Shadowed" : "Available")) +
          (i.manualOnly ? " · Unknown owner — manual only" : "") + "</div>";
      }).join("");
    }
    if (page === "usage") {
      extra += '<h2>When included usage ends</h2>' +
        '<p data-row-id="usage-end">' + esc(providerUsageEnd(obj)) + "</p>" +
        '<p class="' + PX + '-muted">Settings owns the continuation. Usage owns the projection and never writes this choice.</p>' +
        '<p data-row-id="usage-projection">Projection: ' + esc(obj.usage || "—") + "</p>" +
        '<p><button type="button" data-act="usage-refresh">Refresh usage</button></p>';
    }
    if (page === "accounts") {
      extra += '<h2>Routing / fallback</h2>' +
        '<p data-row-id="routing-fallback">' + esc(providerRouting(obj)) + "</p>" +
        '<p data-row-id="account-default">Selected account: ' + esc(obj.account || "—") + " · " + esc(obj.product || "—") + "</p>" +
        '<p class="' + PX + '-muted">Credentials stay on the account. Switching route does not copy secrets. Limits, logs, and catalogs stay on their own subpages.</p>';
    }
    return '<h1 class="' + PX + '-h1">' + esc(obj.label) + "</h1>" +
      '<p class="' + PX + '-lede">Connected state, selected account, models, usage-end behavior, routing/fallback, and setup — for this project only.</p>' +
      facts + extra;
  }

  function managerView(app) {
    var m = app.mgr(app.route.manager);
    if (!m) return "<div>Missing manager</div>";
    var objs = app.objectsFor(m.id) || [];
    var obj = objs.filter(function (o) { return o.id === app.route.object; })[0] || objs[0];
    var tab = app.route.page || (m.tabs && m.tabs[0]) || "overview";
    var type = m.archetype || "preference-document";
    var tabNav = (m.tabs || []).map(function (t) {
      var label = m.id === "providers" ? providerTabLabel(t) : (t.charAt(0).toUpperCase() + t.slice(1));
      return destBtn("mtab", t, t === tab, label, "");
    }).join("");
    var roster = objs.map(function (o) {
      return destBtn("object", o.id, obj && o.id === obj.id, o.label, humanType(o.kind) + (o.availability && o.availability !== "ready" ? " · " + humanAvail(o.availability) : ""));
    }).join("");
    var related = app.settingsForPage(m.domain, null).slice(0, 8);
    var detail = "";
    if (m.id === "providers") {
      detail = providerDetail(app, obj);
    } else if (type === "health-projection") {
      detail = '<h1 class="' + PX + '-h1">' + esc(m.title) + "</h1><p class=\"" + PX + '-lede">' + esc(m.purpose) + "</p>" +
        '<div class="' + PX + '-health">' +
        '<div class="' + PX + '-check" data-row-id="' + esc(obj ? obj.id : m.id) + '">Last known good — cached projection</div>' +
        '<div class="' + PX + '-check">Repair opens the owner check, not a fabricated backend.</div>' +
        "</div>";
    } else if (type === "setup-sequence") {
      detail = '<h1 class="' + PX + '-h1">' + esc(m.title) + "</h1><p class=\"" + PX + '-lede">' + esc(m.purpose) + "</p>" +
        '<div class="' + PX + '-steps">' +
        '<div class="' + PX + '-step">1. Review current state</div>' +
        '<div class="' + PX + '-step">2. Confirm the official source or restore point</div>' +
        '<div class="' + PX + '-step">3. Apply once — this project only</div>' +
        "</div>";
    } else if (type === "preview-transaction") {
      detail = '<h1 class="' + PX + '-h1">' + esc(m.title) + "</h1><p class=\"" + PX + '-lede">' + esc(m.purpose) + "</p>" +
        "<p>Import, export, reset, and migration preview here. Copy from another project is a separate one-time flow.</p>" +
        '<p><button type="button" data-act="copy">Open copy preview</button></p>';
    } else if (type === "inventory-catalog") {
      detail = '<h1 class="' + PX + '-h1">' + esc(m.title) + "</h1><p class=\"" + PX + '-lede">' + esc(m.purpose) + "</p>" +
        (obj ? '<div class="' + PX + '-step" data-row-id="' + esc(obj.id) + '"><strong>' + esc(obj.label) + "</strong> · " + esc(humanType(obj.kind)) + "</div>" : "");
    } else {
      detail = '<h1 class="' + PX + '-h1">' + esc(m.title) + "</h1><p class=\"" + PX + '-lede">' + esc(m.purpose) + "</p>" +
        (obj ? '<div data-row-id="' + esc(obj.id) + '"><strong>' + esc(obj.label) + "</strong> · " + esc(humanType(obj.kind)) + "</div>" : "");
    }
    var side = '<aside class="' + PX + '-destcol pmv2-scroll"><h2>Sections</h2>' + tabNav +
      (roster ? "<h2>In this manager</h2>" + roster : "") + "</aside>";
    var main = '<div class="' + PX + "-workspace " + PX + '-scroll pmv2-scroll">' + workBox(app) + detail +
      "<h2>Related project settings</h2>" + related.map(function (s) { return control(app, s.id); }).join("") +
      "</div>";
    return '<div class="' + PX + "-dir " + PX + '-expand">' + side + main + "</div>";
  }

  function allSettings(app) {
    var facets = '<aside class="' + PX + '-facets pmv2-scroll"><h2>Filters</h2>' +
      destBtn("facet", "", !allFacet, "All domains", app.productSettingCount + " product settings") +
      (app.categories || []).map(function (c) {
        return destBtn("facet", c.id, allFacet === c.id, c.title, "");
      }).join("") +
      '<p class="' + PX + '-muted"><button type="button" data-act="synth">' + (includeSynth ? "Hide synthetic overlay" : "Include synthetic overlay") + "</button></p></aside>";
    return '<div class="' + PX + '-all">' + facets +
      '<div class="' + PX + '-list pmv2-scroll" data-all-list="1"></div></div>';
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
    return '<aside class="' + PX + '-details ' + PX + '-destcol pmv2-scroll" data-details-drawer role="dialog" aria-label="Setting details">' +
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
      factRow("Scope", d.scopeNote) +
      factRow("Backend", (d.simulated ? "Simulated · " : "") + (d.backend || "sessionStorage")) +
      "</div></aside>";
  }

  function copyView(app) {
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
        '<p class="' + PX + '-muted">Account and credential references copy. Secrets never copy. Projects stay independent — no sync, profiles, or inheritance.</p>' +
        '<p class="' + PX + '-muted">' + (p.simulated ? "Simulated · " : "") + esc(p.backend || "sessionStorage") + "</p>" +
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
    return '<div class="' + PX + "-copy " + PX + '-scroll pmv2-scroll ' + PX + '-expand">' +
      '<p class="' + PX + '-kicker">One-time copy</p>' +
      '<h1 class="' + PX + '-h1">Copy Settings From Another Project</h1>' +
      "<p>Copies into <strong>" + esc(app.project.name) + "</strong>. No ongoing sync.</p>" +
      "<h2>1. Source project</h2><div class='" + PX + "-copy-src'>" + srcs + "</div>" +
      "<h2>2. Categories</h2><div class='" + PX + "-copy-cats'>" + cats + "</div>" +
      "<h2>3. Preview</h2>" + prev +
      "<h2>4. Apply</h2>" + actions + workBox(app) +
      "</div>";
  }

  function deferredView(app) {
    var d = (app.deferred || []).filter(function (x) { return x.id === app.route.deferred; })[0];
    if (!d) return "<div>Unknown owner module</div>";
    return '<div class="' + PX + "-workspace " + PX + '-scroll pmv2-scroll ' + PX + '-expand">' +
      '<p class="' + PX + '-kicker">Named owner</p>' +
      '<h1 class="' + PX + '-h1">' + esc(d.title) + "</h1>" +
      "<p>This destination is owned by <strong>" + esc(d.owner) + "</strong>. Settings does not invent a backend for it.</p>" +
      "<p>Return contract: Back restores the previous Settings location. Close Settings returns to the opening surface.</p>" +
      "<button type='button' data-act='back'>Return to Settings</button></div>";
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
      if (allFacet && s.id.split(".")[0] !== allFacet) return false;
      return true;
    }).map(function (s) {
      var cat = app.cat(s.id.split(".")[0]);
      return { id: s.id, label: s.label, path: (cat && cat.title) || s.id.split(".")[0], type: s.type };
    });
    virt = window.PMv2.virtualList(host, items, 52, function (item) {
      return '<button type="button" class="' + PX + '-hit" data-act="row" data-id="' + esc(item.id) + '" data-row-id="' + esc(item.id) + '"><b>' + esc(item.label) + "</b><span class='path'>" + esc(item.path) + "</span><span class='meta'>" + esc(humanType(item.type)) + "</span></button>";
    });
  }

  function captureFocus(root) {
    var ae = document.activeElement;
    if (!ae || !root.contains(ae)) return null;
    if (ae.getAttribute && ae.getAttribute("data-search") != null) {
      return { kind: "search", start: ae.selectionStart, end: ae.selectionEnd };
    }
    if (ae.getAttribute && ae.getAttribute("data-id") != null && ae.getAttribute("data-act")) {
      return {
        kind: "ctl",
        act: ae.getAttribute("data-act"),
        id: ae.getAttribute("data-id"),
        start: ae.selectionStart,
        end: ae.selectionEnd
      };
    }
    return null;
  }

  function cssId(s) {
    s = String(s == null ? "" : s);
    try {
      if (typeof CSS !== "undefined" && CSS.escape) return CSS.escape(s);
    } catch (e) {}
    return s.split('"').join("\\22 ");
  }

  function restoreCaptured(root, snap) {
    if (!snap) return;
    var el = null;
    if (snap.kind === "search") el = root.querySelector("[data-search]");
    else if (snap.kind === "ctl") el = root.querySelector('[data-act="' + snap.act + '"][data-id="' + cssId(snap.id) + '"]');
    if (!el) return;
    el.focus();
    try {
      if (snap.start != null && typeof el.setSelectionRange === "function") el.setSelectionRange(snap.start, snap.end != null ? snap.end : snap.start);
    } catch (e) {}
  }

  function bind(app, root) {
    var search = root.querySelector("[data-search]");
    if (search) {
      search.oninput = function () {
        restoreFocus = { kind: "search", start: search.selectionStart, end: search.selectionEnd };
        app.setQuery(search.value);
        if (app.results && app.results.length && !app.results.some(function (h) { return h.id === app.selectedResultId; })) {
          app.selectedResultId = app.results[0].id;
        }
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
        } else if (ev.key === "Escape") {
          ev.preventDefault();
          if (ev.stopPropagation) ev.stopPropagation();
          if (app.handleEscape) app.handleEscape();
          else app.back();
        }
      };
    }
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
    root.onclick = function (ev) {
      var el = ev.target.closest("[data-act]");
      if (!el) return;
      var act = el.getAttribute("data-act");
      var id = el.getAttribute("data-id");
      if (act === "back") app.back();
      else if (act === "close") app.closeSettings();
      else if (act === "states") { app.statesOpen = !app.statesOpen; app.paint(); }
      else if (act === "state") app.triggerState(id);
      else if (act === "domain") app.openDomain(id);
      else if (act === "page") app.navigate({ name: "domain", domain: el.getAttribute("data-domain"), page: id, section: id }, { replace: true });
      else if (act === "manager") app.openManager(id);
      else if (act === "object") app.navigate({ name: "manager", domain: app.route.domain, manager: app.route.manager, object: id, page: app.route.page }, { replace: true });
      else if (act === "mtab") app.navigate({ name: "manager", domain: app.route.domain, manager: app.route.manager, object: app.route.object, page: id }, { replace: true });
      else if (act === "deferred") app.openDeferred(id);
      else if (act === "all") app.openAll();
      else if (act === "copy") app.openCopy();
      else if (act === "pick") app.pickResult(id);
      else if (act === "row") {
        if (app.routeSettingRow) app.routeSettingRow(id);
        else app.pickResult("setting:" + id);
      }
      else if (act === "facet") { allFacet = id || null; app.paint(); }
      else if (act === "more") { showMore[id] = !showMore[id]; app.paint(); }
      else if (act === "toggle") {
        var cur = app.controlModel(id);
        app.setValue(id, !(cur && cur.value));
      } else if (act === "do") app.receipt("Ran " + id + " for this project (simulated).", "info");
      else if (act === "why") app.openDetails(id);
      else if (act === "details-close") app.closeDetails();
      else if (act === "install-official") {
        if (!runOfficialCli(app, id || "local-ollama")) {
          app.work = { title: "Install Ollama", human_phase: "Waiting for explicit Install", state: "waiting_user", wait_reason: "Official source confirmation", progress_kind: "none", progress_source: "provider setup", last_known_good: true, message: "Not bundled. Not silently installed." };
          app.receipt("Install starts only after you confirm the official source (simulated).", "info");
          app.paint();
        }
      } else if (act === "usage-refresh") {
        app.work = { title: "Refresh usage", human_phase: "Refreshing", state: "running", progress_kind: "indeterminate", progress_source: "usage", last_known_good: true, message: "Cached usage stays visible." };
        app.receipt("Usage refresh requested for this project (simulated).", "info");
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
  }

  function render(app) {
    var root = document.getElementById(ROOT_ID);
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

  function boot() {
    try { if (window.PMShell) window.PMShell.init(); } catch (e) {}
    var app = window.PMv2.createApp({ namespace: "c05", root: document.getElementById(ROOT_ID), render: render });
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
      if (allFacet) { allFacet = null; app.paint(); return; }
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
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
