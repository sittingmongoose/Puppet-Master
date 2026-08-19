(function () {
  "use strict";
  var PX = "d2";
  var ROOT_ID = "d2-root";
  var esc = window.PMv2.esc;
  var virt = null;
  var narrowPane = "sheet";
  var searchCaret = 0;
  var keepSearchFocus = false;
  var cliProviderId = "local-ollama";
  var searchDropEnter = false;

  function human(s) {
    return String(s || "").replace(/_/g, " ").replace(/\b\w/g, function (ch) {
      return ch.toUpperCase();
    });
  }

  function enterClass(app) {
    return app && app._motionPlay ? " " + PX + "-enter" : "";
  }

  var KIND_OPTIONS = ["select", "toggle", "slider", "number", "action", "radio", "list", "multiselect", "keyvalue", "text", "path"];
  var EXPOSURE_OPTIONS = ["basic", "advanced", "hidden"];
  var STATE_OPTIONS = ["ready", "managed", "unavailable"];
  var ENTRY_OPTIONS = ["setting", "action", "manager", "workflow", "diagnostic"];
  var EXTRA_INDEX_IDS = [
    "action:copy-from-project",
    "action:open-all-settings",
    "action:retry-default-account",
    "workflow:provider-cli-setup",
    "diagnostic:usage-stale",
    "help:copy-policy"
  ];

  function runOfficialCli(app, providerId) {
    var id = providerId || cliProviderId || "local-ollama";
    cliProviderId = id;
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

  function defaultAllFacets() {
    if (window.PMv2 && typeof window.PMv2.defaultAllFacets === "function") {
      return window.PMv2.defaultAllFacets();
    }
    return {
      domain: "",
      kind: "",
      exposure: "",
      state: "",
      entry: "",
      changed: false,
      attention: false,
      synthetic: false,
      q: ""
    };
  }

  function ensureFacets(app) {
    if (!app.allFacets) app.allFacets = defaultAllFacets();
    var f = app.allFacets;
    if (f.domain == null) f.domain = "";
    if (f.kind == null) f.kind = "";
    if (f.exposure == null) f.exposure = "";
    if (f.state == null) f.state = "";
    if (f.entry == null) f.entry = "";
    if (f.changed == null) f.changed = false;
    if (f.attention == null) f.attention = false;
    if (f.synthetic == null) f.synthetic = false;
    if (f.q == null) f.q = "";
    return f;
  }

  function facetsActive(f) {
    return !!(f && (f.domain || f.kind || f.exposure || f.state || f.entry || f.changed || f.attention || f.synthetic));
  }

  function facetBtn(act, id, on, label, pressed) {
    var aria = "";
    if (pressed != null) aria = ' aria-pressed="' + (pressed ? "true" : "false") + '"';
    else if (on) aria = ' aria-current="true"';
    return '<button type="button" data-act="' + act + '"' +
      (id != null ? ' data-id="' + esc(id) + '"' : "") +
      aria + ">" + esc(label) + "</button>";
  }

  function facetGroup(title, body) {
    return "<h2>" + esc(title) + '</h2><div class="' + PX + '-facet-group">' + body + "</div>";
  }

  function entryFamily(type) {
    var t = String(type || "setting");
    if (t === "setup_or_repair_workflow" || t === "workflow") return "workflow";
    if (t === "diagnostic_or_read_only_status" || t === "diagnostic" || t === "intentional_help_result") return "diagnostic";
    if (t === "manager" || t === "managed_object") return "manager";
    if (t === "action") return "action";
    if (t === "unavailable_capability") return "diagnostic";
    return "setting";
  }

  function exposureOfSetting(s) {
    if (window.PMv2 && typeof window.PMv2.settingExposure === "function") {
      return window.PMv2.settingExposure(s);
    }
    if (!s) return "basic";
    if (s.exposure) {
      var e = String(s.exposure).toLowerCase();
      if (e === "standard" || e === "managed" || e === "unavailable") return "basic";
      if (e === "advanced") return "advanced";
      if (e === "expert" || e === "diagnostic" || e === "hidden") return "hidden";
      if (e === "basic") return "basic";
      return e;
    }
    if (s.type === "action") return "hidden";
    if (s.tier === "advanced") return "advanced";
    return "basic";
  }

  function mapAvailability(raw) {
    var a = String(raw || "ready").toLowerCase().replace(/-/g, "_");
    if (a === "managed" || a === "policy") return "managed";
    if (a === "unavailable" || a === "setup_required" || a === "reconnect_required" || a === "unknown") return "unavailable";
    return "ready";
  }

  function stateOfItem(item, app, setting) {
    var sid = (setting && setting.id) || item.settingId || null;
    if (sid && app && typeof app.controlModel === "function") {
      var model = null;
      try { model = app.controlModel(sid); } catch (err) { model = null; }
      if (model) {
        if (model.originKind === "policy") return "managed";
        if (model.originKind === "unavailable") return "unavailable";
        if (model.disabled && /managed/i.test(model.reason || "")) return "managed";
        if (model.disabled && /unavailable/i.test(model.reason || "")) return "unavailable";
      }
    }
    if (item.type === "unavailable_capability") return "unavailable";
    return mapAvailability(item.availability || item.state);
  }

  function itemDomain(item, setting) {
    if (item.domain) return item.domain;
    if (item.dest && item.dest.domain) return item.dest.domain;
    if (setting) return String(setting.id).split(".")[0];
    var id = String(item.id || "");
    if (id.indexOf("setting:") === 0) return id.slice(8).split(".")[0];
    return "";
  }

  function isAttentionItem(item, app) {
    var list = app.attention || [];
    var i, a, destId, rid;
    rid = item.resultId || item.id;
    for (i = 0; i < list.length; i++) {
      a = list[i];
      destId = a.destId || a.id;
      if (!destId) continue;
      if (destId === rid || destId === item.id) return true;
      if (item.settingId && destId === "setting:" + item.settingId) return true;
    }
    return false;
  }

  function settingPath(app, s) {
    var parts = String(s.id).split(".");
    var domain = parts[0] || "";
    var page = parts[1] || "";
    var cat = app.cat ? app.cat(domain) : null;
    var sub = ((cat && cat.subgroups) || []).filter(function (x) { return x.id === page; })[0];
    return "Settings / " + (cat ? cat.title : human(domain)) + " / " + (sub ? sub.title : human(page)) + " / " + s.label;
  }

  function localCatalog(app) {
    var items = [];
    var seen = {};
    function push(item) {
      if (!item || !item.id || seen[item.id]) return;
      seen[item.id] = 1;
      items.push(item);
    }
    var inv = (window.PMv2 && window.PMv2.inventory && window.PMv2.inventory.settings) || [];
    var i, s, cat, objs, extra, get;
    for (i = 0; i < inv.length; i++) {
      s = inv[i];
      push({
        id: s.id,
        resultId: "setting:" + s.id,
        settingId: s.id,
        label: s.label,
        path: settingPath(app, s),
        type: s.type || "setting",
        kind: s.type || "",
        entry: s.type === "action" ? "action" : "setting",
        exposure: exposureOfSetting(s),
        availability: "ready",
        state: "ready",
        dest: { name: "domain", domain: String(s.id).split(".")[0], page: String(s.id).split(".")[1], row: s.id },
        domain: String(s.id).split(".")[0],
        synthetic: false
      });
    }
    (app.managers || []).forEach(function (mgr) {
      cat = app.cat ? app.cat(mgr.domain) : null;
      push({
        id: "manager:" + mgr.id,
        resultId: "manager:" + mgr.id,
        label: mgr.title,
        path: "Settings / " + (cat ? cat.title : human(mgr.domain)) + " / " + mgr.title,
        type: "manager",
        kind: "",
        entry: "manager",
        exposure: "basic",
        availability: "ready",
        state: "ready",
        dest: { name: "manager", domain: mgr.domain, manager: mgr.id },
        domain: mgr.domain,
        synthetic: false
      });
      objs = app.objectsFor ? app.objectsFor(mgr.id) : [];
      objs.forEach(function (o) {
        push({
          id: "object:" + mgr.id + ":" + o.id,
          resultId: "object:" + mgr.id + ":" + o.id,
          label: o.label,
          path: "Settings / " + mgr.title + " / " + o.label,
          type: "managed_object",
          kind: o.kind || "",
          entry: "manager",
          exposure: "basic",
          availability: o.availability || "ready",
          state: mapAvailability(o.availability || "ready"),
          dest: { name: "manager", domain: mgr.domain, manager: mgr.id, object: o.id },
          domain: mgr.domain,
          synthetic: false
        });
      });
    });
    (app.deferred || []).forEach(function (def) {
      push({
        id: "unavailable:" + def.id,
        resultId: "unavailable:" + def.id,
        label: def.title,
        path: "Settings / System & Advanced / " + def.title,
        type: "unavailable_capability",
        kind: "",
        entry: "diagnostic",
        exposure: "basic",
        availability: "unavailable",
        state: "unavailable",
        dest: { name: "deferred", domain: def.domain, deferred: def.id },
        domain: def.domain,
        synthetic: false
      });
    });
    get = (app.getResult || (window.PMv2 && window.PMv2.getResult));
    for (i = 0; i < EXTRA_INDEX_IDS.length; i++) {
      extra = get ? get(EXTRA_INDEX_IDS[i]) : null;
      if (!extra) continue;
      push({
        id: extra.id,
        resultId: extra.id,
        label: extra.label,
        path: extra.path,
        type: extra.type,
        kind: "",
        entry: entryFamily(extra.type),
        exposure: extra.type === "diagnostic_or_read_only_status" ? "hidden" : "basic",
        availability: extra.availability || "ready",
        state: mapAvailability(extra.availability || "ready"),
        dest: extra.dest,
        domain: extra.dest && extra.dest.domain,
        synthetic: false
      });
    }
    return items;
  }

  function applyFacets(app, items, f) {
    var out = [];
    var i, item, setting, domain, kind, exposure, state, entry, model;
    for (i = 0; i < items.length; i++) {
      item = items[i];
      if (item.synthetic) continue;
      setting = item.settingId && app.setting ? app.setting(item.settingId) : null;
      if (!setting && item.type === "setting" && app.setting && String(item.id).indexOf(":") === -1) {
        setting = app.setting(item.id);
      }
      domain = itemDomain(item, setting);
      kind = item.kind || (setting && setting.type) || "";
      exposure = item.exposure || exposureOfSetting(setting || item);
      if (exposure !== "basic" && exposure !== "advanced" && exposure !== "hidden") {
        exposure = exposureOfSetting({ exposure: exposure, type: item.type, tier: setting && setting.tier });
      }
      state = item.state || stateOfItem(item, app, setting);
      if (state !== "ready" && state !== "managed" && state !== "unavailable") state = mapAvailability(state);
      entry = item.entry || entryFamily(item.type);
      if (setting && setting.type === "action") entry = "action";
      if (f.domain && domain !== f.domain) continue;
      if (f.kind && kind !== f.kind) continue;
      if (f.exposure && exposure !== f.exposure) continue;
      if (f.state && state !== f.state) continue;
      if (f.entry && entry !== f.entry) continue;
      if (f.changed) {
        if (!setting) continue;
        model = app.controlModel(setting.id);
        if (!model || !model.changed) continue;
      }
      if (f.attention && !isAttentionItem(item, app)) continue;
      out.push(item);
    }
    if (f.synthetic) {
      var n, label;
      for (n = 0; n < 2000; n++) {
        label = "Synthetic scale row " + n;
        out.push({
          id: "synthetic:stress-" + n,
          resultId: "synthetic:stress-" + n,
          label: label,
          path: "Settings / Synthetic overlay / Row " + n,
          type: "setting",
          kind: "",
          entry: "setting",
          exposure: "basic",
          availability: "ready",
          state: "ready",
          dest: { name: "all", row: "synthetic:stress-" + n },
          synthetic: true
        });
      }
    }
    return out;
  }

  function fallbackFilterAllSettings(app, f) {
    return applyFacets(app, localCatalog(app), f || ensureFacets(app));
  }

  function filterAllSettings(app) {
    var f = ensureFacets(app);
    if (window.PMv2 && typeof window.PMv2.filterAllSettings === "function") {
      return window.PMv2.filterAllSettings(app, f);
    }
    return fallbackFilterAllSettings(app, f);
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

  function fmtCopyVal(v) {
    if (v == null || v === "") return "—";
    if (typeof v === "boolean") return v ? "On" : "Off";
    if (Array.isArray(v)) return v.length ? v.join(", ") : "None";
    return String(v);
  }

  function fmt(list, renderItem) {
    if (!list || !list.length) return '<p class="' + PX + '-muted">None</p>';
    if (typeof renderItem === "function") return list.map(renderItem).join("");
    return String(list);
  }

  function factRow(key, value, rowId) {
    var shown = value == null || value === "" ? "—" : value;
    return '<div class="' + PX + '-fact"' + (rowId ? ' data-row-id="' + esc(rowId) + '"' : "") + "><dt>" + esc(key) + "</dt><dd>" + esc(shown) + "</dd></div>";
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
    return human(t);
  }

  function providerFacts(obj) {
    return '<dl class="' + PX + '-facts">' +
      factRow("Connected", providerConnected(obj)) +
      factRow("Account", obj.account, "account-default") +
      factRow("Product", obj.product) +
      factRow("Models", obj.models) +
      factRow("When included usage ends", providerUsageEnd(obj), "usage-end") +
      factRow("Routing / fallback", providerRouting(obj), "routing-fallback") +
      factRow("Usage", obj.usage, "usage-projection") +
      factRow("Setup", obj.setup, obj.id === "local-ollama" ? "install-official" : null) +
      "</dl>";
  }

  function installRole(i) {
    if (i.selected) return "Selected";
    if (i.shadowed) return "Shadowed";
    return "Available";
  }

  function installUnknown(i) {
    return !!(i.manualOnly || i.owner === "unknown" || !i.owner);
  }

  function identityBlock(i, prefix) {
    prefix = prefix || PX;
    if (window.PMv2 && typeof window.PMv2.identityBlock === "function") {
      return window.PMv2.identityBlock(i, prefix);
    }
    i = i || {};
    var ident = (window.PMv2 && typeof window.PMv2.installationIdentity === "function")
      ? window.PMv2.installationIdentity(i)
      : {};
    var adv = ident.advanced || {};
    var unknown = installUnknown(i) || ident.manualOnly;
    var humanName = ident.human || i.label || i.id;
    var host = ident.host || i.host || "";
    return '<div class="' + prefix + '-install-human">' +
      '<p class="' + prefix + '-kicker">Human identity</p>' +
      "<strong>" + esc(humanName) + "</strong>" +
      '<p class="' + prefix + '-muted">' + esc(host) + " · " + esc(installRole(i)) +
      (unknown ? " · Unknown owner — manual only" : "") + "</p></div>" +
      '<div class="' + prefix + '-install-adv">' +
      '<p class="' + prefix + '-kicker">Advanced identity</p>' +
      '<dl class="' + prefix + '-facts">' +
      factRow("Launcher", adv.launcher || "not located") +
      factRow("Executable", adv.executable || "not located") +
      factRow("Package", adv.package || "not located") +
      factRow("Host / environment", adv.host || host) +
      factRow("Owner", ident.owner || (unknown ? "unknown" : i.owner)) +
      factRow("Confidence", adv.confidence || (unknown ? "none" : "strongly_identified")) +
      factRow("Evidence", adv.evidence || "BinaryLocator") +
      factRow("Health", human(i.health || "")) +
      factRow("Installation id", i.id) +
      factRow("Backend", ident.backend || "BinaryLocator") +
      "</dl>" +
      (unknown ? '<p class="' + prefix + '-muted">Unknown owner stays manual-only. Settings will not adopt or update this binary.</p>' : "") +
      "</div>";
  }

  function installCard(i) {
    return '<article class="' + PX + '-install" data-row-id="' + esc(i.id) + '">' +
      (window.PMv2 && typeof window.PMv2.identityBlock === "function"
        ? window.PMv2.identityBlock(i, PX)
        : identityBlock(i, PX)) +
      "</article>";
  }

  function ico() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="14" height="16" rx="2" fill="none" stroke="currentColor"/><path d="M8 9h8M8 13h6" fill="none" stroke="currentColor"/></svg>';
  }
  function searchIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor"/><path d="m20 20-3.5-3.5" fill="none" stroke="currentColor"/></svg>';
  }

  function settingCount(app, domain, page) {
    var rows = app.settingsForPage(domain, page || null) || [];
    return rows.length;
  }

  function crumb(app) {
    var r = app.route || { name: "home" };
    var parts = ["Settings"];
    if (r.domain && app.cat(r.domain)) parts.push(app.cat(r.domain).title);
    if (r.page) {
      var sub = ((app.cat(r.domain) || {}).subgroups || []).filter(function (s) { return s.id === r.page; })[0];
      parts.push(sub ? sub.title : human(r.page));
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

  function chrome(app) {
    var q = esc(app.query || "");
    var drop = "";
    if (app.searchOpen) {
      var hits = (app.results || []);
      var dropEnter = searchDropEnter ? "" : " " + PX + "-drop-enter";
      if (!hits.length && app.query) {
        drop = '<div class="' + PX + '-drop pmv2-scroll' + dropEnter + '" data-search-drop data-hit-class="' + PX + '-hit" role="listbox"><div class="' + PX + '-hit">No matching settings</div></div>';
        searchDropEnter = true;
      } else if (hits.length) {
        var selected = app.selectedResultId;
        if (!hits.some(function (h) { return h.id === selected; })) selected = hits[0].id;
        drop = '<div class="' + PX + '-drop pmv2-scroll' + dropEnter + '" data-search-drop data-hit-class="' + PX + '-hit" role="listbox">' + groupHits(hits).map(function (g) {
          return '<div class="' + PX + '-muted">' + esc(human(g.type)) + "</div>" + g.items.map(function (h) {
            var sel = h.id === selected ? "true" : "false";
            var avail = h.availability && h.availability !== "ready" ? " · " + esc(human(h.availability)) : "";
            return '<button type="button" class="' + PX + '-hit" role="option" aria-selected="' + sel + '" data-act="pick" data-id="' + esc(h.id) + '"><b>' + esc(h.label) + '</b><span class="path">' + esc(h.path) + '</span><span class="meta">' + esc(human(h.type || "setting")) + avail + "</span></button>";
          }).join("");
        }).join("") + "</div>";
        searchDropEnter = true;
      }
    } else {
      searchDropEnter = false;
    }
    var banner = "";
    if (app.flags.offline) banner = '<div class="' + PX + '-banner">Offline. Cached values stay visible; refresh waits for network.</div>';
    else if (app.flags.restart) banner = '<div class="' + PX + '-banner">Restart required before this change applies to new runs.</div>';
    else if (app.flags.reconnect) banner = '<div class="' + PX + '-banner">Reconnect required for Google AI. Other project settings are unchanged.</div>';
    var states = "";
    if (app.statesOpen) {
      var names = ["loading-cached", "empty", "no-search-results", "typo-fuzzy", "validation-error", "offline", "managed", "unavailable", "restart-required", "reconnect-required", "changed-elsewhere", "import-conflict", "rollback-complete", "usage-unavailable", "multi-install", "unknown-owner", "provider-update", "verification-failure"];
      states = '<div class="' + PX + '-states-panel pmv2-scroll" role="dialog" aria-label="Demo states">' + names.map(function (n) {
        return '<button type="button" data-act="state" data-id="' + n + '">' + esc(n.replace(/-/g, " ")) + "</button>";
      }).join("") + "</div>";
    }
    return '<div class="' + PX + '-chrome">' +
      '<button type="button" class="' + PX + '-back" data-act="back">' + esc(backLabel(app)) + "</button>" +
      '<div class="' + PX + '-crumb">' + crumb(app) + "</div>" +
      '<div class="' + PX + '-searchwrap">' + searchIcon() +
      '<input data-search type="search" placeholder="Search settings, managers, and setups" value="' + q + '" aria-label="Universal settings search" autocomplete="off" spellcheck="false">' +
      drop + "</div>" +
      '<span class="' + PX + '-proj">Project · ' + esc(app.project.name) + "</span>" +
      '<button type="button" class="' + PX + '-states" data-act="states">Demo states</button>' +
      '<button type="button" class="' + PX + '-close" data-act="close">Close Settings</button>' +
      states + domainStrip(app) + "</div>" + banner;
  }

  function workBox(app) {
    if (!app.work) return "";
    var w = app.work;
    var bar = "";
    if (w.progress_kind === "determinate") bar = "<div>" + esc(w.completed) + " / " + esc(w.total) + " · " + esc(w.progress_source) + "</div>";
    else if (w.progress_kind && w.progress_kind !== "none") bar = "<div>Progress unknown · " + esc(w.progress_source) + "</div>";
    var confirm = "";
    var waitingOfficial = w.state === "waiting_user" && /official|install/i.test(String(w.title || "") + " " + String(w.human_phase || "") + " " + String(w.wait_reason || ""));
    if (waitingOfficial) {
      confirm = '<div class="' + PX + '-work-acts">' +
        '<button type="button" class="' + PX + '-go" data-act="confirm-official" data-id="' + esc(cliProviderId || "local-ollama") + '">Confirm official source</button>' +
        '<p class="' + PX + '-muted">BinaryLocator discovery for this host.</p>' +
        "</div>";
    }
    return '<div class="' + PX + '-work" data-ow-state="' + esc(w.state) + '"><strong>' + esc(w.title) + "</strong> — " + esc(w.human_phase) + (w.wait_reason ? " (waiting: " + esc(w.wait_reason) + ")" : "") + bar + (w.message ? "<div>" + esc(w.message) + "</div>" : "") + confirm + "</div>";
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
    var html = "";
    var i, chunk, heading, first;
    for (i = 0; i < rows.length; i += 6) {
      chunk = rows.slice(i, i + 6);
      first = chunk[0];
      heading = first && first.id ? human(first.id.split(".")[2] || first.id.split(".")[1] || "Settings") : "Settings";
      html += "<h2>" + esc(heading) + "</h2>" + chunk.map(function (s) { return control(app, s.id); }).join("");
    }
    return html;
  }

  function destRow(act, id, title, desc, count, current) {
    return '<button type="button" class="' + PX + '-ed" data-act="' + esc(act) + '" data-id="' + esc(id) + '" data-flip-id="' + esc(id) + '"' + (current ? ' aria-current="true"' : "") + ">" +
      ico() + "<span><strong>" + esc(title) + '</strong><span class="' + PX + '-ed-desc">' + esc(desc || "") + "</span></span>" +
      (count != null ? '<span class="' + PX + '-ed-count">' + esc(String(count)) + "</span>" : "") +
      "</button>";
  }

  function attention(app) {
    if (app.flags.empty) return '<p class="' + PX + '-muted">Nothing needs attention in this project.</p>';
    var items = (app.attention || []).slice(0, 4);
    return '<h2>Needs attention</h2><div class="' + PX + '-att">' + items.map(function (a) {
      return '<button type="button" data-act="pick" data-id="' + esc(a.destId) + '"><strong>' + esc(a.title) + '</strong><div class="' + PX + '-muted">' + esc(a.detail) + "</div></button>";
    }).join("") + "</div>";
  }

  function home(app) {
    var cats = app.categories || [];
    var dest = '<div class="' + PX + '-rows">' + cats.map(function (c) {
      return destRow("domain", c.id, c.title, c.description, settingCount(app, c.id, null), false);
    }).join("") + "</div>";
    return '<div class="' + PX + '-home ' + PX + '-scroll pmv2-scroll' + enterClass(app) + '">' +
      '<p class="' + PX + '-kicker">Project · ' + esc(app.project.name) + " · this project only</p>" +
      '<h1 class="' + PX + '-h1">Settings</h1>' +
      '<p class="' + PX + '-lede">Search first. The directory below is one column of destinations — twelve current categories, each with a short purpose. Copy from another project is a one-time action, not a live link.</p>' +
      attention(app) +
      workBox(app) +
      "<h2>Destinations</h2>" + dest +
      '<div class="' + PX + '-utils"><button type="button" data-act="all">All Settings</button><button type="button" data-act="copy">Copy Settings From Another Project</button></div>' +
      "</div>";
  }

  function rail(app) {
    var r = app.route || { name: "home" };
    var current = r.domain;
    var cats = app.categories || [];
    return '<nav class="' + PX + '-rail pmv2-scroll" aria-label="Settings domains">' +
      '<div class="' + PX + '-rail-label">Domains</div>' +
      cats.map(function (c) {
        return '<button type="button" data-act="domain" data-id="' + esc(c.id) + '" data-row-id="' + esc(c.id) + '"' + (c.id === current && r.name !== "all" && r.name !== "copy" ? ' aria-current="true"' : "") + ">" + esc(c.title) + "</button>";
      }).join("") +
      '<div class="' + PX + '-rail-foot">' +
      '<button type="button" data-act="all" data-row-id="all"' + (r.name === "all" ? ' aria-current="true"' : "") + ">All Settings</button>" +
      '<button type="button" data-act="copy" data-row-id="copy"' + (r.name === "copy" ? ' aria-current="true"' : "") + ">Copy from project</button>" +
      "</div></nav>";
  }

  function domainStrip(app) {
    var r = app.route || { name: "home" };
    var current = r.domain;
    var cats = app.categories || [];
    return '<nav class="' + PX + '-domainstrip" aria-label="Settings domains">' +
      cats.map(function (c) {
        return '<button type="button" data-act="domain" data-id="' + esc(c.id) + '" data-row-id="' + esc(c.id) + '"' +
          (c.id === current && r.name !== "all" && r.name !== "copy" ? ' aria-current="true"' : "") +
          ">" + esc(c.title) + "</button>";
      }).join("") +
      "</nav>";
  }

  function sheetHead(kicker, title, lede, flipId) {
    return '<header class="' + PX + '-sheet-head" data-flip-target' + (flipId ? '="' + esc(flipId) + '"' : "") + '>' +
      (kicker ? '<p class="' + PX + '-kicker">' + kicker + "</p>" : "") +
      '<h1 class="' + PX + '-h1">' + title + "</h1>" +
      (lede ? '<p class="' + PX + '-lede">' + lede + "</p>" : "") +
      "</header>";
  }

  function workspace(app, inner, extraClass) {
    return '<div class="' + PX + '-workspace">' + rail(app) +
      '<div class="' + PX + "-sheet " + (extraClass || "") + " " + PX + '-scroll pmv2-scroll' + enterClass(app) + '">' +
      domainStrip(app) + inner + "</div></div>";
  }

  function domain(app) {
    var c = app.cat(app.route.domain) || { title: "Settings", subgroups: [], description: "", id: app.route.domain };
    var page = app.route.page || ((c.subgroups || [])[0] || {}).id;
    var rows = app.settingsForPage(c.id, page);
    var mgrs = app.domainManagers[c.id] || [];
    var nested = '<div class="' + PX + '-rows">';
    (c.subgroups || []).forEach(function (sg) {
      nested += destRow("page", sg.id, sg.title, sg.description, settingCount(app, c.id, sg.id), sg.id === page);
    });
    mgrs.forEach(function (id) {
      var m = app.mgr(id);
      nested += destRow("manager", id, m ? m.title : id, m ? m.purpose : "", null, false);
    });
    (app.deferred || []).filter(function (d) { return d.domain === c.id; }).forEach(function (d) {
      nested += destRow("deferred", d.id, d.title, "Owned by " + d.owner, null, false);
    });
    nested += "</div>";
    var pageMeta = ((c.subgroups || []).filter(function (s) { return s.id === page; })[0]) || { title: human(page), description: "" };
    var inner = sheetHead(esc(c.title), esc(pageMeta.title), esc(pageMeta.description || c.description || ""), c.id) +
      nested + groupedControls(app, rows) + workBox(app);
    return workspace(app, inner);
  }

  function managerView(app) {
    var m = app.mgr(app.route.manager);
    if (!m) return workspace(app, "<p>Missing manager</p>");
    var objs = app.objectsFor(m.id) || [];
    var obj = objs.filter(function (o) { return o.id === app.route.object; })[0] || objs[0];
    var page = app.route.page || (m.tabs && m.tabs[0]) || "overview";
    var tabs = '<div class="' + PX + '-local">' + (m.tabs || []).map(function (t) {
      var label = m.id === "providers" ? providerTabLabel(t) : human(t);
      return '<button type="button" data-act="mtab" data-id="' + esc(t) + '"' + (t === page ? ' aria-current="true"' : "") + ">" + esc(label) + "</button>";
    }).join("") + "</div>";
    var roster = objs.map(function (o) {
      return '<button type="button" data-act="object" data-id="' + esc(o.id) + '" data-row-id="' + esc(o.id) + '"' + (obj && o.id === obj.id ? ' aria-current="true"' : "") + ">" + esc(o.label) + "</button>";
    }).join("");
    var related = app.settingsForPage(m.domain, null).slice(0, 8);
    var detail;
    if (m.id === "providers" && obj) {
      detail = sheetHead("", esc(obj.label), "Connected state, selected account, models, usage-end behavior, routing/fallback, and setup — for this project only.") +
        tabs + providerFacts(obj);
      if (obj.id === "local-ollama") {
        detail += "<p>Ollama is not bundled. Install from the official Ollama source for This PC / Native Windows. Authentication is a separate step. This project does not silently acquire a CLI.</p>" +
          '<p class="' + PX + '-muted">BinaryLocator discovery for this host.</p>' +
          '<p><button type="button" class="' + PX + '-go" data-act="install-official" data-id="local-ollama" data-row-id="install-official">Install from official source</button> ' +
          '<button type="button" class="' + PX + '-go" data-act="confirm-official" data-id="local-ollama">Confirm official source</button></p>';
      }
      if (obj.id === "google") {
        detail += '<p class="' + PX + '-muted">Usage projection is stale until reconnect. Cached catalog remains visible.</p>';
      }
      if (page === "installations") {
        var rows = (app.installs || []).filter(function (i) { return i.provider === obj.id; });
        detail += "<h2>Installations</h2>" + (rows.length ? rows.map(installCard).join("") : '<p class="' + PX + '-muted">None</p>');
      }
      if (page === "usage") {
        detail += "<h2>When included usage ends</h2>" +
          '<p data-row-id="usage-end">' + esc(providerUsageEnd(obj)) + "</p>" +
          '<p class="' + PX + '-muted">Settings owns the continuation. Usage owns the projection and never writes this choice.</p>' +
          '<p data-row-id="usage-projection">Projection: ' + esc(obj.usage || "—") + "</p>" +
          '<p><button type="button" class="' + PX + '-go" data-act="usage-refresh">Refresh usage</button></p>';
      }
      if (page === "accounts") {
        detail += "<h2>Routing / fallback</h2>" +
          '<p data-row-id="routing-fallback">' + esc(providerRouting(obj)) + "</p>" +
          '<p data-row-id="account-default">Selected account: ' + esc(obj.account || "—") + " · " + esc(obj.product || "—") + "</p>" +
          '<p class="' + PX + '-muted">Credentials stay on the account. Switching route does not copy secrets.</p>';
      }
    } else {
      detail = sheetHead("", esc(m.title), esc(m.purpose)) + tabs;
      if (obj) detail += "<p><strong>" + esc(obj.label) + "</strong></p>";
    }
    detail += related.map(function (s) { return control(app, s.id); }).join("") + workBox(app);
    var inner = '<div class="' + PX + '-mgr"><div class="' + PX + '-roster pmv2-scroll">' + roster + '</div><div class="' + PX + '-form ' + PX + '-scroll pmv2-scroll' + enterClass(app) + '">' + detail + "</div></div>";
    return '<div class="' + PX + '-workspace">' + rail(app) + domainStrip(app) + inner + "</div>";
  }

  function allSettings(app) {
    var f = ensureFacets(app);
    var cats = app.categories || [];
    var domainBtns = facetBtn("facet-domain", "", !f.domain, "All domains") +
      cats.map(function (c) {
        return facetBtn("facet-domain", c.id, f.domain === c.id, c.title);
      }).join("");
    var kindBtns = facetBtn("facet-kind", "", !f.kind, "All kinds") +
      KIND_OPTIONS.map(function (k) {
        return facetBtn("facet-kind", k, f.kind === k, human(k));
      }).join("");
    var exposureBtns = facetBtn("facet-exposure", "", !f.exposure, "All") +
      facetBtn("facet-exposure", "basic", f.exposure === "basic", "Basic") +
      facetBtn("facet-exposure", "advanced", f.exposure === "advanced", "Advanced") +
      facetBtn("facet-exposure", "hidden", f.exposure === "hidden", "Hidden");
    var stateBtns = facetBtn("facet-state", "", !f.state, "All") +
      facetBtn("facet-state", "ready", f.state === "ready", "Ready") +
      facetBtn("facet-state", "managed", f.state === "managed", "Managed") +
      facetBtn("facet-state", "unavailable", f.state === "unavailable", "Unavailable");
    var entryBtns = facetBtn("facet-entry", "", !f.entry, "All") +
      facetBtn("facet-entry", "setting", f.entry === "setting", "Setting") +
      facetBtn("facet-entry", "action", f.entry === "action", "Action") +
      facetBtn("facet-entry", "manager", f.entry === "manager", "Manager") +
      facetBtn("facet-entry", "workflow", f.entry === "workflow", "Workflow") +
      facetBtn("facet-entry", "diagnostic", f.entry === "diagnostic", "Diagnostic");
    var projectBtns =
      facetBtn("facet-changed", "", false, "Changed from default", !!f.changed) +
      facetBtn("facet-attention", "", false, "Needs attention", !!f.attention) +
      facetBtn("facet-synth", "", false, "Include synthetic overlay", !!f.synthetic) +
      '<button type="button" data-act="facet-clear">Clear filters</button>';
    var facets = '<aside class="' + PX + '-facets pmv2-scroll">' +
      facetGroup("Domain", domainBtns) +
      facetGroup("Record kind", kindBtns) +
      facetGroup("Exposure", exposureBtns) +
      facetGroup("State", stateBtns) +
      facetGroup("Entry type", entryBtns) +
      facetGroup("This project", projectBtns) +
      "</aside>";
    var inner = '<div class="' + PX + '-comp' + enterClass(app) + '">' + facets +
      '<div class="' + PX + '-allmain">' +
      '<div class="' + PX + '-sheet ' + PX + '-sheet-wide">' +
      domainStrip(app) +
      sheetHead("", "All Settings", "Complete faceted index for this project. Filters stay beside the list.") +
      '<p class="' + PX + '-muted" data-all-count></p>' +
      "</div>" +
      '<div class="' + PX + '-list pmv2-scroll" data-all-list="1"></div></div></div>';
    return '<div class="' + PX + '-workspace">' + rail(app) + inner + "</div>";
  }

  function copyPreviewLists(p) {
    if (!p) return fmt([]);
    var blocks = [];
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
    function section(title, countKey, items, truncKey, showChange) {
      items = items || [];
      var more = "";
      if (items.length && truncKey && p.truncated && p.truncated[truncKey] > 0) {
        more = '<p class="' + PX + '-copy-more ' + PX + '-muted">' + p.truncated[truncKey] + " more not shown</p>";
      }
      var body = fmt(items, function (item) { return itemRow(item, showChange); });
      return '<section class="' + PX + '-copy-block" data-kind="' + esc(countKey) + '">' +
        "<h3>" + esc(title) + ' <span class="' + PX + '-muted">(' + ((p.counts && p.counts[countKey]) || items.length) + ")</span></h3>" +
        '<div class="' + PX + '-copy-rows">' + body + "</div>" +
        more + "</section>";
    }
    blocks.push(section("Replacements", "replacements", p.replacementsItems || p.replacementItems, "replacements", true));
    blocks.push(section("Additions", "additions", p.additionsItems || p.additionItems, "additions", true));
    blocks.push(section("Unchanged", "unchanged", p.unchangedItems, "unchanged", false));
    var unavailableItems = p.unavailableItems || p.unavailable || [];
    var unavailableBody = fmt(unavailableItems, function (u) {
      return '<div class="' + PX + '-copy-row" data-kind="unavailable"><div><strong>' + esc(u.label || u.id) + "</strong></div><span class=\"" + PX + '-muted">' + esc(u.reason || "") + "</span></div>";
    });
    blocks.push('<section class="' + PX + '-copy-block" data-kind="unavailable"><h3>Unavailable <span class="' + PX + '-muted">(' + ((p.counts && p.counts.unavailable) || unavailableItems.length) + ")</span></h3>" +
      '<div class="' + PX + '-copy-rows">' + unavailableBody + "</div></section>");
    var conflictItems = p.conflictsItems || p.conflicts || [];
    var conflictBody = fmt(conflictItems, function (c) {
      return '<div class="' + PX + '-copy-row" data-kind="conflict"><div><strong>' + esc(c.label || c.id) + "</strong></div><span class=\"" + PX + '-muted">' + esc(c.reason || "") + "</span></div>";
    });
    blocks.push('<section class="' + PX + '-copy-block" data-kind="conflicts"><h3>Conflicts <span class="' + PX + '-muted">(' + ((p.counts && p.counts.conflicts) || conflictItems.length) + ")</span></h3>" +
      '<div class="' + PX + '-copy-rows">' + conflictBody + "</div></section>");
    return blocks.filter(Boolean).join("");
  }

  function copyTransactionHtml(app, p) {
    var lists = p ? copyPreviewLists(p) : "";
    var tx = (window.PMv2 && typeof window.PMv2.copyTransactionHtml === "function")
      ? window.PMv2.copyTransactionHtml(app, PX)
      : "";
    return lists + tx;
  }

  function copyReceiptFacts(r) {
    if (!r) return "";
    var c = r.counts || {};
    return '<dl class="' + PX + '-facts">' +
      factRow("Applied", r.at) +
      factRow("Source", r.source) +
      factRow("Restore point", r.restorePointAt) +
      factRow("Verified", r.verified ? "Yes" : "No") +
      factRow("Counts", "Additions " + (c.additions || 0) + " · Replacements " + (c.replacements || 0) + " · Unchanged " + (c.unchanged || 0) + " · Unavailable " + (c.unavailable || 0) + " · Conflicts " + (c.conflicts || 0)) +
      factRow("Backend", (r.backend || "RuntimeResourceGovernor+projectStore")) +
      "</dl>";
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
      '<dl class="' + PX + '-facts">' +
      factRow("Requested", fmtCopyVal(d.requested)) +
      factRow("Effective", fmtCopyVal(d.effective)) +
      factRow("Origin", origin.label || "—") +
      factRow("Policy floor", d.policyFloor || "—") +
      factRow("Persistence", d.persistence) +
      factRow("Scope", d.scopeNote) +
      factRow("Backend", (d.backend || "projectStore")) +
      "</dl></aside>";
  }

  function copyDialog(app) {
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
        '<p class="' + PX + '-muted">Account and credential references copy. Secrets never copy. Projects stay independent — no ongoing sync, profiles, or inheritance.</p>' +
        '<p class="' + PX + '-muted">' + esc(p.backend || "RuntimeResourceGovernor+projectStore") + ". RuntimeResourceGovernor admits this copy. Project store persists this project only.</p>" +
        copyTransactionHtml(app, p);
    }
    var actions = "";
    if (app.copy.step === "receipt" && app.copy.receipt) {
      actions = copyReceiptFacts(app.copy.receipt) + "<button type='button' class='" + PX + "-go' data-act='copy-rollback'>Roll back to restore point</button>";
    } else if (app.copy.step === "rolled_back") {
      actions = "<p>Rollback complete. This project’s previous values were restored.</p>";
    } else if (app.copy.step === "restore" || app.copy.step === "applying" || app.copy.step === "verifying") {
      actions = "";
    } else {
      actions = "<button type='button' class='" + PX + "-go' data-act='copy-apply'>Create restore point and copy</button>";
    }
    return '<div class="' + PX + '-dialog-scrim"><div class="' + PX + '-dialog pmv2-scroll' + enterClass(app) + '" role="dialog" aria-label="Copy Settings From Another Project">' +
      '<h1 class="' + PX + '-h1">Copy Settings From Another Project</h1>' +
      "<p>One-time copy into <strong>" + esc(app.project.name) + "</strong>. Quiet review, then apply.</p>" +
      workBox(app) +
      "<h2>Source project</h2><div class='" + PX + "-src " + PX + "-copy-src'>" + srcs + "</div>" +
      "<h2>Categories</h2><div class='" + PX + "-cats " + PX + "-copy-cats'>" + cats + "</div>" +
      "<h2>Preview</h2>" + prev + actions +
      "</div></div>";
  }

  function deferredView(app) {
    var d = (app.deferred || []).filter(function (x) { return x.id === app.route.deferred; })[0];
    if (!d) return workspace(app, "<p>Unknown owner module</p>");
    var inner = sheetHead("", esc(d.title), "") +
      "<p>This destination is owned by <strong>" + esc(d.owner) + "</strong>. Settings does not invent a backend for it.</p>" +
      "<p>Return contract: Back restores the previous Settings location. Close Settings returns to the opening surface.</p>" +
      '<button type="button" class="' + PX + '-go" data-act="back">Return to Settings</button>';
    return workspace(app, inner);
  }

  function view(app) {
    var r = app.route || { name: "home" };
    if (r.name === "home") return home(app);
    if (r.name === "domain") return domain(app);
    if (r.name === "manager") return managerView(app);
    if (r.name === "all") return allSettings(app);
    if (r.name === "copy") {
      var blank = sheetHead("", "Copy Settings", "A one-time transaction into this project.");
      return workspace(app, blank) + copyDialog(app);
    }
    if (r.name === "deferred") return deferredView(app);
    return home(app);
  }

  function fillAll(app, root) {
    var host = root.querySelector("[data-all-list]");
    if (!host) { virt = null; return; }
    var f = ensureFacets(app);
    var facets = {
      domain: f.domain,
      kind: f.kind,
      exposure: f.exposure,
      changed: f.changed,
      state: f.state,
      entry: f.entry,
      attention: f.attention,
      synthetic: f.synthetic,
      q: f.q || ""
    };
    var items;
    if (window.PMv2 && typeof window.PMv2.filterAllSettings === "function") {
      items = window.PMv2.filterAllSettings(app, facets);
    } else {
      items = fallbackFilterAllSettings(app, facets);
    }
    var count = root.querySelector("[data-all-count]");
    var product = app.productSettingCount || ((window.PMv2.inventory && window.PMv2.inventory.settings) || []).length;
    if (count) {
      count.textContent = items.length + " shown · " + product + " product settings" +
        (f.synthetic ? " plus labeled overlay" : "");
    }
    virt = window.PMv2.virtualList(host, items, 56, function (item) {
      var synthetic = (item.synthetic === true) || String(item.id || "").indexOf("synthetic") === 0;
      var resultId = item.resultId || "";
      var settingId = item.settingId || null;
      if (!settingId && (item.entry === "setting" || item.entry === "action") && String(item.id || "").indexOf(":") === -1) {
        settingId = item.id;
      }
      if (!settingId && String(resultId).indexOf("setting:") === 0) settingId = resultId.slice(8);
      var isSettingRow = settingId && String(resultId).indexOf("synthetic") !== 0;
      var act = isSettingRow || synthetic ? "row" : "pick";
      var dataId = isSettingRow ? settingId : (resultId || item.id);
      if (synthetic) dataId = item.id;
      var meta = human(item.kind || item.type || item.entry || "");
      if (item.exposure) meta += " · " + human(item.exposure);
      if (synthetic) meta += " · synthetic overlay";
      return '<button type="button" class="' + PX + '-hit" data-act="' + act + '" data-id="' + esc(dataId) +
        '" data-row-id="' + esc(settingId || item.id) + '"' +
        (resultId ? ' data-result-id="' + esc(resultId) + '"' : "") +
        (synthetic ? ' data-synthetic="1"' : "") + "><b>" + esc(item.label) +
        "</b><span class='path'>" + esc(item.path || "") + "</span><span class='meta'>" + esc(meta) + "</span></button>";
    });
  }

  function bind(app, root) {
    var search = root.querySelector("[data-search]");
    if (search) {
      search.oninput = function () {
        keepSearchFocus = true;
        searchCaret = search.selectionStart;
        app.setQuery(search.value);
        if (app.results && app.results.length) app.selectedResultId = app.results[0].id;
      };
      search.onkeydown = function (ev) {
        var list = app.results || [];
        if (ev.key === "Escape") return;
        if (!list.length) return;
        var ids = list.map(function (x) { return x.id; });
        var at = Math.max(0, ids.indexOf(app.selectedResultId));
        if (ev.key === "ArrowDown") {
          ev.preventDefault();
          keepSearchFocus = true;
          searchCaret = search.selectionStart;
          app.selectedResultId = ids[Math.min(ids.length - 1, at + 1)];
          app.searchOpen = true;
          app.paint();
        } else if (ev.key === "ArrowUp") {
          ev.preventDefault();
          keepSearchFocus = true;
          searchCaret = search.selectionStart;
          app.selectedResultId = ids[Math.max(0, at - 1)];
          app.searchOpen = true;
          app.paint();
        } else if (ev.key === "Enter") {
          ev.preventDefault();
          if (app.selectedResultId) app.pickResult(app.selectedResultId);
        }
      };
    }
    function handleAct(el, fromChange) {
      var act = el.getAttribute("data-act");
      var id = el.getAttribute("data-id");
      if (act === "back") app.back();
      else if (act === "close") app.closeSettings();
      else if (act === "states") { app.statesOpen = !app.statesOpen; app.paint(); }
      else if (act === "state") app.triggerState(id);
      else if (act === "domain") { narrowPane = "sheet"; app.openDomain(id); }
      else if (act === "page") { app.openPage(app.route.domain, id); }
      else if (act === "manager") { narrowPane = "roster"; app.openManager(id); }
      else if (act === "object") { narrowPane = "sheet"; app.openManager(app.route.manager, { object: id, page: app.route.page }); }
      else if (act === "mtab") app.openManager(app.route.manager, { object: app.route.object, page: id });
      else if (act === "deferred") app.openDeferred(id);
      else if (act === "all") { narrowPane = "facets"; app.openAll(); }
      else if (act === "copy") app.openCopy();
      else if (act === "pick") app.pickResult(id);
      else if (act === "row") {
        var resultId = el.getAttribute("data-result-id") || "";
        if (String(id).indexOf("synthetic") === 0 || String(resultId).indexOf("synthetic") === 0) {
          app.receipt("Synthetic overlay is labeled and excluded from product inventory search by default.", "info");
          return;
        }
        if (resultId.indexOf("setting:") === 0) {
          if (app.routeSettingRow) app.routeSettingRow(id);
          else app.pickResult(resultId);
        } else if (resultId) {
          app.pickResult(resultId);
        } else if (app.routeSettingRow) {
          app.routeSettingRow(id);
        } else {
          app.pickResult("setting:" + id);
        }
      } else if (act === "toggle") {
        var cur = app.controlModel(id);
        app.setValue(id, !(cur && cur.value));
      } else if (act === "select") app.setValue(id, el.value);
      else if (act === "number") app.setValue(id, Number(el.value));
      else if (act === "text") app.setValue(id, el.value);
      else if (act === "do") app.receipt("Ran " + id + " for this project.", "info");
      else if (act === "why") app.openDetails(id);
      else if (act === "details-close") app.closeDetails();
      else if (act === "install-official" || act === "confirm-official") {
        cliProviderId = id || cliProviderId || "local-ollama";
        if (!runOfficialCli(app, cliProviderId)) {
          app.work = { title: "Install from official source", human_phase: "Waiting for explicit Install confirmation", state: "waiting_user", wait_reason: "Official source confirmation", progress_kind: "none", progress_source: "user consent", last_known_good: true, message: "Not bundled. Not silently installed. Unknown owner stays manual-only. Sign-in is a separate step." };
          app.receipt("Install starts only after you confirm the official source.", "info");
          app.paint();
        }
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
      else if (act === "facet-domain") { ensureFacets(app).domain = id || ""; app.paint(); }
      else if (act === "facet-kind") { ensureFacets(app).kind = id || ""; app.paint(); }
      else if (act === "facet-exposure") { ensureFacets(app).exposure = id || ""; app.paint(); }
      else if (act === "facet-state") { ensureFacets(app).state = id || ""; app.paint(); }
      else if (act === "facet-entry") { ensureFacets(app).entry = id || ""; app.paint(); }
      else if (act === "facet-changed") { ensureFacets(app).changed = !ensureFacets(app).changed; app.paint(); }
      else if (act === "facet-attention") { ensureFacets(app).attention = !ensureFacets(app).attention; app.paint(); }
      else if (act === "facet-synth") {
        ensureFacets(app).synthetic = !ensureFacets(app).synthetic;
        app.receipt("Synthetic overlay is labeled and excluded from product inventory search by default.", "info");
        app.paint();
      } else if (act === "facet-clear") {
        app.allFacets = defaultAllFacets();
        app.paint();
      }
      fromChange = fromChange;
    }
    root.onclick = function (ev) {
      var el = ev.target.closest("[data-act]");
      if (!el) return;
      var act = el.getAttribute("data-act");
      if (act === "select" || act === "number" || act === "text" || act === "copy-cat") return;
      handleAct(el, false);
    };
    root.onchange = function (ev) {
      var el = ev.target.closest("[data-act]");
      if (!el) return;
      handleAct(el, true);
    };
  }

  function restoreSearchFocus(root) {
    if (!keepSearchFocus) return;
    var searchEl = root.querySelector("[data-search]");
    if (!searchEl) return;
    searchEl.focus();
    try {
      var pos = searchCaret == null ? searchEl.value.length : searchCaret;
      searchEl.setSelectionRange(pos, pos);
    } catch (e) {}
  }

  function render(app) {
    var root = document.getElementById(ROOT_ID);
    if (virt && virt.dispose) virt.dispose();
    var active = document.activeElement;
    var restoreSearch = Boolean(active && active.getAttribute && active.getAttribute("data-search") != null);
    var caret = restoreSearch && typeof active.selectionStart === "number" ? active.selectionStart : searchCaret;
    root.className = PX;
    root.setAttribute("data-layout", "directory-take-2");
    root.setAttribute("data-route", (app.route && app.route.name) || "home");
    root.setAttribute("data-dir", app._navDir || "fwd");
    var pane = (app.route && app.route.name === "manager" && !(app.route.object) ? "roster" : narrowPane);
    if (app.detailsId) pane = "details";
    root.setAttribute("data-pane", pane);
    root.innerHTML = chrome(app) + '<div class="' + PX + '-body">' + view(app) + detailsDrawer(app) + "</div>";
    bind(app, root);
    fillAll(app, root);
    if (restoreSearch) {
      keepSearchFocus = true;
      searchCaret = caret;
      restoreSearchFocus(root);
    } else {
      keepSearchFocus = false;
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (window.PMShell) window.PMShell.init();
    var app = window.PMv2.createApp({ namespace: "c06", root: document.getElementById(ROOT_ID), render: render });
    app.allFacets = defaultAllFacets();
    var baseEscape = app.handleEscape;
    app.handleEscape = function () {
      if (window.PMv2 && window.PMv2.popupOpen && window.PMv2.popupOpen._el) {
        if (typeof app.closePopup === "function") app.closePopup();
        else if (window.PMv2.popupClose) window.PMv2.popupClose();
        return;
      }
      if (app.detailsId) { app.closeDetails(); return; }
      if (narrowPane === "facets") {
        narrowPane = "sheet";
        app.paint();
        return;
      }
      if (app.route && app.route.name === "manager" && app.route.object && narrowPane !== "roster") {
        narrowPane = "roster";
        app.paint();
        return;
      }
      if (app.statesOpen) { app.statesOpen = false; app.paint(); return; }
      if (app.searchOpen) { app.searchOpen = false; app.paint(); return; }
      if (facetsActive(ensureFacets(app))) { app.allFacets = defaultAllFacets(); app.paint(); return; }
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
