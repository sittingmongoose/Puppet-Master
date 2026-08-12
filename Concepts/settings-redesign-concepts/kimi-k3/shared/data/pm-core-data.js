/* ============================================================================
   pm-core-data.js — kimi-k3 core demo dataset (window.PM_CORE_DATA)
   ----------------------------------------------------------------------------
   Shared by all four kimi-k3 concepts. Concept-specific fixtures live in
   concepts/<name>/data.js (window.<NAME>_DATA); this file carries the core:
   12 categories with representative rows across every value state, notices,
   recents, the full 17-fixture provider set, agent roles, spellcheck, and
   the core search actions.

   Conventions (same as the proven seed):
   - Human strings everywhere ("Not configured", never "not_configured").
   - A field with no literal value uses "auto" | "inherit" | "not-configured".
   - setting state: default | recommended | inherited | auto |
     not-configured | managed | custom | unavailable | effective-differs
   - exposure: standard | advanced | expert | managed | diagnostic |
     unavailable
   ========================================================================== */
(function () {
  "use strict";

  window.PM_CORE_DATA = {
    meta: {
      model: "kimi-k3",
      topic: "settings-redesign",
      seededAt: "2026-08-11"
    },

    /* ==================================================================
       12 categories — navigation destinations, never filters
       ================================================================== */
    categories: [
      {
        id: "general",
        title: "General",
        purpose: "Startup, updates, and desktop behavior",
        icon: "home",
        subcategories: [
          { id: "startup", title: "Startup and restore", summary: "What Puppet Master restores and resumes on launch", settings: ["general.startup-restore", "general.startup-open", "general.resume-runs"] },
          { id: "updates", title: "App updates", summary: "How Puppet Master keeps itself current", settings: ["general.update-check", "general.update-channel", "general.update-download"] },
          { id: "desktop", title: "Desktop and window", summary: "Tray, launch destination, and window protection", settings: ["general.tray-minimize", "general.launch-destination", "general.unsaved-protection"] }
        ]
      },
      {
        id: "appearance",
        title: "Appearance",
        purpose: "Theme, layout, motion, and scale",
        icon: "palette",
        manager: "appearance",
        subcategories: [
          { id: "theme", title: "Theme", summary: "Color theme and OS following", settings: ["appearance.theme", "appearance.follow-system", "appearance.contrast"] },
          { id: "layout", title: "Layout", summary: "Density, text size, and scale", settings: ["appearance.density", "appearance.text-size", "appearance.ui-scale"] },
          { id: "motion", title: "Motion", summary: "Animation and reduced-motion behavior", settings: ["appearance.reduce-motion", "appearance.animations"] }
        ]
      },
      {
        id: "notifications",
        title: "Notifications and Sounds",
        purpose: "Delivery, destinations, sounds, and quiet behavior",
        icon: "bell",
        manager: "notifications",
        subcategories: [
          { id: "delivery", title: "Delivery", summary: "Where notifications go and when they stay quiet", settings: ["notifications.inapp-inbox", "notifications.system-tray", "notifications.quiet-hours"] },
          { id: "sounds", title: "Sounds", summary: "Master sound, volume, and event mappings", settings: ["notifications.master-sound", "notifications.volume", "notifications.completion-sound"] },
          { id: "behavior", title: "Behavior", summary: "How notifications behave while work runs", settings: ["notifications.tray-automation", "notifications.grouping"] }
        ]
      },
      {
        id: "providers",
        title: "AI and Providers",
        purpose: "Accounts, connections, models, and routing",
        icon: "layers",
        manager: "providers",
        subcategories: [
          { id: "connections", title: "Accounts and connections", summary: "How provider sign-ins behave across accounts", settings: ["providers.account-switch-scope", "providers.sticky-sessions", "providers.reconnect-on-launch"] },
          { id: "models", title: "Models", summary: "Catalog refresh, visibility, and capability checks", settings: ["providers.catalog-refresh", "providers.show-hidden-models", "providers.capability-probes"] },
          { id: "routing", title: "Routing and priority", summary: "How Puppet Master picks and fails over between routes", settings: ["providers.route-priority-mode", "providers.use-next-on-exhaust", "providers.cross-provider-fallback"] },
          { id: "roles", title: "Agent roles", summary: "Which routes power planning, verification, and fallback work", settings: ["providers.planning-quality-guard", "providers.verifier-route", "providers.low-usage-behavior"] }
        ]
      },
      {
        id: "context",
        title: "Context and Memory",
        purpose: "Retrieval, instructions, compaction, and Assistant memory",
        icon: "stack",
        manager: "context",
        subcategories: [
          { id: "retrieval", title: "Retrieval", summary: "What past work may inform new turns", settings: ["context.use-previous-chats", "context.use-project-code", "context.use-logs"] },
          { id: "instructions", title: "Instructions", summary: "Which instruction sources enter the context each turn", settings: ["context.include-scoped-instructions", "context.include-parent-summary", "context.include-attempt-journal"] },
          { id: "compaction", title: "Compaction", summary: "Automatic compaction and its safeguards", settings: ["context.compaction-auto", "context.compaction-threshold", "context.compaction-safeguard"] },
          { id: "memory", title: "Assistant memory", summary: "Evidence-backed Gists, review, and fading", settings: ["context.memory-enabled", "context.memory-review", "context.memory-half-life"] }
        ]
      },
      {
        id: "personas",
        title: "Personas and Crew",
        purpose: "Behavior definitions and multi-agent templates",
        icon: "mask",
        manager: "personas",
        subcategories: [
          { id: "defaults", title: "Persona defaults", summary: "Which personas apply to new work", settings: ["personas.default-thread", "personas.default-project", "personas.eager-skills"] },
          { id: "crew", title: "Crew defaults", summary: "Baseline rules for Crew templates", settings: ["crew.route-policy", "crew.max-members", "crew.isolation"] }
        ]
      },
      {
        id: "goal",
        title: "Goal and Automation",
        purpose: "Ceilings, verification, and Back Seat Driver",
        icon: "compass",
        manager: "goal",
        subcategories: [
          { id: "defaults", title: "Run defaults", summary: "Ceilings and guards for Goal runs", settings: ["goal.worker-ceiling", "goal.spend-guard", "goal.checkpoints"] },
          { id: "verification", title: "Verification", summary: "Audits before work is marked done", settings: ["goal.require-verification", "goal.audit-strength", "goal.verification-reserve"] },
          { id: "bsd", title: "Back Seat Driver", summary: "A read-only second opinion on risky turns", settings: ["goal.bsd-mode", "goal.bsd-usage-guard", "goal.bsd-latency-budget"] }
        ]
      },
      {
        id: "permissions",
        title: "Permissions and Security",
        purpose: "Approvals, rules, and FileSafe",
        icon: "shield",
        manager: "permissions",
        subcategories: [
          { id: "approvals", title: "Approvals", summary: "When Puppet Master asks before acting", settings: ["permissions.default-approval", "permissions.approval-duration", "permissions.auto-approve-reads"] },
          { id: "rules", title: "Rules", summary: "Wildcard defaults and doom-loop protection", settings: ["permissions.wildcard-default", "permissions.doom-loop-threshold", "permissions.doom-loop-action"] },
          { id: "filesafe", title: "FileSafe", summary: "Protected writes and sandbox coverage", settings: ["permissions.filesafe-enabled", "permissions.filesafe-mode", "permissions.filesafe-extra-paths"] }
        ]
      },
      {
        id: "devtools",
        title: "Developer Tools",
        purpose: "Language servers, formatting, MCP, and commands",
        icon: "code",
        manager: "lsp",
        subcategories: [
          { id: "lsp", title: "Language servers", summary: "Startup, diagnostics, and limits", settings: ["devtools.lsp-autostart", "devtools.lsp-diagnostics", "devtools.lsp-memory-limit"] },
          { id: "formatting", title: "Formatting", summary: "Format on save and ownership", settings: ["devtools.format-on-save", "devtools.formatting-owner", "devtools.formatter-timeout"] },
          { id: "mcp", title: "MCP servers", summary: "External tool servers and their exposure", settings: ["devtools.mcp-tool-exposure", "devtools.mcp-approval", "devtools.mcp-reconnect"] }
        ]
      },
      {
        id: "terminal",
        title: "Terminal and Editor",
        purpose: "Editor, terminal, shell, and files",
        icon: "terminal",
        manager: "terminal",
        subcategories: [
          { id: "editor", title: "Editor", summary: "Text size, indentation, and wrapping", settings: ["terminal.editor-font-size", "terminal.tab-size", "terminal.word-wrap"] },
          { id: "term", title: "Terminal", summary: "Profiles, rendering, and scrollback", settings: ["terminal.default-profile", "terminal.font-size", "terminal.scrollback"] },
          { id: "shell", title: "Shell", summary: "Default shell and environment", settings: ["terminal.shell-path", "terminal.shell-startup", "terminal.env-policy"] },
          { id: "files", title: "Files", summary: "Tree behavior and large files", settings: ["terminal.tree-show-hidden", "terminal.large-file-threshold", "terminal.changed-on-disk"] }
        ]
      },
      {
        id: "source-control",
        title: "Source Control",
        purpose: "Git, worktrees, forges, and push policy",
        icon: "branch",
        manager: "source-control",
        subcategories: [
          { id: "worktrees", title: "Worktrees", summary: "Isolation and cleanup for agent work", settings: ["sc.worktree-provisioning", "sc.worktree-cleanup", "sc.protect-main"] },
          { id: "forge", title: "Forge", summary: "Hosting connection and SSH", settings: ["sc.forge-connection", "sc.ssh-source", "sc.test-before-merge"] },
          { id: "push", title: "Push policy", summary: "Push, force-push, and large files", settings: ["sc.push-policy", "sc.force-push", "sc.lfs"] }
        ]
      },
      {
        id: "system",
        title: "System and Storage",
        purpose: "Storage, backups, diagnostics, and advanced controls",
        icon: "gauge",
        manager: "storage",
        subcategories: [
          { id: "storage", title: "Storage", summary: "Storage mode, retention, and pressure", settings: ["system.storage-mode", "system.retention-anchor", "system.pressure-threshold"] },
          { id: "backups", title: "Backups and snapshots", summary: "Automatic snapshots and restore checks", settings: ["system.auto-snapshots", "system.snapshot-frequency", "system.test-restore"] },
          { id: "diagnostics", title: "Diagnostics", summary: "Logs, health, and support bundles", settings: ["system.log-level", "system.health-interval", "system.export-diagnostics"] },
          { id: "advanced", title: "Advanced", summary: "Experimental and destructive controls", settings: ["system.experimental-runtime", "system.feature-flags", "system.factory-reset"] }
        ]
      }
    ],

    /* ==================================================================
       Representative settings — every value state, exposure, and marker
       ================================================================== */
    settings: {
      /* ---------- General ---------- */
      "general.startup-restore": {
        id: "general.startup-restore", label: "Restore previous session",
        description: "Reopen the threads and panels from your last session.",
        help: "Turn this off to always start with a clean home screen.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", exposure: "standard", scope: ["global"]
      },
      "general.startup-open": {
        id: "general.startup-open", label: "On startup, open",
        description: "Choose the first screen Puppet Master shows.",
        help: "Home shows your projects; Last session picks up where you left off.",
        type: "select", value: "last-session", defaultValue: "home",
        options: [{ value: "home", label: "Home" }, { value: "last-session", label: "Last session" }, { value: "settings", label: "Settings" }],
        state: "custom", source: "You changed this on 2026-07-28", exposure: "standard", scope: ["global"]
      },
      "general.resume-runs": {
        id: "general.resume-runs", label: "Resume interrupted Goal runs",
        description: "Offer to continue Goal runs that were cut off by a quit or crash.",
        help: "Runs resume from their last checkpoint, not from scratch.",
        type: "toggle", value: true, defaultValue: true, recommendedValue: true,
        state: "recommended", source: "Recommended default", exposure: "standard", scope: ["global"]
      },
      "general.update-check": {
        id: "general.update-check", label: "Check for updates automatically",
        description: "Look for new Puppet Master releases in the background.",
        help: "Update checks download a small version manifest only.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", exposure: "standard", scope: ["global"]
      },
      "general.update-channel": {
        id: "general.update-channel", label: "Update channel",
        description: "Which release line this installation follows.",
        help: "Your organization manages this setting, so it is read-only here.",
        type: "select", value: "stable", defaultValue: "stable",
        options: [{ value: "stable", label: "Stable" }, { value: "insiders", label: "Insiders" }],
        state: "managed", source: "Managed by your organization", exposure: "managed",
        managedReason: "Managed by your organization — the release channel is fixed for this device.", scope: ["global"]
      },
      "general.update-download": {
        id: "general.update-download", label: "Download updates",
        description: "Fetch updates before you choose to install them.",
        help: "You still decide when to restart and apply an update.",
        type: "select", value: "auto", defaultValue: "auto",
        options: [{ value: "auto", label: "Automatic" }, { value: "manual", label: "Manual" }],
        state: "auto", source: "Automatic", exposure: "standard", scope: ["global"]
      },
      "general.tray-minimize": {
        id: "general.tray-minimize", label: "Minimize to tray instead of closing",
        description: "Closing the window keeps Puppet Master running in the system tray.",
        help: "Automation keeps running while the app is in the tray.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", exposure: "standard", scope: ["global"]
      },
      "general.launch-destination": {
        id: "general.launch-destination", label: "Launch destination",
        description: "The project opened when Puppet Master starts cold.",
        help: "When not configured, the project picker is shown.",
        type: "select", value: "not-configured", defaultValue: "not-configured",
        options: [{ value: "not-configured", label: "Not configured" }, { value: "picker", label: "Project picker" }, { value: "last", label: "Most recent project" }],
        state: "not-configured", source: "Not configured", exposure: "standard", scope: ["global"]
      },
      "general.unsaved-protection": {
        id: "general.unsaved-protection", label: "Protect unsaved buffers",
        description: "Warn before closing windows that hold unsaved editor changes.",
        help: "Recommended: agent runs can hold editor state you have not reviewed yet.",
        type: "toggle", value: true, defaultValue: true, recommendedValue: true,
        state: "recommended", source: "Recommended default", exposure: "standard", scope: ["global"]
      },

      /* ---------- Appearance ---------- */
      "appearance.theme": {
        id: "appearance.theme", label: "Theme",
        description: "The color theme used across Puppet Master.",
        help: "All eight themes keep the same status language; only the material changes. The Appearance manager also previews themes on hover and edits custom TOML themes.",
        type: "select", value: "glass-dark", defaultValue: "friendly-dark",
        options: [
          { value: "friendly-dark", label: "Friendly Dark" }, { value: "friendly-light", label: "Friendly Light" },
          { value: "glass-dark", label: "Glass Dark" }, { value: "glass-light", label: "Glass Light" },
          { value: "retro-dark", label: "Retro Dark" }, { value: "retro-light", label: "Retro Light" },
          { value: "basic-dark", label: "Basic Dark" }, { value: "basic-light", label: "Basic Light" }
        ],
        state: "custom", source: "You changed this on 2026-08-02", exposure: "standard", scope: ["global"],
        search: "color dark light glass retro basic friendly"
      },
      "appearance.follow-system": {
        id: "appearance.follow-system", label: "Follow system appearance",
        description: "Switch between the light and dark variant of your theme with the OS.",
        help: "When on, the fixed theme choice above is ignored.",
        type: "toggle", value: false, defaultValue: false,
        state: "default", source: "Default", exposure: "standard", scope: ["global"]
      },
      "appearance.contrast": {
        id: "appearance.contrast", label: "Interface contrast",
        description: "Strengthen or soften text and border contrast.",
        help: "Halfway matches the theme designer's intent.",
        type: "slider", value: 50, defaultValue: 50, min: 0, max: 100, unit: "%",
        state: "inherited", source: "Inherited from your global settings", exposure: "advanced", scope: ["global", "project"]
      },
      "appearance.density": {
        id: "appearance.density", label: "Layout density",
        description: "How much breathing room lists and panels get.",
        help: "Compact fits more rows on screen; Spacious is calmer.",
        type: "segmented", value: "compact", defaultValue: "comfortable",
        options: [{ value: "compact", label: "Compact" }, { value: "comfortable", label: "Comfortable" }, { value: "spacious", label: "Spacious" }],
        state: "custom", source: "You changed this on 2026-08-05", exposure: "standard", scope: ["global"]
      },
      "appearance.text-size": {
        id: "appearance.text-size", label: "Interface text size",
        description: "Base size for labels and descriptions.",
        help: "Code and terminal text have their own size settings.",
        type: "slider", value: 13, defaultValue: 13, min: 11, max: 16, unit: "px",
        state: "default", source: "Default", exposure: "standard", scope: ["global"]
      },
      "appearance.ui-scale": {
        id: "appearance.ui-scale", label: "UI scale",
        description: "Scale the whole interface for readability.",
        help: "The managed accessibility policy caps scale at 120% on this device.",
        type: "slider", value: 130, defaultValue: 100, min: 80, max: 150, unit: "%",
        state: "effective-differs", source: "Requested by you; capped by policy", exposure: "standard",
        effectiveValue: 120, effectiveReason: "Device accessibility policy caps UI scale at 120%", scope: ["global"]
      },
      "appearance.reduce-motion": {
        id: "appearance.reduce-motion", label: "Reduce interface motion",
        description: "Replace animation with short fades and instant state changes.",
        help: "Match system follows your OS accessibility setting automatically.",
        type: "segmented", value: "auto", defaultValue: "auto",
        options: [{ value: "auto", label: "Match system" }, { value: "on", label: "On" }, { value: "off", label: "Off" }],
        state: "auto", source: "Automatic — follows your OS setting", exposure: "standard", scope: ["global"]
      },
      "appearance.animations": {
        id: "appearance.animations", label: "Interface animations",
        description: "Directed transitions for navigation, expansion, and state changes.",
        help: "Reduced motion overrides this wherever it is active.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", exposure: "advanced", scope: ["global"]
      },

      /* ---------- Notifications and Sounds ---------- */
      "notifications.inapp-inbox": {
        id: "notifications.inapp-inbox", label: "In-app title-bar inbox",
        description: "Show the notification count and sprout inbox in the title bar.",
        help: "This is the only in-app notification surface — there is no bottom-right stack, no status-bar bell, and no Activity Bar shortcut.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", exposure: "standard", scope: ["global"],
        search: "notifications bell alerts title bar sprout inbox"
      },
      "notifications.system-tray": {
        id: "notifications.system-tray", label: "System tray notifications",
        description: "Also send notifications to the operating system's notification center.",
        help: "OS focus rules may still suppress banners.",
        type: "toggle", value: true, defaultValue: false,
        state: "custom", source: "You changed this on 2026-07-30", exposure: "standard", scope: ["global"]
      },
      "notifications.quiet-hours": {
        id: "notifications.quiet-hours", label: "Quiet hours",
        description: "Hold non-critical notifications during a daily time window.",
        help: "Approval requests and failures always come through.",
        type: "text", value: "not-configured", defaultValue: "not-configured", placeholder: "e.g. 22:00 – 07:00",
        state: "not-configured", source: "Not configured", exposure: "standard", scope: ["global"]
      },
      "notifications.master-sound": {
        id: "notifications.master-sound", label: "Play sounds",
        description: "Play a sound for mapped notification events.",
        help: "Sound is never the only indication of failure, blocked work, approval, or completion — every audible event also has a visual state.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", exposure: "standard", scope: ["global"]
      },
      "notifications.volume": {
        id: "notifications.volume", label: "Notification volume",
        description: "Loudness of notification sounds relative to the system volume.",
        help: "Preview sounds in the Sound library before turning them up.",
        type: "slider", value: 40, defaultValue: 60, min: 0, max: 100, unit: "%",
        state: "custom", source: "You changed this on 2026-08-06", exposure: "standard", scope: ["global"]
      },
      "notifications.completion-sound": {
        id: "notifications.completion-sound", label: "Completion sound",
        description: "The sound played when a Goal run completes successfully.",
        help: "Built-in assets carry their source, license, and hash in the Sound library.",
        type: "select", value: "chime-soft", defaultValue: "chime-soft",
        options: [{ value: "chime-soft", label: "Soft Chime (built in)" }, { value: "bell-desk", label: "Desk Bell (built in)" }, { value: "none", label: "No sound" }],
        state: "default", source: "Default", exposure: "standard", scope: ["global"]
      },
      "notifications.tray-automation": {
        id: "notifications.tray-automation",
        label: "Benachrichtigungen im Infobereich während laufender Automatisierung bündeln",
        description: "While automation runs, tray notifications collapse into one summary entry instead of one banner per event. (Long localized labels wrap instead of clipping.)",
        help: "The summary expands when the run finishes.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", exposure: "standard", scope: ["global"]
      },
      "notifications.grouping": {
        id: "notifications.grouping", label: "Group related notifications",
        description: "Collapse repeated events from the same source into one inbox entry.",
        help: "Grouped entries still list every event when opened.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", exposure: "advanced", scope: ["global"]
      },

      /* ---------- AI and Providers ---------- */
      "providers.account-switch-scope": {
        id: "providers.account-switch-scope", label: "Account changes apply to",
        description: "What happens when you pick a different account on a provider.",
        help: "Future requests only is the safe default: a request already in flight always keeps the account it started with.",
        type: "select", value: "future", defaultValue: "future", recommendedValue: "future",
        options: [{ value: "future", label: "Future requests only" }, { value: "thread", label: "This thread" }, { value: "global", label: "Everything, including running work" }],
        state: "recommended", source: "Recommended default", exposure: "standard", scope: ["global"]
      },
      "providers.sticky-sessions": {
        id: "providers.sticky-sessions", label: "Keep threads on their starting account",
        description: "A thread stays on the account it began with, even if you switch elsewhere.",
        help: "Turn this off to let long threads ride along with global account switches.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", exposure: "standard", scope: ["global"]
      },
      "providers.reconnect-on-launch": {
        id: "providers.reconnect-on-launch", label: "Reconnect installed tools on launch",
        description: "Re-verify CLI profiles and server connections when Puppet Master starts.",
        help: "Recommended so stale sign-ins surface before you depend on them.",
        type: "toggle", value: false, defaultValue: true,
        state: "custom", source: "You changed this on 2026-07-25", exposure: "advanced", scope: ["global"]
      },
      "providers.catalog-refresh": {
        id: "providers.catalog-refresh", label: "Model catalog refresh",
        description: "How often catalogs such as models.dev are re-checked in the background.",
        help: "A failed refresh keeps the last-known-good catalog; your model list never disappears while refreshing.",
        type: "select", value: "auto", defaultValue: "auto",
        options: [{ value: "auto", label: "Automatic" }, { value: "daily", label: "Daily" }, { value: "manual", label: "Manual" }],
        state: "auto", source: "Automatic", exposure: "standard", scope: ["global"]
      },
      "providers.show-hidden-models": {
        id: "providers.show-hidden-models", label: "Show hidden models",
        description: "Include models you hid when browsing provider catalogs.",
        help: "Hidden models stay unavailable to routing either way.",
        type: "toggle", value: false, defaultValue: false,
        state: "default", source: "Default", exposure: "standard", scope: ["global"]
      },
      "providers.capability-probes": {
        id: "providers.capability-probes", label: "Run safe capability probes",
        description: "Send one tiny test request per model to verify tools, vision, and structured output claims.",
        help: "Probes are small but real requests, so they count toward usage.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", exposure: "advanced", scope: ["global"],
        effect: { kind: "cost", note: "Probes are real requests and count toward usage" }
      },
      "providers.route-priority-mode": {
        id: "providers.route-priority-mode", label: "Route priority",
        description: "Whether provider order is yours or adjusted by live health.",
        help: "Automatic demotes routes that are failing or exhausted.",
        type: "segmented", value: "manual", defaultValue: "auto",
        options: [{ value: "auto", label: "Automatic" }, { value: "manual", label: "My order" }],
        state: "custom", source: "You changed this on 2026-08-01", exposure: "advanced", scope: ["global"]
      },
      "providers.use-next-on-exhaust": {
        id: "providers.use-next-on-exhaust", label: "Use the next provider when one runs out",
        description: "Allow automatic failover down the priority list when a route exhausts.",
        help: "Off means Puppet Master stops and asks instead.",
        type: "toggle", value: true, defaultValue: false,
        state: "custom", source: "You changed this on 2026-08-01", exposure: "standard", scope: ["global"]
      },
      "providers.cross-provider-fallback": {
        id: "providers.cross-provider-fallback", label: "Allow mid-thread provider switches",
        description: "Let a thread continue on a different provider after a failure.",
        help: "Off keeps each thread on one provider for consistent behavior.",
        type: "toggle", value: false, defaultValue: false,
        state: "default", source: "Default", exposure: "advanced", scope: ["global"]
      },
      "providers.planning-quality-guard": {
        id: "providers.planning-quality-guard", label: "Protect planning conversations from weak routes",
        description: "PRD Builder and Planning Wizard discussion always uses a high-quality conversational route.",
        help: "Background extraction and classification may use cheaper routes; user-facing planning never silently downgrades.",
        type: "toggle", value: true, defaultValue: true, recommendedValue: true,
        state: "recommended", source: "Recommended default", exposure: "standard", scope: ["global"]
      },
      "providers.verifier-route": {
        id: "providers.verifier-route", label: "Verifier route",
        description: "The model route that audits work before it is marked done.",
        help: "Verification stays optional until you choose a route. Pick any provider with tool support.",
        type: "select", value: "not-configured", defaultValue: "not-configured",
        options: [{ value: "not-configured", label: "Not configured" }, { value: "claude-sonnet", label: "Claude Sonnet · Anthropic · Personal" }, { value: "gpt5-mini", label: "GPT-5 Mini · GitHub Copilot" }],
        state: "not-configured", source: "Not configured", exposure: "standard", scope: ["global"],
        search: "audit verification reviewer route"
      },
      "providers.low-usage-behavior": {
        id: "providers.low-usage-behavior", label: "When a provider runs low",
        description: "The default reaction when an included allowance is nearly exhausted.",
        help: "Each provider can override this with its own supported choices.",
        type: "select", value: "ask", defaultValue: "ask",
        options: [{ value: "ask", label: "Ask each time" }, { value: "switch", label: "Switch to the next route" }, { value: "stop", label: "Stop and wait" }],
        state: "custom", source: "You changed this on 2026-07-29", exposure: "standard", scope: ["global"]
      },

      /* ---------- Context and Memory ---------- */
      "context.use-previous-chats": {
        id: "context.use-previous-chats", label: "Use relevant previous chats automatically",
        description: "Let the assistant pull short excerpts from earlier threads when they help.",
        help: "Only relevant excerpts are sent, never whole transcripts.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", exposure: "standard", scope: ["global"]
      },
      "context.use-project-code": {
        id: "context.use-project-code", label: "Use relevant project code automatically",
        description: "Let agents retrieve matching code from the project index while working.",
        help: "Retrieval is bounded and logged in the context admission receipt.",
        type: "toggle", value: true, defaultValue: false,
        state: "custom", source: "You changed this on 2026-08-03", exposure: "standard", scope: ["global", "project"]
      },
      "context.use-logs": {
        id: "context.use-logs", label: "Use relevant logs automatically",
        description: "Let agents consult recent run logs when debugging.",
        help: "Logs can contain paths and command output from your machine.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", exposure: "standard", scope: ["global"],
        effect: { kind: "privacy", note: "Logs may contain local paths and command output" }
      },
      "context.include-scoped-instructions": {
        id: "context.include-scoped-instructions", label: "Include scoped project instructions",
        description: "Admit the AGENTS.md chain that applies to the current folder.",
        help: "Scopes merge by precedence: user, then project, then folder — the nearest scope wins. The advanced panel shows the full precedence chain.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", exposure: "standard", scope: ["global"]
      },
      "context.include-parent-summary": {
        id: "context.include-parent-summary", label: "Include parent-agent summary",
        description: "Give child agents the summary from the agent that spawned them.",
        help: "Summaries keep children oriented without copying the whole parent context.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", exposure: "standard", scope: ["global"]
      },
      "context.include-attempt-journal": {
        id: "context.include-attempt-journal", label: "Include current attempt journal",
        description: "Admit the running journal of attempts and failures for this task.",
        help: "Off saves context space but hides why earlier attempts failed.",
        type: "toggle", value: false, defaultValue: true,
        state: "custom", source: "You changed this on 2026-08-04", exposure: "advanced", scope: ["global"]
      },
      "context.compaction-auto": {
        id: "context.compaction-auto", label: "Compact automatically when needed",
        description: "Summarize older turns when a conversation nears the context limit.",
        help: "Compaction keeps the conversation going instead of failing at the limit.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", exposure: "standard", scope: ["global"]
      },
      "context.compaction-threshold": {
        id: "context.compaction-threshold", label: "Compact when context reaches",
        description: "The fill level that triggers automatic compaction.",
        help: "Lower values compact earlier and keep more headroom for long replies.",
        type: "slider", value: 85, defaultValue: 92, min: 60, max: 98, unit: "%",
        state: "custom", source: "You changed this on 2026-08-04", exposure: "advanced", scope: ["global"]
      },
      "context.compaction-safeguard": {
        id: "context.compaction-safeguard", label: "Keep a verification summary when compacting",
        description: "Preserve a checklist of verified facts and open questions across compaction.",
        help: "Recommended: without it, compaction can quietly drop confirmed details.",
        type: "toggle", value: false, defaultValue: false, recommendedValue: true,
        state: "recommended", source: "Recommended — currently off", exposure: "standard", scope: ["global"]
      },
      "context.memory-enabled": {
        id: "context.memory-enabled", label: "Assistant memory",
        description: "Remember evidence-backed Gists across sessions.",
        help: "Reconnect required so the memory index reloads cleanly.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", exposure: "standard", scope: ["global"],
        reconnectRequired: true
      },
      "context.memory-review": {
        id: "context.memory-review", label: "Review new memories before they are used",
        description: "Hold freshly learned Gists as awaiting review until you verify them.",
        help: "Recommended: unreviewed memories can otherwise influence answers immediately.",
        type: "toggle", value: true, defaultValue: true, recommendedValue: true,
        state: "recommended", source: "Recommended default", exposure: "standard", scope: ["global"]
      },
      "context.memory-half-life": {
        id: "context.memory-half-life", label: "Memory half-life",
        description: "How quickly unused memories fade from active context.",
        help: "Fading means a memory leaves the active retrieval set — it is never deleted or treated as false.",
        type: "slider", value: 45, defaultValue: 30, min: 7, max: 180, unit: "days",
        state: "custom", source: "You changed this on 2026-07-22", exposure: "advanced", scope: ["global"]
      },

      /* ---------- Personas and Crew ---------- */
      "personas.default-thread": {
        id: "personas.default-thread", label: "Default persona for new threads",
        description: "The persona applied to new threads in this project.",
        help: "Child-only personas such as Explorer and Bash cannot be picked here.",
        type: "select", value: "collaborator", defaultValue: "assistant",
        options: [{ value: "assistant", label: "Assistant" }, { value: "collaborator", label: "Collaborator" }, { value: "general", label: "General" }, { value: "overseer", label: "Overseer" }, { value: "teacher", label: "Teacher" }],
        state: "custom", source: "You changed this on 2026-08-06", exposure: "standard", scope: ["global", "project"]
      },
      "personas.default-project": {
        id: "personas.default-project", label: "Project persona override",
        description: "A persona this project prefers over the global default.",
        help: "Inherited means the project follows your global default.",
        type: "select", value: "inherit", defaultValue: "inherit",
        options: [{ value: "inherit", label: "Inherit" }, { value: "assistant", label: "Assistant" }, { value: "researcher", label: "Researcher" }, { value: "overseer", label: "Overseer" }],
        state: "inherited", source: "Inherited from your global settings", exposure: "standard", scope: ["project"]
      },
      "personas.eager-skills": {
        id: "personas.eager-skills", label: "Let personas eager-load all skills",
        description: "Allow a persona to pull every installed skill into context at turn start.",
        help: "A persona is behavior, not authority: it cannot grant Full Access, widen FileSafe, force a provider, or eager-load all skills.",
        type: "toggle", value: false, defaultValue: false,
        state: "unavailable", source: "Unavailable by design", exposure: "unavailable",
        unavailableReason: "Unavailable — personas shape behavior, they cannot widen capability. Skills load when they become relevant.", scope: ["global"]
      },
      "crew.route-policy": {
        id: "crew.route-policy", label: "Default Crew route policy",
        description: "Whether Crew members stick to their listed candidate models.",
        help: "Adaptive may substitute a healthy route when a candidate is exhausted.",
        type: "segmented", value: "adaptive", defaultValue: "adaptive",
        options: [{ value: "strict", label: "Strict" }, { value: "adaptive", label: "Adaptive" }],
        state: "default", source: "Default", exposure: "advanced", scope: ["global"]
      },
      "crew.max-members": {
        id: "crew.max-members", label: "Crew size ceiling",
        description: "The most members a Crew template may request.",
        help: "Requested is not effective — the Orchestrator queues what capacity cannot run.",
        type: "number", value: 8, defaultValue: 4, min: 1, max: 16,
        state: "effective-differs", source: "Requested by you; capped by current capacity", exposure: "standard",
        effectiveValue: 4, effectiveReason: "Current Usage capacity admits at most 4 members at once", scope: ["global"]
      },
      "crew.isolation": {
        id: "crew.isolation", label: "Crew isolation",
        description: "How Crew members share the filesystem.",
        help: "Worktree gives every member its own checkout.",
        type: "select", value: "worktree", defaultValue: "worktree", recommendedValue: "worktree",
        options: [{ value: "worktree", label: "Worktree per member" }, { value: "shared-ro", label: "Shared, read-only for reviewers" }, { value: "shared", label: "Shared workspace" }],
        state: "recommended", source: "Recommended default", exposure: "advanced", scope: ["global"]
      },

      /* ---------- Goal and Automation ---------- */
      "goal.worker-ceiling": {
        id: "goal.worker-ceiling", label: "Goal worker ceiling",
        description: "The most Goal workers Puppet Master may run at once.",
        help: "A configured ceiling, not a promise — the Orchestrator makes the live call from current capacity.",
        type: "number", value: 6, defaultValue: 4, min: 1, max: 16,
        state: "custom", source: "You changed this on 2026-08-02", exposure: "standard", scope: ["global"]
      },
      "goal.spend-guard": {
        id: "goal.spend-guard", label: "Spend guard per Goal run",
        description: "A soft budget ceiling for one Goal run.",
        help: "Auto tracks your Usage projections instead of a fixed number.",
        type: "text", value: "auto", defaultValue: "auto", placeholder: "e.g. $5.00",
        state: "auto", source: "Automatic — follows Usage projections", exposure: "advanced", scope: ["global"]
      },
      "goal.checkpoints": {
        id: "goal.checkpoints", label: "Checkpoint and compact automatically",
        description: "Save resumable checkpoints during long Goal runs.",
        help: "Checkpoints are what let interrupted runs resume.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", exposure: "standard", scope: ["global"]
      },
      "goal.require-verification": {
        id: "goal.require-verification", label: "Require verification before done",
        description: "Work must pass the verifier route before it is marked complete.",
        help: "Needs a verifier route — none is configured yet.",
        type: "toggle", value: false, defaultValue: false,
        state: "unavailable", source: "Unavailable until setup completes", exposure: "unavailable",
        unavailableReason: "Unavailable until a verifier route is configured under AI and Providers · Agent roles.", scope: ["global"]
      },
      "goal.audit-strength": {
        id: "goal.audit-strength", label: "Audit strength",
        description: "How deep verification audits go.",
        help: "Deep audits re-run the test suite and inspect the diff line by line.",
        type: "select", value: "standard", defaultValue: "standard",
        options: [{ value: "light", label: "Light" }, { value: "standard", label: "Standard" }, { value: "deep", label: "Deep" }],
        state: "default", source: "Default", exposure: "advanced", scope: ["global"]
      },
      "goal.verification-reserve": {
        id: "goal.verification-reserve", label: "Reserve capacity for verification and repair",
        description: "Hold back one worker slot so verification is never starved by implementation.",
        help: "Without a reserve, big runs can spend the whole budget on implementation.",
        type: "toggle", value: true, defaultValue: true, recommendedValue: true,
        state: "recommended", source: "Recommended default", exposure: "advanced", scope: ["global"]
      },
      "goal.bsd-mode": {
        id: "goal.bsd-mode", label: "Back Seat Driver",
        description: "A read-only second pair of eyes that flags risky turns and contradictions.",
        help: "Auto runs only when risk and phase triggers justify it. On inspects every turn. Back Seat Driver cannot widen authority or block primary work on its own failure.",
        type: "segmented", value: "auto", defaultValue: "auto",
        options: [{ value: "off", label: "Off" }, { value: "auto", label: "Auto" }, { value: "on", label: "On" }],
        state: "auto", source: "Automatic — the system default", exposure: "standard", scope: ["global"],
        search: "bsd back seat driver review second opinion"
      },
      "goal.bsd-usage-guard": {
        id: "goal.bsd-usage-guard", label: "Back Seat Driver usage guard",
        description: "A usage ceiling that pauses BSD reviews before they pressure your allowance.",
        help: "Auto derives the guard from your Usage projections.",
        type: "text", value: "auto", defaultValue: "auto", placeholder: "e.g. 5% of allowance",
        state: "auto", source: "Automatic", exposure: "advanced", scope: ["global"]
      },
      "goal.bsd-latency-budget": {
        id: "goal.bsd-latency-budget", label: "Back Seat Driver latency budget",
        description: "How long a BSD review may run before it is skipped for that turn.",
        help: "Skipped reviews are logged, never retried in the hot path.",
        type: "slider", value: 8, defaultValue: 8, min: 2, max: 30, unit: "s",
        state: "default", source: "Default", exposure: "expert", scope: ["global"]
      },

      /* ---------- Permissions and Security ---------- */
      "permissions.default-approval": {
        id: "permissions.default-approval", label: "Default approval for risky actions",
        description: "The baseline for actions like writing files or running commands.",
        help: "Ask each time is the safest baseline; FileSafe still guards protected writes either way.",
        type: "select", value: "ask", defaultValue: "ask", recommendedValue: "ask",
        options: [{ value: "ask", label: "Ask each time" }, { value: "edits", label: "Auto accept edits" }, { value: "auto", label: "Auto" }, { value: "full", label: "Full Access" }],
        state: "recommended", source: "Recommended default", exposure: "standard", scope: ["global", "project"],
        search: "access profile ask approval auto full access"
      },
      "permissions.approval-duration": {
        id: "permissions.approval-duration", label: "Approval duration",
        description: "How long a granted approval lasts.",
        help: "Persistent grants are listed in the approval log and can be revoked anytime.",
        type: "select", value: "session", defaultValue: "once",
        options: [{ value: "once", label: "Once" }, { value: "session", label: "This session" }, { value: "persistent", label: "Persistent" }],
        state: "custom", source: "You changed this on 2026-07-26", exposure: "standard", scope: ["global"]
      },
      "permissions.auto-approve-reads": {
        id: "permissions.auto-approve-reads", label: "Auto-approve read-only tools",
        description: "Let read-only tools run without asking.",
        help: "Writes and commands always follow the approval settings above.",
        type: "toggle", value: true, defaultValue: false,
        state: "custom", source: "You changed this on 2026-07-26", exposure: "standard", scope: ["global"]
      },
      "permissions.wildcard-default": {
        id: "permissions.wildcard-default", label: "Global wildcard default",
        description: "The rule that applies when no more specific rule matches.",
        help: "Granular rules are evaluated in order; the last match wins. The Permissions manager traces a sample path through your rules.",
        type: "select", value: "ask", defaultValue: "ask",
        options: [{ value: "ask", label: "Ask each time" }, { value: "deny", label: "Deny" }, { value: "allow-read", label: "Allow read-only" }],
        state: "default", source: "Default", exposure: "advanced", scope: ["global"]
      },
      "permissions.doom-loop-threshold": {
        id: "permissions.doom-loop-threshold", label: "Doom-loop threshold",
        description: "How many identical denied requests in a row trigger the doom-loop action.",
        help: "A doom loop is an agent repeatedly retrying an action that keeps being denied.",
        type: "number", value: 5, defaultValue: 3, min: 2, max: 20,
        state: "custom", source: "You changed this on 2026-08-07", exposure: "expert", scope: ["global"]
      },
      "permissions.doom-loop-action": {
        id: "permissions.doom-loop-action", label: "Doom-loop action",
        description: "What happens when the doom-loop threshold is hit.",
        help: "Pause and summarize stops the retries and explains the situation in the thread.",
        type: "select", value: "pause", defaultValue: "pause",
        options: [{ value: "pause", label: "Pause and summarize" }, { value: "stop", label: "Stop the run" }, { value: "ignore", label: "Keep asking" }],
        state: "default", source: "Default", exposure: "expert", scope: ["global"]
      },
      "permissions.filesafe-enabled": {
        id: "permissions.filesafe-enabled", label: "FileSafe protected writes",
        description: "Route every agent file write through FileSafe staging and review.",
        help: "Managed by your organization, so it cannot be turned off here.",
        type: "toggle", value: true, defaultValue: true,
        state: "managed", source: "Managed by your organization", exposure: "managed",
        managedReason: "Managed by your organization — FileSafe is the non-bypassable floor for agent writes.", scope: ["global"]
      },
      "permissions.filesafe-mode": {
        id: "permissions.filesafe-mode", label: "FileSafe sandbox coverage",
        description: "How much of the workspace FileSafe currently protects.",
        help: "Partial coverage leaves build output directories outside the sandbox. Complete setup to close the gap.",
        type: "select", value: "partial", defaultValue: "full",
        options: [{ value: "full", label: "Full workspace" }, { value: "partial", label: "Partial — build outputs excluded" }],
        state: "custom", source: "Setup incomplete — changed 2026-07-19", exposure: "standard", scope: ["project"]
      },
      "permissions.filesafe-extra-paths": {
        id: "permissions.filesafe-extra-paths", label: "Paths FileSafe may write without review",
        description: "Additional directories exempt from FileSafe staging.",
        help: "When not configured, every write goes through staging.",
        type: "path", value: "not-configured", defaultValue: "not-configured", placeholder: "One path per line",
        state: "not-configured", source: "Not configured", exposure: "expert", scope: ["global", "project"]
      },

      /* ---------- Developer Tools ---------- */
      "devtools.lsp-autostart": {
        id: "devtools.lsp-autostart", label: "Start language servers automatically",
        description: "Launch a language server when you open a supported file.",
        help: "Restart required so running servers are replaced consistently.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", exposure: "standard", scope: ["global"],
        restartRequired: true
      },
      "devtools.lsp-diagnostics": {
        id: "devtools.lsp-diagnostics", label: "Diagnostics verbosity",
        description: "How much language-server feedback surfaces in Problems.",
        help: "Errors and warnings is the balanced choice.",
        type: "select", value: "balanced", defaultValue: "balanced",
        options: [{ value: "errors", label: "Errors only" }, { value: "balanced", label: "Errors and warnings" }, { value: "all", label: "Everything, including hints" }],
        state: "default", source: "Default", exposure: "standard", scope: ["global", "project"]
      },
      "devtools.lsp-memory-limit": {
        id: "devtools.lsp-memory-limit", label: "Language server memory limit",
        description: "The most memory one language server may use before it is restarted.",
        help: "Auto sizes the limit from your machine's RAM.",
        type: "text", value: "auto", defaultValue: "auto", placeholder: "e.g. 4 GB",
        state: "auto", source: "Automatic", exposure: "diagnostic", scope: ["global"]
      },
      "devtools.format-on-save": {
        id: "devtools.format-on-save", label: "Format on save",
        description: "Run the active formatter whenever you save a file.",
        help: "The formatter is the one chosen under Formatters.",
        type: "toggle", value: true, defaultValue: false,
        state: "custom", source: "You changed this on 2026-08-08", exposure: "standard", scope: ["global", "project"]
      },
      "devtools.formatting-owner": {
        id: "devtools.formatting-owner", label: "Formatting owner",
        description: "Who wins when the editor and a language server both offer formatting.",
        help: "Ask each time surfaces the conflict instead of picking silently.",
        type: "select", value: "lsp", defaultValue: "lsp",
        options: [{ value: "editor", label: "Editor formatter" }, { value: "lsp", label: "Language server" }, { value: "ask", label: "Ask each time" }],
        state: "default", source: "Default", exposure: "advanced", scope: ["global"]
      },
      "devtools.formatter-timeout": {
        id: "devtools.formatter-timeout", label: "Formatter timeout",
        description: "How long a formatter may run before the save completes unformatted.",
        help: "Timeouts are logged in the formatter's diagnostics.",
        type: "number", value: 3000, defaultValue: 3000, min: 250, max: 20000,
        state: "default", source: "Default", exposure: "diagnostic", scope: ["global"]
      },
      "devtools.mcp-tool-exposure": {
        id: "devtools.mcp-tool-exposure", label: "MCP tool exposure",
        description: "How much of each server's tool list enters model context.",
        help: "Progressive loads tool schemas only when they become relevant.",
        type: "segmented", value: "progressive", defaultValue: "full",
        options: [{ value: "full", label: "Full" }, { value: "progressive", label: "Progressive" }, { value: "minimal", label: "Minimal" }],
        state: "custom", source: "You changed this on 2026-08-09", exposure: "advanced", scope: ["global"]
      },
      "devtools.mcp-approval": {
        id: "devtools.mcp-approval", label: "MCP approval policy",
        description: "How calls into external servers are approved.",
        help: "Reconnect required: policy changes apply to fresh server sessions.",
        type: "select", value: "per-server", defaultValue: "per-server",
        options: [{ value: "per-server", label: "Per server" }, { value: "per-call", label: "Every call" }, { value: "session", label: "Once per session" }],
        state: "default", source: "Default", exposure: "advanced", scope: ["global"],
        reconnectRequired: true
      },
      "devtools.mcp-reconnect": {
        id: "devtools.mcp-reconnect", label: "Reconnect MCP servers on launch",
        description: "Restart configured servers when Puppet Master starts.",
        help: "Off leaves servers stopped until something calls them.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", exposure: "standard", scope: ["global"]
      },

      /* ---------- Terminal and Editor ---------- */
      "terminal.editor-font-size": {
        id: "terminal.editor-font-size", label: "Editor font size",
        description: "Text size in code editors.",
        help: "Interface text has its own size setting under Appearance.",
        type: "number", value: 14, defaultValue: 13, min: 9, max: 28,
        state: "custom", source: "You changed this on 2026-07-31", exposure: "standard", scope: ["global"]
      },
      "terminal.tab-size": {
        id: "terminal.tab-size", label: "Tab size",
        description: "Spaces per indentation level in the editor.",
        help: "Inherited from your global settings; project files with their own convention still win.",
        type: "number", value: 2, defaultValue: 2, min: 1, max: 8,
        state: "inherited", source: "Inherited from your global settings", exposure: "standard", scope: ["global", "project"]
      },
      "terminal.word-wrap": {
        id: "terminal.word-wrap", label: "Wrap long lines",
        description: "Soft-wrap editor lines at the window edge.",
        help: "Minimap and diff editors have their own wrapping behavior.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", exposure: "standard", scope: ["global"]
      },
      "terminal.default-profile": {
        id: "terminal.default-profile", label: "Default terminal profile",
        description: "The profile new terminal tabs start with.",
        help: "The Work profile is partially set up — it inherits what it lacks from Default.",
        type: "select", value: "default-pwsh", defaultValue: "default-pwsh",
        options: [{ value: "default-pwsh", label: "Default (PowerShell)" }, { value: "work", label: "Work — setup incomplete" }],
        state: "default", source: "Default", exposure: "standard", scope: ["global"]
      },
      "terminal.font-size": {
        id: "terminal.font-size", label: "Terminal font size",
        description: "Text size in integrated terminals.",
        help: "Profiles can override this individually.",
        type: "number", value: 13, defaultValue: 13, min: 9, max: 24,
        state: "default", source: "Default", exposure: "standard", scope: ["global"]
      },
      "terminal.scrollback": {
        id: "terminal.scrollback", label: "Terminal scrollback",
        description: "Lines of output each terminal keeps.",
        help: "You asked for 50,000 lines; the managed memory policy caps it at 10,000.",
        type: "number", value: 50000, defaultValue: 5000, min: 1000, max: 100000,
        state: "effective-differs", source: "Requested by you; capped by policy", exposure: "standard",
        effectiveValue: 10000, effectiveReason: "Managed memory policy caps scrollback at 10,000 lines", scope: ["global"]
      },
      "terminal.shell-path": {
        id: "terminal.shell-path", label: "Default shell",
        description: "The shell used by new terminals and run tasks.",
        help: "An absolute path to a shell binary on this machine. Validation checks the path exists and is executable.",
        type: "path", value: "C:\\Program Files\\PowerShell\\7\\pwsh.exe", defaultValue: "auto",
        state: "custom", source: "You changed this on 2026-08-05", exposure: "advanced", scope: ["global"],
        search: "shell pwsh powershell bash cmd executable path validation"
      },
      "terminal.shell-startup": {
        id: "terminal.shell-startup", label: "Shell startup command",
        description: "A command run at the start of every new terminal.",
        help: "Not configured, so terminals open straight at the prompt.",
        type: "text", value: "not-configured", defaultValue: "not-configured", placeholder: "e.g. $PROFILE",
        state: "not-configured", source: "Not configured", exposure: "advanced", scope: ["global"]
      },
      "terminal.env-policy": {
        id: "terminal.env-policy", label: "Terminal environment",
        description: "Which environment variables new terminals receive.",
        help: "Inherit passes the app's environment through unchanged.",
        type: "select", value: "inherit", defaultValue: "inherit",
        options: [{ value: "inherit", label: "Inherit" }, { value: "scrubbed", label: "Scrubbed — secrets removed" }, { value: "custom", label: "Custom allowlist" }],
        state: "inherited", source: "Inherited from your global settings", exposure: "advanced", scope: ["global", "project"]
      },
      "terminal.tree-show-hidden": {
        id: "terminal.tree-show-hidden", label: "Show hidden files in the tree",
        description: "Display dotfiles and OS-hidden entries in the file tree.",
        help: "Ignored files follow the separate ignore rules.",
        type: "toggle", value: false, defaultValue: false,
        state: "default", source: "Default", exposure: "standard", scope: ["global", "project"]
      },
      "terminal.large-file-threshold": {
        id: "terminal.large-file-threshold", label: "Large file warning threshold",
        description: "Files larger than this open read-only with a performance warning.",
        help: "Very large files skip syntax highlighting either way.",
        type: "slider", value: 25, defaultValue: 10, min: 1, max: 200, unit: "MB",
        state: "custom", source: "You changed this on 2026-07-21", exposure: "advanced", scope: ["global"]
      },
      "terminal.changed-on-disk": {
        id: "terminal.changed-on-disk", label: "When a file changes on disk",
        description: "What the editor does when an open file is modified outside Puppet Master.",
        help: "Recommended: compare and ask — silent reloads can erase unsaved edits.",
        type: "select", value: "compare", defaultValue: "compare", recommendedValue: "compare",
        options: [{ value: "compare", label: "Compare and ask" }, { value: "reload", label: "Reload automatically" }, { value: "keep", label: "Keep my buffer" }],
        state: "recommended", source: "Recommended default", exposure: "standard", scope: ["global"]
      },

      /* ---------- Source Control ---------- */
      "sc.worktree-provisioning": {
        id: "sc.worktree-provisioning", label: "Automatic worktrees for agents",
        description: "Give each agent run its own git worktree.",
        help: "Ask each time keeps you in the loop for small tasks.",
        type: "select", value: "always", defaultValue: "ask",
        options: [{ value: "always", label: "Always" }, { value: "ask", label: "Ask each time" }, { value: "never", label: "Never" }],
        state: "custom", source: "You changed this on 2026-08-03", exposure: "standard", scope: ["global", "project"]
      },
      "sc.worktree-cleanup": {
        id: "sc.worktree-cleanup", label: "Clean up merged worktrees",
        description: "When merged agent worktrees are removed.",
        help: "Cleanup never deletes unmerged work.",
        type: "select", value: "weekly", defaultValue: "weekly",
        options: [{ value: "immediate", label: "Immediately after merge" }, { value: "weekly", label: "Weekly" }, { value: "manual", label: "Manual" }],
        state: "default", source: "Default", exposure: "advanced", scope: ["global"]
      },
      "sc.protect-main": {
        id: "sc.protect-main", label: "Require approval to commit on main",
        description: "Agents must ask before committing directly to the main branch.",
        help: "Worktree branches never need this approval.",
        type: "toggle", value: true, defaultValue: false,
        state: "custom", source: "You changed this on 2026-08-03", exposure: "standard", scope: ["global", "project"]
      },
      "sc.forge-connection": {
        id: "sc.forge-connection", label: "Forge connection",
        description: "The hosting service used for pull requests and Actions.",
        help: "Not configured — connect a forge to browse runs and open pull requests from here.",
        type: "select", value: "not-configured", defaultValue: "not-configured",
        options: [{ value: "not-configured", label: "Not configured" }, { value: "github", label: "GitHub" }, { value: "gitlab", label: "GitLab" }],
        state: "not-configured", source: "Not configured", exposure: "standard", scope: ["project"],
        search: "github gitlab forge hosting pull request actions"
      },
      "sc.ssh-source": {
        id: "sc.ssh-source", label: "SSH source for git operations",
        description: "Which SSH agent or key store git uses when talking to remotes.",
        help: "Inherited uses the OS-native agent.",
        type: "select", value: "inherit", defaultValue: "inherit",
        options: [{ value: "inherit", label: "Inherit from OS" }, { value: "pageant", label: "Pageant" }, { value: "custom", label: "Custom socket" }],
        state: "inherited", source: "Inherited from your global settings", exposure: "advanced", scope: ["global", "project"]
      },
      "sc.test-before-merge": {
        id: "sc.test-before-merge", label: "Require tests before merging agent work",
        description: "Agent worktree branches run the project's test suite before they may merge.",
        help: "Recommended: failures stay in the worktree instead of reaching main.",
        type: "toggle", value: true, defaultValue: true, recommendedValue: true,
        state: "recommended", source: "Recommended default", exposure: "standard", scope: ["global", "project"]
      },
      "sc.push-policy": {
        id: "sc.push-policy", label: "Agent push policy",
        description: "When agents may push branches to the remote.",
        help: "On approval keeps every push behind your go-ahead.",
        type: "select", value: "approval", defaultValue: "approval",
        options: [{ value: "approval", label: "On approval" }, { value: "worktree-only", label: "Worktree branches freely" }, { value: "never", label: "Never" }],
        state: "default", source: "Default", exposure: "standard", scope: ["global"]
      },
      "sc.force-push": {
        id: "sc.force-push", label: "Force-push by agents",
        description: "Whether agents may force-push, and under what protection.",
        help: "With lease refuses the push when the remote moved since your last fetch.",
        type: "select", value: "lease", defaultValue: "never",
        options: [{ value: "never", label: "Never" }, { value: "lease", label: "With lease only" }, { value: "free", label: "Freely" }],
        state: "custom", source: "You changed this on 2026-08-04", exposure: "expert", risky: true, scope: ["global"]
      },
      "sc.lfs": {
        id: "sc.lfs", label: "Git LFS support",
        description: "Track large binary files with Git Large File Storage.",
        help: "Unavailable because git-lfs is not installed on this machine. Install it from the official Git LFS source to enable this row.",
        type: "toggle", value: false, defaultValue: false,
        state: "unavailable", source: "Unavailable — dependency missing", exposure: "unavailable",
        unavailableReason: "Unavailable — git-lfs was not found on this machine. Install it from the official Git LFS source, then return here.", scope: ["global"]
      },

      /* ---------- System and Storage ---------- */
      "system.storage-mode": {
        id: "system.storage-mode", label: "Storage mode",
        description: "Where Puppet Master keeps project data, indexes, and artifacts.",
        help: "Migration between modes is transactional and verified before the old data is released.",
        type: "select", value: "local-ssd", defaultValue: "local-ssd",
        options: [{ value: "local-ssd", label: "Local SSD" }, { value: "home-server", label: "Home Server" }, { value: "external", label: "External drive" }],
        state: "default", source: "Default", exposure: "advanced", scope: ["global"]
      },
      "system.retention-anchor": {
        id: "system.retention-anchor", label: "Retention anchor",
        description: "What retention periods are measured from.",
        help: "Last activity keeps frequently used projects' data longer.",
        type: "select", value: "last-activity", defaultValue: "creation",
        options: [{ value: "creation", label: "Creation date" }, { value: "last-activity", label: "Last activity" }, { value: "milestone", label: "Milestones and releases" }],
        state: "custom", source: "You changed this on 2026-07-18", exposure: "advanced", scope: ["global"]
      },
      "system.pressure-threshold": {
        id: "system.pressure-threshold", label: "Storage pressure threshold",
        description: "Free-space level at which Puppet Master warns and offers cleanup.",
        help: "Cleanup always proposes a dry-run plan first.",
        type: "slider", value: 10, defaultValue: 15, min: 5, max: 40, unit: "% free",
        state: "custom", source: "You changed this on 2026-07-18", exposure: "advanced", scope: ["global"]
      },
      "system.auto-snapshots": {
        id: "system.auto-snapshots", label: "Automatic snapshots",
        description: "Take workspace snapshots before risky operations.",
        help: "Snapshots let you roll back an agent run that went wrong.",
        type: "toggle", value: true, defaultValue: true,
        state: "default", source: "Default", exposure: "standard", scope: ["global"]
      },
      "system.snapshot-frequency": {
        id: "system.snapshot-frequency", label: "Snapshot frequency",
        description: "How often idle-time snapshots are taken.",
        help: "Risky operations always take their own snapshot regardless.",
        type: "select", value: "auto", defaultValue: "auto",
        options: [{ value: "auto", label: "Automatic" }, { value: "hourly", label: "Hourly" }, { value: "daily", label: "Daily" }],
        state: "auto", source: "Automatic", exposure: "advanced", scope: ["global"]
      },
      "system.test-restore": {
        id: "system.test-restore", label: "Test the latest snapshot",
        description: "Verify that the most recent snapshot restores cleanly.",
        help: "A test restore reads the snapshot in an isolated scratch area — nothing in your workspace is touched.",
        type: "action", actionLabel: "Test restore", value: null, defaultValue: null,
        state: "default", source: "Last verified 2026-08-01", exposure: "diagnostic", scope: ["global"]
      },
      "system.log-level": {
        id: "system.log-level", label: "Log level",
        description: "How much detail lands in the application log.",
        help: "Debug and Trace are for diagnosing a specific problem.",
        type: "select", value: "debug", defaultValue: "info",
        options: [{ value: "info", label: "Info" }, { value: "debug", label: "Debug" }, { value: "trace", label: "Trace" }],
        state: "custom", source: "You changed this on 2026-08-09", exposure: "diagnostic", scope: ["global"]
      },
      "system.health-interval": {
        id: "system.health-interval", label: "Background health interval",
        description: "How often connections are re-checked while the app runs.",
        help: "Shorter intervals catch failures sooner but add small background traffic.",
        type: "select", value: "10m", defaultValue: "10m",
        options: [{ value: "5m", label: "Every 5 minutes" }, { value: "10m", label: "Every 10 minutes" }, { value: "30m", label: "Every 30 minutes" }],
        state: "default", source: "Default", exposure: "diagnostic", scope: ["global"]
      },
      "system.export-diagnostics": {
        id: "system.export-diagnostics", label: "Export diagnostics bundle",
        description: "Collect versions, traces, and health state for support.",
        help: "Review the bundle before sending — it includes machine details.",
        type: "action", actionLabel: "Export bundle", value: null, defaultValue: null,
        state: "default", source: "Never exported", exposure: "diagnostic", scope: ["global"],
        search: "support bundle traces logs export"
      },
      "system.experimental-runtime": {
        id: "system.experimental-runtime", label: "Experimental runtime features",
        description: "Enable unfinished runtime capabilities under active development.",
        help: "Expect rough edges. Restart required to load the experimental build.",
        type: "toggle", value: false, defaultValue: false,
        state: "default", source: "Default", exposure: "expert", risky: true, restartRequired: true, scope: ["global"]
      },
      "system.feature-flags": {
        id: "system.feature-flags", label: "Edit feature flags",
        description: "Toggle individual runtime flags by name.",
        help: "No validation guardrails here — wrong flags can break the session.",
        type: "action", actionLabel: "Open flag editor", value: null, defaultValue: null,
        state: "default", source: "3 flags diverge from default", exposure: "diagnostic", scope: ["global"]
      },
      "system.factory-reset": {
        id: "system.factory-reset", label: "Reset all settings",
        description: "Restore every setting on this machine to its default. This is a long explanation on purpose: the reset walks through export, a pre-reset snapshot, the atomic apply, and a verification pass before anything is discarded, and each of those stages deserves a sentence here so the row stands on its own without a separate help page. Managed values such as the update channel and FileSafe enrollment are not touched by a reset — your organization keeps control of those regardless of what this screen does — and provider sign-ins, CLI installations, and usage state all survive because they are not settings. The pre-reset snapshot stays available under Backup and Restore for the normal retention period, so the operation is recoverable even though it is destructive on its face.",
        help: "Opens a preview of exactly what will change before anything is applied.",
        type: "action", actionLabel: "Review reset…", value: null, defaultValue: null,
        state: "default", source: "Never run on this machine", exposure: "expert", risky: true, scope: ["global"],
        search: "factory reset defaults wipe restore"
      }
    },

    /* ==================================================================
       Notices — three separate groups, individually dismissible
       ================================================================== */
    notices: [
      {
        id: "notice-filesafe-incomplete",
        kind: "attention",
        headline: "FileSafe sandbox coverage is incomplete",
        consequence: "Build output directories are outside the sandbox until setup finishes. FileSafe still stages every reviewed write.",
        actionLabel: "Review coverage",
        secondaryLabel: "Dismiss",
        target: { category: "permissions", sub: "filesafe", setting: "permissions.filesafe-mode" }
      },
      {
        id: "notice-no-verifier",
        kind: "attention",
        headline: "No verifier route is configured",
        consequence: "Work can be marked done without an audit. Verification stays optional until you pick a route.",
        actionLabel: "Choose a route",
        secondaryLabel: "Dismiss",
        target: { category: "providers", sub: "roles", setting: "providers.verifier-route" }
      },
      {
        id: "notice-terminal-setup",
        kind: "setup",
        headline: "Finish setting up the Work terminal profile",
        consequence: "The Work profile inherits what it lacks from Default. Two fields remain.",
        actionLabel: "Continue setup",
        secondaryLabel: "Not now",
        target: { category: "terminal", sub: "term", setting: "terminal.default-profile" }
      },
      {
        id: "notice-forge-setup",
        kind: "setup",
        headline: "Connect a forge to enable pull requests and Actions",
        consequence: "Source control works locally; runs and pull requests need a forge connection.",
        actionLabel: "Connect a forge",
        secondaryLabel: "Not now",
        target: { category: "source-control", sub: "forge", setting: "sc.forge-connection" }
      },
      {
        id: "notice-compaction-safeguard",
        kind: "recommended",
        headline: "Enable the compaction safeguard",
        consequence: "Without it, compaction can quietly drop verified details from long threads.",
        actionLabel: "Turn it on",
        secondaryLabel: "Dismiss",
        target: { category: "context", sub: "compaction", setting: "context.compaction-safeguard" }
      },
      {
        id: "notice-quiet-hours",
        kind: "recommended",
        headline: "Set quiet hours for overnight automation",
        consequence: "Goal runs keep working; non-critical notifications wait for morning.",
        actionLabel: "Set quiet hours",
        secondaryLabel: "Dismiss",
        target: { category: "notifications", sub: "delivery", setting: "notifications.quiet-hours" }
      }
    ],

    /* ==================================================================
       Recent settings work
       ================================================================== */
    recents: [
      { label: "Back Seat Driver mode", target: { category: "goal", sub: "bsd", setting: "goal.bsd-mode" } },
      { label: "Claude Opus effort options", target: { manager: "providers", tab: "models" } },
      { label: "Terminal scrollback", target: { category: "terminal", sub: "term", setting: "terminal.scrollback" } },
      { label: "MCP tool exposure", target: { category: "devtools", sub: "mcp", setting: "devtools.mcp-tool-exposure" } },
      { label: "Memory half-life", target: { category: "context", sub: "memory", setting: "context.memory-half-life" } }
    ],

    /* ==================================================================
       Providers — the full 17-fixture set
       ================================================================== */
    providers: [
      /* 1. Anthropic — fixture 1 (CLI ready), 3 (multiple installations),
            6 (update available, Ask first), 9 (Claude CLI OAuth profile),
            16 (account priority), 17 (Fast/effort variation). */
      {
        id: "anthropic",
        name: "Anthropic",
        tagline: "Claude models through the Claude CLI's own sign-in",
        connectionGroup: "installed-tools",
        installState: "installed-signed-in",
        authModel: "cli-profile-oauth",
        authNote: "Sign-in is owned by the Claude CLI inside an isolated CLI profile. Puppet Master shows a \"Sign in via Claude CLI\" launcher — there is no PM-owned OAuth form for this provider, and Puppet Master never sees your credentials.",
        accountSwitchNote: "Switching accounts affects future requests only. A request already in flight keeps the account it started with.",
        accounts: [
          {
            id: "personal", label: "Personal", identity: "jared@example.com",
            authSource: "Claude CLI profile (isolated)", profileRoot: "%USERPROFILE%\\.pm\\cli-profiles\\claude\\personal",
            enabled: true, priority: 1, sticky: true, active: true,
            isolation: "isolated-home", isolationLabel: "Isolated home — separate CLI profile directory per account",
            health: "ready", modelVisibility: "All models visible",
            lastCatalogRefresh: "2026-08-10 21:14", lastSuccessfulGeneration: "2026-08-11 08:41",
            usagePressure: "low", resetAt: "2026-08-18 00:00"
          },
          {
            id: "work", label: "Work", identity: "jared@northwind.example",
            authSource: "Claude CLI profile (isolated)", profileRoot: "%USERPROFILE%\\.pm\\cli-profiles\\claude\\work",
            enabled: true, priority: 2, sticky: false, active: false,
            isolation: "isolated-home", isolationLabel: "Isolated home — separate CLI profile directory per account",
            health: "signed-in-idle", modelVisibility: "Haiku hidden",
            lastCatalogRefresh: "2026-07-30 09:02", lastSuccessfulGeneration: "2026-07-28 17:55",
            usagePressure: "low", resetAt: "2026-08-18 00:00"
          }
        ],
        product: { plan: "Claude Pro", billingRoute: "Subscription through the Claude CLI profile" },
        models: [
          {
            id: "claude-opus", name: "Claude Opus", alias: "Opus", favorite: true, hidden: false, priority: 1,
            contextLimit: 200000, modalities: { in: ["text", "image"], out: ["text"] },
            capabilities: {
              tools: { state: "supported", evidence: "Observed in 41 working sessions", freshAsOf: "2026-08-10" },
              vision: { state: "supported", evidence: "Observed with image attachments", freshAsOf: "2026-08-08" },
              structuredOutput: { state: "likely", evidence: "Declared by the models.dev catalog", freshAsOf: "2026-08-10" }
            },
            fastMode: { supported: true, evidence: "Observed a successful Fast-mode generation on 2026-08-10" },
            effort: ["low", "medium", "high"], effortSelected: "high", variant: "normal"
          },
          {
            id: "claude-sonnet", name: "Claude Sonnet", alias: "daily driver", favorite: false, hidden: false, priority: 2,
            contextLimit: 200000, modalities: { in: ["text", "image"], out: ["text"] },
            capabilities: {
              tools: { state: "supported", evidence: "Provider discovery over the authenticated account", freshAsOf: "2026-08-09" },
              vision: { state: "supported", evidence: "Declared by the provider and observed once", freshAsOf: "2026-07-30" },
              structuredOutput: { state: "likely", evidence: "Declared by the models.dev catalog", freshAsOf: "2026-08-10" }
            },
            fastMode: { supported: false, evidence: "Not declared by the catalog or the provider" },
            effort: ["low", "medium", "high"], effortSelected: "medium", variant: "normal"
          },
          {
            id: "claude-haiku", name: "Claude Haiku", alias: null, favorite: false, hidden: false, priority: 3,
            contextLimit: 200000, modalities: { in: ["text"], out: ["text"] },
            capabilities: {
              tools: { state: "unverified", evidence: "No evidence — the model is not usable on your plan", freshAsOf: "2026-08-10" },
              vision: { state: "unverified", evidence: "No evidence — the model is not usable on your plan", freshAsOf: "2026-08-10" },
              structuredOutput: { state: "unverified", evidence: "No evidence — the model is not usable on your plan", freshAsOf: "2026-08-10" }
            },
            fastMode: { supported: false, evidence: "Unknown while the model is unavailable" },
            effort: null, unavailableReason: "Not included in your plan"
          }
        ],
        routing: { priority: 1, useNextOnExhaust: true, continuation: "Ask before switching" },
        installations: [
          {
            id: "npm", label: "Claude CLI (npm global)", method: "npm", methodLabel: "npm global package",
            command: "claude", executable: "C:\\Users\\sitti\\AppData\\Roaming\\npm\\claude.cmd",
            packageIdentity: "@anthropic-ai/claude-code@2.0.4",
            host: "This PC", environment: "Windows native", version: "2.0.4",
            confidence: "proven", selected: true, shadowed: false
          },
          {
            id: "installer", label: "Claude CLI (standalone installer)", method: "installer", methodLabel: "Standalone installer",
            command: "claude-stable", executable: "C:\\Users\\sitti\\.local\\bin\\claude.exe",
            packageIdentity: "ai.anthropic.claude-cli 1.9.2",
            host: "This PC", environment: "Windows native", version: "1.9.2",
            confidence: "strong", selected: false, shadowed: true
          }
        ],
        updatePolicy: { check: "Automatic", install: "Ask first", version: "Latest compatible", rollback: true },
        updateState: { state: "update-available", availableVersion: "2.1.0", note: "Found by the automatic check 2 hours ago" },
        catalog: { source: "models.dev", lastChecked: "2026-08-10 21:14", lastActivated: "2026-08-10 21:14", version: "2026.08.10", refreshing: false, lastKnownGood: true },
        usageSnapshot: {
          includedRemaining: "72%", extraBalance: "None on file", resetsAt: "2026-08-18",
          pressure: "low", lastSuccessfulUse: "2026-08-11 08:41",
          projection: "On track to finish the period under the included allowance",
          sourceFreshness: "Reported by the provider 12 minutes ago"
        },
        diagnostics: [
          "21:14 catalog refresh completed; 3 models listed",
          "08:41 generation succeeded on account Personal (412 ms to first token)",
          "08:41 readiness check passed on the isolated CLI profile",
          "19:02 update check found 2.1.0 (policy: Ask first)"
        ]
      },

      /* 2. OpenAI — fixtures 10 (PM-direct OAuth), 11 (API key connection),
            15 (catalog refresh with last-known-good), 16 (requested ≠
            effective), plus usage-exhausted what-next. */
      {
        id: "openai",
        name: "OpenAI",
        tagline: "Direct sign-in plus a separate API connection",
        connectionGroup: "connected-accounts",
        installState: "not-applicable",
        authModel: "pm-direct-oauth",
        authNote: "Puppet Master owns this sign-in directly. The API connection is a separate route with its own credential, billed per use.",
        accounts: [
          {
            id: "oauth", label: "OpenAI account", identity: "jared@example.com",
            authSource: "Puppet Master direct OAuth", profileRoot: "PM credential vault",
            enabled: true, priority: 1, sticky: true, active: true,
            isolation: "pm-managed", isolationLabel: "PM-managed direct connection",
            health: "auth-ok-invocation-failed", modelVisibility: "All models visible",
            lastCatalogRefresh: "2026-08-10 20:58", lastSuccessfulGeneration: "2026-07-31 22:10",
            usagePressure: "high", resetAt: "2026-08-17 00:00"
          },
          {
            id: "api", label: "API connection", identity: "Key ending in 8f2a",
            authSource: "API key stored in the PM credential vault", profileRoot: "PM credential vault",
            enabled: true, priority: 2, sticky: false, active: false,
            isolation: "credential-pool", isolationLabel: "Credential pool — one credential per connection",
            health: "ready", modelVisibility: "All models visible",
            lastCatalogRefresh: "2026-08-10 20:58", lastSuccessfulGeneration: "2026-08-09 11:26",
            usagePressure: "unknown", resetAt: "Billed per use"
          }
        ],
        product: { plan: "ChatGPT Plus", billingRoute: "Puppet Master direct sign-in; the API route bills per use" },
        models: [
          {
            id: "gpt-5", name: "GPT-5", alias: null, favorite: false, hidden: false, priority: 1,
            contextLimit: 256000, modalities: { in: ["text", "image"], out: ["text"] },
            capabilities: {
              tools: { state: "temporarily-unavailable", evidence: "Safe probe timed out during the last check", freshAsOf: "2026-08-10" },
              vision: { state: "likely", evidence: "Declared by the models.dev catalog", freshAsOf: "2026-08-10" },
              structuredOutput: { state: "supported", evidence: "Provider discovery over the API connection", freshAsOf: "2026-08-09" }
            },
            fastMode: { supported: false, evidence: "Not declared by the provider" },
            effort: ["low", "medium", "high"], effortSelected: "medium", variant: "normal"
          },
          {
            id: "gpt-5-pro", name: "GPT-5 Pro", alias: null, favorite: false, hidden: false, priority: 2,
            contextLimit: 256000, modalities: { in: ["text", "image"], out: ["text"] },
            capabilities: {
              tools: { state: "likely", evidence: "Declared by the models.dev catalog", freshAsOf: "2026-08-10" },
              vision: { state: "likely", evidence: "Declared by the models.dev catalog", freshAsOf: "2026-08-10" },
              structuredOutput: { state: "likely", evidence: "Declared by the models.dev catalog", freshAsOf: "2026-08-10" }
            },
            fastMode: { supported: false, evidence: "Not declared by the provider" },
            effort: ["medium", "high"], effortSelected: "high", variant: "normal",
            requestedVsEffective: { requested: "GPT-5 Pro", effective: "GPT-5", reason: "Provider policy on your plan" }
          }
        ],
        routing: { priority: 2, useNextOnExhaust: true, continuation: "Ask before switching" },
        catalog: { source: "models.dev", lastChecked: "2026-08-11 09:02", lastActivated: "2026-08-01 18:44", version: "2026.08.10", refreshing: true, lastKnownGood: true },
        lastError: "Model invocation failed: capability probe timed out",
        usageSnapshot: {
          includedRemaining: "0%", extraBalance: "$4.12 remaining", resetsAt: "2026-08-17",
          pressure: "high", lastSuccessfulUse: "2026-07-31 22:10",
          projection: "Included usage is exhausted; the allowance resets in 6 days",
          sourceFreshness: "Reported by the provider 1 hour ago",
          whatNext: { options: ["stop-and-wait", "use-extra-balance", "switch-account-or-provider", "ask-each-time"], selected: "ask-each-time" }
        },
        diagnostics: [
          "20:58 sign-in verified for jared@example.com",
          "20:59 capability probe started for GPT-5",
          "21:00 model invocation failed: capability probe timed out",
          "09:02 catalog refresh started — showing the last-known-good list"
        ]
      },

      /* 3. Antigravity — fixture 2 (CLI found, not signed in),
            7 (update scheduled when idle). */
      {
        id: "antigravity",
        name: "Antigravity",
        tagline: "Google's agentic CLI, signed in through its own flow",
        connectionGroup: "installed-tools",
        installState: "installed-signed-out",
        authModel: "cli-profile-oauth",
        authNote: "Antigravity owns its Google sign-in inside an isolated CLI profile. Puppet Master can launch the native login but never sees your credentials.",
        accounts: [],
        product: { plan: "Determined after sign-in", billingRoute: "Google account through the Antigravity CLI" },
        models: [
          {
            id: "gemini-3-pro", name: "Gemini 3 Pro", alias: null, favorite: false, hidden: false, priority: 1,
            contextLimit: 1000000, modalities: { in: ["text", "image"], out: ["text"] },
            capabilities: {
              tools: { state: "unverified", evidence: "Unknown until you sign in", freshAsOf: "2026-07-29" },
              vision: { state: "unverified", evidence: "Unknown until you sign in", freshAsOf: "2026-07-29" },
              structuredOutput: { state: "unverified", evidence: "Unknown until you sign in", freshAsOf: "2026-07-29" }
            },
            fastMode: { supported: false, evidence: "Unknown until you sign in" },
            effort: null, unavailableReason: "Sign in required — the Antigravity CLI is installed but signed out"
          },
          {
            id: "gemini-3-flash", name: "Gemini 3 Flash", alias: null, favorite: false, hidden: false, priority: 2,
            contextLimit: 1000000, modalities: { in: ["text", "image"], out: ["text"] },
            capabilities: {
              tools: { state: "unverified", evidence: "Unknown until you sign in", freshAsOf: "2026-07-29" },
              vision: { state: "unverified", evidence: "Unknown until you sign in", freshAsOf: "2026-07-29" },
              structuredOutput: { state: "unverified", evidence: "Unknown until you sign in", freshAsOf: "2026-07-29" }
            },
            fastMode: { supported: false, evidence: "Unknown until you sign in" },
            effort: null, unavailableReason: "Sign in required — the Antigravity CLI is installed but signed out"
          }
        ],
        routing: { priority: 4, useNextOnExhaust: false, continuation: "Ask before switching" },
        installations: [
          {
            id: "winget", label: "Antigravity CLI (winget)", method: "winget", methodLabel: "winget package",
            command: "antigravity", executable: "C:\\Users\\sitti\\AppData\\Local\\Programs\\Antigravity\\antigravity.exe",
            packageIdentity: "Google.Antigravity 1.4.0",
            host: "This PC", environment: "Windows native", version: "1.4.0",
            confidence: "proven", selected: true, shadowed: false
          }
        ],
        updatePolicy: { check: "Automatic", install: "Automatically when idle", version: "Latest compatible", rollback: true },
        updateState: { state: "waiting", availableVersion: "1.5.1", note: "Scheduled — installs when no requests are active" },
        catalog: { source: "provider", lastChecked: "2026-07-29 14:22", lastActivated: "2026-07-29 14:22", version: "2026.07.29", refreshing: false, lastKnownGood: true },
        usageSnapshot: null,
        usageNote: "Usage appears here after you sign in.",
        diagnostics: [
          "14:22 CLI 1.4.0 found and verified (winget package Google.Antigravity)",
          "14:22 no signed-in profile — models unavailable until sign-in",
          "07:30 update 1.5.1 scheduled for idle time"
        ]
      },

      /* 4. Mistral CLI — fixture 4 (unknown installation owner, manual-only),
            8 (verification failed, rollback succeeded). */
      {
        id: "mistral-cli",
        name: "Mistral CLI",
        tagline: "Le Chat models through the community Mistral CLI",
        connectionGroup: "installed-tools",
        installState: "installed-signed-in",
        authModel: "cli-profile-oauth",
        authNote: "The Mistral CLI owns its sign-in. The installation on this machine could not be attributed to a package manager, so Puppet Master treats it as manual-only.",
        accounts: [
          {
            id: "default", label: "Default", identity: "jared@mistral.example",
            authSource: "Mistral CLI profile", profileRoot: "%USERPROFILE%\\.mistral",
            enabled: true, priority: 1, sticky: true, active: true,
            isolation: "native-profile", isolationLabel: "Native profile — the CLI's own single profile",
            health: "ready", modelVisibility: "All models visible",
            lastCatalogRefresh: "2026-08-06 10:11", lastSuccessfulGeneration: "2026-08-06 10:12",
            usagePressure: "unknown", resetAt: "Unknown"
          }
        ],
        product: { plan: "Le Chat Pro", billingRoute: "Subscription through the Mistral CLI" },
        models: [
          {
            id: "mistral-large", name: "Mistral Large", alias: null, favorite: false, hidden: false, priority: 1,
            contextLimit: 128000, modalities: { in: ["text"], out: ["text"] },
            capabilities: {
              tools: { state: "likely", evidence: "Declared by the provider", freshAsOf: "2026-08-06" },
              vision: { state: "unsupported", evidence: "Not declared by the provider", freshAsOf: "2026-08-06" },
              structuredOutput: { state: "likely", evidence: "Declared by the provider", freshAsOf: "2026-08-06" }
            },
            fastMode: { supported: false, evidence: "Not declared by the provider" },
            effort: null
          }
        ],
        routing: { priority: 5, useNextOnExhaust: false, continuation: "Ask before switching" },
        installations: [
          {
            id: "manual", label: "Mistral CLI (origin unknown)", method: "unknown", methodLabel: "Unknown installation method",
            command: "mistral", executable: "C:\\tools\\mistral\\mistral.exe",
            packageIdentity: null,
            host: "This PC", environment: "Windows native", version: "0.9.4",
            confidence: "unknown", selected: true, shadowed: false, manualOnly: true
          }
        ],
        updatePolicy: { check: "Manual", install: "Manual", version: "Pinned", rollback: true },
        updateState: { state: "rolled-back", note: "0.9.5 failed verification on 2026-08-06 (adapter handshake); rolled back to 0.9.4, verified and serving" },
        catalog: { source: "provider", lastChecked: "2026-08-06 10:11", lastActivated: "2026-08-06 10:11", version: "2026.08.06", refreshing: false, lastKnownGood: true },
        usageSnapshot: null,
        usageNote: "This CLI does not report balances. Usage detail appears when a route reports it.",
        diagnostics: [
          "10:10 update 0.9.5 installed from the official archive",
          "10:11 verification failed: adapter handshake timed out",
          "10:11 rollback to 0.9.4 completed; readiness checks passed",
          "10:11 ownership still unknown — updates stay manual-only"
        ]
      },

      /* 5. GitHub Copilot — PM-direct OAuth, healthy, medium pressure. */
      {
        id: "github-copilot",
        name: "GitHub Copilot",
        tagline: "Models included with your Copilot plan",
        connectionGroup: "connected-accounts",
        installState: "not-applicable",
        authModel: "pm-direct-oauth",
        authNote: "Puppet Master owns this sign-in directly through GitHub's OAuth flow.",
        accounts: [
          {
            id: "copilot", label: "GitHub Copilot", identity: "jareds-dev",
            authSource: "Puppet Master direct OAuth", profileRoot: "PM credential vault",
            enabled: true, priority: 1, sticky: false, active: true,
            isolation: "pm-managed", isolationLabel: "PM-managed direct connection",
            health: "ready", modelVisibility: "All models visible",
            lastCatalogRefresh: "2026-08-10 18:03", lastSuccessfulGeneration: "2026-08-10 19:44",
            usagePressure: "medium", resetAt: "2026-09-01 00:00"
          }
        ],
        product: { plan: "Copilot Pro", billingRoute: "GitHub subscription" },
        models: [
          {
            id: "gpt-5-mini", name: "GPT-5 Mini", alias: "quick answers", favorite: true, hidden: false, priority: 1,
            contextLimit: 128000, modalities: { in: ["text"], out: ["text"] },
            capabilities: {
              tools: { state: "supported", evidence: "Observed in 12 working sessions", freshAsOf: "2026-08-10" },
              vision: { state: "unsupported", evidence: "Not declared for this tier", freshAsOf: "2026-08-10" },
              structuredOutput: { state: "supported", evidence: "Observed in structured runs", freshAsOf: "2026-08-09" }
            },
            fastMode: { supported: true, evidence: "Observed a successful Fast-mode generation on 2026-08-07" },
            effort: ["low", "medium"], effortSelected: "low", variant: "fast"
          }
        ],
        routing: { priority: 3, useNextOnExhaust: true, continuation: "Ask before switching" },
        catalog: { source: "provider", lastChecked: "2026-08-10 18:03", lastActivated: "2026-08-10 18:03", version: "2026.08.10", refreshing: false, lastKnownGood: true },
        usageSnapshot: {
          includedRemaining: "54%", extraBalance: "Not applicable", resetsAt: "2026-09-01",
          pressure: "medium", lastSuccessfulUse: "2026-08-10 19:44",
          projection: "Comfortably inside the monthly allowance",
          sourceFreshness: "Reported by the provider 3 hours ago"
        },
        diagnostics: [
          "18:03 catalog refresh completed; 1 model listed for your tier",
          "19:44 generation succeeded on GPT-5 Mini (288 ms to first token)"
        ]
      },

      /* 6. OpenCode — fixture 12 (external server), 14 (usage unavailable
            but provider ready). */
      {
        id: "opencode",
        name: "OpenCode",
        tagline: "Your team's OpenCode server",
        connectionGroup: "server",
        installState: "not-applicable",
        authModel: "api-token",
        authNote: "A server route authenticated with an API token stored in the PM credential vault. The server is managed externally by your team.",
        accounts: [
          {
            id: "team", label: "Team token", identity: "Token ending in 3c9d",
            authSource: "API token in the PM credential vault", profileRoot: "PM credential vault",
            enabled: true, priority: 1, sticky: false, active: true,
            isolation: "credential-pool", isolationLabel: "Credential pool — one token per connection",
            health: "ready", modelVisibility: "All models visible",
            lastCatalogRefresh: "2026-08-10 16:40", lastSuccessfulGeneration: "2026-08-10 16:52",
            usagePressure: "unknown", resetAt: "Unknown"
          }
        ],
        server: { baseUrl: "https://opencode.northwind.internal:8443", managedExternally: true },
        product: { plan: "Team server", billingRoute: "Managed externally — no billing inside Puppet Master" },
        models: [
          {
            id: "qwen3-coder", name: "Qwen 3 Coder 30B", alias: null, favorite: false, hidden: false, priority: 1,
            contextLimit: 262144, modalities: { in: ["text"], out: ["text"] },
            capabilities: {
              tools: { state: "supported", evidence: "Observed in 6 working sessions", freshAsOf: "2026-08-10" },
              vision: { state: "unsupported", evidence: "Not declared by the server", freshAsOf: "2026-08-10" },
              structuredOutput: { state: "supported", evidence: "Observed in structured runs", freshAsOf: "2026-08-10" }
            },
            fastMode: { supported: false, evidence: "Not declared by the server" },
            effort: ["medium"], effortSelected: "medium", variant: "normal"
          }
        ],
        routing: { priority: 6, useNextOnExhaust: false, continuation: "Ask before switching" },
        updatePolicy: { check: "Manual", install: "Manual", version: "Pinned", rollback: false },
        updateState: { state: "managed-externally", note: "The server is updated by your team outside Puppet Master" },
        catalog: { source: "server", lastChecked: "2026-08-10 16:40", lastActivated: "2026-08-10 16:40", version: "2026.08.10", refreshing: false, lastKnownGood: true },
        usageSnapshot: null,
        usageNote: "Usage details are unavailable for this route, but the provider is ready. The OpenCode server does not report balances to Puppet Master.",
        diagnostics: [
          "16:40 server reachable at opencode.northwind.internal:8443 (TLS verified)",
          "16:41 token accepted; 1 model listed",
          "16:52 generation succeeded on Qwen 3 Coder 30B (510 ms to first token)"
        ]
      },

      /* 7. Local model server — keyless local route. */
      {
        id: "local-server",
        name: "Local model server",
        tagline: "Self-hosted models on this machine",
        connectionGroup: "server",
        installState: "not-applicable",
        authModel: "none",
        authNote: "A local server with no authentication. Nothing leaves this machine.",
        accounts: [
          {
            id: "local", label: "This machine", identity: "No sign-in — local server",
            authSource: "None", profileRoot: "—",
            enabled: true, priority: 1, sticky: false, active: true,
            isolation: "single-active-login", isolationLabel: "Single active login — one local route",
            health: "ready", modelVisibility: "All models visible",
            lastCatalogRefresh: "2026-08-10 08:15", lastSuccessfulGeneration: "2026-08-10 08:20",
            usagePressure: "unknown", resetAt: "Not applicable"
          }
        ],
        server: { baseUrl: "http://127.0.0.1:11434" },
        product: { plan: "Local — no plan", billingRoute: "None — runs on your hardware" },
        models: [
          {
            id: "qwen3-32b", name: "Qwen 3 32B", alias: "local workhorse", favorite: false, hidden: false, priority: 1,
            contextLimit: 32768, modalities: { in: ["text"], out: ["text"] },
            capabilities: {
              tools: { state: "likely", evidence: "Declared by the server template", freshAsOf: "2026-08-10" },
              vision: { state: "unsupported", evidence: "Text-only model", freshAsOf: "2026-08-10" },
              structuredOutput: { state: "likely", evidence: "Declared by the server template", freshAsOf: "2026-08-10" }
            },
            fastMode: { supported: false, evidence: "Not applicable to a local route" },
            effort: null
          }
        ],
        routing: { priority: 7, useNextOnExhaust: false, continuation: "Ask before switching" },
        catalog: { source: "server", lastChecked: "2026-08-10 08:15", lastActivated: "2026-08-10 08:15", version: "local", refreshing: false, lastKnownGood: true },
        usageSnapshot: null,
        usageNote: "Local routes have no balance. Runtime cost is your own hardware.",
        diagnostics: [
          "08:15 server reachable at 127.0.0.1:11434",
          "08:20 generation succeeded on Qwen 3 32B (1.9 s to first token)"
        ]
      },

      /* 8. Free Models — fixture 13 (row requiring underlying setup). */
      {
        id: "free-community",
        name: "Free Models",
        tagline: "A grouping over free and community providers",
        connectionGroup: "free",
        installState: "not-applicable",
        authModel: "mixed",
        groupingNote: "Free Models is a grouping over underlying providers, accounts, and connections. It never owns credentials, quota, switching, or Usage.",
        accounts: [
          {
            id: "openrouter", label: "OpenRouter (underlying provider)", identity: "Not configured",
            authSource: "OpenRouter owns its credential", profileRoot: "—",
            enabled: false, priority: 1, sticky: false, active: false,
            isolation: "auth-only", isolationLabel: "Authentication-only profile — the underlying provider owns sign-in",
            health: "not-configured", modelVisibility: "—",
            lastCatalogRefresh: "Never", lastSuccessfulGeneration: "Never",
            usagePressure: "unknown", resetAt: "Unknown",
            requiresSetup: true, setupNote: "Connect OpenRouter to unlock the free models routed through it."
          },
          {
            id: "pollinations", label: "Pollinations (keyless)", identity: "No sign-in — keyless",
            authSource: "None", profileRoot: "—",
            enabled: true, priority: 2, sticky: false, active: true,
            isolation: "single-active-login", isolationLabel: "Single active login — keyless route",
            health: "ready", modelVisibility: "Rate-limited models",
            lastCatalogRefresh: "2026-08-09 12:00", lastSuccessfulGeneration: "2026-08-09 12:05",
            usagePressure: "unknown", resetAt: "Rate-limited per hour"
          }
        ],
        product: { plan: "Free tiers", billingRoute: "Each underlying provider owns its limits" },
        models: [
          {
            id: "free-or-auto", name: "OpenRouter Free Auto", alias: null, favorite: false, hidden: false, priority: 1,
            contextLimit: 128000, modalities: { in: ["text"], out: ["text"] },
            capabilities: {
              tools: { state: "unverified", evidence: "Requires the underlying OpenRouter setup", freshAsOf: "2026-08-09" },
              vision: { state: "unverified", evidence: "Requires the underlying OpenRouter setup", freshAsOf: "2026-08-09" },
              structuredOutput: { state: "unverified", evidence: "Requires the underlying OpenRouter setup", freshAsOf: "2026-08-09" }
            },
            fastMode: { supported: false, evidence: "Unknown until setup completes" },
            effort: null,
            requiresSetup: true,
            unavailableReason: "Needs setup — connect OpenRouter (the underlying provider) to use this model"
          },
          {
            id: "pollinations-text", name: "Pollinations Text", alias: null, favorite: false, hidden: false, priority: 2,
            contextLimit: 32000, modalities: { in: ["text"], out: ["text"] },
            capabilities: {
              tools: { state: "unsupported", evidence: "Keyless text-only route", freshAsOf: "2026-08-09" },
              vision: { state: "unsupported", evidence: "Keyless text-only route", freshAsOf: "2026-08-09" },
              structuredOutput: { state: "unverified", evidence: "No evidence on this route", freshAsOf: "2026-08-09" }
            },
            fastMode: { supported: false, evidence: "Not declared by the route" },
            effort: null
          }
        ],
        routing: { priority: 8, useNextOnExhaust: false, continuation: "Ask before switching" },
        catalog: { source: "Free Coding Models", lastChecked: "2026-08-09 12:00", lastActivated: "2026-08-09 12:00", version: "2026.08.09", refreshing: false, lastKnownGood: true },
        usageSnapshot: null,
        usageNote: "Free Models never owns quota — each underlying route reports its own limits.",
        diagnostics: [
          "12:00 Free Coding Models catalog refreshed; 2 models listed",
          "12:00 OpenRouter not configured — its models show Needs setup"
        ]
      },

      /* 9. vLLM tenant — fixture 5 (explicit Install from official source). */
      {
        id: "vllm-tenant",
        name: "vLLM tenant",
        tagline: "Your organization's shared model endpoint",
        connectionGroup: "server",
        installState: "not-installed",
        authModel: "api-token",
        authNote: "Connects with an API token for your organization's tenant. The CLI helper is not installed yet.",
        accounts: [],
        product: { plan: "Determined by your organization", billingRoute: "Managed by your organization" },
        models: [],
        routing: { priority: 9, useNextOnExhaust: false, continuation: "Ask before switching" },
        installAction: {
          label: "Install from the official source",
          sourceNote: "Installs the vLLM helper CLI from the official vLLM GitHub releases, for This PC · Windows native. Puppet Master never bundles provider CLIs — installation is always your explicit choice.",
          receipt: "Install simulated — nothing was downloaded or changed"
        },
        updatePolicy: { check: "Manual", install: "Manual", version: "Pinned", rollback: false },
        updateState: { state: "unknown-method", note: "No installation to manage yet" },
        catalog: { source: "server", lastChecked: "Never", lastActivated: "Never", version: "—", refreshing: false, lastKnownGood: false },
        usageSnapshot: null,
        usageNote: "Install the helper and connect the tenant to see usage.",
        diagnostics: [
          "No installation detected on This PC",
          "Official source: github.com/vllm-project/vllm releases"
        ]
      }
    ],

    /* ==================================================================
       Agent roles — consume provider/model candidates; never accounts
       ================================================================== */
    roles: [
      { id: "main-assistant", label: "Main Assistant", route: { provider: "Anthropic", account: "Personal", model: "Claude Opus" }, qualityGuarded: true, note: "The default conversational route" },
      { id: "prd-planning", label: "PRD and Planning conversation", route: { provider: "Anthropic", account: "Personal", model: "Claude Opus" }, qualityGuarded: true, note: "Planning stays on a high-quality route" },
      { id: "goal-worker", label: "Goal worker", route: { provider: "Anthropic", account: "Personal", model: "Claude Sonnet" }, qualityGuarded: false, note: "Implementation work" },
      { id: "verifier", label: "Verifier and Auditor", route: null, qualityGuarded: true, note: "Not configured — pick any provider with tool support" },
      { id: "vision-media", label: "Vision and media analysis", route: { provider: "Anthropic", account: "Personal", model: "Claude Sonnet" }, qualityGuarded: false, note: "Needs image input" },
      { id: "compression", label: "Compression and context maintenance", route: { provider: "Local model server", account: "This machine", model: "Qwen 3 32B" }, qualityGuarded: false, note: "Background work stays off paid routes" },
      { id: "web-extraction", label: "Web extraction", route: { provider: "Free Models", account: "Pollinations (keyless)", model: "Pollinations Text" }, qualityGuarded: false, note: "Low-cost extraction" },
      { id: "approval-review", label: "Approval review", route: { provider: "Anthropic", account: "Personal", model: "Claude Sonnet" }, qualityGuarded: false, note: "Second look at risky approvals" },
      { id: "mcp-tool-routing", label: "MCP and tool routing", route: { provider: "GitHub Copilot", account: "GitHub Copilot", model: "GPT-5 Mini" }, qualityGuarded: false, note: "Fast structured calls" },
      { id: "skill-search", label: "Skill search", route: { provider: "Local model server", account: "This machine", model: "Qwen 3 32B" }, qualityGuarded: false, note: "Local retrieval" },
      { id: "subagents-crew", label: "Subagents and Crew roles", route: { provider: "Anthropic", account: "Personal", model: "Claude Sonnet" }, qualityGuarded: false, note: "Template default" }
    ],

    /* ==================================================================
       Spellcheck (PMViews.mountSpellcheck consumes this)
       ================================================================== */
    spellcheck: {
      enabled: true,
      language: "Automatic",
      dictionarySource: "Automatic",
      personalDictionary: ["pnpm", "monorepo", "scrollbar"],
      projectDictionary: ["FileSafe", "PeonPing"],
      demoParagraph: "The team will recieve the audit log on Friday; a seperate archive keeps every occured error searchable for a month.",
      note: "Nothing is ever replaced automatically. Grammar and style help is a separate opt-in feature."
    },

    /* ==================================================================
       Core manager metadata (concepts merge their own managerMeta in)
       ================================================================== */
    managerMeta: {
      providers: { id: "providers", title: "Providers", purpose: "Accounts, connections, models, installations, and routing", icon: "layers" }
    },

    /* ==================================================================
       Core search actions — concepts append their own typed entries.
       Kinds: action | status | diagnostic | workflow | capability
       ================================================================== */
    actions: [
      { id: "reset-demo", title: "Reset demo data", terms: "restore seed sample content", kind: "action" },
      { id: "open-home", title: "Open Settings Home", terms: "start landing overview", kind: "action" },
      { id: "refresh-catalog", title: "Refresh provider catalog", terms: "models.dev update check", kind: "action", target: { manager: "providers" } },
      { id: "verifier-status", title: "Verifier route status", terms: "audit verification configured none", kind: "status", subtitle: "Status", target: { category: "providers", sub: "roles", setting: "providers.verifier-route" } },
      { id: "setup-terminal-work", title: "Set up the Work terminal profile", terms: "terminal profile setup incomplete finish", kind: "workflow", subtitle: "Setup workflow", target: { category: "terminal", sub: "term", setting: "terminal.default-profile" } },
      { id: "export-diagnostics", title: "Export diagnostics bundle", terms: "support bundle traces logs", kind: "diagnostic", subtitle: "Diagnostics", target: { category: "system", sub: "diagnostics", setting: "system.export-diagnostics" } },
      { id: "lfs-unavailable", title: "Git LFS support (unavailable)", terms: "large file storage git lfs binary", kind: "capability", subtitle: "Unavailable capability", target: { category: "source-control", sub: "push", setting: "sc.lfs" } }
    ]
  };
})();
