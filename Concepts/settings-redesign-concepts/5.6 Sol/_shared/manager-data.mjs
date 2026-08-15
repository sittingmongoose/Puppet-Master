// Final cumulative Settings bakeoff domain registry for 5.6 Sol.
// Deterministic concept fixtures only: no row claims live provider, host, billing, or filesystem evidence.

export const EXTRA_MANAGERS = [
  {
    "id": "goal-automation",
    "title": "Goal & automation",
    "purpose": "Goal defaults, autonomy boundaries, checkpoints, retries, approvals, and completion evidence.",
    "icon": "goal"
  },
  {
    "id": "permissions-filesafe",
    "title": "Permissions & FileSafe",
    "purpose": "Grants, filesystem boundaries, approval duration, secrets, receipts, and safer alternatives.",
    "icon": "lock"
  },
  {
    "id": "back-seat-driver",
    "title": "Back Seat Driver",
    "purpose": "Advisor mode, intervention thresholds, second-model route, evidence, and quiet-state behavior.",
    "icon": "advisor"
  },
  {
    "id": "notifications-sounds",
    "title": "Notifications & sounds",
    "purpose": "Destinations, event routing, local previews, uploaded audio, compatible packs, and validation.",
    "icon": "notification"
  },
  {
    "id": "appearance",
    "title": "Appearance",
    "purpose": "Eight semantic themes, custom TOML preview, typography, density, motion, and fallback.",
    "icon": "theme"
  },
  {
    "id": "spellcheck",
    "title": "Spellcheck & dictionaries",
    "purpose": "System spelling, technical-text exclusions, personal and project dictionaries, without autocorrect.",
    "icon": "spellcheck"
  },
  {
    "id": "desktop",
    "title": "Desktop, tray & windows",
    "purpose": "Startup, tray, close behavior, window restoration, native notifications, and platform boundaries.",
    "icon": "desktop"
  },
  {
    "id": "teacher-help",
    "title": "Teacher & help",
    "purpose": "Teacher defaults, guided explanations, local demo content, documentation, and diagnostics.",
    "icon": "help"
  },
  {
    "id": "file-manager",
    "title": "File Manager & editor",
    "purpose": "Editor selection, preview behavior, remote files, binary handling, and external-editor handoff.",
    "icon": "file"
  },
  {
    "id": "formatters",
    "title": "Formatters",
    "purpose": "Detected formatters, file coverage, requested/effective routes, conflicts, and save behavior.",
    "icon": "format"
  },
  {
    "id": "commands-shortcuts",
    "title": "Commands & shortcuts",
    "purpose": "Command discovery, aliases, conflicts, scopes, keyboard bindings, and provenance.",
    "icon": "command"
  },
  {
    "id": "skills",
    "title": "Skills",
    "purpose": "Skill discovery, trust, provenance, project scope, update policy, and progressive exposure.",
    "icon": "skill"
  },
  {
    "id": "plugins",
    "title": "Plugins",
    "purpose": "Plugin install sources, compatibility, permissions, update state, restart, and recovery.",
    "icon": "plugin"
  },
  {
    "id": "tools",
    "title": "Tools",
    "purpose": "Tool inventory, trust, permissions, qualification, progressive exposure, and diagnostics.",
    "icon": "tool"
  },
  {
    "id": "testing-debug",
    "title": "Testing & debug",
    "purpose": "Browser, native, simulator, debugger, accessibility, performance, security, and visible evidence routes.",
    "icon": "test"
  },
  {
    "id": "storage-retention",
    "title": "Storage & retention",
    "purpose": "Durable stores, quotas, retention, compaction, repair, and requested/effective policies.",
    "icon": "storage"
  },
  {
    "id": "backup-restore",
    "title": "Backup & restore",
    "purpose": "Program backups, verification, encryption, restore preview, rollback, and receipts.",
    "icon": "backup"
  },
  {
    "id": "settings-lifecycle",
    "title": "Settings lifecycle",
    "purpose": "Import, export, copy, merge, replace, reset, conflict review, and changed-elsewhere reconciliation.",
    "icon": "settings"
  },
  {
    "id": "history-sessions",
    "title": "History & sessions",
    "purpose": "Thread and Goal continuity, retention, device handoff, rewind, fork, and deletion.",
    "icon": "history"
  },
  {
    "id": "runtime-artifacts",
    "title": "Runtime artifacts",
    "purpose": "Outputs, receipts, logs, screenshots, recordings, ownership, retention, and open/watch actions.",
    "icon": "artifact"
  },
  {
    "id": "source-control-worktrees",
    "title": "Source control & worktrees",
    "purpose": "Git and Jujutsu, remotes, credentials, worktrees, isolation, cleanup, and recovery.",
    "icon": "branch"
  },
  {
    "id": "github-actions",
    "title": "GitHub Actions",
    "purpose": "Workflow discovery, credentials, permissions, logs, reruns, artifacts, and branch policy.",
    "icon": "github"
  },
  {
    "id": "containers-registries",
    "title": "Containers & registries",
    "purpose": "Docker, Podman, Kubernetes, registry login, runtimes, updates, and environment scope.",
    "icon": "container"
  },
  {
    "id": "web-search-fetch",
    "title": "Web, search & fetch",
    "purpose": "Built-in browser, search/fetch policy, crawl boundaries, credentials, receipts, and fallback.",
    "icon": "web"
  },
  {
    "id": "project-search-index",
    "title": "Project search index",
    "purpose": "Index roots, ignores, freshness, resource policy, rebuild, and degraded fallback.",
    "icon": "search"
  },
  {
    "id": "workspace-cleanup",
    "title": "Workspace cleanup",
    "purpose": "Caches, worktrees, artifacts, downloads, protected paths, preview, and rollback.",
    "icon": "cleanup"
  },
  {
    "id": "future-server-shell",
    "title": "Future Server module shell",
    "purpose": "Inspect-only insertion contract. The exact canonical Server owner is unresolved, so no Server mutation is available here.",
    "icon": "server",
    "insertionOnly": true,
    "owner": null,
    "ownerStatus": "unresolved"
  }
];

export const CONCEPT_MANAGER_ASSIGNMENTS = {
  "index-house": [
    "providers",
    "context",
    "memory",
    "personas",
    "goal-automation",
    "crew",
    "permissions-filesafe",
    "back-seat-driver"
  ],
  "switchboard": [
    "providers",
    "notifications-sounds",
    "appearance",
    "spellcheck",
    "desktop",
    "teacher-help"
  ],
  "wayfinder": [
    "providers",
    "file-manager",
    "terminal",
    "lsp",
    "formatters",
    "commands-shortcuts",
    "mcp",
    "skills",
    "plugins",
    "tools",
    "testing-debug"
  ],
  "ledger": [
    "providers",
    "storage-retention",
    "backup-restore",
    "settings-lifecycle",
    "history-sessions",
    "runtime-artifacts",
    "source-control-worktrees",
    "github-actions",
    "containers-registries",
    "web-search-fetch",
    "project-search-index",
    "workspace-cleanup",
    "future-server-shell"
  ]
};

