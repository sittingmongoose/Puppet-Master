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

  function ensureFacets(app) {
    if (!app.allFacets) {
      app.allFacets = { domain: "", type: "", tier: "", exposure: "", changed: false, synthetic: false, q: "" };
    }
    if (app.allFacets.exposure == null) app.allFacets.exposure = "";
    return app.allFacets;
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
    var blocks = [];
    function rowFromId(kind, id, extra) {
      var s = app.setting(id);
      var cur = app.values && app.values[id];
      var next = src[id];
      var label = s ? s.label : id;
      var path = s ? settingPath(app, s) : id;
      return '<div class="' + PX + '-coprev-row" data-kind="' + esc(kind) + '">' +
        "<div><strong>" + esc(label) + "</strong><span class=\"" + PX + '-muted">' + esc(path) + "</span></div>" +
        (extra || ('<span class="from">' + esc(fmtCopyVal(cur)) + '</span><span class="arrow" aria-hidden="true">→</span><span class="to">' + esc(fmtCopyVal(next)) + "</span>")) +
        "</div>";
    }
    function rowFromItem(kind, item) {
      var label = item.label || item.id;
      var path = item.path || item.id;
      var change = "";
      if (kind === "additions") {
        change = '<span class="to">' + esc(fmtCopyVal(item.to != null ? item.to : src[item.id])) + "</span>";
      } else if (kind === "unchanged") {
        change = '<span class="same">' + esc(fmtCopyVal(item.to != null ? item.to : item.from)) + "</span>";
      } else {
        change = '<span class="from">' + esc(fmtCopyVal(item.from)) + '</span><span class="arrow" aria-hidden="true">→</span><span class="to">' + esc(fmtCopyVal(item.to)) + "</span>";
      }
      return '<div class="' + PX + '-coprev-row" data-kind="' + esc(kind) + '">' +
        "<div><strong>" + esc(label) + "</strong><span class=\"" + PX + '-muted">' + esc(path) + "</span></div>" +
        change +
        (item.reason ? '<span class="' + PX + '-muted">' + esc(item.reason) + "</span>" : "") +
        "</div>";
    }
    function section(title, kind, itemsKey, idsKey, countKey, truncKey, renderExtra) {
      var items = p[itemsKey];
      var ids = p[idsKey];
      var rows = "";
      var count = 0;
      if (items && items.length) {
        count = (p.counts && p.counts[countKey]) || items.length;
        rows = items.map(function (item) { return rowFromItem(kind, item); }).join("");
      } else if (ids && ids.length) {
        count = (p.counts && p.counts[countKey]) || ids.length;
        rows = ids.map(function (id) {
          return rowFromId(kind, id, renderExtra ? renderExtra(id) : "");
        }).join("");
      } else {
        return "";
      }
      var more = "";
      if (truncKey && p.truncated && p.truncated[truncKey] > 0) {
        more = '<p class="' + PX + '-muted">' + p.truncated[truncKey] + " more not shown</p>";
      }
      return "<section class=\"" + PX + '-coprev-block" data-blueprint="' + esc(kind) + '">' +
        "<h3>" + esc(title) + ' <span class="' + PX + '-muted">(' + count + ") sample</span></h3>" +
        '<div class="' + PX + '-coprev-rows">' + rows + "</div>" + more + "</section>";
    }
    blocks.push(section("Replacements", "replacements", "replacementItems", "replacements", "replacements", "replacements"));
    blocks.push(section("Additions", "additions", "additionItems", "additions", "additions", "additions", function (id) {
      return '<span class="to">' + esc(fmtCopyVal(src[id])) + "</span>";
    }));
    blocks.push(section("Unchanged", "unchanged", "unchangedItems", "unchanged", "unchanged", "unchanged", function (id) {
      return '<span class="same">' + esc(fmtCopyVal(app.values && app.values[id])) + "</span>";
    }));
    if (p.unavailable && p.unavailable.length) {
      blocks.push('<section class="' + PX + '-coprev-block" data-blueprint="unavailable"><h3>Unavailable <span class="' + PX + '-muted">(' + ((p.counts && p.counts.unavailable) || p.unavailable.length) + ")</span></h3><div class=\"" + PX + '-coprev-rows">' +
        p.unavailable.map(function (u) {
          return '<div class="' + PX + '-coprev-row" data-kind="unavailable"><div><strong>' + esc(u.label || u.id) + "</strong></div><span class=\"" + PX + '-muted">' + esc(u.reason || "") + "</span></div>";
        }).join("") + "</div></section>");
    }
    if (p.conflicts && p.conflicts.length) {
      blocks.push('<section class="' + PX + '-coprev-block" data-blueprint="conflicts"><h3>Conflicts <span class="' + PX + '-muted">(' + ((p.counts && p.counts.conflicts) || p.conflicts.length) + ")</span></h3><div class=\"" + PX + '-coprev-rows">' +
        p.conflicts.map(function (c) {
          return '<div class="' + PX + '-coprev-row" data-kind="conflict"><div><strong>' + esc(c.label || c.id) + "</strong></div><span class=\"" + PX + '-muted">' + esc(c.reason || "") + "</span></div>";
        }).join("") + "</div></section>");
    }
    return blocks.filter(Boolean).join("");
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
      '<p class="' + PX + '-muted">' + esc(d.label) + "</p>" +
      (d.desc ? '<p class="' + PX + '-lede">' + esc(d.desc) + "</p>" : "") +
      '<div class="' + PX + '-facts">' +
      factRow("Requested", fmtCopyVal(d.requested)) +
      factRow("Effective", fmtCopyVal(d.effective)) +
      factRow("Origin", origin.label || "—") +
      factRow("Policy floor", d.policyFloor || "—") +
      factRow("Persistence", "Current project") +
      factRow("Destination", d.scopeNote) +
      factRow("Backend", (d.simulated ? "Simulated · " : "") + (d.backend || "sessionStorage")) +
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
    }].concat(rest).slice(0, 24);
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
    if (String(rowId).indexOf("synthetic:") === 0) {
      app.pickResult(rowId);
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
      path: "Path"
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
    if (prev.manager && app.mgr(prev.manager)) return "Back to " + app.mgr(prev.manager).title;
    if (prev.domain && app.cat(prev.domain)) return "Back to " + app.cat(prev.domain).title;
    return "Back";
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
        drop = '<div class="' + PX + '-drop pmv2-scroll" role="listbox"><div class="' + PX + '-hit">No matching settings</div></div>';
      } else if (hits.length) {
        drop = '<div class="' + PX + '-drop pmv2-scroll" role="listbox">' + groupHits(hits).map(function (g) {
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
      return '<button type="button" class="' + PX + '-area" data-act="domain" data-id="' + esc(c.id) + '">' + ico() + "<strong>" + esc(c.title) + '</strong><span class="' + PX + '-muted">' + esc(c.description) + "</span><span class=\"" + PX + '-count">' + n + " settings</span></button>";
    }).join("") + "</div>";
    var product = app.productSettingCount || 828;
    var index = '<button type="button" class="' + PX + '-indexcard" data-act="all">' +
      "<strong>All Settings</strong>" +
      '<span class="' + PX + '-muted">First-class project index. Facets stay on this page. The list is virtualized so all ' + product + " current-project rows stay reachable.</span>" +
      '<span class="' + PX + '-count">' + product + " settings · filters · detail</span></button>";
    return '<div class="' + PX + "-home " + PX + '-scroll pmv2-scroll ' + PX + '-slide">' +
      '<p class="' + PX + '-muted">Project ' + esc(app.project.name) + "</p>" +
      '<h1 class="' + PX + '-h1">Settings</h1>' +
      '<p class="' + PX + '-lede">Search first. The twelve destinations below are the current categories. All Settings is the complete faceted index for this project — not a dump, and not a live link to another project.</p>' +
      "<h2>Needs attention</h2>" + attention(app) +
      "<h2>Destinations</h2>" + dest +
      "<h2>Index</h2>" + index +
      "<h2>Recent in this project</h2>" +
      '<p class="' + PX + '-muted">Theme, default model, and FileSafe rules were last changed here.</p>' +
      '<p class="' + PX + '-muted"><button type="button" data-act="copy">Copy Settings From Another Project</button> is a one-time action. Projects stay independent.</p>' +
      workBox(app) +
      "</div>";
  }

  function filteredIndex(app) {
    var f = ensureFacets(app);
    var inv = (window.PMv2.inventory && window.PMv2.inventory.settings) || [];
    var q = String(f.q || "").trim().toLowerCase();
    var items = [];
    var i, s, path, hay, model;
    for (i = 0; i < inv.length; i++) {
      s = inv[i];
      if (f.domain && s.id.split(".")[0] !== f.domain) continue;
      if (f.type && s.type !== f.type) continue;
      if (f.tier && s.tier !== f.tier) continue;
      if (f.exposure && settingExposure(s) !== f.exposure) continue;
      if (f.changed) {
        model = app.controlModel(s.id);
        if (!model || !model.changed) continue;
      }
      path = settingPath(app, s);
      if (q) {
        hay = (s.label + " " + path + " " + (s.desc || "") + " " + ((s.search || []).join(" "))).toLowerCase();
        if (hay.indexOf(q) === -1) continue;
      }
      items.push({
        id: s.id,
        resultId: "setting:" + s.id,
        label: s.label,
        path: path,
        type: s.type,
        tier: s.tier || "simple",
        exposure: settingExposure(s),
        synthetic: false
      });
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
    return '<div class="' + PX + "-comp " + PX + '-slide' + (isDetail ? " is-detail" : "") + (app.facetsOpen ? " is-facets" : "") + '">' +
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
    return '<div class="' + PX + "-chapter " + PX + '-slide' + (app.outlineOpen ? " is-outline" : "") + '">' +
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
      '<h1 class="' + PX + '-h1">' + esc(c.title) + "</h1>" +
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
      return '<button type="button" data-act="mtab" data-id="' + esc(t) + '"' + (t === tab ? ' aria-current="true"' : "") + ">" + esc(label) + "</button>";
    }).join("");
    var roster = objs.map(function (o) {
      return '<button type="button" data-act="object" data-id="' + esc(o.id) + '"' + (obj && o.id === obj.id ? ' aria-current="true"' : "") + ">" + esc(o.label) + " · " + esc(String(o.availability || "ready").replace(/_/g, " ")) + "</button>";
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
        detail += "<p>Ollama is not bundled. Install from the official Ollama source for This PC / Native Windows. Authentication is a separate step.</p>" +
          '<button type="button" data-act="install-official" data-id="local-ollama" data-row-id="install-official">Install from official source</button>';
      }
      if (tab === "installations") {
        detail += "<h2>Installations</h2>" + (app.installs || []).filter(function (i) {
          return i.provider === obj.id || obj.id === "anthropic";
        }).map(function (i) {
          return '<div data-row-id="' + esc(i.id) + '">' + esc(i.label) + " · " + esc(i.host) + " · " + (i.selected ? "Selected" : (i.shadowed ? "Shadowed" : "Available")) + (i.manualOnly ? " · Unknown owner — manual only" : "") + "</div>";
        }).join("");
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
    return '<div class="' + PX + "-mgrwrap " + PX + '-slide">' +
      '<div class="' + PX + '-mtabs pmv2-scroll">' + tabs + "</div>" +
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
        '<p class="' + PX + '-muted">Account and credential references copy. Secrets never copy. Projects stay independent.</p>' +
        '<p class="' + PX + '-muted">' + (p.simulated ? "Simulated · " : "") + esc(p.backend || "sessionStorage") + "</p>" +
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
    } else {
      actions = '<button type="button" data-act="copy-apply">Create restore point and copy</button>';
    }
    return '<div class="' + PX + "-sheet " + PX + '-scroll pmv2-scroll ' + PX + '-slide">' +
      '<h1 class="' + PX + '-h1">Copy Settings From Another Project</h1>' +
      "<p>One-time copy into <strong>" + esc(app.project.name) + "</strong>. No ongoing link or shared settings profile.</p>" +
      "<h2>Source project</h2><div class=\"" + PX + '-facetlist">' + srcs + "</div>" +
      "<h2>Categories</h2><div class=\"" + PX + '-copcats">' + cats + "</div>" +
      "<h2>Preview</h2>" + prev + actions + workBox(app) +
      "</div>";
  }

  function deferredView(app) {
    var d = (app.deferred || []).filter(function (x) { return x.id === app.route.deferred; })[0];
    if (!d) return "<div>Unknown owner module</div>";
    return '<div class="' + PX + "-sheet " + PX + '-scroll pmv2-scroll ' + PX + '-slide">' +
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
      else if (act === "facet-changed") { f.changed = !f.changed; app.paint(); }
      else if (act === "facet-synth") { f.synthetic = !f.synthetic; app.paint(); }
      else if (act === "facet-clear") {
        app.allFacets = { domain: "", type: "", tier: "", exposure: "", changed: false, synthetic: false, q: "" };
        app.paint();
      } else if (act === "toggle-facets") { app.facetsOpen = !app.facetsOpen; app.paint(); }
      else if (act === "toggle-outline") { app.outlineOpen = !app.outlineOpen; app.paint(); }
      else if (act === "clear-row") {
        app.navigate({ name: "all" }, { replace: true });
      } else if (act === "toggle") {
        var cur = app.controlModel(id);
        app.setValue(id, !(cur && cur.value));
      } else if (act === "select") app.setValue(id, el.value);
      else if (act === "number") app.setValue(id, Number(el.value));
      else if (act === "text") app.setValue(id, el.value);
      else if (act === "do") app.receipt("Ran " + id + " for this project (simulated).", "info");
      else if (act === "why") app.openDetails(id);
      else if (act === "details-close") app.closeDetails();
      else if (act === "install-official") {
        if (!runOfficialCli(app, id || "local-ollama")) {
          app.work = {
            title: "Install Ollama",
            human_phase: "Waiting for explicit Install",
            state: "waiting_user",
            wait_reason: "Official source confirmation",
            progress_kind: "none",
            progress_source: "provider setup",
            last_known_good: true,
            message: "Not bundled. Not silently installed."
          };
          app.receipt("Install starts only after you confirm the official source (simulated).", "info");
          app.paint();
        }
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
      if (el.matches("select, textarea, input[type='checkbox'], input[type='number'], input[type='text'], input[type='search']")) return;
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
    root.className = PX;
    root.setAttribute("data-pmv2-root", "1");
    root.setAttribute("data-layout", LAYOUT);
    root.setAttribute("data-route", (app.route && app.route.name) || "home");
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
      var f = app.allFacets;
      if (f && (f.domain || f.type || f.tier || f.exposure || f.changed || f.synthetic || f.q)) {
        app.allFacets = { domain: "", type: "", tier: "", exposure: "", changed: false, synthetic: false, q: "" };
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
