# New Features Implementation Plan

## Plan Document Status

**This is a PLAN DOCUMENT ONLY** — No code changes have been made. This document contains:
- Feature concepts and design patterns drawn from industry practice
- How each concept could enhance RWM Puppet Master
- Implementation architecture and integration points
- Phasing and dependencies

## Executive Summary

This plan captures a set of feature and architecture ideas that align with Puppet Master’s goals: CLI-only orchestration, multi-platform support, tiered execution, and a native Rust/Iced GUI. Ideas. **Section 15** collects additional feature ideas (security guard, branching, in-app editor, @ mentions, stream timers, thinking toggle, MCP, project browser, mid-stream usage, multi-tab/window, virtualization, analytics framing, low-latency UI, one-click install catalog) for completeness and later phasing.

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
- **Platform compatibility:** Use only mechanisms each platform supports (e.g. `--append-system-prompt` where available; for others, prepend to the prompt or inject via a temp file). Keep this in `platform_specs` or a dedicated “orchestration” module.
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
- **GUI state:** Restore selected project, open tabs, and scroll position for a better UX.

### 4.3 Implementation Directions

- **Snapshot format:** Serialize a minimal “recovery” struct: app phase (e.g. dashboard / wizard / orchestrator / interview), project path, orchestrator state (phase/task/subtask ids), interview phase, window size/position, timestamp. Store under e.g. `.puppet-master/recovery/` or in app data dir.
- **Rust module:** e.g. `recovery.rs`: take snapshot on a timer, write to disk; on startup, check for a recent snapshot and offer “Restore?” in the UI. Use existing `state/` and file I/O; avoid blocking the main loop.
- **Cleanup:** Background or startup job to delete snapshots older than 24h (configurable).
- **Panic hook:** Optionally register a panic hook that writes one last snapshot before exiting, so crash recovery still has something recent.
- **GUI:** On launch, if a recent snapshot exists, show a small “Restore previous session?” dialog; restore only if user confirms.

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

Data is stored locally (e.g. SQLite or our existing state files); no telemetry. Optional export (CSV/JSON) for user’s own reporting.

### 7.2 Relevance to Puppet Master

- **Usage tracking:** We already have or plan usage/plan detection; this is the reporting layer on top.
- **Evidence and runs:** We store runs and evidence; we can add a thin “analytics” layer that aggregates run metadata (project, platform, model, timestamp, token/usage if we have it) and serves the dashboard.
- **Tier config:** Helps users see which platforms they use most and how close they are to limits, reinforcing the “persistent rate limit” feature.

### 7.3 Implementation Directions

- **Storage:** Prefer reusing existing state (e.g. run logs, evidence metadata). If we need more structure, add a small SQLite DB or append-only log under `.puppet-master/analytics/` with columns: `timestamp`, `project_path`, `platform`, `model`, `tokens_in`, `tokens_out`, `cost` (optional). No PII; only paths and aggregate numbers.
- **Aggregation:** Either on-demand (scan evidence/run logs when opening the dashboard) or a periodic job that writes summary tables (e.g. by day, by project). Start simple: on-demand scan with a small cache.
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

- **When to snapshot:** After each iteration (or after each “user message” in a chat-style flow). Persist: iteration id (or message id), list of files touched, and for each file: path, content before, content after (or diff). Store under e.g. `.puppet-master/restore-points/` or in a single SQLite table.
- **Retention:** Keep last N restore points (e.g. 50) or last N days to bound disk usage.
- **Rollback flow:** User selects a restore point; we compute the set of files to restore, check current file mtime/content for conflicts, show confirmation with file list; on confirm, write snapshot content back and update app state (e.g. set current subtask/iteration or interview phase to that point). Optionally re-run verification for that point.
- **GUI:** A “History” or “Restore” panel listing restore points (e.g. by time and description “After iteration X”, “After Phase 2”); click to preview and then confirm rollback. Disable during an active run.
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
- **Hook runner (Rust):** When an event fires, load hook list for that event (from config + plugins), run each hook (script or inline). Scripts can be shell, or we accept a small JSON in/out protocol (stdin: payload, stdout: `{"action":"continue"|"block"|"modify", "payload":…}`). Timeout (e.g. 5s) per hook; on timeout, treat as continue.
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

- **Token counting:** We need at least approximate token counts per message (or per run). Options: use platform usage data when available, or a simple tokenizer (e.g. tiktoken-equivalent in Rust or a rough 4-chars-per-token heuristic) for estimation. Store “current context size” in state and update after each run or stream.
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

---

## 12. Stream Event Visualization and “Thinking” Display

### 12.1 Concept

