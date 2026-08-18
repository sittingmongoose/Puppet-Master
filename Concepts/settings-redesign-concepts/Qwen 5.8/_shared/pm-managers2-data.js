/* PMManagers2Data — headless fixture data for the Puppet Master Settings concept
 * prototypes 05-11. Defines the 42 manager families, 17 provider fixtures,
 * 9 deferred modules with named owners, 6 copy-source projects, and the extra
 * universal-search entries. No rendering, no DOM, no CSS. Project-only product:
 * no scope selectors, no inheritance, no profiles, no sync. */
(function () {
  "use strict";

  var CAT = {
    general: "General & Appearance",
    ai: "AI Brains & Providers",
    safety: "Permissions & Safety",
    code: "Code & Execution",
    memory: "Memory & Context",
    planning: "Planning & Verification",
    branching: "Branching & Collaboration",
    media: "Media & Output",
    web: "Web & Search",
    personas: "Personas",
    extensions: "Skills, Plugins & Commands",
    system: "System & Advanced"
  };

  function F(id, title, icon, archetype, domain, summary, objects, rows) {
    var f = { id: id, title: title, icon: icon, archetype: archetype, domain: domain, summary: summary, rows: rows };
    if (archetype === "roster") f.objects = objects || [];
    return f;
  }

  function R(id, label, desc, type, value, kind) {
    return { id: id, label: label, desc: desc, type: type, value: value, kind: kind };
  }

  function O(id, label, health, note) {
    return { id: id, label: label, health: health, note: note };
  }

  var families = [
    F("providers", "Providers", "robot", "catalog", "ai",
      "Provider CLIs, accounts, models, limits, and installation lifecycle. Every CLI is acquired explicitly from its official source for the exact Host/Environment.",
      null, [
        R("providers.acquisition", "CLI acquisition", "New provider CLIs install only after you choose Install, from the official source, for the exact Host/Environment. Puppet Master never installs one on its own.", "text", "Explicit user install", "setting"),
        R("providers.oauth-ownership", "OAuth ownership", "Claude CLI and Antigravity sign in through their own CLI flow. Puppet Master runs OAuth directly only for OpenAI and Codex, GitHub, and GitHub Copilot.", "text", "CLI-owned where required", "setting"),
        R("providers.update-policy", "Update policy", "How provider updates proceed: ask first, schedule when idle, or install automatically.", "select", "Ask first", "setting"),
        R("providers.readiness", "Readiness checks", "Every connection verifies the CLI is present, signed in, and passes a probe before it can carry work.", "text", "3 checks per connection", "status"),
        R("providers.rate-limits", "Rate Limits", "Combined request and token caps across active accounts.", "text", "6 of 17 connections near a cap", "status")
      ]),
    F("context", "Context & Instructions", "book", "catalog", "memory",
      "What reaches the assistant each turn: instruction files, project context, and the per-turn context budget.",
      null, [
        R("context.instruction-chain", "Instruction chain", "Scoped instruction files admitted on the last turn, nearest scope winning.", "text", "2 files admitted", "status"),
        R("context.auto-admission", "Admit instruction files automatically", "Pick up project instruction files as they appear. Off means every file is admitted by hand.", "toggle", true, "setting"),
        R("context.budget", "Context budget", "How much of the model context instructions and files may occupy before trimming.", "select", "Balanced", "setting"),
        R("context.excluded-paths", "Excluded paths", "Paths never admitted into context, such as secrets directories and lockfiles.", "text", "3 patterns", "setting")
      ]),
    F("memory", "Memory", "database", "catalog", "memory",
      "Assistant memories degrade by retrieval activation, never by deletion. Half-life equals activation: fading changes what surfaces, not what is true.",
      null, [
        R("memory.half-life", "Memory half-life", "Fading lowers retrieval activation. Memories leave active recall; they are never deleted or rewritten.", "select", "Balanced", "setting"),
        R("memory.verify", "Require verification", "New memories wait for review before they count as trusted.", "toggle", true, "setting"),
        R("memory.pinning", "Pinned memories", "Pinned memories always surface and never fade.", "number", 4, "status"),
        R("memory.restore", "Restore faded memories", "Faded memories stay recoverable at full fidelity.", "action", "Restore", "action"),
        R("memory.gist-health", "Assistant Gists", "Digest quality for long threads. Degrading gists show the affected threads and can be rebuilt.", "text", "Degrading — 2 gists stale", "diagnostic"),
        R("memory.rebuild", "Rebuild stale gists", "Regenerate the two stale Assistant Gists from their source threads.", "action", "Rebuild", "action")
      ]),
    F("personas", "Personas", "users", "roster", "personas",
      "Behavior capsules chosen per thread or Goal. A Persona changes how the assistant works, never what it may do.",
      [
        O("persona-assistant", "Assistant", "ok", "Default persona for new threads."),
        O("persona-collaborator", "Collaborator", "ok", "Paired working style for shared editing."),
        O("persona-overseer", "Overseer", "ok", "Reviews agent work and flags risk."),
        O("persona-planner", "Planning Lead", "attention", "Pinned for planning Goals; capsule draft pending review.")
      ], [
        R("personas.default", "Persona for new threads", "Capsule applied when a thread starts without an explicit choice.", "select", "Assistant", "setting"),
        R("personas.selection-scope", "Selection scope", "Choosing a Persona applies to the current thread only.", "select", "This thread", "setting"),
        R("personas.authority", "Persona is behavior, not authority", "A Persona cannot grant Full Access, widen FileSafe, or force a provider.", "text", "Enforced", "status"),
        R("personas.manage", "Manage personas", "Edit capsules, pin defaults, and review drafts.", "action", "Manage", "action")
      ]),
    F("goal", "Goal & Automation", "target", "roster", "planning",
      "Long-running Goals, their phase plans, and how much may run without asking.",
      [
        O("goal-docs-refresh", "Docs refresh", "ok", "Weekly documentation sweep; last run 3 days ago."),
        O("goal-dependency-audit", "Dependency audit", "attention", "Waiting on approval for the update phase."),
        O("goal-test-hardening", "Test hardening", "ok", "Running under the standard evidence profile.")
      ], [
        R("goal.concurrency", "Concurrent work ceiling", "How many Goal steps may run at once on this machine.", "number", 8, "setting"),
        R("goal.autonomy", "Autonomy level", "Whether phases need your approval before they start.", "select", "Ask at phase boundaries", "setting"),
        R("goal.evidence", "Evidence requirement", "Finished phases must show passing proof, not just a claim.", "toggle", true, "setting"),
        R("goal.active", "Active Goals", "Goals currently running or waiting on approval.", "number", 2, "status")
      ]),
    F("crew", "Crew", "zap", "roster", "branching",
      "Named teams of roles and routes for parallel work. Crew choices apply to the current thread or Goal.",
      [
        O("crew-solo", "Solo", "ok", "Single agent, no delegation."),
        O("crew-standard", "Standard Pair", "ok", "One worker plus one reviewer."),
        O("crew-swarm", "Swarm", "attention", "Six workers; near the concurrent work ceiling.")
      ], [
        R("crew.default", "Crew for new work", "Template applied when a Goal starts without an explicit crew.", "select", "Standard Pair", "setting"),
        R("crew.route-policy", "Route policy", "Whether crews may adapt model routes under capacity pressure.", "select", "Adaptive", "setting"),
        R("crew.isolation", "Worker isolation", "Each worker gets its own worktree and scoped tool set.", "toggle", true, "setting"),
        R("crew.manage", "Manage crews", "Edit templates, roles, and route preferences.", "action", "Manage", "action")
      ]),
    F("permissions", "Permissions & FileSafe", "shieldCheck", "roster", "safety",
      "Ordered rules decide what agents may do; the last matching rule wins. The FileSafe floor underneath can never be bypassed by any rule.",
      [
        O("profile-ask", "Ask for approval", "ok", "Every mutation asks first."),
        O("profile-auto-edits", "Auto accept edits", "ok", "File edits proceed; commands still ask."),
        O("profile-auto", "Auto", "ok", "Routine work proceeds within the FileSafe floor."),
        O("profile-full", "Full Access", "attention", "Maximum allowed; the FileSafe floor still applies.")
      ], [
        R("permissions.rule-order", "Evaluation order", "Rules evaluate top to bottom; the last matching rule wins.", "text", "Last match wins", "status"),
        R("permissions.file-safe-floor", "FileSafe floor", "Destructive paths stay protected no matter which rule matches.", "text", "Non-bypassable", "status"),
        R("permissions.default-profile", "Default access profile", "Profile used when no granular rule matches.", "select", "Auto accept edits", "setting"),
        R("permissions.trace", "Rule trace", "Show which rule decides for a given path.", "action", "Trace a path", "action"),
        R("permissions.rules", "Rule count", "Granular path rules currently defined.", "number", 5, "status"),
        R("permissions.manage-rules", "Manage rules", "Add, reorder, and remove permission rules.", "action", "Manage", "action")
      ]),
    F("bsd", "Back Seat Driver", "eye", "preference", "safety",
      "A read-only advisor that reviews work as it happens. It can warn and suggest; it can never widen authority or block the primary agent.",
      null, [
        R("bsd.mode", "Back Seat Driver mode", "Off never consults. Auto reviews only on risk or phase triggers. On may review every turn within its quota.", "select", "Auto", "setting"),
        R("bsd.quota", "Advisory quota", "Cap on advisory reviews per hour in On mode.", "number", 12, "setting"),
        R("bsd.authority", "Read-only by design", "No Back Seat Driver choice widens runtime mode, tools, FileSafe, permissions, or network authority.", "text", "Enforced", "status"),
        R("bsd.triggers", "Auto triggers", "Risk and phase events that wake Auto mode.", "text", "3 active triggers", "setting")
      ]),
    F("notifications", "Notifications", "bell", "preference", "general",
      "Where work reaches you. The title-bar stack is the only in-app surface: no status-bar bell, no permanent corner stack.",
      null, [
        R("notifications.surface", "In-app notification surface", "The title-bar stack is the only in-app notification surface.", "text", "Title-bar stack", "status"),
        R("notifications.completion", "Notify on completed work", "Show a title-bar notice when work finishes.", "toggle", true, "setting"),
        R("notifications.approvals", "Notify on approval requests", "Approval asks always carry a visible notice.", "toggle", true, "setting"),
        R("notifications.quiet-hours", "Quiet hours", "Silence non-critical notices during this window.", "select", "Off", "setting"),
        R("notifications.sound-pairing", "Sound pairing", "Sound never replaces a visible notice; it only accompanies one.", "text", "Always paired", "status")
      ]),
    F("sounds", "Sounds", "moon", "catalog", "general",
      "Notification sounds and packs. PeonPing and OpenPeon-compatible packs import with format and license checks; previews stay local and test sends are rate-limited and receipted.",
      null, [
        R("sounds.master", "Master sound", "Play sounds for completed work, approvals, and failures.", "toggle", true, "setting"),
        R("sounds.volume", "Master volume", "Loudness for all notification sounds.", "number", 60, "setting"),
        R("sounds.pack-import", "Pack import", "PeonPing and OpenPeon-compatible packs are validated for format and license before import. Packs that fail stay disabled.", "text", "Format and license checks", "status"),
        R("sounds.preview", "Preview policy", "Previews play locally only; nothing is uploaded or shared.", "text", "Local only", "status"),
        R("sounds.test-send", "Test send", "Sends one receipted test notification. Rate-limited to prevent spam.", "action", "Send test", "action")
      ]),
    F("appearance", "Appearance", "palette", "catalog", "general",
      "Eight built-in themes — Friendly, Glass, Retro, and Basic in dark and light — plus custom TOML themes validated on load, with a safe fallback when a theme fails.",
      null, [
        R("appearance.theme", "Theme", "One of eight built-in looks.", "select", "Friendly Dark", "setting"),
        R("appearance.theme-mode", "Theme mode", "Auto follows the system; Light and Dark force the variant of the chosen family.", "select", "Auto", "setting"),
        R("appearance.custom-toml", "Custom theme file", "A custom TOML theme is validated before use; an invalid file falls back to the previous theme and shows the parse error.", "text", "Valid — nord-pm.toml", "status"),
        R("appearance.validate", "Validate custom theme", "Re-check the active custom theme file.", "action", "Validate", "action"),
        R("appearance.reduced-motion", "Reduce motion", "Cut non-essential animation across the app.", "toggle", false, "setting")
      ]),
    F("spellcheck", "Spellcheck & Dictionaries", "edit", "catalog", "general",
      "Spellcheck underlines only — suggestions appear on click or Enter, never automatic replacement. Code, paths, and identifiers are always skipped.",
      null, [
        R("spellcheck.enabled", "Check spelling", "Quietly underlines likely misspellings in prose you write.", "toggle", true, "setting"),
        R("spellcheck.autocorrect", "Automatic replacement", "Never offered: suggestions require an explicit click or Enter.", "text", "Off by design", "status"),
        R("spellcheck.language", "Spellcheck language", "Language used for spelling suggestions.", "select", "Automatic", "setting"),
        R("spellcheck.source", "Dictionary source", "Automatic tries the OS service first, then Puppet Master local dictionaries.", "select", "Automatic", "setting"),
        R("spellcheck.personal", "Personal dictionary", "Words you added yourself.", "action", "Manage", "action"),
        R("spellcheck.tech-prose", "Check technical prose", "Underline likely misspellings inside technical writing.", "toggle", false, "setting")
      ]),
    F("desktop", "Desktop, Tray & Window", "grid", "preference", "system",
      "Window behavior, the system tray, and quit confirmation.",
      null, [
        R("desktop.tray", "Show in system tray", "Keep a tray icon while Puppet Master runs.", "toggle", true, "setting"),
        R("desktop.close-behavior", "Close button behavior", "Whether closing the window quits the app or keeps it running in the tray.", "select", "Minimize to tray", "setting"),
        R("desktop.confirm-quit", "Confirm before quitting", "Ask before closing while work is running.", "toggle", true, "setting"),
        R("desktop.startup", "Launch at startup", "Start Puppet Master when you sign in.", "toggle", false, "setting")
      ]),
    F("teacher", "Teacher", "info", "preference", "general",
      "Plain-language explanations for receipts, settings, and decisions — on demand, never forced.",
      null, [
        R("teacher.level", "Explanation level", "How much detail explanations carry.", "select", "Concise", "setting"),
        R("teacher.receipts", "Explain receipts", "Add a plain-language summary to completed-work receipts.", "toggle", true, "setting"),
        R("teacher.ask", "Ask the Teacher", "Explain any setting, receipt, or decision in plain language.", "action", "Ask", "action")
      ]),
    F("doctor", "Doctor", "heart", "diagnostic", "system",
      "Health checks across providers, language servers, storage, and backup. Each check produces a receipt; nothing is repaired without your go-ahead.",
      null, [
        R("doctor.overall", "Overall health", "Aggregated result of the last full run.", "text", "Healthy with 2 advisories", "diagnostic"),
        R("doctor.last-run", "Last full run", "When Doctor last checked everything.", "text", "Today, 09:14", "status"),
        R("doctor.auto", "Run checks automatically", "Periodic background checks; manual runs are always available.", "toggle", true, "setting"),
        R("doctor.run", "Run Doctor now", "Full check across providers, servers, storage, and backup.", "action", "Run checks", "action")
      ]),
    F("files", "File Manager & Editor", "fileText", "catalog", "code",
      "How files open, reload, and save when things change underneath you.",
      null, [
        R("files.changed-on-disk", "Changed-on-disk handling", "What happens when a file changes outside the editor.", "select", "Ask before reloading", "setting"),
        R("files.autosave", "Autosave", "Save changes automatically after a short pause.", "toggle", true, "setting"),
        R("files.encoding", "Default encoding", "Encoding used when opening files without a known encoding.", "select", "UTF-8", "setting"),
        R("files.line-endings", "Line endings", "Line ending style for new files.", "select", "Keep existing", "setting")
      ]),
    F("terminal", "Terminal", "terminal", "preference", "code",
      "The built-in terminal: shell, integration, and output behavior.",
      null, [
        R("terminal.shell", "Shell", "Shell used for new terminal sessions.", "select", "PowerShell 7", "setting"),
        R("terminal.integration", "Shell integration", "Command marks and prompt detection when the shell supports them.", "toggle", true, "setting"),
        R("terminal.scrollback", "Scrollback lines", "How much output the terminal keeps.", "number", 5000, "setting"),
        R("terminal.bell", "Audible bell", "Sound the terminal bell when a process asks for attention.", "toggle", false, "setting")
      ]),
    F("lsp", "Language Servers", "cpu", "roster", "code",
      "Language servers detected, started, and repaired per project.",
      [
        O("lsp-rust", "rust-analyzer", "ok", "Serving 214 Rust files."),
        O("lsp-typescript", "TypeScript server", "ok", "Serving the shared concept scripts."),
        O("lsp-python", "Python server", "attention", "Crashed twice today; repair available.")
      ], [
        R("lsp.autodetect", "Detect languages automatically", "Enable language support as matching files appear.", "toggle", true, "setting"),
        R("lsp.diagnostics", "Show diagnostics", "Where editor problems appear.", "select", "Inline and panel", "setting"),
        R("lsp.format-owner", "Formatting ownership", "Who owns formatting when a server and a formatter both exist.", "select", "Language server", "setting"),
        R("lsp.repair", "Repair servers", "Restart and re-probe failing language servers.", "action", "Repair", "action")
      ]),
    F("formatters", "Formatters", "wand", "roster", "code",
      "Format-on-save and format commands, with per-language ownership.",
      [
        O("fmt-rustfmt", "rustfmt", "ok", "Owned formatting for Rust."),
        O("fmt-prettier", "Prettier", "ok", "Owned formatting for JSON and Markdown."),
        O("fmt-black", "Black", "attention", "Not found on this host; fallback active.")
      ], [
        R("formatters.enable", "Enable formatters", "Master switch for format-on-save and format commands.", "toggle", true, "setting"),
        R("formatters.on-save", "Format on save", "Format files automatically when they are saved.", "toggle", true, "setting"),
        R("formatters.scope", "Formatter scope", "Whether formatter choices follow the project or stay local to this install.", "select", "Project when defined", "setting"),
        R("formatters.test", "Run a formatter test", "Format a sample file and show the diff without touching your work.", "action", "Run test", "action")
      ]),
    F("commands", "Commands & Shortcuts", "play", "roster", "extensions",
      "The command palette, custom commands, and keyboard shortcuts. Dry-run never sends work to an agent.",
      [
        O("cmd-build", "Build project", "ok", "Bound to Ctrl+Shift+B."),
        O("cmd-format-doc", "Format document", "ok", "Bound to Shift+Alt+F."),
        O("cmd-run-tests", "Run tests", "attention", "Shares a shortcut with Run current test.")
      ], [
        R("commands.palette-scope", "Command palette scope", "Which commands the palette offers.", "select", "Enabled for this project", "setting"),
        R("commands.custom", "Custom commands", "Commands you defined yourself.", "number", 3, "status"),
        R("commands.conflicts", "Shortcut conflicts", "Commands sharing one shortcut need a resolution.", "number", 1, "diagnostic"),
        R("commands.dry-run", "Dry-run a command", "Preview what a command would do without sending work to an agent.", "action", "Dry-run", "action")
      ]),
    F("mcp", "MCP Servers", "plug", "roster", "extensions",
      "Model Context Protocol servers: connection, approval defaults, and progressive tool exposure.",
      [
        O("mcp-context7", "Context7", "ok", "Connected; documentation lookups."),
        O("mcp-local-docs", "Local Docs", "attention", "Disabled after two failed starts; repair available."),
        O("mcp-github", "GitHub", "ok", "Connected; issue and pull request lookups.")
      ], [
        R("mcp.exposure", "Tool exposure", "Progressive disclosure keeps tool schemas out of every request.", "select", "Progressive", "setting"),
        R("mcp.approvals", "Approval default", "How new MCP tool calls are approved.", "select", "Ask once per session", "setting"),
        R("mcp.repair", "Repair servers", "Restart and re-probe failing servers.", "action", "Repair", "action")
      ]),
    F("skills", "Skills", "spark", "roster", "extensions",
      "Skill packs available to agents. New skills start untrusted and stay opt-in.",
      [
        O("skill-frontend", "Frontend design", "ok", "Trusted; used by design tasks."),
        O("skill-polish", "Polish", "ok", "Trusted; final visual pass."),
        O("skill-audit", "Audit", "attention", "Untrusted; awaiting your review.")
      ], [
        R("skills.trust", "Skill trust default", "New skills start untrusted and ask before first use.", "select", "Ask per skill", "setting"),
        R("skills.eager-load", "Load skills eagerly", "Off keeps requests lean; skills load when needed.", "toggle", false, "setting"),
        R("skills.manage", "Manage skills", "Review, trust, and remove skill packs.", "action", "Manage", "action")
      ]),
    F("plugins", "Plugins", "box", "roster", "extensions",
      "Installed plugins, their update channel, and restart requirements.",
      [
        O("plugin-theme-pack", "Theme Pack Extras", "ok", "Two extra community themes."),
        O("plugin-history-lens", "History Lens", "ok", "Inline file history."),
        O("plugin-csv-viewer", "CSV Viewer", "attention", "Update available on the beta channel.")
      ], [
        R("plugins.channel", "Plugin update channel", "Where plugin updates come from.", "select", "Stable", "setting"),
        R("plugins.auto-update", "Update plugins automatically", "Apply plugin updates when the app is idle.", "toggle", false, "setting"),
        R("plugins.manage", "Manage plugins", "Install, disable, and remove plugins.", "action", "Manage", "action")
      ]),
    F("tools", "Tools", "gauge", "roster", "extensions",
      "The tool inventory: installed, enabled, selected, and invoked — with scoped sets for child agents.",
      [
        O("tool-browser", "Browser Program", "ok", "Puppet Master native browser runtime."),
        O("tool-terminal", "Terminal", "ok", "Shell command execution."),
        O("tool-editor", "Editor", "ok", "File editing with structured patches."),
        O("tool-search", "Search", "ok", "Regex and structural search.")
      ], [
        R("tools.children", "Tool availability for children", "Child agents get scoped tool sets by role.", "select", "Scoped by role", "setting"),
        R("tools.schemas", "Expose installed schemas by default", "Off keeps requests lean.", "toggle", false, "setting"),
        R("tools.inventory", "Tool inventory", "Installed, enabled, selected, and invoked tools.", "text", "31 tools available", "status")
      ]),
    F("testing", "Testing & Debug", "check", "preference", "planning",
      "Evidence strength, automatic test runs, and debug visibility for finished work.",
      null, [
        R("testing.strength", "Evidence strength", "How much proof a finished task needs.", "select", "Standard", "setting"),
        R("testing.autotest", "Run tests after edits", "Automated tests run when code changes.", "toggle", true, "setting"),
        R("testing.debug-visibility", "Debug session visibility", "Whether automated debug sessions surface in the interface.", "select", "Visible when active", "setting"),
        R("testing.matrix", "Test matrix", "Configured test runs per evidence level.", "action", "View matrix", "action")
      ]),
    F("storage", "Storage & Retention", "database", "catalog", "system",
      "Where durable data lives, split honestly into internal snapshots, settings backup, project backup, full Server backup, and workspace cleanup — each with its own retention.",
      null, [
        R("storage.mode", "Storage mode", "Where Puppet Master keeps its durable data.", "select", "Home server", "setting"),
        R("storage.classes", "Backup classes", "Internal snapshots, settings backup, project backup, and full Server backup are separate classes with separate retention.", "text", "4 classes", "status"),
        R("storage.snapshots", "Internal snapshots", "Automatic snapshots of working state used for rollback.", "number", 12, "status"),
        R("storage.cleanup-link", "Workspace cleanup", "Reclaimable space is handled by Workspace Cleanup, never by backup.", "action", "Open Workspace Cleanup", "action"),
        R("storage.telemetry", "Telemetry", "No usage data leaves your machine unless enabled.", "toggle", false, "setting")
      ]),
    F("backup", "Backup & Restore", "upload", "catalog", "system",
      "Settings backup, project backup, and full Server backup with schedules, verification, and test restores.",
      null, [
        R("backup.now", "Back up now", "Run a settings backup immediately. One-shot action, not a schedule.", "action", "Back up now", "action"),
        R("backup.schedule", "Backup schedule", "How often settings backups run on their own.", "select", "Weekly", "setting"),
        R("backup.last", "Last backup", "Newest completed settings backup.", "text", "14 days ago", "status"),
        R("backup.verify", "Verify backups", "Check that stored backups can actually be read back.", "toggle", true, "setting"),
        R("backup.test-restore", "Test restore", "Restore the latest backup into a scratch copy and verify it.", "action", "Run test restore", "action")
      ]),
    F("lifecycle", "Settings Lifecycle", "refresh", "transaction", "system",
      "Export, import, merge with conflict preview, legacy migration, reset, and rollback — every step receipted.",
      null, [
        R("lifecycle.export", "Export settings", "Write current settings to a portable file.", "action", "Export", "action"),
        R("lifecycle.import", "Import settings", "Preview every incoming change before anything is applied.", "action", "Import", "action"),
        R("lifecycle.conflicts", "Conflict preview", "Incoming values that clash with current settings get an explicit keep-or-take choice.", "text", "Preview before merge", "status"),
        R("lifecycle.legacy", "Legacy migration", "Old-format settings migrate forward with a receipt for every mapping.", "action", "Check for legacy files", "action"),
        R("lifecycle.reset", "Reset all settings", "Full preview first; the reset itself is a separate confirmed step.", "action", "Preview reset", "action"),
        R("lifecycle.rollback", "Rollback point", "Restore settings to the state before the last import.", "text", "Snapshot from 2 days ago", "status")
      ]),
    F("history", "History & Sessions", "clock", "catalog", "system",
      "Thread and session retention with honest redaction.",
      null, [
        R("history.threads", "Keep thread history", "How long full threads stay addressable.", "select", "Forever", "setting"),
        R("history.goal-transcripts", "Keep transcripts after Goals", "Goal transcripts remain readable after completion.", "toggle", true, "setting"),
        R("history.redact", "Redact sensitive values", "Scrub likely secrets from stored history.", "toggle", true, "setting"),
        R("history.export", "Export history", "Export retained history for one thread or Goal.", "action", "Export", "action")
      ]),
    F("artifacts", "Runtime Artifacts", "download", "catalog", "system",
      "Where agent-produced artifacts land, how long they stay, and who they belong to.",
      null, [
        R("artifacts.location", "Artifact location", "Where agent-produced artifacts are stored.", "select", "Project artifacts folder", "setting"),
        R("artifacts.identity", "Artifact identity", "Puppet Master owned artifacts carry PM identity; provider-native artifacts keep their origin. Both stay distinguishable in receipts.", "text", "PM-owned and provider-native", "status"),
        R("artifacts.retention", "Artifact retention", "When unreferenced artifacts are cleaned up.", "select", "30 days", "setting"),
        R("artifacts.browse", "Browse artifacts", "Open the artifact store for this project.", "action", "Browse", "action")
      ]),
    F("scm", "Source Control & Worktrees", "branch", "catalog", "branching",
      "Worktree provisioning, cleanup after merge, and port collision behavior.",
      null, [
        R("scm.provision", "Worktree provisioning", "Automatic worktrees for parallel work.", "select", "Auto", "setting"),
        R("scm.cleanup", "Worktree cleanup", "When merged worktrees are removed.", "select", "After merge", "setting"),
        R("scm.ports", "Port collision behavior", "What happens when a port is taken.", "select", "Auto-shift to a free port", "setting"),
        R("scm.status", "Active worktrees", "Worktrees currently provisioned for this project.", "number", 2, "status")
      ]),
    F("gha", "GitHub Actions", "globe", "catalog", "extensions",
      "Workflow runs observed for this project: approvals, logs, and re-runs stay on GitHub.",
      null, [
        R("gha.watch", "Watch workflow runs", "Show GitHub Actions runs for this project inside Puppet Master.", "toggle", true, "setting"),
        R("gha.notify", "Notify on failure", "Title-bar notice when a watched run fails.", "toggle", true, "setting"),
        R("gha.approvals", "Approval handling", "Environment approvals are opened on GitHub; Puppet Master only surfaces the pending state.", "text", "Opens on GitHub", "status"),
        R("gha.recent", "Recent runs", "Watched workflow runs in the last seven days.", "number", 5, "status")
      ]),
    F("containers", "Containers & Registries", "box", "roster", "system",
      "Container tools share the installation lifecycle but keep their own capability probes.",
      [
        O("ctr-docker", "Docker Desktop", "ok", "Running; images build locally."),
        O("ctr-podman", "Podman", "attention", "Installed but the daemon is not running."),
        O("ctr-ghcr", "Container registry", "ok", "Signed in; pulls allowed.")
      ], [
        R("containers.default", "Default container tool", "Which tool builds and runs images by default.", "select", "Docker Desktop", "setting"),
        R("containers.registry-auth", "Registry sign-in", "Registries are authenticated per tool, never shared.", "text", "1 registry signed in", "status"),
        R("containers.probe", "Probe capabilities", "Each tool reports what it can actually do on this host.", "action", "Probe now", "action")
      ]),
    F("web", "Web, Search & Fetch", "globe", "preference", "web",
      "Web search and page fetching with timeouts, extraction, and human-only auth browsing.",
      null, [
        R("web.provider", "Web search provider", "Where web searches run.", "select", "Built-in", "setting"),
        R("web.timeout", "Fetch timeout", "Give up on slow pages.", "select", "30 seconds", "setting"),
        R("web.readability", "Readability extraction", "Strip page chrome before summarizing.", "toggle", true, "setting"),
        R("web.auth-browsing", "Auth browsing", "Sign-in pages are human-only: agents cannot drive or read them.", "text", "Human only", "status")
      ]),
    F("searchindex", "Project Search Index", "search", "health", "system",
      "The local index that keeps code search fast. Rebuilds run in phases and never block editing.",
      null, [
        R("searchindex.enabled", "Project search index", "Keeps code search fast.", "toggle", true, "setting"),
        R("searchindex.status", "Index status", "Current indexing phase for this project.", "text", "Up to date — 8,412 files", "status"),
        R("searchindex.rebuild", "Rebuild index", "Phased rebuild; editing is never blocked.", "action", "Rebuild", "action"),
        R("searchindex.excluded", "Excluded paths", "Paths the index never reads.", "text", "4 patterns", "setting")
      ]),
    F("cleanup", "Workspace Cleanup", "trash", "transaction", "system",
      "Reclaim space with a dry-run first. Worktrees and protected paths are never touched without an explicit choice.",
      null, [
        R("cleanup.dry-run", "Dry-run first", "Cleanup always previews what it would remove before removing anything.", "text", "Required", "status"),
        R("cleanup.protected", "Protected paths", "Worktrees, uncommitted work, and configured paths are never cleaned automatically.", "text", "5 protected paths", "setting"),
        R("cleanup.reclaimable", "Reclaimable space", "Caches, stale artifacts, and old downloads found in the last scan.", "text", "2.1 GB found", "status"),
        R("cleanup.run", "Run cleanup", "Preview, then remove what you approve.", "action", "Preview cleanup", "action")
      ]),
    F("media", "Media & Output", "sun", "preference", "media",
      "How generated media is stored, named, and exported.",
      null, [
        R("media.location", "Media location", "Where generated images and audio are stored.", "select", "Project media folder", "setting"),
        R("media.naming", "File naming", "Naming scheme for generated media.", "select", "Date plus topic", "setting"),
        R("media.export", "Export media", "Copy selected media to a folder you choose.", "action", "Export", "action")
      ]),
    F("dry", "DRY Method", "copy", "catalog", "extensions",
      "Visible reuse state: where work was reused, what it saved, and the opt-outs you chose.",
      null, [
        R("dry.enabled", "DRY Method", "Detect reusable work and offer reuse instead of redoing it.", "toggle", true, "setting"),
        R("dry.detections", "Reuse detections", "Places where existing work was reused this week.", "number", 14, "status"),
        R("dry.savings", "Reported savings", "Work skipped through reuse this week.", "text", "About 3.5 hours", "status"),
        R("dry.opt-outs", "Opt-outs", "Detections you marked as not reusable.", "number", 2, "status"),
        R("dry.review", "Review detections", "See each reuse detection with its source and outcome.", "action", "Review", "action")
      ]),
    F("onboarding", "Product Onboarding", "star", "setup", "general",
      "First-run setup: provider connections, defaults, and the tour. Insertion reserved for the Product Onboarding plan owner.",
      null, [
        R("onboarding.status", "Setup status", "Which first-run steps are complete.", "text", "4 of 5 steps complete", "status"),
        R("onboarding.resume", "Resume setup", "Continue from the first incomplete step.", "action", "Resume", "action"),
        R("onboarding.tour", "Tour", "Short guided tour of the workspace.", "action", "Start tour", "action")
      ]),
    F("updates", "App & Content Updates", "download", "setup", "system",
      "Puppet Master application and content updates, host-scoped and signed — separate from provider, language-server, and container tool updates.",
      null, [
        R("updates.channel", "Update channel", "How early you receive new versions.", "select", "Stable", "setting"),
        R("updates.auto", "Install updates automatically", "Apply updates when the app is idle.", "toggle", true, "setting"),
        R("updates.check", "Check for updates", "Ask the official channel whether a newer signed build exists.", "action", "Check now", "action"),
        R("updates.whats-new", "Release notes", "Brief summary after an update.", "toggle", false, "setting")
      ]),
    F("servers", "Servers", "link", "setup", "system",
      "Known servers and execution hosts. Manager grammar reserved; the Server Backbone owns the real module.",
      null, [
        R("servers.home", "Home server", "Connection state of the home server.", "text", "Connected", "status"),
        R("servers.processing", "Processing on this server", "Whether work may run on the connected server.", "toggle", true, "setting"),
        R("servers.open", "Open server shell", "Deep link into the reserved server module.", "action", "Open", "action")
      ]),
    F("hosting", "Project Hosting & Files", "upload", "setup", "system",
      "Where this project is hosted and where its files live. Insertion reserved for Project Syncing and Updates.",
      null, [
        R("hosting.location", "Hosting location", "Where this project is hosted.", "text", "Home server, projects volume", "status"),
        R("hosting.files", "Project files", "Where project files live on the hosting volume.", "text", "Synced 12 minutes ago", "status"),
        R("hosting.move", "Move project", "Relocate hosting with a full preview and receipts.", "action", "Move", "action")
      ])
  ];

  function P(id, name, icon, state, authKind, accounts, installations, models, limits, logs, updatePolicy, readiness) {
    return {
      id: id, name: name, icon: icon, state: state, authKind: authKind,
      accounts: accounts, installations: installations, models: models,
      limits: limits, logs: logs, updatePolicy: updatePolicy, readiness: readiness
    };
  }
  function A(id, label, health, preferred, enabled, sticky) {
    return { id: id, label: label, health: health, preferred: preferred, enabled: enabled, sticky: sticky };
  }
  function I(id, label, owner, confidence, host, selected, shadowed) {
    return { id: id, label: label, owner: owner, confidence: confidence, host: host, selected: selected, shadowed: shadowed };
  }
  function M(id, label, free, effort, context) {
    return { id: id, label: label, free: free, effort: effort, context: context };
  }

  var providers = [
    P("openai-cli", "OpenAI CLI", "robot", "Found, authenticated, and ready", "pm-direct-oauth",
      [A("openai-cli-main", "Personal OpenAI account", "ok", true, true, true)],
      [I("openai-cli-desktop", "OpenAI CLI 0.9.4", "pm-managed", "high", "Desktop — Windows 11", true, false)],
      [M("gpt-5-2", "GPT-5.2", false, "High", "400k"), M("gpt-5-2-mini", "GPT-5.2 mini", false, "Medium", "400k")],
      { rpm: 500, tpm: 30000000, rpd: 20000, used: "42%" },
      ["CLI found at the official install path", "OAuth completed through Puppet Master", "Probe succeeded in 412 ms"],
      "ask-first", ["cli-found", "authenticated", "probe-ok"]),
    P("anthropic-cli", "Anthropic CLI", "robot", "Found but not signed in", "cli-owned-oauth",
      [A("anthropic-main", "Anthropic account", "attention", true, true, false)],
      [I("anthropic-desktop", "Claude CLI 1.0.88", "pm-managed", "high", "Desktop — Windows 11", true, false)],
      [M("claude-sonnet-4-5", "Claude Sonnet 4.5", false, "High", "200k")],
      { rpm: 300, tpm: 12000000, rpd: 8000, used: "0%" },
      ["CLI found at the official install path", "Sign-in must complete inside the Claude CLI flow"],
      "ask-first", ["cli-found", "sign-in-required"]),
    P("openai-multi", "OpenAI CLI (two installations)", "robot", "Two installations found; one selected, one shadowed", "pm-direct-oauth",
      [A("openai-multi-main", "Personal OpenAI account", "ok", true, true, true)],
      [I("openai-multi-official", "OpenAI CLI 0.9.4 (official)", "pm-managed", "high", "Desktop — Windows 11", true, false),
       I("openai-multi-npm", "OpenAI CLI 0.7.2 (npm global)", "unknown", "medium", "Desktop — Windows 11", false, true)],
      [M("gpt-5-2", "GPT-5.2", false, "High", "400k")],
      { rpm: 500, tpm: 30000000, rpd: 20000, used: "38%" },
      ["Two installations detected", "Official install selected; npm global copy shadowed"],
      "ask-first", ["cli-found", "authenticated", "probe-ok", "shadowed-installation"]),
    P("gemini", "Gemini CLI", "robot", "Installed; owner unknown, manual management only", "manual",
      [A("gemini-main", "Google account", "ok", true, true, false)],
      [I("gemini-unknown", "Gemini CLI 0.4.1", "unknown", "low", "Desktop — Windows 11", true, false)],
      [M("gemini-3-pro", "Gemini 3 Pro", false, "High", "1M")],
      { rpm: 200, tpm: 8000000, rpd: 5000, used: "12%" },
      ["Origin of this installation could not be determined", "Updates and repair are manual only"],
      "manual-only", ["cli-found", "owner-unknown", "manual-only"]),
    P("codex", "Codex CLI", "robot", "Not installed", "pm-direct-oauth",
      [A("codex-none", "No account connected", "attention", false, false, false)],
      [],
      [M("codex-mini", "Codex mini", false, "Medium", "196k")],
      { rpm: 0, tpm: 0, rpd: 0, used: "n/a" },
      ["Not installed. Install explicitly from the official source for the exact Host/Environment."],
      "ask-first", ["not-installed", "explicit-install-required"]),
    P("openai-update", "OpenAI CLI (update available)", "robot", "Ready; update available, waiting for approval", "pm-direct-oauth",
      [A("openai-upd-main", "Personal OpenAI account", "ok", true, true, true)],
      [I("openai-upd-official", "OpenAI CLI 0.9.4", "pm-managed", "high", "Desktop — Windows 11", true, false)],
      [M("gpt-5-2", "GPT-5.2", false, "High", "400k")],
      { rpm: 500, tpm: 30000000, rpd: 20000, used: "51%" },
      ["Update 0.9.5 verified against the official source", "Install policy is ask-first; nothing happens until you approve"],
      "ask-first", ["cli-found", "authenticated", "probe-ok", "update-available"]),
    P("openai-scheduled", "OpenAI CLI (scheduled update)", "robot", "Ready; update scheduled for the next idle window", "pm-direct-oauth",
      [A("openai-sched-main", "Work OpenAI account", "ok", true, true, true)],
      [I("openai-sched-official", "OpenAI CLI 0.9.4", "pm-managed", "high", "Desktop — Windows 11", true, false)],
      [M("gpt-5-2", "GPT-5.2", false, "High", "400k")],
      { rpm: 500, tpm: 30000000, rpd: 20000, used: "27%" },
      ["Update 0.9.5 approved", "Scheduled: applies when the app is idle"],
      "scheduled-when-idle", ["cli-found", "authenticated", "probe-ok", "update-scheduled"]),
    P("openai-rollback", "OpenAI CLI (rollback)", "robot", "Ready on the previous generation after rollback", "pm-direct-oauth",
      [A("openai-rb-main", "Personal OpenAI account", "ok", true, true, true)],
      [I("openai-rb-official", "OpenAI CLI 0.9.4 (restored)", "pm-managed", "high", "Desktop — Windows 11", true, false)],
      [M("gpt-5-2", "GPT-5.2", false, "High", "400k")],
      { rpm: 500, tpm: 30000000, rpd: 20000, used: "44%" },
      ["Update 0.9.5 applied", "Verification failed after update", "Previous generation restored; receipt kept"],
      "ask-first", ["cli-found", "authenticated", "probe-ok", "rolled-back"]),
    P("claude-oauth", "Claude CLI (Max profile)", "robot", "Signed in through the CLI-owned OAuth flow", "cli-owned-oauth",
      [A("claude-max", "Claude Max profile", "attention", true, true, true)],
      [I("claude-oauth-desktop", "Claude CLI 1.0.88", "pm-managed", "high", "Desktop — Windows 11", true, false)],
      [M("claude-opus-4-5", "Claude Opus 4.5", false, "High", "200k"), M("claude-sonnet-4-5", "Claude Sonnet 4.5", false, "High", "200k")],
      { rpm: 300, tpm: 12000000, rpd: 8000, used: "96%" },
      ["Sign-in completed inside the Claude CLI flow", "Max included usage nearly exhausted; reset at 5:00 PM"],
      "ask-first", ["cli-found", "authenticated", "probe-ok", "usage-near-limit"]),
    P("openai-oauth", "OpenAI (PM-managed OAuth)", "key", "PM-direct OAuth; tokens refresh automatically", "pm-direct-oauth",
      [A("openai-oauth-main", "OpenAI account via Puppet Master", "ok", true, true, true)],
      [I("openai-oauth-builtin", "OpenAI API connection (built-in)", "pm-managed", "high", "Desktop — Windows 11", true, false)],
      [M("gpt-5-2", "GPT-5.2", false, "High", "400k")],
      { rpm: 500, tpm: 30000000, rpd: 20000, used: "18%" },
      ["OAuth completed and refreshed by Puppet Master"],
      "ask-first", ["authenticated", "probe-ok"]),
    P("mistral-key", "Mistral (API key)", "key", "API key connected; free tier setup incomplete", "api-key",
      [A("mistral-key-main", "Mistral API key", "ok", true, true, true)],
      [I("mistral-api", "Mistral API connection", "pm-managed", "high", "Desktop — Windows 11", true, false)],
      [M("mistral-large", "Mistral Large", false, "High", "128k"), M("codestral", "Codestral", false, "Medium", "256k")],
      { rpm: 100, tpm: 4000000, rpd: 3000, used: "9%" },
      ["API key verified", "Free-tier account step started but not finished"],
      "ask-first", ["key-connected", "setup-incomplete"]),
    P("opencode-server", "OpenCode (external server)", "globe", "External server reachable", "external-server",
      [A("opencode-srv", "OpenCode server session", "ok", true, true, true)],
      [I("opencode-remote", "OpenCode server", "external", "medium", "Home server — Linux", true, false)],
      [M("opencode-router", "OpenCode router", false, "Auto", "varies by route")],
      { rpm: 200, tpm: 10000000, rpd: 6000, used: "31%" },
      ["Server reachable at the configured address", "Owned outside Puppet Master; capability probes only"],
      "manual-only", ["server-reachable", "probe-ok"]),
    P("free-models", "Free Coding Models", "spark", "Catalog available; underlying provider setup required", "none",
      [],
      [],
      [M("qwen3-coder-30b", "Qwen3 Coder 30B (free tier)", true, "Medium", "128k"), M("deepseek-v3", "DeepSeek V3 (free tier)", true, "Medium", "128k")],
      { rpm: 0, tpm: 0, rpd: 0, used: "n/a" },
      ["These rows need an underlying provider connection before they can carry work"],
      "manual-only", ["catalog-ok", "underlying-setup-required"]),
    P("groq-usage", "Groq", "gauge", "Ready; usage details unavailable", "api-key",
      [A("groq-key", "Groq API key", "ok", true, true, true)],
      [I("groq-api", "Groq API connection", "pm-managed", "high", "Desktop — Windows 11", true, false)],
      [M("llama-3-3-70b", "Llama 3.3 70B", true, "Medium", "128k")],
      { rpm: 0, tpm: 0, rpd: 0, used: "unavailable" },
      ["Probe succeeded", "Provider does not expose usage meters; limits shown as unavailable"],
      "ask-first", ["key-connected", "probe-ok", "usage-unavailable"]),
    P("ollama-catalog", "Ollama (local)", "box", "Serving from last-known-good catalog", "none",
      [A("ollama-local", "Local Ollama daemon", "ok", true, true, true)],
      [I("ollama-local", "Ollama 0.5.1", "user-managed", "high", "Desktop — Windows 11", true, false)],
      [M("qwen3-coder-30b", "Qwen3 Coder 30B (local)", true, "Medium", "32k"), M("llama-3-1-8b", "Llama 3.1 8B (local)", true, "Low", "128k")],
      { rpm: 0, tpm: 0, rpd: 0, used: "n/a" },
      ["Catalog refresh failed (offline)", "Serving the last-known-good catalog until the refresh succeeds"],
      "manual-only", ["daemon-running", "catalog-last-known-good"]),
    P("azure-openai", "Azure OpenAI", "database", "Two accounts; fallback order requested versus effective", "api-key",
      [A("azure-prod", "Production deployment", "ok", true, true, true),
       A("azure-dev", "Development deployment", "ok", false, true, false)],
      [I("azure-api", "Azure OpenAI connection", "pm-managed", "high", "Desktop — Windows 11", true, false)],
      [M("gpt-5-2-azure", "GPT-5.2 (Azure)", false, "High", "400k")],
      { rpm: 400, tpm: 20000000, rpd: 15000, used: "63%" },
      ["Requested priority: Production, then Development", "Effective order matches the requested priority"],
      "ask-first", ["key-connected", "probe-ok", "fallback-configured"]),
    P("openrouter-effort", "OpenRouter", "sliders", "Ready; effort varies between Fast and Normal routes", "api-key",
      [A("openrouter-key", "OpenRouter API key", "ok", true, true, true)],
      [I("openrouter-api", "OpenRouter API connection", "pm-managed", "high", "Desktop — Windows 11", true, false)],
      [M("or-gpt-fast", "GPT-5.2 (Fast)", false, "Low", "400k"), M("or-gpt-normal", "GPT-5.2 (Normal)", false, "High", "400k")],
      { rpm: 600, tpm: 40000000, rpd: 25000, used: "22%" },
      ["Fast route uses reduced effort; Normal route uses full effort", "Both routes share one API key"],
      "ask-first", ["key-connected", "probe-ok", "effort-variation"])
  ];

  var deferred = [
    { id: "onboarding", title: "Product Onboarding", owner: "Product Onboarding plan owner",
      insertion: "First-run flow uses the same provider, account, connection, and installation records as Settings; no duplicate secret store; no SQLite.",
      returnContract: "Completed setup returns to the Providers manager with the new connection selected and a continuation receipt for any interrupted step." },
    { id: "installation", title: "Provider CLI Installation", owner: "Provider Lifecycle owner",
      insertion: "Explicit user-triggered install from the official source for the exact Host/Environment, with verification and rollback inside the provider card.",
      returnContract: "Install receipts deep-link back to the provider's installation section; a failed verification returns with the previous generation restored." },
    { id: "server-claim", title: "Server Claim", owner: "Server Backbone",
      insertion: "Claim handshake that binds a server record to this Puppet Master install before any hosted work is offered.",
      returnContract: "A successful claim returns to the Servers card with the claimed server marked connected and a claim receipt." },
    { id: "servers", title: "Servers", owner: "Server Backbone",
      insertion: "Manager grammar reserved under System & Advanced; human-language cards only; deep-link slot reserved for the server shell.",
      returnContract: "Server cards deep-link back into Settings at the matching storage or hosting row with full capability state." },
    { id: "hosting", title: "Project Hosting & Files", owner: "Project Syncing and Updates",
      insertion: "Source Location card (Hosted On, Project Files, Run Work) plus Project Sync status slots.",
      returnContract: "Hosting changes return to the Project Hosting card with sync status and a move receipt." },
    { id: "remote-access", title: "Remote Access", owner: "Server Backbone",
      insertion: "Pairing and session approvals; protected auth browsing sessions remain human-only.",
      returnContract: "Approvals return to the Remote Access card with the session list updated; no Settings state is invented here." },
    { id: "sync-move", title: "Sync & Move", owner: "Project Syncing and Updates",
      insertion: "Project relocation and sync bundles owned by the sync pipeline; Settings only surfaces status and entry points.",
      returnContract: "A finished move returns to Settings Lifecycle with the relocated project's settings re-verified and conflicts, if any, queued for review." },
    { id: "updates", title: "App & Content Updates", owner: "Project Syncing and Updates",
      insertion: "Host-scoped signed Puppet Master updates, separate from provider, source-control, language-server, and container tool updates.",
      returnContract: "Update status cards deep-link into the Updates manager with signed-build receipts." },
    { id: "server-backup", title: "Full Server Backup", owner: "Server Backbone",
      insertion: "Full Server backup class alongside settings backup and project backup, with its own schedule and verification.",
      returnContract: "Backup runs return to the Backup manager's server class with verification receipts and the last-run state." }
  ];

  var sourceProjects = [
    { id: "support-bot", name: "Customer Support Bot", updated: "2026-08-17",
      summary: "Support triage assistant with strict permissions and a tuned notification policy.",
      counts: { general: 6, ai: 9, safety: 12, code: 4, memory: 7, planning: 3, branching: 2, media: 1, web: 3, personas: 4, extensions: 6, system: 5 } },
    { id: "nova-platform", name: "Nova Platform", updated: "2026-08-15",
      summary: "Platform monorepo with heavy code tooling, formatter ownership, and container builds.",
      counts: { general: 4, ai: 6, safety: 8, code: 15, memory: 5, planning: 6, branching: 7, media: 2, web: 2, personas: 2, extensions: 11, system: 9 } },
    { id: "ledger-service", name: "Ledger Service", updated: "2026-08-12",
      summary: "Financial ledger API with exhaustive evidence requirements and pinned audit memory.",
      counts: { general: 3, ai: 5, safety: 10, code: 9, memory: 8, planning: 8, branching: 3, media: 0, web: 1, personas: 3, extensions: 4, system: 7 } },
    { id: "docs-site", name: "Docs Site", updated: "2026-08-09",
      summary: "Documentation site with media output defaults and a writing-focused persona.",
      counts: { general: 7, ai: 3, safety: 4, code: 5, memory: 3, planning: 2, branching: 2, media: 6, web: 4, personas: 5, extensions: 3, system: 2 } },
    { id: "data-pipeline", name: "Data Pipeline", updated: "2026-08-04",
      summary: "Nightly data pipeline with scheduled Goals and conservative update policies.",
      counts: { general: 2, ai: 7, safety: 6, code: 8, memory: 4, planning: 9, branching: 4, media: 1, web: 2, personas: 1, extensions: 5, system: 8 } },
    { id: "mobile-app", name: "Mobile App", updated: "2026-07-28",
      summary: "Cross-platform mobile app with worktree-heavy branching and device testing.",
      counts: { general: 5, ai: 4, safety: 7, code: 12, memory: 3, planning: 5, branching: 8, media: 3, web: 2, personas: 2, extensions: 7, system: 4 } }
  ];

  function E(rid, type, label, path, dest, keywords, note) {
    var e = { rid: rid, type: type, label: label, path: path, dest: dest, keywords: keywords };
    if (note) e.note = note;
    return e;
  }

  function searchEntries() {
    var list = [];

    // Manager entries — one per family (42).
    var managers = [
      ["providers", "Provider Manager", "Accounts, models, installations, and update lifecycle"],
      ["context", "Context & Instructions", "Instruction chain, admission, and context budget"],
      ["memory", "Memory Manager", "Half-life, verification, pinning, and gist health"],
      ["personas", "Personas Manager", "Behavior capsules and per-thread selection"],
      ["goal", "Goal & Automation", "Long-running Goals, phases, and autonomy"],
      ["crew", "Crew Manager", "Team templates, roles, and route policy"],
      ["permissions", "Permissions & FileSafe", "Ordered rules, last match wins, FileSafe floor"],
      ["bsd", "Back Seat Driver", "Read-only advisory mode: Off, Auto, On"],
      ["notifications", "Notifications Manager", "Title-bar surface and event routing"],
      ["sounds", "Sounds & Packs", "Mappings, PeonPing and OpenPeon pack import"],
      ["appearance", "Appearance Manager", "Eight themes, custom TOML, reduced motion"],
      ["spellcheck", "Spellcheck & Dictionaries", "Underline-only checking and dictionaries"],
      ["desktop", "Desktop, Tray & Window", "Tray, close behavior, quit confirmation"],
      ["teacher", "Teacher", "Plain-language explanations on demand"],
      ["doctor", "Doctor", "Health checks across the whole install"],
      ["files", "File Manager & Editor", "Reload, autosave, encoding, line endings"],
      ["terminal", "Terminal Manager", "Shell, integration, scrollback"],
      ["lsp", "Language Servers", "Detected servers, diagnostics, repair"],
      ["formatters", "Formatters Manager", "Format-on-save and per-language ownership"],
      ["commands", "Commands & Shortcuts", "Palette, custom commands, conflicts"],
      ["mcp", "MCP Servers", "Connections, approvals, tool exposure"],
      ["skills", "Skills Manager", "Trust, loading, and skill packs"],
      ["plugins", "Plugins Manager", "Installed plugins and update channel"],
      ["tools", "Tool Inventory", "Installed, enabled, selected, invoked"],
      ["testing", "Testing & Debug", "Evidence strength and test automation"],
      ["storage", "Storage & Retention", "Four backup classes and workspace cleanup"],
      ["backup", "Backup & Restore", "Settings, project, and server backups"],
      ["lifecycle", "Settings Lifecycle", "Export, import, merge, migrate, reset, rollback"],
      ["history", "History & Sessions", "Retention and redaction"],
      ["artifacts", "Runtime Artifacts", "Artifact location, identity, retention"],
      ["scm", "Source Control & Worktrees", "Provisioning, cleanup, ports"],
      ["gha", "GitHub Actions", "Watched runs and failure notices"],
      ["containers", "Containers & Registries", "Docker, Podman, registry sign-in"],
      ["web", "Web, Search & Fetch", "Providers, timeouts, readability"],
      ["searchindex", "Project Search Index", "Index status and phased rebuilds"],
      ["cleanup", "Workspace Cleanup", "Dry-run first, protected paths"],
      ["media", "Media & Output", "Generated media location and export"],
      ["dry", "DRY Method", "Reuse detections, savings, opt-outs"],
      ["onboarding", "Product Onboarding", "First-run setup steps"],
      ["updates", "App & Content Updates", "Signed host-scoped app updates"],
      ["servers", "Servers", "Home server and execution hosts"],
      ["hosting", "Project Hosting & Files", "Source location and project files"]
    ];
    managers.forEach(function (m) {
      var fam = null;
      families.forEach(function (f) { if (f.id === m[0]) fam = f; });
      list.push(E("sr:manager:" + m[0], "manager", m[1], [CAT[fam.domain], m[1]],
        { kind: "manager", manager: m[0] }, [m[1].toLowerCase(), m[2].toLowerCase(), m[0]]));
    });

    // Managed-object entries, including the duplicate-label cases.
    list.push(E("sr:object:claude-oauth.rate-limits", "managed_object", "Rate Limits", [CAT.ai, "Claude CLI (Max profile)"],
      { kind: "manager", manager: "providers", object: "claude-oauth", section: "limits" }, ["rate limits", "claude", "usage", "cap"], "Max included usage 96% used; resets at 5:00 PM"));
    list.push(E("sr:object:openai-cli.rate-limits", "managed_object", "Rate Limits", [CAT.ai, "OpenAI CLI"],
      { kind: "manager", manager: "providers", object: "openai-cli", section: "limits" }, ["rate limits", "openai", "tokens", "cap"], "Combined request and token caps for the OpenAI CLI account"));
    list.push(E("sr:object:providers.context-window-setting", "managed_object", "Context Window", [CAT.ai, "Provider Manager"],
      { kind: "manager", manager: "providers", section: "models" }, ["context window", "context budget", "tokens"], "Default context budget applied to new connections"));
    list.push(E("sr:object:openai-cli.gpt-5-2", "managed_object", "Context Window", [CAT.ai, "OpenAI CLI"],
      { kind: "manager", manager: "providers", object: "openai-cli", section: "models", row: "gpt-5-2" }, ["context window", "gpt-5.2", "400k"], "GPT-5.2 model row: 400k context"));
    list.push(E("sr:object:anthropic-cli.sign-in", "managed_object", "Anthropic Sign-in", [CAT.ai, "Anthropic CLI"],
      { kind: "manager", manager: "providers", object: "anthropic-cli", section: "accounts" }, ["sign in", "oauth", "claude"], "Sign-in must complete inside the CLI-owned OAuth flow"));
    list.push(E("sr:object:free-models.underlying", "managed_object", "Underlying Setup", [CAT.ai, "Free Coding Models"],
      { kind: "manager", manager: "providers", object: "free-models", section: "setup" }, ["free models", "setup required"], "Free model rows need an underlying provider connection first"));
    list.push(E("sr:object:ollama-catalog.refresh", "managed_object", "Catalog Refresh", [CAT.ai, "Ollama (local)"],
      { kind: "manager", manager: "providers", object: "ollama-catalog", section: "catalog" }, ["catalog", "refresh", "last-known-good"], "Refresh failed offline; serving last-known-good catalog"));
    list.push(E("sr:object:azure-openai.fallback", "managed_object", "Account Priority & Fallback", [CAT.ai, "Azure OpenAI"],
      { kind: "manager", manager: "providers", object: "azure-openai", section: "accounts" }, ["priority", "fallback", "azure"], "Requested versus effective account order"));
    list.push(E("sr:object:openrouter-effort.routes", "managed_object", "Fast and Normal Routes", [CAT.ai, "OpenRouter"],
      { kind: "manager", manager: "providers", object: "openrouter-effort", section: "models" }, ["fast", "normal", "effort"], "Same key, two effort levels"));

    // Action entries.
    list.push(E("sr:action:backup.now", "action", "Back Up Now", [CAT.system, "Backup & Restore"],
      { kind: "manager", manager: "backup", row: "backup.now" }, ["backup", "back up now"], "One-shot settings backup"));
    list.push(E("sr:action:lifecycle.import", "action", "Import Settings", [CAT.system, "Settings Lifecycle"],
      { kind: "manager", manager: "lifecycle", row: "lifecycle.import" }, ["import", "merge", "conflict preview"]));
    list.push(E("sr:action:lifecycle.reset", "action", "Reset All Settings", [CAT.system, "Settings Lifecycle"],
      { kind: "manager", manager: "lifecycle", row: "lifecycle.reset" }, ["reset", "factory"], "Preview first; apply is a separate step"));

    // Setup / repair workflow entries.
    list.push(E("sr:setup:codex.install", "setup", "Install Codex CLI", [CAT.ai, "Codex CLI"],
      { kind: "manager", manager: "providers", object: "codex", section: "install" }, ["install", "codex", "official source"], "Explicit install from the official source for the exact Host/Environment"));
    list.push(E("sr:setup:lsp.repair", "setup", "Repair Language Servers", [CAT.code, "Language Servers"],
      { kind: "manager", manager: "lsp", row: "lsp.repair" }, ["repair", "language server", "restart"], "Python server crashed twice today"));
    list.push(E("sr:setup:mcp.repair-local-docs", "setup", "Repair Local Docs Server", [CAT.extensions, "MCP Servers"],
      { kind: "manager", manager: "mcp", object: "mcp-local-docs" }, ["repair", "mcp", "local docs"], "Disabled after two failed starts"));
    list.push(E("sr:setup:backup.test-restore", "setup", "Backup Test Restore", [CAT.system, "Backup & Restore"],
      { kind: "manager", manager: "backup", row: "backup.test-restore" }, ["test restore", "verify backup"], "Restore into a scratch copy and verify; receipted"));

    // Diagnostic entries.
    list.push(E("sr:diag:doctor.health", "diagnostic", "Overall Health", [CAT.system, "Doctor"],
      { kind: "manager", manager: "doctor", row: "doctor.overall" }, ["health", "status"], "Healthy with 2 advisories"));
    list.push(E("sr:diag:storage.integrity", "diagnostic", "Storage Integrity Check", [CAT.system, "Storage & Retention"],
      { kind: "manager", manager: "storage", section: "integrity" }, ["integrity", "storage", "verify"]));
    list.push(E("sr:diag:memory.gist-health", "diagnostic", "Assistant Gist Health", [CAT.memory, "Memory Manager"],
      { kind: "manager", manager: "memory", row: "memory.gist-health" }, ["gists", "degrading", "rebuild"], "Two gists stale; rebuild available"));

    // Unavailable capability entries.
    list.push(E("sr:unavailable:sync", "unavailable", "Settings Sync", [CAT.system, "Not available"],
      null, ["sync", "cloud sync"], "This product keeps settings on your machines and servers; there is no cloud sync service"));
    list.push(E("sr:unavailable:profiles", "unavailable", "Settings Profiles", [CAT.system, "Not available"],
      null, ["profiles", "switch profiles"], "Profiles are not part of this product; use export and import instead"));
    list.push(E("sr:unavailable:inheritance", "unavailable", "Inherited Settings", [CAT.system, "Not available"],
      null, ["inherit", "inheritance", "hierarchy"], "No inheritance chains: every value is owned by this project"));
    list.push(E("sr:unavailable:groq.usage-dashboard", "unavailable", "Groq Usage Dashboard", [CAT.ai, "Groq"],
      { kind: "manager", manager: "providers", object: "groq-usage", section: "limits" }, ["usage", "groq", "meters"], "Provider does not expose usage meters"));

    return list;
  }

  window.PMManagers2Data = {
    families: families,
    providers: providers,
    deferred: deferred,
    sourceProjects: sourceProjects,
    searchEntries: searchEntries
  };
})();
