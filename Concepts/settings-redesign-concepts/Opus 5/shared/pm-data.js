/* Opus 5 — demo dataset shared by all four settings concepts.
 *
 * Realistic rather than ideal: the fixture deliberately contains connected,
 * unconfigured, loading, refreshing, degraded, managed, inherited, unavailable
 * and error states at the same time, because the packet forbids hard-coding a
 * single happy path.
 *
 * Row-state vocabulary (state.source):
 *   default | recommended | inherited | auto | notConfigured | managed |
 *   custom  | unavailable
 * plus state.requested !== state.effective for "effective value differs".
 *
 * Exposure levels: standard | advanced | expert | managed | diagnostic | unavailable
 */
(function () {
  "use strict";

  function st(o) {
    return Object.assign({
      source: "default",
      scope: "global",
      isDefault: true,
      restart: "none"
    }, o);
  }

  /* ======================================================= SETTINGS TAXONOMY */

  var categories = [
    {
      id: "general",
      title: "General & startup",
      purpose: "What opens when Puppet Master starts, and the defaults new work inherits.",
      icon: "sliders",
      keywords: ["startup", "defaults", "language", "updates", "session"],
      subcategories: [
        {
          id: "general-startup", title: "Startup", summary: "What happens when the app opens.",
          keywords: ["launch", "restore", "session"],
          settings: [
            { id: "gen-restore", label: "Restore the last session", explanation: "Reopen the threads and Goals that were active when Puppet Master last closed.", kind: "toggle",
              state: st({ value: true, defaultValue: true }) },
            { id: "gen-open-to", label: "Open to", explanation: "The surface shown after startup finishes.", kind: "select",
              options: ["Last thread", "Thread list", "Goal board", "Settings"],
              state: st({ value: "Last thread", defaultValue: "Last thread" }) },
            { id: "gen-reopen-project", label: "Reopen the last project", explanation: "Load the most recent project workspace instead of asking which to open.", kind: "toggle",
              state: st({ value: false, defaultValue: true, isDefault: false, source: "custom", changedAt: "3 days ago" }) },
            { id: "gen-warm-providers", label: "Check provider health at startup", explanation: "Refresh connection health in the background so the first request does not stall.", kind: "toggle",
              state: st({ value: true, defaultValue: true, effect: { kind: "performance", text: "Adds roughly two seconds to a cold start." } }) },
            { id: "gen-startup-diag", label: "Record a startup trace", explanation: "Write a timing trace for each launch phase. Intended for diagnosing slow starts.", kind: "toggle", exposure: "diagnostic",
              state: st({ value: false, defaultValue: false }) }
          ]
        },
        {
          id: "general-defaults", title: "Defaults for new work", summary: "What a new thread, Goal or project inherits.",
          keywords: ["inherit", "new thread", "project default"],
          settings: [
            { id: "gen-default-persona", label: "Persona for new threads", explanation: "The Persona a new Assistant thread starts with. Threads can override this at any time.", kind: "select",
              options: ["Assistant", "Collaborator", "General", "Researcher", "Teacher"],
              state: st({ value: "Collaborator", defaultValue: "Assistant", isDefault: false, source: "custom" }) },
            { id: "gen-default-access", label: "Access mode for new threads", explanation: "How much a new thread may do before asking. Plan and Review remain effect-limited regardless.", kind: "select",
              options: ["Ask for approval", "Auto accept edits", "Auto", "Full Access"],
              state: st({ value: "Full Access", defaultValue: "Ask for approval", isDefault: false, source: "custom",
                effect: { kind: "safety", text: "New threads may edit files and run commands without asking." } }) },
            { id: "gen-default-scope", label: "Where new threads start", explanation: "The working scope a new thread opens against.", kind: "select",
              options: ["Current project", "Last used project", "Ask each time"],
              state: st({ value: "Current project", defaultValue: "Current project" }) },
            { id: "gen-project-override", label: "Let projects override these defaults", explanation: "A project may carry its own defaults for Persona, access mode and scope.", kind: "toggle",
              state: st({ value: true, defaultValue: true, scope: "global" }) },
            { id: "gen-inherit-parent", label: "Child agents inherit thread defaults", explanation: "Subagents start from the parent thread's Persona and access ceiling rather than the global default.", kind: "toggle",
              state: st({ value: true, defaultValue: true, source: "inherited", inheritedFrom: "Project: orchard-api", isDefault: true }) }
          ]
        },
        {
          id: "general-updates", title: "Language & updates", summary: "Interface language and how updates arrive.",
          keywords: ["language", "locale", "update", "channel", "release"],
          settings: [
            { id: "gen-language", label: "Interface language", explanation: "Language used for the Puppet Master interface. Model responses follow the thread, not this setting.", kind: "select",
              options: ["Automatic (English)", "English", "German", "Japanese", "Portuguese (Brazil)"],
              state: st({ value: "Automatic (English)", defaultValue: "Automatic (English)", source: "auto" }) },
            { id: "gen-update-channel", label: "Update channel", explanation: "Which builds this installation receives.", kind: "select",
              options: ["Stable", "Preview", "Nightly"],
              state: st({ value: "Stable", defaultValue: "Stable", source: "managed", exposureNote: "Set by your organisation's device policy.",
                reason: "Managed by device policy 'orchard-workstations'." }), exposure: "managed" },
            { id: "gen-update-auto", label: "Install updates automatically", explanation: "Download and apply updates in the background, then apply them on the next restart.", kind: "toggle",
              state: st({ value: true, defaultValue: true, source: "managed", reason: "Managed by device policy 'orchard-workstations'." }), exposure: "managed" },
            { id: "gen-telemetry", label: "Share anonymous usage statistics", explanation: "Send counts of feature use. Never includes prompts, code, file names or provider credentials.", kind: "toggle",
              state: st({ value: false, defaultValue: false, effect: { kind: "privacy", text: "Off. Nothing is sent." } }) },
            { id: "gen-beta-features", label: "Show unreleased features", explanation: "Reveal features that are still being built. They may change or disappear between builds.", kind: "toggle", exposure: "advanced",
              state: st({ value: false, defaultValue: false }) }
          ]
        }
      ]
    },

    {
      id: "appearance",
      title: "Appearance & input",
      purpose: "Theme, density, motion, and how text input behaves across the app.",
      icon: "sun",
      keywords: ["theme", "density", "motion", "font", "spellcheck", "keyboard"],
      subcategories: [
        {
          id: "appearance-theme", title: "Theme & material", summary: "Colour, material and contrast.",
          keywords: ["dark", "light", "glass", "retro", "contrast"],
          settings: [
            { id: "app-theme", label: "Theme", explanation: "Overall look. Information architecture and status meaning are identical in every theme.", kind: "select",
              options: ["Friendly Dark", "Friendly Light", "Glass Dark", "Glass Light", "Retro Dark", "Retro Light", "Basic Dark", "Basic Light"],
              state: st({ value: "Friendly Dark", defaultValue: "Friendly Dark" }) },
            { id: "app-theme-follow", label: "Follow the system appearance", explanation: "Switch between the light and dark variant of the chosen theme with the operating system.", kind: "toggle",
              state: st({ value: true, defaultValue: true, source: "auto" }) },
            { id: "app-contrast", label: "Increase contrast", explanation: "Strengthen borders and text contrast across every theme.", kind: "toggle",
              state: st({ value: false, defaultValue: false }) },
            { id: "app-accent", label: "Accent colour", explanation: "Used for selection, focus and primary actions. Status colours do not change.", kind: "select",
              options: ["Theme default", "Blue", "Teal", "Amber", "Violet"],
              state: st({ value: "Theme default", defaultValue: "Theme default" }) }
          ]
        },
        {
          id: "appearance-density", title: "Density & layout", summary: "How much fits on screen.",
          keywords: ["density", "compact", "rail", "panel", "width"],
          settings: [
            { id: "app-density", label: "Interface density", explanation: "Row height and spacing throughout the app.", kind: "select",
              options: ["Comfortable", "Compact", "Very compact"],
              state: st({ value: "Comfortable", defaultValue: "Comfortable" }) },
            { id: "app-rail-default", label: "Navigation rail starts open", explanation: "Whether the left rail shows labels when a window opens.", kind: "toggle",
              state: st({ value: true, defaultValue: true }) },
            { id: "app-panel-default", label: "Assistant panel starts open", explanation: "Whether the Assistant panel is docked when a window opens.", kind: "toggle",
              state: st({ value: false, defaultValue: false, isDefault: true }) },
            { id: "app-narrow-behaviour", label: "When the window is narrow", explanation: "What the shell sheds first when horizontal space runs out.", kind: "select",
              options: ["Collapse the rail, then hide the panel", "Hide the panel, then collapse the rail", "Ask"],
              state: st({ value: "Hide the panel, then collapse the rail", defaultValue: "Collapse the rail, then hide the panel", isDefault: false, source: "custom" }) }
          ]
        },
        {
          id: "appearance-motion", title: "Motion", summary: "How much the interface moves.",
          keywords: ["animation", "reduced motion", "transition"],
          settings: [
            { id: "app-motion", label: "Interface motion", explanation: "Full motion, or short state changes that reach the same result.", kind: "select",
              options: ["Full", "Reduced", "Follow the system"],
              state: st({ value: "Follow the system", defaultValue: "Follow the system", source: "auto",
                effectiveNote: "Currently full — the system does not request reduced motion." }) },
            { id: "app-motion-streaming", label: "Animate streaming responses", explanation: "Reveal streamed text progressively rather than in blocks.", kind: "toggle",
              state: st({ value: true, defaultValue: true }) },
            { id: "app-motion-progress", label: "Show progress motion for background work", explanation: "Animate long-running refreshes and Goal progress. Calm states never animate.", kind: "toggle",
              state: st({ value: true, defaultValue: true }) },
            { id: "app-motion-scroll", label: "Smooth scrolling on jump", explanation: "Travel to a jumped-to section instead of moving instantly.", kind: "toggle",
              state: st({ value: true, defaultValue: true }) }
          ]
        },
        {
          id: "appearance-input", title: "Writing & spellcheck", summary: "Text input behaviour and dictionaries.",
          keywords: ["spellcheck", "spelling", "dictionary", "grammar", "language"],
          settings: [
            { id: "spell-enabled", label: "Check spelling", explanation: "Underline likely misspellings in prose fields. Nothing is ever replaced automatically.", kind: "toggle",
              state: st({ value: true, defaultValue: true }) },
            { id: "spell-language", label: "Spelling language", explanation: "Which dictionary is used. Automatic follows the text and the interface language.", kind: "select",
              options: ["Automatic", "English (US)", "English (UK)", "German", "Portuguese (Brazil)"],
              state: st({ value: "Automatic", defaultValue: "Automatic", source: "auto" }) },
            { id: "spell-source", label: "Dictionary source", explanation: "Where dictionaries come from. Automatic prefers the operating-system service and falls back to Puppet Master's own.", kind: "select",
              options: ["Automatic", "System dictionaries only", "PM local dictionaries only"],
              state: st({ value: "Automatic", defaultValue: "Automatic", recommendedValue: "Automatic", source: "recommended" }) },
            { id: "spell-personal", label: "Personal dictionary", explanation: "Words you have added. Applies to every project on this device.", kind: "manager", managerId: "manager-dictionaries",
              state: st({ value: "24 words", source: "custom", isDefault: false }) },
            { id: "spell-project", label: "Project dictionary", explanation: "Words shared with everyone working on this project.", kind: "manager", managerId: "manager-dictionaries",
              state: st({ value: "Used when available · 61 words", source: "inherited", inheritedFrom: "Project: orchard-api" }) },
            { id: "spell-technical", label: "Check technical prose", explanation: "Also check text that looks like code, identifiers or paths. Off by default because it produces mostly false results.", kind: "toggle", exposure: "advanced",
              state: st({ value: false, defaultValue: false }) },
            { id: "spell-unknown-names", label: "Underline unknown names", explanation: "Underline words with no close dictionary match, such as product or person names.", kind: "toggle", exposure: "advanced",
              state: st({ value: false, defaultValue: false }) },
            { id: "spell-language-packs", label: "Additional installed language packs", explanation: "Dictionaries installed beyond the built-in set, and where each one came from.", kind: "manager", managerId: "manager-dictionaries", exposure: "advanced",
              state: st({ value: "2 packs installed", source: "custom", isDefault: false }) },
            { id: "spell-thread-overrides", label: "Thread/project overrides", explanation: "Threads or projects that have changed spellcheck away from the global default.", kind: "manager", managerId: "manager-dictionaries", exposure: "advanced",
              state: st({ value: "1 thread overridden", source: "custom", isDefault: false }) },
            { id: "spell-grammar", label: "Grammar and style assistance", explanation: "A separate, optional feature. It uses a provider, so it discloses its route and usage before it runs.", kind: "toggle", exposure: "advanced",
              state: st({ value: false, defaultValue: false, source: "notConfigured",
                effect: { kind: "privacy", text: "Off. When enabled it sends the draft to the configured provider and is attributed in Usage." } }) }
          ]
        }
      ]
    },

    {
      id: "agents",
      title: "Agents & models",
      purpose: "Providers, accounts, connections, models and which route does which job.",
      icon: "cpu",
      keywords: ["provider", "account", "model", "connection", "api", "cli", "oauth", "role"],
      subcategories: [
        {
          id: "agents-providers", title: "Providers and accounts", summary: "Every route Puppet Master can invoke.",
          keywords: ["claude", "openai", "antigravity", "ollama", "openrouter", "copilot", "free"],
          settings: [
            { id: "prov-manager", label: "Providers, accounts and connections", explanation: "Installed tools, signed-in apps, API keys, server endpoints and free routes, with health and usage for each.", kind: "manager", managerId: "manager-providers",
              state: st({ value: "8 families · 2 need attention", source: "custom", isDefault: false }) },
            { id: "prov-default-account", label: "Preferred account when several are signed in", explanation: "Which account is used first when a provider has more than one. Changing this affects future requests only.", kind: "select",
              options: ["Most recently used", "Highest remaining usage", "Explicit priority order"],
              state: st({ value: "Explicit priority order", defaultValue: "Most recently used", isDefault: false, source: "custom" }) },
            { id: "prov-sticky", label: "Keep a thread on one account", explanation: "Once a thread starts on an account, keep using it even if another becomes preferable.", kind: "toggle",
              state: st({ value: true, defaultValue: true, scope: "thread" }) },
            { id: "prov-health-interval", label: "Re-check connection health every", explanation: "How often idle connections are re-checked in the background.", kind: "select", exposure: "advanced",
              options: ["5 minutes", "15 minutes", "1 hour", "Only when used"],
              state: st({ value: "15 minutes", defaultValue: "15 minutes" }) }
          ]
        },
        {
          id: "agents-models", title: "Model catalogue", summary: "Which models are visible, favoured and ordered.",
          keywords: ["catalog", "models.dev", "favourite", "alias", "priority", "fast", "effort"],
          settings: [
            { id: "model-manager", label: "Models and capabilities", explanation: "Favourites, aliases, ordering, capability evidence and per-model availability.", kind: "manager", managerId: "manager-providers",
              state: st({ value: "25 models · 7 unavailable", source: "custom", isDefault: false }) },
            { id: "model-catalog-refresh", label: "Refresh catalogues in the background", explanation: "Keep models.dev and Free Coding Models current, serving the last known good catalogue while a refresh runs.", kind: "toggle",
              state: st({ value: true, defaultValue: true }) },
            { id: "model-catalog-quarantine", label: "Quarantine a catalogue that fails validation", explanation: "If an update arrives malformed, keep the previous catalogue and raise a notice instead of applying it.", kind: "toggle", exposure: "advanced",
              state: st({ value: true, defaultValue: true, recommendedValue: true, source: "recommended" }) },
            { id: "model-hide-unavailable", label: "Hide models you cannot currently use", explanation: "Keep models without entitlement out of pickers. They stay findable in search.", kind: "toggle",
              state: st({ value: false, defaultValue: false }) },
            { id: "model-infer-fast", label: "Infer Fast mode from the model name", explanation: "Disabled deliberately. Fast and reasoning support come from capability evidence, never from a name pattern.", kind: "toggle", exposure: "expert",
              state: st({ value: false, defaultValue: false, source: "unavailable",
                reason: "Name-based inference produced wrong Fast and modality claims and is no longer offered.",
                effect: { kind: "safety", text: "Turning this on would route requests to modes a model may not support." } }) }
          ]
        },
        {
          id: "agents-roles", title: "Role assignments", summary: "Which route does which job.",
          keywords: ["main", "planning", "verifier", "vision", "compression", "web", "subagent"],
          settings: [
            { id: "role-main", label: "Main Assistant", explanation: "The route used for ordinary Assistant conversation.", kind: "select",
              options: ["Claude Opus 4.6 (work)", "Claude Sonnet 4.6 (work)", "GPT-5.2 (API)", "Ask each time"],
              state: st({ value: "Claude Opus 4.6 (work)", defaultValue: "Claude Opus 4.6 (work)" }) },
            { id: "role-planning", label: "PRD and Planning conversation", explanation: "PRD Builder and the Planning Wizard always use a high-quality conversational route. Architecture, clarification and synthesis are never downgraded to save usage.", kind: "select",
              options: ["Claude Opus 4.6 (work)", "GPT-5.2 (API)", "Match the Main Assistant"],
              state: st({ value: "Match the Main Assistant", defaultValue: "Match the Main Assistant", recommendedValue: "Match the Main Assistant", source: "recommended",
                effect: { kind: "cost", text: "Planning conversation is a high-quality route by design." } }) },
            { id: "role-goal-worker", label: "Goal worker", explanation: "Executes Goal steps. May be a cheaper route than the planning conversation.", kind: "select",
              options: ["Claude Sonnet 4.6 (work)", "Claude Opus 4.6 (work)", "GPT-5.2 (API)", "Qwen3 Coder (Ollama)"],
              state: st({ value: "Claude Sonnet 4.6 (work)", defaultValue: "Claude Sonnet 4.6 (work)" }) },
            { id: "role-verifier", label: "Verifier and auditor", explanation: "Independently checks completed work. Keeping this different from the worker catches more.", kind: "select",
              options: ["Claude Opus 4.6 (work)", "GPT-5.2 (API)", "Match the Goal worker"],
              state: st({ value: "GPT-5.2 (API)", defaultValue: "Match the Goal worker", isDefault: false, source: "custom" }) },
            { id: "role-vision", label: "Vision and media analysis", explanation: "Reads images, screenshots and diagrams. Falls back to a transformation route when a model has no native vision.", kind: "select",
              options: ["Claude Opus 4.6 (work)", "GPT-5.2 (API)", "Automatic by capability"],
              state: st({ value: "Automatic by capability", defaultValue: "Automatic by capability", source: "auto" }) },
            { id: "role-compression", label: "Context maintenance", explanation: "Compaction and summarisation between turns. A smaller model is usually the right choice here.", kind: "select",
              options: ["Claude Haiku 4.5 (work)", "Claude Sonnet 4.6 (work)", "Qwen3 Coder (Ollama)"],
              state: st({ value: "Claude Haiku 4.5 (work)", defaultValue: "Claude Haiku 4.5 (work)" }) },
            { id: "role-web", label: "Web extraction", explanation: "Turns fetched pages into usable text. Bounded work that does not need a premium route.", kind: "select",
              options: ["Claude Haiku 4.5 (work)", "Qwen3 Coder (Ollama)", "Match the Goal worker"],
              state: st({ value: "Qwen3 Coder (Ollama)", defaultValue: "Claude Haiku 4.5 (work)", isDefault: false, source: "custom",
                effect: { kind: "cost", text: "Runs locally, so it consumes no provider allowance." } }) },
            { id: "role-skill-search", label: "Skill search", explanation: "Chooses which skills are relevant to a turn. Small, frequent and latency-sensitive.", kind: "select", exposure: "advanced",
              options: ["Claude Haiku 4.5 (work)", "Local index only"],
              state: st({ value: "Local index only", defaultValue: "Local index only" }) },
            { id: "role-approval-review", label: "Approval review", explanation: "Summarises a proposed action for a person to approve. It never decides on its own, so a small, fast route is enough.", kind: "select",
              options: ["Claude Haiku 4.5 (work)", "Claude Sonnet 4.6 (work)", "Match the Main Assistant"],
              state: st({ value: "Claude Haiku 4.5 (work)", defaultValue: "Claude Haiku 4.5 (work)" }) },
            { id: "role-mcp-routing", label: "MCP/tool routing", explanation: "Chooses which connected MCP server or tool a turn should reach for. Small and frequent, like skill search.", kind: "select",
              options: ["Claude Haiku 4.5 (work)", "Local index only", "Automatic by capability"],
              state: st({ value: "Automatic by capability", defaultValue: "Automatic by capability", source: "auto" }) },
            { id: "role-subagents-crew", label: "Subagents/Crew roles", explanation: "The route a spawned subagent or Crew member uses when its template does not name one explicitly.", kind: "select",
              options: ["Claude Sonnet 4.6 (work)", "Claude Opus 4.6 (work)", "Match the Goal worker"],
              state: st({ value: "Match the Goal worker", defaultValue: "Match the Goal worker" }) }
          ]
        },
        {
          id: "agents-personas", title: "Personas", summary: "How an agent behaves — never what it is allowed to do.",
          keywords: ["persona", "behaviour", "role", "capsule", "scope"],
          settings: [
            { id: "persona-manager", label: "Personas", explanation: "Durable definitions, the compact capsule each turn actually receives, eligibility, and the scope a Persona applies to.", kind: "manager", managerId: "manager-personas",
              state: st({ value: "9 personas · 1 draft · 1 child-only", source: "custom", isDefault: false }) },
            { id: "persona-scope-default", label: "Choosing a Persona in Chat applies to", explanation: "Where a Persona chosen mid-conversation takes effect. Project and global defaults only affect future threads.", kind: "select",
              options: ["This thread", "This Goal or PlanningRun", "This turn only"],
              state: st({ value: "This thread", defaultValue: "This thread", scope: "thread" }) },
            { id: "persona-send-full", label: "Send the full Persona definition each turn", explanation: "Disabled deliberately. A Persona is compiled to a compact behaviour capsule; sending the whole source would crowd out the actual task.", kind: "toggle", exposure: "managed",
              state: st({ value: false, defaultValue: false, source: "managed",
                reason: "Personas are compiled to a bounded capsule by the runtime.",
                effect: { kind: "performance", text: "The full definitions total roughly 11,000 words across nine personas." } }) },
            { id: "persona-child-defaults", label: "Offer child-only Personas as Chat defaults", explanation: "Child-only Personas such as Bash are written for delegated work and read badly as a conversation partner.", kind: "toggle", exposure: "advanced",
              state: st({ value: false, defaultValue: false }) }
          ]
        },
        {
          id: "agents-continuation", title: "When a route runs out", summary: "What happens when usage or entitlement is exhausted.",
          keywords: ["usage", "exhausted", "fallback", "extra", "reset", "billing"],
          settings: [
            { id: "cont-note", label: "What happens next is set per provider", explanation: "There is no single global rule. Each provider offers only the continuations its plan actually supports; open a provider to choose.", kind: "manager", managerId: "manager-providers",
              state: st({ value: "3 providers configured, 1 needs a choice", source: "custom", isDefault: false }) },
            { id: "cont-warn", label: "Warn before switching route mid-thread", explanation: "Ask before continuing a thread on a different account, model or billing route.", kind: "toggle",
              state: st({ value: true, defaultValue: true, recommendedValue: true, source: "recommended" }) },
            { id: "cont-inflight", label: "Never move a request that is already running", explanation: "Account and model changes apply to the next request. A request in flight always finishes on the route it started on.", kind: "toggle", exposure: "managed",
              state: st({ value: true, defaultValue: true, source: "managed", reason: "Enforced by the runtime. Moving a request in flight would lose partial output and double-bill." }) },
            { id: "cont-free-fallback", label: "Offer free models as a fallback", explanation: "When a paid route is exhausted, suggest an eligible free route rather than stopping silently.", kind: "toggle",
              state: st({ value: true, defaultValue: true }) }
          ]
        },
        {
          id: "agents-advanced", title: "Advanced routing", summary: "Retries, timeouts and diagnostics.",
          keywords: ["retry", "timeout", "streaming", "trace"],
          settings: [
            { id: "adv-retry", label: "Retry a failed request", explanation: "How many times to retry before reporting a failure to the thread.", kind: "select", exposure: "advanced",
              options: ["Never", "Once", "Twice", "Three times"],
              state: st({ value: "Twice", defaultValue: "Twice" }) },
            { id: "adv-timeout", label: "Request timeout", explanation: "How long to wait for a first token before treating a route as stalled.", kind: "select", exposure: "advanced",
              options: ["30 seconds", "60 seconds", "120 seconds", "No limit"],
              state: st({ value: "60 seconds", defaultValue: "60 seconds" }) },
            { id: "adv-raw-trace", label: "Record raw provider exchanges", explanation: "Writes complete request and response bodies to disk for debugging.", kind: "toggle", exposure: "expert",
              state: st({ value: false, defaultValue: false,
                effect: { kind: "privacy", text: "Traces contain your prompts and code in plain text on this device." } }) },
            { id: "adv-parallel-tools", label: "Allow parallel tool calls", explanation: "Let a model issue independent tool calls at the same time when it supports doing so.", kind: "toggle", exposure: "advanced",
              state: st({ value: true, defaultValue: true }) }
          ]
        }
      ]
    },

    {
      id: "permissions",
      title: "Permissions & safety",
      purpose: "What agents may do on their own, and what always needs a person.",
      icon: "shield",
      keywords: ["approval", "filesafe", "sandbox", "network", "danger"],
      subcategories: [
        {
          id: "perm-approvals", title: "Approvals", summary: "What is asked before it happens.",
          keywords: ["ask", "approve", "auto accept"],
          settings: [
            { id: "perm-mode", label: "Access mode for this project", explanation: "The ceiling for every thread in this project. A thread may be stricter but never broader.", kind: "select",
              options: ["Ask for approval", "Auto accept edits", "Auto", "Full Access"],
              state: st({ value: "Full Access", defaultValue: "Ask for approval", isDefault: false, source: "custom", scope: "project",
                effect: { kind: "safety", text: "Agents may edit files and run commands in this project without asking." } }) },
            { id: "perm-destructive", label: "Always ask before destructive commands", explanation: "Deleting outside the project, force-pushing, and history rewrites always stop for a person, whatever the access mode.", kind: "toggle", exposure: "managed",
              state: st({ value: true, defaultValue: true, source: "managed", reason: "Enforced by FileSafe. It cannot be turned off from Settings." }) },
            { id: "perm-remember", label: "Remember an approval for", explanation: "How long an approval keeps applying after you grant it.", kind: "select",
              options: ["This action only", "This thread", "This Goal", "Until Puppet Master closes"],
              state: st({ value: "This Goal", defaultValue: "This thread", isDefault: false, source: "custom" }) },
            { id: "perm-review-batch", label: "Group related approvals", explanation: "Present a set of related edits as one decision instead of asking for each file.", kind: "toggle",
              state: st({ value: true, defaultValue: true }) }
          ]
        },
        {
          id: "perm-filesafe", title: "FileSafe", summary: "Which paths are readable and writable.",
          keywords: ["path", "write", "protect", "backup"],
          settings: [
            { id: "fs-scope", label: "Writable paths", explanation: "Where agents may create or change files without a separate grant.", kind: "manager", managerId: "manager-filesafe",
              state: st({ value: "Project root and 2 additional paths", source: "custom", isDefault: false, scope: "project" }) },
            { id: "fs-protect-vcs", label: "Protect version-control internals", explanation: "Block direct writes to .git and equivalent directories.", kind: "toggle", exposure: "managed",
              state: st({ value: true, defaultValue: true, source: "managed", reason: "Enforced by FileSafe." }) },
            { id: "fs-snapshot", label: "Snapshot before a bulk change", explanation: "Take a restore point before an agent rewrites more than a handful of files.", kind: "toggle",
              state: st({ value: true, defaultValue: true, recommendedValue: true, source: "recommended" }) },
            { id: "fs-outside-project", label: "Allow reads outside the project", explanation: "Permit reading files elsewhere on this device when a task genuinely needs it.", kind: "select",
              options: ["Never", "Ask each time", "Allow for this Goal", "Always"],
              state: st({ value: "Ask each time", defaultValue: "Ask each time" }) }
          ]
        },
        {
          id: "perm-sandbox", title: "Command execution", summary: "How commands run.",
          keywords: ["shell", "sandbox", "network", "container"],
          settings: [
            { id: "sbx-mode", label: "Run commands in a sandbox", explanation: "Restrict filesystem and network reach for commands an agent starts.", kind: "select",
              options: ["Always", "Outside the project only", "Never"],
              state: st({ value: "Outside the project only", defaultValue: "Always", isDefault: false, source: "custom",
                effect: { kind: "safety", text: "Commands inside the project run unsandboxed." } }) },
            { id: "sbx-network", label: "Network access for commands", explanation: "Whether commands started by an agent may reach the network.", kind: "select",
              options: ["Blocked", "Ask each time", "Allowed"],
              state: st({ value: "Ask each time", defaultValue: "Ask each time" }) },
            { id: "sbx-timeout", label: "Stop a command after", explanation: "How long a single command may run before it is stopped.", kind: "select", exposure: "advanced",
              options: ["2 minutes", "10 minutes", "30 minutes", "No limit"],
              state: st({ value: "10 minutes", defaultValue: "10 minutes" }) },
            { id: "sbx-disable-all", label: "Disable every safety check", explanation: "Removes sandboxing, FileSafe path checks and destructive-command confirmation at once.", kind: "toggle", exposure: "expert",
              state: st({ value: false, defaultValue: false,
                effect: { kind: "safety", text: "An agent could delete or overwrite anything this account can reach." } }) }
          ]
        },
        {
          id: "perm-crossproject", title: "Cross-project access", summary: "Reaching another project's work.",
          keywords: ["cross", "project", "grant", "read", "write"],
          settings: [
            { id: "xp-enabled", label: "Cross-project access", explanation: "Off unless you grant it. Read and write are granted separately, for a named pair of projects.", kind: "select",
              options: ["Off", "Read only, once", "Read only, this Goal", "Read and write, named projects"],
              state: st({ value: "Off", defaultValue: "Off" }) },
            { id: "xp-grants", label: "Active grants", explanation: "Grants currently in force, with their scope and expiry.", kind: "manager", managerId: "manager-filesafe",
              state: st({ value: "1 grant · orchard-api reads orchard-shared", source: "custom", isDefault: false }) },
            { id: "xp-children", label: "Children inherit a cross-project grant", explanation: "Whether a subagent may use a grant made to its parent.", kind: "toggle",
              state: st({ value: false, defaultValue: false }) },
            { id: "xp-audit", label: "Record every cross-project read", explanation: "Write an entry to the project log whenever another project's files are read.", kind: "toggle", exposure: "advanced",
              state: st({ value: true, defaultValue: true, source: "recommended", recommendedValue: true }) }
          ]
        }
      ]
    },

    {
      id: "code",
      title: "Code, editor & terminal",
      purpose: "How Puppet Master reads, edits, formats and runs code.",
      icon: "terminal",
      keywords: ["editor", "format", "lsp", "shell", "terminal", "language"],
      subcategories: [
        {
          id: "code-editing", title: "Editing", summary: "How edits are produced and applied.",
          keywords: ["diff", "format", "indent", "patch"],
          settings: [
            { id: "code-diff-style", label: "Show edits as", explanation: "How a proposed change is presented before it is applied.", kind: "select",
              options: ["Side by side", "Unified", "Inline in the file"],
              state: st({ value: "Side by side", defaultValue: "Side by side" }) },
            { id: "code-format-on-apply", label: "Format after applying an edit", explanation: "Run the project's formatter once an edit lands, so agent output matches house style.", kind: "toggle",
              state: st({ value: true, defaultValue: true, source: "inherited", inheritedFrom: "Project: orchard-api" }) },
            { id: "code-indent", label: "Indentation", explanation: "Detected from the file being edited unless you fix it here.", kind: "select",
              options: ["Detect from file", "Spaces", "Tabs"],
              state: st({ value: "Detect from file", defaultValue: "Detect from file", source: "auto" }) },
            { id: "code-max-edit", label: "Largest automatic edit", explanation: "Above this size an edit always stops for review, whatever the access mode.", kind: "select",
              options: ["50 lines", "200 lines", "1000 lines", "No limit"],
              state: st({ value: "200 lines", defaultValue: "200 lines" }) }
          ]
        },
        {
          id: "code-lsp", title: "Language servers", summary: "Diagnostics, definitions and formatting.",
          keywords: ["lsp", "language server", "diagnostics", "typescript", "rust"],
          settings: [
            { id: "lsp-manager", label: "Language servers", explanation: "Detected and installed servers, language coverage, health and which one owns formatting.", kind: "manager", managerId: "manager-lsp",
              state: st({ value: "6 servers · 1 conflict", source: "custom", isDefault: false }) },
            { id: "lsp-autostart", label: "Start language servers automatically", explanation: "Launch a server the first time a matching file is opened.", kind: "toggle",
              state: st({ value: true, defaultValue: true }) },
            { id: "lsp-diagnostics-to-agent", label: "Give diagnostics to agents", explanation: "Let agents read language-server errors for the files they are working on.", kind: "toggle",
              state: st({ value: true, defaultValue: true, recommendedValue: true, source: "recommended" }) },
            { id: "lsp-trace", label: "Log language-server traffic", explanation: "Record the full protocol exchange for a server. Verbose; for diagnosing a specific failure.", kind: "toggle", exposure: "diagnostic",
              state: st({ value: false, defaultValue: false }) }
          ]
        },
        {
          id: "code-terminal", title: "Terminal", summary: "Shell, appearance and transcript.",
          keywords: ["shell", "profile", "ansi", "font", "cwd"],
          settings: [
            { id: "term-manager", label: "Terminal profiles", explanation: "Shells, fonts, colour palettes, cursor, environment policy and transcript retention, with a live preview.", kind: "manager", managerId: "manager-terminal",
              state: st({ value: "4 profiles · default: zsh", source: "custom", isDefault: false }) },
            { id: "term-default-profile", label: "Default profile", explanation: "The profile new terminals open with.", kind: "select",
              options: ["zsh (login)", "bash", "PowerShell 7", "Project runner"],
              state: st({ value: "zsh (login)", defaultValue: "zsh (login)" }) },
            { id: "term-cwd", label: "Starting directory", explanation: "Where a new terminal opens. Auto-detected follows the file or project in focus.", kind: "select",
              options: ["Auto-detected", "Project root", "Home directory", "Last used"],
              state: st({ value: "Auto-detected", defaultValue: "Auto-detected", source: "auto",
                effectiveNote: "Currently ~/code/orchard-api" }) },
            { id: "term-shell-path", label: "Shell executable", explanation: "Leave inherited to use the login shell the operating system reports.", kind: "text",
              state: st({ value: "Inherited from the system", source: "inherited", inheritedFrom: "System login shell",
                effectiveNote: "/bin/zsh" }) },
            { id: "term-link-click", label: "Clicking a link in the terminal", explanation: "What happens when terminal output contains a URL.", kind: "select", exposure: "advanced",
              options: ["Ask", "Open in the browser", "Copy the address", "Do nothing"],
              state: st({ value: "Ask", defaultValue: "Ask" }) }
          ]
        },
        {
          id: "code-testing", title: "Running and testing", summary: "How code is executed and verified.",
          keywords: ["test", "run", "port", "server", "debug"],
          settings: [
            { id: "run-detect", label: "Detect run and test commands", explanation: "Read the project manifest to learn how to build, run and test it.", kind: "toggle",
              state: st({ value: true, defaultValue: true, source: "inherited", inheritedFrom: "Project: orchard-api" }) },
            { id: "run-port-policy", label: "When a port is already in use", explanation: "What to do when a dev server's port is taken.", kind: "select",
              options: ["Pick a free port", "Ask", "Fail"],
              state: st({ value: "Pick a free port", defaultValue: "Pick a free port", recommendedValue: "Pick a free port", source: "recommended" }) },
            { id: "run-never-stop", label: "Never stop a process Puppet Master did not start", explanation: "Protects servers and jobs you started yourself.", kind: "toggle", exposure: "managed",
              state: st({ value: true, defaultValue: true, source: "managed", reason: "Enforced by the process manager." }) },
            { id: "run-test-visibility", label: "Show test output", explanation: "How much of a test run appears in the thread.", kind: "select",
              options: ["Failures only", "Summary", "Everything"],
              state: st({ value: "Failures only", defaultValue: "Failures only" }) }
          ]
        }
      ]
    },

    {
      id: "context",
      title: "Context & memory",
      purpose: "What each request actually sees, and what Puppet Master remembers between them.",
      icon: "brain",
      keywords: ["context", "memory", "history", "agents.md", "compaction", "retention"],
      subcategories: [
        {
          id: "context-turn", title: "What each turn sees", summary: "The narrow view admitted into a request.",
          keywords: ["admit", "relevant", "previous chats", "instructions"],
          settings: [
            { id: "ctx-manager", label: "Context and instructions", explanation: "Which sources were admitted last turn, which were left out and why, and the precedence between them.", kind: "manager", managerId: "manager-context",
              state: st({ value: "9 sources admitted · 4 omitted", source: "custom", isDefault: false }) },
            { id: "ctx-prev-chats", label: "Use relevant previous chats", explanation: "Search earlier threads for material relevant to the current turn.", kind: "toggle",
              state: st({ value: true, defaultValue: true }) },
            { id: "ctx-project-code", label: "Use relevant project code", explanation: "Retrieve the parts of the codebase a turn actually needs rather than sending the tree.", kind: "toggle",
              state: st({ value: true, defaultValue: true }) },
            { id: "ctx-logs", label: "Use relevant logs", explanation: "Admit recent runtime and test output when it bears on the question.", kind: "toggle",
              state: st({ value: false, defaultValue: true, isDefault: false, source: "custom" }) },
            { id: "ctx-handoff", label: "Include the parent agent's handoff", explanation: "Give a subagent the brief its parent wrote, rather than the parent's whole thread.", kind: "toggle",
              state: st({ value: true, defaultValue: true }) },
            { id: "ctx-journal", label: "Include the current attempt journal", explanation: "Let a retry see what the previous attempt already tried.", kind: "toggle",
              state: st({ value: true, defaultValue: true, recommendedValue: true, source: "recommended" }) }
          ]
        },
        {
          id: "context-instructions", title: "Project instructions", summary: "AGENTS.md and scoped guidance.",
          keywords: ["agents.md", "instructions", "precedence", "scope"],
          settings: [
            { id: "ctx-agents-md", label: "Use AGENTS.md files", explanation: "Read scoped instruction files from the project, nearest file winning.", kind: "toggle",
              state: st({ value: true, defaultValue: true }) },
            { id: "ctx-agents-chain", label: "Instruction precedence", explanation: "Which instruction source wins when two disagree.", kind: "select", exposure: "advanced",
              options: ["Nearest file wins", "Project root wins", "Merge, flag conflicts"],
              state: st({ value: "Nearest file wins", defaultValue: "Nearest file wins" }) },
            { id: "ctx-global-instructions", label: "Personal instructions", explanation: "Guidance that applies to your work in every project on this device.", kind: "manager", managerId: "manager-context",
              state: st({ value: "1 file · 340 words", source: "custom", isDefault: false }) },
            { id: "ctx-policy-as-prose", label: "Restate policy as prompt text", explanation: "Disabled deliberately. Permissions, budgets, FileSafe and routing are enforced outside the model, not repeated as instructions it could talk itself out of.", kind: "toggle", exposure: "managed",
              state: st({ value: false, defaultValue: false, source: "managed",
                reason: "Deterministic policy is enforced by the runtime. Restating it as prose wastes context and is not binding." }) }
          ]
        },
        {
          id: "context-memory", title: "Assistant memory", summary: "Evidence-backed things worth keeping.",
          keywords: ["memory", "gist", "recall", "half-life", "pin", "verify"],
          settings: [
            { id: "mem-manager", label: "Assistant memory", explanation: "Evidence-backed notes with provenance, verification state, scope and recall behaviour.", kind: "manager", managerId: "manager-memory",
              state: st({ value: "142 notes · 7 awaiting review", source: "custom", isDefault: false }) },
            { id: "mem-enabled", label: "Remember things between threads", explanation: "Let the Assistant keep notes it can recall in later conversations.", kind: "toggle",
              state: st({ value: true, defaultValue: true }) },
            { id: "mem-halflife", label: "Recall half-life", explanation: "How quickly an unused note stops being offered. It fades from active recall; it is never deleted or treated as false.", kind: "select", exposure: "advanced",
              options: ["2 weeks", "6 weeks", "6 months", "Never fade"],
              state: st({ value: "6 weeks", defaultValue: "6 weeks" }) },
            { id: "mem-require-evidence", label: "Require evidence before storing", explanation: "Only keep a note when it can point at the message, file or run it came from.", kind: "toggle",
              state: st({ value: true, defaultValue: true, recommendedValue: true, source: "recommended" }) },
            { id: "mem-assistant-only", label: "Preference notes stay with the Assistant", explanation: "Your preference notes are not readable by Goal workers, Crew members or subagents.", kind: "toggle", exposure: "managed",
              state: st({ value: true, defaultValue: true, source: "managed", reason: "Assistant preference memory is scoped to the Assistant by design." }) }
          ]
        },
        {
          id: "context-retention", title: "History & compaction", summary: "How long things are kept and when they are compacted.",
          keywords: ["retention", "compact", "cache", "delete"],
          settings: [
            { id: "ret-compact", label: "Compact automatically when needed", explanation: "Summarise older turns when a thread approaches its context limit.", kind: "toggle",
              state: st({ value: true, defaultValue: true }) },
            { id: "ret-compact-warn", label: "Warn before a material context change", explanation: "Say so when compaction or a cache change will alter what the model can see.", kind: "toggle",
              state: st({ value: true, defaultValue: true, recommendedValue: true, source: "recommended" }) },
            { id: "ret-thread-history", label: "Keep thread history for", explanation: "How long full transcripts are retained on this device.", kind: "select",
              options: ["30 days", "6 months", "Forever", "Until the project is closed"],
              state: st({ value: "Forever", defaultValue: "6 months", isDefault: false, source: "custom", scope: "project" }) },
            { id: "ret-redaction", label: "Redact secrets from stored history", explanation: "Detect and mask credentials before a transcript is written to disk.", kind: "toggle",
              state: st({ value: true, defaultValue: true, source: "managed", reason: "Required by your organisation's data policy." }), exposure: "managed" }
          ]
        }
      ]
    },

    {
      id: "planning",
      title: "Planning & automation",
      purpose: "Goal Mode, PRD Builder, verification and how much runs unattended.",
      icon: "map",
      keywords: ["goal", "prd", "planning", "verify", "automation", "concurrency"],
      subcategories: [
        {
          id: "plan-goal", title: "Goal Mode", summary: "Defaults and ceilings for autonomous work.",
          keywords: ["goal", "runtime", "checkpoint", "concurrency"],
          settings: [
            { id: "goal-concurrency", label: "Most agents at once", explanation: "The configured ceiling. What is actually advisable right now depends on provider usage and is decided by Orchestrator.", kind: "select",
              options: ["1", "2", "4", "8"],
              state: st({ value: "8", defaultValue: "4", isDefault: false, source: "custom",
                effectiveNote: "Currently sustainable: 2. Claude work profile resets in 3 hours 40 minutes." }) },
            { id: "goal-checkpoint", label: "Checkpoint automatically", explanation: "Take a restore point between Goal phases so a failed phase can be replayed.", kind: "toggle",
              state: st({ value: true, defaultValue: true, recommendedValue: true, source: "recommended" }) },
            { id: "goal-low-usage", label: "When provider usage runs low", explanation: "How a running Goal reacts as allowance is consumed.", kind: "select",
              options: ["Finish the current phase and pause", "Reduce concurrency", "Switch to a configured fallback", "Ask"],
              state: st({ value: "Reduce concurrency", defaultValue: "Finish the current phase and pause", isDefault: false, source: "custom" }) },
            { id: "goal-reserve", label: "Reserve allowance for finishing", explanation: "Hold back part of the allowance so synthesis, testing, verification and repair can complete.", kind: "select",
              options: ["None", "10%", "20%", "30%"],
              state: st({ value: "20%", defaultValue: "20%", recommendedValue: "20%", source: "recommended" }) },
            { id: "goal-worktree", label: "Isolate Goal work in a worktree", explanation: "Run Goal changes in a separate worktree rather than the checkout you are using.", kind: "select",
              options: ["Always", "Ask", "Never"],
              state: st({ value: "Always", defaultValue: "Ask", isDefault: false, source: "custom" }) }
          ]
        },
        {
          id: "plan-prd", title: "PRD & Planning Wizard", summary: "How requirements conversations run.",
          keywords: ["prd", "wizard", "requirements", "clarify"],
          settings: [
            { id: "prd-route", label: "Conversation route", explanation: "Requirements clarification, architecture and synthesis always use a high-quality conversational route.", kind: "select",
              options: ["Match the Main Assistant", "Claude Opus 4.6 (work)", "GPT-5.2 (API)"],
              state: st({ value: "Match the Main Assistant", defaultValue: "Match the Main Assistant", recommendedValue: "Match the Main Assistant", source: "recommended" }) },
            { id: "prd-background-route", label: "Background extraction route", explanation: "Bounded research and repetitive classification may use a cheaper route. Final integration does not.", kind: "select", exposure: "advanced",
              options: ["Claude Haiku 4.5 (work)", "Qwen3 Coder (Ollama)", "Match the conversation route"],
              state: st({ value: "Claude Haiku 4.5 (work)", defaultValue: "Claude Haiku 4.5 (work)" }) },
            { id: "prd-downgrade", label: "Downgrade the conversation when usage is low", explanation: "Blocked deliberately. A cheap model produces requirements that look complete and are not.", kind: "toggle", exposure: "managed",
              state: st({ value: false, defaultValue: false, source: "managed",
                reason: "Planning conversation quality is not traded for allowance. Reduce concurrency or pause instead." }) },
            { id: "prd-questions", label: "Clarifying questions per round", explanation: "How many open questions the wizard raises at once.", kind: "select",
              options: ["1", "3", "5", "As many as needed"],
              state: st({ value: "3", defaultValue: "3" }) }
          ]
        },
        {
          id: "plan-verify", title: "Verification", summary: "How completed work is checked.",
          keywords: ["verify", "audit", "evidence", "certify"],
          settings: [
            { id: "ver-strength", label: "Evidence required to call work done", explanation: "How much proof a Goal must produce before it reports completion.", kind: "select",
              options: ["Claimed", "Tests pass", "Tests pass and an auditor agrees", "Independent re-implementation"],
              state: st({ value: "Tests pass and an auditor agrees", defaultValue: "Tests pass", isDefault: false, source: "custom" }) },
            { id: "ver-independent", label: "Verifier must differ from the worker", explanation: "Run verification on a different route, so a model does not mark its own homework.", kind: "toggle",
              state: st({ value: true, defaultValue: true, recommendedValue: true, source: "recommended" }) },
            { id: "ver-auto-repair", label: "Attempt repair when verification fails", explanation: "How many repair rounds run before the Goal stops and asks.", kind: "select",
              options: ["None", "One round", "Two rounds", "Until it passes"],
              state: st({ value: "Two rounds", defaultValue: "One round", isDefault: false, source: "custom" }) },
            { id: "ver-flaky", label: "Treat an intermittent test as a failure", explanation: "Whether a test that passes on retry still blocks completion.", kind: "toggle", exposure: "advanced",
              state: st({ value: true, defaultValue: false, isDefault: false, source: "custom" }) }
          ]
        },
        {
          id: "plan-guards", title: "Spend & time guards", summary: "Ceilings for unattended work.",
          keywords: ["budget", "spend", "time", "guard", "limit"],
          settings: [
            { id: "grd-time", label: "Stop unattended work after", explanation: "Wall-clock ceiling for a single Goal run.", kind: "select",
              options: ["30 minutes", "2 hours", "8 hours", "No limit"],
              state: st({ value: "2 hours", defaultValue: "2 hours" }) },
            { id: "grd-spend", label: "Spend ceiling per Goal", explanation: "Applies only to routes that bill per request. Plan-included usage is reported by the provider, not calculated here.", kind: "select",
              options: ["No ceiling", "$5", "$20", "$50"],
              state: st({ value: "$20", defaultValue: "No ceiling", isDefault: false, source: "custom",
                effect: { kind: "cost", text: "Covers API-billed routes only." } }) },
            { id: "grd-notify", label: "Tell me when a guard stops something", explanation: "Raise a notice rather than failing quietly.", kind: "toggle",
              state: st({ value: true, defaultValue: true }) },
            { id: "grd-usage-source", label: "Usage figures come from", explanation: "Settings does not compute balances. Usage owns measurement, history and projection.", kind: "manager", managerId: "manager-usage", exposure: "managed",
              state: st({ value: "Usage · provider-reported", source: "managed", reason: "Settings configures policy. Usage owns measured balances and forecasts." }) }
          ]
        }
      ]
    },

    {
      id: "collab",
      title: "Git, worktrees & Crew",
      purpose: "Branch and worktree handling, and reusable multi-agent compositions.",
      icon: "users",
      keywords: ["git", "branch", "worktree", "crew", "subagent", "collaboration"],
      subcategories: [
        {
          id: "collab-git", title: "Git", summary: "Commits, branches and safety.",
          keywords: ["commit", "branch", "push", "sign"],
          settings: [
            { id: "git-branch-policy", label: "Working on the default branch", explanation: "What an agent does when asked to change files while the default branch is checked out.", kind: "select",
              options: ["Create a branch first", "Ask", "Allow"],
              state: st({ value: "Create a branch first", defaultValue: "Create a branch first", recommendedValue: "Create a branch first", source: "recommended" }) },
            { id: "git-commit", label: "Commit automatically", explanation: "Whether an agent commits its own work without being asked.", kind: "select",
              options: ["Never", "At the end of a Goal phase", "After each verified change"],
              state: st({ value: "At the end of a Goal phase", defaultValue: "Never", isDefault: false, source: "custom" }) },
            { id: "git-push", label: "Push automatically", explanation: "Whether commits are pushed without a person asking.", kind: "toggle",
              state: st({ value: false, defaultValue: false }) },
            { id: "git-hooks", label: "Skip commit hooks", explanation: "Bypassing hooks hides failures the project deliberately checks for.", kind: "toggle", exposure: "expert",
              state: st({ value: false, defaultValue: false,
                effect: { kind: "safety", text: "Formatting, linting and secret scanning would not run." } }) }
          ]
        },
        {
          id: "collab-worktree", title: "Worktrees", summary: "Isolated checkouts for parallel work.",
          keywords: ["worktree", "isolation", "lease", "conflict"],
          settings: [
            { id: "wt-provision", label: "Provision a worktree", explanation: "When Puppet Master creates a separate checkout for a piece of work.", kind: "select",
              options: ["Automatically for Goals", "Ask", "Never"],
              state: st({ value: "Automatically for Goals", defaultValue: "Ask", isDefault: false, source: "custom" }) },
            { id: "wt-location", label: "Worktree location", explanation: "Where new worktrees are created.", kind: "text",
              state: st({ value: "Not configured", source: "notConfigured",
                effectiveNote: "Using the platform default: ~/.puppetmaster/worktrees" }) },
            { id: "wt-cleanup", label: "Remove a worktree when its work finishes", explanation: "Delete the checkout once the branch has been merged or abandoned.", kind: "select",
              options: ["Always", "Ask", "Keep"],
              state: st({ value: "Ask", defaultValue: "Ask" }) },
            { id: "wt-lease", label: "Warn about a stale lease", explanation: "Say so when another agent is still holding a worktree you are about to use.", kind: "toggle",
              state: st({ value: true, defaultValue: true }) }
          ]
        },
        {
          id: "collab-crew", title: "Crew", summary: "Reusable multi-agent compositions.",
          keywords: ["crew", "template", "role", "wave", "consensus"],
          settings: [
            { id: "crew-manager", label: "Crew templates", explanation: "Roles, Personas, candidate routes, concurrency, guards, isolation and failure policy for each composition.", kind: "manager", managerId: "manager-crew",
              state: st({ value: "5 templates · 1 over capacity", source: "custom", isDefault: false }) },
            { id: "crew-default", label: "Default Crew for a Goal", explanation: "Which composition a Goal starts with when you do not choose one.", kind: "select",
              options: ["None", "Review pair", "Feature squad", "Ask"],
              state: st({ value: "None", defaultValue: "None" }) },
            { id: "crew-scope", label: "Crew selection applies to", explanation: "Choosing a Crew in one thread never changes another.", kind: "select", exposure: "managed",
              options: ["This thread or Goal"],
              state: st({ value: "This thread or Goal", defaultValue: "This thread or Goal", source: "managed",
                reason: "Crew selection is thread- and Goal-scoped by design." }) },
            { id: "crew-adaptive", label: "Adapt routes when capacity is short", explanation: "Let a template fall back to another eligible route rather than queueing, when it is marked adaptive.", kind: "toggle",
              state: st({ value: true, defaultValue: true }) }
          ]
        },
        {
          id: "collab-subagents", title: "Subagents", summary: "Agents that spawn other agents.",
          keywords: ["subagent", "depth", "spawn", "child"],
          settings: [
            { id: "sub-allow", label: "Allow agents to spawn subagents", explanation: "Whether an agent may delegate part of its work.", kind: "toggle",
              state: st({ value: true, defaultValue: true }) },
            { id: "sub-depth", label: "Maximum depth", explanation: "How many levels of delegation are permitted.", kind: "select",
              options: ["1", "2", "3", "No limit"],
              state: st({ value: "2", defaultValue: "2" }) },
            { id: "sub-inherit-ceiling", label: "Children cannot exceed the parent's ceiling", explanation: "A subagent's access, FileSafe scope and network reach are capped by its parent.", kind: "toggle", exposure: "managed",
              state: st({ value: true, defaultValue: true, source: "managed", reason: "Enforced by the permissions system." }) },
            { id: "sub-report", label: "Show subagent activity in the thread", explanation: "How much of a child's work appears in the parent conversation.", kind: "select",
              options: ["Result only", "Summary", "Everything"],
              state: st({ value: "Summary", defaultValue: "Summary" }) }
          ]
        }
      ]
    },

    {
      id: "extensions",
      title: "Tools, skills & connections",
      purpose: "MCP servers, skills, plugins, commands and what agents may reach.",
      icon: "puzzle",
      keywords: ["mcp", "skill", "plugin", "tool", "command", "web", "search"],
      subcategories: [
        {
          id: "ext-mcp", title: "MCP servers", summary: "External capability servers.",
          keywords: ["mcp", "server", "transport", "protocol"],
          settings: [
            { id: "mcp-manager", label: "MCP servers", explanation: "Identity, transport, protocol, health, scope, discovered tools and approval policy for each server.", kind: "manager", managerId: "manager-mcp",
              state: st({ value: "6 servers · 1 disconnected", source: "custom", isDefault: false }) },
            { id: "mcp-autoconnect", label: "Connect servers when a project opens", explanation: "Bring project-scoped servers up with the project rather than on first use.", kind: "toggle",
              state: st({ value: true, defaultValue: true }) },
            { id: "mcp-lazy-tools", label: "Reveal tools progressively", explanation: "Expose a server's tool schemas to a turn only when they are plausibly relevant, instead of all of them every time.", kind: "toggle",
              state: st({ value: true, defaultValue: true, recommendedValue: true, source: "recommended",
                effect: { kind: "performance", text: "Keeps large tool inventories out of every request." } }) },
            { id: "mcp-approval", label: "Approval for MCP tool calls", explanation: "How long an approval for a named server or tool lasts.", kind: "select",
              options: ["Every call", "Once per session", "Persistent per tool"],
              state: st({ value: "Once per session", defaultValue: "Every call", isDefault: false, source: "custom" }) }
          ]
        },
        {
          id: "ext-skills", title: "Skills & plugins", summary: "Installed capability packages.",
          keywords: ["skill", "plugin", "install", "trust", "update"],
          settings: [
            { id: "skills-manager", label: "Skills and plugins", explanation: "Install, update, inspect source and permissions, trust, and set project or global scope.", kind: "manager", managerId: "manager-skills",
              state: st({ value: "18 skills · 3 plugins · 2 updates", source: "custom", isDefault: false }) },
            { id: "skills-autoupdate", label: "Update skills automatically", explanation: "Apply skill updates without asking. Permission changes always stop for review.", kind: "toggle",
              state: st({ value: false, defaultValue: false }) },
            { id: "skills-untrusted", label: "Run skills from unverified sources", explanation: "Whether a skill without a verified publisher may run.", kind: "select",
              options: ["Never", "Ask each time", "Allow"],
              state: st({ value: "Ask each time", defaultValue: "Never", isDefault: false, source: "custom",
                effect: { kind: "safety", text: "An unverified skill runs with the tools it requests." } }) },
            { id: "skills-scope", label: "New skills apply to", explanation: "Whether an installed skill is available everywhere or only in this project.", kind: "select",
              options: ["This project", "Everywhere"],
              state: st({ value: "This project", defaultValue: "This project" }) }
          ]
        },
        {
          id: "ext-tools", title: "Tools & commands", summary: "The unified inventory and its shortcuts.",
          keywords: ["tool", "command", "shortcut", "conflict"],
          settings: [
            { id: "tools-manager", label: "Tool inventory", explanation: "What is installed, enabled for this project, currently available, selected for a turn and actually invoked.", kind: "manager", managerId: "manager-tools",
              state: st({ value: "64 tools · 41 enabled here", source: "custom", isDefault: false }) },
            { id: "tools-expose-all", label: "Expose every tool schema to every agent", explanation: "Disabled deliberately. Sending the whole inventory each turn crowds out the actual task.", kind: "toggle", exposure: "expert",
              state: st({ value: false, defaultValue: false,
                effect: { kind: "performance", text: "Would add roughly 28,000 tokens to every request." } }) },
            { id: "cmd-shortcuts", label: "Command shortcuts", explanation: "Search, remap and reset shortcuts, and resolve conflicts.", kind: "manager", managerId: "manager-commands",
              state: st({ value: "2 conflicts", source: "custom", isDefault: false }) },
            { id: "tools-risk-approval", label: "Approval for risky tools", explanation: "Tools that write outside the project, spend money or contact external services.", kind: "select",
              options: ["Every call", "Once per Goal", "Persistent per tool"],
              state: st({ value: "Every call", defaultValue: "Every call", recommendedValue: "Every call", source: "recommended" }) }
          ]
        },
        {
          id: "ext-web", title: "Web & search", summary: "Reaching the network.",
          keywords: ["web", "search", "fetch", "browser"],
          settings: [
            { id: "web-enabled", label: "Let agents fetch web pages", explanation: "Permit retrieving and reading pages during a turn.", kind: "toggle",
              state: st({ value: true, defaultValue: true }) },
            { id: "web-search-provider", label: "Search provider", explanation: "Which search route is used when an agent needs to look something up.", kind: "select",
              options: ["Built-in", "Brave", "Tavily", "None"],
              state: st({ value: "Built-in", defaultValue: "Built-in" }) },
            { id: "web-domain-policy", label: "Domain policy", explanation: "Restrict which hosts may be reached during a turn.", kind: "select", exposure: "advanced",
              options: ["Allow all", "Ask for unknown hosts", "Allowlist only"],
              state: st({ value: "Ask for unknown hosts", defaultValue: "Allow all", isDefault: false, source: "custom" }) },
            { id: "web-browser-sessions", label: "Use your signed-in browser sessions", explanation: "Not available on this device. It requires the desktop browser bridge, which is not installed.", kind: "toggle", exposure: "unavailable",
              state: st({ value: false, source: "unavailable",
                reason: "The desktop browser bridge is not installed on this device." }) }
          ]
        }
      ]
    },

    {
      id: "media",
      title: "Media & generation",
      purpose: "Image, audio and video providers, routes and outputs.",
      icon: "image",
      keywords: ["media", "image", "audio", "video", "generation", "route"],
      subcategories: [
        {
          id: "media-providers", title: "Media providers", summary: "Connections and routes for generated media.",
          keywords: ["provider", "route", "connection"],
          settings: [
            { id: "media-manager", label: "Media providers and routes", explanation: "Connections, capability by modality, purpose assignment, output location, safety status and generation history.", kind: "manager", managerId: "manager-media",
              state: st({ value: "4 providers · 1 unconfigured", source: "custom", isDefault: false }) },
            { id: "media-default-image", label: "Default image route", explanation: "Which route handles image generation unless a task says otherwise.", kind: "select",
              options: ["Nano Banana Pro (API)", "Local diffusion", "Ask each time"],
              state: st({ value: "Nano Banana Pro (API)", defaultValue: "Ask each time", isDefault: false, source: "custom" }) },
            { id: "media-fallback", label: "Fallback when a media route fails", explanation: "Try an alternate configured route rather than failing the turn.", kind: "toggle",
              state: st({ value: true, defaultValue: true }) },
            { id: "media-video", label: "Video generation", explanation: "No connected provider currently offers video on this account.", kind: "select", exposure: "unavailable",
              options: ["Not available"],
              state: st({ value: "Not available", source: "unavailable",
                reason: "No connected media provider reports video capability for this account." }) }
          ]
        },
        {
          id: "media-input", title: "Media input", summary: "How attachments are handled.",
          keywords: ["attachment", "image", "transform", "native"],
          settings: [
            { id: "media-native-first", label: "Prefer native model input", explanation: "Send an attachment directly when the model genuinely supports the format, rather than converting it first.", kind: "toggle",
              state: st({ value: true, defaultValue: true, recommendedValue: true, source: "recommended" }) },
            { id: "media-transform", label: "Transform unsupported attachments", explanation: "Convert or describe an attachment the chosen model cannot read, and say that this happened.", kind: "toggle",
              state: st({ value: true, defaultValue: true }) },
            { id: "media-max-size", label: "Largest attachment", explanation: "Attachments above this size are downscaled before being sent.", kind: "select",
              options: ["2 MB", "10 MB", "25 MB", "No limit"],
              state: st({ value: "10 MB", defaultValue: "10 MB" }) },
            { id: "media-strip-metadata", label: "Remove metadata from attachments", explanation: "Strip location and device information from images before they leave this device.", kind: "toggle",
              state: st({ value: true, defaultValue: true, source: "recommended", recommendedValue: true,
                effect: { kind: "privacy", text: "Location and camera details are removed." } }) }
          ]
        },
        {
          id: "media-output", title: "Media output", summary: "Where generated media lands.",
          keywords: ["output", "folder", "format", "naming"],
          settings: [
            { id: "media-out-path", label: "Save generated media to", explanation: "Where finished media is written.", kind: "text",
              state: st({ value: "Project folder · assets/generated", source: "inherited", inheritedFrom: "Project: orchard-api" }) },
            { id: "media-out-format", label: "Image format", explanation: "Format used when a provider offers a choice.", kind: "select",
              options: ["Match the source", "PNG", "WebP", "JPEG"],
              state: st({ value: "Match the source", defaultValue: "Match the source", source: "auto" }) },
            { id: "media-keep-history", label: "Keep generation history", explanation: "Record prompt, route, cost and result for each generation.", kind: "toggle",
              state: st({ value: true, defaultValue: true }) },
            { id: "media-safety", label: "Provider content policy", explanation: "Reported by each provider. Puppet Master does not relax a provider's policy.", kind: "select", exposure: "managed",
              options: ["Provider default"],
              state: st({ value: "Provider default", source: "managed", reason: "Content policy is owned by each media provider." }) }
          ]
        }
      ]
    },

    {
      id: "system",
      title: "System & diagnostics",
      purpose: "Storage, backups, logs and the things you reach for when something is wrong.",
      icon: "server",
      keywords: ["storage", "backup", "snapshot", "log", "diagnostic", "reset"],
      subcategories: [
        {
          id: "sys-storage", title: "Storage", summary: "Where Puppet Master keeps its data.",
          keywords: ["disk", "cache", "size", "location"],
          settings: [
            { id: "sys-data-dir", label: "Data directory", explanation: "Where threads, memory and caches are stored on this device.", kind: "text",
              state: st({ value: "Inherited from the platform", source: "inherited", inheritedFrom: "Platform default",
                effectiveNote: "~/Library/Application Support/PuppetMaster" }) },
            { id: "sys-cache-limit", label: "Cache size limit", explanation: "How much disk the retrieval and catalogue caches may use.", kind: "select",
              options: ["1 GB", "5 GB", "20 GB", "No limit"],
              state: st({ value: "5 GB", defaultValue: "5 GB" }) },
            { id: "sys-cache-clear", label: "Clear caches", explanation: "Remove derived data. Threads, memory and settings are not affected.", kind: "action",
              state: st({ value: "3.4 GB in use", source: "custom", isDefault: false }) },
            { id: "sys-index-rebuild", label: "Rebuild the retrieval index", explanation: "Re-derive the project index from scratch. Takes a few minutes on a large repository.", kind: "action", exposure: "advanced",
              state: st({ value: "Last built 2 days ago", source: "custom", isDefault: false }) }
          ]
        },
        {
          id: "sys-backup", title: "Backups & restore points", summary: "Getting back to a known state.",
          keywords: ["backup", "snapshot", "restore"],
          settings: [
            { id: "sys-snapshot-auto", label: "Take restore points automatically", explanation: "Snapshot before bulk edits and between Goal phases.", kind: "toggle",
              state: st({ value: true, defaultValue: true, recommendedValue: true, source: "recommended" }) },
            { id: "sys-snapshot-keep", label: "Keep restore points for", explanation: "How long snapshots are retained before being pruned.", kind: "select",
              options: ["7 days", "30 days", "90 days"],
              state: st({ value: "30 days", defaultValue: "30 days" }) },
            { id: "sys-backup-settings", label: "Back up settings", explanation: "Export settings, excluding credentials, so they can be restored or moved.", kind: "action",
              state: st({ value: "Last exported 3 weeks ago", source: "custom", isDefault: false }) },
            { id: "sys-restore", label: "Restore from a backup", explanation: "Replace current settings with a saved export. Credentials are never included and must be re-authenticated.", kind: "action", exposure: "advanced",
              state: st({ value: "2 backups available", source: "custom", isDefault: false }) }
          ]
        },
        {
          id: "sys-logs", title: "Logs & diagnostics", summary: "What is recorded and how much.",
          keywords: ["log", "level", "trace", "report"],
          settings: [
            { id: "sys-log-level", label: "Log detail", explanation: "How much is written to the application log.", kind: "select",
              options: ["Errors only", "Normal", "Verbose", "Trace"],
              state: st({ value: "Normal", defaultValue: "Normal" }) },
            { id: "sys-log-retention", label: "Keep logs for", explanation: "How long log files are retained on this device.", kind: "select",
              options: ["3 days", "14 days", "60 days"],
              state: st({ value: "14 days", defaultValue: "14 days" }) },
            { id: "sys-diag-bundle", label: "Create a diagnostic report", explanation: "Collect logs, versions and configuration into one file. Credentials and prompt content are excluded.", kind: "action", exposure: "diagnostic",
              state: st({ value: "Never created", source: "notConfigured" }) },
            { id: "sys-perf-overlay", label: "Show the performance overlay", explanation: "Draw frame timing and render counts over the interface.", kind: "toggle", exposure: "diagnostic",
              state: st({ value: false, defaultValue: false }) }
          ]
        },
        {
          id: "sys-reset", title: "Reset", summary: "Undoing configuration.",
          keywords: ["reset", "default", "erase"],
          settings: [
            { id: "sys-reset-section", label: "Reset one section to defaults", explanation: "Return a single Settings section to its shipped values.", kind: "action",
              state: st({ value: "6 sections changed from default", source: "custom", isDefault: false }) },
            { id: "sys-reset-all", label: "Reset all settings", explanation: "Return every setting to its shipped value. Threads, memory and projects are not deleted.", kind: "action", exposure: "expert",
              state: st({ value: "Cannot be undone", source: "custom", isDefault: false,
                effect: { kind: "safety", text: "Every customisation on this device is lost, including provider priority and role assignments." } }) },
            { id: "sys-erase-memory", label: "Erase Assistant memory", explanation: "Delete every stored note and its evidence. Thread transcripts are not affected.", kind: "action", exposure: "expert",
              state: st({ value: "142 notes", source: "custom", isDefault: false,
                effect: { kind: "safety", text: "Cannot be undone. Notes and their provenance are removed permanently." } }) },
            { id: "sys-sign-out-all", label: "Sign out of every provider", explanation: "Remove Puppet Master's stored credentials. CLI-owned logins stay with their own tool.", kind: "action", exposure: "advanced",
              state: st({ value: "5 connections", source: "custom", isDefault: false }) }
          ]
        }
      ]
    }
  ];

  /* ================================================================ NOTICES */

  var notices = [
    {
      id: "notice-claude-personal",
      severity: "attention",
      statusWord: "Needs attention",
      headline: "The Claude CLI personal profile is signed out",
      consequence: "Threads set to that profile fall back to the work profile, which is already at 92% of its included usage.",
      primary: { label: "Open the sign-in", action: "open-provider", providerId: "claude" },
      secondary: { label: "Use the work profile for now", action: "prefer-account" },
      target: { categoryId: "agents", subcategoryId: "agents-providers", settingId: "prov-manager" }
    },
    {
      id: "notice-openrouter",
      severity: "attention",
      statusWord: "Needs attention",
      headline: "OpenRouter accepted the key but the last generation failed",
      consequence: "The account is authenticated and the catalogue is current; the provider returned a payment error on the last three requests.",
      primary: { label: "Show the diagnosis", action: "open-provider", providerId: "openrouter" },
      target: { categoryId: "agents", subcategoryId: "agents-providers", settingId: "prov-manager" }
    },
    {
      id: "notice-mcp",
      severity: "attention",
      statusWord: "Needs attention",
      headline: "The postgres MCP server has been disconnected for two days",
      consequence: "Six tools that depend on it are unavailable, including the ones the migration Goal expects.",
      primary: { label: "Reconnect", action: "reconnect-mcp", serverId: "mcp-postgres" },
      secondary: { label: "Open logs", action: "open-mcp-logs" },
      target: { categoryId: "extensions", subcategoryId: "ext-mcp", settingId: "mcp-manager" }
    },
    {
      id: "notice-antigravity",
      severity: "setup",
      statusWord: "Continue setup",
      headline: "Antigravity CLI is not installed yet",
      consequence: "You started adding it four days ago. Its models stay hidden until the CLI is installed and signed in.",
      primary: { label: "Continue setup", action: "open-provider", providerId: "antigravity" },
      secondary: { label: "Remove from the list", action: "dismiss" },
      target: { categoryId: "agents", subcategoryId: "agents-providers", settingId: "prov-manager" }
    },
    {
      id: "notice-project-dict",
      severity: "setup",
      statusWord: "Continue setup",
      headline: "The project dictionary has 12 words awaiting review",
      consequence: "Until they are reviewed they are only applied for the person who added them.",
      primary: { label: "Review words", action: "open-setting", settingId: "spell-project" },
      target: { categoryId: "appearance", subcategoryId: "appearance-input", settingId: "spell-project" }
    },
    {
      id: "notice-verifier",
      severity: "recommended",
      statusWord: "Recommended",
      headline: "Give verification its own route",
      consequence: "Your verifier and Goal worker currently share a model, so failures the worker cannot see also escape the check.",
      primary: { label: "Choose a verifier route", action: "open-setting", settingId: "role-verifier" },
      secondary: { label: "Not now", action: "dismiss" },
      target: { categoryId: "agents", subcategoryId: "agents-roles", settingId: "role-verifier" }
    },
    {
      id: "notice-concurrency",
      severity: "recommended",
      statusWord: "Recommended",
      headline: "Eight concurrent agents is more than the current allowance supports",
      consequence: "Orchestrator can sustain two right now. A large Goal would stall partway rather than finish.",
      primary: { label: "Review the ceiling", action: "open-setting", settingId: "goal-concurrency" },
      secondary: { label: "Keep as is", action: "dismiss" },
      target: { categoryId: "planning", subcategoryId: "plan-goal", settingId: "goal-concurrency" }
    },
    {
      id: "notice-snapshot",
      severity: "recommended",
      statusWord: "Recommended",
      headline: "Restore points are using 11 GB",
      consequence: "Older snapshots are past the 30-day retention window but have not been pruned yet.",
      primary: { label: "Prune now", action: "prune-snapshots" },
      target: { categoryId: "system", subcategoryId: "sys-backup", settingId: "sys-snapshot-keep" }
    }
  ];

  /* ============================================================== PROVIDERS */

  var providers = [
    {
      id: "claude",
      name: "Claude",
      group: "Installed tools and signed-in apps",
      summary: "Claude CLI, invoked through isolated profiles that own their own login.",
      icon: "cpu",
      status: "attention",
      statusWord: "One profile signed out",
      installed: true,
      version: "claude-cli 2.14.0",
      isolation: "Isolated CLI home directory per profile",
      credentialOwner: "Claude CLI",
      oauthNote: "Claude CLI runs its own login inside the profile directory. Puppet Master selects the profile and launches that flow; it does not present its own Claude sign-in.",
      keywords: ["anthropic", "opus", "sonnet", "haiku", "cli"],
      accounts: [
        {
          id: "claude-work", nickname: "work", identity: "jared@orchard.dev", status: "connected", statusWord: "Ready",
          connection: "CLI profile · ~/.puppetmaster/cli/claude/work",
          product: "Claude Max · included usage", priority: 1, sticky: true,
          health: { catalogue: "11 minutes ago", generation: "4 minutes ago", check: "ok" },
          usage: { includedRemaining: "8%", resetsIn: "3 h 40 m", pressure: "high", note: "Provider-reported. Usage owns the detail." },
          nextAction: { chosen: "Use saved reset", options: ["Stop and wait", "Use saved reset", "Switch account", "Use free models"] }
        },
        {
          id: "claude-personal", nickname: "personal", identity: "Unknown until signed in", status: "attention", statusWord: "Signed out",
          connection: "CLI profile · ~/.puppetmaster/cli/claude/personal",
          product: "Claude Pro · included usage", priority: 2, sticky: false,
          health: { catalogue: "4 days ago", generation: "4 days ago", check: "signedOut" },
          usage: { includedRemaining: "Unknown", resetsIn: "Unknown", pressure: "unknown", note: "Sign in to read the balance." },
          nextAction: { chosen: null, options: ["Stop and wait", "Use saved reset", "Switch account"] }
        }
      ],
      models: [
        { id: "claude-opus-46", name: "Claude Opus 4.6", alias: "Opus 4.6", summary: "Highest quality, slowest", favourite: true, priority: 1, available: true,
          context: "200K", modes: { fast: true, effort: ["Low", "Medium", "High"] },
          capabilities: [
            { name: "Vision", state: "supported", evidence: "Observed use", when: "today" },
            { name: "Tools", state: "supported", evidence: "Provider discovery", when: "11 minutes ago" },
            { name: "Structured output", state: "supported", evidence: "Catalogue", when: "11 minutes ago" },
            { name: "Fast variant", state: "supported", evidence: "Authenticated discovery", when: "11 minutes ago" },
            { name: "Audio input", state: "supportedThroughTransformation", evidence: "Observed use", when: "12 minutes ago" }
          ] },
        { id: "claude-sonnet-46", name: "Claude Sonnet 4.6", alias: "Sonnet 4.6", summary: "Balanced", favourite: true, priority: 2, available: true,
          context: "200K", modes: { fast: true, effort: ["Low", "Medium", "High"] },
          capabilities: [
            { name: "Vision", state: "supported", evidence: "Observed use", when: "yesterday" },
            { name: "Tools", state: "supported", evidence: "Provider discovery", when: "11 minutes ago" },
            { name: "Fast variant", state: "supported", evidence: "Authenticated discovery", when: "11 minutes ago" }
          ] },
        { id: "claude-haiku-45", name: "Claude Haiku 4.5", alias: "Haiku 4.5", summary: "Small and quick", favourite: false, priority: 3, available: true,
          context: "200K", modes: { fast: false, effort: [] },
          capabilities: [
            { name: "Vision", state: "supported", evidence: "Catalogue", when: "11 minutes ago" },
            { name: "Tools", state: "supported", evidence: "Observed use", when: "2 hours ago" },
            { name: "Fast variant", state: "unsupported", evidence: "Authenticated discovery", when: "11 minutes ago" }
          ] },
        { id: "claude-opus-45", name: "Claude Opus 4.5", alias: null, summary: "Previous generation", favourite: false, priority: 4, available: true, hidden: true,
          context: "200K", modes: { fast: false, effort: ["Low", "High"] },
          capabilities: [{ name: "Tools", state: "supported", evidence: "Catalogue", when: "11 minutes ago" }] }
      ],
      routing: { note: "Work profile is used first. Personal is next when it is signed in." }
    },

    {
      id: "openai",
      name: "OpenAI",
      group: "Connected accounts",
      summary: "Puppet Master's own sign-in, plus a separate API key connection.",
      icon: "cpu",
      status: "ok",
      statusWord: "Ready",
      installed: true,
      isolation: "Puppet Master direct connection",
      credentialOwner: "Puppet Master",
      oauthNote: "Puppet Master's own sign-in is supported for OpenAI and Codex. The API connection below is a separate route with its own billing.",
      keywords: ["gpt", "codex", "api"],
      accounts: [
        {
          id: "openai-oauth", nickname: "Signed in", identity: "jared@orchard.dev", status: "connected", statusWord: "Ready",
          connection: "Puppet Master sign-in", product: "ChatGPT Business · included usage", priority: 1, sticky: false,
          health: { catalogue: "2 hours ago", generation: "yesterday", check: "ok" },
          usage: { includedRemaining: "61%", resetsIn: "18 days", pressure: "low", note: "Provider-reported." },
          nextAction: { chosen: "Use paid usage after the plan", options: ["Stop and wait", "Use paid usage after the plan", "Ask each time"] }
        },
        {
          id: "openai-api", nickname: "orchard-ci", identity: "Key ending 4f2a", status: "connected", statusWord: "Ready",
          connection: "API key", product: "Pay as you go", priority: 2, sticky: false,
          health: { catalogue: "2 hours ago", generation: "3 hours ago", check: "ok" },
          usage: { includedRemaining: "Not applicable", resetsIn: "Not applicable", pressure: "none", note: "Billed per request." },
          nextAction: { chosen: "Use API billing", options: ["Stop and wait", "Use API billing"] }
        }
      ],
      models: [
        { id: "gpt-52", name: "GPT-5.2", alias: null, summary: "General purpose", favourite: true, priority: 1, available: true,
          context: "400K", modes: { fast: false, effort: ["Minimal", "Low", "Medium", "High"] },
          capabilities: [
            { name: "Vision", state: "supported", evidence: "Provider discovery", when: "2 hours ago" },
            { name: "Tools", state: "supported", evidence: "Observed use", when: "3 hours ago" },
            { name: "Audio input", state: "likely", evidence: "Catalogue only", when: "2 hours ago" }
          ] },
        { id: "gpt-52-codex", name: "GPT-5.2 Codex", alias: "Codex", summary: "Code-tuned", favourite: false, priority: 2, available: true,
          context: "400K", modes: { fast: false, effort: ["Low", "Medium", "High"] },
          capabilities: [
            { name: "Tools", state: "supported", evidence: "Observed use", when: "yesterday" },
            { name: "Vision", state: "unsupported", evidence: "Provider discovery", when: "2 hours ago" }
          ] },
        { id: "gpt-52-audio", name: "GPT-5.2 Audio", alias: null, summary: "Speech in and out", favourite: false, priority: 3, available: false,
          unavailableReason: "This account's plan does not include the audio product.",
          context: "128K", modes: { fast: false, effort: [] },
          capabilities: [{ name: "Audio", state: "temporarilyUnavailable", evidence: "Authenticated discovery", when: "2 hours ago" }] },
        { id: "gpt-52-mini", name: "GPT-5.2 mini", alias: null, summary: "Cheaper, quicker", favourite: false, priority: 4, available: true,
          context: "200K", modes: { fast: false, effort: ["Low", "Medium"] },
          capabilities: [
            { name: "Tools", state: "supported", evidence: "Catalogue", when: "2 hours ago" },
            { name: "Vision", state: "likely", evidence: "Catalogue only", when: "2 hours ago" }
          ] },
        { id: "o5-reasoning", name: "o5", alias: "Reasoner", summary: "Long reasoning chains", favourite: false, priority: 5, available: true, hidden: true,
          context: "200K", modes: { fast: false, effort: ["Medium", "High", "Maximum"] },
          capabilities: [
            { name: "Tools", state: "supported", evidence: "Provider discovery", when: "2 hours ago" },
            { name: "Structured output", state: "supported", evidence: "Catalogue", when: "2 hours ago" },
            { name: "Vision", state: "unsupported", evidence: "Provider discovery", when: "2 hours ago" }
          ] }
      ]
    },

    {
      id: "antigravity",
      name: "Antigravity",
      group: "Installed tools and signed-in apps",
      summary: "Not installed. Its CLI owns its own Google sign-in.",
      icon: "cpu",
      status: "setup",
      statusWord: "Not installed",
      installed: false,
      isolation: "Isolated CLI home directory",
      credentialOwner: "Antigravity CLI",
      oauthNote: "Antigravity CLI performs its own Google sign-in inside the profile directory. Puppet Master does not present its own Antigravity sign-in.",
      keywords: ["google", "gemini", "cli"],
      setupSteps: [
        { label: "Install the Antigravity CLI", state: "pending" },
        { label: "Create an isolated profile directory", state: "pending" },
        { label: "Run the CLI's own Google sign-in", state: "pending" },
        { label: "Verify identity and readiness", state: "pending" }
      ],
      accounts: [],
      models: []
    },

    {
      id: "copilot",
      name: "GitHub Copilot",
      group: "Connected accounts",
      summary: "Signed in through Puppet Master, entitlement from your GitHub organisation.",
      icon: "cpu",
      status: "ok",
      statusWord: "Ready",
      installed: true,
      isolation: "Native named profile",
      credentialOwner: "Puppet Master",
      keywords: ["github", "copilot"],
      accounts: [
        {
          id: "copilot-org", nickname: "orchard", identity: "jared (orchard-labs)", status: "connected", statusWord: "Ready",
          connection: "Puppet Master sign-in", product: "Copilot Business · seat", priority: 1, sticky: false,
          health: { catalogue: "35 minutes ago", generation: "2 days ago", check: "ok" },
          usage: { includedRemaining: "Seat-based", resetsIn: "Not applicable", pressure: "none", note: "No per-request allowance." },
          nextAction: { chosen: "Stop and wait", options: ["Stop and wait", "Switch account"] }
        }
      ],
      models: [
        { id: "copilot-gpt5", name: "Copilot GPT-5", alias: null, summary: "Through the Copilot seat", favourite: false, priority: 1, available: true,
          context: "128K", modes: { fast: false, effort: [] },
          capabilities: [
            { name: "Tools", state: "supportedThroughRoute", evidence: "Observed use", when: "2 days ago" },
            { name: "Vision", state: "unverified", evidence: "No evidence yet", when: "never" }
          ] },
        { id: "copilot-sonnet", name: "Copilot Claude Sonnet 4.6", alias: null, summary: "Same model, different entitlement route", favourite: false, priority: 2, available: true,
          context: "128K", modes: { fast: false, effort: [] },
          routeNote: "This is the same model as the Claude CLI route, billed through the Copilot seat rather than the Claude plan.",
          capabilities: [
            { name: "Tools", state: "supportedThroughRoute", evidence: "Provider discovery", when: "35 minutes ago" },
            { name: "Vision", state: "supported", evidence: "Catalogue", when: "35 minutes ago" }
          ] }
      ]
    },

    {
      id: "ollama",
      name: "Ollama",
      group: "Server connections",
      summary: "Local endpoint. No account and no allowance.",
      icon: "server",
      status: "ok",
      statusWord: "Ready",
      installed: true,
      isolation: "Local endpoint",
      credentialOwner: "None required",
      keywords: ["local", "qwen", "llama", "endpoint"],
      accounts: [
        {
          id: "ollama-local", nickname: "localhost", identity: "http://127.0.0.1:11434", status: "connected", statusWord: "Ready",
          connection: "Server endpoint", product: "Local hardware", priority: 1, sticky: false,
          health: { catalogue: "6 minutes ago", generation: "26 minutes ago", check: "ok" },
          usage: { includedRemaining: "Not applicable", resetsIn: "Not applicable", pressure: "none", note: "Runs on this machine." },
          nextAction: { chosen: null, options: [] }
        }
      ],
      models: [
        { id: "qwen3-coder", name: "Qwen3 Coder 30B", alias: "Qwen3 Coder", summary: "Local, no allowance", favourite: true, priority: 1, available: true,
          context: "128K", modes: { fast: false, effort: [] },
          capabilities: [
            { name: "Tools", state: "supported", evidence: "Safe probe", when: "26 minutes ago" },
            { name: "Vision", state: "unsupported", evidence: "Safe probe", when: "26 minutes ago" }
          ] },
        { id: "llama-vision", name: "Llama 3.3 Vision 11B", alias: null, summary: "Local vision", favourite: false, priority: 2, available: false,
          unavailableReason: "Not pulled to this machine yet. It needs 7.4 GB of disk.",
          context: "128K", modes: { fast: false, effort: [] },
          capabilities: [{ name: "Vision", state: "likely", evidence: "Catalogue only", when: "6 minutes ago" }] },
        { id: "llama-70b", name: "Llama 3.3 70B", alias: null, summary: "Local, slower", favourite: false, priority: 3, available: true,
          context: "128K", modes: { fast: false, effort: [] },
          capabilities: [
            { name: "Tools", state: "supported", evidence: "Safe probe", when: "6 minutes ago" },
            { name: "Vision", state: "unsupported", evidence: "Safe probe", when: "6 minutes ago" }
          ] },
        { id: "deepseek-coder-local", name: "DeepSeek Coder V2 16B", alias: null, summary: "Local, code-tuned", favourite: false, priority: 4, available: true,
          context: "64K", modes: { fast: false, effort: [] },
          capabilities: [{ name: "Tools", state: "unverified", evidence: "No evidence yet", when: "never" }] }
      ]
    },

    {
      id: "openrouter",
      name: "OpenRouter",
      group: "API connections",
      summary: "Authenticated, but the last three generations were refused.",
      icon: "key",
      status: "attention",
      statusWord: "Authenticated, not usable",
      installed: true,
      isolation: "Single active login requiring explicit reauthentication",
      credentialOwner: "Puppet Master",
      keywords: ["router", "api", "aggregator"],
      accounts: [
        {
          id: "openrouter-key", nickname: "personal key", identity: "Key ending 91c7", status: "degraded", statusWord: "Authenticated, generation failing",
          connection: "API key", product: "Prepaid credit", priority: 1, sticky: false,
          health: { catalogue: "18 minutes ago", generation: "failed 12 minutes ago", check: "generationFailed" },
          usage: { includedRemaining: "$0.00 credit", resetsIn: "Not applicable", pressure: "exhausted", note: "Provider-reported credit balance." },
          diagnosis: "The key authenticates and the catalogue refreshes. Generation returns 402: the prepaid credit is spent. Authenticated is not the same as ready.",
          nextAction: { chosen: null, options: ["Stop and wait", "Add credit", "Switch provider", "Use free models"] }
        }
      ],
      models: [
        { id: "or-deepseek", name: "DeepSeek V3.2", alias: null, summary: "Through OpenRouter", favourite: false, priority: 1, available: false,
          unavailableReason: "The connection has no credit. The model itself is fine.",
          context: "160K", modes: { fast: false, effort: [] },
          capabilities: [{ name: "Tools", state: "supported", evidence: "Catalogue", when: "18 minutes ago" }] }
      ]
    },

    {
      id: "free",
      name: "Free & community models",
      group: "Free and community models",
      summary: "A grouping over other providers. It is not a credential store or a billing identity of its own.",
      icon: "star",
      status: "setup",
      statusWord: "2 of 5 ready",
      installed: true,
      isolation: "Delegates to the underlying provider",
      credentialOwner: "The underlying provider",
      groupingNote: "Free Models is a view over underlying providers, accounts and connections. Setup for a free route opens that provider's own connection.",
      keywords: ["free", "community", "models.dev", "keyless"],
      catalogue: {
        name: "models.dev + Free Coding Models",
        state: "refreshing",
        lastChecked: "refreshing now",
        lastActivated: "1 hour ago",
        sourceVersion: "models.dev @ 8f21c4e",
        lastKnownGood: "Serving the catalogue from 1 hour ago while the refresh runs.",
        materialChanges: ["2 models left the free tier this week", "1 new keyless route added"]
      },
      accounts: [
        {
          id: "free-groq", nickname: "Groq", identity: "No account yet", status: "setup", statusWord: "Account required",
          connection: "Underlying provider: Groq", product: "Free tier · rate limited", priority: 1, sticky: false,
          health: { catalogue: "1 hour ago", generation: "never", check: "notConfigured" },
          usage: { includedRemaining: "Unknown", resetsIn: "Unknown", pressure: "unknown", note: "Sign up to read limits." },
          setupInstructions: [
            "Create a Groq account and confirm the email address.",
            "Create an API key with model inference scope.",
            "Paste the key into the Groq connection, not into Free Models.",
            "Puppet Master verifies the key, then returns you to this model."
          ],
          nextAction: { chosen: null, options: [] }
        },
        {
          id: "free-keyless", nickname: "Community endpoint", identity: "No authentication", status: "connected", statusWord: "Ready",
          connection: "Keyless public endpoint", product: "No cost · shared capacity", priority: 2, sticky: false,
          health: { catalogue: "1 hour ago", generation: "5 hours ago", check: "ok" },
          usage: { includedRemaining: "Shared", resetsIn: "Not applicable", pressure: "medium", note: "Shared capacity; latency varies." },
          nextAction: { chosen: null, options: [] }
        }
      ],
      models: [
        { id: "free-kimi", name: "Kimi K2.5", alias: null, summary: "Free through Groq", favourite: false, priority: 1, available: false,
          unavailableReason: "Needs a Groq account. Setup opens the Groq connection.",
          freeTerms: ["Account required", "Subscription-included", "Rate limited", "May change without notice"],
          context: "256K", modes: { fast: false, effort: [] },
          capabilities: [{ name: "Tools", state: "likely", evidence: "Catalogue only", when: "1 hour ago" }] },
        { id: "free-glm", name: "GLM 4.7 Flash", alias: null, summary: "Keyless community endpoint", favourite: false, priority: 2, available: true,
          freeTerms: ["No account", "Shared capacity", "Data may be used for training"],
          context: "128K", modes: { fast: false, effort: [] },
          capabilities: [{ name: "Tools", state: "unverified", evidence: "No evidence yet", when: "never" }] },
        { id: "free-removed", name: "Mistral Small 3.2", alias: null, summary: "No longer free", favourite: false, priority: 3, available: false,
          unavailableReason: "Left the free tier on 28 July. A paid route is still available through OpenRouter.",
          freeTerms: ["Was promotional", "Ended 28 July"],
          context: "128K", modes: { fast: false, effort: [] },
          capabilities: [] }
      ]
    }
  ];

  /* ================================================== REQUESTED VS EFFECTIVE */

  var routeDifferences = [
    {
      id: "diff-model",
      requested: "Claude Opus 4.6 (work)",
      effective: "Claude Sonnet 4.6 (work)",
      reason: "The work profile is at 92% of included usage and the reserve policy holds Opus back for synthesis and verification.",
      scope: "Next request in this thread"
    },
    {
      id: "diff-crew",
      requested: "Feature squad · 5 members",
      effective: "3 members now, 2 queued in a second wave",
      reason: "Sustainable concurrency is 3 until the work profile resets in 3 hours 40 minutes.",
      scope: "Current Goal"
    }
  ];

  /* =============================================================== MANAGERS */

  var managers = {
    "manager-providers": {
      id: "manager-providers", title: "Providers, accounts and models",
      purpose: "Every route Puppet Master can invoke, with health, entitlement and capability evidence.",
      icon: "cpu",
      groups: ["Installed tools and signed-in apps", "Connected accounts", "API connections", "Server connections", "Free and community models"]
    },

    "manager-context": {
      id: "manager-context", title: "Context & instructions",
      purpose: "What each request actually sees, and which sources were left out.",
      icon: "brain",
      lastTurn: {
        admitted: [
          { name: "Thread history (last 12 turns)", size: "6,400 tokens", why: "Recent conversation" },
          { name: "AGENTS.md · services/api", size: "820 tokens", why: "Nearest scoped instruction file" },
          { name: "AGENTS.md · project root", size: "410 tokens", why: "Parent scope, lower precedence" },
          { name: "Retrieved code · 7 files", size: "5,100 tokens", why: "Matched the request" },
          { name: "Assistant memory · 4 notes", size: "380 tokens", why: "Above the recall threshold" },
          { name: "Persona capsule · Collaborator", size: "240 tokens", why: "Compact behaviour capsule, not the full definition" },
          { name: "Selected tool schemas · 9 of 64", size: "2,900 tokens", why: "Progressive disclosure chose these" },
          { name: "Attempt journal", size: "310 tokens", why: "This is a retry" },
          { name: "Parent handoff", size: "290 tokens", why: "Spawned by the migration Goal" }
        ],
        omitted: [
          { name: "Thread history before turn 12", why: "Compacted into a summary at turn 12" },
          { name: "Full Persona definition (1,900 tokens)", why: "Only the capsule is sent; the source stays in the manager" },
          { name: "55 unused tool schemas (28,400 tokens)", why: "Progressive disclosure judged them irrelevant" },
          { name: "Runtime logs", why: "'Use relevant logs' is turned off" }
        ],
        precedence: ["Turn instruction", "AGENTS.md · services/api", "AGENTS.md · project root", "Personal instructions", "Persona capsule"],
        strategy: "Prefix cache held. Compaction last ran at turn 12. Source hashes unchanged since then."
      },
      sources: [
        { id: "src-agents-api", name: "AGENTS.md", scope: "services/api", words: 210, state: "active", precedence: 2 },
        { id: "src-agents-root", name: "AGENTS.md", scope: "Project root", words: 104, state: "active", precedence: 3 },
        { id: "src-personal", name: "Personal instructions", scope: "This device", words: 340, state: "active", precedence: 4 },
        { id: "src-agents-web", name: "AGENTS.md", scope: "services/web", words: 96, state: "inactive", precedence: 2, note: "Not in scope for this thread" },
        { id: "src-legacy", name: "CLAUDE.md", scope: "Project root", words: 620, state: "ignored", precedence: null, note: "Superseded by AGENTS.md. Kept for reference only." }
      ]
    },

    "manager-terminal": {
      id: "manager-terminal", title: "Terminal profiles",
      purpose: "Shells, appearance, environment policy and transcript behaviour.",
      icon: "terminal",
      profiles: [
        {
          id: "term-zsh", name: "zsh (login)", isDefault: true, state: "ok",
          shell: "Inherited from the system", shellEffective: "/bin/zsh -l",
          font: "JetBrains Mono", fontFallback: "Menlo, monospace", size: 13, lineHeight: 1.35,
          palette: "Puppet Master Dark", cursor: "Block, blink off", selection: "Accent tint",
          opacity: 100, cwd: "Auto-detected", cwdEffective: "~/code/orchard-api",
          env: "Inherit, plus 3 project variables", transcript: "Keep 10,000 lines",
          copyPaste: "Copy on selection off · bracketed paste on", links: "Ask before opening"
        },
        {
          id: "term-bash", name: "bash", isDefault: false, state: "ok",
          shell: "/bin/bash", shellEffective: "/bin/bash",
          font: "Inherited from zsh (login)", fontFallback: "Menlo, monospace", size: 13, lineHeight: 1.35,
          palette: "Inherited", cursor: "Bar, blink on", selection: "Accent tint",
          opacity: 100, cwd: "Project root", cwdEffective: "~/code/orchard-api",
          env: "Inherit", transcript: "Keep 5,000 lines",
          copyPaste: "Inherited", links: "Inherited"
        },
        {
          id: "term-pwsh", name: "PowerShell 7", isDefault: false, state: "unavailable",
          unavailableReason: "pwsh is not installed on this device.",
          shell: "pwsh", shellEffective: "Not found on PATH",
          font: "Cascadia Mono", fontFallback: "monospace", size: 13, lineHeight: 1.4,
          palette: "Campbell", cursor: "Block, blink on", selection: "Accent tint",
          opacity: 100, cwd: "Project root", cwdEffective: "Not resolved",
          env: "Inherit", transcript: "Keep 5,000 lines",
          copyPaste: "Inherited", links: "Inherited"
        },
        {
          id: "term-runner", name: "Project runner", isDefault: false, state: "managed",
          managedReason: "Defined by the project so every contributor runs tasks the same way.",
          shell: "Inherited from the system", shellEffective: "/bin/zsh -l",
          font: "Inherited", fontFallback: "Menlo, monospace", size: 12, lineHeight: 1.3,
          palette: "High contrast", cursor: "Block, blink off", selection: "Accent tint",
          opacity: 100, cwd: "Project root", cwdEffective: "~/code/orchard-api",
          env: "Project variables only", transcript: "Keep 2,000 lines",
          copyPaste: "Inherited", links: "Never open"
        }
      ],
      palettes: ["Puppet Master Dark", "Puppet Master Light", "Campbell", "Solarized Dark", "High contrast", "Inherited"]
    },

    "manager-personas": {
      id: "manager-personas", title: "Personas",
      purpose: "Behaviour, not authority. A Persona cannot widen access, FileSafe, network or budget.",
      icon: "mask",
      ceilingNote: "A Persona describes how an agent works. It never grants permission, selects billing, or raises a ceiling set by Plan mode, FileSafe or the project.",
      personas: [
        { id: "p-assistant", name: "Assistant", role: "core", scope: "global", state: "active",
          purpose: "Everyday help in the Assistant thread.",
          definitionWords: 1240, capsuleTokens: 210,
          eligibleSkills: ["Repository reading", "Web extraction"], childOnly: false,
          preferredTools: 9, note: "Default for new threads unless a project overrides it." },
        { id: "p-collaborator", name: "Collaborator", role: "core", scope: "project", state: "active",
          purpose: "Works alongside you on a change, explains its reasoning as it goes.",
          definitionWords: 1900, capsuleTokens: 240,
          eligibleSkills: ["Repository reading", "Testing", "Diff review"], childOnly: false,
          preferredTools: 14, note: "Current default for new threads in orchard-api." },
        { id: "p-general", name: "General", role: "core", scope: "global", state: "active",
          purpose: "A neutral default for work that does not fit a more specific Persona.",
          definitionWords: 900, capsuleTokens: 170, eligibleSkills: ["Repository reading"], childOnly: false, preferredTools: 6 },
        { id: "p-overseer", name: "Overseer", role: "core", scope: "global", state: "active",
          purpose: "Reviews and audits work produced by others.",
          definitionWords: 1450, capsuleTokens: 220, eligibleSkills: ["Diff review", "Testing"], childOnly: false, preferredTools: 7 },
        { id: "p-researcher", name: "Deep Researcher", role: "core", scope: "global", state: "active",
          purpose: "Bounded research with sources kept and cited.",
          definitionWords: 1680, capsuleTokens: 260, eligibleSkills: ["Web extraction", "Document reading"], childOnly: false, preferredTools: 6 },
        { id: "p-explorer", name: "Explorer", role: "core", scope: "global", state: "active",
          purpose: "Reads a codebase broadly and reports what it found.", definitionWords: 980, capsuleTokens: 180,
          eligibleSkills: ["Repository reading"], childOnly: false, preferredTools: 5 },
        { id: "p-bash", name: "Bash", role: "core", scope: "global", state: "active",
          purpose: "Runs commands and reports output. Deliberately narrow.", definitionWords: 620, capsuleTokens: 120,
          eligibleSkills: [], childOnly: true, preferredTools: 2,
          note: "Child-only. It never appears as a Chat default." },
        { id: "p-teacher", name: "Teacher", role: "core", scope: "global", state: "active",
          purpose: "Explains rather than does.", definitionWords: 1100, capsuleTokens: 190, eligibleSkills: [], childOnly: false, preferredTools: 3 },
        { id: "p-migrator", name: "Migration specialist", role: "custom", scope: "project", state: "draft",
          purpose: "Custom Persona for the schema migration Goal.", definitionWords: 740, capsuleTokens: 150,
          eligibleSkills: ["Testing"], childOnly: false, preferredTools: 8,
          note: "Draft. It is not offered until it has been reviewed." }
      ],
      scopes: ["This turn", "This thread", "This Goal or PlanningRun", "Project default for new work", "Global default for new work", "Child only"]
    },

    "manager-skills": {
      id: "manager-skills", title: "Skills, plugins and tools",
      purpose: "Distinct lifecycles: skills are installed, plugins are loaded, tools are exposed.",
      icon: "puzzle",
      skills: [
        { id: "sk-repo", name: "Repository reading", version: "2.4.1", source: "Puppet Master", verified: true, scope: "Everywhere", state: "enabled", permissions: ["Read project files"], updates: null },
        { id: "sk-test", name: "Testing", version: "1.9.0", source: "Puppet Master", verified: true, scope: "Everywhere", state: "enabled", permissions: ["Run project commands", "Read project files"], updates: "1.9.2 available" },
        { id: "sk-diff", name: "Diff review", version: "1.2.0", source: "orchard-labs", verified: true, scope: "This project", state: "enabled", permissions: ["Read project files"], updates: null },
        { id: "sk-web", name: "Web extraction", version: "3.0.1", source: "Puppet Master", verified: true, scope: "Everywhere", state: "enabled", permissions: ["Network access"], updates: null },
        { id: "sk-doc", name: "Document reading", version: "0.8.4", source: "community", verified: false, scope: "This project", state: "needsTrust", permissions: ["Read any file", "Network access"],
          trustNote: "Unverified publisher. It requests read access outside the project.", updates: null },
        { id: "sk-figma", name: "Figma import", version: "1.1.0", source: "community", verified: true, scope: "This project", state: "disabled", permissions: ["Network access"], updates: "1.3.0 available" }
      ],
      plugins: [
        { id: "pl-jira", name: "Jira", version: "4.2.0", state: "loaded", channel: "Stable", compatible: true, permissions: ["Network access", "Read project metadata"] },
        { id: "pl-datadog", name: "Datadog", version: "2.0.0", state: "failed", channel: "Stable", compatible: false,
          failure: "Requires host API 5.x; this build provides 4.8.", permissions: ["Network access"] },
        { id: "pl-notion", name: "Notion", version: "1.7.3", state: "loaded", channel: "Preview", compatible: true, permissions: ["Network access"] }
      ],
      toolStates: [
        { label: "Installed", count: 64, note: "Present on this device" },
        { label: "Enabled in this project", count: 41, note: "Allowed by project policy" },
        { label: "Currently available", count: 38, note: "Their server or skill is healthy" },
        { label: "Selected for the last turn", count: 9, note: "Progressive disclosure chose these" },
        { label: "Actually invoked", count: 3, note: "Called during the last turn" }
      ]
    },

    "manager-memory": {
      id: "manager-memory", title: "Assistant memory",
      purpose: "Evidence-backed notes with provenance. Half-life means fading from active recall, never deletion or doubt.",
      icon: "brain",
      separationNote: "Thread transcripts, Goal state, planning ledgers and tool artefacts are separate stores. They are searchable through scoped tools, and are not flattened into this list.",
      notes: [
        { id: "m-1", text: "Prefers table-driven tests over per-case functions in the api service.", kind: "preference", scope: "Project · orchard-api",
          state: "verified", evidence: "services/api/users_test.go, reviewed 12 June", accessed: "yesterday", halfLife: "6 weeks", recall: 0.94, pinned: true, versions: 2 },
        { id: "m-2", text: "The staging database is reset every Sunday at 03:00 UTC.", kind: "fact", scope: "Project · orchard-api",
          state: "verified", evidence: "infra/cron/staging-reset.yaml", accessed: "4 days ago", halfLife: "6 months", recall: 0.71, pinned: false, versions: 1 },
        { id: "m-3", text: "Wants commit messages in imperative mood without a scope prefix.", kind: "preference", scope: "Global",
          state: "verified", evidence: "Thread 'commit style', 2 July", accessed: "2 days ago", halfLife: "6 weeks", recall: 0.88, pinned: true, versions: 3 },
        { id: "m-4", text: "The payments module owner is Priya.", kind: "fact", scope: "Project · orchard-api",
          state: "awaitingReview", evidence: "Inferred from three pull requests; no direct statement", accessed: "never", halfLife: "2 weeks", recall: 0.30, pinned: false, versions: 1,
          reviewNote: "Inferred rather than stated. Confirm before it is used." },
        { id: "m-5", text: "Dislikes being asked to confirm formatting-only changes.", kind: "preference", scope: "Global",
          state: "verified", evidence: "Thread 'stop asking', 19 June", accessed: "3 weeks ago", halfLife: "6 weeks", recall: 0.22, pinned: false, versions: 1,
          fadeNote: "Below the recall threshold. It is still true and still stored; it is simply no longer offered automatically." },
        { id: "m-6", text: "Migration Goal must not touch the billing schema.", kind: "constraint", scope: "Goal · schema migration",
          state: "verified", evidence: "Goal brief, 1 August", accessed: "today", halfLife: "Never fade", recall: 1.0, pinned: true, versions: 1 },
        { id: "m-7", text: "Uses Ollama for web extraction to save allowance.", kind: "preference", scope: "Global",
          state: "awaitingReview", evidence: "Setting change on 3 August", accessed: "never", halfLife: "6 weeks", recall: 0.4, pinned: false, versions: 1 }
      ],
      otherStores: [
        { name: "Thread transcripts", count: "412 threads", note: "Searchable through a scoped tool" },
        { name: "Goal state and ledgers", count: "18 Goals", note: "Owned by Goal Runtime" },
        { name: "Tool artefacts", count: "1,240 files", note: "Owned by the run that produced them" },
        { name: "Planning ledgers", count: "6 PlanningRuns", note: "Owned by Planning Wizard" }
      ]
    },

    "manager-mcp": {
      id: "manager-mcp", title: "MCP servers",
      purpose: "Server identity, transport, negotiated protocol, health and what each one exposes.",
      icon: "plug",
      servers: [
        { id: "mcp-github", name: "GitHub", transport: "stdio", protocolRequested: "2025-06-18", protocolNegotiated: "2025-06-18",
          state: "connected", scope: "Global", auth: "Puppet Master sign-in", health: "Healthy · 3 minutes ago",
          tools: 14, resources: 2, exposed: 4, approval: "Once per session", lastError: null },
        { id: "mcp-postgres", name: "postgres", transport: "stdio", protocolRequested: "2025-06-18", protocolNegotiated: null,
          state: "disconnected", scope: "This project", auth: "Connection string in the project keychain",
          health: "Disconnected · 2 days ago", tools: 6, resources: 1, exposed: 0, approval: "Every call",
          lastError: "connect ECONNREFUSED 127.0.0.1:5432 — the database container is not running." },
        { id: "mcp-filesystem", name: "filesystem", transport: "stdio", protocolRequested: "2025-06-18", protocolNegotiated: "2025-06-18",
          state: "connected", scope: "This project", auth: "None required", health: "Healthy · 3 minutes ago",
          tools: 8, resources: 0, exposed: 3, approval: "Persistent per tool", lastError: null },
        { id: "mcp-sentry", name: "Sentry", transport: "http", protocolRequested: "2025-06-18", protocolNegotiated: "2025-03-26",
          state: "degraded", scope: "Global", auth: "API token", health: "Older protocol negotiated",
          tools: 5, resources: 3, exposed: 2, approval: "Once per session",
          lastError: null, note: "The server negotiated an older protocol version. Resource subscriptions are unavailable as a result." },
        { id: "mcp-figma", name: "Figma", transport: "http", protocolRequested: "2025-06-18", protocolNegotiated: "2025-06-18",
          state: "connected", scope: "Global", auth: "OAuth", health: "Healthy · 20 minutes ago",
          tools: 4, resources: 6, exposed: 1, approval: "Every call", lastError: null },
        { id: "mcp-internal", name: "orchard-internal", transport: "stdio", protocolRequested: "2025-06-18", protocolNegotiated: "2025-06-18",
          state: "managed", scope: "Global", auth: "Device policy", health: "Healthy · 1 minute ago",
          tools: 11, resources: 0, exposed: 5, approval: "Persistent per tool",
          managedReason: "Deployed by your organisation. It cannot be removed from Settings.", lastError: null }
      ]
    },

    "manager-crew": {
      id: "manager-crew", title: "Crew templates",
      purpose: "Reusable execution compositions owned by Orchestrator. Not a Persona, provider, mode or shared memory.",
      icon: "users",
      capacityNote: "Requested composition and effective composition are different things. Current sustainable concurrency is 3.",
      templates: [
        {
          id: "crew-review", name: "Review pair", purpose: "One implementer, one independent reviewer.",
          members: [
            { role: "Implementer", persona: "Collaborator", routes: ["Claude Sonnet 4.6 (work)", "GPT-5.2 (API)"], policy: "adaptive" },
            { role: "Reviewer", persona: "Overseer", routes: ["GPT-5.2 (API)"], policy: "strict" }
          ],
          min: 2, max: 2, requested: 2, effective: 2, waves: 1,
          guards: { time: "45 minutes", spend: "$5", reserve: "20% for synthesis" },
          isolation: "Shared worktree, separate paths", ports: "Pick a free port",
          board: "Shared board, updated after each round",
          consensus: "Reviewer decides", childDepth: 0, onFailure: "Stop and report", state: "ok"
        },
        {
          id: "crew-squad", name: "Feature squad", purpose: "Parallel implementation across services with a synthesis pass.",
          members: [
            { role: "Lead", persona: "Collaborator", routes: ["Claude Opus 4.6 (work)"], policy: "strict" },
            { role: "Service worker", persona: "Collaborator", routes: ["Claude Sonnet 4.6 (work)", "Qwen3 Coder (Ollama)"], policy: "adaptive" },
            { role: "Service worker", persona: "Collaborator", routes: ["Claude Sonnet 4.6 (work)", "Qwen3 Coder (Ollama)"], policy: "adaptive" },
            { role: "Tester", persona: "Overseer", routes: ["GPT-5.2 (API)"], policy: "adaptive" },
            { role: "Synthesiser", persona: "Collaborator", routes: ["Claude Opus 4.6 (work)"], policy: "strict" }
          ],
          min: 3, max: 5, requested: 5, effective: 3, waves: 2,
          guards: { time: "2 hours", spend: "$20", reserve: "20% for synthesis" },
          isolation: "One worktree per member", ports: "Pick a free port",
          board: "Shared board, updated per wave",
          consensus: "Lead reduces", childDepth: 1, onFailure: "Retry once, then stop", state: "overCapacity",
          capacityNote: "Requested 5. Three run now; two are queued for a second wave."
        },
        {
          id: "crew-research", name: "Research trio", purpose: "Bounded research with independent synthesis.",
          members: [
            { role: "Researcher", persona: "Deep Researcher", routes: ["Claude Sonnet 4.6 (work)"], policy: "adaptive" },
            { role: "Researcher", persona: "Deep Researcher", routes: ["Qwen3 Coder (Ollama)"], policy: "adaptive" },
            { role: "Synthesiser", persona: "Collaborator", routes: ["Claude Opus 4.6 (work)"], policy: "strict" }
          ],
          min: 2, max: 3, requested: 3, effective: 3, waves: 1,
          guards: { time: "30 minutes", spend: "$3", reserve: "30% for synthesis" },
          isolation: "No worktree, read only", ports: "Not used",
          board: "Shared board, updated when a researcher finishes",
          consensus: "Synthesiser reduces", childDepth: 0, onFailure: "Continue with what returned", state: "ok"
        },
        {
          id: "crew-migration", name: "Migration crew", purpose: "Schema migration with a verifier and a rollback owner.",
          members: [
            { role: "Migrator", persona: "Migration specialist", routes: ["Claude Opus 4.6 (work)"], policy: "strict" },
            { role: "Verifier", persona: "Overseer", routes: ["GPT-5.2 (API)"], policy: "strict" },
            { role: "Rollback owner", persona: "Bash", routes: ["Claude Haiku 4.5 (work)"], policy: "adaptive" }
          ],
          min: 3, max: 3, requested: 3, effective: 0, waves: 0,
          guards: { time: "1 hour", spend: "$10", reserve: "30% for verification" },
          isolation: "Dedicated worktree", ports: "Isolated",
          board: "Shared board, gated by the verifier",
          consensus: "Verifier must agree", childDepth: 0, onFailure: "Roll back and stop", state: "blocked",
          blockedReason: "The Migration specialist Persona is still a draft, so this template cannot start."
        },
        {
          id: "crew-solo", name: "Single worker", purpose: "One agent, no coordination overhead.",
          members: [{ role: "Worker", persona: "Collaborator", routes: ["Claude Sonnet 4.6 (work)"], policy: "adaptive" }],
          min: 1, max: 1, requested: 1, effective: 1, waves: 1,
          guards: { time: "30 minutes", spend: "$2", reserve: "None" },
          isolation: "Shared worktree", ports: "Pick a free port",
          board: "Not applicable — nothing to coordinate with one worker",
          consensus: "Not applicable", childDepth: 0, onFailure: "Stop and report", state: "ok"
        }
      ]
    },

    "manager-media": {
      id: "manager-media", title: "Media providers and routes",
      purpose: "The same connection rigor as coding providers, plus purpose, modality and output.",
      icon: "image",
      providers: [
        {
          id: "media-nano", name: "Nano Banana Pro", connection: "API key", state: "connected", statusWord: "Ready",
          identity: "Key ending 7d31", modalities: { image: "native", audio: "unsupported", video: "unsupported" },
          purposes: ["Image generation", "Image editing"], output: "Project folder · assets/generated · PNG",
          safety: "Provider policy: standard", cost: "Billed per image · $0.04", fallback: "Local diffusion",
          history: 24, lastUse: "2 hours ago"
        },
        {
          id: "media-local", name: "Local diffusion", connection: "Local endpoint", state: "connected", statusWord: "Ready",
          identity: "http://127.0.0.1:7860", modalities: { image: "native", audio: "unsupported", video: "unsupported" },
          purposes: ["Fallback image generation"], output: "Project folder · assets/generated · PNG",
          safety: "Local policy: none applied", cost: "No cost · local hardware", fallback: "None",
          history: 8, lastUse: "yesterday"
        },
        {
          id: "media-voice", name: "Voice service", connection: "API key", state: "setup", statusWord: "Not configured",
          identity: "No key yet", modalities: { image: "unsupported", audio: "native", video: "unsupported" },
          purposes: ["Speech output"], output: "Not configured",
          safety: "Unknown until connected", cost: "Unknown until connected", fallback: "None",
          history: 0, lastUse: "never",
          setupNote: "Add a key to enable speech output. Nothing routes here until then."
        },
        {
          id: "media-analysis", name: "Vision through the Assistant route", connection: "Uses the configured Assistant route", state: "connected", statusWord: "Ready",
          identity: "Claude Opus 4.6 (work)", modalities: { image: "native", audio: "transformed", video: "unsupported" },
          purposes: ["Image analysis", "Screenshot reading"], output: "Not applicable",
          safety: "Follows the provider's policy", cost: "Counts against the Claude work allowance", fallback: "GPT-5.2 (API)",
          history: 61, lastUse: "12 minutes ago",
          note: "Audio is described through a transformation step rather than read natively."
        }
      ]
    },

    "manager-lsp": { id: "manager-lsp", title: "Language servers", purpose: "Detected servers, coverage and health.", icon: "fileText" },
    "manager-filesafe": { id: "manager-filesafe", title: "Permissions and FileSafe", purpose: "What agents may read, write and run, and where.", icon: "shield" },
    "manager-dictionaries": { id: "manager-dictionaries", title: "Dictionaries", purpose: "Personal and project word lists.", icon: "book" },
    "manager-commands": { id: "manager-commands", title: "Commands and shortcuts", purpose: "Search, remap, resolve conflicts.", icon: "list" },
    "manager-usage": { id: "manager-usage", title: "Usage", purpose: "Measured balances, history and forecasts.", icon: "gauge", external: true }
  };

  /* ================================================================ ACTIONS */

  var actions = [
    { id: "act-refresh-catalogues", label: "Refresh model catalogues", explanation: "Re-read models.dev and Free Coding Models now.",
      categoryId: "agents", subcategoryId: "agents-models", managerId: "manager-providers",
      path: ["Agents & models", "Model catalogue"], keywords: ["refresh", "catalog", "models.dev"] },
    { id: "act-signin-claude", label: "Sign in to the Claude personal profile", explanation: "Launches the Claude CLI's own login inside its isolated profile.",
      categoryId: "agents", subcategoryId: "agents-providers", managerId: "manager-providers",
      path: ["Agents & models", "Providers and accounts"], keywords: ["login", "oauth", "claude"] },
    { id: "act-reconnect-mcp", label: "Reconnect the postgres MCP server", explanation: "Retry the connection and report what happened.",
      categoryId: "extensions", subcategoryId: "ext-mcp", managerId: "manager-mcp",
      path: ["Tools, skills & connections", "MCP servers"], keywords: ["mcp", "reconnect", "postgres"] },
    { id: "act-reset-section", label: "Reset a section to defaults", explanation: "Return one Settings section to its shipped values.",
      categoryId: "system", subcategoryId: "sys-reset", path: ["System & diagnostics", "Reset"], keywords: ["reset", "default"] },
    { id: "act-export-settings", label: "Export settings", explanation: "Write settings to a file, excluding credentials.",
      categoryId: "system", subcategoryId: "sys-backup", path: ["System & diagnostics", "Backups & restore points"], keywords: ["backup", "export"] },
    { id: "act-prune-snapshots", label: "Prune old restore points", explanation: "Remove snapshots past the retention window.",
      categoryId: "system", subcategoryId: "sys-backup", path: ["System & diagnostics", "Backups & restore points"], keywords: ["snapshot", "prune", "disk"] },
    { id: "act-diagnostic", label: "Create a diagnostic report", explanation: "Collect logs and configuration into one file.",
      categoryId: "system", subcategoryId: "sys-logs", exposure: "diagnostic",
      path: ["System & diagnostics", "Logs & diagnostics"], keywords: ["diagnose", "report", "support"] },
    { id: "act-rebuild-memory", label: "Rebuild the memory index", explanation: "Re-derive the recall index and remove duplicates.",
      categoryId: "context", subcategoryId: "context-memory", managerId: "manager-memory", exposure: "advanced",
      path: ["Context & memory", "Assistant memory"], keywords: ["memory", "index", "dedupe"] }
  ];

  /* ================================================================== USAGE */

  var usage = {
    ownedBy: "Usage",
    note: "Settings shows a read-only snapshot. Measurement, history, projection and forecasting belong to Usage.",
    snapshots: [
      { providerId: "claude", account: "work", includedRemaining: "8%", extra: "None", resets: "3 h 40 m", pressure: "high", lastUse: "4 minutes ago", freshness: "Provider-reported, 4 minutes ago", runOut: "About 25 minutes at the current rate" },
      { providerId: "openai", account: "Signed in", includedRemaining: "61%", extra: "Pay as you go after the plan", resets: "18 days", pressure: "low", lastUse: "yesterday", freshness: "Provider-reported, 2 hours ago", runOut: "Not before the reset" },
      { providerId: "openrouter", account: "personal key", includedRemaining: "$0.00", extra: "Add credit", resets: "Not applicable", pressure: "exhausted", lastUse: "failed 12 minutes ago", freshness: "Provider-reported, 18 minutes ago", runOut: "Already exhausted" }
    ]
  };

  /* ============================================================ DEMO STATES */
  /* The switcher in each concept drives these; nothing is hard-coded to one. */

  var demoStates = [
    { id: "normal", label: "Normal", note: "The default fixture: several notices, mixed provider health." },
    { id: "calm", label: "Calm — nothing needs attention", note: "All notices resolved. Proves the home is not built around alarms." },
    { id: "attention", label: "Several things need attention", note: "Adds a failed catalogue refresh and an expired grant." },
    { id: "loading", label: "Catalogues refreshing", note: "Last-known-good rows stay in place while the refresh runs." },
    { id: "degraded", label: "Provider degraded", note: "Authenticated but generation failing, with the diagnosis shown." },
    { id: "exhausted", label: "Included usage exhausted", note: "Provider-specific continuation choices become the primary decision." },
    { id: "offline", label: "Offline — the owning host cannot be reached", note: "Every remote route fails honestly. Cached values stay on screen and say when they were last verified." },
    { id: "lowResource", label: "Low resource — older or loaded machine", note: "The Legacy profile is in force: fewer helpers, smaller caches, no prewarm. Nothing is removed." },
    { id: "largeCatalog", label: "Large catalogue — 100 installations", note: "Volume fixtures are live so windowed lists and search at scale can be seen rather than described." }
  ];

  /* Deliberately not frozen here. Domain modules (pm-data-install.js,
   * pm-data-taxonomy.js, pm-data-agents.js, pm-data-desktop.js, pm-data-dev.js,
   * pm-data-system.js) contribute after this file loads; shared/pm-data-seal.js
   * freezes the finished object last. */
  window.PMData = {
    categories: categories,
    notices: notices,
    providers: providers,
    managers: managers,
    actions: actions,
    usage: usage,
    routeDifferences: routeDifferences,
    demoStates: demoStates,

    /* Names the spellchecker must never flag. */
    knownNames: [
      "Puppet Master", "Claude", "Opus", "Sonnet", "Haiku", "Anthropic", "OpenAI", "Codex", "GPT",
      "Antigravity", "Copilot", "GitHub", "Ollama", "OpenRouter", "Qwen", "Llama", "DeepSeek", "Kimi",
      "GLM", "Mistral", "Groq", "Nano Banana", "Slint", "orchard", "Orchestrator", "FileSafe",
      "AGENTS", "MCP", "LSP", "Jira", "Datadog", "Notion", "Figma", "Sentry", "postgres", "zsh",
      "PowerShell", "Persona", "Personas", "Gist", "Gists", "PlanningRun", "Priya", "Jared"
    ],

    /* Provider installation lifecycle. Filled by shared/pm-data-install.js. */
    installations: [],
    updateAttempts: []
  };
})();