During a run, the UI shows **live stream events** in a compact form (e.g. a row of small indicators or “dots”): one icon per event type (e.g. read, edit, bash, tool call, thinking). This gives at-a-glance feedback that the agent is working and what kind of activity is happening. Optionally, **extended thinking/reasoning** content (if the platform streams it) is shown in a dedicated area (e.g. expandable section or secondary pane) so the user can watch reasoning in real time.

### 12.2 Relevance to Puppet Master

- **Orchestrator run view:** When a subtask is running, we could show “current activity” (e.g. read file, run test) instead of a single “Running…” spinner.
- **Trust and debugging:** Seeing “thinking” or “reasoning” chunks helps users understand why the agent is slow or what it’s considering. Not all platforms expose this; where they do, we can surface it.
- **Protocol normalization:** If we adopt a normalized stream (see §5), “thinking” is just another event type; the UI renders it when present.

### 12.3 Implementation Directions

- **Event types:** Align with normalized stream: e.g. `read`, `edit`, `bash`, `tool_call`, `tool_result`, `thinking`, `message`. Each has an icon and optional short label.
- **UI component:** A horizontal strip or list of recent events (e.g. last 10–20), with icons; maybe a sliding window (e.g. last 5 seconds) so the strip doesn’t grow unbounded. Place it near the run status (e.g. in dashboard or run detail view).
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
- **Constants:** Define `MAX_STREAM_BUFFER_BYTES` and `MAX_STREAM_LINES` in one place (e.g. `platforms/runner` or a `limits` module); use them in all runners and parsers.
- **Docs:** In AGENTS.md or architecture docs, state that the orchestrator never embeds the CLI in-process and that all output is consumed through bounded buffers. Add a short “Resource limits” section.

---

## 14. Database and Persistence (Structured State)

### 14.1 Concept

Use a **local SQLite database** (with WAL) for structured state that benefits from querying and indexing: sessions/runs, messages or iterations, usage/analytics, checkpoints, restore points. File-based state (e.g. prd.json, progress.txt, AGENTS.md) remains the source of truth for “work queue” and “memory”; the DB is an optional layer for **queryable history**, **analytics**, and **recovery metadata**.

### 14.2 Relevance to Puppet Master

- **Evidence and runs:** We already store evidence in directories; we could add a DB table that indexes run id, project, platform, timestamp, outcome, and path to evidence. Then “show all runs for this project” or “usage by platform” becomes a query.
- **Restore points and snapshots:** Store restore point metadata (and optionally file diffs) in DB for fast “list restore points” and “rollback to N”.
- **Interview:** Store phase answers and metadata in DB for “resume interview” and “export interview report”.
- **No requirement to move prd.json/progress.txt into DB:** Those stay as they are; the DB complements them for reporting and recovery.

### 14.3 Implementation Directions

- **Schema:** Start small: e.g. `runs` (id, project_path, platform, model, started_at, ended_at, outcome, evidence_path), `restore_points` (id, run_id, created_at, file_snapshots_json), `usage_snapshots` (id, platform, 5h_used, 7d_used, recorded_at). Add tables as features (analytics, interview) need them.
- **Rust:** Use `rusqlite` with WAL; one module (e.g. `db` or `persistence`) that opens the DB, runs migrations (schema version in a table), and exposes functions to insert/query. DB path: e.g. under app data dir, `puppet_master.db`.
- **Migrations:** Simple versioned migrations (e.g. `migrations/001_initial.sql`) applied on startup if version increased.
- **Optional:** Make the DB optional at build time or runtime (e.g. “lite” mode with only file-based state) so we don’t force a DB on minimal deployments. Default: DB enabled for full features.

---

## 15. Additional Feature Ideas

The following ideas are listed for completeness. They are not yet folded into the main phasing; they can be scheduled once the core features above are in place or in parallel where dependencies allow.

### 15.1 Security Guard (Dangerous Command Blocking)

**Concept:** A built-in or default hook that runs on **before tool use** (e.g. before Bash or shell tool execution) and blocks commands that match dangerous patterns (e.g. `rm -rf /`, `:(){ :|:& };:`, or configurable blocklists). The user sees a clear “Blocked by security guard” message and can optionally override or add exceptions. Configurable rules (e.g. allowlist of safe commands, or blocklist of patterns) live in config or a small guard config file.

**Relevance:** Reduces risk of accidental or agent-triggered destructive commands. Fits the hook system (§9); the guard is just a privileged hook with a bundled rule set.

**Implementation:** Implement as a PreToolUse hook that receives the tool name and arguments; if tool is Bash/shell, parse the command string and match against patterns. Return `block` with a message when matched. Ship a default rule set (e.g. block `rm -rf` with no path restriction, block obvious fork bombs); allow config override (e.g. `guard.allowlist`, `guard.blocklist` in config). GUI: simple “Security guard” toggle and “Edit rules” in settings.

