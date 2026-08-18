/* pm-data.js — HEADLESS shared core for concepts 05–11 (Seven New Concepts bakeoff, 2026-08-18).
   No DOM, no rendering. Every visible surface (Home, navigation, managers, search dropdown,
   motion, responsive behavior) is implemented natively inside each concept page.
   Shared here per packet 05 "Shared implementation versus shared visual renderer":
   inventory projection, demo records, stable IDs/routes, state/persistence simulator,
   command/receipt simulator, icon wrapper, virtualization math, test harness hooks. */
(function () {
  "use strict";
  var INV = window.PM2_INVENTORY;
  var PM2 = window.PM2 = {};

  /* ---------- tiny utils ---------- */
  PM2.hash = function (str, seed) {
    var h = seed >>> 0 || 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };
  PM2.svg = function (name, size) {
    var lib = window.PM_ICONS || {};
    var inner = lib[name] || lib.grid || "";
    return '<svg width="' + (size || 16) + '" height="' + (size || 16) + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + "</svg>";
  };
  /* virtualization math — headless; presentation is concept-native */
  PM2.window = function (opts) {
    var rowH = opts.rowHeight || 36, over = opts.overscan || 6;
    var first = Math.max(0, Math.floor(opts.scrollTop / rowH) - over);
    var count = Math.ceil(opts.viewportHeight / rowH) + over * 2;
    return { first: first, count: Math.min(count, opts.total - first), padTop: first * rowH, padBottom: Math.max(0, (opts.total - first - count) * rowH) };
  };

  /* ---------- inventory projection ---------- */
  var CATS = INV.categories, SETTINGS = INV.settings;
  PM2.inventory = {
    schema_id: INV.schema_id, schema_version: INV.schema_version, generated_at_utc: INV.generated_at_utc,
    source: INV.source, count: SETTINGS.length, categories: CATS,
    byId: {}, byCategory: {}, subgroups: {}
  };
  CATS.forEach(function (c) { PM2.inventory.byCategory[c.id] = []; });
  SETTINGS.forEach(function (s) {
    PM2.inventory.byId[s.id] = s;
    var cat = s.id.split(".")[0], sub = s.id.split(".")[1];
    PM2.inventory.byCategory[cat].push(s);
    var key = cat + "." + sub;
    (PM2.inventory.subgroups[key] = PM2.inventory.subgroups[key] || []).push(s);
  });
  CATS.forEach(function (c) {
    c.subgroups = c.subgroups || [];
    c.subgroups.forEach(function (sg) {
      var key = c.id + "." + (sg.id || sg);
      if (!PM2.inventory.subgroups[key]) PM2.inventory.subgroups[key] = [];
    });
  });
  PM2.subgroupTitle = function (catId, subId) {
    var c = CATS.filter(function (x) { return x.id === catId; })[0];
    if (!c) return subId;
    var sg = (c.subgroups || []).filter(function (x) { return (x.id || x) === subId; })[0];
    return sg ? (sg.title || sg.id || sg) : subId;
  };
  PM2.categoryTitle = function (catId) {
    var c = CATS.filter(function (x) { return x.id === catId; })[0];
    return c ? c.title : catId;
  };

  /* ---------- demo value/status projection (current Project; deterministic) ----------
     Legacy inventory 'scope' is never an editing scope. Deterministic pseudo-random by id. */
  var STATUS_CYCLE = ["default", "default", "default", "custom", "default", "managed", "custom", "default", "unavailable", "restart", "default", "custom", "reconnect", "default", "changed-elsewhere", "default", "import-conflict", "default", "rollback-complete", "default"];
  PM2.demoStateFor = function (sid) {
    var s = PM2.inventory.byId[sid]; if (!s) return null;
    var h = PM2.hash(sid, 7);
    var status = s.type === "action" ? "default" : STATUS_CYCLE[h % STATUS_CYCLE.length];
    var value;
    switch (s.type) {
      case "toggle": value = (h % 3 === 0) ? !s.default : s.default; break;
      case "select": case "radio": value = (h % 5 === 0 && s.options && s.options.length > 1) ? s.options[(h >> 3) % s.options.length] : s.default; break;
      case "slider": value = (h % 4 === 0) ? Math.min(100, ((h % 7) + 2) * 10) : s.default; break;
      case "number": value = (h % 4 === 0) ? ((h % 13) + 1) : s.default; break;
      case "text": case "path": value = (h % 6 === 0) ? (s.type === "path" ? "D:\\work\\puppet-master\\" + sid.split(".")[2] : "Set for this project") : s.default; break;
      case "list": case "multiselect": value = (h % 5 === 0 && s.options) ? s.options.slice(0, (h % 2) + 1) : s.default; break;
      case "keyvalue": value = (h % 5 === 0) ? { key: "PM_" + sid.split(".")[2].toUpperCase(), value: "project-local" } : s.default; break;
      default: value = s.default;
    }
    return { status: status, value: value, changedAt: (status === "custom" || status === "changed-elsewhere") ? "2026-08-1" + (h % 8) : null };
  };
  PM2.statusMeta = {
    "default": { label: "Default", tone: "neutral" },
    "custom": { label: "Custom", tone: "info" },
    "managed": { label: "Managed", tone: "managed" },
    "unavailable": { label: "Unavailable", tone: "bad" },
    "restart": { label: "Restart required", tone: "warn" },
    "reconnect": { label: "Reconnect required", tone: "warn" },
    "changed-elsewhere": { label: "Changed elsewhere", tone: "warn" },
    "import-conflict": { label: "Import conflict", tone: "warn" },
    "rollback-complete": { label: "Rollback complete", tone: "ok" }
  };

  /* ---------- projects (Copy Settings From Another Project) ---------- */
  PM2.projects = [
    { id: "proj.puppet-master", name: "Puppet Master", path: "P:\\", current: true,
      note: "The active project. All editable settings apply here.",
      changedCount: 118, lastBackup: "2026-08-17 22:04", attention: 3 },
    { id: "proj.assistant-chat", name: "Assistant Chat", path: "P:\\Concepts\\chat-assistant", current: false,
      changedCount: 204, lastBackup: "2026-08-16 09:31", attention: 1,
      diff: { additions: 96, replacements: 141, unchanged: 577, unavailable: 8, conflicts: 6 } },
    { id: "proj.settings-bakeoff", name: "Settings Bakeoff", path: "P:\\Concepts\\settings-redesign-concepts", current: false,
      changedCount: 61, lastBackup: "2026-08-15 18:12", attention: 0,
      diff: { additions: 34, replacements: 88, unchanged: 700, unavailable: 4, conflicts: 2 } },
    { id: "proj.usage-concepts", name: "Usage Concepts", path: "P:\\Concepts\\usage", current: false,
      changedCount: 152, lastBackup: "2026-08-14 07:40", attention: 2,
      diff: { additions: 120, replacements: 101, unchanged: 593, unavailable: 9, conflicts: 5 } },
    { id: "proj.website-rebuild", name: "Website Rebuild", path: "D:\\clients\\website", current: false,
      changedCount: 39, lastBackup: null, attention: 4,
      diff: { additions: 22, replacements: 47, unchanged: 750, unavailable: 6, conflicts: 3 } }
  ];
  PM2.currentProject = PM2.projects[0];

  /* Copy category set (ten broad categories mapped to the current twelve) */
  PM2.copyCategories = [
    { id: "cp.appearance", title: "Appearance & General", cats: ["general"], includes: "Theme, fonts, motion, window and tray behavior, notifications and sounds" },
    { id: "cp.ai", title: "AI Brains & Providers", cats: ["ai"], includes: "Provider choices, model defaults, routing and fallback (credential references only — never raw secrets)" },
    { id: "cp.safety", title: "Permissions & Safety", cats: ["safety"], includes: "Permission rules, approvals, FileSafe boundary" },
    { id: "cp.code", title: "Code & Execution", cats: ["code"], includes: "Terminal, editors, languages, execution environment" },
    { id: "cp.context", title: "Context, Memory & Planning", cats: ["memory", "planning"], includes: "Context assembly, memory policy, planning and verification defaults" },
    { id: "cp.collab", title: "Branching & Collaboration", cats: ["branching"], includes: "Worktrees, crew templates, subagent policy" },
    { id: "cp.media", title: "Media & Web", cats: ["media", "web"], includes: "Media capabilities, web providers, fetch policy, search index" },
    { id: "cp.personas", title: "Personas", cats: ["personas"], includes: "Persona library and behavior tuning" },
    { id: "cp.extensions", title: "Skills, Plugins & Commands", cats: ["extensions"], includes: "Skills, plugins, custom commands" },
    { id: "cp.system", title: "System & Advanced", cats: ["system"], includes: "Health, MCP servers, advanced defaults" }
  ];

  /* Deterministic per-category copy preview for a source project (item-level inspectable) */
  PM2.copyPreview = function (sourceProjectId, selectedCatIds) {
    var src = PM2.projects.filter(function (p) { return p.id === sourceProjectId; })[0] || PM2.projects[1];
    var cats = PM2.copyCategories.filter(function (c) { return selectedCatIds.indexOf(c.id) >= 0; });
    var rows = [], totals = { additions: 0, replacements: 0, unchanged: 0, unavailable: 0, conflicts: 0 };
    cats.forEach(function (cc) {
      var sids = [];
      cc.cats.forEach(function (cid) { (PM2.inventory.byCategory[cid] || []).forEach(function (s) { sids.push(s.id); }); });
      sids.forEach(function (sid, i) {
        var h = PM2.hash(sid + ">" + src.id, 11);
        var kind = ["unchanged", "unchanged", "unchanged", "replacements", "unchanged", "additions", "unchanged", "replacements", "unavailable", "unchanged", "conflicts", "unchanged"][h % 12];
        if (i === 0 && cc === cats[0]) kind = "additions";
        totals[kind]++;
        rows.push({ settingId: sid, category: cc.id, kind: kind,
          sourceValue: kind === "unchanged" ? null : PM2.demoStateFor(sid).value,
          credentialRef: /key|token|secret|auth|credential/.test(sid) });
      });
    });
    return { source: src, categories: cats, totals: totals, rows: rows,
      credentialNote: "Credential and account references are preserved by reference for this project. Raw secrets are never copied, shown, or exported." };
  };

  /* ---------- deterministic state fixtures (packet 08) ---------- */
  PM2.fixtures = {
    "loading-cached": { label: "Loading with cached content", where: "manager first open", effect: "skeleton rows + cached values visible + labeled wait reason" },
    "empty": { label: "Empty", where: "e.g. personal dictionary before words added", effect: "friendly empty state with one primary action" },
    "no-results": { label: "No search results", effect: "zero-state with spelling suggestion" },
    "typo": { label: "Typo / fuzzy search", query: "aproval", suggestion: "approval", effect: "fuzzy matches still found" },
    "validation-error": { label: "Validation error", where: "number out of range", effect: "inline error, value not applied" },
    "offline": { label: "Offline / poor network", effect: "last-known-good banner, refresh held, cached values stay" },
    "managed": { label: "Managed / read-only", effect: "control disabled with reason, Details shows origin" },
    "unavailable": { label: "Unavailable", effect: "row dimmed, reason stated, related setup path offered" },
    "restart-required": { label: "Restart required", effect: "badge, effect timing in Details" },
    "reconnect-required": { label: "Reconnect required", effect: "badge + Reconnect action" },
    "changed-elsewhere": { label: "Setting changed elsewhere", effect: "current value shown with changed-at + Review" },
    "import-conflict": { label: "Import conflict", effect: "conflict review with yours/theirs and per-row resolution" },
    "rollback-complete": { label: "Rollback complete", effect: "receipt + restored values message" },
    "usage-unavailable": { label: "Provider ready, Usage unavailable", effect: "ready badge + usage block states reason" },
    "multi-install": { label: "Multiple installations", effect: "one Selected + one Shadowed, explicit switch" },
    "unknown-owner": { label: "Unknown installation owner", effect: "manual-only, no auto update, evidence shown" },
    "update-ask": { label: "Update available — Ask first", effect: "update offered, not applied, policy shown" },
    "verify-fail-rollback": { label: "Verification failed → rollback succeeded", effect: "failure receipt + rolled-back state + retry" }
  };

  /* ---------- synthetic stress set (NEVER product inventory; flagged) ---------- */
  PM2.makeStress = function (n) {
    n = n || 2200;
    var out = [], cats = CATS.map(function (c) { return c.id; });
    for (var i = 0; i < n; i++) {
      var cat = cats[i % cats.length];
      out.push({
        id: "zz.synthetic." + cat + "-load-" + i, synthetic: true,
        label: "Load probe " + (i + 1) + " — " + PM2.categoryTitle(cat),
        desc: "Synthetic scale record for performance verification only. Not product inventory.",
        type: (i % 3 === 0) ? "toggle" : "number", default: (i % 3 === 0) ? true : i,
        tier: "advanced", scope: ["project"], search: ["synthetic", "load", "scale"]
      });
    }
    return out;
  };

  /* ---------- scale + harness counters (test hooks) ---------- */
  PM2.telemetry = { managersHydrated: [], searches: 0, searchMs: [], resultsBounded: 0, domRows: [] };
})();
