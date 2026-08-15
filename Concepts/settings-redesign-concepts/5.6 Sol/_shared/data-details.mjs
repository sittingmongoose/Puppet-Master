// Dynamically loaded detailed concept fixtures. Keep this module off the Home/search startup path.
// The counter is deterministic concept telemetry used to prove that compact Home
// and search do not evaluate this module before an explicit destination opens.
globalThis.__pmSettingsDetailModuleLoads = (globalThis.__pmSettingsDetailModuleLoads || 0) + 1;
import {
  EXTRA_MANAGERS,
  CONCEPT_MANAGER_ASSIGNMENTS,
  EXTRA_MANAGER_INVENTORIES,
  PROVIDER_INSTALLATIONS,
  FLOW_TEMPLATES,
  DETERMINISTIC_TRIGGERS,
  MANAGER_COVERAGE_LABELS
} from "./manager-data.mjs";

export { CONCEPT_MANAGER_ASSIGNMENTS, FLOW_TEMPLATES, DETERMINISTIC_TRIGGERS, MANAGER_COVERAGE_LABELS };

export const MODEL_NAME = "5.6 Sol";

export const THEMES = [
  ["friendly-dark", "Friendly Dark"],
  ["friendly-light", "Friendly Light"],
  ["glass-dark", "Glass Dark"],
  ["glass-light", "Glass Light"],
  ["retro-dark", "Retro Dark"],
  ["retro-light", "Retro Light"],
  ["basic-dark", "Basic Dark"],
  ["basic-light", "Basic Light"]
];

export const CONCEPTS = {
  "index-house": {
    number: "01",
    name: "Index House",
    title: "5.6 Sol — Index House",
    thesis: "A stable directory where every setting has an address.",
    homePrompt: "Find a setting, action, or manager"
  },
  switchboard: {
    number: "02",
    name: "Switchboard",
    title: "5.6 Sol — Switchboard",
    thesis: "An operational board organized around readiness and action.",
    homePrompt: "Route a change or inspect system readiness"
  },
  wayfinder: {
    number: "03",
    name: "Wayfinder",
    title: "5.6 Sol — Wayfinder",
    thesis: "Human goals become routes through the Settings system.",
    homePrompt: "Where do you want Puppet Master to take you?"
  },
  ledger: {
    number: "04",
    name: "Ledger",
    title: "5.6 Sol — Ledger",
    thesis: "A dense reference for comparing requested, inherited, and effective state.",
    homePrompt: "Search the Settings ledger"
  }
};

export const VALUE_STATES = [
  "Default",
  "Inherited",
  "Auto",
  "Not configured",
  "Managed",
  "Custom",
  "Unavailable",
  "Effective value differs"
];

export const EXPOSURE_LEVELS = [
  "Standard",
  "Advanced",
  "Expert or risky",
  "Managed/read-only",
  "Diagnostic",
  "Unavailable"
];

const legacyState = (valueState, recommended) => {
  if (recommended) return "recommended";
  return ({
    Default: "default",
    Inherited: "inherited",
    Auto: "auto",
    "Not configured": "not-configured",
    Managed: "managed",
    Custom: "custom",
    Unavailable: "unavailable",
    "Effective value differs": "effective-difference"
  })[valueState] || "custom";
};

const canonicalState = (value, options) => {
  if (options.valueState) return options.valueState;
  if (options.status === "managed") return "Managed";
  if (options.status === "inherited") return "Inherited";
  if (options.status === "unavailable" || options.available === false && options.unavailableReason) return "Unavailable";
  if (options.status === "effective-difference") return "Effective value differs";
  if (options.status === "default") return "Default";
  if (options.status === "not-configured" || value === "Not configured") return "Not configured";
  if (options.status === "auto" || value === "Automatic" || String(value).startsWith("Auto-detected")) return "Auto";
  return "Custom";
};

const setting = (id, label, description, type, value, options = {}) => ({
  id,
  label,
  description,
  type,
  value,
  defaultValue: options.defaultValue ?? value,
  recommendedValue: options.recommendedValue,
  recommended: Boolean(options.recommended ?? (options.status === "recommended")),
  source: options.source || "Global default",
  valueSource: options.valueSource || {
    label: options.source || "Global default",
    kind: options.status === "managed" ? "policy" : options.status === "inherited" ? "inheritance" : "setting"
  },
  scope: options.scope || "Global",
  exposure: options.exposure || "Standard",
  valueState: canonicalState(value, options),
  status: options.status || legacyState(canonicalState(value, options), Boolean(options.recommended ?? (options.status === "recommended"))),
  available: options.available !== false,
  mutable: options.mutable ?? (options.available !== false && options.status !== "managed" && options.status !== "effective-difference"),
  managedReason: options.managedReason || "",
  unavailableReason: options.unavailableReason || "",
  requestedValue: options.requestedValue,
  effectiveValue: options.effectiveValue,
  effect: options.effect || "",
  effects: options.effects || (options.effect ? [{ kind: "information", label: options.effect }] : []),
  requires: options.requires || "",
  requirements: options.requirements || (options.requires ? [{ kind: "activation", label: options.requires }] : []),
  choices: options.choices || [],
  min: options.min,
  max: options.max,
  step: options.step,
  unit: options.unit || "",
  validation: options.validation || {
    required: type !== "action" && value !== "",
    allowedValues: options.choices || undefined,
    minimum: options.min,
    maximum: options.max,
    step: options.step
  },
  help: options.help || `${description} Current source: ${options.source || "Global default"}.`,
  search: options.search || []
});

export const CATEGORIES = [
  {
    id: "experience",
    title: "Start & Appearance",
    route: "Make PM feel right",
    icon: "settings",
    purpose: "Startup, defaults, layout, motion, input, and the everyday feel of Puppet Master.",
    status: "Ready",
    subcategories: [
      {
        id: "startup-defaults",
        title: "Startup & defaults",
        description: "Choose what opens, resumes, and becomes the starting point for new work.",
        settings: [
          setting("experience.startup.resume", "Resume the last workspace", "Reopen the last project and restore its panel arrangement after launch.", "toggle", true, { recommendedValue: true, status: "recommended" }),
          setting("experience.startup.page", "Starting page", "Choose the first page shown when there is no workspace to resume.", "select", "Home", { choices: ["Home", "Projects", "Planning Wizard", "Orchestrator"], status: "default" }),
          setting("experience.startup.recovery", "Crash recovery", "Restore unsaved drafts and layout state after an unexpected shutdown.", "select", "Automatic", { choices: ["Automatic", "Ask first", "Off"], effect: "Recovery snapshots stay on this device." })
        ]
      },
      {
        id: "appearance-input",
        title: "Appearance, motion & input",
        description: "Adjust theme, density, motion, keyboard behavior, and writing assistance.",
        settings: [
          setting("experience.appearance.theme", "Theme", "Change the visual family and light or dark mode without restarting.", "select", "Friendly Dark", { choices: THEMES.map(([, label]) => label), status: "custom" }),
          setting("experience.appearance.motion", "Reduce interface motion", "Use short state fades instead of spatial transitions.", "toggle", false, { source: "System preference", scope: "Global", status: "inherited" }),
          setting("experience.appearance.density", "Interface density", "Balance breathing room with how much information fits at once.", "select", "Automatic", { choices: ["Automatic", "Comfortable", "Compact"], recommendedValue: "Automatic" }),
          setting("experience.input.spelling", "Check spelling", "Underline likely misspellings in user-authored prose without changing text automatically.", "toggle", true, { recommendedValue: true, status: "recommended", search: ["dictionary", "writing", "misspelling"] }),
          setting("experience.input.language", "Spelling language", "Choose the language used for user-authored prose. Automatic follows the active writing language.", "select", "Automatic", { choices: ["Automatic", "English (United States)", "English (United Kingdom)", "Installed language packs"], valueState: "Auto", search: ["writing language", "dictionary"] }),
          setting("experience.input.dictionary-source", "Dictionary source", "Prefer the operating-system spelling service and fall back to Puppet Master local dictionaries.", "select", "Automatic", { choices: ["Automatic", "System dictionaries only", "Puppet Master local dictionaries only"], valueState: "Auto", search: ["system dictionary", "local dictionary"] }),
          setting("experience.input.personal-dictionary", "Personal dictionary", "Review words that spelling should recognize across your projects.", "action", "Manage personal words", { scope: "Global", effect: "This concept changes only its local writing preview; production writes require an explicit save.", search: ["custom words", "spelling"] }),
          setting("experience.input.project-dictionary", "Project dictionary", "Recognize project-specific terms when the active project provides a dictionary.", "select", "Use when available", { choices: ["Use when available", "Do not use"], valueState: "Inherited", source: "Project writing policy", scope: "Project", search: ["project words", "spelling"] }),
          setting("experience.input.project-dictionary-manage", "Project dictionary words", "Inspect or manage recognized project terms without exposing them to a provider.", "action", "Manage project words", { scope: "Project", exposure: "Advanced", search: ["project dictionary", "custom words"] }),
          setting("experience.input.technical-prose", "Check technical prose", "Check explanatory prose near technical content while still skipping literal code, paths, commands, and identifiers.", "toggle", false, { exposure: "Advanced", valueState: "Default", defaultValue: false, effects: [{ kind: "privacy", label: "Runs through the system or local spelling service, never an ordinary model route." }] }),
          setting("experience.input.unknown-names", "Underline unknown names", "Mark unfamiliar names only when they are not recognized models, providers, Personas, tools, or project terms.", "toggle", false, { exposure: "Advanced", valueState: "Default", defaultValue: false }),
          setting("experience.input.language-packs", "Additional language packs", "Inspect installed local language packs and add another pack through an explicit setup flow.", "action", "Manage language packs", { exposure: "Advanced" }),
          setting("experience.input.overrides", "Writing overrides", "Review thread and project spellcheck exceptions without adding a permanent composer control.", "action", "Manage writing overrides", { exposure: "Advanced", scope: "Thread and project" }),
          setting("experience.input.grammar", "Grammar and style assistance", "Optional provider-assisted writing feedback is separate from spelling and stays off until its privacy and usage route are reviewed.", "toggle", false, { exposure: "Expert or risky", valueState: "Default", defaultValue: false, effects: [{ kind: "privacy", label: "When enabled, selected prose may be sent to the disclosed provider route." }, { kind: "cost", label: "Provider usage may apply." }] })
        ]
      }
    ]
  },
  {
    id: "intelligence",
    title: "Intelligence & Accounts",
    route: "Connect intelligence",
    icon: "brain",
    purpose: "Providers, accounts, connections, models, role assignments, personas, and media routes.",
    status: "2 need attention",
    manager: "providers",
    subcategories: [
      {
        id: "routing-roles",
        title: "Routing & roles",
        description: "Choose qualified routes for conversation, planning, Goal work, and verification.",
        settings: [
          setting("intelligence.roles.assistant", "Main Assistant route", "The default high-quality conversational route for Assistant Chat.", "select", "5.6 Sol — Personal Codex", { choices: ["5.6 Sol — Personal Codex", "Claude Sonnet — Personal profile", "Ask each time"], status: "custom" }),
          setting("intelligence.roles.planning", "Planning conversation route", "PRD Builder and Planning Wizard use this qualified route for clarification and synthesis.", "select", "Use Main Assistant", { choices: ["Use Main Assistant", "5.6 Sol — Personal Codex", "Claude Opus — Personal profile"], recommendedValue: "Use Main Assistant", status: "recommended" }),
          setting("intelligence.routing.fallback", "Provider fallback", "Ask before moving a user-facing conversation to a different provider family.", "select", "Ask before switching provider", { choices: ["Ask before switching provider", "Use qualified fallback", "Stop and wait"], effect: "Background extraction may still use eligible routes." })
        ]
      },
      {
        id: "continuation-usage",
        title: "Continuation & usage policy",
        description: "Configure what future work may do when a specific provider or product runs out.",
        settings: [
          setting("intelligence.usage.codex-next", "When Codex included usage runs out", "Apply a provider-specific next action instead of a universal budget rule.", "select", "Ask each time", { choices: ["Stop and wait", "Use API billing", "Switch qualified account", "Ask each time"], status: "custom" }),
          setting("intelligence.usage.snapshot", "Usage snapshot freshness", "Provider managers show read-only Usage data and deep-link to Usage for detail.", "select", "Refresh every 10 minutes", { choices: ["Refresh every 5 minutes", "Refresh every 10 minutes", "Manual only"], exposure: "Advanced" }),
          setting("intelligence.usage.managed", "Organization billing route", "The organization policy selects the effective billing route for work projects.", "select", "Work API connection", { choices: ["Work API connection"], status: "managed", managedReason: "Managed by the Work organization", source: "Organization policy", available: false })
        ]
      }
    ]
  },
  {
    id: "safety",
    title: "Safety & Permissions",
    route: "Control what agents may do",
    icon: "shield",
    purpose: "Approvals, FileSafe, sandboxes, network access, and scoped cross-project grants.",
    status: "Protected",
    subcategories: [
      {
        id: "approvals-sandbox",
        title: "Approvals & sandbox",
        description: "Set durable ceilings while keeping live approval decisions in their owning surfaces.",
        settings: [
          setting("safety.approvals.default", "Default approval posture", "Choose how often agents ask before actions with material effects.", "select", "Balanced", { choices: ["Cautious", "Balanced", "Move quickly"], recommendedValue: "Balanced" }),
          setting("safety.sandbox.files", "Project file access", "Keep writes inside the active project unless a scoped grant allows more.", "select", "Active project only", { choices: ["Active project only", "Approved paths", "Read only"], source: "Project policy" }),
          setting("safety.network.children", "Child agent network access", "Children may inherit only the network grant explicitly scoped by their parent.", "select", "Inherit scoped grant", { choices: ["Never", "Ask each time", "Inherit scoped grant"], exposure: "Expert or risky", effect: "A Persona cannot widen this ceiling." })
        ]
      },
      {
        id: "cross-project",
        title: "Cross-project access",
        description: "Keep read and write grants separate and make their duration explicit.",
        settings: [
          setting("safety.projects.read", "Read another project", "Permit a scoped lookup when a task needs evidence from a named project.", "select", "Ask each time", { choices: ["Off", "Ask each time", "Named project pairs"], status: "default" }),
          setting("safety.projects.write", "Write to another project", "Cross-project writes remain off unless separately granted.", "select", "Off", { choices: ["Off", "Ask each time", "Named project pairs"], recommendedValue: "Off", status: "recommended" }),
          setting("safety.filesafe.rules", "FileSafe policy details", "Inspect protected patterns and recovery guidance without exposing raw policy internals.", "action", "Review policy", { exposure: "Advanced" })
        ]
      }
    ]
  },
  {
    id: "code",
    title: "Code & Environment",
    route: "Build and operate",
    icon: "code",
    purpose: "Editor, terminal, shell, languages, LSP, formatters, containers, and execution environments.",
    status: "1 setup remaining",
    manager: "terminal",
    subcategories: [
      {
        id: "editor-language",
        title: "Editor & languages",
        description: "Configure language intelligence, formatting ownership, and editor behavior.",
        settings: [
          setting("code.editor.format", "Format files after an approved edit", "Use the owning formatter only after a change has been accepted.", "toggle", true, { source: "Project override", scope: "Project", status: "custom" }),
          setting("code.language.lsp", "Language server startup", "Start detected servers when their language appears in the workspace.", "select", "Automatic when needed", { choices: ["Automatic when needed", "At workspace open", "Manual"], recommendedValue: "Automatic when needed" }),
          setting("code.language.python", "Python language support", "No compatible Python language server is installed yet.", "select", "Not configured", { choices: ["Not configured"], status: "unavailable", available: false, unavailableReason: "Install or connect a Python language server first" })
        ]
      },
      {
        id: "execution-runtime",
        title: "Execution & runtime",
        description: "Control shell discovery, container preferences, diagnostics, and performance.",
        settings: [
          setting("code.shell.path", "Default shell", "Use the detected login shell unless a profile explicitly overrides it.", "text", "Auto-detected: /bin/zsh", { status: "inherited", source: "Operating system" }),
          setting("code.runtime.container", "Container preference", "Choose when work should move into an isolated container.", "select", "Ask when useful", { choices: ["Ask when useful", "Prefer containers", "Local only"], effect: "Live runs may choose a stricter environment." }),
          setting("code.runtime.renderer", "Graphics renderer", "Automatic selects the preferred Slint renderer and preserves a software fallback.", "select", "Automatic", { choices: ["Automatic", "Skia", "FemtoVG", "Software"], exposure: "Diagnostic", requires: "Restart required" })
        ]
      }
    ]
  },
  {
    id: "context",
    title: "Context & Memory",
    route: "Keep the right context",
    icon: "memory",
    purpose: "History, Assistant memory, instructions, retention, compaction, and context admission.",
    status: "Healthy",
    manager: "memory",
    subcategories: [
      {
        id: "context-admission",
        title: "Context & instructions",
        description: "Admit relevant sources without flattening every durable record into each turn.",
        settings: [
          setting("context.previous-chats", "Use relevant previous chats", "Search prior project conversations when they can materially help the current task.", "toggle", true, { status: "recommended", recommendedValue: true }),
          setting("context.project-code", "Use relevant project code", "Retrieve focused source windows rather than injecting the whole project.", "toggle", true, { status: "recommended", recommendedValue: true }),
          setting("context.instructions.scope", "Project instruction chain", "Admit the scoped instruction chain with visible precedence in diagnostics.", "select", "Automatic and scoped", { choices: ["Automatic and scoped", "Project root only", "Ask each time"], source: "Project policy" })
        ]
      },
      {
        id: "compaction-retention",
        title: "Compaction & retention",
        description: "Configure context maintenance while keeping durable history and Assistant Gists distinct.",
        settings: [
          setting("context.compaction.auto", "Compact when needed", "Create a continuity capsule before a provider context limit becomes a problem.", "toggle", true, { status: "recommended", recommendedValue: true }),
          setting("context.cache.warn", "Warn before a material cache-route change", "Explain when a context change is likely to reduce cache reuse or increase cost.", "toggle", true),
          setting("context.retention.raw", "Raw transcript retention", "Keep project conversations according to the project retention policy.", "select", "90 days", { choices: ["30 days", "90 days", "One year", "Until deleted"], status: "managed", managedReason: "Managed by project retention policy", available: false, source: "Project policy" })
        ]
      }
    ]
  },
  {
    id: "planning",
    title: "Planning & Automation",
    route: "Plan and verify",
    icon: "plan",
    purpose: "PRD and Planning flows, Goal defaults, testing, verification, checkpoints, and automation policy.",
    status: "Ready",
    subcategories: [
      {
        id: "goal-defaults",
        title: "Goal & planning defaults",
        description: "Configure defaults and ceilings while live surfaces retain pause, resume, stop, and progress.",
        settings: [
          setting("planning.goal.concurrency", "Configured agent concurrency", "Set the maximum agents a Goal may admit before live capacity is considered.", "range", 4, { min: 1, max: 12, step: 1, status: "custom", effect: "Current sustainable capacity is 2 agents and 3 queued waves." }),
          setting("planning.goal.reserve", "Reserve for synthesis and verification", "Keep enough provider capacity for integration, testing, and repair.", "select", "20 percent", { choices: ["10 percent", "20 percent", "30 percent", "Ask each Goal"], recommendedValue: "20 percent" }),
          setting("planning.goal.effective", "Current sustainable concurrency", "Settings shows the requested and effective values supplied by RuntimeResourceGovernor. Usage reports provider consumption; Orchestrator projects run state, but neither owns admission policy.", "comparison", "4 configured", { requestedValue: "4 agents", effectiveValue: "2 agents", status: "effective-difference", available: false, source: "RuntimeResourceGovernor projection" })
        ]
      },
      {
        id: "testing-automation",
        title: "Testing & automation",
        description: "Choose when tests run, how visible they are, and how evidence is retained.",
        settings: [
          setting("planning.testing.policy", "Automatic testing", "Run focused checks after edits and surface their receipts in the owning task.", "select", "Focused checks", { choices: ["Off", "Focused checks", "Full project checks"], recommendedValue: "Focused checks" }),
          setting("planning.testing.browser", "Browser verification", "Allow local browser sessions for visual and interaction evidence.", "select", "Ask for external sites", { choices: ["Local pages only", "Ask for external sites", "Off"], scope: "Project" }),
          setting("planning.automation.checkpoints", "Automatic checkpoints", "Create recoverable checkpoints before risky or long-running waves.", "toggle", true, { status: "recommended", recommendedValue: true })
        ]
      }
    ]
  },
  {
    id: "collaboration",
    title: "Git & Collaboration",
    route: "Coordinate work safely",
    icon: "branch",
    purpose: "Git, worktrees, Crew templates, subagents, coordination, and collision policy.",
    status: "Ready",
    manager: "crew",
    subcategories: [
      {
        id: "worktrees-resources",
        title: "Worktrees & resources",
        description: "Coordinate branches, paths, ports, and test resources without hiding live conflicts.",
        settings: [
          setting("collaboration.worktree.auto", "Provision worktrees", "Choose whether parallel implementation work receives isolated worktrees.", "select", "Ask when parallel", { choices: ["Automatic", "Ask when parallel", "Never"], status: "default" }),
          setting("collaboration.ports.collision", "Port collision behavior", "Use an available port and report it instead of stopping an unrelated process.", "select", "Choose another port", { choices: ["Choose another port", "Ask first", "Stop the new task"], recommendedValue: "Choose another port" }),
          setting("collaboration.dirty.policy", "Dirty worktree handling", "Preserve unrelated changes and stop if the requested edit overlaps them.", "select", "Preserve and inspect", { choices: ["Preserve and inspect", "Ask before any edit", "Read only"], source: "Safety policy" })
        ]
      },
      {
        id: "crew-subagents",
        title: "Crew & subagents",
        description: "Configure reusable compositions while RuntimeResourceGovernor alone owns resource and admission policy. Orchestrator projects execution state.",
        settings: [
          setting("collaboration.crew.route", "Crew route policy", "Allow qualified alternatives while preserving role and capability requirements.", "select", "Adaptive within qualifications", { choices: ["Strict assignments", "Adaptive within qualifications"], status: "custom" }),
          setting("collaboration.crew.depth", "Child spawning depth", "Limit recursive delegation even when a Crew member may create helpers.", "range", 2, { min: 0, max: 4, step: 1, exposure: "Advanced" }),
          setting("collaboration.crew.composition", "Requested and effective composition", "A deterministic RuntimeResourceGovernor projection shows five requested members, two admitted, and three queued.", "comparison", "5 requested", { requestedValue: "5 members", effectiveValue: "2 admitted, 3 queued", status: "effective-difference", available: false, source: "RuntimeResourceGovernor projection" })
        ]
      }
    ]
  },
  {
    id: "extensions",
    title: "Tools & Extensions",
    route: "Extend capabilities",
    icon: "tool",
    purpose: "MCP, skills, plugins, tools, commands, web access, search, and progressive exposure.",
    status: "1 server degraded",
    manager: "mcp",
    subcategories: [
      {
        id: "mcp-tools",
        title: "MCP & tools",
        description: "Keep server identity, health, scope, and progressive tool exposure understandable.",
        settings: [
          setting("extensions.mcp.exposure", "Load tool details when needed", "Expose full tool schemas only when a task selects the relevant server or tool.", "toggle", true, { status: "recommended", recommendedValue: true }),
          setting("extensions.mcp.scope", "New server scope", "Choose the default availability for newly connected MCP servers.", "select", "This project", { choices: ["This project", "Every project", "One profile"], status: "default" }),
          setting("extensions.tools.risk", "Unknown tool policy", "Require an explicit review before a newly discovered high-risk tool becomes available.", "select", "Review before enabling", { choices: ["Review before enabling", "Disable", "Use server policy"], source: "Safety policy" })
        ]
      },
      {
        id: "skills-commands-web",
        title: "Skills, commands & web",
        description: "Manage discovery, trust, shortcuts, conflicts, crawling, and project search.",
        settings: [
          setting("extensions.skills.update", "Skill update channel", "Receive compatible updates after source and permission checks.", "select", "Stable", { choices: ["Stable", "Preview", "Manual only"] }),
          setting("extensions.commands.conflicts", "Shortcut conflicts", "Show conflicts before saving a remap and preserve the previous binding.", "select", "Resolve before saving", { choices: ["Resolve before saving", "Allow duplicates"], recommendedValue: "Resolve before saving" }),
          setting("extensions.web.cache", "Web extraction cache", "Reuse recent extractions when source freshness and privacy policy allow it.", "select", "Automatic", { choices: ["Automatic", "Session only", "Off"], exposure: "Advanced" })
        ]
      }
    ]
  },
  {
    id: "media",
    title: "Media & Transformation",
    route: "Create and understand media",
    icon: "media",
    purpose: "Image, audio, and video providers, routes, formats, transformations, safety, and history.",
    status: "Setup available",
    manager: "media",
    subcategories: [
      {
        id: "media-routing",
        title: "Media routes",
        description: "Assign qualified native or transformed routes to each media purpose.",
        settings: [
          setting("media.image.route", "Image generation route", "Choose the preferred route and preserve an explicit fallback.", "select", "OpenAI image route", { choices: ["OpenAI image route", "Local image route", "Ask each time"], status: "custom" }),
          setting("media.vision.route", "Vision analysis route", "Use a model with current evidence for image input and analysis.", "select", "5.6 Sol", { choices: ["5.6 Sol", "Claude Sonnet", "Ask each time"], source: "Role assignment" }),
          setting("media.video.route", "Video generation route", "No video provider has been selected. Continue setup from the Media manager when one is needed.", "select", "Not configured", { choices: ["Not configured", "Choose in Media manager"], valueState: "Not configured", source: "No route selected", search: ["video setup", "storyboard"] }),
          setting("media.output.location", "Generated media location", "Save outputs under a project-owned artifacts folder by default.", "text", "Project artifacts folder", { status: "inherited", source: "Project default" })
        ]
      },
      {
        id: "media-policy",
        title: "Formats, safety & cost",
        description: "Make output contracts and provider-specific cost routes visible.",
        settings: [
          setting("media.output.format", "Default image format", "Choose a broadly compatible output format for generated images.", "select", "PNG", { choices: ["PNG", "WebP", "JPEG"] }),
          setting("media.safety.status", "Content policy status", "This organization requires the standard provider safety policy.", "select", "Standard policy", { choices: ["Standard policy"], status: "managed", managedReason: "Managed by organization policy", available: false, source: "Organization policy" }),
          setting("media.history.retention", "Generation history", "Keep prompts, receipts, and output locations without storing raw credentials.", "select", "90 days", { choices: ["30 days", "90 days", "One year"], exposure: "Advanced" })
        ]
      }
    ]
  },
  {
    id: "system",
    title: "System & Recovery",
    route: "Diagnose and recover",
    icon: "system",
    purpose: "Health, logs, backups, snapshots, diagnostics, updates, storage, and expert controls.",
    status: "Healthy",
    subcategories: [
      {
        id: "health-diagnostics",
        title: "Health & diagnostics",
        description: "Inspect readiness and collect bounded diagnostics without exposing secrets.",
        settings: [
          setting("system.health.startup", "Run startup health checks", "Verify required services, storage, and adapters before accepting new work.", "toggle", true, { status: "recommended", recommendedValue: true }),
          setting("system.logs.detail", "Log detail", "Keep useful support detail without recording raw tokens or secrets.", "select", "Warnings and activity", { choices: ["Errors only", "Warnings and activity", "Debug"], status: "default" }),
          setting("system.diagnostics.bundle", "Support bundle", "Build a redacted local diagnostic bundle and show exactly what it contains.", "action", "Review bundle contents", { exposure: "Diagnostic" })
        ]
      },
      {
        id: "backup-advanced",
        title: "Backups & advanced",
        description: "Control snapshots, imports, updates, storage repair, and high-risk internals.",
        settings: [
          setting("system.backup.auto", "Automatic settings backup", "Keep a rolling local backup before importing or applying material changes.", "toggle", true, { status: "recommended", recommendedValue: true }),
          setting("system.update.channel", "Release channel", "Stable receives broadly verified releases; preview is earlier and less settled.", "select", "Stable", { choices: ["Stable", "Preview"], requires: "Restart may be required" }),
          setting("system.storage.rebuild", "Rebuild local indexes", "Rebuild search and memory projections from their durable sources.", "action", "Inspect rebuild plan", { exposure: "Expert or risky", effect: "The concept returns a simulated receipt only." })
        ]
      }
    ]
  }
];