export const EXTRA_MANAGER_INVENTORIES = {
  "goal-automation": {
    "title": "Goal & automation",
    "state": "ready",
    "summary": "Goal defaults are explicit, bounded, and receipt-backed.",
    "primaryAction": "Add or configure",
    "items": [
      {
        "id": "goal-default",
        "title": "Default Goal policy",
        "kind": "Goal policy",
        "status": "Recommended",
        "detail": "Hands-off execution with typed blockers, checkpoints, and evidence; true product decisions remain explicit.",
        "actions": [
          "Preview policy",
          "Start review flow"
        ],
        "requested": "Auto",
        "effective": "Auto with approval ceilings",
        "scope": "Project"
      },
      {
        "id": "goal-checkpoints",
        "title": "Checkpoint and resume",
        "kind": "Durable continuity",
        "status": "Ready",
        "detail": "Goal state persists phase, cursor, blockers, last green gate, and next action.",
        "actions": [
          "Inspect state contract"
        ],
        "requested": "Every material phase",
        "effective": "Every material phase"
      },
      {
        "id": "goal-risk",
        "title": "High-risk approval",
        "kind": "Approval boundary",
        "status": "Managed",
        "detail": "Destructive or low-confidence work stops at a named approval surface.",
        "actions": [
          "Inspect managed policy"
        ],
        "requested": "Ask when risky",
        "effective": "Managed by organization"
      }
    ]
  },
  "permissions-filesafe": {
    "title": "Permissions & FileSafe",
    "state": "ready",
    "summary": "Permission grants remain narrow, explainable, and reversible.",
    "primaryAction": "Add or configure",
    "items": [
      {
        "id": "grant-project-write",
        "title": "Project write grant",
        "kind": "Filesystem grant",
        "status": "Ready",
        "detail": "Allows writes only inside the selected project for the current Goal.",
        "actions": [
          "Review grant",
          "Revoke locally"
        ],
        "what": "Project files",
        "why": "Apply approved Settings concept changes",
        "scope": "One project",
        "duration": "Goal duration",
        "alternative": "Export patch only"
      },
      {
        "id": "filesafe-secrets",
        "title": "Secret protection",
        "kind": "FileSafe policy",
        "status": "Managed",
        "detail": "Credentials and secret-like material are redacted from previews, receipts, logs, and exports.",
        "actions": [
          "Inspect protected patterns"
        ],
        "requested": "On",
        "effective": "Managed on"
      },
      {
        "id": "filesafe-downloads",
        "title": "Downloaded executable review",
        "kind": "FileSafe policy",
        "status": "Needs review",
        "detail": "Official-source binaries require explicit approval, hash evidence, and rollback metadata.",
        "actions": [
          "Review boundary"
        ],
        "requested": "Ask first",
        "effective": "Ask first"
      }
    ]
  },
  "back-seat-driver": {
    "title": "Back Seat Driver",
    "state": "ready",
    "summary": "The advisor stays quiet until evidence crosses the configured threshold.",
    "primaryAction": "Add or configure",
    "items": [
      {
        "id": "bsd-mode",
        "title": "Advisor mode",
        "kind": "Advisor policy",
        "status": "Auto",
        "detail": "Auto glows only when a bounded intervention is ready; Off and On remain explicit.",
        "actions": [
          "Cycle mode",
          "Inspect intervention rules"
        ],
        "requested": "Auto",
        "effective": "Auto"
      },
      {
        "id": "bsd-route",
        "title": "Advisor route",
        "kind": "Model route",
        "status": "Ready",
        "detail": "Uses an independent qualified route when available and never silently widens cost or permissions.",
        "actions": [
          "Review route"
        ],
        "requested": "Independent qualified route",
        "effective": "5.6 Sol review route"
      },
      {
        "id": "bsd-threshold",
        "title": "Intervention threshold",
        "kind": "Signal policy",
        "status": "Custom",
        "detail": "Intervene for likely correctness, safety, or significant missed-opportunity issues—not stylistic noise.",
        "actions": [
          "Edit threshold"
        ],
        "requested": "Material issues",
        "effective": "Material issues"
      }
    ]
  },
  "notifications-sounds": {
    "title": "Notifications & sounds",
    "state": "ready",
    "summary": "Destinations and sound assets share one compact, testable event map.",
    "primaryAction": "Import compatible pack",
    "items": [
      {
        "id": "notice-inbox",
        "title": "Puppet Master notification stack",
        "kind": "In-app destination",
        "status": "Default",
        "detail": "The title-bar stack and inbox are the only in-app destination.",
        "actions": [
          "Send test locally"
        ],
        "requested": "On",
        "effective": "On"
      },
      {
        "id": "sound-complete",
        "title": "Goal complete",
        "kind": "Uploaded sound",
        "status": "Custom",
        "detail": "A locally stored OGG asset mapped to Goal completion.",
        "actions": [
          "Preview locally",
          "Replace upload"
        ],
        "format": "OGG",
        "license": "User supplied",
        "mapping": "Goal completed"
      },
      {
        "id": "pack-openpeon",
        "title": "OpenPeon-compatible pack",
        "kind": "Sound pack",
        "status": "Ready",
        "detail": "Manifest, license, formats, duplicate event keys, and event mapping validate before apply.",
        "actions": [
          "Inspect pack",
          "Start import flow"
        ],
        "format": "OGG/WAV",
        "license": "MIT",
        "compatibility": "PeonPing/OpenPeon-compatible"
      },
      {
        "id": "pack-invalid",
        "title": "Studio FX trial",
        "kind": "Sound pack",
        "status": "Unavailable",
        "detail": "License metadata is absent; preview remains local and Apply is blocked.",
        "actions": [
          "Inspect validation"
        ],
        "format": "MP3",
        "license": "Missing",
        "compatibility": "Blocked"
      }
    ]
  },
  "appearance": {
    "title": "Appearance",
    "state": "ready",
    "summary": "Theme previews are reversible and share semantic tokens across the shell.",
    "primaryAction": "Add or configure",
    "items": [
      {
        "id": "theme-system",
        "title": "Eight built-in themes",
        "kind": "Theme set",
        "status": "Default",
        "detail": "Friendly, Glass, Retro, and Basic each have light and dark variants.",
        "actions": [
          "Preview theme",
          "Apply preview"
        ],
        "requested": "Friendly Dark",
        "effective": "Friendly Dark"
      },
      {
        "id": "theme-custom",
        "title": "Custom theme TOML",
        "kind": "Theme source",
        "status": "Custom",
        "detail": "Validate tokens before commit; invalid or unsupported tokens fall back visibly.",
        "actions": [
          "Edit TOML",
          "Validate preview"
        ],
        "requested": "Custom draft",
        "effective": "Friendly Dark fallback"
      },
      {
        "id": "appearance-motion",
        "title": "Motion policy",
        "kind": "Motion setting",
        "status": "Auto",
        "detail": "Reduced motion preserves state and focus while removing spatial choreography.",
        "actions": [
          "Inspect motion map"
        ],
        "requested": "Follow system",
        "effective": "Normal"
      }
    ]
  },
  "spellcheck": {
    "title": "Spellcheck & dictionaries",
    "state": "ready",
    "summary": "Local spelling support excludes technical text and never autocorrects.",
    "primaryAction": "Add or configure",
    "items": [
      {
        "id": "spell-service",
        "title": "System spellcheck",
        "kind": "Writing aid",
        "status": "Default",
        "detail": "Checks prose locally while excluding code, URLs, paths, commands, hashes, identifiers, and literal text.",
        "actions": [
          "Open writing demo"
        ],
        "requested": "On",
        "effective": "On"
      },
      {
        "id": "dictionary-personal",
        "title": "Personal dictionary",
        "kind": "Dictionary",
        "status": "Ready",
        "detail": "Three custom terms are available across projects.",
        "actions": [
          "Add word",
          "Export words"
        ],
        "count": "3 words",
        "scope": "Global"
      },
      {
        "id": "dictionary-project",
        "title": "Project dictionary",
        "kind": "Dictionary",
        "status": "Ready",
        "detail": "Project terminology remains with the project and can be reviewed before export.",
        "actions": [
          "Add word",
          "Inspect source"
        ],
        "count": "5 words",
        "scope": "Project"
      }
    ]
  },
  "desktop": {
    "title": "Desktop, tray & windows",
    "state": "ready",
    "summary": "Desktop behavior is separated from server and execution-host ownership.",
    "primaryAction": "Add or configure",
    "items": [
      {
        "id": "desktop-startup",
        "title": "Open at login",
        "kind": "Desktop lifecycle",
        "status": "Custom",
        "detail": "Starts the native client after user sign-in; it does not start unrelated provider CLIs.",
        "actions": [
          "Toggle locally"
        ],
        "requested": "Off",
        "effective": "Off"
      },
      {
        "id": "desktop-close",
        "title": "Close behavior",
        "kind": "Window policy",
        "status": "Default",
        "detail": "Close hides to tray only when tray mode is enabled; Quit remains explicit.",
        "actions": [
          "Inspect behavior"
        ],
        "requested": "Ask once",
        "effective": "Ask once"
      },
      {
        "id": "desktop-restore",
        "title": "Restore windows",
        "kind": "Window policy",
        "status": "Ready",
        "detail": "Restores project, panel sizes, and detached windows without reopening sensitive dialogs.",
        "actions": [
          "Preview restore set"
        ],
        "requested": "On",
        "effective": "On"
      }
    ]
  },
  "teacher-help": {
    "title": "Teacher & help",
    "state": "ready",
    "summary": "Teacher remains available through Assistant Chat with a no-usage onboarding demonstration.",
    "primaryAction": "Add or configure",
    "items": [
      {
        "id": "teacher-default",
        "title": "Teacher explanation level",
        "kind": "Teacher policy",
        "status": "Default",
        "detail": "Adapts explanation depth without changing the underlying task or permissions.",
        "actions": [
          "Preview lesson"
        ],
        "requested": "Adaptive",
        "effective": "Adaptive"
      },
      {
        "id": "teacher-demo",
        "title": "Built-in Teacher demo",
        "kind": "Local demo",
        "status": "Ready",
        "detail": "Uses packaged demonstration content and does not consume provider-plan usage.",
        "actions": [
          "Run local demo"
        ],
        "usage": "No provider call",
        "scope": "Help"
      },
      {
        "id": "help-diagnostics",
        "title": "Help and diagnostics",
        "kind": "Support",
        "status": "Ready",
        "detail": "Links exact Settings addresses, receipts, and local diagnostics without uploading automatically.",
        "actions": [
          "Open diagnostics"
        ],
        "upload": "Never automatic"
      }
    ]
  },
  "file-manager": {
    "title": "File Manager & editor",
    "state": "ready",
    "summary": "Files stay addressable across local, NAS, SSH, and provider-hosted projects.",
    "primaryAction": "Add or configure",
    "items": [
      {
        "id": "editor-default",
        "title": "Default editor",
        "kind": "Editor route",
        "status": "Default",
        "detail": "Open text files in Puppet Master; explicit external-editor handoff remains available.",
        "actions": [
          "Choose editor"
        ],
        "requested": "Puppet Master",
        "effective": "Puppet Master"
      },
      {
        "id": "binary-preview",
        "title": "Binary preview",
        "kind": "Preview policy",
        "status": "Ready",
        "detail": "Images, PDFs, and supported media open in bounded read-only previews.",
        "actions": [
          "Preview sample"
        ],
        "requested": "Built-in preview",
        "effective": "Built-in preview"
      },
      {
        "id": "remote-files",
        "title": "Remote file operations",
        "kind": "Remote boundary",
        "status": "Managed",
        "detail": "Writes use the selected project host and FileSafe scope; no hidden local mirror becomes authority.",
        "actions": [
          "Inspect ownership"
        ],
        "requested": "Project host",
        "effective": "Managed by project"
      }
    ]
  },
  "formatters": {
    "title": "Formatters",
    "state": "ready",
    "summary": "Formatters are distinct from LSPs and show requested versus effective ownership.",
    "primaryAction": "Add or configure",
    "items": [
      {
        "id": "formatter-js",
        "title": "Biome",
        "kind": "Formatter",
        "status": "Ready",
        "detail": "Covers JavaScript, TypeScript, JSON, and CSS for the current project.",
        "actions": [
          "Run sample",
          "Edit route"
        ],
        "requested": "Format on save",
        "effective": "Format on save"
      },
      {
        "id": "formatter-rust",
        "title": "rustfmt",
        "kind": "Formatter",
        "status": "Inherited",
        "detail": "Inherited from the Rust toolchain and project configuration.",
        "actions": [
          "Inspect source"
        ],
        "requested": "Project default",
        "effective": "rustfmt"
      },
      {
        "id": "formatter-python",
        "title": "Python formatter",
        "kind": "Formatter",
        "status": "Not configured",
        "detail": "No formatter route is selected; LSP diagnostics remain unaffected.",
        "actions": [
          "Choose formatter"
        ],
        "requested": "None",
        "effective": "None"
      }
    ]
  },
  "commands-shortcuts": {
    "title": "Commands & shortcuts",
    "state": "ready",
    "summary": "Commands, aliases, and keyboard bindings are separately addressable.",
    "primaryAction": "Add or configure",
    "items": [
      {
        "id": "cmd-settings-open",
        "title": "Open Settings",
        "kind": "Command",
        "status": "Default",
        "detail": "Existing command family opens Settings Home; concept candidates must not mint canon.",
        "actions": [
          "Inspect command"
        ],
        "commandId": "cmd.settings.open",
        "binding": "⌘,"
      },
      {
        "id": "cmd-provider-refresh",
        "title": "Refresh provider catalogue",
        "kind": "Command",
        "status": "Ready",
        "detail": "Refreshes the selected provider catalogue with last-known-good preservation.",
        "actions": [
          "Inspect command"
        ],
        "commandId": "cmd.settings.providers.catalog.refresh",
        "binding": "Unbound"
      },
      {
        "id": "binding-conflict",
        "title": "Build shortcut conflict",
        "kind": "Shortcut",
        "status": "Needs review",
        "detail": "Two local commands request the same binding; neither is silently replaced.",
        "actions": [
          "Resolve conflict"
        ],
        "binding": "⌘⇧B",
        "conflict": "2 commands"
      }
    ]
  },
  "skills": {
    "title": "Skills",
    "state": "ready",
    "summary": "Skills remain distinct from tools, plugins, MCP servers, and commands.",
    "primaryAction": "Add or configure",
    "items": [
      {
        "id": "skill-plan-audit",
        "title": "Plan audit",
        "kind": "Skill",
        "status": "Ready",
        "detail": "Repo-scoped skill with declared files, instructions, and read-only default.",
        "actions": [
          "Inspect source",
          "Disable locally"
        ],
        "source": "Project .agents/skills",
        "trust": "Project"
      },
      {
        "id": "skill-browser-review",
        "title": "Browser review",
        "kind": "Skill",
        "status": "Update available",
        "detail": "Update is ask-first and preserves the current version until validation succeeds.",
        "actions": [
          "Preview update"
        ],
        "source": "Official repository",
        "update": "Ask first"
      }
    ]
  },
  "plugins": {
    "title": "Plugins",
    "state": "ready",
    "summary": "Plugins expose install source, permissions, compatibility, restart, and rollback.",
    "primaryAction": "Add or configure",
    "items": [
      {
        "id": "plugin-jj",
        "title": "Jujutsu bridge",
        "kind": "Plugin",
        "status": "Ready",
        "detail": "Adds Jujutsu status and operation surfaces without replacing Git ownership.",
        "actions": [
          "Inspect permissions",
          "Disable locally"
        ],
        "source": "Official registry",
        "restart": "Not required"
      },
      {
        "id": "plugin-theme-import",
        "title": "Theme importer",
        "kind": "Plugin",
        "status": "Restart required",
        "detail": "A verified update is staged and takes effect after restart.",
        "actions": [
          "Inspect staged update",
          "Rollback staged update"
        ],
        "source": "Official registry",
        "restart": "Required"
      }
    ]
  },
  "tools": {
    "title": "Tools",
    "state": "ready",
    "summary": "Tool exposure is progressive and evidence-backed.",
    "primaryAction": "Add or configure",
    "items": [
      {
        "id": "tool-ripgrep",
        "title": "ripgrep",
        "kind": "Local tool",
        "status": "Ready",
        "detail": "Detected on the selected execution host; command, version, and ownership are proven.",
        "actions": [
          "Inspect evidence"
        ],
        "version": "Fixture 14.x",
        "ownership": "System package"
      },
      {
        "id": "tool-browser",
        "title": "Built-in browser",
        "kind": "Puppet Master tool",
        "status": "Default",
        "detail": "Native PM browser owns visible navigation, clicks, assertions, screenshots, console, and network evidence.",
        "actions": [
          "Open evidence demo"
        ],
        "ownership": "Puppet Master"
      },
      {
        "id": "tool-unknown",
        "title": "Unknown helper",
        "kind": "Local tool",
        "status": "Unavailable",
        "detail": "Executable identity is uncertain; use remains blocked until ownership is resolved.",
        "actions": [
          "Inspect detection"
        ],
        "ownership": "Unknown"
      }
    ]
  },
  "testing-debug": {
    "title": "Testing & debug",
    "state": "ready",
    "summary": "Capabilities use project-level Auto/On/Off policy and visible evidence when supported.",
    "primaryAction": "Add or configure",
    "items": [
      {
        "id": "test-browser",
        "title": "Built-in browser testing",
        "kind": "Testing capability",
        "status": "Auto",
        "detail": "Shows navigation, clicks, form entry, assertions, screenshots, console, and network evidence.",
        "actions": [
          "Run deterministic test"
        ],
        "requested": "Auto",
        "effective": "On",
        "visibility": "Show when possible"
      },
      {
        "id": "test-native",
        "title": "Native application testing",
        "kind": "Testing capability",
        "status": "Auto",
        "detail": "Uses previews, hot reload, simulators, emulators, devices, windows, traces, screenshots, and logs when supported.",
        "actions": [
          "Inspect support"
        ],
        "requested": "Auto",
        "effective": "Available on host"
      },
      {
        "id": "test-accessibility",
        "title": "Accessibility audit",
        "kind": "Testing capability",
        "status": "On",
        "detail": "Runs semantic, keyboard, focus, contrast, text expansion, and reduced-motion checks.",
        "actions": [
          "Run deterministic test"
        ],
        "requested": "On",
        "effective": "On"
      },
      {
        "id": "test-performance",
        "title": "Performance profiling",
        "kind": "Testing capability",
        "status": "Off",
        "detail": "Disabled for this project; enabling may require an approved tool install.",
        "actions": [
          "Review enablement"
        ],
        "requested": "Off",
        "effective": "Off"
      },
      {
        "id": "test-security",
        "title": "Security checks",
        "kind": "Testing capability",
        "status": "Auto",
        "detail": "Redacts secrets and sensitive data from visible and retained evidence.",
        "actions": [
          "Inspect redaction"
        ],
        "requested": "Auto",
        "effective": "On"
      }
    ]
  },
  "storage-retention": {
    "title": "Storage & retention",
    "state": "ready",
    "summary": "Durable stores expose quota, retention, repair, and provenance.",
    "primaryAction": "Add or configure",
    "items": [
      {
        "id": "store-primary",
        "title": "Primary durable store",
        "kind": "Storage",
        "status": "Ready",
        "detail": "Stores settings, Goal state, receipts, and indexes without SQLite.",
        "actions": [
          "Inspect health"
        ],
        "requested": "Project server",
        "effective": "Project server",
        "retention": "Policy based"
      },
      {
        "id": "store-artifacts",
        "title": "Runtime artifact store",
        "kind": "Storage",
        "status": "Custom",
        "detail": "Keeps screenshots and recordings for seven days unless pinned.",
        "actions": [
          "Edit retention"
        ],
        "requested": "7 days",
        "effective": "7 days"
      },
      {
        "id": "store-index",
        "title": "Search index store",
        "kind": "Derived storage",
        "status": "Degraded",
        "detail": "Last-known-good index remains searchable while a bounded rebuild is available.",
        "actions": [
          "Start rebuild flow"
        ],
        "requested": "Automatic",
        "effective": "Last-known-good"
      }
    ]
  },
  "backup-restore": {
    "title": "Backup & restore",
    "state": "ready",
    "summary": "Backups are verified, scoped, previewable, and rollback-aware.",
    "primaryAction": "Add or configure",
    "items": [
      {
        "id": "backup-program",
        "title": "Full program backup",
        "kind": "Backup policy",
        "status": "Ready",
        "detail": "Includes settings, projects metadata, Goals, receipts, and user-owned assets; secrets follow export policy.",
        "actions": [
          "Create preview",
          "Start backup flow"
        ],
        "requested": "Weekly",
        "effective": "Weekly"
      },
      {
        "id": "restore-latest",
        "title": "Latest verified backup",
        "kind": "Restore point",
        "status": "Ready",
        "detail": "Restore requires scope review, validation, and a pre-restore rollback point.",
        "actions": [
          "Start restore flow"
        ],
        "verified": "Fixture hash valid",
        "created": "Deterministic fixture"
      },
      {
        "id": "backup-encryption",
        "title": "Backup encryption",
        "kind": "Security policy",
        "status": "Managed",
        "detail": "Encryption and secret handling follow organization policy.",
        "actions": [
          "Inspect managed policy"
        ],
        "requested": "On",
        "effective": "Managed on"
      }
    ]
  },
  "settings-lifecycle": {
    "title": "Settings lifecycle",
    "state": "ready",
    "summary": "Import, export, copy, reset, and external changes use explicit previews and receipts.",
    "primaryAction": "Add or configure",
    "items": [
      {
        "id": "settings-import",
        "title": "Import settings",
        "kind": "Lifecycle operation",
        "status": "Ready",
        "detail": "Validate archive, inspect scope, choose merge or replace, preview conflicts, apply, verify, and roll back.",
        "actions": [
          "Start import flow"
        ],
        "scope": "Global or project"
      },
      {
        "id": "settings-export",
        "title": "Export settings",
        "kind": "Lifecycle operation",
        "status": "Ready",
        "detail": "Select scope and secret policy before creating a local export receipt.",
        "actions": [
          "Preview export"
        ],
        "scope": "Selected categories"
      },
      {
        "id": "settings-copy",
        "title": "Copy Settings From",
        "kind": "Lifecycle operation",
        "status": "Ready",
        "detail": "Copies selected categories from another project without per-setting overrides.",
        "actions": [
          "Start copy flow"
        ],
        "scope": "Project"
      },
      {
        "id": "settings-reset",
        "title": "Reset settings",
        "kind": "Lifecycle operation",
        "status": "Needs review",
        "detail": "Reset category or full scope only after impact preview and rollback-point creation.",
        "actions": [
          "Start reset flow"
        ],
        "scope": "Category or full scope"
      }
    ]
  },
  "history-sessions": {
    "title": "History & sessions",
    "state": "ready",
    "summary": "Continuity is durable across machines while deletion and retention remain explicit.",
    "primaryAction": "Add or configure",
    "items": [
      {
        "id": "session-goal",
        "title": "Goal sessions",
        "kind": "Session family",
        "status": "Ready",
        "detail": "Pause on one client and resume on another from durable Goal state.",
        "actions": [
          "Inspect continuity"
        ],
        "retention": "Until deleted"
      },
      {
        "id": "session-chat",
        "title": "Assistant threads",
        "kind": "Session family",
        "status": "Ready",
        "detail": "Fork, rewind, pin, and resume without silently rewriting prior history.",
        "actions": [
          "Open history"
        ],
        "retention": "Project policy"
      },
      {
        "id": "session-sensitive",
        "title": "Sensitive session",
        "kind": "Session family",
        "status": "Managed",
        "detail": "Export and retention are restricted by policy.",
        "actions": [
          "Inspect restriction"
        ],
        "retention": "Managed"
      }
    ]
  },
  "runtime-artifacts": {
    "title": "Runtime artifacts",
    "state": "ready",
    "summary": "Artifacts carry owner, run, retention, sensitivity, and open/watch actions.",
    "primaryAction": "Add or configure",
    "items": [
      {
        "id": "artifact-browser-run",
        "title": "Browser test evidence",
        "kind": "Artifact set",
        "status": "Ready",
        "detail": "Screenshots, network summary, console, and assertion timeline from a deterministic test.",
        "actions": [
          "Open",
          "Watch"
        ],
        "owner": "GoalRun fixture",
        "retention": "7 days"
      },
      {
        "id": "artifact-native-video",
        "title": "Native interaction recording",
        "kind": "Artifact",
        "status": "Custom",
        "detail": "A redacted fallback video is available when embedding is unavailable.",
        "actions": [
          "Open",
          "Watch"
        ],
        "owner": "Testing fixture",
        "retention": "Pinned"
      },
      {
        "id": "artifact-log",
        "title": "Provider diagnostic log",
        "kind": "Artifact",
        "status": "Managed",
        "detail": "Secrets are redacted; export remains blocked by policy.",
        "actions": [
          "Inspect redaction"
        ],
        "owner": "Provider fixture",
        "retention": "Managed"
      }
    ]
  },
  "source-control-worktrees": {
    "title": "Source control & worktrees",
    "state": "ready",
    "summary": "Git and Jujutsu share project identity while worktree isolation remains explicit.",
    "primaryAction": "Add or configure",
    "items": [
      {
        "id": "scm-git",
        "title": "Git",
        "kind": "Source control",
        "status": "Default",
        "detail": "Repository identity, remotes, credentials, and branch policy are healthy.",
        "actions": [
          "Inspect status"
        ],
        "version": "Fixture current",
        "credentials": "SSH broker"
      },
      {
        "id": "scm-jj",
        "title": "Jujutsu",
        "kind": "Source control",
        "status": "Ready",
        "detail": "Baseline support is enabled and coexists with Git metadata.",
        "actions": [
          "Inspect status"
        ],
        "version": "Fixture current",
        "credentials": "Inherited Git transport"
      },
      {
        "id": "worktree-goal",
        "title": "Goal worktree",
        "kind": "Worktree",
        "status": "Ready",
        "detail": "Isolated path, port lease, and cleanup receipt belong to one Goal.",
        "actions": [
          "Open worktree",
          "Start cleanup flow"
        ],
        "owner": "Goal fixture"
      }
    ]
  },
  "github-actions": {
    "title": "GitHub Actions",
    "state": "ready",
    "summary": "Workflow execution is visible, permission-scoped, and artifact-linked.",
    "primaryAction": "Add or configure",
    "items": [
      {
        "id": "gha-ci",
        "title": "CI workflow",
        "kind": "Workflow",
        "status": "Ready",
        "detail": "Latest deterministic fixture run passed with logs and artifacts.",
        "actions": [
          "Open run",
          "Rerun fixture"
        ],
        "branch": "main",
        "permissions": "Read contents"
      },
      {
        "id": "gha-release",
        "title": "Release workflow",
        "kind": "Workflow",
        "status": "Managed",
        "detail": "Manual dispatch is restricted to release maintainers.",
        "actions": [
          "Inspect policy"
        ],
        "branch": "tags",
        "permissions": "Managed"
      },
      {
        "id": "gha-failed",
        "title": "UI verification",
        "kind": "Workflow",
        "status": "Error",
        "detail": "One fixture step failed; rerun is available without changing settings.",
        "actions": [
          "Inspect logs",
          "Rerun fixture"
        ],
        "branch": "concept",
        "permissions": "Read contents"
      }
    ]
  },
  "containers-registries": {
    "title": "Containers & registries",
    "state": "ready",
    "summary": "Runtimes and registry identities are detected, authenticated, and updated separately.",
    "primaryAction": "Add or configure",
    "items": [
      {
        "id": "container-docker",
        "title": "Docker",
        "kind": "Container runtime",
        "status": "Ready",
        "detail": "Detected on the selected execution host with a human-named identity.",
        "actions": [
          "Inspect evidence"
        ],
        "version": "Fixture current",
        "login": "Registry profile ready"
      },
      {
        "id": "container-podman",
        "title": "Podman",
        "kind": "Container runtime",
        "status": "Not installed",
        "detail": "Installation requires explicit official-source action.",
        "actions": [
          "Review installation"
        ],
        "version": "Not installed",
        "login": "Not applicable"
      },
      {
        "id": "registry-ghcr",
        "title": "GitHub Container Registry",
        "kind": "Registry",
        "status": "Ready",
        "detail": "Credential broker supplies scoped identity; secrets are not rendered.",
        "actions": [
          "Test fixture"
        ],
        "login": "Ready",
        "scope": "Read packages"
      },
      {
        "id": "cluster-k8s",
        "title": "Kubernetes context",
        "kind": "Cluster",
        "status": "Unavailable",
        "detail": "No selected context; container workflows remain available.",
        "actions": [
          "Choose context"
        ],
        "context": "None"
      }
    ]
  },
  "web-search-fetch": {
    "title": "Web, search & fetch",
    "state": "ready",
    "summary": "The built-in browser owns interactive web evidence; search and fetch remain policy-scoped.",
    "primaryAction": "Add or configure",
    "items": [
      {
        "id": "web-browser",
        "title": "Built-in browser",
        "kind": "Browser capability",
        "status": "Default",
        "detail": "Visible navigation, clicks, form entry, screenshots, console, and network evidence.",
        "actions": [
          "Open deterministic demo"
        ],
        "requested": "On",
        "effective": "On"
      },
      {
        "id": "web-search",
        "title": "Web search",
        "kind": "Search capability",
        "status": "Ready",
        "detail": "Current search may run when the task requires it; receipts retain source and query metadata.",
        "actions": [
          "Run deterministic search"
        ],
        "requested": "Auto",
        "effective": "Auto"
      },
      {
        "id": "web-fetch",
        "title": "Fetch and extraction",
        "kind": "Fetch capability",
        "status": "Custom",
        "detail": "Bounded fetch with size, domain, credential, and crawl limits.",
        "actions": [
          "Edit limits"
        ],
        "requested": "Ask for broad crawl",
        "effective": "Ask for broad crawl"
      }
    ]
  },
  "project-search-index": {
    "title": "Project search index",
    "state": "ready",
    "summary": "Indexing remains bounded, observable, and recoverable.",
    "primaryAction": "Add or configure",
    "items": [
      {
        "id": "index-main",
        "title": "Project content index",
        "kind": "Index",
        "status": "Ready",
        "detail": "Tracks source roots with explicit ignores and freshness metadata.",
        "actions": [
          "Inspect roots",
          "Start rebuild flow"
        ],
        "roots": "3 roots",
        "ignored": "7 patterns",
        "freshness": "Current fixture"
      },
      {
        "id": "index-symbols",
        "title": "Symbol index",
        "kind": "Index",
        "status": "Degraded",
        "detail": "Last-known-good symbols remain available while one language source is stale.",
        "actions": [
          "Inspect degraded source"
        ],
        "freshness": "One source stale"
      },
      {
        "id": "index-resource",
        "title": "Index resource policy",
        "kind": "Resource policy",
        "status": "Auto",
        "detail": "Throttles during foreground work and resumes when idle.",
        "actions": [
          "Edit policy"
        ],
        "requested": "Auto",
        "effective": "Auto"
      }
    ]
  },
  "workspace-cleanup": {
    "title": "Workspace cleanup",
    "state": "ready",
    "summary": "Cleanup previews every candidate, preserves protected paths, and records rollback limits.",
    "primaryAction": "Add or configure",
    "items": [
      {
        "id": "cleanup-caches",
        "title": "Derived caches",
        "kind": "Cleanup family",
        "status": "Ready",
        "detail": "Safe derived caches can be regenerated.",
        "actions": [
          "Preview cleanup",
          "Start cleanup flow"
        ],
        "size": "Fixture 2.1 GB",
        "protected": "No"
      },
      {
        "id": "cleanup-worktrees",
        "title": "Completed worktrees",
        "kind": "Cleanup family",
        "status": "Needs review",
        "detail": "Two completed worktrees are eligible after uncommitted-state checks.",
        "actions": [
          "Preview cleanup"
        ],
        "size": "Fixture 840 MB",
        "protected": "Conditional"
      },
      {
        "id": "cleanup-protected",
        "title": "Current project and active Goal",
        "kind": "Protected scope",
        "status": "Managed",
        "detail": "Active project, active worktree, credentials, durable Goal state, and pinned artifacts are excluded.",
        "actions": [
          "Inspect protection"
        ],
        "size": "Not calculated",
        "protected": "Yes"
      }
    ]
  },
  "future-server-shell": {
    "title": "Future Server module shell",
    "state": "missing-owner",
    "summary": "The exact canonical Server owner is unresolved. This insertion contract is inspect-only and fail-closed.",
    "primaryAction": "Inspect residual risk",
    "owner": null,
    "ownerStatus": "unresolved",
    "mutationEnabled": false,
    "items": [
      {
        "id": "server-module",
        "title": "Servers",
        "kind": "Owner-unresolved insertion",
        "status": "Missing owner",
        "detail": "Reserved destination for native and standalone server identities. Mutation remains blocked until the canonical owner is adjudicated.",
        "actions": [
          "Inspect insertion contract"
        ],
        "owner": null,
        "ownerStatus": "unresolved",
        "stateMachine": "Unavailable",
        "disabled": true,
        "disabledReason": "Mutation blocked: canonical Server owner unresolved"
      },
      {
        "id": "execution-hosts",
        "title": "Execution Hosts",
        "kind": "Owner-unresolved insertion",
        "status": "Missing owner",
        "detail": "Reserved destination for execution-host selection, capabilities, WSL, containers, and reachability. Mutation remains blocked until the canonical owner is adjudicated.",
        "actions": [
          "Inspect insertion contract"
        ],
        "owner": null,
        "ownerStatus": "unresolved",
        "stateMachine": "Unavailable",
        "disabled": true,
        "disabledReason": "Mutation blocked: canonical Server owner unresolved"
      },
      {
        "id": "clients",
        "title": "Clients",
        "kind": "Owner-unresolved insertion",
        "status": "Missing owner",
        "detail": "Reserved destination for connected clients and continuity. Mutation remains blocked until the canonical owner is adjudicated.",
        "actions": [
          "Inspect insertion contract"
        ],
        "owner": null,
        "ownerStatus": "unresolved",
        "stateMachine": "Unavailable",
        "disabled": true,
        "disabledReason": "Mutation blocked: canonical Server owner unresolved"
      },
      {
        "id": "project-hosting",
        "title": "Project Hosting & Files",
        "kind": "Owner-unresolved insertion",
        "status": "Missing owner",
        "detail": "Reserved destination for NAS, SSH, GitHub, remote files, and sync animation. Mutation remains blocked until the canonical owner is adjudicated.",
        "actions": [
          "Inspect insertion contract"
        ],
        "owner": null,
        "ownerStatus": "unresolved",
        "stateMachine": "Unavailable",
        "disabled": true,
        "disabledReason": "Mutation blocked: canonical Server owner unresolved"
      },
      {
        "id": "remote-access",
        "title": "Remote Access",
        "kind": "Owner-unresolved insertion",
        "status": "Missing owner",
        "detail": "Reserved destination for Tailscale, MagicDNS, reverse proxy, and Funnel policy. Mutation remains blocked until the canonical owner is adjudicated.",
        "actions": [
          "Inspect insertion contract"
        ],
        "owner": null,
        "ownerStatus": "unresolved",
        "stateMachine": "Unavailable",
        "disabled": true,
        "disabledReason": "Mutation blocked: canonical Server owner unresolved"
      },
      {
        "id": "updates-module",
        "title": "Updates",
        "kind": "Owner-unresolved insertion",
        "status": "Missing owner",
        "detail": "Reserved destination for server/client update behavior; provider CLI updates remain provider-owned and app/content updates remain Project Syncing and Updates-owned. Server mutation remains blocked.",
        "actions": [
          "Inspect insertion contract"
        ],
        "owner": null,
        "ownerStatus": "unresolved",
        "stateMachine": "Unavailable",
        "disabled": true,
        "disabledReason": "Mutation blocked: canonical Server owner unresolved"
      }
    ]
  }
};

