// fable Settings Bakeoff - shared demo dataset (window.PM_DATA).
// Inert data only: no DOM access, no functions, JSON-serializable throughout.
// Canonical setting rows carry src:"inventory" (Plans/settings_inventory.json);
// rows the packet required but the inventory lacks carry src:"packet-2026-08-05".
// Concepts must clone via PMState.init and never mutate this object directly.
(function () {
  'use strict';

  window.PM_DATA = {
    "version": "1.0.0",
    "generated": "2026-08-05T14:30:00-07:00",
    "taxonomy": [
      {
        "id": "general",
        "num": "1",
        "title": "General & Startup",
        "icon": "gear",
        "blurb": "How the app starts, how chat behaves, and how it gets your attention.",
        "subs": [
          {
            "id": "startup",
            "title": "Startup & windows",
            "blurb": "What Puppet Master restores when it opens.",
            "settingIds": [
              "general.startup.onboarding",
              "general.startup.restore-panel",
              "general.startup.window-state"
            ]
          },
          {
            "id": "chat-basics",
            "title": "Chat basics",
            "blurb": "Sending, following, and default assistant behavior.",
            "settingIds": [
              "general.interaction.assistant-mode",
              "general.interaction.submit-key",
              "general.interaction.auto-follow"
            ]
          },
          {
            "id": "notifications",
            "title": "Notifications",
            "blurb": "When and how the app interrupts you.",
            "settingIds": [
              "general.interaction.notifications-enabled"
            ]
          },
          {
            "id": "writing",
            "title": "Writing & spelling",
            "blurb": "The quiet spelling service for everything you type.",
            "settingIds": [
              "general.spellcheck.check",
              "general.spellcheck.language",
              "general.spellcheck.dictionary-source",
              "general.spellcheck.personal-dictionary",
              "general.spellcheck.project-dictionary",
              "general.spellcheck.technical-prose",
              "general.spellcheck.unknown-names",
              "general.spellcheck.language-packs",
              "general.spellcheck.overrides",
              "general.writing.grammar-assist"
            ]
          }
        ]
      },
      {
        "id": "appearance",
        "num": "2",
        "title": "Appearance & Layout",
        "icon": "palette",
        "blurb": "Themes, density, text size, and motion.",
        "subs": [
          {
            "id": "theme",
            "title": "Theme",
            "blurb": "Eight looks: Friendly, Glass, Retro, and Basic, in dark and light.",
            "settingIds": [
              "general.visual.theme",
              "general.visual.theme-mode",
              "general.visual.glass-background-mode",
              "general.visual.glass-transparency"
            ]
          },
          {
            "id": "layout",
            "title": "Layout & density",
            "blurb": "How much fits on screen at once.",
            "settingIds": [
              "general.visual.interface-density",
              "general.visual.ui-scale",
              "general.visual.font-size",
              "general.interaction.panel-dock"
            ]
          },
          {
            "id": "motion",
            "title": "Motion & accessibility",
            "blurb": "Calmer animation and higher contrast.",
            "settingIds": [
              "general.visual.reduce-animations",
              "general.visual.high-contrast"
            ]
          }
        ]
      },
      {
        "id": "agents",
        "num": "3",
        "title": "Agents, Models & Accounts",
        "icon": "brain",
        "blurb": "Which models do the work, which accounts pay for it, and what this conversation overrides.",
        "subs": [
          {
            "id": "routing",
            "title": "Default routing",
            "blurb": "The model and provider new work starts with.",
            "settingIds": [
              "ai.models.default-model",
              "ai.models.default-provider",
              "ai.models.default-variant",
              "ai.models.reasoning-effort",
              "ai.models.provider-fallback"
            ]
          },
          {
            "id": "accounts",
            "title": "Accounts & keys",
            "blurb": "Sign-ins, priority, and the separate API routes.",
            "settingIds": [
              "ai.accounts.default-account",
              "ai.accounts.account-priority",
              "ai.accounts.anthropic-api-key"
            ]
          },
          {
            "id": "thread",
            "title": "This conversation",
            "blurb": "Overrides that live and die with the current thread.",
            "settingIds": [
              "ai.models.thread-model-override",
              "ai.accounts.thread-account-override",
              "personas.library.active-persona",
              "ai.models.thread-effort-override",
              "ai.models.thread-speed-override",
              "safety.rules.thread-access-override",
              "branching.crew.thread-crew-override",
              "memory.assembly.thread-context-override"
            ]
          },
          {
            "id": "usage",
            "title": "Usage & budgets",
            "blurb": "Spend guardrails and pressure visibility. Detail lives on the Usage page.",
            "settingIds": [
              "ai.usage.monthly-spend-limit",
              "ai.usage.pressure-visibility"
            ]
          }
        ]
      },
      {
        "id": "permissions",
        "num": "4",
        "title": "Permissions & Safety",
        "icon": "shield",
        "blurb": "Access modes, approvals, FileSafe, and what stays sealed between projects.",
        "subs": [
          {
            "id": "access",
            "title": "Access mode",
            "blurb": "How independently agents may act.",
            "settingIds": [
              "safety.rules.access-mode",
              "safety.rules.permission-preset",
              "safety.rules.default-tool-permission"
            ]
          },
          {
            "id": "approvals",
            "title": "Approvals",
            "blurb": "What gets asked, and what an approval covers.",
            "settingIds": [
              "safety.approvals.external-publish-ask",
              "safety.approvals.approval-ladder-default",
              "safety.approvals.doom-loop-action"
            ]
          },
          {
            "id": "protection",
            "title": "File & command protection",
            "blurb": "Guards that hold regardless of mode.",
            "settingIds": [
              "safety.protection.bash-guard",
              "safety.protection.security-filter",
              "safety.protection.file-guard",
              "safety.protection.safe-point-restore",
              "safety.protection.allow-destructive"
            ]
          },
          {
            "id": "crossproject",
            "title": "Cross-project access",
            "blurb": "Off by default. Read and write are separate grants.",
            "settingIds": [
              "safety.crossproject.read-access",
              "safety.crossproject.write-access",
              "safety.crossproject.grant-duration",
              "safety.crossproject.child-inheritance"
            ]
          }
        ]
      },
      {
        "id": "code",
        "num": "5",
        "title": "Code, Editor & Terminal",
        "icon": "terminal",
        "blurb": "The terminal, the editor, and language smarts.",
        "subs": [
          {
            "id": "terminal",
            "title": "Terminal",
            "blurb": "Shell, type, and history. Full profiles live in the Terminal manager.",
            "settingIds": [
              "code.terminal.shell",
              "code.terminal.font-family",
              "code.terminal.font-size",
              "code.terminal.scrollback-limit"
            ]
          },
          {
            "id": "editor",
            "title": "Editor",
            "blurb": "Reading and diagnostics.",
            "settingIds": [
              "code.editing.word-wrap",
              "code.editing.line-numbers",
              "code.editing.diagnostics-visibility"
            ]
          },
          {
            "id": "language",
            "title": "Language smarts",
            "blurb": "Language servers and their limits.",
            "settingIds": [
              "code.editing.lsp-enabled",
              "code.editing.lsp-auto-restart",
              "code.editing.lsp-max-memory"
            ]
          }
        ]
      },
      {
        "id": "context",
        "num": "6",
        "title": "Context, Memory & History",
        "icon": "layers",
        "blurb": "What the Assistant remembers, and what actually enters each request.",
        "subs": [
          {
            "id": "memory",
            "title": "Assistant memory",
            "blurb": "Evidence-backed memories with verification and pinning.",
            "settingIds": [
              "memory.retention.enabled",
              "memory.retention.history-retention",
              "memory.retention.gist-review-filter",
              "memory.retention.subagent-access"
            ]
          },
          {
            "id": "budget",
            "title": "Context size & compaction",
            "blurb": "Keeping requests small without losing the thread.",
            "settingIds": [
              "memory.limits.auto-compress",
              "memory.limits.max-context-ktokens",
              "memory.limits.run-token-budget",
              "memory.limits.tool-result-policy"
            ]
          },
          {
            "id": "instructions",
            "title": "Instructions & prompt assembly",
            "blurb": "Rules, sources, and the diagnostic view of what got packed in.",
            "settingIds": [
              "memory.assembly.app-rules",
              "memory.assembly.project-rules",
              "memory.assembly.injected-context-breakdown",
              "memory.assembly.compiled-prompt-preview",
              "memory.assembly.parent-handoff",
              "memory.assembly.warn-route-change"
            ]
          }
        ]
      },
      {
        "id": "planning",
        "num": "7",
        "title": "Planning, Goals & Verification",
        "icon": "clipboard",
        "blurb": "Goal Mode ceilings, PRD interviews, and how finished work gets checked.",
        "subs": [
          {
            "id": "goal",
            "title": "Goal Mode",
            "blurb": "Configured ceilings next to live, sustainable capacity.",
            "settingIds": [
              "planning.goal.concurrency-ceiling",
              "planning.goal.sustainable-now",
              "planning.verification.goal-checkpoint-cadence",
              "planning.verification.goal-auto-resume",
              "planning.goal.reserve-policy"
            ]
          },
          {
            "id": "interview",
            "title": "PRD & interviews",
            "blurb": "How planning conversations run.",
            "settingIds": [
              "planning.interview.workflow-style",
              "planning.interview.plan-thoroughness",
              "planning.interview.web-research-mode"
            ]
          },
          {
            "id": "verification",
            "title": "Verification",
            "blurb": "Double-checking and independent review.",
            "settingIds": [
              "planning.verification.validation-pass",
              "planning.verification.strictness",
              "planning.verification.independent-review",
              "planning.verification.quality-preference"
            ]
          },
          {
            "id": "testing",
            "title": "Testing",
            "blurb": "Automated testing capability policy.",
            "settingIds": [
              "planning.testing.capability-policy"
            ]
          }
        ]
      },
      {
        "id": "collaboration",
        "num": "8",
        "title": "Git, Worktrees & Crew",
        "icon": "branch",
        "blurb": "Branches, isolated workspaces, helper agents, and Crew templates.",
        "subs": [
          {
            "id": "git",
            "title": "Git",
            "blurb": "Branching, merging, and pre-merge testing.",
            "settingIds": [
              "branching.worktrees.enable-git",
              "branching.worktrees.default-branch",
              "branching.worktrees.merge-strategy",
              "branching.worktrees.force-push-policy",
              "branching.worktrees.pre-merge-tests",
              "branching.worktrees.pre-merge-test-command"
            ]
          },
          {
            "id": "worktrees",
            "title": "Worktrees",
            "blurb": "Private workspaces per conversation.",
            "settingIds": [
              "branching.worktrees.provisioning",
              "branching.worktrees.port-collision",
              "branching.worktrees.worktree-cleanup"
            ]
          },
          {
            "id": "helpers",
            "title": "Helper agents & Crew",
            "blurb": "Parallel helpers and reusable Crew compositions.",
            "settingIds": [
              "branching.subagents.enable-subagents",
              "branching.subagents.max-parallel",
              "branching.crew.crew-enabled",
              "branching.crew.max-agents-per-crew"
            ]
          }
        ]
      },
      {
        "id": "extensions",
        "num": "9",
        "title": "Connections, Tools & Web",
        "icon": "puzzle",
        "blurb": "Tool servers, skills, plugins, commands, and web access.",
        "subs": [
          {
            "id": "mcp",
            "title": "Tool servers",
            "blurb": "MCP servers and how much of them each turn sees.",
            "settingIds": [
              "system.mcp.import-external",
              "system.mcp.lazy-exposure",
              "system.mcp.timeout"
            ]
          },
          {
            "id": "skills",
            "title": "Skills & plugins",
            "blurb": "Installed abilities and their lifecycle.",
            "settingIds": [
              "extensions.skills.discovery",
              "extensions.skills.auto-invocation",
              "extensions.plugins.auto-enable-new"
            ]
          },
          {
            "id": "commands",
            "title": "Commands",
            "blurb": "Shortcuts and command hints.",
            "settingIds": [
              "extensions.commands.shortcut-hints"
            ]
          },
          {
            "id": "web",
            "title": "Web access",
            "blurb": "Search, reading, and credit guardrails.",
            "settingIds": [
              "web.providers.web-search-enable",
              "web.fetch.pdf-mode",
              "web.fetch.cost-warning-threshold",
              "web.fetch.browser-save-session"
            ]
          }
        ]
      },
      {
        "id": "media",
        "num": "10",
        "title": "Media & Generation",
        "icon": "film",
        "blurb": "Images in, images out, voice, and where artifacts land.",
        "subs": [
          {
            "id": "capabilities",
            "title": "Capabilities",
            "blurb": "What may be generated at all.",
            "settingIds": [
              "media.capabilities.master",
              "media.capabilities.enabled-types",
              "media.capabilities.video"
            ]
          },
          {
            "id": "image",
            "title": "Image generation",
            "blurb": "The image route and its quality.",
            "settingIds": [
              "media.image.provider",
              "media.capabilities.image-quality"
            ]
          },
          {
            "id": "io",
            "title": "Input & output",
            "blurb": "Understanding media and keeping the results.",
            "settingIds": [
              "media.io.media-input",
              "media.io.voice-input",
              "media.io.vision-bridge",
              "media.io.artifact-retention"
            ]
          }
        ]
      },
      {
        "id": "system",
        "num": "11",
        "title": "System & Diagnostics",
        "icon": "wrench",
        "blurb": "Health checks, updates, logs, and retention.",
        "subs": [
          {
            "id": "health",
            "title": "Health",
            "blurb": "Automatic checkups and honest failure visibility.",
            "settingIds": [
              "system.health.auto-run",
              "system.health.check-frequency",
              "system.health.degraded-visibility",
              "system.health.telemetry"
            ]
          },
          {
            "id": "updates",
            "title": "Updates",
            "blurb": "App and catalog updates.",
            "settingIds": [
              "system.advanced.auto-update",
              "system.advanced.release-channel"
            ]
          },
          {
            "id": "maintenance",
            "title": "Maintenance & diagnostics",
            "blurb": "Debugging and history retention.",
            "settingIds": [
              "system.advanced.debug-mode",
              "system.advanced.log-verbosity",
              "system.advanced.runtime-history-days"
            ]
          }
        ]
      }
    ],
    "settings": {
      "general.startup.onboarding": {
        "id": "general.startup.onboarding",
        "label": "Show First-Run Tips",
        "desc": "Runs the welcome tour and shows guided tips for newcomers. Turns itself off once done; reset it from Health anytime.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "onboarding",
          "first run",
          "wizard",
          "tour",
          "welcome",
          "hints",
          "pending|in_progress|complete",
          "reset onboarding"
        ],
        "src": "inventory",
        "value": true
      },
      "general.startup.restore-panel": {
        "id": "general.startup.restore-panel",
        "label": "Panel To Open On Launch",
        "desc": "Which side panel greets you when a project opens \u2014 your last-used one, or always the same panel.",
        "type": "select",
        "default": "Last used",
        "scope": [
          "project"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "last active panel",
          "startup panel",
          "restore"
        ],
        "src": "inventory",
        "options": [
          "Last used",
          "Chat",
          "File Manager",
          "Source Control",
          "Artifacts"
        ],
        "value": "Last used"
      },
      "general.startup.window-state": {
        "id": "general.startup.window-state",
        "label": "Remember Window Layout",
        "desc": "Restores window size, position, panel widths, and splits exactly as you left them last time.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "window position",
          "maximized",
          "split ratios",
          "persistence"
        ],
        "src": "inventory",
        "value": true
      },
      "general.interaction.assistant-mode": {
        "id": "general.interaction.assistant-mode",
        "label": "Default Assistant Mode",
        "desc": "What the assistant starts in: Ask only answers, Agent makes changes, Debug diagnoses, Plan and Deep Plan think first.",
        "type": "select",
        "default": "Agent",
        "scope": [
          "run"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "mode strip",
          "read-only",
          "planning",
          "chat mode"
        ],
        "src": "inventory",
        "options": [
          "Ask",
          "Agent",
          "Debug",
          "Plan",
          "Deep Plan"
        ],
        "value": "Agent",
        "scopeNote": "Applies to new conversations. The current conversation keeps its own mode."
      },
      "general.interaction.submit-key": {
        "id": "general.interaction.submit-key",
        "label": "Send Message Key",
        "desc": "Which key sends your chat message. Pick Enter for speed, or Ctrl+Enter to avoid sending half-typed thoughts.",
        "type": "select",
        "default": "Ctrl+Enter",
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "custom",
        "flags": {},
        "search": [
          "keybinding",
          "submit",
          "composer",
          "shortcut"
        ],
        "src": "inventory",
        "options": [
          "Enter",
          "Ctrl+Enter",
          "Cmd+Enter"
        ],
        "value": "Cmd+Enter"
      },
      "general.interaction.auto-follow": {
        "id": "general.interaction.auto-follow",
        "label": "Follow New Messages",
        "desc": "Keeps chat scrolled to the newest message. If you scroll up to read, a jump-to-latest badge appears instead.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "auto scroll",
          "jump to latest",
          "stick to bottom"
        ],
        "src": "inventory",
        "value": true
      },
      "general.interaction.notifications-enabled": {
        "id": "general.interaction.notifications-enabled",
        "label": "Notifications",
        "desc": "Master switch for all alerts. Turn off for total quiet \u2014 you'll have to check the app yourself for approvals.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "alerts",
          "toast",
          "banner",
          "master enable",
          "do not disturb"
        ],
        "src": "inventory",
        "value": true
      },
      "general.spellcheck.check": {
        "id": "general.spellcheck.check",
        "label": "Check spelling",
        "desc": "Quietly underlines likely misspellings in things you write - chat messages, PRD answers, and planning notes. It never changes a word on its own and never sends your text to an AI provider.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global",
          "project",
          "thread"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "spelling",
          "spellcheck",
          "dictionary",
          "typo",
          "underline",
          "proofread",
          "writing"
        ],
        "src": "packet-2026-08-05",
        "value": true
      },
      "general.spellcheck.language": {
        "id": "general.spellcheck.language",
        "label": "Language",
        "desc": "Which language the spelling service checks against. Automatic follows your system language and switches when a draft is clearly in another installed language.",
        "type": "select",
        "default": "Automatic",
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "auto",
        "flags": {},
        "search": [
          "spelling",
          "spellcheck",
          "dictionary",
          "typo",
          "underline",
          "proofread",
          "locale",
          "language"
        ],
        "src": "packet-2026-08-05",
        "options": [
          "Automatic",
          "English (US)",
          "English (UK)",
          "German",
          "French",
          "Spanish"
        ],
        "value": "Automatic"
      },
      "general.spellcheck.dictionary-source": {
        "id": "general.spellcheck.dictionary-source",
        "label": "Dictionary source",
        "desc": "Where word lists come from. Automatic prefers the operating system's spelling service and falls back to Puppet Master's local dictionaries when the system service is unavailable.",
        "type": "select",
        "default": "Automatic",
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "auto",
        "flags": {},
        "search": [
          "spelling",
          "spellcheck",
          "dictionary",
          "typo",
          "underline",
          "proofread",
          "system",
          "local"
        ],
        "src": "packet-2026-08-05",
        "options": [
          "Automatic",
          "System dictionaries only",
          "PM local dictionaries only"
        ],
        "value": "Automatic"
      },
      "general.spellcheck.personal-dictionary": {
        "id": "general.spellcheck.personal-dictionary",
        "label": "Personal dictionary",
        "desc": "Words you have added so they are never flagged again, in any project. Names, product terms, and jargon usually end up here.",
        "type": "action",
        "default": "Manage",
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "spelling",
          "spellcheck",
          "dictionary",
          "typo",
          "underline",
          "proofread",
          "personal",
          "custom words"
        ],
        "src": "packet-2026-08-05",
        "value": "Manage"
      },
      "general.spellcheck.project-dictionary": {
        "id": "general.spellcheck.project-dictionary",
        "label": "Project dictionary",
        "desc": "A word list stored with this project and shared with everyone who opens it. Useful for project-specific names like PlanUnit or Fableicon.",
        "type": "select",
        "default": "Use when available",
        "scope": [
          "project"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "spelling",
          "spellcheck",
          "dictionary",
          "typo",
          "underline",
          "proofread",
          "project",
          "shared"
        ],
        "src": "packet-2026-08-05",
        "options": [
          "Use when available",
          "Off"
        ],
        "value": "Use when available"
      },
      "general.spellcheck.technical-prose": {
        "id": "general.spellcheck.technical-prose",
        "label": "Check technical prose",
        "desc": "Also check prose that sits close to code, such as commit messages and inline comments you write by hand. Code itself, paths, and identifiers are always skipped.",
        "type": "toggle",
        "default": false,
        "scope": [
          "global"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {},
        "search": [
          "spelling",
          "spellcheck",
          "dictionary",
          "typo",
          "underline",
          "proofread",
          "technical",
          "commit"
        ],
        "src": "packet-2026-08-05",
        "value": false
      },
      "general.spellcheck.unknown-names": {
        "id": "general.spellcheck.unknown-names",
        "label": "Underline unknown names",
        "desc": "Flag capitalized words that look like names but are not in any dictionary. Off by default because most projects are full of intentional invented names.",
        "type": "toggle",
        "default": false,
        "scope": [
          "global"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {},
        "search": [
          "spelling",
          "spellcheck",
          "dictionary",
          "typo",
          "underline",
          "proofread",
          "names",
          "proper nouns"
        ],
        "src": "packet-2026-08-05",
        "value": false
      },
      "general.spellcheck.language-packs": {
        "id": "general.spellcheck.language-packs",
        "label": "Additional installed language packs",
        "desc": "Extra language dictionaries installed for offline checking. English (US) ships built in; other packs download on demand.",
        "type": "action",
        "default": "Manage",
        "scope": [
          "global"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {},
        "search": [
          "spelling",
          "spellcheck",
          "dictionary",
          "typo",
          "underline",
          "proofread",
          "packs",
          "download"
        ],
        "src": "packet-2026-08-05",
        "value": "Manage"
      },
      "general.spellcheck.overrides": {
        "id": "general.spellcheck.overrides",
        "label": "Thread and project overrides",
        "desc": "Places where spellcheck has been turned off for one conversation or one project. A conversation's overflow menu can disable it there without touching this global setting.",
        "type": "action",
        "default": "Manage",
        "scope": [
          "global"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {},
        "search": [
          "spelling",
          "spellcheck",
          "dictionary",
          "typo",
          "underline",
          "proofread",
          "override",
          "disable"
        ],
        "src": "packet-2026-08-05",
        "value": "Manage"
      },
      "general.visual.theme": {
        "id": "general.visual.theme",
        "label": "Theme",
        "desc": "Changes the whole app's look and colors instantly - no restart needed. Picks one of eight looks: Friendly, Glass, Retro, and Basic, each in dark and light; the Theme Mode control (Light/Dark/Auto) decides whether the dark or light look of the chosen family is shown.",
        "type": "select",
        "default": "Friendly Dark",
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "appearance",
          "dark mode",
          "light mode",
          "skin",
          "system theme",
          "color scheme",
          "friendly",
          "glass",
          "liquid glass",
          "retro",
          "basic"
        ],
        "src": "inventory",
        "options": [
          "Friendly Dark",
          "Friendly Light",
          "Glass Dark",
          "Glass Light",
          "Retro Dark",
          "Retro Light",
          "Basic Dark",
          "Basic Light"
        ],
        "value": "Friendly Dark"
      },
      "general.visual.theme-mode": {
        "id": "general.visual.theme-mode",
        "label": "Theme Mode",
        "desc": "Picks light, dark, or follow-your-computer coloring for the selected theme family. Auto follows the operating system appearance (prefers-color-scheme) and switches live when the OS setting changes.",
        "type": "select",
        "default": "Auto",
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "prefers-color-scheme",
          "system theme",
          "dark mode",
          "light mode",
          "appearance",
          "auto",
          "follow computer",
          "color scheme"
        ],
        "src": "inventory",
        "options": [
          "Light",
          "Dark",
          "Auto"
        ],
        "value": "Auto"
      },
      "general.visual.glass-background-mode": {
        "id": "general.visual.glass-background-mode",
        "label": "Glass Background",
        "desc": "What shows behind the glass panels in Glass themes: Mesh is a slowly drifting color gradient, Depth adds floating soft shapes with gentle parallax, Minimal keeps a calm flat backdrop. Applies instantly.",
        "type": "select",
        "default": "Mesh",
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "mesh",
          "depth",
          "minimal",
          "wallpaper",
          "backdrop",
          "parallax",
          "glass background"
        ],
        "src": "inventory",
        "options": [
          "Mesh",
          "Depth",
          "Minimal"
        ],
        "value": "Mesh"
      },
      "general.visual.glass-transparency": {
        "id": "general.visual.glass-transparency",
        "label": "Glass Transparency",
        "desc": "How see-through glass panels are. Every theme keeps a readability floor - dark glass never drops below 0.35, light glass never below 0.45 - so text stays legible. Only adjustable while a Glass theme is active.",
        "type": "slider",
        "default": 0.55,
        "scope": [
          "global"
        ],
        "exposure": "unavailable",
        "valueSource": "default",
        "flags": {},
        "search": [
          "glass alpha",
          "translucency",
          "opacity",
          "blur",
          "see-through",
          "frosted"
        ],
        "src": "inventory",
        "value": 0.55,
        "unavailableReason": "Only applies while a Glass theme is active. Switch the theme to Glass Dark or Glass Light to adjust transparency."
      },
      "general.visual.interface-density": {
        "id": "general.visual.interface-density",
        "label": "Interface Density",
        "desc": "How tightly packed the interface is. Auto adapts to your window size, Comfortable gives everything room to breathe, Compact fits more on screen. Applies instantly.",
        "type": "select",
        "default": "Auto",
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "auto",
        "flags": {},
        "search": [
          "compact mode",
          "spacing",
          "padding",
          "cozy",
          "density",
          "auto"
        ],
        "src": "inventory",
        "options": [
          "Auto",
          "Comfortable",
          "Compact"
        ],
        "value": "Auto",
        "scopeNote": "Automatic picks Comfortable on large displays and Compact below 900 px."
      },
      "general.visual.ui-scale": {
        "id": "general.visual.ui-scale",
        "label": "UI Scale",
        "desc": "Makes everything in the app bigger or smaller. Handy on high-resolution screens or if text feels cramped.",
        "type": "slider",
        "default": "100%",
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "zoom",
          "75%",
          "90%",
          "110%",
          "magnify",
          "display size"
        ],
        "src": "inventory",
        "value": "100%"
      },
      "general.visual.font-size": {
        "id": "general.visual.font-size",
        "label": "Text Size",
        "desc": "Base size for text across the app. Bump it up if you find yourself leaning toward the screen.",
        "type": "number",
        "default": 14,
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "font size",
          "base font",
          "font scale",
          "15px",
          "readability"
        ],
        "src": "inventory",
        "value": 14
      },
      "general.interaction.panel-dock": {
        "id": "general.interaction.panel-dock",
        "label": "Panel Position",
        "desc": "Whether side panels like Chat and File Manager sit docked to an edge or float as separate windows, per project.",
        "type": "select",
        "default": "Docked",
        "scope": [
          "project"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "dock state",
          "floating window",
          "detach",
          "layout"
        ],
        "src": "inventory",
        "options": [
          "Docked",
          "Floating"
        ],
        "value": "Docked"
      },
      "general.visual.reduce-animations": {
        "id": "general.visual.reduce-animations",
        "label": "Reduce Animations",
        "desc": "Calms the interface: entrance animations, hover sheens, and background drift stop, while the app keeps working exactly the same. Applies instantly - helpful if movement is distracting or causes discomfort.",
        "type": "toggle",
        "default": false,
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "animations",
          "accessibility",
          "motion sickness",
          "transitions",
          "reduce motion",
          "calm"
        ],
        "src": "inventory",
        "value": false,
        "scopeNote": "Also follows the system-wide reduced motion preference automatically."
      },
      "general.visual.high-contrast": {
        "id": "general.visual.high-contrast",
        "label": "High Contrast Mode",
        "desc": "Boosts color contrast to meet accessibility standards. Works with the Basic theme; makes text and edges easier to see.",
        "type": "toggle",
        "default": false,
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "WCAG",
          "accessibility",
          "low vision",
          "contrast"
        ],
        "src": "inventory",
        "value": false
      },
      "ai.models.default-model": {
        "id": "ai.models.default-model",
        "label": "Default Model",
        "desc": "The model used when nothing more specific applies \u2014 chat, planning, research. Run and persona choices override it.",
        "type": "select",
        "default": "Claude Sonnet 4.5",
        "scope": [
          "global",
          "project",
          "persona",
          "run"
        ],
        "exposure": "standard",
        "valueSource": "custom",
        "flags": {},
        "search": [
          "default model",
          "model selection",
          "precedence",
          "requested vs effective",
          "per-chat",
          "plans-to-code"
        ],
        "src": "inventory",
        "options": [
          "Claude Sonnet 4.5",
          "Claude Opus 4.1",
          "GPT-5.2",
          "Gemini 3 Pro",
          "Qwen3 Coder 30B (local)"
        ],
        "value": "Claude Sonnet 4.5",
        "scopeNote": "Set explicitly for this project on Jul 29. The global default is also Claude Sonnet 4.5."
      },
      "ai.models.default-provider": {
        "id": "ai.models.default-provider",
        "label": "Default AI Provider",
        "desc": "Which AI company's service is tried first. Greyed-out entries are disconnected or missing a needed capability.",
        "type": "select",
        "default": "Claude",
        "scope": [
          "global",
          "project",
          "persona",
          "run"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "platform",
          "default platform",
          "provider ids vs platform names",
          "claude code",
          "family grouping",
          "requested platform"
        ],
        "src": "inventory",
        "options": [
          "Claude",
          "OpenAI Codex",
          "GitHub Copilot",
          "OpenRouter",
          "Antigravity CLI",
          "Local server (Ollama)"
        ],
        "value": "Claude"
      },
      "ai.models.default-variant": {
        "id": "ai.models.default-variant",
        "label": "Speed vs Power Preset",
        "desc": "A quick lever between fast-and-cheap and slow-and-thorough without changing which model is picked.",
        "type": "select",
        "default": "Default",
        "scope": [
          "global",
          "project",
          "persona",
          "run"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "variant",
          "balanced",
          "preset",
          "cycling",
          "model variant"
        ],
        "src": "inventory",
        "options": [
          "Default",
          "Fast",
          "Powerful",
          "Custom"
        ],
        "value": "Default",
        "scopeNote": "Fast is offered only for models that genuinely ship a fast variant."
      },
      "ai.models.reasoning-effort": {
        "id": "ai.models.reasoning-effort",
        "label": "Thinking Depth",
        "desc": "How hard models think before answering. Deeper is smarter but slower and pricier; the app shows what was actually honored.",
        "type": "select",
        "default": "Automatic",
        "scope": [
          "global",
          "project",
          "persona",
          "run"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "reasoning effort",
          "thinking",
          "extended thinking",
          "auto default alternative",
          "honored skipped clamped",
          "off auto on"
        ],
        "src": "inventory",
        "options": [
          "Automatic",
          "Off",
          "Low",
          "Medium",
          "High"
        ],
        "value": "Automatic"
      },
      "ai.models.provider-fallback": {
        "id": "ai.models.provider-fallback",
        "label": "Fall Back When Provider Is Down",
        "desc": "If your first-choice provider is unavailable, quietly try the next in line instead of failing the run.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {},
        "search": [
          "provider fallback",
          "auto fallback",
          "unavailable"
        ],
        "src": "inventory",
        "value": true
      },
      "ai.accounts.default-account": {
        "id": "ai.accounts.default-account",
        "label": "Default Account Per Provider",
        "desc": "When a provider has several accounts, this one is used first. Health, cooldowns, and reset times show next to each choice.",
        "type": "select",
        "default": "Automatic (highest priority)",
        "scope": [
          "provider",
          "project",
          "global",
          "run"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "account selection",
          "preferred account",
          "requested vs effective",
          "switch reason"
        ],
        "src": "inventory",
        "options": [
          "Automatic (highest priority)",
          "Pick per provider"
        ],
        "value": "Automatic (highest priority)"
      },
      "ai.accounts.account-priority": {
        "id": "ai.accounts.account-priority",
        "label": "Account Priority Order",
        "desc": "Lower numbers get picked first. Ties go to the account already doing the work, so runs stay stable.",
        "type": "number",
        "default": 1,
        "scope": [
          "account"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {},
        "search": [
          "ordered fallback",
          "sticky routing",
          "priority"
        ],
        "src": "inventory",
        "value": 1,
        "scopeNote": "Order is managed per provider in the Providers manager; this number is the account's rank within its provider."
      },
      "ai.accounts.anthropic-api-key": {
        "id": "ai.accounts.anthropic-api-key",
        "label": "Anthropic API Key",
        "desc": "Key for direct Anthropic access and Claude usage reporting. Shown redacted; stored in your keychain, never in config files.",
        "type": "text",
        "default": "",
        "scope": [
          "account",
          "global"
        ],
        "exposure": "advanced",
        "valueSource": "not-configured",
        "flags": {
          "privacy": true
        },
        "search": [
          "ANTHROPIC_API_KEY",
          "claude admin api",
          "secret"
        ],
        "src": "inventory",
        "value": "",
        "scopeNote": "No key stored. The Claude CLI sign-in does not need one; add a key only for the direct API route."
      },
      "ai.usage.monthly-spend-limit": {
        "id": "ai.usage.monthly-spend-limit",
        "label": "Monthly Spend Limit (USD)",
        "desc": "A dollar ceiling for the month. What happens at the limit is set by the budget policy below. 0 means unlimited.",
        "type": "number",
        "default": 0,
        "scope": [
          "global",
          "project",
          "account"
        ],
        "exposure": "advanced",
        "valueSource": "custom",
        "flags": {
          "cost": true
        },
        "search": [
          "spend cap",
          "token spend limit",
          "monthly limit",
          "rate-limit notifications"
        ],
        "src": "inventory",
        "value": 250,
        "scopeNote": "Applies to metered API routes only. Plan-included usage is governed by each provider's own limits."
      },
      "ai.usage.pressure-visibility": {
        "id": "ai.usage.pressure-visibility",
        "label": "Show Usage Pressure Warnings",
        "desc": "Surfaces little pressure indicators when accounts get close to limits, before anything actually stops.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "account pressure visibility",
          "usage pressure",
          "indicators"
        ],
        "src": "inventory",
        "value": true
      },
      "ai.models.thread-model-override": {
        "id": "ai.models.thread-model-override",
        "label": "Model for this conversation",
        "desc": "Overrides the default model for this conversation only. New conversations keep using the project default. Applies to this conversation only and never changes project or global defaults.",
        "type": "select",
        "default": "Use the project default",
        "scope": [
          "thread"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "thread",
          "conversation",
          "model",
          "override",
          "switch model"
        ],
        "src": "packet-2026-08-05",
        "options": [
          "Use the project default",
          "Claude Sonnet 4.5",
          "Claude Opus 4.1",
          "GPT-5.2",
          "Gemini 3 Pro",
          "Qwen3 Coder 30B (local)"
        ],
        "value": "Use the project default"
      },
      "ai.accounts.thread-account-override": {
        "id": "ai.accounts.thread-account-override",
        "label": "Account for this conversation",
        "desc": "Which signed-in account this conversation uses. Automatic follows provider priority and never migrates a request that is already in flight. Applies to this conversation only and never changes project or global defaults.",
        "type": "select",
        "default": "Automatic (highest priority)",
        "scope": [
          "thread"
        ],
        "exposure": "standard",
        "valueSource": "auto",
        "flags": {},
        "search": [
          "thread",
          "conversation",
          "account",
          "override"
        ],
        "src": "packet-2026-08-05",
        "options": [
          "Automatic (highest priority)",
          "Jared - Personal Max",
          "Platyr Team",
          "Anthropic API - Platyr billing"
        ],
        "value": "Automatic (highest priority)"
      },
      "personas.library.active-persona": {
        "id": "personas.library.active-persona",
        "label": "Persona for This Chat",
        "desc": "Which character is speaking right now, and why it was chosen. Change it here or just ask for someone else in plain words.",
        "type": "select",
        "default": "Assistant",
        "scope": [
          "thread"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "current persona",
          "effective persona",
          "selection reason",
          "chat persona",
          "switch persona"
        ],
        "src": "inventory",
        "options": [
          "Assistant",
          "Collaborator",
          "General",
          "Overseer",
          "Researcher",
          "Explorer",
          "Bash",
          "Teacher"
        ],
        "value": "Assistant",
        "scopeNote": "Chat selection applies to the current conversation. Project and global defaults are separate, deliberate actions."
      },
      "ai.models.thread-effort-override": {
        "id": "ai.models.thread-effort-override",
        "label": "Thinking depth for this conversation",
        "desc": "How much reasoning effort the model spends in this conversation. Shown only for models that support selectable effort. Applies to this conversation only and never changes project or global defaults.",
        "type": "select",
        "default": "Use the model default",
        "scope": [
          "thread"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "thread",
          "effort",
          "reasoning",
          "thinking depth"
        ],
        "src": "packet-2026-08-05",
        "options": [
          "Use the model default",
          "Low",
          "Medium",
          "High"
        ],
        "value": "Use the model default"
      },
      "ai.models.thread-speed-override": {
        "id": "ai.models.thread-speed-override",
        "label": "Speed for this conversation",
        "desc": "Normal or Fast serving for this conversation. Fast appears only when the selected model genuinely offers a fast variant; it is never inferred from the model name. Applies to this conversation only and never changes project or global defaults.",
        "type": "select",
        "default": "Normal",
        "scope": [
          "thread"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "thread",
          "fast",
          "speed",
          "variant"
        ],
        "src": "packet-2026-08-05",
        "options": [
          "Normal",
          "Fast"
        ],
        "value": "Normal"
      },
      "safety.rules.thread-access-override": {
        "id": "safety.rules.thread-access-override",
        "label": "Access mode for this conversation",
        "desc": "Temporarily loosens or tightens the access mode for this conversation. Plan and Review remain effect-limited rather than tool-free. Applies to this conversation only and never changes project or global defaults.",
        "type": "radio",
        "default": "Use the project default",
        "scope": [
          "thread"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "thread",
          "access",
          "permission",
          "approval",
          "override"
        ],
        "src": "packet-2026-08-05",
        "options": [
          "Use the project default",
          "Full Access",
          "Auto",
          "Auto accept edits",
          "Ask for approval"
        ],
        "value": "Use the project default"
      },
      "branching.crew.thread-crew-override": {
        "id": "branching.crew.thread-crew-override",
        "label": "Crew for this conversation",
        "desc": "Attaches a Crew template to this conversation's goals. Selecting a Crew here never changes what other conversations run. Applies to this conversation only and never changes project or global defaults.",
        "type": "select",
        "default": "No crew",
        "scope": [
          "thread"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "thread",
          "crew",
          "team",
          "multi-agent"
        ],
        "src": "packet-2026-08-05",
        "options": [
          "No crew",
          "Feature build crew",
          "Docs sweep crew"
        ],
        "value": "No crew"
      },
      "memory.assembly.thread-context-override": {
        "id": "memory.assembly.thread-context-override",
        "label": "Context sources for this conversation",
        "desc": "Which optional context sources this conversation may draw from. The project defaults stay untouched. Applies to this conversation only and never changes project or global defaults.",
        "type": "multiselect",
        "default": [
          "Previous chats",
          "Project code",
          "Assistant memory"
        ],
        "scope": [
          "thread"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "thread",
          "context",
          "sources",
          "override"
        ],
        "src": "packet-2026-08-05",
        "options": [
          "Previous chats",
          "Project code",
          "Project logs",
          "Assistant memory",
          "Attempt journal"
        ],
        "value": [
          "Previous chats",
          "Project code",
          "Assistant memory"
        ]
      },
      "safety.rules.access-mode": {
        "id": "safety.rules.access-mode",
        "label": "Access mode",
        "desc": "How much the agents may do without checking in. Full Access runs tools and edits freely inside FileSafe rules; Auto runs safe actions and asks about risky ones; Auto accept edits approves file edits but asks about commands; Ask for approval checks before every consequential action.",
        "type": "radio",
        "default": "Auto",
        "scope": [
          "global",
          "project"
        ],
        "exposure": "standard",
        "valueSource": "custom",
        "flags": {},
        "search": [
          "access",
          "autonomy",
          "approval",
          "full access",
          "ask",
          "mode"
        ],
        "src": "packet-2026-08-05",
        "options": [
          "Full Access",
          "Auto",
          "Auto accept edits",
          "Ask for approval"
        ],
        "value": "Ask for approval",
        "scopeNote": "This project asks for approval; your global default is Auto."
      },
      "safety.rules.permission-preset": {
        "id": "safety.rules.permission-preset",
        "label": "Permission Preset",
        "desc": "One-click safety level. Read Only can't change anything; Plan can research and propose; Regular asks before risky steps; Full rarely asks.",
        "type": "select",
        "default": "Regular",
        "scope": [
          "global",
          "project"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "preset",
          "read only",
          "plan mode",
          "full auto",
          "restrictive",
          "balanced",
          "permissive",
          "standard",
          "strict",
          "safety level",
          "autonomy"
        ],
        "src": "inventory",
        "options": [
          "Read only",
          "Plan",
          "Regular",
          "Full access",
          "Custom"
        ],
        "value": "Regular"
      },
      "safety.rules.default-tool-permission": {
        "id": "safety.rules.default-tool-permission",
        "label": "Default Answer for New Tools",
        "desc": "What happens when the AI uses a tool with no rule yet: allow it, ask you first, or block it. 'Ask' keeps you in control.",
        "type": "select",
        "default": "Ask",
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "fallback",
          "wildcard",
          "default permission",
          "unknown tool",
          "global default"
        ],
        "src": "inventory",
        "options": [
          "Allow",
          "Ask",
          "Deny"
        ],
        "value": "Ask"
      },
      "safety.approvals.external-publish-ask": {
        "id": "safety.approvals.external-publish-ask",
        "label": "Always Ask Before Publishing",
        "desc": "Anything that pushes outside your machine \u2014 Docker Hub, servers, releases \u2014 always needs your OK. No access mode can skip this.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "publish",
          "dockerhub",
          "unraid",
          "deploy",
          "external side effect",
          "non-bypassable",
          "remote"
        ],
        "src": "inventory",
        "value": true
      },
      "safety.approvals.approval-ladder-default": {
        "id": "safety.approvals.approval-ladder-default",
        "label": "Default Approval Choice",
        "desc": "When you approve something, how long it stays approved: just this once, for this session, or always. 'Always' creates a lasting rule.",
        "type": "select",
        "default": "Approve once",
        "scope": [
          "global",
          "run"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {},
        "search": [
          "approval ladder",
          "once",
          "for session",
          "always",
          "session cache",
          "durable rule",
          "approve and add"
        ],
        "src": "inventory",
        "options": [
          "Deny",
          "Approve once",
          "Approve for this session",
          "Always approve"
        ],
        "value": "Approve once"
      },
      "safety.approvals.doom-loop-action": {
        "id": "safety.approvals.doom-loop-action",
        "label": "When the AI Repeats Itself",
        "desc": "If the AI runs the exact same action over and over, stop and ask you, let it continue, or block it. Catches stuck loops early.",
        "type": "select",
        "default": "Ask",
        "scope": [
          "global",
          "project"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {},
        "search": [
          "doom loop",
          "repeated call",
          "stuck",
          "identical input",
          "loop guard"
        ],
        "src": "inventory",
        "options": [
          "Allow",
          "Ask",
          "Deny"
        ],
        "value": "Ask"
      },
      "safety.protection.bash-guard": {
        "id": "safety.protection.bash-guard",
        "label": "Block Dangerous Commands",
        "desc": "Stops commands that could wipe files or databases (rm -rf, drop database) before they run. Leave this on.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "filesafe",
          "bash guard",
          "destructive commands",
          "blocklist",
          "rm -rf",
          "drop database",
          "PUPPET_MASTER_ALLOW_DESTRUCTIVE"
        ],
        "src": "inventory",
        "value": true
      },
      "safety.protection.security-filter": {
        "id": "safety.protection.security-filter",
        "label": "Protect Secret Files",
        "desc": "Blocks the AI from touching passwords, .env files, API keys, and SSH keys. Turning this off exposes your credentials.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global"
        ],
        "exposure": "managed",
        "valueSource": "managed",
        "flags": {},
        "search": [
          "filesafe",
          "security filter",
          "sensitive files",
          ".env",
          "credentials",
          "ssh keys",
          "secrets"
        ],
        "src": "inventory",
        "value": true,
        "managedReason": "Managed by the Platyr workspace policy. An administrator can change it from the org console."
      },
      "safety.protection.file-guard": {
        "id": "safety.protection.file-guard",
        "label": "Keep Writes Inside the Plan",
        "desc": "The AI may only change files that the current piece of work declared it would touch. Prevents surprise edits elsewhere.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "filesafe",
          "file guard",
          "write scope",
          "declared files",
          "scope enforcement"
        ],
        "src": "inventory",
        "value": true
      },
      "safety.protection.safe-point-restore": {
        "id": "safety.protection.safe-point-restore",
        "label": "Roll Back When You Reject",
        "desc": "When you reject a change, work restarts from the last known-good restore point instead of on top of the bad attempt.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {},
        "search": [
          "safe point",
          "restore",
          "rollback",
          "retry from safe point",
          "backup",
          "reject"
        ],
        "src": "inventory",
        "value": true
      },
      "safety.protection.allow-destructive": {
        "id": "safety.protection.allow-destructive",
        "label": "Allow Dangerous Commands (Override)",
        "desc": "Master override that lets rm, dd, and similar commands through the blocklist. Requires explicit confirmation. Keep off.",
        "type": "toggle",
        "default": false,
        "scope": [
          "global",
          "project"
        ],
        "exposure": "expert",
        "valueSource": "default",
        "flags": {
          "safety": true
        },
        "search": [
          "allow destructive",
          "override",
          "rm",
          "dd",
          "mkfs",
          "truncate",
          "PUPPET_MASTER_ALLOW_DESTRUCTIVE",
          "master override"
        ],
        "src": "inventory",
        "value": false,
        "riskNote": "Lets agents run commands that can delete data. Leave off unless you are recovering from a specific blocked operation."
      },
      "safety.crossproject.read-access": {
        "id": "safety.crossproject.read-access",
        "label": "Other projects can be read",
        "desc": "Whether agents working in this project may read files and threads from your other Puppet Master projects. Off keeps every project sealed from the others.",
        "type": "select",
        "default": "Off",
        "scope": [
          "global",
          "project"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {
          "privacy": true
        },
        "search": [
          "cross-project",
          "read",
          "other projects",
          "isolation"
        ],
        "src": "packet-2026-08-05",
        "options": [
          "Off",
          "Ask each time",
          "Allowed for named projects"
        ],
        "value": "Off"
      },
      "safety.crossproject.write-access": {
        "id": "safety.crossproject.write-access",
        "label": "Other projects can be changed",
        "desc": "Whether agents here may write into another project. Kept separate from read access on purpose: granting one never grants the other.",
        "type": "select",
        "default": "Off",
        "scope": [
          "global",
          "project"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {
          "safety": true
        },
        "search": [
          "cross-project",
          "write",
          "other projects",
          "isolation"
        ],
        "src": "packet-2026-08-05",
        "options": [
          "Off",
          "Ask each time",
          "Allowed for named projects"
        ],
        "value": "Off"
      },
      "safety.crossproject.grant-duration": {
        "id": "safety.crossproject.grant-duration",
        "label": "How long a cross-project grant lasts",
        "desc": "When you approve cross-project access, this decides how long the approval holds before PM asks again.",
        "type": "select",
        "default": "This request only",
        "scope": [
          "global"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {},
        "search": [
          "cross-project",
          "grant",
          "duration",
          "persistent"
        ],
        "src": "packet-2026-08-05",
        "options": [
          "This request only",
          "This conversation",
          "This goal",
          "Persistent for named project pairs"
        ],
        "value": "This request only"
      },
      "safety.crossproject.child-inheritance": {
        "id": "safety.crossproject.child-inheritance",
        "label": "Helper agents inherit cross-project grants",
        "desc": "Whether a helper agent spawned during a granted task inherits the parent's cross-project access, or must be granted separately.",
        "type": "toggle",
        "default": false,
        "scope": [
          "global"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {},
        "search": [
          "cross-project",
          "inherit",
          "children",
          "helpers"
        ],
        "src": "packet-2026-08-05",
        "value": false
      },
      "code.terminal.shell": {
        "id": "code.terminal.shell",
        "label": "Shell",
        "desc": "Which command-line program runs inside new terminal panes. Leave on system default unless you know you want another.",
        "type": "select",
        "default": "System Default",
        "scope": [
          "global",
          "project"
        ],
        "exposure": "standard",
        "valueSource": "inherited",
        "flags": {},
        "search": [
          "shell profile",
          "zsh",
          "bash",
          "default shell"
        ],
        "src": "inventory",
        "options": [
          "System Default",
          "zsh",
          "bash",
          "fish",
          "PowerShell"
        ],
        "value": "zsh",
        "recommended": "System Default",
        "scopeNote": "Inherited from your global settings. This project has no shell override."
      },
      "code.terminal.font-family": {
        "id": "code.terminal.font-family",
        "label": "Terminal Font",
        "desc": "Typeface used in terminal panes. Custom fonts load from your fonts folder; changing family needs an app restart.",
        "type": "select",
        "default": "System Monospace",
        "scope": [
          "global",
          "project"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "monospace",
          "typeface",
          "terminal font family"
        ],
        "src": "inventory",
        "options": [
          "System Monospace",
          "JetBrains Mono",
          "Fira Code",
          "SF Mono",
          "Custom\u2026"
        ],
        "value": "System Monospace"
      },
      "code.terminal.font-size": {
        "id": "code.terminal.font-size",
        "label": "Terminal Text Size",
        "desc": "How big terminal text appears, in pixels. You can also zoom in and out with keyboard shortcuts.",
        "type": "number",
        "default": 12,
        "scope": [
          "global",
          "project"
        ],
        "exposure": "standard",
        "valueSource": "custom",
        "flags": {},
        "search": [
          "font size",
          "zoom",
          "pixels"
        ],
        "src": "inventory",
        "value": 14
      },
      "code.terminal.scrollback-limit": {
        "id": "code.terminal.scrollback-limit",
        "label": "Scrollback Lines",
        "desc": "Maximum lines of output kept in memory per terminal. Lower numbers use less memory on chatty commands.",
        "type": "number",
        "default": 10000,
        "scope": [
          "project"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {},
        "search": [
          "scrollback",
          "buffer",
          "memory"
        ],
        "src": "inventory",
        "value": 10000
      },
      "code.editing.word-wrap": {
        "id": "code.editing.word-wrap",
        "label": "Wrap Long Lines",
        "desc": "Folds long lines so you never scroll sideways. Off is the norm for code; on is comfier for prose.",
        "type": "toggle",
        "default": false,
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "word wrap",
          "line wrapping"
        ],
        "src": "inventory",
        "value": false
      },
      "code.editing.line-numbers": {
        "id": "code.editing.line-numbers",
        "label": "Line Numbers",
        "desc": "Shows a number next to every line so chat, diffs, and error messages can point you to the exact spot.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "gutter",
          "go to line"
        ],
        "src": "inventory",
        "value": true
      },
      "code.editing.diagnostics-visibility": {
        "id": "code.editing.diagnostics-visibility",
        "label": "Problem Highlighting",
        "desc": "Which code problems get flagged in the editor and problems panel. Docs disagreed on the control style; this level picker is kept.",
        "type": "select",
        "default": "Warnings & Errors",
        "scope": [
          "global",
          "project"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "diagnostics",
          "severity",
          "squiggles",
          "problems panel"
        ],
        "src": "inventory",
        "options": [
          "Off",
          "Errors Only",
          "Warnings & Errors",
          "Everything"
        ],
        "value": "Warnings & Errors"
      },
      "code.editing.lsp-enabled": {
        "id": "code.editing.lsp-enabled",
        "label": "Language Smarts",
        "desc": "Turns on language servers: error checking, hover explanations, autocomplete, and jump-to-definition while you browse code.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global",
          "project"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "LSP",
          "language server",
          "intellisense",
          "autocomplete",
          "per-language"
        ],
        "src": "inventory",
        "value": true
      },
      "code.editing.lsp-auto-restart": {
        "id": "code.editing.lsp-auto-restart",
        "label": "Restart Crashed Servers",
        "desc": "Automatically brings a language server back if it crashes, so error checking quietly keeps working.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {},
        "search": [
          "auto-restart",
          "crash recovery"
        ],
        "src": "inventory",
        "value": true
      },
      "code.editing.lsp-max-memory": {
        "id": "code.editing.lsp-max-memory",
        "label": "Server Memory Limit (MB)",
        "desc": "Maximum memory each language server may use before being reined in. Protects the rest of your machine.",
        "type": "number",
        "default": 512,
        "scope": [
          "global"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {
          "perf": true
        },
        "search": [
          "max memory",
          "resource limit"
        ],
        "src": "inventory",
        "value": 512
      },
      "memory.retention.enabled": {
        "id": "memory.retention.enabled",
        "label": "Remember Between Sessions",
        "desc": "Lets the assistant keep useful notes across conversations and projects. Turn off for a clean slate every time.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global",
          "project"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "assistant memory enabled",
          "persistent memory",
          "memory master toggle"
        ],
        "src": "inventory",
        "value": true
      },
      "memory.retention.history-retention": {
        "id": "memory.retention.history-retention",
        "label": "How Much History To Keep",
        "desc": "How much past conversation the assistant holds onto for this project \u2014 nothing, just recent, everything, or a custom window.",
        "type": "select",
        "default": "Full",
        "scope": [
          "project"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "retention",
          "conversation history",
          "keep history"
        ],
        "src": "inventory",
        "options": [
          "None",
          "Recent",
          "Full",
          "Custom"
        ],
        "value": "Full"
      },
      "memory.retention.gist-review-filter": {
        "id": "memory.retention.gist-review-filter",
        "label": "Memory Review Starting View",
        "desc": "Which memories the review panel shows first when opened. Starting on unconfirmed notes keeps your attention where it matters.",
        "type": "select",
        "default": "Unverified",
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "gist review default filter",
          "memory panel"
        ],
        "src": "inventory",
        "options": [
          "Unverified",
          "Verified",
          "Pinned",
          "All"
        ],
        "value": "Unverified"
      },
      "memory.retention.subagent-access": {
        "id": "memory.retention.subagent-access",
        "label": "Helpers Can Read Memory",
        "desc": "Lets helper agents see the main assistant's memories. Off keeps each helper's head empty of your history \u2014 the private default.",
        "type": "toggle",
        "default": false,
        "scope": [
          "global",
          "project"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {},
        "search": [
          "subagent memory access",
          "NullMemoryProvider",
          "parent memory"
        ],
        "src": "inventory",
        "value": false,
        "scopeNote": "Assistant preference memories stay Assistant-only either way; helpers see project facts, not your personal preferences."
      },
      "memory.limits.auto-compress": {
        "id": "memory.limits.auto-compress",
        "label": "Auto-Shrink Old Context",
        "desc": "Quietly summarizes stale context when space runs low so long runs keep going instead of hitting the ceiling.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global",
          "project"
        ],
        "exposure": "standard",
        "valueSource": "custom",
        "flags": {},
        "search": [
          "assistant context compression",
          "auto-prune",
          "staleness",
          "summarize"
        ],
        "src": "inventory",
        "value": false,
        "recommended": true,
        "scopeNote": "Turned off during the July context experiments. PM recommends turning it back on."
      },
      "memory.limits.max-context-ktokens": {
        "id": "memory.limits.max-context-ktokens",
        "label": "Max Context Size (kTokens)",
        "desc": "How big each run's working memory can grow. The app clamps this to what your chosen model actually supports.",
        "type": "number",
        "default": "",
        "scope": [
          "global",
          "project",
          "run"
        ],
        "exposure": "advanced",
        "valueSource": "auto",
        "flags": {
          "perf": true
        },
        "search": [
          "context window size",
          "token allocation",
          "provider limits",
          "kTokens"
        ],
        "src": "inventory",
        "value": "",
        "scopeNote": "Left automatic - clamped to the active model's maximum."
      },
      "memory.limits.run-token-budget": {
        "id": "memory.limits.run-token-budget",
        "label": "Per-Run Token Budget",
        "desc": "Caps how many tokens one run may spend before stopping for your OK. Separate from any monthly spending budget.",
        "type": "number",
        "default": 80000,
        "scope": [
          "global",
          "project",
          "account",
          "run"
        ],
        "exposure": "standard",
        "valueSource": "inherited",
        "flags": {},
        "search": [
          "token budget",
          "max estimated tokens",
          "run envelope",
          "unlimited",
          "spend cap"
        ],
        "src": "inventory",
        "value": 80000,
        "scopeNote": "Inherited from the global budget of 80,000 tokens per run."
      },
      "memory.limits.tool-result-policy": {
        "id": "memory.limits.tool-result-policy",
        "label": "Tool Output In Context",
        "desc": "Whether tool results go into context whole, summarized, as headers only, or not at all. Trimming saves space, loses detail.",
        "type": "select",
        "default": "Summarize",
        "scope": [
          "global"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {},
        "search": [
          "tool result context policy",
          "summarize tool output"
        ],
        "src": "inventory",
        "options": [
          "Full",
          "Summarize",
          "Metadata only",
          "Exclude"
        ],
        "value": "Summarize"
      },
      "memory.assembly.app-rules": {
        "id": "memory.assembly.app-rules",
        "label": "App-Wide Rules",
        "desc": "Standing instructions given to every agent run in every project. Seeded from your AGENTS.md the first time you launch.",
        "type": "text",
        "default": "Seeded from AGENTS.md on first run",
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "AGENTS.md",
          "application rules",
          "global instructions",
          "system prompt"
        ],
        "src": "inventory",
        "value": "Seeded from AGENTS.md on first run"
      },
      "memory.assembly.project-rules": {
        "id": "memory.assembly.project-rules",
        "label": "Project Rules",
        "desc": "Extra instructions that apply only to this project. Stored in .puppet-master/project-rules.md so they travel with the repo.",
        "type": "text",
        "default": "",
        "scope": [
          "project"
        ],
        "exposure": "standard",
        "valueSource": "custom",
        "flags": {},
        "search": [
          "project-rules.md",
          "scoped AGENTS.md",
          "per-project instructions"
        ],
        "src": "inventory",
        "value": "Planning-phase rules: edits stay inside Plans/; derived shards are read-only."
      },
      "memory.assembly.injected-context-breakdown": {
        "id": "memory.assembly.injected-context-breakdown",
        "label": "Show What Got Packed In",
        "desc": "Lists every file and note injected into a run with its size, so you can see exactly what the AI was given.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "injected context breakdown",
          "byte counts",
          "context paths",
          "transparency"
        ],
        "src": "inventory",
        "value": true
      },
      "memory.assembly.compiled-prompt-preview": {
        "id": "memory.assembly.compiled-prompt-preview",
        "label": "Show Final Prompt Preview",
        "desc": "Lets you peek at the fully assembled prompt (system prompt, persona, rules, journal) before it's sent. Handy for debugging odd behavior.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global"
        ],
        "exposure": "diagnostic",
        "valueSource": "default",
        "flags": {},
        "search": [
          "compiled prompt",
          "prompt preview",
          "assembly order",
          "attempt journal",
          "parent summary"
        ],
        "src": "inventory",
        "value": true,
        "scopeNote": "Diagnostic view. Large prompts render lazily to keep the app responsive."
      },
      "planning.goal.concurrency-ceiling": {
        "id": "planning.goal.concurrency-ceiling",
        "label": "Concurrent agents ceiling",
        "desc": "The most agents a Goal may run at once when capacity allows. This is a configured ceiling, not a promise: the live sustainable number below is what the Orchestrator actually grants right now.",
        "type": "number",
        "default": 4,
        "scope": [
          "global",
          "project",
          "goal"
        ],
        "exposure": "standard",
        "valueSource": "custom",
        "flags": {
          "cost": true,
          "perf": true
        },
        "search": [
          "concurrency",
          "parallel",
          "agents",
          "ceiling",
          "goal"
        ],
        "src": "packet-2026-08-05",
        "value": 8,
        "effective": 2,
        "effectiveReason": "Provider usage is close to its reset. Starting eight agents now is unlikely to finish before the provider resets; PM recommends two concurrent agents and three waves."
      },
      "planning.goal.sustainable-now": {
        "id": "planning.goal.sustainable-now",
        "label": "Sustainable right now",
        "desc": "The number of concurrent agents the Orchestrator can currently sustain, derived from live provider usage and reset timing. Read-only operational state; it updates on its own.",
        "type": "number",
        "default": 2,
        "scope": [
          "goal"
        ],
        "exposure": "managed",
        "valueSource": "managed",
        "flags": {},
        "search": [
          "sustainable",
          "capacity",
          "concurrency",
          "operational"
        ],
        "src": "packet-2026-08-05",
        "value": 2,
        "managedReason": "Live operational state from Usage and the Orchestrator. It changes as provider limits and reset timers change."
      },
      "planning.verification.goal-checkpoint-cadence": {
        "id": "planning.verification.goal-checkpoint-cadence",
        "label": "How Often To Save Progress",
        "desc": "How frequently goal mode snapshots its progress. More checkpoints mean safer recovery but slightly slower runs.",
        "type": "select",
        "default": "On milestone",
        "scope": [
          "project"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {},
        "search": [
          "goal mode checkpoint cadence"
        ],
        "src": "inventory",
        "options": [
          "Never",
          "On milestone",
          "Frequent",
          "Continuous"
        ],
        "value": "On milestone"
      },
      "planning.verification.goal-auto-resume": {
        "id": "planning.verification.goal-auto-resume",
        "label": "Pick Up Where It Left Off",
        "desc": "After a crash or restart, long-running goals resume from their last checkpoint instead of starting over.",
        "type": "toggle",
        "default": true,
        "scope": [
          "project"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {},
        "search": [
          "goal mode auto-resume",
          "crash recovery checkpoint"
        ],
        "src": "inventory",
        "value": true
      },
      "planning.interview.workflow-style": {
        "id": "planning.interview.workflow-style",
        "label": "Interview Style",
        "desc": "Guided walks you through set steps; freeform lets you talk naturally; hybrid adapts. Guided is safest if you're new.",
        "type": "select",
        "default": "Guided",
        "scope": [
          "global",
          "project"
        ],
        "exposure": "standard",
        "valueSource": "custom",
        "flags": {},
        "search": [
          "interview workflow mode",
          "hybrid",
          "freeform",
          "guided topics"
        ],
        "src": "inventory",
        "options": [
          "Guided",
          "Freeform",
          "Hybrid"
        ],
        "value": "Hybrid",
        "recommended": "Guided"
      },
      "planning.interview.plan-thoroughness": {
        "id": "planning.interview.plan-thoroughness",
        "label": "Plan Thoroughness",
        "desc": "How deep planning digs: fewer questions and a lighter plan, or more research and detail. Comprehensive costs more time.",
        "type": "select",
        "default": "Balanced",
        "scope": [
          "run"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {},
        "search": [
          "deep plan detail",
          "clarifying question budget",
          "research breadth"
        ],
        "src": "inventory",
        "options": [
          "Light",
          "Balanced",
          "Comprehensive"
        ],
        "value": "Balanced"
      },
      "planning.interview.web-research-mode": {
        "id": "planning.interview.web-research-mode",
        "label": "Web Research During Planning",
        "desc": "Whether planning may look things up on the web via Site Reader. 'Ask' checks with you first each time.",
        "type": "select",
        "default": "Ask",
        "scope": [
          "run"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {},
        "search": [
          "site reader",
          "deep plan research",
          "exa",
          "web lookup"
        ],
        "src": "inventory",
        "options": [
          "Off",
          "Ask",
          "Automatic"
        ],
        "value": "Ask",
        "recommended": "Automatic"
      },
      "planning.verification.validation-pass": {
        "id": "planning.verification.validation-pass",
        "label": "Double-Check Finished Work",
        "desc": "Runs an independent check on completed work before it counts as done. Turning this off means mistakes slip through faster.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global",
          "project"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "validation pass enable",
          "verification pass",
          "gate decisions"
        ],
        "src": "inventory",
        "value": true,
        "scopeNote": "On, matching the recommendation. A separate pass re-checks finished work before it is reported as done."
      },
      "planning.verification.strictness": {
        "id": "planning.verification.strictness",
        "label": "Verification Strictness",
        "desc": "How demanding the final review is, from lenient up to certification-grade proof that everything works.",
        "type": "select",
        "default": "Standard",
        "scope": [
          "project"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {},
        "search": [
          "verification strictness levels"
        ],
        "src": "inventory",
        "options": [
          "Lenient",
          "Standard",
          "Strict",
          "Certification"
        ],
        "value": "Standard"
      },
      "planning.verification.independent-review": {
        "id": "planning.verification.independent-review",
        "label": "Reviewer Never Grades Own Work",
        "desc": "The AI that checks work is always different from the AI that did it \u2014 like a second pair of eyes.",
        "type": "toggle",
        "default": true,
        "scope": [
          "project"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {},
        "search": [
          "independent review",
          "separation of duties"
        ],
        "src": "inventory",
        "value": true
      },
      "planning.verification.quality-preference": {
        "id": "planning.verification.quality-preference",
        "label": "Quality vs Speed",
        "desc": "One dial for how picky checks and progress gates are. Thorough catches more but takes longer; fast trusts more.",
        "type": "select",
        "default": "Balanced",
        "scope": [
          "project"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "gate run quality preference",
          "strict permissive",
          "timeout policies"
        ],
        "src": "inventory",
        "options": [
          "Fast",
          "Balanced",
          "Thorough"
        ],
        "value": "Balanced"
      },
      "planning.testing.capability-policy": {
        "id": "planning.testing.capability-policy",
        "label": "Automated Testing",
        "desc": "Auto lets the app find and set up tests itself; On requires tests to run; Off forbids them (nothing quietly passes untested).",
        "type": "radio",
        "default": "Auto",
        "scope": [
          "global",
          "project"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "testing capability policy",
          "ask",
          "master switch",
          "project override",
          "inherited effective"
        ],
        "src": "inventory",
        "options": [
          "Auto",
          "On",
          "Off"
        ],
        "value": "Auto"
      },
      "branching.worktrees.enable-git": {
        "id": "branching.worktrees.enable-git",
        "label": "Use Git During Runs",
        "desc": "Lets runs make branches, commits, and pull requests. Turn off to keep runs from touching version history at all.",
        "type": "toggle",
        "default": true,
        "scope": [
          "project"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "git",
          "version control",
          "branch",
          "commit",
          "PR"
        ],
        "src": "inventory",
        "value": true
      },
      "branching.worktrees.default-branch": {
        "id": "branching.worktrees.default-branch",
        "label": "Main Branch Name",
        "desc": "The branch all new work starts from and merges back into. Change only if your repo uses something other than main.",
        "type": "text",
        "default": "main",
        "scope": [
          "project",
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "base branch",
          "default branch",
          "trunk",
          "master",
          "baseline"
        ],
        "src": "inventory",
        "value": "main"
      },
      "branching.worktrees.merge-strategy": {
        "id": "branching.worktrees.merge-strategy",
        "label": "How Finished Work Is Merged",
        "desc": "Auto follows your project's convention; merge keeps history, squash makes one tidy commit, rebase replays commits. Merge is safest.",
        "type": "select",
        "default": "Merge",
        "scope": [
          "project",
          "global"
        ],
        "exposure": "advanced",
        "valueSource": "custom",
        "flags": {},
        "search": [
          "merge posture",
          "rebase",
          "squash",
          "ff-only",
          "cherry-pick",
          "conservative",
          "aggressive"
        ],
        "src": "inventory",
        "options": [
          "Automatic",
          "Merge",
          "Squash",
          "Rebase"
        ],
        "value": "Squash",
        "recommended": "Merge"
      },
      "branching.worktrees.force-push-policy": {
        "id": "branching.worktrees.force-push-policy",
        "label": "Allow Force Pushing",
        "desc": "Force pushes can overwrite others' work. Never is safest; with-lease refuses if someone else pushed first; always is risky.",
        "type": "select",
        "default": "Never",
        "scope": [
          "project",
          "global"
        ],
        "exposure": "expert",
        "valueSource": "default",
        "flags": {},
        "search": [
          "force push",
          "force-with-lease",
          "protected branches",
          "overwrite"
        ],
        "src": "inventory",
        "options": [
          "Never",
          "Force with lease",
          "Always"
        ],
        "value": "Never",
        "recommended": "Force with lease",
        "riskNote": "Force pushing can overwrite teammates' work. Force with lease is the only variant PM will ever suggest."
      },
      "branching.worktrees.pre-merge-tests": {
        "id": "branching.worktrees.pre-merge-tests",
        "label": "Test Before Merging",
        "desc": "Runs your project's tests before AI work is merged, and blocks the merge if they fail. Your best safety net against broken code.",
        "type": "toggle",
        "default": true,
        "scope": [
          "project"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "pre-merge test",
          "worktree merge guard",
          "CI",
          "quality gate"
        ],
        "src": "inventory",
        "value": false,
        "recommended": true,
        "scopeNote": "Currently off. PM recommends turning this on so finished work is tested before it reaches main."
      },
      "branching.worktrees.pre-merge-test-command": {
        "id": "branching.worktrees.pre-merge-test-command",
        "label": "Test Command",
        "desc": "The command run before merging. Auto-detect finds your project's test runner; set it yourself if detection picks wrong.",
        "type": "text",
        "default": "auto-detect",
        "scope": [
          "project"
        ],
        "exposure": "advanced",
        "valueSource": "not-configured",
        "flags": {},
        "search": [
          "pre-merge command",
          "test runner",
          "npm test",
          "cargo test"
        ],
        "src": "inventory",
        "value": "",
        "scopeNote": "No test command recorded for this project yet. Pre-merge testing stays inactive until one is set."
      },
      "branching.worktrees.worktree-cleanup": {
        "id": "branching.worktrees.worktree-cleanup",
        "label": "When a Chat Is Deleted",
        "desc": "What happens to a chat's private workspace when you delete the chat: ask you each time, keep it around, or remove it.",
        "type": "select",
        "default": "Ask",
        "scope": [
          "project"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "worktree cleanup",
          "thread delete",
          "cleanup policy"
        ],
        "src": "inventory",
        "options": [
          "Ask",
          "Keep",
          "Remove"
        ],
        "value": "Ask"
      },
      "branching.subagents.enable-subagents": {
        "id": "branching.subagents.enable-subagents",
        "label": "Use Helper Agents",
        "desc": "Lets the app bring in specialized helpers for each seam, package, lane, or node of a run. Turning off means one agent does everything.",
        "type": "toggle",
        "default": true,
        "scope": [
          "project"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "subagents",
          "lane subagents",
          "auto-select",
          "specialists"
        ],
        "src": "inventory",
        "value": true
      },
      "branching.subagents.max-parallel": {
        "id": "branching.subagents.max-parallel",
        "label": "Helpers Working at Once",
        "desc": "The most helper agents allowed to work simultaneously in one wave. Lower it if your machine or budget feels the strain.",
        "type": "number",
        "default": 4,
        "scope": [
          "global",
          "project",
          "run"
        ],
        "exposure": "advanced",
        "valueSource": "custom",
        "flags": {
          "cost": true
        },
        "search": [
          "max parallel agents",
          "concurrency",
          "wave",
          "child agents"
        ],
        "src": "inventory",
        "value": 6,
        "recommended": 4,
        "effective": 2,
        "effectiveReason": "Capped by live provider capacity until the Claude included usage resets at 4:00 PM. The Orchestrator queues the rest in waves."
      },
      "branching.crew.crew-enabled": {
        "id": "branching.crew.crew-enabled",
        "label": "Work as a Crew",
        "desc": "Runs several AI models on your goal together instead of one. More perspectives and catches, but uses noticeably more credits.",
        "type": "toggle",
        "default": false,
        "scope": [
          "global",
          "project"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "default crew",
          "multi-agent",
          "crew mode",
          "team"
        ],
        "src": "inventory",
        "value": false
      },
      "branching.crew.max-agents-per-crew": {
        "id": "branching.crew.max-agents-per-crew",
        "label": "Agents per Crew",
        "desc": "The most teammates a single crew can have active at once. Extra reviewer or worker spawns wait for a free slot.",
        "type": "number",
        "default": 8,
        "scope": [
          "global"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {},
        "search": [
          "crew size",
          "concurrent agents",
          "reviewer",
          "worker"
        ],
        "src": "inventory",
        "value": 8
      },
      "system.mcp.import-external": {
        "id": "system.mcp.import-external",
        "label": "Importing Servers From Other Apps",
        "desc": "When servers are found in other apps' configs (Claude, Codex, Warp), ask before importing and review them first. Sources and secrets are tracked and redacted.",
        "type": "radio",
        "default": "Ask me first",
        "scope": [
          "project"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "import",
          "external repo",
          "trust boundary",
          "provenance",
          ".claude",
          "Codex",
          "Warp",
          "first-run review"
        ],
        "src": "inventory",
        "options": [
          "Ask me first",
          "Off until reviewed"
        ],
        "value": "Ask me first"
      },
      "system.mcp.lazy-exposure": {
        "id": "system.mcp.lazy-exposure",
        "label": "Load Tool Details Only When Needed",
        "desc": "Shares each tool's full details with the AI only when it is about to be used. Keeps prompts small and responses faster and cheaper.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global",
          "project"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {},
        "search": [
          "lazy",
          "tool exposure",
          "schema",
          "context budget",
          "prompt bloat"
        ],
        "src": "inventory",
        "value": true,
        "scopeNote": "Tool schemas load when an agent actually needs them, which keeps every turn's context small."
      },
      "system.mcp.timeout": {
        "id": "system.mcp.timeout",
        "label": "Server Response Time Limit",
        "desc": "How long (in milliseconds) to wait for a server to start or answer before giving up and recording the failure. Lower is snappier but flakier.",
        "type": "number",
        "default": 30000,
        "scope": [
          "global",
          "project"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {
          "reconnect": true
        },
        "search": [
          "timeout",
          "timeout_ms",
          "init timeout",
          "call timeout",
          "heartbeat",
          "5000",
          "settlement receipt"
        ],
        "src": "inventory",
        "value": 30000
      },
      "extensions.skills.discovery": {
        "id": "extensions.skills.discovery",
        "label": "Find Skills Automatically",
        "desc": "Scans your project and computer for skill folders on startup. When two skills share a name, the project copy wins.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "discovery",
          ".puppet-master/skills",
          ".claude/skills",
          ".agents/skills",
          "first-wins",
          "dedup",
          "scan"
        ],
        "src": "inventory",
        "value": true
      },
      "extensions.skills.auto-invocation": {
        "id": "extensions.skills.auto-invocation",
        "label": "Let Skills Run Automatically",
        "desc": "Ready skills may start on their own when relevant. Skills with warnings always wait for you to pick them yourself.",
        "type": "toggle",
        "default": true,
        "scope": [
          "persona"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {},
        "search": [
          "auto-invoke",
          "auto invocation",
          "ready_with_warnings",
          "explicit selection"
        ],
        "src": "inventory",
        "value": true
      },
      "extensions.plugins.auto-enable-new": {
        "id": "extensions.plugins.auto-enable-new",
        "label": "Auto-Enable New Plugins",
        "desc": "Turns freshly installed plugins on immediately. Kept off so new code never hooks into the app without your say-so.",
        "type": "toggle",
        "default": false,
        "scope": [
          "global"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {},
        "search": [
          "auto enable",
          "update policy",
          "new plugins"
        ],
        "src": "inventory",
        "value": false
      },
      "extensions.commands.shortcut-hints": {
        "id": "extensions.commands.shortcut-hints",
        "label": "Shortcut Hints & Cheat Sheet",
        "desc": "Shows key combos next to buttons and offers an in-app cheat sheet \u2014 the easiest way to pick up shortcuts as you go.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "discovery",
          "cheat sheet",
          "inline hints",
          "learn shortcuts"
        ],
        "src": "inventory",
        "value": true
      },
      "web.providers.web-search-enable": {
        "id": "web.providers.web-search-enable",
        "label": "Let the AI Search the Web",
        "desc": "Allows web searches in chat (and the /web command). Turn off if you never want the AI reaching the internet during a run.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "/web",
          "web search integration",
          "internet access",
          "activity cards",
          "websearch"
        ],
        "src": "inventory",
        "value": true
      },
      "web.fetch.pdf-mode": {
        "id": "web.fetch.pdf-mode",
        "label": "PDF Reading Mode",
        "desc": "How web PDFs are read. Auto picks the best method; OCR handles scanned documents but is slower. Can be overridden per request.",
        "type": "select",
        "default": "Automatic",
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "auto",
        "flags": {},
        "search": [
          "webfetch pdf",
          "ocr",
          "scanned documents"
        ],
        "src": "inventory",
        "options": [
          "Fast",
          "Automatic",
          "OCR"
        ],
        "value": "Automatic",
        "scopeNote": "Automatic reads the text layer when one exists and falls back to OCR for scanned pages."
      },
      "web.fetch.cost-warning-threshold": {
        "id": "web.fetch.cost-warning-threshold",
        "label": "Ask Before Spending Credits",
        "desc": "Web jobs estimated above this many provider credits pause and ask you first. Lower it if bills surprise you.",
        "type": "number",
        "default": 100,
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {
          "cost": true
        },
        "search": [
          "cost warning",
          "credit threshold",
          "confirmation",
          "firecrawl credits",
          "HITL"
        ],
        "src": "inventory",
        "value": 100
      },
      "web.fetch.browser-save-session": {
        "id": "web.fetch.browser-save-session",
        "label": "Remember Website Logins",
        "desc": "Saves cookies and site data after browser runs so logged-in workflows keep working next time. Off discards them each run.",
        "type": "toggle",
        "default": true,
        "scope": [
          "project"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {
          "privacy": true
        },
        "search": [
          "saveChanges",
          "cookies",
          "localStorage",
          "authenticated workflows"
        ],
        "src": "inventory",
        "value": true
      },
      "media.capabilities.master": {
        "id": "media.capabilities.master",
        "label": "Media Generation",
        "desc": "The master switch for creating images, video, speech, and music. When off, the app may suggest media but never actually generates it.",
        "type": "toggle",
        "default": false,
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "enable media",
          "capability gate",
          "ADMIN_DISABLED",
          "interview gating"
        ],
        "src": "inventory",
        "value": false,
        "recommended": true
      },
      "media.capabilities.enabled-types": {
        "id": "media.capabilities.enabled-types",
        "label": "What Can Be Generated",
        "desc": "Choose which media kinds are allowed: images, screenshots, diagrams, recordings, video. Anything off reports 'disabled by admin' to tools.",
        "type": "multiselect",
        "default": [
          "Images",
          "Screenshots",
          "Diagrams"
        ],
        "scope": [
          "global",
          "run"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "capability toggles",
          "media types",
          "ADMIN_DISABLED",
          "entitlement",
          "capability.get"
        ],
        "src": "inventory",
        "options": [
          "Images",
          "Screenshots",
          "Diagrams",
          "Recordings",
          "Video"
        ],
        "value": [
          "Images",
          "Screenshots",
          "Diagrams"
        ]
      },
      "media.capabilities.video": {
        "id": "media.capabilities.video",
        "label": "Video Generation",
        "desc": "Allow creating short video clips. Not every backend supports this \u2014 unsupported ones will refuse with a clear error.",
        "type": "toggle",
        "default": false,
        "scope": [
          "global"
        ],
        "exposure": "unavailable",
        "valueSource": "default",
        "flags": {},
        "search": [
          "video",
          "veo",
          "BACKEND_UNSUPPORTED"
        ],
        "src": "inventory",
        "value": false,
        "unavailableReason": "No connected provider offers video generation. Connect a media provider with video support to enable this."
      },
      "media.io.media-input": {
        "id": "media.io.media-input",
        "label": "Accept Media Input",
        "desc": "Let the app take in images, screenshots, and other media you attach. Turn off to keep runs text-only.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global",
          "project",
          "run"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "media input",
          "attachments",
          "image upload"
        ],
        "src": "inventory",
        "value": true
      },
      "media.io.voice-input": {
        "id": "media.io.voice-input",
        "label": "Allow Voice Input",
        "desc": "Speak instead of type: your voice becomes a draft message you can review before sending.",
        "type": "toggle",
        "default": false,
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "voice",
          "microphone",
          "dictation",
          "speech to text",
          "composer draft"
        ],
        "src": "inventory",
        "value": false
      },
      "media.io.vision-bridge": {
        "id": "media.io.vision-bridge",
        "label": "Understand Images & Screenshots",
        "desc": "Lets the app 'see' images and screenshots you share, even when the working model can't, by routing them through a vision helper.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "vision bridge",
          "screenshot understanding",
          "image analysis",
          "PP-055"
        ],
        "src": "inventory",
        "value": true
      },
      "media.io.artifact-retention": {
        "id": "media.io.artifact-retention",
        "label": "Keep Generated Files For",
        "desc": "How long generated media and other outputs are kept before cleanup. Note: some provider download links expire after 24 hours regardless.",
        "type": "select",
        "default": "30 Days",
        "scope": [
          "global"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {},
        "search": [
          "retention",
          "artifact cleanup",
          "storage",
          "URL expiry"
        ],
        "src": "inventory",
        "options": [
          "24 Hours",
          "7 Days",
          "30 Days",
          "Unlimited"
        ],
        "value": "7 Days"
      },
      "media.image.provider": {
        "id": "media.image.provider",
        "label": "Image Generation Service",
        "desc": "Which service creates images for chat, artifacts, and web content. Options that your plan or route can't use are shown greyed out with a reason.",
        "type": "select",
        "default": "None",
        "scope": [
          "global",
          "project",
          "persona"
        ],
        "exposure": "standard",
        "valueSource": "custom",
        "flags": {},
        "search": [
          "image engine",
          "provider",
          "gpt-image-2",
          "minimax",
          "gemini",
          "antigravity",
          "route",
          "capability-gated",
          "default gpt-image-2 alternative"
        ],
        "src": "inventory",
        "options": [
          "None",
          "OpenAI gpt-image-2",
          "OpenAI Responses image tool",
          "Gemini 3 Pro Image",
          "Local ComfyUI"
        ],
        "value": "OpenAI gpt-image-2"
      },
      "media.capabilities.image-quality": {
        "id": "media.capabilities.image-quality",
        "label": "Image Quality",
        "desc": "Trade speed for polish: draft is fast and cheap, high takes longer and costs more.",
        "type": "select",
        "default": "Standard",
        "scope": [
          "run"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "quality",
          "draft mode"
        ],
        "src": "inventory",
        "options": [
          "Draft",
          "Standard",
          "High"
        ],
        "value": "Standard"
      },
      "system.health.auto-run": {
        "id": "system.health.auto-run",
        "label": "Check Automatically",
        "desc": "Lets the app quietly re-run its checkup on a schedule so problems are caught before they interrupt your work.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "auto-run",
          "doctor startup",
          "health auto check",
          "background checks"
        ],
        "src": "inventory",
        "value": true
      },
      "system.health.check-frequency": {
        "id": "system.health.check-frequency",
        "label": "How Often to Check",
        "desc": "How often the automatic checkup runs. Daily is a good balance; pick Never if you prefer to run checks yourself.",
        "type": "select",
        "default": "Daily",
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "frequency",
          "schedule",
          "hourly",
          "weekly",
          "on demand"
        ],
        "src": "inventory",
        "options": [
          "Only when I ask",
          "Hourly",
          "Daily",
          "Weekly",
          "Never"
        ],
        "value": "Daily"
      },
      "system.health.degraded-visibility": {
        "id": "system.health.degraded-visibility",
        "label": "Warn About Failing Connections",
        "desc": "Surfaces stale or partly broken pieces (like a flaky tool server or locked file safety) instead of hiding them until they fail.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "stale",
          "degraded",
          "unhealthy",
          "FileSafe",
          "fail-closed",
          "visibility"
        ],
        "src": "inventory",
        "value": true
      },
      "system.health.telemetry": {
        "id": "system.health.telemetry",
        "label": "Share Usage Data",
        "desc": "Sends anonymous usage and crash reports to help improve the app. Off by default \u2014 nothing leaves your computer unless you opt in.",
        "type": "toggle",
        "default": false,
        "scope": [
          "global"
        ],
        "exposure": "managed",
        "valueSource": "managed",
        "flags": {
          "privacy": true
        },
        "search": [
          "telemetry",
          "analytics",
          "crash reports",
          "privacy",
          "usage data"
        ],
        "src": "inventory",
        "value": false,
        "managedReason": "Kept off by the Platyr workspace policy. Sharing usage data requires an administrator change."
      },
      "system.advanced.auto-update": {
        "id": "system.advanced.auto-update",
        "label": "Check for App Updates",
        "desc": "Looks for new versions of Puppet Master automatically. You are always asked before anything installs.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "auto-update",
          "updates",
          "new version",
          "upgrade"
        ],
        "src": "inventory",
        "value": true
      },
      "system.advanced.release-channel": {
        "id": "system.advanced.release-channel",
        "label": "Update Channel",
        "desc": "Stable gets well-tested releases; Canary and Nightly get new features sooner but break more often. Affects update signing checks too.",
        "type": "select",
        "default": "Stable",
        "scope": [
          "global"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {
          "restart": true
        },
        "search": [
          "release channel",
          "canary",
          "nightly",
          "beta",
          "provenance"
        ],
        "src": "inventory",
        "options": [
          "Stable",
          "Canary",
          "Nightly"
        ],
        "value": "Stable",
        "scopeNote": "Changing the channel takes effect after the app restarts."
      },
      "system.advanced.debug-mode": {
        "id": "system.advanced.debug-mode",
        "label": "Debug Mode",
        "desc": "Records extra technical detail about what the app is doing. Slows things slightly; turn on only when chasing a problem.",
        "type": "toggle",
        "default": false,
        "scope": [
          "global",
          "project"
        ],
        "exposure": "diagnostic",
        "valueSource": "default",
        "flags": {},
        "search": [
          "debug",
          "instrumentation",
          "APM",
          "logging",
          "telemetry logging",
          "hazardous toggles"
        ],
        "src": "inventory",
        "value": false
      },
      "system.advanced.log-verbosity": {
        "id": "system.advanced.log-verbosity",
        "label": "Log Detail Level",
        "desc": "How chatty the app's logs are, from Silent to Trace. More detail helps support but fills disk faster.",
        "type": "select",
        "default": "Warnings",
        "scope": [
          "global"
        ],
        "exposure": "diagnostic",
        "valueSource": "default",
        "flags": {},
        "search": [
          "verbosity",
          "log level",
          "PUPPET_MASTER_DEBUG",
          "trace"
        ],
        "src": "inventory",
        "options": [
          "Silent",
          "Errors only",
          "Warnings",
          "Info",
          "Debug",
          "Trace"
        ],
        "value": "Warnings"
      },
      "system.advanced.runtime-history-days": {
        "id": "system.advanced.runtime-history-days",
        "label": "Runtime History Retention (Days)",
        "desc": "Keeps run, node, attempt, remediation, worktree, lane, and runtime lifecycle history for at least 365 days after run completion. The default and owner minimum are 365; larger values are allowed, while a lower value is rejected with the storage-owner reason rather than silently raised.",
        "type": "number",
        "default": 365,
        "scope": [
          "global",
          "project"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {},
        "search": [
          "Storage & Retention",
          "runtime history",
          "run history",
          "365 days",
          "ER-RUNTIME-365D",
          "owner minimum",
          "reject below minimum"
        ],
        "src": "inventory",
        "value": 365
      },
      "planning.goal.reserve-policy": {
        "id": "planning.goal.reserve-policy",
        "label": "Goal Capacity Reserve",
        "desc": "How much of a Goal\u2019s capacity is held back for synthesis, testing, verification, and repair instead of being spent on the first build wave.",
        "type": "select",
        "default": "Hold 20%",
        "scope": [
          "global",
          "project"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "reserve",
          "hold back",
          "budget",
          "synthesis",
          "verification",
          "repair",
          "capacity"
        ],
        "src": "packet-2026-08-05",
        "options": [
          "None",
          "Hold 10%",
          "Hold 20%",
          "Hold 30%"
        ],
        "value": "Hold 20%"
      },
      "branching.worktrees.provisioning": {
        "id": "branching.worktrees.provisioning",
        "label": "Worktree Provisioning",
        "desc": "Whether Goals get isolated worktrees provisioned automatically when they start, or Puppet Master asks before creating one.",
        "type": "select",
        "default": "Automatic",
        "scope": [
          "global",
          "project"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "worktree",
          "provision",
          "isolated",
          "checkout",
          "goal workspace"
        ],
        "src": "packet-2026-08-05",
        "options": [
          "Automatic",
          "Ask each time",
          "Never"
        ],
        "value": "Automatic"
      },
      "branching.worktrees.port-collision": {
        "id": "branching.worktrees.port-collision",
        "label": "When Dev Ports Collide",
        "desc": "What happens when a worktree\u2019s dev server wants a port another worktree is already using.",
        "type": "select",
        "default": "Pick a free port",
        "scope": [
          "global",
          "project"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "port",
          "collision",
          "dev server",
          "address in use",
          "parallel"
        ],
        "src": "packet-2026-08-05",
        "options": [
          "Pick a free port",
          "Ask",
          "Fail the run"
        ],
        "value": "Pick a free port"
      },
      "memory.assembly.parent-handoff": {
        "id": "memory.assembly.parent-handoff",
        "label": "Include Parent-Agent Handoff",
        "desc": "Adds the parent agent\u2019s handoff summary to each delegated agent\u2019s assembled context, so subagents start with the reasoning behind their assignment.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global",
          "project"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "handoff",
          "parent agent",
          "subagent",
          "delegation",
          "context assembly"
        ],
        "src": "packet-2026-08-05",
        "value": true
      },
      "memory.assembly.warn-route-change": {
        "id": "memory.assembly.warn-route-change",
        "label": "Warn Before Context Route Changes",
        "desc": "Shows a warning before a material change to how context is assembled or cached - for example when the cache route or stable prefix changes and cached tokens would be rebuilt at full price.",
        "type": "toggle",
        "default": true,
        "scope": [
          "global",
          "project"
        ],
        "exposure": "standard",
        "valueSource": "default",
        "flags": {},
        "search": [
          "cache",
          "route",
          "prefix",
          "warning",
          "context assembly",
          "rebuild"
        ],
        "src": "packet-2026-08-05",
        "value": true
      },
      "general.writing.grammar-assist": {
        "id": "general.writing.grammar-assist",
        "label": "Grammar Assist",
        "desc": "A separate, optional grammar feature backed by an AI provider. It is off by default; when you turn it on, its calls are disclosed and attributed in Usage. It is never part of ordinary spellcheck, which stays local.",
        "type": "toggle",
        "default": false,
        "scope": [
          "global"
        ],
        "exposure": "advanced",
        "valueSource": "default",
        "flags": {
          "privacy": true,
          "cost": true
        },
        "search": [
          "grammar",
          "writing",
          "style",
          "provider",
          "proofread",
          "assist"
        ],
        "src": "packet-2026-08-05",
        "value": false
      }
    },
    "notices": [
      {
        "id": "n-copilot-invoke",
        "kind": "attention",
        "statusWord": "Attention",
        "headline": "Copilot is signed in but can't run models",
        "consequence": "The last model call failed with a subscription error, so Copilot routes are skipped until this is fixed.",
        "primary": {
          "label": "Run connection check",
          "act": "invoke-test"
        },
        "secondary": {
          "label": "Open Copilot details",
          "act": "open-manager"
        },
        "target": {
          "domain": "agents",
          "manager": "providers",
          "settingId": null,
          "providerId": "copilot"
        }
      },
      {
        "id": "n-antigravity-signin",
        "kind": "attention",
        "statusWord": "Attention",
        "headline": "Antigravity's Google sign-in expired",
        "consequence": "Gemini models through the Antigravity CLI are unavailable until you sign in again inside the CLI profile.",
        "primary": {
          "label": "Open CLI sign-in",
          "act": "cli-login"
        },
        "target": {
          "domain": "agents",
          "manager": "providers",
          "providerId": "antigravity"
        }
      },
      {
        "id": "n-claude-exhausted",
        "kind": "attention",
        "statusWord": "Attention",
        "headline": "Included Claude usage on Personal Max is used up",
        "consequence": "Requests now fall through to the Platyr Team account until the 4:00 PM reset.",
        "primary": {
          "label": "Review what happens next",
          "act": "open-manager"
        },
        "secondary": {
          "label": "Open Usage",
          "act": "open-usage"
        },
        "target": {
          "domain": "agents",
          "manager": "providers",
          "providerId": "claude"
        }
      },
      {
        "id": "n-linear-mcp",
        "kind": "attention",
        "statusWord": "Attention",
        "headline": "The Linear tool server lost its connection",
        "consequence": "Issue lookups fail until the server reconnects. Its tools are hidden from agents in the meantime.",
        "primary": {
          "label": "Reconnect",
          "act": "reconnect"
        },
        "secondary": {
          "label": "View logs",
          "act": "open-logs"
        },
        "target": {
          "domain": "extensions",
          "manager": "mcp",
          "serverId": "mcp-linear"
        }
      },
      {
        "id": "n-qwen-setup",
        "kind": "setup",
        "statusWord": "Continue setup",
        "headline": "Finish setting up the Qwen3 Coder free route",
        "consequence": "One step left: create the free ModelScope key and paste it into the OpenRouter connection.",
        "primary": {
          "label": "Continue setup",
          "act": "open-free-route"
        },
        "target": {
          "domain": "agents",
          "manager": "providers",
          "freeRouteId": "fr-qwen3-coder"
        }
      },
      {
        "id": "n-video-provider",
        "kind": "setup",
        "statusWord": "Continue setup",
        "headline": "Video generation still needs a provider",
        "consequence": "You enabled media generation, but no connected provider offers video yet.",
        "primary": {
          "label": "Choose a provider",
          "act": "open-manager"
        },
        "target": {
          "domain": "media",
          "sub": "capabilities",
          "settingId": "media.capabilities.video"
        }
      },
      {
        "id": "n-auto-compress",
        "kind": "recommended",
        "statusWord": "Recommended",
        "headline": "Turn automatic context compaction back on",
        "consequence": "Long threads will start dropping older detail abruptly instead of compacting gracefully.",
        "primary": {
          "label": "Turn on",
          "act": "apply-recommended"
        },
        "target": {
          "domain": "context",
          "sub": "budget",
          "settingId": "memory.limits.auto-compress"
        }
      },
      {
        "id": "n-premerge-tests",
        "kind": "recommended",
        "statusWord": "Recommended",
        "headline": "Protect main with pre-merge tests",
        "consequence": "Finished work currently merges without a test run. A test command is also still unset.",
        "primary": {
          "label": "Set up testing",
          "act": "open-setting"
        },
        "target": {
          "domain": "collaboration",
          "sub": "git",
          "settingId": "branching.worktrees.pre-merge-tests"
        }
      }
    ],
    "recents": [
      {
        "id": "r1",
        "label": "Set the monthly spend limit to $250",
        "detail": "Agents, Models & Accounts - Usage & budgets",
        "at": "2026-08-05T11:20:00-07:00",
        "target": {
          "domain": "agents",
          "sub": "usage",
          "settingId": "ai.usage.monthly-spend-limit"
        }
      },
      {
        "id": "r2",
        "label": "Connected OpenRouter",
        "detail": "Providers manager",
        "at": "2026-08-04T16:48:00-07:00",
        "target": {
          "domain": "agents",
          "manager": "providers",
          "providerId": "openrouter"
        }
      },
      {
        "id": "r3",
        "label": "Switched this project to Ask for approval",
        "detail": "Permissions & Safety - Access mode",
        "at": "2026-08-04T09:31:00-07:00",
        "target": {
          "domain": "permissions",
          "sub": "access",
          "settingId": "safety.rules.access-mode"
        }
      },
      {
        "id": "r4",
        "label": "Edited the Researcher persona",
        "detail": "Personas manager",
        "at": "2026-08-03T15:12:00-07:00",
        "target": {
          "domain": "agents",
          "manager": "personas",
          "personaId": "p-researcher"
        }
      },
      {
        "id": "r5",
        "label": "Added 'Fableicon' to the project dictionary",
        "detail": "General & Startup - Writing & spelling",
        "at": "2026-08-03T10:05:00-07:00",
        "target": {
          "domain": "general",
          "sub": "writing",
          "settingId": "general.spellcheck.project-dictionary"
        }
      }
    ],
    "providers": [
      {
        "id": "claude",
        "name": "Claude",
        "family": "Anthropic",
        "groupKind": "tool",
        "status": "ready",
        "statusNote": "Signed in through the Claude CLI. Personal Max has used up its included window; requests fall through to Platyr Team until the 4:00 PM reset.",
        "defaultAnswerBlock": {
          "connected": true,
          "accountInUse": "Platyr Team (Personal Max exhausted until 4:00 PM)",
          "billingRoute": "Claude Max plan, included usage",
          "remaining": "Personal Max: 0% until 4:00 PM. Platyr Team: 92% of the 5-hour window.",
          "onExhaust": "Fall through to the next enabled account, then pause and wait for the reset",
          "modelsAvail": "Claude Opus 4.1, Claude Sonnet 4.5, Claude Haiku 4.5",
          "attention": "Included usage on Personal Max is used up until the 4:00 PM reset."
        },
        "accounts": [
          {
            "id": "claude-personal",
            "nickname": "Jared - Personal Max",
            "identity": "jared@platyr.com",
            "authOwner": "cli-profile",
            "isolation": "native-profile",
            "enabled": true,
            "priority": 1,
            "useNext": false,
            "sticky": true,
            "health": "usage-exhausted",
            "usage": {
              "includedRemaining": "0% - used up until the reset",
              "extra": "$12.40 extra balance",
              "resetAt": "2026-08-05T16:00:00-07:00",
              "pressure": "exhausted",
              "lastUse": "2026-08-05T13:42:00-07:00"
            },
            "projection": "Included usage returns at 4:00 PM. Extra balance covers roughly 40 minutes of Sonnet work if you choose to spend it.",
            "lastCatalogRefresh": "2026-08-05T09:12:00-07:00"
          },
          {
            "id": "claude-team",
            "nickname": "Platyr Team",
            "identity": "eng@platyr.com",
            "authOwner": "cli-profile",
            "isolation": "cli-home",
            "enabled": true,
            "priority": 2,
            "useNext": true,
            "sticky": false,
            "health": "ready",
            "usage": {
              "includedRemaining": "92% of the 5-hour window",
              "extra": "None",
              "resetAt": "2026-08-05T18:30:00-07:00",
              "pressure": "low",
              "lastUse": "2026-08-05T14:07:00-07:00"
            },
            "lastCatalogRefresh": "2026-08-05T09:12:00-07:00"
          },
          {
            "id": "claude-api",
            "nickname": "Anthropic API - Platyr billing",
            "identity": "org: platyr",
            "authOwner": "api-key",
            "isolation": "pm-managed",
            "enabled": false,
            "priority": 3,
            "sticky": false,
            "health": "ready",
            "usage": {
              "includedRemaining": "Pay as you go",
              "extra": "No prepaid balance",
              "resetAt": null,
              "pressure": "none",
              "lastUse": "2026-07-28T09:15:00-07:00"
            },
            "lastCatalogRefresh": "2026-08-05T09:12:00-07:00"
          }
        ],
        "connections": [
          {
            "id": "conn-claude-cli",
            "kind": "cli",
            "route": "Claude CLI profile 'pm-personal' and 'pm-team'",
            "note": "Sign-in is owned by the Claude CLI inside isolated profiles. Puppet Master launches the CLI's own login and verifies readiness; it never handles the token."
          },
          {
            "id": "conn-claude-api",
            "kind": "api",
            "route": "api.anthropic.com",
            "note": "Separate direct API route billed to the Platyr organization key. Currently disabled."
          }
        ],
        "models": [
          {
            "id": "claude-opus-4-1",
            "name": "Claude Opus 4.1",
            "fav": false,
            "hidden": false,
            "priority": 2,
            "ctx": 200000,
            "modalities": [
              "text",
              "image-in"
            ],
            "effort": [
              "low",
              "medium",
              "high"
            ],
            "fast": false,
            "toolSupport": "full",
            "evidence": [
              {
                "cap": "tool-use",
                "state": "supported",
                "source": "observed successful use",
                "at": "2026-08-05T09:14:00-07:00"
              },
              {
                "cap": "image-in",
                "state": "supported",
                "source": "authenticated account discovery",
                "at": "2026-08-04T08:00:00-07:00"
              }
            ],
            "requested": true,
            "effectiveRoute": "Claude Sonnet 4.5 on Platyr Team",
            "effectiveReason": "You asked for Opus 4.1 on Personal Max, but that account's included usage is exhausted. Until the 4:00 PM reset, requests run as Sonnet 4.5 on Platyr Team per your continuation policy."
          },
          {
            "id": "claude-sonnet-4-5",
            "name": "Claude Sonnet 4.5",
            "fav": true,
            "alias": "Daily driver",
            "hidden": false,
            "priority": 1,
            "ctx": 200000,
            "modalities": [
              "text",
              "image-in"
            ],
            "effort": [
              "low",
              "medium",
              "high"
            ],
            "fast": false,
            "toolSupport": "full",
            "evidence": [
              {
                "cap": "tool-use",
                "state": "supported",
                "source": "observed successful use",
                "at": "2026-08-05T14:07:00-07:00"
              },
              {
                "cap": "structured-output",
                "state": "supported",
                "source": "safe probe",
                "at": "2026-08-01T12:00:00-07:00"
              },
              {
                "cap": "audio-in",
                "state": "via-transformation",
                "source": "audio transcribed by the local Whisper transform before the model sees it",
                "at": "2026-08-05T11:05:00-07:00"
              }
            ]
          },
          {
            "id": "claude-haiku-4-5",
            "name": "Claude Haiku 4.5",
            "fav": false,
            "hidden": false,
            "priority": 3,
            "ctx": 200000,
            "modalities": [
              "text",
              "image-in"
            ],
            "effort": [
              "low",
              "medium"
            ],
            "fast": false,
            "toolSupport": "full",
            "evidence": [
              {
                "cap": "tool-use",
                "state": "supported",
                "source": "catalog declaration",
                "at": "2026-08-04T09:12:00-07:00"
              }
            ]
          }
        ],
        "plans": [
          {
            "id": "plan-max",
            "name": "Claude Max",
            "kind": "subscription",
            "note": "Included usage in rolling windows, per account."
          },
          {
            "id": "plan-api",
            "name": "Anthropic API",
            "kind": "metered",
            "note": "Pay-as-you-go, billed to the Platyr organization."
          }
        ],
        "catalog": {
          "lastChecked": "2026-08-05T09:12:00-07:00",
          "lastActivated": "2026-08-05T09:12:04-07:00",
          "sourceVersion": "models.dev 2026-08-04",
          "state": "fresh",
          "lastKnownGood": true,
          "materialChanges": [
            {
              "at": "2026-08-04T09:00:00-07:00",
              "what": "Claude Haiku 4.5 context window raised on paid tiers.",
              "effect": "Long runs stay on Haiku longer before compression kicks in."
            },
            {
              "at": "2026-07-30T09:00:00-07:00",
              "what": "Cached-input pricing for Claude Opus 4.1 revised downward.",
              "effect": "Turns that reuse the stable prefix cost less; routing is unchanged."
            }
          ]
        },
        "whatNext": [
          "stop-wait",
          "extra-balance",
          "switch-account",
          "api-billing",
          "ask"
        ],
        "oauthNote": "Claude sign-in happens in the Claude CLI's own login flow inside an isolated profile. Puppet Master does not offer a direct Claude sign-in of its own; the Anthropic API key route is a separate connection."
      },
      {
        "id": "antigravity",
        "name": "Antigravity CLI",
        "family": "Google",
        "groupKind": "tool",
        "status": "signed-out",
        "statusNote": "The CLI is installed, but its Google sign-in expired on Jul 31. Open the CLI's own login to reconnect; models stay listed from the last good catalog.",
        "defaultAnswerBlock": {
          "connected": false,
          "accountInUse": "None - sign-in required",
          "billingRoute": "Google One AI Premium, included usage",
          "remaining": "Unknown while signed out",
          "onExhaust": "Stop and wait",
          "modelsAvail": "Gemini 3 Pro, Gemini 3 Flash (from the last good catalog)",
          "attention": "Sign in inside the CLI profile to restore Gemini routes."
        },
        "accounts": [
          {
            "id": "ag-jared",
            "nickname": "Jared - Google",
            "identity": "jared@platyr.com",
            "authOwner": "cli-profile",
            "isolation": "auth-isolated",
            "enabled": true,
            "priority": 1,
            "sticky": false,
            "health": "signed-out",
            "usage": {
              "includedRemaining": "Unknown while signed out",
              "extra": "None",
              "resetAt": null,
              "pressure": "unknown",
              "lastUse": "2026-07-31T18:22:00-07:00"
            }
          }
        ],
        "connections": [
          {
            "id": "conn-ag-cli",
            "kind": "cli",
            "route": "Antigravity CLI profile 'pm-google'",
            "note": "Google sign-in happens inside the Antigravity CLI's isolated profile with allowlisted shared preferences. Puppet Master launches that login and verifies readiness."
          }
        ],
        "models": [
          {
            "id": "gemini-3-pro",
            "name": "Gemini 3 Pro",
            "fav": false,
            "hidden": false,
            "priority": 1,
            "ctx": 1000000,
            "modalities": [
              "text",
              "image-in",
              "audio-in"
            ],
            "effort": [
              "low",
              "medium",
              "high"
            ],
            "fast": false,
            "toolSupport": "full",
            "evidence": [
              {
                "cap": "tool-use",
                "state": "unverified",
                "source": "catalog declaration",
                "at": "2026-07-31T09:00:00-07:00"
              }
            ],
            "unavailableReason": "Requires the Antigravity CLI sign-in, which has expired."
          },
          {
            "id": "gemini-3-flash",
            "name": "Gemini 3 Flash",
            "fav": false,
            "hidden": false,
            "priority": 2,
            "ctx": 1000000,
            "modalities": [
              "text",
              "image-in"
            ],
            "fast": true,
            "toolSupport": "full",
            "evidence": [
              {
                "cap": "fast-variant",
                "state": "likely",
                "source": "catalog declaration",
                "at": "2026-07-31T09:00:00-07:00"
              }
            ],
            "unavailableReason": "Requires the Antigravity CLI sign-in, which has expired."
          }
        ],
        "plans": [
          {
            "id": "plan-g1",
            "name": "Google One AI Premium",
            "kind": "subscription",
            "note": "Included Gemini usage through the Antigravity CLI."
          }
        ],
        "catalog": {
          "lastChecked": "2026-07-31T09:00:00-07:00",
          "lastActivated": "2026-07-31T09:00:02-07:00",
          "sourceVersion": "models.dev 2026-07-30",
          "state": "stale",
          "lastKnownGood": true
        },
        "whatNext": [
          "stop-wait",
          "free-models",
          "ask"
        ],
        "oauthNote": "Antigravity uses its own Google login inside an isolated CLI profile. Puppet Master never presents a direct Google sign-in for it."
      },
      {
        "id": "openai-codex",
        "name": "OpenAI Codex",
        "family": "OpenAI",
        "groupKind": "account",
        "status": "ready",
        "statusNote": "Connected through Puppet Master's direct sign-in. Included usage is healthy.",
        "defaultAnswerBlock": {
          "connected": true,
          "accountInUse": "Jared - ChatGPT Pro",
          "billingRoute": "ChatGPT Pro plan, included usage",
          "remaining": "64% of the weekly window",
          "onExhaust": "Offer paid usage after the plan, or ask",
          "modelsAvail": "GPT-5.2, GPT-5.2 Codex",
          "attention": null
        },
        "accounts": [
          {
            "id": "codex-jared",
            "nickname": "Jared - ChatGPT Pro",
            "identity": "jared@platyr.com",
            "authOwner": "pm-direct-oauth",
            "isolation": "pm-managed",
            "enabled": true,
            "priority": 1,
            "useNext": true,
            "sticky": false,
            "health": "ready",
            "usage": {
              "includedRemaining": "64% of the weekly window",
              "extra": "None",
              "resetAt": "2026-08-09T00:00:00-07:00",
              "pressure": "low",
              "lastUse": "2026-08-05T12:55:00-07:00"
            },
            "projection": "At the current pace, the weekly window comfortably outlasts its reset."
          }
        ],
        "connections": [
          {
            "id": "conn-codex-oauth",
            "kind": "oauth",
            "route": "PM direct sign-in (browser)",
            "note": "Codex supports Puppet Master's direct sign-in. PM opened the browser login and holds the resulting session on your behalf."
          }
        ],
        "models": [
          {
            "id": "gpt-5-2",
            "name": "GPT-5.2",
            "fav": true,
            "alias": null,
            "hidden": false,
            "priority": 1,
            "ctx": 400000,
            "modalities": [
              "text",
              "image-in"
            ],
            "effort": [
              "low",
              "medium",
              "high"
            ],
            "fast": true,
            "toolSupport": "full",
            "evidence": [
              {
                "cap": "fast-variant",
                "state": "supported",
                "source": "authenticated account discovery",
                "at": "2026-08-05T08:30:00-07:00"
              },
              {
                "cap": "tool-use",
                "state": "supported",
                "source": "observed successful use",
                "at": "2026-08-05T12:55:00-07:00"
              }
            ]
          },
          {
            "id": "gpt-5-2-codex",
            "name": "GPT-5.2 Codex",
            "fav": false,
            "hidden": false,
            "priority": 2,
            "ctx": 400000,
            "modalities": [
              "text"
            ],
            "effort": [
              "medium",
              "high"
            ],
            "fast": false,
            "toolSupport": "full",
            "evidence": [
              {
                "cap": "structured-output",
                "state": "supported",
                "source": "safe probe",
                "at": "2026-08-02T10:00:00-07:00"
              }
            ]
          }
        ],
        "plans": [
          {
            "id": "plan-chatgpt-pro",
            "name": "ChatGPT Pro",
            "kind": "subscription",
            "note": "Included Codex usage in a weekly window, with optional paid usage after the plan."
          }
        ],
        "catalog": {
          "lastChecked": "2026-08-05T08:30:00-07:00",
          "lastActivated": "2026-08-05T08:30:03-07:00",
          "sourceVersion": "models.dev 2026-08-04",
          "state": "fresh",
          "lastKnownGood": true
        },
        "whatNext": [
          "stop-wait",
          "paid-after-plan",
          "api-billing",
          "ask"
        ],
        "oauthNote": "OpenAI Codex is one of the providers that supports PM-direct sign-in."
      },
      {
        "id": "copilot",
        "name": "GitHub Copilot",
        "family": "GitHub",
        "groupKind": "account",
        "status": "auth-no-invoke",
        "statusNote": "Signed in, but the last model call failed with a subscription error. Authenticated is not the same as ready: model calls need an active Copilot Pro seat.",
        "defaultAnswerBlock": {
          "connected": true,
          "accountInUse": "Jared - GitHub",
          "billingRoute": "Copilot Pro seat (currently inactive)",
          "remaining": "Not available - the readiness check fails",
          "onExhaust": "Stop and wait",
          "modelsAvail": "Listed from catalog, but invocation currently fails",
          "attention": "The seat lapsed on Aug 1. Renew it on github.com, then run the connection check."
        },
        "accounts": [
          {
            "id": "copilot-jared",
            "nickname": "Jared - GitHub",
            "identity": "jared-platyr",
            "authOwner": "pm-direct-oauth",
            "isolation": "single-login",
            "enabled": true,
            "priority": 1,
            "sticky": false,
            "health": "auth-no-invoke",
            "usage": {
              "includedRemaining": "Unknown - last readiness check failed",
              "extra": "None",
              "resetAt": null,
              "pressure": "unknown",
              "lastUse": "2026-08-01T07:44:00-07:00"
            },
            "lastCatalogRefresh": "2026-08-01T07:40:00-07:00"
          }
        ],
        "connections": [
          {
            "id": "conn-copilot-oauth",
            "kind": "oauth",
            "route": "PM direct sign-in (GitHub device code)",
            "note": "GitHub sign-in succeeded on Jul 12. The failure is at the model-invocation step, not authentication."
          }
        ],
        "models": [
          {
            "id": "gpt-5-2-copilot",
            "name": "GPT-5.2 (Copilot)",
            "fav": false,
            "hidden": false,
            "priority": 1,
            "ctx": 200000,
            "modalities": [
              "text"
            ],
            "fast": false,
            "toolSupport": "partial",
            "evidence": [
              {
                "cap": "invocation",
                "state": "temporarily-unavailable",
                "source": "safe probe",
                "at": "2026-08-05T09:00:00-07:00"
              }
            ],
            "unavailableReason": "The Aug 5 readiness probe returned a subscription error."
          },
          {
            "id": "claude-sonnet-copilot",
            "name": "Claude Sonnet 4.5 (Copilot)",
            "fav": false,
            "hidden": false,
            "priority": 2,
            "ctx": 200000,
            "modalities": [
              "text"
            ],
            "fast": false,
            "toolSupport": "partial",
            "evidence": [
              {
                "cap": "invocation",
                "state": "temporarily-unavailable",
                "source": "safe probe",
                "at": "2026-08-05T09:00:00-07:00"
              }
            ],
            "unavailableReason": "The Aug 5 readiness probe returned a subscription error."
          }
        ],
        "plans": [
          {
            "id": "plan-copilot-pro",
            "name": "Copilot Pro",
            "kind": "subscription",
            "note": "Seat lapsed Aug 1; renewal restores included model usage."
          }
        ],
        "catalog": {
          "lastChecked": "2026-08-05T09:00:00-07:00",
          "lastActivated": "2026-08-01T07:00:00-07:00",
          "sourceVersion": "copilot-catalog 2026-08-01",
          "state": "fresh",
          "lastKnownGood": true
        },
        "whatNext": [
          "stop-wait",
          "ask"
        ],
        "oauthNote": "GitHub and Copilot support PM-direct sign-in."
      },
      {
        "id": "openrouter",
        "name": "OpenRouter",
        "family": "OpenRouter",
        "groupKind": "api",
        "status": "refreshing",
        "statusNote": "Catalog refresh in progress. Showing the last catalog that activated successfully, from Aug 3.",
        "defaultAnswerBlock": {
          "connected": true,
          "accountInUse": "Platyr - OpenRouter",
          "billingRoute": "Prepaid credit via API key",
          "remaining": "$31.75 credit",
          "onExhaust": "Use free models, or top up credit",
          "modelsAvail": "DeepSeek V4, Llama 4 Maverick, Qwen3 Coder (free tier), and about 240 more",
          "attention": null
        },
        "accounts": [
          {
            "id": "or-platyr",
            "nickname": "Platyr - OpenRouter",
            "identity": "key sk-or-... (stored in the keychain)",
            "authOwner": "api-key",
            "isolation": "credential-pool",
            "enabled": true,
            "priority": 1,
            "sticky": false,
            "health": "ready",
            "usage": {
              "includedRemaining": "$31.75 credit",
              "extra": "None",
              "resetAt": null,
              "pressure": "low",
              "lastUse": "2026-08-05T10:18:00-07:00"
            },
            "projection": "About three weeks of credit left at the July pace."
          }
        ],
        "connections": [
          {
            "id": "conn-or-api",
            "kind": "api",
            "route": "openrouter.ai/api/v1",
            "note": "Single API key. Individual upstream providers and their terms are shown per model."
          }
        ],
        "models": [
          {
            "id": "deepseek-v4",
            "name": "DeepSeek V4",
            "fav": false,
            "hidden": false,
            "priority": 1,
            "ctx": 256000,
            "modalities": [
              "text"
            ],
            "effort": [
              "low",
              "medium",
              "high"
            ],
            "fast": false,
            "toolSupport": "full",
            "evidence": [
              {
                "cap": "tool-use",
                "state": "supported",
                "source": "observed successful use",
                "at": "2026-08-05T10:18:00-07:00"
              }
            ]
          },
          {
            "id": "llama-4-maverick",
            "name": "Llama 4 Maverick",
            "fav": false,
            "hidden": false,
            "priority": 2,
            "ctx": 512000,
            "modalities": [
              "text",
              "image-in"
            ],
            "fast": false,
            "toolSupport": "partial",
            "evidence": [
              {
                "cap": "image-in",
                "state": "via-other-route",
                "source": "provider discovery",
                "at": "2026-08-03T11:00:00-07:00"
              }
            ]
          },
          {
            "id": "kimi-k2",
            "name": "Kimi K2",
            "fav": false,
            "hidden": false,
            "priority": 3,
            "ctx": 256000,
            "modalities": [
              "text"
            ],
            "fast": false,
            "toolSupport": "unknown",
            "evidence": [
              {
                "cap": "availability",
                "state": "temporarily-unavailable",
                "source": "provider discovery",
                "at": "2026-08-02T06:00:00-07:00"
              },
              {
                "cap": "tool-use",
                "state": "supported",
                "source": "user override",
                "at": "2026-08-05T10:20:00-07:00"
              }
            ],
            "unavailableReason": "Removed from the provider catalog on Aug 2. Saved routing that pointed here now falls back to DeepSeek V4."
          },
          {
            "id": "qwen3-coder-free",
            "name": "Qwen3 Coder (free tier)",
            "fav": false,
            "hidden": false,
            "priority": 4,
            "ctx": 128000,
            "modalities": [
              "text"
            ],
            "fast": false,
            "toolSupport": "partial",
            "evidence": [
              {
                "cap": "tool-use",
                "state": "likely",
                "source": "catalog declaration",
                "at": "2026-08-03T11:00:00-07:00"
              }
            ],
            "unavailableReason": "Needs the free ModelScope key - one setup step left."
          }
        ],
        "plans": [
          {
            "id": "plan-or-credit",
            "name": "Prepaid credit",
            "kind": "metered",
            "note": "Credit is shared by every model on this key."
          }
        ],
        "catalog": {
          "lastChecked": "2026-08-05T14:02:00-07:00",
          "lastActivated": "2026-08-03T11:00:05-07:00",
          "sourceVersion": "openrouter 2026-08-03",
          "state": "refreshing",
          "lastKnownGood": true,
          "materialChanges": [
            {
              "at": "2026-08-03T11:00:00-07:00",
              "what": "DeepSeek V4 free route rate limit halved.",
              "effect": "Fallback moves to the metered DeepSeek route sooner during busy hours."
            }
          ]
        },
        "whatNext": [
          "extra-balance",
          "free-models",
          "api-billing",
          "ask"
        ],
        "oauthNote": null
      },
      {
        "id": "local-ollama",
        "name": "Local server (Ollama)",
        "family": "Local",
        "groupKind": "server",
        "status": "ready",
        "statusNote": "Reachable at mac-studio.local:11434. No sign-in needed; models run on your own hardware.",
        "defaultAnswerBlock": {
          "connected": true,
          "accountInUse": "No account - local server",
          "billingRoute": "None. Costs are your own electricity and hardware.",
          "remaining": "Unlimited, bounded by hardware",
          "onExhaust": "Not applicable",
          "modelsAvail": "Qwen3 Coder 30B, Llama 4 Scout 17B",
          "attention": null
        },
        "accounts": [
          {
            "id": "ollama-server",
            "nickname": "mac-studio.local",
            "identity": "http://mac-studio.local:11434",
            "authOwner": "server",
            "isolation": "pm-managed",
            "enabled": true,
            "priority": 1,
            "sticky": false,
            "health": "ready",
            "usage": {
              "includedRemaining": "Not metered",
              "extra": "None",
              "resetAt": null,
              "pressure": "none",
              "lastUse": "2026-08-05T13:10:00-07:00"
            }
          }
        ],
        "connections": [
          {
            "id": "conn-ollama",
            "kind": "server",
            "route": "http://mac-studio.local:11434",
            "note": "Keyless local endpoint on your network. PM checks reachability at startup."
          }
        ],
        "models": [
          {
            "id": "qwen3-coder-30b",
            "name": "Qwen3 Coder 30B",
            "fav": false,
            "alias": "Offline coder",
            "hidden": false,
            "priority": 1,
            "ctx": 64000,
            "modalities": [
              "text"
            ],
            "fast": false,
            "toolSupport": "partial",
            "evidence": [
              {
                "cap": "tool-use",
                "state": "supported",
                "source": "observed successful use",
                "at": "2026-08-05T13:10:00-07:00"
              },
              {
                "cap": "fast-variant",
                "state": "unsupported",
                "source": "provider discovery",
                "at": "2026-08-01T09:00:00-07:00"
              },
              {
                "cap": "selectable-effort",
                "state": "unsupported",
                "source": "provider discovery",
                "at": "2026-08-01T09:00:00-07:00"
              }
            ]
          },
          {
            "id": "llama-4-scout-17b",
            "name": "Llama 4 Scout 17B",
            "fav": false,
            "hidden": false,
            "priority": 2,
            "ctx": 32000,
            "modalities": [
              "text"
            ],
            "fast": false,
            "toolSupport": "none",
            "evidence": [
              {
                "cap": "tool-use",
                "state": "unsupported",
                "source": "safe probe",
                "at": "2026-08-01T09:05:00-07:00"
              }
            ]
          }
        ],
        "plans": [],
        "catalog": {
          "lastChecked": "2026-08-05T13:00:00-07:00",
          "lastActivated": "2026-08-05T13:00:01-07:00",
          "sourceVersion": "ollama list 2026-08-05",
          "state": "fresh",
          "lastKnownGood": true
        },
        "whatNext": [],
        "oauthNote": null
      },
      {
        "id": "free-community",
        "name": "Free & community models",
        "family": "Puppet Master grouping",
        "groupKind": "free",
        "status": "ready",
        "statusNote": "A grouping over other connections, not its own credential store. Each free route keeps its own sign-in, limits, and terms.",
        "defaultAnswerBlock": {
          "connected": true,
          "accountInUse": "Varies by route - see each free route",
          "billingRoute": "No cost, with per-route qualifiers",
          "remaining": "Per route: rate limits, promo windows, or unmetered local use",
          "onExhaust": "Each route states its own behavior",
          "modelsAvail": "Mistral Small 3 (community), Qwen3 Coder free tier, local models",
          "attention": "One route still needs setup."
        },
        "accounts": [],
        "connections": [
          {
            "id": "conn-free-grouping",
            "kind": "grouping",
            "route": "Underlying providers listed per route",
            "note": "Setup for a free route opens the underlying provider connection and returns you here."
          }
        ],
        "models": [
          {
            "id": "mistral-small-3-community",
            "name": "Mistral Small 3 (community endpoint)",
            "fav": false,
            "hidden": false,
            "priority": 1,
            "ctx": 32000,
            "modalities": [
              "text"
            ],
            "fast": false,
            "toolSupport": "partial",
            "evidence": [
              {
                "cap": "tool-use",
                "state": "likely",
                "source": "catalog declaration",
                "at": "2026-08-04T07:00:00-07:00"
              }
            ]
          }
        ],
        "plans": [],
        "catalog": {
          "lastChecked": "2026-08-05T07:00:00-07:00",
          "lastActivated": "2026-08-05T07:00:02-07:00",
          "sourceVersion": "free-coding-models 2026-08-02",
          "state": "quarantined",
          "lastKnownGood": true,
          "quarantineReason": "The Aug 4 list update failed validation - three entries pointed at retired endpoints. The Aug 2 catalog is still serving.",
          "removedHistory": [
            {
              "at": "2026-07-28T09:00:00-07:00",
              "model": "Kimi K2 (free route)",
              "change": "no-longer-free",
              "note": "The host moved this endpoint behind a paid key; the community list now points at the metered route."
            },
            {
              "at": "2026-07-21T09:00:00-07:00",
              "model": "StarCoder2 15B",
              "change": "removed",
              "note": "The hosting endpoint was retired and no successor was published."
            }
          ]
        },
        "whatNext": [
          "ask"
        ],
        "oauthNote": null
      },
      {
        "id": "cursor-cli",
        "name": "Cursor CLI",
        "family": "Cursor",
        "groupKind": "tool",
        "status": "not-installed",
        "statusNote": "Not installed on this Mac. Install the Cursor CLI to route requests through a Cursor subscription.",
        "defaultAnswerBlock": {
          "connected": false,
          "accountInUse": "None",
          "billingRoute": "Cursor subscription (after install and sign-in)",
          "remaining": "Not applicable",
          "onExhaust": "Not applicable",
          "modelsAvail": "None until installed",
          "attention": "Install the CLI, then sign in inside its profile."
        },
        "accounts": [],
        "connections": [],
        "models": [],
        "plans": [],
        "catalog": {
          "lastChecked": null,
          "lastActivated": null,
          "sourceVersion": null,
          "state": "stale",
          "lastKnownGood": false
        },
        "whatNext": [],
        "oauthNote": null
      }
    ],
    "roles": [
      {
        "id": "role-assistant",
        "label": "Main Assistant",
        "assignedRoute": "Claude Sonnet 4.5 - Platyr Team",
        "quality": "high",
        "note": "Your day-to-day conversation partner."
      },
      {
        "id": "role-prd",
        "label": "PRD / Planning conversation",
        "assignedRoute": "Claude Opus 4.1 - Platyr Team",
        "quality": "high",
        "lockedHigh": true,
        "note": "Locked to high quality. PM never silently downgrades planning conversations because usage is low; changing this requires an explicit, qualified override."
      },
      {
        "id": "role-goal-worker",
        "label": "Goal worker",
        "assignedRoute": "GPT-5.2 - ChatGPT Pro",
        "quality": "standard",
        "note": "Does the bulk of Goal Mode implementation work."
      },
      {
        "id": "role-verifier",
        "label": "Verifier / Auditor",
        "assignedRoute": "Claude Opus 4.1 - Platyr Team",
        "quality": "high",
        "note": "Never grades its own work; always a different route than the worker."
      },
      {
        "id": "role-vision",
        "label": "Vision / media analysis",
        "assignedRoute": "Claude Sonnet 4.5 - Platyr Team",
        "quality": "standard",
        "note": "Reads screenshots and design references."
      },
      {
        "id": "role-compress",
        "label": "Compression / context maintenance",
        "assignedRoute": "Claude Haiku 4.5 - Platyr Team",
        "quality": "standard",
        "note": "Summarizes and compacts long threads."
      },
      {
        "id": "role-web",
        "label": "Web extraction",
        "assignedRoute": "DeepSeek V4 - OpenRouter",
        "quality": "standard",
        "note": "Bounded reading and extraction from fetched pages."
      },
      {
        "id": "role-approval",
        "label": "Approval review",
        "assignedRoute": "Claude Sonnet 4.5 - Platyr Team",
        "quality": "high",
        "note": "Summarizes risky actions before they reach you."
      },
      {
        "id": "role-mcp",
        "label": "MCP / tool routing",
        "assignedRoute": "Claude Haiku 4.5 - Platyr Team",
        "quality": "standard",
        "note": "Picks which tools a turn actually needs."
      },
      {
        "id": "role-skills",
        "label": "Skill search",
        "assignedRoute": "Qwen3 Coder 30B - local",
        "quality": "standard",
        "note": "Cheap, local, and good enough for catalog lookups."
      },
      {
        "id": "role-crew",
        "label": "Subagents / Crew roles",
        "assignedRoute": "Per Crew template",
        "quality": "standard",
        "note": "Each Crew member role carries its own route candidates."
      }
    ],
    "freeRoutes": [
      {
        "id": "fr-deepseek-free",
        "modelRef": "deepseek-v4",
        "qualifier": "rate-limited",
        "underlyingProviderId": "openrouter",
        "setupSteps": [
          {
            "title": "Nothing to set up",
            "body": "The free tier rides on your existing OpenRouter key. Requests are limited to 20 per minute and queue behind paid traffic."
          }
        ]
      },
      {
        "id": "fr-qwen3-coder",
        "modelRef": "qwen3-coder-free",
        "qualifier": "account-required",
        "underlyingProviderId": "openrouter",
        "setupSteps": [
          {
            "title": "Create a free ModelScope account",
            "body": "Sign up at modelscope.cn with an email address. No payment method is required."
          },
          {
            "title": "Create an access key",
            "body": "In the account console, create an API access key. Grant only the inference scope."
          },
          {
            "title": "Paste the key into the OpenRouter connection",
            "body": "PM stores it in the system keychain and verifies it with a safe readiness check, then returns you to the model row."
          }
        ]
      },
      {
        "id": "fr-mistral-community",
        "modelRef": "mistral-small-3-community",
        "qualifier": "keyless",
        "underlyingProviderId": "free-community",
        "setupSteps": [
          {
            "title": "No key needed",
            "body": "The community endpoint accepts anonymous requests. Availability varies with load; PM retries politely and reports honest failures."
          }
        ]
      },
      {
        "id": "fr-mistral-data-note",
        "modelRef": "mistral-small-3-community",
        "qualifier": "data-sharing",
        "underlyingProviderId": "free-community",
        "setupSteps": [
          {
            "title": "Read the data note",
            "body": "The community endpoint may retain prompts to improve the service. Do not send private code through this route; PM flags it in the picker."
          }
        ]
      },
      {
        "id": "fr-copilot-included",
        "modelRef": "gpt-5-2-copilot",
        "qualifier": "subscription-included",
        "underlyingProviderId": "copilot",
        "setupSteps": [
          {
            "title": "Renew the Copilot seat",
            "body": "Included model usage comes with an active Copilot Pro seat. Renew on github.com, then run the connection check."
          }
        ]
      },
      {
        "id": "fr-llama-promo",
        "modelRef": "llama-4-maverick",
        "qualifier": "promotional",
        "underlyingProviderId": "openrouter",
        "setupSteps": [
          {
            "title": "Promo window",
            "body": "Free through Aug 31 as a launch promotion, then standard credit pricing. PM will notify you before the window closes."
          }
        ]
      },
      {
        "id": "fr-kimi-paused",
        "modelRef": "kimi-k2",
        "qualifier": "temporarily-unavailable",
        "underlyingProviderId": "openrouter",
        "setupSteps": [
          {
            "title": "Route paused",
            "body": "The upstream provider removed this listing on Aug 2. The row stays here with its history; routing falls back to DeepSeek V4."
          }
        ]
      },
      {
        "id": "fr-local-qwen",
        "modelRef": "qwen3-coder-30b",
        "qualifier": "keyless",
        "underlyingProviderId": "local-ollama",
        "setupSteps": [
          {
            "title": "Runs on your own hardware",
            "body": "No account and no rate limit. Speed depends on the Mac Studio's load."
          }
        ]
      }
    ],
    "memory": [
      {
        "id": "g1",
        "text": "Jared prefers inline SVG icons and never emoji glyphs anywhere in this project.",
        "kind": "preference",
        "scope": "project",
        "state": "verified",
        "pinned": true,
        "halfLife": "protected while pinned",
        "lastRecall": "2026-08-05T09:40:00-07:00",
        "versions": [
          {
            "at": "2026-06-14T10:00:00-07:00",
            "note": "Created from a direct instruction"
          }
        ],
        "evidence": [
          {
            "source": "Chat, Jun 14",
            "quote": "hard rule: inline SVGs only, never emoji glyphs"
          }
        ]
      },
      {
        "id": "g2",
        "text": "The Plans update loop is edit, shard, index, seal-refresh, evidence-wave, then gates; 24 of 26 gates is the healthy baseline.",
        "kind": "project-fact",
        "scope": "project",
        "state": "verified",
        "pinned": true,
        "halfLife": "protected while pinned",
        "lastRecall": "2026-08-04T15:20:00-07:00",
        "versions": [
          {
            "at": "2026-07-23T13:00:00-07:00",
            "note": "Updated after the PMConcept7 promotion"
          }
        ],
        "evidence": [
          {
            "source": "MEMORY.md, plans-update-loop",
            "quote": "24/26 gates is the healthy baseline (2 pre-existing fails)"
          }
        ]
      },
      {
        "id": "g3",
        "text": "The user's app targets Slint 1.17.1 cross-platform; web-only effects need a Slint equivalent noted.",
        "kind": "project-fact",
        "scope": "project",
        "state": "verified",
        "pinned": false,
        "halfLife": "90 days",
        "lastRecall": "2026-08-01T11:00:00-07:00",
        "versions": [
          {
            "at": "2026-05-30T09:00:00-07:00",
            "note": "Created"
          }
        ],
        "evidence": [
          {
            "source": "Fableicon session notes",
            "quote": "user's app is Slint 1.17.1 cross-platform"
          }
        ]
      },
      {
        "id": "g4",
        "text": "Unquoted heredoc delimiters execute backticks in the body; write script files instead of large inline shell.",
        "kind": "lesson",
        "scope": "global",
        "state": "verified",
        "pinned": false,
        "halfLife": "180 days",
        "lastRecall": "2026-07-29T16:45:00-07:00",
        "versions": [
          {
            "at": "2026-07-02T14:30:00-07:00",
            "note": "Created after a shell mishap"
          }
        ],
        "evidence": [
          {
            "source": "Shell session, Jul 2",
            "quote": "the heredoc body ran `git status` via backticks"
          }
        ]
      },
      {
        "id": "g5",
        "text": "Jared usually reviews concept pages at 1280 and 760 widths first, then wide screens.",
        "kind": "preference",
        "scope": "project",
        "state": "awaiting-review",
        "pinned": false,
        "halfLife": "60 days",
        "lastRecall": "2026-08-02T10:10:00-07:00",
        "versions": [
          {
            "at": "2026-08-02T10:10:00-07:00",
            "note": "Inferred from three review sessions"
          }
        ],
        "evidence": [
          {
            "source": "Review sessions, Jul 28 - Aug 2",
            "quote": "checked 1280 then 760 before the 2200 pass"
          }
        ]
      },
      {
        "id": "g6",
        "text": "PMConcept7 is generated by build_pm7.py and must never be hand-edited.",
        "kind": "project-fact",
        "scope": "project",
        "state": "verified",
        "pinned": true,
        "halfLife": "protected while pinned",
        "lastRecall": "2026-08-03T09:00:00-07:00",
        "versions": [
          {
            "at": "2026-07-16T12:00:00-07:00",
            "note": "Created with the governance seals"
          }
        ],
        "evidence": [
          {
            "source": "MEMORY.md, pmconcept6-build",
            "quote": "never hand-edit PM7"
          }
        ]
      },
      {
        "id": "g7",
        "text": "Prefers squash merges for feature branches in this repository.",
        "kind": "preference",
        "scope": "project",
        "state": "awaiting-review",
        "pinned": false,
        "halfLife": "60 days",
        "lastRecall": "2026-07-30T14:00:00-07:00",
        "versions": [
          {
            "at": "2026-07-30T14:00:00-07:00",
            "note": "Inferred from merge history"
          }
        ],
        "evidence": [
          {
            "source": "Git history, July",
            "quote": "12 of 14 July merges were squashes"
          }
        ]
      },
      {
        "id": "g8",
        "text": "The settings inventory in Plans/settings_inventory.json is canon: 825 settings across 12 categories.",
        "kind": "project-fact",
        "scope": "project",
        "state": "verified",
        "pinned": false,
        "halfLife": "90 days",
        "lastRecall": "2026-08-05T08:15:00-07:00",
        "versions": [
          {
            "at": "2026-07-08T10:00:00-07:00",
            "note": "Created during the settings concepts work"
          }
        ],
        "evidence": [
          {
            "source": "Plans/settings_inventory.json",
            "quote": "schema_id pm-settings-inventory"
          }
        ]
      },
      {
        "id": "g9",
        "text": "Keep loading and calm states free of permanent animation; motion should settle.",
        "kind": "preference",
        "scope": "global",
        "state": "verified",
        "pinned": false,
        "halfLife": "120 days",
        "lastRecall": "2026-08-04T13:30:00-07:00",
        "versions": [
          {
            "at": "2026-06-20T11:00:00-07:00",
            "note": "Created from design reviews"
          }
        ],
        "evidence": [
          {
            "source": "Concept review, Jun 20",
            "quote": "calm state has zero permanent animation"
          }
        ]
      }
    ],
    "personas": [
      {
        "id": "p-assistant",
        "name": "Assistant",
        "role": "Primary conversation partner",
        "definitionSummary": "Warm, direct, keeps the thread on track, escalates honestly.",
        "runtime": {
          "eligible": true,
          "footprint": "1.1 kTokens"
        },
        "capsulePreview": "You are the user's main assistant in Puppet Master. Be direct, keep momentum, and surface blockers early.",
        "scopeDefault": "thread"
      },
      {
        "id": "p-collaborator",
        "name": "Collaborator",
        "role": "Pair-programming partner",
        "definitionSummary": "Thinks out loud, proposes small steps, asks before big changes.",
        "runtime": {
          "eligible": true,
          "footprint": "0.9 kTokens"
        },
        "capsulePreview": "Work as a pairing partner: narrate intent, prefer small reviewable steps.",
        "scopeDefault": "thread"
      },
      {
        "id": "p-general",
        "name": "General",
        "role": "Broad task execution",
        "definitionSummary": "Balanced defaults for tasks that fit no specialty.",
        "runtime": {
          "eligible": true,
          "footprint": "0.6 kTokens"
        },
        "capsulePreview": "Handle the task with balanced thoroughness and report succinctly.",
        "scopeDefault": "thread"
      },
      {
        "id": "p-overseer",
        "name": "Overseer",
        "role": "Coordination and delegation",
        "definitionSummary": "Splits work, assigns helpers, tracks progress, never does the leaf work itself.",
        "runtime": {
          "eligible": true,
          "footprint": "1.4 kTokens"
        },
        "capsulePreview": "Coordinate: decompose, delegate, integrate. Do not implement leaf tasks directly.",
        "scopeDefault": "thread"
      },
      {
        "id": "p-researcher",
        "name": "Researcher",
        "role": "Deep reading and synthesis",
        "definitionSummary": "Gathers sources, keeps citations, separates evidence from inference.",
        "runtime": {
          "eligible": true,
          "footprint": "1.2 kTokens"
        },
        "capsulePreview": "Research mode: collect, cite, and synthesize. Mark inference clearly.",
        "scopeDefault": "thread"
      },
      {
        "id": "p-explorer",
        "name": "Explorer",
        "role": "Codebase reconnaissance",
        "definitionSummary": "Maps unfamiliar code fast, reports structure before detail.",
        "runtime": {
          "eligible": true,
          "footprint": "0.8 kTokens"
        },
        "capsulePreview": "Explore first: map the territory, then drill into what matters.",
        "scopeDefault": "thread"
      },
      {
        "id": "p-bash",
        "name": "Bash",
        "role": "Shell-heavy operations",
        "definitionSummary": "Careful command construction, dry-runs where possible, quotes everything.",
        "runtime": {
          "eligible": true,
          "footprint": "0.7 kTokens"
        },
        "capsulePreview": "Shell specialist: prefer script files over long inline commands; verify before destructive steps.",
        "scopeDefault": "thread"
      },
      {
        "id": "p-teacher",
        "name": "Teacher",
        "role": "Explanation and onboarding",
        "definitionSummary": "Explains with structure and analogies, checks understanding.",
        "runtime": {
          "eligible": true,
          "footprint": "0.9 kTokens"
        },
        "capsulePreview": "Teach: build from what the user knows, one concept at a time.",
        "scopeDefault": "thread"
      },
      {
        "id": "p-patch-auditor",
        "name": "Patch Auditor",
        "role": "Child-only diff review",
        "childOnly": true,
        "definitionSummary": "Reviews another agent's diff against the plan. Exists only as a helper; never a Chat default.",
        "runtime": {
          "eligible": false,
          "footprint": "0.5 kTokens"
        },
        "capsulePreview": "Audit the diff against the stated plan. Report deviations; do not fix them yourself.",
        "scopeDefault": "thread"
      }
    ],
    "crew": [
      {
        "id": "crew-feature",
        "name": "Feature build crew",
        "purpose": "Implement a planned feature across code, tests, and docs.",
        "members": [
          {
            "role": "Lead",
            "persona": "Overseer",
            "routeCandidates": [
              "Claude Sonnet 4.5 - Platyr Team"
            ]
          },
          {
            "role": "Implementer A",
            "persona": "General",
            "routeCandidates": [
              "GPT-5.2 - ChatGPT Pro",
              "DeepSeek V4 - OpenRouter"
            ]
          },
          {
            "role": "Implementer B",
            "persona": "General",
            "routeCandidates": [
              "GPT-5.2 - ChatGPT Pro",
              "Qwen3 Coder 30B - local"
            ]
          },
          {
            "role": "Tester",
            "persona": "Bash",
            "routeCandidates": [
              "Qwen3 Coder 30B - local"
            ]
          },
          {
            "role": "Reviewer",
            "persona": "Patch Auditor",
            "routeCandidates": [
              "Claude Opus 4.1 - Platyr Team"
            ]
          }
        ],
        "routePolicy": "adaptive",
        "minMembers": 3,
        "maxMembers": 5,
        "requestedConcurrency": 5,
        "effectiveConcurrency": 2,
        "queuedWaves": 2,
        "guards": {
          "usage": "Stop at 30% of the provider window",
          "time": "90 minutes wall clock"
        },
        "reserve": "Keep 20% of the budget for synthesis, verification, and repair",
        "isolation": {
          "worktree": true,
          "paths": [
            "src/",
            "tests/",
            "docs/"
          ],
          "testResources": "Each member gets its own dev-server port from the 41xx pool; tests run serially."
        },
        "board": "Shared Crew board with claimed-task leases",
        "consensus": "Reviewer approval required before merge back",
        "spawning": {
          "depth": 1
        },
        "failure": "On repeated failure, shrink to lead plus one implementer and finish the smallest shippable slice"
      },
      {
        "id": "crew-docs",
        "name": "Docs sweep crew",
        "purpose": "Bring documentation in line with shipped behavior.",
        "members": [
          {
            "role": "Lead",
            "persona": "Overseer",
            "routeCandidates": [
              "Claude Sonnet 4.5 - Platyr Team"
            ]
          },
          {
            "role": "Writer",
            "persona": "Teacher",
            "routeCandidates": [
              "Claude Haiku 4.5 - Platyr Team"
            ]
          },
          {
            "role": "Fact checker",
            "persona": "Researcher",
            "routeCandidates": [
              "DeepSeek V4 - OpenRouter"
            ]
          }
        ],
        "routePolicy": "strict",
        "minMembers": 2,
        "maxMembers": 3,
        "requestedConcurrency": 3,
        "effectiveConcurrency": 3,
        "queuedWaves": 0,
        "guards": {
          "usage": "Stop at 15% of the provider window",
          "time": "45 minutes wall clock"
        },
        "reserve": "Keep 10% for final consistency pass",
        "isolation": {
          "worktree": true,
          "paths": [
            "docs/",
            "README.md"
          ],
          "testResources": "Docs previews share one static server; each member writes to its own output folder and checks run serially."
        },
        "board": "Shared Crew board",
        "consensus": "Lead signs off",
        "spawning": {
          "depth": 0
        },
        "failure": "Stop and report; docs work never falls back to unreviewed bulk edits"
      }
    ],
    "contextSources": {
      "normalControls": [
        "memory.retention.enabled",
        "memory.limits.auto-compress",
        "memory.assembly.project-rules",
        "memory.assembly.injected-context-breakdown",
        "memory.assembly.thread-context-override",
        "memory.assembly.parent-handoff",
        "memory.assembly.warn-route-change"
      ],
      "lastTurn": {
        "admitted": [
          {
            "source": "Current conversation (last 14 turns)",
            "tokens": 6100,
            "why": "Active thread"
          },
          {
            "source": "Project rules (Plans scope)",
            "tokens": 420,
            "why": "Scoped instructions for this folder"
          },
          {
            "source": "Assistant memory (3 pinned gists)",
            "tokens": 310,
            "why": "Pinned and relevant to settings work"
          },
          {
            "source": "Open file: pm-shell.css",
            "tokens": 1850,
            "why": "Referenced in your last message"
          },
          {
            "source": "Tool schemas (4 of 31 installed)",
            "tokens": 900,
            "why": "Selected for this turn by the routing role"
          }
        ],
        "omitted": [
          {
            "source": "Thread history older than Jul 30",
            "why": "Compacted; summary retained"
          },
          {
            "source": "27 installed tool schemas",
            "why": "Not selected for this turn - lazy exposure keeps them out"
          },
          {
            "source": "Goal ledger for the Fableicon run",
            "why": "Different goal; available on demand"
          },
          {
            "source": "Unpinned memories below the recall threshold",
            "why": "Faded from active context (half-life), still stored"
          }
        ]
      },
      "agentsChain": [
        {
          "path": "~/Documents/PuppetMaster/AGENTS.md",
          "precedence": 1
        },
        {
          "path": "~/Documents/PuppetMaster/Concepts/AGENTS.md",
          "precedence": 2
        },
        {
          "path": "~/Documents/PuppetMaster/Concepts/settings-redesign-concepts/AGENTS.md",
          "precedence": 3
        }
      ],
      "personaFootprint": "Assistant capsule: 1.1 kTokens",
      "toolsSelectedVsInstalled": {
        "selected": [
          "read-file",
          "edit-file",
          "run-command",
          "search-project"
        ],
        "installed": [
          "read-file",
          "edit-file",
          "run-command",
          "search-project",
          "web-search",
          "web-fetch",
          "github-issues",
          "github-prs",
          "linear-issues",
          "browser-preview",
          "screenshot",
          "list-worktrees",
          "memory-search",
          "usage-report"
        ]
      },
      "cacheStrategy": {
        "strategy": "Stable prefix caching",
        "note": "App rules, project rules, and the selected tool schemas are assembled in a fixed order so the cached prefix survives across turns. Reordering or editing any of them starts a new prefix and the cache is rebuilt.",
        "prefixHash": "pfx-8c31d2",
        "sourceHashes": [
          {
            "source": "App rules",
            "hash": "a41f09"
          },
          {
            "source": "Project rules (Plans scope)",
            "hash": "77c2be"
          },
          {
            "source": "Tool schemas (selected set)",
            "hash": "0d93aa"
          }
        ]
      }
    },
    "mcp": [
      {
        "id": "mcp-github",
        "name": "GitHub",
        "transport": "http",
        "protocol": {
          "requested": "2026-03-26",
          "negotiated": "2026-03-26"
        },
        "auth": "OAuth (PM direct sign-in)",
        "health": "connected",
        "scope": "global",
        "tools": [
          {
            "name": "github-issues",
            "exposed": true
          },
          {
            "name": "github-prs",
            "exposed": true
          },
          {
            "name": "github-actions",
            "exposed": false
          }
        ],
        "lazyExposure": true,
        "approval": {
          "mode": "session",
          "perTool": {
            "github-actions": "once"
          }
        },
        "logsSample": [
          "14:02:11 connected in 240 ms, 3 tools discovered",
          "14:02:11 exposing 2 of 3 tools (lazy exposure)",
          "13:15:40 github-prs list succeeded, 18 results"
        ],
        "resources": [
          {
            "name": "Repository readme",
            "kind": "resource",
            "note": "The default-branch readme, refreshed each time the server reconnects."
          },
          {
            "name": "Open pull request",
            "kind": "template",
            "note": "Fill in a PR number to pull that request's description and review threads."
          },
          {
            "name": "Workflow run log",
            "kind": "template",
            "note": "Fill in a run id to fetch the log for a single Actions run."
          }
        ],
        "extensions": [
          {
            "name": "Code search",
            "note": "Adds repository-wide code search beyond the standard tool set."
          }
        ],
        "cache": {
          "lastDiscovery": "2026-08-05 14:02",
          "freshness": "fresh",
          "note": "Tools and resources were rediscovered on the last connect, about an hour ago."
        },
        "projection": {
          "claudeCli": true,
          "note": "Also projected read-only into the Claude CLI's MCP config; Puppet Master remains the owner."
        }
      },
      {
        "id": "mcp-fs",
        "name": "Project files (local)",
        "transport": "stdio",
        "protocol": {
          "requested": "2026-03-26",
          "negotiated": "2025-11-05"
        },
        "auth": "None - local process",
        "health": "connected",
        "scope": "project",
        "tools": [
          {
            "name": "read-file",
            "exposed": true
          },
          {
            "name": "edit-file",
            "exposed": true
          },
          {
            "name": "search-project",
            "exposed": true
          }
        ],
        "lazyExposure": true,
        "approval": {
          "mode": "persistent"
        },
        "logsSample": [
          "09:00:02 started, negotiated protocol 2025-11-05 (server is one revision behind)",
          "09:00:02 3 tools discovered, all exposed"
        ],
        "resources": [
          {
            "name": "Project tree",
            "kind": "resource",
            "note": "A live listing of the project's files and folders, honoring ignore rules."
          },
          {
            "name": "File contents",
            "kind": "template",
            "note": "Fill in a path to read one file without exposing the whole tree."
          }
        ],
        "cache": {
          "lastDiscovery": "2026-08-05 09:00",
          "freshness": "stale",
          "note": "Last discovery ran at startup this morning; reconnect to pick up anything added since."
        },
        "projection": {
          "claudeCli": true,
          "note": "Also projected read-only into the Claude CLI's MCP config; Puppet Master remains the owner."
        }
      },
      {
        "id": "mcp-linear",
        "name": "Linear",
        "transport": "sse",
        "protocol": {
          "requested": "2026-03-26",
          "negotiated": null
        },
        "auth": "OAuth (PM direct sign-in)",
        "health": "disconnected",
        "scope": "project",
        "tools": [
          {
            "name": "linear-issues",
            "exposed": false
          }
        ],
        "lazyExposure": true,
        "approval": {
          "mode": "once"
        },
        "logsSample": [
          "13:58:19 connection lost: stream closed by remote",
          "13:58:20 reconnect attempt 1 failed: 502",
          "13:59:04 reconnect attempt 2 failed: 502 - backing off, tools hidden from agents"
        ],
        "resources": [],
        "cache": {
          "lastDiscovery": "2026-08-04 16:41",
          "freshness": "stale",
          "note": "Nothing has been rediscovered since yesterday because the server is unreachable."
        },
        "projection": {
          "claudeCli": false,
          "note": "Not projected into the Claude CLI; this connection is used by Puppet Master only."
        }
      }
    ],
    "lsp": [
      {
        "id": "lsp-rust",
        "language": "Rust",
        "state": "installed",
        "version": "rust-analyzer 2026-07-28",
        "scope": "project",
        "startup": "On first Rust file",
        "capabilities": "Diagnostics, completion, formatting, symbols",
        "conflicts": null,
        "executable": "~/.local/share/puppet-master/lsp/rust-analyzer",
        "formatting": "This server",
        "diagnosticsOwner": "This server",
        "health": "running",
        "logsSample": [
          {
            "at": "09:00:05",
            "line": "Server started for workspace puppet-master-rs, index warm in 3.2 s"
          },
          {
            "at": "11:42:18",
            "line": "Reloaded after Cargo.toml change, 2 crates re-indexed"
          },
          {
            "at": "13:07:51",
            "line": "Published 0 diagnostics for src/main.rs"
          }
        ]
      },
      {
        "id": "lsp-ts",
        "language": "TypeScript / JavaScript",
        "state": "detected",
        "version": "typescript-language-server 4.9 (found on PATH)",
        "scope": "project",
        "startup": "On first TS/JS file",
        "capabilities": "Diagnostics, completion, symbols",
        "conflicts": "Formatting is owned by the project's Prettier config, not the server",
        "executable": "Auto-detected",
        "formatting": "Prettier plugin",
        "diagnosticsOwner": "This server",
        "health": "running",
        "logsSample": [
          {
            "at": "09:14:22",
            "line": "Found typescript-language-server 4.9 on PATH, starting for this project"
          },
          {
            "at": "10:03:47",
            "line": "Formatting request deferred to the project's Prettier config"
          }
        ]
      },
      {
        "id": "lsp-python",
        "language": "Python",
        "state": "missing",
        "version": null,
        "scope": "project",
        "startup": "Not started",
        "capabilities": "None until installed",
        "conflicts": null,
        "executable": "Auto-detected",
        "formatting": "Editor formatter",
        "diagnosticsOwner": "Testing system",
        "health": "not-installed",
        "logsSample": [
          {
            "at": "09:00:03",
            "line": "No Python language server found on this machine"
          },
          {
            "at": "09:00:03",
            "line": "Python files will open without diagnostics until one is installed"
          }
        ]
      },
      {
        "id": "lsp-slint",
        "language": "Slint",
        "state": "installed",
        "version": "slint-lsp 1.17.1",
        "scope": "project",
        "startup": "On first .slint file",
        "capabilities": "Diagnostics, completion, live preview",
        "conflicts": null,
        "executable": "~/.cargo/bin/slint-lsp",
        "formatting": "This server",
        "diagnosticsOwner": "This server",
        "health": "stopped",
        "logsSample": [
          {
            "at": "12:20:09",
            "line": "Server stopped after 30 minutes with no open .slint files"
          },
          {
            "at": "12:20:09",
            "line": "Will start again the next time a .slint file is opened"
          }
        ]
      }
    ],
    "skills": [
      {
        "id": "sk-shard-plans",
        "name": "Shard Plans",
        "source": "Project (scripts/pm-shard-plans.py)",
        "permissions": "Runs one allowlisted script",
        "enabled": true,
        "trusted": true,
        "scope": "project"
      },
      {
        "id": "sk-release-notes",
        "name": "Release notes drafter",
        "source": "Catalog (verified publisher)",
        "permissions": "Reads git history; writes to drafts only",
        "enabled": true,
        "trusted": true,
        "scope": "global"
      },
      {
        "id": "sk-db-migrate",
        "name": "Database migration helper",
        "source": "Catalog (community)",
        "permissions": "Requests shell and file write",
        "enabled": false,
        "trusted": false,
        "scope": "project"
      },
      {
        "id": "sk-icon-recolor",
        "name": "Fableicon recolor",
        "source": "Project (Concepts/Fableicon/generate.py)",
        "permissions": "Runs one allowlisted script",
        "enabled": true,
        "trusted": true,
        "scope": "project"
      }
    ],
    "plugins": [
      {
        "id": "pl-conventional",
        "name": "Conventional commits",
        "lifecycle": "active",
        "compat": "Compatible with PM 1.4",
        "permissions": "Reads staged changes",
        "channel": "stable"
      },
      {
        "id": "pl-figma",
        "name": "Figma import",
        "lifecycle": "update-available",
        "compat": "Update 2.1 supports the new frame API",
        "permissions": "Network access to figma.com",
        "channel": "stable"
      },
      {
        "id": "pl-timeline",
        "name": "Thread timeline",
        "lifecycle": "failed",
        "compat": "Broke against PM 1.4",
        "permissions": "Reads thread metadata",
        "channel": "canary",
        "failed": "Disabled after two crashes on load. The author has been notified; a fix is in review."
      }
    ],
    "tools": [
      {
        "id": "t-read-file",
        "name": "Read file",
        "installed": true,
        "projectEnabled": true,
        "available": true,
        "selectedThisTurn": true,
        "invokedRecently": true,
        "risk": "low",
        "approval": "Allowed"
      },
      {
        "id": "t-edit-file",
        "name": "Edit file",
        "installed": true,
        "projectEnabled": true,
        "available": true,
        "selectedThisTurn": true,
        "invokedRecently": true,
        "risk": "medium",
        "approval": "Auto within FileSafe"
      },
      {
        "id": "t-run-command",
        "name": "Run command",
        "installed": true,
        "projectEnabled": true,
        "available": true,
        "selectedThisTurn": true,
        "invokedRecently": false,
        "risk": "high",
        "approval": "Ask unless allowlisted"
      },
      {
        "id": "t-web-search",
        "name": "Web search",
        "installed": true,
        "projectEnabled": true,
        "available": true,
        "selectedThisTurn": false,
        "invokedRecently": true,
        "risk": "low",
        "approval": "Allowed"
      },
      {
        "id": "t-linear-issues",
        "name": "Linear issues (MCP)",
        "installed": true,
        "projectEnabled": true,
        "available": false,
        "selectedThisTurn": false,
        "invokedRecently": false,
        "risk": "low",
        "approval": "Allowed - currently unavailable while the Linear server is disconnected"
      },
      {
        "id": "t-screenshot",
        "name": "Screenshot",
        "installed": true,
        "projectEnabled": false,
        "available": false,
        "selectedThisTurn": false,
        "invokedRecently": false,
        "risk": "medium",
        "approval": "Disabled for this project"
      }
    ],
    "commandsInfo": {
      "shortcuts": [
        {
          "keys": "Cmd+K",
          "command": "Open command palette",
          "scope": "Global"
        },
        {
          "keys": "Cmd+Enter",
          "command": "Send message",
          "scope": "Chat"
        },
        {
          "keys": "Cmd+Shift+F",
          "command": "Search all settings",
          "scope": "Settings"
        },
        {
          "keys": "Cmd+.",
          "command": "Show spelling suggestions",
          "scope": "Any text field"
        },
        {
          "keys": "Cmd+Shift+M",
          "command": "Toggle reduced motion",
          "scope": "Global"
        }
      ],
      "customCommands": [
        {
          "name": "/gates",
          "runs": "python3 scripts/pm-plans-verify.py run-gates",
          "scope": "Project"
        },
        {
          "name": "/shard",
          "runs": "python3 scripts/pm-shard-plans.py --generate",
          "scope": "Project"
        }
      ],
      "conflicts": [
        {
          "keys": "Cmd+Shift+M",
          "between": [
            "Toggle reduced motion",
            "Figma import: open frame picker"
          ],
          "resolution": "The global binding wins; the plugin binding is suspended and flagged here"
        }
      ]
    },
    "terminalProfiles": [
      {
        "id": "tp-default",
        "name": "Default",
        "shell": "zsh",
        "shellSource": "auto-detected",
        "font": "SF Mono",
        "fontSize": 13,
        "lineHeight": 1.35,
        "fg": "#e6e6e6",
        "bg": "#141418",
        "ansi": [
          "#141418",
          "#ff6b6b",
          "#69d58c",
          "#e8c66a",
          "#6aa8ff",
          "#c792ea",
          "#5fd0d8",
          "#d0d0d0",
          "#4a4a52",
          "#ff8f8f",
          "#8ce8ab",
          "#f2d98a",
          "#8fc0ff",
          "#dcb0f2",
          "#84e0e8",
          "#ffffff"
        ],
        "opacity": 1,
        "cursor": "block, blinking off",
        "selection": "Theme accent at 30%",
        "copyOnSelect": true,
        "cwdPolicy": "Project root",
        "envPolicy": "Inherit, minus provider keys",
        "retention": "7 days",
        "renderer": "GPU",
        "startup": "None",
        "default": true,
        "pastePolicy": "Confirm multi-line pastes",
        "linkPolicy": "Cmd-click opens links",
        "logsSample": [
          {
            "at": "2026-08-05T13:58:12-07:00",
            "line": "$ git status --short"
          },
          {
            "at": "2026-08-05T13:58:12-07:00",
            "line": " M Concepts/settings-redesign-concepts/fable/_shared/pm-demo-data.js"
          },
          {
            "at": "2026-08-05T13:59:03-07:00",
            "line": "$ npm run lint -- --quiet"
          }
        ]
      },
      {
        "id": "tp-build",
        "name": "Build logs",
        "shell": "zsh",
        "shellSource": "inherit",
        "font": "JetBrains Mono",
        "fontSize": 12,
        "lineHeight": 1.25,
        "fg": "#cfd8dc",
        "bg": "#101418",
        "ansi": [
          "#101418",
          "#ef5350",
          "#66bb6a",
          "#ffca28",
          "#42a5f5",
          "#ab47bc",
          "#26c6da",
          "#cfd8dc",
          "#455a64",
          "#ff8a80",
          "#b9f6ca",
          "#ffe57f",
          "#82b1ff",
          "#ea80fc",
          "#84ffff",
          "#ffffff"
        ],
        "opacity": 1,
        "cursor": "underline",
        "selection": "Theme accent at 30%",
        "copyOnSelect": false,
        "cwdPolicy": "Project root",
        "envPolicy": "Inherit, minus provider keys",
        "retention": "24 hours",
        "renderer": "GPU",
        "startup": "tail -f the active build log",
        "default": false,
        "pastePolicy": "Paste as typed",
        "linkPolicy": "Links never open automatically",
        "logsSample": [
          {
            "at": "2026-08-05T12:41:07-07:00",
            "line": "cargo build --release"
          },
          {
            "at": "2026-08-05T12:44:52-07:00",
            "line": "Compiling puppet-master v0.9.3"
          },
          {
            "at": "2026-08-05T12:47:19-07:00",
            "line": "Finished release [optimized] target(s) in 6m 12s"
          }
        ]
      },
      {
        "id": "tp-server",
        "name": "Dev server",
        "shell": "bash",
        "shellSource": "custom",
        "font": "SF Mono",
        "fontSize": 13,
        "lineHeight": 1.35,
        "fg": "#dcdcdc",
        "bg": "#16161a",
        "ansi": [
          "#16161a",
          "#f07178",
          "#c3e88d",
          "#ffcb6b",
          "#82aaff",
          "#c792ea",
          "#89ddff",
          "#d6d6d6",
          "#525252",
          "#ff9cac",
          "#ddffa7",
          "#ffe585",
          "#9cc4ff",
          "#e1acff",
          "#a3f7ff",
          "#ffffff"
        ],
        "opacity": 1,
        "cursor": "bar",
        "selection": "Theme accent at 30%",
        "copyOnSelect": true,
        "cwdPolicy": "Remembered per profile",
        "envPolicy": "Custom allowlist",
        "retention": "Session only",
        "renderer": "GPU",
        "startup": "npm run dev",
        "default": false,
        "pastePolicy": "Confirm multi-line pastes",
        "linkPolicy": "Cmd-click opens links",
        "logsSample": [
          {
            "at": "2026-08-05T14:02:33-07:00",
            "line": "Listening on http://localhost:4173"
          },
          {
            "at": "2026-08-05T14:05:10-07:00",
            "line": "GET /settings 200 12ms"
          }
        ]
      }
    ],
    "media": [
      {
        "id": "m-image-gen",
        "providerRef": "openai-codex",
        "purpose": "image-gen",
        "native": true,
        "output": {
          "location": "artifacts/media/",
          "format": "PNG"
        },
        "safety": "Provider content policy applies; blocked prompts return an honest refusal receipt",
        "costRoute": "ChatGPT Pro included usage",
        "fallbackRef": null,
        "history": [
          {
            "at": "2026-08-04T15:12:00-07:00",
            "what": "Generated 2 dashboard mockup images",
            "ok": true
          },
          {
            "at": "2026-08-02T09:30:00-07:00",
            "what": "Generated app icon variations (4)",
            "ok": true
          }
        ]
      },
      {
        "id": "m-vision",
        "providerRef": "claude",
        "purpose": "vision",
        "native": true,
        "output": {
          "location": "inline analysis",
          "format": "text"
        },
        "safety": "Screenshots pass the redaction profile before upload",
        "costRoute": "Claude Max included usage",
        "fallbackRef": "openai-codex",
        "history": [
          {
            "at": "2026-08-05T11:40:00-07:00",
            "what": "Read a settings screenshot for layout review",
            "ok": true
          }
        ]
      },
      {
        "id": "m-audio-in",
        "providerRef": "local-ollama",
        "purpose": "audio-in",
        "native": false,
        "transformNote": "Voice input is transcribed locally by PM's whisper-small runner, then sent as text. No audio leaves the machine.",
        "output": {
          "location": "inline text",
          "format": "text"
        },
        "safety": "Local only",
        "costRoute": "None - local compute",
        "fallbackRef": null,
        "history": [
          {
            "at": "2026-08-03T16:20:00-07:00",
            "what": "Transcribed a 40-second voice note",
            "ok": true
          }
        ]
      },
      {
        "id": "m-video",
        "providerRef": null,
        "purpose": "video",
        "native": false,
        "output": {
          "location": "artifacts/media/",
          "format": "MP4"
        },
        "safety": "Not applicable until a provider is connected",
        "costRoute": "None configured",
        "fallbackRef": null,
        "history": [
          {
            "at": "2026-08-01T10:00:00-07:00",
            "what": "Video generation requested; no provider offers it",
            "ok": false
          }
        ]
      }
    ],
    "spell": {
      "personal": [
        "Platyr",
        "Fableicon",
        "worktree",
        "worktrees",
        "subagent",
        "subagents",
        "Orbitron",
        "Rajdhani"
      ],
      "project": [
        "PuppetMaster",
        "PlanUnit",
        "PlanUnits",
        "scrollspy",
        "FileSafe",
        "Tastebook",
        "GoalRun",
        "Slint"
      ],
      "packs": [
        {
          "lang": "English (US)",
          "installed": true
        },
        {
          "lang": "English (UK)",
          "installed": true
        },
        {
          "lang": "German",
          "installed": false
        },
        {
          "lang": "French",
          "installed": false
        }
      ],
      "misspellings": {
        "teh": "the",
        "recieve": "receive",
        "seperate": "separate",
        "definately": "definitely",
        "occured": "occurred",
        "accross": "across",
        "untill": "until",
        "wich": "which"
      }
    },
    "usageSnapshot": {
      "usagePage": true,
      "note": "Read-only snapshot. Balances, history, and forecasts live on the Usage page; Settings never recalculates them.",
      "perProvider": {
        "claude": {
          "includedRemaining": "Personal Max 0%, Platyr Team 92%",
          "extra": "$12.40 extra balance on Personal Max",
          "resetAt": "2026-08-05T16:00:00-07:00",
          "pressure": "high",
          "lastUse": "2026-08-05T14:07:00-07:00",
          "projection": "Comfortable on Platyr Team through the afternoon",
          "freshness": "Provider-reported, 3 minutes ago"
        },
        "openai-codex": {
          "includedRemaining": "64% of the weekly window",
          "extra": "None",
          "resetAt": "2026-08-09T00:00:00-07:00",
          "pressure": "low",
          "lastUse": "2026-08-05T12:55:00-07:00",
          "projection": "Outlasts its reset at the current pace",
          "freshness": "Provider-reported, 20 minutes ago"
        },
        "copilot": {
          "includedRemaining": "Unknown - readiness check fails",
          "extra": "None",
          "resetAt": null,
          "pressure": "unknown",
          "lastUse": "2026-08-01T07:44:00-07:00",
          "projection": "Unavailable until the seat renews",
          "freshness": "Last successful report Aug 1"
        },
        "openrouter": {
          "includedRemaining": "$31.75 credit",
          "extra": "None",
          "resetAt": null,
          "pressure": "low",
          "lastUse": "2026-08-05T10:18:00-07:00",
          "projection": "About three weeks at the July pace",
          "freshness": "Measured locally, 4 hours ago"
        },
        "antigravity": {
          "includedRemaining": "Unknown while signed out",
          "extra": "None",
          "resetAt": null,
          "pressure": "unknown",
          "lastUse": "2026-07-31T18:22:00-07:00",
          "projection": "Unavailable until sign-in",
          "freshness": "Last successful report Jul 31"
        },
        "local-ollama": {
          "includedRemaining": "Not metered",
          "extra": "None",
          "resetAt": null,
          "pressure": "none",
          "lastUse": "2026-08-05T13:10:00-07:00",
          "projection": "Bounded by hardware only",
          "freshness": "Measured locally, 1 hour ago"
        }
      }
    },
    "operational": {
      "configuredCeiling": 8,
      "sustainableNow": 2,
      "reason": "Claude included usage on the active account resets at 4:00 PM; large fan-outs before then would stall mid-wave.",
      "waveWarning": "Starting eight agents now is unlikely to finish before the provider resets. PM recommends two concurrent agents and three waves."
    }
  };

}());
