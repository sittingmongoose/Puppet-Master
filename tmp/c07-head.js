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
      blocks.push("<section class=\"" + PX + '-coprev-block" data-blueprint="unavailable"><h3>Unavailable <span class="' + PX + '-muted">(' + ((p.counts && p.counts.unavailable) || p.unavailable.length) + ")</span></h3><div class=\"" + PX + '-coprev-rows">' +
        p.unavailable.map(function (u) {
          return '<div class="' + PX + '-coprev-row" data-kind="unavailable"><div><strong>' + esc(u.label || u.id) + "</strong></div><span class=\"" + PX + '-muted">' + esc(u.reason || "") + "</span></div>";
        }).join("") + "</div></section>");
    }
    if (p.conflicts && p.conflicts.length) {
      blocks.push("<section class=\"" + PX + '-coprev-block" data-blueprint="conflicts"><h3>Conflicts <span class="' + PX + '-muted">(' + ((p.counts && p.counts.conflicts) || p.conflicts.length) + ")</span></h3><div class=\"" + PX + '-coprev-rows">' +
        p.conflicts.map(function (c) {
          return '<div class="' + PX + '-coprev-row" data-kind="conflict"><div><strong>' + esc(c.label || c.id) + "</strong></div><span class=\"" + PX + '-muted">' + esc(c.reason || "") + "</span></div>";
        }).join("") + "</div></section>";
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
      factRow("Scope", d.scopeNote) +
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