---

### 15.2 Branching Conversations (Restore Then Fork)

**Concept:** Extend restore points (§8) so that after **rolling back** to a point, the user can **continue from there in a new branch** instead of overwriting the current timeline. That gives “branching conversations”: main line plus one or more alternate continuations (e.g. “what if I had answered Phase 3 differently?”). Each branch has its own restore-point chain and optional label.

**Relevance:** Supports experimentation and comparison of strategies (interview answers, iteration choices) without losing the original path.

**Implementation:** When user chooses “Roll back and branch” (or “Restore as new branch”), create a new conversation/session id, copy state and file snapshots up to that point, and mark the current session as “branched from” that point. UI: “Restore” panel could offer “Restore here” vs “Restore and branch.” Storage: link restore points to a branch id; list branches in History view.

---

### 15.3 In-App Project Instructions Editor

**Concept:** An **in-app editor** for project-level instructions (e.g. AGENTS.md, CLAUDE.md, or a project-specific instructions file). The user can open, edit, and save the file without leaving the app. Optional **live preview** (e.g. rendered markdown) in a split pane or tab. Ensures the file is saved to the project root (or a configured path) so the CLI sees it on the next run.

**Relevance:** Reduces context-switching; users can tweak instructions right before or after a run. Aligns with our memory layers (AGENTS.md is long-term memory).

**Implementation:** New view or modal “Project instructions” that (1) reads the file from project path, (2) shows a text area (or simple editor) and optional preview pane, (3) saves on demand or with auto-save. Use existing widgets; for preview, a minimal markdown renderer or “open in external editor” fallback. Path comes from current project in app state.

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

**Implementation:** Config schema: list of servers (name, command, args, env, auto_start). GUI: “MCP” tab or subsection to add/edit/remove servers and test connection. When spawning the CLI, merge this config into the platform’s expected flag or config file (per platform_specs). Document which platforms support MCP and how (e.g. env var, flag, config file path).

---

### 15.8 Project and Session Browser

**Concept:** A **browser view** that lists projects (e.g. by recent working directories or a user-maintained list) and, per project, sessions or runs (e.g. last 10 runs, interview sessions, orchestrator runs). User can search and filter (e.g. by date, platform, outcome). Optional: show **git status** per project (branch, dirty files count) so the user can see state at a glance. Clicking a project opens it; clicking a session might open run detail or restore.

**Relevance:** Improves navigation when the user has many projects or long history; supports “resume where I left off” and “see what ran where.”

**Implementation:** Data: scan app data or DB for run/session metadata per project path; maintain a “recent projects” list (already may exist). UI: new view “Projects” or “Browser” with a list/grid of projects, expandable to show sessions. Optional search/filter bar. Git status: call existing git module for branch and status; show as badge or one-line summary. Reuse existing widgets and theme.

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

### 15.13 Low-Latency / No-Lag UI (Instant Input Response)

**Concept:** A core design goal: **input and UI respond with minimal latency** (e.g. well under 100 ms, ideally under 50 ms) regardless of session length or how much output has been streamed. In terminal-based CLIs, long sessions often suffer from growing buffers, redraw backlog, and terminal emulator overhead, leading to multi-second input lag. By contrast, a native app can: (1) use **native rendering** (no terminal layer), (2) keep **bounded buffers** for stream output so memory and redraw cost stay constant, (3) keep the **CLI in a separate process** so UI thread never blocks on agent work, and (4) avoid accumulating unbounded DOM/widget state (e.g. virtualized lists). The result is “instant” typing and actions even after hours of use.

**Relevance:** Directly supports our architecture: we already use process isolation (§13) and plan bounded buffers; we can make “no lag” an explicit non-functional requirement and validate it (e.g. measure time from keypress to UI update in long sessions). Iced and native rendering help; we must still avoid blocking the UI thread on runner I/O and keep list views virtualized (§15.11).

**Implementation:** Document “low-latency UI” as a goal in architecture/AGENTS.md. Audit: ensure no synchronous blocking of the UI thread on subprocess read/write; use async or background tasks for runner output. Enforce bounded buffers everywhere (§13). For any long list (run log, messages), use virtualization. Optional: add a simple latency probe (e.g. timestamp on keypress vs next frame or redraw) in dev builds to catch regressions.

---

### 15.14 One-Click Install for Commands, Agents, Hooks, and Skills (No Code)

