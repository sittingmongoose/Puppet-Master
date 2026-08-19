from pathlib import Path
PX = "cw"
p = Path("Concepts/settings-redesign-concepts/CursorAuto/concept-07-compendium-workspace/concept-07-compendium-workspace.js")
text = p.read_text(encoding="utf-8")

helpers = r'''  function ensureFacets(app) {
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
    function row(kind, id, extra) {
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
    function section(title, kind, ids, renderExtra) {
      if (!ids || !ids.length) return "";
      return "<section class=\"" + PX + '-coprev-block" data-blueprint="' + esc(kind) + '">' +
        "<h3>" + esc(title) + " <span class=\"" + PX + '-muted">sample</span></h3>' +
        '<div class="' + PX + '-coprev-rows">' + ids.map(function (id) {
          return row(kind, id, renderExtra ? renderExtra(id) : "");
        }).join("") + "</div></section>";
    }
    blocks.push(section("Replacements", "replacements", p.replacements));
    blocks.push(section("Additions", "additions", p.additions, function (id) {
      return '<span class="to">' + esc(fmtCopyVal(src[id])) + "</span>";
    }));
    blocks.push(section("Unchanged", "unchanged", p.unchanged, function (id) {
      return '<span class="same">' + esc(fmtCopyVal(app.values && app.values[id])) + "</span>";
    }));
    if (p.unavailable && p.unavailable.length) {
      blocks.push("<section class=\"" + PX + '-coprev-block" data-blueprint="unavailable"><h3>Unavailable</h3><div class="' + PX + '-coprev-rows">' +
        p.unavailable.map(function (u) {
          return '<div class="' + PX + '-coprev-row" data-kind="unavailable"><div><strong>' + esc(u.id) + "</strong></div><span class=\"" + PX + '-muted">' + esc(u.reason || "") + "</span></div>";
        }).join("") + "</div></section>");
    }
    if (p.conflicts && p.conflicts.length) {
      blocks.push("<section class=\"" + PX + '-coprev-block" data-blueprint="conflicts"><h3>Conflicts</h3><div class="' + PX + '-coprev-rows">' +
        p.conflicts.map(function (c) {
          return '<div class="' + PX + '-coprev-row" data-kind="conflict"><div><strong>' + esc(c.id) + "</strong></div><span class=\"" + PX + '-muted">' + esc(c.reason || "") + "</span></div>";
        }).join("") + "</div></section>");
    }
    return blocks.filter(Boolean).join("");
  }

  function hitsForQuery(app) {'''.replace("PX", PX)

if "function settingExposure" not in text:
    old = """  function ensureFacets(app) {
    if (!app.allFacets) {
      app.allFacets = { domain: "", type: "", tier: "", exposure: "", changed: false, synthetic: false, q: "" };
    }
    return app.allFacets;
  }

  function hitsForQuery(app) {"""
    text = text.replace(old, helpers, 1)

exposure_old = (
    '      "</div>" +\n'
    '      "<h2>This project</h2><div class=\\"" + PX + \'-facetlist">\' +\n'
)
exposure_new = (
    '      "</div>" +\n'
    '      "<h2>Exposure</h2><div class=\\"" + PX + \'-facetlist">\' +\n'
    '      \'<button type="button" data-act="facet-exposure" data-id=""\' + (!f.exposure ? \' aria-current="true"\' : "") + ">All exposure</button>" +\n'
    '      \'<button type="button" data-act="facet-exposure" data-id="basic"\' + (f.exposure === "basic" ? \' aria-current="true"\' : "") + ">Basic</button>" +\n'
    '      \'<button type="button" data-act="facet-exposure" data-id="advanced"\' + (f.exposure === "advanced" ? \' aria-current="true"\' : "") + ">Advanced</button>" +\n'
    '      \'<button type="button" data-act="facet-exposure" data-id="hidden"\' + (f.exposure === "hidden" ? \' aria-current="true"\' : "") + ">Hidden</button>" +\n'
    '      "</div>" +\n'
    '      "<h2>This project</h2><div class=\\"" + PX + \'-facetlist">\' +\n'
)

pairs = [
("      if (f.tier && s.tier !== f.tier) continue;\n      if (f.changed) {",
 "      if (f.tier && s.tier !== f.tier) continue;\n      if (f.exposure && settingExposure(s) !== f.exposure) continue;\n      if (f.changed) {"),
('        tier: s.tier || "simple",\n        synthetic: false',
 '        tier: s.tier || "simple",\n        exposure: settingExposure(s),\n        synthetic: false'),
(exposure_old, exposure_new),
("        '<p class=\"' + PX + '-muted\">' + esc(humanType(setting.type)) + (setting.tier ? \" · \" + esc(setting.tier) : \"\") + \"</p>\" +",
 "        '<p class=\"' + PX + '-muted\">' + esc(humanType(setting.type)) + (setting.tier ? \" · \" + esc(setting.tier) : \"\") + \" · \" + esc(humanExposure(settingExposure(setting))) + \"</p>\" +"),
("    if (p) {\n      prev = \"<p>Additions \" + p.counts.additions + \" · Replacements \" + p.counts.replacements +\n        \" · Unchanged \" + p.counts.unchanged + \" · Unavailable \" + p.counts.unavailable +\n        \" · Conflicts \" + p.counts.conflicts + \"</p>\" +\n        '<p class=\"' + PX + '-muted\">Account and credential references copy. Secrets never copy. Projects stay independent.</p>';\n    } else {\n      prev = \"<p>Select a source project.</p>\";\n    }",
 "    if (p) {\n      prev = '<div class=\"' + PX + '-coprev\">' +\n        \"<p>Additions \" + p.counts.additions + \" · Replacements \" + p.counts.replacements +\n        \" · Unchanged \" + p.counts.unchanged + \" · Unavailable \" + p.counts.unavailable +\n        \" · Conflicts \" + p.counts.conflicts + \"</p>\" +\n        '<p class=\"' + PX + '-muted\">Account and credential references copy. Secrets never copy. Projects stay independent.</p>' +\n        copyPreviewSamples(app, p) +\n        \"</div>\";\n    } else {\n      prev = \"<p>Select a source project.</p>\";\n    }"),
("        '<span class=\"meta\">' + esc(humanType(item.type)) + \"</span></button>\";",
 "        '<span class=\"meta\">' + esc(humanType(item.type)) + (item.exposure ? \" · \" + esc(humanExposure(item.exposure)) : \"\") + \"</span></button>\";"),
('      else if (act === "facet-tier") { f.tier = id || ""; app.paint(); }\n      else if (act === "facet-changed") { f.changed = !f.changed; app.paint(); }',
 '      else if (act === "facet-tier") { f.tier = id || ""; app.paint(); }\n      else if (act === "facet-exposure") { f.exposure = id || ""; app.paint(); }\n      else if (act === "facet-changed") { f.changed = !f.changed; app.paint(); }'),
('        app.allFacets = { domain: "", type: "", tier: "", changed: false, synthetic: false, q: "" };',
 '        app.allFacets = { domain: "", type: "", tier: "", exposure: "", changed: false, synthetic: false, q: "" };'),
]

for old, new in pairs:
    if old not in text:
        print('MISSING:', repr(old[:120]))
        raise SystemExit(1)
    text = text.replace(old, new, 1)

p.write_text(text, encoding='utf-8', newline='\r\n')
print('patched js ok')