const CORE_MANAGERS = [
  { id: "providers", title: "Providers, agents & models", purpose: "Accounts, connections, plans, catalogues, role assignments, usage snapshots, and diagnostics.", icon: "provider", full: true },
  { id: "memory", title: "Assistant memory", purpose: "Evidence-backed Gists, verification, provenance, versions, retention, and recall controls.", icon: "memory", full: true },
  { id: "terminal", title: "Terminal profiles", purpose: "Shells, typography, palette, cursor, behavior, retention, performance, and diagnostics.", icon: "terminal", full: true },
  { id: "context", title: "Context & instructions", purpose: "Admitted sources, scoped instructions, compaction, provenance, and diagnostics.", icon: "plan" },
  { id: "personas", title: "Personas", purpose: "Durable behavior definitions, eligibility, compact capsules, and explicit scope.", icon: "brain" },
  { id: "crew", title: "Crew templates", purpose: "Reusable multi-agent compositions, route policies, guards, waves, and recovery.", icon: "branch" },
  { id: "mcp", title: "MCP servers", purpose: "Connections, authentication, discovered capabilities, permissions, health, logs, and diagnostics.", icon: "provider" },
  { id: "lsp", title: "Language servers", purpose: "Detected servers, language coverage, conflicts, startup, restart, and logs.", icon: "code" },
  { id: "extensions", title: "Skills, plugins & tools", purpose: "Discovery, trust, updates, scope, progressive exposure, and compatibility.", icon: "tool" },
  { id: "media", title: "Media providers", purpose: "Image, audio, and video routes, formats, policy, allowance, history, and diagnostics.", icon: "media" }
];

export const CORRECTION_MANAGER_DESTINATIONS = [
  { id: "accessibility-input", title: "Accessibility & input", purpose: "UI scale, fonts, reduced motion, focus, keyboard input, contrast diagnostics, and spellcheck destinations.", icon: "accessibility", insertionOnly: false },
  { id: "dry-method", title: "DRY Method", purpose: "Inspect the effective owner and consumer projection without editing the DRY corpus.", icon: "plan", insertionOnly: false },
  { id: "updates", title: "Puppet Master updates", purpose: "Insertion destination for Puppet Master application and content updates owned by Project Syncing and Updates.", icon: "update", insertionOnly: true, owner: "Project Syncing and Updates" },
  { id: "product-onboarding", title: "Product Onboarding", purpose: "Insertion destination for the separately owned first-run and resume flow.", icon: "guide", insertionOnly: true, owner: "Product Onboarding" },
  { id: "doctor", title: "Doctor", purpose: "Insertion destination for cross-system health and repair handoffs after owner reconciliation.", icon: "health", insertionOnly: true, owner: "Doctor" },
  { id: "server-insertion", title: "Servers & remote access", purpose: "Inspect-only insertion destination. The exact canonical Server owner is unresolved.", icon: "server", insertionOnly: true, owner: null, ownerStatus: "unresolved" }
];

export const MANAGERS = [
  ...CORE_MANAGERS,
  ...EXTRA_MANAGERS.filter((candidate) => !CORE_MANAGERS.some((manager) => manager.id === candidate.id)),
  ...CORRECTION_MANAGER_DESTINATIONS
];

