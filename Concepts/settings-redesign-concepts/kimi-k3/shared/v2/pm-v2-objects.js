/* ============================================================================
   pm-v2-objects.js — headless demo object rosters for kimi-k3 concepts 05–11
   ----------------------------------------------------------------------------
   Deterministic managed-object rosters feeding search (managed_object results)
   and roster-archetype managers. Providers come from PM_CORE_DATA (the proven
   17-fixture set) at runtime; the rest are compact deterministic fixtures.
   Also exports the setup/repair workflows, diagnostics, and intentional help
   results the search index needs. Headless only.
   ========================================================================== */
(function () {
  "use strict";

  function entry(id, label, typeLabel, domain, manager, managerTitle, extra) {
    var e = { id: id, label: label, typeLabel: typeLabel, domain: domain, manager: manager, managerTitle: managerTitle };
    if (extra) for (var k in extra) e[k] = extra[k];
    return e;
  }

  /* ---------- managed object rosters keyed by registry objectSource ------- */
  function objects() {
    var out = { providers: [] };
    var core = window.PM_CORE_DATA || {};
    (core.providers || []).forEach(function (p) {
      out.providers.push(entry(p.id, p.name, "Provider", "ai", "providers", "Providers", {
        availability: p.installState === "not-installed" ? "Not installed — explicit setup required" : null,
        health: p.health || (p.installState === "installed-signed-in" ? "ready" : "attention"),
        terms: (p.tagline || "") + " models api key credentials " + p.id,
        section: "overview"
      }));
    });
    out.personas = [
      entry("persona-engineer", "Staff Engineer", "Persona", "personas", "personas", "Personas", { terms: "careful code review senior" }),
      entry("persona-researcher", "Researcher", "Persona", "personas", "personas", "Personas", { terms: "deep dive sources citations" }),
      entry("persona-writer", "Tech Writer", "Persona", "personas", "personas", "Personas", { terms: "docs readme clarity" }),
      entry("persona-tester", "Test Pilot", "Persona", "personas", "personas", "Personas", { terms: "qa edge cases reproduction" })
    ];
    out.crew = [
      entry("crew-reviewer", "Review Partner", "Crew member", "branching", "crew", "Crew", { terms: "review consensus second opinion" }),
      entry("crew-builder", "Build Runner", "Crew member", "branching", "crew", "Crew", { terms: "build compile ci" }),
      entry("crew-scout", "Scout", "Crew member", "branching", "crew", "Crew", { terms: "explore map read-only fast" })
    ];
    out.memories = [
      entry("mem-deploy-window", "Deploy window is Tuesdays 10:00 UTC", "Memory", "memory", "memory", "Memory", { terms: "release schedule deploy" }),
      entry("mem-db-preference", "Prefer Postgres over SQLite for services", "Memory", "memory", "memory", "Memory", { terms: "database preference" }),
      entry("mem-style", "House style: sentence-case headings", "Memory", "memory", "memory", "Memory", { terms: "style guide headings" })
    ];
    out.sounds = [
      entry("sound-pack-soft", "Soft Alerts Pack", "Sound pack", "general", "sounds", "Sound Library", { terms: "notification chime gentle" }),
      entry("sound-upload-ding", "Uploaded: ding-custom.wav", "Uploaded sound", "general", "sounds", "Sound Library", { terms: "custom upload ding" })
    ];
    out.dictionary = [
      entry("dict-personal", "Personal dictionary (37 words)", "Dictionary", "general", "spellcheck", "Spellcheck & Dictionaries", { terms: "words spelling custom" }),
      entry("dict-en-gb", "English (UK) dictionary", "Dictionary", "general", "spellcheck", "Spellcheck & Dictionaries", { terms: "british english language" })
    ];
    out.lspServers = [
      entry("lsp-typescript", "TypeScript Language Server", "Language server", "code", "lsp", "Language Servers", { health: "ready", terms: "ts js typescript intellisense" }),
      entry("lsp-pylance", "Pylance", "Language server", "code", "lsp", "Language Servers", { health: "ready", terms: "python" }),
      entry("lsp-rust", "rust-analyzer", "Language server", "code", "lsp", "Language Servers", { health: "degraded", availability: "Degraded — rebuild index to restore hover", terms: "rust" })
    ];
    out.formatters = [
      entry("fmt-prettier", "Prettier", "Formatter", "code", "formatters", "Formatters", { terms: "js ts css format" }),
      entry("fmt-black", "Black", "Formatter", "code", "formatters", "Formatters", { terms: "python format" }),
      entry("fmt-rustfmt", "rustfmt", "Formatter", "code", "formatters", "Formatters", { terms: "rust format" })
    ];
    out.tools = [
      entry("tool-bash", "Shell (bash)", "Tool", "extensions", "tools", "Tools", { terms: "terminal command execute" }),
      entry("tool-read", "File Read", "Tool", "extensions", "tools", "Tools", { terms: "read files" }),
      entry("tool-write", "File Write", "Tool", "extensions", "tools", "Tools", { terms: "write create files" }),
      entry("tool-web", "Web Fetch", "Tool", "extensions", "tools", "Tools", { terms: "fetch url http" })
    ];
    out.commands = [
      entry("cmd-command-palette", "Open Command Palette", "Command", "extensions", "commands", "Commands & Shortcuts", { terms: "palette ctrl shift p" }),
      entry("cmd-toggle-sidebar", "Toggle Side Panel", "Command", "extensions", "commands", "Commands & Shortcuts", { terms: "sidebar panel view" }),
      entry("cmd-run-tests", "Run All Tests", "Command", "extensions", "commands", "Commands & Shortcuts", { terms: "test run suite" })
    ];
    out.skills = [
      entry("skill-polish", "polish", "Skill", "extensions", "skills", "Skills", { terms: "design final pass alignment" }),
      entry("skill-audit", "audit", "Skill", "extensions", "skills", "Skills", { terms: "accessibility performance audit" }),
      entry("skill-optimize", "optimize", "Skill", "extensions", "skills", "Skills", { terms: "speed bundle performance" })
    ];
    out.plugins = [
      entry("plugin-gitlens", "Git Lens", "Plugin", "extensions", "plugins", "Plugins", { terms: "git blame history" }),
      entry("plugin-rest", "REST Client", "Plugin", "extensions", "plugins", "Plugins", { terms: "http requests api" })
    ];
    out.mcpServers = [
      entry("mcp-context7", "context7", "MCP server", "system", "mcp", "MCP Servers", { health: "ready", terms: "docs library documentation" }),
      entry("mcp-node-repl", "node_repl", "MCP server", "system", "mcp", "MCP Servers", { health: "ready", terms: "javascript node repl" })
    ];
    out.containers = [
      entry("ctr-docker", "Docker Desktop", "Container runtime", "code", "containers", "Containers & Registries", { health: "ready", terms: "docker runtime" }),
      entry("ctr-ghcr", "ghcr.io registry", "Registry", "code", "containers", "Containers & Registries", { terms: "github container registry" })
    ];
    out.workflows = [
      entry("gha-ci", "CI — build and test", "Workflow", "branching", "github-actions", "GitHub Actions", { terms: "ci build test workflow" }),
      entry("gha-release", "Release — package and publish", "Workflow", "branching", "github-actions", "GitHub Actions", { terms: "release publish" })
    ];
    out.sessions = [
      entry("ses-today", "Today 09:12 — Settings redesign", "Session", "system", "history", "History & Sessions", { terms: "session today" }),
      entry("ses-yesterday", "Yesterday 16:40 — Provider setup", "Session", "system", "history", "History & Sessions", { terms: "session yesterday" })
    ];
    out.artifacts = [
      entry("art-coverage", "coverage/ (128 MB)", "Artifact", "system", "artifacts", "Runtime Artifacts & Outputs", { terms: "coverage output" }),
      entry("art-logs", "logs/ (41 MB)", "Artifact", "system", "artifacts", "Runtime Artifacts & Outputs", { terms: "logs output" })
    ];
    return out;
  }

  /* ---------- flatten to search-ready managed_object entries -------------- */
  function searchObjects() {
    var all = objects();
    var out = [];
    Object.keys(all).forEach(function (k) {
      all[k].forEach(function (o) { out.push(o); });
    });
    return out;
  }

  /* ---------- setup / repair workflows (explicit provider CLI setup) ------ */
  function workflows() {
    return [
      { label: "Set up the Anthropic provider CLI",
        path: "Settings / AI Brains & Providers / Providers / Anthropic / Installation",
        destination: { domain: "ai", manager: "providers", object: "anthropic", section: "installation" },
        terms: "install claude cli setup official source" },
      { label: "Repair the OpenAI provider connection",
        path: "Settings / AI Brains & Providers / Providers / OpenAI / Installation",
        destination: { domain: "ai", manager: "providers", object: "openai", section: "installation" },
        terms: "repair reconnect openai setup" },
      { label: "Set up Ollama (local models)",
        path: "Settings / AI Brains & Providers / Providers / Ollama / Installation",
        destination: { domain: "ai", manager: "providers", object: "ollama", section: "installation" },
        terms: "ollama local install setup" }
    ];
  }

  /* ---------- diagnostics / read-only statuses ----------------------------- */
  function diagnostics() {
    return [
      { label: "Doctor — environment health",
        path: "Settings / System & Advanced / Doctor / Checks",
        destination: { domain: "system", manager: "doctor", section: "checks" },
        terms: "health doctor checks diagnostics", availability: "Read-only projection" },
      { label: "Project search index status",
        path: "Settings / Web & Search / Project Search Index / Status",
        destination: { domain: "web", manager: "search-index", section: "status" },
        terms: "index status freshness", availability: "Read-only projection" },
      { label: "DRY Method ownership state",
        path: "Settings / System & Advanced / DRY Method / Owners",
        destination: { domain: "system", manager: "dry-method", section: "owners" },
        terms: "dry owners components reuse", availability: "Read-only where exposed" }
    ];
  }

  /* ---------- intentional help results -------------------------------------- */
  function help() {
    return [
      { label: "How provider credentials work",
        path: "Settings / AI Brains & Providers / Providers — Help",
        destination: { domain: "ai", manager: "providers", section: "help" },
        terms: "help credentials secrets security docs" },
      { label: "What Copy Settings From Another Project does",
        path: "Settings / System & Advanced / Settings Lifecycle — Help",
        destination: { domain: "system", manager: "lifecycle", section: "help" },
        terms: "help copy settings project one-time" }
    ];
  }

  window.PM_V2_OBJECTS = {
    objects: objects,
    searchObjects: searchObjects,
    workflows: workflows,
    diagnostics: diagnostics,
    help: help
  };
})();
