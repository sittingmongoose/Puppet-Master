/* ============================================================================
   pm-settings-demo.js — shared realistic demo dataset for the Settings
   redesign bakeoff (window.PM_SETTINGS_DEMO). Plain object, no dependencies.

   Conventions:
   - Every user-visible string is humanized ("Not configured", never
     "not_configured"). Machine tokens stay in id/state fields only.
   - A field with no literal value uses an explicit token:
     "auto" | "inherit" | "not-configured" — never an empty string.
   - state vocabulary (settings): default | recommended | inherited | auto |
     not-configured | managed | custom | unavailable | effective-differs
   - exposure vocabulary: standard | advanced | expert | managed |
     diagnostic | unavailable
   ========================================================================== */
(function () {
  "use strict";

  window.PM_SETTINGS_DEMO = {
    meta: {
      model: "Kimi",
      topic: "settings-redesign",
      seededAt: "2026-08-05"
    },

    /* ==================================================================
       CATEGORIES — exactly these 11. Each subcategory lists its setting
       ids (every id resolves in the `settings` map below; >= 3 per sub).
       status: ok | attention | setup | recommended
       ================================================================== */
    categories: [
      {
        id: "general",
        title: "General",
        purpose: "Startup, defaults, and updates",
        icon: "home",
        status: "ok",
        statusSummary: "Everything is in order",
        subcategories: [
          { id: "startup", title: "Startup", summary: "What Puppet Master restores and resumes on launch", settings: ["general.startup-restore", "general.startup-open", "general.resume-goal-runs"] },
          { id: "defaults", title: "Defaults", summary: "Baseline choices for new threads and projects", settings: ["general.default-project", "general.thread-autoname", "general.default-persona"] },
          { id: "updates", title: "Updates", summary: "How Puppet Master keeps itself current", settings: ["general.check-updates", "general.update-channel", "general.update-download"] }
        ]
      },
      {
        id: "appearance",
        title: "Appearance",
        purpose: "Theme, layout, motion, and input",
        icon: "palette",
        status: "ok",
        statusSummary: "Everything is in order",
        subcategories: [
          { id: "theme", title: "Theme", summary: "Color theme and contrast", settings: ["appearance.theme", "appearance.follow-system", "appearance.contrast"] },
          { id: "layout", title: "Layout", summary: "Density, text size, and panel arrangement", settings: ["appearance.density", "appearance.text-size", "appearance.sidebar-position"] },
          { id: "motion", title: "Motion", summary: "Animation and scrolling behavior", settings: ["appearance.reduce-motion", "appearance.animations", "appearance.smooth-scrolling"] },
          { id: "input", title: "Input and spellcheck", summary: "Keyboard behavior and the shared spellcheck service", settings: ["appearance.keybindings", "appearance.check-spelling", "appearance.spelling-language", "appearance.dictionary-source", "appearance.check-technical-prose", "appearance.underline-unknown-names"] }
        ]
      },
      {
        id: "providers",
        title: "Providers and Models",
        purpose: "Accounts, connections, models, and agent roles",
        icon: "layers",
        status: "attention",
        statusSummary: "Two connections need attention",
        manager: "providers",
        subcategories: [
          { id: "connections", title: "Accounts and connections", summary: "How provider sign-ins behave across accounts", settings: ["providers.account-switch-scope", "providers.sticky-sessions", "providers.reconnect-on-launch"] },
          { id: "models", title: "Models", summary: "Catalog refresh, visibility, and capability checks", settings: ["providers.catalog-refresh", "providers.show-hidden-models", "providers.capability-probes"] },
          { id: "roles", title: "Agent roles", summary: "Which routes power planning, verification, and fallback work", settings: ["providers.planning-quality-guard", "providers.verifier-route", "providers.low-usage-behavior"] },
          { id: "routing", title: "Routing and priority", summary: "How Puppet Master picks and fails over between routes", settings: ["providers.route-priority-mode", "providers.use-next-on-exhaust", "providers.cross-provider-fallback"] }
        ]
      },
      {
        id: "permissions",
        title: "Permissions and Safety",
        purpose: "Approvals, FileSafe, and sandboxes",
        icon: "shield",
        status: "attention",
        statusSummary: "FileSafe sandbox is incomplete",
        subcategories: [
          { id: "approvals", title: "Approvals", summary: "When Puppet Master asks before acting", settings: ["permissions.default-approval", "permissions.approval-duration", "permissions.auto-approve-reads"] },
          { id: "filesafe", title: "FileSafe", summary: "Protected writes and sandbox coverage", settings: ["permissions.filesafe-enabled", "permissions.filesafe-mode", "permissions.filesafe-extra-paths"] },
          { id: "sandboxes", title: "Sandboxes", summary: "Isolated execution for agents and tools", settings: ["permissions.sandbox-network", "permissions.sandbox-image", "permissions.sandbox-keep", "permissions.sandbox-gpu"] }
        ]
      },
      {
        id: "code",
        title: "Code and Editor",
        purpose: "Editor, terminal, shell, and language servers",
        icon: "code",
        status: "setup",
        statusSummary: "Terminal profile setup is unfinished",
        manager: "terminal",
        subcategories: [
          { id: "editor", title: "Editor", summary: "Editing behavior and formatting", settings: ["code.editor-font-size", "code.editor-tab-size", "code.format-on-save"] },
          { id: "terminal", title: "Terminal", summary: "Profiles, rendering, and scrollback", settings: ["code.terminal-profile", "code.terminal-font-size", "code.terminal-scrollback"] },
          { id: "shell", title: "Shell", summary: "Default shell and environment", settings: ["code.shell-path", "code.shell-startup-command", "code.shell-env-policy"] },
          { id: "languages", title: "Languages and language servers", summary: "Language server startup, formatting, and diagnostics", settings: ["code.lsp-autostart", "code.formatting-owner", "code.diagnostics-verbosity"] }
        ]
      },
      {
        id: "context",
        title: "Context and Memory",
        purpose: "History, memory, instructions, and compaction",
        icon: "stack",
        status: "recommended",
        statusSummary: "One safeguard is recommended",
        manager: "memory",
        subcategories: [
          { id: "history", title: "History", summary: "How much of your past work informs new turns", settings: ["context.use-previous-chats", "context.history-retention", "context.use-logs"] },
          { id: "memory", title: "Assistant memory", summary: "Evidence-backed Gists, review, and fading", settings: ["context.memory-enabled", "context.memory-review", "context.memory-half-life"] },
          { id: "instructions", title: "Instructions and context sources", summary: "What enters the model-facing context each turn", settings: ["context.include-project-instructions", "context.include-handoff", "context.include-journal"] },
          { id: "compaction", title: "Compaction", summary: "Automatic compaction and its safeguards", settings: ["context.compaction-auto", "context.compaction-threshold", "context.compaction-safeguard", "context.warn-route-changes"] }
        ]
      },
      {
        id: "planning",
        title: "Planning and Automation",
        purpose: "PRD, Goal Mode, testing, and verification",
        icon: "compass",
        status: "attention",
        statusSummary: "No verifier route is configured",
        subcategories: [
          { id: "prd", title: "PRD and planning", summary: "The planning conversation and its quality guard", settings: ["planning.conversation-route", "planning.prd-autosave", "planning.evidence-strength"] },
          { id: "goal", title: "Goal Mode", summary: "Ceilings, guards, and checkpoints for Goal runs", settings: ["planning.goal-concurrency", "planning.goal-spend-guard", "planning.goal-checkpoints"] },
          { id: "testing", title: "Testing and debugging", summary: "Automation visibility and debug policy", settings: ["planning.test-visibility", "planning.automated-debugging", "planning.test-port-policy"] },
          { id: "verification", title: "Verification", summary: "Audits before work is marked done", settings: ["planning.require-verification", "planning.audit-strength", "planning.verification-reserve"] }
        ]
      },
      {
        id: "collaboration",
        title: "Git and Collaboration",
        purpose: "Worktrees, Crew, and subagents",
        icon: "branch",
        status: "ok",
        statusSummary: "Everything is in order",
        manager: "crew",
        subcategories: [
          { id: "git", title: "Git and worktrees", summary: "Isolation, cleanup, and branch protection", settings: ["collaboration.worktree-provisioning", "collaboration.worktree-cleanup", "collaboration.protect-main"] },
          { id: "crew", title: "Crew", summary: "Reusable multi-agent execution templates", settings: ["collaboration.crew-route-policy", "collaboration.crew-max-members", "collaboration.crew-isolation"] },
          { id: "subagents", title: "Subagents", summary: "Depth, grants, and cross-project access", settings: ["collaboration.subagent-depth", "collaboration.subagent-inherit-grants", "collaboration.cross-project-access"] }
        ]
      },
      {
        id: "tools",
        title: "Tools and Connectors",
        purpose: "MCP, skills, plugins, commands, and web",
        icon: "plug",
        status: "attention",
        statusSummary: "One MCP server is degraded",
        manager: "mcp",
        subcategories: [
          { id: "mcp", title: "MCP servers", summary: "External tool servers and their tool exposure", settings: ["tools.mcp-tool-exposure", "tools.mcp-approval-policy", "tools.mcp-reconnect"] },
          { id: "skills", title: "Skills and plugins", summary: "Installable capabilities and their trust state", settings: ["tools.skills-auto-update", "tools.allow-untrusted-skills", "tools.plugin-channel"] },
          { id: "commands", title: "Commands and shortcuts", summary: "Command palette, conflicts, and custom commands", settings: ["tools.shortcut-conflict-warning", "tools.command-palette-shortcut", "tools.custom-commands"] },
          { id: "web", title: "Web access", summary: "Fetching, search, and extraction routes", settings: ["tools.web-fetch", "tools.web-search-provider", "tools.web-extraction-route"] }
        ]
      },
      {
        id: "media",
        title: "Media",
        purpose: "Image, audio, and video providers and routes",
        icon: "image",
        status: "setup",
        statusSummary: "No media provider is connected",
        manager: "media",
        subcategories: [
          { id: "routes", title: "Media routes", summary: "Which provider handles each media kind", settings: ["media.image-route", "media.video-route", "media.audio-route"] },
          { id: "output", title: "Output and storage", summary: "Formats, locations, and history retention", settings: ["media.output-format", "media.output-location", "media.history-retention"] },
          { id: "safety", title: "Safety and policy", summary: "Content policy and cost routing", settings: ["media.safety-policy", "media.content-filtering", "media.cost-route"] }
        ]
      },
      {
        id: "system",
        title: "System",
        purpose: "Health, logs, backups, diagnostics, and advanced controls",
        icon: "gauge",
        status: "ok",
        statusSummary: "Everything is in order",
        subcategories: [
          { id: "health", title: "Health", summary: "Launch checks and crash reporting", settings: ["system.health-checks", "system.health-interval", "system.crash-reports"] },
          { id: "logs", title: "Logs", summary: "Verbosity, retention, and export", settings: ["system.log-level", "system.log-retention", "system.export-logs"] },
          { id: "backups", title: "Backups and snapshots", summary: "Automatic snapshots and cleanup", settings: ["system.auto-snapshots", "system.snapshot-frequency", "system.delete-snapshots-on-cleanup"] },
          { id: "diagnostics", title: "Diagnostics", summary: "Overlays, traces, and support bundles", settings: ["system.diagnostic-overlay", "system.interaction-traces", "system.export-diagnostics"] },
          { id: "advanced", title: "Advanced", summary: "Experimental and destructive controls", settings: ["system.experimental-runtime", "system.feature-flags", "system.telemetry-endpoint", "system.factory-reset"] }
        ]
      }
    ],

    /* ==================================================================
       SETTINGS — 129 records across all 11 categories.
       Required fields per record: id, label, description, help, type,
       value, defaultValue, state, source, scope, exposure, search.
       Conditional: recommendedValue, options, min/max/unit,
       effectiveValue+effectiveReason, managedReason, unavailableReason,
       restartRequired, reconnectRequired, effect, actionLabel.
       ================================================================== */
    settings: {
      /* ---------- General / Startup ---------- */
      "general.startup-restore": {
        id: "general.startup-restore",
        label: "Restore previous session",
        description: "Reopen the threads and panels from your last session.",
        help: "Turn this off to always start with a clean home screen.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "reopen launch resume workspace"
      },
      "general.startup-open": {
        id: "general.startup-open",
        label: "On startup, open",
        description: "Choose the first screen Puppet Master shows.",
        help: "Home shows your projects; Last session picks up where you left off.",
        type: "select", value: "last-session", defaultValue: "last-session",
        options: [
          { value: "last-session", label: "Last session" },
          { value: "home", label: "Home" },
          { value: "new-thread", label: "A new thread" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "first screen launch landing"
      },
      "general.resume-goal-runs": {
        id: "general.resume-goal-runs",
        label: "Resume interrupted Goal runs",
        description: "Offer to continue Goal runs that were cut off by a quit or crash.",
        help: "Runs resume from their last checkpoint, not from scratch.",
        type: "toggle", value: true, defaultValue: false,
        state: "inherited", source: "Global settings", scope: ["project", "global"], exposure: "standard",
        search: "goal runtime crash recovery continue"
      },

      /* ---------- General / Defaults ---------- */
      "general.default-project": {
        id: "general.default-project",
        label: "Default project for new threads",
        description: "New threads start against this project unless you pick another.",
        help: "When not configured, new threads ask which project to use.",
        type: "text", value: "not-configured", defaultValue: "not-configured",
        state: "not-configured", source: "Default", scope: ["global"], exposure: "standard",
        search: "fallback home project new chat"
      },
      "general.thread-autoname": {
        id: "general.thread-autoname",
        label: "Name new threads automatically",
        description: "Generate a short title from the first exchange in each thread.",
        help: "You can always rename a thread later.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "title rename chat"
      },
      "general.default-persona": {
        id: "general.default-persona",
        label: "Default persona for new work",
        description: "The persona applied to new threads in this project.",
        help: "Child-only personas such as Explorer and Bash cannot be picked here.",
        type: "select", value: "collaborator", defaultValue: "assistant",
        options: [
          { value: "assistant", label: "Assistant" },
          { value: "collaborator", label: "Collaborator" },
          { value: "general", label: "General" },
          { value: "overseer", label: "Overseer" },
          { value: "researcher", label: "Researcher" },
          { value: "teacher", label: "Teacher" }
        ],
        state: "custom", source: "Project settings", scope: ["project", "global"], exposure: "standard",
        search: "persona behavior default role"
      },

      /* ---------- General / Updates ---------- */
      "general.check-updates": {
        id: "general.check-updates",
        label: "Check for updates automatically",
        description: "Look for new Puppet Master releases in the background.",
        help: "Update checks download a small version manifest only.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "release version upgrade"
      },
      "general.update-channel": {
        id: "general.update-channel",
        label: "Update channel",
        description: "Which release line this installation follows.",
        help: "Your organization manages this setting, so it is read-only here.",
        type: "select", value: "stable", defaultValue: "stable",
        options: [
          { value: "stable", label: "Stable" },
          { value: "beta", label: "Beta" },
          { value: "nightly", label: "Nightly" }
        ],
        state: "managed", source: "Managed by organization", scope: ["global"], exposure: "managed",
        managedReason: "Your organization pins Puppet Master to the Stable channel.",
        restartRequired: true,
        search: "release line beta nightly"
      },
      "general.update-download": {
        id: "general.update-download",
        label: "Download updates in the background",
        description: "Fetch updates before you choose to install them.",
        help: "You still decide when to restart and apply an update.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "prefetch installer"
      },

      /* ---------- Appearance / Theme ---------- */
      "appearance.theme": {
        id: "appearance.theme",
        label: "Theme",
        description: "The color theme used across Puppet Master.",
        help: "All eight themes keep the same status language; only the material changes.",
        type: "select", value: "friendly-dark", defaultValue: "friendly-dark",
        options: [
          { value: "friendly-dark", label: "Friendly Dark" },
          { value: "friendly-light", label: "Friendly Light" },
          { value: "glass-dark", label: "Glass Dark" },
          { value: "glass-light", label: "Glass Light" },
          { value: "retro-dark", label: "Retro Dark" },
          { value: "retro-light", label: "Retro Light" },
          { value: "basic-dark", label: "Basic Dark" },
          { value: "basic-light", label: "Basic Light" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "dark light glass retro basic colors"
      },
      "appearance.follow-system": {
        id: "appearance.follow-system",
        label: "Follow system appearance",
        description: "Switch between the light and dark variant of your theme with the OS.",
        help: "When on, the fixed theme choice above is ignored.",
        type: "toggle", value: false, defaultValue: false,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "auto dark mode os sync"
      },
      "appearance.contrast": {
        id: "appearance.contrast",
        label: "Interface contrast",
        description: "Strengthen or soften text and border contrast.",
        help: "Halfway matches the theme designer's intent.",
        type: "slider", value: 50, defaultValue: 50, min: 0, max: 100, unit: "%",
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "readability accessibility"
      },

      /* ---------- Appearance / Layout ---------- */
      "appearance.density": {
        id: "appearance.density",
        label: "Layout density",
        description: "How much breathing room lists and panels get.",
        help: "Compact fits more rows on screen; Spacious is calmer.",
        type: "segmented", value: "comfortable", defaultValue: "comfortable",
        options: [
          { value: "compact", label: "Compact" },
          { value: "comfortable", label: "Comfortable" },
          { value: "spacious", label: "Spacious" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "spacing padding compact roomy"
      },
      "appearance.text-size": {
        id: "appearance.text-size",
        label: "Interface text size",
        description: "Base size for labels and descriptions.",
        help: "Code and terminal text have their own size settings.",
        type: "slider", value: 14, defaultValue: 14, min: 12, max: 18, unit: "px",
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "font size zoom readability"
      },
      "appearance.sidebar-position": {
        id: "appearance.sidebar-position",
        label: "Side panel position",
        description: "Which edge of the window hosts the file panel.",
        help: "Inherited from your global settings; override it for this project if you like.",
        type: "segmented", value: "left", defaultValue: "left",
        options: [
          { value: "left", label: "Left" },
          { value: "right", label: "Right" }
        ],
        state: "inherited", source: "Global settings", scope: ["project", "global"], exposure: "standard",
        search: "panel dock edge files"
      },

      /* ---------- Appearance / Motion ---------- */
      "appearance.reduce-motion": {
        id: "appearance.reduce-motion",
        label: "Reduce interface motion",
        description: "Replace animation with short fades and instant state changes.",
        help: "Match system follows your OS accessibility setting automatically.",
        type: "select", value: "match-system", defaultValue: "match-system",
        options: [
          { value: "match-system", label: "Match system" },
          { value: "on", label: "On" },
          { value: "off", label: "Off" }
        ],
        state: "auto", source: "Default", scope: ["global"], exposure: "standard",
        search: "animation accessibility vestibular"
      },
      "appearance.animations": {
        id: "appearance.animations",
        label: "Interface animations",
        description: "Directed transitions for navigation, expansion, and state changes.",
        help: "Reduced motion overrides this wherever it is active.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "transitions motion easing"
      },
      "appearance.smooth-scrolling": {
        id: "appearance.smooth-scrolling",
        label: "Smooth scrolling",
        description: "Ease long scrolls instead of jumping line by line.",
        help: "Jump-to-section navigation stays controlled either way.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "scroll wheel trackpad"
      },

      /* ---------- Appearance / Input and spellcheck ---------- */
      "appearance.keybindings": {
        id: "appearance.keybindings",
        label: "Keybinding style",
        description: "The shortcut vocabulary used across the app.",
        help: "Custom opens the keymap editor; individual conflicts are listed under Commands.",
        type: "select", value: "standard", defaultValue: "standard",
        options: [
          { value: "standard", label: "Standard" },
          { value: "editor-style", label: "Editor style" },
          { value: "custom", label: "Custom" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "shortcuts hotkeys keyboard"
      },
      "appearance.check-spelling": {
        id: "appearance.check-spelling",
        label: "Check spelling",
        description: "Underline likely misspellings in prose you write.",
        help: "Applies to chat, planning, and settings text fields. Code, paths, and identifiers are skipped. Nothing is ever replaced automatically.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "spellcheck typo underline writing"
      },
      "appearance.spelling-language": {
        id: "appearance.spelling-language",
        label: "Spelling language",
        description: "The language used to check your prose.",
        help: "Automatic follows the dominant language of the field you are typing in.",
        type: "select", value: "automatic", defaultValue: "automatic",
        options: [
          { value: "automatic", label: "Automatic" },
          { value: "en", label: "English" },
          { value: "de", label: "German" },
          { value: "fr", label: "French" }
        ],
        state: "auto", source: "Default", scope: ["global"], exposure: "standard",
        search: "dictionary locale words"
      },
      "appearance.dictionary-source": {
        id: "appearance.dictionary-source",
        label: "Dictionary source",
        description: "Where spellcheck dictionaries come from.",
        help: "Automatic prefers the OS spellcheck service and falls back to the built-in local dictionaries.",
        type: "select", value: "automatic", defaultValue: "automatic",
        options: [
          { value: "automatic", label: "Automatic" },
          { value: "system-only", label: "System dictionaries only" },
          { value: "local-only", label: "Built-in dictionaries only" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "advanced",
        search: "hunspell os service backend"
      },
      "appearance.check-technical-prose": {
        id: "appearance.check-technical-prose",
        label: "Check technical prose",
        description: "Also check release notes, README drafts, and spec text.",
        help: "Off keeps spellcheck focused on conversational writing.",
        type: "toggle", value: false, defaultValue: false,
        state: "default", source: "Default", scope: ["global"], exposure: "advanced",
        search: "docs readme spec jargon"
      },
      "appearance.underline-unknown-names": {
        id: "appearance.underline-unknown-names",
        label: "Underline unknown names",
        description: "Mark capitalized words that are in no dictionary.",
        help: "Off avoids noisy underlines on project codenames and product names.",
        type: "toggle", value: false, defaultValue: false,
        state: "default", source: "Default", scope: ["global"], exposure: "advanced",
        search: "proper nouns codenames"
      },

      /* ---------- Providers / Accounts and connections ---------- */
      "providers.account-switch-scope": {
        id: "providers.account-switch-scope",
        label: "Account changes apply to",
        description: "What happens when you pick a different account on a provider.",
        help: "Future requests only is the safe default: a request already in flight always keeps the account it started with.",
        type: "segmented", value: "future-requests", defaultValue: "future-requests",
        options: [
          { value: "future-requests", label: "Future requests only" },
          { value: "future-and-new-threads", label: "Future requests and new threads" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "switch profile migration in-flight"
      },
      "providers.sticky-sessions": {
        id: "providers.sticky-sessions",
        label: "Keep threads on their starting account",
        description: "A thread stays on the account it began with, even if you switch elsewhere.",
        help: "Turn this off to let long threads ride along with global account switches.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "sticky session affinity pin"
      },
      "providers.reconnect-on-launch": {
        id: "providers.reconnect-on-launch",
        label: "Reconnect installed tools on launch",
        description: "Re-verify CLI profiles and server connections when Puppet Master starts.",
        help: "Recommended so stale sign-ins surface before you depend on them.",
        type: "toggle", value: true, defaultValue: false, recommendedValue: true,
        state: "recommended", source: "Recommended", scope: ["global"], exposure: "standard",
        search: "startup verify cli health"
      },

      /* ---------- Providers / Models ---------- */
      "providers.catalog-refresh": {
        id: "providers.catalog-refresh",
        label: "Model catalog refresh",
        description: "How often catalogs such as models.dev are re-checked in the background.",
        help: "A failed refresh keeps the last-known-good catalog; your model list never disappears while refreshing.",
        type: "select", value: "daily", defaultValue: "daily",
        options: [
          { value: "hourly", label: "Hourly" },
          { value: "daily", label: "Daily" },
          { value: "weekly", label: "Weekly" },
          { value: "manual", label: "Manual only" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "models.dev update stale revalidate"
      },
      "providers.show-hidden-models": {
        id: "providers.show-hidden-models",
        label: "Show hidden models",
        description: "Include models you hid when browsing provider catalogs.",
        help: "Hidden models stay unavailable to routing either way.",
        type: "toggle", value: false, defaultValue: false,
        state: "default", source: "Default", scope: ["global"], exposure: "advanced",
        search: "visibility unhide browse"
      },
      "providers.capability-probes": {
        id: "providers.capability-probes",
        label: "Run safe capability probes",
        description: "Send one tiny test request per model to verify tools, vision, and structured output claims.",
        help: "Probes are small but real requests, so they count toward usage.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        reconnectRequired: true,
        effect: { kind: "cost", note: "Probes make one small request per model on each refresh." },
        search: "verify tools vision structured output evidence"
      },

      /* ---------- Providers / Agent roles ---------- */
      "providers.planning-quality-guard": {
        id: "providers.planning-quality-guard",
        label: "Protect planning conversations from weak routes",
        description: "PRD Builder and Planning Wizard discussion always uses a high-quality conversational route.",
        help: "Background extraction and classification may use cheaper routes; user-facing planning never silently downgrades.",
        type: "toggle", value: true, defaultValue: false, recommendedValue: true,
        state: "recommended", source: "Recommended", scope: ["global"], exposure: "standard",
        search: "prd wizard quality downgrade guard"
      },
      "providers.verifier-route": {
        id: "providers.verifier-route",
        label: "Verifier route",
        description: "The model route that audits work before it is marked done.",
        help: "Verification stays optional until you choose a route. Pick any provider with tool support.",
        type: "select", value: "not-configured", defaultValue: "not-configured",
        options: [
          { value: "not-configured", label: "Not configured" },
          { value: "anthropic-sonnet", label: "Claude Sonnet (Anthropic)" },
          { value: "copilot-mini", label: "GPT-5 Mini (GitHub Copilot)" },
          { value: "local-qwen", label: "Qwen 3 32B (Local server)" }
        ],
        state: "not-configured", source: "Default", scope: ["global"], exposure: "standard",
        search: "audit review done certification"
      },
      "providers.low-usage-behavior": {
        id: "providers.low-usage-behavior",
        label: "When a provider runs low",
        description: "The default reaction when an included allowance is nearly exhausted.",
        help: "Each provider can override this with its own supported choices.",
        type: "select", value: "ask-each-time", defaultValue: "ask-each-time",
        options: [
          { value: "ask-each-time", label: "Ask each time" },
          { value: "switch-automatically", label: "Switch to the next provider" },
          { value: "stop-and-wait", label: "Stop and wait for the reset" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "exhaustion budget fallback continuation"
      },

      /* ---------- Providers / Routing and priority ---------- */
      "providers.route-priority-mode": {
        id: "providers.route-priority-mode",
        label: "Route priority",
        description: "Whether provider order is yours or adjusted by live health.",
        help: "Automatic demotes routes that are failing or exhausted.",
        type: "segmented", value: "manual", defaultValue: "manual",
        options: [
          { value: "manual", label: "Manual order" },
          { value: "automatic", label: "Automatic by health" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "order failover health"
      },
      "providers.use-next-on-exhaust": {
        id: "providers.use-next-on-exhaust",
        label: "Use the next provider when one runs out",
        description: "Allow automatic failover down the priority list when a route exhausts.",
        help: "Off means Puppet Master stops and asks instead.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "fallback continuation allowance"
      },
      "providers.cross-provider-fallback": {
        id: "providers.cross-provider-fallback",
        label: "Allow mid-thread provider switches",
        description: "Let a thread continue on a different provider after a failure.",
        help: "Off keeps each thread on one provider for consistent behavior.",
        type: "toggle", value: false, defaultValue: false,
        state: "default", source: "Default", scope: ["global"], exposure: "advanced",
        search: "thread continuity failover handoff"
      },

      /* ---------- Permissions / Approvals ---------- */
      "permissions.default-approval": {
        id: "permissions.default-approval",
        label: "Default approval for risky actions",
        description: "The baseline for actions like writing files or running commands.",
        help: "Ask each time is the safest baseline; FileSafe still guards protected writes either way.",
        type: "select", value: "ask-each-time", defaultValue: "ask-each-time",
        options: [
          { value: "ask-each-time", label: "Ask each time" },
          { value: "allow-for-session", label: "Allow for this session" },
          { value: "allow-always", label: "Allow always" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        effect: { kind: "safety", note: "Loosening this lets agents act without confirmation." },
        search: "permission prompt confirm write execute"
      },
      "permissions.approval-duration": {
        id: "permissions.approval-duration",
        label: "Approval duration",
        description: "How long a granted approval lasts.",
        help: "Persistent grants are listed in the approval log and can be revoked anytime.",
        type: "select", value: "session", defaultValue: "once",
        options: [
          { value: "once", label: "Once" },
          { value: "session", label: "This session" },
          { value: "persistent", label: "Persistent for this project" }
        ],
        state: "custom", source: "Project settings", scope: ["project", "global"], exposure: "standard",
        search: "grant remember revoke duration"
      },
      "permissions.auto-approve-reads": {
        id: "permissions.auto-approve-reads",
        label: "Auto-approve read-only tools",
        description: "Let read-only tools run without asking.",
        help: "Writes and commands always follow the approval settings above.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "read search list safe"
      },

      /* ---------- Permissions / FileSafe ---------- */
      "permissions.filesafe-enabled": {
        id: "permissions.filesafe-enabled",
        label: "FileSafe protected writes",
        description: "Route every agent file write through FileSafe staging and review.",
        help: "Managed by your organization, so it cannot be turned off here.",
        type: "toggle", value: true, defaultValue: true,
        state: "managed", source: "Managed by organization", scope: ["global"], exposure: "managed",
        managedReason: "Your organization requires FileSafe for all projects.",
        search: "write protection staging review"
      },
      "permissions.filesafe-mode": {
        id: "permissions.filesafe-mode",
        label: "FileSafe sandbox coverage",
        description: "How much of the workspace FileSafe currently protects.",
        help: "Partial coverage leaves build output directories outside the sandbox. Complete setup to close the gap.",
        type: "select", value: "partial", defaultValue: "full",
        options: [
          { value: "full", label: "Full workspace" },
          { value: "partial", label: "Partial (setup incomplete)" },
          { value: "off", label: "Off" }
        ],
        state: "custom", source: "Project settings", scope: ["project"], exposure: "standard",
        effect: { kind: "safety", note: "Partial coverage lets agents write outside the sandbox in some folders." },
        search: "coverage gap incomplete setup"
      },
      "permissions.filesafe-extra-paths": {
        id: "permissions.filesafe-extra-paths",
        label: "Paths FileSafe may write without review",
        description: "Additional directories exempt from FileSafe staging.",
        help: "When not configured, every write goes through staging.",
        type: "text", value: "not-configured", defaultValue: "not-configured",
        state: "not-configured", source: "Default", scope: ["project"], exposure: "advanced",
        search: "exempt allowlist directories"
      },

      /* ---------- Permissions / Sandboxes ---------- */
      "permissions.sandbox-network": {
        id: "permissions.sandbox-network",
        label: "Network access inside sandboxes",
        description: "What sandboxed agents and tools can reach over the network.",
        help: "Allowlisted permits only the package registries and endpoints you approved.",
        type: "select", value: "allowlisted", defaultValue: "allowlisted",
        options: [
          { value: "blocked", label: "Blocked" },
          { value: "allowlisted", label: "Allowlisted only" },
          { value: "open", label: "Open" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        effect: { kind: "safety", note: "Open lets sandboxed code contact any host." },
        search: "egress firewall isolation"
      },
      "permissions.sandbox-image": {
        id: "permissions.sandbox-image",
        label: "Sandbox base image",
        description: "The container image sandboxes start from.",
        help: "Auto picks the image matching your project's toolchain.",
        type: "text", value: "auto", defaultValue: "auto",
        state: "auto", source: "Default", scope: ["global"], exposure: "advanced",
        restartRequired: true,
        search: "container docker rootfs"
      },
      "permissions.sandbox-keep": {
        id: "permissions.sandbox-keep",
        label: "Keep sandboxes after a run",
        description: "Retain sandbox containers for inspection after a Goal run finishes.",
        help: "Kept sandboxes consume disk until you discard them.",
        type: "toggle", value: false, defaultValue: false,
        state: "default", source: "Default", scope: ["global"], exposure: "advanced",
        search: "debug inspect retain containers"
      },
      "permissions.sandbox-gpu": {
        id: "permissions.sandbox-gpu",
        label: "GPU access in sandboxes",
        description: "Let sandboxed runs use a graphics or compute GPU.",
        help: "Unavailable on this machine because no supported GPU was detected.",
        type: "toggle", value: false, defaultValue: false,
        state: "unavailable", source: "System detection", scope: ["global"], exposure: "unavailable",
        unavailableReason: "No supported GPU was detected on this machine.",
        search: "cuda metal compute acceleration"
      },

      /* ---------- Code / Editor ---------- */
      "code.editor-font-size": {
        id: "code.editor-font-size",
        label: "Editor font size",
        description: "Text size in code editors.",
        help: "Interface text has its own size setting under Appearance.",
        type: "slider", value: 14, defaultValue: 14, min: 10, max: 24, unit: "px",
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "code text zoom"
      },
      "code.editor-tab-size": {
        id: "code.editor-tab-size",
        label: "Tab size",
        description: "Spaces per indentation level in the editor.",
        help: "Inherited from your global settings; project files with their own convention still win.",
        type: "number", value: 2, defaultValue: 4, min: 1, max: 8,
        state: "inherited", source: "Global settings", scope: ["project", "global"], exposure: "standard",
        search: "indent spaces whitespace"
      },
      "code.format-on-save": {
        id: "code.format-on-save",
        label: "Format on save",
        description: "Run the active formatter whenever you save a file.",
        help: "The formatter is the one chosen under Languages.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "prettier formatter save hook"
      },

      /* ---------- Code / Terminal ---------- */
      "code.terminal-profile": {
        id: "code.terminal-profile",
        label: "Default terminal profile",
        description: "The profile new terminal tabs start with.",
        help: "The Work profile is partially set up — it inherits what it lacks from Default.",
        type: "select", value: "default-zsh", defaultValue: "default-zsh",
        options: [
          { value: "default-zsh", label: "Default (zsh)" },
          { value: "work", label: "Work" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "shell profile tabs"
      },
      "code.terminal-font-size": {
        id: "code.terminal-font-size",
        label: "Terminal font size",
        description: "Text size in integrated terminals.",
        help: "Profiles can override this individually.",
        type: "slider", value: 13, defaultValue: 13, min: 10, max: 20, unit: "px",
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "console text zoom"
      },
      "code.terminal-scrollback": {
        id: "code.terminal-scrollback",
        label: "Terminal scrollback",
        description: "Lines of output each terminal keeps.",
        help: "You asked for 50,000 lines; the managed memory policy caps it at 10,000.",
        type: "number", value: 50000, defaultValue: 10000, min: 1000, max: 100000, unit: "lines",
        state: "effective-differs", source: "Project settings", scope: ["project", "global"], exposure: "standard",
        effectiveValue: 10000, effectiveReason: "Capped by the managed memory policy",
        search: "history buffer output"
      },

      /* ---------- Code / Shell ---------- */
      "code.shell-path": {
        id: "code.shell-path",
        label: "Default shell",
        description: "The shell used by new terminals and run tasks.",
        help: "An absolute path to a shell binary on this machine.",
        type: "path", value: "/bin/zsh", defaultValue: "/bin/zsh",
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "zsh bash fish binary"
      },
      "code.shell-startup-command": {
        id: "code.shell-startup-command",
        label: "Shell startup command",
        description: "A command run at the start of every new terminal.",
        help: "Not configured, so terminals open straight at the prompt.",
        type: "text", value: "not-configured", defaultValue: "not-configured",
        state: "not-configured", source: "Default", scope: ["global"], exposure: "standard",
        search: "rc init script greeting"
      },
      "code.shell-env-policy": {
        id: "code.shell-env-policy",
        label: "Terminal environment",
        description: "Which environment variables new terminals receive.",
        help: "Inherit passes the app's environment through unchanged.",
        type: "select", value: "inherit", defaultValue: "inherit",
        options: [
          { value: "inherit", label: "Inherit app environment" },
          { value: "clean", label: "Start clean" },
          { value: "custom", label: "Custom list" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "variables path env"
      },

      /* ---------- Code / Languages ---------- */
      "code.lsp-autostart": {
        id: "code.lsp-autostart",
        label: "Start language servers automatically",
        description: "Launch a language server when you open a supported file.",
        help: "Restart required so running servers are replaced consistently.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        restartRequired: true,
        search: "lsp intellisense launch"
      },
      "code.formatting-owner": {
        id: "code.formatting-owner",
        label: "Formatting owner",
        description: "Who wins when the editor and a language server both offer formatting.",
        help: "Ask each time surfaces the conflict instead of picking silently.",
        type: "select", value: "lsp", defaultValue: "lsp",
        options: [
          { value: "lsp", label: "Language server" },
          { value: "editor", label: "Editor" },
          { value: "ask", label: "Ask each time" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "prettier conflict owner"
      },
      "code.diagnostics-verbosity": {
        id: "code.diagnostics-verbosity",
        label: "Diagnostics verbosity",
        description: "How much language-server feedback surfaces in Problems.",
        help: "Errors and warnings is the balanced choice.",
        type: "select", value: "errors-warnings", defaultValue: "errors-warnings",
        options: [
          { value: "errors-only", label: "Errors only" },
          { value: "errors-warnings", label: "Errors and warnings" },
          { value: "everything", label: "Everything, including hints" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "advanced",
        search: "problems hints squiggles"
      },

      /* ---------- Context / History ---------- */
      "context.use-previous-chats": {
        id: "context.use-previous-chats",
        label: "Use relevant previous chats automatically",
        description: "Let the assistant pull short excerpts from earlier threads when they help.",
        help: "Only relevant excerpts are sent, never whole transcripts.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        effect: { kind: "privacy", note: "Excerpts from past threads may be sent to your provider." },
        search: "history recall earlier threads"
      },
      "context.history-retention": {
        id: "context.history-retention",
        label: "Keep thread history for",
        description: "How long completed threads stay searchable.",
        help: "Older threads are archived and leave the searchable index.",
        type: "select", value: "90-days", defaultValue: "90-days",
        options: [
          { value: "30-days", label: "30 days" },
          { value: "90-days", label: "90 days" },
          { value: "1-year", label: "1 year" },
          { value: "forever", label: "Forever" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "retention archive delete"
      },
      "context.use-logs": {
        id: "context.use-logs",
        label: "Use relevant logs automatically",
        description: "Let agents consult recent run logs when debugging.",
        help: "Logs can contain paths and command output from your machine.",
        type: "toggle", value: false, defaultValue: false,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        effect: { kind: "privacy", note: "Log excerpts may include local paths and command output." },
        search: "diagnostics runtime output"
      },

      /* ---------- Context / Assistant memory ---------- */
      "context.memory-enabled": {
        id: "context.memory-enabled",
        label: "Assistant memory",
        description: "Remember evidence-backed Gists across sessions.",
        help: "Reconnect required so the memory index reloads cleanly.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        reconnectRequired: true,
        search: "gists remember learn"
      },
      "context.memory-review": {
        id: "context.memory-review",
        label: "Review new memories before they are used",
        description: "Hold freshly learned Gists as awaiting review until you verify them.",
        help: "Recommended: unreviewed memories can otherwise influence answers immediately.",
        type: "toggle", value: true, defaultValue: false, recommendedValue: true,
        state: "recommended", source: "Recommended", scope: ["global"], exposure: "standard",
        search: "verify approve gists gate"
      },
      "context.memory-half-life": {
        id: "context.memory-half-life",
        label: "Memory half-life",
        description: "How quickly unused memories fade from active context.",
        help: "Fading means a memory leaves the active set — it is not deleted or treated as false.",
        type: "slider", value: 45, defaultValue: 45, min: 7, max: 180, unit: "days",
        state: "default", source: "Default", scope: ["global"], exposure: "advanced",
        search: "decay fade recall retention"
      },

      /* ---------- Context / Instructions ---------- */
      "context.include-project-instructions": {
        id: "context.include-project-instructions",
        label: "Include scoped project instructions",
        description: "Admit the AGENTS.md chain that applies to the current folder.",
        help: "Scopes merge by precedence: user, then project, then folder — the nearest scope wins.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", scope: ["project", "global"], exposure: "standard",
        search: "agents md instructions precedence"
      },
      "context.include-handoff": {
        id: "context.include-handoff",
        label: "Include parent-agent handoff",
        description: "Give child agents the handoff note from the agent that spawned them.",
        help: "Handoffs keep children oriented without copying the whole parent context.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "subagent spawn briefing"
      },
      "context.include-journal": {
        id: "context.include-journal",
        label: "Include current attempt journal",
        description: "Admit the running journal of attempts and failures for this task.",
        help: "Off saves context space but hides why earlier attempts failed.",
        type: "toggle", value: false, defaultValue: false,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "attempts failures retry log"
      },

      /* ---------- Context / Compaction ---------- */
      "context.compaction-auto": {
        id: "context.compaction-auto",
        label: "Compact automatically when needed",
        description: "Summarize older turns when a conversation nears the context limit.",
        help: "Compaction keeps the conversation going instead of failing at the limit.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "summarize truncate limit"
      },
      "context.compaction-threshold": {
        id: "context.compaction-threshold",
        label: "Compact when context reaches",
        description: "The fill level that triggers automatic compaction.",
        help: "Lower values compact earlier and keep more headroom for long replies.",
        type: "slider", value: 80, defaultValue: 80, min: 50, max: 95, unit: "%",
        state: "default", source: "Default", scope: ["global"], exposure: "advanced",
        search: "threshold limit trigger"
      },
      "context.compaction-safeguard": {
        id: "context.compaction-safeguard",
        label: "Keep a verification summary when compacting",
        description: "Preserve a checklist of verified facts and open questions across compaction.",
        help: "Recommended: without it, compaction can quietly drop confirmed details.",
        type: "toggle", value: false, defaultValue: false, recommendedValue: true,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "protect facts summary checklist"
      },
      "context.warn-route-changes": {
        id: "context.warn-route-changes",
        label: "Warn before material context or cache route changes",
        description: "Ask before changes that would invalidate cached context mid-thread.",
        help: "Cache invalidation can raise cost and latency for the next turns.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        effect: { kind: "cost", note: "Suppressed warnings can lead to expensive cache rebuilds." },
        search: "cache prompt prefix invalidation"
      },

      /* ---------- Planning / PRD ---------- */
      "planning.conversation-route": {
        id: "planning.conversation-route",
        label: "Planning conversation route",
        description: "The route that powers PRD Builder and Planning Wizard discussions.",
        help: "Defaults to the high-quality main assistant route; only qualified overrides are listed.",
        type: "select", value: "main-assistant", defaultValue: "main-assistant",
        options: [
          { value: "main-assistant", label: "Follow the main assistant route" },
          { value: "anthropic-opus", label: "Claude Opus (Anthropic)" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "prd wizard requirements architecture"
      },
      "planning.prd-autosave": {
        id: "planning.prd-autosave",
        label: "Autosave planning documents",
        description: "Save PRD and plan drafts as you edit.",
        help: "Drafts live in the project's Plans folder.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", scope: ["project", "global"], exposure: "standard",
        search: "draft save recovery"
      },
      "planning.evidence-strength": {
        id: "planning.evidence-strength",
        label: "Default evidence strength",
        description: "How much proof a plan step needs before it counts as done.",
        help: "Certified asks for test output plus an auditor pass.",
        type: "select", value: "standard", defaultValue: "standard",
        options: [
          { value: "light", label: "Light" },
          { value: "standard", label: "Standard" },
          { value: "certified", label: "Certified" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "proof certification audit"
      },

      /* ---------- Planning / Goal Mode ---------- */
      "planning.goal-concurrency": {
        id: "planning.goal-concurrency",
        label: "Goal worker ceiling",
        description: "The most Goal workers Puppet Master may run at once.",
        help: "A configured ceiling, not a promise — the Orchestrator makes the live call from current capacity.",
        type: "number", value: 3, defaultValue: 2, min: 1, max: 8,
        state: "effective-differs", source: "Project settings", scope: ["project", "global"], exposure: "standard",
        effectiveValue: 2, effectiveReason: "Current provider capacity sustains 2 concurrent workers",
        search: "parallel agents waves limit"
      },
      "planning.goal-spend-guard": {
        id: "planning.goal-spend-guard",
        label: "Spend guard per Goal run",
        description: "A soft budget ceiling for one Goal run.",
        help: "Auto tracks your Usage projections instead of a fixed number.",
        type: "text", value: "auto", defaultValue: "auto",
        state: "auto", source: "Default", scope: ["global"], exposure: "standard",
        search: "budget cost limit dollars"
      },
      "planning.goal-checkpoints": {
        id: "planning.goal-checkpoints",
        label: "Checkpoint and compact automatically",
        description: "Save resumable checkpoints during long Goal runs.",
        help: "Checkpoints are what let interrupted runs resume.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "resume recovery snapshot"
      },

      /* ---------- Planning / Testing ---------- */
      "planning.test-visibility": {
        id: "planning.test-visibility",
        label: "Show automated test runs",
        description: "When automated test output appears in the thread.",
        help: "On failure keeps passing runs quiet.",
        type: "select", value: "on-failure", defaultValue: "on-failure",
        options: [
          { value: "always", label: "Always" },
          { value: "on-failure", label: "On failure" },
          { value: "never", label: "Never" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "output noise pytest"
      },
      "planning.automated-debugging": {
        id: "planning.automated-debugging",
        label: "Allow automated debugging sessions",
        description: "Let agents run interactive debuggers while repairing failures.",
        help: "Debugging sessions spend extra model turns stepping through code.",
        type: "toggle", value: false, defaultValue: false,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        effect: { kind: "cost", note: "Debug sessions run extra model turns against your allowance." },
        search: "breakpoint step repair"
      },
      "planning.test-port-policy": {
        id: "planning.test-port-policy",
        label: "Test port collisions",
        description: "What happens when two runs want the same dev-server port.",
        help: "Auto-assign picks a free port and notes it in the run log.",
        type: "select", value: "auto-assign", defaultValue: "auto-assign",
        options: [
          { value: "ask", label: "Ask each time" },
          { value: "auto-assign", label: "Auto-assign a free port" },
          { value: "block", label: "Block the second run" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "advanced",
        search: "dev server collision listen"
      },

      /* ---------- Planning / Verification ---------- */
      "planning.require-verification": {
        id: "planning.require-verification",
        label: "Require verification before done",
        description: "Work must pass the verifier route before it is marked complete.",
        help: "Needs a verifier route — none is configured yet.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "audit complete gate"
      },
      "planning.audit-strength": {
        id: "planning.audit-strength",
        label: "Audit strength",
        description: "How deep verification audits go.",
        help: "Deep audits re-run the test suite and inspect the diff line by line.",
        type: "select", value: "deep", defaultValue: "standard",
        options: [
          { value: "quick", label: "Quick audit" },
          { value: "standard", label: "Standard audit" },
          { value: "deep", label: "Deep audit" }
        ],
        state: "custom", source: "Project settings", scope: ["project", "global"], exposure: "standard",
        search: "review depth thorough"
      },
      "planning.verification-reserve": {
        id: "planning.verification-reserve",
        label: "Reserve capacity for verification and repair",
        description: "Hold back one worker slot so verification is never starved by implementation.",
        help: "Without a reserve, big runs can spend the whole budget on implementation.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", scope: ["global"], exposure: "advanced",
        search: "headroom slot synthesis"
      },

      /* ---------- Collaboration / Git ---------- */
      "collaboration.worktree-provisioning": {
        id: "collaboration.worktree-provisioning",
        label: "Automatic worktrees for agents",
        description: "Give each agent run its own git worktree.",
        help: "Ask each time keeps you in the loop for small tasks.",
        type: "select", value: "ask", defaultValue: "ask",
        options: [
          { value: "automatic", label: "Automatic" },
          { value: "ask", label: "Ask each time" },
          { value: "never", label: "Never" }
        ],
        state: "default", source: "Default", scope: ["project", "global"], exposure: "standard",
        search: "isolation branch git"
      },
      "collaboration.worktree-cleanup": {
        id: "collaboration.worktree-cleanup",
        label: "Clean up merged worktrees",
        description: "When merged agent worktrees are removed.",
        help: "Cleanup never deletes unmerged work.",
        type: "select", value: "after-7-days", defaultValue: "after-7-days",
        options: [
          { value: "after-merge", label: "Right after merge" },
          { value: "after-7-days", label: "After 7 days" },
          { value: "never", label: "Never" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "prune delete disk"
      },
      "collaboration.protect-main": {
        id: "collaboration.protect-main",
        label: "Require approval to commit on main",
        description: "Agents must ask before committing directly to the main branch.",
        help: "Worktree branches never need this approval.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", scope: ["project", "global"], exposure: "standard",
        effect: { kind: "safety", note: "Turning off lets agents commit to main unprompted." },
        search: "branch protection commit"
      },

      /* ---------- Collaboration / Crew ---------- */
      "collaboration.crew-route-policy": {
        id: "collaboration.crew-route-policy",
        label: "Default Crew route policy",
        description: "Whether Crew members stick to their listed candidate models.",
        help: "Adaptive may substitute a healthy route when a candidate is exhausted.",
        type: "segmented", value: "adaptive", defaultValue: "adaptive",
        options: [
          { value: "strict", label: "Strict" },
          { value: "adaptive", label: "Adaptive" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "substitution candidates fallback"
      },
      "collaboration.crew-max-members": {
        id: "collaboration.crew-max-members",
        label: "Crew size ceiling",
        description: "The most members a Crew template may request.",
        help: "Requested is not effective — the Orchestrator queues what capacity cannot run.",
        type: "number", value: 5, defaultValue: 4, min: 2, max: 8,
        state: "effective-differs", source: "Project settings", scope: ["project", "global"], exposure: "standard",
        effectiveValue: 2, effectiveReason: "Current capacity admits 2 concurrent members; the rest queue in waves",
        search: "members waves parallel"
      },
      "collaboration.crew-isolation": {
        id: "collaboration.crew-isolation",
        label: "Crew isolation",
        description: "How Crew members share the filesystem.",
        help: "Worktree gives every member its own checkout.",
        type: "select", value: "worktree", defaultValue: "worktree",
        options: [
          { value: "worktree", label: "Worktree per member" },
          { value: "shared", label: "Shared directory" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "checkout filesystem sharing"
      },

      /* ---------- Collaboration / Subagents ---------- */
      "collaboration.subagent-depth": {
        id: "collaboration.subagent-depth",
        label: "Subagent nesting depth",
        description: "How many levels of child agents a run may spawn.",
        help: "Deeper nesting is powerful but harder to supervise.",
        type: "number", value: 2, defaultValue: 2, min: 1, max: 3,
        state: "default", source: "Default", scope: ["global"], exposure: "advanced",
        search: "children hierarchy spawn"
      },
      "collaboration.subagent-inherit-grants": {
        id: "collaboration.subagent-inherit-grants",
        label: "Children may inherit scoped grants",
        description: "Let a child agent reuse approvals granted to its parent within the same scope.",
        help: "Off is safer: every child asks on its own.",
        type: "toggle", value: false, defaultValue: false,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        effect: { kind: "safety", note: "Inheritance widens who can act without asking." },
        search: "approval propagation child"
      },
      "collaboration.cross-project-access": {
        id: "collaboration.cross-project-access",
        label: "Cross-project read access",
        description: "Let agents read files from other projects.",
        help: "Off by default. Named pairs allow read-only access between two specific projects.",
        type: "select", value: "off", defaultValue: "off",
        options: [
          { value: "off", label: "Off" },
          { value: "ask", label: "Ask each time" },
          { value: "named-pairs", label: "Named project pairs" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        effect: { kind: "privacy", note: "Read access can expose code from your other projects." },
        search: "workspace boundary read write"
      },

      /* ---------- Tools / MCP ---------- */
      "tools.mcp-tool-exposure": {
        id: "tools.mcp-tool-exposure",
        label: "MCP tool exposure",
        description: "How much of each server's tool list enters model context.",
        help: "Progressive loads tool schemas only when they become relevant.",
        type: "select", value: "progressive", defaultValue: "progressive",
        options: [
          { value: "eager", label: "Eager — everything up front" },
          { value: "lazy", label: "Lazy — on demand" },
          { value: "progressive", label: "Progressive — as relevant" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "schemas disclosure context"
      },
      "tools.mcp-approval-policy": {
        id: "tools.mcp-approval-policy",
        label: "MCP approval policy",
        description: "How calls into external servers are approved.",
        help: "Reconnect required: policy changes apply to fresh server sessions.",
        type: "select", value: "session", defaultValue: "session",
        options: [
          { value: "ask-each-time", label: "Ask each time" },
          { value: "session", label: "Remember for this session" },
          { value: "persistent", label: "Persistent per server" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        reconnectRequired: true,
        search: "grant server consent"
      },
      "tools.mcp-reconnect": {
        id: "tools.mcp-reconnect",
        label: "Reconnect MCP servers on launch",
        description: "Restart configured servers when Puppet Master starts.",
        help: "Off leaves servers stopped until something calls them.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "startup servers restart"
      },

      /* ---------- Tools / Skills and plugins ---------- */
      "tools.skills-auto-update": {
        id: "tools.skills-auto-update",
        label: "Update trusted skills automatically",
        description: "Pull new versions of skills you marked trusted.",
        help: "Untrusted skills always update manually.",
        type: "toggle", value: false, defaultValue: false,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "registry versions"
      },
      "tools.allow-untrusted-skills": {
        id: "tools.allow-untrusted-skills",
        label: "Allow untrusted skills",
        description: "Permit installing skills that have no trust record.",
        help: "Unavailable because your organization disabled untrusted skills.",
        type: "toggle", value: false, defaultValue: false,
        state: "unavailable", source: "Managed by organization", scope: ["global"], exposure: "unavailable",
        unavailableReason: "Your organization allows only trusted skills.",
        search: "install registry trust"
      },
      "tools.plugin-channel": {
        id: "tools.plugin-channel",
        label: "Plugin update channel",
        description: "Which plugin releases are offered to you.",
        help: "Beta plugins can break; failures land in the plugins list with a reason.",
        type: "select", value: "stable", defaultValue: "stable",
        options: [
          { value: "stable", label: "Stable" },
          { value: "beta", label: "Beta" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "extensions release"
      },

      /* ---------- Tools / Commands ---------- */
      "tools.shortcut-conflict-warning": {
        id: "tools.shortcut-conflict-warning",
        label: "Warn about shortcut conflicts",
        description: "Flag two commands bound to the same keys.",
        help: "The conflicting pair is listed in the Commands manager.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "keybinding collision duplicate"
      },
      "tools.command-palette-shortcut": {
        id: "tools.command-palette-shortcut",
        label: "Command palette shortcut",
        description: "The keys that open the command palette.",
        help: "Currently shared with a custom command — see the conflict in the Commands manager.",
        type: "text", value: "Ctrl+Shift+P", defaultValue: "Ctrl+Shift+P",
        state: "custom", source: "Global settings", scope: ["global"], exposure: "standard",
        search: "keybinding launch palette"
      },
      "tools.custom-commands": {
        id: "tools.custom-commands",
        label: "Custom commands",
        description: "Your own command entries, with optional shortcuts.",
        help: "Opens the Commands manager filtered to custom commands.",
        type: "action", value: "not-applicable", defaultValue: "not-applicable",
        actionLabel: "Manage custom commands",
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "macros user defined"
      },

      /* ---------- Tools / Web ---------- */
      "tools.web-fetch": {
        id: "tools.web-fetch",
        label: "Allow web fetching",
        description: "Let agents fetch pages you point them at.",
        help: "Fetching sends the URL (and only the URL) to the network.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        effect: { kind: "privacy", note: "Requested URLs leave your machine." },
        search: "http download page"
      },
      "tools.web-search-provider": {
        id: "tools.web-search-provider",
        label: "Web search",
        description: "Which search backend agents may use.",
        help: "The built-in index covers public documentation and general web results.",
        type: "select", value: "built-in", defaultValue: "built-in",
        options: [
          { value: "built-in", label: "Built-in index" },
          { value: "custom-endpoint", label: "Custom endpoint" },
          { value: "off", label: "Off" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "search engine backend"
      },
      "tools.web-extraction-route": {
        id: "tools.web-extraction-route",
        label: "Web extraction route",
        description: "The model route that turns fetched pages into clean text.",
        help: "Automatic picks a low-cost route; extraction never uses your planning route.",
        type: "select", value: "automatic", defaultValue: "automatic",
        options: [
          { value: "automatic", label: "Automatic" },
          { value: "main-assistant", label: "Main assistant route" },
          { value: "free-route", label: "Free route" }
        ],
        state: "auto", source: "Default", scope: ["global"], exposure: "standard",
        search: "readability clean text"
      },

      /* ---------- Media / Routes ---------- */
      "media.image-route": {
        id: "media.image-route",
        label: "Image generation route",
        description: "The provider that handles image requests.",
        help: "PM Image Suite is the connected image provider.",
        type: "select", value: "pm-image-suite", defaultValue: "pm-image-suite",
        options: [
          { value: "pm-image-suite", label: "PM Image Suite" },
          { value: "free-route", label: "Free image route" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "picture render provider"
      },
      "media.video-route": {
        id: "media.video-route",
        label: "Video generation route",
        description: "The provider that handles video requests.",
        help: "Not configured — connect a video provider in the Media manager.",
        type: "select", value: "not-configured", defaultValue: "not-configured",
        options: [
          { value: "not-configured", label: "Not configured" },
          { value: "vidcraft", label: "Vidcraft" }
        ],
        state: "not-configured", source: "Default", scope: ["global"], exposure: "standard",
        search: "clip animation provider"
      },
      "media.audio-route": {
        id: "media.audio-route",
        label: "Audio generation route",
        description: "The provider that handles voice and sound requests.",
        help: "Local Voice runs on this machine; nothing leaves it.",
        type: "select", value: "local-voice", defaultValue: "not-configured",
        options: [
          { value: "not-configured", label: "Not configured" },
          { value: "local-voice", label: "Local Voice" },
          { value: "cloud-voice", label: "Cloud Voice" }
        ],
        state: "custom", source: "Project settings", scope: ["project", "global"], exposure: "standard",
        search: "speech sound tts"
      },

      /* ---------- Media / Output ---------- */
      "media.output-format": {
        id: "media.output-format",
        label: "Image output format",
        description: "The file format generated images are saved in.",
        help: "Auto keeps the provider's native format.",
        type: "select", value: "auto", defaultValue: "auto",
        options: [
          { value: "auto", label: "Auto" },
          { value: "png", label: "PNG" },
          { value: "webp", label: "WebP" },
          { value: "jpeg", label: "JPEG" }
        ],
        state: "auto", source: "Default", scope: ["global"], exposure: "standard",
        search: "png webp jpeg file"
      },
      "media.output-location": {
        id: "media.output-location",
        label: "Media output folder",
        description: "Where generated media files are saved.",
        help: "A folder on this machine; created on first use.",
        type: "path", value: "~/Pictures/Puppet Master", defaultValue: "~/Pictures/Puppet Master",
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "save directory files"
      },
      "media.history-retention": {
        id: "media.history-retention",
        label: "Keep media history for",
        description: "How long generated media entries stay in history.",
        help: "Files on disk are never deleted by retention.",
        type: "select", value: "keep-all", defaultValue: "keep-all",
        options: [
          { value: "keep-all", label: "Keep all" },
          { value: "30-days", label: "30 days" },
          { value: "session-only", label: "This session only" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "log entries retention"
      },

      /* ---------- Media / Safety ---------- */
      "media.safety-policy": {
        id: "media.safety-policy",
        label: "Media safety policy",
        description: "The content policy applied to media generation.",
        help: "Standard blocks disallowed categories and logs filtered requests.",
        type: "select", value: "standard", defaultValue: "standard",
        options: [
          { value: "standard", label: "Standard" },
          { value: "strict", label: "Strict" },
          { value: "custom", label: "Custom" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        effect: { kind: "safety", note: "Custom policies must still meet provider minimums." },
        search: "content filter moderation"
      },
      "media.content-filtering": {
        id: "media.content-filtering",
        label: "Content filtering",
        description: "Block media requests that violate the active safety policy.",
        help: "Managed by your organization for all media routes.",
        type: "toggle", value: true, defaultValue: true,
        state: "managed", source: "Managed by organization", scope: ["global"], exposure: "managed",
        managedReason: "Your organization requires content filtering for media generation.",
        search: "moderation block policy"
      },
      "media.cost-route": {
        id: "media.cost-route",
        label: "Media cost route",
        description: "What media generation draws on first.",
        help: "Included plan uses your subscription allowance before any balance.",
        type: "select", value: "included-plan", defaultValue: "included-plan",
        options: [
          { value: "included-plan", label: "Included plan" },
          { value: "extra-balance", label: "Extra balance" },
          { value: "ask-each-time", label: "Ask each time" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "advanced",
        search: "billing allowance packs"
      },

      /* ---------- System / Health ---------- */
      "system.health-checks": {
        id: "system.health-checks",
        label: "Run health checks on launch",
        description: "Verify providers, servers, and indexes when Puppet Master starts.",
        help: "Failures surface as notices on the Settings home.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "verify startup diagnose"
      },
      "system.health-interval": {
        id: "system.health-interval",
        label: "Background health interval",
        description: "How often connections are re-checked while the app runs.",
        help: "Shorter intervals catch failures sooner but add small background traffic.",
        type: "select", value: "daily", defaultValue: "daily",
        options: [
          { value: "hourly", label: "Hourly" },
          { value: "daily", label: "Daily" },
          { value: "weekly", label: "Weekly" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "advanced",
        search: "poll frequency monitor"
      },
      "system.crash-reports": {
        id: "system.crash-reports",
        label: "Share crash reports",
        description: "Send anonymized crash dumps to help fix bugs.",
        help: "Reports exclude file contents and conversation text.",
        type: "toggle", value: false, defaultValue: false,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        effect: { kind: "privacy", note: "Reports include stack traces and machine specs." },
        search: "telemetry dumps anonymous"
      },

      /* ---------- System / Logs ---------- */
      "system.log-level": {
        id: "system.log-level",
        label: "Log level",
        description: "How much detail lands in the application log.",
        help: "Debug and Trace are for diagnosing a specific problem.",
        type: "select", value: "info", defaultValue: "info",
        options: [
          { value: "errors", label: "Errors only" },
          { value: "info", label: "Info" },
          { value: "debug", label: "Debug" },
          { value: "trace", label: "Trace" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "verbosity logging"
      },
      "system.log-retention": {
        id: "system.log-retention",
        label: "Keep logs for",
        description: "How long rotated log files are kept.",
        help: "Older logs are deleted automatically.",
        type: "select", value: "30-days", defaultValue: "30-days",
        options: [
          { value: "7-days", label: "7 days" },
          { value: "30-days", label: "30 days" },
          { value: "90-days", label: "90 days" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "rotation cleanup disk"
      },
      "system.export-logs": {
        id: "system.export-logs",
        label: "Export recent logs",
        description: "Bundle the last 24 hours of logs into a single file.",
        help: "The bundle stays on this machine until you share it.",
        type: "action", value: "not-applicable", defaultValue: "not-applicable",
        actionLabel: "Export logs",
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "download bundle support"
      },

      /* ---------- System / Backups ---------- */
      "system.auto-snapshots": {
        id: "system.auto-snapshots",
        label: "Automatic snapshots",
        description: "Take workspace snapshots before risky operations.",
        help: "Snapshots let you roll back an agent run that went wrong.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "restore point rollback"
      },
      "system.snapshot-frequency": {
        id: "system.snapshot-frequency",
        label: "Snapshot frequency",
        description: "How often idle-time snapshots are taken.",
        help: "Risky operations always take their own snapshot regardless.",
        type: "select", value: "daily", defaultValue: "daily",
        options: [
          { value: "hourly", label: "Hourly" },
          { value: "daily", label: "Daily" },
          { value: "weekly", label: "Weekly" }
        ],
        state: "default", source: "Default", scope: ["global"], exposure: "standard",
        search: "backup schedule interval"
      },
      "system.delete-snapshots-on-cleanup": {
        id: "system.delete-snapshots-on-cleanup",
        label: "Delete all snapshots on cleanup",
        description: "Remove every stored snapshot when disk cleanup runs.",
        help: "Risky: cleanup becomes unrecoverable — nothing remains to roll back to.",
        type: "toggle", value: false, defaultValue: false,
        state: "default", source: "Default", scope: ["global"], exposure: "expert",
        search: "risky destructive purge rollback"
      },

      /* ---------- System / Diagnostics ---------- */
      "system.diagnostic-overlay": {
        id: "system.diagnostic-overlay",
        label: "Show diagnostic overlay",
        description: "Display frame timing and memory pressure in a corner overlay.",
        help: "For performance investigation; not part of normal use.",
        type: "toggle", value: false, defaultValue: false,
        state: "default", source: "Default", scope: ["global"], exposure: "diagnostic",
        search: "fps memory hud"
      },
      "system.interaction-traces": {
        id: "system.interaction-traces",
        label: "Record interaction traces",
        description: "Capture input and render timing for support reproduction.",
        help: "Traces add noticeable overhead while recording.",
        type: "toggle", value: false, defaultValue: false,
        state: "default", source: "Default", scope: ["global"], exposure: "diagnostic",
        effect: { kind: "performance", note: "Recording adds overhead to every interaction." },
        search: "profile repro capture"
      },
      "system.export-diagnostics": {
        id: "system.export-diagnostics",
        label: "Export diagnostics bundle",
        description: "Collect versions, traces, and health state for support.",
        help: "Review the bundle before sending — it includes machine details.",
        type: "action", value: "not-applicable", defaultValue: "not-applicable",
        actionLabel: "Export bundle",
        state: "default", source: "Default", scope: ["global"], exposure: "diagnostic",
        search: "support report zip"
      },

      /* ---------- System / Advanced ---------- */
      "system.experimental-runtime": {
        id: "system.experimental-runtime",
        label: "Experimental runtime features",
        description: "Enable unfinished runtime capabilities under active development.",
        help: "Expect rough edges. Restart required to load the experimental build.",
        type: "toggle", value: false, defaultValue: false,
        state: "default", source: "Default", scope: ["global"], exposure: "expert",
        restartRequired: true,
        search: "preview unstable flags"
      },
      "system.feature-flags": {
        id: "system.feature-flags",
        label: "Edit feature flags",
        description: "Toggle individual runtime flags by name.",
        help: "No validation guardrails here — wrong flags can break the session.",
        type: "action", value: "not-applicable", defaultValue: "not-applicable",
        actionLabel: "Open flag editor",
        state: "default", source: "Default", scope: ["global"], exposure: "expert",
        search: "experiments toggles internal"
      },
      "system.telemetry-endpoint": {
        id: "system.telemetry-endpoint",
        label: "Telemetry endpoint",
        description: "The server anonymous telemetry is sent to.",
        help: "Unavailable here — your organization manages the endpoint.",
        type: "text", value: "https://telemetry.northwind.example", defaultValue: "https://telemetry.northwind.example",
        state: "unavailable", source: "Managed by organization", scope: ["global"], exposure: "unavailable",
        unavailableReason: "Managed by your organization; contact your admin to change it.",
        search: "analytics reporting server"
      },
      "system.factory-reset": {
        id: "system.factory-reset",
        label: "Reset all settings",
        description: "Restore every setting on this machine to its default.",
        help: "Risky: project overrides, personas choices, and routes are all lost.",
        type: "action", value: "not-applicable", defaultValue: "not-applicable",
        actionLabel: "Reset all settings",
        state: "default", source: "Default", scope: ["global"], exposure: "expert",
        search: "risky destructive wipe defaults"
      }
    },

    /* ==================================================================
       NOTICES — 3 attention (broken/disconnected/unsafe), 2 setup
       (continue onboarding), 1 recommended. One action each; optional
       quiet secondary. Targets deep-link into categories or managers.
       ================================================================== */
    notices: [
      {
        id: "notice-anthropic-signed-out",
        kind: "attention",
        headline: "The Anthropic CLI signed out",
        consequence: "Claude models are unavailable until you sign in again through the Claude CLI.",
        actionLabel: "Sign in again",
        secondaryLabel: "Not now",
        target: { category: "providers", sub: "connections", setting: null, manager: "providers", tab: "accounts" }
      },
      {
        id: "notice-filesafe-incomplete",
        kind: "attention",
        headline: "FileSafe sandbox coverage is incomplete",
        consequence: "Some build folders are outside the protected area, so agents can write there without review.",
        actionLabel: "Review coverage",
        target: { category: "permissions", sub: "filesafe", setting: "permissions.filesafe-mode", manager: null, tab: null }
      },
      {
        id: "notice-no-verifier",
        kind: "attention",
        headline: "No verifier route is configured",
        consequence: "Work can be marked done without an audit, even though verification is required.",
        actionLabel: "Choose a verifier route",
        target: { category: "providers", sub: "roles", setting: "providers.verifier-route", manager: null, tab: null }
      },
      {
        id: "notice-terminal-setup",
        kind: "setup",
        headline: "Finish setting up the Work terminal profile",
        consequence: "The profile inherits what it lacks from Default; four fields still need a decision.",
        actionLabel: "Continue setup",
        secondaryLabel: "Remind me later",
        target: { category: "code", sub: "terminal", setting: null, manager: "terminal", tab: "profiles" }
      },
      {
        id: "notice-media-setup",
        kind: "setup",
        headline: "Connect a media provider",
        consequence: "Video and audio requests have nowhere to go until a provider is connected.",
        actionLabel: "Open Media manager",
        secondaryLabel: "Not now",
        target: { category: "media", sub: "routes", setting: null, manager: "media", tab: "providers" }
      },
      {
        id: "notice-compaction-safeguard",
        kind: "recommended",
        headline: "Enable the compaction safeguard",
        consequence: "Without it, compacting a long conversation can quietly drop confirmed details.",
        actionLabel: "Enable safeguard",
        secondaryLabel: "Learn more",
        target: { category: "context", sub: "compaction", setting: "context.compaction-safeguard", manager: null, tab: null }
      }
    ],

    /* ==================================================================
       RECENTS — resume recent setup or changes.
       ================================================================== */
    recents: [
      {
        label: "Terminal profile: Work",
        target: { category: "code", sub: "terminal", setting: null, manager: "terminal", tab: "profiles" }
      },
      {
        label: "Claude Opus effort options",
        target: { category: "providers", sub: "models", setting: null, manager: "providers", tab: "models" }
      },
      {
        label: "Goal worker ceiling",
        target: { category: "planning", sub: "goal", setting: "planning.goal-concurrency", manager: null, tab: null }
      },
      {
        label: "Spellcheck dictionaries",
        target: { category: "appearance", sub: "input", setting: null, manager: "spellcheck", tab: "dictionaries" }
      }
    ],

    /* ==================================================================
       PROVIDERS — 7 families covering every required connection state.
       ================================================================== */
    providers: [
      /* 1. Anthropic — CLI-owned OAuth inside an isolated CLI profile,
            TWO accounts (Personal active, Work signed-in idle). */
      {
        id: "anthropic",
        name: "Anthropic",
        tagline: "Claude models through the Claude CLI's own sign-in",
        connectionGroup: "installed-tools",
        installState: "installed-signed-in",
        authModel: "cli-profile-oauth",
        authNote: "Sign-in is owned by the Claude CLI inside an isolated CLI profile. Puppet Master launches the native login and never sees your credentials.",
        accountSwitchNote: "Switching accounts affects future requests only. A request already in flight keeps the account it started with.",
        accounts: [
          {
            id: "personal",
            label: "Personal",
            identity: "jared@example.com",
            enabled: true,
            priority: 1,
            sticky: true,
            active: true,
            health: "ready",
            lastCatalogRefresh: "2026-08-04 21:14",
            lastSuccessfulGeneration: "2026-08-05 03:41",
            usagePressure: "low",
            resetAt: "2026-08-12 00:00"
          },
          {
            id: "work",
            label: "Work",
            identity: "jared@northwind.example",
            enabled: true,
            priority: 2,
            sticky: false,
            active: false,
            health: "signed-in-idle",
            lastCatalogRefresh: "2026-07-30 09:02",
            lastSuccessfulGeneration: "2026-07-28 17:55",
            usagePressure: "low",
            resetAt: "2026-08-12 00:00"
          }
        ],
        product: {
          plan: "Claude Pro",
          billingRoute: "Subscription through the Claude CLI profile"
        },
        models: [
          {
            id: "claude-opus",
            name: "Claude Opus",
            alias: "Opus",
            favorite: true,
            hidden: false,
            priority: 1,
            contextLimit: 200000,
            modalities: { in: ["text", "image"], out: ["text"] },
            capabilities: {
              tools: { state: "supported", evidence: "Observed in 41 working sessions", freshAsOf: "2026-08-04" },
              vision: { state: "supported", evidence: "Observed with image attachments", freshAsOf: "2026-08-02" },
              structuredOutput: { state: "likely", evidence: "Declared by the models.dev catalog", freshAsOf: "2026-08-04" }
            },
            fastMode: { supported: true, evidence: "Observed a successful Fast-mode generation on 2026-08-04" },
            effort: ["low", "medium", "high"]
          },
          {
            id: "claude-sonnet",
            name: "Claude Sonnet",
            alias: "daily driver",
            favorite: false,
            hidden: false,
            priority: 2,
            contextLimit: 200000,
            modalities: { in: ["text", "image"], out: ["text"] },
            capabilities: {
              tools: { state: "supported", evidence: "Provider discovery over the authenticated account", freshAsOf: "2026-08-01" },
              vision: { state: "supported", evidence: "Declared by the provider and observed once", freshAsOf: "2026-07-30" },
              structuredOutput: { state: "likely", evidence: "Declared by the models.dev catalog", freshAsOf: "2026-08-04" }
            },
            fastMode: { supported: false, evidence: "Not declared by the catalog or the provider" },
            effort: ["low", "medium", "high"]
          },
          {
            id: "claude-haiku",
            name: "Claude Haiku",
            alias: null,
            favorite: false,
            hidden: false,
            priority: 3,
            contextLimit: 200000,
            modalities: { in: ["text"], out: ["text"] },
            capabilities: {
              tools: { state: "unverified", evidence: "No evidence — the model is not usable on your plan", freshAsOf: "2026-08-04" },
              vision: { state: "unverified", evidence: "No evidence — the model is not usable on your plan", freshAsOf: "2026-08-04" },
              structuredOutput: { state: "unverified", evidence: "No evidence — the model is not usable on your plan", freshAsOf: "2026-08-04" }
            },
            fastMode: { supported: false, evidence: "Unknown while the model is unavailable" },
            effort: null,
            unavailableReason: "Not included in your plan"
          }
        ],
        routing: {
          priority: 1,
          useNextOnExhaust: true,
          continuation: "Ask before switching"
        },
        catalog: {
          source: "models.dev",
          lastChecked: "2026-08-04 21:14",
          lastActivated: "2026-08-04 21:14",
          version: "2026.08.04",
          refreshing: false,
          lastKnownGood: true
        },
        usageSnapshot: {
          includedRemaining: "72%",
          extraBalance: "None on file",
          resetsAt: "2026-08-12",
          pressure: "low",
          lastSuccessfulUse: "2026-08-05 03:41",
          projection: "On track to finish the period under the included allowance",
          sourceFreshness: "Reported by the provider 12 minutes ago"
        },
        diagnostics: [
          "21:14 catalog refresh completed; 3 models listed",
          "03:41 generation succeeded on account Personal (412 ms to first token)",
          "03:41 readiness check passed on the isolated CLI profile"
        ]
      },

      /* 2. OpenAI — PM-direct OAuth plus a separate API connection;
            authenticated but model invocation failing; usage exhausted with
            provider-specific what-next options. Catalog mid-refresh on the
            last-known-good data. */
      {
        id: "openai",
        name: "OpenAI",
        tagline: "Direct sign-in plus a separate API connection",
        connectionGroup: "connected-accounts",
        installState: "not-applicable",
        authModel: "pm-direct-oauth",
        authNote: "Puppet Master owns this sign-in directly. The API connection is a separate route with its own credential.",
        accounts: [
          {
            id: "oauth",
            label: "OpenAI account",
            identity: "jared@example.com",
            enabled: true,
            priority: 1,
            sticky: true,
            active: true,
            health: "auth-ok-invocation-failed",
            lastCatalogRefresh: "2026-08-04 20:58",
            lastSuccessfulGeneration: "2026-07-31 22:10",
            usagePressure: "high",
            resetAt: "2026-08-11 00:00"
          },
          {
            id: "api",
            label: "API connection",
            identity: "Key ending in 8f2a",
            enabled: true,
            priority: 2,
            sticky: false,
            active: false,
            health: "ready",
            lastCatalogRefresh: "2026-08-04 20:58",
            lastSuccessfulGeneration: "2026-08-03 11:26",
            usagePressure: "unknown",
            resetAt: "Billed per use"
          }
        ],
        product: {
          plan: "ChatGPT Plus",
          billingRoute: "Puppet Master direct sign-in; the API route bills per use"
        },
        models: [
          {
            id: "gpt-5",
            name: "GPT-5",
            alias: null,
            favorite: false,
            hidden: false,
            priority: 1,
            contextLimit: 256000,
            modalities: { in: ["text", "image"], out: ["text"] },
            capabilities: {
              tools: { state: "temporarily-unavailable", evidence: "Safe probe timed out during the last check", freshAsOf: "2026-08-04" },
              vision: { state: "likely", evidence: "Declared by the models.dev catalog", freshAsOf: "2026-08-04" },
              structuredOutput: { state: "supported", evidence: "Provider discovery over the API connection", freshAsOf: "2026-08-03" }
            },
            fastMode: { supported: false, evidence: "Not declared by the provider" },
            effort: ["low", "medium", "high"]
          },
          {
            id: "gpt-5-pro",
            name: "GPT-5 Pro",
            alias: null,
            favorite: false,
            hidden: false,
            priority: 2,
            contextLimit: 256000,
            modalities: { in: ["text", "image"], out: ["text"] },
            capabilities: {
              tools: { state: "likely", evidence: "Declared by the models.dev catalog", freshAsOf: "2026-08-04" },
              vision: { state: "likely", evidence: "Declared by the models.dev catalog", freshAsOf: "2026-08-04" },
              structuredOutput: { state: "likely", evidence: "Declared by the models.dev catalog", freshAsOf: "2026-08-04" }
            },
            fastMode: { supported: false, evidence: "Not declared by the provider" },
            effort: ["medium", "high"],
            requestedVsEffective: {
              requested: "GPT-5 Pro",
              effective: "GPT-5",
              reason: "Provider policy"
            }
          }
        ],
        routing: {
          priority: 2,
          useNextOnExhaust: true,
          continuation: "Ask before switching"
        },
        catalog: {
          source: "models.dev",
          lastChecked: "2026-08-05 04:02",
          lastActivated: "2026-08-01 18:44",
          version: "2026.08.04",
          refreshing: true,
          lastKnownGood: true
        },
        lastError: "Model invocation failed: capability probe timed out",
        usageSnapshot: {
          includedRemaining: "0%",
          extraBalance: "$4.12 remaining",
          resetsAt: "2026-08-11",
          pressure: "high",
          lastSuccessfulUse: "2026-07-31 22:10",
          projection: "Included usage is exhausted; the allowance resets in 6 days",
          sourceFreshness: "Reported by the provider 1 hour ago",
          whatNext: {
            options: ["stop-and-wait", "use-extra-balance", "switch-account-or-provider", "ask-each-time"],
            selected: "ask-each-time"
          }
        },
        diagnostics: [
          "20:58 sign-in verified for jared@example.com",
          "20:59 capability probe started for GPT-5",
          "21:00 model invocation failed: capability probe timed out"
        ]
      },

      /* 3. Antigravity — installed CLI, signed out. */
      {
        id: "antigravity",
        name: "Antigravity",
        tagline: "Google's agentic CLI, signed in through its own flow",
        connectionGroup: "installed-tools",
        installState: "installed-signed-out",
        authModel: "cli-profile-oauth",
        authNote: "Antigravity owns its Google sign-in inside an isolated CLI profile. Puppet Master can launch the native login but never sees your credentials.",
        accounts: [],
        product: {
          plan: "Determined after sign-in",
          billingRoute: "Google account through the Antigravity CLI"
        },
        models: [
          {
            id: "gemini-3-pro",
            name: "Gemini 3 Pro",
            alias: null,
            favorite: false,
            hidden: false,
            priority: 1,
            contextLimit: 1000000,
            modalities: { in: ["text", "image"], out: ["text"] },
            capabilities: {
              tools: { state: "unverified", evidence: "Unknown until you sign in", freshAsOf: "2026-07-29" },
              vision: { state: "unverified", evidence: "Unknown until you sign in", freshAsOf: "2026-07-29" },
              structuredOutput: { state: "unverified", evidence: "Unknown until you sign in", freshAsOf: "2026-07-29" }
            },
            fastMode: { supported: false, evidence: "Unknown until you sign in" },
            effort: null,
            unavailableReason: "Sign in required — the Antigravity CLI is installed but signed out"
          },
          {
            id: "gemini-3-flash",
            name: "Gemini 3 Flash",
            alias: null,
            favorite: false,
            hidden: false,
            priority: 2,
            contextLimit: 1000000,
            modalities: { in: ["text", "image"], out: ["text"] },
            capabilities: {
              tools: { state: "unverified", evidence: "Unknown until you sign in", freshAsOf: "2026-07-29" },
              vision: { state: "unverified", evidence: "Unknown until you sign in", freshAsOf: "2026-07-29" },
              structuredOutput: { state: "unverified", evidence: "Unknown until you sign in", freshAsOf: "2026-07-29" }
            },
            fastMode: { supported: false, evidence: "Unknown until you sign in" },
            effort: null,
            unavailableReason: "Sign in required — the Antigravity CLI is installed but signed out"
          }
        ],
        routing: {
          priority: 4,
          useNextOnExhaust: true,
          continuation: "Ask before switching"
        },
        catalog: {
          source: "provider",
          lastChecked: "2026-07-29 10:12",
          lastActivated: "2026-07-29 10:12",
          version: "cli 1.4.2",
          refreshing: false,
          lastKnownGood: true
        },
        usageSnapshot: null,
        diagnostics: [
          "10:12 Antigravity CLI 1.4.2 detected on this machine",
          "10:12 no active login found in the isolated CLI profile",
          "10:12 native Google sign-in is ready to launch on demand"
        ]
      },

      /* 4. GitHub Copilot — PM-direct OAuth, ready, medium pressure. */
      {
        id: "github-copilot",
        name: "GitHub Copilot",
        tagline: "Models included with your Copilot plan",
        connectionGroup: "connected-accounts",
        installState: "not-applicable",
        authModel: "pm-direct-oauth",
        accounts: [
          {
            id: "copilot",
            label: "GitHub Copilot",
            identity: "jareds-dev",
            enabled: true,
            priority: 1,
            sticky: true,
            active: true,
            health: "ready",
            lastCatalogRefresh: "2026-08-04 19:20",
            lastSuccessfulGeneration: "2026-08-04 23:15",
            usagePressure: "medium",
            resetAt: "2026-09-01 00:00"
          }
        ],
        product: {
          plan: "Copilot Pro",
          billingRoute: "Puppet Master direct sign-in"
        },
        models: [
          {
            id: "gpt-5-mini",
            name: "GPT-5 Mini",
            alias: null,
            favorite: false,
            hidden: false,
            priority: 1,
            contextLimit: 128000,
            modalities: { in: ["text"], out: ["text"] },
            capabilities: {
              tools: { state: "supported", evidence: "Observed in 6 working sessions", freshAsOf: "2026-08-04" },
              vision: { state: "unsupported", evidence: "Provider discovery reports text-only on this plan", freshAsOf: "2026-08-04" },
              structuredOutput: { state: "likely", evidence: "Declared by the provider", freshAsOf: "2026-08-04" }
            },
            fastMode: { supported: false, evidence: "Not declared by the provider" },
            effort: ["low", "medium"]
          },
          {
            id: "claude-sonnet-copilot",
            name: "Claude Sonnet (via Copilot)",
            alias: null,
            favorite: false,
            hidden: false,
            priority: 2,
            contextLimit: 200000,
            modalities: { in: ["text", "image"], out: ["text"] },
            capabilities: {
              tools: { state: "likely", evidence: "Declared by the provider", freshAsOf: "2026-08-04" },
              vision: { state: "likely", evidence: "Declared by the provider", freshAsOf: "2026-08-04" },
              structuredOutput: { state: "unverified", evidence: "No probe or observed use yet", freshAsOf: "2026-08-04" }
            },
            fastMode: { supported: false, evidence: "Not declared by the provider" },
            effort: null
          }
        ],
        routing: {
          priority: 3,
          useNextOnExhaust: true,
          continuation: "Ask before switching"
        },
        catalog: {
          source: "provider",
          lastChecked: "2026-08-04 19:20",
          lastActivated: "2026-08-04 19:20",
          version: "2026-08-01",
          refreshing: false,
          lastKnownGood: true
        },
        usageSnapshot: {
          includedRemaining: "54%",
          extraBalance: "Not offered on this plan",
          resetsAt: "2026-09-01",
          pressure: "medium",
          lastSuccessfulUse: "2026-08-04 23:15",
          projection: "Comfortable for normal use; heavy Crew runs would finish it early",
          sourceFreshness: "Reported by the provider 3 hours ago"
        },
        diagnostics: [
          "19:20 catalog refresh completed; 2 models listed",
          "23:15 generation succeeded (388 ms to first token)",
          "23:15 usage reported at 46% of the monthly allowance"
        ]
      },

      /* 5. Local model server — server connection, no auth, keyless model. */
      {
        id: "local-server",
        name: "Local model server",
        tagline: "Self-hosted models on this machine",
        connectionGroup: "server",
        installState: "not-applicable",
        authModel: "none",
        server: { baseUrl: "http://127.0.0.1:11434" },
        accounts: [
          {
            id: "local",
            label: "This machine",
            identity: "http://127.0.0.1:11434",
            enabled: true,
            priority: 1,
            sticky: true,
            active: true,
            health: "ready",
            lastCatalogRefresh: "2026-08-05 02:11",
            lastSuccessfulGeneration: "2026-08-04 15:02",
            usagePressure: "low",
            resetAt: "No allowance — runs locally"
          }
        ],
        product: {
          plan: "Self-hosted",
          billingRoute: "No billing — runs on this machine"
        },
        models: [
          {
            id: "qwen3-32b",
            name: "Qwen 3 32B",
            alias: "local workhorse",
            favorite: false,
            hidden: false,
            priority: 1,
            contextLimit: 32768,
            modalities: { in: ["text"], out: ["text"] },
            capabilities: {
              tools: { state: "likely", evidence: "Declared by the local server", freshAsOf: "2026-08-05" },
              vision: { state: "unsupported", evidence: "The server reports text-only", freshAsOf: "2026-08-05" },
              structuredOutput: { state: "supported", evidence: "Observed in tool tests", freshAsOf: "2026-08-02" }
            },
            fastMode: { supported: false, evidence: "Not applicable to local serving" },
            effort: null
          }
        ],
        routing: {
          priority: 5,
          useNextOnExhaust: false,
          continuation: "Stop and ask"
        },
        catalog: {
          source: "local",
          lastChecked: "2026-08-05 02:11",
          lastActivated: "2026-08-05 02:11",
          version: "server 0.6.2",
          refreshing: false,
          lastKnownGood: true
        },
        usageSnapshot: null,
        diagnostics: [
          "02:11 server answered at http://127.0.0.1:11434",
          "02:11 one model loaded: Qwen 3 32B",
          "15:02 generation succeeded (no network left this machine)"
        ]
      },

      /* 6. Free Models — a grouping over underlying providers, not a
            credential store. One model needs PM-owned setup (API key);
            one is keyless and rate-limited. */
      {
        id: "free-community",
        name: "Free Models",
        tagline: "A grouping over free and community providers",
        connectionGroup: "free",
        installState: "not-applicable",
        authModel: "mixed",
        groupingNote: "Free Models is a grouping over underlying providers, accounts, and connections. It is not its own credential store, quota system, or billing identity.",
        accounts: [
          {
            id: "openrouter",
            label: "OpenRouter (underlying provider)",
            identity: "Not configured",
            enabled: false,
            priority: 1,
            sticky: false,
            active: false,
            health: "setup-required",
            lastCatalogRefresh: "2026-08-04 18:33",
            lastSuccessfulGeneration: "Never",
            usagePressure: "unknown",
            resetAt: "Varies by provider"
          }
        ],
        product: {
          plan: "Free tiers of the underlying providers",
          billingRoute: "Each underlying provider limits or bills independently"
        },
        models: [
          {
            id: "or-auto-free",
            name: "OpenRouter Auto",
            alias: null,
            favorite: false,
            hidden: false,
            priority: 1,
            contextLimit: 128000,
            modalities: { in: ["text"], out: ["text"] },
            capabilities: {
              tools: { state: "unverified", evidence: "Setup required before any check can run", freshAsOf: "2026-08-04" },
              vision: { state: "unverified", evidence: "Setup required before any check can run", freshAsOf: "2026-08-04" },
              structuredOutput: { state: "unverified", evidence: "Setup required before any check can run", freshAsOf: "2026-08-04" }
            },
            fastMode: { supported: false, evidence: "Unknown until setup is complete" },
            effort: null,
            requiresSetup: true,
            unavailableReason: "API key required — Puppet Master can walk you through setup"
          },
          {
            id: "pollinations-text",
            name: "Pollinations Text",
            alias: null,
            favorite: false,
            hidden: false,
            priority: 2,
            contextLimit: 8192,
            modalities: { in: ["text"], out: ["text"] },
            capabilities: {
              tools: { state: "unsupported", evidence: "The route exposes plain text completion only", freshAsOf: "2026-08-03" },
              vision: { state: "unsupported", evidence: "The route exposes plain text completion only", freshAsOf: "2026-08-03" },
              structuredOutput: { state: "unsupported", evidence: "The route exposes plain text completion only", freshAsOf: "2026-08-03" }
            },
            fastMode: { supported: false, evidence: "Not offered on this route" },
            effort: null,
            rateNote: "Keyless and rate-limited; shared public quota"
          }
        ],
        routing: {
          priority: 6,
          useNextOnExhaust: false,
          continuation: "Stop and ask"
        },
        catalog: {
          source: "models.dev",
          lastChecked: "2026-08-04 18:33",
          lastActivated: "2026-08-04 18:33",
          version: "2026.08.03",
          refreshing: false,
          lastKnownGood: true
        },
        usageSnapshot: null,
        setupSteps: [
          "Create a free OpenRouter account",
          "Generate an API key with read-only scope",
          "Paste the key into the OpenRouter connection",
          "Verify with a small test prompt",
          "Return to the OpenRouter Auto model row"
        ],
        diagnostics: [
          "18:33 free model list refreshed from models.dev",
          "18:33 OpenRouter Auto needs an API key before use",
          "18:33 Pollinations Text answered a health check (rate-limited)"
        ]
      },

      /* 7. vLLM tenant — not installed; honest simulated Install action. */
      {
        id: "vllm-tenant",
        name: "vLLM tenant",
        tagline: "Your team's shared model endpoint",
        connectionGroup: "server",
        installState: "not-installed",
        authModel: "api-token",
        accounts: [],
        product: {
          plan: "Team tenant",
          billingRoute: "Billed by your organization"
        },
        models: [
          {
            id: "llama-4-scout",
            name: "Llama 4 Scout",
            alias: null,
            favorite: false,
            hidden: false,
            priority: 1,
            contextLimit: 131072,
            modalities: { in: ["text"], out: ["text"] },
            capabilities: {
              tools: { state: "unverified", evidence: "Unknown until the tenant is installed", freshAsOf: "2026-08-01" },
              vision: { state: "unverified", evidence: "Unknown until the tenant is installed", freshAsOf: "2026-08-01" },
              structuredOutput: { state: "unverified", evidence: "Unknown until the tenant is installed", freshAsOf: "2026-08-01" }
            },
            fastMode: { supported: false, evidence: "Unknown until the tenant is installed" },
            effort: null,
            unavailableReason: "The vLLM tenant is not installed"
          }
        ],
        routing: {
          priority: 7,
          useNextOnExhaust: false,
          continuation: "Stop and ask"
        },
        catalog: {
          source: "provider",
          lastChecked: "Never",
          lastActivated: "Never",
          version: "none",
          refreshing: false,
          lastKnownGood: false
        },
        usageSnapshot: null,
        setupSteps: [
          "Install the vLLM tenant helper",
          "Point it at your tenant endpoint",
          "Verify the connection with a test prompt"
        ],
        installAction: {
          label: "Install",
          receipt: "Install simulated — nothing was downloaded or changed"
        },
        diagnostics: [
          "no vLLM tenant installation was found on this machine",
          "install adds the tenant helper and registers the endpoint",
          "nothing has been downloaded yet"
        ]
      }
    ],

    /* ==================================================================
       ROLES — the 11 assignment roles. PRD/Planning and the main
       assistant are quality-guarded: they never silently downgrade.
       ================================================================== */
    roles: [
      {
        id: "main-assistant",
        label: "Main Assistant",
        route: { provider: "Anthropic", account: "Personal", model: "Claude Opus" },
        status: "Ready",
        qualityGuarded: true,
        note: "User-facing discussion stays on a high-quality route, even when usage runs low elsewhere."
      },
      {
        id: "prd-planning",
        label: "PRD and Planning conversation",
        route: { provider: "Anthropic", account: "Personal", model: "Claude Opus" },
        status: "Ready",
        qualityGuarded: true,
        note: "Follows the main assistant route unless you pick a qualified override."
      },
      {
        id: "goal-worker",
        label: "Goal worker",
        route: { provider: "Anthropic", account: "Personal", model: "Claude Sonnet" },
        status: "Ready",
        qualityGuarded: false,
        note: "Background execution may use eligible routes within policy."
      },
      {
        id: "verifier",
        label: "Verifier and Auditor",
        route: null,
        status: "Not configured",
        qualityGuarded: false,
        note: "Audits are skipped until a route is chosen."
      },
      {
        id: "vision-media",
        label: "Vision and media analysis",
        route: { provider: "Anthropic", account: "Personal", model: "Claude Sonnet" },
        status: "Ready",
        qualityGuarded: false,
        note: "Handles screenshots and image attachments."
      },
      {
        id: "compression",
        label: "Compression and context maintenance",
        route: { provider: "Local model server", account: "This machine", model: "Qwen 3 32B" },
        status: "Ready",
        qualityGuarded: false,
        note: "Summaries run locally; nothing leaves the machine."
      },
      {
        id: "web-extraction",
        label: "Web extraction",
        route: { provider: "Free Models", account: "Keyless", model: "Pollinations Text" },
        status: "Rate-limited",
        qualityGuarded: false,
        note: "Bounded extraction may use the free route; final integration stays high quality."
      },
      {
        id: "approval-review",
        label: "Approval review",
        route: { provider: "Anthropic", account: "Personal", model: "Claude Sonnet" },
        status: "Ready",
        qualityGuarded: false,
        note: "Summarizes what an approval would allow before you grant it."
      },
      {
        id: "mcp-tool-routing",
        label: "MCP and tool routing",
        route: { provider: "GitHub Copilot", account: "GitHub Copilot", model: "GPT-5 Mini" },
        status: "Ready",
        qualityGuarded: false,
        note: "Selects relevant tools; never executes them."
      },
      {
        id: "skill-search",
        label: "Skill search",
        route: { provider: "Local model server", account: "This machine", model: "Qwen 3 32B" },
        status: "Ready",
        qualityGuarded: false,
        note: "Matches tasks to installed skills."
      },
      {
        id: "subagents-crew",
        label: "Subagents and Crew roles",
        route: { provider: "Anthropic", account: "Personal", model: "Claude Sonnet" },
        status: "Ready",
        qualityGuarded: false,
        note: "Crew templates may override per member role."
      }
    ],

    /* ==================================================================
       USAGE — compact read-only snapshots. Usage owns measured balances,
       history, and projections; these mirrors never recalculate.
       ================================================================== */
    usage: {
      note: "Usage owns measured balances, history, and forecasts. These snapshots are read-only — open Usage for detail.",
      providers: {
        "anthropic": {
          includedRemaining: "72%",
          extraBalance: "None on file",
          resetsAt: "2026-08-12",
          pressure: "low",
          lastSuccessfulUse: "2026-08-05 03:41",
          projection: "On track to finish the period under the included allowance",
          sourceFreshness: "Reported by the provider 12 minutes ago"
        },
        "openai": {
          includedRemaining: "0%",
          extraBalance: "$4.12 remaining",
          resetsAt: "2026-08-11",
          pressure: "high",
          lastSuccessfulUse: "2026-07-31 22:10",
          projection: "Included usage is exhausted; the allowance resets in 6 days",
          sourceFreshness: "Reported by the provider 1 hour ago",
          whatNext: {
            options: ["stop-and-wait", "use-extra-balance", "switch-account-or-provider", "ask-each-time"],
            selected: "ask-each-time"
          }
        },
        "github-copilot": {
          includedRemaining: "54%",
          extraBalance: "Not offered on this plan",
          resetsAt: "2026-09-01",
          pressure: "medium",
          lastSuccessfulUse: "2026-08-04 23:15",
          projection: "Comfortable for normal use; heavy Crew runs would finish it early",
          sourceFreshness: "Reported by the provider 3 hours ago"
        },
        "antigravity": null,
        "local-server": null,
        "free-community": null,
        "vllm-tenant": null
      }
    },

    /* ==================================================================
       MEMORY — 8 evidence-backed Gists. Mixed verified / awaiting-review,
       pinned, kinds, scopes, half-lives, access, evidence, versions.
       Half-life means fades from active context — never "becomes false".
       ================================================================== */
    memory: {
      gists: [
        {
          id: "g-101",
          text: "Prefers terse commit messages in Conventional Commits style",
          kind: "preference",
          scope: "assistant",
          status: "verified",
          pinned: true,
          halfLifeDays: 90,
          lastAccess: "2026-08-04",
          evidence: ["Thread: release-prep, 2026-07-30", "Thread: api-cleanup, 2026-07-22"],
          versions: 3
        },
        {
          id: "g-102",
          text: "The staging deploy runs from the release branch, not main",
          kind: "fact",
          scope: "project",
          status: "awaiting-review",
          pinned: false,
          halfLifeDays: 60,
          lastAccess: "2026-08-01",
          evidence: ["Thread: deploy-fix, 2026-08-01"],
          versions: 1
        },
        {
          id: "g-103",
          text: "Chose Slint over egui for the desktop shell",
          kind: "decision",
          scope: "project",
          status: "verified",
          pinned: true,
          halfLifeDays: 180,
          lastAccess: "2026-07-28",
          evidence: ["Plan: desktop-shell, 2026-07-20", "Thread: ui-frameworks, 2026-07-19"],
          versions: 2
        },
        {
          id: "g-104",
          text: "The terminal profile inherits the app locale unless overridden",
          kind: "gotcha",
          scope: "project",
          status: "awaiting-review",
          pinned: false,
          halfLifeDays: 45,
          lastAccess: "2026-07-31",
          evidence: ["Log: terminal-spawn, 2026-07-31"],
          versions: 1
        },
        {
          id: "g-105",
          text: "Likes explanations to lead with the tradeoff",
          kind: "preference",
          scope: "assistant",
          status: "verified",
          pinned: false,
          halfLifeDays: 120,
          lastAccess: "2026-08-03",
          evidence: ["Thread: settings-ia, 2026-08-02"],
          versions: 2
        },
        {
          id: "g-106",
          text: "The Concepts folder is validated by ConceptHub/validate.py",
          kind: "fact",
          scope: "project",
          status: "verified",
          pinned: false,
          halfLifeDays: 90,
          lastAccess: "2026-08-05",
          evidence: ["File: CONCEPT_RULES.md", "Run: validate, 2026-08-04"],
          versions: 1
        },
        {
          id: "g-107",
          text: "Free Models routes can disappear without notice",
          kind: "gotcha",
          scope: "project",
          status: "awaiting-review",
          pinned: false,
          halfLifeDays: 30,
          lastAccess: "2026-07-25",
          evidence: ["Log: free-route-404, 2026-07-25"],
          versions: 1
        },
        {
          id: "g-108",
          text: "The settings redesign uses a three-surface architecture",
          kind: "decision",
          scope: "project",
          status: "verified",
          pinned: true,
          halfLifeDays: 180,
          lastAccess: "2026-08-05",
          evidence: ["Packet: settings bakeoff, 2026-08-05"],
          versions: 2
        }
      ]
    },

    /* ==================================================================
       PERSONAS — the 8 core roles. A persona is behavior, not an account,
       model, or permission grant. Explorer and Bash are child-only and
       must never appear as ordinary chat defaults.
       ================================================================== */
    personas: [
      {
        id: "assistant",
        name: "Assistant",
        roleSummary: "The default conversational partner for everyday work",
        capsule: "You are the primary assistant. Lead with the answer, then the reasoning; ask when the goal is unclear.",
        scopes: ["turn", "thread", "goal", "project", "global"],
        childOnly: false,
        currentScope: "This thread"
      },
      {
        id: "collaborator",
        name: "Collaborator",
        roleSummary: "A pair-working partner that thinks out loud with you",
        capsule: "You are a pair partner. Offer options and tradeoffs before acting, and narrate what you are about to change.",
        scopes: ["turn", "thread", "goal", "project", "global"],
        childOnly: false,
        currentScope: "Project default for new work"
      },
      {
        id: "general",
        name: "General",
        roleSummary: "A capable worker persona for delegated tasks",
        capsule: "You are a general worker. Follow the handoff, stay inside the granted scope, and report what you changed.",
        scopes: ["turn", "thread", "goal", "project", "global"],
        childOnly: false,
        currentScope: "Global default for new work"
      },
      {
        id: "overseer",
        name: "Overseer",
        roleSummary: "Reviews plans and diffs with a skeptical eye",
        capsule: "You are a reviewer. Look for what is missing or wrong; approve only when the evidence is in front of you.",
        scopes: ["turn", "thread", "goal", "project", "global"],
        childOnly: false,
        currentScope: "This Goal"
      },
      {
        id: "researcher",
        name: "Researcher",
        roleSummary: "Bounded, well-sourced investigation",
        capsule: "You are a researcher. Gather from approved sources, cite everything, and stop at the agreed bound.",
        scopes: ["turn", "thread", "goal", "project", "global"],
        childOnly: false,
        currentScope: "This thread"
      },
      {
        id: "explorer",
        name: "Explorer",
        roleSummary: "Fast read-only codebase exploration",
        capsule: "You explore code read-only. Return precise file and line references; never edit anything.",
        scopes: ["child"],
        childOnly: true,
        currentScope: "Child only"
      },
      {
        id: "bash",
        name: "Bash",
        roleSummary: "Executes scoped shell tasks for a parent agent",
        capsule: "You run scoped shell commands. Stay inside the granted commands and report output faithfully.",
        scopes: ["child"],
        childOnly: true,
        currentScope: "Child only"
      },
      {
        id: "teacher",
        name: "Teacher",
        roleSummary: "Explains concepts patiently with examples",
        capsule: "You are a teacher. Explain from first principles with small concrete examples; check understanding before moving on.",
        scopes: ["turn", "thread", "goal", "project", "global"],
        childOnly: false,
        currentScope: "This thread"
      }
    ],

    /* ==================================================================
       CREWS — 2 reusable multi-agent templates owned by the Orchestrator.
       Requested composition is preserved even when capacity admits less.
       ================================================================== */
    crews: [
      {
        id: "feature-build",
        name: "Feature Build",
        purpose: "Implements a scoped feature with review and tests",
        membersRequested: 5,
        membersEffective: 2,
        queuedWaves: 3,
        roles: [
          { role: "Implementer", persona: "General", candidates: ["Claude Sonnet · Anthropic · Personal", "GPT-5 Mini · GitHub Copilot"] },
          { role: "Reviewer", persona: "Overseer", candidates: ["Claude Opus · Anthropic · Personal"] },
          { role: "Tester", persona: "General", candidates: ["Claude Sonnet · Anthropic · Personal", "Qwen 3 32B · Local server"] },
          { role: "Researcher", persona: "Researcher", candidates: ["Claude Sonnet · Anthropic · Personal"] },
          { role: "Synthesizer", persona: "Collaborator", candidates: ["Claude Opus · Anthropic · Personal"] }
        ],
        routePolicy: "adaptive",
        guards: { spend: "$8.00 per run", time: "45 minutes" },
        reserveForSynthesis: true,
        isolation: "worktree",
        capacityNote: "Requested 5 members; current capacity admits 2 concurrently, so the remaining 3 run as queued waves."
      },
      {
        id: "docs-sweep",
        name: "Docs Sweep",
        purpose: "Refreshes documentation against recent code changes",
        membersRequested: 2,
        membersEffective: 2,
        queuedWaves: 1,
        roles: [
          { role: "Auditor", persona: "Overseer", candidates: ["Claude Sonnet · Anthropic · Personal"] },
          { role: "Editor", persona: "General", candidates: ["Qwen 3 32B · Local server", "GPT-5 Mini · GitHub Copilot"] }
        ],
        routePolicy: "strict",
        guards: { spend: "$2.00 per run", time: "20 minutes" },
        reserveForSynthesis: false,
        isolation: "worktree",
        capacityNote: "Current capacity covers the full template."
      }
    ],

    /* ==================================================================
       CONTEXT SOURCES — what was admitted to the last provider request,
       with provenance. Includes the scoped AGENTS.md precedence chain.
       ================================================================== */
    contextSources: [
      {
        id: "scoped-instructions",
        label: "Scoped project instructions",
        kind: "instructions",
        admittedLastTurn: true,
        detail: "AGENTS.md chain: user, then project, then Concepts folder — the nearest scope wins on conflict",
        provenance: "3 files merged by precedence; 412 tokens"
      },
      {
        id: "chat-history",
        label: "Relevant previous chats",
        kind: "history",
        admittedLastTurn: true,
        detail: "2 short excerpts from earlier threads",
        provenance: "Threads: settings-ia, provider-states"
      },
      {
        id: "run-logs",
        label: "Relevant logs",
        kind: "logs",
        admittedLastTurn: false,
        detail: "Omitted last turn — no relevant log lines",
        provenance: "Last admitted 2026-08-03"
      },
      {
        id: "assistant-memory",
        label: "Assistant memory",
        kind: "memory",
        admittedLastTurn: true,
        detail: "3 verified Gists in scope",
        provenance: "Gists g-101, g-106, g-108"
      },
      {
        id: "parent-handoff",
        label: "Parent-agent handoff",
        kind: "handoff",
        admittedLastTurn: false,
        detail: "No parent agent in this thread",
        provenance: "Not applicable"
      },
      {
        id: "attempt-journal",
        label: "Current attempt journal",
        kind: "journal",
        admittedLastTurn: true,
        detail: "6 journal entries from this task",
        provenance: "Session journal"
      },
      {
        id: "tool-schemas",
        label: "Selected tool schemas",
        kind: "tools",
        admittedLastTurn: true,
        detail: "4 of 8 installed tools were selected for this turn",
        provenance: "Progressive disclosure policy"
      },
      {
        id: "persona-capsule",
        label: "Persona capsule",
        kind: "persona",
        admittedLastTurn: true,
        detail: "Assistant capsule, 2 lines — the full persona source is not injected",
        provenance: "Persona: Assistant"
      }
    ],

    /* ==================================================================
       MCP — 4 servers: stdio healthy, http degraded, one connecting,
       one erroring with logs.
       ================================================================== */
    mcp: [
      {
        id: "filesystem",
        name: "Filesystem",
        transport: "stdio",
        protocol: { requested: "2025-06-18", negotiated: "2025-06-18" },
        scope: "project",
        health: "healthy",
        tools: [
          { name: "Read file", exposure: "eager", invoked: true },
          { name: "Write file", exposure: "lazy", invoked: false }
        ],
        approvalPolicy: "Remember for this session",
        logs: [
          "02:11 server started (stdio, project scope)",
          "02:11 negotiated protocol 2025-06-18",
          "03:40 tool Read file invoked and approved for this session"
        ]
      },
      {
        id: "github",
        name: "GitHub",
        transport: "http",
        protocol: { requested: "2025-06-18", negotiated: "2025-03-26" },
        scope: "global",
        health: "degraded",
        tools: [
          { name: "Create issue", exposure: "lazy", invoked: false },
          { name: "Search pull requests", exposure: "eager", invoked: true }
        ],
        approvalPolicy: "Ask each time",
        lastError: "Stream closed by the server; reconnecting with backoff",
        logs: [
          "01:58 negotiated an older protocol (2025-03-26)",
          "02:47 stream closed by the server mid-call",
          "02:47 reconnect scheduled with backoff"
        ]
      },
      {
        id: "playwright",
        name: "Playwright",
        transport: "stdio",
        protocol: { requested: "2025-06-18", negotiated: "pending" },
        scope: "project",
        health: "connecting",
        tools: [
          { name: "Navigate page", exposure: "lazy", invoked: false },
          { name: "Capture screenshot", exposure: "lazy", invoked: false }
        ],
        approvalPolicy: "Ask each time",
        logs: [
          "04:48 server process launched",
          "04:48 handshake in progress",
          "04:49 waiting for the tool list"
        ]
      },
      {
        id: "postgres",
        name: "Postgres",
        transport: "stdio",
        protocol: { requested: "2025-06-18", negotiated: "failed" },
        scope: "project",
        health: "error",
        tools: [
          { name: "Run query", exposure: "lazy", invoked: false }
        ],
        approvalPolicy: "Ask each time",
        lastError: "Server exited with code 1: missing connection string",
        logs: [
          "02:11 server process launched",
          "02:11 exited with code 1",
          "02:11 missing connection string — set one in the server config"
        ]
      }
    ],

    /* ==================================================================
       LSP — 3 servers: healthy, detected-not-installed, erroring.
       ================================================================== */
    lsp: [
      {
        id: "typescript",
        name: "TypeScript language server",
        language: "TypeScript and JavaScript",
        state: "healthy",
        version: "5.6.2",
        scope: "project",
        startupMode: "On demand",
        capabilities: ["Completions", "Go to definition", "Rename", "Diagnostics"],
        formattingOwner: "Language server",
        diagnosticsOwner: "Language server",
        logs: [
          "09:14 server started for the project workspace",
          "09:14 indexed 1,204 files",
          "09:15 diagnostics stream healthy"
        ]
      },
      {
        id: "rust",
        name: "Rust Analyzer",
        language: "Rust",
        state: "detected-not-installed",
        version: null,
        scope: "project",
        startupMode: "On demand",
        capabilities: ["Completions", "Go to definition", "Rename"],
        formattingOwner: "Not applicable",
        diagnosticsOwner: "Not applicable",
        logs: [
          "09:14 rust sources detected in the workspace",
          "09:14 Rust Analyzer is not installed",
          "09:14 install it to enable Rust language features"
        ]
      },
      {
        id: "python",
        name: "Pyright",
        language: "Python",
        state: "installed-but-erroring",
        version: "1.1.392",
        scope: "project",
        startupMode: "On demand",
        capabilities: ["Completions", "Go to definition", "Diagnostics"],
        formattingOwner: "Editor",
        diagnosticsOwner: "Language server",
        logs: [
          "09:14 server started",
          "09:14 crashed while reading the virtual environment",
          "09:15 restart failed: the configured interpreter path is missing"
        ]
      }
    ],

    /* ==================================================================
       SKILLS — discoverable capabilities with trust and scope.
       ================================================================== */
    skills: [
      {
        id: "commit",
        name: "Commit",
        source: "Built in",
        trusted: true,
        enabled: true,
        scope: "global",
        permissions: ["Run git commands"],
        updatedAt: "2026-07-20"
      },
      {
        id: "pdf",
        name: "PDF tools",
        source: "Community registry",
        trusted: false,
        enabled: false,
        scope: "project",
        permissions: ["Read files"],
        updatedAt: "2026-06-30"
      },
      {
        id: "write-goal",
        name: "Write Goal",
        source: "Built in",
        trusted: true,
        enabled: true,
        scope: "global",
        permissions: ["Read the current thread"],
        updatedAt: "2026-07-20"
      },
      {
        id: "check-docs",
        name: "Check product docs",
        source: "Community registry",
        trusted: true,
        enabled: true,
        scope: "global",
        permissions: ["Fetch web pages"],
        updatedAt: "2026-07-28"
      }
    ],

    /* ==================================================================
       PLUGINS — lifecycle state, one active, one failed with a reason.
       ================================================================== */
    plugins: [
      {
        id: "theme-pack",
        name: "Community theme pack",
        channel: "stable",
        version: "2.3.1",
        requestedPermissions: ["Read theme files"],
        state: "active"
      },
      {
        id: "metrics-widget",
        name: "Metrics widget",
        channel: "beta",
        version: "0.9.0",
        requestedPermissions: ["Read usage data", "Write logs"],
        state: "failed",
        failureReason: "Incompatible with this Puppet Master version"
      }
    ],

    /* ==================================================================
       TOOLS — unified inventory. MCP-owned tools stay attributed to
       their server; availability reflects live server health.
       ================================================================== */
    tools: [
      { id: "read-file", name: "Read file", owner: "pm", installed: true, projectEnabled: true, availableThisTurn: true, invoked: true, risk: "low", approvalPolicy: "Never ask" },
      { id: "edit-files", name: "Edit files", owner: "pm", installed: true, projectEnabled: true, availableThisTurn: true, invoked: true, risk: "medium", approvalPolicy: "Ask each time" },
      { id: "run-command", name: "Run command", owner: "pm", installed: true, projectEnabled: true, availableThisTurn: false, invoked: false, risk: "high", approvalPolicy: "Ask each time" },
      { id: "search-web", name: "Search the web", owner: "pm", installed: true, projectEnabled: true, availableThisTurn: true, invoked: false, risk: "low", approvalPolicy: "Remember for this session" },
      { id: "memory-search", name: "Search project memory", owner: "pm", installed: true, projectEnabled: true, availableThisTurn: true, invoked: true, risk: "low", approvalPolicy: "Never ask" },
      { id: "create-issue", name: "Create issue", owner: "mcp:github", installed: true, projectEnabled: true, availableThisTurn: true, invoked: false, risk: "medium", approvalPolicy: "Ask each time" },
      { id: "run-query", name: "Run database query", owner: "mcp:postgres", installed: true, projectEnabled: true, availableThisTurn: false, invoked: false, risk: "medium", approvalPolicy: "Ask each time" },
      { id: "navigate-page", name: "Navigate page", owner: "mcp:playwright", installed: true, projectEnabled: false, availableThisTurn: false, invoked: false, risk: "medium", approvalPolicy: "Ask each time" }
    ],

    /* ==================================================================
       COMMANDS — one conflicting pair on Ctrl+Shift+P.
       ================================================================== */
    commands: [
      { id: "command-palette", name: "Open command palette", shortcut: "Ctrl+Shift+P", conflict: true, custom: false },
      { id: "quick-open", name: "Quick open", shortcut: "Ctrl+P", conflict: false, custom: false },
      { id: "toggle-terminal", name: "Toggle terminal", shortcut: "Ctrl+`", conflict: false, custom: false },
      { id: "goal-check", name: "Run goal check", shortcut: "Ctrl+Shift+P", conflict: true, custom: true },
      { id: "open-settings", name: "Open settings", shortcut: "Ctrl+,", conflict: false, custom: false }
    ],

    /* ==================================================================
       TERMINAL — 2 profiles. Every field is explicit: Auto / Inherit /
       Not configured tokens, never an ambiguous empty string.
       ================================================================== */
    terminal: {
      activeProfile: "default-zsh",
      profiles: [
        {
          id: "default-zsh",
          name: "Default (zsh)",
          completeness: "complete",
          shell: "/bin/zsh",
          font: { family: "Menlo", fallback: "monospace", size: 13, lineHeight: 1.2 },
          colors: { fg: "#E8E6EA", bg: "#1D1B22", palette: "Puppet Dark" },
          opacity: "100%",
          cursor: { style: "bar", blink: true },
          copyPaste: { copyOnSelect: "Off", linkBehavior: "Cmd+click opens links" },
          cwdPolicy: "Inherit from the app",
          envPolicy: "Inherit the app environment",
          transcriptRetention: "30 days",
          rendering: { backend: "Auto", ligatures: "Off" },
          startupCommand: "not-configured"
        },
        {
          id: "work",
          name: "Work",
          completeness: "partial",
          shell: "inherit",
          font: { family: "inherit", fallback: "inherit", size: "inherit", lineHeight: "auto" },
          colors: { fg: "inherit", bg: "inherit", palette: "inherit" },
          opacity: "auto",
          cursor: { style: "inherit", blink: "inherit" },
          copyPaste: { copyOnSelect: "inherit", linkBehavior: "inherit" },
          cwdPolicy: "Project root",
          envPolicy: "Custom (3 entries)",
          transcriptRetention: "not-configured",
          rendering: { backend: "inherit", ligatures: "inherit" },
          startupCommand: "not-configured"
        }
      ]
    },

    /* ==================================================================
       MEDIA PROVIDERS — image route ready, video unconfigured, audio with
       a safety-policy warning.
       ================================================================== */
    mediaProviders: [
      {
        id: "pm-image-suite",
        name: "PM Image Suite",
        kinds: ["image"],
        routePurposes: ["Attachments", "Generation"],
        inputMode: "native",
        outputLocation: "~/Pictures/Puppet Master",
        outputFormat: "PNG",
        safetyStatus: "Standard policy active",
        costRoute: "Included plan",
        fallbackRoute: "Free image route",
        history: [
          { at: "2026-08-04 22:10", summary: "Generated a settings empty-state illustration" },
          { at: "2026-08-03 16:44", summary: "Analyzed an attached architecture diagram" }
        ],
        health: "ready"
      },
      {
        id: "vidcraft",
        name: "Vidcraft",
        kinds: ["video"],
        routePurposes: ["Generation"],
        inputMode: "pm-transformed",
        outputLocation: "not-configured",
        outputFormat: "not-configured",
        safetyStatus: "Not reviewed yet",
        costRoute: "not-configured",
        fallbackRoute: "None",
        history: [],
        health: "not-configured"
      },
      {
        id: "local-voice",
        name: "Local Voice",
        kinds: ["audio"],
        routePurposes: ["Generation", "Playback"],
        inputMode: "pm-transformed",
        outputLocation: "~/Pictures/Puppet Master",
        outputFormat: "WAV",
        safetyStatus: "Warning: the custom safety policy differs from Standard",
        costRoute: "No cost — runs locally",
        fallbackRoute: "None",
        history: [
          { at: "2026-08-02 11:03", summary: "Generated a short notification chime" },
          { at: "2026-07-30 09:15", summary: "Read a plan summary aloud" }
        ],
        health: "ready"
      }
    ],

    /* ==================================================================
       SPELLCHECK — a quiet shared input service. The demo paragraph has
       3 deliberate misspellings plus a code token and a path that must
       never be underlined.
       ================================================================== */
    spellcheck: {
      enabled: true,
      language: "Automatic",
      dictionarySource: "Automatic",
      personalDictionary: ["Puppet", "FileSafe", "Gist"],
      projectDictionary: ["Anthropic", "worktree"],
      checkTechnicalProse: false,
      underlineUnknownNames: false,
      demoParagraph: "When you recieve a plan, check that each seperate step has evidence before it is marked done — a step that occured without verification should stay open. The store helper pm_store_init and the path /usr/local/bin must never be underlined."
    },

    /* ==================================================================
       MANAGER META — the dedicated managers, reachable from Settings
       navigation and search but rendered as rich manager surfaces.
       ================================================================== */
    managerMeta: {
      providers: { id: "providers", title: "Providers", purpose: "Accounts, connections, models, and routing", icon: "layers" },
      memory: { id: "memory", title: "Assistant memory", purpose: "Evidence-backed Gists with review and pinning", icon: "spark" },
      personas: { id: "personas", title: "Personas", purpose: "Behavior definitions with explicit scopes", icon: "mask" },
      crew: { id: "crew", title: "Crew", purpose: "Reusable multi-agent execution templates", icon: "grid" },
      context: { id: "context", title: "Context and instructions", purpose: "What enters each request, and why", icon: "stack" },
      mcp: { id: "mcp", title: "MCP servers", purpose: "External tool servers and their health", icon: "plug" },
      lsp: { id: "lsp", title: "Language servers", purpose: "Per-language smarts and their state", icon: "code" },
      skills: { id: "skills", title: "Skills", purpose: "Installable capabilities with trust and scope", icon: "puzzle" },
      tools: { id: "tools", title: "Tools", purpose: "The unified tool inventory and approvals", icon: "wrench" },
      commands: { id: "commands", title: "Commands", purpose: "Shortcuts, conflicts, and custom commands", icon: "command" },
      terminal: { id: "terminal", title: "Terminal", purpose: "Profiles, fonts, and shell policy", icon: "terminal" },
      media: { id: "media", title: "Media", purpose: "Image, audio, and video routes", icon: "image" },
      usage: { id: "usage", title: "Usage", purpose: "Balances, history, and projections", icon: "gauge" },
      spellcheck: { id: "spellcheck", title: "Spellcheck", purpose: "The shared writing service", icon: "check" }
    }
  };
})();
