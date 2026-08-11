(function () {
  "use strict";

  function S(id, label, desc, type, value, source, extra) {
    var s = { id: id, label: label, desc: desc, type: type, value: value, source: source || "default", tier: "standard", scope: "Global" };
    if (extra) Object.keys(extra).forEach(function (k) { s[k] = extra[k]; });
    return s;
  }

  var destinations = [
    {
      id: "general", title: "General", icon: "sliders",
      purpose: "Startup, defaults, language, and updates.",
      status: { kind: "ok", summary: "Defaults healthy" },
      subcategories: [
        {
          id: "startup", title: "Startup", settings: [
            S("general.startup.behavior", "Launch behavior", "What Puppet Master shows when it starts.", "select", "Restore last workspace", "default", { options: ["Restore last workspace", "Start fresh", "Open a specific page"], recommended: "Restore last workspace", keywords: ["boot", "launch", "restore", "reopen"] }),
            S("general.startup.confirm-quit", "Confirm before quitting", "Ask before closing the app while work is running.", "toggle", true, "default", { keywords: ["quit", "exit", "close"] }),
            S("general.startup.drafts", "Restore unsaved drafts", "Reopen draft messages and documents after a restart.", "toggle", true, "default", { keywords: ["draft", "recover"] }),
            S("general.startup.diagnostics", "Startup diagnostics", "Run health checks while the app opens.", "select", "Auto", "default", { options: ["Auto", "Full", "Off"], tier: "advanced", keywords: ["health", "boot check"] })
          ]
        },
        {
          id: "defaults", title: "Defaults", settings: [
            S("general.defaults.project", "Default project", "Project used for new threads when none is chosen.", "select", "PuppetMaster", "inherited", { options: ["PuppetMaster", "ConceptHub", "Slint Port"], inheritedFrom: "Global default", scope: "Project", keywords: ["workspace", "project"] }),
            S("general.defaults.model", "Model for new threads", "Route used when a thread starts without an explicit model.", "select", "Claude Sonnet 4.5", "custom", { options: ["Claude Sonnet 4.5", "GPT-5.2", "Gemini 3 Pro", "Qwen3 Coder 30B (local)"], keywords: ["default model", "route"] }),
            S("general.defaults.effort", "Effort for new threads", "Reasoning effort applied when the selected model supports it.", "select", "Auto", "default", { options: ["Auto", "Minimal", "Low", "Medium", "High"], keywords: ["reasoning", "thinking"] }),
            S("general.defaults.access", "Access mode", "Ceiling for what agents may do without asking.", "select", "Full Access", "custom", { options: ["Ask for approval", "Auto accept edits", "Auto", "Full Access"], recommended: "Full Access", effect: "safety", keywords: ["yolo", "permissions", "approval"] }),
            S("general.defaults.speed", "Normal or Fast preference", "Used only when the selected model genuinely supports a Fast variant.", "segment", "Auto", "default", { options: ["Auto", "Normal", "Fast"], keywords: ["fast mode", "speed"] })
          ]
        },
        {
          id: "language", title: "Language & Writing", settings: [
            S("general.language.ui", "Interface language", "Language of menus, labels, and notices.", "select", "Automatic", "default", { options: ["Automatic", "English", "Deutsch", "Français", "日本語"], keywords: ["locale", "translation"] }),
            S("general.language.spellcheck", "Check spelling", "Quietly underlines likely misspellings in prose you write. Never replaces words automatically.", "toggle", true, "default", { keywords: ["spell", "underline", "writing"] }),
            S("general.language.spell-lang", "Spellcheck language", "Language used for spelling suggestions.", "select", "Automatic", "default", { options: ["Automatic", "English (US)", "English (UK)", "Deutsch"], keywords: ["dictionary language"] }),
            S("general.language.dict-source", "Dictionary source", "Where spelling lookups come from.", "select", "Automatic", "default", { options: ["Automatic", "System dictionaries only", "PM local dictionaries only"], tier: "advanced", recommended: "Automatic", keywords: ["hunspell", "os service"] }),
            S("general.language.personal-dict", "Personal dictionary", "Words you added yourself.", "action", "Manage", "default", { actionLabel: "Manage", keywords: ["learned words"] }),
            S("general.language.project-dict", "Project dictionary", "Shared project word list, when one exists.", "select", "Use when available", "default", { options: ["Use when available", "Off"], keywords: ["team dictionary"] }),
            S("general.language.grammar", "Grammar and style assistance", "A separate feature from spellcheck. Provider-backed assistance is off by default and discloses route, cost, and privacy before use.", "toggle", false, "default", { effect: "privacy", keywords: ["grammar", "style", "rewrite", "tone"] }),
            S("general.language.tech-prose", "Check technical prose", "Underline likely misspellings inside technical writing. Code, paths, and identifiers are always skipped.", "toggle", false, "default", { tier: "advanced", keywords: ["technical", "literal"] }),
            S("general.language.unknown-names", "Underline unknown names", "Names are often flagged wrongly; keep them quiet by default.", "toggle", false, "default", { tier: "advanced", keywords: ["names", "proper nouns"] }),
            S("general.language.lang-packs", "Additional language packs", "Installed dictionaries beyond the active language.", "action", "Manage", "default", { actionLabel: "Manage", tier: "advanced", keywords: ["dictionaries", "languages"] }),
            S("general.language.overrides", "Thread and project overrides", "Per-thread disables and per-project dictionary choices.", "action", "Manage", "default", { actionLabel: "Manage", tier: "advanced", keywords: ["thread override", "project dictionary"] })
          ]
        },
        {
          id: "updates", title: "Updates", settings: [
            S("general.updates.channel", "Update channel", "How early you receive new versions.", "select", "Stable", "default", { options: ["Stable", "Beta"], keywords: ["version", "beta"] }),
            S("general.updates.auto", "Install updates automatically", "Apply updates when the app is idle.", "toggle", true, "default", { keywords: ["upgrade"] }),
            S("general.updates.whatsnew", "Show release notes on launch", "Brief summary after an update.", "toggle", false, "custom", { keywords: ["changelog", "notes"] })
          ]
        }
      ]
    },
    {
      id: "appearance", title: "Appearance & Input", icon: "sun",
      purpose: "Theme, layout, motion, and input feel.",
      status: { kind: "ok", summary: "Friendly Dark" },
      subcategories: [
        {
          id: "theme-layout", title: "Theme & Layout", settings: [
            S("appearance.theme.family", "Theme", "The whole app look, applied instantly.", "select", "Friendly Dark", "custom", { options: ["Friendly Dark", "Friendly Light", "Glass Dark", "Glass Light", "Retro Dark", "Retro Light", "Basic Dark", "Basic Light"], keywords: ["skin", "dark mode", "light mode", "friendly", "glass", "retro", "basic"] }),
            S("appearance.theme.mode", "Theme mode", "Light, Dark, or follow the system.", "segment", "Auto", "custom", { options: ["Light", "Dark", "Auto"], keywords: ["appearance mode"] }),
            S("appearance.layout.density", "Layout density", "Spacing across panels and lists.", "segment", "Cozy", "custom", { options: ["Comfortable", "Cozy", "Compact"], keywords: ["spacing", "compact"] }),
            S("appearance.layout.rail", "Show left rail", "The navigation rail beside the workspace.", "toggle", true, "default", { keywords: ["sidebar", "navigation"] }),
            S("appearance.layout.transparency", "Window transparency", "Translucent surfaces where the theme supports them.", "toggle", true, "default", { tier: "advanced", keywords: ["glass", "blur"] })
          ]
        },
        {
          id: "motion", title: "Motion", settings: [
            S("appearance.motion.level", "Motion level", "How much animation the interface uses.", "select", "Full", "default", { options: ["Full", "Balanced", "Minimal"], keywords: ["animation", "transitions"] }),
            S("appearance.motion.system", "Honor system reduced motion", "Follow the OS accessibility preference automatically.", "toggle", true, "default", { recommended: "On", keywords: ["accessibility", "vestibular"] }),
            S("appearance.motion.panels", "Panel transitions", "Animate panels opening and closing.", "toggle", true, "default", { keywords: ["slide", "drawer"] }),
            S("appearance.motion.ambient", "Ambient background motion", "Slow decorative movement in Glass themes.", "toggle", true, "default", { tier: "advanced", keywords: ["parallax", "wallpaper"] })
          ]
        },
        {
          id: "input", title: "Input & Shortcuts", settings: [
            S("appearance.input.keyboard", "Full keyboard navigation", "Reach every control without a mouse.", "toggle", true, "default", { keywords: ["focus", "tab order"] }),
            S("appearance.input.palette", "Command palette shortcut", "Key combination that opens quick commands.", "text", "Command K", "custom", { keywords: ["hotkey", "launcher"] }),
            S("appearance.input.rename", "Double-click to rename", "Rename items in place.", "toggle", true, "default", { keywords: ["inline edit"] }),
            S("appearance.input.shortcuts", "Keyboard shortcuts", "Browse and remap shortcuts.", "action", "Manage", "default", { actionLabel: "Manage", keywords: ["bindings", "keys"] })
          ]
        }
      ]
    },
    {
      id: "models", title: "Agents, Models & Providers", icon: "robot",
      purpose: "Providers, accounts, models, agent roles, and Personas.",
      status: { kind: "attention", summary: "1 provider needs attention" },
      subcategories: [
        {
          id: "providers", title: "Providers", manager: "providers", settings: [
            S("models.providers.refresh", "Catalog refresh", "models.dev and Free Coding Models refresh continuously in the background.", "action", "Last checked 8 min ago", "default", { actionLabel: "Refresh now", keywords: ["models.dev", "catalog", "refresh"] })
          ]
        },
        {
          id: "agent-roles", title: "Agent Roles", settings: [
            S("models.roles.main", "Main Assistant", "Primary route for Assistant Chat.", "select", "Claude Sonnet 4.5", "default", { options: ["Claude Sonnet 4.5", "GPT-5.2", "Gemini 3 Pro"], keywords: ["assistant", "chat model"] }),
            S("models.roles.planning", "Planning conversation", "User-facing PRD Builder and Planning Wizard discussion. Must stay a high-quality conversational route.", "select", "Claude Sonnet 4.5", "default", { options: ["Claude Sonnet 4.5", "Claude Opus 4.5", "GPT-5.2"], recommended: "Claude Sonnet 4.5", effect: "quality", keywords: ["prd", "wizard", "high quality"] }),
            S("models.roles.goal-worker", "Goal worker", "Route for Goal children and subagents.", "select", "Grok Code Fast 1", "custom", { options: ["GPT-5.2", "Claude Sonnet 4.5", "Grok Code Fast 1"], requested: "Grok Code Fast 1", effective: "GPT-5.2", reason: "Requested route has no connected account; using next eligible route.", keywords: ["subagent", "worker"] }),
            S("models.roles.verifier", "Verifier and Auditor", "Independent verification passes.", "select", "Claude Opus 4.5", "default", { options: ["Claude Opus 4.5", "Claude Sonnet 4.5", "GPT-5.2"], keywords: ["audit", "certify"] }),
            S("models.roles.vision", "Vision and media analysis", "Analyzes images and attachments.", "select", "Gemini 3 Pro", "default", { options: ["Gemini 3 Pro", "GPT-5.2", "Claude Sonnet 4.5"], keywords: ["image", "attachment"] }),
            S("models.roles.compression", "Compression", "Context maintenance and summaries.", "select", "Claude Haiku 4.5", "default", { options: ["Claude Haiku 4.5", "GPT-5.2 mini"], keywords: ["compact", "summary"] }),
            S("models.roles.web", "Web extraction", "Fetches and distills web pages.", "select", "GPT-5.2 mini", "default", { options: ["GPT-5.2 mini", "Claude Haiku 4.5"], keywords: ["fetch", "browse"] }),
            S("models.roles.approval", "Approval review", "Reviews risky actions before asking you.", "select", "Claude Sonnet 4.5", "default", { options: ["Claude Sonnet 4.5", "GPT-5.2"], keywords: ["safety review"] })
          ]
        },
        {
          id: "personas", title: "Personas", manager: "personas", settings: [
            S("models.personas.default", "Persona for new threads", "Behavior capsule applied when a thread starts.", "select", "Assistant", "default", { options: ["Assistant", "Collaborator", "General", "Overseer"], keywords: ["character", "behavior"] }),
            S("models.personas.scope", "Persona selection scope", "Choosing a Persona in Chat applies to the current thread only.", "select", "This thread", "default", { options: ["This turn", "This thread", "This Goal", "Project default", "Global default"], keywords: ["thread local"] })
          ]
        },
        {
          id: "model-defaults", title: "Model Defaults", settings: [
            S("models.defaults.effort", "Effort when supported", "Default reasoning effort for models that expose it.", "select", "Auto", "default", { options: ["Auto", "Minimal", "Low", "Medium", "High"], keywords: ["reasoning effort"] }),
            S("models.defaults.fast", "Normal or Fast preference", "Applied only when a real Fast variant exists for the model.", "segment", "Auto", "default", { options: ["Auto", "Normal", "Fast"], keywords: ["fast"] }),
            S("models.defaults.hide-legacy", "Auto-hide legacy models", "Keep the model menu focused on current models.", "toggle", true, "default", { keywords: ["deprecated"] }),
            S("models.defaults.capabilities", "Capability evidence", "How capability support is decided.", "select", "Catalog plus observed use", "default", { tier: "advanced", options: ["Catalog only", "Catalog plus observed use", "Probe everything"], keywords: ["probe", "evidence"] })
          ]
        },
        {
          id: "continuation", title: "Continuation", settings: [
            S("models.continuation.anthropic-max", "Anthropic Max — what happens next", "Included usage on the Max profile is exhausted. Choose how requests continue.", "select", "Ask each time", "not-configured", { options: ["Stop and wait for reset", "Use extra usage", "Use paid usage after plan", "Switch to the API connection", "Switch account", "Ask each time"], effect: "cost", keywords: ["usage exhausted", "run out", "budget"] }),
            S("models.continuation.openai", "OpenAI — what happens next", "When the ChatGPT Pro allowance tightens.", "select", "Use paid usage after plan", "custom", { options: ["Stop and wait", "Use paid usage after plan", "Switch account", "Ask each time"], effect: "cost", keywords: ["overage"] }),
            S("models.continuation.reset", "At reset or cooldown", "Behavior when a provider enters cooldown.", "select", "Switch provider temporarily", "default", { options: ["Wait for reset", "Switch provider temporarily", "Ask each time"], keywords: ["rate limit", "cooldown"] })
          ]
        }
      ]
    },
    {
      id: "safety", title: "Permissions & Safety", icon: "shield",
      purpose: "Approvals, FileSafe, sandboxes, and access scope.",
      status: { kind: "ok", summary: "Full Access ceiling" },
      subcategories: [
        {
          id: "access", title: "Access & Approvals", settings: [
            S("safety.access.mode", "Access mode", "Highest autonomy agents may reach.", "select", "Full Access", "custom", { options: ["Ask for approval", "Auto accept edits", "Auto", "Full Access"], effect: "safety", keywords: ["autonomy", "ceiling"] }),
            S("safety.access.dialogs", "Approval dialogs", "Compact dialogs with a Details expansion.", "select", "Compact with Details", "default", { options: ["Compact with Details", "Full context"], keywords: ["prompt", "confirm"] }),
            S("safety.access.safe-reads", "Safe reads without approval", "Plan and Review may use safe read, research, and diagnostic tools.", "toggle", true, "default", { recommended: "On", keywords: ["plan mode", "review", "read-only"] }),
            S("safety.access.duration", "Approval duration", "How long a granted approval lasts.", "select", "This session", "default", { options: ["Once", "This session", "Persistent for this tool"], keywords: ["grant", "remember"] })
          ]
        },
        {
          id: "filesafe", title: "FileSafe", settings: [
            S("safety.filesafe.enabled", "FileSafe protection", "Guards protected files and risky writes. Enforced outside the model.", "toggle", true, "default", { recommended: "On", effect: "safety", keywords: ["guard", "protect"] }),
            S("safety.filesafe.paths", "Protected paths", "Files and folders FileSafe watches.", "action", "12 protected paths", "default", { actionLabel: "Manage", keywords: ["protected files"] }),
            S("safety.filesafe.patterns", "Block dangerous patterns", "Stop writes that match known-dangerous patterns.", "toggle", true, "default", { keywords: ["destructive"] }),
            S("safety.filesafe.outside", "Allow writes outside the project", "Lets agents modify files beyond the project root.", "toggle", false, "default", { tier: "expert", effect: "safety", risky: true, keywords: ["escape", "outside"] })
          ]
        },
        {
          id: "sandboxes", title: "Sandboxes & Network", settings: [
            S("safety.sandbox.bash", "Sandbox for shell commands", "Isolation applied to Bash-like tools.", "select", "Auto", "default", { options: ["Auto", "Always sandbox", "Never"], keywords: ["bash", "isolation"] }),
            S("safety.sandbox.network", "Network egress", "Outbound network access for agent work.", "select", "Allowlist", "custom", { options: ["Deny", "Allowlist", "Allow"], effect: "privacy", keywords: ["egress", "firewall"] }),
            S("safety.sandbox.cross-project", "Cross-project access", "Reading or writing another project needs an explicit grant.", "select", "Off unless granted", "default", { options: ["Off unless granted", "Ask per project pair"], effect: "privacy", keywords: ["grant", "other project"] }),
            S("safety.sandbox.inherit", "Children inherit grants", "Scoped grants may pass to child agents.", "toggle", false, "default", { tier: "advanced", keywords: ["subagent grant"] })
          ]
        }
      ]
    },
    {
      id: "code", title: "Code & Editor", icon: "code",
      purpose: "Editor, terminal, languages, and shell.",
      status: { kind: "ok", summary: "LSP healthy" },
      subcategories: [
        {
          id: "editor", title: "Editor", settings: [
            S("code.editor.fontsize", "Editor font size", "Base size for code text.", "select", "13", "default", { options: ["11", "12", "13", "14", "16"], keywords: ["font"] }),
            S("code.editor.autosave", "Autosave", "Save changes as you type.", "toggle", true, "default", { keywords: ["save"] }),
            S("code.editor.format", "Format on save", "Which formatter runs, if any.", "select", "LSP formatter", "custom", { options: ["Off", "PM formatter", "LSP formatter"], keywords: ["prettier", "style"] }),
            S("code.editor.diff", "Inline diff review", "Show agent edits as diffs before applying.", "toggle", true, "default", { keywords: ["review edits"] })
          ]
        },
        {
          id: "terminal", title: "Terminal", manager: "terminal", settings: [
            S("code.terminal.fontsize", "Terminal font size", "Base size for terminal text.", "select", "13", "inherited", { options: ["11", "12", "13", "14"], inheritedFrom: "Default profile", keywords: ["font"] }),
            S("code.terminal.integration", "Shell integration", "Richer output when the shell supports it.", "toggle", true, "default", { restart: true, keywords: ["marks", "prompt"] })
          ]
        },
        {
          id: "languages", title: "Languages & LSP", manager: "lsp", settings: [
            S("code.lsp.autodetect", "Detect languages automatically", "Enable language support as files appear.", "toggle", true, "default", { keywords: ["language server"] }),
            S("code.lsp.diagnostics", "Show diagnostics", "Where editor problems appear.", "select", "Inline and panel", "default", { options: ["Inline only", "Panel only", "Inline and panel"], keywords: ["errors", "warnings"] }),
            S("code.lsp.format-owner", "Formatting ownership", "Who owns formatting when both exist.", "select", "LSP", "default", { options: ["LSP", "PM", "Ask"], keywords: ["formatter"] })
          ]
        },
        {
          id: "shell", title: "Shell & Commands", settings: [
            S("code.shell.palette-scope", "Command palette scope", "Which commands the palette offers.", "select", "Enabled for this project", "default", { options: ["All installed", "Enabled for this project"], keywords: ["palette"] }),
            S("code.shell.custom", "Custom commands", "Commands you defined.", "action", "6 custom commands", "default", { actionLabel: "Manage", keywords: ["aliases"] }),
            S("code.shell.conflicts", "Shortcut conflicts", "Two commands share one shortcut.", "action", "1 conflict", "custom", { actionLabel: "Resolve", attention: true, keywords: ["collision", "binding"] })
          ]
        }
      ]
    },
    {
      id: "context", title: "Context & Memory", icon: "brain",
      purpose: "What enters each request, and what is remembered.",
      status: { kind: "ok", summary: "Compaction on" },
      subcategories: [
        {
          id: "assembly", title: "Context Assembly", settings: [
            S("context.assembly.chats", "Use relevant previous chats", "Retrieve related history from prior threads.", "toggle", true, "default", { keywords: ["retrieval", "history"] }),
            S("context.assembly.code", "Use relevant project code", "Admit code the current task touches.", "toggle", true, "default", { keywords: ["code context"] }),
            S("context.assembly.logs", "Use relevant logs", "Admit runtime logs when useful.", "toggle", false, "default", { tier: "advanced", keywords: ["log context"] }),
            S("context.assembly.instructions", "Include scoped project instructions", "AGENTS.md chain, scoped by location.", "toggle", true, "default", { keywords: ["agents.md", "rules"] }),
            S("context.assembly.handoff", "Include parent-agent handoff", "Child agents receive a compact handoff.", "toggle", true, "default", { keywords: ["subagent context"] }),
            S("context.assembly.journal", "Include attempt journal", "Recent attempt outcomes for the current task.", "toggle", false, "default", { tier: "advanced", keywords: ["journal"] })
          ]
        },
        {
          id: "compaction", title: "Compaction & Cache", settings: [
            S("context.compaction.auto", "Compact automatically", "Compress context when it grows large.", "toggle", true, "default", { recommended: "On", keywords: ["compact now", "compression"] }),
            S("context.compaction.warn", "Warn before material context changes", "Notify when cache or context route will change.", "toggle", true, "default", { keywords: ["cache loss", "warning"] }),
            S("context.compaction.cache", "Cache reuse strategy", "How prompt cache reuse is preserved. PM decides until you pick an explicit strategy.", "select", "Auto", "auto", { options: ["Auto", "Prefer stability", "Prefer reuse"], tier: "advanced", keywords: ["prompt cache"] }),
            S("context.compaction.now", "Compact now", "Run a compression pass on the current thread.", "action", "Thread at 42% of window", "default", { actionLabel: "Compact", keywords: ["shrink"] })
          ]
        },
        {
          id: "retention", title: "History & Retention", settings: [
            S("context.retention.threads", "Keep thread history", "How long full threads stay addressable.", "select", "Forever", "default", { options: ["Forever", "1 year", "90 days"], keywords: ["history"] }),
            S("context.retention.goal-transcripts", "Keep transcripts after Goals", "Goal transcripts remain readable after completion.", "toggle", true, "default", { keywords: ["goal history"] }),
            S("context.retention.redact", "Redact sensitive values", "Scrub likely secrets from stored history.", "toggle", true, "default", { effect: "privacy", recommended: "On", keywords: ["secrets", "privacy"] })
          ]
        },
        {
          id: "instructions", title: "Instruction Sources", manager: "context-sources", settings: [
            S("context.instructions.chain", "Instruction chain", "Scoped AGENTS.md files admitted last turn.", "action", "2 files in chain", "default", { actionLabel: "Inspect", tier: "advanced", keywords: ["agents.md chain", "precedence"] }),
            S("context.instructions.persona-footprint", "Persona footprint", "Personas add a bounded capsule, never the full source.", "toggle", true, "default", { tier: "advanced", keywords: ["capsule"] })
          ]
        },
        {
          id: "memory", title: "Assistant Memory", manager: "memory", settings: [
            S("context.memory.halflife", "Memory half-life", "Fading means leaving active recall — not deletion or truth decay.", "select", "Balanced", "default", { options: ["Long", "Balanced", "Short"], tier: "advanced", keywords: ["decay", "fade"] }),
            S("context.memory.verify", "Require verification", "New memories wait for review before full trust.", "toggle", true, "default", { keywords: ["evidence"] }),
            S("context.memory.scope", "Default memory scope", "Where new memories attach.", "select", "Project", "default", { options: ["Project", "Global"], keywords: ["scope"] })
          ]
        }
      ]
    },
    {
      id: "planning", title: "Planning, Crew & Automation", icon: "target",
      purpose: "Goal Mode, planning routes, Crew, and guards.",
      status: { kind: "ok", summary: "Goal ceilings set" },
      subcategories: [
        {
          id: "goal-mode", title: "Goal Mode", settings: [
            S("planning.goal.concurrency", "Configured concurrency ceiling", "Most children a Goal may request. Current sustainable concurrency is read-only operational state sourced from Usage — it is not a second setting.", "select", "8", "custom", { options: ["2", "4", "8", "12"], operational: "Sustainable now: 2 (from Usage)", keywords: ["parallel", "agents"] }),
            S("planning.goal.reserve", "Reserve for synthesis and verification", "Keep capacity for parent synthesis, testing, and repair.", "toggle", true, "default", { recommended: "On", keywords: ["reserve"] }),
            S("planning.goal.checkpoints", "Automatic checkpoints", "Save progress at phase boundaries.", "toggle", true, "default", { keywords: ["resume"] }),
            S("planning.goal.worktree", "Worktree isolation", "How Goal work gets its own working tree.", "select", "Auto", "default", { options: ["Auto", "Ask", "Never"], keywords: ["git worktree"] }),
            S("planning.goal.low-usage", "When usage runs low", "How Goals react to shrinking capacity.", "select", "Run smaller waves", "default", { options: ["Run smaller waves", "Pause and wait", "Ask"], keywords: ["capacity", "waves"] })
          ]
        },
        {
          id: "planning-routes", title: "Planning Routes", settings: [
            S("planning.routes.conversation", "Planning conversation route", "User-facing discussion stays high quality.", "select", "High-quality route", "default", { options: ["High-quality route", "Explicit override"], recommended: "High-quality route", effect: "quality", keywords: ["wizard", "prd"] }),
            S("planning.routes.extraction", "Background extraction route", "Bounded extraction may use cheaper routes.", "select", "Cheapest eligible", "default", { options: ["Cheapest eligible", "Same as conversation"], keywords: ["extract"] }),
            S("planning.routes.integration", "Final integration route", "Synthesis and final assembly stay high quality.", "select", "High-quality route", "default", { options: ["High-quality route", "Explicit override"], keywords: ["synthesis"] }),
            S("planning.routes.research", "Research route", "Bounded research children.", "select", "GPT-5.2 mini", "custom", { options: ["GPT-5.2 mini", "Claude Haiku 4.5", "Same as conversation"], keywords: ["research"] })
          ]
        },
        {
          id: "crew", title: "Crew Templates", manager: "crew", settings: [
            S("planning.crew.policy", "Default route policy", "Whether Crews may adapt routes under capacity.", "select", "Adaptive", "default", { options: ["Adaptive", "Strict"], keywords: ["crew policy"] }),
            S("planning.crew.scope", "Crew selection scope", "Crew choices apply to the current thread or Goal.", "select", "This thread", "default", { options: ["This thread", "This Goal"], keywords: ["thread local"] })
          ]
        },
        {
          id: "worktrees", title: "Worktrees & Git", settings: [
            S("planning.worktrees.provision", "Worktree provisioning", "Automatic worktrees for parallel work.", "select", "Auto", "default", { options: ["Auto", "Ask", "Never"], keywords: ["branch", "isolation"] }),
            S("planning.worktrees.cleanup", "Worktree cleanup", "When merged worktrees are removed.", "select", "After merge", "default", { options: ["After merge", "Manual"], keywords: ["prune"] }),
            S("planning.worktrees.ports", "Port collision behavior", "What happens when a port is taken.", "select", "Auto-shift to a free port", "default", { options: ["Auto-shift to a free port", "Ask"], keywords: ["port", "dev server"] })
          ]
        },
        {
          id: "verification", title: "Verification & Testing", settings: [
            S("planning.verify.strength", "Evidence strength", "How much proof a finished task needs.", "select", "Standard", "default", { options: ["Standard", "Strong", "Exhaustive"], keywords: ["certify", "evidence"] }),
            S("planning.verify.autotest", "Run tests after edits", "Automated tests run when code changes.", "toggle", true, "default", { keywords: ["test run"] }),
            S("planning.verify.debug-visibility", "Debug session visibility", "Whether automated debug sessions surface in the UI.", "select", "Visible when active", "default", { options: ["Visible when active", "Always visible", "Hidden"], tier: "advanced", keywords: ["debug"] }),
            S("planning.verify.repair-limit", "Repair attempts", "Maximum automatic repair passes.", "select", "2", "default", { options: ["1", "2", "3"], keywords: ["retry"] })
          ]
        },
        {
          id: "guards", title: "Automation Guards", settings: [
            S("planning.guards.spend", "Spend guard", "Stops automation at a spending threshold.", "select", "Not configured", "not-configured", { options: ["Not configured", "Off", "Per Goal", "Daily"], effect: "cost", keywords: ["budget", "cost cap"] }),
            S("planning.guards.time", "Time guard", "Stops Goals that exceed a wall-clock budget.", "select", "Off", "default", { options: ["Off", "2 hours", "8 hours"], keywords: ["timeout"] }),
            S("planning.guards.usage", "Usage guard", "Consult Usage forecasts before admitting children.", "toggle", true, "default", { recommended: "On", keywords: ["forecast"] }),
            S("planning.guards.reset-aware", "Reset timing awareness", "Forecasts account for provider resets.", "toggle", true, "default", { keywords: ["reset window"] })
          ]
        }
      ]
    },
    {
      id: "extensions", title: "Extensions & Integrations", icon: "puzzle",
      purpose: "MCP, skills, plugins, tools, and web.",
      status: { kind: "attention", summary: "1 MCP server error" },
      subcategories: [
        {
          id: "mcp", title: "MCP Servers", manager: "mcp", settings: [
            S("extensions.mcp.exposure", "Tool exposure", "Progressive disclosure keeps tool schemas out of every request.", "select", "Progressive", "default", { options: ["Progressive", "Expose all"], tier: "advanced", recommended: "Progressive", keywords: ["schemas", "lazy"] }),
            S("extensions.mcp.approvals", "Approval default for MCP tools", "How new MCP tool calls are approved.", "select", "Ask once per session", "default", { options: ["Ask every time", "Ask once per session", "Allow listed tools"], keywords: ["permissions"] })
          ]
        },
        {
          id: "skills", title: "Skills & Plugins", manager: "skills", settings: [
            S("extensions.skills.trust", "Skill trust default", "New skills start untrusted.", "select", "Ask per skill", "default", { options: ["Ask per skill", "Trust project skills"], keywords: ["trust"] }),
            S("extensions.plugins.channel", "Plugin update channel", "Where plugin updates come from.", "select", "Stable", "default", { options: ["Stable", "Beta"], keywords: ["updates"] })
          ]
        },
        {
          id: "tools", title: "Tools & Commands", settings: [
            S("extensions.tools.children", "Tool availability for children", "Child agents get scoped tool sets.", "select", "Scoped by role", "default", { options: ["Scoped by role", "Same as parent"], tier: "advanced", keywords: ["subagent tools"] }),
            S("extensions.tools.schemas", "Expose installed schemas by default", "Off keeps requests lean.", "toggle", false, "default", { tier: "advanced", keywords: ["schema bloat"] }),
            S("extensions.tools.inventory", "Tool inventory", "Installed, enabled, selected, and invoked tools.", "action", "31 tools available", "default", { actionLabel: "Open inventory", keywords: ["tool list"] })
          ]
        },
        {
          id: "web", title: "Web & Search", settings: [
            S("extensions.web.provider", "Web search provider", "Where web searches run.", "select", "Built-in", "default", { options: ["Built-in", "MCP search server"], keywords: ["search"] }),
            S("extensions.web.timeout", "Fetch timeout", "Give up on slow pages.", "select", "30 seconds", "default", { options: ["15 seconds", "30 seconds", "60 seconds"], keywords: ["timeout"] }),
            S("extensions.web.readability", "Readability extraction", "Strip chrome before summarizing pages.", "toggle", true, "default", { keywords: ["extract"] })
          ]
        }
      ]
    },
    {
      id: "media", title: "Media", icon: "image",
      purpose: "Media providers, input, output, and transformation.",
      status: { kind: "setup", summary: "Audio not configured" },
      subcategories: [
        {
          id: "media-providers", title: "Media Providers", manager: "media", settings: [
            S("media.providers.fallback", "Fallback route", "When the primary media route is unavailable.", "select", "Use alternate configured route", "default", { options: ["Use alternate configured route", "Ask"], keywords: ["fallback"] })
          ]
        },
        {
          id: "media-io", title: "Input & Output", settings: [
            S("media.io.image-input", "Image input handling", "Native model input or PM transformation.", "select", "Auto", "default", { options: ["Auto", "Native", "PM transform"], keywords: ["attachment", "vision"] }),
            S("media.io.audio-input", "Audio input", "No audio route is configured yet.", "select", "Not configured", "not-configured", { options: ["Not configured", "Local transcription", "Provider transcription"], keywords: ["voice", "audio"] }),
            S("media.io.video-output", "Video output", "Video generation needs a configured video route.", "select", "Off", "unavailable", { options: ["Off", "Provider render"], reason: "No video generation route is configured.", keywords: ["video", "motion output"] }),
            S("media.io.location", "Output location", "Where generated media is saved.", "text", "Pictures/PuppetMaster", "custom", { keywords: ["folder", "save"] }),
            S("media.io.format", "Output format", "Default format for generated images.", "select", "PNG", "default", { options: ["PNG", "WebP", "Match source"], keywords: ["format"] })
          ]
        },
        {
          id: "media-transform", title: "Transformation", settings: [
            S("media.transform.fallback", "Unsupported attachment route", "What happens when a model cannot take an attachment.", "select", "Use an alternate model", "default", { options: ["Use an alternate model", "Skip attachment", "Ask"], keywords: ["alternate route"] }),
            S("media.transform.downscale", "Downscale large images", "Shrink huge images before sending.", "toggle", true, "default", { keywords: ["resize"] }),
            S("media.transform.safety", "Media safety policy", "Content policy applied to generation.", "select", "Enforce", "default", { options: ["Enforce", "Report only"], effect: "safety", keywords: ["content policy"] })
          ]
        }
      ]
    },
    {
      id: "system", title: "System & Diagnostics", icon: "activity",
      purpose: "Health, logs, backups, and expert controls.",
      status: { kind: "ok", summary: "All checks passing" },
      subcategories: [
        {
          id: "health", title: "Health", settings: [
            S("system.health.check", "System health checks", "Storage, runtime, and provider reachability.", "action", "Last run 2 h ago", "default", { actionLabel: "Run now", keywords: ["diagnose"] }),
            S("system.health.telemetry", "Telemetry", "No usage data leaves your machine unless enabled.", "toggle", false, "default", { effect: "privacy", keywords: ["analytics"] }),
            S("system.health.diag", "Diagnostic mode", "Verbose internal tracing.", "toggle", false, "default", { tier: "diagnostic", keywords: ["trace"] })
          ]
        },
        {
          id: "logs", title: "Logs", settings: [
            S("system.logs.verbosity", "Log verbosity", "How much the logs record.", "select", "Normal", "default", { options: ["Minimal", "Normal", "Verbose"], keywords: ["debug log"] }),
            S("system.logs.retention", "Log retention", "How long logs are kept.", "select", "30 days", "default", { options: ["7 days", "30 days", "Forever"], keywords: ["rotate"] }),
            S("system.logs.open", "Open logs", "Reveal the current log folder.", "action", "View logs", "default", { actionLabel: "Open", keywords: ["log files"] })
          ]
        },
        {
          id: "backups", title: "Backups & Snapshots", settings: [
            S("system.backups.auto", "Automatic snapshots", "Periodic state snapshots.", "toggle", true, "default", { recommended: "On", keywords: ["snapshot"] }),
            S("system.backups.retention", "Snapshot retention", "How long snapshots are kept.", "select", "30 days", "default", { options: ["7 days", "30 days", "Forever"], keywords: ["prune"] }),
            S("system.backups.pre-risky", "Restore point before risky changes", "Snapshot before migrations and bulk edits.", "toggle", true, "default", { recommended: "On", keywords: ["restore point"] })
          ]
        },
        {
          id: "expert", title: "Expert & Internal", settings: [
            S("system.expert.flags", "Internal feature flags", "Experimental switches. Not for daily use.", "action", "3 flags available", "default", { actionLabel: "Open flags", tier: "expert", risky: true, keywords: ["experimental"] }),
            S("system.expert.storage", "Configuration storage", "Where settings are persisted.", "text", "Managed by Puppet Master", "managed", { managedBy: "Puppet Master runtime", keywords: ["config path"] }),
            S("system.expert.reset", "Reset all settings", "Returns every setting to its default. Cannot be undone.", "action", "Reset", "default", { actionLabel: "Reset all", tier: "expert", risky: true, keywords: ["factory reset"] })
          ]
        }
      ]
    }
  ];

  var providers = [
    {
      id: "anthropic", name: "Anthropic", group: "Connected accounts", state: "attention",
      stateLabel: "Connected — usage exhausted on Max profile",
      accounts: [
        { id: "anthropic-max", label: "Claude CLI — Max profile", nickname: "", authOwner: "Claude CLI", authKind: "CLI-owned OAuth, isolated profile", transport: "Isolated CLI profile", isolation: "Isolated CLI home/config directory", state: "connected", identity: "jared@work", preferred: true, enabled: true, sticky: false, priority: 1, usage: { included: "exhausted", extra: "Extra usage available", reset: "Today 5:00 PM", pressure: "High" }, health: { catalog: "2 min ago", generation: "4 min ago" }, continuationOptions: ["Stop and wait for reset", "Use extra usage", "Use paid usage after plan", "Switch to the API connection", "Ask each time"] },
        { id: "anthropic-api", label: "Anthropic API — Console key", nickname: "Console", authOwner: "API key", authKind: "API credential", transport: "API", isolation: "API credential pool", state: "connected", identity: "Console workspace: Jared", preferred: false, enabled: true, sticky: false, priority: 2, usage: { included: "Pay-as-you-go", pressure: "None" }, health: { catalog: "2 min ago", generation: "1 h ago" }, continuationOptions: ["Stop at budget", "Ask each time"] }
      ],
      preferredAccount: "anthropic-max",
      models: [
        { id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5", favorite: true, alias: "sonnet", priority: 1, effort: ["minimal", "low", "medium", "high"], fast: false, modalities: { in: ["text", "image"], out: ["text"] }, context: "200K", tools: true, mcp: true, structured: true, state: "available", evidence: "Observed use, 4 min ago" },
        { id: "claude-opus-4-5", name: "Claude Opus 4.5", favorite: true, alias: "", priority: 2, effort: ["medium", "high"], fast: false, modalities: { in: ["text", "image"], out: ["text"] }, context: "200K", tools: true, mcp: true, structured: true, state: "available", evidence: "Observed use, 1 h ago" },
        { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", favorite: false, alias: "", priority: 3, effort: [], fast: false, modalities: { in: ["text"], out: ["text"] }, context: "200K", tools: true, mcp: false, structured: true, state: "available", evidence: "Catalog, verified 8 min ago" },
        { id: "claude-opus-4-5-1m", name: "Claude Opus 4.5 (1M context)", favorite: false, alias: "", priority: 9, effort: ["high"], fast: false, modalities: { in: ["text"], out: ["text"] }, context: "1M", tools: true, mcp: true, structured: true, state: "unavailable", reason: "Not included in the Max plan — available through API billing.", evidence: "Account discovery, 2 min ago" }
      ]
    },
    {
      id: "openai", name: "OpenAI", group: "Connected accounts", state: "ready",
      stateLabel: "Connected via PM sign-in",
      accounts: [
        { id: "openai-pm", label: "OpenAI — PM sign-in", nickname: "", authOwner: "Puppet Master", authKind: "PM-direct OAuth", transport: "OAuth", isolation: "PM-managed direct connection", state: "connected", identity: "jared@example.com", preferred: true, enabled: true, sticky: true, priority: 1, usage: { included: "ChatGPT Pro allowance", remaining: "Plenty", reset: "Rolling weekly", pressure: "Low" }, health: { catalog: "8 min ago", generation: "22 min ago" }, continuationOptions: ["Use paid usage after plan", "Switch account", "Ask each time"] }
      ],
      preferredAccount: "openai-pm",
      models: [
        { id: "gpt-5-2", name: "GPT-5.2", favorite: true, alias: "", priority: 1, effort: ["low", "medium", "high"], fast: true, modalities: { in: ["text", "image"], out: ["text", "image"] }, context: "400K", tools: true, mcp: true, structured: true, state: "available", evidence: "Observed use, 22 min ago" },
        { id: "gpt-5-2-mini", name: "GPT-5.2 mini", favorite: false, alias: "mini", priority: 2, effort: [], fast: true, modalities: { in: ["text", "image"], out: ["text"] }, context: "200K", tools: true, mcp: true, structured: true, state: "available", evidence: "Observed use, 3 h ago" }
      ]
    },
    {
      id: "gemini-cli", name: "Gemini CLI", group: "Installed tools & signed-in apps", state: "invocation-failed",
      stateLabel: "Signed in — model invocation failed",
      accounts: [
        { id: "gemini-profile", label: "Gemini CLI — default profile", nickname: "", authOwner: "Gemini CLI", authKind: "CLI-owned Google OAuth", transport: "Isolated CLI profile", isolation: "Isolated CLI home/config directory", state: "authenticated", identity: "jared@gmail.com", preferred: true, enabled: true, sticky: false, priority: 1, usage: { included: "Free tier window", remaining: "Unknown", reset: "Unknown", pressure: "Unknown" }, health: { catalog: "12 min ago", generation: "Never succeeded" }, probe: { result: "failed", detail: "Readiness probe returned resource exhausted (429). Authentication is fine; invocation is not.", at: "12 min ago" }, continuationOptions: ["Retry probe", "Wait for reset", "Ask each time"] }
      ],
      preferredAccount: "gemini-profile",
      models: [
        { id: "gemini-3-pro", name: "Gemini 3 Pro", favorite: false, alias: "", priority: 1, effort: ["low", "high"], fast: false, modalities: { in: ["text", "image"], out: ["text"] }, context: "1M", tools: true, mcp: false, structured: true, state: "unverified", reason: "Invocation check failed — capability evidence is catalog-only until a probe succeeds.", evidence: "Catalog, 12 min ago" }
      ]
    },
    {
      id: "antigravity", name: "Antigravity CLI", group: "Installed tools & signed-in apps", state: "not-installed",
      stateLabel: "Not installed",
      accounts: [],
      models: [],
      install: { available: true, note: "After install, Antigravity uses its own login flow inside an isolated CLI profile. Puppet Master does not offer PM-direct OAuth for Antigravity." }
    },
    {
      id: "codex-cli", name: "Codex CLI", group: "Installed tools & signed-in apps", state: "signed-out",
      stateLabel: "Installed — signed out",
      accounts: [],
      models: [
        { id: "gpt-5-2-codex", name: "GPT-5.2 Codex", favorite: false, alias: "", priority: 1, effort: ["medium", "high"], fast: true, modalities: { in: ["text"], out: ["text"] }, context: "400K", tools: true, mcp: false, structured: true, state: "unverified", reason: "Sign in through the CLI to verify invocation.", evidence: "Catalog only" }
      ],
      login: { note: "Codex CLI uses its own login flow inside an isolated CLI profile. Puppet Master launches the native login and verifies readiness; it never takes your credentials." }
    },
    {
      id: "local-server", name: "Local model server", group: "Server connections", state: "ready",
      stateLabel: "Connected — keyless local endpoint",
      accounts: [
        { id: "local-endpoint", label: "OpenAI-compatible endpoint", nickname: "Ollama", authOwner: "None", authKind: "Keyless local server", transport: "Server", isolation: "Local endpoint, no authentication", state: "connected", identity: "http://127.0.0.1:11434/v1", preferred: true, enabled: true, sticky: false, priority: 1, usage: { included: "Local compute", remaining: "Not metered", pressure: "None" }, health: { catalog: "Just now", generation: "35 min ago" }, continuationOptions: ["Queue on device", "Switch provider"] }
      ],
      preferredAccount: "local-endpoint",
      models: [
        { id: "qwen3-coder-local", name: "Qwen3 Coder 30B (local)", favorite: false, alias: "", priority: 1, effort: [], fast: false, modalities: { in: ["text"], out: ["text"] }, context: "128K", tools: true, mcp: false, structured: false, state: "available", free: "Keyless", evidence: "Observed use, 35 min ago" }
      ]
    },
    {
      id: "mistral-free", name: "Mistral AI (free tier)", group: "Free & community models", state: "needs-setup",
      stateLabel: "Setup required",
      accounts: [],
      models: [
        { id: "mistral-small-free", name: "Mistral Small (free tier)", favorite: false, alias: "", priority: 1, effort: [], fast: false, modalities: { in: ["text"], out: ["text"] }, context: "128K", tools: true, mcp: false, structured: true, state: "needs-setup", reason: "Free but rate-limited and account-required.", evidence: "Catalog via Free Coding Models" }
      ],
      setup: { steps: ["Create a Mistral account", "Create an API key in La Plateforme", "Add the key to a new Mistral connection", "Verify the free-tier quota caveats", "Return to the model row"], note: "Free Models delegates setup and accounting to the underlying provider." }
    }
  ];

  var catalogs = [
    { id: "models-dev", name: "models.dev", state: "idle", lastChecked: "8 min ago", lastActivated: "8 min ago", version: "commit 41c9f2", lastKnownGood: true, materialChanges: [] },
    { id: "free-coding-models", name: "Free Coding Models", state: "idle", lastChecked: "2 h ago", lastActivated: "2 h ago", version: "commit a37e11", lastKnownGood: true, materialChanges: ["Two models are no longer free", "One new keyless endpoint added"] }
  ];

  var roles = [
    { id: "main", label: "Main Assistant", requested: "Claude Sonnet 4.5", effective: "Claude Sonnet 4.5", provider: "Anthropic — Max profile", differs: false },
    { id: "planning", label: "Planning Conversation", requested: "Claude Sonnet 4.5", effective: "Claude Sonnet 4.5", provider: "Anthropic — Max profile", differs: false, note: "High-quality conversational route — required for user-facing planning." },
    { id: "goal", label: "Goal Worker", requested: "Grok Code Fast 1", effective: "GPT-5.2", provider: "OpenAI — PM sign-in", differs: true, note: "Requested route has no connected account." },
    { id: "verifier", label: "Verifier / Auditor", requested: "Claude Opus 4.5", effective: "Claude Opus 4.5", provider: "Anthropic — Max profile", differs: false },
    { id: "vision", label: "Vision / Media Analysis", requested: "Gemini 3 Pro", effective: "GPT-5.2", provider: "OpenAI — PM sign-in", differs: true, note: "Gemini invocation currently failing; using fallback route." },
    { id: "compression", label: "Compression", requested: "Claude Haiku 4.5", effective: "Claude Haiku 4.5", provider: "Anthropic — Max profile", differs: false },
    { id: "web", label: "Web Extraction", requested: "GPT-5.2 mini", effective: "GPT-5.2 mini", provider: "OpenAI — PM sign-in", differs: false },
    { id: "approval", label: "Approval Review", requested: "Claude Sonnet 4.5", effective: "Claude Sonnet 4.5", provider: "Anthropic — Max profile", differs: false },
    { id: "skill-search", label: "Skill Search", requested: "Qwen3 Coder 30B (local)", effective: "Qwen3 Coder 30B (local)", provider: "Local server", differs: false },
    { id: "crew", label: "Subagents / Crew", requested: "Inherit Goal Worker", effective: "GPT-5.2", provider: "OpenAI — PM sign-in", differs: false }
  ];

  var notices = [
    { id: "gemini-probe", kind: "attention", status: "Needs attention", headline: "Gemini CLI is signed in, but model invocation failed", reason: "The readiness probe hit a rate limit. Authentication is fine; the route is unusable until a probe succeeds.", action: "Run diagnostics", secondary: "View connection" },
    { id: "anthropic-usage", kind: "attention", status: "Needs attention", headline: "Anthropic Max included usage is exhausted", reason: "Requests on the Max profile will stop unless a continuation is chosen. Reset is at 5:00 PM.", action: "Choose what happens next", secondary: "View usage" },
    { id: "mcp-docs", kind: "attention", status: "Needs attention", headline: "Local Docs MCP server will not start", reason: "Transport spawn failed twice. The server is disabled until repaired.", action: "View logs", secondary: "Repair" },
    { id: "continue-media", kind: "continue", status: "Continue setup", headline: "Finish audio input setup", reason: "Audio transcription was started but no route was chosen.", action: "Resume setup" },
    { id: "rec-persona", kind: "recommended", status: "Recommended", headline: "Pin a planning Persona", reason: "Planning conversations stay consistent when a Persona is pinned for new Goals.", action: "Open Personas" },
    { id: "rec-snapshot", kind: "recommended", status: "Recommended", headline: "Turn on restore points before risky changes", reason: "Snapshots make migrations and bulk edits reversible.", action: "Enable" }
  ];

  var recents = [
    { id: "r1", label: "Theme", where: "Appearance & Input", when: "2 min ago", target: { category: "appearance", subcategory: "theme-layout", setting: "appearance.theme.family" } },
    { id: "r2", label: "Goal concurrency ceiling", where: "Planning", when: "1 h ago", target: { category: "planning", subcategory: "goal-mode", setting: "planning.goal.concurrency" } },
    { id: "r3", label: "Claude CLI — Max profile", where: "Providers", when: "Yesterday", target: { category: "models", manager: "providers" } }
  ];

  var memory = [
    { id: "m1", text: "Jared prefers a written plan before any build.", state: "verified", pinned: true, scope: "Project", kind: "Preference", halfLife: "Stable", evidence: "3 chats over 2 weeks", versions: 2, accessed: "Today" },
    { id: "m2", text: "Plans/** is canonical; PMConcept7 is the read-only visual baseline.", state: "verified", pinned: true, scope: "Project", kind: "Fact", halfLife: "Stable", evidence: "AGENTS.md + 5 chats", versions: 1, accessed: "Today" },
    { id: "m3", text: "Usage owns measured balances; Settings owns choices.", state: "verified", pinned: false, scope: "Global", kind: "Fact", halfLife: "Stable", evidence: "Usage handoff doc", versions: 1, accessed: "Yesterday" },
    { id: "m4", text: "Prefers concise answers in the CLI, no preamble.", state: "awaiting", pinned: false, scope: "Global", kind: "Preference", halfLife: "Stable", evidence: "1 chat", versions: 1, accessed: "Today" },
    { id: "m5", text: "Liked the Retro theme for demo recordings.", state: "verified", pinned: false, scope: "Project", kind: "Preference", halfLife: "Fading", evidence: "1 chat, 6 weeks ago", versions: 1, accessed: "3 weeks ago" },
    { id: "m6", text: "PMConcept8 was a test artifact and is retired.", state: "verified", pinned: false, scope: "Project", kind: "History", halfLife: "Fading", evidence: "Notes, 2026-08-01", versions: 3, accessed: "2 weeks ago" }
  ];

  var mcpServers = [
    { id: "mcp-github", name: "GitHub MCP", transport: "stdio", protocol: "2025-06-18 (negotiated)", state: "connected", scope: "Global", tools: ["issues.list", "issues.create", "prs.list", "prs.review", "repos.search", "actions.status"], toolCount: 14, approval: "Ask once per session", exposure: "Progressive", freshness: "Healthy, 5 min ago", logs: ["12:04 handshake ok", "12:04 discovered 14 tools", "12:31 tool call issues.list ok"] },
    { id: "mcp-figma", name: "Figma Dev Mode MCP", transport: "http", protocol: "2025-06-18", state: "needs-auth", scope: "Project", tools: [], toolCount: 0, approval: "Ask every time", exposure: "Progressive", freshness: "Not connected", logs: ["11:52 connect requested", "11:52 authorization required"] },
    { id: "mcp-docs", name: "Local Docs", transport: "stdio", protocol: "requested 2025-03-26", state: "error", scope: "Project", tools: [], toolCount: 6, approval: "Ask once per session", exposure: "Progressive", freshness: "Disabled after 2 failures", logs: ["10:12 spawn failed: ENOENT docs-server", "10:18 spawn failed: ENOENT docs-server", "10:18 disabled pending repair"] },
    { id: "mcp-playwright", name: "Playwright MCP", transport: "stdio", protocol: "2025-06-18", state: "disabled", scope: "Global", tools: ["browser.navigate", "browser.click", "browser.snapshot"], toolCount: 9, approval: "Allow listed tools", exposure: "Progressive", freshness: "User-disabled", logs: ["Yesterday disabled by user"] }
  ];

  var crewTemplates = [
    { id: "crew-design", name: "Design Review Crew", purpose: "Five-perspective UI review with synthesis", members: [{ role: "Critic", persona: "Overseer", route: "Claude Sonnet 4.5", candidates: ["Claude Sonnet 4.5", "Claude Opus 4.5"] }, { role: "Accessibility", persona: "Researcher", route: "GPT-5.2", candidates: ["GPT-5.2", "GPT-5.2 mini"] }, { role: "Motion", persona: "Collaborator", route: "Claude Sonnet 4.5", candidates: ["Claude Sonnet 4.5"] }, { role: "Theming", persona: "Collaborator", route: "GPT-5.2", candidates: ["GPT-5.2", "Qwen3 Coder 30B (local)"] }, { role: "Synthesizer", persona: "Overseer", route: "Claude Opus 4.5", candidates: ["Claude Opus 4.5"] }], requested: 5, minMax: "3–5", routePolicy: "Strict", concurrency: 5, guards: { spend: "Per Goal", time: "2 hours" }, reserve: true, worktree: "Shared read-only", ports: "Auto-shift on collision", childDepth: "Members may not spawn children", board: "Shared board", reducer: "Weighted consensus", failure: "Stop on two member failures", capacityNote: "Current usage admits 2 concurrent members; 3 waves forecast." },
    { id: "crew-research", name: "Research Crew", purpose: "Bounded parallel research with one reducer", members: [{ role: "Researcher A", persona: "Deep Researcher", route: "GPT-5.2 mini", candidates: ["GPT-5.2 mini", "Claude Haiku 4.5", "Qwen3 Coder 30B (local)"] }, { role: "Researcher B", persona: "Deep Researcher", route: "GPT-5.2 mini", candidates: ["GPT-5.2 mini", "Claude Haiku 4.5", "Qwen3 Coder 30B (local)"] }, { role: "Synthesizer", persona: "Researcher", route: "Claude Sonnet 4.5", candidates: ["Claude Sonnet 4.5", "GPT-5.2"] }], requested: 3, minMax: "2–3", routePolicy: "Adaptive", concurrency: 3, guards: { spend: "Off", time: "1 hour" }, reserve: true, worktree: "None", ports: "Not needed", childDepth: "1 level of bounded extraction", board: "Off", reducer: "Synthesizer merge", failure: "Replace failed member once", capacityNote: "Fits current capacity." },
    { id: "crew-release", name: "Release Verification Crew", purpose: "Test, verify, and certify a release", members: [{ role: "Tester", persona: "Bash", route: "GPT-5.2", candidates: ["GPT-5.2", "Claude Sonnet 4.5"] }, { role: "Verifier", persona: "Overseer", route: "Claude Opus 4.5", candidates: ["Claude Opus 4.5"] }, { role: "Repair", persona: "General", route: "Claude Sonnet 4.5", candidates: ["Claude Sonnet 4.5", "GPT-5.2"] }, { role: "Certifier", persona: "Overseer", route: "Claude Opus 4.5", candidates: ["Claude Opus 4.5"] }], requested: 4, minMax: "2–4", routePolicy: "Strict", concurrency: 2, guards: { spend: "Per Goal", time: "4 hours" }, reserve: true, worktree: "Isolated per member", ports: "Reserved test port per member", childDepth: "Members may not spawn children", board: "Shared board", reducer: "Certifier decides", failure: "Pause on failure", capacityNote: "Runs as 2 waves of 2." }
  ];

  var lspServers = [
    { id: "lsp-ts", name: "TypeScript / JavaScript", executable: "typescript-language-server", version: "4.3.3", state: "running", scope: "Workspace", startup: "Auto", coverage: "ts, tsx, js, jsx", capabilities: "Diagnostics, formatting, completion, rename", conflicts: "None", health: "Healthy — indexed 214 files", logs: ["12:02 started (workspace)", "12:02 indexed 214 files", "12:09 formatting owned by LSP"] },
    { id: "lsp-python", name: "Python", executable: "pyright-langserver", version: "1.1.392", state: "installed", scope: "Global", startup: "On first matching file", coverage: "py", capabilities: "Diagnostics, completion", conflicts: "None", health: "Idle — not started this session", logs: [] },
    { id: "lsp-rust", name: "Rust", executable: "rust-analyzer", version: "Not installed", state: "not-installed", scope: "Global", startup: "Auto", coverage: "rs", capabilities: "Available after install", conflicts: "None", health: "Not installed", logs: [] },
    { id: "lsp-slint", name: "Slint", executable: "slint-lsp", version: "1.17.1", state: "running", scope: "Workspace", startup: "Auto", coverage: "slint", capabilities: "Diagnostics, preview bridge", conflicts: "None", health: "Healthy", logs: ["12:05 started (workspace)", "12:05 preview bridge ready"] }
  ];

  var terminalProfiles = [
    { id: "term-default", name: "Default", isDefault: true, shell: "Auto-detected (zsh)", font: "PM Mono 13 / 1.4", colors: "Match app theme", palette: ["#2b2f36", "#e5534b", "#57ab5a", "#c69026", "#3b8eea", "#b083f0", "#39adb5", "#d0d7de"], opacity: 100, cursor: "Block", copyOnSelect: false, cwd: "Inherit from workspace", retention: "30 days", startup: "Standard" },
    { id: "term-dev", name: "Dev (Zsh)", isDefault: false, shell: "/bin/zsh — dev rc", font: "PM Mono 13 / 1.5", colors: "Tango-ish", palette: ["#1e1e2e", "#f38ba8", "#a6e3a1", "#f9e2af", "#89b4fa", "#cba6f7", "#94e2d5", "#cdd6f4"], opacity: 92, cursor: "Bar", copyOnSelect: true, cwd: "Project root", retention: "30 days", startup: "With workspace" },
    { id: "term-ci", name: "CI Logs", isDefault: false, shell: "Read-only replay", font: "PM Mono 12 / 1.3", colors: "High contrast", palette: ["#000000", "#ff5555", "#50fa7b", "#f1fa8c", "#bd93f9", "#ff79c6", "#8be9fd", "#f8f8f2"], opacity: 100, cursor: "None", copyOnSelect: true, cwd: "Locked to run", retention: "7 days", startup: "On demand" }
  ];

  var contextSources = {
    admitted: [
      { name: "Project instructions", detail: "AGENTS.md chain, 2 files", tokens: "1.1K" },
      { name: "Relevant code", detail: "12 files from Concepts and Plans", tokens: "18.4K" },
      { name: "Previous chat excerpts", detail: "3 retrieved turns", tokens: "2.2K" },
      { name: "Persona capsule", detail: "Assistant, bounded", tokens: "0.4K" }
    ],
    omitted: [
      { name: "Runtime logs", reason: "Disabled in Context Assembly" },
      { name: "Attempt journal", reason: "Disabled in Context Assembly" },
      { name: "Full thread history", reason: "Never copied wholesale; retrieval only" }
    ],
    chain: [
      { path: "/AGENTS.md", role: "Repository root", admitted: true },
      { path: "/Concepts/AGENTS.md", role: "Concepts scope", admitted: true },
      { path: "/Concepts/settings-redesign-concepts/AGENTS.md", role: "Topic scope", admitted: false, reason: "Not present" }
    ],
    compaction: { strategy: "Rolling summary plus pinned facts", lastRun: "Yesterday", cacheState: "Warm", sourceHash: "9f31c2…a4" }
  };

  var skills = [
    { id: "sk-frontend", name: "frontend-design", scope: "Global", trust: "Trusted", enabled: true, update: "Up to date", permissions: "Read project, write concept files" },
    { id: "sk-ledger", name: "pm-bootstrap-planning-ledger", scope: "Project", trust: "Trusted", enabled: true, update: "Up to date", permissions: "Read/write Plans ledgers" },
    { id: "sk-audit", name: "audit", scope: "Global", trust: "Not trusted yet", enabled: false, update: "Up to date", permissions: "Read project" },
    { id: "sk-animate", name: "animate", scope: "Global", trust: "Trusted", enabled: true, update: "Update available", permissions: "Read project, write CSS" }
  ];

  var plugins = [
    { id: "pl-slint", name: "Slint Preview Bridge", compatibility: "Compatible", channel: "Stable", state: "Enabled", permissions: "Spawn preview process" },
    { id: "pl-legacy", name: "Legacy Ice Panel", compatibility: "Incompatible with this build", channel: "Archived", state: "Failed to load", permissions: "Panel host" }
  ];

  var tools = [
    { name: "Bash", installed: true, projectEnabled: true, available: true, invoked: 214, risk: "High", approval: "Follows access mode" },
    { name: "Edit", installed: true, projectEnabled: true, available: true, invoked: 96, risk: "Medium", approval: "Auto under Full Access" },
    { name: "Read", installed: true, projectEnabled: true, available: true, invoked: 512, risk: "Low", approval: "Safe read" },
    { name: "WebFetch", installed: true, projectEnabled: true, available: true, invoked: 18, risk: "Medium", approval: "Safe research" },
    { name: "Playwright", installed: true, projectEnabled: true, available: false, invoked: 12, risk: "Medium", approval: "Ask once per session", note: "Not selected for this turn" },
    { name: "GitHub MCP tools", installed: true, projectEnabled: true, available: true, invoked: 7, risk: "Medium", approval: "Ask once per session", note: "Owned by GitHub MCP server" }
  ];

  var commands = [
    { name: "Open Settings", shortcut: "Command ,", state: "ok" },
    { name: "Toggle Rail", shortcut: "Command B", state: "ok" },
    { name: "Run Tests", shortcut: "Command Shift T", state: "conflict", note: "Also bound to Open Terminal" }
  ];

  var personas = [
    { id: "p-assistant", name: "Assistant", core: true, description: "Default helpful engineering companion.", capsule: "0.4K tokens", eligible: "All surfaces", scope: "Thread default", childOnly: false },
    { id: "p-collaborator", name: "Collaborator", core: true, description: "Pairs on design and implementation decisions.", capsule: "0.5K tokens", eligible: "Chat, Goals", scope: "Available", childOnly: false },
    { id: "p-general", name: "General", core: true, description: "Balanced general-purpose agent.", capsule: "0.3K tokens", eligible: "All surfaces", scope: "Available", childOnly: false },
    { id: "p-overseer", name: "Overseer", core: true, description: "Verification, audit, and certification stance.", capsule: "0.5K tokens", eligible: "Verifier roles", scope: "Available", childOnly: false },
    { id: "p-researcher", name: "Researcher", core: true, description: "Bounded research and synthesis.", capsule: "0.4K tokens", eligible: "Research roles", scope: "Available", childOnly: false },
    { id: "p-deep", name: "Deep Researcher", core: true, description: "Long-horizon multi-pass research.", capsule: "0.6K tokens", eligible: "Research roles", scope: "Available", childOnly: false },
    { id: "p-explorer", name: "Explorer", core: true, description: "Fast codebase exploration.", capsule: "0.3K tokens", eligible: "Subagent roles", scope: "Available", childOnly: false },
    { id: "p-bash", name: "Bash", core: true, description: "Shell-focused execution persona.", capsule: "0.3K tokens", eligible: "Subagent roles", scope: "Available", childOnly: false },
    { id: "p-teacher", name: "Teacher", core: true, description: "Explains and teaches rather than acts.", capsule: "0.4K tokens", eligible: "Chat", scope: "Available", childOnly: false },
    { id: "p-nightwatch", name: "Night Watch", core: false, description: "Custom overnight monitoring persona.", capsule: "0.5K tokens", eligible: "Child roles only", scope: "Child only", childOnly: true }
  ];

  var mediaProviders = [
    { id: "media-imagegen", name: "Image Generation", route: "OpenAI Images — via OpenAI account", state: "connected", capability: "text to image", mode: "Native", output: "Pictures/PuppetMaster, PNG", safety: "Enforced", cost: "OpenAI billing", fallback: "Ask", history: 23 },
    { id: "media-vision", name: "Vision Analysis", route: "Gemini 3 Pro — currently failing over to GPT-5.2", state: "degraded", capability: "image to text", mode: "Native", output: "Inline in thread", safety: "Enforced", cost: "Provider usage", fallback: "GPT-5.2 (active)", history: 141 },
    { id: "media-audio", name: "Audio Input", route: "Not configured", state: "not-configured", capability: "audio to text", mode: "Not set", output: "Transcript only", safety: "n/a", cost: "n/a", fallback: "n/a", history: 0 },
    { id: "media-screen", name: "Screen Capture Input", route: "PM local transform", state: "connected", capability: "screen to image", mode: "PM transformed", output: "Attached to thread", safety: "Local only", cost: "No provider usage", fallback: "n/a", history: 8 }
  ];

  var mediaHistory = [
    { id: "mh1", what: "Generated icon sheet (12 glyphs)", route: "OpenAI Images", when: "Yesterday", outcome: "Saved to Pictures/PuppetMaster" },
    { id: "mh2", what: "Analyzed settings screenshot", route: "GPT-5.2 (fallback from Gemini 3 Pro)", when: "Yesterday", outcome: "Inline analysis" },
    { id: "mh3", what: "Transformed ZIP attachment", route: "PM local transform", when: "2 days ago", outcome: "Extracted, no provider usage" }
  ];

  var scenarios = ["default", "attention", "calm", "refreshing", "exhausted", "deep-link"];

  window.PMDemoData = {
    destinations: destinations,
    providers: providers,
    catalogs: catalogs,
    roles: roles,
    notices: notices,
    recents: recents,
    memory: memory,
    mcpServers: mcpServers,
    crewTemplates: crewTemplates,
    lspServers: lspServers,
    terminalProfiles: terminalProfiles,
    contextSources: contextSources,
    skills: skills,
    plugins: plugins,
    tools: tools,
    commands: commands,
    personas: personas,
    mediaProviders: mediaProviders,
    mediaHistory: mediaHistory,
    scenarios: scenarios
  };
})();
