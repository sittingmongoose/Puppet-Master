(function () {
  "use strict";
  var PX = "d1";
  var LAYOUT = "directory-take-1";
  var ROOT_ID = "d1-root";
  var PAGE_CHUNK = 8;
  var esc = window.PMv2.esc;
  var virt = null;
  var showMore = {};
  var restoreFocus = null;
  var SETTING_KINDS = ["action", "keyvalue", "list", "multiselect", "number", "path", "radio", "select", "slider", "text", "toggle"];
  var EXTRA_RESULT_IDS = [
    "action:copy-from-project",
    "action:open-all-settings",
    "action:retry-default-account",
    "workflow:provider-cli-setup",
    "diagnostic:usage-stale",
    "help:copy-policy"
  ];

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
    var id = (app && app._officialProviderId) || officialProviderId(app, providerId);
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
  function confirmOfficialControls(app) {
    if (!awaitingOfficial(app)) return "";
    var id = (app && app._officialProviderId) || officialProviderId(app);
    var reason = (app.work && app.work.wait_reason) ? '<p class="' + PX + '-muted">' + esc(app.work.wait_reason) + "</p>" : "";
    return reason + '<p><button type="button" data-act="confirm-official" data-id="' + esc(id) + '">Confirm official source</button></p>';
  }
  function identityBlock(row) {
    return window.PMv2.identityBlock(row, PX);
  }
  function flipHeading(kicker, title, flipId) {
    return '<div data-flip-target' + (flipId ? '="' + esc(flipId) + '"' : "") + '>' +
      '<p class="' + PX + '-kicker">' + kicker + "</p>" +
      '<h1 class="' + PX + '-h1">' + title + "</h1>" +
      "</div>";
  }
  function humanAvail(a) {
    if (!a || a === "ready") return "";
    return String(a).replace(/_/g, " ");
  }
  function fmtCopyVal(v) {
    if (v == null || v === "") return "—";
    if (typeof v === "boolean") return v ? "On" : "Off";
    if (Array.isArray(v)) return v.length ? v.join(", ") : "None";
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
    if (prev.name === "deferred") {
      var d = (app.deferred || []).filter(function (x) { return x.id === prev.deferred; })[0];
      return "Back to " + ((d && d.title) || "Owner module");
    }
    return "Back";
  }

  function chrome(app) {
    var q = esc(app.query || "");
    var drop = "";
    if (app.searchOpen) {
      var hits = (app.results || []);
      if (!hits.length && app.query) {
        drop = '<div class="' + PX + '-drop pmv2-scroll" data-search-drop data-hit-class="' + PX + '-hit" role="listbox" id="d1-drop"><div class="' + PX + '-hit">No matching settings</div></div>';
      } else if (hits.length) {
        var selected = app.selectedResultId;
        if (!hits.some(function (h) { return h.id === selected; })) selected = hits[0].id;
        drop = '<div class="' + PX + '-drop pmv2-scroll" data-search-drop data-hit-class="' + PX + '-hit" role="listbox" id="d1-drop">' + groupHits(hits).map(function (g) {
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
      return '<button type="button" class="' + PX + '-card" data-act="domain" data-id="' + esc(c.id) + '" data-row-id="' + esc(c.id) + '" data-flip-id="' + esc(c.id) + '">' + ico() + "<strong>" + esc(c.title) + "</strong><span>" + esc(c.description) + "</span></button>";
    }).join("") + "</div>";
    return '<div class="' + PX + "-home " + PX + '-scroll pmv2-scroll ' + (app._motionPlay ? (PX + '-expand') : '') + '">' +
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
      synthetic: false
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
    return f;
  }
  function facetsActive(f) {
    if (!f) return false;
    return !!(f.domain || f.kind || f.exposure || f.state || f.entry || f.changed || f.attention || f.synthetic);
  }
  function settingExposure(s) {
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
  function itemState(app, settingId, availability) {
    if (settingId && app && typeof app.controlModel === "function") {
      var model = app.controlModel(settingId);
      if (model) {
        if (model.originKind === "policy") return "managed";
        if (model.originKind === "unavailable") return "unavailable";
        if (model.disabled && /managed/i.test(model.reason || "")) return "managed";
        if (model.disabled && /unavailable/i.test(model.reason || "")) return "unavailable";
      }
    }
    return mapAvailability(availability);
  }
  function entryOfType(type) {
    var t = String(type || "setting");
    if (t === "setup_or_repair_workflow" || t === "workflow") return "workflow";
    if (t === "diagnostic_or_read_only_status" || t === "diagnostic" || t === "intentional_help_result") return "diagnostic";
    if (t === "manager" || t === "managed_object") return "manager";
    if (t === "action") return "action";
    if (t === "unavailable_capability") return "diagnostic";
    return "setting";
  }
  function itemAttention(app, item) {
    var list = (app && app.attention) || [];
    var i, d, rid, model;
    rid = String(item.resultId || item.id || "");
    for (i = 0; i < list.length; i++) {
      d = String(list[i].destId || "");
      if (!d) continue;
      if (rid === d || String(item.id) === d) return true;
      if (rid.indexOf(d) === 0 || d.indexOf(rid) === 0) return true;
    }
    if (item.settingId || (item.entry === "setting" && String(item.id).indexOf(":") === -1)) {
      model = app.controlModel(item.settingId || item.id);
      if (model && model.disabled) return true;
    }
    return false;
  }
  function kindOptions() {
    var seen = {};
    var out = [];
    var list = (window.PMv2 && window.PMv2.inventory && window.PMv2.inventory.settings) || [];
    var i, t;
    for (i = 0; i < list.length; i++) {
      t = list[i].type || "setting";
      if (!seen[t]) { seen[t] = 1; out.push(t); }
    }
    if (!out.length) out = SETTING_KINDS.slice();
    out.sort();
    return out;
  }
  function getResult(id) {
    if (window.PMv2 && typeof window.PMv2.getResult === "function") return window.PMv2.getResult(id);
    return null;
  }
  function matchesFacets(app, f, item) {
    if (f.domain && item.domain !== f.domain) return false;
    if (f.kind && item.kind !== f.kind) return false;
    if (f.exposure && item.exposure !== f.exposure) return false;
    if (f.state && item.state !== f.state) return false;
    if (f.entry && item.entry !== f.entry) return false;
    if (f.changed && !item.changed) return false;
    if (f.attention && !itemAttention(app, item)) return false;
    return true;
  }
  function filterAllSettingsLocal(app, facets) {
    var f = facets || ensureFacets(app);
    var items = [];
    var inv = (window.PMv2 && window.PMv2.inventory && window.PMv2.inventory.settings) || [];
    var i, s, cat, model, item, m, objs, o, d, extra, e, n, label;
    for (i = 0; i < inv.length; i++) {
      s = inv[i];
      cat = app.cat(s.id.split(".")[0]);
      model = app.controlModel(s.id);
      item = {
        id: s.id,
        resultId: "setting:" + s.id,
        settingId: s.id,
        label: s.label,
        path: (cat && cat.title) || s.id.split(".")[0],
        type: s.type,
        kind: s.type,
        entry: "setting",
        domain: s.id.split(".")[0],
        exposure: settingExposure(s),
        state: itemState(app, s.id, "ready"),
        changed: !!(model && model.changed),
        synthetic: false
      };
      if (matchesFacets(app, f, item)) items.push(item);
    }
    (app.managers || (window.PMv2 && window.PMv2.managers) || []).forEach(function (mgr) {
      m = mgr;
      extra = getResult("manager:" + m.id);
      item = {
        id: "manager:" + m.id,
        resultId: "manager:" + m.id,
        label: (extra && extra.label) || m.title,
        path: (extra && extra.path) || ((app.cat(m.domain) || {}).title || m.domain),
        type: "manager",
        kind: "",
        entry: "manager",
        domain: m.domain,
        exposure: "basic",
        state: mapAvailability((extra && extra.availability) || "ready"),
        changed: false,
        synthetic: false
      };
      if (matchesFacets(app, f, item)) items.push(item);
      objs = app.objectsFor ? app.objectsFor(m.id) : [];
      for (i = 0; i < objs.length; i++) {
        o = objs[i];
        extra = getResult("object:" + m.id + ":" + o.id);
        item = {
          id: "object:" + m.id + ":" + o.id,
          resultId: "object:" + m.id + ":" + o.id,
          label: (extra && extra.label) || o.label,
          path: (extra && extra.path) || (m.title + " / " + o.label),
          type: "managed_object",
          kind: o.kind || "",
          entry: "manager",
          domain: m.domain,
          exposure: "basic",
          state: mapAvailability(o.availability || (extra && extra.availability) || "ready"),
          changed: false,
          synthetic: false
        };
        if (matchesFacets(app, f, item)) items.push(item);
      }
    });
    (app.deferred || []).forEach(function (def) {
      d = def;
      extra = getResult("unavailable:" + d.id);
      item = {
        id: "unavailable:" + d.id,
        resultId: extra ? extra.id : ("unavailable:" + d.id),
        label: d.title,
        path: (extra && extra.path) || "System & Advanced",
        type: "unavailable_capability",
        kind: "",
        entry: "diagnostic",
        domain: d.domain || "system",
        exposure: "hidden",
        state: "unavailable",
        changed: false,
        synthetic: false
      };
      if (matchesFacets(app, f, item)) items.push(item);
    });
    for (i = 0; i < EXTRA_RESULT_IDS.length; i++) {
      extra = getResult(EXTRA_RESULT_IDS[i]);
      e = extra || {
        id: EXTRA_RESULT_IDS[i],
        label: EXTRA_RESULT_IDS[i],
        type: EXTRA_RESULT_IDS[i].split(":")[0],
        path: "Settings",
        availability: "ready"
      };
      item = {
        id: e.id,
        resultId: e.id,
        label: e.label,
        path: e.path || "Settings",
        type: e.type,
        kind: "",
        entry: entryOfType(e.type),
        domain: (e.dest && e.dest.domain) || "",
        exposure: entryOfType(e.type) === "diagnostic" ? "hidden" : (entryOfType(e.type) === "setting" ? "basic" : "advanced"),
        state: mapAvailability(e.availability),
        changed: false,
        synthetic: false
      };
      if (matchesFacets(app, f, item)) items.push(item);
    }
    if (f.synthetic) {
      n = (app && app.syntheticCount) || 2000;
      for (i = 0; i < n; i++) {
        label = "Synthetic scale row " + i;
        item = {
          id: "synthetic:stress-" + i,
          resultId: "synthetic:stress-" + i,
          label: label,
          path: "Synthetic overlay",
          type: "setting",
          kind: "",
          entry: "setting",
          domain: "",
          exposure: "basic",
          state: "ready",
          changed: false,
          synthetic: true
        };
        if (matchesFacets(app, f, item)) items.push(item);
      }
    }
    return items;
  }
  function facetGroup(title, html) {
    return "<h2>" + esc(title) + '</h2><div class="' + PX + '-facetlist">' + html + "</div>";
  }
  function toggleBtn(act, on, title) {
    return destBtn(act, "", false, title, "", on ? ' aria-pressed="true"' : ' aria-pressed="false"');
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
      flipHeading(esc(c.title), esc(pageTitle), c.id) +
      '<p class="' + PX + '-lede">' + esc(c.description) + "</p>" +
      workBox(app) +
      "<h2>Settings for this project</h2>" +
      settingBlock(app, rows, c.id + "." + page) +
      "</div>";
    return '<div class="' + PX + '-dir">' + side + main + "</div>";
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
    extra += confirmOfficialControls(app);
    if (page === "installations") {
      extra += "<h2>Installations</h2>" + (app.installs || []).filter(function (i) {
        return i.provider === obj.id;
      }).map(function (i) {
        var unknown = i.manualOnly || i.owner === "unknown";
        return '<div class="' + PX + '-step" data-row-id="' + esc(i.id) + '"><strong>' + esc(i.label) + "</strong>" +
          '<div class="' + PX + '-muted">' + esc(i.host) + (unknown ? " · Unknown owner — manual only" : "") + "</div>" +
          identityBlock(i) +
          "</div>";
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
    return flipHeading("Provider", esc(obj.label)) +
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
      detail = flipHeading(esc((app.cat(m.domain) || {}).title || "Manager"), esc(m.title)) + '<p class="' + PX + '-lede">' + esc(m.purpose) + "</p>" +
        '<div class="' + PX + '-health">' +
        '<div class="' + PX + '-check" data-row-id="' + esc(obj ? obj.id : m.id) + '">Last known good — cached projection</div>' +
        '<div class="' + PX + '-check">Repair opens the owner check, not a fabricated backend.</div>' +
        "</div>";
    } else if (type === "setup-sequence") {
      detail = flipHeading(esc((app.cat(m.domain) || {}).title || "Manager"), esc(m.title)) + '<p class="' + PX + '-lede">' + esc(m.purpose) + "</p>" +
        '<div class="' + PX + '-steps">' +
        '<div class="' + PX + '-step">1. Review current state</div>' +
        '<div class="' + PX + '-step">2. Confirm the official source or restore point</div>' +
        '<div class="' + PX + '-step">3. Apply once — this project only</div>' +
        "</div>";
    } else if (type === "preview-transaction") {
      detail = flipHeading(esc((app.cat(m.domain) || {}).title || "Manager"), esc(m.title)) + '<p class="' + PX + '-lede">' + esc(m.purpose) + "</p>" +
        "<p>Import, export, reset, and migration preview here. Copy from another project is a separate one-time flow.</p>" +
        '<p><button type="button" data-act="copy">Open copy preview</button></p>';
    } else if (type === "inventory-catalog") {
      detail = flipHeading(esc((app.cat(m.domain) || {}).title || "Manager"), esc(m.title)) + '<p class="' + PX + '-lede">' + esc(m.purpose) + "</p>" +
        (obj ? '<div class="' + PX + '-step" data-row-id="' + esc(obj.id) + '"><strong>' + esc(obj.label) + "</strong> · " + esc(humanType(obj.kind)) + "</div>" : "");
    } else {
      detail = flipHeading(esc((app.cat(m.domain) || {}).title || "Manager"), esc(m.title)) + '<p class="' + PX + '-lede">' + esc(m.purpose) + "</p>" +
        (obj ? '<div data-row-id="' + esc(obj.id) + '"><strong>' + esc(obj.label) + "</strong> · " + esc(humanType(obj.kind)) + "</div>" : "");
    }
    var side = '<aside class="' + PX + '-destcol pmv2-scroll"><h2>Sections</h2>' + tabNav +
      (roster ? "<h2>In this manager</h2>" + roster : "") + "</aside>";
    var main = '<div class="' + PX + "-workspace " + PX + '-scroll pmv2-scroll">' + workBox(app) + detail +
      "<h2>Related project settings</h2>" + related.map(function (s) { return control(app, s.id); }).join("") +
      "</div>";
    return '<div class="' + PX + '-dir">' + side + main + "</div>";
  }

  function allSettings(app) {
    var f = ensureFacets(app);
    var kinds = kindOptions();
    var catBtns = destBtn("facet-domain", "", !f.domain, "All domains", app.productSettingCount + " product settings") +
      (app.categories || []).map(function (c) {
        return destBtn("facet-domain", c.id, f.domain === c.id, c.title, "");
      }).join("");
    var kindBtns = destBtn("facet-kind", "", !f.kind, "All kinds", "Type") +
      kinds.map(function (k) {
        return destBtn("facet-kind", k, f.kind === k, humanType(k), "");
      }).join("");
    var expBtns = destBtn("facet-exposure", "", !f.exposure, "All", "") +
      destBtn("facet-exposure", "basic", f.exposure === "basic", "Basic", "") +
      destBtn("facet-exposure", "advanced", f.exposure === "advanced", "Advanced", "") +
      destBtn("facet-exposure", "hidden", f.exposure === "hidden", "Hidden", "");
    var stateBtns = destBtn("facet-state", "", !f.state, "All", "") +
      destBtn("facet-state", "ready", f.state === "ready", "Ready", "") +
      destBtn("facet-state", "managed", f.state === "managed", "Managed", "") +
      destBtn("facet-state", "unavailable", f.state === "unavailable", "Unavailable", "");
    var entryBtns = destBtn("facet-entry", "", !f.entry, "All", "") +
      destBtn("facet-entry", "setting", f.entry === "setting", "Setting", "") +
      destBtn("facet-entry", "action", f.entry === "action", "Action", "") +
      destBtn("facet-entry", "manager", f.entry === "manager", "Manager", "") +
      destBtn("facet-entry", "workflow", f.entry === "workflow", "Workflow", "") +
      destBtn("facet-entry", "diagnostic", f.entry === "diagnostic", "Diagnostic", "");
    var projBtns = toggleBtn("facet-changed", f.changed, "Changed from default") +
      toggleBtn("facet-attention", f.attention, "Needs attention") +
      toggleBtn("facet-synth", f.synthetic, "Include synthetic overlay") +
      destBtn("facet-clear", "", false, "Clear filters", "");
    var facets = '<aside class="' + PX + '-facets pmv2-scroll">' +
      facetGroup("Category", catBtns) +
      facetGroup("Kind", kindBtns) +
      facetGroup("Exposure", expBtns) +
      facetGroup("Availability", stateBtns) +
      facetGroup("Entry", entryBtns) +
      facetGroup("This project", projBtns) +
      "</aside>";
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
      (r.restorePointId ? factRow("Restore point id", r.restorePointId) : "") +
      factRow("Verified", r.verified ? "Yes" : "No") +
      factRow("Counts", "Additions " + (c.additions || 0) + " · Replacements " + (c.replacements || 0) + " · Unchanged " + (c.unchanged || 0) + " · Unavailable " + (c.unavailable || 0) + " · Conflicts " + (c.conflicts || 0)) +
      factRow("Backend", (r.backend || "RuntimeResourceGovernor+projectStore")) +
      "</div>" +
      '<p class="' + PX + '-muted">RuntimeResourceGovernor admits this copy. Project store persists this project only.</p>';
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
      factRow("Backend", (d.backend || "projectStore")) +
      "</div>" + detailsInstallIdentity(app) + "</aside>";
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
    return '<div class="' + PX + "-copy " + PX + '-scroll pmv2-scroll">' +
      flipHeading("One-time copy", "Copy Settings From Another Project") +
      "<p>Copies into <strong>" + esc(app.project.name) + "</strong>. No ongoing sync.</p>" +
      "<h2>1. Source project</h2><div class='" + PX + "-copy-src'>" + srcs + "</div>" +
      "<h2>2. Categories</h2><div class='" + PX + "-copy-cats'>" + cats + "</div>" +
      "<h2>3. Preview</h2>" + prev +
      window.PMv2.copyTransactionHtml(app, PX) + actions + workBox(app) +
      "</div>";
  }

  function deferredView(app) {
    var d = (app.deferred || []).filter(function (x) { return x.id === app.route.deferred; })[0];
    if (!d) return "<div>Unknown owner module</div>";
    return '<div class="' + PX + "-workspace " + PX + '-scroll pmv2-scroll">' +
      flipHeading("Named owner", esc(d.title)) +
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
    var f = ensureFacets(app);
    var facets = {
      domain: f.domain,
      kind: f.kind,
      exposure: f.exposure,
      changed: f.changed,
      state: f.state,
      entry: f.entry,
      attention: f.attention,
      synthetic: f.synthetic
    };
    var items;
    if (window.PMv2 && typeof window.PMv2.filterAllSettings === "function") {
      items = window.PMv2.filterAllSettings(app, facets);
    } else {
      items = filterAllSettingsLocal(app, facets);
    }
    virt = window.PMv2.virtualList(host, items, 52, function (item) {
      var meta = humanType(item.kind || item.type || item.entry);
      if (item.synthetic) meta = meta ? meta + " · synthetic overlay" : "synthetic overlay";
      return '<button type="button" class="' + PX + '-hit" data-act="row" data-id="' + esc(item.id) + '" data-row-id="' + esc(item.id) + '"' +
        (item.resultId ? ' data-result-id="' + esc(item.resultId) + '"' : "") +
        (item.synthetic ? ' data-synthetic="1"' : "") +
        "><b>" + esc(item.label) + "</b><span class='path'>" + esc(item.path) + "</span><span class='meta'>" + esc(meta) + "</span></button>";
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
        var resultId = el.getAttribute("data-result-id") || "";
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
      }
      else if (act === "facet" || act === "facet-domain") { ensureFacets(app).domain = id || ""; app.paint(); }
      else if (act === "facet-kind") { ensureFacets(app).kind = id || ""; app.paint(); }
      else if (act === "facet-exposure") { ensureFacets(app).exposure = id || ""; app.paint(); }
      else if (act === "facet-state") { ensureFacets(app).state = id || ""; app.paint(); }
      else if (act === "facet-entry") { ensureFacets(app).entry = id || ""; app.paint(); }
      else if (act === "facet-changed") { ensureFacets(app).changed = !ensureFacets(app).changed; app.paint(); }
      else if (act === "facet-attention") { ensureFacets(app).attention = !ensureFacets(app).attention; app.paint(); }
      else if (act === "facet-synth" || act === "synth") {
        ensureFacets(app).synthetic = !ensureFacets(app).synthetic;
        app.receipt("Synthetic overlay is labeled and excluded from product inventory search by default.", "info");
        app.paint();
      } else if (act === "facet-clear") { app.allFacets = defaultAllFacets(); app.paint(); }
      else if (act === "more") { showMore[id] = !showMore[id]; app.paint(); }
      else if (act === "toggle") {
        var cur = app.controlModel(id);
        app.setValue(id, !(cur && cur.value));
      } else if (act === "do") app.receipt("Ran " + id + " for this project.", "info");
      else if (act === "why") app.openDetails(id);
      else if (act === "details-close") app.closeDetails();
      else if (act === "install-official") {
        installOfficial(app, id || "local-ollama");
      } else if (act === "confirm-official") {
        confirmOfficial(app, (app && app._officialProviderId) || id || "local-ollama");
      } else if (act === "usage-refresh") {
        app.work = { title: "Refresh usage", human_phase: "Refreshing", state: "running", progress_kind: "indeterminate", progress_source: "usage", last_known_good: true, message: "Cached usage stays visible." };
        app.receipt("Usage refresh requested for this project.", "info");
        app.paint();
      } else if (act === "copy-src") { app.copy.sourceId = id; app.copy.step = "preview"; app.paint(); }
      else if (act === "copy-apply") app.applyCopy();
      else if (act === "copy-rollback") app.rollbackCopy();
    };
  }

  function render(app) {
    var root = document.getElementById(ROOT_ID);
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
      if (facetsActive(app.allFacets)) { app.allFacets = defaultAllFacets(); app.paint(); return; }
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