export const PROVIDER_CLI_ACQUISITION_POLICY = {
  "schemaId": "pm.provider_cli_acquisition_policy.fixture.v1",
  "status": "final-provider-specific-adjudication",
  "negativeContract": [
    "no Puppet Master core bundle",
    "no default native/server/container/WSL/Kubernetes baseline",
    "no preseed in Tool Store",
    "no Project/model/provider/Goal/Plan/WorkNode/agent/Auto/On silent first acquisition"
  ],
  "positiveContract": [
    "explicit initial Setup/Install only",
    "exact selected Host/Environment",
    "official source",
    "install and auth separate",
    "Auto/On may only maintain a previously approved installation"
  ],
  "initialAcquisition": {
    "requiresExplicitUserAction": true,
    "allowedEntryPoints": [
      "Provider Settings",
      "Provider setup"
    ],
    "requiresExactHostAndEnvironmentSelection": true,
    "requiresOfficialSource": true,
    "authenticationIsSeparate": true
  },
  "postConsentLifecycle": {
    "autoOnMeaning": "maintenance_of_previously_approved_installation_only",
    "allowedOperations": [
      "discover compatible existing installation",
      "verify",
      "update",
      "repair",
      "rollback",
      "activate later generation"
    ],
    "mayAuthorizeFirstAcquisition": false
  },
  "namedExceptionRule": "A bundled exception requires direct user approval naming the exact provider CLI, platform, source, and lifecycle owner. No catalog or adapter decision creates it implicitly."
};

