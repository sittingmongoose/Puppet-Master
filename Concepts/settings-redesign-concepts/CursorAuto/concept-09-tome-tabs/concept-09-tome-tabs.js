(function () {
  "use strict";
  var PX = "tm";
  var LAYOUT = "tome-tabs";
  var ROOT_ID = "tm-root";
  var esc = window.PMv2.esc;
  var appRef = null;
  var virt = null;

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

  function officialProviderId(app, providerId) {
    return providerId || (app && app._officialProviderId) || (app && app.route && app.route.object) || "local-ollama";
  }
  function awaitingOfficial(app) {
    var w = app && app.work;
    if (!w || w.state !== "waiting_user") return false;
    var blob = [w.title, w.wait_reason, w.progress_source, w.human_phase, w.message].join(" ");
    return /official|user consent|unknown owner|provider setup/i.test(blob);
  }
  function installOfficial(app, providerId) {
    var id = officialProviderId(app, providerId);
    if (app) app._officialProviderId = id;
    if (app && typeof app.installOfficialCli === "function") {
      app.installOfficialCli(id);
      return true;
    }
    if (window.PMv2 && typeof window.PMv2.installOfficialCli === "function") {
      window.PMv2.installOfficialCli(app, id);
      if (app && app.paint) app.paint();
      return true;
    }
    if (app) {
      app.work = { title: "Install from official source", human_phase: "Waiting for explicit Install confirmation", state: "waiting_user", wait_reason: "Official provider source for This PC / Native Windows", progress_kind: "none", progress_source: "user consent", last_known_good: true, message: "Not bundled. Not silently installed." };
      if (app.paint) app.paint();
    }
    return true;
  }
  function confirmOfficial(app, providerId) {
    var id = officialProviderId(app, providerId);
    if (app && typeof app.confirmOfficialCli === "function") {
      app.confirmOfficialCli(id);
      if (app.paint) app.paint();
      return true;
    }
    if (window.PMv2 && typeof window.PMv2.confirmOfficialCli === "function") {
      window.PMv2.confirmOfficialCli(app, id);
      if (app && app.paint) app.paint();
      return true;
    }
    if (app && app.paint) app.paint();
    return false;
  }
  function confirmOfficialControls(app, providerId) {
    if (!awaitingOfficial(app)) return "";
    var id = officialProviderId(app, providerId);
    var reason = (app.work && app.work.wait_reason) ? '<p class="' + PX + '-muted">' + esc(app.work.wait_reason) + "</p>" : "";
    return reason + '<p><button type="button" class="' + PX + '-primary" data-act="confirm-official" data-id="' + esc(id) + '">Confirm official source</button></p>';
  }
  function installationIdentity(row) {
    if (!row) return null;
    if (window.PMv2 && typeof window.PMv2.installationIdentity === "function") {
      var fromApi = window.PMv2.installationIdentity(row);
      if (fromApi) return fromApi;
    }
    return {
      launcher: row.launcher || "",
      executable: row.executable || "",
      package: row.package || "",
      host: row.host || "",
      evidence: row.evidence || "",
      confidence: row.confidence || ""
    };
  }
  function emptyNone() {
    return '<p class="' + PX + '-muted">None</p>';
  }

  function renderIdentityBlock(row) {
    if (!row) return emptyNone();
    var ident = installationIdentity(row);
    var src = ident && ident.advanced ? ident.advanced : ident;
    var human = (ident && ident.human) || row.label || "";
    var host = (ident && ident.host) || row.host || "";
    var owner = ident && ident.owner != null ? ident.owner : row.owner;
    var manual = !!(ident && ident.manualOnly) || !!row.manualOnly;
    var rows = "";
    if (src) {
      ["launcher", "executable", "package", "host", "evidence", "confidence"].forEach(function (k) {
        if (src[k]) rows += factRow(k.charAt(0).toUpperCase() + k.slice(1), src[k]);
      });
    }
    return '<div class="' + PX + '-ident">' +
      (human ? "<strong>" + esc(human) + "</strong>" : "") +
      (host || owner ? '<p class="' + PX + '-muted">' + esc([host, owner].filter(Boolean).join(" · ")) + (manual ? " · Unknown owner — manual only" : "") + "</p>" : "") +
      (rows ? '<div class="' + PX + '-facts">' + rows + "</div>" : emptyNone()) +
      '<p class="' + PX + '-muted">BinaryLocator discovery for this host.</p>' +
      "</div>";
  }


  function detailsInstallIdentity(app) {
    var installs = app.installs || [];
    var row = null;
    if (app.detailsId) {
      row = installs.filter(function (i) { return i.id === app.detailsId; })[0] || null;
    }
    if (!row && app.route && app.route.page === "installations") {
      var objId = app.route.object;
      row = installs.filter(function (i) { return i.provider === objId; })[0] || null;
    }
    if (!row) return "";
    return "<h3>Installation identity</h3>" + window.PMv2.identityBlock(row, PX);
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

  function defaultAllFacetsLocal() {
    return { domain: "", kind: "", exposure: "", changed: false, state: "", entry: "", attention: false, synthetic: false, q: "" };
  }

  function ensureFacets(app) {
    if (!app.allFacets) {
      app.allFacets = (window.PMv2 && typeof window.PMv2.defaultAllFacets === "function")
        ? window.PMv2.defaultAllFacets()
        : defaultAllFacetsLocal();
    }
    return app.allFacets;
  }

  function facetsActive(f) {
    if (!f) return false;
    return !!(f.domain || f.kind || f.exposure || f.changed || f.state || f.entry || f.attention || f.synthetic || f.q);
  }

  function settingExposureLocal(s) {
    if (window.PMv2 && typeof window.PMv2.settingExposure === "function") return window.PMv2.settingExposure(s);
    if (s && s.exposure) {
      var e = String(s.exposure).toLowerCase();
      if (e === "standard" || e === "managed" || e === "unavailable") return "basic";
      if (e === "advanced") return "advanced";
      if (e === "expert" || e === "diagnostic" || e === "hidden") return "hidden";
      return e;
    }
    if (s && s.type === "action") return "hidden";
    if (s && s.tier === "advanced") return "advanced";
    return "basic";
  }

  function allSettingsAttentionLocal(app, s) {
    if (window.PMv2 && typeof window.PMv2.allSettingsAttention === "function") return window.PMv2.allSettingsAttention(app, s);
    var flags = (app && app.flags) || {};
    var id = s && s.id != null ? String(s.id) : "";
    if (flags.restart && /visual|window/.test(id)) return true;
    if ((flags.reconnect || flags.unavailable) && /ai\./.test(id)) return true;
    if (flags.managed && s && (s.tier === "advanced" || /safety\./.test(id))) return true;
    return false;
  }

  function allSettingsStateLocal(app, s) {
    if (!s || !app || !app.controlModel) return "ready";
    var m = app.controlModel(s.id);
    if (!m) return "ready";
    if (m.originKind === "policy") return "managed";
    if (m.originKind === "unavailable") return "unavailable";
    return "ready";
  }

  function allSettingsPathLocal(app, s) {
    var parts = String((s && s.id) || "").split(".");
    var domain = parts[0] || "";
    var cat = app && typeof app.cat === "function" ? app.cat(domain) : null;
    var head = cat && cat.title ? cat.title : domain;
    var rest = [];
    var i;
    for (i = 1; i < parts.length; i++) rest.push(String(parts[i]).replace(/[.\-]/g, " "));
    return rest.length ? head + " / " + rest.join(" / ") : head;
  }

  function filterAllSettingsLocal(app, facets) {
    var f = facets || defaultAllFacetsLocal();
    var q = String(f.q || "").toLowerCase();
    var entry = String(f.entry || "");
    var out = [];
    function matchesQ(label, path, desc, terms) {
      if (!q) return true;
      return (String(label || "") + " " + String(path || "") + " " + String(desc || "") + " " + String(terms || "")).toLowerCase().indexOf(q) !== -1;
    }
    function pushIndex(entryName, source) {
      (source || []).forEach(function (e) {
        if (!e || e.synthetic) return;
        if (q && !matchesQ(e.label, e.path, "", e.terms)) return;
        if (f.attention && !allSettingsAttentionLocal(app, { id: e.settingId || e.id, tier: e.tier })) return;
        out.push({
          id: e.id,
          resultId: e.id,
          label: e.label,
          path: e.path,
          type: e.type,
          exposure: settingExposureLocal(e),
          entry: entryName,
          synthetic: false,
          changed: false
        });
      });
    }
    if (entry === "manager") {
      pushIndex("manager", (app.managers || []).map(function (m) {
        var cat = app.cat(m.domain);
        var hit = window.PMv2 && window.PMv2.getResult ? window.PMv2.getResult("manager:" + m.id) : null;
        if (hit) return hit;
        return {
          id: "manager:" + m.id,
          type: "manager",
          label: m.title,
          path: "Settings / " + (cat ? cat.title : m.domain) + " / " + m.title,
          terms: (m.purpose || "") + " " + m.id
        };
      }));
    } else if (entry === "workflow") {
      pushIndex("workflow", [
        (window.PMv2 && window.PMv2.getResult && window.PMv2.getResult("workflow:provider-cli-setup")) || {
          id: "workflow:provider-cli-setup",
          type: "setup_or_repair_workflow",
          label: "Install Ollama from official source",
          path: "Settings / Providers / Ollama / Setup"
        }
      ]);
    } else if (entry === "diagnostic") {
      pushIndex("diagnostic", [
        (window.PMv2 && window.PMv2.getResult && window.PMv2.getResult("diagnostic:usage-stale")) || {
          id: "diagnostic:usage-stale",
          type: "diagnostic_or_read_only_status",
          label: "Google usage projection is stale",
          path: "Settings / Providers / Google AI / Usage"
        }
      ]);
    } else {
      var settings = (window.PMv2 && window.PMv2.inventory && window.PMv2.inventory.settings) || [];
      var i, s, path, model, changed, exp, rowEntry, terms;
      for (i = 0; i < settings.length; i++) {
        s = settings[i];
        if (!s || !s.id) continue;
        if (f.domain && String(s.id).split(".")[0] !== f.domain) continue;
        if (f.kind && s.type !== f.kind) continue;
        exp = settingExposureLocal(s);
        if (f.exposure && exp !== f.exposure) continue;
        rowEntry = s.type === "action" ? "action" : "setting";
        if (entry && rowEntry !== entry) continue;
        model = app && app.controlModel ? app.controlModel(s.id) : null;
        changed = !!(model && model.changed);
        if (f.changed && !changed) continue;
        if (f.state && allSettingsStateLocal(app, s) !== f.state) continue;
        if (f.attention && !allSettingsAttentionLocal(app, s)) continue;
        path = allSettingsPathLocal(app, s);
        terms = Array.isArray(s.search) ? s.search.join(" ") : (s.search || "");
        if (!matchesQ(s.label, path, s.desc, terms)) continue;
        out.push({
          id: s.id,
          resultId: "setting:" + s.id,
          label: s.label,
          path: path,
          type: s.type,
          exposure: exp,
          entry: rowEntry,
          synthetic: false,
          changed: changed
        });
      }
    }
    if (f.synthetic) {
      var n;
      for (n = 0; n < 2000; n++) {
        if (q && ("synthetic scale row " + n).indexOf(q) === -1) continue;
        out.push({
          id: "synthetic:stress-" + n,
          resultId: "synthetic:stress-" + n,
          label: "Synthetic scale row " + n,
          path: "Synthetic overlay",
          type: "setting",
          exposure: "basic",
          entry: "setting",
          synthetic: true,
          changed: false
        });
      }
    }
    return out;
  }

  function filterAll(app) {
    var f = ensureFacets(app);
    if (window.PMv2 && typeof window.PMv2.filterAllSettings === "function") {
      return window.PMv2.filterAllSettings(app, f) || [];
    }
    return filterAllSettingsLocal(app, f);
  }

  function facetBtn(act, id, on, label, pressed) {
    var bits = ' type="button" data-act="' + act + '"';
    if (id !== undefined) bits += ' data-id="' + esc(id) + '"';
    if (on) bits += ' aria-current="true"';
    if (pressed != null) bits += ' aria-pressed="' + (pressed ? "true" : "false") + '"';
    return "<button" + bits + ">" + esc(label) + "</button>";
  }

  function applyFacetAct(app, act, id) {
    var f = ensureFacets(app);
    if (act === "all-filter" || act === "facet-domain") {
      f.domain = id || "";
      app.paint();
      return true;
    }
    if (act === "facet-exposure") { f.exposure = id || ""; app.paint(); return true; }
    if (act === "facet-kind") { f.kind = id || ""; app.paint(); return true; }
    if (act === "facet-entry") { f.entry = id || ""; app.paint(); return true; }
    if (act === "facet-state") { f.state = id || ""; app.paint(); return true; }
    if (act === "facet-changed") { f.changed = !f.changed; app.paint(); return true; }
    if (act === "facet-attention") { f.attention = !f.attention; app.paint(); return true; }
    if (act === "facet-synth" || act === "synth") {
      f.synthetic = !f.synthetic;
      app.receipt("Synthetic overlay is labeled and excluded from product inventory search by default.", "info");
      app.paint();
      return true;
    }
    if (act === "facet-clear") {
      resetFacets(app);
      app.paint();
      return true;
    }
    return false;
  }

  function pickAllRow(app, el, id) {
    var rowId = (el && el.getAttribute("data-row-id")) || id || "";
    if (!rowId) return;
    if (String(rowId).indexOf("synthetic:") === 0) {
      app.pickResult(rowId);
      return;
    }
    if (String(id || "").indexOf(":") !== -1 && String(id).indexOf("setting:") !== 0) {
      app.pickResult(id);
      return;
    }
    var settingId = String(rowId).replace(/^setting:/, "");
    if (app.routeSettingRow) app.routeSettingRow(settingId);
    else app.pickResult(app.rowResultId ? app.rowResultId(settingId) : ("setting:" + settingId));
  }

  function resetFacets(app) {
    app.allFacets = (window.PMv2 && typeof window.PMv2.defaultAllFacets === "function")
      ? window.PMv2.defaultAllFacets()
      : defaultAllFacetsLocal();
  }
  function facetsAside(app) {
    var f = ensureFacets(app);
    function group(title, inner) {
      return '<div class="' + PX + '-facet-group"><h2>' + title + "</h2>" + inner + "</div>";
    }
    var domain = facetBtn("all-filter", "", !f.domain, "All categories") +
      (app.categories || []).map(function (c) {
        return facetBtn("all-filter", c.id, f.domain === c.id, c.title);
      }).join("");
    var kind = facetBtn("facet-kind", "", !f.kind, "All kinds") +
      facetBtn("facet-kind", "toggle", f.kind === "toggle", "Toggle") +
      facetBtn("facet-kind", "select", f.kind === "select", "Select") +
      facetBtn("facet-kind", "slider", f.kind === "slider", "Slider") +
      facetBtn("facet-kind", "number", f.kind === "number", "Number") +
      facetBtn("facet-kind", "action", f.kind === "action", "Action") +
      facetBtn("facet-kind", "radio", f.kind === "radio", "Radio") +
      facetBtn("facet-kind", "list", f.kind === "list", "List") +
      facetBtn("facet-kind", "multiselect", f.kind === "multiselect", "Multiselect") +
      facetBtn("facet-kind", "keyvalue", f.kind === "keyvalue", "Keyvalue") +
      facetBtn("facet-kind", "text", f.kind === "text", "Text") +
      facetBtn("facet-kind", "path", f.kind === "path", "Path");
    var exposure = facetBtn("facet-exposure", "", !f.exposure, "All exposure") +
      facetBtn("facet-exposure", "basic", f.exposure === "basic", "Basic") +
      facetBtn("facet-exposure", "advanced", f.exposure === "advanced", "Advanced") +
      facetBtn("facet-exposure", "hidden", f.exposure === "hidden", "Hidden");
    var changed = facetBtn("facet-changed", undefined, !!f.changed, "Changed from default", !!f.changed);
    var managed = facetBtn("facet-state", "", !f.state, "All states") +
      facetBtn("facet-state", "ready", f.state === "ready", "Ready") +
      facetBtn("facet-state", "managed", f.state === "managed", "Managed") +
      facetBtn("facet-state", "unavailable", f.state === "unavailable", "Unavailable");
    var entry = facetBtn("facet-entry", "", !f.entry, "All entry types") +
      facetBtn("facet-entry", "setting", f.entry === "setting", "Settings") +
      facetBtn("facet-entry", "manager", f.entry === "manager", "Managers") +
      facetBtn("facet-entry", "action", f.entry === "action", "Actions") +
      facetBtn("facet-entry", "workflow", f.entry === "workflow", "Workflows") +
      facetBtn("facet-entry", "diagnostic", f.entry === "diagnostic", "Diagnostics");
    var attention = facetBtn("facet-attention", undefined, !!f.attention, "Needs attention", !!f.attention);
    var overlay = facetBtn("facet-synth", undefined, !!f.synthetic, f.synthetic ? "Hide synthetic overlay" : "Include synthetic overlay", !!f.synthetic);
    return '<aside class="' + PX + '-facets pmv2-scroll">' +
      group("Domain", domain) +
      group("Record kind", kind) +
      group("Exposure", exposure) +
      group("Changed from default", changed) +
      group("Managed/Unavailable", managed) +
      group("Entry types", entry) +
      group("Needs attention", attention) +
      group("Overlay", overlay) +
      "</aside>";
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
    if (prev.name === "deferred") {
      var dprev = (app.deferred || []).filter(function (x) { return x.id === prev.deferred; })[0];
      return "Back to " + ((dprev && dprev.title) || "Owner module");
    }
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
    var hits = (app.results || []);
    if (!hits.length && app.query) {
      return '<div class="' + PX + '-drop pmv2-scroll" data-search-drop data-hit-class="' + PX + '-hit" role="listbox"><div class="' + PX + '-hit">No matching settings</div></div>';
    }
    if (!hits.length) return "";
    var html = '<div class="' + PX + '-drop pmv2-scroll" data-search-drop data-hit-class="' + PX + '-hit" role="listbox">';
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
    return '<div class="' + PX + '-work" data-ow-state="' + esc(w.state) + '"><strong>' + esc(w.title) + "</strong> — " + esc(w.human_phase) + (w.wait_reason ? " (waiting: " + esc(w.wait_reason) + ")" : "") + bar + (w.message ? "<div>" + esc(w.message) + "</div>" : "") + confirmOfficialControls(app) + "</div>";
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
    return '<div class="' + PX + '-row" data-row-id="' + esc(id) + '" tabindex="-1"><div><label>' + esc(m.label) + "</label><p>" + esc(m.desc) + "</p>" +
      (m.reason ? '<p class="' + PX + '-muted">' + esc(m.reason) + "</p>" : "") +
      '<button type="button" class="' + PX + '-why" data-act="why" data-id="' + esc(id) + '">Why this value?</button></div><div>' + ctl + "</div></div>";
  }

  function attention(app) {
    var items = app.attention || [];
    if (app.flags.empty || !items.length) return emptyNone();
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
      return '<button type="button" data-act="domain" data-id="' + esc(c.id) + '" data-flip-id="' + esc(c.id) + '"><strong>' + esc(c.title) + "</strong><span class='" + PX + "-muted'>" + esc(c.description) + "</span></button>";
    }).join("") + "</div>";
    return '<div class="' + PX + '-read"><p class="' + PX + '-muted">Project ' + esc(app.project.name) + " · " + esc(String(app.productSettingCount || 828)) + " settings in this project</p>" +
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
    return '<div class="' + PX + '-read">' +
      '<p class="' + PX + '-lede">' + esc(c.description) + "</p>" + workBox(app) +
      (mgrNav ? "<h2>Managers</h2><div class='" + PX + "-mgrs'>" + mgrNav + "</div>" : "") +
      (defNav ? "<h2>Owner modules</h2><div class='" + PX + "-mgrs'>" + defNav + "</div>" : "") +
      "<h2>Settings</h2>" + (rows.length ? rows.map(function (s) { return control(app, s.id); }).join("") : emptyNone()) +
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
    if (obj.id === "google") {
      html += '<p class="' + PX + '-muted">Usage projection is stale until reconnect. Cached catalog remains visible.</p>';
    }
    html += confirmOfficialControls(app, obj.id);
    if (tab === "installations") {
      var installRows = (app.installs || []).filter(function (i) { return i.provider === obj.id; });
      html += "<h2>Installations</h2>" + (installRows.length ? installRows.map(function (i) {
        return '<div data-row-id="' + esc(i.id) + '" tabindex="-1">' + esc(i.label) + " · " + esc(i.host) + " · " + (i.selected ? "Selected" : (i.shadowed ? "Shadowed" : "Available")) + (i.manualOnly ? " · Unknown owner — manual only" : "") + window.PMv2.identityBlock(i, PX) + "</div>";
      }).join("") : emptyNone());
    }
    if (tab === "setup" && obj.id !== "local-ollama") {
      html += "<h2>Setup</h2><p class='" + PX + "-muted'>This provider is already installed for this project.</p>";
    }
    if (tab === "usage") {
      html += "<h2>When included usage ends</h2>" +
        '<p data-row-id="usage-end">' + esc(providerUsageEnd(obj)) + "</p>" +
        '<p class="' + PX + '-muted">Settings owns the continuation. Usage owns the projection and never writes this choice.</p>' +
        '<p data-row-id="usage-projection">Projection: ' + esc(usageVal) + "</p>" +
        '<p><button type="button" class="' + PX + '-ghost" data-act="usage-refresh">Refresh usage</button></p>';
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
    var roster = '<div class="' + PX + '-roster pmv2-scroll">' + (objs.length ? objs.map(function (o) {
      return '<button type="button" data-act="object" data-id="' + esc(o.id) + '" data-row-id="' + esc(o.id) + '"' + (obj && o.id === obj.id ? ' aria-current="true"' : "") + ">" + esc(o.label) + '<div class="' + PX + '-muted">' + esc(pretty(o.availability || "ready")) + "</div></button>";
    }).join("") : emptyNone()) + "</div>";
    var detail = "";
    if (m.id === "providers" && obj) {
      detail = providerDetail(app, obj);
    } else if (m.archetype === "health-projection") {
      detail = '<p class="' + PX + '-lede">' + esc(m.purpose) + "</p>" +
        '<div class="' + PX + '-health"><div><strong>Projection</strong><div class="' + PX + '-muted">Read-only health for this project. Settings does not invent a second owner.</div></div>' +
        (obj ? '<div data-row-id="' + esc(obj.id) + '" tabindex="-1"><strong>' + esc(obj.label) + "</strong> · " + esc(obj.kind) + "</div>" : "") +
        "</div>";
    } else if (m.archetype === "setup-sequence") {
      detail = '<p class="' + PX + '-lede">' + esc(m.purpose) + "</p>" +
        '<div class="' + PX + '-seq"><div>1 Confirm this project</div><div>2 Review what will change</div><div>3 Apply once — no ongoing sync</div></div>';
    } else if (m.archetype === "preview-transaction") {
      detail = '<p class="' + PX + '-lede">' + esc(m.purpose) + "</p>" +
        "<p>Import, export, reset, and rollback stay on <strong>" + esc(app.project.name) + "</strong>.</p>" +
        '<button type="button" class="' + PX + '-ghost" data-act="copy">Open Copy Settings From Another Project</button>';
    } else {
      detail = '<p class="' + PX + '-lede">' + esc(m.purpose) + "</p>";
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
    return '<div class="' + PX + '-read">' +
      '<p class="' + PX + '-lede">Long-tail index of ' + esc(String(count)) + " product rows. Synthetic overlay is labeled and excluded from search by default. This list is virtualized.</p></div>" +
      '<div class="' + PX + '-comp' + (app.route.row ? " is-detail" : "") + '">' +
      facetsAside(app) +
      '<div class="' + PX + '-list pmv2-scroll" data-all-list="1"></div>' +
      '<div class="' + PX + '-detail pmv2-scroll">' +
      (app.route.row && app.controlModel(app.route.row) ? control(app, app.route.row) : emptyNone()) +
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
      factRow("Backend", (r.backend || "RuntimeResourceGovernor+projectStore")) +
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
      factRow("Scope", d.scopeNote) +
      factRow("Backend", (d.backend || "projectStore")) +
      "</div>" + detailsInstallIdentity(app) + "</aside>";
  }

  function copyTransactionHtml(app) {
    var step = copyStep(app);
    var p = app.copyPreview();
    var srcList = (app.projects || []).filter(function (x) { return !x.current; });
    var srcs = srcList.length ? srcList.map(function (x) {
      return '<button type="button" data-act="copy-src" data-id="' + esc(x.id) + '"' + (app.copy.sourceId === x.id ? ' aria-current="true"' : "") + ">" + esc(x.name) + "</button>";
    }).join("") : emptyNone();
    var catList = app.categories || [];
    var cats = catList.length ? ('<div class="' + PX + '-cats">' + catList.map(function (c) {
      var on = (app.copy.categories || []).indexOf(c.id) !== -1;
      return '<label><input type="checkbox" data-act="copy-cat" data-id="' + esc(c.id) + '"' + (on ? " checked" : "") + "> " + esc(c.title) + "</label>";
    }).join("") + "</div>") : emptyNone();
    var prev = "<p>Select a source project.</p>";
    if (p) {
      prev = "<p>Additions " + p.counts.additions + " · Replacements " + p.counts.replacements + " · Unchanged " + p.counts.unchanged + " · Unavailable " + p.counts.unavailable + " · Conflicts " + p.counts.conflicts + "</p>" +
        '<p class="' + PX + '-muted">Account and credential references copy. Secrets never copy. Projects stay independent. No profiles, inheritance, or ongoing sync.</p>' +
        '<p class="' + PX + '-muted">' + esc(p.backend || "RuntimeResourceGovernor+projectStore") + ". RuntimeResourceGovernor admits this copy. Project store persists this project only.</p>" +
        '<div class="' + PX + '-chapter-list">' + copyPreviewLists(p) + "</div>";
    }
    var actions = "";
    if (app.copy.step === "receipt" && app.copy.receipt) {
      actions = copyReceiptFacts(app.copy.receipt) + "<button type='button' class='" + PX + "-primary' data-act='copy-rollback'>Roll back to restore point</button>";
    } else if (app.copy.step === "rolled_back") {
      actions = "<p>Rollback complete. This project's previous values were restored.</p>";
    } else if (app.copy.step === "restore" || app.copy.step === "applying" || app.copy.step === "verifying") {
      actions = "";
    } else {
      actions = "<button type='button' class='" + PX + "-primary' data-act='copy-apply'>Create restore point and copy</button>";
    }
    return '<p class="' + PX + '-kicker">One-time copy</p>' +
      "<p>Copies into <strong>" + esc(app.project.name) + "</strong>. No ongoing sync.</p>" +
      '<ol class="' + PX + '-steps">' +
      "<li" + (step === 1 ? ' aria-current="step"' : "") + ">1 Preview</li>" +
      "<li" + (step === 2 ? ' aria-current="step"' : "") + ">2 Restore / apply / verify</li>" +
      "<li" + (step === 3 ? ' aria-current="step"' : "") + ">3 Receipt</li>" +
      "</ol>" + workBox(app) +
      "<h2>1. Source project</h2><div class='" + PX + "-src'>" + srcs + "</div>" +
      "<h2>2. Categories</h2>" + cats +
      "<h2>3. Preview</h2>" + prev +
      ((window.PMv2 && typeof window.PMv2.copyTransactionHtml === "function") ? window.PMv2.copyTransactionHtml(app, PX) : "<h2>4. Restore point</h2>") +
      actions;
  }

  function copyView(app) {
    return '<div class="' + PX + '-read">' + copyTransactionHtml(app) + "</div>";
  }

  function deferredView(app) {
    var d = (app.deferred || []).filter(function (x) { return x.id === app.route.deferred; })[0];
    if (!d) return "<div>Unknown owner module</div>";
    return '<div class="' + PX + '-read">' +
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

  function canvasHeader(app) {
    var r = app.route || { name: "home" };
    var title = "Settings";
    var flip = "home";
    if (r.name === "all") { title = "All Settings"; flip = "all"; }
    else if (r.name === "copy") { title = "Copy Settings From Another Project"; flip = "copy"; }
    else if (r.name === "deferred") {
      var drow = (app.deferred || []).filter(function (x) { return x.id === r.deferred; })[0];
      title = drow ? drow.title : "Owner module";
      flip = r.deferred || "deferred";
    } else if (r.name === "manager") {
      var mgr = app.mgr(r.manager);
      title = mgr ? mgr.title : pretty(r.manager);
      flip = r.domain || r.manager || "home";
    } else if (r.domain) {
      var cat = app.cat(r.domain);
      title = cat ? cat.title : pretty(r.domain);
      flip = r.domain;
    }
    return '<header class="' + PX + '-canvas-head" data-flip-target="' + esc(flip) + '"><h1 class="' + PX + '-h1">' + esc(title) + "</h1></header>";
  }

  function stage(app) {
    return '<div class="' + PX + '-stage">' + edge(app) +
      '<div class="' + PX + '-depth">' +
      '<div class="' + PX + '-leaf" data-n="2" aria-hidden="true"></div>' +
      '<div class="' + PX + '-leaf" data-n="1" aria-hidden="true"></div>' +
      '<div class="' + PX + '-page' + (app._motionPlay ? (" " + PX + "-layer") : "") + (app.detailsId ? " is-details" : "") + '">' + localTabs(app) +
      '<div class="' + PX + '-canvas pmv2-scroll">' + canvasHeader(app) + canvas(app) + "</div>" +
      detailsDrawer(app) +
      "</div></div></div>";
  }

    function fillAll(app, root) {
    var host = root.querySelector("[data-all-list]");
    if (!host) { virt = null; return; }
    var items = filterAll(app);
    virt = window.PMv2.virtualList(host, items, 52, function (item) {
      var rid = item.resultId || item.id;
      return '<button type="button" class="' + PX + '-hit" data-act="row" data-id="' + esc(rid) + '" data-row-id="' + esc(item.id) + '"><b>' + esc(item.label) + "</b><span class='path'>" + esc(item.path) + "</span></button>";
    });
  }

  function onAct(app, act, id, el) {
    if (act === "back") app.back();
    else if (act === "close") app.closeSettings();
    else if (act === "home") { if (app.route.name !== "home") app.navigate({ name: "home" }); }
    else if (act === "states") {
      app.openPopup(el, DEMO_STATES.map(function (n) { return { id: n, label: pretty(n) }; }), function (sid) { app.triggerState(sid); });
    } else if (act === "domain") {
      var already = app.route && (app.route.name === "domain" || app.route.name === "manager" || app.route.domain);
      app.openDomain(id, already ? { replace: true } : {});
    }
    else if (act === "page") app.openPage(el.getAttribute("data-domain"), id);
    else if (act === "manager") app.openManager(id);
    else if (act === "object") app.openManager(app.route.manager, { object: id, page: app.route.page });
    else if (act === "mtab") app.openManager(app.route.manager, { object: app.route.object, page: id });
    else if (act === "deferred") app.openDeferred(id);
    else if (act === "all") app.openAll();
    else if (applyFacetAct(app, act, id)) {}
    else if (act === "copy") app.openCopy();
    else if (act === "pick") app.pickResult(id);
    else if (act === "row") {
      pickAllRow(app, el, id);
    }
    else if (act === "toggle") {
      var cur = app.controlModel(id);
      app.setValue(id, !(cur && cur.value));
    } else if (act === "select") app.setValue(id, el.value);
    else if (act === "number") app.setValue(id, Number(el.value));
    else if (act === "text") app.setValue(id, el.value);
    else if (act === "do") app.receipt("Ran " + id + " for this project.", "info");
    else if (act === "why") app.openDetails(id);
    else if (act === "details-close") app.closeDetails();
    else if (act === "install-official") {
      installOfficial(app, id || "local-ollama");
    } else if (act === "confirm-official") {
      confirmOfficial(app, id || "local-ollama");
    } else if (act === "usage-refresh") {
      app.work = { title: "Refresh usage", human_phase: "Refreshing", state: "running", progress_kind: "indeterminate", progress_source: "usage", last_known_good: true, message: "Cached usage stays visible." };
      app.receipt("Usage refresh requested for this project.", "info");
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
  }

  function render(app) {
    var root = document.getElementById(ROOT_ID);
    appRef = app;
    window.__pmv2App = app;
    if (virt && virt.dispose) virt.dispose();
    root.className = PX;
    root.setAttribute("data-layout", LAYOUT);
    root.setAttribute("data-route", (app.route && app.route.name) || "home");
    root.setAttribute("data-dir", app._navDir || "fwd");
    root.setAttribute("data-inventory-count", String(app.productSettingCount || 828));
    root.setAttribute("data-pane", app.detailsId ? "details" : ((app.route && app.route.name) || "main"));
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
      if (facetsActive(ensureFacets(app))) { resetFacets(app); app.paint(); return; }
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
