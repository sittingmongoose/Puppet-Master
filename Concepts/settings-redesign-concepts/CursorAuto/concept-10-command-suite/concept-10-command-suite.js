(function () {
  "use strict";
  var PX = "cs";
  var ROOT_ID = "cs-root";
  var esc = window.PMv2.esc;
  var virt = null;
  var lastDir = "fwd";
  var lastStackLen = 0;
  var facet = { domain: "", kind: "", exposure: "", state: "", entry: "", attention: false, changed: false, synth: false };

  function searchIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor"/><path d="m20 20-3.5-3.5" fill="none" stroke="currentColor"/></svg>';
  }

  function humanAvail(raw) {
    var v = String(raw || "ready").toLowerCase();
    if (v === "ready") return { label: "Ready", state: "ready" };
    if (v === "setup_required") return { label: "Needs setup", state: "warn" };
    if (v === "reconnect_required") return { label: "Reconnect needed", state: "warn" };
    if (v === "managed") return { label: "Managed by policy", state: "info" };
    if (v === "offline") return { label: "Offline", state: "warn" };
    if (v === "unavailable") return { label: "Unavailable", state: "danger" };
    if (v === "shadowed") return { label: "Shadowed", state: "info" };
    if (v === "changed") return { label: "Changed in this project", state: "info" };
    return { label: v.replace(/_/g, " "), state: "info" };
  }



  function defaultFacets() {
    return { domain: "", kind: "", exposure: "", state: "", entry: "", attention: false, changed: false, synth: false, synthetic: false };
  }

  function ensureFacets(app) {
    var src = (app && app.allFacets) || facet || defaultFacets();
    var next = {
      domain: src.domain || "",
      kind: src.kind || src.type || "",
      exposure: src.exposure || "",
      state: src.state || "",
      entry: src.entry || "",
      attention: !!(src.attention),
      changed: !!(src.changed),
      synth: !!(src.synth || src.synthetic),
      synthetic: !!(src.synth || src.synthetic)
    };
    facet = next;
    if (app) app.allFacets = next;
    return next;
  }

  function setFacet(app, key, value) {
    var f = ensureFacets(app);
    f[key] = value;
    if (key === "synth" || key === "synthetic") {
      f.synth = !!value;
      f.synthetic = !!value;
    }
    facet = f;
    if (app) app.allFacets = f;
    return f;
  }

  function cmdFacet(act, id, on, title, hint) {
    return '<button type="button" class="' + PX + '-cmd" data-act="' + act + '"' +
      (id != null ? ' data-id="' + esc(id) + '"' : "") +
      ' aria-current="' + (on ? "true" : "false") + '"' +
      (act === "facet-changed" || act === "facet-attention" || act === "synth" ? ' aria-pressed="' + (on ? "true" : "false") + '"' : "") +
      ">" + esc(title) + (hint ? "<small>" + esc(hint) + "</small>" : "") + "</button>";
  }

  function kindOf(item) {
    if (!item) return "setting";
    return String(item.kind || item.type || "setting").toLowerCase();
  }

  function humanKind(k) {
    var map = {
      toggle: "On/off",
      select: "Choice",
      slider: "Slider",
      number: "Number",
      action: "Action",
      radio: "Radio",
      list: "List",
      multiselect: "Multi-select",
      keyvalue: "Key/value",
      text: "Text",
      path: "Path"
    };
    return map[k] || humanType(k);
  }

  function exposureOf(item) {
    if (!item) return "basic";
    if (item.exposure) {
      var e = String(item.exposure).toLowerCase();
      if (e === "standard" || e === "managed" || e === "unavailable") return "basic";
      if (e === "advanced") return "advanced";
      if (e === "expert" || e === "diagnostic" || e === "hidden") return "hidden";
      return e;
    }
    if (item.type === "action") return "hidden";
    if (item.tier === "advanced") return "advanced";
    return "basic";
  }

  function entryOf(item) {
    var t = String((item && (item.entry || item.type)) || "setting").toLowerCase();
    if (t === "manager" || t === "managed_object" || t === "object" || t === "resource") return "manager";
    if (t === "action") return "action";
    if (t === "setup_or_repair_workflow" || t === "workflow") return "workflow";
    if (t === "diagnostic_or_read_only_status" || t === "diagnostic") return "diagnostic";
    if (t === "unavailable_capability" || t === "deferred") return "manager";
    return "setting";
  }

  function domainOf(item) {
    if (item && item.domain) return item.domain;
    var id = String((item && item.id) || "");
    if (id.indexOf("setting:") === 0) id = id.slice(8);
    if (id.indexOf(":") !== -1) return "";
    return id.split(".")[0] || "";
  }

  function stateOf(app, item) {
    if (!item) return "ready";
    var raw = String(item.state || item.availability || "").toLowerCase();
    if (raw === "managed") return "managed";
    if (raw === "unavailable" || raw === "offline" || raw === "setup_required") return "unavailable";
    var sid = item.settingId || item.id;
    var m = sid && String(sid).indexOf(":") === -1 ? app.controlModel(sid) : null;
    if (m) {
      if (m.originKind === "policy") return "managed";
      if (m.originKind === "unavailable" || m.disabled) return "unavailable";
    }
    if (raw && raw !== "ready" && raw !== "changed") return "unavailable";
    return "ready";
  }

  function isAttentionItem(app, item) {
    var list = app.attention || [];
    var id = String((item && item.id) || "");
    var rid = String((item && item.resultId) || "");
    var i, dest;
    for (i = 0; i < list.length; i++) {
      dest = String(list[i].destId || "");
      if (!dest) continue;
      if (id === dest || rid === dest) return true;
      if (dest.indexOf(id) !== -1 || (rid && dest.indexOf(rid) !== -1)) return true;
    }
    var st = stateOf(app, item);
    if (st === "unavailable" || st === "managed") return true;
    var av = String((item && item.availability) || "");
    if (av && av !== "ready" && av !== "changed") return true;
    return false;
  }

  function mapSettingItem(app, s) {
    var cat = app.cat((s.id || "").split(".")[0]);
    return {
      id: s.id,
      settingId: s.id,
      label: s.label,
      path: cat ? cat.title : (s.id || "").split(".")[0],
      type: s.type,
      kind: kindOf(s),
      exposure: exposureOf(s),
      entry: "setting",
      domain: (s.id || "").split(".")[0],
      availability: s.availability,
      tier: s.tier,
      synthetic: !!(s.synthetic || String(s.id).indexOf("synthetic:") === 0)
    };
  }

  function extraIndexItems(app) {
    var ids = [];
    (app.managers || []).forEach(function (m) { ids.push("manager:" + m.id); });
    (app.deferred || []).forEach(function (d) { ids.push("unavailable:" + d.id); });
    ids.push("action:copy-from-project", "action:open-all-settings", "action:retry-default-account", "workflow:provider-cli-setup", "diagnostic:usage-stale");
    var out = [];
    var seen = {};
    ids.forEach(function (id) {
      if (seen[id]) return;
      seen[id] = 1;
      var hit = app.getResult ? app.getResult(id) : (window.PMv2 && window.PMv2.getResult && window.PMv2.getResult(id));
      if (!hit) return;
      var mgr = id.indexOf("manager:") === 0 ? app.mgr(id.slice(8)) : null;
      out.push({
        id: hit.settingId || hit.id,
        resultId: hit.id,
        label: hit.label,
        path: hit.path,
        type: hit.type,
        kind: kindOf(hit),
        exposure: exposureOf(hit),
        entry: entryOf(hit),
        domain: (mgr && mgr.domain) || (hit.dest && hit.dest.domain) || "",
        availability: hit.availability,
        synthetic: !!hit.synthetic
      });
    });
    return out;
  }

  function matchesFacets(app, f, item) {
    if (!f.synth && (item.synthetic || String(item.id).indexOf("synthetic:") === 0 || String(item.id).indexOf("stress-") === 0)) return false;
    if (f.domain) {
      var dom = domainOf(item);
      if (dom && dom !== f.domain) return false;
      if (!dom) return false;
    }
    if (f.kind && kindOf(item) !== f.kind) return false;
    if (f.exposure && exposureOf(item) !== f.exposure) return false;
    if (f.state && stateOf(app, item) !== f.state) return false;
    if (f.entry && entryOf(item) !== f.entry) return false;
    if (!f.entry && entryOf(item) !== "setting") {
      var keepExtra = (f.attention && isAttentionItem(app, item)) ||
        (f.state === "managed" || f.state === "unavailable") ||
        (f.kind && kindOf(item) === f.kind);
      if (!keepExtra) return false;
    }
    if (f.changed) {
      var m = app.controlModel(item.settingId || item.id);
      if (!m || !m.changed) return false;
    }
    if (f.attention && !isAttentionItem(app, item)) return false;
    return true;
  }

  function fmtCopyVal(v) {
    if (v == null || v === "") return "—";
    if (typeof v === "boolean") return v ? "On" : "Off";
    if (Array.isArray(v)) return v.join(", ");
    return String(v);
  }

  function cmdFact(key, value, opts) {
    opts = opts || {};
    var shown = value == null || value === "" ? "—" : String(value);
    var act = opts.act || "";
    var tag = act ? "button" : "div";
    var html = "<" + tag;
    if (act) html += ' type="button"';
    html += ' class="' + PX + "-cmd" + (act ? "" : " " + PX + "-copy-cmd") + '"';
    if (act) html += ' data-act="' + esc(act) + '"';
    if (opts.id) html += ' data-id="' + esc(opts.id) + '"';
    if (opts.rowId) html += ' data-row-id="' + esc(opts.rowId) + '"';
    if (opts.kind) html += ' data-kind="' + esc(opts.kind) + '"';
    if (opts.pressed != null) html += ' aria-pressed="' + (opts.pressed ? "true" : "false") + '"';
    if (opts.current) html += ' aria-current="true"';
    html += ">" + esc(key) + "<small>" + esc(shown) + "</small></" + tag + ">";
    return html;
  }

  function editorH1(title, flipId) {
    return '<div data-flip-target' + (flipId ? '="' + esc(flipId) + '"' : "") + '><h1 class="' + PX + '-h1">' + esc(title) + "</h1></div>";
  }

  function humanType(raw) {
    var t = String(raw || "setting");
    if (t === "setting") return "Setting";
    if (t === "manager") return "Manager";
    if (t === "object" || t === "resource") return "Item";
    if (t === "action") return "Action";
    if (t === "workflow") return "Setup";
    if (t === "diagnostic") return "Status";
    if (t === "deferred") return "Owner module";
    return t.replace(/_/g, " ");
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
  function runOfficialCli(app, providerId, mode) {
    var id = providerId || "local-ollama";
    var confirm = mode !== "install";
    if (confirm) {
      if (app && typeof app.confirmOfficialCli === "function") { app.confirmOfficialCli(id); return true; }
      if (window.PMv2 && typeof window.PMv2.confirmOfficialCli === "function") {
        window.PMv2.confirmOfficialCli(app, id);
        if (app.paint) app.paint();
        return true;
      }
    }
    if (app && typeof app.installOfficialCli === "function") { app.installOfficialCli(id); return true; }
    if (window.PMv2 && typeof window.PMv2.installOfficialCli === "function") {
      window.PMv2.installOfficialCli(app, id);
      if (app.paint) app.paint();
      return true;
    }
    return false;
  }

  function humanTab(t) {
    var map = {
      overview: "Overview",
      accounts: "Accounts",
      models: "Models",
      installations: "Installations",
      usage: "Usage",
      setup: "Setup",
      chain: "Context chain",
      budget: "Budget",
      items: "Items",
      retention: "Retention",
      library: "Library",
      tuning: "Tuning",
      ceilings: "Ceilings",
      automation: "Automation",
      seats: "Seats",
      policy: "Policy",
      rules: "Rules",
      filesafe: "FileSafe",
      admission: "Admission",
      channels: "Channels",
      preview: "Preview",
      packs: "Packs",
      uploads: "Uploads",
      themes: "Themes",
      type: "Type",
      motion: "Motion",
      dictionaries: "Dictionaries",
      tray: "Tray",
      window: "Window",
      tips: "Tips",
      checks: "Checks",
      repair: "Repair",
      editor: "Editor",
      ignore: "Ignore",
      profiles: "Profiles",
      shell: "Shell",
      servers: "Servers",
      logs: "Logs",
      tools: "Tools",
      bindings: "Bindings",
      installed: "Installed",
      catalog: "Catalog",
      debug: "Debug",
      schedule: "Schedule",
      restore: "Restore",
      import: "Import",
      export: "Export",
      reset: "Reset",
      sessions: "Sessions",
      outputs: "Outputs",
      trees: "Worktrees",
      workflows: "Workflows",
      registries: "Registries",
      providers: "Providers",
      status: "Status",
      image: "Image",
      audio: "Audio",
      owners: "Owners"
    };
    return map[t] || String(t || "").replace(/[-_]/g, " ");
  }

  function statusHtml(raw) {
    var a = humanAvail(raw);
    return '<span class="' + PX + '-status" data-state="' + a.state + '"><i aria-hidden="true"></i>' + esc(a.label) + "</span>";
  }

  function managersForDomain(app, domainId) {
    var seen = {};
    var out = [];
    function add(id) {
      if (!id || seen[id]) return;
      seen[id] = 1;
      out.push(id);
    }
    ((app.domainManagers || {})[domainId] || []).forEach(add);
    (app.managers || []).forEach(function (m) {
      if (m.domain === domainId) add(m.id);
    });
    return out;
  }

  function crumbParts(app) {
    var r = app.route || { name: "home" };
    var parts = ["Settings"];
    if (r.domain && app.cat(r.domain)) parts.push(app.cat(r.domain).title);
    if (r.page && r.name === "domain") {
      var sub = ((app.cat(r.domain) || {}).subgroups || []).filter(function (s) { return s.id === r.page; })[0];
      parts.push(sub ? sub.title : humanTab(r.page));
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
    return parts;
  }

  function crumb(app) {
    var parts = crumbParts(app);
    return parts.map(function (p, i) {
      return (i === parts.length - 1) ? "<b>" + esc(p) + "</b>" : esc(p);
    }).join(" / ");
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
      var dprev = (app.deferred || []).filter(function (x) { return x.id === prev.deferred; })[0];
      return "Back to " + ((dprev && dprev.title) || "Owner module");
    }
    return "Back";
  }

  function banner(app) {
    if (app.flags.offline) return { kind: "warn", text: "Offline. Cached values stay visible; refresh waits for network." };
    if (app.flags.restart) return { kind: "warn", text: "Restart required before this change applies to new runs." };
    if (app.flags.reconnect) return { kind: "warn", text: "Reconnect required for Google AI. Other project settings are unchanged." };
    if (app.flags.cachedLoading) return { kind: "info", text: "Refreshing. Cached provider list is still shown." };
    if (app.flags.importConflict) return { kind: "warn", text: "A settings import is paused on conflicting rows." };
    if (app.flags.changedElsewhere) return { kind: "info", text: "This value changed in another session. Showing the latest saved project value." };
    return null;
  }

  function chrome(app) {
    var q = esc(app.query || "");
    var drop = "";
    if (app.searchOpen) {
      var hits = (app.results || []);
      if (!hits.length && app.query) {
        drop = '<div class="' + PX + '-drop pmv2-scroll" data-search-drop data-hit-class="' + PX + '-hit" role="listbox"><div class="' + PX + '-hit">No matching settings</div></div>';
      } else if (hits.length) {
        drop = '<div class="' + PX + '-drop pmv2-scroll" data-search-drop data-hit-class="' + PX + '-hit" role="listbox">' + groupHits(hits).map(function (g) {
          return '<div class="' + PX + '-group-label">' + esc(humanType(g.type)) + "</div>" + g.items.map(function (h) {
            var sel = h.id === app.selectedResultId ? "true" : "false";
            var avail = h.availability && h.availability !== "ready" ? " · " + humanAvail(h.availability).label : "";
            return '<button type="button" class="' + PX + '-hit" role="option" aria-selected="' + sel + '" data-act="pick" data-id="' + esc(h.id) + '"><span class="' + PX + '-hit-title">' + esc(h.label) + "</span><span class=\"path\">" + esc(h.path) + "</span><span class=\"meta\">" + esc(humanType(h.type)) + avail + "</span></button>";
          }).join("");
        }).join("") + "</div>";
      }
    }
    var states = "";
    if (app.statesOpen) {
      var names = ["loading-cached", "empty", "no-search-results", "typo-fuzzy", "validation-error", "offline", "managed", "unavailable", "restart-required", "reconnect-required", "changed-elsewhere", "import-conflict", "rollback-complete", "usage-unavailable", "multi-install", "unknown-owner", "provider-update", "verification-failure"];
      states = '<div class="' + PX + '-states pmv2-scroll" role="dialog" aria-label="Demo states">' + names.map(function (n) {
        return '<button type="button" class="' + PX + '-ghost" data-act="state" data-id="' + n + '">' + esc(n.replace(/-/g, " ")) + "</button>";
      }).join("") + "</div>";
    }
    var ban = banner(app);
    var banHtml = ban ? '<div class="' + PX + '-banner" data-kind="' + ban.kind + '">' + esc(ban.text) + "</div>" : "";
    return '<div class="' + PX + '-chrome">' +
      '<button type="button" class="' + PX + '-back" data-act="back">' + esc(backLabel(app)) + "</button>" +
      '<div class="' + PX + '-crumb">' + crumb(app) + "</div>" +
      '<div class="' + PX + '-searchwrap">' + searchIcon() +
      '<input data-search type="search" placeholder="Search settings, managers, and setups" value="' + q + '" aria-label="Universal settings search" autocomplete="off" spellcheck="false">' +
      drop + "</div>" +
      '<span class="' + PX + '-proj">Project · ' + esc(app.project.name) + "</span>" +
      '<button type="button" class="' + PX + '-ghost" data-act="states">Demo states</button>' +
      '<button type="button" class="' + PX + '-close" data-act="close">Close Settings</button>' +
      states + "</div>" + banHtml;
  }

  function workBox(app) {
    if (!app.work) return "";
    var w = app.work;
    var bar = "";
    if (w.progress_kind === "determinate") bar = "<div>" + esc(w.completed) + " of " + esc(w.total) + " · " + esc(w.progress_source) + "</div>";
    else if (w.progress_kind && w.progress_kind !== "none") bar = "<div>Progress unknown · " + esc(w.progress_source) + "</div>";
    var confirmCmd = "";
    var waitBlob = String(w.wait_reason || "") + " " + String(w.title || "");
    if (w.state === "waiting_user" && /official|Install/i.test(waitBlob)) {
      confirmCmd = cmdFact("Confirm official source", w.wait_reason || "Install from the official provider source for This PC / Native Windows. Sign-in is a separate step.", { act: "confirm-official", id: "local-ollama", rowId: "install-official" });
    }
    return '<div class="' + PX + '-work" data-ow-state="' + esc(w.state) + '"><strong>' + esc(w.title) + "</strong> — " + esc(w.human_phase) +
      (w.wait_reason ? " (waiting: " + esc(w.wait_reason) + ")" : "") + bar + (w.message ? "<div>" + esc(w.message) + "</div>" : "") + confirmCmd + "</div>";
  }

  function pathStat(app, extraStatus) {
    return '<div class="' + PX + '-pathstat"><span>' + crumb(app) + "</span>" +
      statusHtml(extraStatus || "ready") +
      "<span>This project · " + esc(app.project.name) + "</span></div>";
  }

  function control(app, id) {
    var m = app.controlModel(id);
    if (!m) return "";
    var ctl = "";
    if (m.type === "toggle") {
      ctl = '<div class="' + PX + '-switch"><button type="button" data-act="toggle" data-id="' + esc(id) + '" aria-pressed="' + (m.value ? "true" : "false") + '"' + (m.disabled ? " disabled" : "") + ">" + (m.value ? "On" : "Off") + "</button></div>";
    } else if (m.type === "select" || m.type === "radio" || m.type === "multiselect") {
      ctl = '<select data-act="select" data-id="' + esc(id) + '"' + (m.disabled ? " disabled" : "") + ">" + (m.options || []).map(function (o) {
        return '<option value="' + esc(o) + '"' + (String(m.value) === String(o) ? " selected" : "") + ">" + esc(o) + "</option>";
      }).join("") + "</select>";
    } else if (m.type === "number" || m.type === "slider") {
      ctl = '<input data-act="number" data-id="' + esc(id) + '" type="number" value="' + esc(m.value == null ? "" : m.value) + '"' + (m.disabled ? " disabled" : "") + ">";
    } else if (m.type === "action") {
      ctl = '<button type="button" class="' + PX + '-ghost" data-act="do" data-id="' + esc(id) + '"' + (m.disabled ? " disabled" : "") + ">Run</button>";
    } else if (m.type === "list" || m.type === "keyvalue") {
      ctl = '<textarea data-act="text" data-id="' + esc(id) + '"' + (m.disabled ? " disabled" : "") + ">" + esc(Array.isArray(m.value) ? m.value.join("\n") : (m.value == null ? "" : m.value)) + "</textarea>";
    } else {
      ctl = '<input data-act="text" data-id="' + esc(id) + '" type="text" value="' + esc(m.value == null ? "" : m.value) + '"' + (m.disabled ? " disabled" : "") + ">";
    }
    return '<div class="' + PX + '-row" data-row-id="' + esc(id) + '"><div><label>' + esc(m.label) + "</label><p>" + esc(m.desc) + "</p>" +
      (m.reason ? '<p class="' + PX + '-muted">' + esc(m.reason) + "</p>" : "") +
      '<button type="button" class="' + PX + '-ghost" data-act="why" data-id="' + esc(id) + '">Why this value?</button>' +
      "</div><div>" + ctl + "</div></div>";
  }

  function settingsTable(app, rows, selectedId) {
    if (!rows.length) return '<p class="' + PX + '-muted ' + PX + '-empty">No settings in this page.</p>';
    return '<table class="' + PX + '-table"><thead><tr><th>Setting</th><th>Value</th><th>Status</th></tr></thead><tbody>' +
      rows.map(function (s) {
        var m = app.controlModel(s.id) || { label: s.label, value: "", disabled: false };
        var st = m.disabled ? "unavailable" : (m.changed ? "changed" : "ready");
        var cur = s.id === selectedId ? ' aria-current="true"' : "";
        return '<tr' + cur + ' data-row-id="' + esc(s.id) + '"><td><button type="button" class="' + PX + '-link" data-act="row" data-id="' + esc(s.id) + '">' + esc(m.label) + "</button></td><td>" + esc(m.value == null ? "—" : String(m.value)) + "</td><td>" + statusHtml(st) + "</td></tr>";
      }).join("") + "</tbody></table>";
  }

  function objectTable(app, managerId, selectedId) {
    var objs = app.objectsFor(managerId) || [];
    return '<table class="' + PX + '-table"><thead><tr><th>Item</th><th>Kind</th><th>Status</th></tr></thead><tbody>' +
      objs.map(function (o) {
        var cur = o.id === selectedId ? ' aria-current="true"' : "";
        return '<tr' + cur + ' data-row-id="' + esc(o.id) + '"><td><button type="button" class="' + PX + '-link" data-act="object" data-id="' + esc(o.id) + '">' + esc(o.label) + "</button></td><td>" + esc(humanType(o.kind)) + "</td><td>" + statusHtml(o.availability) + "</td></tr>";
      }).join("") + "</tbody></table>";
  }

  function commandIndex(app) {
    var r = app.route || { name: "home" };
    var cats = app.categories || [];
    var dest = cats.map(function (c) {
      var cur = r.name !== "all" && r.name !== "copy" && r.domain === c.id ? "true" : "false";
      return '<button type="button" class="' + PX + '-cmd" data-act="domain" data-id="' + esc(c.id) + '" data-flip-id="' + esc(c.id) + '" aria-current="' + cur + '">' + esc(c.title) + "<small>" + esc(c.description) + "</small></button>";
    }).join("");
    var homeCur = r.name === "home" ? "true" : "false";
    var allCur = r.name === "all" ? "true" : "false";
    var copyCur = r.name === "copy" ? "true" : "false";
    return '<div class="' + PX + '-pane ' + PX + '-cmdindex"><div class="' + PX + '-pane-h"><h2>Command index</h2><p>Type to search, or move down the list.</p></div><div class="' + PX + '-scroll pmv2-scroll">' +
      '<button type="button" class="' + PX + '-cmd" data-act="home" aria-current="' + homeCur + '">Settings Home<small>Search, attention, and destinations</small></button>' +
      '<div class="' + PX + '-group-label">Destinations</div>' + dest +
      '<div class="' + PX + '-group-label">Utilities</div>' +
      '<button type="button" class="' + PX + '-cmd" data-act="all" aria-current="' + allCur + '">All Settings<small>Full searchable index for this project</small></button>' +
      '<button type="button" class="' + PX + '-cmd" data-act="copy" aria-current="' + copyCur + '">Copy Settings From Another Project<small>One-time copy — not a live link</small></button>' +
      "</div></div>";
  }

  function attention(app) {
    if (app.flags.empty) return '<p class="' + PX + '-muted">Nothing needs attention.</p>';
    var items = app.attention || [];
    return '<div class="' + PX + '-att">' + items.map(function (a) {
      return '<button type="button" data-act="pick" data-id="' + esc(a.destId) + '"><strong>' + esc(a.title) + "</strong><div class='" + PX + "-muted'>" + esc(a.detail) + "</div></button>";
    }).join("") + "</div>";
  }

  function paneHead(title, hint) {
    return '<div class="' + PX + '-pane-h"><h2>' + esc(title) + "</h2>" + (hint ? "<p>" + esc(hint) + "</p>" : "") + "</div>";
  }

  function workspace(app, listInner, detailInner, listTitle, listHint) {
    var r = app.route || { name: "home" };
    return '<div class="' + PX + '-workspace ' + (app._motionPlay ? (PX + '-drill') : '') + '" data-route="' + esc(r.name) + '">' +
      commandIndex(app) +
      '<div class="' + PX + '-pane ' + PX + '-list">' + paneHead(listTitle, listHint) + '<div class="' + PX + '-scroll pmv2-scroll">' + listInner + "</div></div>" +
      '<div class="' + PX + '-pane ' + PX + '-detail">' + pathStat(app) + '<div class="' + PX + '-scroll pmv2-scroll">' + detailInner + "</div></div>" +
      "</div>";
  }

  function home(app) {
    var stage = '<div class="' + PX + '-stage">' +
      '<p class="' + PX + '-muted">Project ' + esc(app.project.name) + "</p>" +
      '<h1 class="' + PX + '-h1">Settings</h1>' +
      '<p class="' + PX + '-lede">Search first, then drill left to right. The command index lists the twelve destinations for this project. Copy from another project is a one-time action.</p>' +
      '<h2 class="' + PX + '-h2">Needs attention</h2>' + attention(app) +
      workBox(app) +
      '<div class="' + PX + '-utils"><button type="button" class="' + PX + '-ghost" data-act="all">All Settings</button><button type="button" class="' + PX + '-ghost" data-act="copy">Copy Settings From Another Project</button></div>' +
      "</div>";
    return '<div class="' + PX + '-workspace ' + (app._motionPlay ? (PX + '-drill') : '') + '" data-route="home">' +
      commandIndex(app) +
      '<div class="' + PX + '-pane ' + PX + '-detail">' + paneHead("This project", String(app.productSettingCount || 828) + " settings in the current project.") + '<div class="' + PX + '-scroll pmv2-scroll">' + stage + "</div></div>" +
      "</div>";
  }

  function domain(app) {
    var c = app.cat(app.route.domain) || { title: "Settings", subgroups: [], description: "", id: app.route.domain };
    var domainOnly = !app.route.page && !app.route.row;
    var page = app.route.page || ((c.subgroups || [])[0] || {}).id;
    var rows = app.settingsForPage(c.id, page);
    var selected = domainOnly ? null : (app.route.row || null);
    var mgrs = managersForDomain(app, c.id);
    var pages = (c.subgroups || []).map(function (sg) {
      return '<button type="button" class="' + PX + '-cmd" data-act="page" data-domain="' + esc(c.id) + '" data-id="' + esc(sg.id) + '"' + (app.route.page && sg.id === app.route.page ? ' aria-current="true"' : "") + ">" + esc(sg.title) + "<small>Page in " + esc(c.title) + "</small></button>";
    }).join("");
    var mgrNav = mgrs.map(function (id) {
      var m = app.mgr(id);
      return '<button type="button" class="' + PX + '-cmd" data-act="manager" data-id="' + esc(id) + '">' + esc(m ? m.title : id) + "<small>" + esc(m ? m.purpose : "") + "</small></button>";
    }).join("");
    var defNav = "";
    if (c.id === "system") {
      defNav = '<div class="' + PX + '-group-label">Owner modules</div>' + (app.deferred || []).map(function (d) {
        return '<button type="button" class="' + PX + '-cmd" data-act="deferred" data-id="' + esc(d.id) + '">' + esc(d.title) + "<small>Owned by " + esc(d.owner) + "</small></button>";
      }).join("");
    }
    var list = '<div class="' + PX + '-group-label">Pages</div>' + pages +
      '<div class="' + PX + '-group-label">Managers</div>' + mgrNav + defNav +
      settingsTable(app, rows, selected);
    var selRow = rows.filter(function (s) { return s.id === selected; })[0];
    var detail = '<div class="' + PX + '-editor">' + editorH1(c.title, c.id) + '<p class="' + PX + '-lede">' + esc(c.description) + "</p>" + workBox(app) +
      (selRow ? control(app, selRow.id) : '<p class="' + PX + '-muted">Choose a row in the index to edit it beside this page.</p>') + "</div>";
    return workspace(app, list, detail, c.title, "Drill right into a page, manager, or setting.");
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

  function providerDetail(app, obj, page) {
    if (!obj) return "<p>Choose a provider.</p>";
    var ollama = obj.id === "local-ollama";
    var html = '<div class="' + PX + '-editor" data-row-id="' + esc(obj.id) + '">' + editorH1(obj.label) +
      '<p class="' + PX + '-lede">Connected state, selected account, models, usage-end behavior, routing/fallback, and setup for this project. Credentials stay on the account; installations are a separate setup step.</p>' +
      '<div class="' + PX + '-cmdlist">' +
      cmdFact("Connected", providerConnected(obj), { rowId: "account-default" }) +
      cmdFact("Account", obj.account, { rowId: "account-default" }) +
      cmdFact("Product", obj.product, { rowId: "account-default" }) +
      cmdFact("Models", obj.models, { rowId: "account-default" }) +
      cmdFact("When included usage ends", providerUsageEnd(obj), { rowId: "usage-end" }) +
      cmdFact("Routing / fallback", providerRouting(obj), { rowId: "routing-fallback" }) +
      cmdFact("Usage", obj.usage, { rowId: "usage-projection" }) +
      cmdFact("Setup", obj.setup, ollama ? { rowId: "install-official", act: "confirm-official", id: obj.id } : { rowId: "account-default" }) +
      "</div>" + statusHtml(obj.availability);
    if (ollama) {
      html += cmdFact("Install from official source", "Not bundled. Confirm the official Ollama source for This PC / Native Windows. Sign-in is a separate step.", { act: "confirm-official", id: "local-ollama", rowId: "install-official" });
    }
    if (obj.id === "google") {
      html += cmdFact("Session", "The saved Google AI session expired. Reconnect this account without changing other projects.", { rowId: "account-default" });
    }
    if (page === "installations") {
      var installs = (app.installs || []).filter(function (i) { return i.provider === obj.id; });
      html += '<h2 class="' + PX + '-h2">Installations</h2><div class="' + PX + '-cmdlist">' +
        (installs.length ? installs.map(function (i) {
          var label = i.selected ? "Selected" : (i.shadowed ? "Shadowed" : "Available");
          if (i.manualOnly) label += " · Unknown owner — manual only";
          return cmdFact(i.label, i.host + " · " + label, { rowId: i.id }) + window.PMv2.identityBlock(i, PX);
        }).join("") : '<p class="' + PX + '-muted">None</p>') + "</div>";
    }
    if (page === "usage") {
      html += '<h2 class="' + PX + '-h2">When included usage ends</h2>' +
        cmdFact("When included usage ends", providerUsageEnd(obj), { rowId: "usage-end" }) +
        cmdFact("Ownership", "Settings owns the continuation. Usage owns the projection and never writes this choice.") +
        cmdFact("Projection", (obj.usage || "—") + ". Refresh does not invent a bill.", { rowId: "usage-projection" }) +
        (app.flags.usageUnavailable ? cmdFact("Availability", "Usage is unavailable until setup finishes.") : "");
    }
    if (page === "accounts") {
      html += '<h2 class="' + PX + '-h2">Routing / fallback</h2>' +
        cmdFact("Routing / fallback", providerRouting(obj), { rowId: "routing-fallback" }) +
        cmdFact("Selected account", (obj.account || "—") + " · " + (obj.product || "—"), { rowId: "account-default" }) +
        cmdFact("Credentials", "Credentials stay on the account. Switching route does not copy secrets. Limits, logs, and catalogs stay on their own subpages.");
    }
    return html + "</div>";
  }

  function managerView(app) {
    var m = app.mgr(app.route.manager);
    if (!m) return workspace(app, "", "<div class='" + PX + "-editor'>Missing manager</div>", "Manager", "");
    var objs = app.objectsFor(m.id);
    var obj = objs.filter(function (o) { return o.id === app.route.object; })[0] || objs[0];
    var page = app.route.page || (m.tabs && m.tabs[0]) || "overview";
    var tabs = '<div class="' + PX + '-tabs">' + (m.tabs || []).map(function (t) {
      var label = humanTab(t);
      if (m.id === "providers") {
        if (t === "usage") label = "When included usage ends";
        if (t === "accounts") label = "Routing / fallback";
      }
      return '<button type="button" data-act="mtab" data-id="' + esc(t) + '"' + (t === page ? ' aria-current="true"' : "") + ">" + esc(label) + "</button>";
    }).join("") + "</div>";
    var related = app.settingsForPage(m.domain, null).slice(0, 8);
    var selectedSetting = app.route.row || (related[0] && related[0].id);
    var listInner = tabs;
    var detail = '<div class="' + PX + '-editor">';

    if (m.id === "providers") {
      listInner += objectTable(app, m.id, obj && obj.id);
      listInner += '<div class="' + PX + '-group-label">Human questions</div>' +
        '<button type="button" class="' + PX + '-cmd" data-act="mtab" data-id="usage" data-row-id="usage-end"' + (page === "usage" ? ' aria-current="true"' : "") + '>When included usage ends<small>usage-end behavior — Settings owns continuation</small></button>' +
        '<button type="button" class="' + PX + '-cmd" data-act="mtab" data-id="accounts" data-row-id="routing-fallback"' + (page === "accounts" ? ' aria-current="true"' : "") + '>Routing / fallback<small>Project preference order and next-route fallback</small></button>';
      detail = providerDetail(app, obj, page);
    } else if (m.archetype === "health-projection") {
      listInner += '<table class="' + PX + '-table"><thead><tr><th>Check</th><th>Status</th></tr></thead><tbody>' +
        objs.map(function (o) {
          return '<tr data-row-id="' + esc(o.id) + '"' + (obj && o.id === obj.id ? ' aria-current="true"' : "") + '><td><button type="button" class="' + PX + '-link" data-act="object" data-id="' + esc(o.id) + '">' + esc(o.label) + "</button></td><td>" + statusHtml(o.availability) + "</td></tr>";
        }).join("") + "</tbody></table>";
      detail += editorH1(m.title) + '<p class="' + PX + '-lede">' + esc(m.purpose) + "</p>" +
        "<p>This is a read-only health projection. Settings does not invent a repair backend.</p>" +
        (obj ? "<p><strong>" + esc(obj.label) + "</strong> · " + humanAvail(obj.availability).label + "</p>" : "");
    } else if (m.archetype === "setup-sequence") {
      listInner += '<div class="' + PX + '-steps">' + (m.tabs || []).map(function (t, i) {
        return '<button type="button" class="' + PX + '-step" data-act="mtab" data-id="' + esc(t) + '"' + (t === page ? ' aria-current="true"' : "") + "><strong>Step " + (i + 1) + "</strong> · " + esc(humanTab(t)) + "</button>";
      }).join("") + "</div>";
      detail += editorH1(m.title) + '<p class="' + PX + '-lede">' + esc(m.purpose) + "</p><p>Each step stays inside Settings. Confirm before anything destructive runs.</p>" +
        related.map(function (s) { return control(app, s.id); }).join("");
    } else if (m.archetype === "preview-transaction") {
      listInner += '<div class="' + PX + '-steps">' +
        '<button type="button" class="' + PX + '-step" data-act="copy">Open copy preview</button>' +
        '<button type="button" class="' + PX + '-step" data-act="mtab" data-id="import"' + (page === "import" ? ' aria-current="true"' : "") + ">Import</button>" +
        '<button type="button" class="' + PX + '-step" data-act="mtab" data-id="export"' + (page === "export" ? ' aria-current="true"' : "") + ">Export</button>" +
        '<button type="button" class="' + PX + '-step" data-act="mtab" data-id="reset"' + (page === "reset" ? ' aria-current="true"' : "") + ">Reset</button></div>";
      detail += editorH1(m.title) + "<p>Import, export, reset, and rollback are transactional. A restore point is created before copy.</p>" +
        related.map(function (s) { return control(app, s.id); }).join("");
    } else if (m.archetype === "inventory-catalog" || m.archetype === "roster-detail") {
      listInner += objectTable(app, m.id, obj && obj.id);
      detail += editorH1(obj ? obj.label : m.title) + '<p class="' + PX + '-lede">' + esc(m.purpose) + "</p>" +
        (obj ? '<div data-row-id="' + esc(obj.id) + '">' + statusHtml(obj.availability) + " · " + esc(humanType(obj.kind)) + "</div>" : "") +
        '<h2 class="' + PX + '-h2">Project settings</h2>' +
        (selectedSetting ? control(app, selectedSetting) : related.map(function (s) { return control(app, s.id); }).join(""));
    } else {
      listInner += settingsTable(app, related, selectedSetting);
      detail += editorH1(m.title) + '<p class="' + PX + '-lede">' + esc(m.purpose) + "</p>";
      if (m.id === "notifications" || m.id === "soundLibrary") {
        detail += '<p><button type="button" class="' + PX + '-ghost" data-act="do" data-id="sound-preview">Preview sound (no audio file on this host)</button></p>';
      }
      if (m.id === "terminal") {
        detail += "<p>These are Terminal preferences for this project — not a live shell.</p>";
      }
      detail += (selectedSetting ? control(app, selectedSetting) : related.map(function (s) { return control(app, s.id); }).join(""));
    }
    if (m.id !== "providers") detail += workBox(app) + "</div>";
    else detail = workBox(app) + detail;
    return workspace(app, listInner, detail, m.title, "List on the left, editor on the right.");
  }

  function allSettings(app) {
    var f = ensureFacets(app);
    var cats = app.categories || [];
    var kinds = [
      { id: "toggle", label: "On/off" },
      { id: "select", label: "Choice" },
      { id: "slider", label: "Slider" },
      { id: "number", label: "Number" },
      { id: "action", label: "Action" },
      { id: "radio", label: "Radio" },
      { id: "list", label: "List" },
      { id: "multiselect", label: "Multi-select" },
      { id: "keyvalue", label: "Key/value" },
      { id: "text", label: "Text" },
      { id: "path", label: "Path" }
    ];
    var exposures = [
      { id: "basic", label: "Basic" },
      { id: "advanced", label: "Advanced" },
      { id: "hidden", label: "Hidden" }
    ];
    var states = [
      { id: "ready", label: "Ready" },
      { id: "managed", label: "Managed" },
      { id: "unavailable", label: "Unavailable" }
    ];
    var entries = [
      { id: "setting", label: "Setting" },
      { id: "action", label: "Action" },
      { id: "manager", label: "Manager" },
      { id: "workflow", label: "Workflow" },
      { id: "diagnostic", label: "Diagnostic" }
    ];
    var filters = '<div class="' + PX + '-group-label">Domain</div>' +
      cmdFacet("facet-domain", "", !f.domain, "All domains", "Product inventory only") +
      cats.map(function (c) {
        return cmdFacet("facet-domain", c.id, f.domain === c.id, c.title, "");
      }).join("") +
      '<div class="' + PX + '-group-label">Kind</div>' +
      cmdFacet("facet-kind", "", !f.kind, "All kinds", "") +
      kinds.map(function (k) {
        return cmdFacet("facet-kind", k.id, f.kind === k.id, k.label, "");
      }).join("") +
      '<div class="' + PX + '-group-label">Exposure</div>' +
      cmdFacet("facet-exposure", "", !f.exposure, "All exposure", "") +
      exposures.map(function (x) {
        return cmdFacet("facet-exposure", x.id, f.exposure === x.id, x.label, "");
      }).join("") +
      '<div class="' + PX + '-group-label">Availability</div>' +
      cmdFacet("facet-state", "", !f.state, "All availability", "Ready, managed, or unavailable") +
      states.map(function (s) {
        return cmdFacet("facet-state", s.id, f.state === s.id, s.label, "");
      }).join("") +
      '<div class="' + PX + '-group-label">Entry</div>' +
      cmdFacet("facet-entry", "", !f.entry, "All entries", "Setting, action, manager, workflow, diagnostic") +
      entries.map(function (e) {
        return cmdFacet("facet-entry", e.id, f.entry === e.id, e.label, "");
      }).join("") +
      '<div class="' + PX + '-group-label">Filters</div>' +
      cmdFacet("facet-changed", "", f.changed, "Changed in this project", "Hide defaults") +
      cmdFacet("facet-attention", "", f.attention, "Needs attention", "Only unresolved items") +
      cmdFacet("synth", "", f.synth, "Include synthetic overlay", "Labeled stress records — not product inventory");
    var selected = app.route.row;
    var detail = '<div class="' + PX + '-editor">' + editorH1("All Settings") + '<p class="' + PX + '-lede">Virtualized index of this project. Select a row to edit it in place.</p>' +
      workBox(app) + (selected && app.controlModel(selected) ? control(app, selected) : '<p class="' + PX + '-muted">Select a row to read it in context.</p>') + "</div>";
    var r = app.route || { name: "all" };
    return '<div class="' + PX + '-workspace ' + (app._motionPlay ? (PX + '-drill') : '') + '" data-route="' + esc(r.name) + '">' +
      commandIndex(app) +
      '<div class="' + PX + '-pane ' + PX + '-list">' + paneHead("Index", "Facets and rows stay on this page.") + '<div class="' + PX + '-scroll pmv2-scroll ' + PX + '-facetpane">' + filters + '</div><div data-all-list="1" class="' + PX + '-all-list pmv2-scroll"></div></div>' +
      '<div class="' + PX + '-pane ' + PX + '-detail">' + pathStat(app) + '<div class="' + PX + '-scroll pmv2-scroll">' + detail + "</div></div></div>";
  }


  function copyPreviewCommands(p) {
    if (!p) return "";
    var counts = p.counts || {};
    var trunc = p.truncated || {};
    function itemCmd(item, showChange) {
      var change = showChange
        ? '<span class="' + PX + '-copy-from">' + esc(fmtCopyVal(item.from)) + '</span><span class="' + PX + '-copy-arrow" aria-hidden="true"> → </span><span class="' + PX + '-copy-to">' + esc(fmtCopyVal(item.to)) + "</span>"
        : '<span class="' + PX + '-copy-same">' + esc(fmtCopyVal(item.to != null ? item.to : item.from)) + "</span>";
      var extra = item.reason ? " · " + esc(item.reason) : "";
      return '<div class="' + PX + '-cmd ' + PX + '-copy-cmd" data-kind="' + esc(item.kind || "") + '">' +
        esc(item.label || item.id) + "<small>" + esc(item.path || "") + " · " + change + extra + "</small></div>";
    }
    function noteCmd(item, kind) {
      return '<div class="' + PX + '-cmd ' + PX + '-copy-cmd" data-kind="' + esc(kind) + '">' +
        esc(item.label || item.id) + "<small>" + esc(item.reason || "") + "</small></div>";
    }
    function section(title, kind, items, moreCount, rowFn) {
      items = items || [];
      var count = counts[kind] != null ? counts[kind] : items.length;
      var body = items.length ? items.map(rowFn).join("") : '<p class="' + PX + '-muted">None</p>';
      var more = moreCount > 0 ? '<p class="' + PX + '-copy-more ' + PX + '-muted">' + moreCount + " more not shown</p>" : "";
      return '<div class="' + PX + '-copy-block" data-kind="' + esc(kind) + '">' +
        '<div class="' + PX + '-group-label">' + esc(title) + " (" + count + ")</div>" +
        body + more + "</div>";
    }
    return section("Replacements", "replacements", p.replacementItems, trunc.replacements, function (item) { return itemCmd(item, true); }) +
      section("Additions", "additions", p.additionItems, trunc.additions, function (item) { return itemCmd(item, true); }) +
      section("Unchanged", "unchanged", p.unchangedItems, trunc.unchanged, function (item) { return itemCmd(item, false); }) +
      section("Unavailable", "unavailable", p.unavailable, 0, function (item) { return noteCmd(item, "unavailable"); }) +
      section("Conflicts", "conflicts", p.conflicts, 0, function (item) { return noteCmd(item, "conflict"); });
  }

  function copyReceiptFacts(r) {
    if (!r) return "";
    var c = r.counts || {};
    return '<div class="' + PX + '-cmdlist">' +
      cmdFact("Applied", r.at) +
      cmdFact("Source", r.source) +
      cmdFact("Restore point", r.restorePointAt) +
      cmdFact("Verified", r.verified ? "Yes" : "No") +
      cmdFact("Counts", "Additions " + (c.additions || 0) + " · Replacements " + (c.replacements || 0) + " · Unchanged " + (c.unchanged || 0) + " · Unavailable " + (c.unavailable || 0) + " · Conflicts " + (c.conflicts || 0)) +
      cmdFact("Backend", (r.backend || "RuntimeResourceGovernor+projectStore")) +
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
      '<div class="' + PX + '-cmdlist">' +
      cmdFact("Requested", fmtCopyVal(d.requested)) +
      cmdFact("Effective", fmtCopyVal(d.effective)) +
      cmdFact("Origin", origin.label || "—") +
      cmdFact("Policy floor", d.policyFloor || "—") +
      cmdFact("Persistence", "Current project") +
      cmdFact("Scope", d.scopeNote) +
      cmdFact("Backend", (d.backend || "projectStore")) +
      "</div></aside>";
  }

  function copyView(app) {
    var p = app.copyPreview();
    var srcs = (app.projects || []).filter(function (x) { return !x.current; }).map(function (x) {
      return '<button type="button" class="' + PX + '-cmd" data-act="copy-src" data-id="' + esc(x.id) + '"' + (app.copy.sourceId === x.id ? ' aria-current="true"' : "") + ">" + esc(x.name) + "<small>Copy into " + esc(app.project.name) + "</small></button>";
    }).join("");
    var cats = (app.categories || []).map(function (c) {
      var on = (app.copy.categories || []).indexOf(c.id) !== -1;
      return cmdFact(c.title, on ? "Included in this copy" : "Skip this category", { act: "copy-cat", id: c.id, pressed: on });
    }).join("");
    var prev = cmdFact("Preview", "Select a source project.");
    if (p) {
      prev = cmdFact("Preview counts", "Additions " + p.counts.additions + " · Replacements " + p.counts.replacements + " · Unchanged " + p.counts.unchanged + " · Unavailable " + p.counts.unavailable + " · Conflicts " + p.counts.conflicts) +
        cmdFact("Copy policy", "Account and credential references copy. Secrets never copy. Projects stay independent. This is a one-time copy, not a profile or inheritance link.") +
        cmdFact("Backend", (p.backend || "RuntimeResourceGovernor+projectStore") + ". RuntimeResourceGovernor admits this copy. Project store persists this project only.") +
        copyPreviewCommands(p);
    }
    var actions = "";
    if (app.copy.step === "receipt" && app.copy.receipt) {
      actions = copyReceiptFacts(app.copy.receipt) + cmdFact("Roll back to restore point", "Restore this project from the copy restore point.", { act: "copy-rollback" });
    } else if (app.copy.step === "rolled_back") {
      actions = cmdFact("Rollback", "Rollback complete. This project’s previous values were restored.");
    } else if (app.copy.step === "restore" || app.copy.step === "applying" || app.copy.step === "verifying") {
      actions = "";
    } else {
      actions = cmdFact("Create restore point and copy", "One-time apply into this project. No ongoing sync.", { act: "copy-apply" });
    }
    var detail = '<div class="' + PX + '-editor">' + editorH1("Preview") + "<p>One-time copy into <strong>" + esc(app.project.name) + "</strong>. No ongoing sync, profiles, or inheritance.</p>" + prev + window.PMv2.copyTransactionHtml(app, PX) + actions + workBox(app) + "</div>";
    var r = app.route || { name: "copy" };
    return '<div class="' + PX + '-workspace ' + (app._motionPlay ? (PX + '-drill') : '') + '" data-route="' + esc(r.name) + '">' +
      '<div class="' + PX + '-pane ' + PX + '-index">' + paneHead("Source project", "Choose where to copy from.") + '<div class="' + PX + '-scroll pmv2-scroll">' + srcs + "</div></div>" +
      '<div class="' + PX + '-pane ' + PX + '-list">' + paneHead("Categories", "Turn off any category this copy should skip.") + '<div class="' + PX + '-scroll pmv2-scroll">' + cats + "</div></div>" +
      '<div class="' + PX + '-pane ' + PX + '-detail">' + pathStat(app) + '<div class="' + PX + '-scroll pmv2-scroll">' + detail + "</div></div>" +
      "</div>";
  }

  function deferredView(app) {
    var d = (app.deferred || []).filter(function (x) { return x.id === app.route.deferred; })[0];
    if (!d) return workspace(app, "", "<div class='" + PX + "-editor'>Unknown owner module</div>", "Owner module", "");
    var list = (app.deferred || []).map(function (x) {
      return '<button type="button" class="' + PX + '-cmd" data-act="deferred" data-id="' + esc(x.id) + '"' + (x.id === d.id ? ' aria-current="true"' : "") + ">" + esc(x.title) + "<small>" + esc(x.owner) + "</small></button>";
    }).join("");
    var detail = '<div class="' + PX + '-editor"><div class="' + PX + '-owner">' + editorH1(d.title) +
      "<p>This destination is owned by <strong>" + esc(d.owner) + "</strong>. Settings does not invent a backend for it.</p>" +
      "<p>Return contract: Back restores the previous Settings location. Close Settings returns to the opening surface.</p>" +
      "<button type='button' class='" + PX + "-ghost' data-act='back'>Return to Settings</button></div></div>";
    return workspace(app, list, detail, "Owner modules", "Reachable insertion — no fabricated owner.");
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

  function filterAllFallback(app, f) {
    var items = [];
    var seen = {};
    function add(item) {
      if (!item || !item.id || seen[item.id]) return;
      if (!matchesFacets(app, f, item)) return;
      seen[item.id] = 1;
      items.push(item);
    }
    ((window.PMv2.inventory && window.PMv2.inventory.settings) || []).forEach(function (s) {
      add(mapSettingItem(app, s));
    });
    extraIndexItems(app).forEach(add);
    if (f.synth) {
      var i;
      for (i = 0; i < 2000; i++) {
        add({
          id: "synthetic:stress-" + i,
          label: "Synthetic scale row " + i,
          path: "Synthetic overlay",
          type: "setting",
          kind: "text",
          exposure: "basic",
          entry: "setting",
          domain: "",
          synthetic: true
        });
      }
    }
    return items;
  }

  function allItems(app) {
    var f = ensureFacets(app);
    var api = window.PMv2 && window.PMv2.filterAllSettings;
    var raw = null;
    if (typeof api === "function") {
      try { raw = api.length >= 2 ? api(app, f) : api(f); } catch (err) { raw = null; }
    }
    var items = [];
    if (raw && typeof raw.length === "number") {
      raw.forEach(function (row) {
        if (!row) return;
        if (row.label && (row.path != null || row.resultId || row.entry)) items.push(row);
        else items.push(mapSettingItem(app, row));
      });
      extraIndexItems(app).forEach(function (row) { items.push(row); });
      var seen = {};
      items = items.filter(function (item) {
        if (!item || !item.id || seen[item.id]) return false;
        seen[item.id] = 1;
        return matchesFacets(app, f, item);
      });
      return items;
    }
    return filterAllFallback(app, f);
  }

  function fillAll(app, root) {
    var host = root.querySelector("[data-all-list]");
    if (!host) { virt = null; return; }
    var items = allItems(app);
    virt = window.PMv2.virtualList(host, items, 52, function (item) {
      var isSetting = entryOf(item) === "setting" && String(item.id).indexOf(":") === -1;
      var act = isSetting || String(item.id).indexOf("synthetic:") === 0 ? "row" : "pick";
      var rid = item.resultId || (act === "row" ? app.rowResultId(item.id) : item.id);
      var ent = entryOf(item);
      var meta = ent === "setting" ? humanKind(kindOf(item)) : humanType(ent);
      if (item.exposure) meta += " · " + (item.exposure === "basic" ? "Basic" : item.exposure === "advanced" ? "Advanced" : item.exposure === "hidden" ? "Hidden" : item.exposure);
      return '<button type="button" class="' + PX + '-hit" data-act="' + act + '" data-id="' + esc(rid) + '" data-row-id="' + esc(item.id) + '"><span class="' + PX + '-hit-title">' + esc(item.label) + "</span><span class='path'>" + esc(item.path) + "</span><span class=\"meta\">" + esc(meta) + "</span></button>";
    });
  }

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

  function isField(el) {
    if (!el || !el.tagName) return false;
    var t = el.tagName.toLowerCase();
    return t === "input" || t === "select" || t === "textarea" || el.isContentEditable;
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
    root.onkeydown = function (ev) {
      if (ev.key === "/" && !ev.ctrlKey && !ev.metaKey && !isField(ev.target)) {
        ev.preventDefault();
        if (search) search.focus();
        return;
      }
      if (isField(ev.target) || ev.altKey || ev.metaKey) return;
      var cmds = [].slice.call(root.querySelectorAll("." + PX + "-cmdindex ." + PX + "-cmd"));
      if (!cmds.length) return;
      var cur = cmds.filter(function (b) { return b.getAttribute("aria-current") === "true"; })[0];
      var at = Math.max(0, cmds.indexOf(cur));
      if (ev.key === "ArrowDown") {
        ev.preventDefault();
        cmds[Math.min(cmds.length - 1, at + 1)].focus();
      } else if (ev.key === "ArrowUp") {
        ev.preventDefault();
        cmds[Math.max(0, at - 1)].focus();
      } else if (ev.key === "ArrowRight" || ev.key === "Enter") {
        if (document.activeElement && document.activeElement.getAttribute("data-act")) {
          ev.preventDefault();
          document.activeElement.click();
        }
      } else if (ev.key === "ArrowLeft") {
        ev.preventDefault();
        app.back();
      }
    };
    root.onclick = function (ev) {
      var el = ev.target.closest("[data-act]");
      if (!el) return;
      var act = el.getAttribute("data-act");
      var id = el.getAttribute("data-id");
      if (act === "back") app.back();
      else if (act === "home") app.navigate({ name: "home" });
      else if (act === "close") app.closeSettings();
      else if (act === "states") { app.statesOpen = !app.statesOpen; app.paint(); }
      else if (act === "state") app.triggerState(id);
      else if (act === "domain") app.openDomain(id);
      else if (act === "page") app.openPage(el.getAttribute("data-domain"), id);
      else if (act === "manager") app.openManager(id);
      else if (act === "object") app.openManager(app.route.manager, { object: id, page: app.route.page });
      else if (act === "mtab") app.openManager(app.route.manager, { object: app.route.object, page: id });
      else if (act === "deferred") app.openDeferred(id);
      else if (act === "all") app.openAll();
      else if (act === "copy") app.openCopy();
      else if (act === "pick") app.pickResult(id);
      else if (act === "row") pickSettingRow(app, el, id);
      else if (act === "facet-domain") {
        setFacet(app, "domain", id || "");
        app.paint();
      } else if (act === "facet-kind") {
        setFacet(app, "kind", id || "");
        app.paint();
      } else if (act === "facet-exposure") {
        setFacet(app, "exposure", id || "");
        app.paint();
      } else if (act === "facet-state") {
        setFacet(app, "state", id || "");
        app.paint();
      } else if (act === "facet-entry") {
        setFacet(app, "entry", id || "");
        app.paint();
      } else if (act === "facet-changed") {
        setFacet(app, "changed", !ensureFacets(app).changed);
        app.paint();
      } else if (act === "facet-attention") {
        setFacet(app, "attention", !ensureFacets(app).attention);
        app.paint();
      } else if (act === "toggle") {
        var cur = app.controlModel(id);
        app.setValue(id, !(cur && cur.value));
      } else if (act === "select") app.setValue(id, el.value);
      else if (act === "number") app.setValue(id, Number(el.value));
      else if (act === "text") app.setValue(id, el.value);
      else if (act === "do") {
        var setting = app.setting(id);
        app.receipt("Ran " + (setting && setting.label ? setting.label : "this action") + " for this project.", "info");
      }
      else if (act === "why") app.openDetails(id);
      else if (act === "details-close") app.closeDetails();
      else if (act === "confirm-official") {
        if (!runOfficialCli(app, id || "local-ollama", "confirm")) {
          app.work = { title: "Install from official source", human_phase: "Official source install complete", state: "completed", wait_reason: "", progress_kind: "none", progress_source: "official provider source", last_known_good: true, message: "Installed from official source for This PC / Native Windows. Sign-in is a separate step." };
          app.receipt("Official source install finished for this project. Sign-in is a separate step.", "ok");
          app.paint();
        }
      } else if (act === "install-official") {
        if (!runOfficialCli(app, id || "local-ollama", "install")) {
          app.work = { title: "Install Ollama", human_phase: "Waiting for explicit Install", state: "waiting_user", wait_reason: "Official source confirmation", progress_kind: "none", progress_source: "provider setup", last_known_good: true, message: "Not bundled. Not silently installed." };
          app.receipt("Install starts only after you confirm the official source.", "info");
          app.paint();
        }
      } else if (act === "copy-src") { app.copy.sourceId = id; app.copy.step = "preview"; app.paint(); }
      else if (act === "copy-cat") {
        var set = app.copy.categories ? app.copy.categories.slice() : [];
        if (set.indexOf(id) === -1) set.push(id);
        else set = set.filter(function (x) { return x !== id; });
        app.copy.categories = set;
        app.paint();
      } else if (act === "copy-apply") app.applyCopy();
      else if (act === "copy-rollback") app.rollbackCopy();
      else if (act === "synth") {
        setFacet(app, "synth", !ensureFacets(app).synth);
        app.receipt("Synthetic overlay is labeled and excluded from product inventory search by default.", "info");
        app.paint();
      }
    };
  }

  function render(app) {
    ensureFacets(app);
    var root = document.getElementById(ROOT_ID);
    if (virt && virt.dispose) virt.dispose();
    var stackLen = (app.stack || []).length;
    lastDir = stackLen < lastStackLen ? "back" : "fwd";
    lastStackLen = stackLen;
    window.__pmv2App = app;
    root.className = PX;
    root.setAttribute("data-layout", "command-suite");
    root.setAttribute("data-route", (app.route && app.route.name) || "home");
    root.setAttribute("data-dir", app._navDir || lastDir || "fwd");
    root.setAttribute("data-inventory-count", String(app.productSettingCount || 828));
    root.setAttribute("data-pane", app.detailsId ? "details" : ((app.route && app.route.name) || "main"));
    var keepSearch = document.activeElement && document.activeElement.getAttribute && document.activeElement.getAttribute("data-search") != null;
    var caret = keepSearch ? document.activeElement.selectionStart : null;
    root.innerHTML = chrome(app) + '<div class="' + PX + '-body">' + body(app) + detailsDrawer(app) + "</div>";
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
    var app = window.PMv2.createApp({ namespace: "c10", root: document.getElementById(ROOT_ID), render: render });
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
      var fEsc = ensureFacets(app);
      if (fEsc.domain || fEsc.kind || fEsc.exposure || fEsc.state || fEsc.entry || fEsc.attention || fEsc.changed || fEsc.synth) {
        facet = defaultFacets();
        app.allFacets = defaultFacets();
        app.paint();
        return;
      }
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
  });
})();