**Concept:** **Extend without coding:** users can install **commands, agents, hooks, and skills** from a **curated catalog** with one click. No writing code or editing config files by hand. The catalog lists named items (e.g. “Security guard hook”, “Code review command”, “Rust skill pack”) with short descriptions; user clicks “Install” and the app downloads or copies the artifact into the right place (plugin dir or config), enables it, and optionally runs a one-time setup. Updates or uninstall are equally simple (e.g. “Update” / “Remove” in the same UI). Everything in the catalog is pre-built: ready-to-use hooks, agent markdown files, skill JSON, and command definitions.

**Relevance:** Makes the plugin/skills system (§6) and hooks (§9) accessible to non-developers. “One-click install, no code” is a strong UX promise: extend behavior by choosing from a list, not by writing scripts or editing JSON.

**Implementation:** Define a **catalog format** (e.g. a JSON or manifest listing id, name, description, type [command|agent|hook|skill], source URL or bundled path, version). Catalog can be bundled in the app or fetched from a static URL (e.g. GitHub Pages or a simple index file). “Install” = copy files to the appropriate plugin/config location and enable. GUI: “Extensions” or “Plugin catalog” view with search and “Install” / “Remove” / “Update” per item. No code execution beyond copying and parsing; all catalog items are static assets (markdown, JSON, or signed scripts if we ever support remote scripts). Ship a small default catalog (e.g. security guard hook, a few skills) so the feature is useful from day one.

---

## 16. Phasing and Dependencies

Suggested order for implementation, assuming we want incremental delivery:

| Phase | Focus | Depends on |
|-------|--------|------------|
| **1** | Bounded buffers and process isolation audit (§13), protocol normalization design (§5) | None |
| **2** | Persistent rate limit in GUI (§3), analytics dashboard (§7), “know where your tokens go” framing (§15.12) | Existing usage/plan detection |
| **3** | Session/crash recovery (§4), restore points and rollback (§8), optional branching (§15.3) | State serialization, optional DB (§14) |
| **4** | Orchestration prompt and optional role hints (§1) | Platform specs, execution engine |
| **5** | Hook system (§9), security guard (§15.1), then plugin/skills (§6) | Config, event pipeline |
| **6** | Background agents with queue and git isolation (§2) | Git module, queue manager, GUI panel |
| **7** | Auto-compaction and context thresholds (§10) | Token estimation, state layer |
| **8** | Keyboard shortcuts and command palette (§11), stream event viz, thinking, timers (§12, §15.5, §15.6), mid-stream usage (§15.9) | Normalized stream (§5), UI components |
| **9** | Additional ideas as needed: project browser (§15.8), @ mentions (§15.4), in-app instructions editor (§15.3), MCP (§15.7), one-click install catalog (§15.14), low-latency UI validation (§15.13), virtualization (§15.11), multi-tab/window (§15.10) | Core views and config |

