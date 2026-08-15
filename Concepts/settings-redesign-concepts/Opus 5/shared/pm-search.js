/* Opus 5 — fuzzy discovery across categories, settings, managers and actions.
 *
 * The packet asks that PMConcept7's search behaviour be preserved conceptually:
 * fuzzy discovery across the whole Settings surface, and deep navigation to the
 * result. All four concepts use this one index and resolver; they differ only in
 * how the results are presented and how the destination is entered.
 *
 * Exposure is carried on every record so that a concept can FIND a risky or
 * unavailable item without rendering it as an equally inviting default control.
 */
(function () {
  "use strict";

  function norm(s) { return (s || "").toLowerCase(); }

  /* Subsequence scoring with word-start and contiguity bonuses. */
  function fuzzyScore(query, text) {
    if (!query) return 0;
    var q = norm(query), t = norm(text);
    if (!t) return -1;

    var exact = t.indexOf(q);
    if (exact === 0) return 1000 - t.length * 0.1;
    if (exact > 0) {
      var startsWord = exact === 0 || /[\s\-\/·:,(]/.test(t.charAt(exact - 1));
      return (startsWord ? 780 : 640) - exact * 1.5 - t.length * 0.05;
    }

    var qi = 0, score = 0, run = 0, lastHit = -2;
    for (var i = 0; i < t.length && qi < q.length; i++) {
      if (t.charAt(i) === q.charAt(qi)) {
        var wordStart = i === 0 || /[\s\-\/·:,(]/.test(t.charAt(i - 1));
        run = (i === lastHit + 1) ? run + 1 : 1;
        score += 12 + (wordStart ? 22 : 0) + Math.min(run, 5) * 6;
        lastHit = i;
        qi++;
      }
    }
    if (qi < q.length) return -1;
    return score - t.length * 0.08;
  }

  var KIND_WEIGHT = {
    setting: 1.0,
    manager: 1.08,   // managers are destinations; nudge them up slightly
    category: 1.05,
    subcategory: 0.96,
    action: 0.92,
    model: 0.9,
    provider: 1.02,
    status: 0.94,      // a read-only projection: findable, never mistaken for a control
    diagnostic: 0.78   // findable on purpose, never as inviting as an ordinary row
  };

  var EXPOSURE_WEIGHT = {
    standard: 1.0,
    advanced: 0.9,
    expert: 0.74,     // findable, never as inviting as a standard control
    diagnostic: 0.7,
    setup_workflow: 1.04,
    unavailable: 0.66,
    managed: 0.82,
    unavailable: 0.66
  };

  function buildIndex(data) {
    var records = [];

    (data.categories || []).forEach(function (cat) {
      records.push({
        kind: "category",
        id: cat.id,
        title: cat.title,
        subtitle: cat.purpose,
        categoryId: cat.id,
        subcategoryId: null,
        path: [cat.title],
        exposure: "standard",
        keywords: (cat.keywords || []).join(" ")
      });

      (cat.subcategories || []).forEach(function (sub) {
        records.push({
          kind: "subcategory",
          id: sub.id,
          title: sub.title,
          subtitle: sub.summary || cat.title,
          categoryId: cat.id,
          subcategoryId: sub.id,
          path: [cat.title, sub.title],
          exposure: "standard",
          keywords: (sub.keywords || []).join(" ")
        });

        (sub.settings || []).forEach(function (setting) {
          records.push({
            kind: setting.kind === "manager" ? "manager" : "setting",
            id: setting.id,
            title: setting.label,
            subtitle: setting.explanation,
            categoryId: cat.id,
            subcategoryId: sub.id,
            managerId: setting.managerId || null,
            path: [cat.title, sub.title, setting.label],
            exposure: setting.exposure || "standard",
            state: setting.state || null,
            keywords: (setting.keywords || []).join(" ")
          });
        });
      });
    });

    (data.actions || []).forEach(function (action) {
      records.push({
        kind: "action",
        id: action.id,
        title: action.label,
        subtitle: action.explanation,
        categoryId: action.categoryId || null,
        subcategoryId: action.subcategoryId || null,
        managerId: action.managerId || null,
        path: action.path || [action.label],
        exposure: action.exposure || "standard",
        keywords: (action.keywords || []).join(" ")
      });
    });

    /* Status projections and diagnostics are separate kinds on purpose.
     * "Last backup" is not a setting you can change and "Open backup log" is not
     * a value at all, so searching "backup" has to return five visibly different
     * kinds of row: setting, manager, action, status and diagnostic. Collapsing
     * them into one list is exactly the failure the packet calls out. */
    (data.statuses || []).forEach(function (s) {
      records.push({
        kind: "status",
        id: s.id,
        title: s.label,
        subtitle: s.explanation,
        value: s.value,
        categoryId: s.categoryId || null,
        subcategoryId: s.subcategoryId || null,
        managerId: s.managerId || null,
        path: s.path || [s.label],
        exposure: s.exposure || "standard",
        keywords: (s.keywords || []).join(" ")
      });
    });

    (data.diagnostics || []).forEach(function (d) {
      records.push({
        kind: "diagnostic",
        id: d.id,
        title: d.label,
        subtitle: d.explanation,
        categoryId: d.categoryId || null,
        subcategoryId: d.subcategoryId || null,
        managerId: d.managerId || null,
        path: d.path || [d.label],
        exposure: d.exposure || "diagnostic",
        keywords: (d.keywords || []).join(" ")
      });
    });

    /* 01_CORE_ARCHITECTURE names seven result types and the completeness audit
     * §6 names six record kinds. Two were missing until the 2026-08-13
     * correction: a setup workflow is not a scalar setting, and an unavailable
     * capability must be findable without being offered as if it were usable. */
    (data.setupWorkflows || []).forEach(function (w) {
      records.push({
        kind: "setup_workflow",
        id: w.id,
        title: w.label,
        subtitle: w.explanation,
        categoryId: w.categoryId || null,
        subcategoryId: w.subcategoryId || null,
        managerId: w.managerId || null,
        path: w.path || [w.label],
        exposure: w.exposure || "standard",
        keywords: (w.keywords || []).join(" ")
      });
    });

    (data.unavailableCapabilities || []).forEach(function (u) {
      records.push({
        kind: "unavailable",
        id: u.id,
        title: u.label,
        subtitle: u.reason,
        categoryId: u.categoryId || null,
        subcategoryId: u.subcategoryId || null,
        managerId: u.managerId || null,
        path: u.path || [u.label],
        /* Carried so a concept can find it without rendering it as an equally
         * inviting default control. */
        exposure: "unavailable",
        keywords: (u.keywords || []).join(" ")
      });
    });

    (data.providers || []).forEach(function (p) {
      records.push({
        kind: "provider",
        id: p.id,
        title: p.name,
        subtitle: p.summary,
        categoryId: "agents",
        subcategoryId: "agents-providers",
        managerId: "manager-providers",
        path: ["Agents & models", "Providers and accounts", p.name],
        exposure: "standard",
        keywords: (p.keywords || []).join(" ")
      });
      (p.models || []).forEach(function (m) {
        records.push({
          kind: "model",
          id: m.id,
          title: m.alias || m.name,
          subtitle: p.name + " · " + (m.summary || "Model"),
          categoryId: "agents",
          subcategoryId: "agents-models",
          managerId: "manager-providers",
          providerId: p.id,
          path: ["Agents & models", "Model catalogue", m.alias || m.name],
          exposure: m.available === false ? "unavailable" : "standard",
          keywords: [m.name, p.name, (m.capabilities || []).join(" ")].join(" ")
        });
      });
    });

    return records;
  }

  /* Optional plain-language filters (used by the Ledger concept's omnibar).
   * These narrow RESULTS. They are never applied to primary destinations. */
  function passesFilters(rec, filters) {
    if (!filters) return true;
    if (filters.exposure && rec.exposure !== filters.exposure) return false;
    if (filters.kind && rec.kind !== filters.kind) return false;
    if (filters.source && (!rec.state || rec.state.source !== filters.source)) return false;
    if (filters.scope && (!rec.state || rec.state.scope !== filters.scope)) return false;
    if (filters.changed === true && (!rec.state || rec.state.isDefault !== false)) return false;
    return true;
  }

  function search(index, query, options) {
    var opts = options || {};
    var limit = opts.limit || 40;
    var filters = opts.filters;
    var q = (query || "").trim();

    var out = [];
    for (var i = 0; i < index.length; i++) {
      var rec = index[i];
      if (!passesFilters(rec, filters)) continue;

      if (!q) {
        // Empty query with active filters still returns a browsable list.
        if (filters) out.push({ rec: rec, score: 1 });
        continue;
      }

      var best = fuzzyScore(q, rec.title);
      var sub = fuzzyScore(q, rec.subtitle) * 0.55;
      var key = fuzzyScore(q, rec.keywords) * 0.45;
      var pathScore = fuzzyScore(q, rec.path.join(" ")) * 0.4;
      var score = Math.max(best, sub, key, pathScore);
      if (score < 0) continue;

      score *= (KIND_WEIGHT[rec.kind] || 1);
      score *= (EXPOSURE_WEIGHT[rec.exposure] || 1);
      out.push({ rec: rec, score: score });
    }

    out.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.rec.title.localeCompare(b.rec.title);
    });

    return out.slice(0, limit).map(function (item) {
      return Object.assign({}, item.rec, { score: Math.round(item.score) });
    });
  }

  /* Group results by owning category so a concept can show cross-category hits
   * without losing where each one lives. */
  function groupByCategory(results, data) {
    var order = [];
    var buckets = Object.create(null);
    results.forEach(function (r) {
      var key = r.categoryId || "other";
      if (!buckets[key]) {
        buckets[key] = { categoryId: key, title: categoryTitle(data, key), items: [] };
        order.push(key);
      }
      buckets[key].items.push(r);
    });
    return order.map(function (k) { return buckets[k]; });
  }

  function categoryTitle(data, id) {
    var found = (data.categories || []).filter(function (c) { return c.id === id; })[0];
    return found ? found.title : "Elsewhere in Settings";
  }

  /* Resolve a result to the navigation triple every concept needs:
   * which category to load, which subcategory to jump to, what to focus. */
  function resolveTarget(rec) {
    return {
      categoryId: rec.categoryId,
      subcategoryId: rec.subcategoryId,
      targetId: rec.kind === "category" ? null : rec.id,
      managerId: rec.managerId || null,
      kind: rec.kind
    };
  }

  /* Plain-language filter tokens the Ledger omnibar parses out of typed text. */
  var FILTER_TOKENS = [
    { token: "managed", label: "Source: Managed", filters: { source: "managed" } },
    { token: "inherited", label: "Source: Inherited", filters: { source: "inherited" } },
    { token: "changed", label: "Changed: not default", filters: { changed: true } },
    { token: "project", label: "Scope: Project", filters: { scope: "project" } },
    { token: "thread", label: "Scope: Thread", filters: { scope: "thread" } },
    { token: "advanced", label: "Level: Advanced", filters: { exposure: "advanced" } },
    { token: "expert", label: "Level: Expert", filters: { exposure: "expert" } },
    { token: "unavailable", label: "Level: Unavailable", filters: { exposure: "unavailable" } },
    { token: "managers", label: "Kind: Managers", filters: { kind: "manager" } },
    { token: "status", label: "Kind: Status", filters: { kind: "status" } },
    { token: "diagnostics", label: "Kind: Diagnostics", filters: { kind: "diagnostic" } },
    { token: "setup", label: "Kind: Setup workflows", filters: { kind: "setup_workflow" } }
  ];

  /* One label per kind, shared, so "setting" never reads as "Setting" in one
   * concept and "Value" in another. */
  var KIND_LABEL = {
    setting: "Setting",
    manager: "Manager",
    category: "Destination",
    subcategory: "Section",
    action: "Action",
    status: "Status",
    diagnostic: "Diagnostic",
    provider: "Provider",
    model: "Model"
  };

  window.PMSearch = {
    KIND_LABEL: KIND_LABEL,
    kindLabel: function (k) { return KIND_LABEL[k] || "Result"; },
    buildIndex: buildIndex,
    search: search,
    groupByCategory: groupByCategory,
    resolveTarget: resolveTarget,
    fuzzyScore: fuzzyScore,
    FILTER_TOKENS: FILTER_TOKENS
  };
})();
