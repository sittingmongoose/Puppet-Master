/* ============================================================================
   concepts/foundry/data.js — Foundry family fixtures (window.FDY_DATA)
   ----------------------------------------------------------------------------
   Families: File Manager/Editor, Terminal, LSP, Formatters,
   Commands & Shortcuts, MCP, Skills, Plugins, Tools, Testing & Debug.
   Plain object, no dependencies.
   ========================================================================== */
(function () {
  "use strict";

  window.FDY_DATA = {
    managerMeta: {
      files: { id: "files", title: "File Manager and Editor", purpose: "Tree behavior, tabs, splits, and recovery", icon: "stack" },
      terminal: { id: "terminal", title: "Terminal", purpose: "Profiles, rendering, palette, and transcripts", icon: "terminal" },
      lsp: { id: "lsp", title: "Language servers", purpose: "Registry, attachment, and diagnostics", icon: "code" },
      formatters: { id: "formatters", title: "Formatters", purpose: "Built-in and custom formatter registry", icon: "check" },
      commands: { id: "commands", title: "Commands and shortcuts", purpose: "Custom commands, dry runs, and key bindings", icon: "command" },
      catalog: { id: "catalog", title: "MCP, Skills, Plugins, and Tools", purpose: "One catalog, four distinct domains", icon: "plug" },
      testing: { id: "testing", title: "Testing and Debug", purpose: "Capability matrix per scope", icon: "gauge" }
    },

    actions: [
      { id: "shortcut-conflict", title: "Resolve the Ctrl+Shift+P conflict", terms: "shortcut conflict keybinding palette", kind: "workflow", subtitle: "Setup workflow", target: { manager: "commands", tab: "shortcuts" } },
      { id: "formatter-test", title: "Test the active formatter", terms: "formatter test receipt prettier", kind: "action", target: { manager: "formatters", tab: "registry" } },
      { id: "lsp-attach-state", title: "Pyright attachment state", terms: "lsp attached requested effective remote", kind: "status", subtitle: "Status", target: { manager: "lsp", tab: "registry" } },
      { id: "mcp-playwright-note", title: "Playwright MCP server unavailable", terms: "mcp playwright tools unavailable disabled", kind: "capability", subtitle: "Unavailable capability", target: { manager: "catalog", tab: "mcp" } },
      { id: "dry-run", title: "Dry-run a custom command", terms: "dry run preview command safe", kind: "action", target: { manager: "commands", tab: "custom" } }
    ],

    /* ---------- File Manager / Editor ---------- */
    fileRows: [
      { label: "Tree single-click", value: "Preview; double-click opens for edit", state: "Default" },
      { label: "Drag and drop", value: "Move within workspace; external drops copy", state: "Default" },
      { label: "Hidden files", value: "Hidden — toggle per project", state: "Default" },
      { label: "Ignored files", value: "Follow .gitignore + .pmignore", state: "Default" },
      { label: "Large-file threshold", value: "25 MB — larger opens read-only", state: "Custom" },
      { label: "Tabs", value: "12 max, oldest unpinned closes", state: "Custom" },
      { label: "Split groups", value: "Up to 3 side by side", state: "Default" },
      { label: "Changed on disk", value: "Compare and ask", state: "Recommended" },
      { label: "Recovery", value: "Hot exit restores unsaved buffers", state: "Default" },
      { label: "Transient states", value: "Network mounts show Unavailable with the reason, never an empty tree", state: "Default" }
    ],

    /* ---------- Terminal ---------- */
    terminalProfiles: [
      {
        id: "default-pwsh", name: "Default (PowerShell)", shell: "C:\\Program Files\\PowerShell\\7\\pwsh.exe",
        env: "Inherit", font: "Cascadia Mono 13px", rendering: "GPU",
        cursor: "Bar, blinking", selection: "Word then line", copyPaste: "Ctrl+C/V with selection guard",
        cwd: "Project root", transcript: "Keep 30 days", performance: "Scrollback 10,000 lines (managed cap)",
        opacity: 96, complete: true
      },
      {
        id: "work", name: "Work", shell: "Inherits from Default",
        env: "Custom allowlist (setup incomplete)", font: "Inherit", rendering: "Inherit",
        cursor: "Inherit", selection: "Inherit", copyPaste: "Inherit",
        cwd: "D:\\work\\northwind", transcript: "Inherit", performance: "Inherit",
        opacity: 100, complete: false
      }
    ],
    ansiPalette: [
      ["Black", "#0C0C0C"], ["Red", "#C50F1F"], ["Green", "#13A10E"], ["Yellow", "#C19C00"],
      ["Blue", "#0037DA"], ["Magenta", "#881798"], ["Cyan", "#3A96DD"], ["White", "#CCCCCC"],
      ["Bright black", "#767676"], ["Bright red", "#E74856"], ["Bright green", "#16C60C"], ["Bright yellow", "#F9F1A5"],
      ["Bright blue", "#3B78FF"], ["Bright magenta", "#B4009E"], ["Bright cyan", "#61D6D6"], ["Bright white", "#F2F2F2"]
    ],

    /* ---------- LSP ---------- */
    lspServers: [
      { id: "typescript", name: "TypeScript language server", language: "TypeScript and JavaScript", source: "Built-in catalog", provenance: "typescript-language-server 4.3.4", command: "typescript-language-server --stdio", env: "Inherit", init: "Default", config: "Project tsconfig", requested: "Attach to all TS/JS files", effective: "Attached — 41 files", host: "This PC · Windows native", limits: "Restart at 4 GB", logs: "Clean — last restart 2026-08-10", health: "ready", custom: false, verification: "Verified by handshake + hover probe" },
      { id: "rust", name: "Rust Analyzer", language: "Rust", source: "Built-in catalog", provenance: "rust-analyzer 2026-08-04", command: "rust-analyzer", env: "Inherit", init: "Workspace discovery", config: "rust-analyzer.toml", requested: "Attach to Cargo workspaces", effective: "Attached — puppet-master-rs", host: "This PC · Windows native", limits: "Restart at 4 GB", logs: "Clean", health: "ready", custom: false, verification: "Verified by handshake" },
      { id: "python", name: "Pyright", language: "Python", source: "Built-in catalog", provenance: "pyright 1.1.401", command: "pyright-langserver --stdio", env: "Inherit", init: "Default", config: "pyrightconfig.json", requested: "Attach to all Python files", effective: "Degraded — remote SSH environment unreachable; running read-only on cached index", host: "SSH environment (home server)", limits: "Restart at 4 GB", logs: "2 transport retries in the last hour", health: "degraded", custom: false, verification: "Remote degradation surfaced, not hidden" },
      { id: "gopls", name: "gopls (custom)", language: "Go", source: "Custom entry", provenance: "Manual command", command: "gopls serve", env: "Inherit", init: "Default", config: "—", requested: "Attach to Go files", effective: "Not attached — binary not found on PATH", host: "This PC · Windows native", limits: "—", logs: "—", health: "not-configured", custom: true, verification: "Unresolved binary" }
    ],

    /* ---------- Formatters ---------- */
    formatters: [
      { id: "prettier", name: "Prettier", kind: "Built-in", state: "detected", command: "npx prettier --write", env: "Inherit", extensions: ".js .ts .css .md .json", scope: "Global", health: "ready" },
      { id: "rustfmt", name: "rustfmt", kind: "Built-in", state: "detected", command: "cargo fmt", env: "Inherit", extensions: ".rs", scope: "Global", health: "ready" },
      { id: "black", name: "Black", kind: "Built-in", state: "not found", command: "black", env: "Inherit", extensions: ".py", scope: "Global", health: "not-configured", note: "Not found on PATH — install from the official Python Packaging source to enable" },
      { id: "shfmt-work", name: "shfmt (work profile)", kind: "Custom", state: "disabled", command: "shfmt -w", env: "Work allowlist", extensions: ".sh .ps1", scope: "Project", health: "unknown", note: "Disabled for this project" }
    ],

    /* ---------- Commands & Shortcuts ---------- */
    customCommands: [
      { id: "cc-build", name: "Build release bundle", scope: "Project", shell: "npm run build", parameters: "—", includes: "Project env", safety: "pass" },
      { id: "cc-deploy", name: "Deploy staging", scope: "Project", shell: "./deploy.sh $ENV", parameters: "ENV (required)", includes: "Project env", safety: "fail", safetyNote: "$ENV is unquoted — quote it as \"$ENV\" before saving" },
      { id: "cc-logs", name: "Tail app logs", scope: "Global", shell: "Get-Content -Wait %LOG%", parameters: "—", includes: "User env", safety: "fail", safetyNote: "%LOG% uses cmd syntax in a PowerShell profile" }
    ],
    shortcuts: [
      { id: "command-palette", name: "Open command palette", shortcut: "Ctrl+Shift+P", conflict: true, custom: false },
      { id: "goal-check", name: "Run goal check", shortcut: "Ctrl+Shift+P", conflict: true, custom: true },
      { id: "quick-open", name: "Quick open", shortcut: "Ctrl+P", conflict: false, custom: false },
      { id: "toggle-terminal", name: "Toggle terminal", shortcut: "Ctrl+`", conflict: false, custom: false },
      { id: "open-settings", name: "Open settings", shortcut: "Ctrl+,", conflict: false, custom: false },
      { id: "open-goals", name: "Open goals", shortcut: "Ctrl+Shift+G", conflict: false, custom: true }
    ],

    /* ---------- MCP / Skills / Plugins / Tools ---------- */
    mcp: [
      { id: "filesystem", name: "Filesystem", domain: "mcp", transport: "stdio", protocol: { requested: "2025-06-18", negotiated: "2025-06-18" }, auth: "None", catalog: "14 tools", resources: "Workspace roots", trust: "Built in", installed: true, enabled: true, available: true, selected: true, invoked: true, risk: "Medium — scoped to the workspace", logs: "Clean", health: "ready" },
      { id: "github", name: "GitHub", domain: "mcp", transport: "http", protocol: { requested: "2025-06-18", negotiated: "2025-03-26" }, auth: "OAuth (PM vault)", catalog: "26 tools", resources: "Repos, issues, runs", trust: "Verified publisher", installed: true, enabled: true, available: true, selected: true, invoked: false, risk: "Medium — network calls", logs: "Protocol downgraded 2025-06-18 → 2025-03-26 (server capability)", health: "ready" },
      { id: "playwright", name: "Playwright", domain: "mcp", transport: "stdio", protocol: { requested: "2025-06-18", negotiated: "2025-06-18" }, auth: "None", catalog: "21 tools", resources: "Browser sessions", trust: "Community", installed: true, enabled: false, available: false, selected: false, invoked: false, risk: "High — drives a browser", logs: "Disabled for this project", health: "not-configured", unavailableReason: "Disabled for this project — browser automation stays on the PM-native Browser Program" },
      { id: "postgres", name: "Postgres", domain: "mcp", transport: "stdio", protocol: { requested: "2025-06-18", negotiated: "2025-06-18" }, auth: "Connection string (vault)", catalog: "5 tools", resources: "Databases", trust: "Community", installed: true, enabled: true, available: true, selected: false, invoked: false, risk: "High — direct database access", logs: "Clean", health: "ready" }
    ],
    skills: [
      { id: "commit", name: "Commit", domain: "skills", source: "Built in", version: "1.2.0", trust: "Built in", installed: true, enabled: true, available: true, invoked: true, risk: "Low", update: "Current" },
      { id: "pdf", name: "PDF tools", domain: "skills", source: "Community registry", version: "0.9.1", trust: "Trusted publisher", installed: true, enabled: true, available: true, invoked: false, risk: "Low", update: "Update available 0.9.4" },
      { id: "write-goal", name: "Write Goal", domain: "skills", source: "Built in", version: "1.1.0", trust: "Built in", installed: true, enabled: true, available: true, invoked: true, risk: "Low", update: "Current" },
      { id: "check-docs", name: "Check product docs", domain: "skills", source: "Community registry", version: "0.4.0", trust: "Untrusted", installed: true, enabled: false, available: false, invoked: false, risk: "Low", update: "Manual only — untrusted" }
    ],
    plugins: [
      { id: "theme-pack", name: "Community theme pack", domain: "plugins", channel: "stable", version: "2.3.1", trust: "Verified publisher", installed: true, enabled: true, compatibility: "Compatible with 2026.08", health: "ready" },
      { id: "metrics-widget", name: "Metrics widget", domain: "plugins", channel: "beta", version: "0.5.0", trust: "Community", installed: true, enabled: false, compatibility: "Compatible with 2026.08", health: "unknown", note: "Beta channel — failures land here with a reason" }
    ],
    tools: [
      { id: "read-file", name: "Read file", domain: "tools", owner: "pm", installed: true, projectEnabled: true, availableThisTurn: true, invoked: true, risk: "low", approvalPolicy: "Never ask" },
      { id: "edit-files", name: "Edit files", domain: "tools", owner: "pm", installed: true, projectEnabled: true, availableThisTurn: true, invoked: true, risk: "medium", approvalPolicy: "Ask each time" },
      { id: "run-command", name: "Run command", domain: "tools", owner: "pm", installed: true, projectEnabled: true, availableThisTurn: false, invoked: false, risk: "high", approvalPolicy: "Ask each time" },
      { id: "search-web", name: "Search the web", domain: "tools", owner: "pm", installed: true, projectEnabled: true, availableThisTurn: true, invoked: false, risk: "low", approvalPolicy: "Remember for this session" },
      { id: "memory-search", name: "Search project memory", domain: "tools", owner: "pm", installed: true, projectEnabled: true, availableThisTurn: true, invoked: true, risk: "low", approvalPolicy: "Never ask" },
      { id: "create-issue", name: "Create issue", domain: "tools", owner: "mcp:github", installed: true, projectEnabled: true, availableThisTurn: true, invoked: false, risk: "medium", approvalPolicy: "Ask each time" },
      { id: "run-query", name: "Run database query", domain: "tools", owner: "mcp:postgres", installed: true, projectEnabled: false, availableThisTurn: false, invoked: false, risk: "medium", approvalPolicy: "Ask each time" },
      { id: "navigate-page", name: "Navigate page", domain: "tools", owner: "mcp:playwright", installed: true, projectEnabled: false, availableThisTurn: false, invoked: false, risk: "medium", approvalPolicy: "Ask each time" }
    ],

    /* ---------- Testing & Debug matrix ---------- */
    testingCapabilities: [
      "Unit and integration", "Built-in browser", "Desktop and native", "Hot reload and previews",
      "Simulator, emulator, device", "API and database", "Console and network",
      "Performance, security, accessibility", "DAP debugger", "Persistent eval", "Capture and artifacts"
    ],
    testingMatrixNote: "Managed cells show the managing policy; Auto follows project detection.",

    demoScenarios: [
      { id: "calm", label: "Calm state (all notices dismissed)" },
      { id: "reset", label: "Reset demo data" },
      { id: "formatter-not-found", label: "Formatters: Black not found state" },
      { id: "lsp-degraded", label: "LSP: requested vs effective (Pyright remote degraded)" },
      { id: "shortcut-conflict", label: "Shortcuts: Ctrl+Shift+P conflict" },
      { id: "dry-run", label: "Command dry-run (never sends work)" },
      { id: "mcp-restart", label: "MCP: restart the GitHub server" },
      { id: "testing-managed", label: "Testing matrix: managed cell" },
      { id: "palette-edit", label: "Terminal: edit an ANSI well and preview" },
      { id: "recorder", label: "Shortcut recorder (real keydown capture)" },
      { id: "changed-elsewhere", label: "Setting changed elsewhere (conflict bar)" },
      { id: "validation-error", label: "Validation error on Default shell" }
    ]
  };
})();