export const OMP_PROVIDER_CATALOG_RESEARCH_FIXTURE = {
  "schemaId": "pm.omp_provider_reference.fixture.v1",
  "source": "Oh My Pi 17.2.10 supplied archive",
  "status": "research_baseline_not_runtime_authority",
  "runtimeAuthority": false,
  "allowedUse": [
    "setup presentation research",
    "official destination research",
    "authentication choreography research"
  ],
  "forbiddenUse": [
    "runtime provider truth",
    "silent acquisition authority",
    "arbitrary executable procedure source"
  ]
};

const providerInstallationFixture = ({
  id,
  providerFamilyId,
  name,
  qualifier,
  summary,
  state,
  selected,
  shadowed,
  host,
  environment,
  source,
  ownership,
  version,
  architecture,
  acquisition,
  lifecyclePolicy,
  authentication,
  readiness,
  technicalDetails,
  actions
}) => ({
  id,
  providerFamilyId,
  schemaId: "pm.provider_installation.fixture.v2",
  display: {
    name,
    qualifier,
    summary
  },
  name: qualifier ? `${name} — ${qualifier}` : name,
  state,
  selected,
  shadowed,
  host,
  environment,
  source,
  ownership,
  version,
  architecture,
  acquisition,
  lifecyclePolicy,
  authentication,
  readiness,
  technicalDetails,
  actions
});

