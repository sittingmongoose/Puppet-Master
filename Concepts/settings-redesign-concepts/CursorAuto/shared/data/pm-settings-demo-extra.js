/* ============================================================================
   pm-settings-demo-extra.js — CursorAuto final-packet fixture expansion
   Mutates window.PM_SETTINGS_DEMO after the base demo loads.
   Packet: PM_Settings_Bakeoff_Final_Cumulative_2026-08-08
   ========================================================================== */
(function () {
  "use strict";

  var DEMO = window.PM_SETTINGS_DEMO;
  if (!DEMO) return;

  function clone(o) { return o == null ? o : JSON.parse(JSON.stringify(o)); }

  DEMO.meta = DEMO.meta || {};
  DEMO.meta.seededAt = "2026-08-11";
  DEMO.meta.packet = "PM_Settings_Bakeoff_Final_Cumulative_2026-08-08";
  DEMO.meta.model = "CursorAuto";

  /* ---------- Provider installations + fixtures 1–17 ---------- */
  var providers = DEMO.providers || [];
  function byId(id) {
    for (var i = 0; i < providers.length; i++) if (providers[i].id === id) return providers[i];
    return null;
  }

  var anthropic = byId("anthropic");
  if (anthropic) {
    anthropic.installations = [
      {
        id: "claude-cli-stable",
        label: "Claude CLI (stable)",
        path: "C:\\\\Users\\\\jared\\\\AppData\\\\Local\\\\Claude\\\\claude.exe",
        version: "1.0.48",
        owner: "Anthropic",
        confidence: "high",
        selected: true,
        shadowed: false,
        health: "ready",
        note: "Selected installation for future requests."
      },
      {
        id: "claude-cli-beta",
        label: "Claude CLI (beta channel)",
        path: "C:\\\\Tools\\\\claude-beta\\\\claude.exe",
        version: "1.1.0-beta.3",
        owner: "Anthropic",
        confidence: "high",
        selected: false,
        shadowed: true,
        health: "ready",
        note: "Shadowed — present on disk but not selected."
      }
    ];
    anthropic.updatePolicy = { mode: "ask-first", availableVersion: "1.0.52", note: "Update available — Ask first before applying." };
  }

  var antigravity = byId("antigravity");
  if (antigravity) {
    antigravity.installations = [
      {
        id: "ag-cli",
        label: "Antigravity CLI",
        path: "C:\\\\Program Files\\\\Antigravity\\\\ag.exe",
        version: "0.9.2",
        owner: "Google",
        confidence: "high",
        selected: true,
        shadowed: false,
        health: "signed-out",
        note: "CLI found; not signed in."
      }
    ];
  }

  var openai = byId("openai");
  if (openai) {
    openai.requestedEffective = {
      requestedAccount: "oauth",
      effectiveAccount: "api",
      reason: "OAuth account is auth-ok but invocation-failed; effective route falls back to API for new requests."
    };
    if (openai.catalog) openai.catalog.lastKnownGood = true;
  }

  var vllm = byId("vllm-tenant");
  if (vllm) {
    vllm.installAction = {
      label: "Install from official source",
      source: "https://example.invalid/vllm-tenant/install",
      receipt: "Official Install simulated — nothing was downloaded"
    };
    vllm.installations = [
      {
        id: "vllm-missing",
        label: "Not installed",
        path: null,
        version: null,
        owner: "Your organization",
        confidence: "n/a",
        selected: false,
        shadowed: false,
        health: "not-installed",
        note: "Explicit Install from the official source is available."
      }
    ];
  }

  var local = byId("local-server");
  if (local) {
    local.updatePolicy = { mode: "scheduled-idle", availableVersion: "0.4.1", note: "Update scheduled when idle." };
    local.usageSnapshot = {
      includedRemaining: "Unavailable",
      extraBalance: "Unavailable",
      resetsAt: "Unknown",
      pressure: "unknown",
      lastSuccessfulUse: "2026-08-10 18:02",
      projection: "Usage details unavailable — provider is still ready for local generations",
      sourceFreshness: "Usage endpoint unreachable; readiness probe passed",
      unavailable: true
    };
    local.healthNote = "Ready; usage details unavailable.";
  }

  /* Fixture 4 — unknown owner, manual-only */
  if (!byId("mystery-cli")) {
    providers.push({
      id: "mystery-cli",
      name: "Detected CLI (unknown owner)",
      tagline: "A binary matched a known shape but ownership is unknown",
      connectionGroup: "installed-tools",
      installState: "installed-signed-out",
      authModel: "none",
      authNote: "Manual-only — Puppet Master will not auto-manage an unknown owner.",
      installations: [
        {
          id: "mystery-1",
          label: "Unknown CLI at custom path",
          path: "D:\\\\bin\\\\agentish.exe",
          version: "?",
          owner: "Unknown",
          confidence: "unknown",
          selected: false,
          shadowed: false,
          health: "manual-only",
          manualOnly: true,
          note: "Unknown installation owner — manual-only; Select is disabled until you confirm ownership."
        }
      ],
      accounts: [],
      product: { plan: "Unknown", billingRoute: "Manual" },
      models: [],
      routing: { priority: 99, useNextOnExhaust: false, continuation: "Never auto-switch" },
      catalog: { source: "local-scan", lastChecked: "2026-08-11", lastActivated: null, version: "scan", refreshing: false, lastKnownGood: false },
      usageSnapshot: null,
      diagnostics: ["Scan found a binary with a familiar argv shape", "Owner confidence: unknown — manual-only"]
    });
  }

  /* Fixture 8 — verify-fail + rollback */
  if (!byId("codex-cli")) {
    providers.push({
      id: "codex-cli",
      name: "Codex CLI",
      tagline: "CLI install with verification rollback fixture",
      connectionGroup: "installed-tools",
      installState: "installed-signed-in",
      authModel: "cli-profile-oauth",
      authNote: "CLI-owned OAuth inside an isolated profile.",
      installations: [
        {
          id: "codex-current",
          label: "Codex CLI",
          path: "C:\\\\Users\\\\jared\\\\AppData\\\\Local\\\\Codex\\\\codex.exe",
          version: "0.22.0",
          owner: "OpenAI",
          confidence: "high",
          selected: true,
          shadowed: false,
          health: "ready",
          note: "Active after rollback."
        },
        {
          id: "codex-failed",
          label: "Codex CLI (failed verify)",
          path: "C:\\\\Users\\\\jared\\\\AppData\\\\Local\\\\Codex\\\\codex-new.exe",
          version: "0.23.0",
          owner: "OpenAI",
          confidence: "high",
          selected: false,
          shadowed: true,
          health: "verify-failed-rolled-back",
          note: "Verification failed; rollback to 0.22.0 succeeded (simulated)."
        }
      ],
      updatePolicy: { mode: "ask-first", availableVersion: null, lastResult: "Verification failed and rollback succeeded" },
      accounts: [
        {
          id: "codex-user",
          label: "Codex profile",
          identity: "jared@example.com",
          enabled: true,
          priority: 1,
          sticky: true,
          active: true,
          health: "ready",
          lastCatalogRefresh: "2026-08-11 09:00",
          lastSuccessfulGeneration: "2026-08-11 10:12",
          usagePressure: "low",
          resetAt: "2026-08-18"
        }
      ],
      product: { plan: "Codex", billingRoute: "CLI profile" },
      models: [
        {
          id: "codex-model",
          name: "Codex",
          alias: null,
          favorite: true,
          hidden: false,
          priority: 1,
          contextLimit: 192000,
          modalities: { in: ["text"], out: ["text"] },
          capabilities: {
            tools: { state: "supported", evidence: "Observed", freshAsOf: "2026-08-11" },
            vision: { state: "unsupported", evidence: "Not declared", freshAsOf: "2026-08-11" },
            structuredOutput: { state: "likely", evidence: "Catalog", freshAsOf: "2026-08-11" }
          },
          fastMode: { supported: true, evidence: "Fast/Normal available" },
          effort: ["low", "medium", "high"]
        }
      ],
      routing: { priority: 4, useNextOnExhaust: true, continuation: "Ask before switching" },
      catalog: { source: "models.dev", lastChecked: "2026-08-11 09:00", lastActivated: "2026-08-11 09:00", version: "2026.08.11", refreshing: false, lastKnownGood: true },
      usageSnapshot: {
        includedRemaining: "88%",
        extraBalance: "None on file",
        resetsAt: "2026-08-18",
        pressure: "low",
        lastSuccessfulUse: "2026-08-11 10:12",
        projection: "On track",
        sourceFreshness: "Provider reported 4 minutes ago"
      },
      diagnostics: ["0.23.0 verification failed", "Rollback to 0.22.0 succeeded"]
    });
  }

  /* Fixture 11 — dedicated API-key connection */
  if (!byId("openai-api")) {
    providers.push({
      id: "openai-api",
      name: "OpenAI API",
      tagline: "Dedicated API-key connection",
      connectionGroup: "api",
      installState: "not-applicable",
      authModel: "api-key",
      authNote: "An API credential you paste into a Puppet Master connection.",
      accounts: [
        {
          id: "key-main",
          label: "API key",
          identity: "Key ending in 4c91",
          enabled: true,
          priority: 1,
          sticky: true,
          active: true,
          health: "ready",
          lastCatalogRefresh: "2026-08-11 08:40",
          lastSuccessfulGeneration: "2026-08-11 11:01",
          usagePressure: "unknown",
          resetAt: "Billed per use"
        }
      ],
      product: { plan: "API", billingRoute: "Per-use API billing" },
      models: [
        {
          id: "gpt-api",
          name: "GPT-5 API",
          alias: null,
          favorite: false,
          hidden: false,
          priority: 1,
          contextLimit: 256000,
          modalities: { in: ["text", "image"], out: ["text"] },
          capabilities: {
            tools: { state: "supported", evidence: "API discovery", freshAsOf: "2026-08-11" },
            vision: { state: "supported", evidence: "API discovery", freshAsOf: "2026-08-11" },
            structuredOutput: { state: "supported", evidence: "API discovery", freshAsOf: "2026-08-11" }
          },
          fastMode: { supported: false, evidence: "Not declared" },
          effort: ["low", "medium", "high"]
        }
      ],
      routing: { priority: 5, useNextOnExhaust: true, continuation: "Ask before switching" },
      catalog: { source: "models.dev", lastChecked: "2026-08-11 08:40", lastActivated: "2026-08-11 08:40", version: "2026.08.11", refreshing: false, lastKnownGood: true },
      usageSnapshot: {
        includedRemaining: "Metered",
        extraBalance: "API billing",
        resetsAt: "N/A",
        pressure: "low",
        lastSuccessfulUse: "2026-08-11 11:01",
        projection: "Billed per use",
        sourceFreshness: "Live"
      },
      diagnostics: ["API key accepted", "Catalog refresh ok"]
    });
  }

  /* Fixture 12 — OpenCode external server */
  if (!byId("opencode")) {
    providers.push({
      id: "opencode",
      name: "OpenCode",
      tagline: "External OpenCode server route",
      connectionGroup: "server",
      installState: "not-applicable",
      authModel: "server",
      authNote: "A server route — no shared sign-in.",
      server: { url: "https://opencode.example.invalid", status: "reachable", lastProbe: "2026-08-11 10:55" },
      accounts: [
        {
          id: "oc-route",
          label: "OpenCode server",
          identity: "opencode.example.invalid",
          enabled: true,
          priority: 1,
          sticky: false,
          active: true,
          health: "ready",
          lastCatalogRefresh: "2026-08-11 10:55",
          lastSuccessfulGeneration: "2026-08-10 22:18",
          usagePressure: "unknown",
          resetAt: "Server-managed"
        }
      ],
      product: { plan: "External server", billingRoute: "Server-owned" },
      models: [
        {
          id: "oc-default",
          name: "OpenCode Default",
          alias: null,
          favorite: false,
          hidden: false,
          priority: 1,
          contextLimit: 128000,
          modalities: { in: ["text"], out: ["text"] },
          capabilities: {
            tools: { state: "likely", evidence: "Server advertised", freshAsOf: "2026-08-11" },
            vision: { state: "unverified", evidence: "Not probed", freshAsOf: "2026-08-11" },
            structuredOutput: { state: "likely", evidence: "Server advertised", freshAsOf: "2026-08-11" }
          },
          fastMode: { supported: false, evidence: "Not declared" },
          effort: null
        }
      ],
      routing: { priority: 8, useNextOnExhaust: false, continuation: "Stop and wait" },
      catalog: { source: "opencode-server", lastChecked: "2026-08-11 10:55", lastActivated: "2026-08-11 10:55", version: "server", refreshing: false, lastKnownGood: true },
      usageSnapshot: {
        includedRemaining: "Server-managed",
        extraBalance: "Server-managed",
        resetsAt: "Unknown",
        pressure: "unknown",
        lastSuccessfulUse: "2026-08-10 22:18",
        projection: "Usage owned by the OpenCode server",
        sourceFreshness: "Probe 20 minutes ago"
      },
      diagnostics: ["Server reachable", "TLS ok"]
    });
  }

  DEMO.providers = providers;

  /* ---------- Fixture collections ---------- */
  DEMO.notifications = {
    inboxRule: "Attention and setup only in the title-bar inbox",
    routing: [
      { event: "Attention", destinations: ["title-bar-inbox", "system-tray"] },
      { event: "Setup incomplete", destinations: ["title-bar-inbox"] },
      { event: "Sound blocked", destinations: ["title-bar-inbox", "ntfy"] }
    ],
    destinations: [
      { id: "title-bar-inbox", name: "Title-bar inbox", title: "Title-bar inbox", kind: "inbox", channel: "title-bar", enabled: true, health: "ready", note: "Stack and inbox live in the title bar only — no bottom-right stack.", search: "inbox notifications title bar", fields: { successPredicate: "delivered", retry: "none" } },
      { id: "system-tray", name: "System tray", title: "System tray", kind: "tray", channel: "system-tray", enabled: true, health: "ready", note: "OS tray mirror", search: "tray os notifications", fields: { successPredicate: "acked", retry: "1" } },
      { id: "slack", name: "Slack", title: "Slack", kind: "webhook", channel: "slack", enabled: false, health: "not-configured", note: "Webhook not configured", search: "slack webhook workspace", fields: { successPredicate: "2xx", retry: "3" } },
      { id: "discord", name: "Discord", title: "Discord", kind: "webhook", channel: "discord", enabled: false, health: "not-configured", note: "Webhook not configured", search: "discord webhook", fields: { successPredicate: "2xx", retry: "3" } },
      { id: "webhook", name: "Generic webhook", title: "Generic webhook", kind: "webhook", channel: "webhook", enabled: false, health: "not-configured", note: "HTTPS endpoint not set", search: "webhook http notifications", fields: { successPredicate: "2xx", retry: "2" } },
      { id: "ntfy", name: "ntfy", title: "ntfy", kind: "push", channel: "ntfy", enabled: true, health: "ready", note: "Self-hosted topic", search: "ntfy push topic", fields: { successPredicate: "published", retry: "2" } },
      { id: "pushover", name: "Pushover", title: "Pushover", kind: "push", channel: "pushover", enabled: false, health: "not-configured", note: "User key missing", search: "pushover notifications", fields: { successPredicate: "1", retry: "1" } },
      { id: "telegram", name: "Telegram", title: "Telegram", kind: "bot", channel: "telegram", enabled: false, health: "not-configured", note: "Bot token not configured", search: "telegram bot notifications", fields: { successPredicate: "ok", retry: "2" } }
    ]
  };

  DEMO.soundLibrary = {
    masterVolume: 62,
    packs: [
      { id: "peonping", name: "PeonPing", title: "PeonPing", state: "verified", license: "MIT", imported: true, note: "Valid pack" },
      { id: "openpeon", name: "OpenPeon", title: "OpenPeon", state: "license-check-failed", license: "Unknown", imported: false, note: "License-blocked until provenance is confirmed" }
    ],
    events: [
      { id: "ping-soft", event: "Soft ping", name: "Soft ping", sound: "ping-soft.wav", source: "PeonPing", license: "MIT", duration: "220 ms", search: "peonping soft" },
      { id: "ping-alert", event: "Alert chime", name: "Alert chime", sound: "ping-alert.wav", source: "PeonPing", license: "MIT", duration: "480 ms", search: "peonping alert" },
      { id: "peon-work", event: "Work complete", name: "Work complete", sound: "work-complete.wav", source: "OpenPeon", license: "Unknown", duration: "600 ms", search: "openpeon blocked" },
      { id: "peon-bad", event: "Broken upload", name: "Broken upload", sound: "broken.bin", source: "OpenPeon", license: "Unknown", duration: "—", search: "format fail upload" }
    ],
    items: [
      { id: "ping-soft", title: "Soft ping", pack: "PeonPing", state: "valid", durationMs: 220, search: "peonping soft" },
      { id: "ping-alert", title: "Alert chime", pack: "PeonPing", state: "valid", durationMs: 480, search: "peonping alert" },
      { id: "peon-work", title: "Work complete", pack: "OpenPeon", state: "license-blocked", durationMs: 600, search: "openpeon blocked" },
      { id: "peon-bad", title: "Broken upload", pack: "OpenPeon", state: "format-fail", durationMs: null, search: "format fail upload" }
    ]
  };

  DEMO.desktop = {
    /* renderer keys */
    tray: false,
    windowFrame: false,
    startMinimized: false,
    retainOnClose: true,
    notificationsInTray: true,
    /* richer Score fields */
    launchAtLogin: false,
    trayIcon: "not-configured",
    trayMenu: "default",
    windowChrome: "system",
    badges: "attention-only",
    minimizeToTray: false,
    multiMonitor: "not-configured",
    notes: "Desktop/Tray/Window — tray icon still Not configured until the native shell reports one."
  };

  DEMO.teacher = {
    tips: [
      { id: "tip-search", title: "Search is the spine", body: "Type a manager or setting name; results deep-link with a focus wash.", status: "ready" },
      { id: "tip-inbox", title: "Title-bar inbox only", body: "Notifications stack in the title-bar inbox — never a bottom-right toast pile.", status: "ready" },
      { id: "tip-install", title: "Installations are host/env cards", body: "Selected vs shadowed installations change future requests only.", status: "ready" }
    ],
    tours: [
      { id: "tour-providers", title: "Providers walkthrough", status: "not-configured" },
      { id: "tour-memory", title: "Memory review tour", status: "ready" }
    ],
    helpTopics: [
      { id: "help-filesafe", title: "FileSafe coverage", href: "#help/filesafe" },
      { id: "help-sounds", title: "Sound packs and licenses", href: "#help/sounds" }
    ]
  };

  DEMO.bsd = {
    enabled: true,
    mode: "coach",
    policies: [
      { id: "bsd-approve-writes", title: "Coach before destructive writes", enabled: true },
      { id: "bsd-narrate", title: "Narrate risky tool calls", enabled: true },
      { id: "bsd-quiet", title: "Quiet during Goal runs", enabled: false }
    ],
    sessions: [
      { id: "bsd-sess-1", title: "Yesterday evening", interventions: 3, status: "closed" },
      { id: "bsd-sess-2", title: "Current session", interventions: 1, status: "active" }
    ]
  };

  DEMO.permissionsRules = [
    { id: "pr-1", order: 1, match: "**/node_modules/**", pattern: "**/node_modules/**", effect: "Deny", action: "deny", scope: "FileSafe", origin: "Recommended", enabled: true, note: "Never auto-admit vendor trees" },
    { id: "pr-2", order: 2, match: "**/dist/**", pattern: "**/dist/**", effect: "Ask for approval", action: "ask", scope: "FileSafe", origin: "Custom", enabled: true, note: "Build output can be regenerated" },
    { id: "pr-3", order: 3, match: "**/docs/**", pattern: "**/docs/**", effect: "Allow", action: "allow", scope: "FileSafe", origin: "Custom", enabled: true, note: "Docs are safe to rewrite" },
    { id: "pr-4", order: 4, match: "shell:rm", pattern: "shell:rm", effect: "Ask for approval", action: "ask", scope: "Approvals", origin: "Custom", enabled: true, note: "Destructive shell — always ask", conflictsWith: null }
  ];

  DEMO.goal = {
    concurrency: 4,
    concurrencyCeiling: 4,
    spendCeiling: "$25.00",
    timeCeiling: "2 hours",
    softStop: true,
    reserveForSynthesis: true,
    spendGuard: "ask-at-75-percent",
    checkpoints: true,
    automationRuns: [
      { id: "goal-1", title: "Stabilize CI flakes", status: "paused", spend: "42%" },
      { id: "goal-2", title: "Docs pass", status: "ready", spend: "8%" }
    ]
  };

  DEMO.fileManager = {
    tree: { showHidden: false, respectIgnored: true },
    largeFile: { threshold: "2 MB", behavior: "Ask" },
    recovery: { note: "Unsaved buffers survive restarts.", lastTest: "never" },
    associations: [
      { id: "fm-md", pattern: "*.md", editor: "Puppet Master", status: "ready" },
      { id: "fm-rs", pattern: "*.rs", editor: "external:code", status: "ready" },
      { id: "fm-bin", pattern: "*.bin", editor: "not-configured", status: "not-configured" }
    ],
    diffTool: "built-in",
    revealPolicy: "project-relative"
  };

  DEMO.formatters = [
    { id: "fmt-js", language: "JavaScript", owner: "Prettier", version: "3.3.3", scope: "project", status: "ready" },
    { id: "fmt-py", language: "Python", owner: "ruff", version: "0.6.2", scope: "project", status: "ready" },
    { id: "fmt-rs", language: "Rust", owner: "rustfmt", version: "1.7", scope: "toolchain", status: "ready" },
    { id: "fmt-go", language: "Go", owner: "not-configured", scope: "project", status: "not-configured", note: "No gofmt path claimed yet" }
  ];

  DEMO.testing = {
    capabilities: [
      { id: "test-py", name: "pytest", global: "Auto", project: "On", status: "ready", lastRun: "2026-08-11 09:40" },
      { id: "test-node", name: "node:test", global: "Auto", project: "Auto", status: "attention", lastRun: "2026-08-10 19:12" },
      { id: "dbg-py", name: "Python debugger", global: "On", project: "On", status: "ready" },
      { id: "dbg-chrome", name: "Chrome CDP", global: "Off", project: "Auto", status: "not-configured" }
    ],
    runners: [
      { id: "test-py", title: "pytest", status: "ready", lastRun: "2026-08-11 09:40" },
      { id: "test-node", title: "node:test", status: "attention", lastRun: "2026-08-10 19:12" }
    ],
    debugAdapters: [
      { id: "dbg-py", title: "Python debugger", status: "ready" },
      { id: "dbg-chrome", title: "Chrome CDP", status: "not-configured" }
    ]
  };

  DEMO.storage = {
    mode: "Local",
    pressure: "Attention on Artifacts",
    retention: "90 days default",
    quarantine: "3 items",
    encryption: "At rest (demo)",
    legalHold: "None",
    health: "ok",
    buckets: [
      { id: "store-cache", title: "Cache", used: "1.2 GB", retention: "14 days", status: "ready" },
      { id: "store-logs", title: "Logs", used: "420 MB", retention: "30 days", status: "ready" },
      { id: "store-artifacts", title: "Artifacts", used: "3.8 GB", retention: "90 days", status: "attention" }
    ]
  };

  DEMO.backup = {
    snapshots: [
      { id: "bak-1", title: "Morning snapshot", at: "2026-08-11 07:00", status: "ready" },
      { id: "bak-2", title: "Pre-import", at: "2026-08-10 22:15", status: "ready" }
    ],
    restorePoints: [
      { id: "rp-1", title: "After theme import", at: "2026-08-09 18:44", status: "ready" }
    ],
    runs: [
      { id: "run-daily", kind: "Daily local", last: "2026-08-11 07:00", schedule: "Daily 07:00", retention: "14 days", verified: true },
      { id: "run-preimport", kind: "Pre-import", last: "2026-08-10 22:15", schedule: "On demand", retention: "3 copies", verified: false, note: "Taken before Settings import preview" }
    ]
  };

  DEMO.settingsLifecycle = {
    status: "idle",
    fileName: "pm-settings-2026-08-05.json",
    source: "Exported from Puppet Master project, 5 days ago",
    conflicts: [
      { key: "appearance.theme", current: "Harbor Night", incoming: "Score Day", resolution: "Ask" },
      { key: "planning.goal-concurrency", current: "4", incoming: "8", resolution: "Keep current" }
    ],
    legacy: [
      { key: "safety.access.mode", note: "Destination renamed to permissions.filesafe-mode", action: "Migrate" }
    ],
    lastJob: {
      id: "job-idle",
      phase: "idle",
      conflicts: [],
      receipt: null
    },
    exportFormats: ["JSON", "TOML bundle"],
    fixtures: ["Import conflict", "Rollback complete"]
  };

  DEMO.history = [
    { id: "hist-1", title: "Harbor pier session", kind: "thread", at: "2026-08-11 10:02", project: "PuppetMaster", status: "ready", note: "Context + Memory berthing walkthrough" },
    { id: "hist-2", title: "Score cue rehearsal", kind: "goal", at: "2026-08-10 16:20", project: "settings-bakeoff", status: "ready", legalHold: true, note: "Held for audit — export only" },
    { id: "hist-3", title: "Switchboard patch debug", kind: "planning-run", at: "2026-08-09 11:05", project: "PuppetMaster", status: "archived", note: "Commands conflict resolve transcript" },
    { id: "hist-4", title: "Archive cleanup dry-run", kind: "thread", at: "2026-08-08 18:44", project: "settings-bakeoff", status: "ready", note: "Dry-run phases retained" }
  ];

  DEMO.artifacts = [
    { id: "art-1", title: "CI log bundle", kind: "log", size: "2.1 MB", owner: "CI", retention: "30 days", location: ".pm/artifacts/ci", status: "ready" },
    { id: "art-2", title: "Diff patch", kind: "patch", size: "44 KB", owner: "Agent", retention: "14 days", location: ".pm/artifacts/patches", status: "ready" },
    { id: "art-3", title: "Screenshot (unavailable)", kind: "image", size: "—", owner: "Media route", retention: "n/a", status: "unavailable", note: "Unavailable capability exemplar" },
    { id: "art-4", title: "Import preview report", kind: "report", size: "12 KB", owner: "Settings Lifecycle", retention: "90 days", location: ".pm/artifacts/imports", status: "ready" }
  ];

  DEMO.worktrees = [
    { id: "wt-1", title: "main", path: "P:/", status: "active" },
    { id: "wt-2", title: "settings-bakeoff", path: "P:/.worktrees/settings", status: "ready" },
    { id: "wt-3", title: "stale-agent", path: "P:/.worktrees/stale", status: "attention" }
  ];

  DEMO.githubActions = {
    connected: true,
    readiness: "Pinned workflows refresh from the project Actions index",
    pinned: [
      { id: "gha-1", name: "ci.yml", title: "ci.yml", last: "success", runs: 42, status: "ready", lastRun: "success" },
      { id: "gha-2", name: "release.yml", title: "release.yml", last: "—", runs: 0, status: "not-configured", lastRun: null },
      { id: "gha-3", name: "nightly.yml", title: "nightly.yml", last: "failed", runs: 11, status: "attention", lastRun: "failed" }
    ],
    currentRun: {
      id: "run-9912",
      workflow: "ci.yml",
      status: "completed",
      jobs: [
        { name: "lint", status: "completed", conclusion: "success", duration: "48s" },
        { name: "unit", status: "completed", conclusion: "success", duration: "2m 11s" },
        { name: "e2e", status: "completed", conclusion: "failure", duration: "4m 02s" }
      ]
    }
  };

  DEMO.containers = {
    note: "Registries and local runtimes are probed for Settings — no containers are started from here.",
    top: [
      { name: "ghcr.io/example/pm-dev", title: "ghcr.io/example/pm-dev", state: "ready", status: "ready", detail: "Dev image · amd64", expanded: ["digest sha256:aa11…", "last pull 2026-08-10", "entrypoint /usr/bin/pm"] },
      { name: "local/postgres:16", title: "local/postgres:16", state: "ready", status: "ready", detail: "Local runtime", expanded: ["port 5432", "volume pgdata"] },
      { name: "registry.example/missing", title: "registry.example/missing", state: "unavailable", status: "unavailable", detail: "Manifest 404", expanded: ["auth: anonymous", "retry after credentials"] }
    ]
  };

  DEMO.web = {
    readiness: "Fetch ready · Search not configured",
    providerPriority: ["Project docs", "Docs allowlist", "Public web (off)"],
    limits: { requestsPerMinute: 20, maxBytes: "2 MB", concurrent: 2 },
    creditGuard: "Ask before paid search",
    airGap: "Off",
    browserSessions: "Ephemeral",
    fetch: { enabled: true, allowlist: "project + docs", status: "ready" },
    search: { provider: "not-configured", status: "not-configured" },
    extract: { route: "readability", status: "ready" }
  };

  DEMO.searchIndex = {
    enabled: true,
    status: "ready",
    documents: 12840,
    disk: "842 MB",
    exclusions: ["node_modules", ".git", "dist"],
    rebuild: {
      state: "idle",
      lastFull: "2026-08-11 06:10",
      phases: ["scan", "tokenize", "write"],
      note: "Last rebuild completed cleanly — lag 0s."
    },
    lastBuild: "2026-08-11 06:10",
    lag: "0s",
    note: "Project search index healthy"
  };

  DEMO.cleanup = {
    mode: "dry-run",
    protectedNote: "Active worktrees and pinned artifacts stay protected until explicitly included.",
    lastDryRun: "2026-08-11 08:40",
    reclaimable: "1.4 GB",
    candidates: [
      { id: "cleanup-1", title: "Purge stale worktrees", status: "ready", impact: "2 directories · 220 MB", protected: false, included: true, detail: "worktree-abandoned-a, worktree-abandoned-b" },
      { id: "cleanup-2", title: "Compact artifact store", status: "attention", impact: "1.1 GB reclaimable", protected: false, included: true, detail: "CI log bundles older than 30 days" },
      { id: "cleanup-3", title: "Clear dead MCP sockets", status: "ready", impact: "3 sockets", protected: false, included: false, detail: "orphaned local sockets" },
      { id: "cleanup-4", title: "Active Harbor worktree", status: "protected", impact: "0 (protected)", protected: true, included: false, detail: "Current project worktree — cannot remove in dry-run" }
    ]
  };

  DEMO.serverShell = {
    note: "Future Server Module Shell — deferred named-owner insertion cards only. No fake bootstrap.",
    cards: [
      { label: "Claim state", value: "Owned elsewhere" },
      { label: "Bootstrap", value: "Not simulated here" },
      { label: "Sync/Move", value: "Deferred to Project Sync owner" }
    ],
    deferredModules: [
      { id: "srv-onboarding", name: "Product Onboarding", owner: "Product Onboarding", contract: "Settings deep-links into onboarding; does not own the first-run state machine.", status: "deferred" },
      { id: "srv-doctor", name: "Doctor", owner: "Doctor", contract: "Health rows deep-link; Doctor owns diagnosis flows.", status: "deferred" },
      { id: "srv-install", name: "Installation / Deployment", owner: "Installation/Deployment", contract: "Install buttons call the owner; Settings shows installation cards and receipts only.", status: "deferred" },
      { id: "srv-claim", name: "Server Claim / Bootstrap", owner: "Server Claim/Bootstrap", contract: "Future Server Module Shell shows named insertion only; bootstrap stays with the owner.", status: "deferred" },
      { id: "srv-sync", name: "Project Sync / Move", owner: "Project Sync/Move", contract: "Archive shows a deferred card; sync/move is owned elsewhere.", status: "deferred" },
      { id: "srv-updates", name: "PM app updates", owner: "Release/updates owner", contract: "Update channel rows stay in Settings; the app updater state machine is deferred.", status: "deferred" }
    ]
  };

  DEMO.appearanceThemes = {
    liveReload: true,
    loadAtStartup: true,
    themes: [
      { id: "theme-harbor-night", name: "Harbor Night", title: "Harbor Night", state: "ready", source: "built-in", file: "themes/harbor-night.toml", base: "Friendly Dark", reloaded: "2026-08-11 08:10" },
      { id: "theme-score-day", name: "Score Day", title: "Score Day", state: "ready", source: "imported", file: "themes/score-day.toml", base: "Friendly Light", reloaded: "2026-08-10 21:02" },
      { id: "theme-locked", name: "Managed Contrast", title: "Managed Contrast", state: "locked", source: "managed", file: "themes/managed-contrast.toml", base: "High Contrast", reloaded: "policy", note: "Managed by the workspace policy." },
      { id: "theme-bad-toml", name: "Broken import", title: "Broken import", state: "schema-invalid", source: "import", file: "themes/broken.toml", base: "Friendly Dark", reloaded: "failed", diagnostic: "Invalid TOML: expected '=' after key `colors.accent` on line 12.", diagnosis: "Invalid TOML: expected '=' after key `colors.accent` on line 12." },
      { id: "theme-unavailable", name: "Legacy bloom", title: "Legacy bloom", state: "unavailable", source: "retired", file: "themes/legacy-bloom.toml", base: "—", reloaded: "n/a", note: "Unavailable in this build." }
    ]
  };

  DEMO.setupFixtures = [
    { id: "setup-desktop-tray", title: "Finish Desktop tray icon", terms: "tray not configured desktop", target: { manager: "desktop" } },
    { id: "setup-sound-pack", title: "Resolve OpenPeon license", terms: "sound pack blocked license", target: { manager: "soundLibrary" } },
    { id: "setup-formatter-go", title: "Choose a Go formatter", terms: "formatter not configured", target: { manager: "formatters" } }
  ];

  DEMO.generalFixtures = {
    labels: ["Default","Custom","Inherited","Managed","Unavailable","Validation error","Restart required","Reconnect required","Setting changed elsewhere","Import conflict","Rollback complete","No results","Search typo","Deep-linked setting","Long explanation","Long localized label","Narrow/squeezed layout"],
    seededAt: "2026-08-11"
  };

  /* ---------- managerMeta extension ---------- */
  var meta = DEMO.managerMeta || (DEMO.managerMeta = {});
  function upsert(id, title, purpose, icon, extra) {
    meta[id] = Object.assign({ id: id, title: title, purpose: purpose, icon: icon || "layers" }, extra || {});
  }
  upsert("providers", "Providers", "Accounts, connections, models, installations, and routing", "layers");
  upsert("memory", "Assistant memory", "Evidence-backed Gists with review and pinning", "spark");
  upsert("personas", "Personas", "Behavior definitions with explicit scopes", "mask");
  upsert("crew", "Crew", "Reusable multi-agent execution templates", "grid");
  upsert("context", "Context and instructions", "What enters each request, and why", "stack", { search: "context sources instructions budget provenance admit", aliases: ["Context sources", "Context source manager"] });
  upsert("goal", "Goal and automation", "Ceilings, spend guards, checkpoints, and automation runs", "gauge");
  upsert("permissions", "Permissions and FileSafe", "Approval rules and FileSafe coverage", "shield");
  upsert("bsd", "Back Seat Driver", "Coaching interventions for risky actions", "shield");
  upsert("notifications", "Notifications and sounds", "Destinations including the title-bar inbox", "spark", { search: "notifications sounds slack discord ntfy telegram tray inbox channels" });
  upsert("soundLibrary", "Sound library", "Uploads, packs, preview, and license states", "spark", { search: "PeonPing OpenPeon" });
  upsert("appearanceMgr", "Appearance", "Themes, import/export, live preview", "palette");
  upsert("spellcheck", "Spellcheck", "Shared writing service and dictionaries", "check");
  upsert("desktop", "Desktop, tray, and window", "Launch, tray, badges, and window chrome", "home");
  upsert("teacher", "Teacher and help", "Tips, tours, and help topics", "spark");
  upsert("fileManager", "File Manager and editor", "Associations, reveal, and diff tools", "stack");
  upsert("terminal", "Terminal", "Profiles, fonts, and shell policy", "terminal");
  upsert("lsp", "Language servers", "Per-language smarts and their state", "code");
  upsert("formatters", "Formatters", "Per-language formatting owners", "code");
  upsert("commands", "Commands and shortcuts", "Shortcuts, conflicts, and custom commands", "command");
  upsert("mcp", "MCP servers", "External tool servers and their health", "plug");
  upsert("skills", "Skills", "Installable capabilities with trust and scope", "puzzle");
  upsert("plugins", "Plugins", "Plugin channel and trust", "puzzle");
  upsert("tools", "Tools", "Unified tool inventory and approvals", "wrench");
  upsert("testing", "Testing and debug", "Runners, adapters, and debug policy", "wrench");
  upsert("storage", "Storage and retention", "Buckets, retention, and health", "stack");
  upsert("backup", "Backup and restore", "Snapshots and restore points", "stack");
  upsert("settingsLifecycle", "Settings lifecycle", "Import, export, reset, conflict, rollback", "layers");
  upsert("history", "History and sessions", "Session history finding aid", "stack");
  upsert("artifacts", "Runtime artifacts", "Outputs, logs, and patches", "stack");
  upsert("worktrees", "Source control and worktrees", "Worktree provisioning and cleanup", "grid");
  upsert("githubActions", "GitHub Actions", "Workflow visibility and status", "plug");
  upsert("containers", "Containers and registries", "Images and registries", "layers");
  upsert("web", "Web, search, and fetch", "Fetch, search, and extraction routes", "plug");
  upsert("searchIndex", "Project search index", "Index health and rebuild", "search");
  upsert("cleanup", "Workspace cleanup", "Reclaim space and clear stale resources", "wrench", { search: "cleanup dry-run reclaim worktrees artifacts" });
  upsert("serverShell", "Future server module shell", "Named-owner insertion contracts only", "layers", { resultKind: "unavailable", search: "deferred onboarding doctor bootstrap" });
  upsert("usage", "Usage", "Balances, history, and projections", "gauge");
  upsert("media", "Media", "Image, audio, and video routes (search exemplar; not a primary Home destination)", "image", { search: "media unavailable capability" });

  /* ---------- Retarget notices / recents (Media not primary) ---------- */
  DEMO.notices = (DEMO.notices || []).filter(function (n) { return n.id !== "notice-media-setup"; });
  DEMO.notices.push(
    {
      id: "notice-notifications-setup",
      kind: "setup",
      headline: "Connect a notification destination",
      consequence: "Attention events only reach the title-bar inbox until Slack, Discord, or another destination is connected.",
      actionLabel: "Open Notifications",
      secondaryLabel: "Not now",
      target: { category: "general", sub: "startup", setting: null, manager: "notifications", tab: "overview" }
    },
    {
      id: "notice-sound-blocked",
      kind: "attention",
      headline: "OpenPeon sound pack is license-blocked",
      consequence: "Preview and assign stay disabled until provenance is confirmed.",
      actionLabel: "Review sound library",
      secondaryLabel: "Dismiss",
      target: { category: "appearance", sub: "motion", setting: null, manager: "soundLibrary", tab: "overview" }
    }
  );

  DEMO.recents = [
    { label: "Title-bar notification inbox", target: { manager: "notifications", tab: "title-bar-inbox" } },
    { label: "Goal worker ceiling", target: { category: "planning", sub: "goal", setting: "planning.goal-concurrency", manager: "goal", tab: null } },
    { label: "FileSafe coverage rules", target: { manager: "permissions", tab: "overview" } },
    { label: "Settings import preview", target: { manager: "settingsLifecycle", tab: "overview" } }
  ];

  /* Media stays as ordinary category rows; strip manager deep-link emphasis from category if present */
  (DEMO.categories || []).forEach(function (cat) {
    if (cat.id === "media" && cat.manager === "media") {
      delete cat.manager;
      cat.statusSummary = cat.statusSummary || "Ordinary rows only — Media is not a primary Home destination in this packet";
    }
  });

  /* CONTEXT DEPTH PATCH — budget + instruction chain for Harbor */
  (function enrichContext() {
    var src = DEMO.contextSources;
    if (!Array.isArray(src)) return;
    DEMO.contextBudget = {
      tokensAvailable: 12000,
      tokensProjected: 7840,
      competitionNote: "Admitted sources still compete — prefer-admit is not a guarantee."
    };
    DEMO.instructionChain = [
      { id: "user", title: "User AGENTS.md", tokens: 210, wins: false },
      { id: "project", title: "Project AGENTS.md", tokens: 640, wins: false },
      { id: "concepts", title: "Concepts folder instructions", tokens: 980, wins: true, note: "Nearest scope wins on conflict" }
    ];
    src.forEach(function (s) {
      if (s.budgetShare == null) s.budgetShare = s.admittedLastTurn ? "competing" : "standby";
      if (!s.actions) s.actions = ["inspect", "pin-scope"];
    });
  })();


  if (!Array.isArray(DEMO.commands) || !DEMO.commands.length) {
    DEMO.commands = [
      { id: "cmd-settings", name: "Open Settings", shortcut: "Ctrl+,", command: "cmd.settings.open", custom: false },
      { id: "cmd-search", name: "Search settings", shortcut: "Ctrl+Shift+P", command: "cmd.settings.search", custom: false },
      { id: "cmd-bloom", name: "Bloom (retire/alias)", shortcut: "Ctrl+Shift+B", command: "cmd.settings.bloom.open", custom: true, conflict: true, note: "Provisional retire/alias candidate" },
      { id: "cmd-filesafe", name: "FileSafe review", shortcut: "Unbound", command: "cmd.filesafe.review", custom: true }
    ];
  } else {
    DEMO.commands = DEMO.commands.map(function (c, i) {
      if (c.conflict == null && /bloom/i.test(c.name || c.command || "")) c.conflict = true;
      if (!c.id) c.id = "cmd-" + i;
      return c;
    });
  }

})();
