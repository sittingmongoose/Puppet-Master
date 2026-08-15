/* Opus 5 — taxonomy entry points for the manager families added by this pass.
 *
 * Search, deep links and the workspace all key off PMData.categories. A manager
 * with no row in the taxonomy is unreachable: it cannot be found by search, it
 * has no "#/c/..." address, and no notice can point at it. So every new manager
 * family gets a real home here, and every new subcategory also carries ordinary
 * setting rows — toggles, selects, text and numbers — so that ordinary row
 * grammar is proven across the whole surface rather than only in the original
 * forty-four settings.
 *
 * Loads after pm-data.js and before pm-data-seal.js.
 */
(function () {
  "use strict";

  var D = window.PMData;
  if (!D) return;

  /* Same constructor as pm-data.js. Every state object carries source, scope,
   * isDefault and restart so no row can quietly omit them. */
  function st(o) {
    return Object.assign({
      source: "default",
      scope: "global",
      isDefault: true,
      restart: "none"
    }, o);
  }

  function category(id) {
    var found = null;
    D.categories.forEach(function (c) { if (c.id === id) found = c; });
    return found;
  }

  function subcategory(categoryId, subId) {
    var cat = category(categoryId);
    if (!cat) return null;
    var found = null;
    cat.subcategories.forEach(function (s) { if (s.id === subId) found = s; });
    return found;
  }

  function addSub(categoryId, sub) {
    var cat = category(categoryId);
    if (cat) cat.subcategories.push(sub);
  }

  function addRows(categoryId, subId, rows) {
    var sub = subcategory(categoryId, subId);
    if (sub) rows.forEach(function (r) { sub.settings.push(r); });
  }

  /* ================================== SETUP WORKFLOWS AND UNAVAILABLE ITEMS */

  /* 01_CORE_ARCHITECTURE requires setup workflows and unavailable capabilities
   * to be visibly distinct search result types. Added by the 2026-08-13
   * correction; before it, a half-finished provider setup was indistinguishable
   * from an ordinary toggle in the result list. */
  D.setupWorkflows = (D.setupWorkflows || []).concat([
    { id: "setup-provider-cli", label: "Set up a provider CLI",
      explanation: "Install a provider's command-line tool for one exact host, then sign in separately. Nothing is installed until you choose it.",
      categoryId: "agents", subcategoryId: "agents-providers", managerId: "manager-providers",
      keywords: ["install", "cli", "provider", "setup", "claude", "codex", "gemini"] },
    { id: "setup-connect-account", label: "Connect a provider account",
      explanation: "Sign in on the provider's official page and return with a code. Installation and authentication stay separate.",
      categoryId: "agents", subcategoryId: "agents-providers", managerId: "manager-providers",
      keywords: ["connect", "sign in", "account", "oauth", "device code"] },
    { id: "setup-notification-destination", label: "Set up a notification destination",
      explanation: "Add Slack, Discord, a webhook or a device, then send one test before relying on it.",
      categoryId: "general", subcategoryId: "general-notifications", managerId: "manager-notifications",
      keywords: ["slack", "webhook", "destination", "setup", "test"] },
    { id: "setup-linux-environment", label: "Set up a Linux environment on Windows",
      explanation: "Optional. Windows tools work without it, and turning it off is a healthy state rather than a problem.",
      categoryId: "collab", subcategoryId: "collab-git", managerId: "manager-sourcecontrol",
      keywords: ["wsl", "linux", "ubuntu", "environment", "optional"] },
    { id: "setup-search-index", label: "Build the project search index",
      explanation: "Choose scope and exclusions, then build. Progress reports real file counts, and it can be paused.",
      categoryId: "system", subcategoryId: "sys-index", managerId: "manager-index",
      keywords: ["index", "rebuild", "search", "scope", "exclusions"] }
  ]);

  /* An unavailable capability must be findable so a user learns WHY, without
   * being offered a control that cannot work. */
  D.unavailableCapabilities = (D.unavailableCapabilities || []).concat([
    { id: "unavail-video-generation", label: "Video generation",
      reason: "No connected provider on this account reports video capability. Connecting one that does will enable it.",
      categoryId: "media", subcategoryId: "media-providers", managerId: "manager-media",
      keywords: ["video", "generation", "media", "unavailable"] },
    { id: "unavail-gpu-capture", label: "Hardware-accelerated capture",
      reason: "The active renderer on this machine does not expose accelerated capture. Software capture is used instead.",
      categoryId: "system", subcategoryId: "sys-diagnostics", managerId: null,
      keywords: ["gpu", "capture", "renderer", "unavailable"] },
    { id: "unavail-org-managed-telemetry", label: "Usage telemetry export",
      reason: "Your organization manages this value. It is read-only here and cannot be exported from this device.",
      categoryId: "system", subcategoryId: "sys-diagnostics", managerId: "manager-usage",
      keywords: ["usage", "telemetry", "export", "managed", "organization"] },
    { id: "unavail-remote-source", label: "Source files on this environment",
      reason: "The project's files live on Home TrueNAS and are not mounted on this device. Work runs on the owning host instead.",
      categoryId: "collab", subcategoryId: "collab-git", managerId: "manager-sourcecontrol",
      keywords: ["source", "files", "environment", "remote", "unavailable"] }
  ]);

  /* ============================================ SYSTEM / RESOURCE POLICY */

  /* Added by the 2026-08-13 dependency correction. Without a taxonomy home the
   * resource manager would be unreachable: no search hit, no "#/c/..." address,
   * and no notice able to point at it. */
  addSub("system", {
    id: "sys-performance", title: "Resource use & performance",
    summary: "How much of this machine Puppet Master may use, and what it does when the machine is busy.",
    keywords: ["performance", "resource", "cpu", "memory", "cache", "battery", "metered", "legacy", "governor", "idle"],
    settings: [
      { id: "perf-manager", label: "Resource policy", explanation: "Behaviour profile, background work, cache budgets, and what the resource governor decided.", kind: "manager", managerId: "manager-performance",
        state: st({ value: "Auto profile", source: "recommended", isDefault: true }) },
      { id: "perf-profile", label: "Behaviour profile", explanation: "One choice that moves every automatic limit together. It changes what Puppet Master does, never what it can do.", kind: "select",
        options: ["Auto", "Performance", "Efficiency", "Legacy"],
        state: st({ value: "Auto", defaultValue: "Auto", source: "recommended",
          effect: { kind: "performance", text: "Auto reads the machine and adapts; Legacy holds back on older hardware without removing features." } }) },
      { id: "perf-background-policy", label: "Run background work", explanation: "Indexing, validation, cleanup and update checks. Foreground work and the interactive reserve are never affected.", kind: "select",
        options: ["When the machine is idle", "Always", "Never"],
        state: st({ value: "When the machine is idle", defaultValue: "When the machine is idle" }) },
      { id: "perf-idle-maintenance", label: "Maintain indexes while idle", explanation: "Incremental index and compaction work yields immediately when you start typing.", kind: "toggle",
        state: st({ value: true, defaultValue: true }) },
      { id: "perf-prewarm", label: "Warm the browser helper in advance", explanation: "Starts a browser process before it is needed so the first test feels instant.", kind: "toggle", exposure: "advanced",
        state: st({ value: false, defaultValue: false, source: "recommended",
          effect: { kind: "performance", text: "Off on Legacy: speculative prewarm is the first thing a low-resource profile drops." } }) },
      { id: "perf-memory-ceiling", label: "Memory Puppet Master may use", explanation: "A human ceiling for caches and decoded media, not a hard process limit.", kind: "select",
        options: ["Automatic", "Modest", "Generous"],
        state: st({ value: "Automatic", defaultValue: "Automatic" }) },
      { id: "perf-metered", label: "On a metered network", explanation: "What large downloads do when the connection is metered.", kind: "select",
        options: ["Defer large downloads", "Ask first", "Proceed"],
        state: st({ value: "Defer large downloads", defaultValue: "Defer large downloads" }) },
      { id: "perf-battery", label: "On battery or Low Power", explanation: "Reduce background fan-out, recording quality and decorative motion while preserving controls, streams and durable writes.", kind: "toggle",
        state: st({ value: true, defaultValue: true }) },
      { id: "perf-thermal", label: "When the machine is thermally limited", explanation: "The same reduction as Low Power, triggered by sustained thermal pressure.", kind: "toggle", exposure: "advanced",
        state: st({ value: true, defaultValue: true }) },
      { id: "perf-auto-capability", label: "Provision project capabilities automatically", explanation: "Language servers, formatters, test adapters and debuggers may install when a project needs them. Provider CLIs are never included and always need an explicit install.", kind: "select",
        options: ["Auto", "On", "Off"],
        state: st({ value: "Auto", defaultValue: "Auto", source: "recommended",
          effect: { kind: "safety", text: "Auto proceeds silently only when a trusted recipe and a prior grant already cover source, licence, elevation, credentials, host and rollback." } }) },
      { id: "perf-host-ceiling", label: "Helper ceiling on this host", explanation: "How many external helpers this specific machine may run. Other hosts keep their own ceiling.", kind: "number", exposure: "advanced",
        state: st({ value: 6, defaultValue: 6, scope: "host" }) },
      { id: "perf-env-lane", label: "Blocking lane width in this environment", explanation: "Package managers and platform APIs in this environment share this many slots.", kind: "number", exposure: "expert",
        state: st({ value: 2, defaultValue: 2, scope: "environment" }) },
      { id: "perf-device-lowpower", label: "Low Power behaviour on this device", explanation: "This device's own answer, independent of the project or the account.", kind: "select",
        options: ["Follow the system", "Always reduce", "Never reduce"],
        state: st({ value: "Follow the system", defaultValue: "Follow the system", scope: "device" }) },
      { id: "perf-turn-budget", label: "Spend guard for this turn", explanation: "A ceiling that applies to the current turn only and resets with the next one.", kind: "select", exposure: "advanced",
        options: ["Inherit", "Strict", "Off"],
        state: st({ value: "Inherit", defaultValue: "Inherit", scope: "turn" }) },
      { id: "perf-goal-reserve", label: "Capacity reserve for this Goal", explanation: "Held back so an active Goal cannot consume every permit.", kind: "select", exposure: "advanced",
        options: ["Automatic", "Quarter", "Half"],
        state: st({ value: "Automatic", defaultValue: "Automatic", scope: "goal" }) },
      { id: "perf-crew-fanout", label: "Sustainable fan-out for this Crew", explanation: "How wide this Crew may run before waves are used instead.", kind: "number", exposure: "advanced",
        state: st({ value: 3, defaultValue: 3, scope: "crew" }) },
      { id: "perf-planning-route", label: "Planning run route quality", explanation: "Applies to the current planning run; architecture and synthesis are never downgraded to save usage.", kind: "select", exposure: "advanced",
        options: ["High quality", "Match the main assistant"],
        state: st({ value: "High quality", defaultValue: "High quality", scope: "planningRun" }) },
      { id: "perf-install-policy", label: "Update policy for this installation", explanation: "Applies to one detected installation, not to the product family.", kind: "select", exposure: "advanced",
        options: ["Automatic when idle", "Ask first", "Never"],
        state: st({ value: "Ask first", defaultValue: "Ask first", scope: "installation" }) },
      { id: "perf-worktree-cap", label: "Parallel work in this worktree", explanation: "One worktree writer lease is always enforced; this caps everything else.", kind: "number", exposure: "expert",
        state: st({ value: 2, defaultValue: 2, scope: "worktree" }) },
      { id: "perf-effective", label: "Effective policy right now", explanation: "What the governor is actually applying, and why it differs from the requested profile when it does.", kind: "status", exposure: "diagnostic",
        state: st({ value: "Auto · interactive reserve held", source: "auto" }) },
      { id: "perf-permit-log", label: "Open the recent permit decisions", explanation: "The last admission answers: admitted, queued, degraded, or refused with a reason.", kind: "diagnostic", exposure: "diagnostic",
        state: st({ value: "Read-only", source: "auto" }) }
    ]
  });

  /* ============================================ GENERAL / NOTIFICATIONS */

  addSub("general", {
    id: "general-notifications", title: "Notifications & Sounds",
    summary: "Where Puppet Master tells you something happened, and what it sounds like.",
    keywords: ["notify", "alert", "slack", "webhook", "sound", "volume", "quiet"],
    settings: [
      { id: "notify-enabled", label: "Send notifications", explanation: "The master switch. When it is off, work still completes and is still recorded in the title-bar inbox.", kind: "toggle",
        state: st({ value: true, defaultValue: true }) },
      { id: "notify-quiet", label: "Quiet hours", explanation: "During these hours only failures and approval requests are delivered outside the app.", kind: "select",
        options: ["Off", "22:00 – 08:00", "Match the system focus mode", "Custom"],
        state: st({ value: "Match the system focus mode", defaultValue: "Off", isDefault: false, source: "custom" }) },
      { id: "notify-batch", label: "Group notifications from one Goal", explanation: "Collect updates from the same Goal and deliver one summary instead of one message per step.", kind: "toggle",
        state: st({ value: true, defaultValue: true }) },
      { id: "notify-retry", label: "Delivery attempts before giving up", explanation: "How many times a failing destination is retried before it is marked as failing and reported in the inbox.", kind: "number",
        min: 0, max: 10,
        state: st({ value: 3, defaultValue: 3, unit: "attempts" }) },
      { id: "sound-master", label: "Play sounds", explanation: "Sound is an addition to a notification, never the only indication that something needs you.", kind: "toggle",
        state: st({ value: true, defaultValue: true }) },
      { id: "sound-volume", label: "Sound volume", explanation: "Applies to every Puppet Master sound. The system volume still applies on top of this.", kind: "number",
        min: 0, max: 100,
        state: st({ value: 60, defaultValue: 70, isDefault: false, source: "custom", unit: "%" }) },
      { id: "notify-manager", label: "Notifications, destinations and event routing", explanation: "Every place a notification can be delivered, which events go where, and what the last delivery actually returned.", kind: "manager", managerId: "manager-notifications",
        state: st({ value: "8 destinations · 1 failing", source: "custom", isDefault: false }) },
      { id: "sound-manager", label: "Sound library, uploads and packs", explanation: "Built-in sounds and their licences, your uploads, and imported PeonPing or OpenPeon compatible packs.", kind: "manager", managerId: "manager-sounds",
        state: st({ value: "14 sounds · 2 packs", source: "custom", isDefault: false }) }
    ]
  });

  /* ================================================ GENERAL / DESKTOP */

  addSub("general", {
    id: "general-desktop", title: "Desktop, tray & windows",
    summary: "How the application behaves as a desktop program rather than as a document.",
    keywords: ["tray", "window", "minimise", "restore", "crash", "activity bar"],
    settings: [
      { id: "desk-close", label: "Closing the window", explanation: "Whether closing the last window quits Puppet Master or leaves it running in the tray so automation continues.", kind: "select",
        options: ["Quit Puppet Master", "Keep running in the tray", "Ask each time"],
        state: st({ value: "Keep running in the tray", defaultValue: "Ask each time", isDefault: false, source: "custom",
          effect: { kind: "safety", text: "Goals keep running with the window closed. The tray icon shows what is active." } }) },
      { id: "desk-minimise", label: "Minimising the window", explanation: "Whether minimise goes to the taskbar or to the tray.", kind: "select",
        options: ["Taskbar", "Tray"],
        state: st({ value: "Taskbar", defaultValue: "Taskbar" }) },
      { id: "desk-restore", label: "Restore windows, panels and tabs", explanation: "Reopen the window layout, side panels and editor tabs from the previous session.", kind: "toggle",
        state: st({ value: true, defaultValue: true, restart: "none" }) },
      { id: "desk-unsaved", label: "Protect unsaved buffers", explanation: "Hold unsaved editor content in the crash journal so a forced quit cannot lose it.", kind: "toggle",
        state: st({ value: true, defaultValue: true, recommendedValue: true, source: "recommended" }) },
      { id: "desk-tabs-limit", label: "Maximum open editor tabs", explanation: "Beyond this, the least recently used tab is closed. Unsaved tabs are never closed automatically.", kind: "number",
        min: 4, max: 60,
        state: st({ value: 18, defaultValue: 24, isDefault: false, source: "custom", unit: "tabs" }) },
      { id: "desktop-manager", label: "Desktop behaviour, tray and Activity Bar", explanation: "Tray state while automation runs, launch destination, crash recovery, and the order of the Activity Bar.", kind: "manager", managerId: "manager-desktop",
        state: st({ value: "Tray on · 2 items hidden", source: "custom", isDefault: false }) }
    ]
  });

  /* ================================================ GENERAL / TEACHER */

  addSub("general", {
    id: "general-teacher", title: "Help & Teacher",
    summary: "Explanations that go beyond a tooltip, and where they are allowed to appear.",
    keywords: ["teacher", "help", "explain", "guide", "onboarding"],
    settings: [
      { id: "teach-enabled", label: "Teacher assistance", explanation: "Lets Teacher explain the screen you are on and walk you into the action it just described.", kind: "toggle",
        state: st({ value: true, defaultValue: true }) },
      { id: "teach-depth", label: "Explanation depth", explanation: "How much Teacher says before it offers the action. It changes wording only, never what an action does.", kind: "select",
        options: ["Short", "Normal", "Thorough"],
        state: st({ value: "Normal", defaultValue: "Normal" }) },
      { id: "teach-offer", label: "Offer help on unfamiliar screens", explanation: "Show a quiet offer the first three times you open a manager you have not used.", kind: "toggle",
        state: st({ value: false, defaultValue: true, isDefault: false, source: "custom" }) },
      { id: "teach-route", label: "Teacher route", explanation: "Teacher explains from the current screen's own definition. A provider route is only used when you ask it a free-form question.", kind: "select", exposure: "advanced",
        options: ["Local explanation only", "Match the Main Assistant", "Ask each time"],
        state: st({ value: "Local explanation only", defaultValue: "Local explanation only",
          effect: { kind: "privacy", text: "Local explanation never sends the screen to a provider." } }) },
      { id: "teacher-manager", label: "Teacher and guided help", explanation: "What Teacher can explain, what it may do on your behalf, and the transition into the real action.", kind: "manager", managerId: "manager-teacher",
        state: st({ value: "Enabled · local explanations", source: "custom", isDefault: false }) }
    ]
  });

  /* ================================================== AGENTS / BSD */

  addSub("agents", {
    id: "agents-bsd", title: "Back Seat Driver",
    summary: "A second opinion that watches the primary agent, on its own route.",
    keywords: ["bsd", "review", "second opinion", "supervisor", "critic"],
    settings: [
      { id: "bsd-mode", label: "Back Seat Driver", explanation: "Off never runs it. Auto runs it at risky phases. On runs it on every turn.", kind: "select",
        options: ["Off", "Auto — default", "On"],
        state: st({ value: "Auto — default", defaultValue: "Auto — default" }) },
      { id: "bsd-latency", label: "Latency budget", explanation: "How long Back Seat Driver may take before the primary agent continues without it.", kind: "number",
        min: 1, max: 60,
        state: st({ value: 8, defaultValue: 8, unit: "seconds" }) },
      { id: "bsd-usage-guard", label: "Stop Back Seat Driver under usage pressure", explanation: "When included usage is nearly spent, the second opinion yields so the primary work can finish.", kind: "toggle",
        state: st({ value: true, defaultValue: true, recommendedValue: true, source: "recommended" }) },
      { id: "bsd-thread-override", label: "Threads may override this", explanation: "A conversation can turn Back Seat Driver on or off for one turn or for the current thread.", kind: "toggle",
        state: st({ value: true, defaultValue: true, scope: "thread" }) },
      { id: "bsd-manager", label: "Back Seat Driver triggers, route and boundary", explanation: "What makes it speak, which route it uses, and the authority it explicitly does not have.", kind: "manager", managerId: "manager-bsd",
        state: st({ value: "Auto · own route", source: "custom", isDefault: false }) }
    ]
  });

  /* ================================================ CODE / FORMATTERS */

  addSub("code", {
    id: "code-formatters", title: "Formatters",
    summary: "Which formatter runs for which file, and what happens when it is missing.",
    keywords: ["format", "prettier", "rustfmt", "gofmt", "black", "on save"],
    settings: [
      { id: "fmt-enabled", label: "Format files", explanation: "The global switch. Individual formatters can still be disabled below it.", kind: "toggle",
        state: st({ value: true, defaultValue: true }) },
      { id: "fmt-on-save", label: "Format on save", explanation: "Run the matching formatter when a file is written by you or by an agent.", kind: "toggle",
        state: st({ value: true, defaultValue: false, isDefault: false, source: "custom" }) },
      { id: "fmt-missing", label: "When a formatter is not installed", explanation: "A missing formatter is reported once per session rather than on every save.", kind: "select",
        options: ["Report once and continue", "Report every time", "Stay silent"],
        state: st({ value: "Report once and continue", defaultValue: "Report once and continue" }) },
      { id: "fmt-timeout", label: "Formatter timeout", explanation: "A formatter that exceeds this is cancelled and the file is left exactly as it was.", kind: "number",
        min: 1, max: 60,
        state: st({ value: 5, defaultValue: 5, unit: "seconds" }) },
      { id: "fmt-manager", label: "Formatters, commands and scope", explanation: "Built-in and custom formatters, whether each is detected, and a test that formats a sample in place.", kind: "manager", managerId: "manager-formatters",
        state: st({ value: "6 detected · 2 not found", source: "custom", isDefault: false }) }
    ]
  });

  /* ========================================== EXTENSIONS / CONTAINERS */

  addSub("extensions", {
    id: "ext-containers", title: "Containers & registries",
    summary: "Docker, Podman and Kubernetes tooling, and where images are published.",
    keywords: ["docker", "podman", "kubernetes", "kubectl", "helm", "registry", "unraid"],
    settings: [
      { id: "cont-enabled", label: "Use container tooling", explanation: "Allows agents to build, run and inspect containers when a project asks for it.", kind: "toggle",
        state: st({ value: true, defaultValue: true }) },
      { id: "cont-runtime", label: "Preferred runtime", explanation: "Which runtime is used when a project does not name one.", kind: "select",
        options: ["Docker", "Podman", "Ask each time"],
        state: st({ value: "Docker", defaultValue: "Docker" }) },
      { id: "cont-pull", label: "Image pull policy", explanation: "Whether an image is re-pulled before a run, and how stale a cached image may be.", kind: "select",
        options: ["Use cache when present", "Pull if older than a day", "Always pull"],
        state: st({ value: "Pull if older than a day", defaultValue: "Use cache when present", isDefault: false, source: "custom" }) },
      { id: "cont-registry-default", label: "Default publishing registry", explanation: "Where a build is pushed when the project does not name a registry.", kind: "text",
        state: st({ value: "registry.orchard.internal", defaultValue: "", isDefault: false, source: "custom" }) },
      { id: "cont-prune", label: "Prune build cache above", explanation: "The build cache is trimmed to this size after a successful build.", kind: "number",
        min: 1, max: 200,
        state: st({ value: 20, defaultValue: 20, unit: "GB" }) },
      { id: "containers-manager", label: "Docker, Podman and Kubernetes tools", explanation: "Engines, CLIs, Compose, Buildx, clusters, kubeconfig contexts, registries and remote hosts, with the health of each.", kind: "manager", managerId: "manager-containers",
        state: st({ value: "Docker ready · Kubernetes managed", source: "custom", isDefault: false }) }
    ]
  });

  /* =========================================== COLLAB / GITHUB ACTIONS */

  addSub("collab", {
    id: "collab-actions", title: "GitHub Actions",
    summary: "Which workflows are pinned, and whether this branch is ready to run them.",
    keywords: ["actions", "workflow", "ci", "runner", "github"],
    settings: [
      { id: "gha-enabled", label: "Show GitHub Actions", explanation: "Read workflow runs for the connected repository. Puppet Master never triggers a run without an explicit action.", kind: "toggle",
        state: st({ value: true, defaultValue: true }) },
      { id: "gha-refresh", label: "Refresh run status every", explanation: "How often pinned workflow runs are re-read while the project is open.", kind: "select",
        options: ["30 seconds", "2 minutes", "10 minutes", "Only when opened"],
        state: st({ value: "2 minutes", defaultValue: "2 minutes" }) },
      { id: "gha-branch-only", label: "Only show runs for the current branch", explanation: "Hide runs from other branches so the readiness answer is about the work in front of you.", kind: "toggle",
        state: st({ value: true, defaultValue: false, isDefault: false, source: "custom" }) },
      { id: "gha-log-lines", label: "Log lines to keep per job", explanation: "How much of a job log is held locally for inspection.", kind: "number",
        min: 100, max: 20000,
        state: st({ value: 4000, defaultValue: 2000, isDefault: false, source: "custom", unit: "lines" }) },
      { id: "gha-manager", label: "Workflows, runs and readiness", explanation: "Pinned workflows, whether the current branch can run them, run and job browsing, and the starter workflow.", kind: "manager", managerId: "manager-gh-actions",
        state: st({ value: "3 pinned · 1 needs a secret", source: "custom", isDefault: false }) }
    ]
  });

  /* ============================================= SYSTEM / HISTORY */

  addSub("system", {
    id: "sys-history", title: "History & sessions",
    summary: "How long conversations and sessions are kept, and what may be rebuilt from them.",
    keywords: ["history", "session", "transcript", "archive", "retention"],
    settings: [
      { id: "hist-keep", label: "Keep thread history for", explanation: "After this, a thread is archived. Archived threads stay searchable until they are deleted.", kind: "select",
        options: ["30 days", "90 days", "1 year", "Forever"],
        state: st({ value: "1 year", defaultValue: "90 days", isDefault: false, source: "custom" }) },
      { id: "hist-scope", label: "History covers", explanation: "Whether the history surface shows this project only or every project on this device.", kind: "select",
        options: ["This project", "All projects"],
        state: st({ value: "This project", defaultValue: "This project", scope: "project" }) },
      { id: "hist-attachments", label: "Keep attachments with archived threads", explanation: "Archived threads keep their attachments. Turning this off frees space but loses the evidence.", kind: "toggle",
        state: st({ value: true, defaultValue: true }) },
      { id: "hist-export-format", label: "Export format", explanation: "The format used when a thread or session is exported.", kind: "select",
        options: ["Markdown", "JSON", "Both"],
        state: st({ value: "Both", defaultValue: "Markdown", isDefault: false, source: "custom" }) },
      { id: "history-manager", label: "Threads, sessions and archives", explanation: "Filter, compare, export, rebuild and delete history, with the retention policy that governs each.", kind: "manager", managerId: "manager-history",
        state: st({ value: "412 threads · 38 archived", source: "custom", isDefault: false }) }
    ]
  });

  /* =========================================== SYSTEM / ARTIFACTS */

  addSub("system", {
    id: "sys-artifacts", title: "Runtime artifacts & output",
    summary: "What a run leaves behind, where it is written, and how long it stays.",
    keywords: ["artifact", "output", "log", "receipt", "redaction"],
    settings: [
      { id: "art-keep", label: "Keep run artifacts for", explanation: "Logs, receipts and outputs older than this are removed by the cleanup schedule.", kind: "select",
        options: ["7 days", "30 days", "90 days", "Until storage is needed"],
        state: st({ value: "30 days", defaultValue: "30 days" }) },
      { id: "art-location", label: "Artifact location", explanation: "Where artifacts are written. A project vault keeps them with the project rather than on this device.", kind: "select",
        options: ["Project vault", "This device", "Both"],
        state: st({ value: "Project vault", defaultValue: "Project vault" }) },
      { id: "art-redact", label: "Redact secrets in artifacts", explanation: "Known secret shapes and vault references are masked before anything is written.", kind: "toggle",
        state: st({ value: true, defaultValue: true, recommendedValue: true, source: "recommended",
          effect: { kind: "safety", text: "Turning this off would let tokens reach logs, receipts and exports." } }) },
      { id: "art-max-size", label: "Maximum artifact size", explanation: "Larger outputs are truncated with a marker naming what was cut.", kind: "number",
        min: 1, max: 512,
        state: st({ value: 32, defaultValue: 32, unit: "MB" }) },
      { id: "artifacts-manager", label: "Artifacts, receipts and outputs", explanation: "Type, location, version, retention, redaction and export for everything a run produces.", kind: "manager", managerId: "manager-artifacts",
        state: st({ value: "1,204 artifacts · 3.1 GB", source: "custom", isDefault: false }) }
    ]
  });

  /* ============================================== SYSTEM / INDEX */

  addSub("system", {
    id: "sys-index", title: "Project search index",
    summary: "The retrieval index agents use to find code, and what it costs to keep.",
    keywords: ["index", "retrieval", "embedding", "rebuild", "exclude"],
    settings: [
      { id: "idx-enabled", label: "Index this project", explanation: "Without an index, retrieval falls back to plain text search and answers get worse on large repositories.", kind: "toggle",
        state: st({ value: true, defaultValue: true, scope: "project" }) },
      { id: "idx-max-file", label: "Skip files larger than", explanation: "Large generated files are skipped so the index stays about source you actually read.", kind: "number",
        min: 64, max: 8192,
        state: st({ value: 512, defaultValue: 512, unit: "KB" }) },
      { id: "idx-symlinks", label: "Follow symlinks", explanation: "Off by default: following symlinks can walk out of the project and index somebody else's tree.", kind: "toggle",
        state: st({ value: false, defaultValue: false }) },
      { id: "idx-remote-cache", label: "Use the shared index cache", explanation: "Reuse an index built on the Project Home Server instead of rebuilding locally.", kind: "toggle",
        state: st({ value: true, defaultValue: true, source: "inherited", isDefault: false,
          inheritedFrom: "Project Home Server policy" }) },
      { id: "index-manager", label: "Index health, exclusions and rebuild", explanation: "Phase, progress, disk use, exclusions, failures and the cache that backs them.", kind: "manager", managerId: "manager-index",
        state: st({ value: "4,182 files · 96% fresh", source: "custom", isDefault: false }) }
    ]
  });

  /* ============================================ SYSTEM / CLEANUP */

  addSub("system", {
    id: "sys-cleanup", title: "Workspace cleanup",
    summary: "Removing build output and stale worktrees, with a dry run before anything goes.",
    keywords: ["cleanup", "prune", "worktree", "build output", "dry run"],
    settings: [
      { id: "clean-dry-first", label: "Always dry run first", explanation: "Cleanup lists exactly what would be removed and waits. This cannot be turned off for destructive scopes.", kind: "toggle",
        state: st({ value: true, defaultValue: true, source: "managed", isDefault: false,
          reason: "Cleanup without a preview has removed uncommitted work in the field, so the preview is not optional." }) },
      { id: "clean-schedule", label: "Run cleanup", explanation: "When the cleanup plan is proposed. It is never applied without an explicit confirmation.", kind: "select",
        options: ["Never automatically", "Weekly", "When storage is low"],
        state: st({ value: "When storage is low", defaultValue: "Never automatically", isDefault: false, source: "custom" }) },
      { id: "clean-keep-evidence", label: "Keep evidence for removed items", explanation: "A receipt naming every removed path is kept even after the files are gone.", kind: "toggle",
        state: st({ value: true, defaultValue: true }) },
      { id: "clean-worktree-age", label: "Offer to remove worktrees idle for", explanation: "Idle worktrees are proposed for removal. Worktrees with uncommitted changes are never proposed.", kind: "number",
        min: 1, max: 180,
        state: st({ value: 21, defaultValue: 30, isDefault: false, source: "custom", unit: "days" }) },
      { id: "cleanup-manager", label: "Cleanup scopes, dry run and receipts", explanation: "What each scope would remove, the safety rules that protect work in progress, and the receipt of every pass.", kind: "manager", managerId: "manager-cleanup",
        state: st({ value: "Dry run required · 6.8 GB reclaimable", source: "custom", isDefault: false }) }
    ]
  });

  /* ============================================= SYSTEM / SERVER */

  addSub("system", {
    id: "sys-server", title: "Servers & hosts",
    summary: "The Project Home Server, execution hosts and clients — and the modules still to be inserted here.",
    keywords: ["server", "host", "truenas", "execution", "client", "remote"],
    settings: [
      { id: "srv-home", label: "Project Home Server", explanation: "The single server that owns this project's vault. Everything else is an execution host or a client.", kind: "select",
        options: ["Home TrueNAS", "This computer", "Choose a server"],
        state: st({ value: "Home TrueNAS", defaultValue: "This computer", isDefault: false, source: "custom" }) },
      { id: "srv-execution", label: "Run work on", explanation: "The default execution host for new work. The Home Server is the default execution host unless another is chosen.", kind: "select",
        options: ["Home TrueNAS", "This computer", "Ask for each Goal"],
        state: st({ value: "Home TrueNAS", defaultValue: "Home TrueNAS" }) },
      { id: "srv-wsl", label: "Use WSL as an execution environment", explanation: "Optional. Off is a healthy state, not a missing dependency.", kind: "toggle",
        state: st({ value: false, defaultValue: false,
          effect: { kind: "info", text: "Off. Native Windows, the Home Server and containers remain available." } }) },
      { id: "srv-remote-timeout", label: "Remote host timeout", explanation: "How long a remote execution host may be unreachable before work is paused and reported.", kind: "number",
        min: 5, max: 600,
        state: st({ value: 45, defaultValue: 45, unit: "seconds" }) },
      { id: "server-manager", label: "Servers, hosts, clients and reserved modules", explanation: "The topology in human language, and each reserved destination with the owner that will insert it.", kind: "manager", managerId: "manager-server",
        state: st({ value: "1 server · 3 clients · 9 reserved", source: "custom", isDefault: false }) }
    ]
  });

  /* ============================== MANAGER ROWS IN EXISTING SUBCATEGORIES */

  addRows("appearance", "appearance-theme", [
    { id: "app-theme-manager", label: "Themes, fonts and custom appearance", explanation: "The eight built-in themes, custom TOML themes with validation and fallback, fonts, UI scale and live preview.", kind: "manager", managerId: "manager-appearance",
      state: st({ value: "8 built in · 1 custom", source: "custom", isDefault: false }) }
  ]);

  addRows("code", "code-editing", [
    { id: "files-manager", label: "File tree, tabs and editor groups", explanation: "Tree behaviour, hidden and ignored files, large-file thresholds, tab and split-group limits, and recovery after a change on disk.", kind: "manager", managerId: "manager-files",
      state: st({ value: "Tree · 2 groups · recovery on", source: "custom", isDefault: false }) }
  ]);

  addRows("code", "code-testing", [
    { id: "testing-manager", label: "Testing and debug capabilities", explanation: "Each capability set to Auto, On or Off, globally and per project, with what it needs before it can be On.", kind: "manager", managerId: "manager-testing",
      state: st({ value: "11 capabilities · 3 unavailable", source: "custom", isDefault: false }) }
  ]);

  addRows("extensions", "ext-skills", [
    { id: "plugins-manager", label: "Plugins", explanation: "Installed plugins, what each one may reach, and the funnel from installed to actually invoked.", kind: "manager", managerId: "manager-plugins",
      state: st({ value: "9 installed · 6 enabled", source: "custom", isDefault: false }) }
  ]);

  addRows("extensions", "ext-tools", [
    { id: "commands-manager", label: "Custom commands and shortcuts", explanation: "Global and project commands with parameters, shell-safety classification and a dry run, plus the keyboard map and its conflicts.", kind: "manager", managerId: "manager-commands",
      state: st({ value: "24 commands · 1 conflict", source: "custom", isDefault: false }) }
  ]);

  addRows("extensions", "ext-web", [
    { id: "web-manager", label: "Web, search and fetch", explanation: "Provider priority, limits and credit guards, caches, browser sessions, proxies, certificates and air-gap behaviour.", kind: "manager", managerId: "manager-web",
      state: st({ value: "3 providers · 1 needs a key", source: "custom", isDefault: false }) }
  ]);

  addRows("collab", "collab-git", [
    { id: "scm-manager", label: "Source control, worktrees and forges", explanation: "Changes, history, graph and worktrees, the Git or Jujutsu tool installation, and the forge connection behind them.", kind: "manager", managerId: "manager-sourcecontrol",
      state: st({ value: "git 2.47 · 3 worktrees", source: "custom", isDefault: false }) }
  ]);

  addRows("planning", "plan-goal", [
    { id: "goal-manager", label: "Goal defaults, routes and ceilings", explanation: "The defaults new Goals inherit and the ceilings they may not exceed. Live run state belongs to the Goal board, not here.", kind: "manager", managerId: "manager-goal",
      state: st({ value: "Defaults · concurrency 3", source: "custom", isDefault: false }) }
  ]);

  addRows("system", "sys-storage", [
    { id: "storage-manager", label: "Storage, retention and recovery", explanation: "Storage mode, migration, retention, legal holds, pressure, compaction, quarantine and test restores.", kind: "manager", managerId: "manager-storage",
      state: st({ value: "412 GB used · 1 volume quarantined", source: "custom", isDefault: false }) }
  ]);

  addRows("system", "sys-backup", [
    { id: "backup-manager", label: "Backup and restore", explanation: "Schedule, run now, last result and the backup log — four different kinds of row, not four form fields.", kind: "manager", managerId: "manager-backup",
      state: st({ value: "Daily · last backup 6 hours ago", source: "custom", isDefault: false }) }
  ]);

  addRows("system", "sys-reset", [
    { id: "lifecycle-manager", label: "Export, import, copy and reset settings", explanation: "Export a bundle, preview an import key by key, apply it transactionally, roll it back, or copy settings from another project once.", kind: "manager", managerId: "manager-settings-lifecycle",
      state: st({ value: "Last export 2 days ago", source: "custom", isDefault: false }) }
  ]);

  /* ===================================================== NOTICES */

  /* Each of these resolves into a manager added by this pass, so every concept's
   * Home has live, actionable content of its own rather than a static list. */
  D.notices.push(
    {
      id: "notice-slack-destination",
      severity: "attention",
      statusWord: "Needs attention",
      headline: "The Slack destination has failed its last four deliveries",
      consequence: "Slack returned channel_not_found. Approval requests are still reaching the title-bar inbox, but nobody else is being told.",
      primary: { label: "Open the destination", action: "open-manager", managerId: "manager-notifications" },
      secondary: { label: "Mute this destination", action: "dismiss" },
      target: { categoryId: "general", subcategoryId: "general-notifications", settingId: "notify-manager" }
    },
    {
      id: "notice-claude-shadow",
      severity: "attention",
      statusWord: "Needs attention",
      headline: "An older Claude installation is ahead of the selected one on PATH",
      consequence: "Puppet Master stays bound to the installation it selected, so nothing has changed. A shell that resolves claude by name will get the 2.9.1 build instead.",
      primary: { label: "Show both installations", action: "open-manager", managerId: "manager-providers" },
      secondary: { label: "Keep the current binding", action: "dismiss" },
      target: { categoryId: "agents", subcategoryId: "agents-providers", settingId: "prov-manager" }
    },
    {
      id: "notice-sound-pack",
      severity: "setup",
      statusWord: "Continue setup",
      headline: "A sound pack was downloaded but never imported",
      consequence: "Its events are not mapped, so it plays nothing. Unverified packs are never enabled on your behalf.",
      primary: { label: "Check the pack", action: "open-manager", managerId: "manager-sounds" },
      secondary: { label: "Remove the download", action: "dismiss" },
      target: { categoryId: "general", subcategoryId: "general-notifications", settingId: "sound-manager" }
    },
    {
      id: "notice-gha-secret",
      severity: "setup",
      statusWord: "Continue setup",
      headline: "The release workflow needs a repository secret before it can run",
      consequence: "Two of the three pinned workflows are ready. The release workflow would fail at its first step.",
      primary: { label: "Open the workflow", action: "open-manager", managerId: "manager-gh-actions" },
      target: { categoryId: "collab", subcategoryId: "collab-actions", settingId: "gha-manager" }
    },
    {
      id: "notice-storage-quarantine",
      severity: "recommended",
      statusWord: "Recommended",
      headline: "One storage volume is quarantined and holding 41 GB",
      consequence: "It failed a verification pass, so nothing new is written to it. The data is readable and can be migrated.",
      primary: { label: "Review the volume", action: "open-manager", managerId: "manager-storage" },
      secondary: { label: "Not now", action: "dismiss" },
      target: { categoryId: "system", subcategoryId: "sys-storage", settingId: "storage-manager" }
    }
  );

  /* ===================================================== ACTIONS */

  /* Top-level one-shot actions, so search returns action results for the new
   * families too rather than only settings and managers. */
  D.actions.push(
    { id: "act-test-destination", label: "Send a test notification", explanation: "Posts one masked test message to a destination and records exactly what it replied.",
      categoryId: "general", subcategoryId: "general-notifications", managerId: "manager-notifications",
      path: ["General & startup", "Notifications & Sounds"], keywords: ["test", "slack", "webhook", "notify"] },
    { id: "act-import-sound-pack", label: "Import a sound pack", explanation: "Checks a PeonPing or OpenPeon compatible manifest for format, licence and event coverage before importing.",
      categoryId: "general", subcategoryId: "general-notifications", managerId: "manager-sounds",
      path: ["General & startup", "Notifications & Sounds"], keywords: ["sound", "pack", "peonping", "import"] },
    { id: "act-import-theme", label: "Import a custom theme", explanation: "Validates a TOML theme, names the failing key when it is malformed, and falls back to a named base theme.",
      categoryId: "appearance", subcategoryId: "appearance-theme", managerId: "manager-appearance",
      path: ["Appearance & input", "Theme & material"], keywords: ["theme", "toml", "import", "custom"] },
    { id: "act-explain-screen", label: "Explain this screen", explanation: "Teacher describes the current screen from its own definition and offers the action it just described.",
      categoryId: "general", subcategoryId: "general-teacher", managerId: "manager-teacher",
      path: ["General & startup", "Help & Teacher"], keywords: ["teacher", "explain", "help"] },
    { id: "act-rescan-installations", label: "Rescan provider installations", explanation: "Re-inventories every installation candidate on this host without changing the current binding.",
      categoryId: "agents", subcategoryId: "agents-providers", managerId: "manager-providers",
      path: ["Agents & models", "Providers and accounts"], keywords: ["installation", "rescan", "discover", "duplicate"] },
    { id: "act-format-test", label: "Test a formatter", explanation: "Formats a sample snippet in place and shows the exact before and after.",
      categoryId: "code", subcategoryId: "code-formatters", managerId: "manager-formatters",
      path: ["Code, editor & terminal", "Formatters"], keywords: ["format", "test", "diff"] },
    { id: "act-backup-now", label: "Back up now", explanation: "Runs the backup for the selected scope immediately and writes a receipt.",
      categoryId: "system", subcategoryId: "sys-backup", managerId: "manager-backup",
      path: ["System & diagnostics", "Backups & restore points"], keywords: ["backup", "now", "restore"] },
    { id: "act-import-settings", label: "Import settings", explanation: "Previews an import key by key, including conflicts, before anything is applied.",
      categoryId: "system", subcategoryId: "sys-reset", managerId: "manager-settings-lifecycle",
      path: ["System & diagnostics", "Reset"], keywords: ["import", "settings", "conflict", "merge"] },
    { id: "act-copy-settings-from", label: "Copy settings from another project", explanation: "A one-time transactional copy with a preview, a restore point and a rollback. It does not create an inheritance link.",
      categoryId: "system", subcategoryId: "sys-reset", managerId: "manager-settings-lifecycle",
      path: ["System & diagnostics", "Reset"], keywords: ["copy", "project", "settings", "transactional"] },
    { id: "act-cleanup-dry-run", label: "Preview a workspace cleanup", explanation: "Lists exactly what would be removed. A dry run never deletes anything.",
      categoryId: "system", subcategoryId: "sys-cleanup", managerId: "manager-cleanup",
      path: ["System & diagnostics", "Workspace cleanup"], keywords: ["cleanup", "dry run", "prune"] },
    { id: "act-rebuild-index", label: "Rebuild the project search index", explanation: "Re-indexes the project and reports each phase honestly rather than showing an indeterminate spinner.",
      categoryId: "system", subcategoryId: "sys-index", managerId: "manager-index",
      path: ["System & diagnostics", "Project search index"], keywords: ["index", "rebuild", "retrieval"] },
    { id: "act-open-server-map", label: "Open the server and host map", explanation: "Shows the Project Home Server, execution hosts and clients in human language.",
      categoryId: "system", subcategoryId: "sys-server", managerId: "manager-server",
      path: ["System & diagnostics", "Servers & hosts"], keywords: ["server", "host", "client", "topology"] }
  );

  /* ============================================ STATUS PROJECTIONS */

  /* A status is a read-only projection, not a value you can set, and a
   * diagnostic is neither. Searching "backup" must therefore return five
   * visibly different kinds of row — Backup schedule (setting), Backup &
   * Restore (manager), Back up now (action), Last backup (status), Open backup
   * log (diagnostic) — which is only possible if the data models them apart. */
  D.statuses = [
    { id: "status-last-backup", label: "Last backup", explanation: "When the last backup completed, how large it was, and whether it verified.",
      value: "6 hours ago · 2.1 GB · verified", categoryId: "system", subcategoryId: "sys-backup", managerId: "manager-backup",
      path: ["System & diagnostics", "Backups & restore points"], keywords: ["backup", "last", "verified", "restore"] },
    { id: "status-provider-health", label: "Provider health", explanation: "How many provider families are ready right now, and how many need attention.",
      value: "8 families · 2 need attention", categoryId: "agents", subcategoryId: "agents-providers", managerId: "manager-providers",
      path: ["Agents & models", "Providers and accounts"], keywords: ["provider", "health", "ready", "attention"] },
    { id: "status-update-state", label: "Provider update state", explanation: "Installations with an update available, scheduled, or rolled back.",
      value: "1 available · 1 scheduled · 1 rolled back", categoryId: "agents", subcategoryId: "agents-providers", managerId: "manager-providers",
      path: ["Agents & models", "Providers and accounts"], keywords: ["update", "installation", "rollback", "scheduled"] },
    { id: "status-notification-delivery", label: "Notification delivery", explanation: "How many destinations delivered successfully on their last attempt.",
      value: "7 of 8 destinations healthy", categoryId: "general", subcategoryId: "general-notifications", managerId: "manager-notifications",
      path: ["General & startup", "Notifications & Sounds"], keywords: ["notification", "delivery", "slack", "failing"] },
    { id: "status-index-freshness", label: "Search index freshness", explanation: "How much of the project index reflects the working tree right now.",
      value: "96% fresh · 4,182 files", categoryId: "system", subcategoryId: "sys-index", managerId: "manager-index",
      path: ["System & diagnostics", "Project search index"], keywords: ["index", "fresh", "retrieval", "stale"] },
    { id: "status-storage-pressure", label: "Storage pressure", explanation: "Space in use, and whether any volume is quarantined or under pressure.",
      value: "412 GB used · 1 volume quarantined", categoryId: "system", subcategoryId: "sys-storage", managerId: "manager-storage",
      path: ["System & diagnostics", "Storage"], keywords: ["storage", "disk", "pressure", "quarantine"] }
  ];

  /* =================================================== DIAGNOSTICS */

  D.diagnostics = [
    { id: "diag-backup-log", label: "Open backup log", explanation: "The full log of the last backup, including every file group it covered.",
      categoryId: "system", subcategoryId: "sys-backup", managerId: "manager-backup",
      path: ["System & diagnostics", "Backups & restore points"], keywords: ["backup", "log", "receipt", "diagnose"] },
    { id: "diag-update-log", label: "Open the update attempt log", explanation: "The redacted installer and verification log for the last provider update attempt.",
      categoryId: "agents", subcategoryId: "agents-providers", managerId: "manager-providers",
      path: ["Agents & models", "Providers and accounts"], keywords: ["update", "log", "verification", "rollback"] },
    { id: "diag-notification-log", label: "Open the notification delivery log", explanation: "Every delivery attempt with the exact reply each destination returned.",
      categoryId: "general", subcategoryId: "general-notifications", managerId: "manager-notifications",
      path: ["General & startup", "Notifications & Sounds"], keywords: ["notification", "delivery", "log", "webhook"] },
    { id: "diag-index-failures", label: "Open index failures", explanation: "Files the indexer could not read, and why each one was skipped.",
      categoryId: "system", subcategoryId: "sys-index", managerId: "manager-index",
      path: ["System & diagnostics", "Project search index"], keywords: ["index", "failure", "skipped", "log"] },
    { id: "diag-cleanup-receipt", label: "Open the last cleanup receipt", explanation: "Exactly what the last cleanup removed, kept after the files are gone.",
      categoryId: "system", subcategoryId: "sys-cleanup", managerId: "manager-cleanup",
      path: ["System & diagnostics", "Workspace cleanup"], keywords: ["cleanup", "receipt", "removed", "evidence"] },
    { id: "diag-formatter-output", label: "Open formatter output", explanation: "The stderr of the last formatter run, including the exact command that ran.",
      categoryId: "code", subcategoryId: "code-formatters", managerId: "manager-formatters",
      path: ["Code, editor & terminal", "Formatters"], keywords: ["formatter", "output", "stderr", "log"] }
  ];

  /* Names the spellchecker must not flag, added by this pass. */
  ["PeonPing", "OpenPeon", "Podman", "Buildx", "kubectl", "Helm", "Unraid", "TrueNAS", "Jujutsu",
    "ntfy", "Pushover", "Telegram", "Discord", "Slack", "OpenCode", "Codex", "Gemini", "Homebrew",
    "npm", "Scoop", "winget", "TOML"].forEach(function (n) {
    if (D.knownNames.indexOf(n) < 0) D.knownNames.push(n);
  });
})();