export const PROVIDER_INSTALLATIONS = {
  "openai": [
    providerInstallationFixture({
      "id": "codex-store-selected",
      "providerFamilyId": "openai",
      "name": "Codex CLI",
      "qualifier": "Microsoft Store",
      "summary": "Codex CLI on This Windows computer · Ready · selected",
      "state": "ready",
      "selected": true,
      "shadowed": false,
      "host": {
        "id": "host-fixture-windows-local",
        "displayName": "This Windows computer",
        "kind": "native-desktop"
      },
      "environment": {
        "id": "environment-fixture-windows-native",
        "displayName": "Windows native",
        "kind": "windows-native",
        "hostId": "host-fixture-windows-local"
      },
      "source": {
        "displayName": "Official Microsoft Store package",
        "provenance": "OpenAI-published package identified through Microsoft Store metadata",
        "kind": "official-store-package",
        "official": true
      },
      "ownership": {
        "displayName": "Microsoft Store",
        "kind": "windows_store_or_app_installer",
        "confidence": "proven",
        "maintenance": "eligible-after-recorded-consent"
      },
      "version": {
        "current": "fixture-current",
        "target": "fixture-compatible-update",
        "channel": "stable",
        "compatibility": "compatible"
      },
      "architecture": {
        "executable": "x86_64",
        "host": "x86_64",
        "compatibility": "compatible"
      },
      "acquisition": {
        "status": "compatible-existing-selected",
        "initialConsent": "recorded-fixture-consent",
        "approvedForUse": true,
        "acquiredByPuppetMaster": false,
        "firstAcquisitionMayBeSilent": false
      },
      "lifecyclePolicy": {
        "scope": "post-consent-only",
        "checkUpdates": "automatic",
        "installUpdates": "ask-first",
        "versionPolicy": "latest-compatible",
        "rollbackAfterFailedVerification": "on-where-supported",
        "autoOnMeaning": "maintain-previously-approved-installation-only",
        "state": "update-available"
      },
      "authentication": {
        "separateFromInstallation": true,
        "owner": "pm-direct-approved-client",
        "method": "oauth",
        "status": "authenticated",
        "boundary": "PM-direct OAuth is a distinct supported account connection; installing the CLI never signs it in"
      },
      "readiness": {
        "overall": "ready",
        "installationFound": true,
        "executableHealthy": true,
        "authenticationKnown": true,
        "authenticated": true,
        "accountIdentityKnown": true,
        "productOrPlanKnown": true,
        "modelCatalogAvailable": true,
        "adapterHandshakeReady": true,
        "requiredCapabilitiesReady": true,
        "generationVerified": true,
        "usageTelemetryAvailable": true
      },
      "technicalDetails": {
        "paths": {
          "configured": "WindowsApps package alias",
          "resolved": "Selected Microsoft Store launcher",
          "actualExecutable": "Hydrate exact host-local path in Details"
        },
        "resolvedCommand": "codex → selected Store launcher",
        "packageAlias": "codex",
        "hash": {
          "algorithm": "sha256",
          "value": null,
          "status": "not-live-evidence-in-concept-fixture"
        },
        "internalIds": {
          "installationId": "codex-store-selected",
          "providerFamilyId": "openai",
          "hostId": "host-fixture-windows-local",
          "environmentId": "environment-fixture-windows-native"
        }
      },
      "actions": [
        "Preview scheduled update",
        "Verify selected installation"
      ]
    }),
    providerInstallationFixture({
      "id": "codex-npm-shadowed",
      "providerFamilyId": "openai",
      "name": "Codex CLI",
      "qualifier": "npm",
      "summary": "Codex CLI on This Windows computer · compatible duplicate · shadowed",
      "state": "shadowed",
      "selected": false,
      "shadowed": true,
      "host": {
        "id": "host-fixture-windows-local",
        "displayName": "This Windows computer",
        "kind": "native-desktop"
      },
      "environment": {
        "id": "environment-fixture-windows-native",
        "displayName": "Windows native",
        "kind": "windows-native",
        "hostId": "host-fixture-windows-local"
      },
      "source": {
        "displayName": "Official OpenAI npm package",
        "provenance": "OpenAI package identity matched by the npm global package database",
        "kind": "official-package-feed",
        "official": true
      },
      "ownership": {
        "displayName": "npm global prefix",
        "kind": "npm_global",
        "confidence": "proven",
        "maintenance": "manual-while-shadowed"
      },
      "version": {
        "current": "fixture-older",
        "target": null,
        "channel": "stable",
        "compatibility": "compatible-but-not-selected"
      },
      "architecture": {
        "executable": "x86_64",
        "host": "x86_64",
        "compatibility": "compatible"
      },
      "acquisition": {
        "status": "compatible-existing-not-selected",
        "initialConsent": "not-requested-for-this-installation",
        "approvedForUse": false,
        "acquiredByPuppetMaster": false,
        "firstAcquisitionMayBeSilent": false
      },
      "lifecyclePolicy": {
        "scope": "post-consent-only",
        "checkUpdates": "manual",
        "installUpdates": "manual",
        "versionPolicy": "keep-current-until-selected",
        "rollbackAfterFailedVerification": "not-applicable",
        "autoOnMeaning": "maintain-previously-approved-installation-only",
        "state": "shadowed"
      },
      "authentication": {
        "separateFromInstallation": true,
        "owner": "unbound",
        "method": "none-selected",
        "status": "not-inspected",
        "boundary": "The shadowed installation is not selected and no credentials are imported"
      },
      "readiness": {
        "overall": "found-not-selected",
        "installationFound": true,
        "executableHealthy": true,
        "authenticationKnown": false,
        "authenticated": false,
        "accountIdentityKnown": false,
        "productOrPlanKnown": false,
        "modelCatalogAvailable": false,
        "adapterHandshakeReady": false,
        "requiredCapabilitiesReady": false,
        "generationVerified": false,
        "usageTelemetryAvailable": false
      },
      "technicalDetails": {
        "paths": {
          "configured": "User npm bin alias",
          "resolved": "Shadowed npm launcher",
          "actualExecutable": "Hydrate exact host-local path in Details"
        },
        "resolvedCommand": "Shadowed by selected Store launcher",
        "packageAlias": "@openai/codex",
        "hash": {
          "algorithm": "sha256",
          "value": null,
          "status": "not-live-evidence-in-concept-fixture"
        },
        "internalIds": {
          "installationId": "codex-npm-shadowed",
          "providerFamilyId": "openai",
          "hostId": "host-fixture-windows-local",
          "environmentId": "environment-fixture-windows-native"
        }
      },
      "actions": [
        "Select installation",
        "Inspect shadow reason"
      ]
    })
  ],
  "claude": [
    providerInstallationFixture({
      "id": "claude-homebrew-selected",
      "providerFamilyId": "claude",
      "name": "Claude CLI",
      "qualifier": "Homebrew",
      "summary": "Claude CLI on This Mac · Ready · selected",
      "state": "ready",
      "selected": true,
      "shadowed": false,
      "host": {
        "id": "host-fixture-mac-local",
        "displayName": "This Mac",
        "kind": "native-desktop"
      },
      "environment": {
        "id": "environment-fixture-macos-native",
        "displayName": "macOS native",
        "kind": "macos-native",
        "hostId": "host-fixture-mac-local"
      },
      "source": {
        "displayName": "Official Anthropic installation route",
        "provenance": "Homebrew-owned executable matched to Anthropic's documented installation route",
        "kind": "official-documented-package-manager-route",
        "official": true
      },
      "ownership": {
        "displayName": "Homebrew",
        "kind": "homebrew_formula",
        "confidence": "proven",
        "maintenance": "eligible-after-recorded-consent"
      },
      "version": {
        "current": "fixture-current",
        "target": null,
        "channel": "stable",
        "compatibility": "compatible"
      },
      "architecture": {
        "executable": "arm64",
        "host": "arm64",
        "compatibility": "compatible"
      },
      "acquisition": {
        "status": "compatible-existing-selected",
        "initialConsent": "recorded-fixture-consent",
        "approvedForUse": true,
        "acquiredByPuppetMaster": false,
        "firstAcquisitionMayBeSilent": false
      },
      "lifecyclePolicy": {
        "scope": "post-consent-only",
        "checkUpdates": "automatic",
        "installUpdates": "ask-first",
        "versionPolicy": "latest-compatible",
        "rollbackAfterFailedVerification": "on-where-supported",
        "autoOnMeaning": "maintain-previously-approved-installation-only",
        "state": "current"
      },
      "authentication": {
        "separateFromInstallation": true,
        "owner": "cli-owned",
        "method": "oauth",
        "status": "authenticated",
        "boundary": "Claude CLI owns OAuth; Puppet Master launches and verifies the provider-owned flow without copying raw tokens"
      },
      "readiness": {
        "overall": "ready",
        "installationFound": true,
        "executableHealthy": true,
        "authenticationKnown": true,
        "authenticated": true,
        "accountIdentityKnown": true,
        "productOrPlanKnown": true,
        "modelCatalogAvailable": true,
        "adapterHandshakeReady": true,
        "requiredCapabilitiesReady": true,
        "generationVerified": true,
        "usageTelemetryAvailable": false
      },
      "technicalDetails": {
        "paths": {
          "configured": "Homebrew command alias",
          "resolved": "Selected Homebrew executable",
          "actualExecutable": "Hydrate exact host-local path in Details"
        },
        "resolvedCommand": "claude → Homebrew executable",
        "packageAlias": "claude",
        "hash": {
          "algorithm": "sha256",
          "value": null,
          "status": "not-live-evidence-in-concept-fixture"
        },
        "internalIds": {
          "installationId": "claude-homebrew-selected",
          "providerFamilyId": "claude",
          "hostId": "host-fixture-mac-local",
          "environmentId": "environment-fixture-macos-native"
        }
      },
      "actions": [
        "Verify selected installation",
        "Open CLI-owned sign-in"
      ]
    }),
    providerInstallationFixture({
      "id": "claude-wrapper-unknown",
      "providerFamilyId": "claude",
      "name": "Claude wrapper",
      "qualifier": "Unknown owner",
      "summary": "Claude wrapper on This Mac · ownership unknown · manual only",
      "state": "manual-only",
      "selected": false,
      "shadowed": true,
      "host": {
        "id": "host-fixture-mac-local",
        "displayName": "This Mac",
        "kind": "native-desktop"
      },
      "environment": {
        "id": "environment-fixture-macos-native",
        "displayName": "macOS native",
        "kind": "macos-native",
        "hostId": "host-fixture-mac-local"
      },
      "source": {
        "displayName": "Unverified discovered executable",
        "provenance": "No package database, provider metadata, or signature proves an official source",
        "kind": "unknown-existing",
        "official": false
      },
      "ownership": {
        "displayName": "Unknown",
        "kind": "unknown",
        "confidence": "unknown",
        "maintenance": "manual-only"
      },
      "version": {
        "current": "unknown",
        "target": null,
        "channel": "unknown",
        "compatibility": "unverified"
      },
      "architecture": {
        "executable": "unknown",
        "host": "arm64",
        "compatibility": "unverified"
      },
      "acquisition": {
        "status": "discovered-unapproved",
        "initialConsent": "not-recorded",
        "approvedForUse": false,
        "acquiredByPuppetMaster": false,
        "firstAcquisitionMayBeSilent": false
      },
      "lifecyclePolicy": {
        "scope": "manual-only-until-ownership-proven-and-consent-recorded",
        "checkUpdates": "manual",
        "installUpdates": "blocked",
        "versionPolicy": "unknown",
        "rollbackAfterFailedVerification": "unavailable",
        "autoOnMeaning": "maintain-previously-approved-installation-only",
        "state": "blocked-unknown-owner"
      },
      "authentication": {
        "separateFromInstallation": true,
        "owner": "unknown",
        "method": "not-inspected",
        "status": "not-inspected",
        "boundary": "No credentials are read while installation ownership is unknown"
      },
      "readiness": {
        "overall": "manual-only",
        "installationFound": true,
        "executableHealthy": false,
        "authenticationKnown": false,
        "authenticated": false,
        "accountIdentityKnown": false,
        "productOrPlanKnown": false,
        "modelCatalogAvailable": false,
        "adapterHandshakeReady": false,
        "requiredCapabilitiesReady": false,
        "generationVerified": false,
        "usageTelemetryAvailable": false
      },
      "technicalDetails": {
        "paths": {
          "configured": "User-selected wrapper alias",
          "resolved": "Unverified wrapper",
          "actualExecutable": "Not trusted or displayed in the compact row"
        },
        "resolvedCommand": "Never selected automatically",
        "packageAlias": null,
        "hash": {
          "algorithm": "sha256",
          "value": null,
          "status": "not-collected"
        },
        "internalIds": {
          "installationId": "claude-wrapper-unknown",
          "providerFamilyId": "claude",
          "hostId": "host-fixture-mac-local",
          "environmentId": "environment-fixture-macos-native"
        }
      },
      "actions": [
        "Inspect detection evidence"
      ]
    })
  ],
  "antigravity": [
    providerInstallationFixture({
      "id": "antigravity-selected",
      "providerFamilyId": "antigravity",
      "name": "Antigravity CLI",
      "qualifier": "Official installer",
      "summary": "Antigravity CLI on This Linux workstation · sign-in required · selected",
      "state": "signed-out",
      "selected": true,
      "shadowed": false,
      "host": {
        "id": "host-fixture-linux-local",
        "displayName": "This Linux workstation",
        "kind": "native-desktop"
      },
      "environment": {
        "id": "environment-fixture-linux-native",
        "displayName": "Linux native",
        "kind": "linux-native",
        "hostId": "host-fixture-linux-local"
      },
      "source": {
        "displayName": "Official Antigravity download",
        "provenance": "Provider-published artifact with fixture provenance verification",
        "kind": "official-provider-artifact",
        "official": true
      },
      "ownership": {
        "displayName": "Official installer",
        "kind": "provider_native",
        "confidence": "proven",
        "maintenance": "eligible-after-recorded-consent"
      },
      "version": {
        "current": "fixture-current",
        "target": "fixture-compatible-update",
        "channel": "stable",
        "compatibility": "compatible"
      },
      "architecture": {
        "executable": "x86_64",
        "host": "x86_64",
        "compatibility": "compatible"
      },
      "acquisition": {
        "status": "compatible-existing-selected",
        "initialConsent": "recorded-fixture-consent",
        "approvedForUse": true,
        "acquiredByPuppetMaster": false,
        "firstAcquisitionMayBeSilent": false
      },
      "lifecyclePolicy": {
        "scope": "post-consent-only",
        "checkUpdates": "automatic",
        "installUpdates": "automatically-when-idle",
        "versionPolicy": "latest-compatible",
        "rollbackAfterFailedVerification": "on-where-supported",
        "autoOnMeaning": "maintain-previously-approved-installation-only",
        "state": "scheduled-when-idle"
      },
      "authentication": {
        "separateFromInstallation": true,
        "owner": "cli-owned",
        "method": "oauth",
        "status": "signed-out",
        "boundary": "Antigravity CLI owns Google login; Puppet Master launches the provider-owned flow"
      },
      "readiness": {
        "overall": "needs-sign-in",
        "installationFound": true,
        "executableHealthy": true,
        "authenticationKnown": true,
        "authenticated": false,
        "accountIdentityKnown": false,
        "productOrPlanKnown": false,
        "modelCatalogAvailable": false,
        "adapterHandshakeReady": false,
        "requiredCapabilitiesReady": false,
        "generationVerified": false,
        "usageTelemetryAvailable": false
      },
      "technicalDetails": {
        "paths": {
          "configured": "Provider launcher alias",
          "resolved": "Selected provider executable",
          "actualExecutable": "Hydrate exact host-local path in Details"
        },
        "resolvedCommand": "antigravity → selected executable",
        "packageAlias": "antigravity",
        "hash": {
          "algorithm": "sha256",
          "value": null,
          "status": "fixture-provenance-only"
        },
        "internalIds": {
          "installationId": "antigravity-selected",
          "providerFamilyId": "antigravity",
          "hostId": "host-fixture-linux-local",
          "environmentId": "environment-fixture-linux-native"
        }
      },
      "actions": [
        "Open CLI-owned sign-in",
        "Preview idle update"
      ]
    })
  ],
  "ollama": [
    providerInstallationFixture({
      "id": "ollama-not-installed",
      "providerFamilyId": "ollama",
      "name": "Ollama CLI",
      "qualifier": "Not installed",
      "summary": "Ollama CLI on This Mac · Provider Setup Required",
      "state": "not-installed",
      "selected": false,
      "shadowed": false,
      "host": {
        "id": "host-fixture-mac-local",
        "displayName": "This Mac",
        "kind": "native-desktop"
      },
      "environment": {
        "id": "environment-fixture-macos-native",
        "displayName": "macOS native",
        "kind": "macos-native",
        "hostId": "host-fixture-mac-local"
      },
      "source": {
        "displayName": "Official Ollama download",
        "provenance": "Provider-owned download selected from the trusted setup manifest",
        "kind": "official-provider-installer",
        "official": true
      },
      "ownership": {
        "displayName": "Not installed",
        "kind": "not_installed",
        "confidence": "not-applicable",
        "maintenance": "unavailable-before-explicit-acquisition"
      },
      "version": {
        "current": null,
        "target": "fixture-latest-compatible",
        "channel": "stable",
        "compatibility": "verify-after-acquisition"
      },
      "architecture": {
        "executable": "not-installed",
        "host": "arm64",
        "compatibility": "verify-before-acquisition"
      },
      "acquisition": {
        "status": "not-acquired",
        "initialConsent": "required-not-granted",
        "approvedForUse": false,
        "acquiredByPuppetMaster": false,
        "firstAcquisitionMayBeSilent": false
      },
      "lifecyclePolicy": {
        "scope": "unavailable-until-explicit-setup",
        "checkUpdates": "not-applicable",
        "installUpdates": "not-applicable",
        "versionPolicy": "latest-compatible-after-consent",
        "rollbackAfterFailedVerification": "on-where-supported-after-consent",
        "autoOnMeaning": "maintain-previously-approved-installation-only",
        "state": "awaiting-explicit-setup"
      },
      "authentication": {
        "separateFromInstallation": true,
        "owner": "not-required-for-local-runtime",
        "method": "none",
        "status": "not-applicable",
        "boundary": "No account is required for the local runtime; this does not waive explicit installation consent"
      },
      "readiness": {
        "overall": "provider-setup-required",
        "installationFound": false,
        "executableHealthy": false,
        "authenticationKnown": true,
        "authenticated": true,
        "accountIdentityKnown": false,
        "productOrPlanKnown": false,
        "modelCatalogAvailable": false,
        "adapterHandshakeReady": false,
        "requiredCapabilitiesReady": false,
        "generationVerified": false,
        "usageTelemetryAvailable": false
      },
      "technicalDetails": {
        "paths": {
          "configured": null,
          "resolved": null,
          "actualExecutable": null
        },
        "resolvedCommand": null,
        "packageAlias": null,
        "hash": {
          "algorithm": "sha256",
          "value": null,
          "status": "not-acquired"
        },
        "internalIds": {
          "installationId": "ollama-not-installed",
          "providerFamilyId": "ollama",
          "hostId": "host-fixture-mac-local",
          "environmentId": "environment-fixture-macos-native"
        }
      },
      "actions": [
        "Review official source and target",
        "Continue to explicit Install confirmation"
      ]
    })
  ],
  "openrouter-free": [],
  "local-server": [],
  "opencode-server": [
    providerInstallationFixture({
      "id": "opencode-external",
      "providerFamilyId": "opencode-server",
      "name": "OpenCode external server",
      "qualifier": "User managed",
      "summary": "OpenCode external server on This Linux workstation · Ready · Usage unavailable",
      "state": "ready",
      "selected": true,
      "shadowed": false,
      "host": {
        "id": "host-fixture-linux-local",
        "displayName": "This Linux workstation",
        "kind": "native-desktop"
      },
      "environment": {
        "id": "environment-fixture-local-external-service",
        "displayName": "Local external service",
        "kind": "external-service",
        "hostId": "host-fixture-linux-local"
      },
      "source": {
        "displayName": "User-managed OpenCode server",
        "provenance": "Endpoint explicitly supplied by the user; server lifecycle remains external",
        "kind": "user-declared-external-service",
        "official": false
      },
      "ownership": {
        "displayName": "User-managed external service",
        "kind": "external_service",
        "confidence": "declared",
        "maintenance": "externally-managed"
      },
      "version": {
        "current": "API fixture v2",
        "target": null,
        "channel": "server-defined",
        "compatibility": "compatible"
      },
      "architecture": {
        "executable": "server-defined",
        "host": "x86_64",
        "compatibility": "not-applicable-to-client-connection"
      },
      "acquisition": {
        "status": "external-connection-selected",
        "initialConsent": "explicit-endpoint-selection",
        "approvedForUse": true,
        "acquiredByPuppetMaster": false,
        "firstAcquisitionMayBeSilent": false
      },
      "lifecyclePolicy": {
        "scope": "external-service-not-managed-by-puppet-master",
        "checkUpdates": "externally-managed",
        "installUpdates": "externally-managed",
        "versionPolicy": "server-defined-compatible",
        "rollbackAfterFailedVerification": "externally-managed",
        "autoOnMeaning": "not-applicable",
        "state": "not-managed-by-puppet-master"
      },
      "authentication": {
        "separateFromInstallation": true,
        "owner": "external-service",
        "method": "server-defined",
        "status": "ready",
        "boundary": "Puppet Master stores only explicitly supplied connection data"
      },
      "readiness": {
        "overall": "ready-usage-unavailable",
        "installationFound": true,
        "executableHealthy": true,
        "authenticationKnown": true,
        "authenticated": true,
        "accountIdentityKnown": true,
        "productOrPlanKnown": false,
        "modelCatalogAvailable": true,
        "adapterHandshakeReady": true,
        "requiredCapabilitiesReady": true,
        "generationVerified": true,
        "usageTelemetryAvailable": false
      },
      "technicalDetails": {
        "paths": {
          "configured": "Fixture loopback endpoint",
          "resolved": "Explicit external endpoint",
          "actualExecutable": null
        },
        "resolvedCommand": "No local CLI required",
        "packageAlias": null,
        "hash": {
          "algorithm": null,
          "value": null,
          "status": "not-applicable-to-external-service"
        },
        "internalIds": {
          "installationId": "opencode-external",
          "providerFamilyId": "opencode-server",
          "hostId": "host-fixture-linux-local",
          "environmentId": "environment-fixture-local-external-service"
        }
      },
      "actions": [
        "Test deterministic connection",
        "Inspect server contract"
      ]
    })
  ]
};