DB (§14) can be introduced in Phase 2 or 3 and then reused by analytics, restore points, and interview.

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
| **Guards / safety** | **FileSafe.md:** Database guard, File Guard, Security Filter, Prompt Content Checking; integration in `BaseRunner::execute_command()`. Destructive-pattern blocking before Bash runs. | §9 Hooks, §15.1 Security guard (PreToolUse hook blocking dangerous commands). |
| **Context / tokens** | **FileSafe.md (Part B):** Role-specific context compiler (`.context-{role}.md`), delta context, context cache, compaction-aware re-reads, skill bundling. Token efficiency and handoff schemas. | §10 Auto-compaction (usage %, summarize, preserve); §6 Skills (triggers + content). |
| **Subagents / roles** | **orchestrator-subagent-integration.md:** Tier-level subagent selection (phase/task/subtask/iteration), language/framework detection, `subagent_registry`. **interview-subagent-integration.md:** Phase-specific subagents (product-manager, architect-reviewer, qa-expert, etc.), `SubagentConfig`. | §1 Orchestration flow (understand→decompose→act→verify); §2 Background agents (queue, git isolation). Orchestration and background agents **extend** subagent usage; they do not replace the orchestrator/interview subagent plans. |
| **Git / worktrees** | **WorktreeGitImprovement.md:** Worktree create/merge/cleanup, base branch, recovery, branch sanitization, PR from worktree branch. **MiscPlan:** Cleanup (prepare_working_directory, cleanup_after_execution), allowlist, `run_with_cleanup`. | §2 Background agents: git branch per run (stash, branch, diff/merge). Reuse existing `src/git/` and worktree/cleanup behavior; add **queue** and **per-run branch** on top. |
| **Usage / limits** | **Code:** `platforms/usage_tracker.rs`, `platforms/rate_limiter.rs`, `platforms/quota_manager.rs`, `state/usage_tracker.rs`, `doctor/checks/usage_check.rs`, `widgets/usage_chart.rs`. Usage events (tokens, rate_limited), plan detection from error messages (e.g. 5h limit). | §3 Persistent rate limit in GUI; §7 Analytics dashboard; §15.9 Mid-stream usage. Newfeatures adds **always-visible 5h/7d in UI** and **analytics view**; build on existing usage/plan-detection and event persistence. |
| **Interview** | **interview-subagent-integration.md:** Phase 1–8, subagent per phase, prompt templates, document generation, AGENTS.md seeding. | §8 Restore points (rollback to phase); §4 Crash recovery (restore interview state); §6 Skills (phase-specific context). Newfeatures **adds** restore/rollback and recovery; does not replace interview phases or subagent assignments. |
| **GUI / testing** | **newtools.md:** GUI tool discovery (gui_tool_catalog), Playwright + framework tools + custom headless, interview flow for tool choice, MCP in GUI. | §15.7 MCP (config + passthrough). MCP in newfeatures is consistent with newtools; ensure one place for MCP config and Doctor/wiring. |
| **Cleanup / artifacts** | **MiscPlan:** Cleanup policy, allowlist, `src/cleanup/`, runner contract, optional agent-output dir, evidence retention. | §2 Background agents: output to `.puppet-master/agent-output/{run-id}/`. Align with MiscPlan’s agent-output and evidence policy; cleanup allowlist must include that dir or exclude it by policy. |
| **Config wiring** | **WorktreeGitImprovement.md:** Option B (build run config from GUI at run start). **Orchestrator/Interview plans:** Config must be wired (add to config type, set from gui_config, use at runtime). | All newfeatures that need config (hooks, plugins, compaction, recovery) must follow the same wiring pattern (e.g. Option B) so the orchestrator and interview actually see the settings. |
| **Architecture** | **Code:** Single Rust/Iced process; platforms spawn CLI from Rust (`runner.rs`, platform-specific runners). No separate Node or WebSocket server; no stream-json parsing today (platforms use stdout capture and completion signals). | §19.1 Three-process layout (Tauri + React + Node server) is **not** our architecture. We have **one** Rust app; §5 Protocol normalization and §19 stream format still apply **if** we add streaming or multi-platform output parsing—e.g. in-Rust parser and bounded buffers, no extra process. |

### 17.3 What to Adapt from Newfeatures

- **Orchestration prompt (§1):** Add `--append-system-prompt` (or equivalent per platform) when building CLI invocations. Single canonical prompt in repo; platform_specs or orchestration module. Fits orchestrator and interview without changing tier or phase structure.
- **Persistent rate limit (§3):** Surface existing usage/plan data (usage_tracker, quota_manager, usage_check) in header or dashboard. Add 5h/7d display and optional warning threshold; refresh in background. No new backend if we already persist usage events.
- **Bounded buffers (§13):** Audit all places we read subprocess stdout (runners, headless). Introduce a shared bounded buffer type and constants; document in AGENTS.md. Aligns with FileSafe and MiscPlan (deterministic, safe behavior).
- **Hooks (§9) and Security guard (§15.1):** Event enum (e.g. PreToolUse, UserMessageSubmit); run scripts with JSON in/out and timeout. Security guard = PreToolUse hook with built-in blocklist. **Integrate with FileSafe:** FileSafe already blocks in runner; hooks can be an additional layer (e.g. user-defined rules) or the guard can call into the same pattern list. Avoid two separate “guard” systems; unify under one extension point (FileSafe for core, hooks for optional/user).
- **Restore points (§8):** Snapshot after each iteration or message (file list + content); rollback = restore files + truncate state. Useful for interview (roll back phase) and orchestrator (roll back iteration). Conflict check via mtime/hash; optional branching. Can use existing evidence/state paths.
- **Session/crash recovery (§4):** Timer snapshot (state struct) to disk; on startup offer restore. Fits our single-process model; no need for a separate recovery server.
- **Compaction (§10):** If we add stream or token counting, compaction (monitor usage %, send compact prompt, replace history) can sit on top of FileSafe’s context compiler and compaction-aware re-reads. FileSafe already has “compaction marker” and context cache; newfeatures compaction is **conversation** compaction (summarize messages), which is complementary.
- **Plugin/skills (§6) and one-click install (§15.14):** Single plugin dir, manifest, registries (command, agent, hook, skill). Resolve at runtime. One-click = catalog + copy + refresh. Fits DRY and gui_tool_catalog pattern (newtools); consider a single “catalog” pattern for both tools and plugins.
- **Background agents (§2):** Queue manager + git branch per run + output dir. Reuse `src/git/` and WorktreeGitImprovement behavior; add queue and “run on branch” semantics. Merge conflict detection via existing git/worktree logic.
- **Keyboard and command palette (§11):** Shortcut registry and Ctrl/Cmd+P modal. Improves UX without changing execution model.
- **Stream event viz, timers, thinking (§12, §15.5, §15.6):** Only relevant **if** we add streaming or stream-json parsing. Today we don’t stream; if we do, use normalized stream (§5) and bounded buffers, then add UI for events and timers. Defer until we have a stream pipeline.