const PROVIDER_BASE = [
  {
    id: "openai",
    name: "OpenAI",
    group: "Connected accounts",
    state: "degraded",
    stateLabel: "Usage action needed",
    summary: "Two accounts and one API connection. Personal included usage is exhausted.",
    activeAccountId: "openai-personal",
    inFlightAccountId: "openai-personal",
    accounts: [
      { id: "openai-personal", name: "Personal Codex", identity: "Personal account fixture", connection: "PM direct sign-in", authOwner: "Puppet Master", isolation: "PM-managed direct connection", product: "Codex subscription", state: "ready", usage: "Included usage exhausted; resets in 2 hours", lastUse: "Deterministic generation fixture succeeded", next: "Ask before API billing" },
      { id: "openai-work", name: "Work Codex", identity: "Organization account fixture", connection: "PM direct sign-in", authOwner: "Puppet Master", isolation: "PM-managed direct connection", product: "Team workspace", state: "ready", usage: "61 percent remains", lastUse: "Deterministic generation fixture succeeded", next: "Stop and wait" },
      { id: "openai-api", name: "Work API", identity: "Organization billing fixture", connection: "API credential pool", authOwner: "Puppet Master secret store", isolation: "API credential pool", product: "API billing", state: "ready", usage: "Monthly guard is 37 percent used", lastUse: "Deterministic safe probe succeeded", next: "Stop at monthly guard" }
    ],
    models: [
      { id: "sol-56", name: "5.6 Sol", alias: "Primary builder", favorite: true, priority: 1, state: "ready", evidence: "Observed deterministic success fixture", capabilities: "Text, vision, tools, structured output", effort: ["Low", "Medium", "High", "Extra high"], selectedEffort: "High", fastSupported: true, speed: "Normal" },
      { id: "sol-56-mini", name: "5.6 Sol Mini", alias: "Bounded research", favorite: false, priority: 2, state: "ready", evidence: "Authenticated deterministic discovery fixture", capabilities: "Text, tools, structured output", effort: ["Low", "Medium", "High"], selectedEffort: "Medium", fastSupported: false, speed: "Normal" },
      { id: "vision-route", name: "Vision route", alias: "Media analysis", favorite: false, priority: 3, state: "unavailable", evidence: "Account entitlement not confirmed", capabilities: "Image input likely", effort: ["Medium", "High"], selectedEffort: "High", fastSupported: false, speed: "Normal", reason: "Personal account entitlement needs refresh" }
    ]
  },
  {
    id: "claude",
    name: "Claude",
    group: "Installed tools and signed-in apps",
    state: "degraded",
    stateLabel: "One profile failed readiness",
    summary: "Two isolated CLI profiles plus a separate API route.",
    activeAccountId: "claude-personal",
    inFlightAccountId: "claude-personal",
    accounts: [
      { id: "claude-personal", name: "Personal CLI profile", identity: "Personal Claude fixture", connection: "Claude CLI-owned OAuth", authOwner: "Claude CLI", isolation: "Isolated CLI home and config", product: "Claude Max", state: "ready", usage: "Reset in 3 hours; moderate pressure", lastUse: "Deterministic generation fixture succeeded", next: "Stop and wait" },
      { id: "claude-work", name: "Work CLI profile", identity: "Organization account fixture", connection: "Claude CLI-owned OAuth", authOwner: "Claude CLI", isolation: "Authentication-isolated profile", product: "Claude Team", state: "failed", usage: "Usage available", lastUse: "Authenticated, but safe generation failed", next: "Repair profile" },
      { id: "claude-api", name: "Claude API", identity: "Organization API fixture", connection: "API key connection", authOwner: "Puppet Master secret store", isolation: "PM-managed direct connection", product: "API billing", state: "ready", usage: "Monthly guard is 18 percent used", lastUse: "Deterministic safe probe succeeded", next: "Stop at monthly guard" }
    ],
    models: [
      { id: "claude-sonnet", name: "Claude Sonnet", alias: "Planning alternate", favorite: true, priority: 1, state: "ready", evidence: "Observed deterministic success fixture", capabilities: "Text, vision, tools", effort: ["Low", "Medium", "High"], selectedEffort: "High", fastSupported: false, speed: "Normal" },
      { id: "claude-opus", name: "Claude Opus", alias: "Deep review", favorite: false, priority: 2, state: "ready", evidence: "Deterministic account discovery fixture", capabilities: "Text, vision, tools", effort: ["High"], selectedEffort: "High", fastSupported: false, speed: "Normal" }
    ]
  },
  {
    id: "antigravity",
    name: "Antigravity CLI",
    group: "Installed tools and signed-in apps",
    state: "signed-out",
    stateLabel: "Installed, signed out",
    summary: "The CLI is installed. Sign in through its native Google login flow.",
    activeAccountId: "antigravity-default",
    inFlightAccountId: null,
    accounts: [
      { id: "antigravity-default", name: "Default isolated profile", identity: "Identity not discovered", connection: "Antigravity CLI-owned login", authOwner: "Antigravity CLI", isolation: "Isolated CLI home and config", product: "Unknown until sign-in", state: "signed-out", usage: "Unavailable until sign-in", lastUse: "No successful generation", next: "Launch native sign-in" }
    ],
    models: []
  },
  {
    id: "ollama",
    name: "Ollama",
    group: "Installed tools and signed-in apps",
    state: "not-installed",
    stateLabel: "Not installed",
    summary: "No compatible local installation was detected.",
    activeAccountId: null,
    inFlightAccountId: null,
    accounts: [],
    models: []
  },
  {
    id: "openrouter-free",
    name: "OpenRouter free routes",
    group: "Free and community models",
    state: "setup",
    stateLabel: "Connection required",
    summary: "Free routes require an underlying OpenRouter account and API connection.",
    activeAccountId: "openrouter-setup",
    inFlightAccountId: null,
    accounts: [
      { id: "openrouter-setup", name: "OpenRouter connection", identity: "Not connected", connection: "API key connection", authOwner: "Puppet Master secret store", isolation: "PM-managed direct connection", product: "Provider-specific free routes", state: "setup", usage: "Provider limits vary", lastUse: "No safe probe yet", next: "Open provider setup" }
    ],
    models: [
      { id: "community-coder", name: "Community Coder", alias: "Free bounded tasks", favorite: false, priority: 1, state: "unavailable", evidence: "Catalogue declaration only", capabilities: "Text likely; tools unverified", effort: [], selectedEffort: "Not available", fastSupported: false, speed: "Normal", reason: "Connect the underlying provider first" }
    ]
  },
  {
    id: "local-server",
    name: "Local Model Server",
    group: "Server connections",
    state: "ready",
    stateLabel: "Keyless and ready",
    summary: "A local OpenAI-compatible server is reachable without authentication.",
    activeAccountId: "local-endpoint",
    inFlightAccountId: null,
    accounts: [
      { id: "local-endpoint", name: "Local workstation fixture", identity: "Local endpoint", connection: "Server connection", authOwner: "No authentication", isolation: "Local endpoint", product: "Local compute", state: "ready", usage: "No provider-reported balance", lastUse: "Deterministic safe probe succeeded", next: "Stop if unavailable" }
    ],
    models: [
      { id: "local-coder", name: "Local Coder 32B", alias: "Private local tasks", favorite: false, priority: 1, state: "ready", evidence: "Observed success, Review fixture", capabilities: "Text and structured output; tools unverified", effort: [], selectedEffort: "Not supported", fastSupported: false, speed: "Normal" }
    ]
  }
];

export const PROVIDER_CONNECTION_GROUPS = [
  { id: "installed-apps", label: "Installed tools and signed-in apps", description: "Provider-owned applications and CLI profiles with explicit credential ownership." },
  { id: "connected-accounts", label: "Connected accounts", description: "Accounts signed in directly through supported Puppet Master connection flows." },
  { id: "api-connections", label: "API connections", description: "Credential-backed routes with a named billing project and explicit continuation policy." },
  { id: "server-connections", label: "Server connections", description: "Local or remote compatible endpoints whose readiness is verified independently." },
  { id: "free-community", label: "Free and community models", description: "Underlying provider routes grouped for discovery; credentials and limits remain provider-owned." }
];

const PROVIDER_DETAILS = {
  openai: {
    groupId: "connected-accounts",
    requestedModelId: "sol-56",
    effectiveModelId: "sol-56",
    runtimeAdapters: [
      { id: "openai-responses-adapter", label: "OpenAI direct adapter", kind: "Puppet Master direct", state: "ready", version: "2026.08", capabilitySource: "Observed successful use", lastVerified: "18 minutes ago", supports: ["Text", "Images", "Tools", "Structured output"] },
      { id: "codex-session-adapter", label: "Codex session adapter", kind: "Puppet Master direct", state: "ready", version: "2026.08", capabilitySource: "Authenticated account discovery", lastVerified: "Today", supports: ["Thread continuity", "Effort controls", "Tool calls"] }
    ],
    catalogue: { source: "Provider discovery with models.dev annotations", sourceVersion: "openai-2026-08-05.2", sourceCommit: "models-dev 7c8a91d", checkedAt: "Review fixture", lastActivatedAt: "Yesterday at 9:42 PM", lastKnownGoodAt: "Today at 9:48 AM", state: "ready", quarantine: null, materialChanges: ["5.6 Sol context evidence refreshed"], removalHistory: ["5.5 preview retired on July 29"] },
    usage: { pressure: "High", nextReset: "In 2 hours", runOutProjection: "Included personal usage is exhausted", extraBalance: "API billing is available but not selected", freshness: "Provider-reported 6 minutes ago", quality: "Provider reported", detailDestination: { type: "usage", view: "provider", providerId: "openai" } }
  },
  claude: {
    groupId: "installed-apps",
    requestedModelId: "claude-sonnet",
    effectiveModelId: "claude-sonnet",
    runtimeAdapters: [
      { id: "claude-cli-adapter", label: "Claude CLI profile adapter", kind: "CLI-owned OAuth", state: "degraded", version: "2.1", capabilitySource: "Safe readiness probes", lastVerified: "Review fixture", supports: ["Isolated profile roots", "Text", "Images", "Tools"] },
      { id: "claude-api-adapter", label: "Claude API adapter", kind: "API credential pool", state: "ready", version: "2026.08", capabilitySource: "Observed successful use", lastVerified: "Today", supports: ["Text", "Images", "Tools"] }
    ],
    catalogue: { source: "Provider discovery with models.dev annotations", sourceVersion: "claude-2026-08-05.1", sourceCommit: "models-dev 7c8a91d", checkedAt: "Review fixture", lastActivatedAt: "Yesterday at 8:17 PM", lastKnownGoodAt: "Today at 9:29 AM", state: "ready-with-warning", quarantine: "Work profile entitlement result excluded after invocation failure", materialChanges: ["Work profile remains authenticated but not ready"], removalHistory: [] },
    usage: { pressure: "Moderate", nextReset: "In 3 hours", runOutProjection: "Personal route likely lasts through the review", extraBalance: "API billing route is separate", freshness: "Provider-reported 22 minutes ago", quality: "Provider reported", detailDestination: { type: "usage", view: "provider", providerId: "claude" } }
  },
  antigravity: {
    groupId: "installed-apps",
    requestedModelId: null,
    effectiveModelId: null,
    runtimeAdapters: [
      { id: "antigravity-cli-adapter", label: "Antigravity CLI profile adapter", kind: "CLI-owned Google sign-in", state: "signed-out", version: "Detected 1.8", capabilitySource: "Installed executable only", lastVerified: "Today", supports: ["Isolated profile roots", "Native login handoff"] }
    ],
    catalogue: { source: "Provider discovery after native sign-in", sourceVersion: "Not available", sourceCommit: "Not available", checkedAt: "Today at 9:02 AM", lastActivatedAt: "Never", lastKnownGoodAt: "None", state: "blocked-by-sign-in", quarantine: null, materialChanges: [], removalHistory: [] },
    usage: { pressure: "Unknown", nextReset: "Available after sign-in", runOutProjection: "Unavailable", extraBalance: "Unavailable", freshness: "No account evidence", quality: "Not available", detailDestination: { type: "usage", view: "provider", providerId: "antigravity" } }
  },
  ollama: {
    groupId: "installed-apps",
    requestedModelId: null,
    effectiveModelId: null,
    runtimeAdapters: [
      { id: "ollama-local-adapter", label: "Ollama local adapter", kind: "Local executable", state: "not-installed", version: "Not detected", capabilitySource: "Installation scan", lastVerified: "Today", supports: ["Local model discovery after installation"] }
    ],
    catalogue: { source: "Local installation discovery", sourceVersion: "Not available", sourceCommit: "Not applicable", checkedAt: "Today at 9:01 AM", lastActivatedAt: "Never", lastKnownGoodAt: "None", state: "not-installed", quarantine: null, materialChanges: [], removalHistory: [] },
    usage: { pressure: "Not applicable", nextReset: "Not applicable", runOutProjection: "Local compute is not installed", extraBalance: "Not applicable", freshness: "Installation scan today", quality: "Local detection", detailDestination: { type: "usage", view: "provider", providerId: "ollama" } }
  },
  "openrouter-free": {
    groupId: "free-community",
    requestedModelId: "community-coder",
    effectiveModelId: null,
    runtimeAdapters: [
      { id: "openrouter-api-adapter", label: "OpenRouter API adapter", kind: "API key connection", state: "setup", version: "2026.08", capabilitySource: "Catalogue declaration only", lastVerified: "Today", supports: ["Provider-specific free routes after connection"] }
    ],
    catalogue: { source: "Free Coding Models with models.dev annotations", sourceVersion: "free-routes-2026-08-05", sourceCommit: "free-coding 34b98e1", checkedAt: "8 minutes ago", lastActivatedAt: "Yesterday at 7:05 PM", lastKnownGoodAt: "Today at 9:52 AM", state: "setup-required", quarantine: null, materialChanges: ["Community Coder remains listed but unverified for this account"], removalHistory: ["Community Reasoner no longer free as of August 3"] },
    usage: { pressure: "Provider limited", nextReset: "Varies by underlying provider", runOutProjection: "Unknown until connection", extraBalance: "No Puppet Master balance", freshness: "Catalogue only", quality: "Unverified declaration", detailDestination: { type: "usage", view: "provider", providerId: "openrouter-free" } }
  },
  "local-server": {
    groupId: "server-connections",
    requestedModelId: "local-coder",
    effectiveModelId: "local-coder",
    runtimeAdapters: [
      { id: "openai-compatible-server-adapter", label: "OpenAI-compatible server adapter", kind: "Keyless local endpoint", state: "ready", version: "Protocol 2026.04", capabilitySource: "Observed successful use", lastVerified: "Review fixture", supports: ["Text", "Structured output", "Streaming"] }
    ],
    catalogue: { source: "Live server model discovery", sourceVersion: "server-etag 98b1", sourceCommit: "Not applicable", checkedAt: "Review fixture", lastActivatedAt: "Review fixture", lastKnownGoodAt: "Review fixture", state: "ready", quarantine: null, materialChanges: [], removalHistory: ["Local Coder 14B removed by server administrator on July 30"] },
    usage: { pressure: "Local capacity available", nextReset: "Not applicable", runOutProjection: "No provider balance; capacity depends on the workstation", extraBalance: "Not applicable", freshness: "Live endpoint Review fixture", quality: "Observed", detailDestination: { type: "usage", view: "provider", providerId: "local-server" } }
  }
};

const capabilityEvidenceFor = (model, provider) => {
  const source = /Observed success/.test(model.evidence) ? "Observed successful use" : /Authenticated/.test(model.evidence) ? "Authenticated account discovery" : /Catalogue/.test(model.evidence) ? "Catalogue declaration" : "Provider discovery";
  const status = model.state === "unavailable" ? "temporarily unavailable" : "supported";
  return [
    { capability: "Text input and output", status, source, observedAt: model.evidence, note: model.reason || "Available through the selected connection." },
    { capability: "Tool use", status: /tools/i.test(model.capabilities) ? status : "unverified", source, observedAt: model.evidence, note: /tools/i.test(model.capabilities) ? "Current evidence includes tool support." : "No successful tool probe is recorded." },
    { capability: "Structured output", status: /structured/i.test(model.capabilities) ? status : "unverified", source, observedAt: model.evidence, note: /structured/i.test(model.capabilities) ? "Current evidence includes structured output." : "No structured-output probe is recorded." },
    { capability: "Image input", status: /vision|image/i.test(model.capabilities) ? status : "unverified", source, observedAt: model.evidence, note: "Capability is never inferred from the model name." }
  ];
};

const NORMALIZED_PROVIDERS = PROVIDER_BASE.map((provider) => {
  const detail = PROVIDER_DETAILS[provider.id];
  const accountRows = provider.accounts.map((account, index) => ({
    ...account,
    nickname: account.name,
    enabled: account.state !== "signed-out" && account.state !== "setup",
    priority: index + 1,
    stickySession: index === 0,
    health: account.state,
    healthLabel: account.state === "failed" ? "Authenticated; invocation failed" : account.state === "ready" ? "Ready for new requests" : account.state === "signed-out" ? "Installed; sign-in required" : "Setup required",
    lastCatalogRefresh: provider.id === "openai" ? "Review fixture" : provider.id === "claude" ? "Review fixture" : "No successful refresh",
    lastSuccessfulGeneration: /succeeded/.test(account.lastUse) ? account.lastUse : "No successful generation",
    usagePressure: /exhausted/.test(account.usage) ? "Exhausted" : /Unavailable|Unknown/.test(account.usage) ? "Unknown" : "Available",
    continuation: account.next,
    connectionIds: [`${account.id}-connection`],
    productIds: [`${account.id}-product`]
  }));
  const connections = accountRows.map((account) => ({
    id: account.connectionIds[0],
    accountId: account.id,
    label: `${account.name} connection`,
    kind: account.connection,
    authenticationOwner: account.authOwner,
    isolationModel: account.isolation,
    state: account.state,
    enabled: account.enabled,
    protocol: account.connection.includes("CLI") ? "Provider CLI invocation" : account.connection.includes("Server") ? "OpenAI-compatible HTTP" : "Provider connection",
    readiness: account.healthLabel,
    lastSuccessfulCatalogue: account.lastCatalogRefresh,
    lastSuccessfulGeneration: account.lastSuccessfulGeneration,
    actions: account.state === "failed" ? ["Repair profile", "Reconnect", "Open redacted logs"] : account.state === "ready" ? ["Use for next request", "Refresh", "Open redacted logs"] : ["Continue setup", "Rescan", "Open setup history"]
  }));
  const products = accountRows.map((account) => ({
    id: account.productIds[0],
    accountId: account.id,
    connectionId: account.connectionIds[0],
    name: account.product,
    entitlementState: account.state === "ready" ? "discovered" : "unverified",
    allowance: account.usage,
    billingRoute: /API billing/.test(account.product) ? account.identity : /Local compute/.test(account.product) ? "Local workstation" : account.product,
    continuation: account.next,
    modelIds: provider.models.map((model) => model.id),
    usageDestination: detail.usage.detailDestination
  }));
  const models = provider.models.map((model) => ({
    ...model,
    visible: true,
    productIds: products.map((product) => product.id),
    runtimeAdapterIds: detail.runtimeAdapters.map((adapter) => adapter.id),
    requested: model.id === detail.requestedModelId,
    effective: model.id === detail.effectiveModelId,
    requestedModel: model.id === detail.requestedModelId ? model.name : undefined,
    effectiveModel: model.id === detail.effectiveModelId ? model.name : undefined,
    contextLimit: model.id === "sol-56" ? "256K tokens" : model.id === "claude-sonnet" ? "200K tokens" : model.id === "local-coder" ? "64K tokens" : "Provider-reported after connection",
    inputModalities: /vision|image/i.test(model.capabilities) ? ["Text", "Images"] : ["Text"],
    outputModalities: ["Text"],
    toolSupport: /tools/i.test(model.capabilities) ? "Supported" : "Unverified",
    mcpSupport: /tools/i.test(model.capabilities) ? "Supported through Puppet Master tools" : "Unverified",
    structuredOutputSupport: /structured/i.test(model.capabilities) ? "Supported" : "Unverified",
    capabilityEvidence: capabilityEvidenceFor(model, provider),
    evidenceFreshness: model.evidence,
    unavailableReason: model.reason || ""
  }));
  return {
    ...provider,
    ...detail,
    accounts: accountRows,
    connections,
    products,
    models,
    usageSnapshot: { ...detail.usage, readOnly: true, owner: "Usage", accountRows: accountRows.map((account) => ({ accountId: account.id, label: account.name, pressure: account.usagePressure, balance: account.usage, nextAction: account.continuation })) },
    history: [
      { at: "Today at 9:52 AM", event: "Readiness snapshot recorded", outcome: provider.stateLabel },
      { at: "Yesterday at 7:05 PM", event: "Last-known-good catalogue activated", outcome: `${provider.models.length} model rows retained` }
    ],
    diagnostics: { secretsIncluded: false, lastRun: "Today", checks: ["Connection ownership", "Identity discovery", "Catalogue validation", "Safe invocation", "Usage freshness"] }
  };
});