export const PROVIDER_SETUP_CONTINUATION_FIXTURE = {
  "schemaId": "pm.provider_setup_continuation.fixture.v1",
  "id": "provider-setup-continuation-openai-fixture",
  "providerFamilyId": "openai",
  "status": {
    "code": "provider_setup_required",
    "displayName": "Provider Setup Required",
    "reason": "No compatible installation is both explicitly selected and ready on the required Host/Environment"
  },
  "originatingOperation": {
    "operationId": "operation-fixture-plan-compile-042",
    "displayName": "Continue Plan Compile",
    "projectId": "project-fixture-atlas",
    "planId": "plan-fixture-provider-setup",
    "requiredProviderFamilyId": "openai"
  },
  "continuation": {
    "token": "continuation-fixture-provider-setup-0007",
    "revision": 7,
    "state": "current",
    "preserveAcrossSetup": true
  },
  "coalescing": {
    "requestFingerprint": "openai|host-fixture-windows-local|environment-fixture-windows-native|fixture-compatible",
    "identicalRequestsShareOneSetupOperation": true,
    "eachOriginKeepsItsOwnContinuationTokenAndRevision": true,
    "oneOriginBecomingStaleDoesNotInvalidateCurrentOrigins": true
  },
  "requiredTarget": {
    "host": {
      "id": "host-fixture-windows-local",
      "displayName": "This Windows computer"
    },
    "environment": {
      "id": "environment-fixture-windows-native",
      "displayName": "Windows native"
    }
  },
  "compatibleExistingDiscovery": {
    "state": "found-compatible-not-selected",
    "installationIds": [
      "codex-npm-shadowed"
    ],
    "automaticSelection": false,
    "userMustSelectExactInstallation": true
  },
  "deepLink": {
    "managerId": "providers",
    "tab": "installations",
    "providerId": "openai",
    "rowId": "codex-npm-shadowed",
    "exactRow": true
  },
  "allowedNextActions": [
    "Select compatible existing installation explicitly",
    "Review official source and exact Host/Environment",
    "Confirm explicit Install"
  ],
  "officialAcquisition": {
    "sourceRequired": true,
    "sourceKind": "official-provider-or-documented-package-source",
    "initialConsentRequired": true,
    "silentAcquisitionAllowed": false
  },
  "authentication": {
    "separateOperation": true,
    "startsOnlyAfterInstallationVerification": true,
    "completionDoesNotImplyReadiness": true
  },
  "readinessVerification": {
    "required": [
      "exact selected installation identity",
      "version and architecture compatibility",
      "authentication identity",
      "model catalogue",
      "adapter handshake",
      "required capabilities"
    ],
    "usageTelemetryMayRemainUnavailable": true
  },
  "resume": {
    "requiresContinuationCurrentnessCheck": true,
    "requiredToken": "continuation-fixture-provider-setup-0007",
    "requiredRevision": 7,
    "onCurrent": "resume-originating-operation",
    "onStale": "reject-without-resume"
  },
  "staleRejectionFixture": {
    "presentedToken": "continuation-fixture-provider-setup-0006",
    "presentedRevision": 6,
    "currentToken": "continuation-fixture-provider-setup-0007",
    "currentRevision": 7,
    "result": "stale_continuation_rejected",
    "originatingOperationResumed": false
  }
};

