/* pm-managers.js — HEADLESS manager semantics for concepts 05–11 (2026-08-18 bakeoff).
   Every required manager family is described here as data: records, statuses, actions,
   detail fields, tabs, quick actions, related inventory settings, and exercised fixtures.
   This file contains NO rendering. Each concept renders every family through its own
   native composition (roster+form, sheets, tabs, panes, cards, tables) — sharing these
   semantics is explicitly allowed by packet 05; a shared visible renderer is forbidden
   and is not attempted. */
(function () {
  "use strict";
  var PM2 = window.PM2;
  var M = PM2.managers = [];
  function mgr(o) { M.push(o); return o; }
  PM2.mgrById = {};
  PM2.registerManagers = function () {
    M.forEach(function (m) { PM2.mgrById[m.id] = m; });
  };

  /* =================== PROVIDER / ACCOUNT / MODEL / INSTALLATION =================== */
  mgr({
    id: "mgr.provider", family: "Provider / Account / Model / Installation",
    title: "Providers, Accounts & Models", domain: "ai", kind: "roster", icon: "pam",
    blurb: "Who builds your responses: connections, accounts, models, and the CLIs behind them.",
    health: { kind: "warn", text: "11 connected · 2 need attention · 1 setup required" },
    tabs: ["Overview", "Accounts & connections", "Models", "Routing & fallback", "Installations", "Usage", "Diagnostics"],
    fixtures: ["loading-cached", "offline", "usage-unavailable", "multi-install", "unknown-owner", "update-ask", "verify-fail-rollback"],
    groups: [
      { id: "pg.installed", label: "Installed tools and signed-in apps", items: ["prov.claude-cli", "prov.codex-cli", "prov.antigravity-cli"] },
      { id: "pg.connected", label: "Connected accounts", items: ["prov.openai-oauth", "prov.github-copilot"] },
      { id: "pg.api", label: "API connections", items: ["prov.openrouter-key", "prov.deepseek-key"] },
      { id: "pg.server", label: "Server connections", items: ["prov.opencode-server"] },
      { id: "pg.free", label: "Free and community models", items: ["prov.free-models"] }
    ],
    records: [
      { id: "prov.claude-cli", label: "Claude Code CLI", group: "pg.installed",
        desc: "Anthropic Claude through the official Claude Code CLI. OAuth is owned by the CLI, not Puppet Master.",
        status: "ok", statusLabel: "Ready",
        chips: [["Account", "mai@pm.dev (work)"], ["Selected model", "claude-sonnet-4.6"], ["Install", "npm · 2.1.31 · proven"]],
        actions: [{ id: "a.refresh", label: "Refresh health", kind: "quiet" }, { id: "a.models", label: "Models", kind: "quiet" }, { id: "a.usage", label: "Usage", kind: "quiet" }],
        detail: [
          ["Connection", "Signed in via CLI-owned OAuth · profile claude-work"],
          ["Installations", "2 found — D:\\tools\\claude (Selected) · C:\\Users\\sitti\\AppData\\Roaming\\npm\\claude (Shadowed)"],
          ["Evidence", "npm package database · proven (high confidence)"],
          ["Update policy", "Check automatic · Install ask-first"],
          ["Effective route", "claude-sonnet-4.6 via Fast mode, reasoning effort medium"]
        ],
        models: [
          { id: "m.claude-opus", label: "claude-opus-4.2", caps: ["Favorite", "Tools", "Structured output"], ctx: "200k", mode: ["Normal", "Fast"], effort: ["low", "medium", "high"], status: "ok" },
          { id: "m.claude-sonnet", label: "claude-sonnet-4.6", caps: ["Favorite", "Alias: daily", "Tools"], ctx: "200k", mode: ["Normal", "Fast"], effort: ["low", "medium", "high"], status: "ok", selected: true },
          { id: "m.claude-haiku", label: "claude-haiku-4.1", caps: ["Tools"], ctx: "200k", mode: ["Fast"], effort: ["low", "medium"], status: "ok" }
        ] },
      { id: "prov.codex-cli", label: "Codex CLI (OpenAI)", group: "pg.installed",
        desc: "OpenAI Codex through its CLI. Setup required — the CLI is not installed yet.",
        status: "warn", statusLabel: "Setup required",
        chips: [["Account", "—"], ["Source", "Official OpenAI npm package"]],
        actions: [{ id: "a.install", label: "Install from official source", kind: "primary" }, { id: "a.details", label: "Details", kind: "quiet" }],
        detail: [
          ["Setup", "Explicit install only — Puppet Master never bundles or silently installs provider CLIs"],
          ["Host / Environment", "Windows native"],
          ["After install", "Authentication is a separate step (CLI-owned OAuth)"],
          ["Runtime demand", "Operations needing this CLI deep-link here and resume after setup"]
        ],
        setup: { kind: "provider-cli-install", source: "Official OpenAI npm registry", host: "Windows native", steps: ["Review source and host", "Install (explicit)", "Verify publisher, version, architecture", "Authenticate separately", "Refresh catalog"] } },
      { id: "prov.antigravity-cli", label: "Antigravity CLI", group: "pg.installed",
        desc: "Google Antigravity through its CLI. Signed out on this machine.",
        status: "warn", statusLabel: "Signed out",
        chips: [["Account", "Not signed in"], ["Install", "2.0.4 · strongly identified"]],
        actions: [{ id: "a.signin", label: "Sign in", kind: "primary" }, { id: "a.models", label: "Models", kind: "quiet" }],
        detail: [["Auth", "CLI-owned OAuth — Puppet Master launches the native flow, never a PM-direct one"]] },
      { id: "prov.openai-oauth", label: "OpenAI (Puppet Master direct)", group: "pg.connected",
        desc: "PM-direct OAuth connection for OpenAI API models.",
        status: "ok", statusLabel: "Ready",
        chips: [["Account", "mai@pm.dev"], ["Product", "Pay-as-you-go"]],
        actions: [{ id: "a.usage", label: "Usage", kind: "quiet" }, { id: "a.disconnect", label: "Disconnect", kind: "quiet" }],
        detail: [["Auth boundary", "PM-direct OAuth supported for OpenAI/Codex, GitHub, Copilot"]] },
      { id: "prov.github-copilot", label: "GitHub Copilot", group: "pg.connected",
        desc: "Copilot models through your GitHub account.",
        status: "ok", statusLabel: "Ready",
        chips: [["Account", "sitti"], ["Included usage", "Pro plan · 300 requests/mo"]],
        actions: [{ id: "a.usage", label: "Usage", kind: "quiet" }] },
      { id: "prov.openrouter-key", label: "OpenRouter (API key)", group: "pg.api",
        desc: "Many providers through one key. The key is stored as a vault reference; only its label is shown.",
        status: "ok", statusLabel: "Ready",
        chips: [["Credential", "vault://openrouter-main (reference)"], ["Fallback", "If included usage ends: stop and ask"]],
        actions: [{ id: "a.rotate", label: "Rotate key", kind: "quiet" }, { id: "a.test", label: "Test connection", kind: "quiet" }] },
      { id: "prov.deepseek-key", label: "DeepSeek (API key)", group: "pg.api",
        desc: "DeepSeek chat and reasoner models by API key.",
        status: "warn", statusLabel: "Ready · Usage unavailable",
        chips: [["Credential", "vault://deepseek-work"], ["Usage", "Provider ready, usage endpoint not answering"]],
        actions: [{ id: "a.retry-usage", label: "Retry usage", kind: "quiet" }],
        detail: [["Usage", "Connection and models are healthy; the usage endpoint returned 503. Costs shown are estimates from the last successful read (2026-08-16)."]] },
      { id: "prov.opencode-server", label: "OpenCode external server", group: "pg.server",
        desc: "External OpenCode-compatible endpoint on the office server.",
        status: "ok", statusLabel: "Ready",
        chips: [["Endpoint", "https://office.lan:4600"], ["Health", "Checked 3 min ago"]] },
      { id: "prov.free-models", label: "Free Models", group: "pg.free",
        desc: "A wrapper over underlying free routes. It owns no credentials or quota — underlying routes must be set up individually.",
        status: "warn", statusLabel: "2 routes need setup",
        chips: [["Routes", "5 ready · 2 need setup · 1 cooling down"]],
        actions: [{ id: "a.routes", label: "Review routes", kind: "primary" }],
        detail: [["Wrapper rule", "Free Models never owns credentials, quota, switching, or Usage"], ["Catalog", "Refreshed from source · last-known-good kept on failure"]] }
    ],
    routing: {
      rows: [
        { id: "rt.daily", label: "Daily driver", requested: "claude-sonnet-4.6", effective: "claude-sonnet-4.6", why: "" },
        { id: "rt.fast", label: "Fast lane", requested: "claude-haiku-4.1", effective: "gpt-5.2-mini", why: "Fallback: haiku cooling down (rate limit) since 11:02" },
        { id: "rt.deep", label: "Deep work", requested: "claude-opus-4.2", effective: "claude-opus-4.2", why: "" }
      ],
      policy: ["On included-usage end: stop and ask", "Prefer lowest-cost capable model for drafts", "Never auto-switch on 4xx auth errors"]
    },
    installations: [
      { id: "inst.claude.a", label: "D:\\tools\\claude", version: "2.1.31", owner: "npm", confidence: "proven", state: "selected", health: "launch ok · auth ok · catalog 214 models" },
      { id: "inst.claude.b", label: "…\\Roaming\\npm\\claude", version: "1.9.2", owner: "npm", confidence: "strongly identified", state: "shadowed", health: "older generation — kept for rollback" },
      { id: "inst.codex.a", label: "Not installed", state: "setup-required", note: "Explicit install from the official OpenAI package source" },
      { id: "inst.grit.a", label: "/usr/local/bin/grit", version: "?", owner: "unknown", confidence: "unknown", state: "manual-only", health: "ownership could not be identified — updates are manual-only" }
    ],
    update: { version: "2.2.0", policy: "Ask first", note: "Pinned until you approve. Auto-when-idle requires proven ownership and a rollback path." },
    verify: { state: "recovered", story: "2.1.30 verification failed (adapter handshake timeout) → rolled back to 2.1.31 → healthy", receipt: "rcpt.upd.2026-08-15-1420" },
    usage: { rows: [["Claude Code (work)", "61% of included usage · resets Sep 1"], ["Copilot", "18% · 300/mo"], ["OpenRouter", "$12.40 this month"]], note: "One Usage owner; numbers are read-only projections." },
    related: ["ai.accounts.*", "ai.models.*", "ai.usage.*"]
  });

  /* =================== CONTEXT & INSTRUCTIONS =================== */
  mgr({ id: "mgr.context", family: "Context & Instructions", title: "Context & Instructions", domain: "memory", kind: "document", icon: "layers",
    blurb: "What gets assembled into every request for this project.",
    health: { kind: "ok", text: "Context healthy · 12.4k tokens typical" },
    tabs: ["Assembly", "Instruction sources", "Receipts"],
    fixtures: ["managed"],
    records: [
      { id: "ctx.prev-chats", label: "Use relevant previous chats", status: "ok", chips: [["Value", "On"]], actions: [{ id: "a.edit", label: "Edit", kind: "quiet" }] },
      { id: "ctx.proj-code", label: "Use relevant project code", status: "ok", chips: [["Value", "On"], ["Retrieval cap", "60k tokens"]] },
      { id: "ctx.logs", label: "Use relevant logs", status: "warn", statusLabel: "Managed", chips: [["Value", "Off · set by organization policy"]], detail: [["Origin", "Organization policy 'no-log-context'"], ["Effect", "Logs are excluded from assembly; code and chats unaffected"]] },
      { id: "ctx.instructions", label: "Scoped project instructions", status: "ok", chips: [["Sources", "AGENTS.md · 2 scoped files"]] },
      { id: "ctx.journal", label: "Include current attempt journal", status: "ok", chips: [["Value", "On"]] },
      { id: "ctx.compact", label: "Compact automatically when needed", status: "ok", chips: [["Strategy", "summary + recent turns"]] }
    ],
    receipt: { rows: [["11:42 request", "chats(3) · code(11 files) · instructions(2) · journal · persona"], ["11:39 request", "chats(2) · code(7 files) · instructions(2)"]], note: "Every assembled request produces an admission receipt." },
    related: ["memory.assembly.*"] });

  /* =================== MEMORY =================== */
  mgr({ id: "mgr.memory", family: "Memory", title: "Assistant Memory", domain: "memory", kind: "roster", icon: "memory",
    blurb: "Evidence-backed, degrading Assistant Gists. Half-life changes retrieval, never truth.",
    health: { kind: "ok", text: "48 gists · 6 fading · 41 verified" },
    tabs: ["All gists", "Assistant-only", "Version history"],
    fixtures: ["empty"],
    records: [
      { id: "mem.g1", label: "Prefers terse engineering answers", status: "ok", chips: [["Verified", "2026-08-14"], ["Half-life", "21d · active in context"], ["Provenance", "user edit"]], actions: [{ id: "a.verify", label: "Verify", kind: "quiet" }, { id: "a.pin", label: "Pin", kind: "quiet" }] },
      { id: "mem.g2", label: "Project uses Rust workspace under puppet-master-rs", status: "ok", chips: [["Verified", "auto · file evidence"], ["Source", "Cargo.toml"]] },
      { id: "mem.g3", label: "Dislikes emoji in reports", status: "ok", chips: [["Verified", "2026-08-02"], ["Half-life", "fading (9d left)"]], actions: [{ id: "a.reverify", label: "Re-verify", kind: "quiet" }] },
      { id: "mem.g4", label: "Deploys to office TrueNAS on Fridays", status: "warn", statusLabel: "Unverified", chips: [["Provenance", "assistant inference"]], actions: [{ id: "a.verify", label: "Verify", kind: "primary" }] },
      { id: "mem.g5", label: "Hidden assistant note about merge order", hidden: true, status: "ok", chips: [["Scope", "Assistant-only"], ["Never in prompts to you"]] }
    ],
    ops: [{ id: "a.rebuild", label: "Rebuild index" }, { id: "a.dedupe", label: "Dedupe" }, { id: "a.summarize", label: "Summarize old" }, { id: "a.archive", label: "Archive faded" }],
    related: ["memory.retention.*"] });

  /* =================== PERSONAS =================== */
  mgr({ id: "mgr.personas", family: "Personas", title: "Personas", domain: "personas", kind: "catalog", icon: "users",
    blurb: "Behavior, not authority. Personas cannot widen permissions or force providers.",
    health: { kind: "ok", text: "6 installed · 3 core · 3 custom" },
    tabs: ["Library", "Eligible skills", "Import review"],
    fixtures: ["import-conflict"],
    records: [
      { id: "per.engineer", label: "Staff Engineer", status: "ok", chips: [["Source", "core · v1.4"], ["Default for", "this project"]], actions: [{ id: "a.capsule", label: "Capsule preview", kind: "quiet" }] },
      { id: "per.reviewer", label: "Code Reviewer", status: "ok", chips: [["Source", "core · v1.4"]] },
      { id: "per.scrapper", label: "Scrapyard Architect", status: "ok", chips: [["Source", "custom · imported 2026-08-09"], ["Trust", "scanned · prompt-injection clean"]] },
      { id: "per.writer", label: "Docs Writer", status: "ok", chips: [["Source", "custom"]] },
      { id: "per.import-pending", label: "Ops Buddy (import)", status: "warn", statusLabel: "Import review", chips: [["Diff", "3 additions · 1 secret-like string · 2 links"]], actions: [{ id: "a.review", label: "Review import", kind: "primary" }] }
    ],
    boundary: "Persona cannot grant Full Access, widen FileSafe, force a provider, or eagerly load skills. Conversation mode and access profile are separate controls.",
    related: ["personas.library.*"] });

  /* =================== GOAL & AUTOMATION =================== */
  mgr({ id: "mgr.goal", family: "Goal & Automation", title: "Goal & Automation", domain: "planning", kind: "document", icon: "compass",
    blurb: "Defaults and ceilings for Goal runs. Usage reports capacity; the orchestrator admits actual work.",
    health: { kind: "ok", text: "Defaults only — no live run state here" },
    tabs: ["Goal defaults", "Verification", "Capacity"],
    records: [
      { id: "goal.verification", label: "Verification strength", status: "ok", chips: [["Value", "Standard · high for release branches"]] },
      { id: "goal.fanout", label: "Sustainable fan-out", status: "ok", chips: [["Ceiling", "6 workers"], ["Reserve", "20% capacity"]] },
      { id: "goal.checkpoint", label: "Checkpoint policy", status: "ok", chips: [["Value", "Every stage boundary"]] },
      { id: "goal.worktree", label: "Worktree policy for Goals", status: "ok", chips: [["Value", "Auto-create · report path"]] },
      { id: "goal.pause", label: "Pause/resume behavior", status: "ok", chips: [["Value", "Resume with same context"]] }
    ],
    admissions: [["Fan-out 4/6 used", "2 workers held by reserve"], ["Testing lane busy", "Goal verification queued behind current test run"]],
    related: ["planning.verification.*", "planning.interview.*"] });

  /* =================== CREW =================== */
  mgr({ id: "mgr.crew", family: "Crew", title: "Crew Templates", domain: "branching", kind: "catalog", icon: "crew",
    blurb: "Parallel worker teams with bounded sizing, diversity, and synthesis.",
    health: { kind: "ok", text: "3 templates" },
    tabs: ["Templates", "Topology"],
    records: [
      { id: "crew.audit", label: "Security audit crew", status: "ok", chips: [["Members", "4–6"], ["Pattern", "2 reviewers + corroborator + reducer"]], actions: [{ id: "a.edit", label: "Edit", kind: "quiet" }] },
      { id: "crew.refactor", label: "Refactor crew", status: "ok", chips: [["Members", "3"], ["Write policy", "own worktree each"]] },
      { id: "crew.docs", label: "Docs sweep crew", status: "ok", chips: [["Members", "2–3"], ["Usage reserve", "10%"]] }
    ],
    note: "Crew is not a Persona, mode, provider grant, permission, or hidden memory.",
    related: ["branching.crew.*"] });

  /* =================== PERMISSIONS & FILESAFE =================== */
  mgr({ id: "mgr.permissions", family: "Permissions & FileSafe", title: "Permissions & FileSafe", domain: "safety", kind: "roster", icon: "shield",
    blurb: "Ordered rules, last match wins. FileSafe is the non-bypassable floor.",
    health: { kind: "ok", text: "9 rules · FileSafe healthy · boundary P:\\ only" },
    tabs: ["Rules", "Tool overrides", "FileSafe", "ELI5"],
    fixtures: ["managed", "validation-error"],
    records: [
      { id: "perm.r1", label: "Deny writes outside P:\\", status: "ok", chips: [["Order", "1 · last-match-wins"], ["Kind", "boundary"]], actions: [{ id: "a.explain", label: "Why this applies", kind: "quiet" }] },
      { id: "perm.r2", label: "Allow shell in project only", status: "ok", chips: [["Order", "2"], ["Tools", "terminal, scripts"]] },
      { id: "perm.r3", label: "Ask before network fetch of new hosts", status: "ok", chips: [["Order", "3"]] },
      { id: "perm.r4", label: "Read-only for D:\\clients", status: "ok", chips: [["Order", "4"], ["External allowlist", "D:\\clients\\website"]] },
      { id: "perm.m1", label: "Web fetch: block private ranges", status: "ok", chips: [["Managed", "organization baseline"], ["Origin", "policy 'safe-egress'"]], detail: [["Requested", "allow"], ["Effective", "block private ranges"], ["Why", "Managed rule wins over project rule (intrinsic floor)"]] }
    ],
    filesafe: { boundary: "P:\\", protected: [".git", "Plans/_locks", "*.vault"], health: "ok", note: "Non-bypassable. Repair guidance only; no unsafe-bypass affordance." },
    accessProfiles: ["Ask for approval", "Auto accept edits", "Auto", "Full Access"],
    related: ["safety.rules.*", "safety.approvals.*", "safety.protection.*"] });

  /* =================== BACK SEAT DRIVER =================== */
  mgr({ id: "mgr.bsd", family: "Back Seat Driver", title: "Back Seat Driver", domain: "safety", kind: "health", icon: "bolt",
    blurb: "A quiet second opinion on risky turns. Read-only by default; never blocks primary work by failing.",
    health: { kind: "info", text: "Auto — active during risky phases" },
    tabs: ["Mode", "Triggers", "Health"],
    records: [
      { id: "bsd.mode", label: "Back Seat Driver mode", status: "ok", chips: [["Value", "Auto (system default)"], ["Chat override", "per-thread allowed"]] },
      { id: "bsd.triggers", label: "Risk triggers", status: "ok", chips: [["Phases", "pre-commit, credentials, deletes"]] },
      { id: "bsd.privacy", label: "Privacy boundary", status: "ok", chips: [["Value", "bounded deltas only"]] },
      { id: "bsd.health", label: "Driver health", status: "ok", chips: [["Last intervention", "flagged force-push risk 2026-08-16"]] }
    ],
    note: "Auto runs only when risk/phase triggers justify it. On may inspect all turns. Cannot widen authority." });

  /* =================== NOTIFICATIONS & SOUNDS =================== */
  mgr({ id: "mgr.notifications", family: "Notifications & Sounds", title: "Notifications", domain: "general", kind: "document", icon: "bolt",
    blurb: "Where notices go and which events raise them. The title-bar stack is the only in-app surface.",
    health: { kind: "ok", text: "4 destinations · 23 event routes" },
    tabs: ["Events", "Destinations", "Quiet hours", "Test"],
    fixtures: ["offline"],
    records: [
      { id: "ntf.inapp", label: "In-app title-bar stack", status: "ok", chips: [["Events", "approvals, blocked, completed, failed"]] },
      { id: "ntf.tray", label: "System tray", status: "ok", chips: [["While automation runs", "tray shows progress"]] },
      { id: "ntf.slack", label: "Slack", status: "ok", chips: [["Channel", "#pm-alerts"], ["Mentions", "on failure"], ["Template", "short + click target"]] },
      { id: "ntf.ntfy", label: "ntfy", status: "warn", statusLabel: "Offline", chips: [["Last good", "2026-08-17 09:12"], ["Held", "3 messages queued"]], actions: [{ id: "a.reconnect", label: "Reconnect", kind: "primary" }], detail: [["State", "Offline — cached config shown, test-send held until reconnected"]] },
      { id: "ntf.quiet", label: "Quiet hours", status: "ok", chips: [["Value", "22:00–07:00 · approvals still break through"]] }
    ],
    rule: "Sound is never the only indication of failure, approval, or completion." });

  /* =================== SOUND LIBRARY =================== */
  mgr({ id: "mgr.sounds", family: "Sound Library / Uploads / Packs", title: "Sound Library", domain: "general", kind: "catalog", icon: "bolt",
    blurb: "Built-in sounds, uploads, and imported packs with license checks.",
    health: { kind: "ok", text: "14 sounds · 2 packs" },
    tabs: ["Library", "Event mappings", "Packs"],
    fixtures: ["empty", "validation-error"],
    records: [
      { id: "snd.chime", label: "Done chime (built-in)", status: "ok", chips: [["Duration", "0.8s"], ["License", "bundled"], ["Mapped to", "goal completed"]] },
      { id: "snd.approve", label: "Approval knock (built-in)", status: "ok", chips: [["Mapped to", "approval requested"]] },
      { id: "snd.custom", label: "ship-horn.wav (upload)", status: "ok", chips: [["Uploaded", "2026-08-11"], ["Hash", "verified"], ["Mapped to", "backup completed"]] },
      { id: "snd.pack", label: "PeonPing pack 'workshop'", status: "ok", chips: [["Format check", "passed"], ["License", "CC0 declared · verified"]] },
      { id: "snd.badpack", label: "Pack 'retro-bell'", status: "bad", statusLabel: "Rejected", chips: [["Reason", "license missing — import blocked"]], detail: [["Unverified packs are never bundled or imported"]] }
    ],
    ops: [{ id: "a.upload", label: "Upload sound" }, { id: "a.preview", label: "Local preview only" }, { id: "a.testsend", label: "Test send (masked, rate-limited, receipted)" }] });

  /* =================== APPEARANCE =================== */
  mgr({ id: "mgr.appearance", family: "Appearance / themes / fonts / motion", title: "Appearance", domain: "general", kind: "document", icon: "settings",
    blurb: "Eight themes, custom TOML themes, fonts, UI scale, and motion.",
    health: { kind: "ok", text: "Friendly Dark active · 1 custom theme" },
    tabs: ["Theme", "Custom themes", "Fonts", "Motion"],
    fixtures: ["validation-error", "restart-required"],
    records: [
      { id: "app.theme", label: "Theme", status: "ok", chips: [["Value", "Friendly Dark"], ["Preview", "hover previews live, applies on click"]], actions: [{ id: "a.preview", label: "Hover to preview", kind: "quiet" }] },
      { id: "app.custom", label: "Custom theme 'midnight-lab'", status: "warn", statusLabel: "Invalid — fallback active", chips: [["Error", "missing 'color.danger' in TOML"], ["Effect", "Friendly Dark used until fixed"]], actions: [{ id: "a.diagnose", label: "Diagnose", kind: "primary" }] },
      { id: "app.font", label: "Interface font", status: "ok", chips: [["Value", "PM Sans · fallback system UI"], ["Restart", "not required"]] },
      { id: "app.scale", label: "UI scale", status: "ok", chips: [["Value", "100% · 90–150%"]] },
      { id: "app.motion", label: "Reduced motion", status: "ok", chips: [["Value", "Off · every state preserved either way"]] }
    ],
    themes: ["Friendly Dark", "Friendly Light", "Glass Dark", "Glass Light", "Retro Dark", "Retro Light", "Basic Dark", "Basic Light"],
    related: ["general.visual.*"] });

  /* =================== SPELLCHECK =================== */
  mgr({ id: "mgr.spellcheck", family: "Spellcheck & Dictionaries", title: "Spellcheck & Dictionaries", domain: "general", kind: "document", icon: "code",
    blurb: "Spelling only — no autocorrect. Grammar help is a separate opt-in provider feature.",
    health: { kind: "ok", text: "Automatic (OS service → PM local)" },
    tabs: ["Basics", "Dictionaries", "Language packs"],
    fixtures: ["empty"],
    records: [
      { id: "sp.check", label: "Check spelling", status: "ok", chips: [["Value", "On"]] },
      { id: "sp.lang", label: "Language", status: "ok", chips: [["Value", "Automatic · en-US detected"]] },
      { id: "sp.source", label: "Dictionary source", status: "ok", chips: [["Value", "Automatic — OS service then PM local"]] },
      { id: "sp.personal", label: "Personal dictionary", status: "ok", chips: [["Words", "0 — empty"]] },
      { id: "sp.project", label: "Project dictionary", status: "ok", chips: [["Value", "Use when available · 216 words from .pm-dict"]] },
      { id: "sp.tech", label: "Check technical prose", status: "ok", chips: [["Value", "On · underline unknown names"]] }
    ] });

  /* =================== DESKTOP / TRAY / WINDOW =================== */
  mgr({ id: "mgr.desktop", family: "Desktop / Tray / Window", title: "Desktop, Tray & Window", domain: "general", kind: "document", icon: "grid",
    blurb: "How the app lives on the desktop: tray, restore, crash recovery, buffers.",
    health: { kind: "ok", text: "Tray integration healthy" },
    tabs: ["Tray", "Window", "Recovery"],
    fixtures: ["restart-required"],
    records: [
      { id: "dsk.tray", label: "Minimize/close to tray", status: "ok", chips: [["Value", "On · close hides to tray"]] },
      { id: "dsk.automation", label: "Tray state while automation runs", status: "ok", chips: [["Value", "Show progress icon"]] },
      { id: "dsk.restore", label: "Window/panel/tab restore", status: "ok", chips: [["Value", "Restore exactly as left"]] },
      { id: "dsk.crash", label: "Crash recovery", status: "ok", chips: [["Value", "Offer recovery on next launch"]] },
      { id: "dsk.buffers", label: "Unsaved buffer protection", status: "ok", chips: [["Value", "Keep 7 days"]] },
      { id: "dsk.bar", label: "Activity Bar reorder/hide", status: "ok", chips: [["Value", "Custom order · overflow to More tray"]], detail: [["Effect", "Takes effect after restart"]] }
    ] });

  /* =================== TEACHER / HELP =================== */
  mgr({ id: "mgr.teacher", family: "Teacher / Help", title: "Teacher & Help", domain: "general", kind: "document", icon: "compass",
    blurb: "Explain-this-screen help from the Teacher, plus hover/focus help everywhere.",
    health: { kind: "ok", text: "Teacher ready" },
    tabs: ["Teacher", "Help behavior"],
    records: [
      { id: "tch.explain", label: "Explain the current screen", status: "ok", chips: [["Value", "Available from every Settings page"]], actions: [{ id: "a.explain", label: "Ask Teacher about this page", kind: "primary" }] },
      { id: "tch.actions", label: "Teacher can take real actions", status: "ok", chips: [["Value", "Yes — always asks first"]] },
      { id: "tch.tooltips", label: "Hover/focus help", status: "ok", chips: [["Value", "On · answers effect timing and side effects"]] }
    ] });

  /* =================== DOCTOR =================== */
  mgr({ id: "mgr.doctor", family: "Doctor", title: "Doctor", domain: "system", kind: "diagnostic", icon: "plug",
    blurb: "One place to check health: providers, tools, servers, index, storage. Deep links out to fixes.",
    health: { kind: "warn", text: "2 findings · 8 checks passing" },
    tabs: ["Findings", "All checks", "History"],
    fixtures: ["offline", "reconnect-required"],
    records: [
      { id: "doc.ntfy", label: "ntfy destination offline", status: "warn", chips: [["Since", "2026-08-17 09:12"]], actions: [{ id: "a.fix", label: "Go to fix", kind: "primary", dest: "mgr.notifications/ntf.ntfy" }] },
      { id: "doc.deepseek", label: "DeepSeek usage endpoint 503", status: "warn", chips: [["Provider", "ready · usage only"]], actions: [{ id: "a.fix", label: "Go to fix", kind: "primary", dest: "mgr.provider/prov.deepseek-key" }] },
      { id: "doc.tools", label: "Tool installations", status: "ok", chips: [["Result", "6 of 7 healthy · 1 manual-only (unknown owner)"]] },
      { id: "doc.index", label: "Project search index", status: "ok", chips: [["Result", "fresh · 12,408 files"]] },
      { id: "doc.storage", label: "Storage & pressure", status: "ok", chips: [["Result", "healthy · 34% vault use"]] }
    ],
    note: "Doctor deep-links to the exact owning row; it never duplicates a fix flow." });

  /* =================== FILE MANAGER / EDITOR =================== */
  mgr({ id: "mgr.filemanager", family: "File Manager / Editor", title: "File Manager & Editor", domain: "code", kind: "document", icon: "stack",
    blurb: "Tree behavior, tabs, large files, recovery, and why a file might be transient.",
    health: { kind: "ok", text: "3 tabs · no changed-on-disk files" },
    tabs: ["Tree", "Tabs & groups", "Large files", "Recovery"],
    fixtures: ["unavailable"],
    records: [
      { id: "fm.hidden", label: "Hidden and ignored files", status: "ok", chips: [["Value", "Dim ignored · hide .git internals"]] },
      { id: "fm.large", label: "Large-file threshold", status: "ok", chips: [["Value", "8 MB — preview instead of full load"]] },
      { id: "fm.tabs", label: "Tab and split limits", status: "ok", chips: [["Value", "12 tabs · 2 split groups"]] },
      { id: "fm.disk", label: "Changed on disk", status: "ok", chips: [["Policy", "offer diff + reload · never silent overwrite"]] },
      { id: "fm.transient", label: "Transient/unavailable files", status: "ok", chips: [["Example", "vault:// mounts while server offline show reason, not error spam"]] }
    ] });

  /* =================== TERMINAL =================== */
  mgr({ id: "mgr.terminal", family: "Terminal", title: "Terminal", domain: "code", kind: "roster", icon: "terminal",
    blurb: "Profiles, shells, rendering, and transcripts.",
    health: { kind: "ok", text: "3 profiles · default healthy" },
    tabs: ["Profiles", "Rendering", "Transcripts"],
    fixtures: ["restart-required"],
    records: [
      { id: "trm.pwsh", label: "PowerShell 7 (default)", status: "ok", chips: [["Shell", "pwsh 7.4"], ["CWD", "project root"], ["Font", "14px PM Mono"]] },
      { id: "trm.cmd", label: "Command Prompt", status: "ok", chips: [["Shell", "cmd"]], detail: [["Rendering", "classic conhost path — opacity fixed at 100%"]] },
      { id: "trm.wsl", label: "WSL: Ubuntu", status: "warn", statusLabel: "Optional — not set up", chips: [["Environment", "Linux through WSL · optional"]], actions: [{ id: "a.setup", label: "Set up", kind: "primary" }] },
      { id: "trm.ansi", label: "ANSI palette", status: "ok", chips: [["Theme", "PM terminal palette · live preview below"]], palette: ["#3b4252", "#bf616a", "#a3be8c", "#ebcb8b", "#81a1c1", "#b48ead", "#88c0d0", "#e5e9f0"] },
      { id: "trm.transcript", label: "Transcript retention", status: "ok", chips: [["Value", "30 days · 20 MB cap per session"]] }
    ] });

  /* =================== LSP =================== */
  mgr({ id: "mgr.lsp", family: "LSP", title: "Language Servers", domain: "code", kind: "roster", icon: "lsp",
    blurb: "Registry servers with provenance, effective attachment, and restart.",
    health: { kind: "warn", text: "4 attached · 1 degraded (remote)" },
    tabs: ["Servers", "Attachment", "Logs"],
    fixtures: ["reconnect-required", "unknown-owner"],
    records: [
      { id: "lsp.rust", label: "rust-analyzer", status: "ok", chips: [["Source", "registry · official binary"], ["Attached", "requested + effective · 214 files"]] },
      { id: "lsp.ts", label: "typescript-language-server", status: "ok", chips: [["Attached", "effective"]] },
      { id: "lsp.py", label: "pyright", status: "ok", chips: [["Attached", "effective"]] },
      { id: "lsp.remote", label: "clangd (remote host)", status: "warn", statusLabel: "Degraded", chips: [["Reason", "SSH environment rekeyed — reconnect required"]], actions: [{ id: "a.reconnect", label: "Reconnect", kind: "primary" }] },
      { id: "lsp.custom", label: "custom: wgsl-analyze", status: "warn", statusLabel: "Manual-only", chips: [["Owner", "unknown — not in any package database"]], detail: [["Effect", "No auto-update; health checks only"]] }
    ] });

  /* =================== FORMATTERS =================== */
  mgr({ id: "mgr.formatters", family: "Formatters", title: "Formatters", domain: "code", kind: "roster", icon: "code",
    blurb: "Global enable plus per-language formatter table with health and test.",
    health: { kind: "ok", text: "5 configured · 1 not found" },
    tabs: ["Table", "Test"],
    fixtures: ["unavailable", "validation-error"],
    records: [
      { id: "fmt.rust", label: "Rust · rustfmt", status: "ok", chips: [["Command", "rustfmt · edition 2021"]], actions: [{ id: "a.test", label: "Test", kind: "quiet" }] },
      { id: "fmt.ts", label: "TypeScript · prettier", status: "ok", chips: [["Command", "prettier --write"]] },
      { id: "fmt.py", label: "Python · ruff format", status: "ok", chips: [["Command", "ruff format"]] },
      { id: "fmt.md", label: "Markdown · prettier", status: "ok" },
      { id: "fmt.c", label: "C · clang-format", status: "bad", statusLabel: "Not found", chips: [["Reason", "no clang-format on PATH for this host/environment"]], actions: [{ id: "a.setup", label: "Set up", kind: "primary" }] }
    ] });

  /* =================== COMMANDS & SHORTCUTS =================== */
  mgr({ id: "mgr.commands", family: "Commands & Shortcuts", title: "Commands & Shortcuts", domain: "extensions", kind: "catalog", icon: "bolt",
    blurb: "Custom commands with parameters and dry-run; shortcut map with conflict checks.",
    health: { kind: "ok", text: "6 commands · 41 shortcuts · 1 conflict" },
    tabs: ["Commands", "Shortcuts", "Cheat sheet"],
    fixtures: ["validation-error", "import-conflict"],
    records: [
      { id: "cmd.ship", label: "ship-it", status: "ok", chips: [["Runs", "test → build → tag"], ["Shell safety", "reviewed · no secrets echoed"]], actions: [{ id: "a.dryrun", label: "Dry run", kind: "primary" }], detail: [["Dry run", "Previews effects only — never sends work to an agent"]] },
      { id: "cmd.backup", label: "nightly-backup", status: "ok", chips: [["Schedule", "02:30 · receipts kept"]] },
      { id: "cmd.report", label: "weekly-report", status: "warn", statusLabel: "Validation", chips: [["Error", "parameter 'scope' missing default"]], actions: [{ id: "a.edit", label: "Edit", kind: "primary" }] },
      { id: "cmd.sc.conflict", label: "Shortcut Ctrl+Shift+R", status: "warn", statusLabel: "Conflict", chips: [["Bound to", "reload-ui and run-tests"]], actions: [{ id: "a.remap", label: "Remap", kind: "primary" }] }
    ] });

  /* =================== MCP =================== */
  mgr({ id: "mgr.mcp", family: "MCP", title: "MCP Servers", domain: "system", kind: "roster", icon: "plug",
    blurb: "Model Context Protocol servers with transport, trust, and logs.",
    health: { kind: "ok", text: "4 servers · 3 connected" },
    tabs: ["Servers", "Resources", "Logs"],
    fixtures: ["offline", "unavailable"],
    records: [
      { id: "mcp.fs", label: "filesystem (scoped)", status: "ok", chips: [["Transport", "stdio"], ["Scope", "P:\\ only · FileSafe enforced"]] },
      { id: "mcp.git", label: "git-forge", status: "ok", chips: [["Transport", "http"], ["Auth", "token reference"]] },
      { id: "mcp.dbg", label: "debug-bridge", status: "warn", statusLabel: "Offline", chips: [["Since", "08:50 · restart attempted twice"]], actions: [{ id: "a.restart", label: "Restart", kind: "primary" }] },
      { id: "mcp.future", label: "design-assets", status: "warn", statusLabel: "Needs setup", chips: [["Available", "not configured for this project"]] }
    ] });

  /* =================== SKILLS =================== */
  mgr({ id: "mgr.skills", family: "Skills", title: "Skills", domain: "extensions", kind: "catalog", icon: "stack",
    blurb: "Curated skill packs with provenance and project enablement.",
    health: { kind: "ok", text: "9 installed · 6 enabled here" },
    tabs: ["Installed", "Available", "Updates"],
    fixtures: ["update-ask"],
    records: [
      { id: "skl.frontend", label: "frontend-design", status: "ok", chips: [["Source", "curated · v3"], ["Enabled", "this project"], ["Invocations", "34"]] },
      { id: "skl.audit", label: "interface-audit", status: "ok", chips: [["Source", "curated · v2"], ["Enabled", "global"]] },
      { id: "skl.spell", label: "spelling-house-style", status: "ok", chips: [["Source", "custom import · scanned"]] },
      { id: "skl.update", label: "print-mk2", status: "warn", statusLabel: "Update available", chips: [["v2 → v3", "ask-first policy"]], actions: [{ id: "a.update", label: "Review update", kind: "primary" }] }
    ] });

  /* =================== PLUGINS =================== */
  mgr({ id: "mgr.plugins", family: "Plugins", title: "Plugins", domain: "extensions", kind: "catalog", icon: "grid",
    blurb: "Bigger extensions with their own permission needs.",
    health: { kind: "ok", text: "3 installed" },
    fixtures: ["unavailable"],
    records: [
      { id: "plg.tray", label: "tray-plus", status: "ok", chips: [["Version", "1.8 · compatible"], ["Needs", "tray access"]] },
      { id: "plg.diff", label: "diff-lens", status: "ok", chips: [["Version", "2.0"]] },
      { id: "plg.old", label: "voice-dictate", status: "warn", statusLabel: "Incompatible", chips: [["Needs", "app ≥ 2027.1 · currently 2026.8"]], detail: [["Effect", "stays disabled; no partial load"]] }
    ] });

  /* =================== TOOLS =================== */
  mgr({ id: "mgr.tools", family: "Tools", title: "Tools & Installations", domain: "extensions", kind: "roster", icon: "settings",
    blurb: "Shared tool lifecycle: binaries PM uses, their owners and health. Provider CLIs are the strict exception.",
    health: { kind: "ok", text: "7 tools · 6 healthy" },
    tabs: ["Installed", "Lifecycle", "Tool Store"],
    fixtures: ["unknown-owner", "multi-install", "verify-fail-rollback"],
    records: [
      { id: "tool.git", label: "Git", status: "ok", chips: [["Version", "2.46 · winget owner"], ["Policy", "auto-maintain (approved baseline)"]] },
      { id: "tool.jj", label: "Jujutsu", status: "ok", chips: [["Version", "0.20 · scoop owner"]] },
      { id: "tool.ffmpeg", label: "ffmpeg", status: "ok", chips: [["Version", "7.0 · manual (documented path)"]] },
      { id: "tool.docker", label: "Docker Desktop", status: "warn", statusLabel: "2 installs", chips: [["Candidates", "C:\\Program Files\\Docker (Selected) · winget shadow"]] },
      { id: "tool.mystery", label: "grep-tool.exe", status: "warn", statusLabel: "Unknown owner", chips: [["Evidence", "bare path in PATH — no package database match"]], detail: [["Policy", "manual-only: no auto update or repair"]] },
      { id: "tool.helm", label: "Helm", status: "ok", chips: [["Version", "3.15"]] }
    ],
    store: { note: "PM Tool Store holds tool-owned state outside replaceable images. Provider CLIs are never pre-seeded here." } });

  /* =================== TESTING & DEBUG =================== */
  mgr({ id: "mgr.testing", family: "Testing & Debug", title: "Testing & Debug", domain: "code", kind: "document", icon: "bolt",
    blurb: "Per-capability Auto/On/Off policy for testing and debugging.",
    health: { kind: "ok", text: "8 capabilities configured" },
    tabs: ["Capabilities", "Debugger", "Artifacts"],
    fixtures: ["managed"],
    records: [
      { id: "tst.unit", label: "Unit & integration", status: "ok", chips: [["Policy", "Auto"]] },
      { id: "tst.browser", label: "Built-in browser tests", status: "ok", chips: [["Policy", "Auto · isolated profile"]] },
      { id: "tst.native", label: "Desktop/native tests", status: "ok", chips: [["Policy", "On"]] },
      { id: "tst.dap", label: "DAP debugger", status: "ok", chips: [["Policy", "On · pick adapter per launch"]] },
      { id: "tst.perf", label: "Performance tests", status: "managed", statusLabel: "Managed", chips: [["Policy", "Off — CI baseline policy"]], detail: [["Origin", "policy 'ci-only-perf'"]] },
      { id: "tst.artifacts", label: "Capture & artifacts", status: "ok", chips: [["Value", "keep failures 14 days"]] }
    ] });

  /* =================== STORAGE & RETENTION =================== */
  mgr({ id: "mgr.storage", family: "Storage & Retention", title: "Storage & Retention", domain: "system", kind: "health", icon: "layers",
    blurb: "Vault pressure, retention, legal holds, quarantine, and compaction.",
    health: { kind: "ok", text: "34% of 500 GB · pressure low" },
    tabs: ["Health", "Retention", "Holds & quarantine"],
    fixtures: ["restart-required"],
    records: [
      { id: "sto.mode", label: "Storage mode", status: "ok", chips: [["Value", "Project Vault (physical)"]] },
      { id: "sto.retention", label: "Retention policy", status: "ok", chips: [["Value", "sessions 90d · artifacts 30d · receipts 1y"]] },
      { id: "sto.hold", label: "Legal hold", status: "ok", chips: [["Value", "none active"]] },
      { id: "sto.quarantine", label: "Quarantine", status: "ok", chips: [["Items", "2 · both scanned-clean pending review"]] },
      { id: "sto.compact", label: "Compaction", status: "ok", chips: [["Last", "2026-08-12 · reclaimed 3.1 GB"]] },
      { id: "sto.migrate", label: "Vault migration", status: "warn", statusLabel: "Restart required", chips: [["Pending", "move to D:\\vault-2 after restart"]] }
    ] });

  /* =================== BACKUP & RESTORE =================== */
  mgr({ id: "mgr.backup", family: "Backup & Restore", title: "Backup & Restore", domain: "system", kind: "transaction", icon: "layers",
    blurb: "Internal snapshots, settings backup, project backup. Full Server backup belongs to its owner flow.",
    health: { kind: "ok", text: "Last backup 2026-08-17 22:04 · verified" },
    tabs: ["Backups", "Schedule", "Test restore"],
    fixtures: ["verify-fail-rollback", "offline"],
    records: [
      { id: "bkp.now", label: "Back up now", kind: "action", status: "ok", actions: [{ id: "a.backup", label: "Back up now", kind: "primary" }] },
      { id: "bkp.schedule", label: "Backup schedule", status: "ok", chips: [["Value", "nightly 02:30 · keep 14"]] },
      { id: "bkp.last", label: "Last backup", status: "ok", chips: [["When", "2026-08-17 22:04"], ["Verified", "yes · receipt #7741"]] },
      { id: "bkp.fail", label: "Backup 2026-08-09", status: "bad", statusLabel: "Verification failed → rolled back", chips: [["Receipt", "#7698"], ["Result", "destination write failed · snapshot rolled back cleanly"]], actions: [{ id: "a.log", label: "Open log", kind: "quiet" }] },
      { id: "bkp.restore", label: "Test restore", status: "ok", chips: [["Value", "monthly · next 2026-09-01"]] }
    ],
    deferredOwner: "Full Server backup owner flow" });

  /* =================== SETTINGS LIFECYCLE =================== */
  mgr({ id: "mgr.lifecycle", family: "Settings Lifecycle", title: "Import, Export & Reset", domain: "system", kind: "transaction", icon: "refresh",
    blurb: "Export/backup, import with conflict preview, legacy-key migration, reset, rollback.",
    health: { kind: "ok", text: "828 settings · last export 2026-08-10" },
    tabs: ["Export", "Import", "Reset", "History"],
    fixtures: ["import-conflict", "rollback-complete", "validation-error"],
    records: [
      { id: "lcy.export", label: "Export settings backup", status: "ok", actions: [{ id: "a.export", label: "Export", kind: "primary" }] },
      { id: "lcy.import", label: "Import from file", status: "ok", chips: [["Conflicts found", "6 · yours/theirs review before apply"]], actions: [{ id: "a.preview", label: "Preview import", kind: "primary" }], detail: [["Flow", "preview → resolve → restore point → atomic apply → verify → receipt → rollback available"]] },
      { id: "lcy.migrate", label: "Legacy-key migration", status: "ok", chips: [["Pending", "12 keys from 2025.4 naming"]] },
      { id: "lcy.reset", label: "Reset to defaults", status: "ok", chips: [["Scope", "this project · preview first"]] },
      { id: "lcy.rollback", label: "Rollback complete", status: "ok", statusLabel: "Last rollback 2026-08-15", chips: [["Restored", "141 values · receipt #7712"]] }
    ] });

  /* =================== HISTORY & SESSIONS =================== */
  mgr({ id: "mgr.history", family: "History & Sessions", title: "History & Sessions", domain: "system", kind: "roster", icon: "river",
    blurb: "Session history for this project and everywhere, with compare and export.",
    health: { kind: "ok", text: "1,204 sessions · policy 90d" },
    tabs: ["This project", "All projects", "Policy"],
    fixtures: ["empty"],
    records: [
      { id: "his.today", label: "Today · 11 sessions", status: "ok", chips: [["Longest", "Settings bakeoff sweep · 2h 14m"]] },
      { id: "his.week", label: "This week · 63 sessions", status: "ok" },
      { id: "his.archive", label: "Archive", status: "ok", chips: [["Policy", "archive after 90d · export first"]] },
      { id: "his.trash", label: "Deleted sessions", status: "ok", chips: [["Policy", "30d grace"]] }
    ] });

  /* =================== RUNTIME ARTIFACTS =================== */
  mgr({ id: "mgr.artifacts", family: "Runtime Artifacts / Project Outputs", title: "Runtime Artifacts", domain: "system", kind: "roster", icon: "stack",
    blurb: "Outputs runs leave behind: type, location, version, retention, receipts.",
    health: { kind: "ok", text: "412 artifacts · 2.1 GB" },
    tabs: ["Artifacts", "Policy", "Reveal & export"],
    records: [
      { id: "art.builds", label: "Build outputs", status: "ok", chips: [["Count", "188 · 1.2 GB"], ["Location", "target\\ · per-project"]] },
      { id: "art.reports", label: "Reports & evidence", status: "ok", chips: [["Count", "121"], ["Retention", "30d default"]] },
      { id: "art.captures", label: "Test captures", status: "ok", chips: [["Count", "103 · redaction applied to 9"]] },
      { id: "art.old", label: "2025 exports", status: "warn", statusLabel: "Cleanup candidate", chips: [["Size", "480 MB · untouched 11 months"]] }
    ],
    identity: "Artifacts are PM-owned unless the provider wrote native outputs; identity is shown per row." });

  /* =================== SOURCE CONTROL / WORKTREES =================== */
  mgr({ id: "mgr.sourcecontrol", family: "Source Control / Worktrees", title: "Source Control & Worktrees", domain: "branching", kind: "roster", icon: "code",
    blurb: "Git and Jujutsu health, worktrees, forge connection, and safety policies.",
    health: { kind: "ok", text: "Git 2.46 healthy · 3 worktrees" },
    tabs: ["Repositories", "Worktrees", "Forge", "Policy"],
    fixtures: ["multi-install", "unknown-owner"],
    records: [
      { id: "sc.git", label: "Git", status: "ok", chips: [["Version", "2.46.0"], ["Owner", "winget · proven"], ["SSH source", "agent forwarding on"]] },
      { id: "sc.jj", label: "Jujutsu (optional)", status: "ok", chips: [["Version", "0.20 · colocated repo supported"]] },
      { id: "sc.forge", label: "Forge connection", status: "ok", chips: [["GitHub", "sitti · token reference"], ["Test-before-merge", "On"]] },
      { id: "sc.worktrees", label: "Worktrees", status: "ok", chips: [["Active", "3 · bakeoff-glm, audit, spike-llm"], ["Cleanup", "dry-run available"]] },
      { id: "sc.force", label: "Force-push policy", status: "managed", statusLabel: "Managed", chips: [["Value", "never on shared branches · org policy"]], detail: [["Origin", "policy 'no-history-rewrite'"]] }
    ] });

  /* =================== GITHUB ACTIONS =================== */
  mgr({ id: "mgr.github", family: "GitHub Actions", title: "GitHub Actions", domain: "branching", kind: "roster", icon: "bolt",
    blurb: "Pinned workflows, current-branch readiness, and run browsing.",
    health: { kind: "ok", text: "Current branch green · 3 pinned workflows" },
    tabs: ["Workflows", "Runs", "Setup"],
    fixtures: ["unavailable"],
    records: [
      { id: "gh.ci", label: "ci.yml (pinned)", status: "ok", chips: [["Branch", "bakeoff-glm · passing 12m ago"]] },
      { id: "gh.release", label: "release.yml (pinned)", status: "ok", chips: [["Manual", "tag required"]] },
      { id: "gh.nightly", label: "nightly-site.yml", status: "warn", statusLabel: "Needs account capability", chips: [["Reason", "workflow uses OIDC — needs org allowlist"]], actions: [{ id: "a.setup", label: "Open setup", kind: "primary" }] },
      { id: "gh.runs", label: "Recent runs", status: "ok", chips: [["Browse", "runs, jobs, logs · deep-link to failing job"]] }
    ] });

  /* =================== CONTAINERS & REGISTRIES =================== */
  mgr({ id: "mgr.containers", family: "Containers & Registries", title: "Containers & Registries", domain: "system", kind: "roster", icon: "stack",
    blurb: "Docker, Podman, and Kubernetes tools as human top-level resources.",
    health: { kind: "warn", text: "Docker ready · kubectl needs setup" },
    tabs: ["Docker", "Podman", "Kubernetes", "Registries"],
    fixtures: ["multi-install", "unavailable"],
    records: [
      { id: "ctr.docker", label: "Docker", status: "ok", chips: [["Desktop", "4.32 · engine healthy"], ["Compose", "v2 · buildx installed"]] },
      { id: "ctr.podman", label: "Podman", status: "warn", statusLabel: "Not installed", chips: [["Available", "optional · shared tool lifecycle"]] },
      { id: "ctr.k8s", label: "Kubernetes tools", status: "warn", statusLabel: "Setup required", chips: [["Needs", "kubectl · kubeconfig"]], actions: [{ id: "a.setup", label: "Set up", kind: "primary" }] },
      { id: "ctr.registry", label: "Registries", status: "ok", chips: [["ghcr.io", "authed · pull-through cache on"]] }
    ] });

  /* =================== WEB / SEARCH / FETCH / CRAWL =================== */
  mgr({ id: "mgr.web", family: "Web / Search / Fetch / Crawl", title: "Web, Search & Fetch", domain: "web", kind: "document", icon: "map",
    blurb: "Search provider priority, fetch/crawl limits, credit guards, privacy.",
    health: { kind: "ok", text: "3 providers · fetch policy quiet" },
    tabs: ["Providers", "Fetch & crawl", "Privacy", "Readiness"],
    fixtures: ["offline"],
    records: [
      { id: "web.priority", label: "Search provider priority", status: "ok", chips: [["Order", "Brave → DuckDuckGo → searx (office)"]] },
      { id: "web.fetch", label: "Fetch policy", status: "ok", chips: [["Rate", "10/min"], ["Robots", "respect · exceptions logged"]] },
      { id: "web.crawl", label: "Crawl limits", status: "ok", chips: [["Depth", "3 · 500 pages · credit guard $2/day"]] },
      { id: "web.privacy", label: "Privacy", status: "ok", chips: [["Proxies", "off"], ["Certificates", "system store · pinning off"], ["Air-gap", "respected — web rows go read-only"]] },
      { id: "web.ready", label: "Readiness", status: "ok", chips: [["Brave", "ready · cached key"], ["searx", "offline (office VPN) — last-known-good shown"]] }
    ] });

  /* =================== PROJECT SEARCH INDEX =================== */
  mgr({ id: "mgr.searchindex", family: "Project Search Index", title: "Project Search Index", domain: "web", kind: "health", icon: "search",
    blurb: "The local index behind project search: enable, rebuild, exclusions, disk use.",
    health: { kind: "ok", text: "Fresh · 12,408 files · 61 MB" },
    tabs: ["Status", "Rebuild", "Policy"],
    fixtures: ["loading-cached"],
    records: [
      { id: "idx.enable", label: "Indexing enabled", status: "ok", chips: [["Value", "On · project-scoped"]] },
      { id: "idx.rebuild", label: "Rebuild", kind: "action", status: "ok", chips: [["Last", "full 2026-08-16 · incremental since"]], actions: [{ id: "a.rebuild", label: "Rebuild now", kind: "primary" }], work: { kind: "rebuild", phases: ["snapshot", "walk", "parse", "merge"], denominator: "12,408 files" } },
      { id: "idx.exclusions", label: "Exclusions", status: "ok", chips: [["Value", "target/**, node_modules/**, >8 MB binaries"]] },
      { id: "idx.disk", label: "Disk use", status: "ok", chips: [["Now", "61 MB · cap 500 MB"], ["Remote cache", "off"]] }
    ] });

  /* =================== WORKSPACE CLEANUP =================== */
  mgr({ id: "mgr.cleanup", family: "Workspace Cleanup", title: "Workspace Cleanup", domain: "system", kind: "transaction", icon: "refresh",
    blurb: "Dry-run first cleanup of stale worktrees, caches, and orphaned outputs.",
    health: { kind: "ok", text: "Last sweep 2026-08-14 · reclaimed 4.2 GB" },
    tabs: ["Dry run", "Rules", "Receipts"],
    records: [
      { id: "cln.dryrun", label: "Dry run sweep", kind: "action", status: "ok", chips: [["Finds", "worktrees, caches, temp, orphans"]], actions: [{ id: "a.dry", label: "Run dry sweep", kind: "primary" }] },
      { id: "cln.rules", label: "Rules", status: "ok", chips: [["Worktrees", "merged + 14d idle"], ["Evidence", "never auto-deleted · receipts kept"]] },
      { id: "cln.last", label: "Last sweep receipt", status: "ok", chips: [["2026-08-14", "4.2 GB · 61 items · #7703"]] }
    ] });

  /* =================== MEDIA & OUTPUT =================== */
  mgr({ id: "mgr.media", family: "Media & Output", title: "Media & Output", domain: "media", kind: "document", icon: "map",
    blurb: "Image generation, media in/out, and capability boundaries.",
    health: { kind: "ok", text: "2 generators · outputs to artifacts" },
    tabs: ["Generation", "In & out", "Capabilities"],
    fixtures: ["unavailable"],
    records: [
      { id: "med.gen", label: "Image generators", status: "ok", chips: [["Default", "Nano Banana · via OpenRouter"], ["Alt", "local SD (offline capable)"]] },
      { id: "med.in", label: "Media in", status: "ok", chips: [["Paste", "images + short audio"], ["Limits", "25 MB · scanned"]] },
      { id: "med.out", label: "Media out", status: "ok", chips: [["Location", "Runtime Artifacts · reveal in File Manager"]] },
      { id: "med.video", label: "Video generation", status: "warn", statusLabel: "Unavailable", chips: [["Reason", "no provider offers it on this account"]], detail: [["Shown", "as unavailable with reason — not hidden"]] }
    ] });

  /* =================== DRY METHOD VISIBLE STATE =================== */
  mgr({ id: "mgr.dry", family: "DRY Method visible state where exposed", title: "DRY Method State", domain: "system", kind: "health", icon: "layers",
    blurb: "Where the product exposes DRY-method state: canonical owners, single systems, no duplicates.",
    health: { kind: "ok", text: "All singular owners intact" },
    tabs: ["Owners", "Conflicts"],
    records: [
      { id: "dry.governor", label: "RuntimeResourceGovernor", status: "ok", chips: [["Role", "sole admission/policy owner"], ["Duplicates", "none"]] },
      { id: "dry.work", label: "ObservableWork", status: "ok", chips: [["Role", "sole truthful operation projection"]] },
      { id: "dry.binary", label: "BinaryLocator", status: "ok", chips: [["Role", "sole installation resolver"], ["Pending", "1 unknown-owner path"]] },
      { id: "dry.sessions", label: "Browser sessions", status: "ok", chips: [["AuthBrowserSession", "human-only · protected"]] }
    ],
    note: "Read-only projection of singular-owner health; Settings never becomes a second owner." });

  PM2.registerManagers();

  /* ---------- surface families (demonstrated by each concept's own Home/Search/Workspace) ---------- */
  PM2.surfaceFamilies = ["Settings Home", "Settings Search", "Settings Workspace", "Ordinary setting grammar"];

  /* ---------- named-owner insertion destinations (deferred_named_owner) ---------- */
  PM2.owners = [
    { id: "own.onboarding", title: "Product Onboarding", owner: "Onboarding Wizard owner module", contract: "Settings provides destination + return deep link; wizard keeps its own flow", returnRoute: "system/advanced", note: "welcome/skip/defer/resume" },
    { id: "own.install", title: "Installation / Deployment", owner: "Installer & deployment owner", contract: "package/image deployment, OS prerequisites, rollback", returnRoute: "system/health" },
    { id: "own.claim", title: "Server Claim / Bootstrap", owner: "Server bootstrap owner", contract: "owner claim, secure bind, trusted-client pairing", returnRoute: "system/advanced" },
    { id: "own.hosts", title: "Servers / Execution Hosts / Clients", owner: "Server-first architecture owner", contract: "Home Server, Execution Hosts, Clients cards with human labels", returnRoute: "system/advanced" },
    { id: "own.hosting", title: "Project Hosting & Files", owner: "Project Vault owner", contract: "Hosted On / Project Files / Run Work projections", returnRoute: "system/advanced" },
    { id: "own.remote", title: "Remote Access", owner: "Remote access owner", contract: "enable/keys/ingress — no raw kubeconfig or realms by default", returnRoute: "system/advanced" },
    { id: "own.sync", title: "Project Sync / Move", owner: "Project Move owner", contract: "move/sync flows accept Settings deep links; no state machine here", returnRoute: "system/advanced" },
    { id: "own.updates", title: "Puppet Master application/content updates", owner: "Release/updates owner", contract: "update channel + restart plan cards", returnRoute: "system/health" },
    { id: "own.fullbackup", title: "Full Server backup owner flow", owner: "Full Server backup owner", contract: "Settings Backup & Restore links out; full-server flow stays with its owner", returnRoute: "mgr.backup" }
  ];
})();
