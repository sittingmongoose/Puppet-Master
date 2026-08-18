/* ============================================================================
   PMv2 — headless Settings runtime for CursorAuto concepts 05–11
   Shared: inventory, search IDs/routes, store, copy, manager semantics,
   ObservableWork projection, virtualization, popup. No visible renderer.
   Project-only values. No Global/Project/Goal/Host scope selector.
   ObservableWork is a projection only — not a second ResourceGovernor.
   Search routes by immutable result ID, never by array index.
   ========================================================================== */
(function () {
  "use strict";

  var INV = window.PMv2Inventory;
  if (!INV || !INV.settings) {
    console.error("PMv2: inventory snapshot missing");
    return;
  }

  function clone(o) { return o == null ? o : JSON.parse(JSON.stringify(o)); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function cssEscape(s) {
    s = String(s == null ? "" : s);
    try {
      if (typeof CSS !== "undefined" && CSS.escape) return CSS.escape(s);
    } catch (e) {}
    return s.replace(/\\/g, "\\\\").replace(/"/g, "\\22 ");
  }
  function same(a, b) {
    try { return JSON.stringify(a) === JSON.stringify(b); } catch (e) { return a === b; }
  }
  function reducedMotion() {
    try {
      if (document.documentElement.getAttribute("data-motion") === "reduced") return true;
      return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch (e) { return false; }
  }

  var CAT_BY_ID = {};
  var SUB_BY_KEY = {};
  (INV.categories || []).forEach(function (c) {
    CAT_BY_ID[c.id] = c;
    (c.subgroups || []).forEach(function (sg) { SUB_BY_KEY[c.id + "." + sg.id] = sg; });
  });
  var SET_BY_ID = {};
  (INV.settings || []).forEach(function (s) { SET_BY_ID[s.id] = s; });

  function settingDest(s) {
    var parts = String(s.id).split(".");
    var domain = parts[0] || "general";
    var page = parts[1] || "general";
    var cat = CAT_BY_ID[domain];
    var sub = SUB_BY_KEY[domain + "." + page];
    return {
      domain: domain,
      domainTitle: cat ? cat.title : domain,
      page: page,
      pageTitle: sub ? sub.title : page,
      section: page,
      row: s.id,
      manager: null,
      object: null
    };
  }

  function rowResultId(rowId) {
    return "setting:" + rowId;
  }

  var MANAGERS = [
    { id: "providers", title: "Providers", family: "Provider / Account / Model / Installation", domain: "ai", archetype: "roster-detail", tabs: ["overview", "accounts", "models", "installations", "usage", "setup"], purpose: "Connected brains, accounts, models, and official-source setup." },
    { id: "context", title: "Context & Instructions", family: "Context & Instructions", domain: "memory", archetype: "preference-document", tabs: ["overview", "chain", "budget"], purpose: "What is packed into the model each run." },
    { id: "memory", title: "Memory", family: "Memory", domain: "memory", archetype: "roster-detail", tabs: ["overview", "items", "retention"], purpose: "What the assistant is allowed to remember." },
    { id: "personas", title: "Personas", family: "Personas", domain: "personas", archetype: "roster-detail", tabs: ["overview", "library", "tuning"], purpose: "The cast of characters for this project." },
    { id: "goal", title: "Goal & Automation", family: "Goal & Automation", domain: "planning", archetype: "preference-document", tabs: ["overview", "ceilings", "automation"], purpose: "How Goal Mode plans, stops, and reserves work." },
    { id: "crew", title: "Crew", family: "Crew", domain: "branching", archetype: "roster-detail", tabs: ["overview", "seats", "policy"], purpose: "Who sits on a run and how they decide." },
    { id: "permissions", title: "Permissions & FileSafe", family: "Permissions & FileSafe", domain: "safety", archetype: "inventory-catalog", tabs: ["overview", "rules", "filesafe"], purpose: "What the assistant may touch, and when it must ask." },
    { id: "bsd", title: "Back Seat Driver", family: "Back Seat Driver", domain: "safety", archetype: "preference-document", tabs: ["overview", "admission"], purpose: "When a reviewing model may admit or deny a turn." },
    { id: "notifications", title: "Notifications & Sounds", family: "Notifications & Sounds", domain: "general", archetype: "preference-document", tabs: ["overview", "channels", "preview"], purpose: "Where alerts go and how they sound." },
    { id: "soundLibrary", title: "Sound Library", family: "Sound Library / Uploads / Packs", domain: "general", archetype: "inventory-catalog", tabs: ["overview", "packs", "uploads"], purpose: "Packs, uploads, and per-event sounds." },
    { id: "appearance", title: "Appearance", family: "Appearance / themes / fonts / motion", domain: "general", archetype: "preference-document", tabs: ["overview", "themes", "type", "motion"], purpose: "Theme, type, density, and motion for this project." },
    { id: "spellcheck", title: "Spellcheck & Dictionaries", family: "Spellcheck & Dictionaries", domain: "general", archetype: "roster-detail", tabs: ["overview", "dictionaries"], purpose: "Personal and project dictionaries." },
    { id: "desktop", title: "Desktop, Tray & Window", family: "Desktop / Tray / Window", domain: "general", archetype: "preference-document", tabs: ["overview", "tray", "window"], purpose: "How the desktop app sits on this machine." },
    { id: "teacher", title: "Teacher & Help", family: "Teacher / Help", domain: "general", archetype: "preference-document", tabs: ["overview", "tips"], purpose: "In-product teaching and help surfaces." },
    { id: "doctor", title: "Doctor", family: "Doctor", domain: "system", archetype: "health-projection", tabs: ["overview", "checks", "repair"], purpose: "Health checks and repair entry points." },
    { id: "fileManager", title: "File Manager & Editor", family: "File Manager / Editor", domain: "code", archetype: "preference-document", tabs: ["overview", "editor", "ignore"], purpose: "How files open, save, and hide." },
    { id: "terminal", title: "Terminal", family: "Terminal", domain: "code", archetype: "preference-document", tabs: ["overview", "profiles", "shell"], purpose: "Shell profiles and terminal behavior." },
    { id: "lsp", title: "Language Servers", family: "LSP", domain: "code", archetype: "roster-detail", tabs: ["overview", "servers", "logs"], purpose: "Language intelligence for this project." },
    { id: "formatters", title: "Formatters", family: "Formatters", domain: "code", archetype: "roster-detail", tabs: ["overview", "tools"], purpose: "Format-on-save and language tools." },
    { id: "commands", title: "Commands & Shortcuts", family: "Commands & Shortcuts", domain: "extensions", archetype: "inventory-catalog", tabs: ["overview", "bindings"], purpose: "Command palette and keybindings." },
    { id: "mcp", title: "MCP Servers", family: "MCP", domain: "system", archetype: "roster-detail", tabs: ["overview", "servers", "tools"], purpose: "Model Context Protocol servers this project may use." },
    { id: "skills", title: "Skills", family: "Skills", domain: "extensions", archetype: "roster-detail", tabs: ["overview", "library"], purpose: "Reusable skills available to the assistant." },
    { id: "plugins", title: "Plugins", family: "Plugins", domain: "extensions", archetype: "roster-detail", tabs: ["overview", "installed"], purpose: "Installed plugins and their permissions." },
    { id: "tools", title: "Tools", family: "Tools", domain: "extensions", archetype: "inventory-catalog", tabs: ["overview", "catalog"], purpose: "Tool catalog and enablement." },
    { id: "testing", title: "Testing & Debug", family: "Testing & Debug", domain: "planning", archetype: "preference-document", tabs: ["overview", "policy", "debug"], purpose: "When tests run and how failures are treated." },
    { id: "storage", title: "Storage & Retention", family: "Storage & Retention", domain: "system", archetype: "preference-document", tabs: ["overview", "retention"], purpose: "What is kept, and for how long." },
    { id: "backup", title: "Backup & Restore", family: "Backup & Restore", domain: "system", archetype: "setup-sequence", tabs: ["overview", "schedule", "restore"], purpose: "Project backups and restore points." },
    { id: "lifecycle", title: "Settings Lifecycle", family: "Settings Lifecycle", domain: "system", archetype: "preview-transaction", tabs: ["overview", "import", "export", "reset"], purpose: "Import, export, reset, migration, and rollback." },
    { id: "history", title: "History & Sessions", family: "History & Sessions", domain: "memory", archetype: "inventory-catalog", tabs: ["overview", "sessions"], purpose: "Past sessions and legal hold." },
    { id: "artifacts", title: "Runtime Artifacts", family: "Runtime Artifacts / Project Outputs", domain: "system", archetype: "inventory-catalog", tabs: ["overview", "outputs"], purpose: "Run outputs kept with this project." },
    { id: "worktrees", title: "Source Control & Worktrees", family: "Source Control / Worktrees", domain: "branching", archetype: "roster-detail", tabs: ["overview", "trees"], purpose: "Git worktrees and branch policy." },
    { id: "githubActions", title: "GitHub Actions", family: "GitHub Actions", domain: "branching", archetype: "roster-detail", tabs: ["overview", "workflows"], purpose: "Workflows this project may dispatch." },
    { id: "containers", title: "Containers & Registries", family: "Containers & Registries", domain: "system", archetype: "roster-detail", tabs: ["overview", "registries"], purpose: "Images and registries the project may use." },
    { id: "web", title: "Web, Search, Fetch & Crawl", family: "Web / Search / Fetch / Crawl", domain: "web", archetype: "preference-document", tabs: ["overview", "providers", "policy"], purpose: "How the assistant reads the web." },
    { id: "searchIndex", title: "Project Search Index", family: "Project Search Index", domain: "web", archetype: "health-projection", tabs: ["overview", "status"], purpose: "Indexed project content used for retrieval." },
    { id: "cleanup", title: "Workspace Cleanup", family: "Workspace Cleanup", domain: "system", archetype: "setup-sequence", tabs: ["overview", "rules"], purpose: "What leftover files may be removed." },
    { id: "media", title: "Media & Output", family: "Media & Output", domain: "media", archetype: "preference-document", tabs: ["overview", "image", "audio"], purpose: "Image and media generation for this project." },
    { id: "dryMethod", title: "DRY Method", family: "DRY Method visible state where exposed", domain: "system", archetype: "health-projection", tabs: ["overview", "owners"], purpose: "Visible singular-owner status already exposed by the product." }
  ];
  var MGR_BY_ID = {};
  MANAGERS.forEach(function (m) { MGR_BY_ID[m.id] = m; });

  var DEFERRED = [
    { id: "onboarding", title: "Product Onboarding", owner: "Onboarding module", domain: "system" },
    { id: "installation", title: "Installation / Deployment", owner: "Installer / Deployment module", domain: "system" },
    { id: "serverClaim", title: "Server Claim / Bootstrap", owner: "Server backbone", domain: "system" },
    { id: "servers", title: "Servers / Execution Hosts / Clients", owner: "Server backbone", domain: "system" },
    { id: "projectHosting", title: "Project Hosting & Files", owner: "Project Hosting module", domain: "system" },
    { id: "remoteAccess", title: "Remote Access", owner: "Remote Access module", domain: "system" },
    { id: "projectSync", title: "Project Sync / Move", owner: "Project Sync module", domain: "system" },
    { id: "appUpdates", title: "Puppet Master application/content updates", owner: "Update owner", domain: "general" },
    { id: "fullServerBackup", title: "Full Server backup owner flow", owner: "Server backup owner", domain: "system" }
  ];
  var DEF_BY_ID = {};
  DEFERRED.forEach(function (d) { DEF_BY_ID[d.id] = d; });

  var DOMAIN_MANAGERS = {
    general: ["appearance", "desktop", "notifications", "soundLibrary", "teacher", "spellcheck"],
    ai: ["providers"],
    safety: ["permissions", "bsd"],
    code: ["fileManager", "terminal", "lsp", "formatters"],
    memory: ["context", "memory", "history"],
    planning: ["goal", "testing"],
    branching: ["crew", "worktrees", "githubActions"],
    media: ["media"],
    web: ["web", "searchIndex"],
    personas: ["personas"],
    extensions: ["skills", "plugins", "commands", "tools", "mcp"],
    system: ["doctor", "storage", "backup", "lifecycle", "artifacts", "containers", "cleanup", "dryMethod"]
  };

  function objectsFor(managerId) {
    var catalog = {
      providers: [
        { id: "anthropic", label: "Anthropic", kind: "provider", availability: "ready", product: "Claude", account: "work@studio", models: "Claude 4 Sonnet", usage: "Included remaining 62%", setup: "Installed" },
        { id: "openai", label: "OpenAI", kind: "provider", availability: "ready", product: "OpenAI API", account: "studio-prod", models: "GPT-4.1", usage: "Pay-as-you-go", setup: "Installed" },
        { id: "local-ollama", label: "Ollama (local)", kind: "provider", availability: "setup_required", product: "Ollama", account: "None", models: "Unavailable until setup", usage: "Usage unavailable", setup: "Not installed" },
        { id: "google", label: "Google AI", kind: "provider", availability: "reconnect_required", product: "Gemini", account: "Needs reconnect", models: "Cached catalog", usage: "Stale", setup: "Installed" }
      ],
      memory: [
        { id: "mem-workspace", label: "Workspace note", kind: "memory", availability: "ready" },
        { id: "mem-style", label: "Workspace note", kind: "memory", availability: "managed" }
      ],
      personas: [
        { id: "persona-default", label: "Default", kind: "persona", availability: "ready" },
        { id: "persona-reviewer", label: "Reviewer", kind: "persona", availability: "ready" }
      ],
      crew: [
        { id: "seat-planner", label: "Planner", kind: "seat", availability: "ready" },
        { id: "seat-reviewer", label: "Reviewer seat", kind: "seat", availability: "ready" }
      ],
      permissions: [
        { id: "rule-write-src", label: "Allow writes in src", kind: "rule", availability: "ready" },
        { id: "rule-deny-secrets", label: "Deny secrets path", kind: "rule", availability: "managed" }
      ],
      spellcheck: [
        { id: "dict-personal", label: "Personal dictionary", kind: "dictionary", availability: "ready" },
        { id: "dict-project", label: "Project dictionary", kind: "dictionary", availability: "ready" }
      ],
      lsp: [
        { id: "lsp-rust", label: "rust-analyzer", kind: "server", availability: "ready" },
        { id: "lsp-ts", label: "typescript-language-server", kind: "server", availability: "offline" }
      ],
      formatters: [
        { id: "fmt-prettier", label: "Prettier", kind: "formatter", availability: "ready" },
        { id: "fmt-rustfmt", label: "rustfmt", kind: "formatter", availability: "ready" }
      ],
      mcp: [
        { id: "mcp-github", label: "GitHub MCP", kind: "server", availability: "ready" },
        { id: "mcp-browser", label: "Browser MCP", kind: "server", availability: "unavailable" }
      ],
      skills: [
        { id: "skill-review", label: "Code review", kind: "skill", availability: "ready" },
        { id: "skill-release", label: "Release notes", kind: "skill", availability: "ready" }
      ],
      plugins: [
        { id: "plug-icons", label: "Icon pack", kind: "plugin", availability: "ready" },
        { id: "plug-draw", label: "Draw", kind: "plugin", availability: "managed" }
      ],
      tools: [
        { id: "tool-rg", label: "ripgrep", kind: "tool", availability: "ready" },
        { id: "tool-ffmpeg", label: "ffmpeg", kind: "tool", availability: "setup_required" }
      ],
      worktrees: [
        { id: "wt-main", label: "main", kind: "worktree", availability: "ready" },
        { id: "wt-exp", label: "experiment", kind: "worktree", availability: "ready" }
      ],
      githubActions: [
        { id: "gha-ci", label: "CI", kind: "workflow", availability: "ready" },
        { id: "gha-release", label: "Release", kind: "workflow", availability: "unavailable" }
      ],
      containers: [
        { id: "reg-ghcr", label: "ghcr.io", kind: "registry", availability: "ready" },
        { id: "img-dev", label: "dev-image", kind: "image", availability: "ready" }
      ],
      artifacts: [
        { id: "art-last-run", label: "Last run log", kind: "artifact", availability: "ready" },
        { id: "art-bundle", label: "Export bundle", kind: "artifact", availability: "ready" }
      ],
      history: [
        { id: "sess-today", label: "Today’s session", kind: "session", availability: "ready" },
        { id: "sess-hold", label: "Legal hold transcript", kind: "session", availability: "managed" }
      ],
      soundLibrary: [
        { id: "snd-peon", label: "PeonPing", kind: "sound", availability: "ready" },
        { id: "snd-pack", label: "OpenPeon pack", kind: "pack", availability: "managed" }
      ]
    };
    if (catalog[managerId]) return catalog[managerId];
    return [
      { id: managerId + "-primary", label: (MGR_BY_ID[managerId] || {}).title || managerId, kind: "resource", availability: "ready" },
      { id: managerId + "-alt", label: "Secondary", kind: "resource", availability: "ready" }
    ];
  }

  var INSTALLS = [
    { id: "claude-cli-stable", provider: "anthropic", label: "Claude CLI (stable)", host: "This PC / Native Windows", owner: "Anthropic", selected: true, shadowed: false, health: "ready", official: true },
    { id: "claude-cli-beta", provider: "anthropic", label: "Claude CLI (beta)", host: "This PC / Native Windows", owner: "Anthropic", selected: false, shadowed: true, health: "ready", official: true },
    { id: "ollama-missing", provider: "local-ollama", label: "Ollama (not installed)", host: "This PC / Native Windows", owner: "unknown", selected: false, shadowed: false, health: "setup_required", official: true, manualOnly: true }
  ];

  var PROJECTS = [
    { id: "puppet-master", name: "puppet-master", current: true },
    { id: "northwind-docs", name: "Northwind Docs", current: false },
    { id: "tastebook", name: "Tastebook", current: false }
  ];

  var ATTENTION = [
    { id: "att-ollama", title: "Ollama is not set up", detail: "Install from the official Ollama source for this PC, then sign in separately.", destId: "workflow:provider-cli-setup" },
    { id: "att-google", title: "Google AI needs reconnect", detail: "The saved session expired. Reconnect without changing other projects.", destId: "object:providers:google" },
    { id: "att-import", title: "Import conflict waiting", detail: "A settings import is paused on two conflicting rows.", destId: "manager:lifecycle" }
  ];

  function buildIndex() {
    var index = [];
    var seenIds = {};
    function add(entry) {
      if (!entry || !entry.id || seenIds[entry.id]) return;
      seenIds[entry.id] = 1;
      index.push(entry);
    }

    (INV.categories || []).forEach(function (c) {
      add({
        id: "domain:" + c.id,
        type: "setting",
        label: c.title,
        path: "Settings / " + c.title,
        dest: { name: "domain", domain: c.id },
        terms: (c.description || "") + " " + c.id,
        availability: "ready"
      });
      (c.subgroups || []).forEach(function (sg) {
        add({
          id: "page:" + c.id + "." + sg.id,
          type: "setting",
          label: sg.title,
          path: "Settings / " + c.title + " / " + sg.title,
          dest: { name: "domain", domain: c.id, page: sg.id, section: sg.id },
          terms: (sg.description || "") + " " + sg.id,
          availability: "ready"
        });
      });
    });

    (INV.settings || []).forEach(function (s) {
      var d = settingDest(s);
      add({
        id: "setting:" + s.id,
        type: "setting",
        label: s.label,
        path: "Settings / " + d.domainTitle + " / " + d.pageTitle + " / " + s.label,
        dest: { name: "domain", domain: d.domain, page: d.page, section: d.page, row: s.id },
        terms: [s.desc, (s.search || []).join(" "), s.id].join(" "),
        availability: "ready",
        settingId: s.id
      });
    });

    MANAGERS.forEach(function (m) {
      var cat = CAT_BY_ID[m.domain];
      add({
        id: "manager:" + m.id,
        type: "manager",
        label: m.title,
        path: "Settings / " + (cat ? cat.title : m.domain) + " / " + m.title,
        dest: { name: "manager", domain: m.domain, manager: m.id, page: m.tabs[0] },
        terms: m.purpose + " " + m.family + " " + m.id,
        availability: "ready"
      });
      objectsFor(m.id).forEach(function (obj) {
        add({
          id: "object:" + m.id + ":" + obj.id,
          type: "managed_object",
          label: obj.label,
          path: "Settings / " + m.title + " / " + obj.label,
          dest: { name: "manager", domain: m.domain, manager: m.id, object: obj.id, page: m.tabs[1] || m.tabs[0] },
          terms: obj.kind + " " + obj.id + " " + (obj.availability || ""),
          availability: obj.availability || "ready",
          objectId: obj.id,
          managerId: m.id
        });
      });
    });

    DEFERRED.forEach(function (d) {
      add({
        id: "unavailable:" + d.id,
        type: "unavailable_capability",
        label: d.title,
        path: "Settings / System & Advanced / " + d.title,
        dest: { name: "deferred", domain: d.domain, deferred: d.id },
        terms: d.owner + " deferred named owner",
        availability: "unavailable"
      });
    });

    add({
      id: "action:copy-from-project",
      type: "action",
      label: "Copy Settings From Another Project",
      path: "Settings / Copy from another project",
      dest: { name: "copy" },
      terms: "import clone transfer one-time",
      availability: "ready"
    });
    add({
      id: "action:open-all-settings",
      type: "action",
      label: "Open All Settings",
      path: "Settings / All Settings",
      dest: { name: "all" },
      terms: "compendium index long-tail",
      availability: "ready"
    });
    add({
      id: "workflow:provider-cli-setup",
      type: "setup_or_repair_workflow",
      label: "Install Ollama from official source",
      path: "Settings / AI Brains & Providers / Providers / Ollama / Setup",
      dest: { name: "manager", domain: "ai", manager: "providers", object: "local-ollama", page: "setup", row: "install-official" },
      terms: "provider cli install setup official ollama missing",
      availability: "setup_required"
    });
    add({
      id: "diagnostic:usage-stale",
      type: "diagnostic_or_read_only_status",
      label: "Google usage projection is stale",
      path: "Settings / Providers / Google AI / Usage",
      dest: { name: "manager", domain: "ai", manager: "providers", object: "google", page: "usage", row: "usage-projection" },
      terms: "usage reconnect stale diagnostic",
      availability: "reconnect_required"
    });
    add({
      id: "help:copy-policy",
      type: "intentional_help_result",
      label: "How copy from another project works",
      path: "Settings / Help / Copy Settings",
      dest: { name: "copy", section: "help" },
      terms: "help one-time restore point rollback independent",
      availability: "ready"
    });
    add({
      id: "action:retry-default-account",
      type: "action",
      label: "Default",
      path: "Settings / Providers / Anthropic / Accounts / Default",
      dest: { name: "manager", domain: "ai", manager: "providers", object: "anthropic", page: "accounts", row: "account-default" },
      terms: "duplicate label account default",
      availability: "ready"
    });

    /* labeled synthetic overlay — not product inventory */
    var i;
    for (i = 0; i < 2000; i++) {
      add({
        id: "synthetic:stress-" + i,
        type: "setting",
        label: "Synthetic scale row " + i,
        path: "Settings / Synthetic overlay / Row " + i,
        dest: { name: "all", row: "synthetic:stress-" + i },
        terms: "synthetic scale overlay not-product",
        availability: "ready",
        synthetic: true
      });
    }
    return index;
  }

  var INDEX = buildIndex();
  var INDEX_BY_ID = {};
  INDEX.forEach(function (e) { INDEX_BY_ID[e.id] = e; });
  var PRODUCT_SETTING_IDS = (INV.settings || []).map(function (s) { return s.id; });

  function assertIndexComplete() {
    var settings = PRODUCT_SETTING_IDS;
    var indexed = 0;
    var missing = [];
    var i, id;
    for (i = 0; i < settings.length; i++) {
      id = settings[i];
      if (INDEX_BY_ID["setting:" + id]) indexed++;
      else missing.push(id);
    }
    var types = {
      setting: 0,
      manager: 0,
      object: 0,
      action: 0,
      workflow: 0,
      diagnostic: 0,
      unavailable: 0
    };
    var product = 0;
    var synth = 0;
    INDEX.forEach(function (e) {
      if (e.synthetic) { synth++; return; }
      product++;
      if (e.type === "setting") types.setting++;
      else if (e.type === "manager") types.manager++;
      else if (e.type === "managed_object") types.object++;
      else if (e.type === "action") types.action++;
      else if (e.type === "setup_or_repair_workflow") types.workflow++;
      else if (e.type === "diagnostic_or_read_only_status") types.diagnostic++;
      else if (e.type === "unavailable_capability") types.unavailable++;
    });
    return {
      settings: settings.length,
      indexedSettings: indexed,
      missingSettingIds: missing,
      productIndex: product,
      synthetic: synth,
      types: types
    };
  }

  function routeSettingRow(app, rowId) {
    if (!app || rowId == null || rowId === "") return;
    var rid = rowResultId(rowId);
    if (INDEX_BY_ID[rid]) {
      app.pickResult(rid);
      return;
    }
    var s = SET_BY_ID[rowId];
    if (!s) return;
    var dest = settingDest(s);
    dest.row = rowId;
    dest.highlight = rowId;
    app.navigate(dest, { keepSearch: false });
  }

  var DEMO_STATES = [
    "loading-cached", "empty", "no-search-results", "typo-fuzzy", "validation-error",
    "offline", "managed", "unavailable", "restart-required", "reconnect-required",
    "changed-elsewhere", "import-conflict", "rollback-complete", "usage-unavailable",
    "multi-install", "unknown-owner", "provider-update", "verification-failure"
  ];

  function fuzzy(text, query) {
    if (!text) return null;
    var t = String(text).toLowerCase();
    var q = String(query).toLowerCase();
    var start = 0, last = -2, score = 0, idx = [];
    var qi, found;
    for (qi = 0; qi < q.length; qi++) {
      found = t.indexOf(q.charAt(qi), start);
      if (found === -1) return null;
      idx.push(found);
      score += 1;
      if (found === last + 1) score += 2;
      if (found === 0 || /[\s\-·/.,()]/.test(t.charAt(found - 1))) score += 3;
      start = found + 1;
      last = found;
    }
    score += Math.max(0, 4 - idx[0]);
    return { score: score, idx: idx };
  }

  function search(query, opts) {
    var q = String(query == null ? "" : query).trim();
    if (!q) return [];
    var includeSynthetic = !!(opts && opts.includeSynthetic);
    var limit = (opts && opts.limit) || 24;
    var gen = ++search.gen;
    search.latest = gen;
    var results = [];
    var i, e, onLabel, onTerms, onPath, best, score, titleLc;
    for (i = 0; i < INDEX.length; i++) {
      e = INDEX[i];
      if (e.synthetic && !includeSynthetic) continue;
      onLabel = fuzzy(e.label, q);
      onTerms = fuzzy(e.terms, q);
      onPath = fuzzy(e.path, q);
      best = 0;
      if (onLabel) best = Math.max(best, onLabel.score * 3);
      if (onTerms) best = Math.max(best, onTerms.score * 2);
      if (onPath) best = Math.max(best, onPath.score);
      if (!best) continue;
      titleLc = String(e.label).toLowerCase();
      score = best + Math.max(0, 12 - e.label.length) * 0.25;
      if (titleLc === q.toLowerCase()) score += 28;
      else if (titleLc.indexOf(q.toLowerCase()) === 0) score += 16;
      if (e.type === "manager") score += 10;
      results.push({
        id: e.id,
        type: e.type,
        label: e.label,
        path: e.path,
        dest: clone(e.dest),
        availability: e.availability,
        score: score,
        synthetic: !!e.synthetic
      });
    }
    results.sort(function (a, b) { return b.score - a.score; });
    if (search.latest !== gen) return search.lastResults || [];
    search.lastResults = results.slice(0, limit);
    return search.lastResults;
  }
  search.gen = 0;
  search.latest = 0;
  search.lastResults = [];

  var WORK_STATES = {
    accepted: 1, queued: 1, starting: 1, running: 1, synchronizing: 1,
    waiting_provider: 1, waiting_host: 1, waiting_network: 1, waiting_resource: 1,
    waiting_permission: 1, waiting_for_sign_in: 1, waiting_user: 1, retrying: 1,
    degraded: 1, stalled: 1, committing: 1, verifying: 1, rolling_back: 1,
    completed: 1, failed: 1, cancelled: 1, recovery_required: 1
  };
  var TERMINAL = { completed: 1, failed: 1, cancelled: 1, recovery_required: 1 };

  function normalizeWork(snap) {
    snap = snap || {};
    var state;
    if (!snap.state) state = "running";
    else if (WORK_STATES[snap.state]) state = snap.state;
    else state = "degraded";
    var kind = snap.progress_kind || "unknown";
    var determinate = kind === "determinate" && typeof snap.completed === "number" && typeof snap.total === "number" && snap.total > 0;
    return {
      operation_id: snap.operation_id || ("pmv2-ow-" + Date.now()),
      title: snap.title || "Working",
      human_phase: snap.human_phase || "Working",
      state: state,
      progress_kind: determinate ? "determinate" : (kind === "none" ? "none" : "indeterminate"),
      completed: determinate ? snap.completed : null,
      total: determinate ? snap.total : null,
      wait_reason: snap.wait_reason || "",
      progress_source: snap.progress_source || "unknown",
      can_cancel: !!snap.can_cancel,
      can_retry: !!snap.can_retry,
      message: snap.message || "",
      last_known_good: snap.last_known_good !== false
    };
  }

  function receipt(text, kind) {
    var stack = document.querySelector(".pmv2-toast-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "pmv2-toast-stack";
      document.body.appendChild(stack);
    }
    var toast = document.createElement("div");
    toast.className = "pmv2-toast";
    toast.setAttribute("data-kind", kind || "info");
    toast.setAttribute("role", "status");
    toast.textContent = text;
    stack.appendChild(toast);
    window.setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 4200);
  }

  function storageGet(key) {
    try {
      var raw = window.sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function storageSet(key, value) {
    try { window.sessionStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  function defaultValues() {
    var vals = {};
    (INV.settings || []).forEach(function (s) {
      vals[s.id] = s.default === undefined ? null : clone(s.default);
    });
    /* project-only demo overrides */
    vals["general.visual.theme"] = "Friendly Dark";
    vals["ai.models.default-model"] = vals["ai.models.default-model"] || "Claude 4 Sonnet";
    return vals;
  }

  function sourceProjectValues(pid) {
    var vals = defaultValues();
    if (pid === "northwind-docs") {
      vals["general.visual.theme"] = "Glass Light";
      vals["general.interaction.density"] = vals["general.interaction.density"] || "comfortable";
      vals["safety.rules.preset"] = "cautious";
    }
    if (pid === "tastebook") {
      vals["general.visual.theme"] = "Retro Dark";
      vals["media.image.quality"] = "high";
    }
    return vals;
  }

  function virtualList(host, items, rowHeight, renderRow) {
    if (!host) return { dispose: function () {}, painted: 0 };
    rowHeight = rowHeight || 56;
    items = items || [];
    var onScroll = function () {
      var h = host.clientHeight || 400;
      var start = Math.max(0, Math.floor(host.scrollTop / rowHeight) - 6);
      var end = Math.min(items.length, Math.ceil((host.scrollTop + h) / rowHeight) + 6);
      var top = start * rowHeight;
      var bottom = (items.length - end) * rowHeight;
      var html = '<div data-virt-pad="top" style="height:' + top + 'px"></div>';
      var i, item;
      for (i = start; i < end; i++) {
        item = items[i];
        html += renderRow(item, i);
      }
      html += '<div data-virt-pad="bottom" style="height:' + bottom + 'px"></div>';
      host.innerHTML = html;
      host.setAttribute("data-virt-painted", String(end - start));
      host.setAttribute("data-virt-total", String(items.length));
    };
    host.onscroll = onScroll;
    onScroll();
    return { refresh: onScroll, dispose: function () { host.onscroll = null; }, painted: function () { return Number(host.getAttribute("data-virt-painted") || 0); } };
  }

  function popupPlace(pop, anchor) {
    if (!pop || !anchor) return;
    var r = anchor.getBoundingClientRect();
    var vw = window.innerWidth || 0, vh = window.innerHeight || 0;
    var pw = pop.offsetWidth, ph = pop.offsetHeight;
    var left = r.left;
    var top = r.bottom + 6;
    if (left < 8) left = 8;
    if (left + pw > vw - 8) left = Math.max(8, vw - pw - 8);
    if (top + ph > vh - 8) top = Math.max(8, r.top - ph - 6);
    if (top + ph > vh - 8) top = Math.max(8, vh - ph - 8);
    pop.style.left = left + "px";
    pop.style.top = top + "px";
    pop.setAttribute("data-collision", "clamped");
  }
  function popupOpen(anchor, items, onPick) {
    popupClose();
    var pop = document.createElement("div");
    pop.className = "pmv2-popup pmv2-scroll";
    pop.setAttribute("role", "menu");
    pop.setAttribute("tabindex", "-1");
    var html = "";
    (items || []).forEach(function (it) {
      if (it.sep) { html += '<div class="pmv2-popup-sep"></div>'; return; }
      html += '<button type="button" class="pmv2-popup-item" role="menuitem" data-pop-id="' + esc(it.id) + '">' + esc(it.label) + "</button>";
    });
    pop.innerHTML = html;
    document.body.appendChild(pop);
    popupPlace(pop, anchor);
    pop.addEventListener("click", function (ev) {
      var btn = ev.target.closest("[data-pop-id]");
      if (!btn) return;
      var id = btn.getAttribute("data-pop-id");
      popupClose();
      if (onPick) onPick(id);
    });
    popupOpen._el = pop;
    popupOpen._onDoc = function (ev) {
      if (pop.contains(ev.target) || (anchor && anchor.contains(ev.target))) return;
      popupClose();
    };
    popupOpen._onKey = function (ev) {
      if (ev.key === "Escape") { ev.preventDefault(); popupClose(); }
    };
    popupOpen._onWin = function () { popupPlace(pop, anchor); };
    document.addEventListener("mousedown", popupOpen._onDoc);
    document.addEventListener("keydown", popupOpen._onKey);
    window.addEventListener("resize", popupOpen._onWin);
    window.addEventListener("scroll", popupOpen._onWin, true);
    try { pop.focus({ preventScroll: true }); } catch (e) {}
    return pop;
  }
  function popupClose() {
    if (popupOpen._onDoc) document.removeEventListener("mousedown", popupOpen._onDoc);
    if (popupOpen._onKey) document.removeEventListener("keydown", popupOpen._onKey);
    if (popupOpen._onWin) {
      window.removeEventListener("resize", popupOpen._onWin);
      window.removeEventListener("scroll", popupOpen._onWin, true);
    }
    popupOpen._onDoc = null;
    popupOpen._onKey = null;
    popupOpen._onWin = null;
    if (popupOpen._el && popupOpen._el.parentNode) popupOpen._el.parentNode.removeChild(popupOpen._el);
    popupOpen._el = null;
  }

  function highlight(el) {
    if (!el) return;
    el.classList.remove("pmv2-hl");
    void el.offsetWidth;
    el.classList.add("pmv2-hl");
    if (typeof el.focus === "function") {
      try { el.focus({ preventScroll: true }); } catch (e) { try { el.focus(); } catch (e2) {} }
    }
    if (el.scrollIntoView) el.scrollIntoView({ block: "center", inline: "nearest", behavior: reducedMotion() ? "auto" : "smooth" });
    window.setTimeout(function () { el.classList.remove("pmv2-hl"); }, 1400);
  }

  function captureCaret(root) {
    var ae = document.activeElement;
    if (!ae || !root || (root.contains && !root.contains(ae))) return null;
    var tag = String(ae.tagName || "").toLowerCase();
    if (tag !== "input" && tag !== "textarea") return { el: ae };
    return { el: ae, start: ae.selectionStart, end: ae.selectionEnd };
  }
  function restoreCaret(root, snap) {
    if (!snap) return;
    var el = snap.el;
    if (!el || !el.isConnected) {
      if (!root) return;
      el = root.querySelector("input[data-pmv2-search], input[type=search], input[name=search]");
    }
    if (!el) return;
    try { el.focus({ preventScroll: true }); } catch (e) { try { el.focus(); } catch (e2) {} }
    if (snap.start == null || typeof el.setSelectionRange !== "function") return;
    try { el.setSelectionRange(snap.start, snap.end != null ? snap.end : snap.start); } catch (e3) {}
  }

  function controlModel(app, settingId) {
    var s = SET_BY_ID[settingId];
    if (!s) return null;
    var flags = app.flags || {};
    var disabled = false;
    var reason = "";
    var originKind = "project";
    if (flags.managed && (s.tier === "advanced" || /safety\./.test(settingId))) {
      disabled = true; reason = "Managed by organization policy for this project."; originKind = "policy";
    }
    if (flags.unavailable && /ai\./.test(settingId)) {
      disabled = true; reason = "Unavailable until the provider is set up."; originKind = "unavailable";
    }
    if (flags.offline && /web\./.test(settingId)) {
      disabled = true; reason = "Offline — cached value shown."; originKind = "cached";
    }
    return {
      id: s.id,
      label: s.label,
      desc: s.desc,
      type: s.type,
      options: s.options || [],
      value: app.values[s.id],
      defaultValue: s.default,
      disabled: disabled,
      reason: reason,
      originKind: originKind,
      changed: !same(app.values[s.id], s.default),
      projectOnly: true
    };
  }

  function settingDetails(app, settingId) {
    var m = controlModel(app, settingId);
    if (!m) return null;
    var projectName = (app.project && app.project.name) || "This project";
    var origin = { kind: m.originKind || "project", label: "Current project value", owner: projectName };
    if (m.originKind === "policy") origin = { kind: "policy", label: "Organization policy floor", owner: "Project policy" };
    if (m.originKind === "unavailable") origin = { kind: "unavailable", label: "Not effective until setup completes", owner: projectName };
    if (m.originKind === "cached") origin = { kind: "cached", label: "Cached while offline", owner: projectName };
    return {
      id: m.id,
      label: m.label,
      desc: m.desc,
      requested: m.value,
      effective: m.value,
      origin: origin,
      policyFloor: m.originKind === "policy" ? m.reason : null,
      persistence: "current-project",
      projectOnly: true,
      simulated: true,
      backend: "sessionStorage",
      scopeNote: "Not a Global/Project/Goal/Host switcher. Legacy inventory global metadata is projected into this project."
    };
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

  function settingsForPage(domain, page) {
    return (INV.settings || []).filter(function (s) {
      var p = s.id.split(".");
      if (p[0] !== domain) return false;
      if (page && p[1] !== page) return false;
      return true;
    });
  }

  function copyCategoryIds(app) {
    if (app.copy.categories && app.copy.categories.length) return app.copy.categories.slice();
    return (INV.categories || []).map(function (c) { return c.id; });
  }

  function previewRow(id, kind, fromVal, toVal, reason) {
    var s = SET_BY_ID[id];
    return {
      id: id,
      kind: kind,
      label: s ? s.label : id,
      path: id,
      from: fromVal,
      to: toVal,
      reason: reason || ""
    };
  }

  function copyPreview(app) {
    var srcId = app.copy.sourceId;
    if (!srcId) return null;
    var src = sourceProjectValues(srcId);
    var cats = copyCategoryIds(app);
    var additions = [], replacements = [], unchanged = [], unavailable = [], conflicts = [];
    var additionItems = [], replacementItems = [], unchangedItems = [], conflictItems = [];
    var conflictIds = {};
    var hostBoundId = "general.startup.window-state";
    var hostBoundReason = "Host-bound window layout is not copied. Projects stay independent.";
    var hostBound = SET_BY_ID[hostBoundId];
    conflicts.push({
      id: hostBoundId,
      label: (hostBound && hostBound.label) || "Remember Window Layout",
      reason: hostBoundReason
    });
    conflictItems.push(previewRow(hostBoundId, "conflict", app.values[hostBoundId], src[hostBoundId], hostBoundReason));
    conflictIds[hostBoundId] = 1;
    if (app.flags && app.flags.importConflict) {
      var themeId = "general.visual.theme";
      var themeReason = "Both projects changed Theme since the last backup. Skipped so this project stays independent.";
      conflicts.push({
        id: themeId,
        label: ((SET_BY_ID[themeId] || {}).label) || "Theme",
        reason: themeReason
      });
      conflictItems.push(previewRow(themeId, "conflict", app.values[themeId], src[themeId], themeReason));
      conflictIds[themeId] = 1;
    }
    (INV.settings || []).forEach(function (s) {
      var domain = s.id.split(".")[0];
      if (cats.indexOf(domain) === -1) return;
      if (s.type === "action") return;
      if (conflictIds[s.id]) return;
      var a = src[s.id], b = app.values[s.id];
      if (same(a, b)) {
        unchanged.push(s.id);
        unchangedItems.push(previewRow(s.id, "unchanged", b, a, "Already matches the source."));
      } else if (b == null || same(b, s.default)) {
        additions.push(s.id);
        additionItems.push(previewRow(s.id, "addition", b, a, "Source value will be added to this project."));
      } else {
        replacements.push(s.id);
        replacementItems.push(previewRow(s.id, "replacement", b, a, "This project value will be replaced once."));
      }
    });
    unavailable.push({
      id: "credential:anthropic",
      label: "Anthropic account reference",
      reason: "Account references copy; secrets never copy."
    });
    var CAP = 24;
    return {
      sourceName: (PROJECTS.filter(function (p) { return p.id === srcId; })[0] || {}).name,
      sourceId: srcId,
      projectOnly: true,
      independent: true,
      secretsNeverCopy: true,
      simulated: true,
      backend: "sessionStorage",
      counts: { additions: additions.length, replacements: replacements.length, unchanged: unchanged.length, unavailable: unavailable.length, conflicts: conflicts.length },
      truncated: {
        additions: Math.max(0, additions.length - CAP),
        replacements: Math.max(0, replacements.length - CAP),
        unchanged: Math.max(0, unchanged.length - CAP),
        conflicts: Math.max(0, conflictItems.length - CAP)
      },
      additions: additions.slice(0, CAP),
      replacements: replacements.slice(0, CAP),
      unchanged: unchanged.slice(0, CAP),
      additionItems: additionItems.slice(0, CAP),
      replacementItems: replacementItems.slice(0, CAP),
      unchangedItems: unchangedItems.slice(0, CAP),
      conflictItems: conflictItems.slice(0, CAP),
      unavailable: unavailable,
      conflicts: conflicts
    };
  }

  function createRestorePoint(app) {
    app.copy.restorePoint = clone(app.values);
    app.copy.restorePointAt = new Date().toISOString();
    return app.copy.restorePoint;
  }

  function beginCopyApply(app) {
    app.copy.step = "applying";
    if (!app.copy.restorePoint) createRestorePoint(app);
    app.work = normalizeWork({
      title: "Copy settings",
      human_phase: "Applying copy atomically",
      state: "committing",
      progress_kind: "indeterminate",
      progress_source: "copy transaction"
    });
    return app.work;
  }

  function applyCopy(app) {
    var preview = copyPreview(app);
    if (!preview) return null;
    app.work = normalizeWork({
      title: "Copy settings",
      human_phase: "Applying copy atomically",
      state: "committing",
      progress_kind: "indeterminate",
      progress_source: "copy transaction"
    });
    var src = sourceProjectValues(app.copy.sourceId);
    var cats = copyCategoryIds(app);
    var skip = {};
    (preview.conflicts || []).concat(preview.conflictItems || []).forEach(function (c) { skip[c.id] = 1; });
    if (!app.copy.restorePoint) createRestorePoint(app);
    var next = clone(app.values);
    (INV.settings || []).forEach(function (s) {
      var domain = s.id.split(".")[0];
      if (cats.indexOf(domain) === -1) return;
      if (s.type === "action") return;
      if (skip[s.id]) return;
      next[s.id] = clone(src[s.id]);
    });
    app.values = next;
    app.work = normalizeWork({
      title: "Copy settings",
      human_phase: "Verifying destination",
      state: "verifying",
      progress_kind: "indeterminate",
      progress_source: "copy transaction"
    });
    var mismatches = [];
    (INV.settings || []).forEach(function (s) {
      var domain = s.id.split(".")[0];
      if (cats.indexOf(domain) === -1) return;
      if (s.type === "action" || skip[s.id]) return;
      if (!same(app.values[s.id], src[s.id])) mismatches.push(s.id);
    });
    if (mismatches.length) {
      app.values = clone(app.copy.restorePoint);
      app.copy.step = "rolled_back";
      app.copy.receipt = {
        at: new Date().toISOString(),
        source: preview.sourceName,
        counts: preview.counts,
        independent: true,
        projectOnly: true,
        verified: false,
        mismatches: mismatches.slice(0, 8),
        restorePointAt: app.copy.restorePointAt || null,
        simulated: true,
        backend: "sessionStorage"
      };
      app.work = normalizeWork({
        title: "Copy settings",
        human_phase: "Verification failed — restore point applied",
        state: "recovery_required",
        progress_kind: "none",
        can_retry: true,
        message: "Destination did not match the preview. Rolled back. Projects stay independent."
      });
      receipt("Copy verification failed. Restored the pre-copy point.", "danger");
      return app.copy.receipt;
    }
    app.copy.receipt = {
      at: new Date().toISOString(),
      source: preview.sourceName,
      counts: preview.counts,
      independent: true,
      projectOnly: true,
      verified: true,
      mismatches: [],
      restorePointAt: app.copy.restorePointAt || null,
      simulated: true,
      backend: "sessionStorage"
    };
    app.copy.step = "receipt";
    app.work = normalizeWork({
      title: "Copy settings",
      human_phase: "Verified destination project",
      state: "completed",
      progress_kind: "none",
      message: "Copied into this project only. Future changes in " + preview.sourceName + " will not apply here."
    });
    receipt("Copy finished. This project is independent of " + preview.sourceName + ".", "ok");
    return app.copy.receipt;
  }

  function rollbackCopy(app) {
    if (!app.copy.restorePoint) return;
    app.values = clone(app.copy.restorePoint);
    app.copy.step = "rolled_back";
    app.work = normalizeWork({
      title: "Rollback copy",
      human_phase: "Restore point applied",
      state: "completed",
      progress_kind: "none"
    });
    receipt("Rolled back to the restore point taken before copy.", "ok");
  }

  function installOfficialCli(app, providerId) {
    var row = (app.installs || INSTALLS).filter(function (i) { return i.provider === providerId; })[0];
    var manual = (row == null) || row.manualOnly || row.owner === "unknown";
    app.work = normalizeWork({
      title: "Install from official source",
      human_phase: "Waiting for explicit Install confirmation",
      state: "waiting_user",
      wait_reason: "Official provider source for This PC / Native Windows",
      progress_kind: "none",
      progress_source: "user consent",
      last_known_good: true,
      message: manual
        ? "Not bundled. Not silently installed. Unknown owner stays manual-only. Sign-in is a separate step."
        : "Not bundled. Not silently installed. Sign-in is a separate step."
    });
    receipt("Install starts only after you confirm the official source (simulated).", "info");
    return app.work;
  }

  function confirmOfficialCli(app, providerId) {
    var row = (app.installs || INSTALLS).filter(function (i) { return i.provider === providerId; })[0];
    var manual = (row == null) || row.manualOnly || row.owner === "unknown";
    if (manual) {
      app.work = normalizeWork({
        title: "Install from official source",
        human_phase: "Unknown owner stays manual-only",
        state: "waiting_user",
        wait_reason: "Unknown owner is manual-only",
        progress_kind: "none",
        progress_source: "user consent",
        last_known_good: true,
        message: "Not bundled. Not silently installed. Unknown owner stays manual-only. Sign-in is a separate step."
      });
      receipt("Unknown owner stays manual-only. Not bundled. Not silently installed (simulated).", "warn");
      return app.work;
    }
    if (!app.work || app.work.state === "waiting_user") {
      app.work = normalizeWork({
        title: "Install from official source",
        human_phase: "Installing from official source",
        state: "running",
        wait_reason: "",
        progress_kind: "indeterminate",
        progress_source: "official provider source",
        last_known_good: true,
        message: "Not bundled. Not silently installed. Sign-in is a separate step."
      });
    }
    app.work = normalizeWork({
      title: "Install from official source",
      human_phase: "Official source install complete",
      state: "completed",
      wait_reason: "",
      progress_kind: "none",
      progress_source: "official provider source",
      last_known_good: true,
      message: "Installed from official source for This PC / Native Windows (simulated). Sign-in is a separate step."
    });
    receipt("Official source install finished for this project (simulated). Sign-in is a separate step.", "ok");
    return app.work;
  }

  function createApp(opts) {
    opts = opts || {};
    var ns = opts.namespace || "pmv2";
    var root = opts.root;
    var render = opts.render;
    var key = "pm.settings-v2." + ns;
    var restored = storageGet(key);
    var app = restored && restored.values ? restored : {
      project: { id: "puppet-master", name: "puppet-master" },
      values: (function () {
        var vals = defaultValues();
        /* Non-default so Copy preview shows a replacement, not only additions. */
        vals["general.visual.interface-density"] = "Compact";
        return vals;
      })(),
      flags: {
        cachedLoading: false,
        empty: false,
        offline: false,
        managed: false,
        unavailable: false,
        restart: false,
        reconnect: false,
        changedElsewhere: false,
        importConflict: false,
        rollbackComplete: false,
        usageUnavailable: false,
        probeStorm: false
      },
      route: { name: "home" },
      stack: [],
      query: "",
      selectedResultId: null,
      searchOpen: false,
      results: [],
      hydrated: {},
      copy: { step: null, sourceId: null, categories: [], restorePoint: null, receipt: null },
      work: null,
      statesOpen: false,
      origin: "workspace"
    };
    app.ns = ns;
    app.hydrated = {};
    app.results = app.results || [];
    app.searchOpen = app.searchOpen === true;
    app.flags = app.flags || {};
    app.flags.probeStorm = false;
    if (!app.origin) app.origin = "workspace";
    if (app.query && !app.results.length) app.results = search(app.query);

    function persist() {
      storageSet(key, {
        project: app.project,
        values: app.values,
        flags: app.flags,
        route: app.route,
        stack: app.stack,
        query: app.query,
        selectedResultId: app.selectedResultId,
        copy: app.copy
      });
    }
    function paint() {
      var caret = captureCaret(root);
      persist();
      if (typeof render === "function") render(app);
      restoreCaret(root, caret);
      window.setTimeout(function () {
        if (app.searchOpen) return;
        var rid = app.route && (app.route.row || app.route.highlight);
        if (!rid || !root) return;
        var el = root.querySelector('[data-row-id="' + cssEscape(String(rid)) + '"]');
        if (el) highlight(el);
      }, 30);
    }

    app.productSettingCount = PRODUCT_SETTING_IDS.length;
    app.categories = INV.categories;
    app.managers = MANAGERS;
    app.deferred = DEFERRED;
    app.attention = ATTENTION;
    app.projects = PROJECTS;
    app.installs = INSTALLS;
    app.domainManagers = DOMAIN_MANAGERS;
    app.objectsFor = objectsFor;
    app.settingsForPage = settingsForPage;
    app.controlModel = function (id) { return controlModel(app, id); };
    app.setting = function (id) { return SET_BY_ID[id]; };
    app.esc = esc;
    app.mgr = function (id) { return MGR_BY_ID[id]; };
    app.cat = function (id) { return CAT_BY_ID[id]; };
    app.indexCount = INDEX.filter(function (e) { return !e.synthetic; }).length;
    app.syntheticCount = INDEX.filter(function (e) { return e.synthetic; }).length;

    app.setFlag = function (name, on) {
      app.flags[name] = !!on;
      if (name === "offline" && on) {
        app.work = normalizeWork({ title: "Refresh", human_phase: "Waiting for network", state: "waiting_network", wait_reason: "No network", progress_kind: "none", last_known_good: true, message: "Showing last cached values." });
      }
      if (name === "cachedLoading" && on) {
        app.work = normalizeWork({ title: "Refresh providers", human_phase: "Refreshing", state: "running", progress_kind: "indeterminate", last_known_good: true, message: "Cached provider list still visible." });
      }
      if (name === "rollbackComplete" && on) {
        app.work = normalizeWork({ title: "Rollback", human_phase: "Rollback complete", state: "completed", progress_kind: "none" });
      }
      paint();
    };

    app.navigate = function (route, navOpts) {
      navOpts = navOpts || {};
      var prevManager = app.route && app.route.manager;
      if (!navOpts.replace && app.route) {
        app.stack.push({
          route: clone(app.route),
          query: app.query,
          selectedResultId: app.selectedResultId,
          searchOpen: app.searchOpen
        });
      }
      app.route = clone(route) || { name: "home" };
      if (prevManager && prevManager !== app.route.manager) {
        app.disposeManager(prevManager);
      }
      if (app.route.manager && !app.hydrated[app.route.manager]) {
        app.hydrated[app.route.manager] = { at: Date.now() };
      }
      if (app.route.name !== "home") app.searchOpen = !!navOpts.keepSearch;
      paint();
    };

    app.back = function () {
      popupClose();
      var curManager = app.route && app.route.manager;
      var prev = app.stack.pop();
      if (!prev) {
        if (curManager) app.disposeManager(curManager);
        app.route = { name: "home" };
        paint();
        return;
      }
      var nextManager = prev.route && prev.route.manager;
      if (curManager && curManager !== nextManager) app.disposeManager(curManager);
      app.route = prev.route;
      app.query = prev.query;
      app.selectedResultId = prev.selectedResultId;
      app.searchOpen = prev.searchOpen;
      if (app.query) app.results = search(app.query);
      paint();
    };

    app.closeSettings = function () {
      popupClose();
      receipt("Close Settings returns to the " + (app.origin || "workspace") + " that opened it (simulated).", "info");
    };

    app.setQuery = function (q) {
      app.query = q;
      app.searchOpen = true;
      app.results = search(q);
      paint();
    };

    app.pickResult = function (id) {
      var entry = INDEX_BY_ID[id];
      if (!entry) return;
      app.selectedResultId = id;
      var dest = clone(entry.dest) || { name: "home" };
      dest.highlight = dest.row || dest.object || dest.manager || dest.deferred;
      dest.fromSearch = id;
      app.navigate(dest, { keepSearch: false });
    };

    app.setValue = function (id, value) {
      var model = controlModel(app, id);
      if (model && model.disabled) {
        receipt(model.reason || "This setting is not editable right now.", "warn");
        return;
      }
      app.values[id] = value;
      receipt("Updated for project " + app.project.name + " only (simulated).", "ok");
      paint();
    };

    app.openCopy = function () {
      app.copy.step = "pick-source";
      app.copy.sourceId = app.copy.sourceId || "northwind-docs";
      app.copy.categories = (INV.categories || []).map(function (c) { return c.id; });
      app.navigate({ name: "copy" });
    };
    app.previewCopy = function () { return copyPreview(app); };
    app.copyPreview = function () { return copyPreview(app); };
    app.createRestorePoint = function () {
      return createRestorePoint(app);
    };
    app.beginCopyApply = function () {
      return beginCopyApply(app);
    };
    app.applyCopy = function () {
      beginCopyApply(app);
      paint();
      window.setTimeout(function () {
        applyCopy(app);
        paint();
      }, reducedMotion() ? 0 : 280);
    };
    app.rollbackCopy = function () { rollbackCopy(app); paint(); };
    app.copyApply = app.applyCopy;
    app.copyRollback = app.rollbackCopy;
    app.installOfficialCli = function (providerId) {
      installOfficialCli(app, providerId);
      paint();
    };
    app.confirmOfficialCli = function (providerId) {
      var row = (app.installs || INSTALLS).filter(function (i) { return i.provider === providerId; })[0];
      var manual = (row == null) || row.manualOnly || row.owner === "unknown";
      if (manual) {
        confirmOfficialCli(app, providerId);
        paint();
        return app.work;
      }
      app.work = normalizeWork({
        title: "Install from official source",
        human_phase: "Installing from official source",
        state: "running",
        progress_kind: "indeterminate",
        progress_source: "official provider source",
        last_known_good: true,
        message: "Not bundled. Not silently installed. Sign-in is a separate step."
      });
      paint();
      window.setTimeout(function () {
        confirmOfficialCli(app, providerId);
        paint();
      }, reducedMotion() ? 0 : 280);
      return app.work;
    };
    app.assertIndexComplete = function () { return assertIndexComplete(); };

    app.openDomain = function (id) { app.navigate({ name: "domain", domain: id }); };
    app.openManager = function (id, extra) {
      var m = MGR_BY_ID[id];
      var route = { name: "manager", domain: m ? m.domain : "system", manager: id, page: (m && m.tabs[0]) || "overview" };
      if (extra) Object.keys(extra).forEach(function (k) { route[k] = extra[k]; });
      app.navigate(route);
    };
    app.openAll = function () { app.navigate({ name: "all" }); };
    app.openDeferred = function (id) {
      var d = DEF_BY_ID[id];
      app.navigate({ name: "deferred", domain: d ? d.domain : "system", deferred: id });
    };
    app.openPage = function (domain, page) { app.navigate({ name: "domain", domain: domain, page: page, section: page }); };

    app.hydrateManager = function (id) { app.hydrated[id] = { at: Date.now() }; };
    app.disposeManager = function (id) { delete app.hydrated[id]; };

    app.triggerState = function (name) {
      var map = {
        "loading-cached": "cachedLoading",
        empty: "empty",
        offline: "offline",
        managed: "managed",
        unavailable: "unavailable",
        "restart-required": "restart",
        "reconnect-required": "reconnect",
        "changed-elsewhere": "changedElsewhere",
        "import-conflict": "importConflict",
        "rollback-complete": "rollbackComplete",
        "usage-unavailable": "usageUnavailable"
      };
      if (map[name]) app.setFlag(map[name], !app.flags[map[name]]);
      if (name === "no-search-results") { app.setQuery("zzzzqx"); return; }
      if (name === "typo-fuzzy") { app.setQuery("thme"); return; }
      if (name === "validation-error") {
        receipt("Theme name is not one of the eight Puppet Master looks.", "danger");
      }
      if (name === "multi-install") { app.openManager("providers", { object: "anthropic", page: "installations" }); return; }
      if (name === "unknown-owner") { app.openManager("providers", { object: "local-ollama", page: "setup", row: "install-official" }); return; }
      if (name === "provider-update") {
        app.work = normalizeWork({ title: "Provider update", human_phase: "Update available — ask first", state: "waiting_user", wait_reason: "Waiting for Install confirmation", progress_kind: "none" });
        paint();
      }
      if (name === "verification-failure") {
        app.work = normalizeWork({
          title: "Copy settings",
          human_phase: "Verification failed",
          state: "failed",
          progress_kind: "none",
          can_retry: true,
          message: "Destination did not match preview."
        });
        paint();
      }
    };

    app.detailsId = null;
    app.settingDetails = function (id) { return settingDetails(app, id); };
    app.openDetails = function (id) { app.detailsId = id || null; paint(); };
    app.closeDetails = function () { app.detailsId = null; paint(); };

    app.handleEscape = function () {
      if (popupOpen._el) { popupClose(); return; }
      if (app.detailsId) { app.detailsId = null; paint(); return; }
      if (app.route && app.route.row) {
        var was = app.route.row;
        delete app.route.row;
        if (app.route.highlight === was) delete app.route.highlight;
        paint();
        return;
      }
      app.back();
    };

    app.escape = function () {
      if (popupOpen._el) { popupClose(); return; }
      if (app.detailsId) { app.detailsId = null; paint(); return; }
      if (app.statesOpen) { app.statesOpen = false; paint(); return; }
      if (app.searchOpen) { app.searchOpen = false; paint(); return; }
      app.handleEscape();
    };

    app.rowResultId = rowResultId;
    app.routeSettingRow = function (rowId) { routeSettingRow(app, rowId); };

    app.openPopup = popupOpen;
    app.closePopup = popupClose;
    app.virtualList = virtualList;
    app.highlight = highlight;
    app.captureCaret = captureCaret;
    app.restoreCaret = restoreCaret;
    app.searchIndex = search;
    app.getResult = function (id) { return INDEX_BY_ID[id]; };
    app.allProductIds = PRODUCT_SETTING_IDS;
    app.paint = paint;
    app.receipt = receipt;

    if (root) {
      root.addEventListener("keydown", function (ev) {
        if (ev.key === "Escape") { ev.preventDefault(); app.escape(); }
      });
    }
    window.__pmv2App = app;
    paint();
    return app;
  }

  window.PMv2 = {
    inventory: INV,
    categories: INV.categories,
    managers: MANAGERS,
    deferred: DEFERRED,
    search: search,
    getResult: function (id) { return INDEX_BY_ID[id]; },
    productSettingIds: PRODUCT_SETTING_IDS,
    productSettingCount: PRODUCT_SETTING_IDS.length,
    indexCount: INDEX.filter(function (e) { return !e.synthetic; }).length,
    syntheticCount: INDEX.filter(function (e) { return e.synthetic; }).length,
    createApp: createApp,
    esc: esc,
    highlight: highlight,
    captureCaret: captureCaret,
    restoreCaret: restoreCaret,
    popupOpen: popupOpen,
    popupClose: popupClose,
    virtualList: virtualList,
    receipt: receipt,
    objectsFor: objectsFor,
    rowResultId: rowResultId,
    routeSettingRow: routeSettingRow,
    settingDetails: settingDetails,
    demoStates: DEMO_STATES,
    domainManagers: DOMAIN_MANAGERS,
    normalizeWork: normalizeWork,
    copyPreview: copyPreview,
    beginCopyApply: beginCopyApply,
    applyCopy: applyCopy,
    installOfficialCli: installOfficialCli,
    confirmOfficialCli: confirmOfficialCli,
    providerConnected: providerConnected,
    providerUsageEnd: providerUsageEnd,
    providerRouting: providerRouting,
    assertIndexComplete: assertIndexComplete,
    copyApi: {
      previewCopy: "previewCopy",
      copyPreview: "copyPreview",
      createRestorePoint: "createRestorePoint",
      beginCopyApply: "beginCopyApply",
      applyCopy: "applyCopy",
      copyApply: "copyApply",
      rollbackCopy: "rollbackCopy",
      copyRollback: "copyRollback",
      installOfficialCli: "installOfficialCli",
      confirmOfficialCli: "confirmOfficialCli"
    }
  };
})();