### 17.4 What We Do Better or Differently

- **Single process:** We don’t need a middle Node server or WebSocket. Rust spawns the CLI, reads stdout, and updates state. For streaming we’d add an in-Rust parser and optional live UI updates, not a separate process. Lower complexity and no port/process management.
- **FileSafe first:** We already plan deterministic, pre-execution guards (database, file, security, prompt). Newfeatures’ “security guard” should **align** with FileSafe (e.g. one blocklist, one integration point in runner) rather than a second parallel system.
- **Context compilation (FileSafe Part B):** We already plan role-specific context, delta context, and compaction-aware re-reads. Newfeatures’ compaction (summarize conversation) is a **different** layer (message/session compaction vs. context compilation). Keep both; they address different problems.
- **Subagent registry and config:** Orchestrator and interview plans define the single source of truth for subagent names and config. Newfeatures’ “agents” (e.g. architect, implementer) should map to **subagent names** from those plans and platform_specs, not introduce a parallel agent taxonomy.
- **Usage and plan detection:** We already have usage_tracker, rate_limiter, quota_manager, and plan detection from error messages. Newfeatures’ “5h/7d always visible” and analytics are **UI and aggregation** on top of that; no need to reimplement tracking.
- **Worktree and cleanup:** WorktreeGitImprovement and MiscPlan define worktree lifecycle and cleanup policy. Background agents’ “git branch per run” should use the same git/worktree modules and respect cleanup allowlists and evidence retention.

### 17.5 What to Defer or Skip

- **Three-process architecture (§19.1):** We are not adding a Node server or WebSocket. Treat §19.1 as “one possible pattern elsewhere”; our implementation stays single Rust process. Stream parsing (if added) is in-Rust with bounded buffers.
- **Full protocol normalization (§5) and stream-json everywhere:** Valuable if we add streaming and multi-provider output. Defer until we have a concrete need (e.g. live progress, thinking display). When we do, define a minimal schema and per-platform adapters in our runners.
- **Multi-tab / multi-window (§15.10), virtualization (§15.11):** UX improvements; defer until core features (hooks, plugins, recovery, usage UI) are in. Virtualization matters if we show very long logs or message lists.
- **In-app instructions editor (§15.3), @ mentions (§15.4), project browser (§15.8):** Nice-to-have; implement after persistent rate limit, recovery, and hooks. @ mentions require prompt-building changes; project browser can reuse project list and git status from existing code.
- **Database (§14):** Optional. We can do analytics and restore points with file-based state (e.g. usage JSONL, snapshot files) first; add SQLite when we need querying or scale.

### 17.6 References to Other Plan Documents

- **Plans/FileSafe.md** — Guards, context compilation, token efficiency; integration point in runner.
- **Plans/interview-subagent-integration.md** — Interview phases, phase subagents, config, document generation.
- **Plans/MiscPlan.md** — Cleanup, runner contract, agent-output, evidence, config wiring.
- **Plans/newtools.md** — GUI tool discovery, MCP in GUI, test strategy and tool selection.
- **Plans/orchestrator-subagent-integration.md** — Tier-level subagent selection, config wiring, verification.
- **Plans/WorktreeGitImprovement.md** — Worktrees, git/gh resolution, config (Option B), branch strategy.

---

## 18. Task Status Log

| Date | Status | Summary |
|------|--------|--------|
| (none) | — | Plan created; no implementation yet. |

---

## 19. Technical Analysis: How These Mechanisms Work

The following explains **how** the features above can be implemented in practice. It is based on public documentation, architecture descriptions, and official CLI/API behavior.

### 19.1 Three-Process Layout and CLI Integration

A common pattern is to run three processes:

1. **Native backend (e.g. Rust/Tauri)** – Window, file system, DB, crash recovery, port management. Exposes many commands to the frontend.
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

### 19.6 Hooks and Security Guard

**Hooks:** Backend defines events (e.g. `user_prompt_submit`, `pre_tool_use`, `context_warning`, `compaction_trigger`). When an event fires, run configured hooks (e.g. scripts) with a JSON payload; the script returns JSON (e.g. `{ "action": "continue"|"block"|"modify", "payload": ... }`). Enforce a timeout (e.g. 5s) and then continue or block/modify. **Security guard:** A **PreToolUse** hook with a built-in rule set (e.g. block `rm -rf` without path restrictions, block fork bombs). Same contract: receive tool name and arguments, return block with message when dangerous. Config can allow overrides or allowlists.

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

