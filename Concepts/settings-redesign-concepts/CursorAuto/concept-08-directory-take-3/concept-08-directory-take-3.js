(function () {
  "use strict";
  var PX = "d3";
  var LAYOUT = "directory-take-3";
  var ROOT_ID = "d3-root";
  var esc = window.PMv2.esc;
  var appRef = null;
  var virt = null;
  var restoreFocus = null;

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
  function installationIdentity(row) {
    if (!row) return null;
    var fromApi = (window.PMv2 && typeof window.PMv2.installationIdentity === "function")
      ? window.PMv2.installationIdentity(row)
      : null;
    var adv = (fromApi && fromApi.advanced) || {};
    return {
      launcher: adv.launcher || (fromApi && fromApi.launcher) || row.launcher || "",
      executable: adv.executable || (fromApi && fromApi.executable) || row.executable || "",
      package: adv.package || (fromApi && fromApi.package) || row.package || "",
      host: adv.host || (fromApi && fromApi.host) || row.host || "",
      evidence: adv.evidence || (fromApi && fromApi.evidence) || row.evidence || "",
      confidence: adv.confidence || (fromApi && fromApi.confidence) || row.confidence || "",
      owner: (fromApi && fromApi.owner) || row.owner || "",
      human: (fromApi && fromApi.human) || row.label || ""
    };
  }
  function identityBlock(row) {
    return window.PMv2.identityBlock(row, PX);
  }
  function bindOfficialCliIdentity(app) {
    if (!app) return;
    var pm = window.PMv2;
    if (!pm) return;
    var api = pm.copyApi || {};
    var confirmName = api.confirmOfficialCli || "confirmOfficialCli";
    var installName = api.installOfficialCli || "installOfficialCli";
    var identName = api.installationIdentity || "installationIdentity";
    if (typeof app[confirmName] !== "function" && typeof pm.confirmOfficialCli === "function") {
      app[confirmName] = pm.confirmOfficialCli.bind(pm, app);
    }
    if (typeof app[installName] !== "function" && typeof pm.installOfficialCli === "function") {
      app[installName] = pm.installOfficialCli.bind(pm, app);
    }
    if (typeof app[identName] !== "function" && typeof pm.installationIdentity === "function") {
      app[identName] = pm.installationIdentity.bind(pm);
    }
  }
  function humanAvail(a) {
    if (!a || a === "ready") return "";
    return String(a).replace(/_/g, " ");
  }


  function defaultFacets() {
    if (window.PMv2 && typeof window.PMv2.defaultAllFacets === "function") return window.PMv2.defaultAllFacets();
    return { domain: "", kind: "", exposure: "", changed: false, state: "", entry: "", attention: false, synthetic: false, q: "" };
  }
  function ensureFacets(app) {
    var base = defaultFacets();
    if (!app.allFacets) app.allFacets = base;
    else {
      var k;
      for (k in base) {
        if (Object.prototype.hasOwnProperty.call(base, k) && app.allFacets[k] === undefined) app.allFacets[k] = base[k];
      }
    }
    return app.allFacets;
  }
  function facetsActive(f) {
    if (!f) return false;
    return !!(f.domain || f.kind || f.exposure || f.changed || f.state || f.entry || f.attention || f.synthetic || f.q);
  }
  function humanKind(t) {
    var map = {
      select: "Choice", toggle: "On / off", slider: "Slider", number: "Number", action: "Action",
      radio: "Radio", list: "List", multiselect: "Multi-select", keyvalue: "Key / value", text: "Text", path: "Path"
    };
    return map[t] || humanType(t);
  }
  function humanEntry(t) {
    var map = { setting: "Setting", action: "Action", manager: "Manager", diagnostic: "Diagnostic", workflow: "Workflow" };
    return map[t] || humanType(t);
  }
  function humanExposure(e) {
    var map = { basic: "Basic", advanced: "Advanced", hidden: "Hidden" };
    return map[e] || humanType(e);
  }
  function settingExposure(s) {
    if (window.PMv2 && typeof window.PMv2.settingExposure === "function") return window.PMv2.settingExposure(s);
    if (!s) return "basic";
    if (s.exposure) {
      var e = String(s.exposure).toLowerCase();
      if (e === "standard" || e === "managed" || e === "unavailable") return "basic";
      if (e === "advanced") return "advanced";
      if (e === "expert" || e === "diagnostic" || e === "hidden") return "hidden";
      return e;
    }
    if (s.type === "action") return "hidden";
    if (s.tier === "advanced") return "advanced";
    return "basic";
  }
  function fallbackFilterAllSettings(app, facets) {
    var f = facets || ensureFacets(app);
    var q = String(f.q || "").toLowerCase();
    var entry = String(f.entry || "");
    var out = [];
    var settings = (window.PMv2 && window.PMv2.inventory && window.PMv2.inventory.settings) || [];
    function matchesQ(label, path, desc, terms) {
      if (!q) return true;
      return (String(label || "") + " " + String(path || "") + " " + String(desc || "") + " " + String(terms || "")).toLowerCase().indexOf(q) !== -1;
    }
    function pathFor(s) {
      var domain = String(s.id || "").split(".")[0];
      var cat = app.cat ? app.cat(domain) : null;
      return cat && cat.title ? cat.title : domain;
    }
    function rowState(s) {
      var m = app.controlModel ? app.controlModel(s.id) : null;
      if (!m) return "ready";
      if (m.originKind === "policy") return "managed";
      if (m.originKind === "unavailable") return "unavailable";
      return "ready";
    }
    function rowAttention(s) {
      if (window.PMv2 && typeof window.PMv2.allSettingsAttention === "function") return window.PMv2.allSettingsAttention(app, s);
      var flags = (app && app.flags) || {};
      var id = s && s.id != null ? String(s.id) : "";
      if (flags.restart && /visual|window/.test(id)) return true;
      if ((flags.reconnect || flags.unavailable) && /ai\./.test(id)) return true;
      if (flags.managed && s && (s.tier === "advanced" || /safety\./.test(id))) return true;
      return false;
    }
    if (entry === "manager" || entry === "workflow" || entry === "diagnostic") {
      var want = { manager: "manager", workflow: "setup_or_repair_workflow", diagnostic: "diagnostic_or_read_only_status" }[entry];
      var ids = ["action:copy-from-project", "action:open-all-settings", "action:retry-default-account", "workflow:provider-cli-setup", "diagnostic:usage-stale"];
      var i, hit;
      if (entry === "manager" && app.managers) {
        (app.managers || []).forEach(function (m) {
          hit = window.PMv2 && window.PMv2.getResult ? window.PMv2.getResult("manager:" + m.id) : null;
          if (!hit) hit = { id: "manager:" + m.id, label: m.title, path: m.purpose || "Manager", type: "manager" };
          if (q && !matchesQ(hit.label, hit.path, "", "")) return;
          out.push({ id: hit.id, resultId: hit.id, label: hit.label, path: hit.path, type: hit.type, exposure: "basic", entry: "manager", synthetic: false });
        });
      } else {
        for (i = 0; i < ids.length; i++) {
          hit = window.PMv2 && window.PMv2.getResult ? window.PMv2.getResult(ids[i]) : null;
          if (!hit || hit.type !== want) continue;
          if (q && !matchesQ(hit.label, hit.path, "", hit.terms)) continue;
          out.push({ id: hit.id, resultId: hit.id, label: hit.label, path: hit.path, type: hit.type, exposure: "basic", entry: entry, synthetic: false });
        }
      }
    } else {
      settings.forEach(function (s) {
        if (!s || !s.id) return;
        if (f.domain && String(s.id).split(".")[0] !== f.domain) return;
        if (f.kind && s.type !== f.kind) return;
        var exp = settingExposure(s);
        if (f.exposure && exp !== f.exposure) return;
        var rowEntry = s.type === "action" ? "action" : "setting";
        if (entry && rowEntry !== entry) return;
        var model = app.controlModel ? app.controlModel(s.id) : null;
        var changed = !!(model && model.changed);
        if (f.changed && !changed) return;
        if (f.state && rowState(s) !== f.state) return;
        if (f.attention && !rowAttention(s)) return;
        var path = pathFor(s);
        var terms = Array.isArray(s.search) ? s.search.join(" ") : (s.search || "");
        if (!matchesQ(s.label, path, s.desc, terms)) return;
        out.push({ id: s.id, resultId: "setting:" + s.id, label: s.label, path: path, type: s.type, exposure: exp, entry: rowEntry, synthetic: false, changed: changed });
      });
    }
    if (f.synthetic) {
      var n;
      for (n = 0; n < 2000; n++) {
        var slabel = "Synthetic scale row " + n;
        if (q && slabel.toLowerCase().indexOf(q) === -1) continue;
        out.push({ id: "synthetic:stress-" + n, resultId: "synthetic:stress-" + n, label: slabel, path: "Synthetic overlay", type: "setting", exposure: "basic", entry: "setting", synthetic: true });
      }
    }
    return out;
  }
  function filteredAllSettings(app) {
    var f = ensureFacets(app);
    if (window.PMv2 && typeof window.PMv2.filterAllSettings === "function") return window.PMv2.filterAllSettings(app, f) || [];
    return fallbackFilterAllSettings(app, f);
  }
  function facetBtn(act, id, current, label, pressed) {
    var sel = pressed != null
      ? (pressed ? ' aria-pressed="true"' : ' aria-pressed="false"')
      : (current ? ' aria-current="true"' : "");
    return '<button type="button" data-act="' + act + '"' + (id != null ? ' data-id="' + esc(id) + '"' : "") + sel + ">" + esc(label) + "</button>";
  }
  function allDetail(app) {
    var selected = app.route && app.route.row;
    if (!selected) {
      return '<p class="' + PX + '-muted">Select a row to read it in context. This index is virtualized. Synthetic overlay rows are labeled and excluded from product search.</p>';
    }
    if (String(selected).indexOf("synthetic:") === 0) {
      return '<h1 class="' + PX + '-h1">Synthetic overlay</h1><p class="' + PX + '-lede">Labeled scale row, excluded from product inventory and from default search.</p>';
    }
    if (app.setting && app.setting(selected)) return control(app, selected);
    var hit = (window.PMv2 && window.PMv2.getResult && window.PMv2.getResult(selected)) || (app.getResult && app.getResult(selected));
    if (hit) {
      return '<h1 class="' + PX + '-h1">' + esc(hit.label) + "</h1>" +
        '<p class="' + PX + '-lede">' + esc(hit.path || "") + "</p>" +
        '<p class="' + PX + '-muted">' + esc(humanType(hit.type)) + (hit.availability ? " · " + esc(humanAvail(hit.availability)) : "") + "</p>" +
        '<button type="button" data-act="pick" data-id="' + esc(hit.id) + '">Open</button>';
    }
    return control(app, selected);
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
  function noneList() {
    return '<p class="' + PX + '-muted">None</p>';
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
    var hits = window.PMv2.search(q) || [];
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
    app.results = out;
    if (app.results.length && !app.results.some(function (h) { return h.id === app.selectedResultId; })) {
      app.selectedResultId = app.results[0].id;
    }
  }

  function motionClass(app) {
    return app && app._motionPlay ? (" " + PX + "-morph") : "";
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
      parts.push(ob ? (ob.label || ob.title || ob.name) : r.object);
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
    if (prev.name === "copy") return "Back to Copy from another project";
    if (prev.name === "deferred") {
      var d = (app.deferred || []).filter(function (x) { return x.id === prev.deferred; })[0];
      return "Back to " + (d ? d.title : "Owner module");
    }
    if (prev.name === "all") return "Back to All Settings";
    if (prev.page && prev.name === "domain") {
      var sub = ((app.cat(prev.domain) || {}).subgroups || []).filter(function (s) { return s.id === prev.page; })[0];
      return "Back to " + (sub ? sub.title : prev.page);
    }
    if (prev.manager && app.mgr(prev.manager)) return "Back to " + app.mgr(prev.manager).title;
    if (prev.domain && app.cat(prev.domain)) return "Back to " + app.cat(prev.domain).title;
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
      var hits = (app.results || []);
      if (!hits.length && app.query) {
        drop = '<div class="' + PX + '-drop pmv2-scroll" data-search-drop data-hit-class="' + PX + '-hit" role="listbox"><div class="' + PX + '-hit">No matching settings</div></div>';
      } else if (hits.length) {
        var selected = app.selectedResultId;
        if (!hits.some(function (h) { return h.id === selected; })) selected = hits[0].id;
        drop = '<div class="' + PX + '-drop pmv2-scroll" data-search-drop data-hit-class="' + PX + '-hit" role="listbox">' + groupHits(hits).map(function (g) {
          return '<div class="' + PX + '-muted">' + esc(humanType(g.type)) + "</div>" + g.items.map(function (h) {
            var sel = h.id === selected ? "true" : "false";
            var extra = humanAvail(h.availability);
            return '<button type="button" class="' + PX + '-hit" role="option" aria-selected="' + sel + '" data-act="pick" data-id="' + esc(h.id) + '"><b>' + esc(h.label) + '</b><span class="path">' + esc(h.path) + '</span><span class="meta">' + esc(humanType(h.type)) + (extra ? " · " + esc(extra) : "") + "</span></button>";
          }).join("");
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
    return '<div class="' + PX + '-row" data-row-id="' + esc(id) + '"><div><label>' + esc(m.label) + "</label><p>" + esc(m.desc) + "</p>" +
      (m.reason ? '<p class="' + PX + '-muted">' + esc(m.reason) + "</p>" : "") +
      '<button type="button" class="' + PX + '-link" data-act="why" data-id="' + esc(id) + '">Why this value?</button></div><div class="' + PX + '-ctl">' + ctl + "</div></div>";
  }

  function attention(app) {
    if (app.flags.empty) return '<p class="' + PX + '-muted">Nothing needs attention in this project.</p>';
    var items = app.attention || [];
    if (!items.length) return noneList();
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
    return '<button type="button" class="' + PX + '-big" data-act="domain" data-id="' + esc(c.id) + '" data-row-id="' + esc(c.id) + '" data-flip-id="' + esc(c.id) + '">' +
      '<header data-flip-target="' + esc(c.id) + '"><strong>' + esc(c.title) + "</strong></header>" +
      "<span>" + esc(c.description) + "</span>" +
      (pages ? '<em>' + esc(pages) + "</em>" : "") +
      (mgrs ? '<small>' + esc(mgrs) + "</small>" : "") +
      "</button>";
  }

  function home(app) {
    var cats = app.categories || [];
    return '<div class="' + PX + "-home " + PX + '-scroll pmv2-scroll' + motionClass(app) + '">' +
      '<p class="' + PX + '-kicker">Project ' + esc(app.project.name) + " · current values only</p>" +
      '<h1 class="' + PX + '-h1">Settings</h1>' +
      '<p class="' + PX + '-lede">Search first. The twelve large cards are the product catalog for this project. Provider summaries below are status plus a single next step — not a second catalog, live link, or profile.</p>' +
      "<h2>Needs attention</h2>" + attention(app) +
      workBox(app) +
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
    return '<div class="' + PX + "-domain" + motionClass(app) + '">' +
      '<div class="' + PX + "-main " + PX + '-scroll pmv2-scroll">' +
      '<header class="' + PX + '-head" data-flip-target="' + esc(c.id) + '">' +
      '<p class="' + PX + '-kicker">Project ' + esc(app.project.name) + "</p>" +
      '<h1 class="' + PX + '-h1">' + esc(c.title) + "</h1>" +
      '<p class="' + PX + '-lede">' + esc(c.description) + "</p>" +
      "</header>" +
      workBox(app) +
      (c.id === "ai" ? "<h2>Provider summary</h2>" + providerCards(app, true) : "") +
      "<h2>Pages</h2><div class=\"" + PX + '-leaves">' + (pages || noneList()) + "</div>" +
      "<h2>Managers</h2><div class=\"" + PX + '-leaves">' + (mgrNav || noneList()) + "</div>" +
      (defNav ? "<h2>Owner modules</h2><div class=\"" + PX + '-leaves">' + defNav + "</div>" : "") +
      "<h2>Settings</h2>" + (rows.length ? rows.map(function (s) { return control(app, s.id); }).join("") : noneList()) +
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
    html += confirmOfficialControls(app, obj.id);
    if (page === "installations") {
      var instRows = (app.installs || []).filter(function (i) {
        return i.provider === obj.id;
      });
      html += "<h2>Installations</h2>" + (instRows.length ? instRows.map(function (i) {
        var unknown = i.manualOnly || i.owner === "unknown";
        return '<div class="' + PX + '-install" data-row-id="' + esc(i.id) + '"><strong>' + esc(i.label) + "</strong> · " + esc(i.host) +
          (unknown ? " · Unknown owner — manual only" : "") +
          (i.official ? " · Official source" : "") +
          identityBlock(i) +
          "</div>";
      }).join("") : noneList());
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
    var roster = objs.length ? objs.map(function (o) {
      return '<button type="button" data-act="object" data-id="' + esc(o.id) + '" data-row-id="' + esc(o.id) + '"' + (obj && o.id === obj.id ? ' aria-current="true"' : "") + ">" + esc(o.label) + " · " + esc((o.availability || "ready").replace(/_/g, " ")) + "</button>";
    }).join("") : noneList();
    var detail;
    if (m.id === "providers" && obj) detail = providerDetail(app, obj, page);
    else {
      detail = '<h1 class="' + PX + '-h1">' + esc(m.title) + "</h1><p class=\"" + PX + '-lede">' + esc(m.purpose) + "</p>";
      if (obj) detail += '<div data-row-id="' + esc(obj.id) + '"><strong>' + esc(obj.label) + "</strong> · " + esc(obj.kind || "resource") + " · " + esc((obj.availability || "ready").replace(/_/g, " ")) + "</div>";
    }
    var relatedSettings = app.settingsForPage(m.domain, null).slice(0, 10).map(function (s) { return control(app, s.id); }).join("") || noneList();
    return '<div class="' + PX + "-workspace" + motionClass(app) + '">' +
      '<div class="' + PX + '-mtabs pmv2-scroll">' + tabs + "</div>" +
      workBox(app) +
      '<div class="' + PX + '-mgr">' +
      '<aside class="' + PX + '-roster pmv2-scroll"><h2>In this manager</h2>' + roster + "</aside>" +
      '<div class="' + PX + "-form " + PX + '-scroll pmv2-scroll">' + detail + "<h2>Project settings</h2>" + relatedSettings + "</div>" +
      "</div></div>";
  }

  function allSettings(app) {
    var f = ensureFacets(app);
    var kinds = ["select", "toggle", "slider", "number", "action", "radio", "list", "multiselect", "keyvalue", "text", "path"];
    var entries = ["", "setting", "manager", "action", "diagnostic", "workflow"];
    var domainBtns = facetBtn("facet-domain", "", !f.domain, "All domains") +
      (app.categories || []).map(function (c) {
        return facetBtn("facet-domain", c.id, f.domain === c.id, c.title);
      }).join("");
    var kindBtns = facetBtn("facet-kind", "", !f.kind, "All kinds") +
      kinds.map(function (k) {
        return facetBtn("facet-kind", k, f.kind === k, humanKind(k));
      }).join("");
    var exposureBtns = facetBtn("facet-exposure", "", !f.exposure, "All exposure") +
      facetBtn("facet-exposure", "basic", f.exposure === "basic", "Basic") +
      facetBtn("facet-exposure", "advanced", f.exposure === "advanced", "Advanced") +
      facetBtn("facet-exposure", "hidden", f.exposure === "hidden", "Hidden");
    var stateBtns = facetBtn("facet-state", "", !f.state, "All states") +
      facetBtn("facet-state", "managed", f.state === "managed", "Managed") +
      facetBtn("facet-state", "unavailable", f.state === "unavailable", "Unavailable");
    var entryBtns = entries.map(function (e) {
      var label = e ? humanEntry(e) : "All types";
      return facetBtn("facet-entry", e, String(f.entry || "") === e, label);
    }).join("");
    return '<div class="' + PX + "-comp" + (app.route.row ? " is-detail" : "") + '">' +
      '<aside class="' + PX + '-facets pmv2-scroll">' +
      "<h2>Domain</h2><div class=\"" + PX + '-facetlist">' + domainBtns + "</div>" +
      "<h2>Record kind</h2><div class=\"" + PX + '-facetlist">' + kindBtns + "</div>" +
      "<h2>Exposure</h2><div class=\"" + PX + '-facetlist">' + exposureBtns + "</div>" +
      "<h2>This project</h2><div class=\"" + PX + '-facetlist">' +
      facetBtn("facet-changed", null, false, "Changed from default", !!f.changed) +
      "</div>" +
      "<h2>Availability</h2><div class=\"" + PX + '-facetlist">' + stateBtns + "</div>" +
      "<h2>Type</h2><div class=\"" + PX + '-facetlist">' + entryBtns + "</div>" +
      "<h2>Attention</h2><div class=\"" + PX + '-facetlist">' +
      facetBtn("facet-attention", null, false, "Needs attention", !!f.attention) +
      "</div>" +
      "<h2>Overlay</h2><div class=\"" + PX + '-facetlist">' +
      facetBtn("facet-synth", null, false, "Include synthetic overlay", !!f.synthetic) +
      facetBtn("facet-clear", null, false, "Clear filters") +
      "</div>" +
      '<p class="' + PX + '-muted" data-all-count></p></aside>' +
      '<div class="' + PX + '-list pmv2-scroll" data-all-list="1"></div>' +
      '<div class="' + PX + '-detail pmv2-scroll">' + allDetail(app) + "</div></div>";
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
      (r.restorePointId ? factRow("Restore point id", r.restorePointId) : "") +
      factRow("Verified", r.verified ? "Yes" : "No") +
      factRow("Counts", "Additions " + (c.additions || 0) + " · Replacements " + (c.replacements || 0) + " · Unchanged " + (c.unchanged || 0) + " · Unavailable " + (c.unavailable || 0) + " · Conflicts " + (c.conflicts || 0)) +
      factRow("Backend", (r.backend || "RuntimeResourceGovernor+projectStore")) +
      "</div>" +
      '<p class="' + PX + '-muted">RuntimeResourceGovernor admits this copy. Project store persists this project only.</p>';
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
      factRow("Scope", d.scopeNote) +
      factRow("Backend", (d.backend || "projectStore")) +
      "</div>" + detailsInstallIdentity(app) + "</aside>";
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
        '<p class="' + PX + '-muted">Account and credential references copy. Secrets never copy. Projects stay independent. This is a one-time copy — not a live link, profile, or inheritance.</p>' +
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
    return '<div class="' + PX + "-copy " + PX + '-scroll pmv2-scroll' + motionClass(app) + '">' +
      '<p class="' + PX + '-kicker">Project ' + esc(app.project.name) + " · one-time copy</p>" +
      '<h1 class="' + PX + '-h1">Copy Settings From Another Project</h1>' +
      "<p class='" + PX + "-lede'>Copies into <strong>" + esc(app.project.name) + "</strong>. Full-width category selection. No ongoing sync, profiles, or inheritance.</p>" +
      workBox(app) +
      "<h2>1. Source project</h2><div class='" + PX + "-copy-src'>" + srcs + "</div>" +
      "<h2>2. Categories</h2><div class='" + PX + "-copy-cats'>" + cats + "</div>" +
      "<h2>3. Preview</h2>" + prev +
      window.PMv2.copyTransactionHtml(app, PX) +
      actions +
      "</div>";
  }

  function deferredView(app) {
    var d = (app.deferred || []).filter(function (x) { return x.id === app.route.deferred; })[0];
    if (!d) return "<div>Unknown owner module</div>";
    return '<div class="' + PX + "-sheet " + PX + '-scroll pmv2-scroll' + motionClass(app) + '"><h1 class="' + PX + '-h1">' + esc(d.title) + "</h1><p>This destination is owned by <strong>" + esc(d.owner) + "</strong>. Settings does not invent a backend for it.</p><p>Return contract: Back restores the previous Settings location. Close Settings returns to the opening surface.</p><button type='button' data-act='back'>Return to Settings</button></div>";
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
    var items = filteredAllSettings(app);
    var count = root.querySelector("[data-all-count]");
    var product = app.productSettingCount || 828;
    var f = ensureFacets(app);
    if (count) {
      count.textContent = items.length + " shown · " + product + " product settings" + (f.synthetic ? " plus labeled overlay" : "");
    }
    var selected = app.route && app.route.row;
    if (!items.length) {
      host.innerHTML = noneList();
      virt = null;
      return;
    }
    virt = window.PMv2.virtualList(host, items, 56, function (item) {
      var on = item.id === selected || item.resultId === selected;
      return '<button type="button" class="' + PX + '-hit" role="option" aria-selected="' + (on ? "true" : "false") +
        '" data-act="row" data-id="' + esc(item.resultId || item.id) + '" data-row-id="' + esc(item.id) + '"' +
        (item.synthetic ? ' data-synthetic="1"' : "") + "><b>" + esc(item.label) + "</b><span class='path'>" +
        esc(item.path) + (item.synthetic ? " · synthetic overlay" : "") + "</span>" +
        '<span class="meta">' + esc(humanKind(item.type) || humanType(item.type)) +
        (item.exposure ? " · " + esc(humanExposure(item.exposure)) : "") + "</span></button>";
    });
  }

  function applyAct(app, el, act, id) {
    if (act === "back") app.back();
    else if (act === "close") app.closeSettings();
    else if (act === "states") { app.statesOpen = !app.statesOpen; app.paint(); }
    else if (act === "state") app.triggerState(id);
    else if (act === "domain") {
      if (window.PMv2 && typeof window.PMv2.captureOrigin === "function") {
        app._flipOrigin = window.PMv2.captureOrigin(el);
        app._flipId = id;
      }
      app.openDomain(id);
    }
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
      var rowId = el.getAttribute("data-row-id") || id || "";
      var resultId = el.getAttribute("data-id") || id || rowId;
      if (!rowId) return;
      if (String(rowId).indexOf("synthetic:") === 0) {
        app.navigate({ name: "all", row: rowId }, { replace: true });
        return;
      }
      if (typeof app.routeSettingRow === "function") app.routeSettingRow(rowId);
      else if (typeof app.pickResult === "function") app.pickResult(resultId);
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
    } else if (act === "reconnect") {
      app.work = { title: "Reconnect Google AI", human_phase: "Waiting for sign-in", state: "waiting_user", wait_reason: "Reconnect required", progress_kind: "none", progress_source: "provider account", last_known_good: true, message: "Other project settings stay unchanged." };
      app.receipt("Reconnect is a project-local account repair.", "info");
      app.openManager("providers", { object: "google", page: "usage", row: "usage-projection" });
    } else if (act === "refresh-usage") {
      app.work = { title: "Refresh usage", human_phase: "Refreshing", state: "running", progress_kind: "indeterminate", progress_source: "usage projection", last_known_good: true, message: "Cached usage remains visible." };
      app.receipt("Usage refresh requested for this project.", "info");
      app.paint();
    } else if (act === "switch-route") {
      app.receipt("Provider route switch stays on this project.", "ok");
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
    else if (act === "facet-domain") { ensureFacets(app).domain = id || ""; app.paint(); }
    else if (act === "facet-kind") { ensureFacets(app).kind = id || ""; app.paint(); }
    else if (act === "facet-exposure") { ensureFacets(app).exposure = id || ""; app.paint(); }
    else if (act === "facet-changed") { ensureFacets(app).changed = !ensureFacets(app).changed; app.paint(); }
    else if (act === "facet-state") { ensureFacets(app).state = id || ""; app.paint(); }
    else if (act === "facet-entry") { ensureFacets(app).entry = id || ""; app.paint(); }
    else if (act === "facet-attention") { ensureFacets(app).attention = !ensureFacets(app).attention; app.paint(); }
    else if (act === "facet-synth") {
      ensureFacets(app).synthetic = !ensureFacets(app).synthetic;
      app.receipt("Synthetic overlay is labeled and excluded from product inventory search by default.", "info");
      app.paint();
    } else if (act === "facet-clear") {
      app.allFacets = defaultFacets();
      app.paint();
    }
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
    root.setAttribute("data-pane", app.detailsId ? "details" : ((app.route && app.route.name) || "main"));
    var snap = restoreFocus || captureFocus(root);
    restoreFocus = null;
    root.innerHTML = chrome(app) + '<div class="' + PX + '-body">' + body(app) + detailsDrawer(app) + "</div>";
    bind(app, root);
    fillAll(app, root);
    restoreCaptured(root, snap);
    if (app._flipOrigin && window.PMv2 && typeof window.PMv2.playFlip === "function") {
      var flipId = app._flipId ? (typeof CSS !== "undefined" && CSS.escape ? CSS.escape(app._flipId) : String(app._flipId)) : "";
      var flipEl = (flipId && root.querySelector('.d3-head[data-flip-target="' + flipId + '"]')) ||
        (flipId && root.querySelector('[data-flip-target="' + flipId + '"]')) ||
        root.querySelector(".d3-head[data-flip-target]") ||
        root.querySelector("[data-flip-target]");
      if (flipEl) window.PMv2.playFlip(flipEl, app._flipOrigin);
      app._flipOrigin = null;
      app._flipId = null;
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (window.PMShell) window.PMShell.init();
    var created = window.PMv2.createApp({ namespace: "c08", root: document.getElementById(ROOT_ID), render: render });
    var app = created || window.__pmv2App || appRef;
    if (app) {
      bindOfficialCliIdentity(app);
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
        if (facetsActive(app.allFacets)) { app.allFacets = defaultFacets(); app.paint(); return; }
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
