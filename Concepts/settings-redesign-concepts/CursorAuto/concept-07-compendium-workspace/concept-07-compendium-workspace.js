(function () {
  "use strict";
  var PX = "cw";
  var LAYOUT = "compendium";
  var ROOT_ID = "cw-root";
  var ROW_H = 56;
  var esc = window.PMv2.esc;
  var virt = null;

  function ico() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="currentColor"/><path d="M8 9h8M8 12h8M8 15h5" fill="none" stroke="currentColor"/></svg>';
  }
  function searchIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor"/><path d="m20 20-3.5-3.5" fill="none" stroke="currentColor"/></svg>';
  }

  function emptyFacets() {
    return { domain: "", type: "", tier: "", exposure: "", state: "", entry: "", changed: false, synthetic: false, attention: false, q: "" };
  }

  function ensureFacets(app) {
    if (!app.allFacets) app.allFacets = emptyFacets();
    var f = app.allFacets;
    if (f.exposure == null) f.exposure = "";
    if (f.state == null) f.state = "";
    if (f.entry == null) f.entry = "";
    if (f.attention == null) f.attention = false;
    return f;
  }

  function catalogEntryKind(e) {
    if (!e) return "";
    var t = e.type;
    var id = String(e.id || "");
    if (t === "manager" || id.indexOf("manager:") === 0) return "manager";
    if (t === "action" || id.indexOf("action:") === 0) return "action";
    if (t === "setup_or_repair_workflow" || id.indexOf("workflow:") === 0) return "workflow";
    if (t === "diagnostic_or_read_only_status" || id.indexOf("diagnostic:") === 0) return "diagnostic";
    if (t === "setting" || id.indexOf("setting:") === 0) return "setting";
    return "";
  }

  function settingState(app, s) {
    var model = app && s && app.controlModel ? app.controlModel(s.id) : null;
    if (!model) return "ready";
    if (model.originKind === "policy") return "managed";
    if (model.originKind === "unavailable") return "unavailable";
    return "ready";
  }

  function catalogState(e) {
    var a = String((e && e.availability) || "ready").toLowerCase();
    if (a === "managed" || a === "policy") return "managed";
    if (a === "unavailable" || a === "setup_required" || a === "reconnect_required") return "unavailable";
    return "ready";
  }

  function itemNeedsAttention(app, s) {
    if (window.PMv2 && typeof window.PMv2.allSettingsAttention === "function") {
      return window.PMv2.allSettingsAttention(app, s);
    }
    var flags = (app && app.flags) || {};
    var id = s && s.id != null ? String(s.id) : "";
    if (flags.restart && /visual|window/.test(id)) return true;
    if ((flags.reconnect || flags.unavailable) && /ai\./.test(id)) return true;
    if (flags.managed && s && (s.tier === "advanced" || /safety\./.test(id))) return true;
    return false;
  }

  function mapPMv2AllItem(item) {
    if (!item) return null;
    var resultId = item.resultId || item.id || "";
    var id = item.settingId || item.id || "";
    if (String(resultId).indexOf("setting:") === 0) {
      id = item.settingId || resultId.slice(8);
    } else if (String(id).indexOf("setting:") === 0) {
      resultId = id;
      id = item.settingId || id.slice(8);
    } else if (String(id).indexOf(":") === -1) {
      if (!resultId || String(resultId).indexOf(":") === -1) resultId = "setting:" + id;
    }
    return {
      id: id,
      resultId: resultId,
      label: item.label || id,
      path: item.path || "",
      type: item.type || "setting",
      exposure: item.exposure,
      synthetic: !!item.synthetic
    };
  }

  function collectCatalog(kind) {
    var PMv2 = window.PMv2;
    var out = [];
    var seen = {};
    if (!PMv2 || typeof PMv2.getResult !== "function") return out;
    function add(id) {
      if (!id || seen[id]) return;
      var e = PMv2.getResult(id);
      if (!e) return;
      seen[id] = 1;
      out.push(e);
    }
    if (!kind || kind === "manager") {
      (PMv2.managers || []).forEach(function (m) { add("manager:" + m.id); });
    }
    if (!kind || kind === "action") {
      add("action:copy-from-project");
      add("action:open-all-settings");
      add("action:retry-default-account");
    }
    if (!kind || kind === "workflow") add("workflow:provider-cli-setup");
    if (!kind || kind === "diagnostic") add("diagnostic:usage-stale");
    if (!kind) {
      (PMv2.deferred || []).forEach(function (d) { add("unavailable:" + d.id); });
      (PMv2.managers || []).forEach(function (m) {
        if (typeof PMv2.objectsFor !== "function") return;
        (PMv2.objectsFor(m.id) || []).forEach(function (o) {
          add("object:" + m.id + ":" + o.id);
        });
      });
    }
    return out;
  }

  function settingExposure(s) {
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

  function humanExposure(e) {
    var map = { basic: "Basic", advanced: "Advanced", hidden: "Hidden" };
    return map[e] || (e ? String(e).charAt(0).toUpperCase() + String(e).slice(1) : "Basic");
  }

  function fmtCopyVal(v) {
    if (v == null || v === "") return "—";
    if (typeof v === "boolean") return v ? "On" : "Off";
    if (Array.isArray(v)) return v.join(", ");
    return String(v);
  }

  function copySourceValues(app) {
    var inv = (window.PMv2.inventory && window.PMv2.inventory.settings) || [];
    var vals = {};
    var i, s;
    for (i = 0; i < inv.length; i++) {
      s = inv[i];
      vals[s.id] = s.default === undefined ? null : s.default;
    }
    vals["general.visual.theme"] = "Friendly Dark";
    vals["ai.models.default-model"] = vals["ai.models.default-model"] || "Claude 4 Sonnet";
    var pid = app.copy && app.copy.sourceId;
    if (pid === "northwind-docs") {
      vals["general.visual.theme"] = "Glass Light";
      vals["general.interaction.density"] = vals["general.interaction.density"] || "comfortable";
      vals["safety.rules.preset"] = "cautious";
    } else if (pid === "tastebook") {
      vals["general.visual.theme"] = "Retro Dark";
      vals["media.image.quality"] = "high";
    }
    return vals;
  }

  function copyPreviewSamples(app, p) {
    if (!p) return "";
    var src = copySourceValues(app);
    var counts = p.counts || {};
    var trunc = p.truncated || {};
    function itemRow(item, kind, showChange) {
      var change;
      if (kind === "additions") {
        change = '<span class="' + PX + '-copy-to to">' + esc(fmtCopyVal(item.to != null ? item.to : src[item.id])) + "</span>";
      } else if (!showChange) {
        change = '<span class="' + PX + '-copy-same same">' + esc(fmtCopyVal(item.to != null ? item.to : item.from)) + "</span>";
      } else {
        change = '<span class="' + PX + '-copy-from from">' + esc(fmtCopyVal(item.from)) + '</span><span class="' + PX + '-copy-arrow arrow" aria-hidden="true">→</span><span class="' + PX + '-copy-to to">' + esc(fmtCopyVal(item.to)) + "</span>";
      }
      return '<div class="' + PX + '-coprev-row ' + PX + '-copy-row" data-kind="' + esc(kind === "conflicts" ? "conflict" : kind) + '">' +
        "<div><strong>" + esc(item.label || item.id) + '</strong><span class="' + PX + '-muted">' + esc(item.path || "") + "</span></div>" +
        change +
        (item.reason ? '<span class="' + PX + '-muted">' + esc(item.reason) + "</span>" : "") +
        "</div>";
    }
    function idItem(id, kind) {
      var s = app.setting ? app.setting(id) : null;
      var cur = app.values && app.values[id];
      var next = src[id];
      return {
        id: id,
        label: s ? s.label : id,
        path: s ? settingPath(app, s) : id,
        from: cur,
        to: next,
        kind: kind
      };
    }
    function noteRow(item, kind) {
      return '<div class="' + PX + '-coprev-row ' + PX + '-copy-row" data-kind="' + esc(kind) + '"><div><strong>' + esc(item.label || item.id) + "</strong></div>" +
        '<span class="' + PX + '-muted">' + esc(item.reason || "") + "</span></div>";
    }
    function block(title, kind, items, ids, countKey, truncKey, rowFn) {
      var list = items && items.length ? items : (ids || []).map(function (id) { return idItem(id, kind); });
      var count = counts[countKey] != null ? counts[countKey] : list.length;
      var moreCount = trunc[truncKey] || 0;
      var body = list.length ? list.map(rowFn).join("") : '<p class="' + PX + '-muted">None</p>';
      var more = moreCount > 0 ? '<p class="' + PX + '-copy-more ' + PX + '-muted">' + moreCount + " more not shown</p>" : "";
      return '<section class="' + PX + '-coprev-block ' + PX + '-copy-block" data-kind="' + esc(kind) + '" data-blueprint="' + esc(kind) + '">' +
        "<h3>" + esc(title) + ' <span class="' + PX + '-muted">(' + count + ")</span></h3>" +
        '<div class="' + PX + '-coprev-rows ' + PX + '-copy-rows">' + body + "</div>" + more + "</section>";
    }
    return block("Replacements", "replacements", p.replacementItems, p.replacements, "replacements", "replacements", function (item) { return itemRow(item, "replacements", true); }) +
      block("Additions", "additions", p.additionItems, p.additions, "additions", "additions", function (item) { return itemRow(item, "additions", true); }) +
      block("Unchanged", "unchanged", p.unchangedItems, p.unchanged, "unchanged", "unchanged", function (item) { return itemRow(item, "unchanged", false); }) +
      block("Unavailable", "unavailable", p.unavailable, null, "unavailable", "unavailable", function (item) { return noteRow(item, "unavailable"); }) +
      block("Conflicts", "conflicts", p.conflicts, null, "conflicts", "conflicts", function (item) { return noteRow(item, "conflict"); });
  }

  function factRow(key, value, rowId) {
    return '<div class="' + PX + '-fact"' + (rowId ? ' data-row-id="' + esc(rowId) + '"' : "") + '><span class="k">' + esc(key) + "</span><span>" + esc(value || "—") + "</span></div>";
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
      factRow("Persistence", "Current project") +
      factRow("Scope", d.scopeNote) +
      factRow("Backend", (d.backend || "projectStore")) +
      "</div></aside>";
  }

  function hitsForQuery(app) {
    var hits = (app.results || []).slice();
    var q = String(app.query || "").trim();
    if (!q) return hits;
    var get = (app.getResult || window.PMv2.getResult);
    var hit = get(q) || get("setting:" + q) || get("manager:" + q) || get("object:" + q) || get("unavailable:" + q);
    if (!hit && q.indexOf("setting:") !== 0 && q.indexOf(".") !== -1) hit = get("setting:" + q);
    if (!hit) return hits;
    var rest = hits.filter(function (h) { return h.id !== hit.id; });
    return [{
      id: hit.id,
      type: hit.type,
      label: hit.label,
      path: hit.path,
      availability: hit.availability,
      dest: hit.dest
    }].concat(rest);
  }

  function resultIdFor(id) {
    var s = String(id || "");
    if (!s) return s;
    if (s.indexOf(":") !== -1) return s;
    return "setting:" + s;
  }

  function destFromId(app, id) {
    var get = (app && app.getResult) || window.PMv2.getResult;
    if (!get) return null;
    var rid = resultIdFor(id);
    var entry = get(rid) || get(id);
    if (!entry || !entry.dest) return null;
    var dest;
    try { dest = JSON.parse(JSON.stringify(entry.dest)); } catch (err) { dest = entry.dest; }
    dest.fromSearch = entry.id;
    return dest;
  }

  function pickSettingRow(app, el, id) {
    var rowId = (el && el.getAttribute("data-row-id")) || id || "";
    if (!rowId) return;
    if (String(rowId).indexOf(":") !== -1) {
      app.pickResult(resultIdFor(rowId));
      return;
    }
    if (app.routeSettingRow) app.routeSettingRow(rowId);
    else app.pickResult(resultIdFor(rowId));
  }

  function humanType(t) {
    var map = {
      select: "Choice",
      toggle: "On / off",
      slider: "Slider",
      number: "Number",
      action: "Action",
      radio: "Radio",
      list: "List",
      multiselect: "Multi-select",
      keyvalue: "Key / value",
      text: "Text",
      path: "Path",
      setting: "Setting",
      manager: "Manager",
      managed_object: "Manager",
      setup_or_repair_workflow: "Workflow",
      diagnostic_or_read_only_status: "Diagnostic",
      unavailable_capability: "Unavailable"
    };
    return map[t] || (t || "Setting");
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
  function waitingOfficialFallback(app) {
    app.work = {
      title: "Install from official source",
      human_phase: "Waiting for explicit Install",
      state: "waiting_user",
      wait_reason: "Official source confirmation",
      progress_kind: "none",
      progress_source: "user consent",
      last_known_good: true,
      message: "Not bundled. Not silently installed. Sign-in is a separate step."
    };
    if (typeof app.receipt === "function") {
      app.receipt("Install starts only after you confirm the official source.", "info");
    }
    if (app.paint) app.paint();
  }

  function startOfficialInstall(app, providerId) {
    var id = providerId || "local-ollama";
    if (app && typeof app.installOfficialCli === "function") { app.installOfficialCli(id); return true; }
    if (window.PMv2 && typeof window.PMv2.installOfficialCli === "function") {
      window.PMv2.installOfficialCli(app, id);
      if (app.paint) app.paint();
      return true;
    }
    waitingOfficialFallback(app);
    return true;
  }

  function confirmOfficialInstall(app, providerId) {
    var id = providerId || "local-ollama";
    if (app && typeof app.confirmOfficialCli === "function") { app.confirmOfficialCli(id); return true; }
    if (window.PMv2 && typeof window.PMv2.confirmOfficialCli === "function") {
      window.PMv2.confirmOfficialCli(app, id);
      if (app.paint) app.paint();
      return true;
    }
    waitingOfficialFallback(app);
    return true;
  }

  function officialCliWaiting(app) {
    var w = app && app.work;
    if (!w) return false;
    if (w.state !== "waiting_user") return false;
    var blob = String(w.title || "") + " " + String(w.wait_reason || "") + " " + String(w.human_phase || "");
    return /official|install/i.test(blob);
  }

  function pmv2IdentityBlock(row) {
    if (window.PMv2 && typeof window.PMv2.identityBlock === "function") {
      return window.PMv2.identityBlock(row, PX);
    }
    return "";
  }

  function officialCliActions(app, obj) {
    if (!obj || obj.id !== "local-ollama") return "";
    var waiting = officialCliWaiting(app);
    var row = ((app && app.installs) || []).filter(function (i) { return i.provider === obj.id; })[0] || obj;
    return "<p>Ollama is not bundled. Install from the official Ollama source for This PC / Native Windows. Authentication is a separate step.</p>" +
      '<div class="' + PX + '-cli-actions" data-row-id="install-official">' +
      '<button type="button" data-act="install-official" data-id="local-ollama" data-row-id="install-official">Install from official source</button>' +
      '<button type="button" data-act="confirm-official" data-id="local-ollama" data-row-id="confirm-official"' +
      (waiting ? ' aria-current="true"' : "") + ">Confirm official source</button>" +
      "</div>" +
      pmv2IdentityBlock(row) +
      '<p class="' + PX + '-muted">RuntimeResourceGovernor admits this install. BinaryLocator discovery. Unknown owner stays manual-only.</p>';
  }

  function installIdentityCard(inst) {
    if (!inst) return "";
    var humanStatus = inst.selected ? "Selected" : (inst.shadowed ? "Shadowed" : "Available");
    var humanHealth = String(inst.health || "ready").replace(/_/g, " ");
    return '<article class="' + PX + '-install" data-row-id="' + esc(inst.id) + '">' +
      '<div class="' + PX + '-install-human">' +
      "<strong>" + esc(inst.label || inst.id) + "</strong>" +
      '<span class="' + PX + '-muted">' + esc(inst.host || "This PC / Native Windows") + " · " + esc(humanStatus) + " · " + esc(humanHealth) + "</span>" +
      "<p>Human identity: this host installation for this project. Sign-in stays a separate authentication step.</p>" +
      "</div>" +
      '<div class="' + PX + '-install-advanced">' +
      "<h3>Advanced identity</h3>" +
      pmv2IdentityBlock(inst) +
      "</div></article>";
  }

  function settingPath(app, s) {
    var parts = String(s.id || "").split(".");
    var cat = app.cat(parts[0]);
    var page = parts[1] || "";
    var sub = ((cat && cat.subgroups) || []).filter(function (sg) { return sg.id === page; })[0];
    return (cat ? cat.title : parts[0]) + " / " + (sub ? sub.title : page);
  }

  function crumb(app) {
    var r = app.route || { name: "home" };
    var parts = ["Settings"];
    if (r.name === "all") parts.push("All Settings");
    if (r.domain && app.cat(r.domain) && r.name !== "all") parts.push(app.cat(r.domain).title);
    if (r.page && r.name === "domain") {
      var sub = ((app.cat(r.domain) || {}).subgroups || []).filter(function (s) { return s.id === r.page; })[0];
      parts.push(sub ? sub.title : r.page);
    }
    if (r.manager && app.mgr(r.manager)) parts.push(app.mgr(r.manager).title);
    if (r.object) {
      var objs = app.objectsFor(r.manager) || [];
      var obj = objs.filter(function (o) { return o.id === r.object; })[0];
      parts.push(obj ? obj.label : r.object);
    }
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
    if (prev.name === "all") return "Back to All Settings";
    if (prev.name === "copy") return "Back to Copy from another project";
    if (prev.name === "deferred") {
      var owner = (app.deferred || []).filter(function (x) { return x.id === prev.deferred; })[0];
      return "Back to " + (owner ? owner.title : "Owner module");
    }
    if (prev.manager && app.mgr(prev.manager)) return "Back to " + app.mgr(prev.manager).title;
    if (prev.domain && app.cat(prev.domain)) return "Back to " + app.cat(prev.domain).title;
    return "Back";
  }

  function transferClass(app) {
    return app && app._motionPlay ? " " + PX + "-slide" : "";
  }

  function bannerHtml(app) {
    if (app.flags.offline) return '<div class="' + PX + '-banner">Offline. Cached values stay visible; refresh waits for network.</div>';

    if (app.flags.restart) return '<div class="' + PX + '-banner">Restart required before this change applies to new runs.</div>';
    if (app.flags.reconnect) return '<div class="' + PX + '-banner">Reconnect required for Google AI. Other project settings are unchanged.</div>';
    if (app.flags.importConflict) return '<div class="' + PX + '-banner">Import is paused on conflicting rows. Resolve before copy can finish.</div>';
    if (app.flags.changedElsewhere) return '<div class="' + PX + '-banner">This value changed in another session on this project. Showing the latest stored value.</div>';
    return "";
  }

  function chrome(app) {
    var q = esc(app.query || "");
    var drop = "";
    if (app.searchOpen) {
      var hits = hitsForQuery(app);
      if (!hits.length && app.query) {
        drop = '<div class="' + PX + '-drop pmv2-scroll" data-search-drop data-hit-class="' + PX + '-hit" role="listbox"><div class="' + PX + '-hit">No matching settings</div></div>';
      } else if (hits.length) {
        drop = '<div class="' + PX + '-drop pmv2-scroll" data-search-drop data-hit-class="' + PX + '-hit" role="listbox">' + groupHits(hits).map(function (g) {
          return '<div class="' + PX + '-muted">' + esc(humanType(g.type)) + "</div>" + g.items.map(function (h) {
            var sel = h.id === app.selectedResultId ? "true" : "false";
            var kind = humanType(h.type || "setting");
            var avail = h.availability && h.availability !== "ready" ? " · " + esc(String(h.availability).replace(/_/g, " ")) : "";
            return '<button type="button" class="' + PX + '-hit" role="option" aria-selected="' + sel + '" data-act="pick" data-id="' + esc(h.id) + '"><b>' + esc(h.label) + '</b><span class="path">' + esc(h.path) + '</span><span class="meta">' + esc(kind) + avail + "</span></button>";
          }).join("");
        }).join("") + "</div>";
      }
    }
    var banner = bannerHtml(app);
    var states = "";
    if (app.statesOpen) {
      var names = ["loading-cached", "empty", "no-search-results", "typo-fuzzy", "validation-error", "offline", "managed", "unavailable", "restart-required", "reconnect-required", "changed-elsewhere", "import-conflict", "rollback-complete", "usage-unavailable", "multi-install", "unknown-owner", "provider-update", "verification-failure"];
      states = '<div class="' + PX + '-states pmv2-scroll" role="dialog" aria-label="Demo states">' + names.map(function (n) {
        return '<button type="button" data-act="state" data-id="' + n + '">' + esc(n.replace(/-/g, " ")) + "</button>";
      }).join("") + "</div>";
    }
    var onAll = (app.route && app.route.name) === "all";
    return '<div class="' + PX + '-chrome">' +
      '<div class="' + PX + '-searchwrap">' + searchIcon() +
      '<input data-search type="search" placeholder="Search settings, managers, and setups" value="' + q + '" aria-label="Universal settings search" autocomplete="off" spellcheck="false">' +
      drop + "</div>" +
      '<div class="' + PX + '-toolbar">' +
      '<button type="button" class="' + PX + '-back" data-act="back">' + esc(backLabel(app)) + "</button>" +
      '<div class="' + PX + '-crumb">' + crumb(app) + "</div>" +
      '<button type="button" class="' + PX + '-allbtn" data-act="all"' + (onAll ? ' aria-current="true"' : "") + ">All Settings</button>" +
      '<span class="' + PX + '-proj">Project · ' + esc(app.project.name) + "</span>" +
      '<button type="button" class="' + PX + '-statesbtn" data-act="states">Demo states</button>' +
      '<button type="button" class="' + PX + '-close" data-act="close">Close Settings</button>' +
      "</div>" + states + "</div>" + (banner ? '<div class="' + PX + '-bannerwrap">' + banner + "</div>" : "");
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
      '<button type="button" data-act="why" data-id="' + esc(id) + '">Why this value?</button></div><div>' + ctl + "</div></div>";
  }

  function attention(app) {
    if (app.flags.empty) return '<p class="' + PX + '-muted">Nothing needs attention.</p>';
    var items = app.attention || [];
    return '<div class="' + PX + '-att">' + items.map(function (a) {
      return '<button type="button" data-act="pick" data-id="' + esc(a.destId) + '"><strong>' + esc(a.title) + "</strong><div class='" + PX + "-muted'>" + esc(a.detail) + "</div></button>";
    }).join("") + "</div>";
  }

  function home(app) {
    var cats = app.categories || [];
    var dest = '<div class="' + PX + '-areas">' + cats.map(function (c) {
      var n = (app.settingsForPage(c.id, null) || []).length;
      return '<button type="button" class="' + PX + '-area" data-act="domain" data-id="' + esc(c.id) + '" data-flip-id="' + esc(c.id) + '">' + ico() + "<strong>" + esc(c.title) + '</strong><span class="' + PX + '-muted">' + esc(c.description) + "</span><span class=\"" + PX + '-count">' + n + " settings</span></button>";
    }).join("") + "</div>";
    var product = app.productSettingCount || 828;
    var index = '<button type="button" class="' + PX + '-indexcard" data-act="all">' +
      "<strong>All Settings</strong>" +
      '<span class="' + PX + '-muted">First-class project index. Facets stay on this page. The list is virtualized so all ' + product + " current-project rows stay reachable.</span>" +
      '<span class="' + PX + '-count">' + product + " settings · filters · detail</span></button>";
    return '<div class="' + PX + "-home " + PX + '-scroll pmv2-scroll' + transferClass(app) + '">' +
      '<p class="' + PX + '-muted">Project ' + esc(app.project.name) + "</p>" +
      '<h1 class="' + PX + '-h1">Settings</h1>' +
      '<p class="' + PX + '-lede">Search first. The twelve destinations below are the current categories. All Settings is the complete faceted index for this project — not a dump, and not a live link to another project.</p>' +
      "<h2>Needs attention</h2>" + attention(app) +
      workBox(app) +
      "<h2>Destinations</h2>" + dest +
      "<h2>Index</h2>" + index +
      "<h2>Recent in this project</h2>" +
      '<p class="' + PX + '-muted">Theme, default model, and FileSafe rules were last changed here.</p>' +
      '<p class="' + PX + '-muted"><button type="button" data-act="copy">Copy Settings From Another Project</button> is a one-time action. Projects stay independent.</p>' +
      "</div>";
  }

  function filteredIndex(app) {
    var f = ensureFacets(app);
    if (window.PMv2 && typeof window.PMv2.filterAllSettings === "function") {
      var raw = window.PMv2.filterAllSettings(app, {
        domain: f.domain,
        kind: f.type,
        exposure: f.exposure,
        changed: f.changed,
        state: f.state,
        entry: f.entry,
        attention: f.attention,
        synthetic: f.synthetic,
        q: f.q
      }) || [];
      var mapped = raw.map(mapPMv2AllItem).filter(Boolean);
      if (f.tier) {
        mapped = mapped.filter(function (item) {
          if (item.synthetic) return true;
          var row = app.setting && app.setting(item.id);
          if (!row) return true;
          return row.tier === f.tier;
        });
      }
      return mapped;
    }
    var inv = (window.PMv2.inventory && window.PMv2.inventory.settings) || [];
    var q = String(f.q || "").trim().toLowerCase();
    var items = [];
    var useCatalog = f.entry === "manager" || f.entry === "workflow" || f.entry === "diagnostic";
    var useSettings = f.entry === "" || f.entry === "setting" || f.entry === "action";
    var i, s, path, hay, model, st, rid, e, kind, domain;
    if (useSettings) {
      for (i = 0; i < inv.length; i++) {
        s = inv[i];
        if (f.domain && s.id.split(".")[0] !== f.domain) continue;
        if (f.type && s.type !== f.type) continue;
        if (f.tier && s.tier !== f.tier) continue;
        if (f.exposure && settingExposure(s) !== f.exposure) continue;
        st = settingState(app, s);
        if (f.state && st !== f.state) continue;
        if (f.changed) {
          model = app.controlModel(s.id);
          if (!model || !model.changed) continue;
        }
        path = settingPath(app, s);
        if (q) {
          hay = (s.label + " " + path + " " + (s.desc || "") + " " + ((s.search || []).join(" "))).toLowerCase();
          if (hay.indexOf(q) === -1) continue;
        }
        rid = "setting:" + s.id;
        if (f.entry === "action" && s.type !== "action") continue;
        if (f.attention && !itemNeedsAttention(app, s)) continue;
        items.push({
          id: s.id,
          resultId: rid,
          label: s.label,
          path: path,
          type: s.type,
          tier: s.tier || "simple",
          exposure: settingExposure(s),
          synthetic: false
        });
      }
    }
    if (useCatalog) {
      var catalog = collectCatalog(f.entry);
      for (i = 0; i < catalog.length; i++) {
        e = catalog[i];
        kind = catalogEntryKind(e);
        if (f.entry && kind !== f.entry) continue;
        domain = e.dest && e.dest.domain;
        if (f.domain && domain !== f.domain) continue;
        st = catalogState(e);
        if (f.state && st !== f.state) continue;
        if (q) {
          hay = (e.label + " " + (e.path || "") + " " + (e.terms || "")).toLowerCase();
          if (hay.indexOf(q) === -1) continue;
        }
        if (f.attention && !itemNeedsAttention(app, { id: e.settingId || e.id, tier: e.tier })) continue;
        if (e.synthetic) continue;
        items.push({
          id: e.id,
          resultId: e.id,
          label: e.label,
          path: e.path,
          type: e.type,
          synthetic: false
        });
      }
    }
    if (f.synthetic) {
      for (i = 0; i < 2000; i++) {
        s = "Synthetic scale row " + i;
        if (q && s.toLowerCase().indexOf(q) === -1) continue;
        items.push({
          id: "synthetic:stress-" + i,
          resultId: "synthetic:stress-" + i,
          label: s,
          path: "Synthetic overlay",
          type: "setting",
          tier: "simple",
          synthetic: true
        });
      }
    }
    return items;
  }

  function allSettings(app) {
    var f = ensureFacets(app);
    var cats = app.categories || [];
    var types = ["select", "toggle", "slider", "number", "action", "radio", "list", "multiselect", "keyvalue", "text", "path"];
    var product = app.productSettingCount || 828;
    var selected = app.route && app.route.row;
    var isSynthetic = selected ? String(selected).indexOf("synthetic:") === 0 : false;
    var setting = selected && !isSynthetic && app.setting ? app.setting(selected) : null;
    var facetDomain = '<button type="button" data-act="facet-domain" data-id=""' + (!f.domain ? ' aria-current="true"' : "") + ">All categories</button>" +
      cats.map(function (c) {
        return '<button type="button" data-act="facet-domain" data-id="' + esc(c.id) + '"' + (f.domain === c.id ? ' aria-current="true"' : "") + ">" + esc(c.title) + "</button>";
      }).join("");
    var facetType = '<button type="button" data-act="facet-type" data-id=""' + (!f.type ? ' aria-current="true"' : "") + ">All types</button>" +
      types.map(function (t) {
        return '<button type="button" data-act="facet-type" data-id="' + esc(t) + '"' + (f.type === t ? ' aria-current="true"' : "") + ">" + esc(humanType(t)) + "</button>";
      }).join("");
    var detail = "";
    if (selected && String(selected).indexOf("synthetic:") === 0) {
      detail = '<h1 class="' + PX + '-h1">Synthetic overlay</h1><p class="' + PX + '-lede">Labeled scale row, excluded from product inventory and from default search. It is not one of the ' + product + " current-project settings.</p>";
    } else if (setting) {
      detail = '<p class="' + PX + '-muted">' + esc(settingPath(app, setting)) + "</p>" +
        control(app, setting.id) +
        '<p class="' + PX + '-muted">' + esc(humanType(setting.type)) + (setting.tier ? " · " + esc(setting.tier) : "") + " · " + esc(humanExposure(settingExposure(setting))) + "</p>" +
        '<button type="button" data-act="open-chapter" data-id="' + esc(resultIdFor(setting.id)) + '">Open in chapter</button>';
    } else {
      detail = '<p class="' + PX + '-muted">Select a row to read it here. The index stays open — facets filter this list instead of leaving All Settings.</p>';
    }
    var isDetail = !!(selected);
    return '<div class="' + PX + "-comp" + transferClass(app) + (isDetail ? " is-detail" : "") + (app.facetsOpen ? " is-facets" : "") + '">' +
      '<aside class="' + PX + '-facets pmv2-scroll">' +
      "<h2>Category</h2><div class=\"" + PX + '-facetlist">' + facetDomain + "</div>" +
      "<h2>Type</h2><div class=\"" + PX + '-facetlist">' + facetType + "</div>" +
      "<h2>Tier</h2><div class=\"" + PX + '-facetlist">' +
      '<button type="button" data-act="facet-tier" data-id=""' + (!f.tier ? ' aria-current="true"' : "") + ">All tiers</button>" +
      '<button type="button" data-act="facet-tier" data-id="simple"' + (f.tier === "simple" ? ' aria-current="true"' : "") + ">Simple</button>" +
      '<button type="button" data-act="facet-tier" data-id="advanced"' + (f.tier === "advanced" ? ' aria-current="true"' : "") + ">Advanced</button>" +
      "</div>" +
      "<h2>Exposure</h2><div class=\"" + PX + '-facetlist">' +
      '<button type="button" data-act="facet-exposure" data-id=""' + (!f.exposure ? ' aria-current="true"' : "") + ">All exposure</button>" +
      '<button type="button" data-act="facet-exposure" data-id="basic"' + (f.exposure === "basic" ? ' aria-current="true"' : "") + ">Basic</button>" +
      '<button type="button" data-act="facet-exposure" data-id="advanced"' + (f.exposure === "advanced" ? ' aria-current="true"' : "") + ">Advanced</button>" +
      '<button type="button" data-act="facet-exposure" data-id="hidden"' + (f.exposure === "hidden" ? ' aria-current="true"' : "") + ">Hidden</button>" +
      "</div>" +
      "<h2>This project</h2><div class=\"" + PX + '-facetlist">' +
      '<button type="button" data-act="facet-changed"' + (f.changed ? ' aria-pressed="true"' : ' aria-pressed="false"') + ">Changed from default</button>" +
      '<button type="button" data-act="facet-synth"' + (f.synthetic ? ' aria-pressed="true"' : ' aria-pressed="false"') + ">Include synthetic overlay</button>" +
      '<button type="button" data-act="facet-clear">Clear filters</button>' +
      "</div>" +
      "<h2>Availability</h2><div class=\"" + PX + '-facetlist">' +
      '<button type="button" data-act="facet-state" data-id=""' + (!f.state ? ' aria-current="true"' : "") + ">All</button>" +
      '<button type="button" data-act="facet-state" data-id="ready"' + (f.state === "ready" ? ' aria-current="true"' : "") + ">Ready</button>" +
      '<button type="button" data-act="facet-state" data-id="managed"' + (f.state === "managed" ? ' aria-current="true"' : "") + ">Managed</button>" +
      '<button type="button" data-act="facet-state" data-id="unavailable"' + (f.state === "unavailable" ? ' aria-current="true"' : "") + ">Unavailable</button>" +
      "</div>" +
      "<h2>Entry</h2><div class=\"" + PX + '-facetlist">' +
      '<button type="button" data-act="facet-entry" data-id=""' + (!f.entry ? ' aria-current="true"' : "") + ">All</button>" +
      '<button type="button" data-act="facet-entry" data-id="setting"' + (f.entry === "setting" ? ' aria-current="true"' : "") + ">Setting</button>" +
      '<button type="button" data-act="facet-entry" data-id="action"' + (f.entry === "action" ? ' aria-current="true"' : "") + ">Action</button>" +
      '<button type="button" data-act="facet-entry" data-id="manager"' + (f.entry === "manager" ? ' aria-current="true"' : "") + ">Manager</button>" +
      '<button type="button" data-act="facet-entry" data-id="workflow"' + (f.entry === "workflow" ? ' aria-current="true"' : "") + ">Workflow</button>" +
      '<button type="button" data-act="facet-entry" data-id="diagnostic"' + (f.entry === "diagnostic" ? ' aria-current="true"' : "") + ">Diagnostic</button>" +
      "</div>" +
      "<h2>Attention</h2><div class=\"" + PX + '-facetlist">' +
      '<button type="button" data-act="facet-attention"' + (f.attention ? ' aria-pressed="true"' : ' aria-pressed="false"') + ">Needs attention</button>" +
      "</div></aside>" +
      '<div class="' + PX + '-index">' +
      '<div class="' + PX + '-indexhead">' +
      '<button type="button" class="' + PX + '-narrowonly" data-act="toggle-facets">Filters</button>' +
      '<label class="' + PX + '-indexq"><span class="' + PX + '-muted">Filter index</span>' +
      '<input data-all-q type="search" value="' + esc(f.q || "") + '" placeholder="Narrow this list" aria-label="Filter All Settings index" autocomplete="off" spellcheck="false">' +
      "</label>" +
      '<p class="' + PX + '-muted" data-all-count>Virtualized product index</p>' +
      "</div>" +
      '<div class="' + PX + '-list pmv2-scroll" data-all-list="1" role="listbox" aria-label="All Settings"></div>' +
      "</div>" +
      '<div class="' + PX + '-detail pmv2-scroll">' +
      (isDetail ? '<button type="button" class="' + PX + '-narrowonly" data-act="clear-row">Back to list</button>' : "") +
      detail + "</div></div>";
  }

  function domain(app) {
    var c = app.cat(app.route.domain) || { title: "Settings", subgroups: [], description: "", id: app.route.domain };
    var page = app.route.page || ((c.subgroups || [])[0] || {}).id;
    var rows = app.settingsForPage(c.id, page);
    var mgrs = app.domainManagers[c.id] || [];
    var subnav = (c.subgroups || []).map(function (sg) {
      return '<button type="button" data-act="page" data-domain="' + esc(c.id) + '" data-id="' + esc(sg.id) + '"' + (sg.id === page ? ' aria-current="true"' : "") + ">" + esc(sg.title) + "</button>";
    }).join("");
    var mgrNav = mgrs.map(function (id) {
      var m = app.mgr(id);
      return '<button type="button" data-act="manager" data-id="' + esc(id) + '">' + esc(m ? m.title : id) + "</button>";
    }).join("");
    var defNav = "";
    if (c.id === "system") {
      defNav = (app.deferred || []).map(function (d) {
        return '<button type="button" data-act="deferred" data-id="' + esc(d.id) + '">' + esc(d.title) + "</button>";
      }).join("");
    }
    var pageTitle = (((c.subgroups || []).filter(function (sg) { return sg.id === page; })[0] || {}).title) || "Settings";
    return '<div class="' + PX + "-chapter" + transferClass(app) + (app.outlineOpen ? " is-outline" : "") + '">' +
      '<aside class="' + PX + '-outline pmv2-scroll">' +
      '<p class="' + PX + '-muted">Chapter</p>' +
      "<strong>" + esc(c.title) + "</strong>" +
      "<h2>Pages</h2><div class=\"" + PX + '-facetlist">' + subnav + "</div>" +
      (mgrNav ? "<h2>Managers</h2><div class=\"" + PX + '-facetlist">' + mgrNav + "</div>" : "") +
      (defNav ? "<h2>Owner modules</h2><div class=\"" + PX + '-facetlist">' + defNav + "</div>" : "") +
      '<button type="button" data-act="all">Open All Settings</button>' +
      "</aside>" +
      '<div class="' + PX + '-page pmv2-scroll">' +
      '<button type="button" class="' + PX + '-narrowonly" data-act="toggle-outline">Chapter outline</button>' +
      '<div data-flip-target="' + esc(c.id) + '"><h1 class="' + PX + '-h1">' + esc(c.title) + "</h1></div>" +
      '<p class="' + PX + '-lede">' + esc(c.description) + "</p>" +
      workBox(app) +
      "<h2>" + esc(pageTitle) + "</h2>" +
      (rows.length ? rows.map(function (s) { return control(app, s.id); }).join("") : '<p class="' + PX + '-muted">No settings on this page.</p>') +
      "</div></div>";
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
    return t;
  }

  function managerView(app) {
    var m = app.mgr(app.route.manager);
    if (!m) return '<div class="' + PX + '-page pmv2-scroll">Missing manager</div>';
    var objs = app.objectsFor(m.id) || [];
    var obj = objs.filter(function (o) { return o.id === app.route.object; })[0] || objs[0];
    var tab = app.route.page || (m.tabs && m.tabs[0]) || "overview";
    var tabs = (m.tabs || []).map(function (t) {
      var label = m.id === "providers" ? providerTabLabel(t) : t;
      return '<button type="button" data-act="mtab" data-id="' + esc(t) + '" data-row-id="' + esc(m.id + ":" + t) + '"' + (t === tab ? ' aria-current="true"' : "") + ">" + esc(label) + "</button>";
    }).join("");
    var roster = objs.map(function (o) {
      return '<button type="button" data-act="object" data-id="' + esc(o.id) + '" data-row-id="' + esc(o.id) + '"' + (obj && o.id === obj.id ? ' aria-current="true"' : "") + ">" + esc(o.label) + " · " + esc(String(o.availability || "ready").replace(/_/g, " ")) + "</button>";
    }).join("");
    var detail = "";
    if (m.id === "providers" && obj) {
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
          { k: "Usage", v: obj.usage, row: "usage-projection" },
          { k: "Setup", v: obj.setup, row: obj.id === "local-ollama" ? "install-official" : "account-default" }
        ].map(function (item) {
          return '<div class="' + PX + '-stat" data-row-id="' + esc(item.row) + '"><div class="' + PX + '-muted">' + esc(item.k) + "</div><strong>" + esc(item.v || "—") + "</strong></div>";
        }).join("") + "</div>";
      if (obj.id === "local-ollama") {
        detail += officialCliActions(app, obj);
      }
      if (tab === "installations") {
        var installRows = (app.installs || []).filter(function (i) {
          return i.provider === obj.id;
        });
        detail += "<h2>Installations</h2>" +
          '<p class="' + PX + '-muted">Human identity is the host-facing install. Advanced identity is owner, official source, and manual-only proof. They are not the same as account or model identity.</p>' +
          (installRows.length ? installRows.map(installIdentityCard).join("") : '<p class="' + PX + '-muted">None</p>');
      }
      if (tab === "usage") {
        detail += "<h2>When included usage ends</h2>" +
          '<p data-row-id="usage-end">' + esc(providerUsageEnd(obj)) + "</p>" +
          '<p class="' + PX + '-muted">Settings owns the continuation. Usage owns the projection and never writes this choice.</p>' +
          '<p data-row-id="usage-projection">Projection: ' + esc(obj.usage || "—") + "</p>";
      }
      if (tab === "accounts") {
        detail += "<h2>Routing / fallback</h2>" +
          '<p data-row-id="routing-fallback">' + esc(providerRouting(obj)) + "</p>" +
          '<p data-row-id="account-default">Selected account: ' + esc(obj.account || "—") + " · " + esc(obj.product || "—") + "</p>" +
          '<p class="' + PX + '-muted">Credentials stay on the account. Switching route does not copy secrets.</p>';
      }
    } else {
      detail = '<h1 class="' + PX + '-h1">' + esc(m.title) + "</h1><p class=\"" + PX + '-lede">' + esc(m.purpose) + "</p>";
      if (obj) detail += '<div data-row-id="' + esc(obj.id) + '" data-id="' + esc(obj.id) + '"><strong>' + esc(obj.label) + "</strong> · " + esc(obj.kind) + "</div>";
    }
    var relatedSettings = app.settingsForPage(m.domain, null).slice(0, 8).map(function (s) { return control(app, s.id); }).join("");
    return '<div class="' + PX + "-mgrwrap" + transferClass(app) + (app.rosterOpen ? " is-roster" : "") + '">' +
      '<div class="' + PX + '-mtabs pmv2-scroll">' +
      '<button type="button" class="' + PX + '-narrowonly" data-act="toggle-roster">' + (app.rosterOpen ? "Hide list" : "Show list") + "</button>" +
      tabs + "</div>" +
      workBox(app) +
      '<div class="' + PX + '-mgr">' +
      '<div class="' + PX + '-roster pmv2-scroll">' + roster + "</div>" +
      '<div class="' + PX + '-form pmv2-scroll">' + detail + "<h2>Project settings</h2>" + relatedSettings + "</div>" +
      "</div></div>";
  }

  function copyView(app) {
    var p = app.copyPreview();
    var srcs = (app.projects || []).filter(function (x) { return !x.current; }).map(function (x) {
      return '<button type="button" data-act="copy-src" data-id="' + esc(x.id) + '"' + (app.copy.sourceId === x.id ? ' aria-current="true"' : "") + ">" + esc(x.name) + "</button>";
    }).join("");
    var cats = (app.categories || []).map(function (c) {
      var on = (app.copy.categories || []).indexOf(c.id) !== -1;
      return '<label class="' + PX + '-check"><input type="checkbox" data-act="copy-cat" data-id="' + esc(c.id) + '"' + (on ? " checked" : "") + "> " + esc(c.title) + "</label>";
    }).join("");
    var prev;
    if (p) {
      prev = '<div class="' + PX + '-coprev">' +
        "<p>Additions " + p.counts.additions + " · Replacements " + p.counts.replacements +
        " · Unchanged " + p.counts.unchanged + " · Unavailable " + p.counts.unavailable +
        " · Conflicts " + p.counts.conflicts + "</p>" +
        '<p class="' + PX + '-muted">Account and credential references copy. Secrets never copy. Projects stay independent — no sync, profiles, or inheritance.</p>' +
        '<p class="' + PX + '-muted">' + esc(p.backend || "RuntimeResourceGovernor+projectStore") + ". RuntimeResourceGovernor admits this copy. Project store persists this project only.</p>" +
        copyPreviewSamples(app, p) +
        "</div>";
    } else {
      prev = "<p>Select a source project.</p>";
    }
    var actions;
    if (app.copy.step === "receipt" && app.copy.receipt) {
      actions = copyReceiptFacts(app.copy.receipt) +
        '<button type="button" data-act="copy-rollback">Roll back to restore point</button>';
    } else if (app.copy.step === "rolled_back") {
      actions = "<p>Rollback complete. This project’s previous values were restored.</p>";
    } else if (app.copy.step === "restore" || app.copy.step === "applying" || app.copy.step === "verifying") {
      actions = "";
    } else {
      actions = '<button type="button" data-act="copy-apply">Create restore point and copy</button>';
    }
    var tx = (window.PMv2 && typeof window.PMv2.copyTransactionHtml === "function")
      ? window.PMv2.copyTransactionHtml(app, PX)
      : "";
    return '<div class="' + PX + "-sheet " + PX + "-copy " + PX + '-scroll pmv2-scroll' + transferClass(app) + '">' +
      '<h1 class="' + PX + '-h1">Copy Settings From Another Project</h1>' +
      "<p>One-time copy into <strong>" + esc(app.project.name) + "</strong>. No ongoing sync, profiles, or inheritance.</p>" +
      "<h2>1. Source project</h2><div class=\"" + PX + '-copy-src ' + PX + '-facetlist">' + srcs + "</div>" +
      "<h2>2. Categories</h2><div class=\"" + PX + '-copy-cats ' + PX + '-copcats">' + cats + "</div>" +
      "<h2>3. Preview</h2>" + prev +
      tx +
      actions + workBox(app) +
      "</div>";
  }

  function deferredView(app) {
    var d = (app.deferred || []).filter(function (x) { return x.id === app.route.deferred; })[0];
    if (!d) return "<div>Unknown owner module</div>";
    return '<div class="' + PX + "-sheet " + PX + '-scroll pmv2-scroll' + transferClass(app) + '">' +
      '<h1 class="' + PX + '-h1">' + esc(d.title) + "</h1>" +
      "<p>This destination is owned by <strong>" + esc(d.owner) + "</strong>. Settings does not invent a backend for it.</p>" +
      "<p>Return contract: Back restores the previous Settings location. Close Settings returns to the opening surface.</p>" +
      '<button type="button" data-act="back">Return to Settings</button>' +
      "</div>";
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
    if (!host) {
      virt = null;
      return;
    }
    var items = filteredIndex(app);
    var count = root.querySelector("[data-all-count]");
    var product = app.productSettingCount || 828;
    if (count) {
      count.textContent = items.length + " shown · " + product + " product settings" + (ensureFacets(app).synthetic ? " plus labeled overlay" : "");
    }
    var selected = app.route && app.route.row;
    virt = window.PMv2.virtualList(host, items, ROW_H, function (item) {
      var on = item.id === selected;
      return '<button type="button" class="' + PX + '-vrow" role="option" aria-selected="' + (on ? "true" : "false") +
        '" data-act="row" data-id="' + esc(item.resultId || resultIdFor(item.id)) + '" data-row-id="' + esc(item.id) + '"' +
        (item.synthetic ? ' data-synthetic="1"' : "") + ">" +
        "<b>" + esc(item.label) + "</b>" +
        '<span class="path">' + esc(item.path) + (item.synthetic ? " · synthetic overlay" : "") + "</span>" +
        '<span class="meta">' + esc(humanType(item.type)) + (item.exposure ? " · " + esc(humanExposure(item.exposure)) : "") + "</span></button>";
    });
    if (selected) {
      var idx = -1;
      var i;
      for (i = 0; i < items.length; i++) {
        if (items[i].id === selected) { idx = i; break; }
      }
      if (idx >= 0) {
        host.scrollTop = Math.max(0, idx * ROW_H - Math.floor((host.clientHeight || 400) / 3));
        if (virt && virt.refresh) virt.refresh();
      }
    }
    window.requestAnimationFrame(function () {
      if (virt && virt.refresh) virt.refresh();
    });
  }

  function bind(app, root) {
    var search = root.querySelector("[data-search]");
    if (search) {
      search.oninput = function () {
        app.setQuery(search.value);
        var ranked = hitsForQuery(app);
        if (ranked.length) app.selectedResultId = ranked[0].id;
      };
      search.onkeydown = function (ev) {
        var list = hitsForQuery(app);
        var ids = list.map(function (x) { return x.id; });
        if (ev.key === "Enter") {
          ev.preventDefault();
          if (!ids.length) return;
          var pick = app.selectedResultId && ids.indexOf(app.selectedResultId) >= 0 ? app.selectedResultId : ids[0];
          if (pick) app.pickResult(pick);
          return;
        }
        if (!ids.length) return;
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
        }
      };
    }
    var allQ = root.querySelector("[data-all-q]");
    if (allQ) {
      allQ.oninput = function () {
        ensureFacets(app).q = allQ.value;
        app.paint();
      };
    }
    function applyAct(el) {
      var act = el.getAttribute("data-act");
      var id = el.getAttribute("data-id");
      var f = ensureFacets(app);
      if (act === "back") app.back();
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
      else if (act === "open-chapter") {
        app.pickResult(resultIdFor(id));
      } else if (act === "facet-domain") { f.domain = id || ""; app.paint(); }
      else if (act === "facet-type") { f.type = id || ""; app.paint(); }
      else if (act === "facet-tier") { f.tier = id || ""; app.paint(); }
      else if (act === "facet-exposure") { f.exposure = id || ""; app.paint(); }
      else if (act === "facet-state") { f.state = id || ""; app.paint(); }
      else if (act === "facet-entry") { f.entry = id || ""; app.paint(); }
      else if (act === "facet-changed") { f.changed = !f.changed; app.paint(); }
      else if (act === "facet-synth") { f.synthetic = !f.synthetic; app.paint(); }
      else if (act === "facet-attention") { f.attention = !f.attention; app.paint(); }
      else if (act === "facet-clear") {
        app.allFacets = emptyFacets();
        app.paint();
      } else if (act === "toggle-facets") { app.facetsOpen = !app.facetsOpen; app.paint(); }
      else if (act === "toggle-outline") { app.outlineOpen = !app.outlineOpen; app.paint(); }
      else if (act === "toggle-roster") { app.rosterOpen = !app.rosterOpen; app.paint(); }
      else if (act === "clear-row") {
        app.navigate({ name: "all" }, { replace: true });
      } else if (act === "toggle") {
        var cur = app.controlModel(id);
        app.setValue(id, !(cur && cur.value));
      } else if (act === "select") app.setValue(id, el.value);
      else if (act === "number") app.setValue(id, Number(el.value));
      else if (act === "text") app.setValue(id, el.value);
      else if (act === "do") app.receipt("Ran " + id + " for this project.", "info");
      else if (act === "why") app.openDetails(id);
      else if (act === "details-close") app.closeDetails();
      else if (act === "install-official") {
        startOfficialInstall(app, id || "local-ollama");
      } else if (act === "confirm-official") {
        confirmOfficialInstall(app, id || "local-ollama");
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
    root.onclick = function (ev) {
      var el = ev.target.closest("[data-act]");
      if (!el) return;
      if (el.matches("select, input[type='checkbox'], input[type='number'], input[type='text'], input[type='search']")) return;
      applyAct(el);
    };
    root.onchange = function (ev) {
      var el = ev.target.closest("[data-act]");
      if (!el) return;
      applyAct(el);
    };
  }

  function render(app) {
    var root = document.getElementById(ROOT_ID);
    if (virt && virt.dispose) virt.dispose();
    virt = null;
    ensureFacets(app);
    var detailsOpen = !!app.detailsId;
    root.className = PX + (detailsOpen ? " is-details" : "");
    if (document.body) document.body.classList.toggle("is-details", detailsOpen);
    if (document.documentElement) document.documentElement.classList.toggle("is-details", detailsOpen);
    root.setAttribute("data-pmv2-root", "1");
    root.setAttribute("data-layout", LAYOUT);
    root.setAttribute("data-route", (app.route && app.route.name) || "home");
    root.setAttribute("data-dir", app._navDir || "fwd");
    root.setAttribute("data-pane", detailsOpen ? "details" : ((app.route && app.route.name) || "main"));
    var active = document.activeElement;
    var keepSearch = active && active.getAttribute && active.getAttribute("data-search") != null;
    var keepAllQ = active && active.getAttribute && active.getAttribute("data-all-q") != null;
    var caret = (keepSearch || keepAllQ) ? active.selectionStart : null;
    root.innerHTML = chrome(app) + '<div class="' + PX + '-body">' + body(app) + detailsDrawer(app) + "</div>";
    bind(app, root);
    fillAll(app, root);
    if (keepSearch || keepAllQ) {
      var el = root.querySelector(keepSearch ? "[data-search]" : "[data-all-q]");
      if (el) {
        el.focus();
        try { if (caret != null) el.setSelectionRange(caret, caret); } catch (err) {}
      }
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (window.PMShell) window.PMShell.init();
    var app = window.PMv2.createApp({ namespace: "c07", root: document.getElementById(ROOT_ID), render: render });
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
      if (app.facetsOpen) { app.facetsOpen = false; app.paint(); return; }
      if (app.outlineOpen) { app.outlineOpen = false; app.paint(); return; }
      if (app.rosterOpen) { app.rosterOpen = false; app.paint(); return; }
      var f = app.allFacets;
      if (f && (f.domain || f.type || f.tier || f.exposure || f.state || f.entry || f.changed || f.synthetic || f.attention || f.q)) {
        app.allFacets = emptyFacets();
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
    window.__pmv2App = app;
  });
})();