const OPENCODE_EXTERNAL_PROVIDER = {
  id: "opencode-server",
  name: "OpenCode external server",
  group: "Server connections",
  state: "ready",
  stateLabel: "External server ready",
  summary: "A deterministic external-server fixture; Puppet Master manages the connection, not the server installation.",
  activeAccountId: "opencode-external-account",
  inFlightAccountId: null,
  accounts: [{
    id: "opencode-external-account", name: "External server profile", nickname: "External server profile",
    identity: "Deterministic server fixture", connection: "External OpenCode server", authOwner: "Server-defined",
    authenticationOwner: "Server-defined", isolation: "Explicit endpoint connection", product: "External service", state: "ready", enabled: true, priority: 1, stickySession: true,
    usage: "Usage details unavailable; readiness is independent", usagePressure: "Unknown", lastUse: "Deterministic safe probe succeeded", lastSuccessfulGeneration: "Deterministic safe probe succeeded", next: "Stop if unavailable", continuation: "Stop if unavailable", connectionIds: ["opencode-external-connection"], productIds: ["opencode-external-product"]
  }],
  connections: [{ id: "opencode-external-connection", accountId: "opencode-external-account", label: "External server connection", kind: "External OpenCode server", authenticationOwner: "Server-defined", isolationModel: "Explicit endpoint connection", state: "ready", enabled: true, protocol: "OpenCode server API", readiness: "Ready for new requests", lastSuccessfulCatalogue: "Deterministic fixture", lastSuccessfulGeneration: "Deterministic fixture", actions: ["Test deterministic connection", "Open redacted logs"] }],
  products: [{ id: "opencode-external-product", accountId: "opencode-external-account", connectionId: "opencode-external-connection", name: "External service", entitlementState: "declared", allowance: "Unavailable", billingRoute: "Externally managed", continuation: "Stop if unavailable", modelIds: ["opencode-auto"], usageDestination: { type: "usage", view: "provider", providerId: "opencode-server" } }],
  models: [{ id: "opencode-auto", name: "OpenCode server route", alias: "External coding route", favorite: false, priority: 1, state: "ready", evidence: "Deterministic connection fixture", capabilities: "Text, tools, structured output", effort: ["Normal"], selectedEffort: "Normal", fastSupported: false, speed: "Normal", visible: true, productIds: ["opencode-external-product"], runtimeAdapterIds: ["opencode-server-adapter"], requested: true, effective: true, contextLimit: "Server reported after connection", inputModalities: ["Text"], outputModalities: ["Text"], toolSupport: "Supported by declared fixture", mcpSupport: "Server-defined", structuredOutputSupport: "Supported by declared fixture", capabilityEvidence: [
    { capability: "Text input and output", status: "supported", source: "Deterministic fixture", observedAt: "Review state", note: "Not live qualification evidence." },
    { capability: "Tool use", status: "supported", source: "Deterministic fixture", observedAt: "Review state", note: "Server-declared fixture." },
    { capability: "Structured output", status: "supported", source: "Deterministic fixture", observedAt: "Review state", note: "Server-declared fixture." },
    { capability: "Image input", status: "unverified", source: "Deterministic fixture", observedAt: "Review state", note: "No image-input claim." }
  ], evidenceFreshness: "Deterministic fixture", unavailableReason: "" }],
  runtimeAdapters: [{ id: "opencode-server-adapter", label: "OpenCode external server adapter", kind: "External endpoint", state: "ready", version: "Fixture API", capabilitySource: "Declared fixture", lastVerified: "Review state", supports: ["Text", "Tools", "Structured output"] }],
  catalogue: { source: "External server declaration", sourceVersion: "fixture", sourceCommit: "Not applicable", checkedAt: "Review state", lastActivatedAt: "Review state", lastKnownGoodAt: "Review state", state: "ready", quarantine: null, materialChanges: [], removalHistory: [] },
  usage: { pressure: "Unknown", nextReset: "Unavailable", runOutProjection: "Unavailable", extraBalance: "Unavailable", freshness: "Unavailable", quality: "Not reported", detailDestination: { type: "usage", view: "provider", providerId: "opencode-server" } },
  usageSnapshot: { pressure: "Unknown", nextReset: "Unavailable", runOutProjection: "Unavailable", extraBalance: "Unavailable", freshness: "Unavailable", quality: "Not reported", readOnly: true, owner: "Usage", accountRows: [{ accountId: "opencode-external-account", label: "External server profile", pressure: "Unknown", balance: "Usage details unavailable", nextAction: "Stop if unavailable" }] },
  routing: { requestedAccountId: "opencode-external-account", effectiveAccountId: "opencode-external-account", requestedModelId: "opencode-auto", effectiveModelId: "opencode-auto", fallbackPolicy: "Stop if unavailable" },
  history: [{ at: "Deterministic fixture", event: "Connection fixture recorded", outcome: "Ready" }],
  diagnostics: { secretsIncluded: false, lastRun: "Deterministic fixture", checks: ["Endpoint ownership", "Connection", "Catalogue declaration"] },
  installations: (PROVIDER_INSTALLATIONS["opencode-server"] || []).map((entry) => ({ ...entry }))
};

export const PROVIDERS = [
  ...NORMALIZED_PROVIDERS.map((provider) => ({ ...provider, installations: (PROVIDER_INSTALLATIONS[provider.id] || []).map((entry) => ({ ...entry })) })),
  OPENCODE_EXTERNAL_PROVIDER
];

export const ROLE_ASSIGNMENTS = [
  { id: "assistant", label: "Main Assistant", route: "5.6 Sol — Personal Codex", quality: "High-quality conversation", minimumQuality: "high", source: "Global default", scope: "New threads", eligibleRoutes: ["5.6 Sol — Personal Codex", "Claude Sonnet — Personal profile"], guard: "Keeps user discussion on a qualified conversational route." },
  { id: "planning", label: "PRD and planning conversation", route: "Use Main Assistant", quality: "High-quality planning conversation required", minimumQuality: "high", source: "Project default", scope: "New PlanningRuns", eligibleRoutes: ["Use Main Assistant", "5.6 Sol — Personal Codex", "Claude Opus — Personal profile"], guard: "Cannot silently fall back to an unqualified low-quality route." },
  { id: "goal", label: "Goal worker", route: "Qualified route pool", quality: "Adaptive within qualifications", minimumQuality: "task-qualified", source: "Goal default", scope: "Future Goal runs", eligibleRoutes: ["Qualified route pool", "5.6 Sol Mini — Personal Codex", "Local Coder 32B — Local workstation fixture"], guard: "RuntimeResourceGovernor alone decides resource admission; Orchestrator projects the resulting run state." },
  { id: "verifier", label: "Verifier and auditor", route: "Claude Sonnet — Personal profile", quality: "Independent provider preferred", minimumQuality: "high", source: "Project verification policy", scope: "Future verification work", eligibleRoutes: ["Claude Sonnet — Personal profile", "5.6 Sol — Work Codex"], guard: "Maintains independence from the primary builder when a qualified route is ready." },
  { id: "vision", label: "Vision and media analysis", route: "5.6 Sol — Personal Codex", quality: "Current image evidence required", minimumQuality: "capability-qualified", source: "Media route", scope: "Future media analysis", eligibleRoutes: ["5.6 Sol — Personal Codex", "Claude Sonnet — Personal profile"], guard: "Requires current image-input evidence; model names alone are not evidence." },
  { id: "compression", label: "Compression and context maintenance", route: "5.6 Sol Mini — Personal Codex", quality: "Continuity-preserving summarization", minimumQuality: "task-qualified", source: "Context policy", scope: "Future compaction", eligibleRoutes: ["5.6 Sol Mini — Personal Codex", "Use Main Assistant"], guard: "Durable records remain outside the model summary." },
  { id: "web", label: "Web extraction", route: "Qualified route pool", quality: "Bounded extraction", minimumQuality: "task-qualified", source: "Research policy", scope: "Future web tasks", eligibleRoutes: ["Qualified route pool", "5.6 Sol Mini — Personal Codex"], guard: "Final synthesis returns to a high-quality conversation route." },
  { id: "approval", label: "Approval review", route: "Use Main Assistant", quality: "High-quality consequence review", minimumQuality: "high", source: "Safety policy", scope: "Future approval explanations", eligibleRoutes: ["Use Main Assistant", "Claude Sonnet — Personal profile"], guard: "The model explains; deterministic policy remains authoritative." },
  { id: "mcp-tools", label: "MCP and tool routing", route: "Qualified route pool", quality: "Capability-qualified tool use", minimumQuality: "task-qualified", source: "Tool policy", scope: "Future tool calls", eligibleRoutes: ["Qualified route pool", "5.6 Sol — Personal Codex"], guard: "Installed schemas remain progressively exposed, not universally injected." },
  { id: "skill-search", label: "Skill search", route: "5.6 Sol Mini — Personal Codex", quality: "Bounded discovery", minimumQuality: "task-qualified", source: "Extension policy", scope: "Future discovery", eligibleRoutes: ["5.6 Sol Mini — Personal Codex", "Use Main Assistant"], guard: "Selecting a skill does not grant its permissions." },
  { id: "crew", label: "Subagents and Crew roles", route: "Crew template assignments", quality: "Role-specific qualifications", minimumQuality: "role-qualified", source: "Orchestrator template", scope: "Future Crew runs", eligibleRoutes: ["Crew template assignments", "Qualified route pool"], guard: "Each member remains bounded by its Persona, parent grant, and route evidence." }
];

const gistFixture = ({ id, title, summary, state, scope, kind, source, lastAccess, halfLife, pinned = false, changes, evidence, capsule, retention = "Project retention policy", redaction = "No secrets or raw credentials" }) => {
  const versions = changes.map((change, index) => ({
    id: `${id}:v${index + 1}`,
    version: index + 1,
    number: index + 1,
    title,
    createdAt: change.at,
    summary: index + 1 === changes.length ? summary : change.summary,
    state: index + 1 === changes.length ? state : change.verification === "Confirmed" ? "verified" : "awaiting-review",
    scope,
    kind,
    source,
    halfLife,
    pinned,
    reason: change.reason,
    evidenceRefs: change.evidenceRefs,
    immutable: true,
    verification: change.verification,
    restoredFrom: null
  }));
  return {
    id,
    title,
    summary,
    state,
    scope,
    kind,
    source,
    lastAccess,
    halfLife,
    halfLifeMeaning: halfLife === "Protected" ? "Always eligible for recall until explicitly changed." : "Fades from automatic recall; it does not expire or become false.",
    pinned,
    protected: pinned,
    version: versions.length,
    versions,
    evidence,
    capsulePreview: capsule,
    accessHistory: [
      { at: lastAccess, surface: "Assistant Chat", reason: "Relevant to the active request", outcome: "Admitted with provenance" },
      { at: "Last week", surface: "Settings review", reason: "User inspected this Gist", outcome: "Read only" }
    ],
    retention,
    redaction,
    discarded: false,
    duplicateOf: null
  };
};

export const MEMORY_GISTS = [
  gistFixture({
    id: "gist-review-style", title: "Concept review preferences", summary: "Compare live variants at several widths, preserve the surrounding shell, and judge interaction in the served preview.", state: "verified", scope: "Global Assistant preference", kind: "Preference", source: "Three confirmed concept-review conversations", lastAccess: "Today at 10:11 AM", halfLife: "Slow fade", pinned: true,
    changes: [
      { at: "July 19", summary: "Compare more than screenshots.", reason: "Initial review preference", evidenceRefs: ["Conversation evidence A"], verification: "Confirmed" },
      { at: "July 26", summary: "Inspect squeezed, wide, rail, and Assistant-panel states.", reason: "User correction", evidenceRefs: ["Conversation evidence B"], verification: "Confirmed" },
      { at: "August 5", summary: "Treat the served preview as acceptance authority.", reason: "Latest review direction", evidenceRefs: ["Conversation evidence C"], verification: "Confirmed" }
    ],
    evidence: [{ label: "Concept review conversation", capturedAt: "August 5", confidence: "High", excerpt: "Review the live interaction across widths and themes." }],
    capsule: "For UI reviews, inspect the live served concept at squeezed and wide widths with surrounding shell states visible."
  }),
  gistFixture({
    id: "gist-plan-boundary", title: "Plan and build boundaries", summary: "Passing validators demonstrates contract consistency; it does not prove that work is implemented, executable, or certified.", state: "verified", scope: "Puppet Master project", kind: "Workflow", source: "Repeated canonical review correction", lastAccess: "Yesterday at 4:26 PM", halfLife: "Protected", pinned: true,
    changes: [
      { at: "June 28", summary: "Separate planned from implemented.", reason: "Review correction", evidenceRefs: ["Project conversation A"], verification: "Confirmed" },
      { at: "July 5", summary: "Separate implemented from executable and certified.", reason: "Readiness review", evidenceRefs: ["Project conversation B"], verification: "Confirmed" },
      { at: "July 20", summary: "Keep the boundary explicit in final reporting.", reason: "Audit feedback", evidenceRefs: ["Project conversation C"], verification: "Confirmed" },
      { at: "August 4", summary: "Green validators are necessary evidence, never the whole completion claim.", reason: "Latest wording refinement", evidenceRefs: ["Project conversation D"], verification: "Confirmed" }
    ],
    evidence: [{ label: "Canonical review correction", capturedAt: "August 4", confidence: "High", excerpt: "Validators passing is not completion." }],
    capsule: "Report planned, implemented, executable, and certified states separately; do not promote a validator receipt into runtime evidence."
  }),
  gistFixture({
    id: "gist-provider-route", title: "Planning route quality", summary: "Requirements discussion, architecture, and final synthesis stay on a qualified high-quality conversational route.", state: "awaiting-review", scope: "Puppet Master project", kind: "Routing preference", source: "Recent Settings planning discussion", lastAccess: "2 days ago", halfLife: "Medium fade",
    changes: [
      { at: "August 2", summary: "Use the Main Assistant route for planning discussion.", reason: "Observed preference", evidenceRefs: ["Planning conversation A"], verification: "Inferred" },
      { at: "August 3", summary: "Allow a qualified explicit override; never silently downgrade for usage.", reason: "Packet synthesis", evidenceRefs: ["Planning conversation B", "Settings packet provider requirements"], verification: "Awaiting user review" }
    ],
    evidence: [{ label: "Planning discussion", capturedAt: "August 3", confidence: "Medium", excerpt: "Keep planning and final synthesis on the high-quality route." }],
    capsule: "Planning conversation defaults to Main Assistant; lower-cost routes may handle bounded extraction only."
  }),
  gistFixture({
    id: "gist-local-preview", title: "Local preview convention", summary: "Choose an available loopback port and never stop a process the current task did not start.", state: "verified", scope: "Puppet Master project", kind: "Environment", source: "Repeated local-preview feedback", lastAccess: "Today at 9:41 AM", halfLife: "Slow fade",
    changes: [
      { at: "July 18", summary: "Use a loopback preview.", reason: "Local workflow", evidenceRefs: ["Preview conversation A"], verification: "Confirmed" },
      { at: "July 25", summary: "Use an operating-system-assigned port.", reason: "Collision correction", evidenceRefs: ["Preview conversation B"], verification: "Confirmed" },
      { at: "August 5", summary: "Use isolated browser and output resources and clean only what the task created.", reason: "Bakeoff verification contract", evidenceRefs: ["Settings packet test matrix"], verification: "Confirmed" }
    ],
    evidence: [{ label: "Preview workflow", capturedAt: "August 5", confidence: "High", excerpt: "Use an OS-assigned port and isolated browser resources." }],
    capsule: "Start the concept server on an available loopback port, isolate browser resources, and clean up only task-owned processes and files."
  }),
  gistFixture({
    id: "gist-source-priority", title: "Settings bakeoff source priority", summary: "The supplied packet and approved plan govern the model folder; PMConcept7 is a read-only behavioral and shell reference.", state: "verified", scope: "Settings bakeoff", kind: "Source priority", source: "Approved bakeoff brief", lastAccess: "Today at 10:02 AM", halfLife: "Protected", pinned: true,
    changes: [
      { at: "August 5 at 8:34 AM", summary: "Packet is the requirement source.", reason: "Bakeoff kickoff", evidenceRefs: ["Settings packet"], verification: "Confirmed" },
      { at: "August 5 at 10:02 AM", summary: "Do not edit PMConcept7 or canonical owner files.", reason: "Build boundary", evidenceRefs: ["Approved plan"], verification: "Confirmed" }
    ],
    evidence: [{ label: "Approved bakeoff plan", capturedAt: "Today", confidence: "High", excerpt: "Work only in the 5.6 Sol model folder." }],
    capsule: "Use packet first, approved plan second, PMConcept7 only for preserved behavior; record upstream implications without applying them."
  }),
  gistFixture({
    id: "gist-motion-review", title: "Motion review standard", summary: "A green motion matrix is not enough; witness the start, middle, end, interruption, and reduced-motion equivalent.", state: "verified", scope: "Global Assistant preference", kind: "Quality bar", source: "Concept review correction", lastAccess: "Today at 9:54 AM", halfLife: "Slow fade", pinned: true,
    changes: [
      { at: "July 27", summary: "Animation must communicate continuity.", reason: "Visual review", evidenceRefs: ["Motion review A"], verification: "Confirmed" },
      { at: "August 5", summary: "Capture frame evidence and test rapid reversals.", reason: "Bakeoff audit", evidenceRefs: ["Motion review B"], verification: "Confirmed" }
    ],
    evidence: [{ label: "Bakeoff audit", capturedAt: "Today", confidence: "High", excerpt: "Manually witness frames, interruptions, and reduced motion." }],
    capsule: "For motion acceptance, inspect start, midpoint, settled state, interruption, resize, and reduced-motion parity."
  }),
  gistFixture({
    id: "gist-file-safety", title: "Preserve unrelated work", summary: "Treat existing changes as user-owned, inspect overlaps, and never discard unrelated edits while repairing a concept.", state: "verified", scope: "Global Assistant preference", kind: "Safety", source: "Repository working agreement", lastAccess: "3 days ago", halfLife: "Protected", pinned: true,
    changes: [
      { at: "July 8", summary: "Preserve dirty worktree state.", reason: "Repository policy", evidenceRefs: ["Working agreement"], verification: "Confirmed" },
      { at: "August 2", summary: "Stop only when an overlapping change cannot be safely accommodated.", reason: "Implementation clarification", evidenceRefs: ["Task correction"], verification: "Confirmed" }
    ],
    evidence: [{ label: "Repository working agreement", capturedAt: "August 2", confidence: "High", excerpt: "Preserve user changes and work around unrelated edits." }],
    capsule: "Inspect before editing, preserve unrelated work, and avoid destructive recovery commands."
  }),
  gistFixture({
    id: "gist-evidence-scope", title: "Evidence scope language", summary: "State what was actually observed, where, and when; do not generalize a partial packet or fixture into repository-wide runtime truth.", state: "awaiting-review", scope: "Puppet Master project", kind: "Reporting", source: "Recent audit synthesis", lastAccess: "6 days ago", halfLife: "Medium fade",
    changes: [
      { at: "July 29", summary: "Name the evidence boundary.", reason: "Audit correction", evidenceRefs: ["Audit review A"], verification: "Inferred" },
      { at: "July 30", summary: "Retain uncertainty when owner adjudication is missing.", reason: "Follow-up review", evidenceRefs: ["Audit review B"], verification: "Awaiting user review" }
    ],
    evidence: [{ label: "Audit synthesis", capturedAt: "July 30", confidence: "Medium", excerpt: "Keep packet-supported findings bounded to the extracted surface." }],
    capsule: "Report evidence boundaries, source freshness, uncertainty, and unresolved owner conflicts explicitly."
  }),
  gistFixture({
    id: "gist-old-theme", title: "Older theme preference", summary: "An older prototype suggested Retro Dark, while the active bakeoff starts in Friendly Dark; this conflict needs review before it influences defaults.", state: "awaiting-review", scope: "Historical", kind: "Potential conflict", source: "Older prototype note", lastAccess: "12 days ago", halfLife: "Fast fade",
    changes: [
      { at: "July 15", summary: "Retro Dark appeared to be preferred.", reason: "Older prototype observation", evidenceRefs: ["Prototype note"], verification: "Inferred" },
      { at: "August 5", summary: "Active concept guidance starts in Friendly Dark.", reason: "Current bakeoff state", evidenceRefs: ["Bakeoff manifest"], verification: "Awaiting reconciliation" }
    ],
    evidence: [{ label: "Older prototype note", capturedAt: "July 15", confidence: "Low", excerpt: "Retro Dark may be the preferred default." }, { label: "Current concept state", capturedAt: "Today", confidence: "High", excerpt: "Friendly Dark is the initial review theme." }],
    capsule: "Do not infer a durable theme preference until the older Retro Dark note and current Friendly Dark default are reconciled."
  })
];