**Data source:** Either (a) query a **database** (e.g. SQLite) that has been populated with run metadata (project path, platform, model, timestamp, tokens in/out, cost, outcome), or (b) **scan** evidence/run logs on demand (e.g. list directories under `.puppet-master/evidence/` or similar and parse metadata files). The DB approach is faster for large history; the scan approach avoids a DB dependency.

**Aggregation:** For “by project”: group runs by `project_path`, sum tokens/cost, count runs, max timestamp. For “by model/platform”: group by platform and model. For “by date”: group by day (or week), sum tokens/cost, count runs. Run these queries when the user opens the analytics view or when the time-range filter changes.

**UI:** Time-range selector (7d, 14d, 30d, all); optional project filter; cards for totals; tables or simple charts (e.g. by project, by platform, by date). Export = serialize current view to CSV/JSON and write to a file. All data stays local; no telemetry.

### 19.12 History and Restore Points (Rollback)

**When to snapshot:** After each “logical turn”—e.g. after each iteration in the orchestrator, or after each user message in a chat-style flow. For each turn, record: turn id (or message index), list of files that were modified (path + content before, content after or diff), and optional metadata (timestamp, platform, etc.). Store in a bounded store (e.g. last 50 restore points, or last N days) to limit disk use.

**Storage:** Either a directory of files (one per restore point, e.g. JSON with file snapshots) or a DB table (restore_point_id, run_id, created_at, file_snapshots_json). File snapshots can be full content or diffs; for rollback we need to be able to reconstruct “content before.”

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

**When to use a DB:** For state that benefits from **querying** and **indexing**: run history, restore points, analytics aggregates, session metadata. File-based state (prd.json, progress.txt, AGENTS.md) remains the source of truth for the work queue and long-term memory; the DB is an optional layer for reporting and recovery.

**Schema (minimal):** Tables such as: `runs` (id, project_path, platform, model, started_at, ended_at, outcome, evidence_path); `restore_points` (id, run_id, created_at, file_snapshots_json); `usage_snapshots` (id, platform, 5h_used, 7d_used, recorded_at). Add tables as features need them (e.g. interview phases, analytics by hour).

**Implementation:** Use SQLite with WAL mode. One module (e.g. `db` or `persistence`) opens the DB at a fixed path (e.g. under app data dir), runs **migrations** (versioned SQL files applied in order when the stored schema version is less than the app’s), and exposes functions to insert/query. Keep migrations additive where possible.

**Optional:** Allow a “lite” mode (build-time or runtime) that disables the DB and relies only on file-based state for minimal deployments.

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

**Data source:** Either (a) scan the file system for “recent” or “known” project roots (e.g. from a saved list, or from run metadata in the DB), or (b) list entries from the DB (runs grouped by project_path). For each project, optionally list recent sessions or runs (e.g. last 10) with timestamp and outcome.

**UI:** A view that lists projects (and optionally expandable sessions per project). Search/filter by name or path. Optional: for each project, call the **git** module to get branch name and dirty status (e.g. `git status --short`); show a one-line summary or badge. Clicking a project sets it as the current project; clicking a session might open run detail or offer to restore.

### 19.22 Multi-Tab and Multi-Window

**Tabs:** The main layout has a **tab bar**. Each tab holds: view id (e.g. dashboard, config, run detail) + context (e.g. project path, run id). When the user switches tabs, the app loads that view with that context. Tab list and order can be persisted (e.g. in config or in the recovery snapshot). No need to keep every tab’s full state in memory; only the active tab’s view is fully built; others can be lazy-loaded when selected.

**Multiple windows:** Depending on the framework, either (a) the app supports multiple top-level windows (each with its own tab set), or (b) multiple instances of the app run and share state via a file or DB. Drag-between-windows (e.g. move a tab from one window to another) is optional and platform-dependent.

### 19.23 Virtualized Conversation or Log List

**Mechanism:** For any list that can be very long (e.g. 10k+ messages, iterations, or log lines), use **virtualized rendering**: only create widgets (or DOM nodes) for the **visible range** plus a small **overscan** (e.g. 5–10 items above and below). The scroll position (and container height) determines which slice of the list is “visible.” When the user scrolls, recompute the slice and re-render only that slice. Total list length is known (from data); the scrollable area uses a **placeholder** height (e.g. item_count * estimated_item_height) so the scrollbar is correct. This keeps the number of live widgets bounded and avoids lag and high memory use.

