(function () {
  "use strict";

  var D = window.PMDemoData;
  if (!D) return;

  // --- Notifications & Sounds -------------------------------------------

  D.notificationDestinations = [
    { id: "dest-titlebar", name: "In-app title bar", kind: "in-app", channel: "Title-bar stack / inbox", state: "connected", enabled: true, builtin: true, fields: { thread: "n/a", mentions: "n/a", template: "Compact card", successPredicate: "Notice lands in the stack", retry: "None" }, note: "The only in-app notification surface." },
    { id: "dest-system", name: "System / tray", kind: "system", channel: "OS notifications + tray", state: "connected", enabled: true, builtin: true, fields: { thread: "n/a", mentions: "n/a", template: "OS-native", successPredicate: "OS delivers the toast", retry: "OS-managed" } },
    { id: "dest-slack", name: "Slack", kind: "chat", channel: "#pm-notifications", state: "connected", enabled: true, builtin: false, fields: { thread: "Thread per Goal", mentions: "@jared on failures", headers: "X-PM-Project", template: "Block kit card", successPredicate: "message_ts returned", retry: "3 × exponential" } },
    { id: "dest-discord", name: "Discord", kind: "chat", channel: "#builds", state: "needs-auth", enabled: false, builtin: false, fields: { thread: "Off", mentions: "None", template: "Embed", successPredicate: "Message id returned", retry: "3 × exponential" }, note: "Reconnect required — webhook token expired." },
    { id: "dest-webhook", name: "Generic webhook", kind: "webhook", channel: "https://hooks.example/pm", state: "connected", enabled: false, builtin: false, fields: { thread: "n/a", mentions: "n/a", headers: "X-PM-Signature", template: "JSON envelope", successPredicate: "HTTP 2xx", retry: "3 × exponential" } },
    { id: "dest-ntfy", name: "ntfy", kind: "push", channel: "ntfy.sh/pm-home", state: "rate-limited", enabled: true, builtin: false, fields: { thread: "Topic", mentions: "Priority tags", template: "Plain text", successPredicate: "HTTP 200 from topic", retry: "2 × immediate" }, note: "Rate limited — last send was throttled. Test-send is masked and rate-limited." },
    { id: "dest-pushover", name: "Pushover", kind: "push", channel: "Device group: Home", state: "connected", enabled: false, builtin: false, fields: { thread: "n/a", mentions: "Priority 1 on failures", template: "Title + body", successPredicate: "request status 1", retry: "3 × exponential" } },
    { id: "dest-telegram", name: "Telegram", kind: "push", channel: "Chat -100…8841", state: "connected", enabled: false, builtin: false, fields: { thread: "Forum topic: Builds", mentions: "None", parseMode: "MarkdownV2", template: "Markdown card", successPredicate: "message_id returned", retry: "3 × exponential" } }
  ];

  D.eventRouting = [
    { id: "route-approval", event: "Approval needed", destinations: ["In-app title bar", "System / tray"], quiet: "Critical through" },
    { id: "route-failure", event: "Failure or blocked work", destinations: ["In-app title bar", "Slack"], quiet: "Critical through" },
    { id: "route-goal-done", event: "Goal completed", destinations: ["In-app title bar", "Slack", "ntfy"], quiet: "Held" },
    { id: "route-update", event: "Provider update available", destinations: ["In-app title bar"], quiet: "Held" },
    { id: "route-backup", event: "Backup finished", destinations: ["In-app title bar"], quiet: "Held" },
    { id: "route-mention", event: "Assistant mentions you", destinations: ["In-app title bar", "System / tray"], quiet: "Held" }
  ];

  D.soundLibrary = {
    masterVolume: 60,
    events: [
      { id: "snd-complete", event: "Work completed", sound: "Chime Up", source: "PM built-in", license: "CC0", version: "1.2", duration: "0.8 s", hash: "a41f…c9" },
      { id: "snd-approval", event: "Approval needed", sound: "Knock", source: "PM built-in", license: "CC0", version: "1.0", duration: "0.5 s", hash: "77b2…0d" },
      { id: "snd-failure", event: "Failure or blocked", sound: "Low Tone", source: "PM built-in", license: "CC0", version: "1.1", duration: "0.9 s", hash: "e011…7a" },
      { id: "snd-message", event: "New message", sound: "Pop", source: "PM built-in", license: "CC0", version: "1.0", duration: "0.3 s", hash: "19cf…44" },
      { id: "snd-goal", event: "Goal finished", sound: "Resolve", source: "PM built-in", license: "CC0", version: "1.3", duration: "1.4 s", hash: "b8d3…12" },
      { id: "snd-backup", event: "Backup finished", sound: "Soft Bell", source: "PM built-in", license: "CC0", version: "1.0", duration: "0.6 s", hash: "52aa…9e" },
      { id: "snd-update", event: "Update ready", sound: "Rise", source: "PM built-in", license: "CC0", version: "1.0", duration: "0.7 s", hash: "c4f7…61" },
      { id: "snd-timer", event: "Timer elapsed", sound: "Tick", source: "PM built-in", license: "CC0", version: "1.0", duration: "0.4 s", hash: "3d09…8b" }
    ],
    uploads: [
      { id: "up-1", name: "desk-bell.wav", uploaded: "Yesterday", duration: "1.1 s", hash: "f3e1…2c", mappedTo: "Timer elapsed" },
      { id: "up-2", name: "typewriter-ding.wav", uploaded: "3 days ago", duration: "0.9 s", hash: "08ab…77", mappedTo: "Unassigned" }
    ]
  };

  D.soundPacks = [
    { id: "pack-peonping", name: "PeonPing Essentials", format: "PeonPing 2", license: "CC-BY 4.0 — verified", state: "verified", sounds: 12, imported: false },
    { id: "pack-openpeon", name: "OpenPeon Work Songs", format: "OpenPeon 1", license: "License check failed", state: "license-check-failed", sounds: 9, imported: true, note: "The pack file arrived without a readable license header. It stays disabled until the license is verified." },
    { id: "pack-broken", name: "Retro Bleeps", format: "PeonPing 1 (legacy)", license: "Unknown", state: "format-invalid", sounds: 0, imported: false, note: "Manifest version unsupported — the pack was rejected before any sound was registered." }
  ];

  D.quietHours = { enabled: true, window: "22:00 – 07:00", criticalThrough: true, suppressedLastNight: 7 };

  // --- Appearance ---------------------------------------------------------

  D.customThemes = {
    liveReload: true,
    loadAtStartup: true,
    themes: [
      { id: "ct-midnight", name: "Midnight Workshop", base: "Friendly Dark", file: "themes/midnight-workshop.toml", state: "valid", inherited: "Friendly Dark + 14 overrides", reloaded: "2 min ago", note: "Base-theme inheritance: only overridden tokens are stored." },
      { id: "ct-sepia", name: "Sepia Draft", base: "Basic Light", file: "themes/sepia-draft.toml", state: "schema-invalid", diagnostic: "Line 12: token --accent-soft expects a color, got the string 'warmer'. Falling back to Basic Light.", reloaded: "Rejected on load", note: "Invalid-theme fallback: PM renders the base theme and shows this diagnostic instead of failing." }
    ]
  };

  D.fonts = { ui: "PM Sans", mono: "PM Mono", fallback: "System UI when a custom font fails to load" };
  D.uiScale = { value: "100%", restart: true, note: "UI scale applies after restart." };

  // --- Back Seat Driver ----------------------------------------------------

  D.bsdConfig = {
    mode: "Auto",
    route: "Claude Sonnet 4.5",
    riskTriggers: true,
    phaseTriggers: true,
    usageGuard: true,
    latencyBudget: "4 seconds",
    privacyBoundary: "Bounded deltas only — never raw credentials",
    readOnly: true,
    chatOverride: "Allowed — one turn or current thread",
    note: "BSD is read-only by default, receives bounded deltas, cannot widen authority, and cannot block primary work merely because it failed."
  };

  // --- Permissions & FileSafe ----------------------------------------------

  D.permissionRules = [
    { id: "rule-1", order: 1, match: "**", effect: "Ask for approval", note: "Global wildcard default", origin: "Default" },
    { id: "rule-2", order: 2, match: "Plans/**", effect: "Allow", note: "Planning artifacts", origin: "Preset: PM planning" },
    { id: "rule-3", order: 3, match: "scripts/**", effect: "Allow", note: "Build scripts", origin: "Custom", conflictsWith: "rule-5" },
    { id: "rule-4", order: 4, match: "Concepts/**/*.html", effect: "Allow", note: "Concept pages", origin: "Custom" },
    { id: "rule-5", order: 5, match: "scripts/pm-*.py", effect: "Ask for approval", note: "Pipeline scripts need approval", origin: "Custom", conflictsWith: "rule-3" },
    { id: "rule-6", order: 6, match: "**/.env*", effect: "Deny", note: "Secrets are never written", origin: "Preset: Secrets floor" }
  ];

  D.perToolOverrides = [
    { id: "pt-bash", tool: "Bash", effect: "Follows access mode", note: "High-risk tool" },
    { id: "pt-webfetch", tool: "WebFetch", effect: "Safe research", note: "Read-only network" },
    { id: "pt-edit", tool: "Edit", effect: "Auto under Full Access", note: "FileSafe still applies" }
  ];

  D.presets = [
    { id: "preset-readonly", name: "Read-only review", summary: "Deny writes, allow reads and diagnostics" },
    { id: "preset-planning", name: "PM planning", summary: "Allow Plans/**, ask elsewhere" },
    { id: "preset-secrets", name: "Secrets floor", summary: "Deny **/.env* and credential paths" }
  ];

  D.fileSafe = {
    health: "ok",
    boundary: "Project root + declared external grants",
    protectedScopes: ["**/.env*", "Plans/Spec_Lock.json", "Plans/_shards/**", "Plans/.evidence/**", ".claude/**"],
    repairGuidance: "If a protected path was modified, restore from the last restore point; FileSafe records which operation touched it.",
    note: "FileSafe is the non-bypassable floor. The manager shows health, boundary, and repair guidance without encouraging unsafe bypass."
  };

  D.doomLoop = { threshold: "6 identical failed attempts", action: "Pause and ask", note: "Stops agents from repeating the same failing operation." };

  D.accessProfiles = [
    { id: "ap-ask", name: "Ask for approval", summary: "Every mutation asks first." },
    { id: "ap-edits", name: "Auto accept edits", summary: "File edits apply; commands still ask." },
    { id: "ap-auto", name: "Auto", summary: "Work proceeds; risky operations ask." },
    { id: "ap-full", name: "Full Access", summary: "No approvals; FileSafe floor still enforced." }
  ];

  // --- Code & Editor families ----------------------------------------------

  D.fileManagerCfg = {
    tree: { showHidden: false, respectIgnored: true, compactFolders: true },
    dragDrop: { enabled: true, confirmExternal: true },
    largeFile: { threshold: "2 MB", behavior: "Read-only viewer, then ask" },
    changedOnDisk: "Ask before reloading",
    recovery: { enabled: true, interval: "60 s", note: "Unsaved buffers survive restarts." },
    tabs: { limit: 24, splitGroups: 2 },
    transient: "Deleted worktree files show as transient, not missing."
  };

  D.formatterTable = [
    { id: "fmt-prettier", name: "Prettier", kind: "Built-in", state: "detected", command: "prettier", extensions: "js, ts, html, css, md", scope: "Global", version: "3.6.2" },
    { id: "fmt-ruff", name: "Ruff", kind: "Built-in", state: "not-found", command: "ruff", extensions: "py", scope: "Global", note: "Install ruff to enable Python formatting." },
    { id: "fmt-pmnotes", name: "PM Notes Formatter", kind: "Custom", state: "disabled", command: "pm-fmt-notes", extensions: "notes", scope: "Project", note: "Disabled by the project." }
  ];

  D.commandsCatalog = [
    { id: "cmd-verify", name: "Verify concept", scope: "Project", command: "python Concepts/ConceptHub/validate.py {folder}", parameters: ["folder"], includes: ["validate.py", "catalog.py"], shellSafety: "Quoted arguments, no shell expansion", lastRun: "Today" },
    { id: "cmd-shards", name: "Regenerate shards", scope: "Project", command: "python3 scripts/pm-shard-plans.py --generate", parameters: [], includes: ["scripts/pm-shard-plans.py"], shellSafety: "Fixed command, parameters only", lastRun: "Yesterday" },
    { id: "cmd-openhub", name: "Open ConceptHub", scope: "Global", command: "python Concepts/ConceptHub/server.py --port {port}", parameters: ["port"], includes: ["Concepts/ConceptHub/server.py"], shellSafety: "Port validated as integer", lastRun: "2 days ago" }
  ];

  D.shortcutBindings = [
    { id: "kb-settings", command: "Open Settings", binding: "Command ,", state: "ok" },
    { id: "kb-rail", command: "Toggle Rail", binding: "Command B", state: "ok" },
    { id: "kb-tests", command: "Run Tests", binding: "Command Shift T", state: "conflict", conflictsWith: "kb-terminal" },
    { id: "kb-terminal", command: "Open Terminal", binding: "Command Shift T", state: "conflict", conflictsWith: "kb-tests" }
  ];

  D.testingMatrix = {
    scopes: ["Global", "Project"],
    modes: ["Auto", "On", "Off"],
    capabilities: [
      { id: "tm-unit", name: "Unit / integration", global: "Auto", project: "Auto" },
      { id: "tm-browser", name: "Built-in browser", global: "Auto", project: "On" },
      { id: "tm-desktop", name: "Desktop / native", global: "Off", project: "Off" },
      { id: "tm-hotreload", name: "Hot reload / previews", global: "Auto", project: "Auto" },
      { id: "tm-simulator", name: "Simulator / emulator / device", global: "Off", project: "Off" },
      { id: "tm-api", name: "API / database", global: "Auto", project: "Auto" },
      { id: "tm-console", name: "Console / network", global: "Auto", project: "Auto" },
      { id: "tm-perf", name: "Performance / security / accessibility", global: "Off", project: "Auto" },
      { id: "tm-dap", name: "DAP debugger", global: "Auto", project: "Auto" },
      { id: "tm-eval", name: "Persistent eval", global: "Off", project: "Off" }
    ],
    capture: { artifacts: "Keep for 30 days", redactSecrets: true }
  };

  // --- System families ------------------------------------------------------

  D.storageHealth = {
    mode: "Home TrueNAS",
    pressure: "Low — 41% of the PM volume used",
    retention: "Snapshots 30 days · history forever · artifacts 30 days",
    legalHold: "None active",
    encryption: "At-rest encryption on the PM volume",
    quarantine: "2 quarantined artifacts awaiting review"
  };

  D.backupRuns = [
    { id: "bk-snap", kind: "Internal recovery snapshot", last: "2 h ago", schedule: "Every 6 hours", retention: "30 days", verified: true },
    { id: "bk-settings", kind: "Settings backup", last: "14 days ago", schedule: "Weekly", retention: "10 backups", verified: true },
    { id: "bk-project", kind: "Project backup", last: "Yesterday", schedule: "Daily", retention: "7 days", verified: true },
    { id: "bk-server", kind: "Full Server backup", last: "3 days ago", schedule: "Weekly", retention: "4 backups", verified: false, note: "Last run finished with warnings — run a test restore." }
  ];

  D.settingsExportFixture = {
    fileName: "pm-settings-2026-08-05.json",
    source: "Exported from PuppetMaster project, 5 days ago",
    conflicts: [
      { key: "appearance.theme.family", current: "Friendly Dark", incoming: "Retro Dark", resolution: "Keep current" },
      { key: "behavior.goal.concurrency", current: "8", incoming: "4", resolution: "Keep current" }
    ],
    legacy: [
      { key: "safety.access.mode", note: "Destination renamed to permissions.access.mode", action: "Migrate" }
    ]
  };

  D.historyRows = [
    { id: "h1", when: "Today 14:02", kind: "Thread", title: "Settings bakeoff — Qwen 5.8", project: "PuppetMaster", size: "2.1 MB", deletable: true },
    { id: "h2", when: "Today 09:41", kind: "Goal transcript", title: "Concept validation sweep", project: "PuppetMaster", size: "640 KB", deletable: true },
    { id: "h3", when: "Yesterday", kind: "Thread", title: "Slint port review", project: "Slint Port", size: "1.8 MB", deletable: true },
    { id: "h4", when: "3 days ago", kind: "Planning run", title: "Final packet ledger compile", project: "PuppetMaster", size: "3.4 MB", deletable: false, note: "Legal hold — planning record" }
  ];

  D.artifactRows = [
    { id: "art-1", type: "Screenshot", name: "settings-home-1280.png", location: "artifacts/screenshots", version: "v3", retention: "30 days", owner: "PM-owned", redacted: false },
    { id: "art-2", type: "Test report", name: "probe-results.json", location: "artifacts/tests", version: "v1", retention: "30 days", owner: "PM-owned", redacted: true },
    { id: "art-3", type: "CLI transcript", name: "gemini-probe-14.log", location: "provider-native/gemini-cli", version: "n/a", retention: "Provider policy", owner: "Provider-native (Gemini CLI)", redacted: false },
    { id: "art-4", type: "Generated image", name: "icon-sheet.png", location: "Pictures/PuppetMaster", version: "v12", retention: "Forever", owner: "PM-owned", redacted: false }
  ];

  D.sourceControl = {
    tools: [
      { name: "Git", state: "detected", install: "C:\\Program Files\\Git\\cmd\\git.exe 2.50.1", confidence: "Proven" },
      { name: "Jujutsu", state: "not-found", install: "Not installed", confidence: "n/a" },
      { name: "Git LFS", state: "detected", install: "git-lfs 3.7.0", confidence: "Proven" }
    ],
    forge: { name: "GitHub", state: "connected", identity: "jared@work", sshSource: "~/.ssh/id_ed25519 (PM never copies keys)" },
    testBeforeMerge: true,
    pushPolicy: "Ask before push",
    forcePush: "Denied",
    leases: "Atomic leases on protected branches",
    worktrees: [
      { id: "wt-main", name: "main", path: "\\\\TRUENAS\\Cursor\\PuppetMaster", state: "active", branch: "main" },
      { id: "wt-concepts", name: "concepts-final", path: "\\\\TRUENAS\\Cursor\\PuppetMaster-wt-concepts", state: "active", branch: "concepts/final-packet" },
      { id: "wt-old", name: "slint-port", path: "\\\\TRUENAS\\Cursor\\PuppetMaster-wt-slint", state: "merged", branch: "slint/port" }
    ]
  };

  D.ghActions = {
    connected: true,
    readiness: "Current branch concepts/final-packet is ready for workflows",
    pinned: [
      { id: "wf-validate", name: "Validate concepts", last: "Success — 14:02", runs: 214 },
      { id: "wf-shards", name: "Shard check", last: "Success — 09:10", runs: 96 }
    ],
    currentRun: { id: "run-1188", workflow: "Validate concepts", status: "completed", conclusion: "success", jobs: [
      { name: "lint-json", status: "completed", conclusion: "success", duration: "42 s" },
      { name: "validate-folders", status: "completed", conclusion: "success", duration: "1 m 18 s" },
      { name: "hub-catalog", status: "completed", conclusion: "success", duration: "35 s" }
    ] }
  };

  D.containers = {
    top: [
      { name: "Docker", state: "running", detail: "Docker Desktop 4.50 — engine healthy", expanded: ["Desktop/Engine: healthy", "CLI: docker 28.3", "Compose: v2.38", "Buildx: v0.24", "Socket: npipe connected"] },
      { name: "Podman", state: "not-installed", detail: "Install to use rootless containers", expanded: [] },
      { name: "Kubernetes tools", state: "detected", detail: "kubectl + Helm present", expanded: ["kubectl 1.33", "Helm 3.18", "kubeconfig contexts: home-cluster (current), staging", "Registry auth: ghcr.io signed in"] }
    ],
    note: "Container tools share the installation lifecycle but keep domain-specific capability probes."
  };

  D.webSearchCfg = {
    providerPriority: ["Built-in", "MCP search server"],
    limits: { search: "20 results", fetch: "30 seconds", crawl: "Depth 2", map: "500 URLs", extract: "Readability on" },
    creditGuard: "Stop at daily credit ceiling",
    caches: "Page cache 24 h",
    browserSessions: "PM-native BrowserWorkspace only; AuthBrowserSession is human-only and never inspectable by agents",
    proxies: "None",
    airGap: "Air-gap mode disables all web capability",
    readiness: "Ready — Built-in provider responding"
  };

  D.searchIndexCfg = {
    enabled: true,
    rebuild: { state: "idle", lastFull: "Yesterday", progress: "100%", phases: ["Scan", "Chunk", "Embed", "Commit"], note: "Rebuilds run in phases and never block editing." },
    exclusions: ["node_modules", ".git", "Plans/.evidence/**"],
    fileSize: "Skip files over 5 MB",
    symlinks: "Do not follow",
    disk: "412 MB",
    remoteCache: "Off"
  };

  D.cleanupDryRun = [
    { id: "cl-1", what: "3 stale branch worktrees", size: "240 MB", safe: true, note: "Merged branches only" },
    { id: "cl-2", what: "Expired snapshot set (older than 30 days)", size: "1.2 GB", safe: true, note: "Retention policy" },
    { id: "cl-3", what: "Quarantined artifacts", size: "18 MB", safe: false, note: "Needs your review before deletion" },
    { id: "cl-4", what: "Active worktree concepts-final", size: "88 MB", safe: false, note: "Worktree-safe: active worktrees are never cleaned without explicit inclusion" }
  ];

  D.serverShell = {
    cards: [
      { id: "srv-home", label: "Home TrueNAS", value: "Connected", icon: "server" },
      { id: "srv-processing", label: "Processing on this server", value: "On", icon: "zap" },
      { id: "srv-clients", label: "Clients", value: "3 paired", icon: "grid" }
    ],
    project: [
      { label: "Hosted On", value: "Home TrueNAS" },
      { label: "Project Files", value: "/mnt/projects/Puppet-Master" },
      { label: "Run Work", value: "Automatic · Home TrueNAS" }
    ],
    deferredModules: [
      { id: "dm-servers", name: "Servers", owner: "Server Backbone", contract: "Insert under System & Data after Servers & Hosts; manager grammar reserved" },
      { id: "dm-hosts", name: "Execution Hosts", owner: "Server Backbone", contract: "Host/Environment tree; capability-compatible Home Server default" },
      { id: "dm-clients", name: "Clients", owner: "Server Backbone", contract: "Paired device list; human language cards only" },
      { id: "dm-hosting", name: "Project Hosting & Files", owner: "Project Syncing and Updates", contract: "Source Location card; Project Sync status slots" },
      { id: "dm-remote", name: "Remote Access", owner: "Server Backbone", contract: "Pairing and session approvals; AuthBrowserSession stays human-only" },
      { id: "dm-updates", name: "Updates", owner: "Project Syncing and Updates", contract: "PM application and content update modules; deep-link slots reserved" }
    ],
    note: "Reserved insertion destinations with named owners — no backend state machines are invented in this bakeoff."
  };

  // --- Teacher / Help --------------------------------------------------------

  D.teacherMoments = [
    { id: "tch-providers", screen: "Providers manager", title: "Why accounts, models, and installations are separate", body: "An account is who you are with a provider. An installation is which copy of a tool PM found on this machine. A model is what a request runs on. Separating them is why PM can warn you that two Gemini CLIs exist before one shadows the other." },
    { id: "tch-permissions", screen: "Permission rules", title: "What last-match-wins means", body: "Rules run top to bottom and the last rule that matches a path decides. That is why reordering is powerful: a narrow rule placed after a broad one can carve out an exception. The trace shows exactly which rule matched." },
    { id: "tch-backup", screen: "Backup & Restore", title: "Action vs setting vs status", body: "Back Up Now is a one-shot action. Backup schedule is a persistent setting. Last backup is read-only status. Rendering them differently stops users from thinking they changed a schedule when they only ran one backup." }
  ];

  // --- General fixtures (row-state coverage) ---------------------------------

  D.generalFixtures = [
    { id: "fx-validation", state: "validation-error", setting: "notifications.quiet.window", message: "“22:00 – 07:00” parses; “until late” would fail validation." },
    { id: "fx-restart", state: "restart-required", setting: "appearance.fonts.scale", message: "UI scale applies after restart." },
    { id: "fx-reconnect", state: "reconnect-required", setting: "dest-discord", message: "Discord destination needs a reconnect before it can deliver." },
    { id: "fx-elsewhere", state: "changed-elsewhere", setting: "system.health.changed-elsewhere", message: "This row was changed in another PM window." },
    { id: "fx-long-desc", state: "long-explanation", setting: "context.memory.halflife", message: "Half-life changes retrieval activation, not truth — a long explanation that must wrap without clipping." },
    { id: "fx-long-label", state: "long-localized-label", setting: "system.lifecycle.restore-points-auto", message: "Automatically create restore points before applying risky or bulk configuration changes" },
    { id: "fx-notconfigured", state: "not-configured", setting: "behavior.guards.spend", message: "Spend guard is not configured — an honest state, not an empty string." },
    { id: "fx-managed", state: "managed", setting: "system.lifecycle.storage", message: "Managed by Puppet Master runtime — read-only here." },
    { id: "fx-unavailable", state: "unavailable", setting: "Video output", message: "Video output retired with the Media destination — an unavailable capability, kept searchable with a reason." }
  ];
})();
