# New Features Implementation Plan

## Plan Document Status

**This is a PLAN DOCUMENT ONLY** — No code changes have been made. This document contains:
- Feature concepts and design patterns drawn from industry practice
- How each concept could enhance RWM Puppet Master
- Implementation architecture and integration points
- Phasing and dependencies
- **Gaps and potential issues** in §23; **DRY and single sources** in §17.7

## Rewrite alignment (2026-02-21)

This plan remains a useful source of feature patterns, but implementation should be anchored to the rewrite described in `Plans/rewrite-tie-in-memo.md`:

- Providers + unified event model + deterministic agent loop (OpenCode-style)
- Event-sourced storage: seglog ledger → projections into redb (KV) and Tantivy (search)
- Central tool registry + policy engine + patch/apply/verify/rollback pipeline
- UI rewrite: Rust + Slint (winit; Skia default)

Where this document uses Iced-specific examples, treat them as illustrative legacy implementation notes; the behavioral requirements (recovery, hooks, bounded buffers, protocol normalization, etc.) are what must remain stable. We do not use SQLite; storage is seglog/redb/Tantivy per Plans/storage-plan.md.

## Executive Summary

This plan captures a set of feature and architecture ideas that align with Puppet Master’s goals: CLI-only orchestration, multi-platform support, tiered execution, and a native Rust desktop GUI (current implementation details may change; rewrite targets Slint per `Plans/rewrite-tie-in-memo.md`).

**Scope (§1–§22):**
- **§1–§14:** Core features — orchestration flow, background/async agents, persistent rate limit, recovery, protocol normalization, plugins/skills, analytics, restore points, hooks, compaction, keyboard/command palette, stream visualization, bounded buffers, structured persistence.
- **§15:** Additional ideas — branching, in-app instructions editor, @ mentions, stream timers, thinking toggle, MCP, project/session browser, mid-stream usage, multi-tab/window, virtualization, analytics framing, one-click install, IDE terminal/panes, hot reload, sound effects.
- **§16–§17:** Phasing, dependencies, and relationship to other plans (orchestrator, interview, FileSafe, usage-feature, agent-rules-context, human-in-the-loop, newtools, MiscPlan, WorktreeGitImprovement).
- **§18–§19:** Task status and technical mechanisms (single Rust process; no middle Node server — see §17.5 and §19.1).
- **§20–§22:** HITL (full spec in human-in-the-loop.md), updating Puppet Master, cross-device sync.
- **§23:** Gaps and potential issues (architecture clarity, usage/ledger alignment, recovery/sync versioning, error handling, testing, accessibility).

**DRY:** All features must reuse single sources of truth: `platform_specs`, `docs/gui-widget-catalog.md`, the rules pipeline (agent-rules-context.md), usage state files (usage-feature.md), git/worktree/cleanup (MiscPlan, WorktreeGitImprovement), subagent registry, and MCP config (newtools §8). See §17.7.

---

## Table of Contents