export const PROVIDER_POLICY_CASES = [
  {
    "id": "provider-case-selected-shadowed",
    "label": "Selected and shadowed compatible installations",
    "kind": "installation-resolution",
    "providerFamilyId": "openai",
    "installationIds": [
      "codex-store-selected",
      "codex-npm-shadowed"
    ],
    "expected": {
      "selectedInstallationId": "codex-store-selected",
      "shadowedInstallationId": "codex-npm-shadowed",
      "pathOrderMayChangeSelection": false
    }
  },
  {
    "id": "provider-case-unknown-owner-manual-only",
    "label": "Unknown ownership remains manual-only",
    "kind": "installation-resolution",
    "providerFamilyId": "claude",
    "installationIds": [
      "claude-wrapper-unknown"
    ],
    "expected": {
      "maintenance": "manual-only",
      "packageManagerGuessAllowed": false,
      "automaticSelectionAllowed": false
    }
  },
  {
    "id": "provider-case-claude-cli-owned-oauth",
    "label": "Claude OAuth is CLI-owned",
    "kind": "authentication-boundary",
    "providerFamilyId": "claude",
    "installationIds": [
      "claude-homebrew-selected"
    ],
    "expected": {
      "owner": "cli-owned",
      "rawTokenCopiedByPuppetMaster": false,
      "pmDirectOAuthLabelAllowed": false
    }
  },
  {
    "id": "provider-case-antigravity-cli-owned-oauth",
    "label": "Antigravity OAuth is CLI-owned",
    "kind": "authentication-boundary",
    "providerFamilyId": "antigravity",
    "installationIds": [
      "antigravity-selected"
    ],
    "expected": {
      "owner": "cli-owned",
      "providerOwnedFlowLaunched": true,
      "pmDirectOAuthLabelAllowed": false
    }
  },
  {
    "id": "provider-case-approved-direct-oauth-distinct",
    "label": "Approved direct OAuth remains a distinct connection",
    "kind": "authentication-boundary",
    "providerFamilyId": "openai",
    "installationIds": [
      "codex-store-selected"
    ],
    "connectionFixture": {
      "id": "connection-fixture-openai-pm-direct-oauth",
      "owner": "pm-direct-approved-client",
      "method": "oauth",
      "installationMutation": false
    },
    "expected": {
      "installationAndAuthenticationSeparate": true,
      "installingCliAuthenticatesConnection": false
    }
  },
  {
    "id": "provider-case-authenticated-not-ready",
    "label": "Authenticated but provider route is not ready",
    "kind": "readiness",
    "providerFamilyId": "openai",
    "installationIds": [
      "codex-store-selected"
    ],
    "readinessOverlay": {
      "overall": "authenticated-not-ready",
      "authenticated": true,
      "modelCatalogAvailable": true,
      "adapterHandshakeReady": false,
      "requiredCapabilitiesReady": false,
      "generationVerified": false,
      "usageTelemetryAvailable": true
    },
    "expected": {
      "ready": false,
      "reason": "adapter-handshake-failed"
    }
  },
  {
    "id": "provider-case-ready-usage-unavailable",
    "label": "Ready while Usage details are unavailable",
    "kind": "readiness",
    "providerFamilyId": "opencode-server",
    "installationIds": [
      "opencode-external"
    ],
    "expected": {
      "ready": true,
      "usageTelemetryAvailable": false,
      "usageGatesReadiness": false
    }
  },
  {
    "id": "provider-case-post-consent-update",
    "label": "Update applies only after prior installation consent",
    "kind": "post-consent-lifecycle",
    "providerFamilyId": "openai",
    "installationIds": [
      "codex-store-selected"
    ],
    "operation": {
      "type": "update",
      "state": "awaiting-user-approval",
      "requiresPriorApprovedInstallation": true
    }
  },
  {
    "id": "provider-case-post-consent-repair",
    "label": "Repair preserves the approved installation identity",
    "kind": "post-consent-lifecycle",
    "providerFamilyId": "claude",
    "installationIds": [
      "claude-homebrew-selected"
    ],
    "operation": {
      "type": "repair",
      "state": "verifying",
      "requiresPriorApprovedInstallation": true,
      "mayChangeAuthenticationOwner": false
    }
  },
  {
    "id": "provider-case-post-consent-rollback",
    "label": "Failed verification rolls back a previously approved generation",
    "kind": "post-consent-lifecycle",
    "providerFamilyId": "antigravity",
    "installationIds": [
      "antigravity-selected"
    ],
    "operation": {
      "type": "rollback",
      "state": "rolled-back",
      "requiresPriorApprovedInstallation": true,
      "priorGenerationRetained": true
    }
  },
  {
    "id": "provider-case-official-provenance-failure",
    "label": "Official provenance failure blocks acquisition",
    "kind": "acquisition-failure",
    "providerFamilyId": "ollama",
    "installationIds": [
      "ollama-not-installed"
    ],
    "sourceOverlay": {
      "official": false,
      "provenance": "publisher-or-integrity-verification-failed"
    },
    "expected": {
      "state": "blocked-provenance",
      "downloadActivated": false,
      "authenticationStarted": false
    }
  },
  {
    "id": "provider-case-offline-wait",
    "label": "Offline acquisition waits without losing explicit consent boundary",
    "kind": "acquisition-wait",
    "providerFamilyId": "ollama",
    "installationIds": [
      "ollama-not-installed"
    ],
    "observableWork": {
      "state": "waiting-network",
      "progressKind": "unknown",
      "waitReason": "Host is offline",
      "canCancel": true,
      "canRetry": true
    },
    "expected": {
      "silentRetryMayAcquire": false,
      "resumeRequiresCurrentConsentAndTarget": true
    }
  }
];

export function buildProviderInstallationScaleFixture(count = 100) {
  const total = Number.isInteger(count) && count > 0 ? count : 100;
  const providers = [
    ["openai", "Codex CLI"],
    ["claude", "Claude CLI"],
    ["antigravity", "Antigravity CLI"],
    ["gemini", "Gemini CLI"]
  ];
  const targets = [
    ["host-scale-windows", "Windows build host", "environment-scale-windows-native", "Windows native", "x86_64"],
    ["host-scale-mac", "Mac review host", "environment-scale-macos-native", "macOS native", "arm64"],
    ["host-scale-linux", "Linux execution host", "environment-scale-linux-native", "Linux native", "x86_64"],
    ["host-scale-wsl", "Windows build host", "environment-scale-wsl-ubuntu", "Ubuntu 24.04 in WSL", "x86_64"]
  ];
  const states = ["ready", "found-not-selected", "shadowed", "manual-only", "needs-sign-in", "update-available"];
  const rows = Array.from({ length: total }, (_, index) => {
    const sequence = String(index + 1).padStart(3, "0");
    const [providerFamilyId, providerName] = providers[index % providers.length];
    const [hostId, hostDisplayName, environmentId, environmentDisplayName, architecture] = targets[index % targets.length];
    const state = states[index % states.length];
    const id = `provider-installation-scale-${sequence}`;
    return {
      "id": id,
      "schemaId": "pm.provider_installation_summary.fixture.v1",
      "providerFamilyId": providerFamilyId,
      "name": `${providerName} ${sequence}`,
      "summary": `${providerName} ${sequence} on ${hostDisplayName} · ${environmentDisplayName} · ${state.replaceAll("-", " ")}`,
      "state": state,
      "host": {
        "id": hostId,
        "displayName": hostDisplayName
      },
      "environment": {
        "id": environmentId,
        "displayName": environmentDisplayName
      },
      "version": {
        "display": `fixture-${1 + (index % 9)}.${index % 20}.${index % 7}`
      },
      "architecture": {
        "displayName": architecture
      },
      "source": {
        "displayName": "Official provider source fixture",
        "kind": "official-source-summary",
        "official": true
      },
      "readinessSummary": state === "ready" ? "Ready" : state.replaceAll("-", " "),
      "technicalDetails": {
        "hydration": "deferred",
        "detailsRef": `provider-installation-details:${id}`,
        "rawPathDataIncluded": false
      }
    };
  });
  return {
    "schemaId": "pm.provider_installation_scale.fixture.v1",
    "fixtureId": `provider-installation-scale-${String(total).padStart(3, "0")}`,
    "deterministic": true,
    "baselineProviderArraysExpanded": false,
    "total": total,
    "summaryRows": rows
  };
}