export const TERMINAL_PROFILES = [
  {
    id: "pm-default", name: "Puppet Master Default", description: "Balanced project terminal with automatic shell discovery and durable local history.", default: true, state: "saved", dirty: false,
    shell: "Auto-detected: /bin/zsh", fallbackShell: "/bin/sh", shellSource: "Operating system login shell", font: "SF Mono", fontFallback: ["Menlo", "Monaco", "Monospace"], fontSize: 13, lineHeight: 1.45,
    foreground: "Theme foreground", background: "Theme surface", palette: "Friendly Night", ansiPalette: ["Ink", "Rose", "Moss", "Ochre", "Lake", "Plum", "Teal", "Paper"], opacity: 0.96, material: "Theme surface", backgroundImage: "None",
    cursor: "Block", cursorBlink: false, selection: "Theme selection; keep on blur", copyPaste: "Copy on explicit command; confirm multiline paste", links: "Command-click verified links",
    cwd: "Active project", environment: "Inherit allowlisted project environment", transcript: "Keep 30 days", historyLimit: "20,000 lines", rendering: "Automatic GPU with software fallback", performance: "Balanced", startup: "Open one terminal when requested",
    diagnostics: { state: "ready", shellDetected: true, fontAvailable: true, renderer: "Automatic", lastRun: "Today at 9:44 AM", notes: ["Login shell detected", "Fallback shell available", "No background image"] },
    draft: { shell: "Auto-detected: /bin/zsh", font: "SF Mono", fontSize: 13, lineHeight: 1.45, palette: "Friendly Night", cursor: "Block", transcript: "Keep 30 days" }
  },
  {
    id: "focused-build", name: "Focused Build", description: "High-legibility worktree profile with quiet color and short transcript retention.", default: false, state: "saved", dirty: false,
    shell: "/bin/zsh", fallbackShell: "/bin/sh", shellSource: "Profile override", font: "Berkeley Mono", fontFallback: ["SF Mono", "Menlo", "Monospace"], fontSize: 14, lineHeight: 1.5,
    foreground: "Warm white", background: "Near black", palette: "Low Glare", ansiPalette: ["Carbon", "Brick", "Fern", "Wheat", "Denim", "Lavender", "Sea", "Chalk"], opacity: 1, material: "Opaque", backgroundImage: "None",
    cursor: "Beam", cursorBlink: true, selection: "High-contrast selection; clear on input", copyPaste: "Copy selected text; warn before bracketed paste is bypassed", links: "Command-click links; show destination first",
    cwd: "Active worktree", environment: "Project environment plus toolchain paths", transcript: "Keep 7 days", historyLimit: "12,000 lines", rendering: "GPU preferred with software fallback", performance: "Favor responsiveness", startup: "Restore the last build terminal",
    diagnostics: { state: "ready", shellDetected: true, fontAvailable: true, renderer: "Metal", lastRun: "Today at 9:46 AM", notes: ["Worktree path resolves", "Selected font available", "Bracketed paste enabled"] },
    draft: { shell: "/bin/zsh", font: "Berkeley Mono", fontSize: 14, lineHeight: 1.5, palette: "Low Glare", cursor: "Beam", transcript: "Keep 7 days" }
  },
  {
    id: "retro-console", name: "Retro Console", description: "Dense amber-on-paper profile for long logs and low-distraction inspection.", default: false, state: "saved", dirty: false,
    shell: "/bin/bash", fallbackShell: "/bin/sh", shellSource: "Profile override", font: "IBM Plex Mono", fontFallback: ["SF Mono", "Menlo", "Monospace"], fontSize: 13, lineHeight: 1.35,
    foreground: "Amber ink", background: "Dark paper", palette: "Amber Paper", ansiPalette: ["Soot", "Rust", "Olive", "Amber", "Slate", "Mauve", "Patina", "Parchment"], opacity: 0.92, material: "Subtle paper texture", backgroundImage: "None",
    cursor: "Underline", cursorBlink: false, selection: "Amber reverse selection", copyPaste: "Standard copy; confirm multiline paste", links: "Underline links on focus and hover",
    cwd: "Project root", environment: "Minimal project environment", transcript: "Keep 30 days", historyLimit: "30,000 lines", rendering: "Software-friendly", performance: "Favor long logs", startup: "Do not restore prior processes",
    diagnostics: { state: "ready", shellDetected: true, fontAvailable: true, renderer: "Software compatible", lastRun: "Yesterday", notes: ["Bash detected", "Texture is theme-provided", "Cursor blink disabled"] },
    draft: { shell: "/bin/bash", font: "IBM Plex Mono", fontSize: 13, lineHeight: 1.35, palette: "Amber Paper", cursor: "Underline", transcript: "Keep 30 days" }
  },
  {
    id: "remote-safe", name: "Remote Safe Session", description: "Conservative server profile that limits environment inheritance and avoids persistent transcript storage.", default: false, state: "saved", dirty: false,
    shell: "Remote host default", fallbackShell: "/bin/sh", shellSource: "Server connection", font: "SF Mono", fontFallback: ["Menlo", "Monospace"], fontSize: 13, lineHeight: 1.5,
    foreground: "Theme foreground", background: "Solid dark surface", palette: "Remote Contrast", ansiPalette: ["Black", "Red", "Green", "Yellow", "Blue", "Magenta", "Cyan", "White"], opacity: 1, material: "Opaque", backgroundImage: "Not allowed",
    cursor: "Block", cursorBlink: false, selection: "Clear when the session disconnects", copyPaste: "Always confirm multiline paste", links: "Show destination and ask before opening external links",
    cwd: "Remote workspace", environment: "Allowlisted variables only", transcript: "Do not keep", historyLimit: "Current session only", rendering: "Software compatible", performance: "Favor reliability", startup: "Connect only after explicit action",
    diagnostics: { state: "unavailable", shellDetected: false, fontAvailable: true, renderer: "Software compatible", lastRun: "Today at 8:58 AM", notes: ["Remote host is offline", "No transcript will be retained", "Reconnect is a simulation in this concept"] },
    draft: { shell: "Remote host default", font: "SF Mono", fontSize: 13, lineHeight: 1.5, palette: "Remote Contrast", cursor: "Block", transcript: "Do not keep" }
  }
];

export const SPELLING_FIXTURE = {
  service: {
    label: "Shared spelling service",
    engine: "Automatic — system service with Puppet Master local fallback",
    providerCall: false,
    automaticReplacement: false,
    surfaces: ["Assistant Chat", "PRD Builder", "Planning Wizard", "Settings prose fields"],
    portability: "Slint spelling-service adapter; HTML spellcheck is preview-only"
  },
  settings: {
    normal: [
      { id: "check-spelling", label: "Check spelling", value: "On", destination: { type: "setting", settingId: "experience.input.spelling" } },
      { id: "language", label: "Language", value: "Automatic", destination: { type: "setting", settingId: "experience.input.language" } },
      { id: "dictionary-source", label: "Dictionary source", value: "Automatic", destination: { type: "setting", settingId: "experience.input.dictionary-source" } },
      { id: "personal-dictionary", label: "Personal dictionary", value: "23 recognized words", action: "Manage personal words", destination: { type: "setting", settingId: "experience.input.personal-dictionary" } },
      { id: "project-dictionary", label: "Project dictionary", value: "Use when available", action: "Manage project words", destination: { type: "setting", settingId: "experience.input.project-dictionary-manage" } }
    ],
    advanced: [
      { id: "technical-prose", label: "Check technical prose", value: "Off" },
      { id: "unknown-names", label: "Underline unknown names", value: "Off" },
      { id: "language-packs", label: "Additional installed language packs", value: "English (United States), English (United Kingdom)", action: "Manage language packs" },
      { id: "overrides", label: "Thread and project overrides", value: "One project override", action: "Manage writing overrides" }
    ]
  },
  actions: [
    { id: "replace-once", label: "Replace once", result: "Changes only the selected occurrence." },
    { id: "ignore-once", label: "Ignore once", result: "Clears the underline for this occurrence only." },
    { id: "ignore-draft", label: "Ignore for this draft", result: "Keeps the word unchanged until this draft closes." },
    { id: "add-personal", label: "Add to Personal dictionary", result: "Recognizes the word across projects after an explicit save." },
    { id: "add-project", label: "Add to Project dictionary", result: "Recognizes the word in this project after an explicit save." }
  ],
  draft: {
    title: "Writing-service behavior preview",
    sentence: "Please review the repositry plan before running the local preview.",
    misspelling: { text: "repositry", range: [18, 27], suggestions: ["repository", "repositories", "repository's"], replaced: false },
    excludedSegments: [
      { kind: "Inline code", text: "SettingsReviewState::Ready", reason: "Literal code is never spellchecked." },
      { kind: "URL", text: "http://127.0.0.1:64192", reason: "URLs are excluded." },
      { kind: "File path", text: "/project/settings/preview.slint", reason: "File paths are excluded." },
      { kind: "Command", text: "pm settings inspect --effective", reason: "Commands are excluded." },
      { kind: "Hash", text: "7c8a91d", reason: "Hashes are excluded." },
      { kind: "Identifier", text: "SettingsReviewState", reason: "Identifiers and structured keys are excluded." },
      { kind: "Structured data", text: "{\"theme\":\"Friendly Dark\"}", reason: "Structured data is excluded." },
      { kind: "Recognized name", text: "5.6 Sol, OpenAI, Researcher, Project file reader", reason: "Known model, provider, Persona, and tool names are excluded." },
      { kind: "Marked literal text", text: "Do not alter this literal", reason: "Author-marked literal text is excluded." }
    ]
  },
  dictionaries: {
    personal: ["Slint", "worktree", "scrollspy", "FileSafe"],
    project: ["Puppet Master", "PlanUnit", "ConceptHub", "PlanningRun"],
    ignoredForDraft: []
  }
};

export const SETUP_SESSIONS = [
  { id: "setup-antigravity", title: "Finish Antigravity CLI sign-in", manager: "Providers, agents & models", progress: "Profile isolated · sign-in still required", completedSteps: 2, totalSteps: 4, updatedAt: "9 minutes ago", status: "Continue setup", nextAction: "Launch provider-owned sign-in", destination: { type: "manager", managerId: "providers", tab: "accounts", resourceId: "antigravity", action: "continue-setup" } },
  { id: "setup-free-route", title: "Connect Community Coder", manager: "Providers, agents & models", progress: "Route selected · underlying OpenRouter connection missing", completedSteps: 1, totalSteps: 5, updatedAt: "Yesterday", status: "Continue setup", nextAction: "Open underlying provider setup", destination: { type: "manager", managerId: "providers", tab: "accounts", resourceId: "openrouter-free", action: "continue-setup" } },
  { id: "setup-python", title: "Add Python language support", manager: "Language servers", progress: "Project detected · compatible server not installed", completedSteps: 1, totalSteps: 3, updatedAt: "2 days ago", status: "Continue setup", nextAction: "Review installation choices", destination: { type: "manager", managerId: "lsp", resourceId: "python-language-support", action: "install-guidance" } }
];

export const RECENT_CHANGES = [
  { id: "change-theme", at: "10 minutes ago", title: "Theme changed to Friendly Dark", detail: "Applied globally; no restart required.", actor: "You", scope: "Global", reversible: true, destination: { type: "setting", categoryId: "experience", subcategoryId: "appearance-input", settingId: "experience.appearance.theme" } },
  { id: "change-codex-account", at: "18 minutes ago", title: "Work Codex selected for future requests", detail: "The captured Personal Codex in-flight request did not move.", actor: "You", scope: "Provider family", reversible: true, destination: { type: "manager", managerId: "providers", tab: "accounts", resourceId: "openai" } },
  { id: "change-catalogue", at: "Review fixture", title: "Claude catalogue refreshed", detail: "Two last-known-good rows stayed active; the failed work profile remains excluded.", actor: "Puppet Master", scope: "Provider family", reversible: false, destination: { type: "manager", managerId: "providers", tab: "models", resourceId: "claude" } },
  { id: "change-memory", at: "Yesterday", title: "Concept review preference verified", detail: "Version 3 preserved the prior summaries in immutable history.", actor: "You", scope: "Assistant memory", reversible: true, destination: { type: "manager", managerId: "memory", resourceId: "gist-review-style" } },
  { id: "change-terminal", at: "Yesterday", title: "Focused Build profile saved", detail: "Berkeley Mono, 14 px, Low Glare palette, 7-day transcript.", actor: "You", scope: "Terminal profile", reversible: true, destination: { type: "manager", managerId: "terminal", resourceId: "focused-build" } },
  { id: "change-mcp", at: "2 days ago", title: "Local docs tools set to progressive exposure", detail: "Tool details load only after the server or tool is selected.", actor: "You", scope: "Project", reversible: true, destination: { type: "manager", managerId: "mcp", resourceId: "local-docs" } },
  { id: "change-crew", at: "3 days ago", title: "Release Review Crew reserve increased", detail: "Twenty percent remains reserved for synthesis, verification, and repair.", actor: "You", scope: "Crew template", reversible: true, destination: { type: "manager", managerId: "crew", resourceId: "release-review" } },
  { id: "change-policy", at: "Last week", title: "Transcript retention inherited from project policy", detail: "Project conversations retain 90 days; terminal profiles keep their separate local policy.", actor: "Project policy", scope: "Project", reversible: false, destination: { type: "setting", categoryId: "context", subcategoryId: "compaction-retention", settingId: "context.retention.raw" } }
];

