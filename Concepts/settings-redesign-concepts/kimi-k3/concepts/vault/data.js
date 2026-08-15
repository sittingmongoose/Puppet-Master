/* ============================================================================
   concepts/vault/data.js — Vault family fixtures (window.VLT_DATA)
   ----------------------------------------------------------------------------
   Families: Storage & Retention, Backup & Restore, Settings Lifecycle,
   History & Sessions, Runtime Artifacts, Source Control/Worktrees,
   GitHub Actions, Containers & Registries, Web/Search/Fetch,
   Project Search Index, Workspace Cleanup, Future Server Module Shell.
   Plain object, no dependencies.
   ========================================================================== */
(function () {
  "use strict";

  window.VLT_DATA = {
    managerMeta: {
      storage: { id: "storage", title: "Storage and Retention", purpose: "Modes, retention timelines, pressure, and recovery", icon: "stack" },
      backup: { id: "backup", title: "Backup and Restore", purpose: "Schedules, snapshots, and restore verification", icon: "shield" },
      lifecycle: { id: "lifecycle", title: "Settings Lifecycle", purpose: "Export, import, copy, rollback, and reset", icon: "refresh" },
      history: { id: "history", title: "History and Sessions", purpose: "Thread history, compare, and retention policy", icon: "book" },
      artifacts: { id: "artifacts", title: "Runtime Artifacts", purpose: "Outputs, receipts, redaction, and cleanup", icon: "download" },
      scm: { id: "scm", title: "Source Control and Worktrees", purpose: "Changes, graph, worktrees, and tool health", icon: "branch" },
      gha: { id: "gha", title: "GitHub Actions", purpose: "Workflows, runs, and readiness", icon: "check" },
      containers: { id: "containers", title: "Containers and Registries", purpose: "Docker, Podman, Kubernetes, and registries", icon: "grid" },
      web: { id: "web", title: "Web, Search, and Fetch", purpose: "Providers, limits, caches, and privacy", icon: "search" },
      searchindex: { id: "searchindex", title: "Project Search Index", purpose: "Index policy, disk use, and rebuilds", icon: "bolt" },
      cleanup: { id: "cleanup", title: "Workspace Cleanup", purpose: "Dry-run plans and safe cleanup", icon: "wrench" },
      servers: { id: "servers", title: "Servers and Hosting", purpose: "Reserved insertion points for future modules", icon: "home" }
    },

    actions: [
      { id: "import-preview", title: "Preview a settings import", terms: "import settings preview merge replace conflict", kind: "workflow", subtitle: "Setup workflow", target: { manager: "lifecycle", tab: "transfer" } },
      { id: "backup-now", title: "Back up now", terms: "backup snapshot now receipt", kind: "action", target: { manager: "backup", tab: "overview" } },
      { id: "index-status", title: "Search index status", terms: "index disk use rebuild phase", kind: "status", subtitle: "Status", target: { manager: "searchindex", tab: "overview" } },
      { id: "jujutsu-missing", title: "Jujutsu (unavailable)", terms: "jujutsu jj vcs install", kind: "capability", subtitle: "Unavailable capability", target: { manager: "scm", tab: "tools" } },
      { id: "cleanup-dry-run", title: "Run a cleanup dry run", terms: "cleanup dry run plan exclusions", kind: "action", target: { manager: "cleanup", tab: "overview" } }
    ],

    /* ---------- Storage & Retention ---------- */
    storageAreas: [
      { id: "recovery", name: "Internal recovery snapshots", note: "PM-owned checkpoints before risky operations. Not a backup — they exist to roll back a bad run." },
      { id: "settings-backup", name: "Settings backup / import", note: "Portable settings payloads with preview, validation, and rollback." },
      { id: "project-backup", name: "Project backup", note: "Whole-project archives on a schedule." },
      { id: "server-backup", name: "Full Server backup", note: "The Home Server's own backup — owned by the server, linked here." },
      { id: "cleanup", name: "Workspace cleanup", note: "Space reclamation with dry-run plans. Never touches snapshots or backups." }
    ],
    retention: [
      { label: "Thread history", days: 90, minimum: 30, anchor: "Last activity", hold: false },
      { label: "Run logs", days: 30, minimum: 14, anchor: "Creation", hold: false },
      { label: "Recovery snapshots", days: 14, minimum: 7, anchor: "Creation", hold: false },
      { label: "Artifacts and outputs", days: 60, minimum: 30, anchor: "Milestones and releases", hold: true },
      { label: "Diagnostics bundles", days: 7, minimum: 3, anchor: "Creation", hold: false }
    ],
    storageFacts: [
      ["Storage mode", "Local SSD — migration to Home Server available"],
      ["Pressure", "18% used of 512 GB; warning at 10% free"],
      ["Compaction", "Nightly, idle-only; last run 03:12"],
      ["Quarantine", "2 items held (import conflicts awaiting review)"],
      ["Encryption", "At rest via OS volume encryption"],
      ["Verification", "Weekly checksum pass; last verified 2026-08-10"],
      ["Project deletion", "Deletes data after a named-confirmation step"],
      ["Evidence retention", "Receipts and audit logs outlive their artifacts"]
    ],

    /* ---------- Backup ---------- */
    backups: [
      { id: "b-084", at: "2026-08-10 03:12", kind: "Scheduled project backup", size: "1.2 GB", verified: true, hash: "sha256:9d04…b1" },
      { id: "b-083", at: "2026-08-09 03:12", kind: "Scheduled project backup", size: "1.2 GB", verified: true, hash: "sha256:61cf…0a" },
      { id: "b-082", at: "2026-08-08 17:40", kind: "Pre-import settings snapshot", size: "84 KB", verified: true, hash: "sha256:77e2…9c" }
    ],

    /* ---------- Settings Lifecycle ---------- */
    lifecycleSteps: ["Source", "Preview", "Validate", "Migrate keys", "Apply", "Verify", "Receipt"],
    importDemo: {
      file: "northwind-settings.pmsettings",
      stats: { add: 14, change: 6, conflict: 2, legacy: 3 },
      conflicts: [
        { key: "terminal.scrollback", incoming: "20,000 lines", current: "50,000 (capped to 10,000)", resolution: "Keep current" },
        { key: "providers.route-priority-mode", incoming: "Automatic", current: "My order", resolution: "Keep current" }
      ],
      legacyKeys: [
        { from: "editor.autosave", to: "files.recovery", note: "Renamed in 2026.06" },
        { from: "notifications.toastStyle", to: "notifications.inapp-inbox", note: "Toast stacks removed" },
        { from: "ai.defaultModel", to: "providers roles", note: "Model picks moved to agent roles" }
      ],
      restartPlan: "1 setting needs restart (LSP autostart); 2 need reconnect (MCP approval, Assistant memory)",
      copyGroups: ["General", "Appearance", "Notifications", "Providers (routes only — never credentials)", "Context", "Personas", "Goal", "Permissions (project scope)", "Developer tools", "Terminal"]
    },

    /* ---------- History & Sessions ---------- */
    sessions: [
      { id: "t-441", project: "Puppet Master", title: "Settings redesign bakeoff", at: "2026-08-11 08:41", turns: 32, archived: false },
      { id: "t-440", project: "Puppet Master", title: "Provider install adjudication", at: "2026-08-10 19:02", turns: 18, archived: false },
      { id: "t-438", project: "Northwind", title: "Deploy pipeline repair", at: "2026-08-09 15:20", turns: 27, archived: false },
      { id: "t-431", project: "Puppet Master", title: "Slint shell evaluation", at: "2026-08-06 11:05", turns: 41, archived: true }
    ],
    historyPolicy: [
      ["Compare", "Any two sessions diff turn-by-turn"],
      ["Export", "Markdown or JSON, receipts included"],
      ["Rebuild", "Re-index a session into project search"],
      ["Archive", "Archived sessions leave the active list but stay searchable"],
      ["Deletion", "Named confirmation; receipts are retained as evidence"]
    ],

    /* ---------- Runtime Artifacts ---------- */
    artifacts: [
      { id: "a-91", type: "Test capture", location: ".pm/artifacts/t-441/", version: "playwright-report v2", retention: "60 days", owner: "PM-owned", redaction: "Paths scrubbed", hash: "sha256:aa10…4d" },
      { id: "a-90", type: "Goal run bundle", location: ".pm/artifacts/g-118/", version: "run-v1", retention: "60 days", owner: "PM-owned", redaction: "None needed", hash: "sha256:4bb2…77" },
      { id: "a-89", type: "Model response log", location: "provider-native", version: "—", retention: "Provider policy", owner: "Provider-native (Anthropic)", redaction: "Provider-owned", hash: "—" },
      { id: "a-88", type: "Screen recording", location: ".pm/artifacts/t-438/", version: "webm", retention: "30 days", owner: "PM-owned", redaction: "Faces/text blurred on export", hash: "sha256:09e1…c3" }
    ],

    /* ---------- Source Control ---------- */
    scmTools: [
      { name: "Git", state: "Installed", version: "2.51.0", host: "This PC · Windows native", health: "ready", note: "Verified by version probe" },
      { name: "Jujutsu", state: "Not installed", version: "—", host: "—", health: "not-configured", note: "Unavailable — install from the official jj source to enable; bookmarks and revisions appear then" },
      { name: "Git LFS", state: "Not installed", version: "—", host: "—", health: "not-configured", note: "Unavailable — git-lfs was not found; large-file rows stay disabled" },
      { name: "OpenSSH", state: "Installed", version: "9.8", host: "This PC · Windows native", health: "ready", note: "Agent-based keys" }
    ],
    worktrees: [
      { name: "main", path: "P:\\", state: "Primary checkout", ahead: 0, behind: 0 },
      { name: "agent/settings-bakeoff", path: "P:\\.worktrees\\settings-bakeoff", state: "Active — 1 agent run", ahead: 14, behind: 2 },
      { name: "agent/docs-sweep", path: "P:\\.worktrees\\docs-sweep", state: "Merged — cleanup scheduled", ahead: 0, behind: 0 }
    ],
    scmPolicies: [
      ["Branch / bookmark / revision", "Branches (Git); bookmarks appear with Jujutsu"],
      ["Forge connection", "Not configured — connect GitHub to browse runs"],
      ["SSH source", "Inherit from OS (Pageant)"],
      ["Test before merge", "Required for agent worktrees"],
      ["Push policy", "On approval"],
      ["Force-push", "With lease only"],
      ["Leases", "Held per run; released on merge or cleanup"],
      ["Recovery", "Reflog retained 30 days"],
      ["Cleanup", "Merged worktrees removed weekly — never unmerged work"]
    ],
    branchGraph: {
      nodes: [
        { id: "m1", x: 20, y: 30, branch: "main" }, { id: "m2", x: 90, y: 30, branch: "main" }, { id: "m3", x: 230, y: 30, branch: "main" },
        { id: "a1", x: 90, y: 70, branch: "agent" }, { id: "a2", x: 160, y: 70, branch: "agent" },
        { id: "b1", x: 160, y: 110, branch: "docs" }, { id: "b2", x: 230, y: 110, branch: "docs" }
      ],
      edges: [["m1", "m2"], ["m2", "m3"], ["m2", "a1"], ["a1", "a2"], ["a2", "m3"], ["a2", "b1"], ["b1", "b2"]]
    },

    /* ---------- GitHub Actions ---------- */
    ghaSetup: {
      note: "The forge is not connected. Connect GitHub to pin workflows, browse runs, and check current-branch readiness.",
      capabilities: ["Pinned workflows", "Current-branch readiness", "Run / job / log browsing", "Starter workflow"]
    },
    ghaConnected: {
      workflows: [
        { name: "ci.yml", pinned: true, readiness: "Ready on main", lastRun: "2026-08-10 22:14 — passed in 4m 12s" },
        { name: "release.yml", pinned: true, readiness: "Not runnable on this branch", lastRun: "2026-08-08 09:40 — passed" },
        { name: "nightly-e2e.yml", pinned: false, readiness: "Scheduled", lastRun: "2026-08-11 03:00 — 1 failing job" }
      ],
      account: "jareds-dev — Actions read/write"
    },

    /* ---------- Containers ---------- */
    containers: [
      { name: "Docker", health: "ready", version: "Docker Desktop 4.43", host: "This PC · Windows native",
        detail: [["Engine", "27.2 — running"], ["CLI", "docker 27.2 on PATH"], ["Compose", "v2.29"], ["Buildx", "0.16"], ["Machine/socket", "npipe:////./pipe/docker_engine"], ["Registries", "Docker Hub (signed in), ghcr.io (anonymous)"], ["Unraid publishing", "Not configured"], ["SSH remotes", "None"]] },
      { name: "Podman", health: "not-configured", version: "—", host: "—",
        detail: [["State", "Not installed — install from the official Podman source to enable"], ["Machine/socket", "—"], ["Registries", "—"]] },
      { name: "Kubernetes", health: "degraded", version: "kubectl 1.31", host: "This PC · Windows native",
        detail: [["kubectl", "1.31 on PATH"], ["Helm", "3.15"], ["Clusters", "home-k3s (unreachable), docker-desktop"], ["Kubeconfig contexts", "2 — current: docker-desktop"], ["Registries", "registry.home.lan (auth stored)"]] }
    ],

    /* ---------- Web / Search / Fetch ---------- */
    webProviders: [
      { name: "Built-in index", priority: 1, limits: "Search 50/day · Fetch 200/day", credits: "None", readiness: "Ready" },
      { name: "Brave Search", priority: 2, limits: "Search 2,000/month", credits: "API key in vault", readiness: "Ready" },
      { name: "Crawl route", priority: 3, limits: "Crawl 500 pages/run · Map 1,000 · Extract 200", credits: "Counts toward Usage", readiness: "Cooling down — credit guard at 90%" }
    ],
    webPolicy: [
      ["Caches", "Fetch cache 24 h; search cache 6 h"],
      ["Browser sessions", "PM-native Browser Program only; AuthBrowserSession is human-only and never agent-readable"],
      ["Proxies", "System proxy; per-route overrides not configured"],
      ["Certificates", "OS trust store; custom CAs not configured"],
      ["Air-gap behavior", "Web rows go Unavailable with the reason; queued fetches resume on reconnect"],
      ["Privacy", "Fetching sends the URL and only the URL"]
    ],

    /* ---------- Project Search Index ---------- */
    searchIndexFacts: [
      ["Enabled", "On — project scope"],
      ["Exclusions", "node_modules, .git, build, dist"],
      ["File-size policy", "Skip files over 2 MB"],
      ["Symlink policy", "Do not follow"],
      ["Disk use", "212 MB in .pm/index"],
      ["Remote cache", "Home Server cache — connected"],
      ["Last failure", "2026-08-07 — 3 binary files skipped (logged)"]
    ],

    /* ---------- Cleanup ---------- */
    cleanupPlan: [
      { item: "Merged worktree checkouts", size: "1.8 GB", action: "Remove", safe: true },
      { item: "Build outputs (build/, dist/)", size: "640 MB", action: "Remove", safe: true },
      { item: "Orphaned artifact directories", size: "96 MB", action: "Remove", safe: true },
      { item: "Logs older than retention", size: "41 MB", action: "Remove", safe: true },
      { item: "Unmerged worktree (agent/exp-flags)", size: "220 MB", action: "Keep — unmerged work is never cleaned", safe: false },
      { item: "Recovery snapshots", size: "310 MB", action: "Keep — excluded from cleanup", safe: false }
    ],

    /* ---------- Future Server Module Shell ---------- */
    serverShell: [
      { id: "servers", name: "Servers", owner: "Server host owner", line: "Home TrueNAS — Connected · Processing on this server On", state: "Deferred" },
      { id: "hosts", name: "Execution Hosts", owner: "Server host owner", line: "This PC (Windows native) · Home TrueNAS — capability-matched", state: "Deferred" },
      { id: "clients", name: "Clients", owner: "Server host owner", line: "3 paired — last check-in 12 minutes ago", state: "Deferred" },
      { id: "hosting", name: "Project Hosting & Files", owner: "Storage owner", line: "Hosted On Home TrueNAS · Files /mnt/projects/Puppet-Master · Run Work Automatic", state: "Deferred" },
      { id: "remote", name: "Remote Access", owner: "Server host owner", line: "Tailscale mesh — 2 routes up", state: "Deferred" },
      { id: "updates", name: "Updates", owner: "Release/updates owner", line: "Server and client update policy lands here", state: "Deferred" },
      { id: "defaults", name: "Project Defaults & Templates", owner: "Project Sync owner", line: "Template library and default Project configuration", state: "Deferred" },
      { id: "integrations", name: "Integrations & Tools", owner: "Tools owner", line: "Third-party integrations beyond provider and forge connections", state: "Deferred" },
      { id: "onboarding", name: "Product Onboarding", owner: "Onboarding owner", line: "First-run guidance resumes here with return context — separate from Installation/Deployment", state: "Deferred" },
      { id: "doctor", name: "Doctor", owner: "Doctor owner", line: "Compact health aggregation and remediation routing after owner handoffs are final", state: "Deferred" }
    ],
    serverShellNote: "These are reserved insertion points with named canonical owners. Each accepts a manager module, deep links, status cards, and command wiring. No backend state machine is invented here. WSL is optional — native Windows is complete without it; Linux through WSL appears only when a selected capability requires it.",

    demoScenarios: [
      { id: "calm", label: "Calm state (all notices dismissed)" },
      { id: "slow-hydration", label: "Slow manager hydration (lazy load)" },
      { id: "reset", label: "Reset demo data" },
      { id: "import-preview", label: "Import: preview → cancel" },
      { id: "import-apply", label: "Import: preview → apply → rollback" },
      { id: "copy-from", label: "Copy Settings From… (transactional copy)" },
      { id: "connect-forge", label: "Connect the GitHub forge" },
      { id: "index-rebuild", label: "Search index rebuild (truthful phases)" },
      { id: "cleanup-dry-run", label: "Cleanup dry-run plan" },
      { id: "backup-now", label: "Back up now (receipted)" },
      { id: "test-restore", label: "Test restore of the latest backup" },
      { id: "changed-elsewhere", label: "Setting changed elsewhere (conflict bar)" },
      { id: "validation-error", label: "Validation error on Default shell" }
    ]
  };
})();
