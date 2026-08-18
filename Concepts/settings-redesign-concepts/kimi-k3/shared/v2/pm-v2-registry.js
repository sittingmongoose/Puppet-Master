/* ============================================================================
   pm-v2-registry.js — headless manager/domain registry for kimi-k3 concepts 05–11
   ----------------------------------------------------------------------------
   Single source of truth every new concept consumes:
   - DOMAINS: the 12 current inventory categories (browse targets).
   - MANAGERS: every required manager family (exact packet names in `family`),
     mapped to a domain, an archetype, subpages, and demo object sources.
   - DEFERRED_OWNERS: named-owner insertion destinations (shells with a
     reachable destination, owner name, return contract, no fabricated backend).
   - COPY_CATEGORIES: the ~10 broad categories for Copy Settings From Another
     Project, with a complete mapping to the 12 inventory domains.
   - ARCHETYPES: the seven manager composition kinds concepts may render.

   Headless only: no DOM, no rendering. Concepts MUST render their own UI.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- manager archetypes ------------------------------------------ */
  var ARCHETYPES = [
    "preference-document",   // grouped setting rows with Details drawer
    "resource-roster",       // roster + detail sheet (providers, personas…)
    "inventory-catalog",     // virtualized catalog + filters (skills, plugins…)
    "setup-sequence",        // stepwise setup / repair flow
    "health-projection",     // read-only health / status projection
    "diagnostic-drawer",     // logs / diagnostics drawer surfaces
    "transaction"            // preview / confirm transaction (copy, import…)
  ];

  /* ---------- the 12 current inventory domains ---------------------------- */
  var DOMAINS = [
    { id: "general",    title: "General & Appearance",      blurb: "Theme, motion, desktop, notifications, sounds, spellcheck, and everyday defaults." },
    { id: "ai",         title: "AI Brains & Providers",     blurb: "Providers, accounts, models, installations, usage, and routing." },
    { id: "safety",     title: "Permissions & Safety",      blurb: "Rules, approvals, and file protection for this project." },
    { id: "code",       title: "Code & Execution",          blurb: "Terminal, editor, languages, formatters, tools, and containers." },
    { id: "memory",     title: "Memory & Context",          blurb: "Context assembly, instructions, memory, and retention budgets." },
    { id: "planning",   title: "Planning & Verification",   blurb: "Goal mode, automation, interviews, testing policy, and verification." },
    { id: "branching",  title: "Branching & Collaboration", blurb: "Worktrees, source control, crew, subagents, and GitHub Actions." },
    { id: "media",      title: "Media & Output",            blurb: "Image generation, media input and output, and capabilities." },
    { id: "web",        title: "Web & Search",              blurb: "Web providers, fetch and crawl policy, and the project search index." },
    { id: "personas",   title: "Personas",                  blurb: "Persona library, behavior tuning, and support tools." },
    { id: "extensions", title: "Skills, Plugins & Commands",blurb: "Skills, plugins, tools, commands, and keyboard shortcuts." },
    { id: "system",     title: "System & Advanced",         blurb: "Health, MCP servers, storage, backup, lifecycle, and diagnostics." }
  ];

  /* ---------- required demonstrated manager families ---------------------- */
  // family strings MUST match machine_readable/manager_coverage_required.json.
  var MANAGERS = [
    // — AI & Providers domain —
    { id: "providers",      family: "Provider / Account / Model / Installation", domain: "ai", icon: "brain",
      title: "Providers", archetype: "resource-roster",
      summary: "Connect providers, choose accounts and models, manage installations, routing, and usage behavior.",
      objectSource: "providers",
      subpages: ["Overview", "Models", "Credentials", "Rate Limits", "Usage", "Installation", "Logs"] },
    { id: "model-defaults", family: "Provider / Account / Model / Installation", domain: "ai", icon: "brain",
      title: "Model Defaults & Routing", archetype: "preference-document",
      summary: "Default models, fallbacks, and usage-end behavior when limits are reached.",
      subpages: ["Defaults", "Routing & Fallbacks", "Usage-End Behavior"] },

    // — Memory & Context —
    { id: "context",        family: "Context & Instructions", domain: "memory", icon: "database",
      title: "Context & Instructions", archetype: "preference-document",
      summary: "Project instructions, context assembly order, and what is included in every run.",
      subpages: ["Instructions", "Assembly", "Includes"] },
    { id: "memory",         family: "Memory", domain: "memory", icon: "database",
      title: "Memory", archetype: "resource-roster",
      summary: "Stored memories, retention policy, and per-project recall behavior.",
      objectSource: "memories", subpages: ["Stored Memories", "Retention", "Recall Behavior"] },

    // — Personas & Crew —
    { id: "personas",       family: "Personas", domain: "personas", icon: "person",
      title: "Personas", archetype: "resource-roster",
      summary: "Persona library, behavior tuning, and tool support per persona.",
      objectSource: "personas", subpages: ["Library", "Behavior Tuning", "Tools & Support"] },
    { id: "crew",           family: "Crew", domain: "branching", icon: "people",
      title: "Crew", archetype: "resource-roster",
      summary: "Crew members, roles, consensus rules, and delegation defaults.",
      objectSource: "crew", subpages: ["Members", "Roles", "Consensus"] },

    // — Planning & Automation —
    { id: "goal",           family: "Goal & Automation", domain: "planning", icon: "checklist",
      title: "Goal & Automation", archetype: "preference-document",
      summary: "Goal mode behavior, automation rules, triggers, and schedulers.",
      subpages: ["Goal Mode", "Automation Rules", "Schedulers"] },
    { id: "backseat",       family: "Back Seat Driver", domain: "planning", icon: "steering",
      title: "Back Seat Driver", archetype: "preference-document",
      summary: "Supervision nudges, intervention thresholds, and quiet-hours behavior.",
      subpages: ["Nudges", "Thresholds", "Quiet Hours"] },

    // — Safety —
    { id: "permissions",    family: "Permissions & FileSafe", domain: "safety", icon: "shield",
      title: "Permissions & FileSafe", archetype: "preference-document",
      summary: "Approval rules, presets, and protected-file enforcement.",
      subpages: ["Rules & Presets", "Approvals & Gates", "FileSafe Protection"] },

    // — General & Appearance —
    { id: "appearance",     family: "Appearance / themes / fonts / motion", domain: "general", icon: "palette",
      title: "Appearance", archetype: "preference-document",
      summary: "Theme, fonts, density, scale, and motion for this project.",
      subpages: ["Theme", "Typography", "Motion"] },
    { id: "notifications",  family: "Notifications & Sounds", domain: "general", icon: "bell",
      title: "Notifications & Sounds", archetype: "preference-document",
      summary: "Notification channels, quiet hours, and alert sounds.",
      subpages: ["Channels", "Quiet Hours", "Alert Sounds"] },
    { id: "sounds",         family: "Sound Library / Uploads / Packs", domain: "general", icon: "speaker",
      title: "Sound Library", archetype: "inventory-catalog",
      summary: "Sound packs, uploaded sounds, and assignment to events.",
      objectSource: "sounds", subpages: ["Packs", "Uploads", "Assignments"] },
    { id: "spellcheck",     family: "Spellcheck & Dictionaries", domain: "general", icon: "check-spelling",
      title: "Spellcheck & Dictionaries", archetype: "inventory-catalog",
      summary: "Spellcheck languages, personal dictionary, and ignore lists.",
      objectSource: "dictionary", subpages: ["Languages", "Personal Dictionary", "Ignore List"] },
    { id: "desktop",        family: "Desktop / Tray / Window", domain: "general", icon: "monitor",
      title: "Desktop, Tray & Window", archetype: "preference-document",
      summary: "Tray behavior, launch destination, window restore, and protection.",
      subpages: ["Tray", "Window", "Launch"] },

    // — Code & Execution —
    { id: "files",          family: "File Manager / Editor", domain: "code", icon: "folder",
      title: "File Manager & Editor", archetype: "preference-document",
      summary: "Editor behavior, file tree, autosave, and formatting on save.",
      subpages: ["Editor", "File Tree", "Autosave"] },
    { id: "terminal",       family: "Terminal", domain: "code", icon: "terminal",
      title: "Terminal", archetype: "preference-document",
      summary: "Shell selection, profiles, scrollback, and rendering.",
      subpages: ["Profiles", "Rendering", "Scrollback"] },
    { id: "lsp",            family: "LSP", domain: "code", icon: "language",
      title: "Language Servers", archetype: "resource-roster",
      summary: "Language servers, per-language overrides, and diagnostics.",
      objectSource: "lspServers", subpages: ["Servers", "Overrides", "Diagnostics"] },
    { id: "formatters",     family: "Formatters", domain: "code", icon: "format",
      title: "Formatters", archetype: "resource-roster",
      summary: "Formatter selection, per-language defaults, and format-on-save.",
      objectSource: "formatters", subpages: ["Formatters", "Per-Language", "On Save"] },
    { id: "tools",          family: "Tools", domain: "extensions", icon: "wrench",
      title: "Tools", archetype: "inventory-catalog",
      summary: "Agent tools, availability, and per-tool policy.",
      objectSource: "tools", subpages: ["Catalog", "Policy", "Availability"] },
    { id: "testing",        family: "Testing & Debug", domain: "code", icon: "beaker",
      title: "Testing & Debug", archetype: "preference-document",
      summary: "Test runners, debug adapters, watch mode, and output behavior.",
      subpages: ["Runners", "Debug Adapters", "Watch Mode"] },
    { id: "containers",     family: "Containers & Registries", domain: "code", icon: "box",
      title: "Containers & Registries", archetype: "resource-roster",
      summary: "Container runtimes, images, and registry credentials.",
      objectSource: "containers", subpages: ["Runtimes", "Images", "Registries"] },

    // — Extensions —
    { id: "commands",       family: "Commands & Shortcuts", domain: "extensions", icon: "command",
      title: "Commands & Shortcuts", archetype: "inventory-catalog",
      summary: "Command catalog, palette entries, and keyboard shortcuts.",
      objectSource: "commands", subpages: ["Commands", "Shortcuts", "Conflicts"] },
    { id: "skills",         family: "Skills", domain: "extensions", icon: "sparkle",
      title: "Skills", archetype: "inventory-catalog",
      summary: "Installed skills, sources, and per-skill enablement.",
      objectSource: "skills", subpages: ["Installed", "Sources", "Updates"] },
    { id: "plugins",        family: "Plugins", domain: "extensions", icon: "puzzle",
      title: "Plugins", archetype: "inventory-catalog",
      summary: "Plugins, permissions, and update policy.",
      objectSource: "plugins", subpages: ["Installed", "Permissions", "Updates"] },
    { id: "mcp",            family: "MCP", domain: "system", icon: "plug",
      title: "MCP Servers", archetype: "resource-roster",
      summary: "Model Context Protocol servers, tools, and connection health.",
      objectSource: "mcpServers", subpages: ["Servers", "Tools", "Health"] },

    // — System & Storage —
    { id: "teacher",        family: "Teacher / Help", domain: "system", icon: "mortarboard",
      title: "Teacher & Help", archetype: "preference-document",
      summary: "Teaching moments, help overlays, and documentation links.",
      subpages: ["Teaching Moments", "Overlays", "Documentation"] },
    { id: "doctor",         family: "Doctor", domain: "system", icon: "stethoscope",
      title: "Doctor", archetype: "health-projection",
      summary: "Environment health checks, diagnostics, and repair entry points.",
      subpages: ["Checks", "Diagnostics", "Repairs"] },
    { id: "storage",        family: "Storage & Retention", domain: "system", icon: "hard-drive",
      title: "Storage & Retention", archetype: "preference-document",
      summary: "Storage usage, cache ceilings, and retention policy.",
      subpages: ["Usage", "Caches", "Retention"] },
    { id: "backup",         family: "Backup & Restore", domain: "system", icon: "safe",
      title: "Backup & Restore", archetype: "transaction",
      summary: "Project backups, restore points, and verified restores.",
      subpages: ["Backups", "Restore Points", "Verify"] },
    { id: "lifecycle",      family: "Settings Lifecycle", domain: "system", icon: "recycle",
      title: "Settings Lifecycle", archetype: "transaction",
      summary: "Import, export, reset, migration, and rollback for this project's settings.",
      subpages: ["Import", "Export", "Reset", "Migration", "Rollback"] },
    { id: "history",        family: "History & Sessions", domain: "system", icon: "clock",
      title: "History & Sessions", archetype: "inventory-catalog",
      summary: "Session history, run history, and restore behavior.",
      objectSource: "sessions", subpages: ["Sessions", "Runs", "Restore"] },
    { id: "artifacts",      family: "Runtime Artifacts / Project Outputs", domain: "system", icon: "archive",
      title: "Runtime Artifacts & Outputs", archetype: "inventory-catalog",
      summary: "Generated outputs, runtime artifacts, and cleanup policy.",
      objectSource: "artifacts", subpages: ["Outputs", "Artifacts", "Cleanup"] },
    { id: "cleanup",        family: "Workspace Cleanup", domain: "system", icon: "broom",
      title: "Workspace Cleanup", archetype: "transaction",
      summary: "Cleanup rules, dry runs, and scheduled sweeps.",
      subpages: ["Rules", "Dry Run", "Schedule"] },
    { id: "dry-method",     family: "DRY Method visible state where exposed", domain: "system", icon: "layers",
      title: "DRY Method", archetype: "health-projection",
      summary: "Component ownership and reuse state where the product exposes it.",
      subpages: ["Owners", "Shared Components", "State"] },

    // — Branching & Collaboration —
    { id: "source-control", family: "Source Control / Worktrees", domain: "branching", icon: "branch",
      title: "Source Control & Worktrees", archetype: "preference-document",
      summary: "Git behavior, worktree policy, and branch protection.",
      subpages: ["Git", "Worktrees", "Protection"] },
    { id: "github-actions", family: "GitHub Actions", domain: "branching", icon: "play-circle",
      title: "GitHub Actions", archetype: "resource-roster",
      summary: "Workflows, runners, secrets policy, and triggers.",
      objectSource: "workflows", subpages: ["Workflows", "Runners", "Secrets Policy"] },

    // — Web & Media —
    { id: "web",            family: "Web / Search / Fetch / Crawl", domain: "web", icon: "globe",
      title: "Web, Fetch & Crawl", archetype: "preference-document",
      summary: "Web providers, fetch policy, crawl limits, and caching.",
      subpages: ["Providers", "Fetch Policy", "Crawl Limits"] },
    { id: "search-index",   family: "Project Search Index", domain: "web", icon: "search",
      title: "Project Search Index", archetype: "health-projection",
      summary: "Index status, refresh policy, and inclusion rules.",
      subpages: ["Status", "Refresh", "Inclusions"] },
    { id: "media",          family: "Media & Output", domain: "media", icon: "image",
      title: "Media & Output", archetype: "preference-document",
      summary: "Image generation, media handling, and output formats.",
      subpages: ["Generation", "Handling", "Formats"] }
  ];

  /* ---------- special always-present families (not domain pages) ---------- */
  var CORE_FAMILIES = [
    { family: "Settings Home",            note: "The concept's own Home composition." },
    { family: "Settings Search",          note: "The concept's universal search field + dropdown." },
    { family: "Settings Workspace",       note: "The concept's domain/workspace shell hosting pages and managers." },
    { family: "Ordinary setting grammar", note: "Row grammar rendered from the inventory projection." }
  ];

  /* ---------- deferred named-owner insertion destinations ------------------ */
  var DEFERRED_OWNERS = [
    { id: "onboarding",      family: "Product Onboarding",                    owner: "Onboarding owner module",        domain: "system",
      insertion: "System & Advanced → Getting Started",  returnContract: "Return to System & Advanced overview" },
    { id: "install-deploy",  family: "Installation / Deployment",             owner: "Installation/Deployment owner",  domain: "system",
      insertion: "System & Advanced → Installation",     returnContract: "Return to System & Advanced overview" },
    { id: "server-claim",    family: "Server Claim / Bootstrap",              owner: "Server Claim owner module",      domain: "system",
      insertion: "System & Advanced → Servers → Claim",  returnContract: "Return to Servers shell" },
    { id: "servers",         family: "Servers / Execution Hosts / Clients",   owner: "Servers owner module",           domain: "system",
      insertion: "System & Advanced → Servers",          returnContract: "Return to System & Advanced overview" },
    { id: "hosting",         family: "Project Hosting & Files",               owner: "Project Hosting owner module",   domain: "system",
      insertion: "System & Advanced → Hosting",          returnContract: "Return to System & Advanced overview" },
    { id: "remote-access",   family: "Remote Access",                         owner: "Remote Access owner module",     domain: "system",
      insertion: "System & Advanced → Remote Access",    returnContract: "Return to System & Advanced overview" },
    { id: "project-sync",    family: "Project Sync / Move",                   owner: "Project Sync/Move owner module", domain: "system",
      insertion: "System & Advanced → Sync & Move",      returnContract: "Return to System & Advanced overview" },
    { id: "app-updates",     family: "Puppet Master application/content updates", owner: "App Updates owner module",   domain: "system",
      insertion: "System & Advanced → App Updates",      returnContract: "Return to System & Advanced overview" },
    { id: "server-backup",   family: "Full Server backup owner flow",         owner: "Server Backup owner module",     domain: "system",
      insertion: "System & Advanced → Servers → Backup", returnContract: "Return to Servers shell" }
  ];

  /* ---------- Copy Settings From Another Project: broad categories -------- */
  var COPY_CATEGORIES = [
    { id: "ai",         title: "AI Brains & Providers",   domains: ["ai"],        note: "Provider configs, models, routing. Credential and account references are re-pointed, never raw secrets." },
    { id: "general",    title: "General & Appearance",    domains: ["general"],   note: "Theme, motion, desktop, notifications, sounds, spellcheck." },
    { id: "safety",     title: "Permissions & Safety",    domains: ["safety"],    note: "Rules, approvals, FileSafe protection." },
    { id: "code",       title: "Code & Execution",        domains: ["code"],      note: "Terminal, editor, LSP, formatters, tools, containers." },
    { id: "memory",     title: "Memory & Context",        domains: ["memory"],    note: "Context assembly, instructions, memory policy. Stored memories are not copied." },
    { id: "planning",   title: "Planning & Verification", domains: ["planning"],  note: "Goal mode, automation, testing policy, verification." },
    { id: "branching",  title: "Branching & Collaboration", domains: ["branching"], note: "Worktrees, crew, subagents, GitHub Actions." },
    { id: "web-media",  title: "Web, Search & Media",     domains: ["web", "media"], note: "Web providers, fetch policy, search index, media output." },
    { id: "personas",   title: "Personas",                domains: ["personas"],  note: "Persona library and tuning." },
    { id: "extensions", title: "Skills, Plugins & Commands", domains: ["extensions"], note: "Skills, plugins, tools, commands, shortcuts." },
    { id: "system",     title: "System & Advanced",       domains: ["system"],    note: "Storage, lifecycle, history, diagnostics preferences." }
  ];

  window.PM_V2_REGISTRY = {
    ARCHETYPES: ARCHETYPES,
    DOMAINS: DOMAINS,
    MANAGERS: MANAGERS,
    CORE_FAMILIES: CORE_FAMILIES,
    DEFERRED_OWNERS: DEFERRED_OWNERS,
    COPY_CATEGORIES: COPY_CATEGORIES,
    managersByDomain: function (domainId) {
      return MANAGERS.filter(function (m) { return m.domain === domainId; });
    },
    managerById: function (id) {
      for (var i = 0; i < MANAGERS.length; i++) if (MANAGERS[i].id === id) return MANAGERS[i];
      return null;
    },
    domainById: function (id) {
      for (var i = 0; i < DOMAINS.length; i++) if (DOMAINS[i].id === id) return DOMAINS[i];
      return null;
    }
  };
})();