export const RECEIPT_HISTORY = [
  { id: "receipt-catalogue", at: "Today at 9:48 AM", title: "Catalogue refresh completed", detail: "Three OpenAI rows stayed mounted while updated evidence was validated.", tone: "success", persistent: true, simulated: true },
  { id: "receipt-quarantine", at: "Today at 9:29 AM", title: "Work profile result quarantined", detail: "Authentication succeeded, but safe invocation failed. Existing ready routes were unchanged.", tone: "warning", persistent: true, simulated: true },
  { id: "receipt-terminal", at: "Yesterday at 4:06 PM", title: "Terminal diagnostics represented", detail: "No shell command ran; the local concept recorded the expected checks and result.", tone: "managed", persistent: true, simulated: true }
];

const BASE_MANAGER_INVENTORY_FIXTURES = {
  context: {
    title: "Context & instructions",
    state: "ready",
    summary: "Seven durable sources exist; four were admitted to the last turn and three remained available on demand.",
    primaryAction: "Inspect last-turn context",
    items: [
      { id: "project-instructions", title: "Scoped project instructions", kind: "Instruction chain", status: "Ready", scope: "Project and nested folders", requested: "Include applicable sources", effective: "Four sources admitted in precedence order", detail: "The applicable project instruction chain is admitted without exposing a giant raw prompt.", history: "Precedence inspected today", diagnostics: ["4 admitted", "1 omitted because its folder was out of scope"], actions: ["Inspect precedence", "Preview compact form"] },
      { id: "parent-handoff", title: "Parent-agent handoff", kind: "Continuity source", status: "Scoped", scope: "Current child task", requested: "Include when delegated", effective: "Included for this task", detail: "Carries the bounded objective, ownership, and constraints without importing the whole parent transcript.", history: "Admitted this turn", diagnostics: ["2.4 KB compact handoff"], actions: ["Preview handoff"] },
      { id: "attempt-journal", title: "Current attempt journal", kind: "Goal state", status: "Scoped", scope: "Current Goal only", requested: "Include recent failures when relevant", effective: "One retry note admitted", detail: "Attempt state remains distinct from Assistant memory and transcript history.", history: "Updated 6 minutes ago", diagnostics: ["1 active attempt", "2 prior attempts omitted"], actions: ["Inspect attempt history"] },
      { id: "previous-chats", title: "Relevant project conversations", kind: "Retrieval source", status: "Progressive", scope: "Project", requested: "Search automatically", effective: "Two excerpts admitted", detail: "Focused excerpts were retrieved; full conversations stayed outside the request.", history: "Last retrieval Review fixture", diagnostics: ["2 admitted", "14 candidates not selected"], actions: ["Review excerpts"] },
      { id: "project-code", title: "Relevant project code", kind: "Retrieval source", status: "Ready", scope: "Project", requested: "Search automatically", effective: "Three bounded source windows admitted", detail: "Source windows preserve line provenance and avoid injecting the whole project.", history: "Last retrieval Review fixture", diagnostics: ["3 windows", "178 lines total"], actions: ["Review source windows"] },
      { id: "tool-details", title: "Selected tool details", kind: "Progressive capability", status: "Progressive", scope: "Current turn", requested: "Load when selected", effective: "Two selected tools admitted", detail: "Installed tool schemas remain out of context until the task selects them.", history: "Selection updated this turn", diagnostics: ["2 admitted", "46 installed tools omitted"], actions: ["Inspect selection"] },
      { id: "compaction", title: "Continuity capsule", kind: "Compaction", status: "Healthy", scope: "Current thread", requested: "Compact automatically when needed", effective: "No compaction required yet", detail: "The capsule preserves decisions, open work, and source references without replacing durable history.", history: "Last capsule yesterday", diagnostics: ["Context pressure 42 percent", "Cache route unchanged"], actions: ["Preview capsule", "Explain cache strategy"] }
    ]
  },
  personas: {
    title: "Personas",
    state: "ready",
    summary: "Nine core behavior definitions are available; child-only roles never appear as ordinary Chat defaults.",
    primaryAction: "Create Persona",
    items: [
      { id: "assistant-persona", title: "Assistant", kind: "Core Persona", status: "Default", scope: "Turn, thread, Goal, project, or global", eligibility: "Chat and delegated work", childOnly: false, capsule: "Collaborative, context-aware product assistant.", permissionEffect: "Cannot widen permissions or policy ceilings.", actions: ["Inspect source", "Preview capsule", "Set future default"] },
      { id: "collaborator-persona", title: "Collaborator", kind: "Core Persona", status: "Available", scope: "Turn, thread, or Goal", eligibility: "Chat and delegated work", childOnly: false, capsule: "Works alongside the user with explicit progress and shared decisions.", permissionEffect: "Cannot widen permissions or policy ceilings.", actions: ["Inspect source", "Preview capsule"] },
      { id: "general-persona", title: "General", kind: "Core Persona", status: "Available", scope: "Turn, thread, or Goal", eligibility: "Chat and delegated work", childOnly: false, capsule: "Neutral, adaptable behavior for ordinary tasks.", permissionEffect: "Cannot widen permissions or policy ceilings.", actions: ["Inspect source", "Preview capsule"] },
      { id: "overseer-persona", title: "Overseer", kind: "Core Persona", status: "Available", scope: "Goal or PlanningRun", eligibility: "Coordination and synthesis", childOnly: false, capsule: "Coordinates bounded workers and verifies integration evidence.", permissionEffect: "Cannot widen child or parent ceilings.", actions: ["Inspect source", "Preview capsule"] },
      { id: "researcher-persona", title: "Researcher", kind: "Core Persona", status: "Available", scope: "Turn, thread, or Goal", eligibility: "Bounded research", childOnly: false, capsule: "Finds primary evidence and states uncertainty.", permissionEffect: "Network and project grants remain external.", actions: ["Inspect source", "Preview capsule"] },
      { id: "deep-researcher-persona", title: "Deep Researcher", kind: "Core Persona", status: "Available", scope: "Goal or PlanningRun", eligibility: "Long-form bounded research", childOnly: false, capsule: "Maintains evidence trails across a larger research decomposition.", permissionEffect: "Cannot widen network, project, or cost ceilings.", actions: ["Inspect source", "Preview capsule"] },
      { id: "explorer-persona", title: "Explorer", kind: "Core Persona", status: "Child only", scope: "Delegated child task", eligibility: "Project investigation", childOnly: true, capsule: "Answers one well-scoped codebase question with source evidence.", permissionEffect: "Inherits the parent task ceiling.", actions: ["Inspect source", "Preview capsule"] },
      { id: "bash-persona", title: "Bash", kind: "Core Persona", status: "Child only", scope: "Delegated child task", eligibility: "Bounded shell execution", childOnly: true, capsule: "Performs narrowly authorized shell work and reports receipts.", permissionEffect: "Cannot widen command, filesystem, or network grants.", actions: ["Inspect source", "Preview capsule"] },
      { id: "teacher-persona", title: "Teacher", kind: "Core Persona", status: "Available", scope: "Turn or thread", eligibility: "Explanations and guided practice", childOnly: false, capsule: "Explains concepts at the user’s altitude with checkable examples.", permissionEffect: "Cannot widen permissions or policy ceilings.", actions: ["Inspect source", "Preview capsule"] }
    ]
  },
  crew: {
    title: "Crew templates",
    state: "capacity-adjusted",
    summary: "Templates preserve requested composition; RuntimeResourceGovernor alone determines resource admission and queued waves.",
    primaryAction: "Create Crew template",
    items: [
      { id: "release-review", title: "Release Review Crew", kind: "Verification template", status: "Capacity adjusted", purpose: "Independent implementation, test, and usability review before release.", requested: "5 members, 5 concurrent", effective: "2 active, 3 queued across three waves", routePolicy: "Adaptive within qualifications", members: ["Implementation auditor", "Browser verifier", "Accessibility reviewer", "Evidence mapper", "Synthesizer"], personas: ["Explorer", "Researcher", "Overseer"], guard: "20 percent reserve for synthesis and repair", isolation: "One worktree and isolated port per implementation member", coordination: "Crew board with explicit owner and reducer", consensus: "Evidence-weighted synthesis", childDepth: 1, failurePolicy: "Stop the affected lane; keep other receipts", actions: ["Inspect composition", "Preview current admission", "Duplicate template"] },
      { id: "provider-audit", title: "Provider Audit Pair", kind: "Provider template", status: "Ready", purpose: "Compare connection readiness with independent provider evidence.", requested: "2 members, 2 concurrent", effective: "2 available", routePolicy: "Strict independent providers", members: ["Provider investigator", "Independent verifier"], personas: ["Researcher", "Explorer"], guard: "Stop before external login or billing", isolation: "Shared read-only project, isolated browser profiles", coordination: "Paired evidence ledger", consensus: "Both receipts required", childDepth: 0, failurePolicy: "Return incomplete with the missing evidence named", actions: ["Inspect composition", "Start simulated setup"] },
      { id: "frontend-verification", title: "Frontend Verification Crew", kind: "UI template", status: "Ready", purpose: "Inspect responsive, theme, motion, and interaction quality.", requested: "4 members, 4 concurrent", effective: "2 concurrent, 2 queued", routePolicy: "Adaptive within qualifications", members: ["Responsive reviewer", "Motion reviewer", "Keyboard reviewer", "Visual synthesizer"], personas: ["Explorer", "Collaborator", "Overseer"], guard: "Preserve isolated browser and output resources", isolation: "Unique port, profile, and capture folder per member", coordination: "Shared finding IDs", consensus: "Synthesizer resolves duplicate evidence", childDepth: 1, failurePolicy: "Keep passing lanes and rerun only invalid evidence", actions: ["Inspect composition", "Preview resource plan"] },
      { id: "documentation-pair", title: "Documentation Pair", kind: "Writing template", status: "Managed", purpose: "Update user guidance with a separate factual review.", requested: "2 members", effective: "2 members", routePolicy: "Strict roles", members: ["Writer", "Fact checker"], personas: ["Teacher", "Researcher"], guard: "Organization policy requires human publication approval", isolation: "Shared branch with file ownership", coordination: "Sequential handoff", consensus: "Fact checker must accept each claim", childDepth: 0, failurePolicy: "Do not publish unresolved claims", actions: ["Inspect composition"] }
    ]
  },
  mcp: {
    title: "MCP servers", state: "degraded", summary: "Three servers are connected; one provider-owned sign-in needs attention.", primaryAction: "Connect MCP server",
    items: [
      { id: "github-server", title: "GitHub server", kind: "Remote MCP server", status: "Healthy", transport: "HTTPS streaming", protocol: "Requested latest stable · negotiated latest stable", scope: "Project", authentication: "Puppet Master direct connection", health: "14 tools and 3 resources discovered", exposure: "Progressive — schemas load when selected", approval: "Ask once per Goal for write tools", cache: "Refreshed Review fixture", requested: "Enabled for this project", effective: "Enabled; write tools require approval", actions: ["Refresh capabilities", "Review permissions", "Open redacted logs"] },
      { id: "design-assets", title: "Design assets server", kind: "Remote MCP server", status: "Needs attention", transport: "HTTPS streaming", protocol: "Requested latest stable · negotiation paused", scope: "Project", authentication: "Provider-owned sign-in expired", health: "Tools unavailable; last-known-good inventory retained", exposure: "Unavailable until reconnect", approval: "Existing approval does not bypass sign-in", cache: "Last successful refresh yesterday", requested: "Enabled", effective: "Unavailable", actions: ["Reconnect", "Inspect last-known-good inventory", "Open redacted logs"] },
      { id: "local-docs", title: "Local documentation server", kind: "Local MCP server", status: "Healthy", transport: "Standard input/output", protocol: "Requested latest stable · negotiated latest stable", scope: "Project", authentication: "No authentication", health: "8 tools, 2 resources, and 1 extension discovered", exposure: "Progressive — two tools selected this turn", approval: "Read tools allowed; writes disabled", cache: "Refreshed 8 minutes ago", requested: "Start when needed", effective: "Running for the active task", actions: ["Stop server", "Refresh capabilities", "Open logs"] },
      { id: "legacy-bridge", title: "Legacy provider bridge", kind: "Provider projection", status: "Managed", transport: "Provider CLI projection", protocol: "Provider-owned", scope: "Global", authentication: "Owned by provider CLI", health: "Projection available; not Puppet Master canon", exposure: "Read-only projection", approval: "Managed by provider policy", cache: "Checked today", requested: "Display projection", effective: "Displayed with ownership label", actions: ["Inspect ownership", "Open diagnostics"] }
    ]
  },
  lsp: {
    title: "Language servers", state: "needs-setup", summary: "Three servers are healthy, one is disabled by project policy, and Python support is not configured.", primaryAction: "Add language server",
    items: [
      { id: "rust-analyzer", title: "Rust Analyzer", kind: "Language server", status: "Healthy", languages: ["Rust"], executable: "Detected installation · version 2026.28", scope: "Rust workspaces", startup: "Automatic when Rust appears", capabilities: ["Diagnostics", "Completion", "Navigation", "Formatting"], conflicts: "Formatting owned by Rustfmt", requested: "Automatic", effective: "Running", actions: ["Restart", "Open logs", "Review capabilities"] },
      { id: "typescript-language", title: "TypeScript language service", kind: "Language server", status: "Healthy", languages: ["TypeScript", "JavaScript", "JSON"], executable: "Bundled compatible version", scope: "Web workspaces", startup: "Automatic when needed", capabilities: ["Diagnostics", "Completion", "Navigation", "Rename"], conflicts: "Formatting owned by project formatter", requested: "Automatic", effective: "Sleeping until selected", actions: ["Start now", "Open logs", "Review capabilities"] },
      { id: "python-language-support", title: "Python language support", kind: "Language server", status: "Not configured", languages: ["Python"], executable: "No compatible installation detected", scope: "This project", startup: "Automatic after setup", capabilities: [], conflicts: "None detected", requested: "Automatic", effective: "Unavailable", actions: ["Review installation choices", "Rescan"] },
      { id: "slint-language", title: "Slint language server", kind: "Language server", status: "Healthy", languages: ["Slint"], executable: "Detected version 1.17.1", scope: "Puppet Master project", startup: "At workspace open", capabilities: ["Diagnostics", "Completion", "Preview"], conflicts: "None", requested: "At workspace open", effective: "Running", actions: ["Restart", "Open logs"] },
      { id: "yaml-language", title: "YAML language server", kind: "Language server", status: "Managed", languages: ["YAML"], executable: "Installed version 1.16", scope: "Organization projects", startup: "Disabled by policy", capabilities: ["Diagnostics", "Schema validation"], conflicts: "Organization policy disables external schema fetch", requested: "Automatic", effective: "Disabled", actions: ["Inspect policy"] }
    ]
  },
  extensions: {
    title: "Skills, plugins, tools & commands", state: "review-needed", summary: "Installed, enabled, available, selected, and invoked are kept as separate states.", primaryAction: "Discover extensions",
    items: [
      { id: "frontend-design-skill", title: "Frontend design", kind: "Skill", status: "Project enabled", source: "Repository skill", trust: "Reviewed local source", permissions: "No additional permission grant", scope: "This project", requested: "Enabled", effective: "Eligible; not loaded until selected", history: "Used in the current concept task", actions: ["Inspect source", "Disable for project"] },
      { id: "audit-skill", title: "Interface audit", kind: "Skill", status: "Available", source: "Repository skill", trust: "Reviewed local source", permissions: "Read-only inspection by default", scope: "This project", requested: "Enabled", effective: "Available; not selected", history: "Last used today", actions: ["Inspect source", "Disable for project"] },
      { id: "browser-plugin", title: "Browser control", kind: "Plugin", status: "Healthy", source: "Installed plugin", trust: "Signed distribution", permissions: "Controls an isolated browser session when explicitly used", scope: "Global installation", requested: "Stable channel", effective: "Installed and compatible", history: "Updated July 31", actions: ["Inspect permissions", "Review update channel"] },
      { id: "design-export-plugin", title: "Design export", kind: "Plugin", status: "Review update", source: "Installed plugin", trust: "Current version reviewed", permissions: "Proposed update requests project write access", scope: "Project", requested: "Stable channel", effective: "Old version remains active", history: "Update held yesterday", actions: ["Review permission change", "Keep current version"] },
      { id: "local-file-tool", title: "Project file reader", kind: "Tool", status: "Available", source: "Puppet Master core", trust: "Core", permissions: "Project read scope", scope: "Current task", requested: "Available", effective: "Available; selected this turn", history: "Invoked Review fixture", actions: ["Inspect invocation history", "Review approval policy"] },
      { id: "github-mcp-tool", title: "Create GitHub pull request", kind: "MCP tool", status: "Approval required", source: "GitHub server", trust: "Owned by GitHub server", permissions: "Write action; ask once per Goal", scope: "Current project", requested: "Progressively available", effective: "Schema omitted until selected", history: "Not invoked", actions: ["Inspect owner server", "Review approval policy"] },
      { id: "settings-command", title: "Open Settings", kind: "Command", status: "Ready", source: "Puppet Master core", shortcut: "Command + comma", conflict: "None", scope: "Global", requested: "Enabled", effective: "Enabled", history: "Used today", actions: ["Remap shortcut", "Reset shortcut"] },
      { id: "search-command", title: "Search all Settings", kind: "Command", status: "Ready", source: "Puppet Master core", shortcut: "Command + K in Settings", conflict: "None", scope: "Settings", requested: "Enabled", effective: "Enabled", history: "Used Review fixture", actions: ["Remap shortcut", "Reset shortcut"] },
      { id: "terminal-command", title: "Toggle Terminal", kind: "Command", status: "Conflict", source: "Puppet Master core", shortcut: "Control + grave accent", conflict: "Also assigned to cycle panels", scope: "Project", requested: "Enabled", effective: "Old binding retained until conflict is resolved", history: "Conflict detected yesterday", actions: ["Resolve conflict", "Reset shortcut"] },
      { id: "release-note-command", title: "Create release note", kind: "Custom command", status: "Managed", source: "Organization command pack", shortcut: "Not assigned", conflict: "None", scope: "Organization projects", requested: "Enabled", effective: "Enabled read-only", history: "Updated last week", actions: ["Inspect source", "Inspect policy"] }
    ]
  },
  media: {
    title: "Media providers", state: "degraded", summary: "Image and vision routes are ready; audio fallback is unavailable and video setup is incomplete.", primaryAction: "Connect media route",
    items: [
      { id: "openai-image-route", title: "OpenAI image generation", kind: "Image generation route", status: "Healthy", provider: "OpenAI", account: "Work API", connection: "Work API connection", model: "Image generation route", purpose: "Generate project images", capabilities: ["Text to image", "Image edit", "PNG", "WebP"], transformation: "Native provider output", output: "Project artifacts folder · PNG", policy: "Standard provider safety policy", allowance: "API billing; monthly guard 37 percent used", fallback: "Ask before Local image route", history: "Generation succeeded yesterday", actions: ["Generate simulated preview", "Inspect history", "Run diagnostics"] },
      { id: "vision-analysis-route", title: "Vision analysis", kind: "Image understanding route", status: "Healthy", provider: "OpenAI", account: "Personal Codex", connection: "Puppet Master direct", model: "5.6 Sol", purpose: "Analyze screenshots and image evidence", capabilities: ["Image input", "Text analysis"], transformation: "Native image input", output: "Text response in the owning task", policy: "Project content policy", allowance: "Included usage exhausted; ask before API billing", fallback: "Claude Sonnet after confirmation", history: "Observed image use today", actions: ["Inspect capability evidence", "Review fallback"] },
      { id: "local-audio-route", title: "Local audio transcription", kind: "Audio route", status: "Unavailable", provider: "Local media server", account: "Local endpoint", connection: "Server connection", model: "Local transcription model", purpose: "Transcribe private local audio", capabilities: ["Audio input", "Text transcript"], transformation: "Native local input", output: "Project transcript folder · text", policy: "Local-only", allowance: "Local compute", fallback: "Disabled", history: "Server unavailable since yesterday", actions: ["Reconnect", "Open diagnostics"] },
      { id: "video-storyboard", title: "Video storyboard setup", kind: "Video route", status: "Continue setup", provider: "No provider selected", account: "Not configured", connection: "Not configured", model: "Not configured", purpose: "Generate storyboard frames and timing notes", capabilities: ["Planned image sequence", "Text timing notes"], transformation: "Puppet Master composition after setup", output: "Project artifacts folder", policy: "Requires provider review", allowance: "Unknown until setup", fallback: "No fallback", history: "Setup started 3 days ago", actions: ["Continue setup", "Discard setup"] },
      { id: "image-transform-route", title: "Project image transformation", kind: "Transformation route", status: "Managed", provider: "OpenAI", account: "Work API", connection: "Work API connection", model: "Image edit route", purpose: "Resize, crop, and transform approved project images", capabilities: ["Image edit", "PNG", "WebP", "JPEG"], transformation: "Native edit plus local format conversion", output: "Project artifacts folder · preserve original", policy: "Organization policy", allowance: "API billing", fallback: "Local conversion for format-only changes", history: "Policy refreshed last week", actions: ["Inspect policy", "Run diagnostics"] }
    ]
  }
};