### 19.24 Low-Latency UI (No Lag)

**Mechanism:** (1) **Never block the UI thread** on CLI I/O: the CLI runs in a separate process; output is read on a background thread or async task and pushed to the UI via messages. (2) **Bounded buffers** everywhere (§19.15) so no unbounded allocation during long runs. (3) **Virtualized lists** (§19.23) for long content. (4) **Native rendering** (no terminal emulator in the middle) so the app controls every frame. Optional: in dev builds, measure time from keypress to next frame or redraw and warn if it exceeds a threshold (e.g. 50 ms).

### 19.25 Summary Table

| Feature | Mechanism |
|--------|-----------|
| **CLI integration** (§19.1) | Middle server spawns CLI with `--print --output-format stream-json`; reads stdout line-by-line; forwards via WebSocket. |
| **Session usage** (§19.2) | Parse `usage` events from stream-json; accumulate tokens; emit to UI (and optionally mid-stream). |
| **5h/7d limits** (§19.2) | Periodic `claude --account` (or equivalent) and parse stdout; or Admin API when org key is set. |
| **No-lag UI** (§19.1, §19.24) | CLI in separate process; bounded buffers; virtualized lists; no blocking of UI thread on CLI I/O. |
| **Compaction** (§19.4) | App monitors usage % from stream; at threshold, sends compact prompt to CLI, then replaces history with summary. |
| **Orchestration** (§19.5) | `--append-system-prompt` (or file) on spawn with fixed “understand → decompose → act → verify” text. |
| **Stream format** (§19.3) | Newline-delimited JSON with `type` and type-specific fields; same schema for all providers via shim. |
| **Hooks / guard** (§19.6) | Event enum; run scripts with JSON in/out and timeout; guard = PreToolUse hook with built-in blocklist. |
| **One-click install** (§19.7) | Catalog + install routine that copies files and refreshes registries; no code required from user. |
| **Background agents** (§19.8) | Queue manager with fixed concurrency; git branch per run (stash, create branch, run CLI, diff/merge); output dir per run; conflict detection via dry-run merge. |
| **Crash recovery** (§19.9) | Timer writes snapshot (state struct) to disk; on startup check for recent snapshot and offer restore; optional panic hook; cleanup old snapshots. |
| **Plugins / skills** (§19.10) | Scan plugin dir, parse manifests, build registries (command, agent, hook, skill); resolve at runtime; commands/agents = markdown, hooks = scripts, skills = JSON. |
| **Analytics** (§19.11) | Data from DB or scan of run/evidence metadata; aggregate by project, model, date; query on view open or filter change; export = serialize to CSV/JSON. |
| **Restore points / rollback** (§19.12) | Snapshot after each turn (file list + content before/after); store in DB or files; rollback = restore files + truncate state; conflict check via mtime/hash; branching = copy state to new session id. |
| **Command palette** (§19.13) | Shortcut registry (key → action); Ctrl/Cmd+P opens modal with full action list; filter by typed string; execute selected action; shortcuts help from same registry. |
| **Stream event viz / thinking** (§19.14) | Map stream event types to icons; show last N events in strip; thinking = buffer `thinking_delta`, display in pane with length limit; toggle to show/hide thinking. |
| **Bounded buffers** (§19.15) | All stdout/stream consumers use fixed-capacity buffer (ring buffer or capped deque); drop oldest when full; CLI always in child process. |
| **Database** (§19.16) | SQLite + WAL; migrations; tables for runs, restore_points, usage_snapshots; optional “lite” mode without DB. |
| **In-app instructions editor** (§19.17) | Read project instructions file from project path; text area + optional markdown preview; save writes back to same path. |
| **@ mentions** (§19.18) | On `@` open dropdown; data = recent/modified files or folder list; on select insert path; when building prompt expand @path to file content or include directive. |
| **Stream timers** (§19.19) | On segment start (by event type) start timer; on end record duration; ring buffer of last N segments; UI shows current + last. |
| **MCP** (§19.20) | Config list of servers (name, command, args, env); at spawn merge into platform’s expected flag/config; app is config layer only. |
| **Project browser** (§19.21) | List projects from DB or scan; filter/search; per-project git status; click to set project or open session. |
| **Multi-tab / multi-window** (§19.22) | Tab = view id + context; switch loads view; persist tab list; multi-window = multiple app windows or instances sharing state. |
| **Virtualization** (§19.23) | List renders only visible range + overscan; scroll position drives slice; placeholder height for scrollbar; bounded widget count. |

---

*This plan is a living document. Update the Task Status Log when implementation work begins or completes for any section.*