export const FLOW_TEMPLATES = {
  "provider-install": {
    "label": "Explicit official-source installation",
    "stages": [
      "Discover compatible existing installations",
      "Select exact Host and Environment",
      "Review official source, provenance, version, architecture, license, cost, and permissions",
      "Confirm explicit Install",
      "Acquire from official source",
      "Verify installation identity and readiness facets",
      "Authenticate separately when required",
      "Check continuation currentness",
      "Ready"
    ],
    "failureStage": 5
  },
  "provider-auth": {
    "label": "Separate provider authentication",
    "stages": [
      "Use verified selected installation",
      "Review authentication owner and method",
      "Start explicit provider or PM-approved flow",
      "Verify account and product identity",
      "Refresh model catalogue and adapter readiness",
      "Ready"
    ],
    "failureStage": 3
  },
  "provider-update": {
    "label": "Provider installation update",
    "stages": [
      "Check selected installation",
      "Review official update",
      "Stage update",
      "Verify invocation and ownership",
      "Select or roll back",
      "Ready"
    ],
    "failureStage": 3
  },
  "sound-pack": {
    "label": "Sound-pack import",
    "stages": [
      "Inspect package",
      "Validate manifest and license",
      "Preview sounds locally",
      "Map events",
      "Apply",
      "Verify"
    ],
    "failureStage": 1
  },
  "settings-import": {
    "label": "Settings import",
    "stages": [
      "Validate archive",
      "Inspect scope",
      "Preview changes",
      "Resolve conflicts",
      "Apply",
      "Verify"
    ],
    "failureStage": 4,
    "choiceStage": 3,
    "choices": [
      "Merge",
      "Replace"
    ]
  },
  "settings-copy": {
    "label": "Copy Settings From",
    "stages": [
      "Select source project",
      "Choose categories",
      "Preview requested/effective impact",
      "Apply",
      "Verify"
    ],
    "failureStage": 3
  },
  "settings-reset": {
    "label": "Settings reset",
    "stages": [
      "Choose scope",
      "Preview impact",
      "Create rollback point",
      "Reset",
      "Verify"
    ],
    "failureStage": 3
  },
  "backup-restore": {
    "label": "Backup restore",
    "stages": [
      "Verify backup",
      "Choose scope",
      "Preview changes",
      "Create rollback point",
      "Restore",
      "Verify"
    ],
    "failureStage": 4
  },
  "cleanup": {
    "label": "Workspace cleanup",
    "stages": [
      "Inventory candidates",
      "Exclude protected paths",
      "Preview deletion",
      "Clean",
      "Verify receipts"
    ],
    "failureStage": 3
  },
  "test": {
    "label": "Deterministic capability test",
    "stages": [
      "Prepare fixture",
      "Run visible interaction",
      "Collect evidence",
      "Assert result",
      "Publish receipt"
    ],
    "failureStage": 2
  },
  "theme": {
    "label": "Theme preview and apply",
    "stages": [
      "Parse tokens",
      "Validate semantic coverage",
      "Preview without commit",
      "Apply",
      "Verify contrast and focus"
    ],
    "failureStage": 1
  },
  "generic": {
    "label": "Manager operation",
    "stages": [
      "Review scope",
      "Validate",
      "Apply local fixture",
      "Verify",
      "Receipt"
    ],
    "failureStage": 2
  }
};

export const DETERMINISTIC_TRIGGERS = [
  {
    "id": "provider-selected-shadowed",
    "label": "Selected + shadowed install",
    "managerId": "providers",
    "kind": "provider-installation",
    "target": "openai",
    "installationId": "codex-store-selected",
    "message": "One selected and one shadowed installation are visible."
  },
  {
    "id": "provider-unknown-owner",
    "label": "Unknown owner · manual-only",
    "managerId": "providers",
    "kind": "provider-installation",
    "target": "claude",
    "installationId": "claude-wrapper-unknown",
    "message": "Unknown ownership prevents automatic update or selection."
  },
  {
    "id": "provider-cli-oauth-signed-out",
    "label": "CLI OAuth signed out",
    "managerId": "providers",
    "kind": "provider-state",
    "target": "antigravity",
    "status": "signed-out",
    "message": "Provider-owned login is required."
  },
  {
    "id": "provider-not-installed",
    "label": "Explicit install available",
    "managerId": "providers",
    "kind": "provider-installation",
    "target": "ollama",
    "installationId": "ollama-not-installed",
    "message": "No silent install; official-source review is available."
  },
  {
    "id": "provider-catalog-stale",
    "label": "Stale catalogue",
    "managerId": "providers",
    "kind": "provider-catalog",
    "target": "openai",
    "status": "stale",
    "message": "Current routes remain usable while refresh is recommended."
  },
  {
    "id": "provider-refresh-last-good",
    "label": "Refresh failed · last-known-good",
    "managerId": "providers",
    "kind": "provider-catalog",
    "target": "claude",
    "status": "failed-last-good",
    "message": "Last-known-good rows remain mounted after refresh failure."
  },
  {
    "id": "provider-route-difference",
    "label": "Requested/effective route differs",
    "managerId": "providers",
    "kind": "provider-route",
    "target": "openai",
    "status": "effective-difference",
    "message": "Requested account is unavailable; effective fallback is named."
  },
  {
    "id": "validation-error",
    "label": "Validation error",
    "managerId": "appearance",
    "kind": "manager-resource",
    "target": "theme-custom",
    "status": "Validation error",
    "message": "Unsupported theme token uses visible fallback."
  },
  {
    "id": "managed-setting",
    "label": "Managed setting",
    "managerId": "permissions-filesafe",
    "kind": "manager-resource",
    "target": "filesafe-secrets",
    "status": "Managed",
    "message": "Control is read-only with source and reason."
  },
  {
    "id": "unavailable-setting",
    "label": "Unavailable dependency",
    "managerId": "tools",
    "kind": "manager-resource",
    "target": "tool-unknown",
    "status": "Unavailable",
    "message": "Unavailable state names the missing evidence."
  },
  {
    "id": "restart-required",
    "label": "Restart required",
    "managerId": "plugins",
    "kind": "manager-resource",
    "target": "plugin-theme-import",
    "status": "Restart required",
    "message": "Staged update takes effect after restart."
  },
  {
    "id": "reconnect-required",
    "label": "Reconnect required",
    "managerId": "mcp",
    "kind": "manager-state",
    "target": "mcp",
    "status": "Reconnect required",
    "message": "Last-known-good inventory remains visible."
  },
  {
    "id": "rollback-complete",
    "label": "Rollback complete",
    "managerId": "settings-lifecycle",
    "kind": "flow-state",
    "flow": "settings-import",
    "status": "rolled-back",
    "message": "Prior settings are restored with a receipt."
  },
  {
    "id": "changed-elsewhere",
    "label": "Changed elsewhere",
    "managerId": "settings-lifecycle",
    "kind": "external-change",
    "target": "settings-copy",
    "status": "changed-elsewhere",
    "message": "Review external value or keep local request."
  },
  {
    "id": "import-conflict",
    "label": "Import conflict",
    "managerId": "settings-lifecycle",
    "kind": "flow-state",
    "flow": "settings-import",
    "status": "choice-required",
    "message": "Merge or Replace is required before apply."
  },
  {
    "id": "sound-pack-invalid-license",
    "label": "Invalid sound-pack license",
    "managerId": "notifications-sounds",
    "kind": "manager-resource",
    "target": "pack-invalid",
    "status": "Unavailable",
    "message": "Local preview remains available; Apply is blocked."
  },
  {
    "id": "theme-invalid-token",
    "label": "Invalid custom-theme token",
    "managerId": "appearance",
    "kind": "manager-resource",
    "target": "theme-custom",
    "status": "Validation error",
    "message": "Unsupported token falls back to a built-in theme."
  },
  {
    "id": "testing-unavailable",
    "label": "Testing capability unavailable",
    "managerId": "testing-debug",
    "kind": "manager-resource",
    "target": "test-native",
    "status": "Unavailable",
    "message": "Fallback logs and Open/Watch evidence remain available."
  },
  {
    "id": "cleanup-protected",
    "label": "Protected cleanup scope",
    "managerId": "workspace-cleanup",
    "kind": "manager-resource",
    "target": "cleanup-protected",
    "status": "Managed",
    "message": "Active durable state cannot be selected for cleanup."
  },
  {
    "id": "missing-owner-server-shell",
    "label": "Server insertion owner unresolved",
    "managerId": "future-server-shell",
    "kind": "manager-state",
    "target": "future-server-shell",
    "status": "Missing owner",
    "message": "Insertion destinations remain inspect-only and mutation-blocked until the exact canonical owner is adjudicated."
  },
  {
    "id": "no-search-results",
    "label": "No search results",
    "managerId": null,
    "kind": "search",
    "query": "zz-no-setting-exists-481",
    "message": "Search explains that no matching destination exists."
  },
  {
    "id": "typo-search",
    "label": "Typo search",
    "managerId": null,
    "kind": "search",
    "query": "notifictions",
    "message": "Fuzzy search still finds Notifications & sounds."
  },
  {
    "id": "long-copy",
    "label": "Long localized copy",
    "managerId": "context",
    "kind": "long-copy",
    "target": "project-instructions",
    "message": "A deliberately expanded explanation tests wrapping and squeezed layout without clipping or truncation."
  },
  {
    "id": "lazy-hydration",
    "label": "Lazy manager hydration",
    "managerId": "testing-debug",
    "kind": "hydration",
    "target": "testing-debug",
    "status": "loading",
    "message": "Manager loading remains local and does not block Settings navigation."
  }
];

export const MANAGER_COVERAGE_LABELS = {
  "goal-automation": "Goal & automation",
  "permissions-filesafe": "Permissions & FileSafe",
  "back-seat-driver": "Back Seat Driver",
  "notifications-sounds": "Notifications & sounds",
  "appearance": "Appearance",
  "spellcheck": "Spellcheck & dictionaries",
  "desktop": "Desktop, tray & windows",
  "teacher-help": "Teacher & help",
  "file-manager": "File Manager & editor",
  "formatters": "Formatters",
  "commands-shortcuts": "Commands & shortcuts",
  "skills": "Skills",
  "plugins": "Plugins",
  "tools": "Tools",
  "testing-debug": "Testing & debug",
  "storage-retention": "Storage & retention",
  "backup-restore": "Backup & restore",
  "settings-lifecycle": "Settings lifecycle",
  "history-sessions": "History & sessions",
  "runtime-artifacts": "Runtime artifacts",
  "source-control-worktrees": "Source control & worktrees",
  "github-actions": "GitHub Actions",
  "containers-registries": "Containers & registries",
  "web-search-fetch": "Web, search & fetch",
  "project-search-index": "Project search index",
  "workspace-cleanup": "Workspace cleanup",
  "future-server-shell": "Future Server module shell",
  "providers": "Provider/Account/Model/Installation",
  "context": "Context & Instructions",
  "memory": "Memory",
  "personas": "Personas",
  "crew": "Crew",
  "terminal": "Terminal",
  "lsp": "LSP",
  "mcp": "MCP"
};

export function assignmentForConcept(conceptId) {
  return [...(CONCEPT_MANAGER_ASSIGNMENTS[conceptId] || [])];
}

export function installationRecords(providerId) {
  return (PROVIDER_INSTALLATIONS[providerId] || []).map((entry) => structuredClone ? structuredClone(entry) : JSON.parse(JSON.stringify(entry)));
}
