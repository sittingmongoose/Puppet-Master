/* ============================================================================
   concepts/concord/data.js — Concord family fixtures (window.CONCORD_DATA)
   ----------------------------------------------------------------------------
   Families: Context & Instructions, Memory, Personas, Goal & Automation,
   Crew, Permissions & FileSafe, Back Seat Driver.
   Plain object, no dependencies. Concord seeds its mutable slices into
   PMStore at boot (see concord.js); this file is the immutable seed.
   ========================================================================== */
(function () {
  "use strict";

  window.CONCORD_DATA = {
    /* Managers Concord owns (merged into the search index) */
    managerMeta: {
      context: { id: "context", title: "Context and Instructions", purpose: "Retrieval toggles, instruction sources, and the admission receipt", icon: "stack" },
      memory: { id: "memory", title: "Memory", purpose: "Evidence-backed Gists with review, pinning, and fading", icon: "spark" },
      personas: { id: "personas", title: "Personas", purpose: "Behavior definitions with explicit scopes and provenance", icon: "mask" },
      goal: { id: "goal", title: "Goal and Automation", purpose: "Defaults, ceilings, and verification policy", icon: "compass" },
      crew: { id: "crew", title: "Crew", purpose: "Reusable multi-agent execution templates", icon: "users" },
      permissions: { id: "permissions", title: "Permissions and FileSafe", purpose: "Approval rules, matrices, and the FileSafe floor", icon: "shield" },
      bsd: { id: "bsd", title: "Back Seat Driver", purpose: "A read-only second opinion with bounded access", icon: "eye" }
    },

    /* Concord-specific typed search entries */
    actions: [
      { id: "open-admission-receipt", title: "Open the context admission receipt", terms: "context included omitted blocks request provenance", kind: "diagnostic", subtitle: "Diagnostics", target: { manager: "context", tab: "receipt" } },
      { id: "rebuild-memory", title: "Rebuild the memory index", terms: "memory reindex rebuild dedupe", kind: "action", target: { manager: "memory", tab: "maintenance" } },
      { id: "bsd-health", title: "Back Seat Driver health", terms: "bsd status last review latency", kind: "status", subtitle: "Status", target: { manager: "bsd", tab: "overview" } },
      { id: "filesafe-floor", title: "FileSafe floor status", terms: "filesafe boundary protected scopes floor", kind: "status", subtitle: "Status", target: { manager: "permissions", tab: "filesafe" } },
      { id: "persona-import", title: "Import a persona", terms: "persona import diff trust scan", kind: "workflow", subtitle: "Setup workflow", target: { manager: "personas", tab: "gallery" } }
    ],

    /* ---------- Context & Instructions ---------- */
    contextSources: [
      { id: "scoped-instructions", label: "Scoped project instructions", kind: "instructions", enabled: true, included: true, tokens: 1180, lightness: "light", detail: "AGENTS.md chain: user → project → folder; nearest scope wins" },
      { id: "previous-chats", label: "Relevant previous chats", kind: "history", enabled: true, included: true, tokens: 640, lightness: "light", detail: "2 excerpts from threads settings-ia, release-prep" },
      { id: "project-code", label: "Relevant project code", kind: "code", enabled: true, included: false, tokens: 0, lightness: "—", detail: "No retrieval fired on the last request" },
      { id: "run-logs", label: "Relevant logs", kind: "logs", enabled: true, included: false, tokens: 0, lightness: "—", detail: "Not needed for the last request" },
      { id: "parent-summary", label: "Parent-agent summary", kind: "handoff", enabled: true, included: false, tokens: 0, lightness: "—", detail: "This is a root conversation" },
      { id: "attempt-journal", label: "Current attempt journal", kind: "journal", enabled: false, included: false, tokens: 0, lightness: "—", detail: "Disabled — earlier failure context is withheld" },
      { id: "persona-capsule", label: "Persona capsule", kind: "persona", enabled: true, included: true, tokens: 210, lightness: "light", detail: "Collaborator capsule, 210 tokens" },
      { id: "tool-schemas", label: "Selected tool schemas", kind: "tools", enabled: true, included: true, tokens: 2940, lightness: "moderate", detail: "14 of 22 installed tools admitted (progressive exposure)" }
    ],
    precedenceChain: [
      { scope: "User", source: "%USERPROFILE%\\.pm\\AGENTS.md", hash: "a41f…9c", result: "admitted" },
      { scope: "Project", source: "P:\\AGENTS.md", hash: "7be2…11", result: "admitted — overrides User on conflicts" },
      { scope: "Folder", source: "P:\\Concepts\\AGENTS.md", hash: "55d0…e8", result: "admitted — nearest scope wins in this folder" }
    ],
    lastRequest: {
      at: "2026-08-11 08:41:12",
      included: ["System prompt (fixed)", "Persona capsule — Collaborator", "AGENTS.md chain (3 scopes)", "2 previous-chat excerpts", "14 tool schemas", "Project index digest"],
      omitted: ["Attempt journal (disabled)", "Run logs (not retrieved)", "Memory Gist g-102 (awaiting review)", "Memory Gist g-104 (awaiting review)", "Memory Gist g-107 (awaiting review)"]
    },
    compaction: {
      strategy: "Summarize oldest third, keep the last 6 turns verbatim",
      cacheCompatibility: "Compatible with the current route (Anthropic prompt cache)",
      retrievalCaps: "Per-source cap 800 tokens; total retrieval cap 3,200 tokens"
    },

    /* ---------- Memory (evidence ledger) ---------- */
    memory: {
      halfLifeNote: "Half-life changes retrieval activation only — fading never deletes a memory or marks it false.",
      gists: [
        { id: "g-101", text: "Prefers terse commit messages in Conventional Commits style", kind: "preference", scope: "assistant", status: "verified", pinned: true, halfLifeDays: 90, activation: 0.92, lastAccess: "2026-08-10", evidence: ["Thread: release-prep, 2026-07-30", "Thread: api-cleanup, 2026-07-22"], versions: [
          { at: "2026-08-02", note: "Tightened wording after review", text: "Prefers terse commit messages in Conventional Commits style" },
          { at: "2026-07-24", note: "First verified version", text: "Likes short Conventional Commits messages" }
        ] },
        { id: "g-102", text: "The staging deploy runs from the release branch, not main", kind: "fact", scope: "project", status: "awaiting-review", pinned: false, halfLifeDays: 60, activation: 0.55, lastAccess: "2026-08-01", evidence: ["Thread: deploy-fix, 2026-08-01"], versions: [{ at: "2026-08-01", note: "Captured from a debugging session", text: "The staging deploy runs from the release branch, not main" }] },
        { id: "g-103", text: "Chose Slint over egui for the desktop shell", kind: "decision", scope: "project", status: "verified", pinned: true, halfLifeDays: 180, activation: 0.88, lastAccess: "2026-07-28", evidence: ["Plan: desktop-shell, 2026-07-20", "Thread: ui-frameworks, 2026-07-19"], versions: [
          { at: "2026-07-21", note: "Recorded after the plan was sealed", text: "Chose Slint over egui for the desktop shell" },
          { at: "2026-07-20", note: "Candidate wording", text: "Leaning toward Slint for the shell" }
        ] },
        { id: "g-104", text: "The terminal profile inherits the app locale unless overridden", kind: "gotcha", scope: "project", status: "awaiting-review", pinned: false, halfLifeDays: 45, activation: 0.4, lastAccess: "2026-07-31", evidence: ["Log: terminal-spawn, 2026-07-31"], versions: [{ at: "2026-07-31", note: "Captured from a log line", text: "The terminal profile inherits the app locale unless overridden" }] },
        { id: "g-105", text: "Likes explanations to lead with the tradeoff", kind: "preference", scope: "assistant", status: "verified", pinned: false, halfLifeDays: 120, activation: 0.77, lastAccess: "2026-08-03", evidence: ["Thread: settings-ia, 2026-08-02"], versions: [{ at: "2026-08-02", note: "Verified during the thread", text: "Likes explanations to lead with the tradeoff" }] },
        { id: "g-106", text: "The Concepts folder is validated by ConceptHub validate.py", kind: "fact", scope: "project", status: "verified", pinned: false, halfLifeDays: 90, activation: 0.81, lastAccess: "2026-08-05", evidence: ["File: CONCEPT_RULES.md", "Run: validate, 2026-08-04"], versions: [{ at: "2026-08-04", note: "Verified against the rules file", text: "The Concepts folder is validated by ConceptHub validate.py" }] },
        { id: "g-107", text: "Free Models routes can disappear without notice", kind: "gotcha", scope: "project", status: "awaiting-review", pinned: false, halfLifeDays: 30, activation: 0.22, lastAccess: "2026-07-25", evidence: ["Log: free-route-404, 2026-07-25"], versions: [{ at: "2026-07-25", note: "Captured after a 404", text: "Free Models routes can disappear without notice" }] },
        { id: "g-108", text: "The settings redesign uses a three-surface architecture", kind: "decision", scope: "project", status: "verified", pinned: true, halfLifeDays: 180, activation: 0.95, lastAccess: "2026-08-05", evidence: ["Packet: settings bakeoff, 2026-08-05"], versions: [{ at: "2026-08-05", note: "Sealed with the packet", text: "The settings redesign uses a three-surface architecture" }] },
        { id: "g-109", text: "Jared reviews diffs line by line before merging", kind: "preference", scope: "assistant-hidden", status: "verified", pinned: false, halfLifeDays: 150, activation: 0.7, lastAccess: "2026-08-06", evidence: ["Observation across 14 merges"], versions: [{ at: "2026-08-06", note: "Assistant-only observation", text: "Jared reviews diffs line by line before merging" }], hidden: true }
      ]
    },

    /* ---------- Personas ---------- */
    personas: [
      {
        id: "assistant", name: "Assistant", roleSummary: "The default conversational partner for everyday work",
        mission: "Be the primary assistant: lead with the answer, then the reasoning; ask when the goal is unclear.",
        boundary: "Never widens scope on its own; stays inside the access profile the user picked.",
        capsule: "You are the primary assistant. Lead with the answer, then the reasoning; ask when the goal is unclear.",
        source: "Core", version: "1.4.0", provenance: "Ships with Puppet Master",
        eligibleSkills: ["commit", "write-goal", "check-docs"],
        defaults: { thread: true, project: false, global: false },
        childOnly: false, currentScope: "This thread"
      },
      {
        id: "collaborator", name: "Collaborator", roleSummary: "A pair-working partner that thinks out loud",
        mission: "Pair with the user: offer options and tradeoffs before acting; narrate upcoming changes.",
        boundary: "No silent multi-file edits; pauses at decision points.",
        capsule: "You are a pair partner. Offer options and tradeoffs before acting, and narrate what you are about to change.",
        source: "Core", version: "1.2.1", provenance: "Ships with Puppet Master",
        eligibleSkills: ["commit", "write-goal"],
        defaults: { thread: false, project: true, global: false },
        childOnly: false, currentScope: "Project default for new work"
      },
      {
        id: "general", name: "General", roleSummary: "A capable worker persona for delegated tasks",
        mission: "Execute delegated tasks: follow the handoff, stay inside the granted scope, report what changed.",
        boundary: "Cannot approve its own permission escalations.",
        capsule: "You are a general worker. Follow the handoff, stay inside the granted scope, and report what you changed.",
        source: "Core", version: "1.3.0", provenance: "Ships with Puppet Master",
        eligibleSkills: ["commit", "check-docs"],
        defaults: { thread: false, project: false, global: true },
        childOnly: false, currentScope: "Global default for new work"
      },
      {
        id: "overseer", name: "Overseer", roleSummary: "Reviews plans and diffs with a skeptical eye",
        mission: "Review: look for what is missing or wrong; approve only when evidence is in front of you.",
        boundary: "Read-only by default; cannot merge or push.",
        capsule: "You are a reviewer. Look for what is missing or wrong; approve only when the evidence is in front of you.",
        source: "Core", version: "1.1.2", provenance: "Ships with Puppet Master",
        eligibleSkills: ["check-docs"],
        defaults: { thread: false, project: false, global: false },
        childOnly: false, currentScope: "This Goal"
      },
      {
        id: "researcher", name: "Researcher", roleSummary: "Bounded, well-sourced investigation",
        mission: "Investigate within a bound: gather from approved sources, cite everything, stop at the bound.",
        boundary: "No unsourced claims; no unbounded crawling.",
        capsule: "You are a researcher. Gather from approved sources, cite everything, and stop at the agreed bound.",
        source: "Core", version: "1.0.4", provenance: "Ships with Puppet Master",
        eligibleSkills: ["check-docs"],
        defaults: { thread: false, project: false, global: false },
        childOnly: false, currentScope: "This thread"
      },
      {
        id: "explorer", name: "Explorer", roleSummary: "Fast read-only codebase exploration",
        mission: "Explore code read-only and return precise file/line references.",
        boundary: "Child-only; never edits; never runs state-changing commands.",
        capsule: "You explore code read-only. Return precise file and line references; never edit anything.",
        source: "Core", version: "1.2.0", provenance: "Ships with Puppet Master",
        eligibleSkills: [],
        defaults: { thread: false, project: false, global: false },
        childOnly: true, currentScope: "Child only"
      },
      {
        id: "bash", name: "Bash", roleSummary: "Executes scoped shell tasks for a parent agent",
        mission: "Run scoped shell commands and report output faithfully.",
        boundary: "Child-only; only the granted commands; no network unless granted.",
        capsule: "You run scoped shell commands. Stay inside the granted commands and report output faithfully.",
        source: "Core", version: "1.1.0", provenance: "Ships with Puppet Master",
        eligibleSkills: [],
        defaults: { thread: false, project: false, global: false },
        childOnly: true, currentScope: "Child only"
      },
      {
        id: "teacher", name: "Teacher", roleSummary: "Explains concepts patiently with examples",
        mission: "Teach from first principles with small concrete examples; check understanding before moving on.",
        boundary: "No condescension; adapts depth to the user's answers.",
        capsule: "You are a teacher. Explain from first principles with small concrete examples; check understanding before moving on.",
        source: "Core", version: "1.0.1", provenance: "Ships with Puppet Master",
        eligibleSkills: ["check-docs"],
        defaults: { thread: false, project: false, global: false },
        childOnly: false, currentScope: "This thread"
      }
    ],
    personaAuthorityNote: "A persona is behavior, not authority. It cannot grant Full Access, widen FileSafe, force a provider, or eager-load all skills. Conversation mode (Ask / Plan / Review) is separate from the access profile (Ask for approval / Auto accept edits / Auto / Full Access).",
    personaImportDemo: {
      fileName: "reviewer-pro.persona.toml",
      diff: ["+ mission: review database migrations with a rollback checklist", "+ boundary: never runs migrations itself", "+ eligibleSkills: check-docs"],
      trust: "Unknown source — untrusted until you mark it trusted",
      secretScan: "No secrets detected",
      injectionScan: "1 instruction-like line found in the boundary field — quarantined for review"
    },

    /* ---------- Goal & Automation (defaults/ceilings, not live state) ---------- */
    goalDefaults: [
      { id: "pause-resume", label: "Pause and resume", value: "Pause anytime; resume from the last checkpoint", note: "Live run state belongs to the Orchestrator, not Settings." },
      { id: "fan-out", label: "Sustainable fan-out", value: "Prefer fewer, longer-lived workers over wide waves", note: "A preference, not a hard cap — the ceiling row sets the cap." },
      { id: "capacity-reserve", label: "Capacity reserve", value: "Keep 1 worker slot free for interactive work", note: "Usage reports current capacity; the Orchestrator admits work." },
      { id: "planning-route", label: "High-quality planning route", value: "Claude Opus · Anthropic · Personal", note: "Worker and reviewer route classes follow this unless a template overrides." },
      { id: "worker-class", label: "Worker route class", value: "Sonnet-class", note: "Implementation work uses the worker class." },
      { id: "reviewer-class", label: "Reviewer route class", value: "Opus-class", note: "Reviews and audits use the reviewer class." },
      { id: "cross-project", label: "Cross-project policy", value: "Read-only with named pairs", note: "Off by default; named pairs allow two projects to read each other." },
      { id: "worktree", label: "Worktree policy", value: "One worktree per run", note: "Cleanup follows the Source Control schedule." },
      { id: "testing", label: "Testing and debug defaults", value: "Run tests on failure visibility; debug sessions allowed", note: "Debug sessions spend extra model turns." }
    ],

    /* ---------- Crew ---------- */
    crews: [
      {
        id: "feature-build", name: "Feature Build", purpose: "Implements a scoped feature with review and tests",
        membersRequested: 5, membersEffective: 2, queuedWaves: 3, minMembers: 2, maxMembers: 8,
        adaptiveSizing: true, waves: "Queued waves as capacity frees",
        reserve: { usage: "$8.00 per run", cost: "Reviewer class reserved", time: "45 minutes" },
        writePolicy: "Worktree per member; merge on approval",
        boardTopology: "Single board, role columns",
        diversity: "Reviewer must differ from the implementer's route",
        corroboration: "Two independent test runs before merge",
        reducer: "Synthesizer merges findings into one report",
        failureStop: "Pause the wave on the first failed verification; stop after two",
        roles: [
          { role: "Implementer", persona: "General", capability: "edit + run tests", candidates: ["Claude Sonnet · Anthropic · Personal", "GPT-5 Mini · GitHub Copilot"] },
          { role: "Reviewer", persona: "Overseer", capability: "read + comment", candidates: ["Claude Opus · Anthropic · Personal"] },
          { role: "Tester", persona: "General", capability: "run tests", candidates: ["Claude Sonnet · Anthropic · Personal", "Qwen 3 32B · Local server"] },
          { role: "Researcher", persona: "Researcher", capability: "read + fetch", candidates: ["Claude Sonnet · Anthropic · Personal"] },
          { role: "Synthesizer", persona: "Collaborator", capability: "read + write report", candidates: ["Claude Opus · Anthropic · Personal"] }
        ],
        routePolicy: "adaptive",
        capacityNote: "Requested 5 members; current capacity admits 2 concurrently, so the remaining 3 run as queued waves."
      },
      {
        id: "docs-sweep", name: "Docs Sweep", purpose: "Refreshes documentation against recent code changes",
        membersRequested: 2, membersEffective: 2, queuedWaves: 1, minMembers: 1, maxMembers: 4,
        adaptiveSizing: false, waves: "Single wave",
        reserve: { usage: "$2.00 per run", cost: "No reviewer reservation", time: "20 minutes" },
        writePolicy: "Worktree; merge on approval",
        boardTopology: "Single list",
        diversity: "Not required",
        corroboration: "Single pass",
        reducer: "Editor writes the changelog directly",
        failureStop: "Stop the run on the first failed verification",
        roles: [
          { role: "Auditor", persona: "Overseer", capability: "read + comment", candidates: ["Claude Sonnet · Anthropic · Personal"] },
          { role: "Editor", persona: "General", capability: "edit docs", candidates: ["Qwen 3 32B · Local server", "GPT-5 Mini · GitHub Copilot"] }
        ],
        routePolicy: "strict",
        capacityNote: "Current capacity covers the full template."
      }
    ],

    /* ---------- Permissions & FileSafe ---------- */
    permissions: {
      wildcardDefault: "Ask each time",
      perToolOverrides: [
        { tool: "Read file", policy: "Never ask", origin: "Preset: Careful reader" },
        { tool: "Edit files", policy: "Ask each time", origin: "Global default" },
        { tool: "Run command", policy: "Ask each time", origin: "You set this on 2026-07-26" },
        { tool: "Search the web", policy: "Remember for this session", origin: "You set this on 2026-08-06" }
      ],
      rules: [
        { id: "r1", pattern: "src/**/*.test.*", action: "Allow read-only", scope: "Project", note: "Tests are always safe to read" },
        { id: "r2", pattern: "**/.env*", action: "Deny", scope: "Global", note: "Secrets never enter agent context" },
        { id: "r3", pattern: "build/**", action: "Allow writes", scope: "Project", note: "Build outputs are disposable" },
        { id: "r4", pattern: "**/*", action: "Ask each time", scope: "Global", note: "The wildcard default" }
      ],
      presets: ["Careful reader", "Balanced", "Trusted automation"],
      matrices: { readOnly: "Read-only matrix: 14 tools listed, 9 auto-approved", full: "Full matrix: 31 tools across 5 scopes" },
      externalDirs: ["D:\\shared-assets"],
      doomLoop: { threshold: 5, action: "Pause and summarize" },
      personaProfiles: [
        { persona: "Assistant", profile: "Follows the global default" },
        { persona: "Overseer", profile: "Read-only tools only" },
        { persona: "Bash", profile: "Scoped command list per grant" }
      ],
      scopes: ["Global", "Project", "Package", "Seam", "Lane"],
      sampleTrace: {
        path: "src/server/auth.ts",
        steps: [
          { rule: "r1 · src/**/*.test.*", result: "no match" },
          { rule: "r2 · **/.env*", result: "no match" },
          { rule: "r3 · build/**", result: "no match" },
          { rule: "r4 · **/*", result: "match — Ask each time (last match wins)" }
        ]
      },
      filesafeFloor: {
        health: "Healthy",
        boundary: "Every agent write is staged and reviewable",
        protectedScopes: ["Project source", "Plans", "User settings"],
        repair: "Coverage gap under build/** — complete the sandbox setup; the floor cannot be bypassed, only extended."
      }
    },

    /* ---------- Back Seat Driver ---------- */
    bsd: {
      mode: "auto",
      modeNote: "Auto is the system default: BSD reviews only when risk and phase triggers justify it.",
      route: "Claude Sonnet · Anthropic · Personal",
      triggers: ["Permission escalations", "Diffs over 400 lines", "Destructive commands", "Plan phase transitions"],
      usageGuard: "Auto — derives from Usage projections",
      latencyBudget: "8 seconds per review",
      privacyBoundary: "Receives bounded deltas — diffs and decisions, never full transcripts",
      toolAccess: "Read-only tools; cannot run commands or edit files",
      health: { state: "ready", lastReview: "2026-08-11 07:58", note: "3 reviews in the last 24 hours, 1 flag raised (resolved)" },
      truths: [
        "Read-only by default — it cannot widen authority.",
        "It cannot block primary work on its own failure; a failed review is logged and skipped.",
        "Chat may override BSD for one turn or the current thread."
      ]
    },

    /* ---------- Demo scenarios (Concord drawer) ---------- */
    demoScenarios: [
      { id: "calm", label: "Calm state (all notices dismissed)" },
      { id: "reset", label: "Reset demo data" },
      { id: "memory-fading", label: "Memory: fading gist crosses below the active set" },
      { id: "memory-restore", label: "Memory: restore an earlier gist version" },
      { id: "persona-import", label: "Persona import with injection scan" },
      { id: "validation-error", label: "Validation error on Default shell" },
      { id: "changed-elsewhere", label: "Setting changed elsewhere (conflict bar)" },
      { id: "rule-trace", label: "Permissions: trace a sample path" },
      { id: "bsd-review", label: "Back Seat Driver completes a review" }
    ]
  };
})();