const CORRECTION_MANAGER_INVENTORIES = {
  "accessibility-input": {
    title: "Accessibility & input",
    state: "Ready",
    summary: "Cross-cutting accessibility, keyboard, focus, contrast, motion, and spelling destinations.",
    items: [
      { id: "accessibility-input-projection", title: "Accessibility and input preferences", kind: "Cross-cutting destination", status: "Ready", scope: "Global and Project", detail: "Routes to UI scale, fonts, reduced motion, focus/input behavior, contrast diagnostics, keyboard operation, and spellcheck." }
    ]
  },
  "dry-method": {
    title: "DRY Method",
    state: "Inspect only",
    summary: "Visible owner-state projection; the DRY corpus is not edited here.",
    items: [
      { id: "dry-method-visible-state", title: "Owner projection", kind: "Read-only projection", status: "Applied", scope: "Current project", detail: "Exact visible states: Applied, Degraded, Disabled, Missing owner, Stale reference, Owner resolved, Mutation blocked.", states: ["Applied", "Degraded", "Disabled", "Missing owner", "Stale reference", "Owner resolved", "Mutation blocked"], actions: ["Inspect evidence"] }
    ]
  },
  updates: {
    title: "Puppet Master updates",
    state: "Deferred insertion",
    summary: "Owned by Project Syncing and Updates; no update state machine is implemented in this concept.",
    items: [
      { id: "updates-insertion-contract", title: "Application and content updates", kind: "Deferred insertion contract", status: "Not implemented", scope: "Host", detail: "Project Syncing and Updates owns application, server, web-asset, protocol, and PM content/catalog update behavior.", disabled: true, disabledReason: "Deferred to Project Syncing and Updates", actions: ["Inspect insertion contract"] }
    ]
  },
  "product-onboarding": {
    title: "Product Onboarding",
    state: "Deferred insertion",
    summary: "Insertion contract only; no onboarding state machine is implemented in this concept.",
    items: [
      { id: "product-onboarding-insertion-contract", title: "Product Onboarding", kind: "Deferred insertion contract", status: "Not implemented", scope: "Product", detail: "The Product Onboarding owner supplies the welcome, defer/resume, Server choice, setup handoffs, and first Project transition.", disabled: true, disabledReason: "Deferred to Product Onboarding", actions: ["Inspect insertion contract"] }
    ]
  },
  doctor: {
    title: "Doctor",
    state: "Deferred insertion",
    summary: "Insertion contract only; no Doctor backend is invented in this concept.",
    items: [
      { id: "doctor-insertion-contract", title: "Doctor", kind: "Deferred insertion contract", status: "Not implemented", scope: "Product", detail: "Doctor remains deferred until cross-system owner handoffs are reconciled.", disabled: true, disabledReason: "Deferred to Doctor", actions: ["Inspect insertion contract"] }
    ]
  },
  "server-insertion": {
    title: "Servers & remote access",
    state: "Missing owner",
    summary: "The exact canonical Server owner is unresolved. This insertion surface is inspect-only and fail-closed.",
    items: [
      { id: "server-insertion-unresolved-owner", title: "Server insertion contract", kind: "Unresolved owner", status: "Missing owner", scope: "Server, Host, and Project", detail: "Owner unresolved. No Server mutation or backend state machine is available from this concept.", ownerStatus: "unresolved", disabled: true, disabledReason: "Mutation blocked: canonical owner unresolved", actions: ["Inspect residual risk"] }
    ]
  }
};

const MANAGER_INVENTORY_FIXTURES = { ...BASE_MANAGER_INVENTORY_FIXTURES, ...EXTRA_MANAGER_INVENTORIES, ...CORRECTION_MANAGER_INVENTORIES };

function normalizeManagerInventoryItem(managerId, item, index) {
  const status = item.status || item.health || "Ready";
  const scope = item.scope || "Current project";
  const detail = item.detail || item.purpose || item.capsule || item.health || item.eligibility || `${item.title} is represented as deterministic review data.`;
  const comparisonAuthored = Object.prototype.hasOwnProperty.call(item, "requested")
    && Object.prototype.hasOwnProperty.call(item, "effective");
  const history = item.history || `${status} fixture reviewed in the current Settings session.`;
  const diagnostics = Array.isArray(item.diagnostics)
    ? item.diagnostics
    : item.diagnostics
      ? [item.diagnostics]
      : [`State check: ${status}`, `Scope check: ${scope}`];
  return { ...item, status, scope, detail, history, diagnostics, comparisonAuthored };
}

export const MANAGER_INVENTORIES = Object.fromEntries(
  Object.entries(MANAGER_INVENTORY_FIXTURES).map(([managerId, manager]) => [
    managerId,
    {
      ...manager,
      items: manager.items.map((item, index) => normalizeManagerInventoryItem(managerId, item, index))
    }
  ])
);

export const GENERIC_MANAGER_STATES = Object.fromEntries(
  Object.entries(MANAGER_INVENTORIES).map(([managerId, manager]) => [
    managerId,
    manager.items.map((item) => [
      item.title,
      item.detail || item.purpose || item.health || item.eligibility || item.kind,
      item.status,
      item
    ])
  ])
);

export const GENERIC_MANAGER_STATE_DEFINITIONS = Object.freeze({
  loading: Object.freeze({ source: "manager hydration request", reason: "Selected manager data has not arrived", disabled: true, cached: false, receipt: "observable-work pending" }),
  empty: Object.freeze({ source: "settled manager projection", reason: "No resources are configured for this scope", disabled: false, cached: false, receipt: "settled empty projection receipt" }),
  error: Object.freeze({ source: "manager refresh operation", reason: "Refresh failed validation", disabled: true, cached: true, receipt: "failed operation receipt; cached content retained" }),
  offline: Object.freeze({ source: "connection supervisor projection", reason: "Owning host or service is offline", disabled: true, cached: true, receipt: "offline observation receipt; cached content retained" }),
  unavailable: Object.freeze({ source: "capability availability projection", reason: "Required capability is not available for this scope", disabled: true, cached: false, receipt: "availability decision receipt" }),
  managed_inherited: Object.freeze({ source: "named policy owner", reason: "Effective value is inherited or managed", disabled: true, cached: false, receipt: "policy source and revision receipt" }),
  requested_effective: Object.freeze({ source: "named canonical owner projection", reason: "Requested and effective values differ", disabled: true, cached: false, receipt: "requested/effective decision receipt" }),
  degraded: Object.freeze({ source: "manager health projection", reason: "The manager remains partly usable with a named limitation", disabled: false, cached: true, receipt: "degraded health receipt; cached content retained" })
});

export const MANAGER_STATE_FIXTURE_IDS = Object.freeze(Object.fromEntries(
  MANAGERS.map((manager) => [manager.id, Object.keys(GENERIC_MANAGER_STATE_DEFINITIONS).map((state) => `manager-state.${manager.id}.${state}`)])
));

export function buildManagerStateFixture(managerId, state) {
  const definition = GENERIC_MANAGER_STATE_DEFINITIONS[state];
  if (!MANAGER_STATE_FIXTURE_IDS[managerId] || !definition) return null;
  return { id: `manager-state.${managerId}.${state}`, managerId, state, ...definition };
}

export const SIMULATED_REVIEW_PROFILES = Object.freeze([
  { id: "review-profile.legacy-cpu", title: "Legacy CPU", keywords: ["Ivy Bridge", "older CPU", "bounded waves"] },
  { id: "review-profile.low-memory", title: "Low memory", keywords: ["byte-bounded caches", "pressure"] },
  { id: "review-profile.slow-disk", title: "Slow disk", keywords: ["incremental hydration", "storage latency"] },
  { id: "review-profile.poor-network", title: "Poor or offline network", keywords: ["poor network", "offline", "cached projection"] },
  { id: "review-profile.metered-network", title: "Metered network", keywords: ["metered", "bounded refresh"] },
  { id: "review-profile.thermal-low-power", title: "Thermal or Low Power", keywords: ["thermal", "Low Power", "degraded"] },
  { id: "review-profile.large-catalog", title: "Large catalog", keywords: ["825 settings", "virtualized", "lazy hydration"] }
]);

export const SIMULATED_REVIEW_PROFILE_NOTICE = "Deterministic simulated review profiles only; they are not hardware certification. Required review work runs in bounded waves and is never omitted.";

export const RESOURCE_ADMISSION_PROJECTION_CONTRACT = Object.freeze({
  settingsRole: "Express requested and effective values only",
  policyOwner: "RuntimeResourceGovernor",
  nonOwners: Object.freeze({ Usage: "Reports provider consumption and limits", Orchestrator: "Projects execution and run state" }),
  outcomes: Object.freeze(["admitted", "queued", "admitted_degraded", "blocked_permission", "blocked_resource", "cancelled"]),
  policyComputation: "Not modeled by this deterministic concept fixture"
});