1. [Automatic Task Decomposition and Orchestration Flow](#1-automatic-task-decomposition-and-orchestration-flow) · 2. [Background / Async Agents](#2-background--async-agents-with-queue-and-git-isolation) · 3. [Persistent Rate Limit](#3-persistent-rate-limit-and-usage-visibility) · 4. [Session and Crash Recovery](#4-session-and-crash-recovery) · 5. [Protocol Normalization](#5-protocol-normalization-for-multi-provider-streaming) · 6. [Plugin and Skills](#6-plugin-and-skills-extensibility) · 7. [Analytics](#7-analytics-and-usage-dashboard) · 8. [History and Rollback](#8-history-and-rollback-restore-points) · 9. [Hook System](#9-hook-system-event-hooks) · 10. [Auto-Compaction](#10-auto-compaction-and-context-thresholds) · 11. [Keyboard and Command Palette](#11-keyboard-first-and-command-palette) · 12. [Stream Event Visualization](#12-stream-event-visualization-and-thinking-display) · 13. [Bounded Buffers](#13-bounded-buffers-and-process-isolation) · 14. [Database](#14-database-and-persistence-structured-state) · 15. [Additional Feature Ideas](#15-additional-feature-ideas) · 16. [Phasing](#16-phasing-and-dependencies) · 17. [Relationship to Other Plans](#17-relationship-to-existing-plans-and-cross-reference) · 18. [Task Status Log](#18-task-status-log) · 19. [Technical Analysis](#19-technical-analysis-how-these-mechanisms-work) · 20. [HITL](#20-human-in-the-loop-hitl-mode) · 21. [Updating Puppet Master](#21-updating-puppet-master) · 22. [Cross-Device Sync](#22-cross-device-sync) · 23. [Gaps and Potential Issues](#23-gaps-and-potential-issues)

---

## 1. Automatic Task Decomposition and Orchestration Flow

### 1.1 Concept

A **session-level orchestration prompt** guides the agent through a consistent workflow: assess complexity → understand context → decompose into steps → act stepwise → verify. The behavior is injected via a system prompt (e.g. `--append-system-prompt` or equivalent per platform) so every run follows the same mental model without extra user commands.

- **Trivial tasks (1–2 steps):** Proceed directly; no planning overhead.
- **Complex tasks (3+ steps):** Explicit plan → execute → verify, with optional use of specialized “roles” (e.g. planner, implementer, reviewer).

### 1.2 Relevance to Puppet Master

We already have a four-tier hierarchy (Phase → Task → Subtask → Iteration) and verification gates. This idea complements that by:

- **Inside a single iteration:** Guiding the *agent’s* internal process (plan → implement → verify) so each iteration is more likely to satisfy the gate on the first or second try.
- **Optional role hints:** Aligning with our subagent strategy (orchestrator/interview plans): the orchestration prompt could reference “planning” vs “implementation” vs “review” so the same tier can use different mental frames without changing tier structure.

### 1.3 Implementation Directions

- **Single source of orchestration text:** One canonical prompt (or a few variants: “minimal”, “full”, “interview”) maintained in the repo, referenced by the execution engine when building the CLI invocation.
- **Composition with rules pipeline:** When building the iteration or system prompt, inject content in this order: (1) **Application + project rules** from the single rules pipeline (**Plans/agent-rules-context.md**); (2) **Orchestration text** (assess → decompose → act → verify). Do not duplicate rule content in the orchestration prompt.
- **Platform compatibility:** Use only mechanisms each platform supports (e.g. `--append-system-prompt` where available; for others, prepend to the prompt or inject via a temp file). Keep this in `platform_specs` or a dedicated "orchestration" module. **Fallback when no append-system-prompt:** Prepend the combined block (rules + orchestration) to the user prompt, or use `--append-system-prompt-file` with a temp file if the platform supports file but not inline.
- **Configurable:** Settings (e.g. in GUI config) to enable/disable or choose “minimal” vs “full” orchestration so we can A/B test or reduce token use when not needed.
- **No new tiers:** This is about improving behavior *within* an iteration, not adding Phase/Task/Subtask/Iteration levels.

---

## 2. Background / Async Agents with Queue and Git Isolation

### 2.1 Concept

Run **multiple agent runs in parallel** (e.g. up to N concurrent) with:

- **Queue:** Jobs (e.g. “run architect”, “run implementer”) are queued and executed when a slot is free.
- **Git branch isolation:** Each run gets its own branch (e.g. `async-{role}-{id}`). Uncommitted changes are stashed; work is done on the branch; user can diff, merge, or discard.
- **Output isolation:** Each run writes to a dedicated output directory; the main session is not blocked or mixed with background output.
- **Merge conflict detection:** Before suggesting a merge, the system checks for conflicts and can surface them in the UI or block auto-merge.

### 2.2 Relevance to Puppet Master

- **Orchestrator:** We could run “planning” or “exploration” agents in the background while the user continues with the main PRD-driven flow, or run multiple subtasks in parallel (e.g. two subtasks on two branches).
- **Interview:** Background agents could run research or validation (e.g. “explorer” for codebase scan, “guardian” for review) while the main interview continues.
- **Fresh process per run:** Aligns with our policy: each background run is still a new CLI process; we only add queue and concurrency limits.

### 2.3 Implementation Directions

- **Queue manager (Rust):** A module that maintains a bounded queue (e.g. max 4 concurrent), spawns CLI processes, tracks PIDs, and exposes status (queued / running / completed / failed / cancelled). Persist queue state so it survives app restart if desired.
- **Git integration:** Use existing `src/git/` (worktree, branches). Add: create branch from current HEAD, stash if dirty, run agent on that branch, then offer diff/merge/delete. Conflict detection via `git merge --no-commit --no-ff` or equivalent.
- **Output directory:** e.g. `.puppet-master/agent-output/{run-id}/` for logs and any artifacts; link from queue item so UI can “View output”.
- **GUI:** A small panel or view (e.g. “Background runs”) listing queued and running jobs, with cancel and “view diff” / “merge” actions. Could live in dashboard or a dedicated view.
- **Platform abstraction:** Reuse existing platform runners; the queue only decides *when* to call the same spawn path we use for the main flow.
- **Main-flow vs background-flow interaction:** Define behavior when the user starts a **main** orchestrator or interview run while a **background** run is active on the same project: e.g. (a) block main run until background completes or is cancelled, (b) allow both with a warning that files may conflict, or (c) queue main run. Document the chosen policy; align with queue manager and git isolation. See §23.4 for restore/rollback interaction with background agents.
- **Queue state persistence:** If queue state survives app restart, define format and path (e.g. `.puppet-master/queue/state.json` or redb) and how to recover PIDs (e.g. treat as failed if process no longer exists).
- **Git and cleanup:** Reuse **WorktreeGitImprovement.md** (branch create/merge/cleanup) and **MiscPlan** (cleanup allowlist, `run_with_cleanup`). Ensure `.puppet-master/agent-output/{run-id}/` is in cleanup allowlist or explicitly excluded by policy; branch naming (e.g. `async-{role}-{id}`) should follow WorktreeGitImprovement branch sanitization.

---

## 3. Persistent Rate Limit and Usage Visibility

### 3.1 Concept

**Always-visible usage metrics** (e.g. 5-hour and 7-day windows) in the UI, so the user does not have to run a manual “usage” command. Data comes from the same sources we already use (or will use): platform-specific APIs or error-message parsing, refreshed in the background.

### 3.2 Relevance to Puppet Master

We already have “Usage Tracking & Plan Detection” in AGENTS.md and usage-related code. This idea is about **persistent visibility** in the GUI:

- **Dashboard or header:** Show 5h/7d usage (and optionally plan type) for the selected platform(s).
- **Tier config / setup:** When choosing a platform for a tier, show current usage so the user can avoid platforms near limit.
- **Alerts:** Optional warning when approaching limit (e.g. 80% of 5h window), so the user can switch tier or pause.

### 3.3 Implementation Directions

- **Data layer:** Reuse and extend existing usage/plan-detection logic; ensure we have a clear “current usage” API (per platform) that the GUI can poll or subscribe to.
- **State-file-first:** Prefer aggregating from `.puppet-master/usage/usage.jsonl` (and optional `summary.json`) for 5h/7d and ledger; platform APIs augment when env vars are set. **See Plans/usage-feature.md** for full scope, GUI placement options, and current gaps (5h/7d not in GUI, ledger vs usage_tracker schema, alert threshold); that plan is the single source for Usage feature scope and acceptance.
- **GUI:** Add a small “usage” widget (e.g. in header or dashboard) that shows at least “5h: X / Y” and “7d: X / Y” and, if available, “Plan: …”. Use existing widgets (e.g. `status_badge`, `selectable_label`) for consistency.
- **Refresh:** Background refresh (e.g. every few minutes or after each run) so the numbers stay up to date without blocking the main thread.
- **No new backends:** Prefer existing mechanisms (Admin API, Copilot metrics, Gemini quotas, Codex/Gemini error parsing). Document which platforms support “live” vs “after-run” stats.

---

## 4. Session and Crash Recovery

### 4.1 Concept

**Periodic snapshots** of application state (e.g. every 5 minutes) plus **auto-save** of in-progress work (e.g. every 30 seconds) so that after a crash or kill, the user can reopen the app and choose to restore:

- Last window layout and open views
- Current session (e.g. which phase/task/subtask was active, which project, unsent input)
- Optional: last N message or state checkpoints for the active run

Retention policy (e.g. 24 hours of snapshots, 7 days of cleanup) keeps disk use bounded.

### 4.2 Relevance to Puppet Master

- **Long-running orchestrator runs:** If the app crashes during a long PRD execution, restoring “current phase/task/subtask” and progress state (e.g. from progress.txt and prd.json) avoids starting from scratch.
- **Interview:** Restore interview phase and in-progress answers so the user doesn’t lose a long session.
- **In-progress run checkpoint:** For doc-generation and Multi-Pass Review runs, persist a run checkpoint (run_type, run_id, step_index, document_index, checkpoint_version) in the recovery snapshot or redb so "Run was interrupted" can offer "Resume from checkpoint" or "Start over." Schema and behavior: Plans/chain-wizard-flexibility.md §3.5 and Plans/interview-subagent-integration.md GUI gaps (Agent activity and progress visibility).
- **GUI state:** Restore selected project, open tabs, and scroll position for a better UX.

### 4.3 Implementation Directions

- **Snapshot format:** Serialize a minimal “recovery” struct: app phase (e.g. dashboard / wizard / orchestrator / interview), project path, orchestrator state (phase/task/subtask ids), interview phase, window size/position, timestamp. Store under e.g. `.puppet-master/recovery/` or in app data dir.
- **Rust module:** e.g. `recovery.rs`: take snapshot on a timer, write to disk; on startup, check for a recent snapshot and offer “Restore?” in the UI. Use existing `state/` and file I/O; avoid blocking the main loop.
- **Cleanup:** Background or startup job to delete snapshots older than 24h (configurable).
- **Panic hook:** Optionally register a panic hook that writes one last snapshot before exiting. **Best-effort only:** A severe crash may not complete the write; rely on periodic timer snapshots as the primary recovery source. See §23.3.
- **Snapshot schema version:** Include a **schema version** (e.g. `recovery_schema_version: 1`) in the snapshot format so future app versions can migrate or skip incompatible snapshots; document in §23.3.
- **Non-blocking I/O:** Snapshot writes must not block the main loop; use background task or non-blocking write so the UI stays responsive.
- **Config:** Document config keys for retention (e.g. `recovery.retention_hours`), snapshot interval (e.g. `recovery.snapshot_interval_sec`), and auto-save interval if implemented.
- **GUI:** On launch, if a recent snapshot exists, show a small "Restore previous session?" dialog; restore only if user confirms.

---

## 5. Protocol Normalization for Multi-Provider Streaming

### 5.1 Concept

When multiple CLI platforms are used, **normalize their output** to a single internal format (e.g. a stream of “message delta” and “usage” events). That way:

- One parser and one UI pipeline handle all platforms.
- Features like “show thinking/reasoning”, “show token usage live”, and “streaming progress” work the same regardless of which CLI is running.
- Adding a new platform means implementing a small “adapter” from that CLI’s output to our normalized format, rather than branching the whole UI.

### 5.2 Relevance to Puppet Master

We already support five platforms with different CLI flags and output shapes. Today we may parse platform-specific output in each runner. Normalization would:

- **Centralize parsing:** One stream-parser that expects a single schema; each runner converts CLI stdout into that schema (or we run a small “shim” that does it).
- **Unify usage tracking:** Usage (tokens, cost) is one event type in the normalized protocol; we fill it from platform-specific data so the rest of the app only sees “usage updated”.
- **Future “thinking” display:** If we ever show extended thinking/reasoning in the GUI, it would be “thinking” events in the normalized protocol; each platform adapter maps its own “thinking” or “reasoning” chunks into that.

### 5.3 Implementation Directions

- **Define a minimal “orchestrator stream” schema:** e.g. event types: `text_delta`, `thinking_delta`, `tool_use`, `tool_result`, `usage`, `done`, `error`. Document it in `docs/` and keep it stable.
- **Per-platform adapters:** In each runner (or in a thin layer above subprocess stdout), parse CLI output (e.g. JSONL, stream-json) and emit events in the normalized schema. For platforms that don’t stream or don’t expose thinking, emit what we can (e.g. single `text_delta` at end, no `thinking_delta`).
- **Single consumer:** The orchestrator and any future “live log” or “streaming” UI only consume the normalized stream. No platform checks in the UI.
- **Incremental:** We can introduce the schema and adapters one platform at a time; the rest of the app keeps working with the current behavior until all platforms are migrated.

---

## 6. Plugin and Skills Extensibility

### 6.1 Concept

**Plugins** are self-contained bundles (e.g. under a single directory) that can add:

- **Commands:** New slash-style or named commands (e.g. `/review`, `/compact`) implemented as prompts or scripts.
- **Agents/roles:** Named “agents” (e.g. architect, explorer, implementer, guardian) with fixed system prompts and tool sets; the app can invoke them by name.
- **Hooks:** Code or scripts that run on events (e.g. before sending a message, before/after tool use, on context warning) and can block, modify, or continue.
- **Skills:** Context that is auto-injected when a trigger matches (e.g. file extension, keyword, or regex in the prompt or path). One skill might add “Python style guide” when `*.py` is in context.

A **plugin directory** (e.g. under app data or project `.puppet-master/plugins/`) is scanned at startup; each plugin declares components (commands, agents, hooks, skills) in a manifest (e.g. `plugin.json`). The app merges them into the main command list and event pipeline.

### 6.2 Relevance to Puppet Master

- **Orchestrator and interview:** “Agents” map well to our subagent personas; we could load agent definitions from plugins so power users can add custom roles without changing code.
- **Hooks:** Pre-send and pre-tool-use hooks could enforce project rules, add audit logs, or modify prompts (e.g. inject AGENTS.md sections). Aligns with our verification and memory layers.
- **Skills:** Auto-injecting context by file type or keyword could reduce repetition in prompts and keep AGENTS.md smaller (e.g. “when working in `src/doctor/`, add this checklist”).
- **Commands:** Custom commands could wrap common workflows (e.g. “run doctor and then wizard”) or internal tools.

### 6.3 Implementation Directions

- **Manifest format:** e.g. `plugin.json`: `id`, `name`, `version`, `commands[]`, `agents[]`, `hooks[]`, `skills[]`. Each entry points to a file (e.g. markdown for command/agent body, script path for hooks, JSON for skill triggers/content).
- **Loading (Rust):** On startup, scan plugin dirs, parse manifests, validate paths. Build in-memory registries: command name → handler, agent name → system prompt + tools, hook event → list of scripts, skill trigger → content. Expose via e.g. `plugin_registry` module.
- **Invocation:** When user runs a custom command, orchestrator resolves it to a plugin command and runs it (e.g. as a prompt with that command’s body). When we need an “agent”, we look up by name and append that agent’s prompt. Hooks are called at defined points with a small payload (e.g. message text, tool name); they return continue/block/modify.
- **Skills:** When building the iteration prompt (or interview prompt), check open files and prompt text against skill triggers; concatenate matching skill content into context. Prefer deterministic ordering (e.g. by plugin id, then skill id).
- **GUI:** A “Plugins” or “Extensions” section in settings to list plugins, enable/disable, and show component counts. No need to implement full install-from-URL in v1; local directory is enough.
- **Bundled “default” plugin:** Ship one built-in plugin (e.g. `puppet-master-default`) with a few commands and agents so the mechanism is used from day one and we dogfood it.
- **One-click install, no code:** To make extension truly “no code,” provide a **curated catalog** of commands, agents, hooks, and skills that users can install with one click (§15.14). The catalog lists pre-built items; install = copy into plugin dir and enable. No editing of config or writing scripts required.

---

## 7. Analytics and Usage Dashboard

### 7.1 Concept

An **analytics view** that aggregates usage over time and by dimension:

- **By project (working directory):** Sessions/runs, token count, cost (if available), last used.
- **By model/platform:** Which platform and model were used, token/cost per model.
- **By date:** Daily (or weekly) totals for tokens and cost to see trends.

Data is stored locally: rollups in **redb** (populated by analytics scan jobs over seglog/usage mirror); no telemetry. Optional export (CSV/JSON) for user’s own reporting.

### 7.2 Relevance to Puppet Master

- **Usage tracking:** We already have or plan usage/plan detection; this is the reporting layer on top.
- **Evidence and runs:** We store runs and evidence; we can add a thin “analytics” layer that aggregates run metadata (project, platform, model, timestamp, token/usage if we have it) and serves the dashboard.
- **Tier config:** Helps users see which platforms they use most and how close they are to limits, reinforcing the “persistent rate limit” feature.

### 7.3 Implementation Directions

- **Storage:** Prefer reusing existing state (e.g. run logs, evidence metadata). If we need more structure, use **redb** for analytics rollups (schema + migrations per rewrite; analytics scan jobs write rollups from seglog/usage mirror). **Align with usage-feature.md:** Use the same schema as `usage.jsonl` (or a single coherent schema) so analytics and 5h/7d/ledger share one data model; see §3 and Plans/usage-feature.md. No PII; only paths and aggregate numbers.
- **"Know where your tokens go":** Frame the analytics view as **§15.12** — emphasize breakdown by project, model, and date; optional "top N projects by tokens" or "top N models by cost" in the header. Reuse §7 data and UI.
- **Aggregation:** Under the rewrite design, aggregation is implemented as **analytics scan jobs** that read seglog (or usage mirror), compute 5h/7d and dashboard rollups, and persist them in **redb** for the Usage/dashboard views. Alternatively, on-demand scan of evidence/run logs when opening the dashboard with a small cache.
- **GUI:** New view “Analytics” or “Usage” with: time range selector (7d, 14d, 30d, all), optional project filter, cards for total runs/tokens/cost, and tables or simple charts (e.g. by project, by platform). Use existing widgets and theme.
- **Export:** Button to export current view as CSV or JSON; no server, just local file write.
- **Privacy:** All data stays on device; no external analytics or tracking.

---

## 8. History and Rollback (Restore Points)

### 8.1 Concept

**Restore points** are snapshots of “state after message N” (or “after iteration K”). For each point we store:

- Which messages (or iterations) had been completed.
- For file-changing runs: a snapshot of affected files (path + content before the change).

User can **roll back** to a restore point: revert those files to their snapshot content and truncate conversation/state to that point (e.g. for the interview: back to that phase and answer set; for the orchestrator: back to that subtask/iteration). Conflict detection: if a file was changed outside the app (or by another run) since the snapshot, warn and optionally skip or merge.

### 8.2 Relevance to Puppet Master

- **Orchestrator:** “Revert to before this iteration” so a bad subtask can be retried with a different prompt or platform without losing earlier progress.
- **Interview:** “Revert to end of Phase 2” so the user can re-answer Phase 3 without losing Phases 1–2.
- **Evidence:** We already store evidence per run; restore points could reference “evidence up to run X” and we could recompute or mark “valid up to this point”.

### 8.3 Implementation Directions

- **When to snapshot:** After each iteration (or after each “user message” in a chat-style flow). Persist: iteration id (or message id), list of files touched, and for each file: path, content before, content after (or diff). Store under e.g. `.puppet-master/restore-points/` or in **redb** (restore_points table per redb schema and migrations).
- **Retention:** Keep last N restore points (e.g. 50) or last N days to bound disk usage.
- **Rollback flow:** User selects a restore point; we compute the set of files to restore, check current file **mtime and/or content hash** for conflicts (document precedence in §23.4), show confirmation with file list; on confirm, write snapshot content back and update app state (e.g. set current subtask/iteration or interview phase to that point). Optionally re-run verification for that point. **Conflict behavior:** When a file was changed outside the app (or by another run), define: warn and skip, warn and overwrite, or prompt user; document in §23.4.
- **Interaction with background agents:** If a background run is active on the same project, define whether restore/rollback is disabled, queued, or allowed with a warning; see §23.4.
- **GUI:** A "History" or "Restore" panel listing restore points (e.g. by time and description “After iteration X”, “After Phase 2”); click to preview and then confirm rollback. Disable during an active run.
- **Git alignment:** Where possible, integrate with git (e.g. “restore point = this commit”); if we already have worktrees/branches, we could expose “restore to branch X” as an alternative to file-level restore.

---

## 9. Hook System (Event Hooks)

### 9.1 Concept

**Hooks** are user- or plugin-defined handlers that run at specific **events** and can:

- **Continue:** Do nothing, let the pipeline proceed.
- **Block:** Abort the action (e.g. don’t send this message, don’t run this tool).
- **Modify:** Change the payload (e.g. append to the message, change tool arguments) and then continue.

Events could include: before sending user message, before tool use, after tool use, on context warning (e.g. approaching token limit), on compaction trigger, on session start/end, on error. Hooks are configured per event (e.g. a list of script paths or plugin hook IDs); the app invokes them in order and respects block/modify.

### 9.2 Relevance to Puppet Master

- **Safety and policy:** Enforce “no write to prod” or “always run tests before commit” by blocking or modifying tool use.
- **Audit:** Log every message or tool use to a file or external system.
- **Integration:** Call out to linters, formatters, or custom checks before/after tool use.
- **Interview/orchestrator:** Inject project-specific instructions (e.g. “when starting Phase 3, always add this checklist”) without hardcoding.

### 9.3 Implementation Directions

- **Event enum:** Define a fixed set of events (e.g. `UserMessageSubmit`, `PreToolUse`, `PostToolUse`, `ContextWarning`, `CompactionTrigger`, `SessionStart`, `SessionEnd`, `Error`). Document payload per event.
- **Hook runner (Rust):** When an event fires, load hook list for that event (from config + plugins), run each hook (script or inline). Scripts can be shell, or we accept a small JSON in/out protocol (stdin: payload, stdout: `{"action":"continue"|"block"|"modify", "payload":…}`). **Timeout:** Default e.g. 5s per hook; make timeout configurable (per hook or global) so slow scripts do not block indefinitely; on timeout, treat as continue (or configurable: continue vs block).
- **Dangerous-command blocking:** Dangerous-command blocking is part of FileSafe (Plans/FileSafe.md): FileSafe already blocks destructive commands in `BaseRunner::execute_command()` and exposes a Command blocklist. PreToolUse hooks can call into FileSafe's blocklist so we have one extension point (FileSafe for core, hooks for optional/user rules). See §17.3–17.4.
- **Wiring:** In the execution path (e.g. in runner or orchestrator), call the hook runner at the right points. Start with 2–3 events (e.g. `UserMessageSubmit`, `PreToolUse`) and add more as needed.
- **Config:** Hooks listed in config (or in plugin manifests); GUI settings page to add/remove/reorder hooks per event.
- **No new runtime:** Prefer spawning a process per hook so we don’t embed a script engine; keep the contract simple (JSON in/out).

---

## 10. Auto-Compaction and Context Thresholds

### 10.1 Concept

**Context usage** is the ratio of current token count to model context window. When usage crosses thresholds (e.g. 75% or 80% warning, 80–85% auto-compact, 90% force), the system can:

- **Warn:** Show a UI notice and optionally run a “context warning” hook.
- **Auto-compact:** Before the next user message (or next iteration), run a compaction step: **intelligently summarize** older messages or turns while **preserving what matters** (key decisions, open tasks, file references, errors to fix). Then continue with a shorter context so the agent doesn’t “forget” or hit hard limits.
- **Force:** Same as auto but non-optional when usage is critical.

Compaction is **configurable** (enable/disable, thresholds, preservation rules) so users can turn it off or tune it. A **lower default threshold** (e.g. 75% auto-compact) keeps the buffer well below the model limit so the user effectively never hits context limits during long runs.

### 10.2 Why Compaction Matters

Long sessions (many iterations, long interviews, or many tool turns) fill the context window. Without compaction, the agent either hits the hard limit and fails or the CLI truncates history in an opaque way. **Explicit compaction** gives control: we choose when to summarize, what to preserve (e.g. “keep last N messages verbatim, summarize the rest” or “preserve all file paths and error messages”), and we surface the action in the UI (“Compacting…”) so the user knows what’s happening. Compaction is a first-class feature—design the prompt template, preservation rules, and UI feedback up front.

### 10.3 Relevance to Puppet Master

- **Long PRD runs:** Many iterations can fill the context window; compaction (or “summarize progress and continue”) could let a single subtask or phase span more turns without hitting limits.
- **Interview:** Long interviews with many phases might benefit from summarizing earlier phases before continuing.
- **We stay CLI-only:** Compaction would be implemented by our side: we build a “compact” prompt (e.g. “Summarize the following conversation and list key decisions; preserve file paths and open tasks”) and then replace or truncate history with that summary before the next run. We don’t require the CLI to support compaction natively.

### 10.4 Implementation Directions

- **Token counting:** We need at least approximate token counts per message (or per run). **Preferred:** Use platform usage data from the stream when available (e.g. `usage` events in stream-json). **Fallback:** Simple tokenizer (e.g. tiktoken-equivalent in Rust or a rough 4-chars-per-token heuristic). Document which platforms expose exact counts in-stream vs final-only. Store “current context size” in state and update after each run or stream. **Complementary to FileSafe Part B:** FileSafe's context compiler and compaction-aware re-reads handle *context compilation*; this compaction is *conversation* compaction (summarize messages). Both layers apply; see §17.3–17.4.
- **Thresholds:** Config (e.g. `compaction.warning_at`, `compaction.auto_at`, `compaction.force_at` as fractions). Consider a **lower default** for auto (e.g. 0.75) so compaction runs earlier and “never hit context limits” is achievable; allow 0.8–0.9 for users who prefer fewer compactions.
- **Compaction step:** When auto or force triggers: (1) Build a compaction prompt that asks for a summary **and** instructs preservation of important items (files, decisions, open tasks, errors); (2) Run one short CLI call (or use the same runner with a special “compact” mode); (3) Replace “old” messages in our state with the summary; (4) Proceed with the next user message or iteration. Persist the compacted state so the next run sees the shorter context.
- **Preservation rules:** Allow user or skill-defined “preserve” hints (e.g. “always keep these file paths,” “keep the last N user messages verbatim”). Document the preservation contract so plugin authors can rely on it.
- **UI:** Optional “context bar” or indicator showing usage (e.g. “Context: 78%”); when above warning, show “Compaction will run before next message” or “Compaction recommended”. During compaction, show “Compacting…” and optional stream timers (§15.5). Settings for enable/disable and threshold sliders.
- **Hooks:** Emit `ContextWarning` and `CompactionTrigger` so plugins can log or modify behavior.

---

## 11. Keyboard-First and Command Palette

### 11.1 Concept

**Keyboard-first UX:** Every major action (new run, switch view, open settings, send message, cancel, refresh) has a shortcut. **Command palette** (e.g. Ctrl/Cmd+P): user types a few characters and gets a filtered list of actions; choose with arrows and Enter. Shortcuts are documented in-app (e.g. “Keyboard shortcuts” in Help or Settings) and, where possible, consistent across platforms (Ctrl vs Cmd).

### 11.2 Relevance to Puppet Master

- **Efficiency:** Power users can drive the app without the mouse.
- **Discoverability:** Command palette surfaces actions that might otherwise be buried in menus.
- **Consistency:** Aligns with common editor/IDE patterns (Ctrl+P, Ctrl+Shift+P, etc.).

### 11.3 Implementation Directions

- **Shortcut registry:** In Rust or in the GUI layer, maintain a map: shortcut → action (message or command). On key event, resolve and dispatch. Support platform-specific modifiers (Cmd on macOS, Ctrl on Windows/Linux).
- **Command palette UI:** A modal or overlay that lists all actions (and optionally recent projects, open tabs). Filter list by typed string (fuzzy or prefix); select with Up/Down, execute with Enter. Reuse existing modal and input widgets.
- **Documentation:** A static list or view “Keyboard shortcuts” (e.g. in Settings or Help) generated from the same registry so we don’t drift.
- **Coverage:** Add shortcuts for: new run, switch view (dashboard, config, doctor, wizard, interview, etc.), settings, refresh, cancel run, and any new features (e.g. background runs, restore, analytics). Aim for 20+ actions with shortcuts.
- **Accessibility:** Command palette must support **keyboard-only** use (focus management, Up/Down/Enter/Escape); provide **screen reader labels** so the list and actions are announced. See §23.11.

---

## 12. Stream Event Visualization and “Thinking” Display

### 12.1 Concept

During a run, the UI shows **live stream events** in a compact form (e.g. a row of small indicators or “dots”): one icon per event type (e.g. read, edit, bash, tool call, thinking). This gives at-a-glance feedback that the agent is working and what kind of activity is happening. Optionally, **extended thinking/reasoning** content (if the platform streams it) is shown in a dedicated area (e.g. expandable section or secondary pane) so the user can watch reasoning in real time.

### 12.2 Relevance to Puppet Master

- **Orchestrator run view:** When a subtask is running, we could show “current activity” (e.g. read file, run test) instead of a single “Running…” spinner.
- **Trust and debugging:** Seeing “thinking” or “reasoning” chunks helps users understand why the agent is slow or what it’s considering. Not all platforms expose this; where they do, we can surface it.
- **Protocol normalization:** If we adopt a normalized stream (see §5), “thinking” is just another event type; the UI renders it when present.

### 12.3 Implementation Directions

- **Dependency on §5:** Stream event visualization and thinking display apply **only when** we have a normalized stream (§5) and in-Rust stream parsing; defer until we have that pipeline. See §17.5.
- **Event types:** Align with normalized stream: e.g. `read`, `edit`, `bash`, `tool_call`, `tool_result`, `thinking`, `message`. Each has an icon and optional short label.
- **UI component:** A horizontal strip or list of recent events (e.g. last 10–20), with icons; maybe a sliding window (e.g. last 5 seconds) so the strip doesn’t grow unbounded. Place it near the run status (e.g. in dashboard or run detail view). **Accessibility:** Provide alternative text or a short summary for the event strip (e.g. "Last activity: Bash, Read, Thinking") so screen reader users get the same information; see §23.11.
- **Thinking/reasoning:** If the normalized stream has `thinking_delta` or `reasoning` events, append to a buffer and display in a read-only area (e.g. collapsible “Thinking” section below the main log). Sanitize and limit length (e.g. last 4k chars) to avoid UI lag.
- **Platform support:** Document which platforms stream events and which expose thinking; for others, show “Running…” or only final result. No fake events.

---

## 13. Bounded Buffers and Process Isolation

### 13.1 Concept

**Bounded buffers:** Any in-memory buffer that holds stream output or logs has a fixed max size (e.g. 10 MB or 1000 lines). When the limit is reached, drop the oldest data. This prevents unbounded memory growth during long or runaway runs.

**Process isolation:** The main app process does not run agent logic inside itself. It spawns the CLI as a subprocess and communicates via stdin/stdout (or sockets). If the CLI hangs or crashes, the app can kill the process and stay responsive. No shared in-process state with the CLI.

### 13.2 Relevance to Puppet Master

We already spawn fresh CLI processes per iteration; this is about reinforcing **clean boundaries** and **resource safety**:

- **Rust runners:** Ensure we never accumulate unbounded stdout/stderr. Use a ring buffer or deque with a cap; when parsing stream-json, bound the line buffer (e.g. max line length, max total size).
- **GUI/log viewers:** If we show “live” output in the UI, feed from a bounded buffer so a runaway run doesn’t exhaust memory.
- **Crash recovery:** If the app crashes, we don’t rely on the CLI process; we rely on our own snapshots. So keeping the CLI as a separate process is correct and should be documented as a non-negotiable.

### 13.3 Implementation Directions

- **Audit:** Review all places we read subprocess output (runners, headless, any future stream consumer). Introduce a shared “bounded buffer” type (e.g. `BoundedLines` or `BoundedStringBuffer`) and use it everywhere.
- **Constants:** Define `MAX_STREAM_BUFFER_BYTES` and `MAX_STREAM_LINES` in **one place** (e.g. `platforms/runner` or a dedicated `limits` module, e.g. `src/limits.rs`); use them in all runners, parsers, and headless. Single source so we never drift.
- **Docs:** In AGENTS.md or architecture docs, state that the orchestrator never embeds the CLI in-process and that all output is consumed through bounded buffers. Add a short “Resource limits” section.

---

## 14. Database and Persistence (Structured State)

### 14.1 Concept

Structured state that benefits from querying and indexing (sessions/runs, messages or iterations, usage/analytics, checkpoints, restore points) is part of the rewrite design: seglog as canonical ledger, redb for durable KV state/projections/settings, Tantivy for full-text search (or equivalent). File-based state (e.g. prd.json, progress.txt, AGENTS.md) remains the source of truth for “work queue” and “memory”; the projections layer provides **queryable history**, **analytics**, and **recovery metadata** and is not optional.

### 14.2 Relevance to Puppet Master

- **Evidence and runs:** We already store evidence in directories; we could add a **redb** table (or equivalent in redb schema) that indexes run id, project, platform, timestamp, outcome, and path to evidence. Then “show all runs for this project” or “usage by platform” becomes a query.
- **Restore points and snapshots:** Store restore point metadata (and optionally file diffs) in **redb** for fast “list restore points” and “rollback to N”.
- **Interview:** Store phase answers and metadata in **redb** for “resume interview” and “export interview report”.
- **No requirement to move prd.json/progress.txt into redb:** Those stay as they are; redb complements them for reporting and recovery.

### 14.3 Implementation Directions

- **Schema:** Start small: e.g. `runs` (id, project_path, platform, model, started_at, ended_at, outcome, evidence_path), `restore_points` (id, run_id, created_at, file_snapshots_json), `usage_snapshots` (id, platform, 5h_used, 7d_used, recorded_at). Add tables as features (analytics, interview) need them. These live in **redb**; analytics aggregates (e.g. 5h/7d, tool latency, error rates) are produced by **analytics scan jobs** over seglog and stored as rollups in redb for the dashboard.
- **Rust:** Use **redb** for durable KV; one module (e.g. `db` or `persistence`) that opens the redb database, runs **migrations** (schema version tracked), and exposes functions to insert/query. Database path: e.g. under app data dir.
- **Migrations:** Versioned schema migrations applied on startup when stored schema version is less than the app's; keep migrations additive.
- **Required:** Per rewrite-tie-in-memo, structured storage (seglog/redb/Tantivy or equivalent) is part of the architecture, not optional; queryable history, analytics, and recovery metadata are produced from this layer.

---

## 15. Additional Feature Ideas

The following ideas are listed for completeness. They are not yet folded into the main phasing; they can be scheduled once the core features above are in place or in parallel where dependencies allow.

### 15.1 Dangerous-Command Blocking (FileSafe)

Dangerous-command blocking is part of **FileSafe** (Plans/FileSafe.md): Command blocklist, PreToolUse integration, and runner integration use the same blocklist and extension point. PreToolUse hooks can call into FileSafe for blocklist checks; the user sees a clear "Blocked by FileSafe" (or equivalent) message and can optionally override or add exceptions via config. No separate "Security guard" feature; see FileSafe.md and §9, §17.3–17.4.

---

### 15.2 Branching Conversations (Restore Then Fork)

**Concept:** Extend restore points (§8) so that after **rolling back** to a point, the user can **continue from there in a new branch** instead of overwriting the current timeline. That gives “branching conversations”: main line plus one or more alternate continuations (e.g. “what if I had answered Phase 3 differently?”). Each branch has its own restore-point chain and optional label.

**Relevance:** Supports experimentation and comparison of strategies (interview answers, iteration choices) without losing the original path.

**Implementation:** When user chooses “Roll back and branch” (or “Restore as new branch”), create a new conversation/session id, copy state and file snapshots up to that point, and mark the current session as “branched from” that point. UI: “Restore” panel could offer “Restore here” vs “Restore and branch.” Storage: link restore points to a branch id; list branches in History view.

---

### 15.3 In-App Project Instructions Editor

**Concept:** An **in-app editor** for project-level instructions (e.g. AGENTS.md, CLAUDE.md, or a project-specific instructions file). The user can open, edit, and save the file without leaving the app. Optional **live preview** (e.g. rendered markdown) in a split pane or tab. Ensures the file is saved to the project root (or a configured path) so the CLI sees it on the next run.

**Relevance:** Reduces context-switching; users can tweak instructions right before or after a run. Aligns with our memory layers (AGENTS.md is long-term memory).

**Implementation:** New view or modal “Project instructions” that (1) reads the file from project path, (2) shows a text area (or simple editor) and optional preview pane, (3) saves on demand or with auto-save. Use existing widgets; for preview, a minimal markdown renderer or “open in external editor” fallback. Path comes from current project in app state. Support **project rules** (Plans/agent-rules-context.md: e.g. `.puppet-master/project-rules.md` or `PROJECT_RULES.md`) and/or **AGENTS.md**, **CLAUDE.md**; user can choose which file to edit or have a single "Project instructions" entry that opens the project rules file when set, else AGENTS.md/CLAUDE.md.

---

### 15.4 @ Mention System for File References

**Concept:** In prompt input areas, support **@-style mentions** that open an autocomplete list: recent files, modified files, or folder navigation (e.g. type `@src/` to see contents of `src/`). Selecting an item inserts a canonical reference (e.g. path or `@path/to/file`) into the prompt so the agent (and our context builder) can resolve it. Fast file reference without typing full paths.

**Relevance:** Speeds up “add this file to context” and keeps prompts tidy. Complements skills (§6) and context assembly for iterations.

**Implementation:** In the input widget, detect `@` and trigger a small overlay or dropdown. Data source: list of recent/modified files from app state or a quick filesystem scan of the project; optional folder tree. On select, insert the chosen path (or a token like `@path`). Resolution: when building the iteration prompt, expand `@path` to file contents or a “include file X” directive per platform.

---

### 15.5 Stream Timers and Segment Durations

**Concept:** During a run, show **live duration** for the current segment type: e.g. “Thinking: 0:12,” “Bash: 0:45,” “Compacting: 0:08.” When the segment ends, optionally keep a short history (e.g. “Last: Thinking 0:12, Bash 0:45”). Gives the user a clear sense of where time is spent without reading raw logs.

**Relevance:** Complements stream event visualization (§12); timers answer “how long has this step been running?” and “how long did the last step take?”

**Implementation:** In the normalized stream consumer, track segment start/end by event type (e.g. `thinking_delta` start → start timer; `thinking_delta` end or `message` start → stop and display). Persist segment type + duration in a small ring buffer for “last N segments.” UI: next to or below the event strip (§12), show “Current: Thinking 0:12” and optionally “Last: Bash 0:45, Read 0:01.”

---

### 15.6 Interleaved Thinking Toggle

**Concept:** A **setting** (and optional per-session override) to show or hide **extended thinking/reasoning** content as it streams. When on, the thinking pane or section is visible and updates live (§12). When off, thinking is not shown (or only a “Thinking…” placeholder) to reduce noise or save space. Some platforms stream thinking; others don’t—the toggle only affects display when data is present.

**Relevance:** User control over information density; aligns with “thinking” in the normalized stream (§5, §12).

**Implementation:** Config key e.g. `ui.show_thinking_stream` (default true). In the stream consumer, if false, discard or hide `thinking_delta` content in the UI but still allow backend to use it if needed. Toggle in Settings and optionally in the run view toolbar.

---

### 15.7 MCP (Model Context Protocol) Support

**Concept:** **Model Context Protocol** allows the CLI (or our app) to connect to external MCP servers that expose tools and data sources. The app can list configured MCP servers, enable/disable them, and pass through server config to the platform CLI (e.g. via `--mcp-config` or platform-specific flags). No direct implementation of MCP in the app; we act as a **config and passthrough** layer so the user can manage servers in one place and the CLI gets the right arguments.

**Relevance:** Many platforms already support MCP; we already mention it in AGENTS.md. A dedicated “MCP” section in settings (or under Plugins) would make server management visible and consistent.

**Implementation:** Config schema: list of servers (name, command, args, env, auto_start). GUI: “MCP” tab or subsection to add/edit/remove servers and test connection. When spawning the CLI, merge this config into the platform’s expected flag or config file (per platform_specs). Document which platforms support MCP and how (e.g. env var, flag, config file path). **See Plans/newtools.md §8** for concrete MCP-in-GUI design (Config → MCP, Context7 default/API key/toggle, per-platform config table, and Option B run-config wiring).

---

### 15.8 Project and Session Browser

**Concept:** A **browser view** that lists projects (e.g. by recent working directories or a user-maintained list) and, per project, sessions or runs (e.g. last 10 runs, interview sessions, orchestrator runs). User can search and filter (e.g. by date, platform, outcome). Optional: show **git status** per project (branch, dirty files count) so the user can see state at a glance. Clicking a project opens it; clicking a session might open run detail or restore.

**Relevance:** Improves navigation when the user has many projects or long history; supports “resume where I left off” and “see what ran where.”

**Implementation:** Data: scan app data or redb for run/session metadata per project path; maintain a “recent projects” list (already may exist). UI: new view “Projects” or “Browser” with a list/grid of projects, expandable to show sessions. Optional search/filter bar. Git status: call existing git module for branch and status; show as badge or one-line summary. Reuse existing widgets and theme.

---

### 15.9 Mid-Stream Token and Context Updates

**Concept:** During a **streaming** response, update **token count** (and optionally context usage %) in the UI in real time, not only when the response completes. The backend receives usage or token-delta events from the normalized stream and pushes them to the UI; the “Context: X%” or “Tokens: N” display updates live. Reduces “did it hang?” anxiety and supports compaction decisions mid-stream.

**Relevance:** Extends persistent rate limit (§3) and stream visualization (§12); requires protocol normalization (§5) to have `usage` or token events in the stream.

**Implementation:** In the stream consumer, on `usage` or token-delta event, update in-memory session stats and emit a UI message (e.g. “UsageUpdated”). GUI: the usage widget (header or run view) subscribes and redraws. Throttle updates (e.g. max once per 500 ms) to avoid UI thrash. Document which platforms send mid-stream usage; others show final-only.

---

### 15.10 Multi-Tab and Multi-Window

**Concept:** Support **multiple tabs** in a single window (e.g. different views or different projects per tab) and **multiple windows** (e.g. one window per project or per run). Optional **drag** of tabs between windows. Tab state (selected view, project, scroll position) is per-tab; window position/size is per-window. Improves multitasking and comparison across projects or runs.

**Relevance:** Scales the GUI to power users who run several projects or sessions in parallel.

**Implementation:** Iced and our current app structure may be single-window; multi-window would require explicit window management (e.g. new window = new app instance with shared state, or a single process with multiple windows). Tabs: add a tab bar to the main layout; each tab holds a view id + context (e.g. project path); switching tabs loads that view/context. Persist tab list and order (e.g. in config or recovery snapshot). Drag-between-windows is optional and platform-dependent.

---

### 15.11 Virtualized Conversation or Log List

**Concept:** For views that show a **long list** of messages, iterations, or log lines (e.g. 10k+ items), use **virtualized rendering**: only render the visible portion of the list plus a small overscan. Scroll position drives which slice is rendered; DOM/widget count stays bounded so scrolling stays smooth and memory stays low.

**Relevance:** Long orchestrator runs or interview sessions could produce very long logs or message lists; virtualization keeps the UI responsive.

**Implementation:** Iced may have or need a virtualized list widget (or a “lazy” list that requests only a window of items). Implement a list that takes total count + a “fetch slice” callback (start index, length) and only builds children for that slice. Reuse for: run log view, message history view, restore-point list. Document max recommended items and overscan size.

---

### 15.12 “Know Where Your Tokens Go” (Analytics Framing)

**Concept:** Frame the analytics dashboard (§7) explicitly as **“where your tokens go”**: emphasize breakdown by project, by model, and by date so the user can see what consumes the most tokens or cost and adjust (e.g. move heavy work to a different platform or tier, or trim context). Optional: simple “top 5 projects by tokens” or “top 3 models by cost” on the dashboard or in the analytics view header.

**Relevance:** Makes analytics actionable; reinforces persistent rate limit (§3) and tier selection.

**Implementation:** Copy and UX only: add a short tagline or section title in the Analytics view (e.g. “See where your tokens go”) and optionally pre-sort or highlight “by project” and “by model” sections. No new backend; reuse §7 data and UI.

---

### 15.13 One-Click Install for Commands, Agents, Hooks, and Skills (No Code)

**Concept:** **Extend without coding:** users can install **commands, agents, hooks, and skills** from a **curated catalog** with one click. No writing code or editing config files by hand. The catalog lists named items (e.g. “FileSafe dangerous-command blocklist hook”, “Code review command”, “Rust skill pack”) with short descriptions; user clicks “Install” and the app downloads or copies the artifact into the right place (plugin dir or config), enables it, and optionally runs a one-time setup. Updates or uninstall are equally simple (e.g. “Update” / “Remove” in the same UI). Everything in the catalog is pre-built: ready-to-use hooks, agent markdown files, skill JSON, and command definitions.

**Relevance:** Makes the plugin/skills system (§6) and hooks (§9) accessible to non-developers. “One-click install, no code” is a strong UX promise: extend behavior by choosing from a list, not by writing scripts or editing JSON.

**Implementation:** Define a **catalog format** (e.g. a JSON or manifest listing id, name, description, type [command|agent|hook|skill], source URL or bundled path, version). Catalog can be bundled in the app or fetched from a static URL (e.g. GitHub Pages or a simple index file). “Install” = copy files to the appropriate plugin/config location and enable. GUI: “Extensions” or “Plugin catalog” view with search and “Install” / “Remove” / “Update” per item. No code execution beyond copying and parsing; all catalog items are static assets (markdown, JSON, or signed scripts if we ever support remote scripts). Ship a small default catalog (e.g. FileSafe-style dangerous-command blocklist hook, a few skills) so the feature is useful from day one.

---

### 15.14 Full IDE-Style Terminal and Panes

**Concept:** A **terminal** (or “Open terminal”) action that opens a shell in the **current project folder**. The user can run commands, inspect files, or use git from the same directory Puppet Master is using for the project without leaving the app or manually `cd`-ing. Either: (1) an **in-app embedded terminal** widget that runs a shell with `cwd` set to the project path, or (2) **launch the user’s default external terminal** (e.g. gnome-terminal, kitty, iTerm, Windows Terminal) in that directory. Both options are valid; choose one or support both (e.g. “Terminal” opens embedded, “Open in external terminal” in a menu).

**Relevance:** Reduces context-switching when the user wants to run a quick command, check git status, or inspect the workspace. Aligns with “current project” already in app state (Dashboard, orchestrator, interview all have a project path).

**Implementation:**
- **Project path:** Use the same “current project” / workspace path the app already uses (from project selection, orchestrator run, or interview). If no project is selected, disable the action or open in a sensible default (e.g. app data dir or prompt to select a project).
- **Embedded terminal:** If the app embeds a terminal, use a crate that provides a PTY and a terminal widget (e.g. for Iced, a terminal widget if available, or a minimal shell view). Set `cwd` to the project path when spawning the shell. Keep one terminal instance per project or one global; document in the plan. Security: same process-isolation and sandbox considerations as the rest of the app; terminal runs in the user’s environment.
- **External terminal:** If opening an external app, resolve the user’s preferred terminal (config or platform default: e.g. `$TERM`, or a list of known terminals per OS) and launch it with the working directory set (e.g. `gnome-terminal --working-directory=<path>`, `cmd /c start cmd /k cd /d <path>`, or platform-specific equivalent). Use existing path from app state; no new “project” concept.
- **UI:** A “Terminal” or “Open terminal” entry in the main menu, Dashboard, or project context menu (e.g. right-click project → “Open terminal here”). Use existing widgets for menus and buttons; check `docs/gui-widget-catalog.md`.
- **DRY:** Single “open terminal at path” helper (or two: embedded vs external); call from whichever UI surfaces expose (menu, dashboard, context menu). Project path comes from app state (single source of truth).

**Panes (full IDE-style):** Terminal (one or more tabs, cwd = project path; optional external terminal). **Problems:** diagnostics from build/linters/LSP; click to file:line. **Output:** channels for Build, Hot Reload, Tests; used by §15.16. **Debug Console:** REPL for debug session; DAP later. **Ports:** ports in use; optional Tilt/Skaffold. **Implementation:** Panel (bottom/side) with tab bar; shared project path; resize/collapse. Reuse widgets; add panel/tab components if needed. (Supersedes earlier "terminal only" scope).

---

### 15.15 Hot Reload, Live Reload, and Fast Iteration (Puppet Master IDE)

**Concept:** Native support for **hot reloading, live reload, and fast iteration** (Puppet Master IDE or Cursor-extended IDE). One-click launch of the right dev server/watcher; live logs and errors in integrated Terminal/Output (§15.14). Where supported, preserve app state across reloads. The **Assistant** can **call up live testing tools** (e.g. "start hot reload dev mode", "run tests in watch mode"); results surface in IDE panes.

**Target platforms/workflows (prioritized):**
- **Web:** Vite/Next.js HMR, webpack dev server, nodemon for backend restarts.
- **Mobile:** Expo Fast Refresh (React Native), Flutter hot reload.
- **Native desktop:** Iced 0.14 hot reload (beacon server), Slint live preview, Dioxus native HMR.
- **Backend/prod:** cargo-watch / nodemon, Skaffold/Tilt for K8s dev loops.

**Requirements:**
1. **Detect project type** automatically: scan `Cargo.toml`, `package.json`, `pubspec.yaml`, Expo config → project kind (Rust, Node/Next/Vite, Flutter, Expo, etc.).
2. **One-click launch:** "Hot Reload Dev Mode" / "Start Dev Server" button or menu → spin up the right watcher/dev server.
3. **Integrated terminal/output:** Live logs, errors, reload status in Terminal/Output panes (§15.14).
4. **State preservation:** Where supported (React Fast Refresh, Flutter hot reload), preserve app state; document per stack.
5. **Remote/prod sync:** Tilt/Skaffold support; port-forwarding and status in Ports pane.
6. **API hooks:** VS Code extension APIs if extending Cursor/VS Code; LSP or custom protocol for custom Rust IDE so agents can request "start dev server" / "run tests."

**Implementation steps:**
1. **Project scanners/detectors:** Scan project root for `Cargo.toml`, `package.json`, `pubspec.yaml`, Expo config; return project type and suggested dev command (`cargo watch -x run`, `npm run dev`, `expo start`, etc.). Single source; used by one-click launch and Assistant.
2. **Integrate watchers:** Spawn correct process with `cwd` = project path; stream stdout/stderr to Output (and optionally Terminal); track PID for shutdown.
3. **UI:** Toolbar/menu "Hot Reload Dev Mode" / "Start Dev Server"; status bar "Hot Reload: Active" or "Dev server: running". Use existing widgets.
4. **Error handling:** Parse build output for errors → Problems pane; auto-rebuild where watcher supports it; on crash offer Restart and log to Output.
5. **Cross-platform:** macOS, Linux, Windows; no WSL. Same path/process abstractions as rest of app.
6. **Assistant integration:** Assistant can request "start hot reload dev mode" or "run tests in watch mode"; app starts watcher and routes output to Output/Terminal. Expose message or API (e.g. StartDevMode, RunTestsWatch) for Assistant execution path.

**Edge cases:** Use hot reload when stack supports it; fallback to live reload and show "Live Reload" in status. On IDE close or project switch, terminate dev process (SIGTERM then SIGKILL); no orphan processes. Do not auto-restart on next open without user action.

**Non-goals:** Full DAP debugger is separate; Ports can start as "list ports in use" then integrate Tilt/Skaffold. This section focuses on detect → one-click launch → integrated output and Assistant-callable live tools.

---

### 15.16 Sound Effects Settings

**Concept:** A **Sound effects** settings section where the user can enable or disable sounds for different events and choose which sound plays for each. Per event: enable/disable toggle and a way to select the sound (dropdown, list, or picker). **Users can load their own sounds** in addition to any built-in set. Layout and look are flexible — whatever fits the app; no specific visual reference required. Sounds play when the corresponding event occurs (e.g. agent complete, permission required, error).

**Relevance:** Improves feedback when the user is not focused on the window (e.g. agent done, HITL approval needed, build failed). Aligns with Settings/Config; same config persistence and widget reuse as other toggles.

**Event categories (examples):**
- **Agent:** Play sound when the agent (orchestrator iteration, Assistant, interview turn) is complete or needs attention.
- **Permissions:** Play sound when a permission is required (e.g. tool approval, HITL gate).
- **Errors:** Play sound when an error occurs (build failure, gate failure, runner crash).
- Optional: **HITL:** Play sound when paused for human approval; **Dev server:** when hot-reload dev server is ready or fails; **Build:** when a build completes (success or failure). Start with Agent, Permissions, Errors; extend as needed.

**UI:** Layout and styling are up to the app. Requirements: per-event **toggle** (on/off) and **sound selection** (dropdown or list of available sounds). Optionally a short description per event. Use existing widgets per `docs/gui-widget-catalog.md` where they fit.

**Implementation:**
- **Sound catalog:** Combined list of **built-in** sounds (bundled or from app sounds dir) and **user-loaded** sounds. Each entry: id, display name, source path or bundle ref. Format: WAV/OGG/MP3 or platform-supported; play via system sound or a small audio crate (e.g. rodio). DRY: one catalog, used by selection UI and by playback.
- **User-loaded sounds:** User can **load their own sound files** (e.g. "Add sound" or file picker). Accepted formats: WAV, OGG, MP3 (or subset). Store user-added files in a known dir (e.g. app data `sounds/` or `.puppet-master/sounds/`); catalog includes them by path or by copied filename. Selection UI (dropdown/list) shows both built-in and user-loaded; user can remove or rename user-loaded entries if desired. Config stores selection by stable id (built-in id or path/filename for user sounds).
- **Config:** Persist per-event enabled (bool) and selected sound id/path in app config. Load/save with rest of Settings; wire via same Option B as other config.
- **Playback:** When an event occurs, check config for that event; if enabled, play the selected sound. Single "play_sound(sound_id_or_path)" helper; no duplicate playback logic per event.
- **Accessibility:** Respect system "reduce motion" / "silent" preferences if available; optional global "Sound effects: off" master toggle.

---

### 15.17 Instant Project Switch (OpenCode Desktop–Style)

**Concept:** The user can **instantly switch between projects**; **all context and settings swap** with the selection. A **project bar** (or sidebar) lists open/recent projects; selecting one switches the active project immediately — dashboard, config, orchestrator, interview, terminal cwd, and any project-scoped state all reflect the new project without a full app restart or manual re-selection.

**Reference: OpenCode Desktop.** [OpenCode](https://github.com/anomalyco/opencode) (anomalyco/opencode) recently released a Desktop app (Tauri shell loading a Solid.js web app from `packages/app`). Their project switcher is implemented as follows (from code exploration of `packages/app` and `packages/desktop`):

- **Project bar / sidebar:** A collapsible sidebar shows a list of **projects** (each project = workspace directory). When collapsed, it becomes a narrow **bar** of project tiles (icons/names); the user can hover to expand or click a tile to switch. See `packages/app/src/pages/layout.tsx` and `packages/app/src/pages/layout/sidebar-project.tsx`.
- **Single source of truth for “current project”:** The **route/URL** encodes the active project: `/:dir/session/:id` where `dir` is the project directory path base64-encoded. So `params.dir` (from the router) is the single source of truth; all UI and data are derived from it (e.g. `currentDir() = decode64(params.dir)`).
- **What swaps when switching:** (1) **Navigation:** `navigateToProject(directory)` updates the route (e.g. `navigate(\`/${base64Encode(root)}/session/${lastSessionId}\`)`). (2) **Per-project state:** Sync and session data are keyed by directory via `globalSync.child(directory)` — so when the route changes, every component that reads `currentDir()` or `params.dir` gets the new project’s data from the same global store. (3) **Persisted project list:** “Open” projects are kept in `layout.projects` (from `context/layout`); `layout.projects.list()`, `.open(directory)`, `.close(directory)`; this list is persisted so the sidebar shows the same set across restarts. (4) **Last session per project:** `lastProjectSession[root]` stores the last session id (and directory) per project root so switching back opens the same session. (5) **Workspace order/names:** Optional workspace (e.g. git worktree) order and display names are stored per project in the layout store.
- **Context/layout:** `LayoutProvider` (in `packages/app/src/context/layout.tsx`) holds sidebar open/close state, panel widths, and per-project workspace toggles; the **project list** itself is maintained by a combination of persisted layout and server “recent projects” (e.g. `server.projects.last()`). So “context and settings” that swap are: everything that is **keyed by project path** (directory) — sessions, file tree, terminal cwd, project-specific config). Global UI state (sidebar width, theme) stays; project-scoped state is selected by current project path.
- **Desktop shell:** The desktop package (`packages/desktop`) is a Tauri app that loads the app bundle and provides platform APIs (file picker, storage, deep links). Project switching is entirely in the web app; no Tauri-specific logic for “switch project” — it’s just navigation + reactive state keyed by directory.

**Relevance for Puppet Master:** We already have a “current project” in app state (Dashboard, orchestrator, interview, terminal all use a project path). Adding a **project bar** (or equivalent) that lists recent/open projects and sets the current project on click would give the same “instant switch” feel; all views that depend on the current project path would then show the new project’s context. Config can be **per-project** (e.g. `.puppet-master/config.yaml` per project directory) or **global with project overrides**; either way, switching the active project must cause the app to load that project’s config and state.

**Implementation (Puppet Master):**

- **Project list:** Maintain an “open” or “recent” project list (e.g. from config, recovery, or a scanned list). Persist it so the bar shows the same set across restarts. Allow “Open project…” (folder picker) to add and “Close” to remove.
- **Project bar or sidebar:** A visible **bar** or **sidebar** that lists these projects (by name or path). User can click one to switch. Optionally: collapsible to a narrow bar (icons or short names only); expand on hover or click. Reuse existing widgets; see `docs/gui-widget-catalog.md`.
- **Single source of truth:** Treat **current project path** as the single source of truth in app state (e.g. `App::current_project_path: Option<PathBuf>`). All views (Dashboard, Config, Wizard, Orchestrator, Interview, Terminal) read this; when it changes, they re-load or re-key their data (sessions, config, cwd) from the new path. No second “selected project” state.
- **What swaps on switch:** (1) Set `current_project_path` to the selected project. (2) Load that project’s config (e.g. `.puppet-master/config.yaml` in that path, or from a global store keyed by path). (3) Update any project-scoped state: orchestrator state, interview state, recovery snapshot reference, terminal cwd, evidence/log paths. (4) Optionally persist “last session” or “last view” per project so switching back restores the same view/session. (5) Re-run config discovery for the new path so Doctor, tier config, and run config reflect the new project.
- **Persistence:** Persist the list of open/recent projects (and optionally last session or last view per project) in app config or recovery so the project bar and “where I was” survive restarts.
- **DRY:** Reuse existing “current project” / project path usage everywhere; the project bar only updates that one field and triggers a re-load of project-scoped data.

**References:** OpenCode repo: [github.com/anomalyco/opencode](https://github.com/anomalyco/opencode) — `packages/desktop` (Tauri shell), `packages/app` (Solid.js app), `packages/app/src/pages/layout.tsx` (main layout and project/sidebar logic), `packages/app/src/pages/layout/sidebar-project.tsx` (project tiles and switcher), `packages/app/src/context/layout.tsx` (layout and project list state). OpenCode Desktop is BETA; their project ID is derived from repo root (issue #5638: multiple worktrees from same repo can collide); we can use full path or a stable id per project to avoid that.

**Snapshotting (§4) and instant project switch:** Recovery snapshot (§4, §19.9) serializes **selected project path**; on restore, set `current_project_path` from snapshot. Restore points (§8) are keyed by project; switching project = UI shows restore points for the new project. On switch, the next **periodic** snapshot will record the new current project; optionally write a lightweight per-project checkpoint (view + session) for the project we're leaving so switching back restores "where I was." Crash recovery: snapshot contains last active project path; project list (open/recent) must be persisted separately so the bar shows the same set after restore.

**Database / structured storage (§14, rewrite):** With file-based state, all paths under each project's `.puppet-master/`. With seglog + redb + Tantivy (rewrite-tie-in-memo): **project_path is a first-class key** in events and projections; runs, restore points, usage rollups are per-project or keyed by project_path. Switching project = change `current_project_path`; all reads for "current" data use the new path; no migration of data. Analytics "by project" already groups by project_path.

**GUI (expanded):** **Placement:** Left sidebar (collapsible to narrow bar), top bar, or title/status dropdown; choose one as default. **Collapsible:** Persist sidebar open/close in layout config (global). **Per tile:** Name (basename or display name), optional icon; click = switch; context menu: Rename, Close. **"Open project…":** Folder picker; canonicalize path; deduplicate if already in list. **Empty state:** "No project open" + prominent "Open project…". **Keyboard:** Optional shortcut (e.g. Cmd/Ctrl+O) or project switcher in command palette (§11); optional Cmd+1–9 for first 9 projects (OpenCode issue #9600). **Accessibility (§23.11):** Keyboard-navigable; screen reader labels ("Project: &lt;name&gt;, switch to project"). **Stable identity:** Use canonical path so same directory via symlink/casing is one project; document Windows vs Unix.

**Gaps (to resolve in implementation):** (1) **Where is the project list stored?** App config vs dedicated file vs recovery payload; document so recovery, sync (§22), and project bar use the same place. (2) **Project path no longer exists:** Detect on switch/startup; skip or remove from list; offer "Remove" or "Locate…". (3) **Same path twice (symlinks/casing):** Canonicalize; deduplicate on add and load. (4) **In-flight run when switching:** Allow switch (run continues in background; show in "Background runs" or when user switches back to that project), block, or prompt; align with §2 and §4. (5) **Max list size and eviction:** Define cap (e.g. 30), LRU vs FIFO; document in config. (6) **Interaction with multi-tab (§15.10):** Project bar global (switch = change active tab's context) vs per-tab project; decide when implementing tabs.

**Potential problems:** (1) **Config load failure for new project:** Switch with defaults, show error and stay, or switch + banner "Config missing; using defaults"; document. (2) **Dirty state (unsent input)** in previous project: Discard, persist to "last view per project," or prompt; align with recovery snapshot. (3) **Performance with many projects:** Lazy-load config/state on switch; bar only needs names for display. (4) **Sync (§22):** Project list in payload; paths may differ across devices (Windows vs Mac); document machine-specific or re-bind paths on import.

---

### 15.18 Built-in Browser and Click-to-Context (Cursor-Style)

**Concept:** The user can **launch webapps from Puppet Master** in a built-in browser. When the user **clicks an element** on the page, the app **immediately sends that element’s context to the chat/Assistant** so the agent has DOM and structure without the user copying or describing it. This mirrors Cursor’s in-app browser and “click to give context to the agent” behavior; Cursor achieves it via an Electron-hosted browser; we achieve it natively with an **embedded WebView**. The same browser is used for **local HTML preview with hot reload** (Plans/FileManager.md §8); when viewing a local HTML file there, the user can also click elements and send them to the Assistant.

**Reference:** Cursor 2.0 provides an [in-app browser](https://cursor.com/docs/agent/browser) for agent use; users report that opening a browser via agent can sometimes open the system browser instead of an in-IDE view. Third-party flows (e.g. Web to MCP, [Browser Tools MCP](https://apidog.com/blog/browser-tools-mcp-server/), [React Grab](https://github.com/nicholasgriffintn/react-grab)) send element or component context via MCP, clipboard, or automation. Here we want the same **built-in** flow: click → context → Assistant in one step, without leaving the app.

---

#### Implementation (native app, post-rewrite)

**1. WebView stack and windowing**

- Use **Wry** (tauri-apps/wry): WebKit on macOS/Linux, WebView2 on Windows. Wry’s `WebViewBuilder::build()` accepts any type implementing **`HasWindowHandle`**, so a **winit** window (Slint’s backend per rewrite-tie-in-memo) is compatible.
- **Linux:** Wry uses WebKitGTK. On **X11**, `build(&window)` or `new_as_child()` can embed in a winit window. On **Wayland**, Wry typically requires a **GTK** container (e.g. `WebViewBuilderExtUnix::build_gtk(vbox)` with a `gtk::Fixed` or vbox); the tao crate exposes `window.default_vbox()` for this. Slint + winit does not provide a GTK widget by default, so **on Linux Wayland the browser may need to be a separate window** (Wry creates its own window) until we have a Slint–GTK or winit–GTK integration path. Document: X11 = embeddable; Wayland = separate window or GTK path.
- **Create WebView:** One WebView per “browser” instance. Load user-supplied URLs via “Open URL” or a webapp/bookmark list. Optional: URL bar, back/forward, refresh in the Browser panel chrome.

**2. Getting element context from the page to Rust**

Two mechanisms:

- **Custom protocol (recommended):** Register a custom scheme (e.g. `puppet-master`) with **`with_asynchronous_custom_protocol`**. The handler receives `Request<Vec<u8>>`; `request.body()` and `request.uri()` are available. Use **async** so we don’t block the WebView thread (e.g. push payload to app state or channel, then `responder.respond()` with a minimal 200 body). **Note:** On older WebKit2GTK (pre-2.36), POST body/headers to custom protocols were not passed (wry #614); newer Linux stacks support it. Fallback: send element context as **GET** with a query parameter (e.g. base64-encoded JSON) if POST body is empty on legacy systems.
- **IPC handler (alternative):** Wry’s `with_ipc_handler` receives messages from `window.ipc.postMessage(string)`. JS can `postMessage(JSON.stringify(elementData))`. Limitation: on Linux/Android, “the request URL is not supported on iframes and the main frame URL is used instead”; and availability of `window.ipc` on arbitrary loaded pages may be platform-dependent. Prefer **custom protocol** for portability and consistent POST body handling.

**3. Injected script: when and what to capture**

- Use **`with_initialization_script`** (runs before `window.onload` on each new page load) to install a **document-level click listener**. Guarantee: script runs in main frame; on Windows, scripts are also added to subframes (wry docs).
- **Capture mode:** Do **not** send every click to the Assistant. Support one of: (a) **Modifier key:** e.g. Cmd+Click (Mac) / Ctrl+Click (Windows/Linux) to “send this element to chat”; (b) **Toolbar toggle:** “Send element to chat” on, then next click sends context, then toggle off; (c) **Right-click context menu:** “Send element to chat” in a custom context menu. Option (a) or (b) is recommended so normal browsing is unaffected.
- In the listener: `if (!captureMode) return;` then `event.preventDefault(); event.stopPropagation();` to avoid navigation/form submit; get `event.target`, serialize it (see **Element context schema** below), then `fetch("puppet-master://element-context", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })`. No need to read the response body in JS; Rust responds with 200 and empty or minimal body.
- **Capture-mode state:** The “capture mode” flag must be visible to the injected script. Options: (1) **Initialization script** reads a global set by the host (e.g. `window.__puppetMasterCaptureMode = true` via `evaluate_script` when user toggles); (2) **Only modifier:** no global; script checks `event.metaKey`/`event.ctrlKey`. Option (2) avoids cross-script state but doesn’t support “toggle then click.” Prefer (2) for v1; add (1) if we add a toolbar toggle.

**4. Element context schema (what to send to the Assistant)**

Aim: **token-efficient**, **agent-useful** summary of the clicked element. Raw `outerHTML` can be huge; prefer a structured, bounded payload.

- **Required fields:** `tagName`, `id` (or null), `className` (string), `textContent` or `innerText` (truncated to e.g. 500 chars), `role`, `ariaLabel` (from `getAttribute('aria-label')` or `aria-label`), `rect` (`getBoundingClientRect()`: `x`, `y`, `width`, `height`), `parentPath` (short CSS-like path, e.g. `div#main > section > button.submit`, max depth 5–7).
- **Optional but useful:** `outerHTML` **truncated** (e.g. first 2000 chars + “…” if longer), `href` for anchors, `name` for form controls, `type` for inputs, `disabled`, `visible` (e.g. offsetParent check or intersection with viewport). **Omit** large blobs (e.g. full subtree HTML) by default; offer “Include full HTML” in settings or as a second action if needed.
- **Token budget:** Cap total JSON size (e.g. 4 KB or ~1k tokens) so a single click doesn’t dominate context. If over cap, truncate `textContent` and `outerHTML` first, then shorten `parentPath`.
- **Reference:** “Element to LLM”–style formats (e.g. layout-aware, accessibility-tree–style) can improve agent reasoning; we can adopt a compact JSON shape inspired by that and extend later (e.g. add `childrenSummary` or `siblingContext`).

**5. Rust handler and Assistant integration**

- In the **async custom protocol** handler: parse `request.body()` as JSON; validate required fields and size cap; push the payload to app state (e.g. a channel or “last captured element” + event). Then `responder.respond(Response::builder().status(200).body(vec![]).unwrap())`.
- **Main loop / UI:** When the event is received, format the element context for the Assistant (e.g. a markdown block or a structured attachment). Per **Plans/assistant-chat-design.md**, add support for an **“element context” attachment type** or a **“User selected element”** message variant so the next Assistant turn receives it (e.g. “User selected this element: …” in the conversation). Do **not** block the custom-protocol callback on network or heavy work; keep handler fast and delegate to the app’s event loop.

**6. GUI placement and UX**

- **Browser tab/panel:** Expose a “Browser” tab or panel (e.g. alongside Dashboard, Chat, Interview). Content: URL bar, optional back/forward/refresh, and the WebView. Optional: split view (browser + chat) so the user sees the page and the Assistant in one place.
- **Feedback:** When the user sends an element to chat, show a **toast** (“Element sent to chat”) and/or briefly **focus or scroll** the chat input so the user can type a follow-up. Optionally show a one-line summary in the chat (e.g. “Added: &lt;button class=\"submit\"&gt;”) before the full context is attached.
- **Keyboard:** Document shortcut for “Send element to chat” (e.g. Cmd+Click) in §11 and in-app help. For **accessibility (§23.11):** provide a way to “select current focused element and send to chat” (e.g. focus an element via Tab, then a shortcut) so keyboard-only users don’t rely on mouse click.

---

#### How to make it work (phased)

- **Phase A — Separate-window browser + capture:** Implement a **standalone browser window** (Wry + winit/tao), no Slint embedding. Custom protocol + initialization script; capture on Cmd/Ctrl+Click; serialize with the schema above; Rust handler parses and stores in app state. Verify on Windows, macOS, Linux (X11 and Wayland with separate window).
- **Phase B — Element schema v1:** Ship required fields + truncated optional fields; enforce token/size cap; add a simple “Element sent to chat” toast. No Assistant integration yet; just confirm capture and display in a debug or preview pane.
- **Phase C — Assistant integration:** Extend Assistant chat (assistant-chat-design.md) with “element context” attachment or message type; when capture event fires, append the formatted context to the current thread and optionally focus the composer. Test with a few real pages (e.g. Cursor docs, a local HTML form).
- **Phase D — Embedding (optional):** If we have a winit window handle and (on Linux) a GTK path, try **child WebView** (e.g. `new_as_child`) so the browser lives inside the main window. Fall back to separate window on Wayland if needed.
- **Phase E — Polish:** Toolbar “Send element to chat” toggle, optional “Include full HTML,” keyboard shortcut for “send focused element,” and any allowlist/security UX (see below).

---

#### Element context schema (detailed)

| Field         | Type   | Max/notes | Purpose for agent |
|---------------|--------|-----------|--------------------|
| `tagName`     | string | —         | Element type |
| `id`          | string \| null | — | Stable selector |
| `className`   | string | —         | CSS class |
| `textContent` | string | 500 chars | Visible text |
| `role`        | string | —         | ARIA role |
| `ariaLabel`   | string \| null | 200 chars | Accessible name |
| `rect`        | `{ x, y, width, height }` | — | Position/size |
| `parentPath`  | string | depth 5–7 | DOM path |
| `outerHTML`   | string | 2000 chars | Optional HTML |
| `href`        | string \| null | 500 chars | For links |
| `name`, `type`, `disabled` | as needed | — | Form controls |
| `visible`     | boolean | —         | Rough visibility |

Encode as JSON; total payload cap (e.g. 4 KB) with truncation as above.

---

#### Security

- **Arbitrary URL loading:** The WebView loads user-chosen URLs. Treat all page content as **untrusted**. Do not expose sensitive host APIs to the page; the only “back channel” is our custom protocol or IPC, and we only accept **element context** payloads (validate shape and size).
- **Validate and sanitize:** Before passing captured JSON to the Assistant, validate structure and cap sizes. Avoid re-rendering raw page HTML in the chat without sanitization if we ever show it in a rich view (e.g. use plain text or a safe subset).
- **Navigation and schemes:** Consider blocking or warning for `file://`, `blob:`, or sensitive schemes if they could leak local data. Per WebView2/OWASP guidance: restrict loaded content to HTTPS where possible; optional **allowlist** of “trusted webapp” origins and warn when loading non-allowlisted URLs.
- **Abuse:** A malicious page could repeatedly POST to `puppet-master://element-context`. Mitigate: **rate-limit** (e.g. max N captures per minute); optional “Confirm before sending to chat” for first capture per page; and only accept POST when capture mode is on (modifier or toggle), so random scripts can’t trigger sends without user action.

---

#### Gaps (to resolve in implementation)

- **Same-origin / CSP / strict sites:** Injected script runs in page context; strict CSP or non-scriptable pages may block or break. Fallback: “Copy element” that uses best-effort serialization (e.g. only when we control the page or user confirms “Allow capture on this site”). Document which sites are known to break.
- **Custom protocol POST body on Linux:** Older WebKit2GTK (&lt; 2.36) may not pass POST body to custom protocol (wry #614). Use **async** handler; if body is empty and method is POST, fall back to GET with query param (e.g. `?q=&lt;base64&gt;`) for that session and document minimum WebKit2GTK version.
- **iframes:** Initialization script runs in main frame (and on Windows in subframes). Clicks inside iframes may have different origin; capture may be limited or fail. Document “capture in main frame only” for v1; iframe support later if needed.
- **Linux Wayland embedding:** No GTK widget in Slint/winit by default; browser may be **separate window only** on Wayland until we have a GTK integration path. Document and test.
- **Slint + WebView in one window:** Slint has no native WebView widget. Embedding requires either a separate window, or a platform-specific child (e.g. winit handle + Wry `new_as_child` on X11/Windows/macOS; on Wayland, GTK container). Decide and document in Phase D.
- **Assistant schema:** Assistant chat must define the exact attachment type or message variant for “element context” and how it’s presented to the model (assistant-chat-design.md).

---

#### Potential problems

- **Malicious page spamming capture:** Page JS could call `fetch("puppet-master://element-context", { body: ... })` repeatedly. Mitigation: rate limit; only honor captures when user has triggered capture mode (modifier or toggle). We control the injected script, so we can avoid exposing the endpoint to arbitrary page script if we only inject the listener and don’t expose the URL in a global.
- **Token budget and context window:** Large or many “element context” attachments could fill the context. Mitigation: strict size cap per capture; optional “Summarize element” instead of “Send full”; and compaction/trimming per §10.
- **Click vs double-click vs right-click:** Define which event we use (e.g. single left-click with modifier). Double-click and right-click should not send unless we add explicit support; document behavior.
- **Accessibility:** Mouse-only capture excludes keyboard users. Provide “send focused element to chat” (e.g. when focus is in the WebView, a shortcut sends the currently focused DOM node). Requires focus tracking and possibly `document.activeElement` in the injected script.
- **Visibility and “what the user sees”:** We send DOM and rect; we don’t send a screenshot of the element by default. For some UIs (e.g. canvas, SVG, complex CSS), a screenshot might help; that would require render/capture (e.g. canvas or viewport screenshot and crop to rect). Defer to a later enhancement; document as optional.
- **fetch() response on custom protocol:** Some platforms have had issues with `fetch()` to custom protocols not resolving (e.g. Linux). Wry’s async responder should still allow us to respond; if the page’s fetch hangs, we can still process the body in Rust. Document and test; fallback to IPC if fetch is unreliable on a platform.

---

#### Testing

- **Unit:** Serialization shape: given a mock DOM node object, our JS produces JSON that matches the schema and size cap. Rust: given a valid/invalid JSON body, handler parses, validates, and rejects oversize or malformed input.
- **Integration:** Load a local HTML file in the WebView; trigger capture (modifier+click); assert custom protocol handler receives body; assert app state contains the element payload. Optional: mock Assistant and assert “element context” message is appended.
- **Manual:** Test on Cursor docs, a form, a SPA; verify capture works, toast appears, and Assistant receives context. Test on Linux X11 and Wayland (separate window); test Windows and macOS.
- **Security:** Try loading a page that posts to `puppet-master://` from page script (without our listener); confirm we only accept when capture mode is on and rate limit applies.

---

#### Dependencies and relationship

- **Crates:** Wry; on Linux, WebKitGTK and GTK (and optionally tao for `default_vbox()` if we use GTK embedding). Rewrite uses Slint + winit; Wry’s `build(&window)` works with `HasWindowHandle` (winit provides this).
- **Assistant:** Plans/assistant-chat-design.md — define “element context” attachment or message type and how it’s shown to the model.
- **Other plans:** MCP (§15.7) and browser tools (Plans/newtools.md) can complement (e.g. automation, screenshots); click-to-context is in-app and direct to the Assistant. §11 keyboard shortcuts; §23.11 accessibility for “send focused element.”

---

## 16. Phasing and Dependencies

Suggested order for implementation, assuming we want incremental delivery:

| Phase | Focus | Depends on |
|-------|--------|------------|
| **1** | Bounded buffers and process isolation audit (§13), protocol normalization design (§5) | None. **Audit checklist:** List all places we read subprocess output (runners, headless, any future stream consumer); introduce shared bounded buffer type and constants; document in AGENTS.md. |
| **2** | Persistent rate limit in GUI (§3), analytics dashboard (§7), “know where your tokens go” framing (§15.12) | Existing usage/plan detection; **align with Plans/usage-feature.md** (5h/7d, ledger schema, state-file-first). |
| **3** | Session/crash recovery (§4), restore points and rollback (§8), optional branching (§15.3) | State serialization, redb/projections (§14) |
| **4** | Orchestration prompt and optional role hints (§1) | Platform specs, execution engine |
| **5** | Hook system (§9), FileSafe dangerous-command blocking (§15.1), then plugin/skills (§6) | Config, event pipeline |
| **6** | Background agents with queue and git isolation (§2) | Git module, queue manager, GUI panel |
| **7** | Auto-compaction and context thresholds (§10) | Token estimation, state layer |
| **8** | Keyboard shortcuts and command palette (§11), stream event viz, thinking, timers (§12, §15.5, §15.6), mid-stream usage (§15.9) | Normalized stream (§5), UI components |
| **9** | Additional ideas as needed: project browser (§15.8), @ mentions (§15.4), in-app instructions editor (§15.3), MCP (§15.7), one-click install catalog (§15.13), IDE-style terminal and panes (§15.14), hot reload and fast iteration (§15.15), sound effects (§15.16), **instant project switch** (§15.17), **built-in browser and click-to-context** (§15.18), cross-device sync (§22), virtualization (§15.11), multi-tab/window (§15.10) | Core views and config |

**Notes:** Phase 9 can be subdivided; items are independent where dependencies allow. redb (§14) is part of the rewrite design and can be introduced in Phase 2 or 3 and then reused by analytics, restore points, and interview.

---

## 17. Relationship to Existing Plans and Cross-Reference

### 17.1 Relationship (Summary)

- **Orchestrator subagent integration:** Background agents (§2) and orchestration flow (§1) complement subagent selection; they don’t replace it. Hooks (§9) and plugins (§6) can supply additional agents/roles.
- **Interview subagent integration:** Restore points (§8) and recovery (§4) help interview resilience; skills (§6) can inject phase-specific context; orchestration (§1) can guide phase transitions.
- **Platform install plan:** No direct dependency; new features assume platforms are installed and detected as today. App-local bin remains the source for CLI paths.
- **AGENTS.md and REQUIREMENTS.md:** New features should be documented in AGENTS.md only where they add critical rules (e.g. “bounded buffers mandatory”); long reference stays in `docs/` or this plan.

### 17.2 Cross-Reference: What We Already Have or Are Planning

The following maps **existing plans** and **current code** to the features in this document. Use this to avoid duplicating work and to align newfeatures with prior decisions.

| Area | In codebase / other plans | In newfeatures |
|------|---------------------------|----------------|
| **Guards / safety** | **FileSafe.md:** Command blocklist, Write scope, Security filter, Prompt content checking; integration in `BaseRunner::execute_command()`. Destructive-pattern blocking before Bash runs. | §9 Hooks, §15.1 FileSafe dangerous-command blocking (PreToolUse can call FileSafe blocklist). |
| **Context / tokens** | **FileSafe.md (Part B):** Role-specific context compiler (`.context-{role}.md`), delta context, context cache, compaction-aware re-reads, skill bundling. Token efficiency and handoff schemas. | §10 Auto-compaction (usage %, summarize, preserve); §6 Skills (triggers + content). |
| **Subagents / roles** | **orchestrator-subagent-integration.md:** Tier-level subagent selection (phase/task/subtask/iteration), language/framework detection, `subagent_registry`; **place to setup subagent personas/info** (Config or Setup: view/edit name, description/purpose, optional custom instructions per subagent). **interview-subagent-integration.md:** Phase-specific subagents (product-manager, architect-reviewer, qa-expert, etc.), `SubagentConfig`. | §1 Orchestration flow (understand→decompose→act→verify); §2 Background agents (queue, git isolation). Orchestration and background agents **extend** subagent usage; they do not replace the orchestrator/interview subagent plans. |
| **Git / worktrees** | **WorktreeGitImprovement.md:** Worktree create/merge/cleanup, base branch, recovery, branch sanitization, PR from worktree branch. **MiscPlan:** Cleanup (prepare_working_directory, cleanup_after_execution), allowlist, `run_with_cleanup`. | §2 Background agents: git branch per run (stash, branch, diff/merge). Reuse existing `src/git/` and worktree/cleanup behavior; add **queue** and **per-run branch** on top. |
| **Usage / limits** | **Plans/usage-feature.md:** Usage feature scope, 5h/7d and ledger, state-file-first, GUI placement, gaps (5h/7d not in GUI, ledger vs usage_tracker schema). **Code:** `platforms/usage_tracker.rs`, `platforms/rate_limiter.rs`, `platforms/quota_manager.rs`, `state/usage_tracker.rs`, `doctor/checks/usage_check.rs`, `widgets/usage_chart.rs`. | §3 Persistent rate limit in GUI; §7 Analytics dashboard; §15.9 Mid-stream usage. Newfeatures adds **always-visible 5h/7d in UI** and **analytics view**; build on usage-feature.md and existing usage/plan-detection. |
| **Interview** | **interview-subagent-integration.md:** Phase 1–8, subagent per phase, prompt templates, document generation, AGENTS.md seeding. | §8 Restore points (rollback to phase); §4 Crash recovery (restore interview state); §6 Skills (phase-specific context). Newfeatures **adds** restore/rollback and recovery; does not replace interview phases or subagent assignments. |
| **Chain wizard / intent workflows** | **Plans/chain-wizard-flexibility.md:** Intent-based workflows (New project, Fork & evolve, Enhance/rewrite/add, Contribute PR), requirements step (multiple uploads, Requirements Doc Builder), adaptive interview phases, Project setup and GitHub (create repo, fork, PR start/finish). | §4 Recovery (snapshot includes wizard step and intent); §8 Restore (rollback). Chain-wizard-flexibility defines **entry-point flexibility** and **intent**; newfeatures recovery/restore apply to the updated flow. |
| **GUI / testing** | **newtools.md:** GUI tool discovery (gui_tool_catalog), Playwright + framework tools + custom headless, interview flow for tool choice, MCP in GUI. | §15.7 MCP (config + passthrough). MCP in newfeatures is consistent with newtools; ensure one place for MCP config and Doctor/wiring. |
| **Cleanup / artifacts** | **MiscPlan:** Cleanup policy, allowlist, `src/cleanup/`, runner contract, agent-output dir, evidence retention and pruning, Cleanup UX. | §2 Background agents: output to `.puppet-master/agent-output/{run-id}/`. Align with MiscPlan’s agent-output and evidence policy; cleanup allowlist must include that dir or exclude it by policy. |
| **Config wiring** | **WorktreeGitImprovement.md:** Option B (build run config from GUI at run start). **Orchestrator/Interview plans:** Config must be wired (add to config type, set from gui_config, use at runtime). | All newfeatures that need config (hooks, plugins, compaction, recovery) must follow the same wiring pattern (e.g. Option B) so the orchestrator and interview actually see the settings. |
| **HITL (human approval at tier boundaries)** | **Plans/human-in-the-loop.md:** Pause after phase/task/subtask completion for human approval; three independent toggles, off by default. **Orchestrator plan:** Tier boundaries and “Start and End Verification at Phase, Task, and Subtask” define where HITL gates run (after end verification, before advance). | §20 Human-in-the-Loop. HITL is a **setting** only; tier semantics stay in the orchestrator plan (DRY). |
| **Application & project rules** | **Plans/agent-rules-context.md:** Application-level rules (e.g. “Always use Context7 MCP”) fed to every agent everywhere; project-level rules (e.g. “Always use DRY Method”) fed to every agent working on that project. Single rules pipeline; orchestrator, interview, and Assistant all use it. | N/A (fully specified in agent-rules-context.md). |
| **Updating Puppet Master** | No existing plan; app update (version visibility, update discovery, upgrade path, config compatibility) is specified in this plan only. | §21 Updating Puppet Master. |
| **Cross-device sync** | No existing plan. Manual export/import plus sync to BYOS (Bring Your Own Storage). Multiple storage options and custom config; support NAS, network storage, server (SMB, NFS, SFTP, WebDAV, or mounted path). Same payload for export and BYOS; no central cloud account. | §22 Cross-Device Sync. |
| **IDE terminal, panes, hot reload** | No existing plan. Full IDE-style terminal + Problems, Output, Debug Console, Ports (§15.14); hot reload / live reload / fast iteration with project detection, one-click dev mode, Assistant-callable live tools (§15.15). **assistant-chat-design.md §17:** Assistant can call up live testing tools; spec in newfeatures §15.16. | §15.15, §15.16. |
| **Instant project switch** | No existing plan. Ability to instantly switch between projects with context and settings swapping; project bar or sidebar (OpenCode Desktop–style). Reference: [OpenCode](https://github.com/anomalyco/opencode) `packages/app` layout + sidebar-project; route/URL as source of truth; per-project state keyed by path. | §15.17. |
| **Built-in browser / click-to-context** | No existing plan. Launch webapps inside the app; click an element and send its context (DOM, attributes, rect) immediately to the Assistant chat (Cursor-style). Native implementation via Wry WebView + custom protocol; JS captures element, POSTs to `puppet-master://element-context`; Rust forwards to Assistant. | §15.18. |
| **Sound effects** | No existing plan. Per-event sound settings (Agent, Permissions, Errors, optional others): toggle + sound selection per event; user can load their own sounds (file picker, store in app sounds dir); combined built-in + user catalog; config persistence; single playback helper. UI layout flexible. | §15.17. |
| **Assistant / chat** | **Plans/assistant-chat-design.md:** Assistant chat, Dashboard warnings and CtAs (HITL approval), live testing tools (§17 / §22), context/usage display; rules pipeline and project context. | §15.15 Assistant-callable live tools; §20 HITL (CtAs addressable via Assistant); §3/§7 usage visibility. |
| **Architecture** | **Code:** Single Rust/Iced process; platforms spawn CLI from Rust (`runner.rs`, platform-specific runners). No separate Node or WebSocket server; no stream-json parsing today (platforms use stdout capture and completion signals). | §19.1 Three-process layout (Tauri + React + Node server) is **not** our architecture. We have **one** Rust app; §5 Protocol normalization and §19 stream format still apply **if** we add streaming or multi-platform output parsing—e.g. in-Rust parser and bounded buffers, no extra process. |

### 17.3 What to Adapt from Newfeatures

- **Orchestration prompt (§1):** Add `--append-system-prompt` (or equivalent per platform) when building CLI invocations. Single canonical prompt in repo; platform_specs or orchestration module. Fits orchestrator and interview without changing tier or phase structure.
- **Persistent rate limit (§3):** Surface existing usage/plan data (usage_tracker, quota_manager, usage_check) in header or dashboard. Add 5h/7d display and optional warning threshold; refresh in background. No new backend if we already persist usage events.
- **Bounded buffers (§13):** Audit all places we read subprocess stdout (runners, headless). Introduce a shared bounded buffer type and constants; document in AGENTS.md. Aligns with FileSafe and MiscPlan (deterministic, safe behavior).
- **Hooks (§9) and FileSafe (§15.1):** Event enum (e.g. PreToolUse, UserMessageSubmit); run scripts with JSON in/out and timeout. Dangerous-command blocking is part of FileSafe; PreToolUse hooks can call into FileSafe blocklist. **Integrate with FileSafe:** FileSafe already blocks in runner; hooks can be an additional layer (e.g. user-defined rules) or call into the same pattern list. One extension point (FileSafe for core, hooks for optional/user).
- **Restore points (§8):** Snapshot after each iteration or message (file list + content); rollback = restore files + truncate state. Useful for interview (roll back phase) and orchestrator (roll back iteration). Conflict check via mtime/hash; optional branching. Can use existing evidence/state paths.
- **Session/crash recovery (§4):** Timer snapshot (state struct) to disk; on startup offer restore. Fits our single-process model; no need for a separate recovery server.
- **Compaction (§10):** If we add stream or token counting, compaction (monitor usage %, send compact prompt, replace history) can sit on top of FileSafe’s context compiler and compaction-aware re-reads. FileSafe already has “compaction marker” and context cache; newfeatures compaction is **conversation** compaction (summarize messages), which is complementary.
- **Plugin/skills (§6) and one-click install (§15.14):** Single plugin dir, manifest, registries (command, agent, hook, skill). Resolve at runtime. One-click = catalog + copy + refresh. Fits DRY and gui_tool_catalog pattern (newtools); consider a single “catalog” pattern for both tools and plugins.
- **Background agents (§2):** Queue manager + git branch per run + output dir. Reuse `src/git/` and WorktreeGitImprovement behavior; add queue and “run on branch” semantics. Merge conflict detection via existing git/worktree logic.
- **Keyboard and command palette (§11):** Shortcut registry and Ctrl/Cmd+P modal. Improves UX without changing execution model.
- **Stream event viz, timers, thinking (§12, §15.5, §15.6):** Only relevant **if** we add streaming or stream-json parsing. Today we don’t stream; if we do, use normalized stream (§5) and bounded buffers, then add UI for events and timers. Defer until we have a stream pipeline.

### 17.4 What We Do Better or Differently

- **Single process:** We don’t need a middle Node server or WebSocket. Rust spawns the CLI, reads stdout, and updates state. For streaming we’d add an in-Rust parser and optional live UI updates, not a separate process. Lower complexity and no port/process management.
- **FileSafe first:** We already plan deterministic, pre-execution guards (database, file, security, prompt). Dangerous-command blocking is part of FileSafe (one blocklist, one integration point in runner).
- **Context compilation (FileSafe Part B):** We already plan role-specific context, delta context, and compaction-aware re-reads. Newfeatures’ compaction (summarize conversation) is a **different** layer (message/session compaction vs. context compilation). Keep both; they address different problems.
- **Subagent registry and config:** Orchestrator and interview plans define the single source of truth for subagent names and config. Newfeatures’ “agents” (e.g. architect, implementer) should map to **subagent names** from those plans and platform_specs, not introduce a parallel agent taxonomy.
- **Usage and plan detection:** We already have usage_tracker, rate_limiter, quota_manager, and plan detection from error messages. Newfeatures’ “5h/7d always visible” and analytics are **UI and aggregation** on top of that; no need to reimplement tracking.
- **Worktree and cleanup:** WorktreeGitImprovement and MiscPlan define worktree lifecycle and cleanup policy. Background agents’ “git branch per run” should use the same git/worktree modules and respect cleanup allowlists and evidence retention.

### 17.5 What to Defer or Skip

- **Three-process architecture (§19.1):** We are not adding a Node server or WebSocket. Treat §19.1 as “one possible pattern elsewhere”; our implementation stays single Rust process. Stream parsing (if added) is in-Rust with bounded buffers.
- **Full protocol normalization (§5) and stream-json everywhere:** Valuable if we add streaming and multi-provider output. Defer until we have a concrete need (e.g. live progress, thinking display). When we do, define a minimal schema and per-platform adapters in our runners.
- **Multi-tab / multi-window (§15.10), virtualization (§15.11):** UX improvements; defer until core features (hooks, plugins, recovery, usage UI) are in. Virtualization matters if we show very long logs or message lists.
- **In-app instructions editor (§15.3), @ mentions (§15.4), project browser (§15.8):** Nice-to-have; implement after persistent rate limit, recovery, and hooks. @ mentions require prompt-building changes; project browser can reuse project list and git status from existing code.
- **Database (§14):** Per rewrite, structured storage is not optional: use **redb** (and analytics scan jobs over seglog) for querying and scale; see Plans/storage-plan.md.

### 17.6 References to Other Plan Documents

- **Plans/FileSafe.md** — Guards, context compilation, token efficiency; integration point in runner.
- **Plans/interview-subagent-integration.md** — Interview phases, phase subagents, config, document generation.
- **Plans/MiscPlan.md** — Cleanup, runner contract, agent-output, evidence, config wiring.
- **Plans/newtools.md** — GUI tool discovery, MCP in GUI, test strategy and tool selection.
- **Plans/orchestrator-subagent-integration.md** — Tier-level subagent selection, config wiring, verification.
- **Plans/WorktreeGitImprovement.md** — Worktrees, git/gh resolution, config (Option B), branch strategy.
- **Plans/human-in-the-loop.md** — Human-in-the-Loop (HITL) mode: pause at phase/task/subtask boundaries for approval; settings and behavior (§20).
- **Plans/agent-rules-context.md** — Application-level (Puppet Master) and project-level agent rules; fed into every agent via a single rules pipeline; storage and GUI (Application rules, Project rules).
- **Plans/usage-feature.md** — Usage feature scope, 5h/7d and ledger visibility, state-file-first data, GUI placement options, current gaps and acceptance.
- **Plans/assistant-chat-design.md** — Assistant chat, Dashboard warnings and CtAs (including HITL approval), live testing tools (§17 / §22), context/usage display; rules pipeline and project context.
- **Plans/chain-wizard-flexibility.md** — Intent-based workflows (New project, Fork & evolve, Enhance/rewrite/add, Contribute PR), requirements step redesign (multiple uploads, Requirements Doc Builder), adaptive interview phases, Project setup and GitHub (create repo, fork offer/user, PR start/finish).

### 17.7 DRY and Single Source of Truth

All new features must reuse these single sources; do not duplicate data or logic:

| Source | Used for |
|--------|----------|
| **platform_specs** | All platform CLI data (binary names, flags, models, auth, capabilities). |
| **docs/gui-widget-catalog.md** and **src/widgets/** | UI components; check before creating new widgets. |
| **Rules pipeline** (agent-rules-context.md) | Application + project rules injected into every agent; orchestration prompt is composed *after* rules. |
| **Usage state and usage-feature.md** | 5h/7d, ledger, analytics; usage-feature.md is the single source for Usage scope and gaps. |
| **MiscPlan, WorktreeGitImprovement** | Cleanup, worktree, agent-output dir, config (Option B). |
| **Subagent registry** (orchestrator/interview plans) | Subagent names and config; plugin “agents” map to subagent names. |
| **MCP config** (newtools §8 + §15.7) | One place for MCP server list and per-platform wiring. |

---

## 18. Task Status Log

| Date | Status | Summary |
|------|--------|--------|
| (none) | — | Plan created; no implementation yet. |

---

## 19. Technical Analysis: How These Mechanisms Work

The following explains **how** the features above can be implemented in practice. It is based on public documentation, architecture descriptions, and official CLI/API behavior.

### 19.1 Three-Process Layout and CLI Integration

**Puppet Master architecture:** We use a **single Rust/Iced process**; we do **not** add a middle Node server or WebSocket layer. The “three-process” layout below is an **alternative pattern used elsewhere**; our implementation stays one Rust app that spawns the CLI as a child process and reads stdout (optionally with an in-Rust stream parser and bounded buffers). See §17.5 and the Architecture row in §17.2.

**Alternative pattern (not ours):** A common pattern elsewhere is to run three processes:

1. **Native backend (e.g. Rust/Tauri)** – Window, file system, redb, crash recovery, port management. Exposes many commands to the frontend.
2. **Frontend (e.g. React)** – UI and state. Talks to the backend via IPC and to a middle layer via WebSocket.
3. **Middle server (e.g. Node, often compiled to a binary)** – Listens on a **dynamic port** (e.g. 20000–65000), found and held by the backend to avoid races. This server spawns the **CLI as a child process**.

**CLI invocation:** The middle server spawns the CLI, e.g.:

```text
claude --print --output-format stream-json --model <model> --working-dir <path>
```

Optional: `--append-system-prompt` (or `--append-system-prompt-file`) for orchestration, `--no-session-persistence` for print-only. The CLI’s stdout is **newline-delimited JSON**; the server reads it line-by-line and forwards events (e.g. over WebSocket: `stream-chunk`, `stream-complete`, `token-update`).

**Why “no lag”:** The UI runs in a separate process from the CLI so the main thread never blocks on CLI I/O. The stream is consumed with **bounded buffers** (e.g. 100KB in a parser, 10MB in the server). Long lists are **virtualized**. Together this keeps input latency low in long sessions.

### 19.2 Usage and Rate Limits (Session vs 5h/7d)

**Session-level token usage (from stream):**  
CLI with `--output-format stream-json` emits **usage in the stream**. When a line’s JSON has `type` `"usage"`, it carries e.g. `input_tokens`, `output_tokens`, and optionally cache fields. The server (or a parser) reads stdout line-by-line, parses JSON, and when it sees `usage` forwards to the UI (e.g. `token-update` or `context-update`). **Mid-stream:** emit usage during the response so the context bar updates in real time. So “tokens used this session” and “context usage %” come from **parsing stream-json** and aggregating `usage` events; no separate API is required for per-session usage.

**Account-level limits (5-hour and 7-day windows):**  
Possible sources:

1. **`/usage` slash command** – In interactive mode the user can type `/usage`; there is no documented non-interactive “usage only” CLI flag, so an app cannot simply get usage without running a full session and parsing the reply.
2. **`claude --account`** – Documented to show “subscription tier and approximate usage information.” An app can **run `claude --account`** (or platform-equivalent), capture stdout, and **parse** it to get approximate usage and tier. Run periodically (e.g. every few minutes) to refresh the “5h / 7d” display without an API key.
3. **Admin API** – For organizations, Anthropic exposes an Admin API (e.g. `/v1/organizations/usage_report/claude_code`) that returns usage and cost. This requires an Admin API key and is not for individual Pro/Max accounts.

**For Puppet Master:** (1) **Session usage** from our runner’s stream when we have stream-json or equivalent. (2) **5h/7d** via periodic `claude --account` (or platform-equivalent) and parsing, and/or optional Admin API when the user provides a key. Document which platforms expose account/usage via CLI vs API.

### 19.3 Stream Format and Protocol Normalization

**Canonical stream:** One JSON object per line on stdout with a required `type` field. Main types:

- `system` – init/session metadata (`session_id`, `model`, `cwd`, `permissionMode`, `tools`).
- `text` – streaming assistant content (`content`).
- `tool_use` – tool call (`id`, `name`, `input`).
- `tool_result` – tool result (`tool_use_id`, `content`, optional `is_error`).
- `usage` – token counts (`input_tokens`, `output_tokens`, optional cache fields).
- `result` – end-of-turn (`is_error`, optional `usage`, `total_cost_usd`, `duration_ms`).
- `message_stop` – end of message.
- `thinking` – optional extended thinking (`thought`).
- `error` – fatal or recoverable error.

The middle server (or backend) reads line-by-line, parses JSON, and forwards or converts to internal events. Multi-provider support uses a **shim** that runs each provider’s CLI or API and **translates** its output into this same schema so one parser and one UI pipeline handle all platforms.

**For Puppet Master:** Define our own “orchestrator stream” schema (§5) and, per platform, add an adapter that maps platform output (Claude stream-json, Codex JSONL, Gemini JSON, etc.) into that schema.

### 19.4 Compaction

**Mechanism:** A component monitors **context usage %** from the same token counts as session usage (§19.2). When usage crosses a threshold (e.g. 75% or 85%), it sets a “pending compact” flag. On the **next** user message, the app: (1) Builds a “compact” prompt (e.g. “Summarize this conversation and list key decisions; preserve file paths and open tasks”). (2) Sends that to the CLI; the CLI returns a summary. (3) Replaces “old” messages in state with the summary. (4) Then sends the user’s actual message. So compaction is **orchestrated by the app**; the CLI is just the model that produces the summary. Show “Compacting…” in the UI and optionally run hooks at `compaction_trigger` and `context_warning`.

### 19.5 Orchestration Flow

**Mechanism:** Injected via **system prompt**. When spawning a new session, add `--append-system-prompt "<text>"` or `--append-system-prompt-file <path>`. The appended text instructs the model to assess task complexity and follow a loop (e.g. understand → decompose → act → verify) and optionally use named roles. Store the text in a service and allow toggling or customization in settings.

### 19.6 Hooks and FileSafe

**Hooks:** Backend defines events (e.g. `user_prompt_submit`, `pre_tool_use`, `context_warning`, `compaction_trigger`). When an event fires, run configured hooks (e.g. scripts) with a JSON payload; the script returns JSON (e.g. `{ "action": "continue"|"block"|"modify", "payload": ... }`). Enforce a timeout (e.g. 5s) and then continue or block/modify. **Dangerous-command blocking:** Part of FileSafe; PreToolUse can call into FileSafe blocklist. Same contract: receive tool name and arguments, return block with message when dangerous. Config can allow overrides or allowlists.

### 19.7 One-Click Install

**Mechanism:** A **catalog** (JSON or manifest: id, name, description, type, source URL or bundled path). “Install” = download or copy from bundle into the plugin dir, then refresh the in-memory registry (commands, agents, hooks, skills). Each type has a known format (commands = markdown with frontmatter, agents = markdown with YAML, hooks = script path, skills = JSON with triggers and content). One action in the UI runs the install routine; the app does the rest without the user editing files.

### 19.8 Background / Async Agents with Queue and Git Isolation

**Queue:** A **queue manager** (e.g. in Rust) holds a fixed-capacity job queue (e.g. max 4 concurrent). Each job is “run agent X with prompt Y.” When a slot is free, the manager spawns the same CLI path used for the main flow (same binary, same stream-json contract) but with a distinct working dir or session id. The manager tracks each run’s PID, status (queued / running / completed / failed / cancelled), and output path. Optionally persist queue state to disk so it survives app restart.

**Git isolation:** Before starting a background run: (1) If working tree is dirty, run `git stash` (or equivalent). (2) Create a branch from current HEAD, e.g. `async-{role}-{id}`. (3) Spawn the CLI with `--working-dir` pointing at the repo (or a worktree checked out to that branch). (4) CLI runs and commits (or not) on that branch. When the run finishes, the app can offer: diff (e.g. `git diff main..branch`), merge (e.g. `git merge --no-commit --no-ff` to detect conflicts first), or delete branch. **Conflict detection:** Run a dry-run merge (e.g. `git merge --no-commit --no-ff` then abort); if exit code or output indicates conflicts, surface in UI and block auto-merge.

**Output isolation:** Each run writes stdout/stderr and any artifacts to a dedicated directory (e.g. `.puppet-master/agent-output/{run-id}/`). The main session’s stream and state are separate; the UI shows background runs in a separate panel and does not mix their output with the main conversation.

### 19.9 Session and Crash Recovery

**Snapshot content:** Serialize a minimal struct: current view/phase, selected project path, orchestrator state (phase/task/subtask ids), interview phase and answers if applicable, window position/size, unsent input buffer, timestamp. Optionally include the last N message ids or iteration ids for the active run. Write to a known path (e.g. app data dir + `recovery/snapshot_<timestamp>.json`).

**When to snapshot:** A timer (e.g. every 5 minutes) triggers a snapshot write. Optionally a shorter-interval “auto-save” (e.g. 30s) that only writes a lightweight checkpoint (e.g. unsent input + current view). Use non-blocking I/O so the main loop doesn’t stall.

**On startup:** Check for the presence of a recovery file (e.g. newest snapshot under 24 hours). If found, show a small dialog: “Restore previous session?” If user confirms, load the snapshot and restore: set view, project, orchestrator state, interview state, window geometry; optionally restore unsent input. Then delete or archive the snapshot so we don’t re-prompt on next launch.

**Panic hook:** Register a panic hook that, before exiting, writes one last snapshot (or a “crash occurred” marker). That way the next launch can offer restore even when the app crashed.

**Cleanup:** On startup or in the background, delete snapshots older than the retention window (e.g. 24 hours).

### 19.10 Plugin and Skills Extensibility

**Discovery:** On startup (and when the user clicks “Refresh”), scan the plugin directory (e.g. app data or project `.puppet-master/plugins/`). Each plugin is a subdirectory containing a manifest (e.g. `plugin.json`) with: id, name, version, and lists of commands, agents, hooks, skills (each entry points to a file or inline config).

**Registries:** Build in-memory maps: command name → (path or content, metadata), agent name → (system prompt, tools, metadata), hook event → list of (script path or handler, metadata), skill trigger → (triggers, content, metadata). These are the “plugin registries” the rest of the app uses.

**Resolution at runtime:** When the user invokes a command, look up the command name in the registry; if it’s a plugin command, run it (e.g. build a prompt from the command’s markdown and send to the CLI). When building the iteration prompt, collect all skills whose triggers match (e.g. file extension, keyword, or regex against open files or prompt text); append their content to the context. When a hook event fires, run each registered handler for that event with the JSON payload and apply the result (continue/block/modify).

**Formats:** Commands and agents are typically markdown with YAML frontmatter; hooks are scripts (e.g. shell) that read JSON from stdin and write JSON to stdout; skills are JSON (triggers array + content string).

### 19.11 Analytics and Usage Dashboard

**Data source:** Either (a) query **redb** rollups produced by **analytics scan jobs** (scan seglog for run/usage events and write aggregates into redb), or (b) **scan** evidence/run logs on demand (e.g. list directories under `.puppet-master/evidence/` or similar and parse metadata files). The redb rollup approach is faster for large history; the scan approach can be used before rollups are populated.

**Aggregation:** For “by project”: group runs by `project_path`, sum tokens/cost, count runs, max timestamp. For “by model/platform”: group by platform and model. For “by date”: group by day (or week), sum tokens/cost, count runs. Run these queries when the user opens the analytics view or when the time-range filter changes.

**UI:** Time-range selector (7d, 14d, 30d, all); optional project filter; cards for totals; tables or simple charts (e.g. by project, by platform, by date). Export = serialize current view to CSV/JSON and write to a file. All data stays local; no telemetry.

### 19.12 History and Restore Points (Rollback)

**When to snapshot:** After each “logical turn”—e.g. after each iteration in the orchestrator, or after each user message in a chat-style flow. For each turn, record: turn id (or message index), list of files that were modified (path + content before, content after or diff), and optional metadata (timestamp, platform, etc.). Store in a bounded store (e.g. last 50 restore points, or last N days) to limit disk use.

**Storage:** Either a directory of files (one per restore point, e.g. JSON with file snapshots) or a **redb** table (restore_points in redb schema). File snapshots can be full content or diffs; for rollback we need to be able to reconstruct “content before.”

**Rollback flow:** User selects a restore point. (1) Compute the set of files that were modified after that point. (2) For each file, check for conflicts: compare stored mtime or hash with current file; if the file was changed outside the app (or by another run), warn and optionally skip or show diff. (3) Show confirmation: “Restore N files and truncate state to this point?” (4) On confirm: write each file’s snapshot content back to disk; update app state (e.g. set current phase/task/subtask or message index to that point). Optionally re-run the verification gate for that point.

**Branching:** “Restore and branch” = create a new session/conversation id, copy the restore point’s state and file snapshots into that new id, and mark the current session as having “branched from” that point. The user can then continue from the restore point in the new branch without overwriting the original timeline.

### 19.13 Keyboard-First and Command Palette

**Shortcut registry:** Maintain a map: (modifiers + key) → action. Actions are app messages or command ids (e.g. “OpenSettings”, “NewRun”, “SwitchToDashboard”). On key event (e.g. in the window or a global listener), normalize modifiers (Cmd vs Ctrl by platform) and look up the action; if found, dispatch it. Register shortcuts for every major action (20+).

**Command palette:** A modal or overlay that appears on a fixed shortcut (e.g. Ctrl/Cmd+P). It shows a list of all available actions (and optionally recent projects, open tabs). The list is filtered by the user’s typed string (prefix or fuzzy match). User moves selection with Up/Down and activates with Enter; Escape closes. “Execute” = dispatch the same action as if the user had used the shortcut or clicked the menu. The list can be categorized (e.g. Navigation, Run, Settings) for clarity.

**Documentation:** Generate the “Keyboard shortcuts” help view from the same registry so the list is always in sync.

### 19.14 Stream Event Visualization and Thinking Display

**Event types:** From the normalized stream (§19.3), each event has a `type` (e.g. `text`, `tool_use`, `tool_result`, `thinking`, `usage`). Map these to a small set of display types: e.g. read, edit, bash, tool_call, tool_result, thinking, message. Each has an icon and optional short label.

**Event strip:** A horizontal strip (or short list) that shows the **last N** events (e.g. 10–20) or events in a **sliding time window** (e.g. last 5 seconds). When a new event arrives, append it (and drop the oldest if over the cap). Render each as a small icon (and optional tooltip). Place the strip near the run status (e.g. in dashboard or run detail view) so the user sees “what’s happening” at a glance.

**Thinking display:** If the stream emits `thinking` or `thinking_delta` events with a `thought` (or similar) field, append the text to a buffer. Display the buffer in a dedicated pane or collapsible section (e.g. “Thinking” below the main log). Limit display length (e.g. last 4k characters) to avoid UI lag. Sanitize content if needed (e.g. escape HTML). **Thinking toggle:** A setting (e.g. `ui.show_thinking_stream`) controls whether the thinking pane is visible and updated; when off, still consume the events (for protocol correctness) but don’t render them, or show only a “Thinking…” placeholder.

### 19.15 Bounded Buffers and Process Isolation

**Bounded buffers:** Any component that reads subprocess stdout/stderr or accumulates stream lines must use a **fixed-capacity** buffer (e.g. a ring buffer or a deque with a max size). When the buffer is full, drop the **oldest** data (or the oldest line). Typical limits: max total bytes (e.g. 10 MB) and/or max number of lines (e.g. 1000). This prevents unbounded memory growth if the CLI produces output faster than the app consumes it or if a run never ends.

**Where to apply:** (1) The process that reads CLI stdout (e.g. in the runner or a middle server): use a bounded line buffer. (2) Any stream parser that accumulates input before parsing (e.g. multi-line JSON): cap the accumulation size. (3) The GUI component that displays “live” run output: feed it from a bounded buffer, not the raw stream.

**Process isolation:** The app process must **never** run the CLI logic in-process (e.g. no embedding the model). The CLI is always a **child process** (or a separate service). The app communicates via stdin/stdout (or sockets). If the CLI hangs, the app can kill the process and remain responsive. This is a non-negotiable architectural constraint for reliability and “no lag.”

### 19.16 Database and Persistence (Structured State)

**When to use structured storage:** For state that benefits from **querying** and **indexing**: run history, restore points, analytics aggregates, session metadata. Per rewrite design, structured storage (seglog/redb/Tantivy or equivalent) is part of the architecture, not optional. File-based state (prd.json, progress.txt, AGENTS.md) remains the source of truth for the work queue and long-term memory; the projections layer provides reporting and recovery.

**Schema (minimal):** Tables such as: `runs` (id, project_path, platform, model, started_at, ended_at, outcome, evidence_path); `restore_points` (id, run_id, created_at, file_snapshots_json); `usage_snapshots` (id, platform, 5h_used, 7d_used, recorded_at). Add tables as features need them (e.g. interview phases, analytics by hour).

**Implementation:** Use **redb** for durable KV. One module (e.g. `db` or `persistence`) opens the redb database at a fixed path (e.g. under app data dir), runs **migrations** (versioned schema applied in order when the stored schema version is less than the app’s), and exposes functions to insert/query. Keep migrations additive where possible.

**Optional:** Allow a “lite” mode (build-time or runtime) that disables redb and relies only on file-based state for minimal deployments.

### 19.17 In-App Project Instructions Editor

**Mechanism:** Determine the path to the project instructions file (e.g. AGENTS.md or CLAUDE.md in the current project root). **Read** the file into memory and show it in a text area (or simple editor widget). On “Save,” **write** the content back to that path. Optional: a **live preview** pane that renders the markdown (e.g. via a minimal markdown-to-HTML renderer or by delegating to a web view). The app does not need to interpret the file; it just provides read/write and optional preview so the user can edit without leaving the app. Path comes from app state (current project).

### 19.18 @ Mention System for File References

**Trigger:** In the prompt input widget, detect the `@` character (e.g. on keypress or when the user types `@`). Open a dropdown or overlay.

**Data source:** Build a list of “mentionable” items: (a) recent files (from app state or a recent-files list), (b) modified files in the current run or session, (c) folder contents when the user types `@path/` (e.g. list directory at `path`). Optionally support a small folder tree. Filter the list by the substring after `@` (prefix or fuzzy match).

**On select:** Insert the chosen reference into the input at the cursor. Format can be the raw path or a token like `@path/to/file`. When **building the iteration prompt** (or sending to the CLI), resolve each `@path` token: read the file and include its contents in the context, or add a platform-specific “include file” directive. So the backend must know how to expand mentions into context.

### 19.19 Stream Timers and Segment Durations

**Mechanism:** In the **stream consumer**, track the **current segment** by event type. When a `thinking` (or `thinking_delta`) event arrives, start a timer for “thinking”; when a `tool_use` for Bash arrives, start a timer for “bash”; when a `tool_result` arrives, stop the timer for that tool call and record the duration. Optionally maintain a small **ring buffer** of the last N segments (type + duration in ms). In the UI, show “Current: Thinking 0:12” and optionally “Last: Bash 0:45, Read 0:01.” Timers are derived entirely from the normalized stream; no separate instrumentation.

### 19.20 MCP (Model Context Protocol) Support

**Mechanism:** The app does not implement MCP itself; it acts as a **config and passthrough** layer. **Config:** Store a list of MCP servers (name, command, args, env, auto_start). **When spawning the CLI:** Merge this config into the format the platform expects—e.g. for Claude Code, `--mcp-config <path>` or a config file that the CLI reads; for other platforms, the equivalent flag or env. So the user manages the list of servers in the app (add/edit/remove, test connection), and the app writes the config and passes it to the CLI. Document per platform how MCP is configured (flag, env, config file path).

### 19.21 Project and Session Browser

**Data source:** Either (a) scan the file system for “recent” or “known” project roots (e.g. from a saved list, or from run metadata in redb), or (b) list entries from redb (runs grouped by project_path). For each project, optionally list recent sessions or runs (e.g. last 10) with timestamp and outcome.

**UI:** A view that lists projects (and optionally expandable sessions per project). Search/filter by name or path. Optional: for each project, call the **git** module to get branch name and dirty status (e.g. `git status --short`); show a one-line summary or badge. Clicking a project sets it as the current project; clicking a session might open run detail or offer to restore.

### 19.22 Multi-Tab and Multi-Window

**Tabs:** The main layout has a **tab bar**. Each tab holds: view id (e.g. dashboard, config, run detail) + context (e.g. project path, run id). When the user switches tabs, the app loads that view with that context. Tab list and order can be persisted (e.g. in config or in the recovery snapshot). No need to keep every tab’s full state in memory; only the active tab’s view is fully built; others can be lazy-loaded when selected.

**Multiple windows:** Depending on the framework, either (a) the app supports multiple top-level windows (each with its own tab set), or (b) multiple instances of the app run and share state via a file or redb. Drag-between-windows (e.g. move a tab from one window to another) is optional and platform-dependent.

### 19.23 Virtualized Conversation or Log List

**Mechanism:** For any list that can be very long (e.g. 10k+ messages, iterations, or log lines), use **virtualized rendering**: only create widgets (or DOM nodes) for the **visible range** plus a small **overscan** (e.g. 5–10 items above and below). The scroll position (and container height) determines which slice of the list is “visible.” When the user scrolls, recompute the slice and re-render only that slice. Total list length is known (from data); the scrollable area uses a **placeholder** height (e.g. item_count * estimated_item_height) so the scrollbar is correct. This keeps the number of live widgets bounded and avoids lag and high memory use.

### 19.25 Summary Table

| Feature | Mechanism |
|--------|-----------|
| **CLI integration** (§19.1) | **Alternative (not ours):** Middle server spawns CLI; forwards via WebSocket. **Our implementation:** Single Rust process spawns CLI, reads stdout (optionally stream-json), bounded buffer; no middle server. See §19.1 and §17.5. |
| **Session usage** (§19.2) | Parse `usage` events from stream-json; accumulate tokens; emit to UI (and optionally mid-stream). |
| **5h/7d limits** (§19.2) | Periodic `claude --account` (or equivalent) and parse stdout; or Admin API when org key is set. |
| **Compaction** (§19.4) | App monitors usage % from stream; at threshold, sends compact prompt to CLI, then replaces history with summary. |
| **Orchestration** (§19.5) | `--append-system-prompt` (or file) on spawn with fixed “understand → decompose → act → verify” text. |
| **Stream format** (§19.3) | Newline-delimited JSON with `type` and type-specific fields; same schema for all providers via shim. |
| **Hooks / FileSafe** (§19.6) | Event enum; run scripts with JSON in/out and timeout; dangerous-command blocking via FileSafe blocklist. |
| **One-click install** (§19.7) | Catalog + install routine that copies files and refreshes registries; no code required from user. |
| **Background agents** (§19.8) | Queue manager with fixed concurrency; git branch per run (stash, create branch, run CLI, diff/merge); output dir per run; conflict detection via dry-run merge. |
| **Crash recovery** (§19.9) | Timer writes snapshot (state struct) to disk; on startup check for recent snapshot and offer restore; optional panic hook; cleanup old snapshots. |
| **Plugins / skills** (§19.10) | Scan plugin dir, parse manifests, build registries (command, agent, hook, skill); resolve at runtime; commands/agents = markdown, hooks = scripts, skills = JSON. |
| **Analytics** (§19.11) | Data from redb rollups or scan of run/evidence metadata; aggregate by project, model, date; query on view open or filter change; export = serialize to CSV/JSON. |
| **Restore points / rollback** (§19.12) | Snapshot after each turn (file list + content before/after); store in redb or files; rollback = restore files + truncate state; conflict check via mtime/hash; branching = copy state to new session id. |
| **Command palette** (§19.13) | Shortcut registry (key → action); Ctrl/Cmd+P opens modal with full action list; filter by typed string; execute selected action; shortcuts help from same registry. |
| **Stream event viz / thinking** (§19.14) | Map stream event types to icons; show last N events in strip; thinking = buffer `thinking_delta`, display in pane with length limit; toggle to show/hide thinking. |
| **Bounded buffers** (§19.15) | All stdout/stream consumers use fixed-capacity buffer (ring buffer or capped deque); drop oldest when full; CLI always in child process. |
| **Database** (§19.16) | **redb**; migrations; tables for runs, restore_points, usage_snapshots; optional “lite” mode without redb. |
| **In-app instructions editor** (§19.17) | Read project instructions file from project path; text area + optional markdown preview; save writes back to same path. |
| **@ mentions** (§19.18) | On `@` open dropdown; data = recent/modified files or folder list; on select insert path; when building prompt expand @path to file content or include directive. |
| **Stream timers** (§19.19) | On segment start (by event type) start timer; on end record duration; ring buffer of last N segments; UI shows current + last. |
| **MCP** (§19.20) | Config list of servers (name, command, args, env); at spawn merge into platform’s expected flag/config; app is config layer only. |
| **Project browser** (§19.21) | List projects from redb or scan; filter/search; per-project git status; click to set project or open session. |
| **Multi-tab / multi-window** (§19.22) | Tab = view id + context; switch loads view; persist tab list; multi-window = multiple app windows or instances sharing state. |
| **Virtualization** (§19.23) | List renders only visible range + overscan; scroll position drives slice; placeholder height for scrollbar; bounded widget count. |

---

## 20. Human-in-the-Loop (HITL) Mode

**Full specification:** **Plans/human-in-the-loop.md**.

**Concept:** Optional pause at orchestrator tier boundaries (phase, task, subtask) for human validation. When enabled, the run completes all work in the current tier, then pauses until the user explicitly approves before proceeding. Three independent settings (phase / task / subtask), off by default. Useful for multi-phase work, stakeholder validation, and compliance checkpoints.

---

## 21. Updating Puppet Master

**Concept:** Users need a clear way to **update the Puppet Master application itself** to a new version. This covers version visibility, update discovery, and the upgrade path — not updates to plugins or target projects.

**Relevance:** Without an update story, users rely on ad-hoc methods (re-download, `cargo install`, package manager) and may miss security or feature releases. A minimal in-app story (version shown, optional “Check for updates” / release notes link) improves trust and upgrade rates.

**Scope (planning only):**
- **Version visibility:** Show application version in the UI (e.g. About dialog, Settings footer, or Help). Single source of truth (e.g. from Cargo.toml or build-time env) so it’s consistent everywhere.
- **Update discovery:** Optionally check for a newer version (e.g. against a stable URL or GitHub Releases) and show a non-intrusive notice (e.g. “Puppet Master X.Y.Z is available”) with a link to release notes or download. No auto-download or auto-install in this plan; user initiates the upgrade.
- **Upgrade path:** Document or link to how to upgrade per distribution: e.g. re-run installer, `cargo install --force`, or system package manager (`apt`, `brew`, etc.). If we ship a package (deb, rpm, AppImage), document update procedure for that package.
- **Config and state across versions:** When the app version changes, config and state files (e.g. `.puppet-master/config.yaml`, GUI state) may need compatibility handling. Prefer backward compatibility (new version reads old config); if a breaking config change is required, document migration or provide a one-time migration step. Do not delete or overwrite user config on upgrade without explicit user action or a clear migration path.

**Implementation directions:**
- **Version:** Read version at build time (e.g. `env!("CARGO_PKG_VERSION")`) and expose it in one place; About/Settings read from there.
- **Check for updates:** Optional background or on-demand request to a well-known URL (or GitHub Releases API); compare with current version; if newer, show a small banner or Settings message with “What’s new” link. Respect user preference (e.g. “Check for updates” off, or only on manual “Check now”).
- **Docs:** README or docs section “Updating Puppet Master” that describes upgrade per install method (cargo, package, installer). Link from in-app “New version available” message when shown.
- **DRY:** Single version constant or module; no hardcoded version strings in multiple views.

**Non-goals for this section:** Auto-update (download and replace binary without user confirmation), in-app package management for plugins (that’s §6 / §15.14). This section is only about **the application’s own** update story.

---

## 22. Cross-Device Sync

**Concept:** **Sync settings, work, history, message threads, and everything** between instances of Puppet Master so that when the user switches devices (e.g. opens the app on Mac after working on Windows), they can bring their workspace with them and lose nothing. For now: **manual export/import** plus **sync to BYOS (Bring Your Own Storage)**. We offer a number of storage options and support **custom configuration** so users can sync to their own NAS, network storage, or server.

**Relevance:** Users who work on multiple machines (e.g. desktop + laptop, Windows + Mac) expect continuity: same config, same projects, same chat and orchestrator history, same recovery state. Without sync, each install is isolated. Manual export/import and BYOS keep the user in control and avoid requiring a central cloud account.

**What to sync (scope):**
- **Settings:** All app config (tier config, HITL toggles, sound effects, cleanup options, application/project rules, etc.).
- **Work:** Current project context, orchestrator state (phase/task/subtask if run was in progress), PRD/work queue (prd.json), progress and evidence references. Optionally project-level state metadata (not full repo contents).
- **History:** Run history, session list, restore points metadata, analytics/usage snapshots. Enough to show "recent runs" and "sessions" on the other device and optionally restore or inspect.
- **Message threads:** **Chat threads and messages** (including **Interview** threads and messages) are part of backup and sync. Include: Assistant chat history (all threads, full message content per §11 of assistant-chat-design.md — messages, prompts, thought streams, code block diffs, subagent blocks, plan/todo, queue state, activity transparency data, attachments refs), **Interview** threads and messages (Q&A, phase state, thought stream, stored conversation or plan panel state). So the user can continue a conversation or see prior threads on the other device; backup and sync-to-other-devices must include this data.
- **Other:** Recovery/snapshot state, open tabs/windows layout if desired, project list and recent projects. Exclude: secrets (API keys, tokens) unless user explicitly opts in with encryption; large binary blobs (e.g. full evidence dirs) can be excluded or summarized by reference.

**Mechanisms:**

1. **Manual export/import (for now).**
   - **Export:** User triggers "Export" (e.g. from Settings or a Sync menu). App writes a **sync bundle** (single file or folder with a well-known structure: config, state, threads, history) to a user-chosen path (local folder, USB drive, or network path they have mounted). Optionally include timestamp and device label so the user can tell exports apart.
   - **Import:** On the other device, user triggers "Import" and selects a previously exported bundle (file or folder). App merges or replaces local state with the imported data per user choice (e.g. "Replace all" or "Merge"). Same sync payload format so export/import and BYOS sync share one data model.
   - No automatic sync; user explicitly exports on one machine and imports on the other. Simple and predictable.

2. **Sync to BYOS (Bring Your Own Storage).**
   - User configures a **sync target**: storage they own or control. App can **push** current state to that target and **pull** from it (e.g. on startup or when user clicks "Sync now"). Same payload as export/import; target is a folder or path the app can read/write.
   - **Storage options we offer:** Several presets or connectors so users can pick what they use, plus a **custom** option for their own setup:
     - **Local or mounted folder** — e.g. a folder on the machine that is also mounted on other devices (USB drive, shared drive letter, or OS-mounted network path).
     - **NAS / network storage / server** — Support syncing to the user's own NAS, network share, or server. Examples: SMB/CIFS share (e.g. `\\nas\puppet-master-sync` or `smb://nas/puppet-master-sync`), NFS mount path, SFTP, WebDAV, or any path that is accessible as a folder on the OS (e.g. Synology, TrueNAS, Windows file share, Linux NFS export). User configures connection (host/path, credentials if needed). Custom configuration allows them to point at their own NAS or server.
     - **Cloud folder (user's account)** — If we support it: Dropbox, iCloud Drive, OneDrive, or similar, as a folder path the user has linked. Still BYOS (their account); we just read/write that folder.
   - **Custom configure:** For "their own" storage we don't list as a preset, user can **custom configure**: e.g. enter a path (local or UNC), or protocol + host + path + credentials (SFTP, WebDAV, SMB). So they can sync to their own NAS, homelab server, or any storage they can expose as a readable/writable target. One consistent sync payload format; the app only needs to read/write files in a target location.
   - **Behavior:** Optional "Sync now" (push and/or pull); optional "Sync on startup" (pull from BYOS when app opens). "Last synced at" and basic conflict policy (e.g. last-write-wins or prompt). No account with us; user manages storage and access.

**Implementation directions:**
- **Data model:** Define a **sync payload** (e.g. JSON or compact binary) that includes: config blob, state blob (orchestrator, recovery, project list), **chat thread and message data** (Assistant and Interview threads, full message blobs per thread — see assistant-chat-design.md §11 for what is persisted per thread), and thread/history index. Same format for export file/folder, for backup, and for BYOS target directory. Version the payload so older clients can skip or migrate. Chat and interview threads/messages are required for backup and sync; the payload must include them so the user's conversation history is available on other devices.
- **Export/import:** Export = write payload to user-selected path. Import = read payload from user-selected path; merge or replace per user choice. Use existing file dialogs and path handling; support both "single archive file" and "folder with manifest" if useful.
- **BYOS:** Config stores sync target (type: local/mounted, smb, sftp, webdav, or custom; connection details as appropriate). Push = write payload to target; pull = read from target and apply. For NAS/network/server: use OS-mounted path where possible (user mounts the share, we write to a path); or integrate a small client for SMB/SFTP/WebDAV if we don't rely on the OS mount. Custom = user provides path or protocol+host+path+credentials.
- **Conflict resolution:** For import and pull: last-write-wins with timestamp, or merge by section, or prompt user. Document policy; avoid silent overwrites of long-running work.
- **Security:** No sync of secrets by default; if user opts in, encrypt secrets in the payload (e.g. client-side with user-derived key). For BYOS over network, use protocol's security (e.g. SMB over SMB3, SFTP, WebDAV over HTTPS).

**Non-goals for this section:** Syncing the contents of target project repos (that is git or the user's own repo sync). This section is about **Puppet Master's own** settings, state, and message history. A central Puppet Master cloud account (we host the backend) is out of scope for this plan; the focus is manual export/import and BYOS.

---

## 23. Gaps and Potential Issues

This section consolidates **gaps** (missing or underspecified areas) and **potential issues** (risks or ambiguities) so implementers can address them. Keep DRY in mind: resolve gaps by referencing or extending single sources (usage-feature.md, FileSafe, agent-rules-context, etc.) rather than duplicating.

### 23.1 Architecture Clarity

- **§19.1 vs our architecture:** Section 19.1 describes a "three-process" pattern (Tauri + React + Node). **We use a single Rust/Iced process.** The callout at the start of §19.1 now states this; ensure all technical descriptions (stream parsing, bounded buffers) assume in-Rust parsing and no middle server.
- **Summary table §19.25:** The row for "CLI integration" says "Middle server spawns CLI"; treat that as the *alternative* pattern. Our row is: "Rust app spawns CLI, reads stdout (optionally stream-json), bounded buffer, no extra process."

### 23.2 Usage and Ledger

- **5h/7d and ledger schema:** **Plans/usage-feature.md** documents current gaps: 5h/7d not in GUI, ledger vs usage_tracker schema misalignment (e.g. `action` vs `operation`, `tokens` vs `tokens_in`/`tokens_out`), alert threshold not configurable. Implement §3 and §7 in line with usage-feature.md; use one coherent schema for `usage.jsonl` and one code path for "current usage" consumed by the GUI.
- **State-file-first:** Prefer aggregating from `usage.jsonl` (and optional `summary.json`) before adding platform API calls; document which platforms support live vs after-run stats.

### 23.3 Recovery and Sync Versioning

- **Recovery snapshot:** Panic hook that writes a snapshot before exit is **best-effort**; a severe crash may not complete the write. Document this; rely on periodic timer snapshots as the primary recovery source. Include a **schema version** in the snapshot format so future app versions can migrate or skip incompatible snapshots.
- **Sync payload (§22):** Version the sync payload so that when the app is updated, import/pull can detect older payloads and apply migration or prompt the user. Avoid silent data loss when app version changes.

### 23.4 Restore Points and Background Agents

- **Conflict detection:** When rolling back to a restore point, we check for conflicts (file changed outside the app). Specify whether we use **mtime**, **content hash**, or both (e.g. hash if available, else mtime), and what to do when a conflict is found (warn and skip, warn and overwrite, or prompt). Document in §8 implementation directions.
- **Interaction with background agents:** If a background run is active on the same project, clarify whether restore/rollback is disabled, queued, or allowed (with a warning that the background run may have modified files). Align with queue manager and git isolation (§2).
- **Main-flow vs background-flow (§2):** When the user starts a **main** run (orchestrator or interview) while a **background** run is active on the same project, define policy: block main until background completes, allow both with warning, or queue main. Document in §2 implementation directions.

### 23.5 Hooks and FileSafe

- **Timeout:** Hook timeout (e.g. 5s) should be **configurable** (per hook or global) so slow scripts do not block indefinitely; document default and max. On timeout, define behavior (continue vs block) and make it configurable where reasonable.
- **Dangerous-command blocking:** Part of FileSafe (§15.1); one blocklist and one integration point in runner; see §9.3 and §17.3–17.4.

### 23.6 Compaction and Token Source

- **Token source:** Document which platforms expose **exact** token counts in-stream vs final-only. Prefer stream usage events when available; fallback to heuristic (e.g. 4 chars per token). FileSafe Part B handles *context compilation*; this compaction is *conversation* compaction; both apply (see §10.4, §17.3–17.4).

### 23.7 Database and Projections

- **§14 Database/projections:** Structured storage (seglog, redb, Tantivy or equivalent) is part of the rewrite design, not optional. Analytics, restore points, and queryable history are produced from this layer. See rewrite-tie-in-memo and §14.

### 23.8 Plugin and Catalog Versioning

- **Plugin API version:** When the app is updated, plugin manifests or hook contracts may change. Consider a **plugin API version** or min-app-version in the manifest so we can warn or disable incompatible plugins instead of failing at runtime.
- **Catalog (§15.14):** Same versioning idea for one-click install catalog items; document compatibility when the app version changes.

### 23.9 Error Handling and Retry

- **Cross-feature strategy:** No single "error handling and retry" section exists. Consider documenting a common approach for: recovery snapshot write failure, compaction failure, hook timeout or script error, sync push/pull failure, and restore-point rollback failure. Prefer: log, surface in UI where appropriate, and avoid silent failure; retry policy (e.g. exponential backoff for sync) where it makes sense.

### 23.10 Testing Strategy for New Features

- **Test coverage:** Recovery restore, hook script execution (continue/block/modify), restore-point rollback and conflict detection, sync export/import and conflict resolution, and bounded buffer behavior under load are good candidates for automated tests. Document test strategy in implementation phases; reuse existing test patterns (**cargo test**, headless, per AGENTS.md — Vitest applies to legacy TypeScript if present; Rust is primary).
- **Edge cases:** Restore while HITL is paused; compaction failure mid-run; hook timeout with block; sync conflict when both devices edited the same section. Document expected behavior for each.

### 23.11 Accessibility

- **Beyond sound (§15.16):** Sound effects (§15.16) mention respecting system "reduce motion" / "silent" preferences. Extend accessibility consideration to: **command palette** (keyboard-only, focus management, screen reader labels), **stream event visualization** (alternative text or summary for event strip), **thinking display** (avoid information only in visual animation). Document a11y goals in implementation directions for §11, §12, and related UI.
- **HITL and Assistant:** When paused for HITL, ensure approval prompts are addressable via keyboard and screen reader; **Plans/assistant-chat-design.md** and **Plans/human-in-the-loop.md** define Dashboard CtAs and Assistant as a way to address them — ensure a11y for those flows.

### 23.12 Instant Project Switch (§15.16)

- **Gaps and problems live in §15.17:** Section 15.18 now includes: **Snapshotting** (recovery snapshot includes project path; restore points keyed by project; optional per-project checkpoint on switch); **Database** (project_path as first-class key in seglog/redb/Tantivy); **GUI** (placement, collapsible, keyboard, accessibility, stable identity); **Gaps** (where project list is stored, path no longer exists, same path twice, in-flight run when switching, max list size, interaction with multi-tab); **Potential problems** (config load failure, dirty state, performance with many projects, sync across devices). Resolve these during implementation; keep §15.16 as the single place for instant-project-switch gaps and mitigations.

### 23.13 Built-in Browser and Click-to-Context (§15.17)

- **Gaps and problems live in §15.18:** Section 15.19 now includes: **Implementation** (Wry + winit, custom protocol vs IPC, initialization script, capture mode, element schema, Rust handler, Assistant integration); **Phased delivery** (separate window → schema v1 → Assistant → optional embedding → polish); **Element context schema** (required/optional fields, token cap, truncation); **Security** (arbitrary URLs, validate/sanitize, navigation/schemes, rate limit); **Gaps** (CSP/strict sites, Linux POST body, iframes, Wayland embedding, Slint + WebView, Assistant schema); **Potential problems** (spam capture, token budget, click vs double/right-click, accessibility, visibility/screenshot, fetch response); **Testing** (unit, integration, manual, security). Resolve during implementation; keep §15.17 as the single place for built-in-browser gaps and mitigations.

---

*This plan is a living document. Update the Task Status Log when implementation work begins or completes for any section.*
