/* pm-search.js — HEADLESS universal search index for concepts 05–11 (2026-08-18 bakeoff).
   Contract (machine_readable/search_contract.json): immutable result IDs, complete
   settings path, destination object, availability reason; bounded results; typo/fuzzy;
   NEVER routes by rendered array index or grouped position — every result carries its
   own route object. No DOM: presentation of the dropdown is concept-native. */
(function () {
  "use strict";
  var PM2 = window.PM2;
  var S = PM2.search = {};
  var INDEX = null, STRESS = null;

  function levenshtein(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 9;
    var m = a.length, n = b.length, d = [];
    for (var i = 0; i <= m; i++) d[i] = [i];
    for (var j = 0; j <= n; j++) d[0][j] = j;
    for (var i2 = 1; i2 <= m; i2++) for (var j2 = 1; j2 <= n; j2++)
      d[i2][j2] = Math.min(d[i2 - 1][j2] + 1, d[i2][j2 - 1] + 1, d[i2 - 1][j2 - 1] + (a[i2 - 1] === b[j2 - 1] ? 0 : 1));
    return d[m][n];
  }
  function norm(s) { return (s || "").toLowerCase(); }

  function buildIndex() {
    if (INDEX) return INDEX;
    var ix = [];
    /* settings — exact inventory rows */
    PM2.inventory.categories.forEach(function (c) {
      (PM2.inventory.byCategory[c.id] || []).forEach(function (s) {
        var parts = s.id.split(".");
        ix.push({
          rid: "res.set." + s.id, label: s.label, type: "setting",
          path: [c.title, PM2.subgroupTitle(parts[0], parts[1]), s.label],
          dest: { domain: c.id, page: parts[1], section: parts[1], row: s.id },
          terms: [s.label].concat(s.search || []),
          availability: /deprecated|removed/.test(s.desc || "") ? "Deprecated — kept for migration" : null
        });
      });
    });
    /* managers */
    PM2.managers.forEach(function (m) {
      ix.push({
        rid: "res.mgr." + m.id, label: m.title, type: "manager",
        path: [PM2.categoryTitle(m.domain), m.title],
        dest: { domain: m.domain, manager: m.id },
        terms: [m.title, m.family, m.blurb]
      });
    });
    /* named-owner insertions (unavailable-ish but reachable destinations) */
    PM2.owners.forEach(function (o) {
      ix.push({
        rid: "res.own." + o.id, label: o.title, type: "setup_or_repair_workflow",
        path: ["System & Advanced", "Future module", o.title],
        dest: { domain: "system", page: "advanced", owner: o.id },
        terms: [o.title, o.owner, o.contract],
        availability: "Owner module insertion point — " + o.owner
      });
    });
    /* managed objects (manager records) */
    PM2.managers.forEach(function (m) {
      (m.records || []).forEach(function (r) {
        ix.push({
          rid: "res.obj." + r.id, label: r.label, type: "managed_object",
          path: [PM2.categoryTitle(m.domain), m.title, r.label],
          dest: { domain: m.domain, manager: m.id, object: r.id },
          terms: [r.label, r.desc || "", (r.chips || []).map(function (c) { return c[1]; }).join(" ")],
          availability: r.status === "bad" ? r.statusLabel || "Unavailable" : (r.status === "warn" ? r.statusLabel || "Needs attention" : null),
          objectRef: { manager: m.id, record: r.id }
        });
      });
    });
    /* duplicate-label probes: two different providers both named "Playground" style */
    ix.push({ rid: "res.obj.prov.play-a", label: "Playground", type: "managed_object",
      path: ["AI Brains & Providers", "Providers, Accounts & Models", "Playground (API)"],
      dest: { domain: "ai", manager: "mgr.provider", object: "prov.openrouter-key" }, terms: ["playground api"] });
    ix.push({ rid: "res.obj.prov.play-b", label: "Playground", type: "managed_object",
      path: ["AI Brains & Providers", "Providers, Accounts & Models", "Playground (free tier)"],
      dest: { domain: "ai", manager: "mgr.provider", object: "prov.free-models" }, terms: ["playground free"] });
    /* actions */
    PM2.managers.forEach(function (m) {
      (m.records || []).forEach(function (r) {
        (r.actions || []).forEach(function (a) {
          ix.push({ rid: "res.act." + a.id + "." + r.id, label: a.label, type: "action",
            path: [PM2.categoryTitle(m.domain), m.title, r.label, a.label],
            dest: { domain: m.domain, manager: m.id, object: r.id, action: a.id },
            terms: [a.label, r.label] });
        });
      });
      (m.ops || []).forEach(function (a) {
        ix.push({ rid: "res.act." + a.id + "." + m.id, label: a.label, type: "action",
          path: [PM2.categoryTitle(m.domain), m.title, a.label],
          dest: { domain: m.domain, manager: m.id, action: a.id }, terms: [a.label, m.title] });
      });
    });
    /* setup / repair workflows */
    [["flow.provider-install", "Install Codex CLI from the official source", "mgr.provider", "prov.codex-cli", "ai"],
     ["flow.lsp-reconnect", "Reconnect clangd (remote host)", "mgr.lsp", "lsp.remote", "code"],
     ["flow.k8s-setup", "Set up Kubernetes tools (kubectl, kubeconfig)", "mgr.containers", "ctr.k8s", "system"],
     ["flow.fmt-setup", "Set up clang-format", "mgr.formatters", "fmt.c", "code"],
     ["flow.gh-oidc", "GitHub OIDC allowlist setup", "mgr.github", "gh.nightly", "branching"]
    ].forEach(function (f) {
      ix.push({ rid: "res.flow." + f[0], label: f[1], type: "setup_or_repair_workflow",
        path: [PM2.categoryTitle(f[4]), PM2.mgrById[f[2]].title, f[1]],
        dest: { domain: f[4], manager: f[2], object: f[3] }, terms: [f[1], "setup", "repair"] });
    });
    /* diagnostics / read-only status */
    [["diag.usage", "Usage & costs (read-only projection)", "mgr.provider", "ai"],
     ["diag.admission", "Context admission receipts", "mgr.context", "memory"],
     ["diag.health", "Doctor — all checks", "mgr.doctor", "system"],
     ["diag.route", "Requested vs effective model route", "mgr.provider", "ai"]
    ].forEach(function (f) {
      ix.push({ rid: "res.diag." + f[0], label: f[1], type: "diagnostic_or_read_only_status",
        path: [PM2.categoryTitle(f[3]), PM2.mgrById[f[2]].title, f[1]],
        dest: { domain: f[3], manager: f[2] }, terms: [f[1], "diagnostic", "status"] });
    });
    /* unavailable capabilities */
    [["unavail.video", "Video generation", "No provider offers it on this account", "mgr.media", "media"],
     ["unavail.podman", "Podman", "Not installed — optional shared-lifecycle tool", "mgr.containers", "system"],
     ["unavail.plugin", "voice-dictate plugin", "Needs app ≥ 2027.1", "mgr.plugins", "extensions"]
    ].forEach(function (f) {
      ix.push({ rid: "res.unavail." + f[0], label: f[1], type: "unavailable_capability",
        path: [PM2.categoryTitle(f[4]), PM2.mgrById[f[3]].title, f[1]],
        dest: { domain: f[4], manager: f[3], object: f[2] ? undefined : undefined },
        terms: [f[1], f[2]], availability: f[2] });
    });
    /* intentional help results */
    [["help.copy", "Copy Settings From Another Project — how copying works", { domain: "general", mode: "copy" }],
     ["help.search", "Using universal search", { domain: null, mode: "home" }],
     ["help.theme", "Choosing a theme", { domain: "general", page: "visual", row: "general.visual.theme" }]
    ].forEach(function (h) {
      ix.push({ rid: "res.help." + h[0], label: h[1], type: "intentional_help_result",
        path: ["Help", h[1]], dest: h[2], terms: [h[1], "help"] });
    });
    INDEX = ix;
    return ix;
  }

  S.ensure = buildIndex;
  S.size = function () { return buildIndex().length; };
  S.addStress = function (n) {
    if (STRESS) return;
    STRESS = PM2.makeStress(n || 2200);
    STRESS.forEach(function (s) {
      var parts = s.id.split(".");
      INDEX.push({ rid: "res.set." + s.id, label: s.label, type: "setting", synthetic: true,
        path: [PM2.categoryTitle(parts[2].split("-")[0]), "Load probes", s.label],
        dest: { domain: parts[2].split("-")[0], page: "load", section: "load", row: s.id },
        terms: [s.label, "synthetic load"], availability: "Synthetic scale record" });
    });
  };

  function score(entry, q) {
    var l = norm(entry.label), best = 0, why = 0;
    if (l === q) return 1000;
    if (l.indexOf(q) === 0) best = 800; else if (l.indexOf(q) >= 0) best = 600;
    var terms = entry.terms || [];
    for (var i = 0; i < terms.length && best < 800; i++) {
      var t = norm(terms[i]);
      if (!t) continue;
      if (t === q) best = Math.max(best, 700);
      else if (t.indexOf(q) === 0) best = Math.max(best, 500);
      else if (t.indexOf(q) >= 0) best = Math.max(best, 400);
      else if (q.length >= 4) {
        var words = t.split(/[^a-z0-9]+/);
        for (var w = 0; w < words.length; w++) {
          var wd = words[w];
          if (wd.length >= 4 && Math.abs(wd.length - q.length) <= 2) {
            var d = levenshtein(wd, q);
            if (d <= (q.length >= 8 ? 2 : 1)) { best = Math.max(best, 300 - d * 20); why = 1; }
          }
        }
        if (!best && q.length >= 5) { /* subsequence */
          var pi = 0; for (var c = 0; c < t.length && pi < q.length; c++) if (t[c] === q[pi]) pi++;
          if (pi === q.length) best = Math.max(best, 120);
        }
      }
    }
    return best;
  }

  var seq = 0;
  /* query(): bounded, latest-request-wins. opts {limit, seq} — pass the token you got. */
  S.query = function (q, opts) {
  var TYPE_PRI = { setting: 5, manager: 4, managed_object: 3, action: 2, setup_or_repair_workflow: 2, diagnostic_or_read_only_status: 1, unavailable_capability: 1, intentional_help_result: 0 };
    opts = opts || {};
    var token = ++seq;
    PM2.telemetry.searches++; var t0 = (window.performance && performance.now) ? performance.now() : Date.now();
    var out = { token: token, query: q, groups: [], results: [], total: 0, truncated: false, suggestion: null };
    if (!q) return out;
    var ix = buildIndex(), limit = Math.min(opts.limit || 40, 60);
    var scored = [];
    for (var i = 0; i < ix.length; i++) {
      var s = score(ix[i], q);
      if (s > 0) scored.push({ e: ix[i], s: s });
    }
    scored.sort(function (a, b) { return b.s - a.s || TYPE_PRI[b.e.type] - TYPE_PRI[a.e.type] || (a.e.rid < b.e.rid ? -1 : 1); });
    if (!scored.length) {
      /* typo suggestion: nearest popular term */
      var cands = ["theme", "provider", "approval", "notifications", "terminal", "memory", "backup", "permissions", "search index", "sounds"];
      var bestC = null, bestD = 9;
      for (var ci = 0; ci < cands.length; ci++) { var d = levenshtein(norm(cands[ci]), q); if (d < bestD) { bestD = d; bestC = cands[ci]; } }
      if (bestC && bestD <= 3) out.suggestion = bestC;
      return out;
    }
    var byType = {};
    scored.slice(0, limit).forEach(function (x) {
      out.results.push({ rid: x.e.rid, label: x.e.label, type: x.e.type, path: x.e.path, dest: x.e.dest, availability: x.e.availability || null, score: x.s, synthetic: !!x.e.synthetic });
      (byType[x.e.type] = byType[x.e.type] || []).push(x.e.rid);
    });
    out.total = scored.length; out.truncated = scored.length > limit;
    Object.keys(byType).forEach(function (k) { out.groups.push({ type: k, rids: byType[k] }); });
    var t1 = (window.performance && performance.now) ? performance.now() : Date.now();
    PM2.telemetry.searchMs.push(Math.round(t1 - t0));
    PM2.telemetry.resultsBounded = out.results.length;
    return out;
  };
  S.byRid = function (rid) {
    var ix = buildIndex();
    for (var i = 0; i < ix.length; i++) if (ix[i].rid === rid) return ix[i];
    return null;
  };
  S.suggestFor = function (q) { var r = S.query(q, { limit: 1 }); return r.suggestion; };
})();