const reviewNotice = ({ kind, tone, title, reason, action, destination, secondaryAction = null }) => ({
  id: `notice-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  kind,
  tone,
  title,
  reason,
  action,
  secondaryAction,
  destination,
  target: destination.managerId || destination.categoryId,
  persistent: kind === "Needs attention"
});

const reviewScenario = ({ id, label, description, signature, entityOverlay, notices }) => ({
  id,
  label,
  description,
  signature,
  entityOverlay,
  overlay: entityOverlay,
  notices
});

export const SCENARIOS = {
  normal: reviewScenario({
    id: "normal", label: "Normal home", description: "Ordinary daily state with one resumable setup and one optional recommendation.", signature: "normal|ready-routes|one-setup|one-recommendation",
    entityOverlay: { phase: "settled", providers: { openai: "ready-with-usage-warning", claude: "ready-with-profile-warning", antigravity: "signed-out" }, managers: { memory: "ready", terminal: "ready", mcp: "ready-with-warning" }, settings: {}, setups: ["setup-antigravity"] },
    notices: [
      reviewNotice({ kind: "Continue setup", tone: "warning", title: "Finish the Antigravity CLI profile", reason: "The CLI is installed, but its isolated profile has no signed-in identity.", action: "Open provider setup", destination: { type: "manager", managerId: "providers", tab: "accounts", resourceId: "antigravity", action: "continue-setup" } }),
      reviewNotice({ kind: "Recommended", tone: "success", title: "Confirm the planning route for new work", reason: "The current high-quality route is healthy; confirm it as the project default for future PlanningRuns.", action: "Review role assignment", destination: { type: "manager", managerId: "providers", tab: "roles", resourceId: "planning", focusId: "role-planning" } })
    ]
  }),
  attention: reviewScenario({
    id: "attention", label: "Needs attention", description: "Several independent resources need repair, setup, or review.", signature: "attention|provider-failed|mcp-expired|lsp-missing|gist-review",
    entityOverlay: { phase: "settled", providers: { claude: "degraded" }, providerAccounts: { "claude-work": "authenticated-invocation-failed" }, managers: { mcp: "degraded", lsp: "needs-setup", memory: "review-needed" }, settings: { "code.language.python": "Unavailable" }, setups: ["setup-python"] },
    notices: [
      reviewNotice({ kind: "Needs attention", tone: "danger", title: "Work Claude profile cannot generate", reason: "Authentication succeeded, but the safe readiness check failed. Ready routes remain unchanged.", action: "Inspect failed profile", destination: { type: "manager", managerId: "providers", tab: "accounts", resourceId: "claude", childResourceId: "claude-work" } }),
      reviewNotice({ kind: "Needs attention", tone: "danger", title: "Design assets sign-in expired", reason: "The server’s tools remain unavailable while its last-known-good inventory stays visible.", action: "Open MCP server", destination: { type: "manager", managerId: "mcp", resourceId: "design-assets" } }),
      reviewNotice({ kind: "Continue setup", tone: "warning", title: "Add Python language support", reason: "Python diagnostics and navigation are unavailable in this project.", action: "Review installation choices", destination: { type: "manager", managerId: "lsp", resourceId: "python-language-support" } }),
      reviewNotice({ kind: "Recommended", tone: "success", title: "Verify the planning-route Gist", reason: "The recent routing preference has evidence but still needs an explicit review decision.", action: "Review memory evidence", destination: { type: "manager", managerId: "memory", resourceId: "gist-provider-route" } })
    ]
  }),
  calm: reviewScenario({
    id: "calm", label: "Calm state", description: "All review entities are healthy or intentionally configured, with nothing requesting attention.", signature: "calm|all-health-checks-settled|zero-notices",
    entityOverlay: { phase: "settled", providers: { openai: "ready", claude: "ready", antigravity: "ready", ollama: "intentionally-not-installed", "openrouter-free": "intentionally-disabled", "local-server": "ready" }, managers: { memory: "ready", terminal: "ready", mcp: "ready", lsp: "ready", extensions: "ready", media: "ready" }, settings: { "code.language.python": "Default" }, setups: [] },
    notices: []
  }),
  setup: reviewScenario({
    id: "setup", label: "Setup in progress", description: "Three resumable setups retain their place and return to the originating resource.", signature: "setup|three-resumable-sessions|provider-lsp-terminal",
    entityOverlay: { phase: "setup", providers: { antigravity: "setup-in-progress", "openrouter-free": "setup-in-progress" }, managers: { lsp: "setup-in-progress", terminal: "ready" }, settings: { "code.language.python": "Not configured" }, setups: ["setup-antigravity", "setup-free-route", "setup-python"] },
    notices: [
      reviewNotice({ kind: "Continue setup", tone: "warning", title: "Connect Community Coder’s underlying provider", reason: "Free Models does not own credentials; setup resumes at the OpenRouter connection and returns to this model row.", action: "Continue provider setup", destination: { type: "manager", managerId: "providers", tab: "accounts", resourceId: "openrouter-free", childResourceId: "openrouter-setup" } }),
      reviewNotice({ kind: "Continue setup", tone: "warning", title: "Finish Antigravity native sign-in", reason: "The isolated profile is ready; the provider-owned Google sign-in step remains.", action: "Resume native sign-in", destination: { type: "manager", managerId: "providers", tab: "accounts", resourceId: "antigravity", childResourceId: "antigravity-default" } }),
      reviewNotice({ kind: "Continue setup", tone: "warning", title: "Choose Python language support", reason: "The project is detected and waiting for a compatible language-server choice.", action: "Review language servers", destination: { type: "manager", managerId: "lsp", resourceId: "python-language-support" } })
    ]
  }),
  loading: reviewScenario({
    id: "loading", label: "Loading state", description: "The workspace installs stable geometry before text and controls become available.", signature: "loading|workspace-initializing|stable-shell",
    entityOverlay: { phase: "loading", providers: {}, managers: { providers: "loading", memory: "loading" }, settings: {}, setups: [] },
    notices: [reviewNotice({ kind: "Loading", tone: "managed", title: "Preparing Settings workspace", reason: "Categories are ready; manager inventories and effective values are being installed.", action: "Stay on Settings Home", destination: { type: "home", categoryId: "experience" } })]
  }),
  refreshing: reviewScenario({
    id: "refreshing", label: "Refreshing catalogues", description: "Active rows stay mounted while new catalogue evidence is fetched and validated.", signature: "refreshing|openai-catalogue|last-known-good-mounted",
    entityOverlay: { phase: "refreshing", providers: { openai: "refreshing" }, catalogues: { openai: "stale-while-revalidate" }, managers: { providers: "refreshing" }, settings: {}, setups: [] },
    notices: [reviewNotice({ kind: "Refreshing", tone: "managed", title: "Checking OpenAI catalogue evidence", reason: "Three last-known-good model rows remain usable while source, entitlement, and safe-invocation evidence are validated.", action: "Watch refresh details", destination: { type: "manager", managerId: "providers", tab: "models", resourceId: "openai" } })]
  }),
  degraded: reviewScenario({
    id: "degraded", label: "Degraded with last-known-good data", description: "Fresh updates failed validation, so proven prior state remains active with the failure disclosed.", signature: "degraded|catalogue-quarantined|memory-index-partial|lkg-active",
    entityOverlay: { phase: "settled", providers: { openai: "degraded" }, catalogues: { openai: "quarantined" }, managers: { memory: "degraded", providers: "degraded" }, settings: {}, setups: [] },
    notices: [
      reviewNotice({ kind: "Needs attention", tone: "danger", title: "Catalogue update failed validation", reason: "The update is quarantined; three last-known-good OpenAI model rows remain active.", action: "Inspect catalogue receipt", destination: { type: "manager", managerId: "providers", tab: "support", resourceId: "openai", focusId: "catalogue-quarantine" } }),
      reviewNotice({ kind: "Needs attention", tone: "danger", title: "Memory search index needs repair", reason: "Durable Gists and immutable versions remain safe, but search may omit recently changed entries.", action: "Review repair plan", destination: { type: "manager", managerId: "memory", tab: "maintenance", focusId: "index-rebuild" } })
    ]
  }),
  managed: reviewScenario({
    id: "managed", label: "Managed workspace", description: "Organization policy selects protected effective values while keeping their source and reason visible.", signature: "managed|billing-route|retention|media-policy",
    entityOverlay: { phase: "settled", providers: { openai: "ready" }, managers: { media: "managed", context: "managed" }, settings: { "intelligence.usage.managed": "Managed", "context.retention.raw": "Managed", "media.safety.status": "Managed" }, setups: [] },
    notices: [reviewNotice({ kind: "Managed", tone: "managed", title: "Three values follow organization policy", reason: "Billing route, project retention, and media safety stay read-only with their policy source visible.", action: "Inspect managed settings", destination: { type: "setting", categoryId: "intelligence", subcategoryId: "continuation-usage", settingId: "intelligence.usage.managed" } })]
  }),
  unavailable: reviewScenario({
    id: "unavailable", label: "Unavailable dependency", description: "A missing dependency keeps its controls disabled and explains the next possible step.", signature: "unavailable|python-lsp-missing|audio-server-offline",
    entityOverlay: { phase: "settled", providers: {}, managers: { lsp: "needs-setup", media: "degraded" }, settings: { "code.language.python": "Unavailable" }, resources: { "python-language-support": "not-installed", "local-audio-route": "offline" }, setups: ["setup-python"] },
    notices: [
      reviewNotice({ kind: "Needs attention", tone: "danger", title: "Python language support is unavailable", reason: "No compatible server is installed, so diagnostics and navigation controls remain disabled.", action: "Review installation choices", destination: { type: "manager", managerId: "lsp", resourceId: "python-language-support" } }),
      reviewNotice({ kind: "Needs attention", tone: "danger", title: "Local audio route is offline", reason: "Fallback is intentionally disabled; existing files and history remain unchanged.", action: "Inspect media diagnostics", destination: { type: "manager", managerId: "media", resourceId: "local-audio-route" } })
    ]
  }),
  error: reviewScenario({
    id: "error", label: "Error state", description: "A bounded operation failed without erasing the last successful state or pretending recovery occurred.", signature: "error|terminal-remote-failed|mcp-auth-failed",
    entityOverlay: { phase: "settled", providers: {}, managers: { terminal: "error", mcp: "error" }, resources: { "remote-safe": "connection-failed", "design-assets": "authentication-failed" }, settings: {}, setups: [] },
    notices: [
      reviewNotice({ kind: "Needs attention", tone: "danger", title: "Remote terminal connection failed", reason: "The host is offline. No startup command ran and no transcript was written.", action: "Open terminal diagnostics", destination: { type: "manager", managerId: "terminal", resourceId: "remote-safe", tab: "diagnostics" } }),
      reviewNotice({ kind: "Needs attention", tone: "danger", title: "Design assets reconnect failed", reason: "The provider-owned sign-in did not complete; last-known-good inventory remains read only.", action: "Inspect reconnect receipt", destination: { type: "manager", managerId: "mcp", resourceId: "design-assets", tab: "diagnostics" } })
    ]
  }),
  "usage-exhausted": reviewScenario({
    id: "usage-exhausted", label: "Included usage exhausted", description: "Provider-specific continuation choices appear without inventing a universal budget rule.", signature: "usage-exhausted|openai-personal|ask-before-api",
    entityOverlay: { phase: "settled", providers: { openai: "usage-exhausted" }, providerAccounts: { "openai-personal": "usage-exhausted" }, managers: { providers: "action-needed" }, settings: { "intelligence.usage.codex-next": "Custom" }, setups: [] },
    notices: [reviewNotice({ kind: "Needs attention", tone: "danger", title: "Personal Codex included usage is exhausted", reason: "The captured request keeps its route. New work will ask before using API billing, switching account, or waiting for reset.", action: "Choose what happens next", destination: { type: "manager", managerId: "providers", tab: "usage", resourceId: "openai", childResourceId: "openai-personal" } })]
  }),
  "effective-difference": reviewScenario({
    id: "effective-difference", label: "Requested and effective values differ", description: "Operational capacity and route substitution remain visible beside the user’s requested policy.", signature: "effective-difference|goal-capacity-4-to-2|vision-route-substitution",
    entityOverlay: { phase: "settled", providers: { openai: "ready-with-substitution" }, managers: { providers: "effective-difference", crew: "capacity-adjusted" }, settings: { "planning.goal.effective": "Effective value differs", "collaboration.crew.composition": "Effective value differs" }, routes: { vision: { requested: "Vision route — Personal Codex", effective: "5.6 Sol — Work Codex", reason: "Personal entitlement evidence is stale" } }, setups: [] },
    notices: [
      reviewNotice({ kind: "Effective value differs", tone: "warning", title: "Current Goal capacity is lower than configured", reason: "Four agents are configured; RuntimeResourceGovernor projects two admitted agents across three bounded waves. Required review work is not omitted.", action: "Inspect admission explanation", destination: { type: "setting", categoryId: "planning", subcategoryId: "goal-defaults", settingId: "planning.goal.effective" } }),
      reviewNotice({ kind: "Effective value differs", tone: "warning", title: "Vision analysis is using the work route", reason: "The requested Personal Codex vision row has stale entitlement evidence, so the qualified work route is effective for new requests.", action: "Review route evidence", destination: { type: "manager", managerId: "providers", tab: "routing", resourceId: "openai", focusId: "vision-route" } })
    ]
  })
};

export function categoryById(id) {
  return CATEGORIES.find((category) => category.id === id) || CATEGORIES[0];
}

export function managerById(id) {
  return MANAGERS.find((manager) => manager.id === id) || MANAGERS[0];
}

export function providerById(id) {
  return PROVIDERS.find((provider) => provider.id === id) || PROVIDERS[0];
}

export function inventoryByManagerId(id) {
  return MANAGER_INVENTORIES[id] || MANAGER_INVENTORIES.context;
}

export function scenarioById(id) {
  return SCENARIOS[id] || SCENARIOS.normal;
}

export function allSettings() {
  return CATEGORIES.flatMap((category) => category.subcategories.flatMap((subcategory) => subcategory.settings.map((entry) => ({
    ...entry,
    categoryId: category.id,
    categoryTitle: category.title,
    subcategoryId: subcategory.id,
    subcategoryTitle: subcategory.title,
    destination: { type: "setting", categoryId: category.id, subcategoryId: subcategory.id, settingId: entry.id }
  }))));
}

export const SEARCH_ACTIONS = [
  { id: "refresh-provider-catalogues", title: "Refresh provider catalogues", subtitle: "Keep last-known-good rows active while checking and validating updates", destination: { type: "manager", managerId: "providers", tab: "models", action: "refresh-catalogues" }, search: ["models.dev", "free coding models", "catalog source"] },
  { id: "review-effective-routes", title: "Review requested and effective routes", subtitle: "Explain provider, entitlement, policy, or capacity substitutions", destination: { type: "manager", managerId: "providers", tab: "routing" }, search: ["fallback", "substitution", "priority"] },
  { id: "inspect-memory-evidence", title: "Inspect memory evidence", subtitle: "Open Gist provenance, immutable versions, and recall history", destination: { type: "manager", managerId: "memory", tab: "evidence" }, search: ["gist", "version", "half life", "capsule"] },
  { id: "rebuild-memory-index", title: "Review memory index rebuild", subtitle: "Preview sources, deduplication, redaction, and the simulated repair receipt", destination: { type: "manager", managerId: "memory", tab: "maintenance", focusId: "index-rebuild" }, search: ["deduplicate", "repair memory search"] },
  { id: "run-terminal-diagnostics", title: "Run Terminal diagnostics", subtitle: "Check shell discovery, font availability, rendering, startup, and retention", destination: { type: "manager", managerId: "terminal", tab: "diagnostics" }, search: ["shell", "font", "renderer"] },
  { id: "manage-personal-dictionary", title: "Manage personal dictionary", subtitle: "Review words recognized across projects without using a model provider", destination: { type: "setting", categoryId: "experience", subcategoryId: "appearance-input", settingId: "experience.input.personal-dictionary" }, search: ["spellcheck", "custom words"] },
  { id: "manage-project-dictionary", title: "Manage project dictionary", subtitle: "Review project-specific recognized terms and writing overrides", destination: { type: "setting", categoryId: "experience", subcategoryId: "appearance-input", settingId: "experience.input.project-dictionary-manage" }, search: ["spellcheck", "project words"] },
  { id: "inspect-context-admission", title: "Inspect last-turn context", subtitle: "See admitted and omitted sources, precedence, and compact context size", destination: { type: "manager", managerId: "context", resourceId: "project-instructions" }, search: ["instructions", "handoff", "attempt journal", "tools"] },
  { id: "review-shortcut-conflicts", title: "Resolve shortcut conflicts", subtitle: "Compare requested and effective bindings before saving a remap", destination: { type: "manager", managerId: "extensions", resourceId: "terminal-command" }, search: ["commands", "keyboard", "remap"] },
  { id: "open-usage-detail", title: "Open provider usage detail", subtitle: "Continue to the Settings handoff for measured balance, history, projection, and forecast", destination: { type: "manager", managerId: "providers", tab: "usage", resourceId: "openai", selector: "[data-focus-key=\"provider-usage-heading\"]" }, search: ["balance", "reset", "cooldown", "extra usage"] },
  { id: "inspect-provider-installations", title: "Inspect provider installations", subtitle: "Review selected, shadowed, unknown-owner, official-source, and update states", destination: { type: "manager", managerId: "providers", tab: "installations", resourceId: "openai" }, search: ["cli", "install", "update", "shadowed", "ownership"] },
  { id: "import-settings", title: "Import settings with conflict preview", subtitle: "Validate, preview, merge or replace, verify, and roll back", destination: { type: "manager", managerId: "settings-lifecycle", resourceId: "settings-import" }, search: ["export", "copy settings", "reset"] },
  { id: "import-sound-pack", title: "Import a compatible sound pack", subtitle: "Validate manifest, license, formats, mappings, and local previews", destination: { type: "manager", managerId: "notifications-sounds", resourceId: "pack-openpeon" }, search: ["PeonPing", "OpenPeon", "audio upload"] },
  { id: "preview-custom-theme", title: "Preview custom theme TOML", subtitle: "Validate semantic tokens and fall back visibly without committing", destination: { type: "manager", managerId: "appearance", resourceId: "theme-custom" }, search: ["appearance", "colors", "TOML"] },
  { id: "testing-capabilities", title: "Configure testing and debugging", subtitle: "Set browser, native, accessibility, performance, and security capabilities to Auto, On, or Off", destination: { type: "manager", managerId: "testing-debug", resourceId: "test-browser" }, search: ["debugger", "simulator", "hot reload", "live preview"] },
  { id: "preview-workspace-cleanup", title: "Preview workspace cleanup", subtitle: "Exclude protected paths before removing caches, worktrees, or artifacts", destination: { type: "manager", managerId: "workspace-cleanup", resourceId: "cleanup-caches" }, search: ["storage", "delete", "cache"] }
];

const compactSearchRecord = (id, title, keywords, destination) => Object.freeze({
  id,
  title,
  keywords: [...new Set(keywords.filter(Boolean).map((value) => String(value).trim()).filter(Boolean))],
  destination
});

export const SEARCH_METADATA_REGISTRY = Object.freeze([
  ...CATEGORIES.map((category) => compactSearchRecord(`category.${category.id}`, category.title, [category.route, "Settings category"], { type: "category", categoryId: category.id })),
  ...allSettings().map((entry) => compactSearchRecord(`setting.${entry.id}`, entry.label, [entry.categoryTitle, entry.subcategoryTitle, ...(entry.search || [])], entry.destination)),
  ...MANAGERS.map((manager) => compactSearchRecord(`manager.${manager.id}`, manager.title, ["Settings manager"], { type: "manager", managerId: manager.id })),
  ...PROVIDERS.map((provider) => compactSearchRecord(`provider.${provider.id}`, provider.name, ["provider", "account", "model", "installation"], { type: "manager", managerId: "providers", resourceId: provider.id })),
  ...SEARCH_ACTIONS.map((entry) => compactSearchRecord(`action.${entry.id}`, entry.title, entry.search || [], entry.destination))
]);

export function buildCompactSearchMetadata({ scaleFixtureCount = 0 } = {}) {
  const baseline = SEARCH_METADATA_REGISTRY.map((entry) => ({ ...entry, keywords: [...entry.keywords], destination: { ...entry.destination } }));
  if (!Number.isInteger(scaleFixtureCount) || scaleFixtureCount <= baseline.length) return baseline;
  const rows = [...baseline];
  for (let index = baseline.length; index < scaleFixtureCount; index += 1) {
    const source = baseline[index % baseline.length];
    const repeat = Math.floor(index / baseline.length);
    rows.push({ id: `scale.${repeat}.${source.id}`, title: `${source.title} ${repeat}`, keywords: [...source.keywords, "deterministic scale fixture"], destination: { ...source.destination } });
  }
  return rows;
}

// Compatibility adapter for the existing state worker. Its haystack is derived only
// from compact titles/keywords; raw provider, account, resource, log, or path bodies
// never enter search or prompt fixtures.
export function buildSearchIndex(options = {}) {
  return buildCompactSearchMetadata(options).map((entry) => {
    const destination = entry.destination;
    const targetType = destination.settingId ? "setting" : destination.managerId ? "manager" : destination.categoryId ? "category" : "action";
    const targetId = destination.settingId || destination.managerId || destination.categoryId || entry.id;
    return {
      kind: targetType === "setting" ? "Setting" : targetType === "manager" ? "Manager" : targetType === "category" ? "Destination" : "Action",
      id: entry.id,
      title: entry.title,
      subtitle: entry.keywords.slice(0, 2).join(" · "),
      targetType,
      targetId,
      categoryId: destination.categoryId,
      subcategoryId: destination.subcategoryId,
      destination,
      keywords: entry.keywords,
      haystack: [entry.title, ...entry.keywords].join(" ").toLowerCase()
    };
  });
}
