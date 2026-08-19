(function () {
  "use strict";
  var PX = "to";
  var LAYOUT = "tabbed-organizer";
  var ROOT_ID = "to-root";
  var esc = window.PMv2.esc;
  var appRef = null;
  var virt = null;
  var scrolls = {};

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
    return reason + '<p><button type="button" data-act="confirm-official" data-id="' + esc(id) + '">Confirm official source</button></p>';
  }
  function identityBlock(row) {
    return window.PMv2.identityBlock(row, PX);
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
    return "<h3>Installation identity</h3>" + identityBlock(row);
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
      return '<div class="' + PX + '-facet-group"><h2>' + title + "</h2>" + '<div class="' + PX + '-facet-row">' + inner + "</div>" + "</div>";
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
    if (prev.name === "deferred") {
      var prevDef = (app.deferred || []).filter(function (x) { return x.id === prev.deferred; })[0];
      return "Back to " + (prevDef ? prevDef.title : "Owner module");
    }
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
      var hits = (app.results || []);
      if (!hits.length && app.query) {
        drop = '<div class="' + PX + '-drop pmv2-scroll" data-search-drop data-hit-class="' + PX + '-hit" role="listbox"><div class="' + PX + '-hit">No matching settings</div></div>';
      } else if (hits.length) {
        var selected = app.selectedResultId;
        if (!hits.some(function (h) { return h.id === selected; })) selected = hits[0].id;
        drop = '<div class="' + PX + '-drop pmv2-scroll" data-search-drop data-hit-class="' + PX + '-hit" role="listbox">' + groupHits(hits).map(function (g) {
          return '<div class="' + PX + '-muted">' + esc(humanType(g.type)) + "</div>" + g.items.map(function (h) {
            var sel = h.id === selected ? "true" : "false";
            var avail = h.availability && h.availability !== "ready" ? " · " + esc(h.availability.replace(/_/g, " ")) : "";
            return '<button type="button" class="' + PX + '-hit" role="option" aria-selected="' + sel + '" data-act="pick" data-id="' + esc(h.id) + '"><b>' + esc(h.label) + '</b><span class="path">' + esc(h.path) + '</span><span class="meta">' + esc(humanType(h.type)) + avail + "</span></button>";
          }).join("");
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
      (w.message ? "<div>" + esc(w.message) + "</div>" : "") + confirmOfficialControls(app) + "</div>";
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
      "<h2>Needs attention</h2>" + attention(app) +
      '<div class="' + PX + '-map" aria-label="Category tabs">' + (app.categories || []).map(function (c) {
        return '<button type="button" data-act="domain" data-id="' + esc(c.id) + '" data-row-id="domain:' + esc(c.id) + '" data-flip-id="' + esc(c.id) + '"><strong>' + esc(c.title) + "</strong><span>" + esc(c.description || "") + "</span></button>";
      }).join("") + "</div>" +
      "<h2>Recent in this project</h2>" + recent(app) +
      workBox(app) +
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
      '<p class="' + PX + '-muted">' + esc(d.label) + "</p>" +
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
      return '<button type="button" data-act="object" data-id="' + esc(o.id) + '" data-row-id="' + esc(o.id) + '"' + (obj && o.id === obj.id ? ' aria-current="true"' : "") + ">" +
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
      if (obj.id === "google") {
        detail += '<p class="' + PX + '-muted">Usage projection is stale until reconnect. Cached catalog remains visible.</p>';
      }
      detail += confirmOfficialControls(app, obj.id);
      if (tab === "installations") {
        var instRows = (app.installs || []).filter(function (i) {
          return i.provider === obj.id;
        });
        detail += "<h2>Installations</h2>" + (instRows.length ? instRows.map(function (i) {
          return '<div data-row-id="' + esc(i.id) + '">' + esc(i.label) + " · " + esc(i.host) + " · " +
            (i.selected ? "Selected" : (i.shadowed ? "Shadowed" : "Available")) +
            (i.manualOnly ? " · Unknown owner — manual only" : "") + identityBlock(i) + "</div>";
        }).join("") : '<p class="' + PX + '-muted">None</p>');
      }
      if (tab === "usage") {
        detail += "<h2>When included usage ends</h2>" +
          '<p data-row-id="usage-end">' + esc(providerUsageEnd(obj)) + "</p>" +
          '<p class="' + PX + '-muted">Settings owns the continuation. Usage owns the projection and never writes this choice.</p>' +
          '<p data-row-id="usage-projection">Projection: ' + esc(usageVal) + "</p>" +
          '<p><button type="button" data-act="usage-refresh">Refresh usage</button></p>';
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
    return '<div class="' + PX + "-all" + (app.route.row ? " is-detail" : "") + '">' +
      facetsAside(app) +
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
        '<p class="' + PX + '-muted">' + esc(p.backend || "RuntimeResourceGovernor+projectStore") + ". RuntimeResourceGovernor admits this copy. Project store persists this project only.</p>" +
        copyPreviewLists(p);
    }
    var actions = "";
    if (app.copy.step === "receipt" && app.copy.receipt) {
      actions = copyReceiptFacts(app.copy.receipt) + "<button type='button' data-act='copy-rollback'>Roll back to restore point</button>";
    } else if (app.copy.step === "rolled_back") {
      actions = "<p>Rollback complete. This project’s previous values were restored.</p>";
    } else if (app.copy.step === "restore" || app.copy.step === "applying" || app.copy.step === "verifying") {
      actions = "";
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
      window.PMv2.copyTransactionHtml(app, PX) +
      '<div class="' + PX + '-copy-actions">' + actions + "</div>" +
      '<div class="' + PX + '-panes">' +
      '<div class="' + PX + '-pane pmv2-scroll"><h2>Source project</h2><div class="' + PX + '-src">' + srcs + "</div></div>" +
      '<div class="' + PX + '-pane pmv2-scroll"><h2>Categories</h2><div class="' + PX + '-catsel">' + cats + "</div></div>" +
      '<div class="' + PX + '-pane pmv2-scroll"><h2>Preview</h2>' + prev + "</div>" +
      "</div></div>";
  }

  function deferredSheet(app) {
    var d = (app.deferred || []).filter(function (x) { return x.id === app.route.deferred; })[0];
    if (!d) return '<div class="' + PX + '-inner"><p>Unknown owner module</p></div>';
    return '<div class="' + PX + '-inner">' +
      '<h1 class="' + PX + '-h1">' + esc(d.title) + "</h1>" +
      "<p>This destination is owned by <strong>" + esc(d.owner) + "</strong>. Settings does not invent a backend for it.</p>" +
      "<p>Return contract: Back restores the previous Settings location. Close Settings returns to the opening surface.</p>" +
      '<button type="button" data-act="back">' + esc(backLabel(app)) + "</button></div>";
  }

  function sheetTitle(app) {
    var r = app.route || { name: "home" };
    if (r.manager && app.mgr(r.manager)) return app.mgr(r.manager).title;
    if (r.name === "all") return "All Settings";
    if (r.name === "copy") return "Copy from another project";
    if (r.name === "deferred") {
      var d = (app.deferred || []).filter(function (x) { return x.id === r.deferred; })[0];
      return d ? d.title : "Owner module";
    }
    if (r.domain && app.cat(r.domain)) return app.cat(r.domain).title;
    return "Settings";
  }

  function wrapWorkspace(app, inner) {
    var r = app.route || { name: "home" };
    var current = r.name === "home" ? "" : r.domain;
    var motionCls = "";
    if (app._motionPlay) {
      if (app._navDir === "back") motionCls = " is-back";
      else if (app._navDir === "fwd") motionCls = " is-fwd";
    }
    return categoryTabs(app, current) + locationStrip(app) +
      '<div class="' + PX + '-stack" data-depth="' + depthOf(app) + '"' + (app._navDir ? ' data-dir="' + esc(app._navDir) + '"' : "") + ">" +
      '<div class="' + PX + '-sheet ' + PX + '-scroll pmv2-scroll' + motionCls + '">' +
      '<header class="' + PX + '-sheet-head" data-flip-target="' + esc(r.domain || r.name || "home") + '">' + esc(sheetTitle(app)) + "</header>" +
      inner + "</div></div>";
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
    var items = filterAll(app);
    virt = window.PMv2.virtualList(host, items, 52, function (item) {
      var rid = item.resultId || (app.rowResultId ? app.rowResultId(item.id) : item.id);
      return '<button type="button" class="' + PX + '-hit" data-act="row" data-id="' + esc(rid) + '" data-row-id="' + esc(item.id) + '"><b>' + esc(item.label) + "</b><span class='path'>" + esc(item.path) + "</span></button>";
    });
  }

  function goDomain(app, id) {
    var cat = app.cat(id) || {};
    var page = ((cat.subgroups || [])[0] || {}).id;
    var opts = {};
    if (app.route && app.route.domain) opts.replace = true;
    app.navigate({ name: "domain", domain: id, page: page, section: page }, opts);
  }

  function openDomain(app, id) {
    goDomain(app, id);
  }

  function bind(app, root) {
    var search = root.querySelector("[data-search]");
    if (search) {
      search.oninput = function () {
        applyQuery(app, search.value);
      };
      search.onfocus = function () {
        if ((search.value || "").trim()) applyQuery(app, search.value);
      };
      search.onkeydown = function (ev) {
        var list = app.results || [];
        var ids = list.map(function (x) { return x.id; });
        var at = Math.max(0, ids.indexOf(app.selectedResultId));
        if (ev.key === "Enter") {
          ev.preventDefault();
          var pickId = app.selectedResultId || ids[0];
          if (pickId) app.pickResult(pickId);
          return;
        }
        if (!list.length) return;
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
      else if (act === "domain") openDomain(app, id);
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
      else if (applyFacetAct(app, act, id)) {}
      else if (act === "copy") app.openCopy();
      else if (act === "pick") app.pickResult(id);
      else if (act === "row") pickAllRow(app, el, id);
      else if (act === "toggle") {
        var cur = app.controlModel(id);
        app.setValue(id, !(cur && cur.value));
      } else if (act === "do") app.receipt("Ran " + id + " for this project.", "info");
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
      else if (act === "copy-apply") app.applyCopy();
      else if (act === "copy-rollback") app.rollbackCopy();

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
    root.setAttribute("data-dir", app._navDir || "fwd");
    root.setAttribute("data-inventory-count", String(app.productSettingCount || 828));
    root.setAttribute("data-pane", app.detailsId ? "details" : ((app.route && app.route.name) || "main"));
    if (app.route && app.route.name === "copy") app.searchOpen = false;
    app.openDomain = function (id) { openDomain(app, id); };
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
      baseEscape.call(app);
    };
    window.__pmv2App = app;
  });
})();
