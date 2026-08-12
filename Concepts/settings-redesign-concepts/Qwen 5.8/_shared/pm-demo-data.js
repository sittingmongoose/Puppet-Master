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
      purpose: "Startup, defaults, language and writing, updates.",
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
            S("general.language.dict-source", "Dictionary source", "Where spelling lookups come from. Automatic tries the OS service first, then PM local dictionaries.", "select", "Automatic", "default", { options: ["Automatic", "System dictionaries only", "PM local dictionaries only"], tier: "advanced", recommended: "Automatic", keywords: ["hunspell", "os service"] }),
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
      id: "notifications", title: "Notifications & Sounds", icon: "inbox",
      purpose: "Where work reaches you, how events route, and how they sound.",
      status: { kind: "attention", summary: "1 destination needs auth" },
      subcategories: [
        {
          id: "destinations", title: "Destinations", manager: "notifications", settings: [
            S("notifications.dest.titlebar", "In-app notification surface", "The title-bar stack is the only in-app notification surface. There is no status-bar bell or permanent corner stack.", "text", "Title-bar stack", "managed", { managedBy: "Shell canon", keywords: ["inbox", "sprout", "bell"] })
          ]
        },
        {
          id: "event-routing", title: "Event Routing", settings: [
            S("notifications.routing.fallback", "Fallback destination", "Where an event goes when its primary destination is unavailable.", "select", "In-app title bar", "default", { options: ["In-app title bar", "System/tray", "Hold until reachable"], keywords: ["routing", "fallback"] }),
            S("notifications.routing.dedupe", "Merge duplicate events", "Collapse repeated events inside 60 seconds into one notice.", "toggle", true, "default", { keywords: ["noise", "merge"] })
          ]
        },
        {
          id: "sounds", title: "Sounds & Mappings", manager: "sounds", settings: [
            S("notifications.sounds.master", "Master sound", "Play sounds for completed work, approvals, and failures. Sound is never the only indication — a visible notice always accompanies it.", "toggle", true, "default", { keywords: ["audio", "chime"] }),
            S("notifications.sounds.volume", "Master volume", "Loudness for all notification sounds.", "range", "60", "default", { min: 0, max: 100, keywords: ["volume", "loudness"] }),
            S("notifications.sounds.failure", "Failure sound", "Blocked or failed work always pairs the sound with a visible notice.", "toggle", true, "default", { keywords: ["error sound"] })
          ]
        },
        {
          id: "quiet", title: "Quiet & Focus", settings: [
            S("notifications.quiet.enabled", "Quiet hours", "Silence sounds and non-critical notices on a schedule.", "toggle", true, "custom", { keywords: ["do not disturb", "focus"] }),
            S("notifications.quiet.window", "Quiet window", "When quiet hours run.", "text", "22:00 \u2013 07:00", "custom", { validationError: "\u201Cuntil late\u201D is not a valid time window. Use HH:MM \u2013 HH:MM. The previous valid value was kept.", keywords: ["schedule", "night"] }),
            S("notifications.quiet.critical", "Let critical events through", "Approvals, failures, and Goal blockers still surface during quiet hours.", "toggle", true, "default", { recommended: "On", keywords: ["urgent", "override"] })
          ]
        }
      ]
    },
    {
      id: "appearance", title: "Appearance & Input", icon: "sun",
      purpose: "Theme, layout, motion, custom themes, fonts, and input feel.",
      status: { kind: "ok", summary: "Friendly Dark" },
      subcategories: [
        {
          id: "theme-layout", title: "Theme & Layout", settings: [
            S("appearance.theme.family", "Theme", "The whole app look, applied instantly.", "select", "Friendly Dark", "custom", { options: ["Friendly Dark", "Friendly Light", "Glass Dark", "Glass Light", "Retro Dark", "Retro Light", "Basic Dark", "Basic Light"], keywords: ["skin", "dark mode", "light mode", "friendly", "glass", "retro", "basic"] }),
            S("appearance.theme.mode", "Theme mode", "Light, Dark, or follow the system.", "segment", "Auto", "custom", { options: ["Light", "Dark", "Auto"], keywords: ["appearance mode", "os follow"] }),
            S("appearance.layout.density", "Layout density", "Spacing across panels and lists.", "segment", "Cozy", "custom", { options: ["Comfortable", "Cozy", "Compact"], keywords: ["spacing", "compact"] }),
            S("appearance.layout.rail", "Show left rail", "The navigation rail beside the workspace.", "toggle", true, "default", { keywords: ["sidebar", "navigation", "activity bar"] }),
            S("appearance.layout.transparency", "Window transparency", "Translucent surfaces where the theme supports them. Locked off in Basic themes — they ship without translucent surfaces.", "toggle", true, "default", { tier: "advanced", themeLocked: "Basic Dark and Basic Light lock this row off", keywords: ["glass", "blur"] })
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
          id: "custom-themes", title: "Custom Themes", manager: "themes", settings: [
            S("appearance.custom.live-reload", "Live reload custom themes", "Re-apply a custom TOML theme when its file changes on disk.", "toggle", true, "default", { keywords: ["toml", "hot reload"] }),
            S("appearance.custom.startup", "Load custom themes at startup", "Custom themes load before first paint.", "toggle", true, "default", { keywords: ["boot", "custom"] })
          ]
        },
        {
          id: "fonts-scale", title: "Fonts & Scale", settings: [
            S("appearance.fonts.ui", "Interface font", "Font used across the shell.", "select", "PM Sans", "default", { options: ["PM Sans", "System UI", "Atkinson Hyperlegible"], keywords: ["typeface"] }),
            S("appearance.fonts.mono", "Monospace fallback", "Font for code, paths, and terminals.", "select", "PM Mono", "default", { options: ["PM Mono", "System Mono"], keywords: ["code font"] }),
            S("appearance.fonts.scale", "UI scale", "Overall interface scaling. Applies after restart.", "select", "100%", "default", { options: ["90%", "100%", "110%", "125%"], restart: true, keywords: ["zoom", "dpi", "accessibility"] }),
            S("appearance.fonts.reduce-motion-note", "Reduced motion", "Reduced motion preserves every state and action; only choreography is removed.", "text", "Available in Motion, and from the demo tray", "managed", { managedBy: "Accessibility", keywords: ["vestibular", "a11y"] })
          ]
        },
        {
          id: "input", title: "Input", settings: [
            S("appearance.input.keyboard", "Full keyboard navigation", "Reach every control without a mouse.", "toggle", true, "default", { keywords: ["focus", "tab order"] }),
            S("appearance.input.palette", "Command palette shortcut", "Key combination that opens quick commands.", "text", "Command K", "custom", { keywords: ["hotkey", "launcher"] }),
            S("appearance.input.rename", "Double-click to rename", "Rename items in place.", "toggle", true, "default", { keywords: ["inline edit"] }),
            S("appearance.input.shortcuts", "Keyboard shortcuts", "Browse and remap shortcuts.", "action", "Manage", "default", { actionLabel: "Manage", target: { category: "code", subcategory: "commands-shortcuts", manager: "commands" }, keywords: ["bindings", "keys"] })
          ]
        }
      ]
    },
    {
      id: "models", title: "Agents, Models & Providers", icon: "robot",
      purpose: "Providers, accounts, models, free models, agent roles, and continuation.",
      status: { kind: "attention", summary: "1 provider needs attention" },
      subcategories: [
        {
          id: "providers", title: "Providers", manager: "providers", settings: [
            S("models.providers.refresh", "Catalog refresh", "models.dev and Free Coding Models refresh continuously in the background.", "action", "Last checked 8 min ago", "default", { actionLabel: "Refresh now", keywords: ["models.dev", "catalog", "refresh"] })
          ]
        },
        {
          id: "free-models", title: "Free Models", settings: [
            S("models.free.wrapper", "What Free Models is", "Free Models is a wrapper over underlying routes. It never owns credentials, quota, switching, or Usage — those stay with the underlying provider.", "text", "Wrapper over provider routes", "managed", { managedBy: "Models System", keywords: ["free coding models", "wrapper"] }),
            S("models.free.states", "Model state vocabulary", "Ready, Needs setup, Cooling down, No longer free, No longer available, Unverified — one state per row, never guessed.", "text", "6 states", "managed", { managedBy: "Catalogs", keywords: ["ready", "cooling down", "no longer free", "unverified"] }),
            S("models.free.refresh", "Catalog behavior", "Sources refresh continuously with version, check/import/activation times, validation, and last-known-good fallback.", "text", "Continuous", "default", { keywords: ["models.dev", "lkg"] })
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
          id: "model-defaults", title: "Model Defaults", settings: [
            S("models.defaults.effort", "Effort when supported", "Default reasoning effort for models that expose it.", "select", "Auto", "default", { options: ["Auto", "Minimal", "Low", "Medium", "High"], keywords: ["reasoning effort"] }),
            S("models.defaults.fast", "Normal or Fast preference", "Applied only when a real Fast variant exists for the model.", "segment", "Auto", "default", { options: ["Auto", "Normal", "Fast"], keywords: ["fast"] }),
            S("models.defaults.hide-legacy", "Auto-hide legacy models", "Keep the model menu focused on current models.", "toggle", true, "default", { keywords: ["deprecated"] }),
            S("models.defaults.capabilities", "Capability evidence", "How capability support is decided. Fast mode and modalities are never inferred from names alone.", "select", "Catalog plus observed use", "default", { tier: "advanced", options: ["Catalog only", "Catalog plus observed use", "Probe everything"], keywords: ["probe", "evidence"] })
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
          id: "instructions", title: "Instruction Sources", manager: "context-sources", settings: [
            S("context.instructions.chain", "Instruction chain", "Scoped AGENTS.md files admitted last turn.", "action", "2 files in chain", "default", { actionLabel: "Inspect", tier: "advanced", keywords: ["agents.md chain", "precedence"] }),
            S("context.instructions.persona-footprint", "Persona footprint", "Personas add a bounded capsule, never the full source.", "toggle", true, "default", { tier: "advanced", keywords: ["capsule"] })
          ]
        },
        {
          id: "memory", title: "Assistant Memory", manager: "memory", settings: [
            S("context.memory.halflife", "Memory half-life", "Fading changes retrieval activation, not truth — memories leave active recall; they are not deleted or rewritten.", "select", "Balanced", "default", { options: ["Long", "Balanced", "Short"], tier: "advanced", keywords: ["decay", "fade", "activation"] }),
            S("context.memory.verify", "Require verification", "New memories wait for review before full trust.", "toggle", true, "default", { keywords: ["evidence"] }),
            S("context.memory.scope", "Default memory scope", "Where new memories attach.", "select", "Project", "default", { options: ["Project", "Global"], keywords: ["scope"] })
          ]
        }
      ]
    },
    {
      id: "behavior", title: "Behavior & Automation", icon: "target",
      purpose: "Personas, Back Seat Driver, Goal defaults, routes, Crew, and guards.",
      status: { kind: "ok", summary: "Goal ceilings set" },
      subcategories: [
        {
          id: "personas", title: "Personas", manager: "personas", settings: [
            S("behavior.personas.default", "Persona for new threads", "Behavior capsule applied when a thread starts.", "select", "Assistant", "default", { options: ["Assistant", "Collaborator", "General", "Overseer"], keywords: ["character", "behavior"] }),
            S("behavior.personas.scope", "Persona selection scope", "Choosing a Persona in Chat applies to the current thread only.", "select", "This thread", "default", { options: ["This turn", "This thread", "This Goal", "Project default", "Global default"], keywords: ["thread local"] }),
            S("behavior.personas.authority", "Persona is behavior, not authority", "A Persona cannot grant Full Access, widen FileSafe, force a provider, or eagerly load all skills. Conversation mode and access profile stay separate.", "text", "Enforced", "managed", { managedBy: "Permissions", keywords: ["yolo coupling", "mode vs access"] })
          ]
        },
        {
          id: "bsd", title: "Back Seat Driver", settings: [
            S("behavior.bsd.mode", "Back Seat Driver", "Off, Auto, or On. Auto runs only when risk or phase triggers justify it; On may inspect all turns.", "segment", "Auto", "default", { options: ["Off", "Auto", "On"], recommended: "Auto", keywords: ["second opinion", "oversight"] }),
            S("behavior.bsd.route", "BSD route", "Route used for BSD review. Bounded and separate from primary work.", "select", "Claude Sonnet 4.5", "default", { options: ["Claude Sonnet 4.5", "GPT-5.2", "Same as primary"], tier: "advanced", keywords: ["review model"] }),
            S("behavior.bsd.triggers", "Risk and phase triggers", "BSD engages on risky operations and phase boundaries.", "toggle", true, "default", { tier: "advanced", keywords: ["risk", "phase"] }),
            S("behavior.bsd.usage-guard", "Usage guard", "BSD yields when capacity is tight.", "toggle", true, "default", { tier: "advanced", keywords: ["capacity"] }),
            S("behavior.bsd.latency", "Latency budget", "Maximum time BSD may add to a turn.", "select", "4 seconds", "default", { options: ["2 seconds", "4 seconds", "8 seconds"], tier: "advanced", keywords: ["delay"] }),
            S("behavior.bsd.privacy", "Privacy boundary", "BSD receives bounded deltas, never raw credentials.", "text", "Bounded deltas only", "managed", { managedBy: "Privacy boundary", tier: "advanced", keywords: ["secrets"] }),
            S("behavior.bsd.readonly", "Read-only by default", "BSD cannot widen authority and cannot block primary work merely because it failed.", "toggle", true, "default", { recommended: "On", tier: "advanced", keywords: ["non-blocking"] }),
            S("behavior.bsd.chat-override", "Chat override", "Chat may override BSD for one turn or the current thread.", "select", "Allowed", "default", { options: ["Allowed", "This turn only", "Off"], keywords: ["override"] })
          ]
        },
        {
          id: "goal-mode", title: "Goal Mode", settings: [
            S("behavior.goal.concurrency", "Configured concurrency ceiling", "Most children a Goal may request. Current sustainable concurrency is read-only operational state sourced from Usage — it is not a second setting.", "select", "8", "custom", { options: ["2", "4", "8", "12"], operational: "Sustainable now: 2 (from Usage)", keywords: ["parallel", "agents"] }),
            S("behavior.goal.reserve", "Reserve for synthesis and verification", "Keep capacity for parent synthesis, testing, and repair.", "toggle", true, "default", { recommended: "On", keywords: ["reserve"] }),
            S("behavior.goal.checkpoints", "Automatic checkpoints", "Save progress at phase boundaries.", "toggle", true, "default", { keywords: ["resume"] }),
            S("behavior.goal.worktree", "Worktree isolation", "How Goal work gets its own working tree.", "select", "Auto", "default", { options: ["Auto", "Ask", "Never"], keywords: ["git worktree"] }),
            S("behavior.goal.low-usage", "When usage runs low", "How Goals react to shrinking capacity.", "select", "Run smaller waves", "default", { options: ["Run smaller waves", "Pause and wait", "Ask"], keywords: ["capacity", "waves"] })
          ]
        },
        {
          id: "planning-routes", title: "Planning Routes", settings: [
            S("behavior.routes.conversation", "Planning conversation route", "User-facing discussion stays high quality.", "select", "High-quality route", "default", { options: ["High-quality route", "Explicit override"], recommended: "High-quality route", effect: "quality", keywords: ["wizard", "prd"] }),
            S("behavior.routes.extraction", "Background extraction route", "Bounded extraction may use cheaper routes.", "select", "Cheapest eligible", "default", { options: ["Cheapest eligible", "Same as conversation"], keywords: ["extract"] }),
            S("behavior.routes.integration", "Final integration route", "Synthesis and final assembly stay high quality.", "select", "High-quality route", "default", { options: ["High-quality route", "Explicit override"], keywords: ["synthesis"] }),
            S("behavior.routes.research", "Research route", "Bounded research children.", "select", "GPT-5.2 mini", "custom", { options: ["GPT-5.2 mini", "Claude Haiku 4.5", "Same as conversation"], keywords: ["research"] })
          ]
        },
        {
          id: "crew", title: "Crew Templates", manager: "crew", settings: [
            S("behavior.crew.policy", "Default route policy", "Whether Crews may adapt routes under capacity.", "select", "Adaptive", "default", { options: ["Adaptive", "Strict"], keywords: ["crew policy"] }),
            S("behavior.crew.scope", "Crew selection scope", "Crew choices apply to the current thread or Goal.", "select", "This thread", "default", { options: ["This thread", "This Goal"], keywords: ["thread local"] })
          ]
        },
        {
          id: "guards", title: "Automation Guards", settings: [
            S("behavior.guards.spend", "Spend guard", "Stops automation at a spending threshold.", "select", "Not configured", "not-configured", { options: ["Not configured", "Off", "Per Goal", "Daily"], effect: "cost", keywords: ["budget", "cost cap"] }),
            S("behavior.guards.time", "Time guard", "Stops Goals that exceed a wall-clock budget.", "select", "Off", "default", { options: ["Off", "2 hours", "8 hours"], keywords: ["timeout"] }),
            S("behavior.guards.usage", "Usage guard", "Consult Usage forecasts before admitting children.", "toggle", true, "default", { recommended: "On", keywords: ["forecast"] }),
            S("behavior.guards.reset-aware", "Reset timing awareness", "Forecasts account for provider resets.", "toggle", true, "default", { keywords: ["reset window"] })
          ]
        }
      ]
    },
    {
      id: "permissions", title: "Permissions & Safety", icon: "shield",
      purpose: "Access profiles, ordered permission rules, and FileSafe.",
      status: { kind: "ok", summary: "Full Access ceiling" },
      subcategories: [
        {
          id: "access", title: "Access Profiles", settings: [
            S("permissions.access.mode", "Access profile", "Highest autonomy agents may reach. Plan and Review are effect-limited, not tool-free — they can use safe read, browser, research, testing, and diagnostic operations.", "select", "Full Access", "custom", { options: ["Ask for approval", "Auto accept edits", "Auto", "Full Access"], effect: "safety", keywords: ["autonomy", "ceiling", "plan mode", "review"] }),
            S("permissions.access.dialogs", "Approval dialogs", "Compact dialogs with a Details expansion.", "select", "Compact with Details", "default", { options: ["Compact with Details", "Full context"], keywords: ["prompt", "confirm"] }),
            S("permissions.access.safe-reads", "Safe reads without approval", "Plan and Review may use safe read, research, and diagnostic tools.", "toggle", true, "default", { recommended: "On", keywords: ["plan mode", "review", "read-only"] }),
            S("permissions.access.duration", "Approval duration", "How long a granted approval lasts.", "select", "This session", "default", { options: ["Once", "This session", "Persistent for this tool"], keywords: ["grant", "remember"] })
          ]
        },
        {
          id: "rules", title: "Permission Rules", manager: "permissions", settings: [
            S("permissions.rules.default", "Global wildcard default", "Baseline applied when no granular rule matches.", "select", "Ask for approval", "default", { options: ["Allow", "Ask for approval", "Deny"], keywords: ["wildcard", "baseline"] }),
            S("permissions.rules.order", "Evaluation order", "Rules evaluate top to bottom; the last matching rule wins. Reorder changes outcomes.", "text", "Last match wins", "managed", { managedBy: "Rule engine", keywords: ["precedence", "last-match-wins"] })
          ]
        },
        {
          id: "filesafe", title: "FileSafe", settings: [
            S("permissions.filesafe.enabled", "FileSafe protection", "Guards protected files and risky writes. Enforced outside the model. FileSafe is the non-bypassable floor.", "toggle", true, "default", { recommended: "On", effect: "safety", keywords: ["guard", "protect", "floor"] }),
            S("permissions.filesafe.paths", "Protected paths", "Files and folders FileSafe watches.", "action", "12 protected paths", "default", { actionLabel: "Manage", keywords: ["protected files"] }),
            S("permissions.filesafe.patterns", "Block dangerous patterns", "Stop writes that match known-dangerous patterns.", "toggle", true, "default", { keywords: ["destructive"] }),
            S("permissions.filesafe.outside", "Allow writes outside the project", "Lets agents modify files beyond the project root.", "toggle", false, "default", { tier: "expert", effect: "safety", risky: true, keywords: ["escape", "outside"] })
          ]
        }
      ]
    },
    {
      id: "code", title: "Code & Editor", icon: "code",
      purpose: "Files, editor, terminal, LSP, formatters, commands, and testing.",
      status: { kind: "ok", summary: "LSP healthy" },
      subcategories: [
        {
          id: "file-manager", title: "File Manager", manager: "files", settings: [
            S("code.files.changed-on-disk", "Changed-on-disk handling", "What happens when a file changes outside the editor.", "select", "Ask before reloading", "default", { options: ["Ask before reloading", "Reload automatically", "Keep my buffer"], keywords: ["external change", "conflict"] })
          ]
        },
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
          id: "formatters", title: "Formatters", manager: "formatters", settings: [
            S("code.formatters.enable", "Enable formatters", "Global switch for format-on-save and format commands.", "toggle", true, "default", { keywords: ["format"] }),
            S("code.formatters.scope", "Formatter scope", "Whether formatter choices follow the project or stay global.", "select", "Project when defined", "default", { options: ["Project when defined", "Always global"], keywords: ["scope"] })
          ]
        },
        {
          id: "commands-shortcuts", title: "Commands & Shortcuts", manager: "commands", settings: [
            S("code.commands.palette-scope", "Command palette scope", "Which commands the palette offers.", "select", "Enabled for this project", "default", { options: ["All installed", "Enabled for this project"], keywords: ["palette"] }),
            S("code.commands.custom", "Custom commands", "Commands you defined. Dry-run never sends work to an agent.", "action", "3 custom commands", "default", { actionLabel: "Manage", keywords: ["aliases", "dry run"] }),
            S("code.commands.conflicts", "Shortcut conflicts", "Two commands share one shortcut.", "action", "1 conflict", "custom", { actionLabel: "Resolve", attention: true, keywords: ["collision", "binding"] })
          ]
        },
        {
          id: "testing-debug", title: "Testing & Debug", manager: "testing", settings: [
            S("code.testing.strength", "Evidence strength", "How much proof a finished task needs.", "select", "Standard", "default", { options: ["Standard", "Strong", "Exhaustive"], keywords: ["certify", "evidence"] }),
            S("code.testing.autotest", "Run tests after edits", "Automated tests run when code changes.", "toggle", true, "default", { keywords: ["test run"] }),
            S("code.testing.debug-visibility", "Debug session visibility", "Whether automated debug sessions surface in the UI.", "select", "Visible when active", "default", { options: ["Visible when active", "Always visible", "Hidden"], tier: "advanced", keywords: ["debug", "dap"] }),
            S("code.testing.repair-limit", "Repair attempts", "Maximum automatic repair passes.", "select", "2", "default", { options: ["1", "2", "3"], keywords: ["retry"] })
          ]
        }
      ]
    },
    {
      id: "extensions", title: "Extensions & Integrations", icon: "puzzle",
      purpose: "MCP, skills, plugins, and tools.",
      status: { kind: "attention", summary: "1 MCP server error" },
      subcategories: [
        {
          id: "mcp", title: "MCP Servers", manager: "mcp", settings: [
            S("extensions.mcp.exposure", "Tool exposure", "Progressive disclosure keeps tool schemas out of every request.", "select", "Progressive", "default", { options: ["Progressive", "Expose all"], tier: "advanced", recommended: "Progressive", keywords: ["schemas", "lazy"] }),
            S("extensions.mcp.approvals", "Approval default for MCP tools", "How new MCP tool calls are approved.", "select", "Ask once per session", "default", { options: ["Ask every time", "Ask once per session", "Allow listed tools"], keywords: ["permissions"] })
          ]
        },
        {
          id: "skills", title: "Skills", manager: "skills", settings: [
            S("extensions.skills.trust", "Skill trust default", "New skills start untrusted.", "select", "Ask per skill", "default", { options: ["Ask per skill", "Trust project skills"], keywords: ["trust"] })
          ]
        },
        {
          id: "plugins", title: "Plugins", manager: "plugins", settings: [
            S("extensions.plugins.channel", "Plugin update channel", "Where plugin updates come from.", "select", "Stable", "default", { options: ["Stable", "Beta"], keywords: ["updates"] })
          ]
        },
        {
          id: "tools", title: "Tools", manager: "tools", settings: [
            S("extensions.tools.children", "Tool availability for children", "Child agents get scoped tool sets.", "select", "Scoped by role", "default", { options: ["Scoped by role", "Same as parent"], tier: "advanced", keywords: ["subagent tools"] }),
            S("extensions.tools.schemas", "Expose installed schemas by default", "Off keeps requests lean.", "toggle", false, "default", { tier: "advanced", keywords: ["schema bloat"] }),
            S("extensions.tools.inventory", "Tool inventory", "Installed, enabled, selected, and invoked tools.", "action", "31 tools available", "default", { actionLabel: "Open inventory", keywords: ["tool list"] })
          ]
        }
      ]
    },
    {
      id: "system", title: "System & Data", icon: "activity",
      purpose: "Storage, backups, settings lifecycle, history, source control, and server shell.",
      status: { kind: "warn", summary: "Backup 14 days old" },
      subcategories: [
        {
          id: "storage", title: "Storage & Retention", manager: "storage", settings: [
            S("system.storage.mode", "Storage mode", "Where PM keeps its durable data.", "select", "Home TrueNAS", "default", { options: ["Home TrueNAS", "This device only"], keywords: ["data location"] }),
            S("system.storage.telemetry", "Telemetry", "No usage data leaves your machine unless enabled.", "toggle", false, "default", { effect: "privacy", keywords: ["analytics"] })
          ]
        },
        {
          id: "backup", title: "Backup & Restore", manager: "backup", settings: [
            S("system.backup.now", "Back Up Now", "Run a Settings backup immediately. This is a one-shot action, not a schedule.", "action", "Last backup 14 days ago", "default", { actionLabel: "Back Up Now", keywords: ["backup action"] }),
            S("system.backup.schedule", "Backup schedule", "How often Settings backups run on their own.", "select", "Weekly", "default", { options: ["Daily", "Weekly", "Monthly", "Off"], keywords: ["schedule"] }),
            S("system.backup.last", "Last backup", "Read-only status of the newest completed backup.", "text", "14 days ago — Settings backup", "default", { keywords: ["status"] }),
            S("system.backup.log", "Open backup log", "Diagnostic view of backup runs.", "action", "View log", "default", { actionLabel: "Open", keywords: ["diagnostic", "history"] }),
            S("system.backup.snapshots", "Internal recovery snapshots", "Periodic state snapshots, separate from Settings/Project/Server backups.", "toggle", true, "default", { recommended: "On", keywords: ["snapshot"] }),
            S("system.backup.retention", "Snapshot retention", "How long snapshots are kept.", "select", "30 days", "default", { options: ["7 days", "30 days", "Forever"], keywords: ["prune"] }),
            S("system.backup.pre-risky", "Restore point before risky changes", "Snapshot before migrations and bulk edits.", "toggle", true, "default", { recommended: "On", keywords: ["restore point"] })
          ]
        },
        {
          id: "settings-lifecycle", title: "Settings Lifecycle", settings: [
            S("system.lifecycle.export", "Export settings", "Export produces a portable file with source disclosure.", "action", "Export", "default", { actionLabel: "Export", keywords: ["download", "portable"] }),
            S("system.lifecycle.import", "Import settings", "Import previews conflicts and legacy-key migration before anything is applied.", "action", "Import", "default", { actionLabel: "Import", keywords: ["merge", "replace"] }),
            S("system.lifecycle.copy-from", "Copy Settings From…", "One-time transactional copy from another project. Preview, restore point, atomic apply, verification, receipt, rollback.", "action", "Copy", "default", { actionLabel: "Copy Settings From…", keywords: ["project copy", "transactional"] }),
            S("system.lifecycle.restore-points-auto", "Automatically create restore points before applying risky or bulk configuration changes", "Restore points make import, reset, and bulk edits reversible.", "toggle", true, "default", { recommended: "On", keywords: ["restore point", "safety net"] }),
            S("system.lifecycle.reset", "Reset all settings", "Returns every setting to its default. Preview first; cannot be undone after apply.", "action", "Reset", "default", { actionLabel: "Reset all", tier: "expert", risky: true, keywords: ["factory reset"] }),
            S("system.lifecycle.storage", "Configuration storage", "Where settings are persisted.", "text", "Managed by Puppet Master", "managed", { managedBy: "Puppet Master runtime", keywords: ["config path"] })
          ]
        },
        {
          id: "history", title: "History & Sessions", manager: "history", settings: [
            S("system.history.threads", "Keep thread history", "How long full threads stay addressable.", "select", "Forever", "default", { options: ["Forever", "1 year", "90 days"], keywords: ["history", "retention"] }),
            S("system.history.goal-transcripts", "Keep transcripts after Goals", "Goal transcripts remain readable after completion.", "toggle", true, "default", { keywords: ["goal history"] }),
            S("system.history.redact", "Redact sensitive values", "Scrub likely secrets from stored history.", "toggle", true, "default", { effect: "privacy", recommended: "On", keywords: ["secrets", "privacy"] })
          ]
        },
        {
          id: "artifacts", title: "Runtime Artifacts", manager: "artifacts", settings: [
            S("system.artifacts.identity", "Artifact identity", "PM-owned artifacts carry PM identity; provider-native artifacts keep their origin. Both stay distinguishable in receipts.", "text", "PM-owned + provider-native", "managed", { managedBy: "Artifact store", keywords: ["provenance"] })
          ]
        },
        {
          id: "source-control", title: "Source Control & Worktrees", manager: "source-control", settings: [
            S("system.git.provision", "Worktree provisioning", "Automatic worktrees for parallel work.", "select", "Auto", "default", { options: ["Auto", "Ask", "Never"], keywords: ["branch", "isolation"] }),
            S("system.git.cleanup", "Worktree cleanup", "When merged worktrees are removed.", "select", "After merge", "default", { options: ["After merge", "Manual"], keywords: ["prune"] }),
            S("system.git.ports", "Port collision behavior", "What happens when a port is taken.", "select", "Auto-shift to a free port", "default", { options: ["Auto-shift to a free port", "Ask"], keywords: ["port", "dev server"] })
          ]
        },
        {
          id: "containers", title: "Containers & Registries", manager: "containers", settings: [
            S("system.containers.overview", "Container tooling", "Docker, Podman, and Kubernetes tools share the installation lifecycle but keep their own capability probes.", "text", "Docker Desktop running", "default", { keywords: ["docker", "podman", "kubernetes"] })
          ]
        },
        {
          id: "web-search", title: "Web / Search / Fetch", manager: "web", settings: [
            S("system.web.provider", "Web search provider", "Where web searches run.", "select", "Built-in", "default", { options: ["Built-in", "MCP search server"], keywords: ["search"] }),
            S("system.web.timeout", "Fetch timeout", "Give up on slow pages.", "select", "30 seconds", "default", { options: ["15 seconds", "30 seconds", "60 seconds"], keywords: ["timeout"] }),
            S("system.web.readability", "Readability extraction", "Strip chrome before summarizing pages.", "toggle", true, "default", { keywords: ["extract"] })
          ]
        },
        {
          id: "search-index", title: "Project Search Index", manager: "search-index", settings: [
            S("system.index.enabled", "Project search index", "Keeps code search fast. Rebuilds run in phases and never block editing.", "toggle", true, "default", { keywords: ["indexing"] })
          ]
        },
        {
          id: "cleanup", title: "Workspace Cleanup", settings: [
            S("system.cleanup.dryrun", "Cleanup preview", "Cleanup always shows a dry run first. Worktrees are protected unless explicitly included.", "action", "Preview cleanup", "default", { actionLabel: "Preview", keywords: ["clean", "prune", "dry run"] })
          ]
        },
        {
          id: "server-shell", title: "Server & Hosts", settings: [
            S("system.server.home", "Home TrueNAS", "Project Home Server. Connected.", "text", "Connected", "default", { keywords: ["server", "truenas"] }),
            S("system.server.processing", "Processing on this server", "Whether work runs on the home server.", "toggle", true, "default", { keywords: ["execution host"] }),
            S("system.server.clients", "Clients", "Paired client devices.", "text", "3 paired", "default", { keywords: ["devices"] }),
            S("system.server.deferred", "Reserved modules", "Servers, Execution Hosts, Clients, Project Hosting & Files, Remote Access, and Updates are reserved insertion destinations with named owners — not placeholders.", "text", "6 reserved modules", "managed", { managedBy: "Future Server modules", keywords: ["deferred", "insertion"] })
          ]
        },
        {
          id: "health", title: "Health & Diagnostics", settings: [
            S("system.health.check", "System health checks", "Storage, runtime, and provider reachability.", "action", "Last run 2 h ago", "default", { actionLabel: "Run now", keywords: ["diagnose"] }),
            S("system.health.logs", "Log verbosity", "How much the logs record.", "select", "Normal", "default", { options: ["Minimal", "Normal", "Verbose"], keywords: ["debug log"] }),
            S("system.health.retention", "Log retention", "How long logs are kept.", "select", "30 days", "default", { options: ["7 days", "30 days", "Forever"], keywords: ["rotate"] }),
            S("system.health.open", "Open logs", "Reveal the current log folder.", "action", "View logs", "default", { actionLabel: "Open", keywords: ["log files"] }),
            S("system.health.flags", "Internal feature flags", "Experimental switches. Not for daily use.", "action", "3 flags available", "default", { actionLabel: "Open flags", tier: "expert", risky: true, keywords: ["experimental"] }),
            S("system.health.changed-elsewhere", "Diagnostic mode", "Verbose internal tracing. This row was changed in another PM window; the demo shows the changed-elsewhere state.", "toggle", false, "default", { changedElsewhere: true, tier: "diagnostic", keywords: ["trace", "sync"] })
          ]
        }
      ]
    }
  ];

  var providers = [
    {
      id: "anthropic", name: "Anthropic (Claude CLI)", group: "Installed tools & signed-in apps", state: "attention",
      stateLabel: "Connected — usage exhausted on Max profile",
      accounts: [
        { id: "anthropic-max", label: "Claude CLI — Max profile", nickname: "", authOwner: "Claude CLI", authKind: "CLI-owned OAuth, isolated profile", transport: "Isolated CLI profile", isolation: "Isolated CLI home/config directory", state: "connected", identity: "jared@work", preferred: true, enabled: true, sticky: false, priority: 1, usage: { included: "exhausted", extra: "Extra usage available", reset: "Today 5:00 PM", pressure: "High" }, health: { catalog: "2 min ago", generation: "4 min ago" }, continuationOptions: ["Stop and wait for reset", "Use extra usage", "Use paid usage after plan", "Switch to the API connection", "Ask each time"] }
      ],
      preferredAccount: "anthropic-max",
      installations: [
        { id: "claude-cli-npm", label: "Claude Code via npm", kind: "cli", command: "claude", resolved: "C:\\Users\\sitti\\AppData\\Roaming\\npm\\claude.cmd → @anthropic-ai/claude-code 2.1.4", method: "npm", owner: "npm global", confidence: "Proven", selected: true, state: "ready", host: "Home TrueNAS — Windows", env: "Windows native", evidence: "Package metadata matched the running binary" }
      ],
      updatePolicy: { check: "Automatic", install: "Ask first", version: "Latest compatible", rollback: "On where supported" },
      updateState: "ready",
      models: [
        { id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5", favorite: true, alias: "sonnet", priority: 1, effort: ["minimal", "low", "medium", "high"], fast: false, modalities: { in: ["text", "image"], out: ["text"] }, context: "200K", tools: true, mcp: true, structured: true, state: "available", evidence: "Observed use, 4 min ago" },
        { id: "claude-opus-4-5", name: "Claude Opus 4.5", favorite: true, alias: "", priority: 2, effort: ["medium", "high"], fast: false, modalities: { in: ["text", "image"], out: ["text"] }, context: "200K", tools: true, mcp: true, structured: true, state: "available", evidence: "Observed use, 1 h ago" },
        { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", favorite: false, alias: "", priority: 3, effort: [], fast: false, modalities: { in: ["text"], out: ["text"] }, context: "200K", tools: true, mcp: false, structured: true, state: "available", evidence: "Catalog, verified 8 min ago" },
        { id: "claude-opus-4-5-1m", name: "Claude Opus 4.5 (1M context)", favorite: false, alias: "", priority: 9, effort: ["high"], fast: false, modalities: { in: ["text"], out: ["text"] }, context: "1M", tools: true, mcp: true, structured: true, state: "unavailable", reason: "Not included in the Max plan — available through API billing.", evidence: "Account discovery, 2 min ago" }
      ]
    },
    {
      id: "anthropic-api", name: "Anthropic API", group: "API connections", state: "ready",
      stateLabel: "Connected — API key",
      accounts: [
        { id: "anthropic-api", label: "Anthropic API — Console key", nickname: "Console", authOwner: "API key", authKind: "API credential", transport: "API", isolation: "API credential pool", state: "connected", identity: "Console workspace: Jared", preferred: true, enabled: true, sticky: false, priority: 1, usage: { included: "Pay-as-you-go", pressure: "None" }, health: { catalog: "2 min ago", generation: "1 h ago" }, continuationOptions: ["Stop at budget", "Ask each time"] }
      ],
      preferredAccount: "anthropic-api",
      installations: [
        { id: "anthropic-api-conn", label: "PM-managed API connection", kind: "pm-managed", command: "api.anthropic.com", resolved: "HTTPS endpoint, credential in PM secret store", method: "PM-managed direct connection", owner: "Puppet Master", confidence: "Proven", selected: true, state: "ready", host: "Home TrueNAS — Windows", env: "Network", evidence: "Key validated against the API" }
      ],
      updatePolicy: { check: "Not applicable", install: "Not applicable", version: "Hosted API", rollback: "n/a" },
      updateState: "ready",
      models: [
        { id: "claude-sonnet-4-5-api", name: "Claude Sonnet 4.5 (API)", favorite: false, alias: "", priority: 1, effort: ["low", "medium", "high"], fast: false, modalities: { in: ["text", "image"], out: ["text"] }, context: "200K", tools: true, mcp: true, structured: true, state: "available", evidence: "Observed use, 1 h ago" }
      ]
    },
    {
      id: "openai", name: "OpenAI", group: "Connected accounts", state: "ready",
      stateLabel: "Connected via PM sign-in — update available",
      accounts: [
        { id: "openai-pm", label: "OpenAI — PM sign-in", nickname: "", authOwner: "Puppet Master", authKind: "PM-direct OAuth", transport: "OAuth", isolation: "PM-managed direct connection", state: "connected", identity: "jared@example.com", preferred: true, enabled: true, sticky: true, priority: 1, usage: { included: "ChatGPT Pro allowance", remaining: "Plenty", reset: "Rolling weekly", pressure: "Low" }, health: { catalog: "8 min ago", generation: "22 min ago" }, continuationOptions: ["Use paid usage after plan", "Switch account", "Ask each time"] }
      ],
      preferredAccount: "openai-pm",
      installations: [
        { id: "openai-pm-conn", label: "PM-managed OAuth connection", kind: "pm-managed", command: "api.openai.com", resolved: "HTTPS endpoint, PM-direct OAuth token", method: "PM-managed direct connection", owner: "Puppet Master", confidence: "Proven", selected: true, state: "ready", host: "Home TrueNAS — Windows", env: "Network", evidence: "OAuth handshake verified" }
      ],
      updatePolicy: { check: "Automatic", install: "Ask first", version: "Latest compatible", rollback: "On where supported" },
      updateState: "update-available",
      updateDetail: { from: "current adapter", to: "newer adapter", note: "Ask first — PM will not install until you approve. Simulated fixture." },
      models: [
        { id: "gpt-5-2", name: "GPT-5.2", favorite: true, alias: "", priority: 1, effort: ["low", "medium", "high"], fast: true, modalities: { in: ["text", "image"], out: ["text", "image"] }, context: "400K", tools: true, mcp: true, structured: true, state: "available", evidence: "Observed use, 22 min ago" },
        { id: "gpt-5-2-mini", name: "GPT-5.2 mini", favorite: false, alias: "mini", priority: 2, effort: [], fast: true, modalities: { in: ["text", "image"], out: ["text"] }, context: "200K", tools: true, mcp: true, structured: true, state: "available", evidence: "Observed use, 3 h ago" }
      ]
    },
    {
      id: "gemini-cli", name: "Gemini CLI", group: "Installed tools & signed-in apps", state: "invocation-failed",
      stateLabel: "Signed in — model invocation failed — two installations found",
      accounts: [
        { id: "gemini-profile", label: "Gemini CLI — default profile", nickname: "", authOwner: "Gemini CLI", authKind: "CLI-owned Google OAuth", transport: "Isolated CLI profile", isolation: "Isolated CLI home/config directory", state: "authenticated", identity: "jared@gmail.com", preferred: true, enabled: true, sticky: false, priority: 1, usage: { included: "Free tier window", remaining: "Unknown", reset: "Unknown", pressure: "Unknown" }, health: { catalog: "12 min ago", generation: "Never succeeded" }, probe: { result: "failed", detail: "Readiness probe returned resource exhausted (429). Authentication is fine; invocation is not. Usage details are unavailable while invocation fails.", at: "12 min ago" }, continuationOptions: ["Retry probe", "Wait for reset", "Ask each time"] }
      ],
      preferredAccount: "gemini-profile",
      installations: [
        { id: "gemini-npm", label: "Gemini CLI via npm", kind: "cli", command: "gemini", resolved: "C:\\Users\\sitti\\AppData\\Roaming\\npm\\gemini.cmd → @google/gemini-cli 0.9.1", method: "npm", owner: "npm global", confidence: "Proven", selected: true, state: "ready", host: "Home TrueNAS — Windows", env: "Windows native", evidence: "Package metadata matched the running binary" },
        { id: "gemini-brew-shadow", label: "Gemini CLI via Homebrew (shadowed)", kind: "cli", command: "gemini", resolved: "C:\\tools\\brew\\bin\\gemini → google-gemini/gemini-cli 0.8.7", method: "Homebrew", owner: "Homebrew", confidence: "Strongly identified", selected: false, state: "shadowed", host: "Home TrueNAS — Windows", env: "Windows native", evidence: "Second installation on PATH; not used while the npm installation is selected" }
      ],
      updatePolicy: { check: "Automatic", install: "Ask first", version: "Latest compatible", rollback: "On where supported" },
      updateState: "ready",
      models: [
        { id: "gemini-3-pro", name: "Gemini 3 Pro", favorite: false, alias: "", priority: 1, effort: ["low", "high"], fast: false, modalities: { in: ["text", "image"], out: ["text"] }, context: "1M", tools: true, mcp: false, structured: true, state: "unverified", reason: "Invocation check failed — capability evidence is catalog-only until a probe succeeds.", evidence: "Catalog, 12 min ago" }
      ]
    },
    {
      id: "codex-cli", name: "Codex CLI", group: "Installed tools & signed-in apps", state: "signed-out",
      stateLabel: "Installed — signed out — one installation rolled back",
      accounts: [],
      installations: [
        { id: "codex-npm", label: "Codex CLI via npm", kind: "cli", command: "codex", resolved: "C:\\Users\\sitti\\AppData\\Roaming\\npm\\codex.cmd → @openai/codex 0.42.0", method: "npm", owner: "npm global", confidence: "Proven", selected: true, state: "ready", host: "Home TrueNAS — Windows", env: "Windows native", evidence: "Package metadata matched the running binary" },
        { id: "codex-winget", label: "Codex CLI via winget (shadowed)", kind: "cli", command: "codex", resolved: "C:\\Program Files\\Codex\\codex.exe 0.41.2", method: "winget", owner: "winget", confidence: "Probable", selected: false, state: "rolled-back", host: "Home TrueNAS — Windows", env: "Windows native", evidence: "Update to 0.42.0 failed verification and was rolled back", receipts: ["14:02 update started (winget)", "14:03 verification failed: launch health check timed out", "14:03 rolled back to 0.41.2", "14:04 selected installation unaffected"] }
      ],
      updatePolicy: { check: "Automatic", install: "Ask first", version: "Latest compatible", rollback: "On where supported" },
      updateState: "ready",
      models: [
        { id: "gpt-5-2-codex", name: "GPT-5.2 Codex", favorite: false, alias: "", priority: 1, effort: ["medium", "high"], fast: true, modalities: { in: ["text"], out: ["text"] }, context: "400K", tools: true, mcp: false, structured: true, state: "unverified", reason: "Sign in through the CLI to verify invocation.", evidence: "Catalog only" }
      ],
      login: { note: "Codex CLI uses its own login flow inside an isolated CLI profile. Puppet Master launches the native login and verifies readiness; it never takes your credentials." }
    },
    {
      id: "antigravity", name: "Antigravity CLI", group: "Installed tools & signed-in apps", state: "not-installed",
      stateLabel: "Not installed — explicit Install available",
      accounts: [],
      models: [],
      installations: [],
      updatePolicy: { check: "After install", install: "Ask first", version: "Latest compatible", rollback: "On where supported" },
      updateState: "ready",
      install: { available: true, officialSource: "Official Antigravity installer (developers.antigravity.example/cli)", host: "Home TrueNAS — Windows", env: "Windows native", notBundled: true, note: "Provider CLIs are never bundled in PM core, never pre-seeded in Tool Store, and never installed silently. After explicit install, Antigravity uses its own login flow inside an isolated CLI profile. Puppet Master does not offer PM-direct OAuth for Antigravity." }
    },
    {
      id: "opencode", name: "OpenCode", group: "Server connections", state: "ready",
      stateLabel: "External server — managed externally",
      accounts: [
        { id: "opencode-srv", label: "OpenCode server endpoint", nickname: "", authOwner: "Server", authKind: "Server-managed session", transport: "Server", isolation: "External server, PM connects as client", state: "connected", identity: "http://192.168.1.40:4096", preferred: true, enabled: true, sticky: false, priority: 1, usage: { included: "Server-managed", remaining: "Unknown", pressure: "Unknown" }, health: { catalog: "6 min ago", generation: "31 min ago" }, continuationOptions: ["Queue on server", "Switch provider"] }
      ],
      preferredAccount: "opencode-srv",
      installations: [
        { id: "opencode-endpoint", label: "External server endpoint", kind: "external", command: "http://192.168.1.40:4096", resolved: "OpenCode server, LAN", method: "External server", owner: "Server administrator", confidence: "Proven", selected: true, state: "ready", host: "LAN host 192.168.1.40", env: "Linux container", evidence: "Handshake and version exchange succeeded" },
        { id: "opencode-legacy", label: "Legacy binary at /usr/local/bin/opencode-legacy", kind: "cli", command: "opencode-legacy", resolved: "\\\\TRUENAS\\services\\opencode\\opencode-legacy", method: "Could not identify installation method", owner: "unknown-owner", confidence: "Unknown", selected: false, state: "manual-only", host: "LAN host 192.168.1.40", env: "Linux", evidence: "No package database claim matched; ownership is unknown, so updates are manual-only" }
      ],
      updatePolicy: { check: "Managed externally", install: "Managed externally", version: "Server-controlled", rollback: "Server-controlled" },
      updateState: "managed-externally",
      models: [
        { id: "opencode-router", name: "OpenCode routed models", favorite: false, alias: "", priority: 1, effort: [], fast: false, modalities: { in: ["text"], out: ["text"] }, context: "Server-dependent", tools: true, mcp: false, structured: true, state: "available", evidence: "Observed use through server, 31 min ago" }
      ]
    },
    {
      id: "local-server", name: "Local model server", group: "Server connections", state: "ready",
      stateLabel: "Connected — keyless local endpoint — update scheduled when idle",
      accounts: [
        { id: "local-endpoint", label: "OpenAI-compatible endpoint", nickname: "Ollama", authOwner: "None", authKind: "Keyless local server", transport: "Server", isolation: "Local endpoint, no authentication", state: "connected", identity: "http://127.0.0.1:11434/v1", preferred: true, enabled: true, sticky: false, priority: 1, usage: { included: "Local compute", remaining: "Not metered", pressure: "None" }, health: { catalog: "Just now", generation: "35 min ago" }, continuationOptions: ["Queue on device", "Switch provider"] }
      ],
      preferredAccount: "local-endpoint",
      installations: [
        { id: "ollama-local", label: "Ollama service", kind: "server", command: "ollama serve", resolved: "Windows service: Ollama 0.12.3", method: "Official installer", owner: "Official installer", confidence: "Strongly identified", selected: true, state: "ready", host: "This device — Windows", env: "Windows native", evidence: "Service metadata matched the responding endpoint" }
      ],
      updatePolicy: { check: "Automatic", install: "Automatically when idle", version: "Latest compatible", rollback: "On where supported" },
      updateState: "scheduled-idle",
      updateDetail: { from: "0.12.3", to: "0.12.4", note: "Scheduled when idle — requires proven ownership, no active requests, and a reliable rollback path." },
      models: [
        { id: "qwen3-coder-local", name: "Qwen3 Coder 30B (local)", favorite: false, alias: "", priority: 1, effort: [], fast: false, modalities: { in: ["text"], out: ["text"] }, context: "128K", tools: true, mcp: false, structured: false, state: "available", free: "Keyless", evidence: "Observed use, 35 min ago" }
      ]
    },
    {
      id: "mistral-free", name: "Mistral AI (free tier)", group: "Free & community models", state: "needs-setup",
      stateLabel: "Setup required — free model states shown here",
      accounts: [],
      installations: [],
      updatePolicy: { check: "Catalog-driven", install: "n/a", version: "Catalog", rollback: "n/a" },
      updateState: "ready",
      models: [
        { id: "mistral-small-free", name: "Mistral Small (free tier)", favorite: false, alias: "", priority: 1, effort: [], fast: false, modalities: { in: ["text"], out: ["text"] }, context: "128K", tools: true, mcp: false, structured: true, state: "needs-setup", freeState: "needs-setup", reason: "Free but rate-limited and account-required.", evidence: "Catalog via Free Coding Models" },
        { id: "devstral-small-free", name: "Devstral Small (free endpoint)", favorite: false, alias: "", priority: 2, effort: [], fast: false, modalities: { in: ["text"], out: ["text"] }, context: "128K", tools: true, mcp: false, structured: true, state: "available", freeState: "ready", reason: "Keyless community endpoint verified.", evidence: "Observed use, 2 days ago" },
        { id: "codestral-free", name: "Codestral (free window)", favorite: false, alias: "", priority: 3, effort: [], fast: false, modalities: { in: ["text"], out: ["text"] }, context: "256K", tools: true, mcp: false, structured: true, state: "cooling-down", freeState: "cooling-down", reason: "Free window exhausted; resets at 00:00 UTC.", evidence: "Catalog via Free Coding Models" },
        { id: "mixtral-free", name: "Mixtral 8x7B (was free)", favorite: false, alias: "", priority: 4, effort: [], fast: false, modalities: { in: ["text"], out: ["text"] }, context: "32K", tools: false, mcp: false, structured: true, state: "unavailable", freeState: "no-longer-free", reason: "Removed from the free tier by the provider.", evidence: "Free Coding Models change history" },
        { id: "mistral-medium-free", name: "Mistral Medium (free tier)", favorite: false, alias: "", priority: 5, effort: [], fast: false, modalities: { in: ["text"], out: ["text"] }, context: "128K", tools: false, mcp: false, structured: true, state: "unavailable", freeState: "no-longer-available", reason: "Endpoint retired upstream.", evidence: "Free Coding Models change history" },
        { id: "pixtral-free", name: "Pixtral (free tier)", favorite: false, alias: "", priority: 6, effort: [], fast: false, modalities: { in: ["text", "image"], out: ["text"] }, context: "128K", tools: false, mcp: false, structured: false, state: "unverified", freeState: "unverified", reason: "Capability claims not yet verified by a probe.", evidence: "Catalog only" }
      ],
      setup: { steps: ["Create a Mistral account", "Create an API key in La Plateforme", "Add the key to a new Mistral connection", "Verify the free-tier quota caveats", "Return to the model row"], note: "Free Models delegates setup and accounting to the underlying provider." }
    }
  ];

  var providerGroups = ["Installed tools & signed-in apps", "Connected accounts", "API connections", "Server connections", "Free & community models"];

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
    { id: "gemini-probe", group: "attention", kind: "attention", status: "Needs attention", headline: "Gemini CLI is signed in, but model invocation failed", reason: "The readiness probe hit a rate limit. Authentication is fine; the route is unusable until a probe succeeds.", action: "Run diagnostics", secondary: "View connection", target: { category: "models", manager: "providers", provider: "gemini-cli" } },
    { id: "anthropic-usage", group: "attention", kind: "attention", status: "Needs attention", headline: "Anthropic Max included usage is exhausted", reason: "Requests on the Max profile will stop unless a continuation is chosen. Reset is at 5:00 PM.", action: "Choose what happens next", secondary: "View usage", target: { category: "models", subcategory: "continuation", setting: "models.continuation.anthropic-max" } },
    { id: "mcp-docs", group: "attention", kind: "attention", status: "Needs attention", headline: "Local Docs MCP server will not start", reason: "Transport spawn failed twice. The server is disabled until repaired.", action: "View logs", secondary: "Repair", target: { category: "extensions", manager: "mcp" } },
    { id: "perm-conflict", group: "attention", kind: "attention", status: "Needs attention", headline: "Two permission rules conflict for scripts/**", reason: "Rule 3 allows scripts/** and rule 5 asks for the same path. Last match wins — rule 5 currently decides.", action: "Open rule trace", target: { category: "permissions", manager: "permissions" } },
    { id: "update-openai", group: "attention", kind: "attention", status: "Needs attention", headline: "A provider update is available", reason: "An OpenAI provider update is ready. Install policy is Ask first — PM will not update until you approve. Simulated fixture.", action: "Review update", secondary: "Open Providers", target: { category: "models", manager: "providers", provider: "openai" } },
    { id: "continue-mistral", group: "continue", kind: "continue", status: "Continue setup", headline: "Finish Mistral free-tier setup", reason: "The account step was started but no API key was added yet.", action: "Resume setup", target: { category: "models", manager: "providers", provider: "mistral-free" } },
    { id: "continue-pack", group: "continue", kind: "continue", status: "Continue setup", headline: "Sound pack failed its license check", reason: "The OpenPeon pack was imported but its license could not be verified. It stays disabled.", action: "Review pack", target: { category: "notifications", manager: "sounds" } },
    { id: "rec-backup", group: "recommended", kind: "recommended", status: "Recommended", headline: "Your last Settings backup is 14 days old", reason: "A fresh backup keeps import and rollback honest.", action: "Back Up Now", secondary: "Open Backup & Restore", target: { category: "system", manager: "backup" } },
    { id: "rec-persona", group: "recommended", kind: "recommended", status: "Recommended", headline: "Pin a planning Persona", reason: "Planning conversations stay consistent when a Persona is pinned for new Goals.", action: "Open Personas", target: { category: "behavior", manager: "personas" } }
  ];

  var recents = [
    { id: "r1", label: "Theme", where: "Appearance & Input", when: "2 min ago", target: { category: "appearance", subcategory: "theme-layout", setting: "appearance.theme.family" } },
    { id: "r2", label: "Goal concurrency ceiling", where: "Behavior & Automation", when: "1 h ago", target: { category: "behavior", subcategory: "goal-mode", setting: "behavior.goal.concurrency" } },
    { id: "r3", label: "Claude CLI — Max profile", where: "Providers", when: "Yesterday", target: { category: "models", manager: "providers", provider: "anthropic" } }
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
  ];

  var crewTemplates = [
    { id: "crew-design", name: "Design Review Crew", purpose: "Five-perspective UI review with synthesis", members: [{ role: "Critic", persona: "Overseer", route: "Claude Sonnet 4.5", candidates: ["Claude Sonnet 4.5", "Claude Opus 4.5"] }, { role: "Accessibility", persona: "Researcher", route: "GPT-5.2", candidates: ["GPT-5.2", "GPT-5.2 mini"] }, { role: "Motion", persona: "Collaborator", route: "Claude Sonnet 4.5", candidates: ["Claude Sonnet 4.5"] }, { role: "Theming", persona: "Collaborator", route: "GPT-5.2", candidates: ["GPT-5.2", "Qwen3 Coder 30B (local)"] }, { role: "Synthesizer", persona: "Overseer", route: "Claude Opus 4.5", candidates: ["Claude Opus 4.5"] }], requested: 5, effective: 5, minMax: "3–5", routePolicy: "Strict", concurrency: 5, waves: "One wave, all members", guards: { spend: "Per Goal", time: "2 hours" }, reserve: true, worktree: "None", ports: "Not needed", childDepth: "Members may not spawn children", board: "Shared review board", failure: "Stop and report" },
    { id: "crew-research", name: "Research Crew", purpose: "Bounded parallel research with one reducer", members: [{ role: "Researcher A", persona: "Deep Researcher", route: "GPT-5.2 mini", candidates: ["GPT-5.2 mini", "Claude Haiku 4.5", "Qwen3 Coder 30B (local)"] }, { role: "Researcher B", persona: "Deep Researcher", route: "GPT-5.2 mini", candidates: ["GPT-5.2 mini", "Claude Haiku 4.5", "Qwen3 Coder 30B (local)"] }, { role: "Synthesizer", persona: "Researcher", route: "Claude Sonnet 4.5", candidates: ["Claude Sonnet 4.5", "GPT-5.2"] }], requested: 3, effective: 2, minMax: "2–3", routePolicy: "Adaptive", concurrency: 3, waves: "Two researchers, then synthesizer", guards: { spend: "Off", time: "1 hour" }, reserve: true, worktree: "None", ports: "Not needed", childDepth: "1 level of bounded extraction", board: "Off", failure: "Reducer continues with partial results", differs: true, diffReason: "Capacity reserve reduced the wave from 3 to 2 members." },
    { id: "crew-release", name: "Release Verification Crew", purpose: "Test, verify, and certify a release", members: [{ role: "Tester", persona: "Bash", route: "GPT-5.2", candidates: ["GPT-5.2", "Claude Sonnet 4.5"] }, { role: "Verifier", persona: "Overseer", route: "Claude Opus 4.5", candidates: ["Claude Opus 4.5"] }, { role: "Repair", persona: "General", route: "Claude Sonnet 4.5", candidates: ["Claude Sonnet 4.5", "GPT-5.2"] }, { role: "Certifier", persona: "Overseer", route: "Claude Opus 4.5", candidates: ["Claude Opus 4.5"] }], requested: 4, effective: 4, minMax: "2–4", routePolicy: "Strict", concurrency: 2, waves: "Test, then verify, then certify", guards: { spend: "Per Goal", time: "4 hours" }, reserve: true, worktree: "Isolated per member", ports: "Reserved test port per member", childDepth: "Members may spawn one repair child", board: "Release board", failure: "Stop and report" }
  ];

  var lspServers = [
    { id: "lsp-ts", name: "TypeScript / JavaScript", executable: "typescript-language-server", version: "4.3.3", state: "running", scope: "Workspace", startup: "Auto", coverage: "ts, tsx, js, jsx", capabilities: "Diagnostics, formatting, completion, rename", conflicts: "None", health: "Healthy — indexed 214 files", logs: ["12:02 started (workspace)", "12:02 indexed 214 files", "12:09 formatting owned by LSP"] },
    { id: "lsp-python", name: "Python", executable: "pyright-langserver", version: "1.1.392", state: "installed", scope: "Global", startup: "On first matching file", coverage: "py", capabilities: "Diagnostics, completion", conflicts: "None", health: "Idle — not started this session", logs: [] },
    { id: "lsp-rust", name: "Rust", executable: "rust-analyzer", version: "Not installed", state: "not-installed", scope: "Global", startup: "Auto", coverage: "rs", capabilities: "Available after install", conflicts: "None", health: "Not installed", logs: [] },
    { id: "lsp-slint", name: "Slint", executable: "slint-lsp", version: "1.17.1", state: "running", scope: "Workspace", startup: "Auto", coverage: "slint", capabilities: "Diagnostics, preview bridge", conflicts: "None", health: "Healthy", logs: ["12:05 started (workspace)", "12:05 preview bridge ready"] }
  ];

  var terminalProfiles = [
    { id: "term-default", name: "Default", isDefault: true, shell: "Auto-detected (pwsh)", env: "PATH inherited", font: "PM Mono 13 / 1.4", colors: "Match app theme", palette: ["#2b2f36", "#e5534b", "#57ab5a", "#c69026", "#3b8eea", "#b083f0", "#39adb5", "#d0d7de"], opacity: 100, cursor: "Block", selection: "Click-drag", copyOnSelect: false, cwd: "Inherit from workspace", retention: "30 days", startup: "Standard" },
    { id: "term-dev", name: "Dev (Zsh)", isDefault: false, shell: "/bin/zsh — dev rc", env: "DEV=1", font: "PM Mono 13 / 1.5", colors: "Tango-ish", palette: ["#1e1e2e", "#f38ba8", "#a6e3a1", "#f9e2af", "#89b4fa", "#cba6f7", "#94e2d5", "#cdd6f4"], opacity: 92, cursor: "Bar", selection: "Click-drag", copyOnSelect: true, cwd: "Project root", retention: "30 days", startup: "With workspace" },
    { id: "term-ci", name: "CI Logs", isDefault: false, shell: "Read-only replay", env: "Locked", font: "PM Mono 12 / 1.3", colors: "High contrast", palette: ["#000000", "#ff5555", "#50fa7b", "#f1fa8c", "#bd93f9", "#ff79c6", "#8be9fd", "#f8f8f2"], opacity: 100, cursor: "None", selection: "Click-drag", copyOnSelect: true, cwd: "Locked to run", retention: "7 days", startup: "On demand" }
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
    { id: "sk-frontend", name: "frontend-design", scope: "Global", trust: "Trusted", installed: true, enabled: true, selected: true, invoked: 6, update: "Up to date", permissions: "Read project, write concept files" },
    { id: "sk-ledger", name: "pm-bootstrap-planning-ledger", scope: "Project", trust: "Trusted", installed: true, enabled: true, selected: true, invoked: 3, update: "Up to date", permissions: "Read/write Plans ledgers" },
    { id: "sk-audit", name: "audit", scope: "Global", trust: "Not trusted yet", installed: true, enabled: false, selected: false, invoked: 0, update: "Up to date", permissions: "Read project" },
    { id: "sk-animate", name: "animate", scope: "Global", trust: "Trusted", installed: true, enabled: true, selected: false, invoked: 1, update: "Update available", permissions: "Read project, write CSS" }
  ];

  var plugins = [
    { id: "pl-slint", name: "Slint Preview Bridge", compatibility: "Compatible", channel: "Stable", state: "Enabled", installed: true, enabled: true, update: "Up to date", permissions: "Spawn preview process" },
    { id: "pl-legacy", name: "Legacy Ice Panel", compatibility: "Incompatible with this build", channel: "Archived", state: "Failed to load", installed: true, enabled: false, update: "Archived", permissions: "Panel host" }
  ];

  var tools = [
    { name: "Bash", installed: true, projectEnabled: true, available: true, invoked: 214, risk: "High", approval: "Follows access mode" },
    { name: "Edit", installed: true, projectEnabled: true, available: true, invoked: 96, risk: "Medium", approval: "Auto under Full Access" },
    { name: "Read", installed: true, projectEnabled: true, available: true, invoked: 512, risk: "Low", approval: "Safe read" },
    { name: "WebFetch", installed: true, projectEnabled: true, available: true, invoked: 18, risk: "Medium", approval: "Safe research" },
    { name: "Browser Program", installed: true, projectEnabled: true, available: false, invoked: 12, risk: "Medium", approval: "Ask once per session", note: "Not selected for this turn" },
    { name: "GitHub MCP tools", installed: true, projectEnabled: true, available: true, invoked: 7, risk: "Medium", approval: "Ask once per session", note: "Owned by GitHub MCP server" }
  ];

  var commands = [
    { name: "Open Settings", shortcut: "Command ,", state: "ok" },
    { name: "Toggle Rail", shortcut: "Command B", state: "ok" },
    { name: "Run Tests", shortcut: "Command Shift T", state: "conflict", note: "Also bound to Open Terminal" }
  ];

  var personas = [
    { id: "p-assistant", name: "Assistant", core: true, description: "Default helpful engineering companion.", capsule: "0.4K tokens", provenance: "Core, v3", eligible: "All surfaces", scope: "Thread default", childOnly: false },
    { id: "p-collaborator", name: "Collaborator", core: true, description: "Pairs on design and implementation decisions.", capsule: "0.5K tokens", provenance: "Core, v2", eligible: "Chat, Goals", scope: "Available", childOnly: false },
    { id: "p-general", name: "General", core: true, description: "Balanced general-purpose agent.", capsule: "0.3K tokens", provenance: "Core, v3", eligible: "All surfaces", scope: "Available", childOnly: false },
    { id: "p-overseer", name: "Overseer", core: true, description: "Verification, audit, and certification stance.", capsule: "0.5K tokens", provenance: "Core, v2", eligible: "Verifier roles", scope: "Available", childOnly: false },
    { id: "p-researcher", name: "Researcher", core: true, description: "Bounded research and synthesis.", capsule: "0.4K tokens", provenance: "Core, v2", eligible: "Research roles", scope: "Available", childOnly: false },
    { id: "p-deep", name: "Deep Researcher", core: true, description: "Long-horizon multi-pass research.", capsule: "0.6K tokens", provenance: "Core, v1", eligible: "Research roles", scope: "Available", childOnly: false },
    { id: "p-explorer", name: "Explorer", core: true, description: "Fast codebase exploration.", capsule: "0.3K tokens", provenance: "Core, v2", eligible: "Subagent roles", scope: "Available", childOnly: false },
    { id: "p-bash", name: "Bash", core: true, description: "Shell-focused execution persona.", capsule: "0.3K tokens", provenance: "Core, v1", eligible: "Subagent roles", scope: "Available", childOnly: false },
    { id: "p-teacher", name: "Teacher", core: true, description: "Explains and teaches rather than acts.", capsule: "0.4K tokens", provenance: "Core, v2", eligible: "Chat", scope: "Available", childOnly: false },
    { id: "p-nightwatch", name: "Night Watch", core: false, description: "Custom overnight monitoring persona.", capsule: "0.5K tokens", provenance: "Imported, scanned 2026-08-02", eligible: "Child roles only", scope: "Child only", childOnly: true }
  ];

  var scenarios = ["default", "attention", "calm", "refreshing", "exhausted", "deep-link", "update-available", "rollback", "import-conflict", "lkg-active"];

  window.PMDemoData = {
    destinations: destinations,
    providers: providers,
    providerGroups: providerGroups,
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
    scenarios: scenarios
  };
})();
